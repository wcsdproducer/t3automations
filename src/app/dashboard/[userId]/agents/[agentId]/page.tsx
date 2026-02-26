'use client';

import React from 'react';
import { useUser } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
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
  RefreshCw,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Badge } from '@/components/ui/badge';


const AgentSidebarNavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive?: boolean }) => {
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

const chartData = [
  { date: "Feb 20", latest: 1.2, previous: 1.0 },
  { date: "Feb 21", latest: 1.5, previous: 1.1 },
  { date: "Feb 22", latest: 1.3, previous: 1.4 },
  { date: "Feb 23", latest: 1.8, previous: 1.5 },
  { date: "Feb 24", latest: 1.6, previous: 1.7 },
  { date: "Feb 25", latest: 2.0, previous: 1.8 },
  { date: "Feb 26", latest: 1.9, previous: 2.1 },
]

const numberChartData = [
    { date: "Feb 20", latest: 1, previous: 0 },
    { date: "Feb 21", latest: 2, previous: 1 },
    { date: "Feb 22", latest: 1, previous: 1 },
    { date: "Feb 23", latest: 2, previous: 1 },
    { date: "Feb 24", latest: 1, previous: 2 },
    { date: "Feb 25", latest: 2, previous: 2 },
    { date: "Feb 26", latest: 2, previous: 2 },
]

const chartConfig = {
  latest: {
    label: "Latest",
    color: "hsl(var(--chart-1))",
  },
  previous: {
    label: "Previous",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function AgentDetailPage() {
  const { user, isUserLoading } = useUser();
  const params = useParams();
  const router = useRouter();
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
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/analytics`, label: 'Analytics', icon: <BarChart className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/conversations`, label: 'Conversations', icon: <MessageSquare className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/knowledge-base`, label: 'Knowledge Base', icon: <Database className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/topics`, label: 'Topics', icon: <Library className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/leads`, label: 'Leads', icon: <Users className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/campaigns`, label: 'Campaigns', icon: <Megaphone className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/settings`, label: 'Agent Settings', icon: <Cog className="h-4 w-4" /> },
    { href: `/dashboard/${userIdSlug}/agents/${agentId}/custom-menu`, label: 'Add Custom Menu', icon: <Plus className="h-4 w-4" /> },
  ];

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
                <AgentSidebarNavLink key={link.label} href={link.href} isActive={link.label === 'Analytics'}>
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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-lg font-semibold md:text-2xl shrink-0">Analytics</h1>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline"><LayoutGrid className="mr-2 h-4 w-4" /> Template</Button>
              <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Chart</Button>
              <Button>Edit Layout</Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Select defaultValue="last-7-days">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-90-days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center gap-2 shrink-0">
              <span>Updated Feb 26, 1:00 PM</span>
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader className="pb-2 flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Total Call Minutes</CardTitle>
                        <Badge variant="outline" className="text-destructive border-destructive font-semibold">-0%</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">0</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Call Minutes</CardTitle>
                        <CardDescription>The total number of minutes spent on calls each day</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                        <LineChart accessibilityLayer data={chartData} margin={{ top: 20, left: -10, right: 10, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend />
                        <Line dataKey="latest" type="monotone" stroke="var(--color-latest)" strokeWidth={2} dot={false} />
                        <Line dataKey="previous" type="monotone" stroke="var(--color-previous)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Reason Call Ended</CardTitle>
                        <CardDescription>Calls aggregated by reason of why the call ended or completed</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-[200px]">
                        <p className="text-sm text-muted-foreground">Not enough data to display.</p>
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col gap-6">
                 <Card>
                    <CardHeader className="pb-2 flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Number of Calls</CardTitle>
                        <Badge variant="outline" className="text-destructive border-destructive font-semibold">-0%</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">0</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Number of Calls</CardTitle>
                        <CardDescription>The total number of calls made each day</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                        <LineChart accessibilityLayer data={numberChartData} margin={{ top: 20, left: -10, right: 10, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend />
                        <Line dataKey="latest" type="monotone" stroke="var(--color-latest)" strokeWidth={2} dot={false} />
                        <Line dataKey="previous" type="monotone" stroke="var(--color-previous)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-2 flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                            <Badge variant="outline" className="text-destructive border-destructive font-semibold">-0%</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">0</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium">Average Interactions</CardTitle>
                             <Badge variant="outline" className="text-destructive border-destructive font-semibold">-0%</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">0</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
