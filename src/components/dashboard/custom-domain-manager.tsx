'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useFirestore, setDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';

import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Globe, AlertTriangle, RefreshCw, ShieldCheck, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ── Status config ──────────────────────────────────────────────────────────────
type DomainStatus = 'pending' | 'active' | 'misconfigured' | 'provisioning';

const STATUS_CONFIG: Record<DomainStatus, {
  label: string;
  badgeClass: string;
  icon: React.ReactNode;
  iconBg: string;
}> = {
  active: {
    label: 'Active',
    badgeClass: 'bg-green-500/15 text-green-400 border-green-500/30',
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconBg: 'bg-green-500/15 text-green-400',
  },
  provisioning: {
    label: 'Provisioning SSL',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: <ShieldCheck className="h-5 w-5" />,
    iconBg: 'bg-blue-500/15 text-blue-400',
  },
  pending: {
    label: 'Pending DNS',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: <Globe className="h-5 w-5" />,
    iconBg: 'bg-amber-500/15 text-amber-400',
  },
  misconfigured: {
    label: 'Misconfigured',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: <AlertTriangle className="h-5 w-5" />,
    iconBg: 'bg-red-500/15 text-red-400',
  },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as DomainStatus] ?? STATUS_CONFIG.pending;
}

export function CustomDomainManager() {
  const { user } = useUser();
  const params = useParams();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userIdSlug = params?.userId as string;
  const profileId = userIdSlug || user?.uid;

  const [domainInput, setDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainToRemove, setDomainToRemove] = useState<string | null>(null);
  const [checkingDomain, setCheckingDomain] = useState<string | null>(null);

  // Memoized so useCollection gets a stable ref — prevents infinite re-render loop
  const customDomainsRef = useMemoFirebase(() => {
    if (!profileId || !firestore) return null;
    return collection(firestore, `businessProfiles/${profileId}/customDomains`);
  }, [profileId, firestore]);

  const { data: domains, isLoading } = useCollection(customDomainsRef);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId || !firestore) return;

    let domain = domainInput.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '');
    domain = domain.replace(/\/.*$/, '');

    if (!domain || !domain.includes('.')) {
      toast({
        title: 'Invalid Domain',
        description: 'Please enter a valid domain name (e.g., mybusiness.com)',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = doc(firestore, `businessProfiles/${profileId}/customDomains/${domain}`);
      await setDocumentNonBlocking(docRef, {
        id: domain,
        businessProfileId: profileId,
        domain: domain,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }, { merge: true });
      setDomainInput('');
      toast({
        title: 'Domain Added',
        description: `${domain} has been added. Configure the DNS records below then click Check Status.`,
      });
    } catch (error) {
      console.error('Error adding domain', error);
      toast({ title: 'Error', description: 'Failed to add custom domain.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async (domain: string) => {
    if (!profileId) return;
    setCheckingDomain(domain);
    try {
      const res = await fetch('/api/check-domain-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, userId: profileId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Check failed');

      const cfg = getStatusConfig(data.status);
      toast({
        title: `${domain} — ${cfg.label}`,
        description: data.detail,
      });
    } catch (err: any) {
      toast({ title: 'Status check failed', description: err.message, variant: 'destructive' });
    } finally {
      setCheckingDomain(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!profileId || !firestore || !domainToRemove) return;
    try {
      const docRef = doc(firestore, `businessProfiles/${profileId}/customDomains/${domainToRemove}`);
      await deleteDoc(docRef);
      toast({ title: 'Domain Removed', description: 'The custom domain has been removed.' });
    } catch (error) {
      console.error('Error removing domain', error);
      toast({ title: 'Error', description: 'Failed to remove custom domain.', variant: 'destructive' });
    } finally {
      setDomainToRemove(null);
    }
  };


  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Custom Domains</CardTitle>
          <CardDescription>
            Connect a custom domain to host your landing page directly on your own URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {domains && domains.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Your Connected Domains</h3>
              <div className="grid gap-4">
                {domains.map((d: any) => {
                  const cfg = getStatusConfig(d.status);
                  const isChecking = checkingDomain === d.id;
                  return (
                    <div key={d.id} className="border rounded-xl bg-card overflow-hidden">
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className={`p-2 rounded-lg shrink-0 ${cfg.iconBg}`}>
                          {cfg.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-base truncate">{d.domain}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {d.lastCheckedAt
                              ? `Last checked: ${new Date(d.lastCheckedAt).toLocaleTimeString()}`
                              : 'Not checked yet'}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-xs font-medium shrink-0 ${cfg.badgeClass}`}>
                          {cfg.label}
                        </Badge>
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckStatus(d.id)}
                            disabled={isChecking}
                            className="h-8"
                          >
                            {isChecking
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                            {isChecking ? 'Checking…' : 'Check Status'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8"
                            onClick={() => setDomainToRemove(d.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      {/* DNS Settings Table for inactive/provisioning domains */}
                      {d.status !== 'active' && (
                        <div className="px-5 pb-5 pt-3 bg-muted/10 border-t border-border/20 space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-foreground">Required DNS Settings</h4>
                            <p className="text-xs text-muted-foreground">
                              Add these records at your domain registrar (e.g., Namecheap, GoDaddy) to connect your custom domain to T3 Automations.
                            </p>
                          </div>

                          <div className="overflow-x-auto rounded-lg border border-border/60 bg-slate-950/40">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-border/40 bg-muted/50 text-muted-foreground font-medium">
                                  <th className="p-3">Type</th>
                                  <th className="p-3">Host/Name</th>
                                  <th className="p-3">Value/Target</th>
                                  <th className="p-3 text-right">Copy</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/30">
                                {/* A Records */}
                                {(d.dnsRecords?.aRecords || ['35.219.200.4']).map((ip: string, idx: number) => (
                                  <tr key={`a-${idx}`} className="hover:bg-muted/10">
                                    <td className="p-3 font-mono font-bold text-slate-300">A</td>
                                    <td className="p-3 font-mono text-slate-300">@</td>
                                    <td className="p-3 font-mono text-white font-semibold">{ip}</td>
                                    <td className="p-3 text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                          navigator.clipboard.writeText(ip);
                                          toast({ title: 'Copied A Record!', description: ip });
                                        }}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}

                                {/* TXT Record */}
                                <tr className="hover:bg-muted/10">
                                  <td className="p-3 font-mono font-bold text-indigo-400">TXT</td>
                                  <td className="p-3 font-mono text-indigo-400">@</td>
                                  <td className="p-3 font-mono text-indigo-300 max-w-[200px] sm:max-w-xs md:max-w-md truncate" title={d.dnsRecords?.txtRecord || "Click 'Check Status' to load token"}>
                                    {d.dnsRecords?.txtRecord || (
                                      <span className="italic text-muted-foreground text-[10px]">
                                        [Click &apos;Check Status&apos; to load verification key]
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={!d.dnsRecords?.txtRecord}
                                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        if (d.dnsRecords?.txtRecord) {
                                          navigator.clipboard.writeText(d.dnsRecords.txtRecord);
                                          toast({ title: 'Copied TXT Record!', description: d.dnsRecords.txtRecord });
                                        }
                                      }}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </td>
                                </tr>

                                {/* CNAME Record */}
                                <tr className="hover:bg-muted/10">
                                  <td className="p-3 font-mono font-bold text-amber-400">CNAME</td>
                                  <td className="p-3 font-mono text-amber-400 max-w-[120px] truncate" title={d.dnsRecords?.cnameHost || "Click 'Check Status' to load"}>
                                    {d.dnsRecords?.cnameHost || (
                                      <span className="italic text-muted-foreground text-[10px]">
                                        [Click &apos;Check Status&apos; to load host]
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 font-mono text-amber-300 max-w-[200px] sm:max-w-xs md:max-w-md truncate" title={d.dnsRecords?.cnameValue || "Click 'Check Status' to load"}>
                                    {d.dnsRecords?.cnameValue || (
                                      <span className="italic text-muted-foreground text-[10px]">
                                        [Click &apos;Check Status&apos; to load target]
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={!d.dnsRecords?.cnameValue}
                                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        if (d.dnsRecords?.cnameValue) {
                                          navigator.clipboard.writeText(d.dnsRecords.cnameValue);
                                          toast({ title: 'Copied CNAME target!', description: d.dnsRecords.cnameValue });
                                        }
                                      }}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-[11px] text-slate-400 space-y-1">
                            <span className="font-semibold text-indigo-400 block text-xs">DNS Setup Guide:</span>
                            <p>
                              1. Log in to your domain registrar (e.g. Namecheap) and open DNS settings for <strong className="text-slate-300">{d.domain}</strong>.
                            </p>
                            <p>
                              2. Remove any conflicting A/TXT/CNAME records (such as host parking pages).
                            </p>
                            <p>
                              3. Add the records listed above exactly as shown. For the TXT record, host `@` and value `fah-claim=...`. For the CNAME record, host `_acme-challenge_...` and target ending in `.certificatemanager.goog.`.
                            </p>
                            <p>
                              4. Once DNS is added, click <strong className="text-slate-300">Check Status</strong> to verify and trigger SSL generation.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="e.g., aisalesrep.online"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="flex-1"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting || !domainInput}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Domain
              </Button>
            </form>
          )}

        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <AlertDialog open={!!domainToRemove} onOpenChange={(open) => { if (!open) setDomainToRemove(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Custom Domain</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{domainToRemove}</strong>? Your landing page will no longer be accessible at this domain. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmRemove}
            >
              Remove Domain
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
