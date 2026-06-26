import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    model: 'vertexai/gemini-2.5-flash',
    prompt: promptText,
    output: {
      schema: BlogOutputSchema,
    },
  });

  return response.output;
}

export async function GET(request: Request) {
  // Simple auth check using a header or query parameter
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || request.headers.get('x-cron-secret');
  
  const expectedSecret = process.env.CRON_SECRET || 't3_cron_secret_key_2026';
  
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = admin.firestore();
  const logs: string[] = [];
  
  try {
    // 1. Get current hour in EST/EDT
    let estHour = parseInt(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false,
      }).format(new Date()),
      10
    );
    if (estHour === 24) {
      estHour = 0;
    }

    // 2. Define the target count based on EST schedule: 3x per day starting at 8am (e.g. 8am, 1pm, 6pm)
    let targetCount = 0;
    if (estHour >= 18) {
      targetCount = 3;
    } else if (estHour >= 13) {
      targetCount = 2;
    } else if (estHour >= 8) {
      targetCount = 1;
    }

    logs.push(`EST Hour: ${estHour}, Target Blog Count today: ${targetCount}`);

    if (targetCount === 0) {
      return NextResponse.json({ message: 'Outside of posting hours (8 AM - 12 AM EST)', logs });
    }

    const snap = await db.collection('businessProfiles').get();
    
    for (const doc of snap.docs) {
      const userId = doc.id;
      const profile = doc.data();

      if (excludedIds.includes(userId)) {
        continue;
      }

      // 3. Count blogs generated today (starting midnight EST)
      const blogCollection = db.collection('businessProfiles').doc(userId).collection('blogs');
      
      // Get today's start in EST formatted as ISO string
      const todayStart = new Date();
      // Adjust to EST start of day
      const estOffset = -5; // Default EST offset
      todayStart.setUTCHours(12 + estOffset, 0, 0, 0); // Roughly midnight EST

      const todayBlogsSnap = await blogCollection
        .where('createdAt', '>=', todayStart.toISOString())
        .get();

      if (todayBlogsSnap.size >= targetCount) {
        logs.push(`Site "${profile.businessName}" has ${todayBlogsSnap.size}/${targetCount} blogs today. Skipping.`);
        continue;
      }

      const neededCount = targetCount - todayBlogsSnap.size;
      logs.push(`Generating ${neededCount} blog(s) for "${profile.businessName}"`);

      // Get all existing slugs to prevent duplication
      const blogsSnap = await blogCollection.get();
      const existingSlugs = blogsSnap.docs.map(d => d.data().slug);

      for (let i = 0; i < neededCount; i++) {
        const blogData = await generateSingleBlog(
          profile.businessName || 'Local Service Pro',
          profile.service || 'Home Services',
          existingSlugs
        );

        if (blogData) {
          const { resolveBlogImageWithFallback } = require('@/lib/blog-image-generator');
          const imageUrl = await resolveBlogImageWithFallback(
            userId,
            blogData.slug,
            blogData.title,
            profile.service || 'Home Services',
            blogData.keywords
          );
          await blogCollection.doc(blogData.slug).set({
            ...blogData,
            imageUrl,
            status: 'published',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          existingSlugs.push(blogData.slug);
          logs.push(`Published blog "${blogData.title}" for "${profile.businessName}"`);
        }
      }
    }

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('[cron-generate-blogs] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error', logs }, { status: 500 });
  }
}

// Support POST requests as well
export async function POST(request: Request) {
  return GET(request);
}
