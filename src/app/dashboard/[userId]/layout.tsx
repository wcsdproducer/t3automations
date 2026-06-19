'use client';

import React from 'react';
import pkg from '../../../../package.json';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { BusinessProfile } from '@/types/crm';
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
  CreditCard,
  ArrowLeft,
  LineChart
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
  const pathname = usePathname();
  const firestore = useFirestore();
  const userIdSlug = params.userId as string;
  
  const isMainDashboard = pathname === `/dashboard/${userIdSlug}` || pathname === `/dashboard/${userIdSlug}/`;

  const docRef = useMemoFirebase(() => {
    if (!userIdSlug) return null;
    return doc(firestore, 'businessProfiles', userIdSlug);
  }, [firestore, userIdSlug]);

  const userDocRef = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return doc(firestore, 'businessProfiles', user.uid);
  }, [firestore, user?.uid]);

  const { data: businessProfile, isLoading: isProfileLoading, error: profileError } = useDoc<BusinessProfile>(docRef);
  const { data: userProfile, isLoading: isUserDocLoading } = useDoc<BusinessProfile>(userDocRef);
  const isOwner = businessProfile ? businessProfile.ownerId === user?.uid : user?.uid ? user.uid.slice(-12) === userIdSlug : false;
  const isAdmin = userProfile?.IsAdmin === true;

  React.useEffect(() => {
    if (!isUserLoading && !isProfileLoading && !isUserDocLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (profileError) {
        console.error("No access to this site dashboard:", profileError);
        router.push('/dashboard');
        return;
      }

      if (!businessProfile) {
        // Fallback check for legacy match format
        if (!isAdmin && user.uid.slice(-12) !== userIdSlug) {
          console.warn("Access Denied (Fallback) - awaiting data:", { isAdmin, userIdSlug });
          // router.push('/dashboard'); // Temporarily disabled to debug
        }
        return;
      }

      const hasAccess = 
        isAdmin ||
        user.uid.slice(-12) === userIdSlug || 
        businessProfile.ownerId === user.uid || 
        businessProfile.currentRenterId === user.uid;

      if (!hasAccess) {
        console.warn("Access Denied details:", {
          isAdmin,
          uidMatch: user.uid.slice(-12) === userIdSlug,
          ownerMatch: businessProfile.ownerId === user.uid,
          renterMatch: businessProfile.currentRenterId === user.uid,
          userUid: user.uid,
          userIdSlug
        });
        // router.push('/dashboard'); // Temporarily disabled to debug
      }
    }
  }, [user, isUserLoading, businessProfile, isProfileLoading, userIdSlug, router, profileError, isAdmin, isUserDocLoading]);

  // If we shouldn't have access, show a debug screen instead of redirecting
  if (!isUserLoading && !isProfileLoading && !isUserDocLoading && user) {
    const hasAccess = 
        isAdmin ||
        user.uid.slice(-12) === userIdSlug || 
        businessProfile?.ownerId === user.uid || 
        businessProfile?.currentRenterId === user.uid;

    if (profileError || !businessProfile || !hasAccess) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied (Debug Info)</h1>
          <pre className="bg-slate-900 p-4 rounded text-sm overflow-auto max-w-2xl w-full text-slate-300">
            {JSON.stringify({
              userIdSlug,
              userUid: user.uid,
              isAdmin,
              hasProfileError: !!profileError,
              profileErrorMessage: profileError?.message,
              hasBusinessProfile: !!businessProfile,
              ownerId: businessProfile?.ownerId,
              currentRenterId: businessProfile?.currentRenterId
            }, null, 2)}
          </pre>
          <Button onClick={() => router.push('/dashboard')} className="mt-6">Return to Dashboard</Button>
        </div>
      );
    }
  }

  if (isUserLoading || isProfileLoading || isUserDocLoading || !user) {
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
              <div className="flex items-baseline gap-1.5">
                <span>T3 Automations</span>
                <span className="text-[10px] text-muted-foreground font-normal tracking-wide">v{pkg.version}</span>
              </div>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 lg:px-6 pt-4 pb-4 flex flex-col gap-3">
              {(isOwner || isAdmin) && (
                <Link href="/dashboard" className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Admin
                </Link>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-200 truncate" title={businessProfile?.businessName || 'Loading...'}>
                  {businessProfile?.businessName || 'Loading...'}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono tracking-wide">
                  Site ID: {userIdSlug.length > 12 ? userIdSlug.slice(0, 8) + '...' : userIdSlug}
                </span>
              </div>
              <a
                href={businessProfile?.websiteUrl || `/pages/${userIdSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors mt-1 w-fit bg-blue-950/40 border border-blue-900/60 px-2 py-1 rounded-md"
              >
                <Globe className="h-3 w-3" />
                <span>View Website ↗</span>
              </a>
            </div>
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
              <SidebarNavLink href={`/dashboard/${userIdSlug}`}>
                <LineChart className="h-4 w-4" />
                Analytics
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/calls`}>
                <BarChart className="h-4 w-4" />
                Calls
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/conversations`}>
                <MessageSquare className="h-4 w-4" />
                Conversations
              </SidebarNavLink>
              <SidebarNavLink href={`/dashboard/${userIdSlug}/leads`}>
                <Users className="h-4 w-4" />
                Leads
              </SidebarNavLink>
              {(isOwner || isAdmin) && (
                <>
                  <SidebarNavLink href={`/dashboard/${userIdSlug}/campaigns`}>
                    <Megaphone className="h-4 w-4" />
                    Campaigns
                  </SidebarNavLink>
                </>
              )}
              <SidebarNavLink href={`/dashboard/${userIdSlug}/calendar`}>
                <Book className="h-4 w-4" />
                Calendar & Booking
              </SidebarNavLink>
              {(isOwner || isAdmin) && (
                <>
                  <SidebarNavLink href={`/dashboard/${userIdSlug}/domains`}>
                    <Globe className="h-4 w-4" />
                    Domain Management
                  </SidebarNavLink>
                  <SidebarNavLink href={`/dashboard/${userIdSlug}/agent-settings`}>
                    <Cog className="h-4 w-4" />
                    AI Voice Agent
                  </SidebarNavLink>
                  <SidebarNavLink href={`/dashboard/${userIdSlug}/blog-seo`}>
                    <Book className="h-4 w-4" />
                    Blog & SEO
                  </SidebarNavLink>
                  <SidebarNavLink href={`/dashboard/${userIdSlug}/settings`}>
                    <Settings className="h-4 w-4" />
                    Company Details
                  </SidebarNavLink>
                </>
              )}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
      <div className="flex flex-col h-screen overflow-hidden">
        <main className={`flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 ${isMainDashboard ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
