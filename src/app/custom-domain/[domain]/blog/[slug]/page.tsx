import { admin } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Calendar, ArrowLeft } from 'lucide-react';
import { BlogLeadForm } from '@/components/BlogLeadForm';
import { Metadata } from 'next';

function formatPhone(value: string) {
  if (!value) return value;
  const d = value.replace(/\D/g, '');
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ domain: string; slug: string }>;
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
    console.error('[custom-domain-blog-slug] Firestore lookup error:', error);
  }
  return null;
}

// Generate dynamic SEO metadata for search crawlers
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain, slug } = await params;
  if (!domain || !slug) return {};

  const businessProfileId = await getBusinessProfileId(domain);
  if (!businessProfileId) return {};

  try {
    const snap = await admin
      .firestore()
      .collection('businessProfiles')
      .doc(businessProfileId)
      .collection('blogs')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (!snap.empty) {
      const data = snap.docs[0].data();
      return {
        title: data.metaTitle || `${data.title} | Blog`,
        description: data.metaDescription || data.excerpt || '',
        keywords: data.keywords || [],
      };
    }
  } catch (error) {
    console.error('Metadata generation error:', error);
  }
  return {};
}

export default async function CustomDomainBlogPostPage({ params }: PageProps) {
  const { domain, slug } = await params;
  if (!domain || !slug) return notFound();

  const businessProfileId = await getBusinessProfileId(domain);
  if (!businessProfileId) return notFound();

  // 1. Fetch business profile
  let profileDoc;
  try {
    profileDoc = await admin.firestore().collection('businessProfiles').doc(businessProfileId).get();
  } catch (error) {
    console.error('[custom-domain-blog-post] Profile fetch error:', error);
    return notFound();
  }

  if (!profileDoc.exists) return notFound();
  const profile = profileDoc.data() || {};
  const companyName = profile.businessName || 'Our Service Company';
  const phone = formatPhone(profile.phoneNumber || '');
  const measurementId = profile.googleAnalyticsMeasurementId;

  // 2. Fetch specific blog post
  let post: any = null;
  try {
    const snap = await admin
      .firestore()
      .collection('businessProfiles')
      .doc(businessProfileId)
      .collection('blogs')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (!snap.empty) {
      post = {
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
        createdAt: snap.docs[0].data().createdAt?.toDate
          ? snap.docs[0].data().createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : new Date(snap.docs[0].data().createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      };
    }
  } catch (error) {
    console.error('[custom-domain-blog-post] Blog post fetch error:', error);
  }

  if (!post) return notFound();

  // 3. Fetch other recent posts for sidebar
  let recentPosts: any[] = [];
  try {
    const snap = await admin
      .firestore()
      .collection('businessProfiles')
      .doc(businessProfileId)
      .collection('blogs')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();

    recentPosts = snap.docs
      .map(doc => {
        const data = doc.data() as any;
        return { id: doc.id, ...data };
      })
      .filter((p: any) => p.slug !== slug);
  } catch (e) {
    console.error('Error fetching recent posts:', e);
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
          <Link href="/blog" className="text-sm font-medium hover:text-blue-600 transition-colors">Blog</Link>
        </nav>
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-2 font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
            <Phone className="h-4 w-4 text-blue-600" />
            <span>{phone}</span>
          </a>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-grow container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-6">
          <Link href="/blog" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Articles</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Article Section */}
          <article className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {post.imageUrl && (
              <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div className="p-6 md:p-10">
              <header className="mb-8 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>{post.createdAt}</span>
                {post.author && (
                  <>
                    <span>•</span>
                    <span>By {post.author}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                {post.title}
              </h1>
            </header>

            {/* Post Content */}
            <div 
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6 text-[15px]"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />

            {/* Lead Capture Form Embedded in Post */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <BlogLeadForm businessProfileId={businessProfileId} companyName={companyName} />
            </div>
          </div>
        </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            {recentPosts.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Recent Articles
                </h3>
                <div className="space-y-4">
                  {recentPosts.map((rp) => (
                    <div key={rp.id} className="group">
                      <Link href={`/blog/${rp.slug}`}>
                        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {rp.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {rp.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic CTA box */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-sm text-white text-center">
              <h3 className="text-xl font-bold">In Need of Service?</h3>
              <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                Contact our local professionals for fast, honest service and expert results.
              </p>
              {phone && (
                <a 
                  href={`tel:${phone}`} 
                  className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl mt-6 transition-all hover:scale-105"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Us Now</span>
                </a>
              )}
            </div>
          </aside>
        </div>
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
