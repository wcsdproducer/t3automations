import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getLongTailQueueForNiche, LongTailTopic } from '@/lib/constants/longtail-keywords';
import { getRelevantBlogImage } from '@/lib/blog-images';
import { notifyIndexNow, resubmitGscSitemap } from '@/lib/indexing';
import { slugify } from '@/lib/utils';

const BlogOutputSchema = z.object({
  title: z.string().describe('High-CTR, exact-intent H1 article title targeting the assigned long-tail keyword'),
  excerpt: z.string().describe('Concise 1-2 sentence summary answering the searcher intent directly'),
  content: z.string().describe('Deep, practical HTML body copy (<h2>, <h3>, <p>, <ul>, <li>, <table>, <strong>; 900-1300 words)'),
  metaTitle: z.string().describe('SEO meta title (max 60 characters, includes target keyword)'),
  metaDescription: z.string().describe('SEO meta description (max 155 characters, benefit + CTA)'),
  keywords: z.array(z.string()).describe('List of 4-6 target & semantic long-tail keywords'),
  author: z.string().describe('Credible local specialist author title (e.g. Lead Diagnostic Technician)'),
});

const excludedIds = [
  '6Nw77zkDqFdKearSTGxW7YMNFIf2', // Platform Administrator
  'hkQbBIcZ6BODamj1qi4mRtCNQNp1', // T3 Automations
  'hrFjbsiMW4ex2RpVaHYhkOmgmp72', // Test Landlord Admin
];

// Cadence: max 1 curated long-tail article every 72 hours (2-3 posts/week per site)
const MIN_INTERVAL_MS = 72 * 60 * 60 * 1000;

