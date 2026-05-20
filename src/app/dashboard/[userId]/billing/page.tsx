'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, CreditCard, Plus, RefreshCw } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
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
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentMethodInfo {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

// ─── Payment Form Component (inside Elements provider) ───
function PaymentForm({ 
  onSuccess, 
  onCancel 
}: { 
  onSuccess: (pmId: string) => void; 
  onCancel: () => void; 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An error occurred.');
      setIsProcessing(false);
    } else if (setupIntent && setupIntent.status === 'succeeded') {
      const pmId = typeof setupIntent.payment_method === 'string' 
        ? setupIntent.payment_method 
        : setupIntent.payment_method?.id || '';
      onSuccess(pmId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={!stripe || isProcessing} className="flex-1">
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Card
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function BillingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const params = useParams();
  const siteSlug = params.userId as string;
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodInfo | null>(null);
  const [isLoadingPM, setIsLoadingPM] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);

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
      if (!user || !siteSlug) return;
      try {
        const docRef = doc(db, 'businessProfiles', siteSlug);
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
  }, [user, db, siteSlug]);

  // Fetch saved payment method
  const fetchPaymentMethod = useCallback(async () => {
    if (!user || !siteSlug) return;
    setIsLoadingPM(true);
    try {
      const res = await fetch(`/api/stripe/payment-method?userId=${siteSlug}`);
      const data = await res.json();
      setPaymentMethod(data.paymentMethod || null);
    } catch (error) {
      console.error('Error fetching payment method:', error);
    } finally {
      setIsLoadingPM(false);
    }
  }, [user, siteSlug]);

  useEffect(() => {
    fetchPaymentMethod();
  }, [fetchPaymentMethod]);

  const handleSubscribe = async () => {
    if (!user || !siteSlug) return;
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: siteSlug,
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

  const handleAddPaymentMethod = async () => {
    if (!user || !siteSlug) return;
    setIsCreatingIntent(true);
    try {
      const res = await fetch('/api/stripe/setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: siteSlug }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentForm(true);
      } else {
        throw new Error(data.error || 'Failed to create setup intent');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    if (!user || !siteSlug) return;
    try {
      // Attach and set as default
      const res = await fetch('/api/stripe/payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: siteSlug,
          paymentMethodId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMethod(data.paymentMethod);
        setShowPaymentForm(false);
        setClientSecret(null);
        toast({
          title: 'Card Saved',
          description: `Card ending in ${data.paymentMethod.last4} has been saved.`,
        });
      } else {
        throw new Error(data.error || 'Failed to save payment method');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const brandDisplay = (brand: string) => {
    const brands: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
      diners: 'Diners Club',
      jcb: 'JCB',
      unionpay: 'UnionPay',
    };
    return brands[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
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
                  Your saved payment method for subscriptions and services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPM ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : showPaymentForm && clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#f97316' } } }}>
                    <PaymentForm 
                      onSuccess={handlePaymentSuccess}
                      onCancel={() => { setShowPaymentForm(false); setClientSecret(null); }}
                    />
                  </Elements>
                ) : paymentMethod ? (
                  <>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-background border rounded-md">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {brandDisplay(paymentMethod.brand)} •••• {paymentMethod.last4}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Expires {String(paymentMethod.expMonth).padStart(2, '0')}/{paymentMethod.expYear}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-500 border-green-500/50">Default</Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleAddPaymentMethod}
                      disabled={isCreatingIntent}
                    >
                      {isCreatingIntent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Update Payment Method
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">No payment method on file</p>
                      <p className="text-xs text-muted-foreground mt-1">Add a card to enable phone number purchases and subscriptions.</p>
                    </div>
                    <Button 
                      onClick={handleAddPaymentMethod}
                      disabled={isCreatingIntent}
                      size="sm"
                    >
                      {isCreatingIntent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      Add Payment Method
                    </Button>
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
