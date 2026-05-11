import { admin } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Assuming we have the templates available or we redirect to a shared component
// For now, we will render the template directly or import the TemplateContent
// We can use the same approach as the Dashboard preview.
// But we need the template to be a server component or at least provide data to it.

// We will fetch the Business Profile and pass its data to a Template wrapper.
import Template1 from '@/app/landing-pages/template-1/page';
import Template2 from '@/app/landing-pages/template-2/page';
import Template3 from '@/app/landing-pages/template-3/page';
import Template4 from '@/app/landing-pages/template-4/page';

export default async function CustomDomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  
  if (!domain) {
    return notFound();
  }

  // Find the business profile associated with this domain
  let businessProfileId: string | null = null;
  
  try {
    const customDomainsSnapshot = await admin.firestore()
      .collectionGroup('customDomains')
      .where('id', '==', domain)
      .limit(1)
      .get();

    if (!customDomainsSnapshot.empty) {
      businessProfileId = customDomainsSnapshot.docs[0].data().businessProfileId;
    }
  } catch (error) {
    console.error('Error fetching custom domain:', error);
    // If collection group index is missing, it will throw an error here.
  }

  if (!businessProfileId) {
    // If not found in customDomains, maybe it's not registered
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Domain Not Connected</h1>
        <p className="text-lg text-muted-foreground">
          The domain <strong>{domain}</strong> is not connected to any business profile.
        </p>
      </div>
    );
  }

  // Fetch the business profile
  const profileDoc = await admin.firestore().collection('businessProfiles').doc(businessProfileId).get();
  
  if (!profileDoc.exists) {
    return notFound();
  }

  const businessProfile = profileDoc.data() || {};
  const template = businessProfile.defaultLandingPage || 'template-1';
  
  // The existing templates use useSearchParams. This is tricky because we are rendering them on a custom route.
  // Wait, if they are Client Components relying on `useSearchParams`, they will read the current URL parameters.
  // BUT the custom domain URL (e.g. `https://aisalesrep.online`) won't have `?heroEffect=...&service=...` in the browser URL.
  // This means the Client Component's `useSearchParams` will return empty.
  // We MUST refactor the templates to accept props instead of solely relying on searchParams.
  
  // For now, let's create a wrapper that provides the params via a React Context or modify the templates.
  // Actually, wait, modifying the templates to accept props is the best way.

  return (
    <div className="custom-domain-container">
      {/* 
        This is a temporary placeholder until we refactor the templates. 
        It will currently render default values because searchParams are empty.
      */}
      {template === 'template-1' && <Template1 />}
      {template === 'template-2' && <Template2 />}
      {template === 'template-3' && <Template3 />}
      {template === 'template-4' && <Template4 />}
      
      {/* Inject a script or context? Next.js doesn't allow setting searchParams context easily. */}
    </div>
  );
}
