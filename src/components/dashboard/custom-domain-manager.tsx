'use client';

import { useState } from 'react';
import { useUser, useFirestore, setDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Globe, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
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
  const firestore = useFirestore();
  const { toast } = useToast();

  const [domainInput, setDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainToRemove, setDomainToRemove] = useState<string | null>(null);
  const [checkingDomain, setCheckingDomain] = useState<string | null>(null);

  // Memoized so useCollection gets a stable ref — prevents infinite re-render loop
  const customDomainsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `businessProfiles/${user.uid}/customDomains`);
  }, [user, firestore]);

  const { data: domains, isLoading } = useCollection(customDomainsRef);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

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
      const docRef = doc(firestore, `businessProfiles/${user.uid}/customDomains/${domain}`);
      await setDocumentNonBlocking(docRef, {
        id: domain,
        businessProfileId: user.uid,
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
    if (!user) return;
    setCheckingDomain(domain);
    try {
      const res = await fetch('/api/check-domain-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, userId: user.uid }),
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
    if (!user || !firestore || !domainToRemove) return;
    try {
      const docRef = doc(firestore, `businessProfiles/${user.uid}/customDomains/${domainToRemove}`);
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
              <div className="grid gap-3">
                {domains.map((d: any) => {
                  const cfg = getStatusConfig(d.status);
                  const isChecking = checkingDomain === d.id;
                  return (
                    <div key={d.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${cfg.iconBg}`}>
                          {cfg.icon}
                        </div>
                        <div>
                          <p className="font-medium text-base">{d.domain}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={`text-xs font-medium ${cfg.badgeClass}`}>
                              {cfg.label}
                            </Badge>
                            {d.lastCheckedAt && (
                              <span className="text-xs text-muted-foreground">
                                Checked {new Date(d.lastCheckedAt).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckStatus(d.id)}
                          disabled={isChecking}
                        >
                          {isChecking
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                          {isChecking ? 'Checking…' : 'Check Status'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDomainToRemove(d.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {domains.some((d: any) => d.status !== 'active') && (
                <Alert>
                  <AlertTitle>DNS Configuration Required</AlertTitle>
                  <AlertDescription>
                    One or more domains are not yet active. Add the DNS records in the table below at your domain registrar, then click <strong>Check Status</strong> to verify.
                  </AlertDescription>
                </Alert>
              )}
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
