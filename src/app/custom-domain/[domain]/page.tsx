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

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  if (!domain) return {};

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
    console.error('[custom-domain] generateMetadata lookup error:', error);
  }

  if (!businessProfileId) return {};

  const profileDoc = await admin
    .firestore()
    .collection('businessProfiles')
    .doc(businessProfileId)
    .get();

  if (!profileDoc.exists) return {};

  const profile = profileDoc.data() || {};
  return {
    title: profile.metaTitle || profile.businessName || 'T3 Partner',
    description: profile.metaDescription || profile.service || '',
    verification: {
      google: profile.googleSiteVerification || undefined,
    },
  };
}

export default async function CustomDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  if (!domain) return notFound();

  const cleanDomain = domain.toLowerCase().trim().replace(/:\d+$/, ''); // Remove port if any

  console.log(`[custom-domain] Resolving domain: "${cleanDomain}" (Original: "${domain}")`);

  // 1. Look up which business owns this custom domain
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
    console.error('[custom-domain] Firestore lookup error:', error);
  }

  if (!businessProfileId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Domain Not Connected</h1>
        <p className="text-lg text-muted-foreground">
          The domain <strong>{domain}</strong> is not connected to any business profile.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          If you own this domain, connect it in your T3 Automations dashboard.
        </p>
      </div>
    );
  }

  // 2. Fetch the business profile
  const profileDoc = await admin
    .firestore()
    .collection('businessProfiles')
    .doc(businessProfileId)
    .get();

  if (!profileDoc.exists) return notFound();

  const profile = profileDoc.data() || {};
  const templateProps = profileToTemplateProps(profile, businessProfileId);
  const template = profile.defaultLandingPage || 'template-1';
  const measurementId = profile.googleAnalyticsMeasurementId;

  // 3. Render the correct template with real data
  const content = (() => {
    if (template === 'tree-care') return <TreeCareTemplate {...templateProps} />;
    if (template === 'epoxy-flooring') return <EpoxyFlooringTemplate {...templateProps} />;
    if (template === 'paving-concrete') return <PavingConcreteTemplate {...templateProps} />;
    if (template === 'appliance-repair') return <ApplianceRepairTemplate {...templateProps} />;
    
    // Legacy fallbacks
    if (template === 'template-2') return <Template2Content {...templateProps} />;
    if (template === 'template-3') return <TreeCareTemplate {...templateProps} />;
    if (template === 'template-4') return <Template4Content {...templateProps} />;
    return <Template1Content {...templateProps} />;
  })();

  return (
    <>
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
