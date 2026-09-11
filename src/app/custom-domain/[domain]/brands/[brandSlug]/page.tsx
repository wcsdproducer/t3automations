import { admin } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Phone, CheckCircle2, ShieldCheck, Award, Timer, 
  Wrench, ArrowLeft, Star, ChevronRight, HelpCircle
} from 'lucide-react';
import { APPLIANCE_BRANDS } from '@/lib/constants/brands';
import { SharedFooter } from '@/app/landing-pages/_components/shared-footer';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      businessProfileId = snap.docs[0].data().businessProfileId;
    }
  } catch (error) {
    console.error('[brand-page] lookup error:', error);
  }

  if (!businessProfileId) return null;

  const profileDoc = await admin
    .firestore()
    .collection('businessProfiles')
    .doc(businessProfileId)
    .get();

  if (!profileDoc.exists) return null;

  return { id: businessProfileId, profile: profileDoc.data() || {}, cleanDomain };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; brandSlug: string }>;
}): Promise<Metadata> {
  const { domain, brandSlug } = await params;
  const data = await getBusinessData(domain);
  if (!data) return {};

  const brand = APPLIANCE_BRANDS.find(b => b.slug === brandSlug);
  if (!brand) return {};

  const { profile, cleanDomain } = data;
  const city = profile.targetCity?.split(',')[0]?.trim() || '';
  const companyName = profile.businessName || 'Appliance Experts';

  const title = `${brand.name} Appliance Repair in ${city} | ${companyName}`;
  const description = `Authorized & certified ${brand.name} appliance repair in ${city}. Same-day diagnostics, genuine OEM parts, and a 90-day warranty. Call ${companyName} now!`;
  const canonicalUrl = `https://${cleanDomain}/brands/${brandSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: companyName,
      type: 'website',
    },
  };
}

export default async function BrandLandingPage({
  params,
}: {
  params: Promise<{ domain: string; brandSlug: string }>;
}) {
  const { domain, brandSlug } = await params;
  const data = await getBusinessData(domain);
  if (!data) return notFound();

  const brand = APPLIANCE_BRANDS.find(b => b.slug === brandSlug);
  if (!brand) return notFound();

  const { id, profile, cleanDomain } = data;
  const companyName = profile.businessName || 'Appliance Experts';
  const phone = formatPhone(profile.phoneNumber || '');
  const city = profile.targetCity?.split(',')[0]?.trim() || 'Your Local Area';
  const measurementId = profile.googleAnalyticsMeasurementId;

  const faqs = [
    {
      q: `Do you use genuine OEM replacement parts for ${brand.name} appliances?`,
      a: `Yes. We strictly source genuine OEM factory replacement parts directly certified for ${brand.name} appliances to maintain your equipment's factory efficiency and warranty.`
    },
    {
      q: `Can you repair ${brand.name} appliances the same day in ${city}?`,
      a: `We reserve priority same-day dispatch slots for urgent ${brand.name} repairs (especially refrigerators and leaking laundry units). Call early in the day to secure the earliest available technician.`
    },
    {
      q: `What is the warranty on ${brand.name} repairs?`,
      a: `All of our ${brand.name} repair services are backed by a comprehensive 90-day parts and labor warranty.`
    },
    {
      q: `How much does a ${brand.name} repair diagnostic cost?`,
      a: `We provide a flat, transparent diagnostic fee to inspect and troubleshoot your ${brand.name} machine. If you choose to proceed with our repair estimate, the diagnostic fee is completely waived.`
    }
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${brand.name} Appliance Repair Service`,
    provider: {
      '@type': 'HomeAndConstructionBusiness',
      name: companyName,
      telephone: phone,
      url: `https://${cleanDomain}`,
    },
    areaServed: {
      '@type': 'City',
      name: city,
    },
    description: brand.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: 'Same-day diagnostic and OEM repair service',
    },
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
                gtag('config', '${measurementId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* Top Bar */}
      <div className="bg-blue-900 text-blue-100 py-2.5 px-6 text-center text-xs font-semibold flex justify-center items-center gap-4">
        <span>⏱️ Priority Same-Day {brand.name} Diagnostics in {city}</span>
        {phone && (
          <a href={`tel:${phone}`} className="hover:underline flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-blue-300" /> Direct Line: {phone}
          </a>
        )}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <Link href="/" className="text-xl md:text-2xl font-black text-blue-950 flex items-center gap-2">
          <Wrench className="h-6 w-6 text-blue-600" />
          <span>{companyName}</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/blog" className="text-sm font-semibold text-slate-600 hover:text-blue-600">Blog</Link>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm px-4 py-2 rounded-md transition-colors"
            >
              Call Now
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-grow">
        <section className="relative py-16 lg:py-24 px-6 md:px-12 bg-gradient-to-br from-blue-50/60 to-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto space-y-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <div>
              <Badge className="bg-blue-500/10 text-blue-800 border-none font-bold text-xs uppercase px-3 py-1 tracking-wider mb-4">
                ⭐ Certified {brand.name} Specialists
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {brand.name} Appliance Repair in {city}
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
                {brand.description} Certified technicians, stocked OEM replacement parts, and upfront pricing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-base font-extrabold flex items-center justify-center gap-3 py-4 px-8 rounded-md shadow-lg shadow-blue-500/15 transition-colors"
                >
                  <Phone className="h-5 w-5" /> Call For {brand.name} Service: {phone}
                </a>
              )}
            </div>

            <div className="pt-4 flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Genuine OEM {brand.name} Parts</span>
              <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-emerald-500" /> 90-Day Repair Warranty</span>
              <span className="flex items-center gap-1.5"><Timer className="h-4 w-4 text-emerald-500" /> Same-Day Availability</span>
            </div>
          </div>
        </section>

        {/* Popular Models We Service */}
        <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {brand.name} Models & Appliances We Repair
            </h2>
            <p className="text-slate-500 text-sm">
              We service all residential configurations and production years for {brand.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brand.popularAppliances.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{brand.name} {item}</h3>
                  <p className="text-slate-500 text-xs mt-1">Full troubleshooting, diagnostic checks, and motor/board replacements.</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Common Issues Fixed */}
        <section className="py-16 px-6 md:px-12 bg-white border-t border-b border-slate-100">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                Common {brand.name} Issues We Resolve Daily
              </h2>
              <p className="text-slate-500 text-sm">
                Our service vans arrive equipped with specialized diagnostic sensors and OEM replacement components.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {brand.commonIssues.map((issue, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-800 text-sm">{issue}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-6 md:px-12 max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {brand.name} Repair FAQs
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="bg-white px-6 py-2 border border-slate-100 rounded-xl">
                <AccordionTrigger className="font-bold text-left text-slate-900 hover:text-blue-600 hover:no-underline text-sm md:text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 leading-relaxed text-xs md:text-sm pt-2 border-t border-slate-50">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <SharedFooter
        businessProfileId={id}
        companyName={companyName}
        blogLink="/blog"
        localSeoData={profile.localSeoData}
        theme="light"
      />
    </div>
  );
}
