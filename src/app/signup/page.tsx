'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,29.805,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );

export default function SignupPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [businessName, setBusinessName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.push(`/dashboard/${user.uid.slice(-12)}`);
    }
  }, [user, isUserLoading, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      if (newUser) {
        const businessProfileRef = doc(firestore, 'businessProfiles', newUser.uid);
        const businessProfileData = {
          id: newUser.uid,
          businessName,
          contactEmail: email,
          phoneNumber,
        };
        setDocumentNonBlocking(businessProfileRef, businessProfileData, {});
        // The onAuthStateChanged listener will handle the redirect to the dashboard
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleGoogleSignIn = () => {
    initiateGoogleSignIn(auth, firestore, (err) => setError(err.message));
  };


  if (isUserLoading || user) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 py-12">
      <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>Create an account to get started.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
          <form onSubmit={handleSignUp}>
            <div className="grid gap-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Acme Inc."
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
             <div className="grid gap-2 mt-4">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="(123) 456-7890"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            <Button className="w-full mt-6">Sign up</Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Google
            </Button>
          </CardContent>
          <CardFooter className="flex-col gap-4">
             <div className="text-sm text-center">
                Already have an account? <Link href="/login" className='underline'>Log in</Link>
            </div>
          </CardFooter>
      </Card>
    </div>
  );
}
