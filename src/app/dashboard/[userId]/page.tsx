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
  ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";

const chartConfig = {
  calls: {
    label: "Total Calls",
    color: "hsl(var(--chart-5))",
  },
  answered: {
    label: "Answered",
    color: "hsl(var(--chart-1))",
  },
  appointments: {
    label: "Appointments Set",
    color: "hsl(var(--chart-3))",
  },
  hangUps: {
    label: "Hang Ups",
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

  const leadsRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid.slice(-12) !== userIdSlug) return null;
    return query(collection(firestore, `businessProfiles/${user.uid}/leads`), orderBy('createdAt', 'desc'));
  }, [user, firestore, userIdSlug]);

  const { data: leadsData, isLoading: isLeadsLoading } = useCollection(leadsRef);

  if (isAgentsLoading || isCallsLoading || isLeadsLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const calls = (callsData || []) as CallLog[];
  const leads = (leadsData || []) as any[];
  const parseDate = (val: any) => {
    if (!val) return new Date();
    if (typeof val.toDate === 'function') return val.toDate();
    if (val.seconds) return new Date(val.seconds * 1000);
    return new Date(val);
  };

  const numDays = period === 'last-30-days' ? 30 : period === 'last-90-days' ? 90 : 7;
  
  // Keep the last X days from today
  const now = new Date();
  const dateRange: string[] = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dateRange.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  const dailyStats: Record<string, { calls: number, minutes: number, answered: number, hangUps: number, appointments: number }> = {};
  let totalCalls = 0;
  let totalMinutes = 0;
  let leadsCaptured = 0;

  calls.forEach(call => {
    const dateObj = parseDate(call.startedAt);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Always calculate daily stats for the chart if it falls in our range (or just populate it)
    if (dateRange.includes(dateStr)) {
        if (!dailyStats[dateStr]) {
            dailyStats[dateStr] = { calls: 0, minutes: 0, answered: 0, hangUps: 0, appointments: 0 };
        }
        
        dailyStats[dateStr].calls += 1;
        dailyStats[dateStr].minutes += call.duration / 60;
        
        if (call.outcome === 'answered') {
            dailyStats[dateStr].answered += 1;
        }
        
        totalCalls += 1;
        totalMinutes += call.duration / 60;
        if (call.leadCaptured) {
            leadsCaptured += 1;
            dailyStats[dateStr].appointments += 1;
        } else {
            dailyStats[dateStr].hangUps += 1;
        }
    }
  });

  const averageDuration = totalCalls > 0 ? Math.round(totalMinutes / totalCalls) : 0;



  const dynamicChartData = dateRange.map(date => ({
    date,
    latest: dailyStats[date] ? Math.round(dailyStats[date].minutes * 10) / 10 : 0,
    previous: 0 
  }));

  const dynamicNumberChartData = dateRange.map(date => ({
    date,
    calls: dailyStats[date] ? dailyStats[date].calls : 0,
    answered: dailyStats[date] ? dailyStats[date].answered : 0,
    appointments: dailyStats[date] ? dailyStats[date].appointments : 0,
    hangUps: dailyStats[date] ? dailyStats[date].hangUps : 0,
  }));

  const appointmentsSet = leadsCaptured; // Proxy for now
  const hangUps = totalCalls - appointmentsSet;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-4 lg:p-4 h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-lg font-semibold md:text-2xl shrink-0">Analytics</h1>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-[180px] h-8">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
            <SelectItem value="last-90-days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground flex items-center gap-2 shrink-0">
          <span>Updated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
          <RefreshCw className="h-3 w-3" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Calls</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
                <div className="text-2xl font-bold">{totalCalls}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Call Minutes</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
                <div className="text-2xl font-bold">{Math.round(totalMinutes)}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Average Duration</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
                <div className="text-2xl font-bold">{averageDuration}m</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Hang Ups</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
                <div className="text-2xl font-bold">{hangUps}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Appointments Set</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
                <div className="text-2xl font-bold">{appointmentsSet}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Leads Captured</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
                <div className="text-2xl font-bold">{leadsCaptured}</div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-4 h-full">
            <Card className="flex flex-col flex-1 min-h-0">
                <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">Number of Calls</CardTitle>
                    <CardDescription className="text-xs">Daily call volume breakdown by outcome</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 pb-4 px-4">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart accessibilityLayer data={dynamicNumberChartData} margin={{ top: 10, left: -10, right: 10, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent className="w-full flex-wrap justify-between px-4" />} />
                    <Bar dataKey="calls" fill="var(--color-calls)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="answered" fill="var(--color-answered)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="appointments" stackId="a" fill="var(--color-appointments)" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="hangUps" stackId="a" fill="var(--color-hangUps)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
                </CardContent>
            </Card>
        </div>
        <div className="flex flex-col gap-4 h-full">
            <Card className="flex flex-col flex-1 min-h-0">
                <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">Recent Appointments</CardTitle>
                    <CardDescription className="text-xs">Latest appointments set by the AI agent</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0">
                    <ScrollArea className="h-full px-4 pb-4">
                        {leads.length === 0 ? (
                            <div className="flex items-center justify-center min-h-[100px]">
                                <p className="text-xs text-muted-foreground">No appointments scheduled yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 pt-2">
                                {leads.slice(0, 10).map((lead: any) => (
                                    <div key={lead.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-sm text-foreground">{lead.name || 'Unknown Caller'}</span>
                                            <span className="text-xs text-muted-foreground">{parseDate(lead.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{lead.phone || 'No phone number'}</span>
                                        <p className="text-sm mt-1 line-clamp-2 text-muted-foreground">{lead.notes || lead.agentSummary || 'No details provided.'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
