import { admin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  if (!userId) return new Response('Missing userId', { status: 400 });

  // 1. Verify business profile exists
  const db = admin.firestore();
  const profileDoc = await db.collection('businessProfiles').doc(userId).get();
  if (!profileDoc.exists) {
    return new Response('Profile not found', { status: 404 });
  }

  // 2. Fetch blogs
  let blogs: any[] = [];
  try {
    const snap = await db
      .collection('businessProfiles')
      .doc(userId)
      .collection('blogs')
      .where('status', '==', 'published')
      .get();
    blogs = snap.docs.map(doc => doc.data());
  } catch (error) {
    console.error('[sitemap] Failed to fetch blogs:', error);
  }

  const baseUrl = `https://studio--studio-1410114603-9e1f6.us-central1.hosted.app/pages/${userId}`;

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
