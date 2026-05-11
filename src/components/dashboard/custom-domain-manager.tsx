'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, setDocumentNonBlocking, useCollection } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, CheckCircle2, Globe } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CustomDomainManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [domainInput, setDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customDomainsRef = user && firestore 
    ? collection(firestore, `businessProfiles/${user.uid}/customDomains`) 
    : null;

  const { data: domains, isLoading } = useCollection(customDomainsRef);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;
    
    // Basic domain validation
    let domain = domainInput.trim().toLowerCase();
    
    // Remove http/https
    domain = domain.replace(/^https?:\/\//, '');
    // Remove trailing slashes
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
        description: `${domain} has been added to your profile. Please configure your DNS settings.`,
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

  const handleDeleteDomain = async (domainId: string) => {
    if (!user || !firestore) return;
    
    try {
      const docRef = doc(firestore, `businessProfiles/${user.uid}/customDomains/${domainId}`);
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
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <Card className="mt-6">
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
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteDomain(d.id)} className="text-destructive">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
            {domains.some((d: any) => d.status === 'pending') && (
              <Alert>
                <AlertTitle>DNS Configuration Required</AlertTitle>
                <AlertDescription className="space-y-4 mt-2">
                  <p>Your domain is pending. Please configure the DNS records below in your domain registrar to verify ownership and route traffic.</p>
                  
                  <div className="bg-muted p-3 rounded-md text-sm font-mono space-y-2">
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                      <span className="font-semibold text-muted-foreground">Type</span>
                      <span>A</span>
                      
                      <span className="font-semibold text-muted-foreground">Name</span>
                      <span>@</span>
                      
                      <span className="font-semibold text-muted-foreground">Value</span>
                      <span>35.219.200.10</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md text-sm font-mono space-y-2">
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                      <span className="font-semibold text-muted-foreground">Type</span>
                      <span>A</span>
                      
                      <span className="font-semibold text-muted-foreground">Name</span>
                      <span>@</span>
                      
                      <span className="font-semibold text-muted-foreground">Value</span>
                      <span>35.219.200.6</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">Note: Remove any other A or CNAME records on this domain or subdomain. Changes can take up to 24 hours to propagate.</p>
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
  );
}
