'use server';

import { admin, db } from '@/lib/firebase-admin';
import { aiGenerateWebsiteContent } from '@/ai/flows/website-designer';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

async function registerCustomDomainInAppHosting(domain: string, profileId: string) {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    if (!accessToken) {
      console.error('[registerCustomDomain] Failed to get access token');
      return;
    }

    const projectId = 'studio-1410114603-9e1f6';
    const location = 'us-central1';
    const backendId = 'studio';

    // 1. Call Firebase App Hosting API to register the custom domain
    const createUrl = `https://firebaseapphosting.googleapis.com/v1beta/projects/${projectId}/locations/${location}/backends/${backendId}/domains?domainId=${domain}`;
    console.log(`[registerCustomDomain] Registering domain ${domain} via App Hosting API: ${createUrl}`);
    
    try {
      await axios.post(createUrl, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`[registerCustomDomain] Domain registration call initiated for ${domain}`);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        console.log(`[registerCustomDomain] Domain ${domain} already registered in App Hosting backend.`);
      } else {
        console.error('[registerCustomDomain] Error calling App Hosting API:', err.response ? err.response.data : err.message);
      }
    }

    // 2. Fetch the domain details to get the DNS settings
    const getUrl = `https://firebaseapphosting.googleapis.com/v1/projects/${projectId}/locations/${location}/backends/${backendId}/domains/${domain}`;
    let appHostingData: any = null;
    try {
      const response = await axios.get(getUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      appHostingData = response.data;
    } catch (err: any) {
      console.error('[registerCustomDomain] Error fetching domain status:', err.message);
    }

    let desiredA: string[] = [];
    let desiredTxt: string = '';
    let desiredCnameHost: string = '';
    let desiredCnameValue: string = '';

    if (appHostingData) {
      const customDomainStatus = appHostingData.customDomainStatus || {};
      const requiredDnsUpdates = customDomainStatus.requiredDnsUpdates || [];

      for (const update of requiredDnsUpdates) {
        if (update.desired) {
          for (const desiredItem of update.desired) {
            if (desiredItem.records) {
              for (const record of desiredItem.records) {
                if (record.type === 'A') {
                  if (record.rdata && !desiredA.includes(record.rdata)) {
                    desiredA.push(record.rdata);
                  }
                } else if (record.type === 'TXT') {
                  if (record.rdata && record.rdata.startsWith('fah-claim=')) {
                    desiredTxt = record.rdata;
                  }
                } else if (record.type === 'CNAME') {
                  if (record.rdata) {
                    desiredCnameValue = record.rdata;
                    if (record.domainName) {
                      let host = record.domainName.replace(/\.$/, '');
                      const root = domain.replace(/\.$/, '');
                      if (host.endsWith('.' + root)) {
                        host = host.slice(0, host.length - root.length - 1);
                      }
                      desiredCnameHost = host;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    const fallbackTxt = appHostingData?.uid ? `fah-claim=002-02-${appHostingData.uid}` : '';
    const dnsRecordsData = {
      aRecords: desiredA.length > 0 ? desiredA : ['35.219.200.2'],
      txtRecord: desiredTxt || fallbackTxt,
      cnameHost: desiredCnameHost || '',
      cnameValue: desiredCnameValue || ''
    };

    // 3. Write custom domain document to Firestore
    const domainDocRef = db.collection('businessProfiles').doc(profileId).collection('customDomains').doc(domain);
    await domainDocRef.set({
      id: domain,
      businessProfileId: profileId,
      domain: domain,
      status: 'pending',
      createdAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
      dnsRecords: dnsRecordsData
    });

    console.log(`[registerCustomDomain] Domain ${domain} successfully registered in Firestore for profile ${profileId}`);

    // Update primary customDomain and websiteUrl on the business profile
    await db.collection('businessProfiles').doc(profileId).update({
      customDomain: domain,
      websiteUrl: `https://${domain}`
    });

    console.log(`[registerCustomDomain] Updated businessProfile with customDomain fields`);

  } catch (err: any) {
    console.error('[registerCustomDomain] Unexpected error:', err.message);
  }
}

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
        const { getRelevantBlogImage } = require('@/lib/blog-images');
        const blogId = blogData.slug;
        await blogCollection.doc(blogId).set({
          ...blogData,
          imageUrl: getRelevantBlogImage(serviceCategory, blogData.keywords, blogData.title),
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
  const customDomainInput = formData.get('customDomain') as string;

  if (!businessName || !email || !password || !landlordUid) {
    return { success: false, message: 'All fields are required.' };
  }

  // Determine if a custom domain needs to be registered automatically
  let domainToRegister = '';
  if (customDomainInput && customDomainInput.trim().includes('.')) {
    domainToRegister = customDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  } else if (businessName && /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(businessName.trim())) {
    domainToRegister = businessName.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }

  try {
    // 1. Resolve or create user in Firebase Auth
    let userRecord;
    let userId;
    let isNewUser = false;
    
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      userId = userRecord.uid;
      console.log(`Using existing user record for email: ${email} (${userId})`);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          email,
          password,
          displayName: businessName,
        });
        userId = userRecord.uid;
        isNewUser = true;
        console.log(`Created new Firebase Auth user for email: ${email} (${userId})`);
      } else {
        throw err;
      }
    }

    // 2. If it's a new renter user, create the users/{userId} doc
    if (isNewUser) {
      await db.collection('users').doc(userId).set({
        id: userId,
        email,
        role: 'renter',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Generate a unique business profile ID based on the business name
    const cleanName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    let profileId = cleanName;
    const existingDoc = await db.collection('businessProfiles').doc(profileId).get();
    if (existingDoc.exists) {
      profileId = `${cleanName}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

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

    // 3. Create businessProfiles/{profileId} doc
    await db.collection('businessProfiles').doc(profileId).set({
      id: profileId,
      businessName,
      contactEmail: email,
      service: niche || 'Lead Generation Site',
      phoneNumber: '',
      defaultLandingPage: 'template-3',
      ownerId: landlordUid,
      currentRenterId: userId === landlordUid ? null : userId,
      isPubliclyListed: true,
      monthlyRentPrice: 0,
      niche: niche || '',
      leadForwardingEnabled: false,
      colorPalette,
      fontPair,
      websiteConfig: websiteConfig || null,
      googleAnalyticsMeasurementId: '',
      googleAnalyticsPropertyId: '',
      googleAnalyticsStreamId: '',
      googleAnalyticsStatus: '',
      googleAnalyticsUpdatedAt: new Date().toISOString(),
      isMockAnalytics: false,
    });

    // 4. Create standard default assistant/agent skeleton for the new profile
    await db.collection(`businessProfiles/${profileId}/agents`).doc('default').set({
      id: 'default',
      businessProfileId: profileId,
      elevenLabsAgentId: '',
      name: `${businessName} Voice Assistant`,
      systemPrompt: `You are a helpful, professional scheduling voice agent for ${businessName}. Your goal is to gather caller name, phone number, interest, and schedule them into the calendar.`,
      firstMessage: `Hello, thanks for calling ${businessName}! How can I help you today?`,
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
      status: 'active',
      createdAt: new Date().toISOString()
    });

    // 5. Automatically register custom domain if provided or detected
    if (domainToRegister) {
      console.log(`[createRenterAccountAction] Initiating auto domain registration for ${domainToRegister}`);
      await registerCustomDomainInAppHosting(domainToRegister, profileId);
    }

    // Start SEO content setup asynchronously in background so it doesn't block account creation UI
    generateInitialBlogsForProfile(profileId, businessName, niche || 'Lead Generation Site')
      .then(async () => {
        // Ping Google sitemap after blogs are generated
        const sitemapUrl = `https://studio--studio-1410114603-9e1f6.us-central1.hosted.app/pages/${profileId}/sitemap.xml`;
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        console.log(`Pinging Google sitemap for ${profileId}: ${pingUrl}`);
        await fetch(pingUrl);
        console.log(`Sitemap pinged successfully for user: ${profileId}`);
      })
      .catch(err => {
        console.error('Error in background SEO / blog generation:', err);
      });

    return { success: true, message: `Account and profile created successfully for ${email}.`, userId: profileId };
  } catch (error: any) {
    console.error('Error in createRenterAccountAction:', error);
    return { success: false, message: error.message || 'An error occurred during account creation.' };
  }
}
