
'use client';
import { LandingPageManager } from '@/components/dashboard/landing-page-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DnsRecords = () => {
  const { toast } = useToast();
  const records = [
    { type: 'A', name: '@', value: '151.101.1.195', purpose: 'Points your root domain to our servers.' },
    { type: 'A', name: '@', value: '151.101.65.195', purpose: 'Provides redundancy for your root domain.' },
    { type: 'CNAME', name: 'www', value: 'your-domain.com.', purpose: 'Redirects the "www" subdomain to your root domain.' },
    { type: 'TXT', name: '@', value: 'google-site-verification=...', purpose: 'Example for verifying domain ownership with services like Google.' },
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
          Note: DNS changes can take up to 48 hours to propagate. Your domain provider's support can assist you with adding these records. Replace "your-domain.com." with your actual domain name.
        </p>
      </CardContent>
    </Card>
  );
};


export default function LandingPageDashboardPage() {
  return (
    <>
      <LandingPageManager />
      <DnsRecords />
    </>
  );
}
