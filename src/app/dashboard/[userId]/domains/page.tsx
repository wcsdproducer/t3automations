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
      value: '35.219.200.10',
      purpose: 'Points your root domain to Firebase App Hosting servers.',
    },
    {
      type: 'A',
      name: '@',
      value: '35.219.200.6',
      purpose: 'Points your root domain to Firebase App Hosting servers.',
    },
    {
      type: 'A',
      name: 'www',
      value: '35.219.200.10',
      purpose: 'Points the www subdomain to Firebase App Hosting servers.',
    },
    {
      type: 'A',
      name: 'www',
      value: '35.219.200.6',
      purpose: 'Points the www subdomain to Firebase App Hosting servers.',
    },
    {
      type: 'TXT',
      name: '@',
      value: 'fah-claim=<your-unique-token>',
      purpose: 'Verifies ownership of your domain with Firebase App Hosting.',
    },
    {
      type: 'CNAME',
      name: '_acme-challenge_<unique-id>',
      value: '<unique-id>.9.authorize.certificatemanager.goog.',
      purpose: 'Required for Firebase to provision a free SSL certificate for your domain.',
    },
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
          Add these records at your domain registrar after registering your domain in{' '}
          <a
            href="https://console.firebase.google.com/project/studio-1410114603-9e1f6/apphosting"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Firebase App Hosting
          </a>
          . The exact TXT and CNAME values are provided there — the placeholders below show the format.
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
                <TableCell className="font-mono text-xs">{record.type}</TableCell>
                <TableCell className="font-mono text-xs">{record.name}</TableCell>
                <TableCell className="font-mono text-xs">{record.value}</TableCell>
                <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                  {record.purpose}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(record.value)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-sm text-muted-foreground mt-4">
          DNS changes can take up to 48 hours to propagate globally. Firebase automatically
          provisions and renews your SSL certificate once the TXT and CNAME records verify.
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
