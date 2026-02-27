
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
    { type: 'A', host: '@', value: '151.101.1.195' },
    { type: 'A', host: '@', value: '151.101.65.195' },
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
          To point your own domain (e.g., yourbusiness.com) to this website, add the following A records in your domain registrar's DNS settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.host}</TableCell>
                <TableCell className="font-mono">{record.value}</TableCell>
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
          Note: DNS changes can take up to 48 hours to propagate. Your domain provider's support can assist you with adding these records.
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
