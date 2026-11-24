'use client';

import React from 'react';
import { slugify } from '@/lib/utils';
import { getBrandsForNiche } from '@/lib/constants/brands';
import { getServicesForNiche } from '@/lib/constants/services';

interface SharedFooterProps {
  businessProfileId?: string;
  companyName?: string;
  blogLink?: string;
  service?: string;
  localSeoData?: {
    surroundingCities?: Array<{ name: string; mapUrl: string }>;
    neighborhoods?: Array<{ name: string; mapUrl: string }> | string[];
    networkLinks?: Array<{ anchor?: string; label?: string; url: string }>;
  } | null;
  className?: string;
  theme?: 'light' | 'dark';
}

const defaultMapUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export function SharedFooter({
  businessProfileId = '',
  companyName = '',
  blogLink = '/blog',
  service = '',
  localSeoData = null,
  className = '',
  theme = 'light'
}: SharedFooterProps) {
  const isDark = theme === 'dark';
  
  // Only expose top 5 surrounding cities to avoid doorway-page link bloat.
  // Never render cross-domain networkLinks (PBN footprint).
  const surroundingCities = (localSeoData?.surroundingCities || []).slice(0, 5);
  const brands = getBrandsForNiche(service);
  const nicheServices = getServicesForNiche(service);

  const hasCityData = surroundingCities.length > 0;
  const hasBrands = brands.length > 0;
  const hasServices = nicheServices.length > 0;

  const bgClass = isDark ? 'bg-slate-950 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-200/60 text-slate-500';
  const headingClass = isDark ? 'text-slate-200 font-bold' : 'text-slate-900 font-bold';
  const titleClass = headingClass;
  const hoverClass = isDark ? 'hover:text-slate-200' : 'hover:text-slate-900';
  const linkClass = hoverClass;

  return (
    <footer className={`py-16 px-6 border-t ${bgClass} ${className} relative z-10`}>
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand details */}
          <div className="space-y-4">
            <h4 className={`text-base font-black tracking-tight ${headingClass}`}>
              {companyName}
            </h4>
            <p className="text-xs leading-relaxed max-w-xs">
              Providing professional, high-quality local services backed by satisfaction guarantee. Licensed, bonded, and insured.
            </p>
            <p className="text-[11px]">
              &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
            </p>
          </div>

          {/* Column 2: Navigation & Brands */}
          <div className="space-y-4">
            <h4 className={`text-xs uppercase font-bold tracking-wider ${headingClass}`}>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href={blogLink} className={`transition-colors ${hoverClass}`}>
                  Blog & Articles
                </a>
              </li>
              <li>
                <a 
                  href={`/api/legal/privacy?userId=${businessProfileId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`transition-colors ${hoverClass}`}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href={`/api/legal/tos?userId=${businessProfileId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`transition-colors ${hoverClass}`}
                >
                  Terms of Service
                </a>
              </li>
            </ul>

            {hasBrands && (
              <div className="pt-4 border-t border-slate-200/40">
                <h4 className={`text-xs uppercase font-bold tracking-wider ${headingClass} mb-2.5`}>
                  Brands We Service
                </h4>
                <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
                  {brands.map((b, idx) => (
                    <li key={idx}>
                      <a href={`/brands/${b.slug}`} className={`transition-colors ${linkClass}`}>
                        {b.name} Repair
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Column 3: Specialized Services */}
          {hasServices && (
            <div className="space-y-4">
              <h4 className={`text-sm font-bold uppercase tracking-wider ${titleClass}`}>Our Services</h4>
              <ul className="space-y-2 text-sm">
                {nicheServices.map((svc, idx) => (
                  <li key={idx}>
                    <a
                      href={`/services/${svc.slug}`}
                      className={`transition-colors ${linkClass}`}
                    >
                      {svc.shortName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 4: Service Areas (Top 5 Surrounding Cities) */}
          {hasCityData && (
            <div className="space-y-4">
              <h4 className={`text-sm font-bold uppercase tracking-wider ${titleClass}`}>Service Areas</h4>
              <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {surroundingCities.map((city, idx) => {
                  const name = typeof city === 'string' ? city : city.name;
                  const url = `/${slugify(name)}`;
                  return (
                    <li key={idx}>
                      <a 
                        href={url}
                        className={`text-sm transition-colors ${linkClass}`}
                      >
                        {name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

        </div>
      </div>
    </footer>
  );
}
