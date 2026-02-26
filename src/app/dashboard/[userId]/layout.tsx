'use client';

import React from 'react';
import { useUser, useAuth } from '@/firebase';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {
  Settings,
  Shield,
  Workflow,
  LogOut,
  User as UserIcon,
  Phone,
  LayoutGrid,
  LayoutTemplate,
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
              <SidebarNavLink href={`/dashboard/${userIdSlug}`}>
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
              <SidebarNavLink href={`/dashboard/${userIdSlug}/landing-page`}>
                <LayoutTemplate className="h-4 w-4" />
                Landing Page
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
          {children}
        </main>
      </div>
    </div>
  );
}
