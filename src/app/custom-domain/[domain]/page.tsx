import { admin } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { profileToTemplateProps } from '@/lib/template-props';
import { Template1Content } from '@/app/landing-pages/_components/template-1-content';
import { Template2Content } from '@/app/landing-pages/_components/template-2-content';
import { Template3Content } from '@/app/landing-pages/_components/template-3-content';
import { Template4Content } from '@/app/landing-pages/_components/template-4-content';

export default async function CustomDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  if (!domain) return notFound();

  // 1. Look up which business owns this custom domain
  let businessProfileId: string | null = null;

  try {
    const snap = await admin
      .firestore()
      .collectionGroup('customDomains')
      .where('id', '==', domain)
      .limit(1)
      .get();

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
  const templateProps = profileToTemplateProps(profile);
  const template = profile.defaultLandingPage || 'template-1';

  // 3. Render the correct template with real data
  if (template === 'template-2') return <Template2Content {...templateProps} />;
  if (template === 'template-3') return <Template3Content {...templateProps} />;
  if (template === 'template-4') return <Template4Content {...templateProps} />;
  return <Template1Content {...templateProps} />;
}
