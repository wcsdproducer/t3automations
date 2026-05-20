'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { initiateEmailSignIn, initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import Link from 'next/link';
import TranslatedText from '@/components/TranslatedText';
import { Suspense } from 'react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,29.805,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

function LoginForm() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rentSite = searchParams.get('rentSite');
  const rentPrice = searchParams.get('price');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [redirecting, setRedirecting] = React.useState(false);

  const handleRedirectToCheckout = React.useCallback(async (siteId: string, userEmail: string, uid: string, price: string) => {
    try {
      setRedirecting(true);
      setError(null);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: siteId,
          userEmail: userEmail,
          renterId: uid,
          price: price ? Number(price) : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Checkout redirect error:', err);
      setError(err.message || 'Could not redirect to payment. Please contact support.');
      setRedirecting(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isUserLoading && user) {
      if (rentSite) {
        handleRedirectToCheckout(rentSite, user.email || '', user.uid, rentPrice || '');
      } else {
        router.push(`/dashboard`);
      }
    }
  }, [user, isUserLoading, router, rentSite, rentPrice, handleRedirectToCheckout]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    initiateEmailSignIn(auth, email, password, (err) => setError(err.message));
  };
  
  const handleGoogleSignIn = () => {
    initiateGoogleSignIn(auth, firestore, (err) => setError(err.message));
  };

  if (isUserLoading || user || redirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
        <p className="mt-4 text-muted-foreground text-sm font-medium">
          {redirecting ? <TranslatedText>Redirecting to secure payment checkout...</TranslatedText> : <TranslatedText>Loading...</TranslatedText>}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0f19] px-4">
      <Card className="w-full max-w-sm bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-white font-extrabold tracking-tight">
            {rentSite ? (
              <span><TranslatedText>Login to Lease Site</TranslatedText></span>
            ) : (
              <span><TranslatedText>Login</TranslatedText></span>
            )}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {rentSite ? (
              <span><TranslatedText>Log in to proceed with your lease request.</TranslatedText></span>
            ) : (
              <span><TranslatedText>Enter your credentials to access your account.</TranslatedText></span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSignIn}>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-355"><TranslatedText>Email Address</TranslatedText></Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              />
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor="password" className="text-slate-355"><TranslatedText>Password</TranslatedText></Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all">
              {rentSite ? <TranslatedText>Log in & Continue</TranslatedText> : <TranslatedText>Sign in</TranslatedText>}
            </Button>
          </form>
          
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500"><TranslatedText>Or continue with</TranslatedText></span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full border-slate-850 hover:bg-slate-800 hover:text-white" onClick={handleGoogleSignIn}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            <TranslatedText>Google</TranslatedText>
          </Button>
        </CardContent>
        <CardFooter className="flex-col gap-4 border-t border-slate-850 pt-4">
          <div className="text-sm text-center text-slate-400">
            <TranslatedText>Don&apos;t have an account?</TranslatedText>{' '}
            <Link href={rentSite ? `/signup?rentSite=${rentSite}&price=${rentPrice}` : '/signup'} className="underline text-indigo-400 hover:text-indigo-300">
              <TranslatedText>Sign up</TranslatedText>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0f19]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
        <p className="mt-4 text-slate-400 text-sm font-medium"><TranslatedText>Loading login details...</TranslatedText></p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
