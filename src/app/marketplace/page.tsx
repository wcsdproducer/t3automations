'use client';

import * as React from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import TranslatedText from '@/components/TranslatedText';
import { 
  Globe, 
  Phone, 
  Shield, 
  Zap, 
  Check, 
  Search, 
  ArrowRight, 
  Filter, 
  Sparkles, 
  Calendar, 
  ExternalLink, 
  Lock, 
  User, 
  CheckCircle,
  Briefcase,
  Flame,
  Award,
  Clock
} from 'lucide-react';

interface MarketplaceSite {
  id: string;
  businessName: string;
  service: string;
  phoneNumber: string;
  defaultLandingPage: string;
  monthlyRentPrice: number;
  niche: string;
  leadForwardingEnabled?: boolean;
  websiteUrl?: string;
  estimatedLeads?: string;
  isDemo?: boolean;
}

// Premium pre-built demo templates fallback
const FALLBACK_MARKETPLACE_SITES: MarketplaceSite[] = [
  {
    id: 'seattle-plumbing-pros',
    businessName: 'Seattle Plumbing Pros',
    service: 'Emergency Plumbing & Repair',
    phoneNumber: '+12065550143',
    defaultLandingPage: 'template-3',
    monthlyRentPrice: 399,
    niche: 'Plumbing',
    websiteUrl: 'seattleplumbing.live',
    estimatedLeads: '45-60 leads/mo',
    isDemo: true
  },
  {
    id: 'austin-ac-specialists',
    businessName: 'Austin AC Specialists',
    service: 'HVAC Maintenance & Installation',
    phoneNumber: '+15125550189',
    defaultLandingPage: 'template-3',
    monthlyRentPrice: 449,
    niche: 'HVAC',
    websiteUrl: 'austinacexperts.live',
    estimatedLeads: '60-80 leads/mo',
    isDemo: true
  },
  {
    id: 'boston-spark-electricians',
    businessName: 'Boston Spark Electric',
    service: 'Residential & Commercial Electrical',
    phoneNumber: '+16175550122',
    defaultLandingPage: 'template-1',
    monthlyRentPrice: 350,
    niche: 'Electrical',
    websiteUrl: 'bostonelectric.live',
    estimatedLeads: '30-45 leads/mo',
    isDemo: true
  },
  {
    id: 'miami-roof-guard',
    businessName: 'Miami Roof Guard',
    service: 'Roofing Repair & Inspection',
    phoneNumber: '+13055550156',
    defaultLandingPage: 'template-2',
    monthlyRentPrice: 499,
    niche: 'Roofing',
    websiteUrl: 'miamiroofing.live',
    estimatedLeads: '25-40 leads/mo',
    isDemo: true
  },
  {
    id: 'denver-clean-sweep',
    businessName: 'Denver Clean Sweep',
    service: 'Residential & Office Cleaning',
    phoneNumber: '+13035550177',
    defaultLandingPage: 'template-4',
    monthlyRentPrice: 299,
    niche: 'Cleaning',
    websiteUrl: 'denverclean.live',
    estimatedLeads: '50-70 leads/mo',
    isDemo: true
  }
];

