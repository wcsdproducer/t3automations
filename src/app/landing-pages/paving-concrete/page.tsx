'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PavingConcreteTemplate } from '@/app/landing-pages/_components/paving-concrete-template';

function PreviewWrapper() {
  const searchParams = useSearchParams();
  return (
    <PavingConcreteTemplate
      heroEffect={searchParams.get('heroEffect') || 'slideshow'}
      service={searchParams.get('service') || 'Paving & Concrete'}
      phone={searchParams.get('phone') || '(000) 000-0000'}
      logoUrl={searchParams.get('logo') || ''}
      companyName={searchParams.get('companyName') || ''}
      fontPair={searchParams.get('fontPair') || 'modern-corporate'}
      colorPalette={searchParams.get('colorPalette') || 'deep-midnight'}
      bookingUrl={searchParams.get('bookingUrl') || ''}
    />
  );
}

export default function LandingPagePavingConcrete() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
      <PreviewWrapper />
    </Suspense>
  );
}
