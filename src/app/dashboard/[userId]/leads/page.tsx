import { LeadsManager } from '@/components/dashboard/leads-manager';

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Leads (CRM)</h1>
      </div>
      <LeadsManager />
    </div>
  );
}
