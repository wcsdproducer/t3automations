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

  return (
    <Card id="dns-records" className="mt-6 border-slate-800 bg-slate-900/40">
      <CardHeader>
        <CardTitle className="text-white">DNS Records for Custom Domain</CardTitle>
        <CardDescription className="text-slate-400">
          Add these records at your domain registrar to connect your custom domain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning / Alert Banner */}
        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-slate-300 text-sm">
          <p className="font-semibold text-indigo-400 mb-1">Important Domain Verification Note:</p>
          <p>
            While the <strong>A Records</strong> are globally correct for T3 Automations (<code className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs text-white">35.219.200.4</code>), the <strong>TXT Record</strong> is a template. You must retrieve your domain's unique verification code (<code className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs text-white">fah-claim=...</code>) from the Firebase Console:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1 text-slate-400">
            <li>Open the Firebase Console for project <code className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs text-white">studio-1410114603-9e1f6</code>.</li>
            <li>Go to <strong>App Hosting</strong> → Select the <strong>Studio</strong> backend → <strong>Settings</strong> → <strong>Domains</strong>.</li>
            <li>Add your custom domain to generate your unique TXT verification key.</li>
          </ol>
        </div>

        <Table>
          <TableHeader className="border-slate-800">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Type</TableHead>
              <TableHead className="text-slate-400">Name/Host</TableHead>
              <TableHead className="text-slate-400">Value/Target</TableHead>
              <TableHead className="text-slate-400 hidden md:table-cell">Purpose</TableHead>
              <TableHead className="text-slate-400 text-right">Copy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-slate-800 hover:bg-slate-900/20">
              <TableCell className="font-mono text-xs py-3 text-slate-300">A</TableCell>
              <TableCell className="font-mono text-xs py-3 text-slate-300">@</TableCell>
              <TableCell className="font-mono text-xs py-3 text-white font-semibold">35.219.200.4</TableCell>
              <TableCell className="text-slate-400 text-sm hidden md:table-cell py-3">
                Points your root domain to our hosting servers.
              </TableCell>
              <TableCell className="text-right py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-white"
                  onClick={() => {
                    navigator.clipboard.writeText('35.219.200.4');
                    toast({ title: 'Copied A Record IP!', description: '35.219.200.4' });
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow className="border-slate-800 hover:bg-slate-900/20">
              <TableCell className="font-mono text-xs py-3 text-slate-300">A</TableCell>
              <TableCell className="font-mono text-xs py-3 text-slate-300">www</TableCell>
              <TableCell className="font-mono text-xs py-3 text-white font-semibold">35.219.200.4</TableCell>
              <TableCell className="text-slate-400 text-sm hidden md:table-cell py-3">
                Points the www subdomain to our hosting servers.
              </TableCell>
              <TableCell className="text-right py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-white"
                  onClick={() => {
                    navigator.clipboard.writeText('35.219.200.4');
                    toast({ title: 'Copied CNAME/A value!', description: '35.219.200.4' });
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow className="border-slate-800 hover:bg-slate-900/20 bg-indigo-500/5">
              <TableCell className="font-mono text-xs py-3 text-indigo-400">TXT</TableCell>
              <TableCell className="font-mono text-xs py-3 text-indigo-400">@</TableCell>
              <TableCell className="font-mono text-xs py-3 text-indigo-300 font-mono italic">
                [Unique fah-claim verification token from Firebase Console]
              </TableCell>
              <TableCell className="text-slate-400 text-sm hidden md:table-cell py-3">
                Verifies domain ownership. Retrieve from App Hosting Console.
              </TableCell>
              <TableCell className="text-right py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-white"
                  onClick={() => {
                    toast({
                      title: 'How to Copy Unique TXT Record',
                      description: 'Please open Firebase App Hosting Console to retrieve your unique TXT record.',
                      variant: 'destructive'
                    });
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <p className="text-sm text-slate-400 mt-4">
          DNS changes can take up to 48 hours to propagate globally. Your SSL certificate will be
          automatically provisioned and renewed once the TXT and A records verify.
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
