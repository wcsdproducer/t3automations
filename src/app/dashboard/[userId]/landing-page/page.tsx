'use client';
import { LandingPageManager } from '@/components/dashboard/landing-page-manager';
import { CustomDomainManager } from '@/components/dashboard/custom-domain-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DnsRecords = () => {
  const { toast } = useToast();
  // These records are provided to you in the Firebase App Hosting Console when you register your domain.
  // The A record IP and TXT/CNAME values are unique per domain — the values below are examples.
  // Visit: https://console.firebase.google.com/project/studio-1410114603-9e1f6/apphosting → Studio backend → Settings → Domains
  const records = [
    { type: 'A', name: '@', value: '35.219.200.4', purpose: 'Points your root domain to Firebase App Hosting servers.' },
    { type: 'A', name: 'www', value: '35.219.200.4', purpose: 'Points the www subdomain to Firebase App Hosting servers.' },
    { type: 'TXT', name: '@', value: 'fah-claim=<your-unique-token>', purpose: 'Verifies ownership of your domain with Firebase App Hosting.' },
    { type: 'CNAME', name: '_acme-challenge_<unique-id>', value: '<unique-id>.9.authorize.certificatemanager.goog.', purpose: 'Required for Firebase to provision a free SSL certificate for your domain.' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: text,
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>DNS Records for Custom Domain</CardTitle>
        <CardDescription>
          To use your custom domain, add or update records in your domain registrar's DNS settings. Below are the required A records and common examples for CNAME and TXT records.
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
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.type}</TableCell>
                <TableCell className="font-mono">{record.name}</TableCell>
                <TableCell className="font-mono">{record.value}</TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">{record.purpose}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(record.value)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-sm text-muted-foreground mt-4">
          Note: DNS changes can take up to 48 hours to propagate. Your domain provider's support can assist you with adding these records. Replace "t3automations.com." with your actual domain name if applicable.
        </p>
      </CardContent>
    </Card>
  );
};

export default function LandingPageDashboardPage() {
  return (
    <>
      <LandingPageManager />
      <CustomDomainManager />
      <div id="dns-records">
        <DnsRecords />
      </div>
    </>
  );
}
