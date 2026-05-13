'use client';

import React from 'react';
import {
  LayoutGrid,
  Plus,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { CallLog } from '@/types/crm';
import { useParams } from 'next/navigation';
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

export default function AgentAnalyticsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const userIdSlug = params.userId as string;

  const [period, setPeriod] = React.useState('last-7-days');

  const agentsRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid.slice(-12) !== userIdSlug) return null;
    return query(collection(firestore, `businessProfiles/${user.uid}/agents`));
  }, [user, firestore, userIdSlug]);

  const { data: agentsData, isLoading: isAgentsLoading } = useCollection(agentsRef);
  const agentId = agentsData?.[0]?.id;

  const callsRef = useMemoFirebase(() => {
    if (!user || !firestore || !agentId || user.uid.slice(-12) !== userIdSlug) return null;
    return query(
      collection(firestore, `businessProfiles/${user.uid}/agents/${agentId}/conversations`),
      orderBy('startedAt', 'asc')
    );
  }, [user, firestore, userIdSlug, agentId]);

  const { data: callsData, isLoading: isCallsLoading } = useCollection(callsRef);

  if (isAgentsLoading || isCallsLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const calls = (callsData || []) as CallLog[];

  const dailyStats: Record<string, { calls: number, minutes: number }> = {};
  let totalCalls = 0;
  let totalMinutes = 0;
  let leadsCaptured = 0;

  calls.forEach(call => {
    const dateObj = new Date(call.startedAt);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (!dailyStats[dateStr]) {
      dailyStats[dateStr] = { calls: 0, minutes: 0 };
    }
    
    dailyStats[dateStr].calls += 1;
    dailyStats[dateStr].minutes += call.duration / 60;
    
    totalCalls += 1;
    totalMinutes += call.duration / 60;
    if (call.leadCaptured) {
      leadsCaptured += 1;
    }
  });

  const averageDuration = totalCalls > 0 ? Math.round(totalMinutes / totalCalls) : 0;

  const numDays = period === 'last-30-days' ? 30 : period === 'last-90-days' ? 90 : 7;
  
  // Keep the last X days from today
  const now = new Date();
  const dateRange: string[] = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dateRange.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  const dynamicChartData = dateRange.map(date => ({
    date,
    latest: dailyStats[date] ? Math.round(dailyStats[date].minutes * 10) / 10 : 0,
    previous: 0 
  }));

  const dynamicNumberChartData = dateRange.map(date => ({
    date,
    latest: dailyStats[date] ? dailyStats[date].calls : 0,
    previous: 0 
  }));

  return (
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
        <Select value={period} onValueChange={setPeriod}>
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
          <span>Updated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
          <RefreshCw className="h-4 w-4" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{totalCalls}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Call Minutes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{Math.round(totalMinutes)}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Leads Captured</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{leadsCaptured}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{averageDuration}m</div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Total Call Minutes</CardTitle>
                    <CardDescription>The total number of minutes spent on calls each day</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <LineChart accessibilityLayer data={dynamicChartData} margin={{ top: 20, left: -10, right: 10, bottom: 0 }}>
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
                    <CardDescription>Calls aggregated by outcome</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {totalCalls === 0 ? (
                        <div className="flex items-center justify-center min-h-[150px]">
                            <p className="text-sm text-muted-foreground">Not enough data to display.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(
                                calls.reduce((acc, call) => {
                                    if (call.outcome) {
                                        acc[call.outcome] = (acc[call.outcome] || 0) + 1;
                                    }
                                    return acc;
                                }, {} as Record<string, number>)
                            ).map(([reason, count]) => (
                                <div key={reason} className="flex items-center justify-between">
                                    <span className="capitalize">{reason}</span>
                                    <span className="font-semibold">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Number of Calls</CardTitle>
                    <CardDescription>The total number of calls made each day</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <LineChart accessibilityLayer data={dynamicNumberChartData} margin={{ top: 20, left: -10, right: 10, bottom: 0 }}>
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
        </div>
      </div>
    </main>
  );
}
