'use server';

import { admin, db } from '@/lib/firebase-admin';
import { aiGenerateWebsiteContent } from '@/ai/flows/website-designer';
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

async function generateInitialBlogsForProfile(
  userId: string,
  companyName: string,
  serviceCategory: string
) {
  const blogCollection = db.collection('businessProfiles').doc(userId).collection('blogs');
  const existingSlugs: string[] = [];

  console.log(`Generating 3 initial SEO blogs for ${companyName} (${userId})...`);

  for (let i = 0; i < 3; i++) {
    try {
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

      const blogData = response.output;
      if (blogData) {
        const blogId = blogData.slug;
        await blogCollection.doc(blogId).set({
          ...blogData,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        existingSlugs.push(blogData.slug);
        console.log(`Successfully published initial blog post #${i + 1}: "${blogData.title}"`);
      }
    } catch (err) {
      console.error(`Failed to generate initial blog post #${i + 1} for ${companyName}:`, err);
    }
  }
}


// Server Action to create a renter account and associate it with a business profile
export async function createRenterAccountAction(
  prevState: any,
  formData: FormData
) {
  const businessName = formData.get('businessName') as string;
  const niche = formData.get('niche') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const landlordUid = formData.get('landlordUid') as string;

  if (!businessName || !email || !password || !landlordUid) {
    return { success: false, message: 'All fields are required.' };
  }

  try {
    // 1. Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: businessName,
    });

    const userId = userRecord.uid;

    // 2. Create users/{userId} doc
    await db.collection('users').doc(userId).set({
      id: userId,
      email,
      role: 'renter',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Generate AI website copy & design
    let websiteConfig: any = null;
    let colorPalette = 'deep-midnight';
    let fontPair = 'modern-corporate';
    try {
      const generated = await aiGenerateWebsiteContent({
        serviceCategory: niche || 'Lead Generation Site',
        companyName: businessName,
      });
      websiteConfig = generated;
      if (generated.theme) {
        colorPalette = generated.theme.colorPalette || colorPalette;
        fontPair = generated.theme.fontPair || fontPair;
      }
    } catch (e) {
      console.error('Failed to generate AI website content, falling back to static content:', e);
    }

    const randomAlphanumeric = () => Math.random().toString(36).substring(2, 10).toUpperCase();
    const measurementId = `G-${randomAlphanumeric()}`;
    const propertyId = `properties/mock-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const streamId = `${propertyId}/dataStreams/mock-${Math.floor(100000000 + Math.random() * 900000000)}`;

    // 3. Create businessProfiles/{userId} doc
    await db.collection('businessProfiles').doc(userId).set({
      id: userId,
      businessName,
      contactEmail: email,
      service: niche || 'Lead Generation Site',
      phoneNumber: '',
      defaultLandingPage: 'template-3',
      ownerId: landlordUid,
      currentRenterId: userId,
      isPubliclyListed: true,
      monthlyRentPrice: 0,
      niche: niche || '',
      leadForwardingEnabled: false,
      colorPalette,
      fontPair,
      websiteConfig: websiteConfig || null,
      googleAnalyticsMeasurementId: measurementId,
      googleAnalyticsPropertyId: propertyId,
      googleAnalyticsStreamId: streamId,
      googleAnalyticsStatus: 'connected',
      googleAnalyticsUpdatedAt: new Date().toISOString(),
      isMockAnalytics: true,
    });

    // 4. Create standard default assistant/agent skeleton for the new profile
    await db.collection(`businessProfiles/${userId}/agents`).doc('default').set({
      id: 'default',
      businessProfileId: userId,
      elevenLabsAgentId: '',
      name: `${businessName} Voice Assistant`,
      systemPrompt: `You are a helpful, professional scheduling voice agent for ${businessName}. Your goal is to gather caller name, phone number, interest, and schedule them into the calendar.`,
      firstMessage: `Hello, thanks for calling ${businessName}! How can I help you today?`,
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
      status: 'active',
      createdAt: new Date().toISOString()
    });

    // Start SEO content setup asynchronously in background so it doesn't block account creation UI
    generateInitialBlogsForProfile(userId, businessName, niche || 'Lead Generation Site')
      .then(async () => {
        // Ping Google sitemap after blogs are generated
        const sitemapUrl = `https://studio--studio-1410114603-9e1f6.us-central1.hosted.app/pages/${userId}/sitemap.xml`;
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        console.log(`Pinging Google sitemap for ${userId}: ${pingUrl}`);
        await fetch(pingUrl);
        console.log(`Sitemap pinged successfully for user: ${userId}`);
      })
      .catch(err => {
        console.error('Error in background SEO / blog generation:', err);
      });

    return { success: true, message: `Account and profile created successfully for ${email}.`, userId };
  } catch (error: any) {
    console.error('Error in createRenterAccountAction:', error);
    return { success: false, message: error.message || 'An error occurred during account creation.' };
  }
}
