'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EpoxyFlooringTemplate } from '@/app/landing-pages/_components/epoxy-flooring-template';

function PreviewWrapper() {
  const searchParams = useSearchParams();
  return (
    <EpoxyFlooringTemplate
      heroEffect={searchParams.get('heroEffect') || 'slideshow'}
      service={searchParams.get('service') || 'Epoxy Flooring'}
      phone={searchParams.get('phone') || '(000) 000-0000'}
      logoUrl={searchParams.get('logo') || ''}
      companyName={searchParams.get('companyName') || ''}
      fontPair={searchParams.get('fontPair') || 'modern-corporate'}
      colorPalette={searchParams.get('colorPalette') || 'deep-midnight'}
      bookingUrl={searchParams.get('bookingUrl') || ''}
    />
  );
}

export default function LandingPageEpoxyFlooring() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
      <PreviewWrapper />
    </Suspense>
  );
}
