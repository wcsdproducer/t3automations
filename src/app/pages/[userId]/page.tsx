import { admin } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { profileToTemplateProps } from '@/lib/template-props';
import { Template1Content } from '@/app/landing-pages/_components/template-1-content';
import { Template2Content } from '@/app/landing-pages/_components/template-2-content';
import { Template3Content } from '@/app/landing-pages/_components/template-3-content';
import { Template4Content } from '@/app/landing-pages/_components/template-4-content';

/**
 * /pages/[userId] — Free published landing page URL.
 * Auto-provisioned for every user on publish.
 * URL: https://t3automations.com/pages/{userId}
 */
export default async function PublishedPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  if (!userId) return notFound();

  let profileDoc;
  try {
    profileDoc = await admin.firestore().collection('businessProfiles').doc(userId).get();
  } catch (error) {
    console.error('[pages/userId] Firestore fetch error:', error);
    return notFound();
  }

  if (!profileDoc.exists) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground">
          This landing page hasn't been published yet.
        </p>
      </div>
    );
  }

  const profile = profileDoc.data() || {};
  const templateProps = profileToTemplateProps(profile, userId);
  const template = profile.defaultLandingPage || 'template-1';

  if (template === 'template-2') return <Template2Content {...templateProps} />;
  if (template === 'template-3') return <Template3Content {...templateProps} />;
  if (template === 'template-4') return <Template4Content {...templateProps} />;
  return <Template1Content {...templateProps} />;
}
