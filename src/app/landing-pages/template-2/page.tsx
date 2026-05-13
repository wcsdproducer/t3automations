'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Template2Content } from '@/app/landing-pages/_components/template-2-content';

function PreviewWrapper() {
  const searchParams = useSearchParams();
  return (
    <Template2Content
      heroEffect={searchParams.get('heroEffect') || 'slideshow'}
      service={searchParams.get('service') || 'Handyman Services'}
      phone={searchParams.get('phone') || '(000) 000-0000'}
      logoUrl={searchParams.get('logo') || ''}
      companyName={searchParams.get('companyName') || ''}
      fontPair={searchParams.get('fontPair') || 'modern-corporate'}
      colorPalette={searchParams.get('colorPalette') || 'deep-midnight'}
      bookingUrl={searchParams.get('bookingUrl') || ''}
    />
  );
}

export default function LandingPageTemplate2() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
      <PreviewWrapper />
    </Suspense>
  );
}
