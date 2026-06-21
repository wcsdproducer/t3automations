'use client';

import React, { useEffect, useState } from 'react';

interface AeoSchemaProps {
  companyName: string;
  phone: string;
  service: string;
  logoUrl?: string;
  description?: string;
  faqs?: { question: string; answer: string }[];
  targetCity?: string;
}

export function AeoSchema({
  companyName,
  phone,
  service,
  logoUrl,
  description,
  faqs,
  targetCity,
}: AeoSchemaProps) {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin + window.location.pathname);
    }
  }, []);

  // Parse targetCity (e.g. "Boise, ID")
  let city = 'Tampa';
  let state = 'FL';
  if (targetCity && targetCity.includes(',')) {
    const parts = targetCity.split(',');
    city = parts[0].trim();
    state = parts[1].trim();
  } else if (targetCity) {
    city = targetCity.trim();
  }

  // 1. LocalBusiness Schema
  let businessType = 'LocalBusiness';
  const serviceLower = service.toLowerCase();
  
  if (serviceLower.includes('tree')) {
    businessType = 'HomeAndConstructionBusiness'; // Closest match for tree care
  } else if (serviceLower.includes('concrete') || serviceLower.includes('paving')) {
    businessType = 'HomeAndConstructionBusiness';
  } else if (serviceLower.includes('epoxy') || serviceLower.includes('floor')) {
    businessType = 'HomeAndConstructionBusiness';
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': businessType,
    name: companyName || 'Local Service Pro',
    telephone: phone || '',
    url: currentUrl || '',
    logo: logoUrl || undefined,
    description: description || `Professional ${service} provider specializing in quality local services.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: state,
      addressCountry: 'US',
    },
    areaServed: [
      {
        '@type': 'City',
        name: city,
        sameAs: `https://en.wikipedia.org/wiki/${encodeURIComponent(city)}`,
      },
      {
        '@type': 'State',
        name: state === 'FL' || state.toLowerCase() === 'florida' ? 'Florida' : state,
        sameAs: `https://en.wikipedia.org/wiki/${encodeURIComponent(state === 'FL' || state.toLowerCase() === 'florida' ? 'Florida' : state)}`,
      }
    ],
  };

  // 2. FAQ Page Schema (if FAQs are provided)
  const faqSchema = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
