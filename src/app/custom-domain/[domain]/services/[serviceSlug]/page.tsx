import { admin } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Phone,
  CheckCircle2,
  ShieldCheck,
  Award,
  Timer,
  Wrench,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { getServicesForNiche, SERVICE_SILOS } from '@/lib/constants/services';
import { SharedFooter } from '@/app/landing-pages/_components/shared-footer';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { slugify } from '@/lib/utils';

function formatPhone(value: string) {
  if (!value) return value;
  const d = value.replace(/\D/g, '');
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

export const dynamic = 'force-dynamic';

async function getBusinessData(domain: string) {
  const cleanDomain = domain.toLowerCase().trim().replace(/:\d+$/, '');
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
    console.error('[service-page] lookup error:', error);
  }

  if (!businessProfileId) {
    try {
      const profilesSnap = await db.collection('businessProfiles').get();
      for (const pDoc of profilesSnap.docs) {
        const domSnap = await pDoc.ref.collection('customDomains').doc(cleanDomain).get();
        if (domSnap.exists) {
          businessProfileId = pDoc.id;
          break;
        }
      }
    } catch (e) {
      console.error('[service-page] profile scan error:', e);
    }
  }

  if (!businessProfileId) return null;

  const profileDoc = await db.collection('businessProfiles').doc(businessProfileId).get();
  if (!profileDoc.exists) return null;

  return { id: businessProfileId, profile: profileDoc.data() || {}, cleanDomain };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; serviceSlug: string }>;
}): Promise<Metadata> {
  const { domain, serviceSlug } = await params;
  const data = await getBusinessData(domain);
  if (!data) return {};

  const { profile, cleanDomain } = data;
  const nicheServices = getServicesForNiche(profile.service || '');
  const svc = nicheServices.find((s) => s.slug === serviceSlug);
  if (!svc) return {};

  const city = profile.targetCity?.split(',')[0]?.trim() || 'Your Area';
  const companyName = profile.businessName || 'Local Service Pros';
  const title = `${svc.name} in ${city} | ${companyName}`;
  const description = `${svc.description} Serving ${city} with upfront pricing (${svc.priceRange}) and fast turnaround (${svc.turnaround}). Call ${companyName} today!`;
  const canonicalUrl = `https://${cleanDomain}/services/${serviceSlug}`;
  const rawLogo = profile.logoUrl || '';
  const ogImage = rawLogo
    ? rawLogo.startsWith('/') ? `https://${cleanDomain}${rawLogo}` : rawLogo
    : undefined;

  return {
    metadataBase: new URL(`https://${cleanDomain}`),
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: companyName,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function ServiceSiloPage({
  params,
}: {
  params: Promise<{ domain: string; serviceSlug: string }>;
}) {
  const { domain, serviceSlug } = await params;
  const data = await getBusinessData(domain);
  if (!data) return notFound();

  const { id, profile, cleanDomain } = data;
  const nicheServices = getServicesForNiche(profile.service || '');
  const svc = nicheServices.find((s) => s.slug === serviceSlug) || SERVICE_SILOS.find((s) => s.slug === serviceSlug);
  if (!svc) return notFound();

  const companyName = profile.businessName || 'Local Service Experts';
  const phone = formatPhone(profile.phoneNumber || '');
  const city = profile.targetCity?.split(',')[0]?.trim() || 'Your Area';
  const state = profile.targetCity?.includes(',') ? profile.targetCity.split(',')[1].trim() : '';
  const marketLabel = state ? `${city}, ${state}` : city;
  const measurementId = profile.googleAnalyticsMeasurementId;
  const top5Cities = (profile.localSeoData?.surroundingCities || []).slice(0, 5);
  const siblingServices = nicheServices.filter((s) => s.slug !== svc.slug);

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${svc.name} in ${marketLabel}`,
    serviceType: svc.name,
    provider: {
      '@type': 'HomeAndConstructionBusiness',
      name: companyName,
      telephone: phone,
      url: `https://${cleanDomain}`,
    },
    areaServed: [
      { '@type': 'City', name: city },
      ...top5Cities.map((c: any) => ({ '@type': 'City', name: typeof c === 'string' ? c : c.name })),
    ],
    description: svc.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: `Estimated range: ${svc.priceRange}. Turnaround: ${svc.turnaround}.`,
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: svc.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {measurementId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${measurementId}', { page_path: window.location.pathname });
              `,
            }}
          />
        </>
      )}

      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-100 py-2.5 px-6 text-center text-xs font-semibold flex flex-wrap justify-center items-center gap-4">
        <span>⚡ {svc.shortName} Specialists in {marketLabel}</span>
        {phone && (
          <a href={`tel:${phone}`} className="hover:underline flex items-center gap-1 text-sky-300">
            <Phone className="h-3.5 w-3.5" /> Free Estimate: {phone}
          </a>
        )}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
        <Link href="/" className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-blue-600" />
          <span>{companyName}</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 hidden sm:inline">
            Home
          </Link>
          <Link href="/blog" className="text-sm font-semibold text-slate-600 hover:text-blue-600 hidden sm:inline">
            Guides
          </Link>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm px-4 py-2 rounded-md transition-colors"
            >
              Call {phone}
            </a>
          )}
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="py-16 lg:py-24 px-6 md:px-12 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border-b border-slate-200/60">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" /> Back to {companyName}
            </Link>

            <div>
              <Badge className="bg-blue-500/10 text-blue-800 border-none font-bold text-xs uppercase px-3 py-1 tracking-wider mb-4">
                Local {city} Specialists
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {svc.headline} in {marketLabel}
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
                {svc.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-base font-extrabold flex items-center justify-center gap-3 py-4 px-8 rounded-md shadow-lg shadow-blue-500/15 transition-colors"
                >
                  <Phone className="h-5 w-5" /> Call For Free Quote: {phone}
                </a>
              )}
              <Link
                href="/#contact"
                className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-base font-bold flex items-center justify-center py-4 px-8 rounded-md transition-colors"
              >
                Request Online Estimate
              </Link>
            </div>

            {/* Commercial Quick Facts */}
            <div className="pt-4 flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-600" /> Typical Range: {svc.priceRange}
              </span>
              <span className="flex items-center gap-1.5">
                <Timer className="h-4 w-4 text-emerald-600" /> Turnaround: {svc.turnaround}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Licensed & Insured in {state || city}
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-600" /> Written Workmanship Warranty
              </span>
            </div>
          </div>
        </section>

        {/* Scope of Work / Deliverables */}
        <section className="py-16 px-6 md:px-12 max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              What&apos;s Included With Our {svc.shortName} Service
            </h2>
            <p className="text-slate-500 text-sm">
              Commercial-grade materials, thorough prep work, and clean jobsite wrap-up across {marketLabel}.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {svc.deliverables.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm flex items-start gap-3.5">
                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-800 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Problems Solved */}
        <section className="py-16 px-6 md:px-12 bg-white border-t border-b border-slate-200/70">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                Common {city} Problems We Solve
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {svc.commonProblems.map((prob, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200/60 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-800 text-sm">{prob}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-6 md:px-12 max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {svc.shortName} FAQs ({city})
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {svc.faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="bg-white px-6 py-2 border border-slate-200/70 rounded-xl">
                <AccordionTrigger className="font-bold text-left text-slate-900 hover:text-blue-600 hover:no-underline text-sm md:text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed text-xs md:text-sm pt-2 border-t border-slate-100">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Internal Silo Links: Related Services & Top Service Areas */}
        <section className="py-12 px-6 md:px-12 bg-slate-100/70 border-t border-slate-200/70">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {siblingServices.length > 0 && (
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-3">
                  Related {profile.service} Services in {city}
                </h3>
                <ul className="space-y-2">
                  {siblingServices.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}`} className="text-sm font-semibold text-blue-700 hover:underline">
                        {s.name} &rarr;
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {top5Cities.length > 0 && (
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-3">
                  Nearby Service Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {top5Cities.map((c: any, idx: number) => {
                    const name = typeof c === 'string' ? c : c.name;
                    return (
                      <Link
                        key={idx}
                        href={`/${slugify(name)}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 hover:border-blue-400 hover:text-blue-700"
                      >
                        <MapPin className="h-3 w-3 text-blue-600" /> {svc.shortName} in {name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <SharedFooter
        businessProfileId={id}
        companyName={companyName}
        blogLink="/blog"
        service={profile.service}
        localSeoData={profile.localSeoData}
        theme="light"
      />
    </div>
  );
}
