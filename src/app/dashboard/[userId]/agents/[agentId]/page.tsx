'use client';

import React from 'react';
import {
  LayoutGrid,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function AgentAnalyticsPage() {
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
  );
}
