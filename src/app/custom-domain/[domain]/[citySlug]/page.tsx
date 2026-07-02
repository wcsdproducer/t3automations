import { admin } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { profileToTemplateProps } from '@/lib/template-props';
import { Template1Content } from '@/app/landing-pages/_components/template-1-content';
import { Template2Content } from '@/app/landing-pages/_components/template-2-content';
import { Template3Content } from '@/app/landing-pages/_components/template-3-content';
import { Template4Content } from '@/app/landing-pages/_components/template-4-content';
import { TreeCareTemplate } from '@/app/landing-pages/_components/tree-care-template';
import { EpoxyFlooringTemplate } from '@/app/landing-pages/_components/epoxy-flooring-template';
import { PavingConcreteTemplate } from '@/app/landing-pages/_components/paving-concrete-template';
import { ApplianceRepairTemplate } from '@/app/landing-pages/_components/appliance-repair-template';
import { PestControlTemplate } from '@/app/landing-pages/_components/pest-control-template';
import { JunkRemovalTemplate } from '@/app/landing-pages/_components/junk-removal-template';
import { slugify } from '@/lib/utils';

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
    console.error('[city-page] lookup error:', error);
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
  params: Promise<{ domain: string; citySlug: string }>;
}): Promise<Metadata> {
  const { domain, citySlug } = await params;
  const data = await getBusinessData(domain);
  if (!data) return {};

  const { profile, cleanDomain } = data;
  
  // Validate citySlug
  const surroundingCities = profile.localSeoData?.surroundingCities || [];
  const neighborhoods = profile.localSeoData?.neighborhoods || [];
  const allLocations = [...surroundingCities, ...neighborhoods];
  
  const matchedLocation = allLocations.find(loc => slugify(loc.name) === citySlug);
  if (!matchedLocation) return {};

  const cityName = matchedLocation.name;
  const service = profile.service || 'Services';
  
  const title = `${service} in ${cityName} | ${profile.businessName || 'Expert Service'}`;
  const description = `Top-rated ${service.toLowerCase()} in ${cityName}. Professional, reliable, and affordable. Call ${profile.businessName} today for a free estimate in ${cityName}!`;
  const canonicalUrl = `https://${cleanDomain}/${citySlug}`;
  const logoUrl = profile.logoUrl || '';

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
      siteName: profile.businessName || 'T3 Partner',
      type: 'website',
      locale: 'en_US',
      ...(logoUrl ? { images: [{ url: logoUrl, width: 800, height: 600, alt: profile.businessName }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(logoUrl ? { images: [logoUrl] } : {}),
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ domain: string; citySlug: string }>;
}) {
  const { domain, citySlug } = await params;
  const data = await getBusinessData(domain);
  if (!data) return notFound();

  const { id, profile, cleanDomain } = data;

  // Validate citySlug
  const surroundingCities = profile.localSeoData?.surroundingCities || [];
  const neighborhoods = profile.localSeoData?.neighborhoods || [];
  const allLocations = [...surroundingCities, ...neighborhoods];
  
  const matchedLocation = allLocations.find(loc => slugify(loc.name) === citySlug);
  if (!matchedLocation) return notFound();

  const cityName = matchedLocation.name;
  
  // Override profile targetCity for template rendering
  const cityProfile = {
    ...profile,
    targetCity: cityName, // This forces the template to say "in [City Name]"
    metaTitle: `${profile.service} in ${cityName} | ${profile.businessName}`,
    metaDescription: `Professional ${profile.service} in ${cityName}. Call today for a free estimate!`
  };

  const templateProps = profileToTemplateProps(cityProfile, id);
  const template = profile.defaultLandingPage || 'template-1';
  const measurementId = profile.googleAnalyticsMeasurementId;

  // Build JSON-LD for City Page
  const canonicalUrl = `https://${cleanDomain}/${citySlug}`;
  let schemaState = 'FL';
  const tc = profile.targetCity || '';
  if (tc.includes(',')) {
    schemaState = tc.split(',')[1].trim();
  }

  const serviceLower = (profile.service || '').toLowerCase();
  let businessType = 'LocalBusiness';
  if (serviceLower.includes('tree') || serviceLower.includes('concrete') || serviceLower.includes('paving') || serviceLower.includes('epoxy') || serviceLower.includes('floor') || serviceLower.includes('appliance')) {
    businessType = 'HomeAndConstructionBusiness';
  } else if (serviceLower.includes('pest') || serviceLower.includes('junk') || serviceLower.includes('removal')) {
    businessType = 'ProfessionalService';
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': businessType,
    name: `${profile.businessName} - ${cityName}`,
    telephone: profile.phoneNumber || '',
    url: canonicalUrl,
    description: cityProfile.metaDescription,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: schemaState,
      addressCountry: 'US',
    },
    areaServed: [
      { '@type': 'City', name: cityName },
      { '@type': 'State', name: schemaState },
    ],
  };

  const content = (() => {
    if (template === 'tree-care') return <TreeCareTemplate {...templateProps} />;
    if (template === 'epoxy-flooring') return <EpoxyFlooringTemplate {...templateProps} />;
    if (template === 'paving-concrete') return <PavingConcreteTemplate {...templateProps} />;
    if (template === 'appliance-repair') return <ApplianceRepairTemplate {...templateProps} />;
    if (template === 'pest-control') return <PestControlTemplate {...templateProps} />;
    if (template === 'junk-removal') return <JunkRemovalTemplate {...templateProps} />;
    
    // Fallbacks
    if (template === 'template-2') return <Template2Content {...templateProps} />;
    if (template === 'template-3') return <TreeCareTemplate {...templateProps} />;
    if (template === 'template-4') return <Template4Content {...templateProps} />;
    return <Template1Content {...templateProps} />;
  })();

  return (
    <>
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
      {content}
    </>
  );
}
