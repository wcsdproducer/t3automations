'use client';

import { CalendarCheck, Handshake, Phone } from 'lucide-react';
import { Bar, CartesianGrid, XAxis, YAxis, Label, BarChart as RechartsBarChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', calls: 186 },
  { month: 'February', calls: 305 },
  { month: 'March', calls: 237 },
  { month: 'April', calls: 273 },
  { month: 'May', calls: 209 },
  { month: 'June', calls: 214 },
];

const chartConfig = {
  calls: {
    label: 'Calls',
    color: 'hsl(var(--primary))',
  },
};

export default function AnalyticsDashboard() {
  return (
    <Card className="shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow">
        <p className="text-muted-foreground">
          Track call volumes, lead quality, and other key metrics to evaluate the effectiveness of the virtual receptionist service.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">452</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">172</div>
              <p className="text-xs text-muted-foreground">+35% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Call Volume This Year</h3>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <RechartsBarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis tickLine={false} axisLine={false} >
                 <Label value="Number of Calls" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="calls" fill="var(--color-calls)" radius={4} />
            </RechartsBarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
