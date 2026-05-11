'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Template4Content } from '@/app/landing-pages/_components/template-4-content';

function PreviewWrapper() {
  const searchParams = useSearchParams();
  return (
    <Template4Content
      heroEffect={searchParams.get('heroEffect') || 'slideshow'}
      service={searchParams.get('service') || 'House Cleaning (Maid Services)'}
      phone={searchParams.get('phone') || '(000) 000-0000'}
      logoUrl={searchParams.get('logo') || ''}
      companyName={searchParams.get('companyName') || ''}
      fontPair={searchParams.get('fontPair') || 'modern-corporate'}
      colorPalette={searchParams.get('colorPalette') || 'deep-midnight'}
    />
  );
}

export default function LandingPageTemplate4() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
      <PreviewWrapper />
    </Suspense>
  );
}
