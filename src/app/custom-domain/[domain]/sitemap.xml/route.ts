import { admin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;
  if (!domain) return new Response('Missing domain parameter', { status: 400 });

  const cleanDomain = domain.toLowerCase().trim().replace(/:\d+$/, ''); // Remove port if any

  // 1. Look up which business profile owns this custom domain
  let businessProfileId: string | null = null;
  const db = admin.firestore();
  try {
    const snap = await db
      .collectionGroup('customDomains')
      .where('id', '==', cleanDomain)
      .limit(1)
      .get();

    if (!snap.empty) {
      businessProfileId = snap.docs[0].data().businessProfileId;
    }
  } catch (error) {
    console.error('[sitemap-custom-domain] Firestore lookup error:', error);
    return new Response('Database lookup error', { status: 500 });
  }

  if (!businessProfileId) {
    return new Response('Domain not mapped to any profile', { status: 404 });
  }

  // 2. Fetch blogs for this profile
  let blogs: any[] = [];
  try {
    const snap = await db
      .collection('businessProfiles')
      .doc(businessProfileId)
      .collection('blogs')
      .where('status', '==', 'published')
      .get();
    blogs = snap.docs.map(doc => doc.data());
  } catch (error) {
    console.error('[sitemap-custom-domain] Failed to fetch blogs:', error);
  }

  const baseUrl = `https://${cleanDomain}`;

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${blogs.map(blog => `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  `).join('').trim()}
</urlset>`;

  return new Response(sitemapXml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600'
    },
  });
}
