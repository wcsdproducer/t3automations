'use client';

import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { useUser } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const params = useParams();
  const router = useRouter();
  const userIdSlug = params.userId as string;

  React.useEffect(() => {
    // If not loading and user is not logged in, or the truncated user ID doesn't match the URL, redirect.
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.uid.slice(-12) !== userIdSlug) {
        // Redirect to the correct slug for the logged-in user.
        router.push(`/dashboard/${user.uid.slice(-12)}`);
      }
    }
  }, [user, isUserLoading, userIdSlug, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Also check if the slug matches before rendering the content.
  if (user.uid.slice(-12) !== userIdSlug) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">Welcome to your dashboard, {user.displayName || user.email}.</p>
        <p className='text-sm text-muted-foreground'>User ID: {user.uid}</p>
      </main>
      <Footer />
    </div>
  );
}
