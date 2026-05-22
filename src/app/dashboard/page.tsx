'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, 
  query, 
  where, 
  doc, 
  getDoc, 
  setDoc,
  getDocs,
  collectionGroup
} from 'firebase/firestore';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase 
} from '@/firebase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Globe, 
  Plus, 
  Phone, 
  Tag, 
  Briefcase, 
  ArrowRight, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  LogOut,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import TranslatedText from '@/components/TranslatedText';
import { getAuth, signOut } from 'firebase/auth';
import { BusinessProfile } from '@/types/crm';
import { useToast } from '@/hooks/use-toast';

export default function DashboardRouterPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [role, setRole] = React.useState<'landlord' | 'renter' | null>(null);
  const [roleLoading, setRoleLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [newSiteOpen, setNewSiteOpen] = React.useState(false);
  const [isCreatingSite, setIsCreatingSite] = React.useState(false);
  const [rentSettingsOpen, setRentSettingsOpen] = React.useState(false);
  const [selectedSiteForRent, setSelectedSiteForRent] = React.useState<BusinessProfile | null>(null);

  // Form states for creating a new site
  const [newSiteName, setNewSiteName] = React.useState('');
  const [newSiteNiche, setNewSiteNiche] = React.useState('');
  const [newSitePhone, setNewSitePhone] = React.useState('');
  const [newSiteTemplate, setNewSiteTemplate] = React.useState('template-3');
  const [newSitePrice, setNewSitePrice] = React.useState('350');

  // Form states for renting out a site
  const [renterEmail, setRenterEmail] = React.useState('');
  const [renterUid, setRenterUid] = React.useState('');
  const [leadCap, setLeadCap] = React.useState('40');
  const [forwardEmail, setForwardEmail] = React.useState('');
  const [forwardPhone, setForwardPhone] = React.useState('');
  const [forwardEnabled, setForwardEnabled] = React.useState(true);

  // Stats for the landlord dashboard
  const [siteStats, setSiteStats] = React.useState<Record<string, { leadCount: number }>>({});

  // Memoized query to fetch landlord's owned sites
  const landlordSitesQuery = useMemoFirebase(() => {
    if (!user || role !== 'landlord') return null;
    if (isAdmin) {
      return query(collection(firestore, 'businessProfiles'));
    }
    return query(
      collection(firestore, 'businessProfiles'), 
      where('ownerId', '==', user.uid)
    );
  }, [user, role, isAdmin, firestore]);

  const { data: ownedSites, isLoading: ownedSitesLoading } = useCollection<BusinessProfile>(landlordSitesQuery);

  // Fetch roles and execute routing rules
  React.useEffect(() => {
    async function determineRole() {
      if (isUserLoading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setRoleLoading(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        // Check if platform administrator
        const profileDocRef = doc(firestore, 'businessProfiles', user.uid);
        const profileDoc = await getDoc(profileDocRef);
        if (profileDoc.exists() && profileDoc.data()?.IsAdmin === true) {
          setIsAdmin(true);
        }

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role);
          setRoleLoading(false);
          return;
        }

        // Fallback checks:
        // 1. Check if user is owner of any site
        const ownerQuery = query(collection(firestore, 'businessProfiles'), where('ownerId', '==', user.uid));
        const ownerSnap = await getDocs(ownerQuery);

        if (!ownerSnap.empty || doc(firestore, 'businessProfiles', user.uid)) {
          // If they own a site or have a profile named after their uid, they are a landlord
          await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            role: 'landlord'
          });
          setRole('landlord');
          setRoleLoading(false);
          return;
        }

        // 2. Check if they are rented to any site
        const renterQuery = query(collection(firestore, 'businessProfiles'), where('currentRenterId', '==', user.uid));
        const renterSnap = await getDocs(renterQuery);

        if (!renterSnap.empty) {
          await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            role: 'renter'
          });
          setRole('renter');
          setRoleLoading(false);
          return;
        }

        // 3. Default to landlord (new account ready to construct sites)
        await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          role: 'landlord'
        });
        setRole('landlord');
        setRoleLoading(false);

      } catch (err) {
        console.error('Error determining user role:', err);
        setRoleLoading(false);
      }
    }

    determineRole();
  }, [user, isUserLoading, firestore, router]);

  // Renter redirect hook
  React.useEffect(() => {
    if (role === 'renter' && user) {
      const uid = user.uid;
      async function routeRenter() {
        const renterQuery = query(collection(firestore, 'businessProfiles'), where('currentRenterId', '==', uid));
        const renterSnap = await getDocs(renterQuery);
        if (!renterSnap.empty) {
          const rentedSite = renterSnap.docs[0];
          router.push(`/dashboard/${rentedSite.id}`);
        }
      }
      routeRenter();
    }
  }, [role, user, firestore, router]);

  // Fetch lead counts for landlord's owned sites
  React.useEffect(() => {
    const sites = ownedSites;
    if (!sites || sites.length === 0) return;

    async function fetchStats(activeSites: BusinessProfile[]) {
      const stats: Record<string, { leadCount: number }> = {};
      for (const site of activeSites) {
        try {
          const leadsCol = collection(firestore, `businessProfiles/${site.id}/leads`);
          const leadsSnap = await getDocs(leadsCol);
          stats[site.id] = { leadCount: leadsSnap.size };
        } catch (e) {
          stats[site.id] = { leadCount: 0 };
        }
      }
      setSiteStats(stats);
    }

    fetchStats(sites);
  }, [ownedSites, firestore]);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isCreatingSite) return;

    try {
      setIsCreatingSite(true);
      // Slugify name
      let siteSlug = newSiteName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      if (!siteSlug) {
        siteSlug = `site-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Check for collision
      const siteDocRef = doc(firestore, 'businessProfiles', siteSlug);
      const siteSnap = await getDoc(siteDocRef);
      if (siteSnap.exists()) {
        siteSlug = `${siteSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const finalDocRef = doc(firestore, 'businessProfiles', siteSlug);
      const newSiteData: BusinessProfile = {
        id: siteSlug,
        businessName: newSiteName,
        contactEmail: user.email || '',
        service: newSiteNiche || 'Lead Generation Site',
        phoneNumber: newSitePhone,
        defaultLandingPage: newSiteTemplate,
        ownerId: user.uid,
        currentRenterId: null,
        isPubliclyListed: true,
        monthlyRentPrice: Number(newSitePrice) || 350,
        niche: newSiteNiche,
        leadForwardingEnabled: false
      };

      await setDoc(finalDocRef, newSiteData);

      // Create ElevenLabs Agent skeleton document
      const agentRef = doc(firestore, `businessProfiles/${siteSlug}/agents`, 'default');
      await setDoc(agentRef, {
        id: 'default',
        businessProfileId: siteSlug,
        elevenLabsAgentId: '',
        name: `${newSiteName} Voice Assistant`,
        systemPrompt: `You are a helpful, professional scheduling voice agent for ${newSiteName}. Your goal is to gather caller name, phone number, interest, and schedule them into the calendar.`,
        firstMessage: `Hello, thanks for calling ${newSiteName}! How can I help you today?`,
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
        status: 'active',
        createdAt: new Date().toISOString()
      });

      // Reset Form
      setNewSiteName('');
      setNewSiteNiche('');
      setNewSitePhone('');
      setNewSitePrice('350');
      setNewSiteOpen(false);
      setIsCreatingSite(false);

      toast({
        title: 'Success',
        description: `Site "${newSiteName}" has been successfully created!`,
      });
    } catch (err) {
      console.error('Error creating site:', err);
      setIsCreatingSite(false);
      toast({
        variant: 'destructive',
        title: 'Error Creating Site',
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleOpenRentSettings = (site: BusinessProfile) => {
    setSelectedSiteForRent(site);
    setRenterEmail(site.contactEmail || '');
    setRenterUid(site.currentRenterId || '');
    setLeadCap(site.monthlyLeadCap?.toString() || '40');
    setForwardEmail(site.leadForwardingEmail || '');
    setForwardPhone(site.leadForwardingPhone || '');
    setForwardEnabled(site.leadForwardingEnabled ?? false);
    setRentSettingsOpen(true);
  };

  const handleSaveRentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteForRent) return;

    try {
      const siteRef = doc(firestore, 'businessProfiles', selectedSiteForRent.id);
      
      const updates: Partial<BusinessProfile> = {
        currentRenterId: renterUid || null,
        contactEmail: renterEmail || selectedSiteForRent.contactEmail,
        monthlyLeadCap: Number(leadCap) || 40,
        leadForwardingEmail: (forwardEmail || renterEmail || null) as any,
        leadForwardingPhone: (forwardPhone || null) as any,
        leadForwardingEnabled: forwardEnabled
      };

      // If a renter UID is assigned, make sure that renter user exists and has role 'renter'
      if (renterUid) {
        const renterDocRef = doc(firestore, 'users', renterUid);
        const renterDoc = await getDoc(renterDocRef);
        if (!renterDoc.exists()) {
          await setDoc(renterDocRef, {
            id: renterUid,
            email: renterEmail || 'renter@t3automations.com',
            role: 'renter'
          });
        } else if (renterDoc.data()?.role !== 'renter') {
          await setDoc(renterDocRef, { role: 'renter' }, { merge: true });
        }
      }

      await setDoc(siteRef, updates, { merge: true });
      setRentSettingsOpen(false);
      setSelectedSiteForRent(null);
      toast({
        title: 'Success',
        description: 'Rent settings and renter credentials updated successfully.',
      });
    } catch (err) {
      console.error('Error saving rent settings:', err);
      toast({
        variant: 'destructive',
        title: 'Error Saving Settings',
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  if (isUserLoading || roleLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground font-medium"><TranslatedText>Verifying Account...</TranslatedText></p>
      </div>
    );
  }

  // Renter role renders loading state during redirect
  if (role === 'renter') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground font-medium"><TranslatedText>Redirecting to your dashboard...</TranslatedText></p>
      </div>
    );
  }

  // Landlord Dashboard View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-indigo-400" />
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              T3 Portfolio Landlord
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <LogOut className="h-4 w-4 mr-2" />
              <TranslatedText>Logout</TranslatedText>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Card */}
        <div className="mb-8 p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              <TranslatedText>Your Digital Real Estate</TranslatedText>
            </h1>
            <p className="text-slate-400 mt-2">
              <TranslatedText>Manage, rank, and rent out landing pages with AI Voice Agents connected.</TranslatedText>
            </p>
          </div>

          <Dialog open={newSiteOpen} onOpenChange={setNewSiteOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 shadow-lg shadow-indigo-500/20">
                <Plus className="h-5 w-5 mr-2" />
                <TranslatedText>Create New Site</TranslatedText>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100">
              <DialogHeader>
                <DialogTitle><TranslatedText>Provision New Rank & Rent Asset</TranslatedText></DialogTitle>
                <DialogDescription className="text-slate-400">
                  <TranslatedText>Create a new niche landing page configuration. An AI voice agent skeleton will be created automatically.</TranslatedText>
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSite} className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="siteName" className="text-slate-300"><TranslatedText>Business/Site Name</TranslatedText></Label>
                  <Input 
                    id="siteName"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    placeholder="e.g. Denver Junk Removal"
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="siteNiche" className="text-slate-300"><TranslatedText>Niche / Service Area</TranslatedText></Label>
                  <Input 
                    id="siteNiche"
                    value={newSiteNiche}
                    onChange={(e) => setNewSiteNiche(e.target.value)}
                    placeholder="e.g. Junk Removal"
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sitePhone" className="text-slate-300"><TranslatedText>Phone Number</TranslatedText></Label>
                  <Input 
                    id="sitePhone"
                    value={newSitePhone}
                    onChange={(e) => setNewSitePhone(e.target.value)}
                    placeholder="e.g. +13035550192"
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sitePrice" className="text-slate-300"><TranslatedText>Monthly Rent ($)</TranslatedText></Label>
                    <Input 
                      id="sitePrice"
                      type="number"
                      value={newSitePrice}
                      onChange={(e) => setNewSitePrice(e.target.value)}
                      placeholder="350"
                      required
                      className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="siteTemplate" className="text-slate-300"><TranslatedText>Landing Template</TranslatedText></Label>
                    <Select value={newSiteTemplate} onValueChange={setNewSiteTemplate}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="template-1">Modern Sleek (1)</SelectItem>
                        <SelectItem value="template-2">Professional Grid (2)</SelectItem>
                        <SelectItem value="template-3">Clean Minimal (3)</SelectItem>
                        <SelectItem value="template-4">Feature Rich (4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isCreatingSite}
                    className="bg-indigo-600 hover:bg-indigo-700 w-full"
                  >
                    {isCreatingSite ? <TranslatedText>Creating...</TranslatedText> : <TranslatedText>Create Site Profile</TranslatedText>}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sites Section */}
        {ownedSitesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="bg-slate-900 border-slate-800 animate-pulse h-64"></Card>
            ))}
          </div>
        ) : !ownedSites || ownedSites.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
            <Briefcase className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300"><TranslatedText>No Active Sites</TranslatedText></h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              <TranslatedText>You have not provisioned any rank-and-rent niche sites yet. Let's get started by creating your first site profile!</TranslatedText>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedSites.map((site) => {
              const leadsCount = siteStats[site.id]?.leadCount ?? 0;
              const isRented = !!site.currentRenterId;

              return (
                <Card 
                  key={site.id} 
                  className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl group relative flex flex-col justify-between overflow-hidden"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                          {site.businessName}
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1 flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-indigo-400" />
                          {site.service}
                        </CardDescription>
                      </div>
                      <Badge className={isRented ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}>
                        {isRented ? <TranslatedText>Rented</TranslatedText> : <TranslatedText>Available</TranslatedText>}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 py-2 flex-1">
                    <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                      <div>
                        <span className="text-xs text-slate-500 block uppercase"><TranslatedText>Rent Cost</TranslatedText></span>
                        <span className="text-lg font-bold text-slate-200 flex items-center">
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                          {site.monthlyRentPrice}/mo
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block uppercase"><TranslatedText>Total Leads</TranslatedText></span>
                        <span className="text-lg font-bold text-slate-200 flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4 text-indigo-400" />
                          {leadsCount}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span>{site.phoneNumber || 'No phone set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-500" />
                        <span className="truncate">{site.websiteUrl || 'Pending Custom Domain'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleOpenRentSettings(site)}
                      className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <TranslatedText>Rent out</TranslatedText>
                    </Button>
                    <Button 
                      onClick={() => router.push(`/dashboard/${site.id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <TranslatedText>Manage</TranslatedText>
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Rent Settings Dialog Modal */}
      <Dialog open={rentSettingsOpen} onOpenChange={setRentSettingsOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle><TranslatedText>Renting & Forwarding Settings</TranslatedText></DialogTitle>
            <DialogDescription className="text-slate-400">
              <TranslatedText>Assign this site to a renter and configure lead routing preferences.</TranslatedText>
            </DialogDescription>
          </DialogHeader>
          {selectedSiteForRent && (
            <form onSubmit={handleSaveRentSettings} className="space-y-4 py-4">
              <div className="border-b border-slate-800 pb-4 mb-4">
                <span className="text-xs text-slate-500 uppercase"><TranslatedText>Selected Website</TranslatedText></span>
                <h4 className="text-lg font-bold text-indigo-400 mt-1">{selectedSiteForRent.businessName}</h4>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="renterUid" className="text-slate-300"><TranslatedText>Renter UID (User Account ID)</TranslatedText></Label>
                <Input 
                  id="renterUid"
                  value={renterUid}
                  onChange={(e) => setRenterUid(e.target.value)}
                  placeholder="e.g. renter-firebase-uid-value"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 font-mono text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="renterEmail" className="text-slate-300"><TranslatedText>Renter Email Address</TranslatedText></Label>
                <Input 
                  id="renterEmail"
                  type="email"
                  value={renterEmail}
                  onChange={(e) => setRenterEmail(e.target.value)}
                  placeholder="renter@example.com"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="leadCap" className="text-slate-300"><TranslatedText>Monthly Lead Cap (Throttling)</TranslatedText></Label>
                <Input 
                  id="leadCap"
                  type="number"
                  value={leadCap}
                  onChange={(e) => setLeadCap(e.target.value)}
                  placeholder="40"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>
              
              <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="forwardEnabled" className="text-slate-300"><TranslatedText>Lead Forwarding Alerts</TranslatedText></Label>
                  <input
                    id="forwardEnabled"
                    type="checkbox"
                    checked={forwardEnabled}
                    onChange={(e) => setForwardEnabled(e.target.checked)}
                    className="h-4 w-4 bg-slate-800 border-slate-700 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                {forwardEnabled && (
                  <>
                    <div className="grid gap-2 animate-fadeIn">
                      <Label htmlFor="forwardEmail" className="text-slate-300"><TranslatedText>Forward Email Address</TranslatedText></Label>
                      <Input 
                        id="forwardEmail"
                        type="email"
                        value={forwardEmail}
                        onChange={(e) => setForwardEmail(e.target.value)}
                        placeholder="alerts@renter.com"
                        className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                    <div className="grid gap-2 animate-fadeIn">
                      <Label htmlFor="forwardPhone" className="text-slate-300"><TranslatedText>Forward SMS Phone Number</TranslatedText></Label>
                      <Input 
                        id="forwardPhone"
                        value={forwardPhone}
                        onChange={(e) => setForwardPhone(e.target.value)}
                        placeholder="e.g. +15551234567"
                        className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 w-full">
                  <TranslatedText>Save Renter Settings</TranslatedText>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
