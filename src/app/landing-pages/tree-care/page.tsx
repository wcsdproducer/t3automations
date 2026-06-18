'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TreeCareTemplate } from '@/app/landing-pages/_components/tree-care-template';

function PreviewWrapper() {
  const searchParams = useSearchParams();
  return (
    <TreeCareTemplate
      heroEffect={searchParams.get('heroEffect') || 'slideshow'}
      service={searchParams.get('service') || 'Tree Services'}
      phone={searchParams.get('phone') || '(000) 000-0000'}
      logoUrl={searchParams.get('logo') || ''}
      companyName={searchParams.get('companyName') || ''}
      fontPair={searchParams.get('fontPair') || 'modern-corporate'}
      colorPalette={searchParams.get('colorPalette') || 'deep-midnight'}
      bookingUrl={searchParams.get('bookingUrl') || ''}
    />
  );
}

export default function LandingPageTreeCare() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
      <PreviewWrapper />
    </Suspense>
  );
}
