'use client';

import { CustomDomainManager } from '@/components/dashboard/custom-domain-manager';

export default function DomainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Domain Management</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Connect a custom domain to your landing page so visitors can find you at your own URL.
        </p>
      </div>
      <CustomDomainManager />
    </div>
  );
}
