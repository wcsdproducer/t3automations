'use client';

import React from 'react';

interface SharedFooterProps {
  businessProfileId?: string;
  companyName?: string;
  blogLink?: string;
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
  localSeoData = null,
  className = '',
  theme = 'light'
}: SharedFooterProps) {
  const isDark = theme === 'dark';
  
  const neighborhoods = localSeoData?.neighborhoods || [];
  const networkLinks = localSeoData?.networkLinks || [];
  const surroundingCities = localSeoData?.surroundingCities || [];

  const hasGeoData = neighborhoods.length > 0;
  const hasNetworkData = networkLinks.length > 0;
  const hasCityData = surroundingCities.length > 0;

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

          {/* Column 2: Navigation Links */}
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
          </div>

          {/* Column 3: Areas Serviced */}
          {hasGeoData && (
            <div className="space-y-4">
              <h4 className={`text-sm font-bold uppercase tracking-wider ${titleClass}`}>Areas We Serve</h4>
              <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {neighborhoods.map((area, idx) => {
                  const name = typeof area === 'string' ? area : area.name;
                  const url = typeof area === 'string' ? defaultMapUrl(`${area} ${companyName}`) : area.mapUrl;
                  return (
                    <li key={idx}>
                      <a 
                        href={url}
                        target="_blank" 
                        rel="noopener noreferrer"
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

          {/* Column 4: Partner Network & Surrounding Cities */}
          <div className="space-y-8">
            {hasNetworkData && (
              <div className="space-y-4">
                <h4 className={`text-sm font-bold uppercase tracking-wider ${titleClass}`}>Partner Network</h4>
                <ul className="flex flex-col gap-y-2.5">
                  {networkLinks.map((link, idx) => (
                    <li key={idx}>
                      <a 
                        href={link.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`text-xs transition-colors ${hoverClass} underline decoration-indigo-500/30 hover:decoration-indigo-500 font-medium text-indigo-500/90`}
                      >
                        {link.anchor || link.label || 'Visit Partner'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasCityData && (
              <div className="space-y-4 pt-4 border-t border-slate-200/40">
                <h4 className={`text-sm font-bold uppercase tracking-wider ${titleClass}`}>Surrounding Cities</h4>
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {surroundingCities.map((city, idx) => (
                    <li key={idx}>
                      <a 
                        href={city.mapUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`text-sm transition-colors ${linkClass}`}
                      >
                        {city.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
}
