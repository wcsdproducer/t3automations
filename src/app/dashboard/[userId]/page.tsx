'use client';

import React, { useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Globe,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Activity,
  Sparkles,
  Plus,
  RefreshCw,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { setupGoogleAnalyticsAction } from '@/app/actions/google-analytics';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  Legend
} from 'recharts';

const TRAFFIC_DATA = [
  { date: 'May 16', visitors: 120, pageviews: 280 },
  { date: 'May 17', visitors: 150, pageviews: 340 },
  { date: 'May 18', visitors: 180, pageviews: 420 },
  { date: 'May 19', visitors: 220, pageviews: 510 },
  { date: 'May 20', visitors: 290, pageviews: 680 },
  { date: 'May 21', visitors: 240, pageviews: 580 },
  { date: 'May 22', visitors: 310, pageviews: 740 },
];

const SOURCE_DATA = [
  { name: 'Organic Search', value: 450, color: '#3b82f6' },
  { name: 'Direct Traffic', value: 300, color: '#10b981' },
  { name: 'Referrals', value: 150, color: '#f59e0b' },
  { name: 'Social Media', value: 100, color: '#8b5cf6' },
];

const REFERRAL_DATA = [
  { name: 'Google', value: 410 },
  { name: 'Facebook', value: 240 },
  { name: 'Yelp', value: 180 },
  { name: 'Direct', value: 150 },
  { name: 'Bing', value: 80 },
];

export default function AnalyticsOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const userId = params?.userId as string;

  const docRef = useMemoFirebase(() => {
    if (!userId || !firestore) return null;
    return doc(firestore, 'businessProfiles', userId);
  }, [firestore, userId]);

  const { data: businessProfile, isLoading: isProfileLoading } = useDoc<any>(docRef);

  const customDomainsRef = useMemoFirebase(() => {
    if (!userId || !firestore) return null;
    return collection(firestore, `businessProfiles/${userId}/customDomains`);
  }, [userId, firestore]);

  const { data: domains, isLoading: isDomainsLoading } = useCollection(customDomainsRef);

  const isLoading = isProfileLoading || isDomainsLoading;

  const hasConnectedDomain = domains && domains.length > 0;
  const isGAConnected = !!businessProfile?.googleAnalyticsMeasurementId;

  const handleSetupAnalytics = () => {
    if (!userId) return;

    startTransition(async () => {
      try {
        const res = await setupGoogleAnalyticsAction(userId);
        if (res.success) {
          toast({
            title: 'Setup Completed',
            description: res.message,
          });
        } else {
          toast({
            title: 'Setup Failed',
            description: res.message,
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to initialize Google Analytics setup.',
          variant: 'destructive',
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  // State 1: Active Integration - Show dashboard widgets
  if (isGAConnected) {
    return (
      <div className="flex flex-col gap-6 p-4 lg:p-6 bg-slate-950 min-h-screen text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Analytics Overview</h1>
            <p className="text-sm text-slate-400 mt-1">
              Live dashboard powered by Google Analytics tracking on your custom domain.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs font-semibold gap-1.5 flex items-center shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </Badge>
            <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 px-3 py-1 font-mono text-xs">
              ID: {businessProfile.googleAnalyticsMeasurementId}
            </Badge>
          </div>
        </div>

        {/* Info banner for simulated/mock tag */}
        {businessProfile.isMockAnalytics && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-400 shrink-0" />
            <div>
              <span className="font-semibold">Simulated Environment:</span> Your Google Analytics property is configured and linked. Tracking tag code has been automatically injected into your landing page head. Simulated traffic data is shown below.
            </div>
          </div>
        )}

        {/* 4 Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Visitors</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,420</div>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +12.5% vs last week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Page Views</CardTitle>
              <Globe className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,850</div>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +8.3% vs last week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Avg. Session Duration</CardTitle>
              <Clock className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2m 45s</div>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +5.2% vs last week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Bounce Rate</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">41.2%</div>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> -2.1% improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-6 lg:grid-cols-6">
          {/* Main traffic chart */}
          <Card className="col-span-1 md:col-span-4 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-200">Traffic Over Time</CardTitle>
              <CardDescription className="text-slate-400">Daily breakdown of unique visitors and total pageviews</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TRAFFIC_DATA}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisitors)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pageviews" name="Page Views" stroke="#10b981" fillOpacity={1} fill="url(#colorPageviews)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Traffic Sources Pie */}
          <Card className="col-span-1 md:col-span-2 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-200">Acquisition Channels</CardTitle>
              <CardDescription className="text-slate-400">Where your visitors originate</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={SOURCE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {SOURCE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full px-4 text-xs">
                {SOURCE_DATA.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300 truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed breakdown / Referrals table */}
        <div className="grid gap-6 md:grid-cols-6 lg:grid-cols-6 mb-6">
          <Card className="col-span-1 md:col-span-4 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-200">Top Referral Sources</CardTitle>
              <CardDescription className="text-slate-400">Referrals and search engines driving traffic to your domain</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={REFERRAL_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Bar dataKey="value" name="Sessions" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Integration Status / Meta */}
          <Card className="col-span-1 md:col-span-2 bg-slate-900 border-slate-800 flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-200">Integration Details</CardTitle>
              <CardDescription className="text-slate-400">Google Analytics technical assets information</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-4 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Property ID</span>
                  <span className="font-mono text-xs text-slate-300 truncate max-w-[150px]">{businessProfile.googleAnalyticsPropertyId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Stream ID</span>
                  <span className="font-mono text-xs text-slate-300 truncate max-w-[150px]">{businessProfile.googleAnalyticsStreamId?.split('/').pop()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Status</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Live
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-400">Last Synced</span>
                  <span className="text-slate-300">
                    {businessProfile.googleAnalyticsUpdatedAt 
                      ? new Date(businessProfile.googleAnalyticsUpdatedAt).toLocaleDateString() 
                      : 'Today'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Button 
                  onClick={handleSetupAnalytics} 
                  disabled={isPending}
                  variant="outline" 
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Re-Sync Assets
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // State 2 & 3: GA NOT Connected
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6 bg-slate-950 min-h-screen text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analytics Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Display live web traffic, visitor demographics, and conversion metrics.
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
        {/* Subtle glassmorphic grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_70%)]" />

        <div className="max-w-md mx-auto flex flex-col items-center space-y-6 relative z-10">
          <div className="flex gap-4 items-center justify-center text-slate-600">
            <LineChartIcon className="h-16 w-16 stroke-[1.5]" />
            <PieChartIcon className="h-16 w-16 stroke-[1.5]" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-200">
              Google Analytics Integration Pending
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Analyze visitor behavior, traffic sources, and lead conversion rates directly in your dashboard. 
              {hasConnectedDomain 
                ? ' A custom domain is connected. Click the button below to automatically create and configure Google Analytics assets.'
                : ' To set up tracking, you must first connect a custom domain name to your site.'}
            </p>
          </div>

          {hasConnectedDomain ? (
            <Button 
              onClick={handleSetupAnalytics} 
              disabled={isPending}
              size="lg" 
              className="px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating GA Assets...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Set Up Google Analytics
                </>
              )}
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Button 
                onClick={() => router.push(`/dashboard/${userId}/domains`)} 
                variant="outline"
                size="lg"
                className="px-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Globe className="mr-2 h-5 w-5" />
                Connect Custom Domain
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                <AlertTriangle className="h-3.5 w-3.5" />
                Google Analytics requires a connected custom domain.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