export default function MarketplacePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [dbSites, setDbSites] = React.useState<MarketplaceSite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [checkoutLoading, setCheckoutLoading] = React.useState<string | null>(null);

  // Fetch listed sites from database
  React.useEffect(() => {
    async function fetchSites() {
      try {
        setLoading(true);
        const q = query(
          collection(firestore, 'businessProfiles'),
          where('isPubliclyListed', '==', true),
          where('currentRenterId', '==', null)
        );
        const snap = await getDocs(q);
        const sites: MarketplaceSite[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          sites.push({
            id: docSnap.id,
            businessName: data.businessName || 'Unnamed Site',
            service: data.service || 'Niche Services',
            phoneNumber: data.phoneNumber || '',
            defaultLandingPage: data.defaultLandingPage || 'template-1',
            monthlyRentPrice: data.monthlyRentPrice || 350,
            niche: data.niche || data.service?.split(' ')[0] || 'Services',
            leadForwardingEnabled: data.leadForwardingEnabled || false,
            websiteUrl: data.websiteUrl || `${docSnap.id}.t3kniq.com`,
            estimatedLeads: '30-50 leads/mo',
            isDemo: false
          });
        });
        setDbSites(sites);
      } catch (err) {
        console.error('Error fetching marketplace sites:', err);
      } finally {
        setLoading(false);
      }
    }

    if (firestore) {
      fetchSites();
    }
  }, [firestore]);

  // Combine database sites and demo fallbacks
  const allSites = React.useMemo(() => {
    // Deduplicate by ID
    const dbIds = new Set(dbSites.map((s) => s.id));
    const uniqueDemos = FALLBACK_MARKETPLACE_SITES.filter((s) => !dbIds.has(s.id));
    return [...dbSites, ...uniqueDemos];
  }, [dbSites]);

  // Categories list
  const categories = React.useMemo(() => {
    const list = new Set(allSites.map((s) => s.niche));
    return ['All', ...Array.from(list)];
  }, [allSites]);

  // Filtered sites list
  const filteredSites = React.useMemo(() => {
    if (selectedCategory === 'All') return allSites;
    return allSites.filter((s) => s.niche === selectedCategory);
  }, [allSites, selectedCategory]);

  const handleLeaseSite = async (site: MarketplaceSite) => {
    if (checkoutLoading) return;

    // 1. If user is not logged in, redirect them to signup with pre-filled details
    if (!user) {
      router.push(`/signup?rentSite=${site.id}&price=${site.monthlyRentPrice}`);
      return;
    }

    // 2. If logged in, redirect directly to checkout session
    try {
      setCheckoutLoading(site.id);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: site.id,
          userEmail: user.email,
          renterId: user.uid,
          price: site.monthlyRentPrice
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Leasing redirect error:', err);
      alert(`Could not initiate checkout: ${err.message}`);
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f19] text-slate-100 font-sans selection:bg-indigo-500/30">
      <Header />
      
      <main className="flex-grow pt-28 pb-20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Hero Section */}
        <div className="container mx-auto px-4 text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="h-4 w-4" />
            <TranslatedText>Ready-To-Lease Lead Generation Sites</TranslatedText>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            <TranslatedText>Digital Real Estate Marketplace</TranslatedText>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-8 leading-relaxed">
            <TranslatedText>Rent pre-ranked niche sites optimized for high conversions. Comes built-in with a 24/7 ElevenLabs conversational AI agent, Cal.com calendar syncing, and automated local lead capture.</TranslatedText>
          </p>

          {/* Quick stats / trust banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-lg mt-12">
            <div className="text-center">
              <span className="block text-2xl font-bold text-indigo-400">100%</span>
              <span className="text-xs text-slate-500 uppercase font-semibold"><TranslatedText>Automated Booking</TranslatedText></span>
            </div>
            <div className="text-center border-l border-slate-800/80">
              <span className="block text-2xl font-bold text-cyan-400">24/7</span>
              <span className="text-xs text-slate-500 uppercase font-semibold"><TranslatedText>AI Voice Receptionist</TranslatedText></span>
            </div>
            <div className="text-center border-l border-slate-800/80">
              <span className="block text-2xl font-bold text-indigo-400">&lt; 60s</span>
              <span className="text-xs text-slate-500 uppercase font-semibold"><TranslatedText>Instant Setup</TranslatedText></span>
            </div>
            <div className="text-center border-l border-slate-800/80">
              <span className="block text-2xl font-bold text-cyan-400">Flat</span>
              <span className="text-xs text-slate-500 uppercase font-semibold"><TranslatedText>No lead-based fees</TranslatedText></span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="container mx-auto px-4 mb-10 flex flex-wrap gap-2 justify-center items-center">
          <div className="flex items-center gap-2 mr-4 text-sm text-slate-400 font-medium">
            <Filter className="h-4 w-4 text-indigo-400" />
            <span><TranslatedText>Filter Niche:</TranslatedText></span>
          </div>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-transparent'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <TranslatedText>{category}</TranslatedText>
            </button>
          ))}
        </div>

        {/* Grid Section */}
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-900/30 border border-slate-850 rounded-2xl h-[450px] animate-pulse" />
              ))}
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10 max-w-lg mx-auto">
              <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-350"><TranslatedText>No Available Sites Found</TranslatedText></h3>
              <p className="text-slate-500 text-sm mt-2">
                <TranslatedText>All sites in this category are currently rented. Check back later or create a custom campaign!</TranslatedText>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSites.map((site) => (
                <Card 
                  key={site.id} 
                  className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-500 shadow-2xl rounded-2xl group flex flex-col justify-between overflow-hidden relative"
                >
                  {/* Glowing hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Top Badge for demo */}
                  {site.isDemo && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] uppercase tracking-wider font-extrabold py-0.5">
                        <Flame className="h-3 w-3 mr-1 inline-block animate-bounce text-indigo-400" />
                        <TranslatedText>Ready to Launch</TranslatedText>
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5" />
                        {site.niche}
                      </span>
                      <CardTitle className="text-2xl font-bold text-white tracking-tight mt-1 group-hover:text-indigo-300 transition-colors">
                        {site.businessName}
                      </CardTitle>
                      <CardDescription className="text-slate-400 mt-1 line-clamp-2 text-xs">
                        <TranslatedText>High-performing lead asset generating real-time inbound customers.</TranslatedText>
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 py-2 relative z-10 flex-grow">
                    {/* Price and Performance Summary */}
                    <div className="flex items-baseline justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-850/60">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold tracking-wider"><TranslatedText>Monthly Rent</TranslatedText></span>
                        <span className="text-2xl font-black text-emerald-400 flex items-center gap-0.5 mt-0.5">
                          ${site.monthlyRentPrice}
                          <span className="text-xs font-medium text-slate-400">/mo</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold tracking-wider"><TranslatedText>Lead Volume</TranslatedText></span>
                        <span className="text-xs font-bold text-slate-200 mt-1 inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                          {site.estimatedLeads}
                        </span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center gap-2.5 text-xs text-slate-350">
                        <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <span><TranslatedText>Optimized Mobile-Responsive Landing Page</TranslatedText></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-350">
                        <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <span><TranslatedText>Custom Phone Number with Voice SIP Routing</TranslatedText></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-350">
                        <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <span><TranslatedText>24/7 AI Voice Dispatcher (ElevenLabs)</TranslatedText></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-350">
                        <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <span><TranslatedText>Cal.com Real-time Calendar Scheduling</TranslatedText></span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 pb-6 border-t border-slate-850/80 gap-3 relative z-10 bg-slate-950/20">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(site.isDemo ? `/landing-pages/${site.defaultLandingPage}` : `/pages/${site.id}`, '_blank')}
                      className="flex-1 border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white"
                    >
                      <Globe className="h-4 w-4 mr-2 text-slate-400" />
                      <TranslatedText>Live Demo</TranslatedText>
                      <ExternalLink className="h-3 w-3 ml-1 text-slate-500" />
                    </Button>
                    
                    <Button 
                      onClick={() => handleLeaseSite(site)}
                      disabled={checkoutLoading === site.id}
                      className="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-600/20"
                    >
                      {checkoutLoading === site.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <TranslatedText>Redirecting...</TranslatedText>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-indigo-200" />
                          <TranslatedText>Lease Site</TranslatedText>
                          <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
