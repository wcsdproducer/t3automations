'use client';

import React from 'react';
import pkg from '../../../../package.json';
import { useUser, useAuth } from '@/firebase';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {
  Settings,
  Shield,
  Globe,
  LogOut,
  User as UserIcon,
  Phone,
  LayoutGrid,
  LayoutTemplate,
  Book,
  BarChart,
  MessageSquare,
  Megaphone,
  Cog,
  Users,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const SidebarNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
        isActive ? 'bg-muted text-primary' : ''
      }`}
    >
      {children}
    </Link>
  );
};

const UserProfileDropdown = () => {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const params = useParams();
  const userIdSlug = params.userId as string;

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
        <DropdownMenuItem onClick={() => router.push(`/dashboard/${userIdSlug}/settings`)}>
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    <div className="grid h-screen w-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-background md:flex md:flex-col h-screen sticky top-0">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Shield className="h-6 w-6 text-primary" />
              <div className="flex flex-col">
                <span className="">T3 Automations</span>
                <span className="text-[10px] text-muted-foreground leading-none font-normal tracking-wide uppercase mt-1">
                  v{pkg.version} • ID: {user.uid.slice(-6)}
                </span>
              </div>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 space-y-1">
              <SidebarNavLink href={`/dashboard/${userIdSlug}`}>
                <BarChart className="h-4 w-4" />
                Analytics
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/conversations`}>
                <MessageSquare className="h-4 w-4" />
                Conversations
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/leads`}>
                <Users className="h-4 w-4" />
                Leads
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/campaigns`}>
                <Megaphone className="h-4 w-4" />
                Campaigns
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/calendar`}>
                <Book className="h-4 w-4" />
                Calendar & Booking
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/landing-page`}>
                <LayoutTemplate className="h-4 w-4" />
                Landing Page Editor
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/domains`}>
                <Globe className="h-4 w-4" />
                Domain Management
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/agent-settings`}>
                <Cog className="h-4 w-4" />
                AI Voice Agent
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/settings`}>
                <Settings className="h-4 w-4" />
                Company Details
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/billing`}>
                <CreditCard className="h-4 w-4" />
                Billing
              </SidebarNavLink>
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
      <div className="flex flex-col h-screen overflow-y-auto">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
