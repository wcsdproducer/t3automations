'use client';

import { useState } from 'react';
import { useUser, useFirestore, setDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Globe } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

export function CustomDomainManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [domainInput, setDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainToRemove, setDomainToRemove] = useState<string | null>(null);

  // Memoized so useCollection doesn't get a new ref on every render (infinite loop fix)
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
        description: `${domain} has been added. Configure the DNS records below to complete setup.`,
      });
    } catch (error) {
      console.error('Error adding domain', error);
      toast({
        title: 'Error',
        description: 'Failed to add custom domain. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!user || !firestore || !domainToRemove) return;

    try {
      const docRef = doc(firestore, `businessProfiles/${user.uid}/customDomains/${domainToRemove}`);
      await deleteDoc(docRef);
      toast({
        title: 'Domain Removed',
        description: 'The custom domain has been removed.',
      });
    } catch (error) {
      console.error('Error removing domain', error);
      toast({
        title: 'Error',
        description: 'Failed to remove custom domain.',
        variant: 'destructive',
      });
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
                {domains.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${d.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {d.status === 'active' ? <CheckCircle2 className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-lg">{d.domain}</p>
                        <p className="text-sm text-muted-foreground capitalize">Status: {d.status}</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDomainToRemove(d.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              {domains.some((d: any) => d.status === 'pending') && (
                <Alert>
                  <AlertTitle>DNS Configuration Required</AlertTitle>
                  <AlertDescription>
                    Your domain is pending verification. Add the DNS records in the table below at your domain registrar to verify ownership and route traffic.
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
