
'use client';
import { LandingPageManager } from '@/components/dashboard/landing-page-manager';

export default function LandingPageDashboardPage() {
  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Landing Page</h1>
      </div>
      <LandingPageManager />
    </>
  );
}
