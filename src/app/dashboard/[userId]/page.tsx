'use client';

import React from 'react';
import { useUser, useAuth } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Shield,
  Workflow,
  LogOut,
  User as UserIcon,
  Phone,
  LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

const SidebarNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isActive = currentPath.startsWith(href);

  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
          isActive ? 'bg-muted text-primary' : ''
        }`}
      >
        {children}
      </div>
    </Link>
  );
};

const UserProfileDropdown = () => {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 justify-start w-full px-3 py-2 text-left h-auto">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
            <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{user?.displayName || 'User'}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


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
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Shield className="h-6 w-6 text-primary" />
              <span className="">Agents</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <SidebarNavLink href={`/dashboard/${userIdSlug}/agents`}>
                <LayoutGrid className="h-4 w-4" />
                Agents
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/workflows`}>
                <Workflow className="h-4 w-4" />
                Workflows
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/phonenumbers`}>
                <Phone className="h-4 w-4" />
                Phone Numbers
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/custom-menu`}>
                <Plus className="h-4 w-4" />
                Add Custom Menu
              </SidebarNavLink>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
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
        </main>
      </div>
    </div>
  );
}
