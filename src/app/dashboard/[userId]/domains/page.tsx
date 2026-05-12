'use client';
import { CustomDomainManager } from '@/components/dashboard/custom-domain-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─────────────────────────────────────────────────────────────────────────────
// DNS Records Guide
// ─────────────────────────────────────────────────────────────────────────────
// These values are provided by Firebase App Hosting when you register a custom
// domain. The A record IP and TXT/CNAME values are unique per domain.
// Visit the Firebase Console: App Hosting → Studio backend → Settings → Domains
// ─────────────────────────────────────────────────────────────────────────────
const DnsRecords = () => {
  const { toast } = useToast();
  const records = [
    {
      type: 'A',
      name: '@',
      value: '35.219.200.4',
      purpose: 'Points your root domain to our hosting servers.',
    },
    {
      type: 'A',
      name: 'www',
      value: '35.219.200.4',
      purpose: 'Points the www subdomain to our hosting servers.',
    },
    {
      type: 'TXT',
      name: '@',
      value: 'fah-claim=002-02-21ed7fd1-4793-4b5e-83f0-c232085d9cc4',
      purpose: 'Verifies ownership of your domain.',
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: text });
  };

  return (
    <Card id="dns-records" className="mt-6">
      <CardHeader>
        <CardTitle>DNS Records for Custom Domain</CardTitle>
        <CardDescription>
          Add these records at your domain registrar to connect your custom domain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name/Host</TableHead>
              <TableHead>Value/Target</TableHead>
              <TableHead className="hidden md:table-cell">Purpose</TableHead>
              <TableHead className="text-right">Copy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono text-xs py-2">{record.type}</TableCell>
                <TableCell className="font-mono text-xs py-2">{record.name}</TableCell>
                <TableCell className="font-mono text-xs py-2">{record.value}</TableCell>
                <TableCell className="text-muted-foreground text-sm hidden md:table-cell py-2">
                  {record.purpose}
                </TableCell>
                <TableCell className="text-right py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(record.value)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-sm text-muted-foreground mt-4">
          DNS changes can take up to 48 hours to propagate globally. Your SSL certificate will be
          automatically provisioned and renewed once the TXT and CNAME records verify.
        </p>
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Domains Page
// ─────────────────────────────────────────────────────────────────────────────
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
      <DnsRecords />
    </div>
  );
}