async function generateCuratedLongTailBlog(
  companyName: string,
  serviceCategory: string,
  targetCity: string,
  phone: string,
  topic: LongTailTopic,
  localSeoData?: any
) {
  const topCities: Array<{ name: string; slug: string }> = (localSeoData?.surroundingCities || [])
    .slice(0, 5)
    .map((c: any) => {
      const name = typeof c === 'string' ? c : c.name;
      return { name, slug: slugify(name) };
    });

  const suburbHint = topCities.length > 0
    ? `Naturally include 1 contextual internal link to one nearby suburb page: ${topCities.slice(0, 3).map(c => `<a href="/${c.slug}">${c.name}</a>`).join(', ')}.`
    : '';

  const promptText = `You are a senior Local SEO Technical Writer specializing in ${serviceCategory} for ${companyName} in ${targetCity}.

Write a genuinely useful, zero-fluff, high-ranking long-tail article targeting this EXACT search query:
- Target Keyword: "${topic.targetKeyword}"
- Technical & Local Angle to Cover: ${topic.angle}
- Business Name: ${companyName}
- Primary Market: ${targetCity}
- Direct Phone CTA: ${phone || '(813) 279-8221'}

Strict SEO & Information-Gain Requirements:
1. **Direct Answer Box (First Paragraph):** Start immediately with a 45-65 word bold, direct answer to "${topic.targetKeyword}" optimized for Google Featured Snippets & AI Overviews. No generic "In today's world..." intros.
2. **Real Technical Depth & Specifics:** Follow the exact angle above—include specific error codes, county/city rules, material specs, or realistic local cost ranges. Include one clean HTML <table> comparing options, causes, or typical cost ranges.
3. **Structured H2/H3 Headings:** Use 4-5 clear H2 headings phrased as real follow-up questions homeowners search in Google.
4. **Mandatory Commercial Money-Page Link:** Naturally embed an exact contextual link to our dedicated service page: <a href="${topic.ctaPath}">${topic.ctaAnchor}</a> in the upper half AND in the final CTA section. ${suburbHint}
5. **Conversion Conclusion:** Close with a crisp local CTA inviting homeowners in ${targetCity} to call ${companyName} at ${phone || '(813) 279-8221'} for same-day help or a free estimate.
6. **Zero Placeholders:** Never output brackets like [City] or [Phone]. Output valid semantic HTML only (no <h1>, no markdown fences).`;

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
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || request.headers.get('x-cron-secret');
  const expectedSecret = process.env.CRON_SECRET || 't3_cron_secret_key_2026';

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const force = searchParams.get('force') === 'true';
  const filterUserId = searchParams.get('userId');
  const db = admin.firestore();
  const logs: string[] = [];

  try {
    const snap = await db.collection('businessProfiles').get();
    const nowMs = Date.now();

    for (const doc of snap.docs) {
      const userId = doc.id;
      if (excludedIds.includes(userId)) continue;
      if (filterUserId && userId !== filterUserId) continue;

      const profile = doc.data() || {};
      const service = profile.service || '';
      const queue = getLongTailQueueForNiche(service);

      if (queue.length === 0) {
        logs.push(`Site "${profile.businessName}" (${service}): no long-tail queue configured. Skipping.`);
        continue;
      }

      const blogCollection = db.collection('businessProfiles').doc(userId).collection('blogs');
      const blogsSnap = await blogCollection.get();
      const existingDocs = blogsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const existingSlugs = new Set<string>(existingDocs.map(d => d.slug || d.id));

      // Velocity check: ensure at least 72 hours since the last curated seoIndexed post (unless force=true)
      if (!force) {
        const curatedPosts = existingDocs.filter(d => d.seoIndexed === true);
        if (curatedPosts.length > 0) {
          const latestCuratedMs = Math.max(
            ...curatedPosts.map(d => {
              if (d.createdAt?.toMillis) return d.createdAt.toMillis();
              return new Date(d.createdAt || 0).getTime();
            })
          );
          const hoursSince = (nowMs - latestCuratedMs) / (1000 * 60 * 60);
          if (nowMs - latestCuratedMs < MIN_INTERVAL_MS) {
            logs.push(`Site "${profile.businessName}": last curated post was ${hoursSince.toFixed(1)}h ago (72h cadence). Skipping.`);
            continue;
          }
        }
      }

      // Pick the next unpublished curated long-tail topic (zero cannibalization)
      const nextTopic = queue.find(t => !existingSlugs.has(t.slug));
      if (!nextTopic) {
        logs.push(`Site "${profile.businessName}": all ${queue.length} curated long-tail topics already published. Skipping.`);
        continue;
      }

      logs.push(`Generating curated long-tail post [${nextTopic.slug}] for "${profile.businessName}"...`);

      const blogData = await generateCuratedLongTailBlog(
        profile.businessName || 'Local Service Pros',
        service || 'Home Services',
        profile.targetCity || 'Local Area',
        profile.phoneNumber || '(813) 279-8221',
        nextTopic,
        profile.localSeoData
      );

      if (blogData) {
        const imageUrl = getRelevantBlogImage(service, blogData.keywords || [], blogData.title, nextTopic.slug);
        await blogCollection.doc(nextTopic.slug).set({
          ...blogData,
          slug: nextTopic.slug,
          targetKeyword: nextTopic.targetKeyword,
          ctaPath: nextTopic.ctaPath,
          ctaAnchor: nextTopic.ctaAnchor,
          imageUrl,
          seoIndexed: true,
          contentStrategy: 'longtail-queue-v1',
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        logs.push(`✅ Published curated post "${blogData.title}" (/${nextTopic.slug}) for "${profile.businessName}"`);

        // Auto-ping IndexNow (Bing/DuckDuckGo/ChatGPT) + Google Search Console sitemap
        try {
          const cdSnap = await db.collection(`businessProfiles/${userId}/customDomains`).limit(1).get();
          const domain = cdSnap.docs[0]?.id || profile.customDomain;
          if (domain) {
            const urlsToPing = [
              `https://${domain}/blog/${nextTopic.slug}`,
              `https://${domain}/blog`,
              `https://${domain}${nextTopic.ctaPath}`,
            ];
            const [idxRes, gscRes] = await Promise.all([
              notifyIndexNow(domain, urlsToPing),
              resubmitGscSitemap(domain),
            ]);
            logs.push(`   ↳ Indexing pings for ${domain}: IndexNow=${idxRes.ok ? 'OK' : idxRes.error} | GSC=${gscRes.ok ? 'OK' : gscRes.error}`);
          }
        } catch (pingErr: any) {
          logs.push(`   ↳ Indexing ping warning: ${pingErr?.message}`);
        }
      }
    }

    return NextResponse.json({ success: true, strategy: 'longtail-queue-v1', cadenceHours: 72, logs });
  } catch (error: any) {
    console.error('[cron-generate-blogs] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error', logs }, { status: 500 });
  }
}
