'use client';

import React from 'react';

interface SharedFooterProps {
  businessProfileId?: string;
  companyName?: string;
  blogLink?: string;
  localSeoData?: {
    surroundingCities?: Array<{ name: string; mapUrl: string }>;
    neighborhoods?: Array<{ name: string; mapUrl: string }>;
    networkLinks?: Array<{ anchor: string; url: string }>;
  } | null;
  className?: string;
  theme?: 'light' | 'dark';
}

export function SharedFooter({
  businessProfileId = '',
  companyName = '',
  blogLink = '/blog',
  localSeoData = null,
  className = '',
  theme = 'light'
}: SharedFooterProps) {
  const isDark = theme === 'dark';
  
  const hasGeoData = localSeoData && (
    (localSeoData.surroundingCities && localSeoData.surroundingCities.length > 0) ||
    (localSeoData.neighborhoods && localSeoData.neighborhoods.length > 0)
  );
  const hasNetworkData = localSeoData && localSeoData.networkLinks && localSeoData.networkLinks.length > 0;

  const bgClass = isDark ? 'bg-slate-950 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-200/60 text-slate-500';
  const headingClass = isDark ? 'text-slate-200 font-bold' : 'text-slate-900 font-bold';
  const textClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const hoverClass = isDark ? 'hover:text-slate-200' : 'hover:text-slate-900';
  const borderClass = isDark ? 'border-slate-900' : 'border-slate-200';

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
            <div className="space-y-4 lg:col-span-1">
              <h4 className={`text-xs uppercase font-bold tracking-wider ${headingClass}`}>
                Areas Serviced
              </h4>
              <div className="flex flex-wrap gap-1.5 max-w-sm">
                {localSeoData.surroundingCities?.slice(0, 4).map((city, idx) => (
                  <a
                    key={`city-${idx}`}
                    href={city.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[10px] px-2 py-0.5 rounded bg-muted/65 border border-border/10 font-medium ${textClass} ${hoverClass} transition-all duration-200 hover:border-slate-400`}
                  >
                    {city.name}
                  </a>
                ))}
                {localSeoData.neighborhoods?.slice(0, 6).map((neigh, idx) => (
                  <a
                    key={`neigh-${idx}`}
                    href={neigh.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[10px] px-2 py-0.5 rounded bg-muted/65 border border-border/10 font-medium ${textClass} ${hoverClass} transition-all duration-200 hover:border-slate-400`}
                  >
                    {neigh.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Column 4: Partner Network (interlinking) */}
          {hasNetworkData && (
            <div className="space-y-4 lg:col-span-1">
              <h4 className={`text-xs uppercase font-bold tracking-wider ${headingClass}`}>
                Our Trusted Partners
              </h4>
              <ul className="space-y-2.5 text-xs">
                {localSeoData.networkLinks?.map((link, idx) => (
                  <li key={`net-${idx}`} className="truncate max-w-[260px]">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`transition-colors ${hoverClass} underline decoration-indigo-500/30 hover:decoration-indigo-500 font-medium text-indigo-500/90`}
                    >
                      {link.anchor}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
