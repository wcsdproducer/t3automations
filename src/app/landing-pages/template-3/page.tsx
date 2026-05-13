'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Template3Content } from '@/app/landing-pages/_components/template-3-content';

function PreviewWrapper() {
  const searchParams = useSearchParams();
  return (
    <Template3Content
      heroEffect={searchParams.get('heroEffect') || 'slideshow'}
      service={searchParams.get('service') || 'HVAC Maintenance & Repair'}
      phone={searchParams.get('phone') || '(000) 000-0000'}
      logoUrl={searchParams.get('logo') || ''}
      companyName={searchParams.get('companyName') || ''}
      fontPair={searchParams.get('fontPair') || 'modern-corporate'}
      colorPalette={searchParams.get('colorPalette') || 'deep-midnight'}
      bookingUrl={searchParams.get('bookingUrl') || ''}
    />
  );
}

export default function LandingPageTemplate3() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
      <PreviewWrapper />
    </Suspense>
  );
}
