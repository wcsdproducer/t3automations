import * as admin from 'firebase-admin';
import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { ai } from '../src/ai/genkit';
import { z } from 'genkit';

// Initialize firebase admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

// Schema for the blog post output
const BlogOutputSchema = z.object({
  title: z.string().describe('Catchy, benefit-driven H1 blog title optimized for local search'),
  slug: z.string().describe('Hyphenated slug for URL (lowercase, maximum 5 words)'),
  excerpt: z.string().describe('Short 1-2 sentence compelling summary of the article'),
  content: z.string().describe('Factual, comprehensive HTML formatted body copy (use <h2>, <p>, <ul>, <li>, <strong> tags; 800-1200 words)'),
  metaTitle: z.string().describe('SEO meta title (maximum 60 characters)'),
  metaDescription: z.string().describe('SEO meta description (maximum 160 characters)'),
  keywords: z.array(z.string()).describe('List of 3-5 target search keywords used in the article'),
  author: z.string().describe('Professional author name (e.g. Expert Technician or Senior Editor)'),
});

const excludedIds = [
  '6Nw77zkDqFdKearSTGxW7YMNFIf2', // Platform Administrator
  'hkQbBIcZ6BODamj1qi4mRtCNQNp1', // T3 Automations
  'hrFjbsiMW4ex2RpVaHYhkOmgmp72', // Test Landlord Admin
];

async function generateSingleBlog(
  companyName: string,
  serviceCategory: string,
  existingSlugs: string[]
) {
  const promptText = `You are a professional SEO Copywriter specializing in Content Marketing and Conversion Rate Optimization (CRO) for local service businesses.

Write a comprehensive, high-quality blog post for the following business:
- Business Name: ${companyName}
- Service Category: ${serviceCategory}

Here are the slugs of existing articles on this website: ${JSON.stringify(existingSlugs)}
Your new article MUST cover a completely different topic or angle to prevent content cannibalization. Focus on helpful tips, maintenance checklists, emergency advice, or buying guides relevant to the Service Category.

SEO Writing Guidelines:
1. **Direct Answer Block:** Start the body of the article (inside the content field) with a 40-60 word direct, bold answer to a common user question (ideal for Google Featured Snippets/AI Overviews).
2. **Structural Depth:** Use exactly 3-5 H2 headings containing local questions. Use bulleted/numbered lists for steps.
3. **Keywords & Value:** Incorporate target search terms naturally. Explain *why* things work based on expert-level experience (E-E-A-T).
4. **CTA Embedding:** Naturally reference ${companyName} and how their professional services can help in the conclusion.
5. **No placeholders:** Do not use "[City]" or "[Phone]". Everything must be fully filled out.`;

  const response = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: promptText,
    output: {
      schema: BlogOutputSchema,
    },
  });

  return response.output;
}

async function runDailyBlogGeneration() {
  console.log('Starting daily SEO blog generation job...');

  try {
    const snap = await db.collection('businessProfiles').get();
    console.log(`Found ${snap.size} total business profiles in database.`);

    for (const doc of snap.docs) {
      const userId = doc.id;
      const profile = doc.data();

      // Skip platform placeholder accounts
      if (excludedIds.includes(userId)) {
        console.log(`Skipping platform account: ${profile.businessName} (${userId})`);
        continue;
      }

      console.log(`Processing site: ${profile.businessName} (${userId}) - Niche: ${profile.service}`);

      // 1. Get existing blog slugs to prevent duplicates
      const blogCollection = db.collection('businessProfiles').doc(userId).collection('blogs');
      const blogsSnap = await blogCollection.get();
      const existingSlugs = blogsSnap.docs.map(d => d.data().slug);

      // Check if we already generated blogs today (e.g. limit to 3 blogs per day max)
      // For testing/run purposes, we will generate if today has less than 3 blogs
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayBlogsSnap = await blogCollection
        .where('createdAt', '>=', todayStart.toISOString())
        .get();

      if (todayBlogsSnap.size >= 3) {
        console.log(`Site ${profile.businessName} already has ${todayBlogsSnap.size} blogs generated today. Skipping.`);
        continue;
      }

      const neededCount = 3 - todayBlogsSnap.size;
      console.log(`Generating ${neededCount} new blog post(s) for ${profile.businessName}...`);

      for (let i = 0; i < neededCount; i++) {
        try {
          const blogData = await generateSingleBlog(
            profile.businessName || 'Local Service Pro',
            profile.service || 'Home Services',
            existingSlugs
          );

          if (blogData) {
            const blogId = blogData.slug; // Use slug as document ID to ensure uniqueness
            await blogCollection.doc(blogId).set({
              ...blogData,
              status: 'published',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            existingSlugs.push(blogData.slug);
            console.log(`Successfully published blog post: "${blogData.title}"`);
          }
        } catch (err) {
          console.error(`Failed to generate blog post #${i + 1} for ${profile.businessName}:`, err);
        }
      }
    }

    console.log('Daily blog generation job completed successfully!');
  } catch (error) {
    console.error('Error running blog generation job:', error);
  }
}

// Run the script
runDailyBlogGeneration();
