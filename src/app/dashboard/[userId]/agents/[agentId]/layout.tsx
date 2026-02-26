'use client';

import React from 'react';
import { useUser } from '@/firebase';
import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  BarChart,
  Cog,
  Database,
  LayoutGrid,
  Library,
  LogOut,
  Megaphone,
  MessageSquare,
  Plus,
  Shield,
  User as UserIcon,
  Users,
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

const AgentSidebarNavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive?: boolean }) => {
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
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 justify-start w-full px-3 py-2 text-left h-auto">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
            <AvatarFallback>{user?.displayName?.[0] || 'A'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-foreground">Solar London</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Solar London</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Cog className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/login')}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function AgentDetailLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const userIdSlug = params.userId as string;
  const agentId = params.agentId as string;

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const navLinks = [
    { href: `/dashboard/${userIdSlug}/agents/${agentId}`, label: 'Analytics', icon: <BarChart className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/conversations`, label: 'Conversations', icon: <MessageSquare className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/knowledge-base`, label: 'Knowledge Base', icon: <Database className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/topics`, label: 'Topics', icon: <Library className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/leads`, label: 'Leads', icon: <Users className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/campaigns`, label: 'Campaigns', icon: <Megaphone className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/settings`, label: 'Agent Settings', icon: <Cog className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/custom-menu`, label: 'Add Custom Menu', icon: <Plus className="h-4 w-4" /> },
  ];

  // The analytics page is the root page for an agent, so its href is just the agentId.
  const isAnalyticsActive = pathname === `/dashboard/${userIdSlug}/agents/${agentId}`;

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
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href={`/dashboard/${userIdSlug}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Agents
              </Link>
              {navLinks.map((link) => (
                <AgentSidebarNavLink 
                    key={link.label} 
                    href={link.href} 
                    isActive={link.href === `/dashboard/${userIdSlug}/agents/${agentId}` ? isAnalyticsActive : pathname.startsWith(link.href)}
                >
                  {link.icon}
                  {link.label}
                </AgentSidebarNavLink>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  );
}
