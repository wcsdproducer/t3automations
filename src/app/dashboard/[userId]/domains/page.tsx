'use client';

import { SiteLauncher } from '@/components/dashboard/site-launcher';

export default function DomainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Website Launch Control Center</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Handle domain mapping, live DNS resolution, Google verification, Search Console indexing, dynamic schemas, and blog content scheduling.
        </p>
      </div>
      <SiteLauncher />
    </div>
  );
}
