import { admin } from '@/lib/firebase-admin';
import { slugify } from '@/lib/utils';
import { getBrandsForNiche } from '@/lib/constants/brands';
import { getServicesForNiche } from '@/lib/constants/services';

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

  // 2. Fetch blogs and business profile for this profile
  let blogs: any[] = [];
  let localSeoData: any = null;
  let service: string = '';
  try {
    const bpSnap = await db.collection('businessProfiles').doc(businessProfileId).get();
    if (bpSnap.exists) {
      const bpData = bpSnap.data() || {};
      localSeoData = bpData.localSeoData;
      service = bpData.service || '';
    }

    const snap = await db
      .collection('businessProfiles')
      .doc(businessProfileId)
      .collection('blogs')
      .where('status', '==', 'published')
      .get();
    const allPublished = snap.docs
      .map(doc => doc.data())
      .sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });

    // Always index all curated long-tail posts (seoIndexed === true).
    // Include up to 5 most recent legacy posts as fallback while curated library builds.
    const curatedBlogs = allPublished.filter(b => b.seoIndexed === true);
    const legacyFallback = allPublished.filter(b => b.seoIndexed !== true).slice(0, 5);
    blogs = [...curatedBlogs, ...legacyFallback];
  } catch (error) {
    console.error('[sitemap-custom-domain] Failed to fetch data:', error);
  }

  const baseUrl = `https://${cleanDomain}`;

  // Only include top 5 primary surrounding cities (exclude thin neighborhood doorway pages)
  const surroundingCities: any[] = (localSeoData?.surroundingCities || []).slice(0, 5);

  const locationUrls = surroundingCities.map((city: any) => {
    const name = typeof city === 'string' ? city : city.name;
    return name ? `
  <url>
    <loc>${baseUrl}/${slugify(name)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>` : '';
  }).join('');

  const serviceUrls = getServicesForNiche(service).map(svc => `
  <url>
    <loc>${baseUrl}/services/${svc.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  `).join('').trim();

  const brandUrls = getBrandsForNiche(service).map(brand => `
  <url>
    <loc>${baseUrl}/brands/${brand.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('').trim();

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
  ${serviceUrls ? `${serviceUrls}\n  ` : ''}${brandUrls ? `${brandUrls}\n  ` : ''}${blogs.map(blog => `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  `).join('').trim()}${locationUrls}
</urlset>`;

  return new Response(sitemapXml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600'
    },
  });
}
