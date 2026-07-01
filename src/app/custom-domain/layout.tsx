import React from 'react';
import { ForceLightMode } from '@/components/force-light-mode';

export default function CustomDomainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Script prevents flash of dark mode during SSR/initial load */}
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.remove('dark');` }} />
      {/* Component handles soft navigations and cleanup */}
      <ForceLightMode />
      {children}
    </>
  );
}
