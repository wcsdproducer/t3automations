'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, CreditCard } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function BillingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success) {
      toast({
        title: 'Payment Successful',
        description: 'Your subscription is now active!',
      });
    }

    if (canceled) {
      toast({
        title: 'Payment Canceled',
        description: 'You canceled the checkout process.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'businessProfiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSubscriptionStatus(docSnap.data().subscriptionStatus || 'inactive');
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [user, db]);

  const handleSubscribe = async () => {
    if (!user) return;
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Error',
        description: error.message,
        variant: 'destructive',
      });
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isActive = subscriptionStatus === 'active';

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the {isActive ? 'Pro' : 'Free'} plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">T3 Automations Pro</h3>
                <div className="flex items-center gap-2 mt-1">
                  {isActive ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white border-transparent">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">$1497.00 / month</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium">Plan includes:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Dedicated AI phone number
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Unlimited inbound/outbound minutes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Premium 24/7 AI Voice Agent
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Full CRM access & integrations
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 py-4">
            {!isActive && (
              <Button onClick={handleSubscribe} disabled={checkoutLoading} className="w-full">
                {checkoutLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Upgrade to Pro
              </Button>
            )}
            {isActive && (
              <p className="text-sm text-muted-foreground w-full text-center">
                Your subscription is active and managing your business.
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
