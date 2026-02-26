'use client';

import React from 'react';
import { useUser } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const params = useParams();
  const router = useRouter();
  const userIdSlug = params.userId as string;

  React.useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.uid.slice(-12) !== userIdSlug) {
        router.push(`/dashboard/${user.uid.slice(-12)}`);
      }
    }
  }, [user, isUserLoading, userIdSlug, router]);

  if (isUserLoading || !user || user.uid.slice(-12) !== userIdSlug) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Agents</h1>
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search..." className="w-full pl-8 md:w-1/3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="relative group">
            <Image
              src="https://picsum.photos/seed/1/600/400"
              alt="Appointment Booking Agent"
              width={600}
              height={400}
              className="rounded-t-lg object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg">
              <Link href={`/dashboard/${userIdSlug}/agents/solar-london`}>
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                  View Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold">Solar London</h3>
            <p className="text-sm text-muted-foreground">Last Edited Dec 6, 2025</p>
          </div>
        </Card>
      </div>
    </>
  );
}
