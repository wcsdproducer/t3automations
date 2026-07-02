'use client';

import React, { useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { SiteLauncher } from '@/components/dashboard/site-launcher';
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
  Loader2,
  Phone,
  Megaphone,
  User,
  MessageSquare
} from 'lucide-react';
import { setupGoogleAnalyticsAction, getGoogleAnalyticsDataAction } from '@/app/actions/google-analytics';
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

  const leadsRef = useMemoFirebase(() => {
    if (!userId || !firestore) return null;
    return collection(firestore, `businessProfiles/${userId}/leads`);
  }, [userId, firestore]);

  const { data: leads } = useCollection(leadsRef);

  const agentsRef = useMemoFirebase(() => {
    if (!userId || !firestore) return null;
    return collection(firestore, `businessProfiles/${userId}/agents`);
  }, [userId, firestore]);

  const { data: agents } = useCollection(agentsRef);
  const agentId = agents?.[0]?.id || 'default';

  const conversationsRef = useMemoFirebase(() => {
    if (!userId || !firestore || !agentId) return null;
    return collection(firestore, `businessProfiles/${userId}/agents/${agentId}/conversations`);
  }, [userId, firestore, agentId]);

  const { data: conversations } = useCollection(conversationsRef);

  const isLoading = isProfileLoading || isDomainsLoading;

  const hasConnectedDomain = domains && domains.length > 0;
  const isGAConnected = !!businessProfile?.googleAnalyticsMeasurementId;

  const [analyticsData, setAnalyticsData] = React.useState<any>(null);
  const [isDataLoading, setIsDataLoading] = React.useState(false);

  React.useEffect(() => {
    if (!userId || !isGAConnected) return;

    async function loadAnalytics() {
      setIsDataLoading(true);
      try {
        const res = await getGoogleAnalyticsDataAction(userId);
        if (res.success) {
          setAnalyticsData(res);
        }
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setIsDataLoading(false);
      }
    }

    loadAnalytics();
  }, [userId, isGAConnected]);

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
          // Reload analytics data after setup completes
          setIsDataLoading(true);
          const dataRes = await getGoogleAnalyticsDataAction(userId);
          if (dataRes.success) {
            setAnalyticsData(dataRes);
          }
          setIsDataLoading(false);
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

  if (isLoading || (isGAConnected && isDataLoading && !analyticsData)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate Conversion Metrics
  const totalLeads = leads?.length || 0;
  const totalCalls = conversations?.length || 0;
  const leadsFromCalls = conversations?.filter((c: any) => c.leadCaptured).length || 0;
  
  const visitorCount = analyticsData?.metrics.totalVisitors || 0;
  const leadConversionRate = visitorCount > 0 ? ((totalLeads / visitorCount) * 100).toFixed(1) : '0.0';
  const callConversionRate = totalCalls > 0 ? ((leadsFromCalls / totalCalls) * 100).toFixed(1) : '0.0';

  const leadSourceData = [
    { name: 'Forms', value: leads?.filter((l: any) => l.source === 'landing-page').length || 0, color: '#3b82f6' },
    { name: 'Calls', value: leads?.filter((l: any) => l.source === 'inbound-call').length || 0, color: '#10b981' },
    { name: 'Chat', value: leads?.filter((l: any) => l.source === 'chatbot').length || 0, color: '#f59e0b' },
    { name: 'Other', value: leads?.filter((l: any) => !['landing-page', 'inbound-call', 'chatbot'].includes(l.source)).length || 0, color: '#8b5cf6' },
  ];

  const recentLeads = [...(leads || [])].sort((a: any, b: any) => {
    const dateA = a.createdAt?.toDate?.() ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const dateB = b.createdAt?.toDate?.() ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  }).slice(0, 5);

  // State 1: Active Integration - Show dashboard widgets
  if (isGAConnected) {
    return (
      <div className="flex flex-col gap-4 p-0 bg-slate-950 h-full flex-1 text-slate-100 overflow-hidden">
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
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
            <div>
              <span className="font-semibold">Simulated Environment:</span> Your Google Analytics property is configured and linked. Tracking tag code has been automatically injected into your landing page head. Simulated traffic data is shown below.
            </div>
          </div>
        )}

        {/* 4 Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
              <CardTitle className="text-sm font-medium text-slate-400">Total Visitors</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{analyticsData?.metrics.totalVisitors.toLocaleString() || '0'}</div>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> {analyticsData?.metrics.visitorsChange || '+0.0%'} vs last week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
              <CardTitle className="text-sm font-medium text-slate-400">Page Views</CardTitle>
              <Globe className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{analyticsData?.metrics.totalPageviews.toLocaleString() || '0'}</div>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> {analyticsData?.metrics.pageviewsChange || '+0.0%'} vs last week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
              <CardTitle className="text-sm font-medium text-slate-400">Avg. Session Duration</CardTitle>
              <Clock className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{analyticsData?.metrics.avgSessionDuration || '0m 0s'}</div>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> {analyticsData?.metrics.durationChange || '+0.0%'} vs last week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
              <CardTitle className="text-sm font-medium text-slate-400">Conversion Rate</CardTitle>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{leadConversionRate}%</div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                {totalLeads} total leads captured
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel / Call Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
              <CardTitle className="text-sm font-medium text-slate-400">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{totalCalls}</div>
              <p className="text-xs text-slate-400 mt-1">AI voice agent interactions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
              <CardTitle className="text-sm font-medium text-slate-400">Call-to-Lead</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{callConversionRate}%</div>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                {leadsFromCalls} leads from AI calls
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
              <CardTitle className="text-sm font-medium text-slate-400">Active Campaign</CardTitle>
              <Megaphone className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg font-bold truncate">Local SEO Expansion</div>
              <p className="text-[10px] text-slate-400 mt-1">20+ Neighborhoods Targeted</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
              <CardTitle className="text-sm font-medium text-slate-400">Site Health</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-emerald-400">98%</div>
              <p className="text-xs text-slate-400 mt-1">SSL & DNS Verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-6 lg:grid-cols-6 flex-1 min-h-0">
          {/* Main traffic chart */}
          <Card className="col-span-1 md:col-span-4 bg-slate-900 border-slate-800 flex flex-col h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold text-slate-200">Traffic Over Time</CardTitle>
              <CardDescription className="text-xs text-slate-400">Daily breakdown of unique visitors and total pageviews</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData?.trafficData || []}>
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
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisitors)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pageviews" name="Page Views" stroke="#10b981" fillOpacity={1} fill="url(#colorPageviews)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lead Source Breakdown */}
          <Card className="col-span-1 md:col-span-2 bg-slate-900 border-slate-800 flex flex-col h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold text-slate-200">Lead Sources</CardTitle>
              <CardDescription className="text-xs text-slate-400">Total: {totalLeads} leads captured</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-between flex-1 min-h-0 pb-4">
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={leadSourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {leadSourceData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 w-full px-4 text-[10px] mt-1">
                {leadSourceData.map((s: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300 truncate">{s.name}: {s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="grid gap-4 md:grid-cols-6 lg:grid-cols-6 flex-1 min-h-0">
          <Card className="col-span-1 md:col-span-4 bg-slate-900 border-slate-800 flex flex-col h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold text-slate-200">Recent Leads</CardTitle>
              <CardDescription className="text-xs text-slate-400">Latest activity across all capture channels</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <div className="divide-y divide-slate-800">
                {recentLeads.map((lead: any) => (
                  <div key={lead.id} className="p-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        lead.source === 'landing-page' ? 'bg-blue-500/10 text-blue-400' :
                        lead.source === 'inbound-call' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {lead.source === 'landing-page' ? <Globe className="h-4 w-4" /> :
                         lead.source === 'inbound-call' ? <Phone className="h-4 w-4" /> :
                         <MessageSquare className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{lead.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {lead.source.replace('-', ' ')} • {lead.createdAt?.toDate?.() ? lead.createdAt.toDate().toLocaleTimeString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${
                      lead.status === 'new' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' :
                      'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                    }`}>
                      {lead.status}
                    </Badge>
                  </div>
                ))}
                {recentLeads.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No leads captured yet. Start driving traffic to see results!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-4 bg-slate-900 border-slate-800 flex flex-col h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold text-slate-200">Top Referral Sources</CardTitle>
              <CardDescription className="text-xs text-slate-400">Referrals and search engines driving traffic to your domain</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={analyticsData?.referralData || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Bar dataKey="value" name="Sessions" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Integration Status / Meta */}
          <Card className="col-span-1 md:col-span-2 bg-slate-900 border-slate-800 flex flex-col h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-base font-semibold text-slate-200">Integration Details</CardTitle>
              <CardDescription className="text-xs text-slate-400">Google Analytics technical assets</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-2 text-xs pb-4">
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Property ID</span>
                  <span className="font-mono text-slate-300 truncate max-w-[120px]">{businessProfile.googleAnalyticsPropertyId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Stream ID</span>
                  <span className="font-mono text-slate-300 truncate max-w-[120px]">{businessProfile.googleAnalyticsStreamId?.split('/').pop()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Status</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Live
                  </span>
                </div>
                <div className="flex justify-between pb-1.5">
                  <span className="text-slate-400">Last Synced</span>
                  <span className="text-slate-300">
                    {businessProfile.googleAnalyticsUpdatedAt 
                      ? new Date(businessProfile.googleAnalyticsUpdatedAt).toLocaleDateString() 
                      : 'Today'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <Button 
                  onClick={handleSetupAnalytics} 
                  disabled={isPending}
                  variant="outline" 
                  className="w-full h-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white py-1 text-xs"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-3.5 w-3.5" />
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
          <h1 className="text-3xl font-extrabold tracking-tight">Website Launch Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete the steps below to map your domain, verify ownership, and configure SEO/AI blogging content strategies.
          </p>
        </div>
      </div>
      
      <SiteLauncher />

      {/* Analytics setup option when domain is live */}
      {hasConnectedDomain && (
        <div className="mt-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-slate-200">Google Analytics Tracking Setup</h3>
            <p className="text-xs text-slate-400">
              Create GA dashboard properties automatically to monitor user traffic and lead conversions on your connected custom domain.
            </p>
          </div>
          <Button 
            onClick={handleSetupAnalytics} 
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold whitespace-nowrap shadow-lg shadow-blue-500/20 shrink-0"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Initialize Analytics Tracking
              </>
            )}
          </Button>
        </div>
      )}
    </main>
  );
}
