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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const mockUsage = [
    { id: 'u1', date: '2026-05-18T14:23:00Z', duration: 124, type: 'Inbound Call', charge: 0.15 },
    { id: 'u2', date: '2026-05-17T09:12:00Z', duration: 345, type: 'Inbound Call', charge: 0.45 },
    { id: 'u3', date: '2026-05-15T16:45:00Z', duration: 42, type: 'Inbound Call', charge: 0.05 },
    { id: 'u4', date: '2026-05-14T11:30:00Z', duration: 180, type: 'Inbound Call', charge: 0.22 },
  ];

  return (
    <div className="flex-1 space-y-4 md:space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Usage</h1>
        <p className="text-muted-foreground">Manage your subscription, payment methods, and view call usage.</p>
      </div>

      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="subscription">Subscription & Payment</TabsTrigger>
          <TabsTrigger value="usage">Usage & Charges</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="mt-6 space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Your default payment method used for monthly subscriptions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isActive ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background border rounded-md">
                        <div className="font-bold text-lg text-primary tracking-widest italic">STRIPE</div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Managed via Stripe Checkout</p>
                        <p className="text-xs text-muted-foreground">Secure payment processing</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-500/50">Active</Badge>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                    <p>No active payment method.</p>
                    <p className="text-xs mt-1">Upgrade to Pro to add a payment method via Stripe.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Calls This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Minutes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">11.5</div>
                <p className="text-xs text-muted-foreground">
                  Minutes consumed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Estimated Charges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.87</div>
                <p className="text-xs text-muted-foreground">
                  Pending for current billing cycle
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Call Usage History</CardTitle>
              <CardDescription>Detailed breakdown of inbound and outbound AI agent calls.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Charge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsage.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell className="font-medium">
                        {new Date(call.date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{call.type}</Badge>
                      </TableCell>
                      <TableCell>{formatDuration(call.duration)}</TableCell>
                      <TableCell className="text-right">${call.charge.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
