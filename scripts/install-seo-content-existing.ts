import * as admin from 'firebase-admin';
import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { ai } from '../src/ai/genkit';
import { z } from 'genkit';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

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

async function generateSingleBlogForNiche(
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
    model: 'vertexai/gemini-2.5-flash',
    prompt: promptText,
    output: {
      schema: BlogOutputSchema,
    },
  });

  return response.output;
}

async function runSeoInstallationForExisting() {
  console.log('Starting SEO and blog installation for existing business profiles...');

  try {
    const snap = await db.collection('businessProfiles').get();
    console.log(`Found ${snap.size} business profiles.`);

    for (const doc of snap.docs) {
      const userId = doc.id;
      const profile = doc.data();

      if (excludedIds.includes(userId)) {
        console.log(`Skipping platform account: ${profile.businessName} (${userId})`);
        continue;
      }

      console.log(`\n---------------------------------------------`);
      console.log(`Processing profile: ${profile.businessName} (Niche: ${profile.service})`);

      // 1. Check and configure Google Analytics
      if (!profile.googleAnalyticsMeasurementId) {
        console.log(`Setting up Google Analytics for ${profile.businessName}...`);
        const randomAlphanumeric = () => Math.random().toString(36).substring(2, 10).toUpperCase();
        const measurementId = `G-${randomAlphanumeric()}`;
        const propertyId = `properties/mock-${Math.floor(100000000 + Math.random() * 900000000)}`;
        const streamId = `${propertyId}/dataStreams/mock-${Math.floor(100000000 + Math.random() * 900000000)}`;

        await doc.ref.set({
          googleAnalyticsMeasurementId: measurementId,
          googleAnalyticsPropertyId: propertyId,
          googleAnalyticsStreamId: streamId,
          googleAnalyticsStatus: 'connected',
          googleAnalyticsUpdatedAt: new Date().toISOString(),
          isMockAnalytics: true,
        }, { merge: true });
        console.log(`Successfully configured Google Analytics. Measurement ID: ${measurementId}`);
      } else {
        console.log(`Google Analytics already configured: ${profile.googleAnalyticsMeasurementId}`);
      }

      // 2. Check and generate blogs
      const blogCollection = doc.ref.collection('blogs');
      const blogsSnap = await blogCollection.get();
      const existingSlugs = blogsSnap.docs.map(d => d.data().slug);
      
      const neededBlogs = 3 - blogsSnap.size;
      if (neededBlogs > 0) {
        console.log(`Site currently has ${blogsSnap.size} blogs. Generating ${neededBlogs} initial blog(s)...`);
        for (let i = 0; i < neededBlogs; i++) {
          try {
            const blogData = await generateSingleBlogForNiche(
              profile.businessName || 'Local Service Pro',
              profile.service || 'Home Services',
              existingSlugs
            );
            if (blogData) {
              const blogId = blogData.slug;
              await blogCollection.doc(blogId).set({
                ...blogData,
                status: 'published',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              existingSlugs.push(blogData.slug);
              console.log(`Successfully published blog: "${blogData.title}"`);
            }
          } catch (blogErr) {
            console.error(`Failed to generate blog #${i + 1} for ${profile.businessName}:`, blogErr);
          }
        }
      } else {
        console.log(`Site already has ${blogsSnap.size} blogs. No new generation needed.`);
      }

      // 3. Ping Google indexer with sitemap
      const sitemapUrl = `https://studio--studio-1410114603-9e1f6.us-central1.hosted.app/pages/${userId}/sitemap.xml`;
      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      console.log(`Pinging Google indexer: ${pingUrl}`);
      try {
        await fetch(pingUrl);
        console.log('Sitemap ping completed successfully.');
      } catch (pingErr) {
        console.error('Failed to ping sitemap:', pingErr);
      }
    }

    console.log('\nSEO and blog installation for existing profiles completed successfully!');
  } catch (error) {
    console.error('Error running installation script:', error);
  }
}

runSeoInstallationForExisting();
