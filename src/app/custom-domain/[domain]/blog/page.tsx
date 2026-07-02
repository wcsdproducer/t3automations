import { admin } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Calendar, ArrowLeft, BookOpen } from 'lucide-react';

function formatPhone(value: string) {
  if (!value) return value;
  const d = value.replace(/\D/g, '');
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  if (!domain) return {};

  const cleanDomain = domain.toLowerCase().trim().replace(/:\d+$/, '');
  const businessProfileId = await getBusinessProfileId(cleanDomain);
  if (!businessProfileId) return {};

  const profileDoc = await admin.firestore().collection('businessProfiles').doc(businessProfileId).get();
  if (!profileDoc.exists) return {};

  const profile = profileDoc.data() || {};
  const companyName = profile.businessName || 'Our Service Company';
  const service = profile.service || 'services';
  const city = profile.targetCity?.split(',')[0]?.trim() || '';
  const title = `${service} Blog | Expert Tips & Advice | ${companyName}`;
  const description = `Read expert ${service.toLowerCase()} tips, guides, and local insights from ${companyName}${city ? ` in ${city}` : ''}. Stay informed with our latest articles.`;

  return {
    title,
    description,
    alternates: { canonical: `https://${cleanDomain}/blog` },
    openGraph: {
      title,
      description,
      url: `https://${cleanDomain}/blog`,
      siteName: companyName,
      type: 'website',
    },
  };
}

async function getBusinessProfileId(domain: string): Promise<string | null> {
  const cleanDomain = domain.toLowerCase().trim().replace(/:\d+$/, ''); // Remove port if any
  try {
    let snap = await admin
      .firestore()
      .collectionGroup('customDomains')
      .where('id', '==', cleanDomain)
      .limit(1)
      .get();

    if (snap.empty) {
      snap = await admin
        .firestore()
        .collectionGroup('customDomains')
        .where('domain', '==', cleanDomain)
        .limit(1)
        .get();
    }

    if (snap.empty) {
      snap = await admin
        .firestore()
        .collectionGroup('customDomains')
        .where('domainName', '==', cleanDomain)
        .limit(1)
        .get();
    }

    if (!snap.empty) {
      return snap.docs[0].data().businessProfileId || null;
    }
  } catch (error) {
    console.error('[custom-domain-blog] Firestore lookup error:', error);
  }
  return null;
}

export default async function CustomDomainBlogIndexPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  if (!domain) return notFound();

  const businessProfileId = await getBusinessProfileId(domain);
  if (!businessProfileId) return notFound();

  // 1. Fetch business profile
  let profileDoc;
  try {
    profileDoc = await admin.firestore().collection('businessProfiles').doc(businessProfileId).get();
  } catch (error) {
    console.error('[custom-domain-blog-index] Profile fetch error:', error);
    return notFound();
  }

  if (!profileDoc.exists) return notFound();
  const profile = profileDoc.data() || {};
  const companyName = profile.businessName || 'Our Service Company';
  const phone = formatPhone(profile.phoneNumber || '');
  const measurementId = profile.googleAnalyticsMeasurementId;

  // 2. Fetch blogs
  let blogs: any[] = [];
  try {
    const snap = await admin
      .firestore()
      .collection('businessProfiles')
      .doc(businessProfileId)
      .collection('blogs')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
    
    blogs = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate
        ? doc.data().createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date(doc.data().createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }));
  } catch (error) {
    console.error('[custom-domain-blog-index] Blogs fetch error:', error);
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans">
      {/* Google Analytics Script if connected */}
      {measurementId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${measurementId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      {/* Header */}
      <header className="sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:opacity-85 transition-opacity">
            {companyName}
          </Link>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/#services" className="text-sm font-medium hover:text-blue-600 transition-colors">Services</Link>
          <Link href="/#about" className="text-sm font-medium hover:text-blue-600 transition-colors">About Us</Link>
          <Link href="/blog" className="text-sm font-semibold text-blue-600">Blog</Link>
        </nav>
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-2 font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
            <Phone className="h-4 w-4 text-blue-600" />
            <span>{phone}</span>
          </a>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Latest Articles & Tips</h1>
            <p className="text-slate-600 mt-2">Expert advice and local insights from our professional team.</p>
          </div>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No blog posts yet</h3>
            <p className="text-slate-500 mt-1">Check back soon for educational articles and updates!</p>
            <Link href="/" className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Return Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <article key={post.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                {post.imageUrl && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{post.createdAt}</span>
                      {post.author && (
                        <>
                          <span>•</span>
                          <span>By {post.author}</span>
                        </>
                      )}
                    </div>
                    <Link href={`/blog/${post.slug}`} className="group">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-slate-500 text-sm mt-3 line-clamp-3 leading-relaxed">
                      {post.excerpt || 'Read our latest blog post to learn more about our services and industry tips.'}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-700 text-sm font-bold inline-flex items-center gap-1.5 transition-colors">
                      Read Article &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-slate-500 border-t bg-white">
        <p>&copy; {new Date().getFullYear()} {companyName}. All Rights Reserved.</p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <a href={`/api/legal/privacy?userId=${businessProfileId}`} target="_blank" className="hover:underline">Privacy Policy</a>
          <a href={`/api/legal/tos?userId=${businessProfileId}`} target="_blank" className="hover:underline">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
