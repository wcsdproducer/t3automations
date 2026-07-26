'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  useUser,
  useFirestore,
  useDoc,
  useCollection,
  useMemoFirebase,
  setDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  CheckCircle2,
  Globe,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Copy,
  Sparkles,
  Search,
  BookOpen,
  MapPin,
  Check,
  ChevronRight,
  ArrowRight,
  FileText,
  Send,
  Sliders,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { triggerBlogGeneration } from '@/app/actions/blog-seo';
import { generateLocalSeoAndInterlinking } from '@/app/actions/seo-generation';

type StepId = 'domain' | 'dns' | 'gsc-verification' | 'sitemap-indexing' | 'local-seo' | 'blog-seo';

interface Step {
  id: StepId;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 'domain', title: 'Domain Mapping', description: 'Connect your business web address' },
  { id: 'dns', title: 'Registrar DNS Settings', description: 'Configure A, TXT, and CNAME records' },
  { id: 'gsc-verification', title: 'Google Ownership', description: 'Verify site ownership via GSC' },
  { id: 'sitemap-indexing', title: 'Sitemap & Indexing', description: 'Submit sitemap to Google search index' },
  { id: 'local-seo', title: 'Local Schema & Keywords', description: 'Generate JSON-LD & target location' },
  { id: 'blog-seo', title: 'AI Blog Strategy', description: 'Set cron schedule & run article builder' },
];

function getEstablishedDefaults(profile: any) {
  let city = 'Tampa';
  let state = 'FL';
  
  const nameOrId = `${profile?.businessName || ''} ${profile?.id || ''} ${profile?.customDomain || ''}`.toLowerCase();
  
  if (nameOrId.includes('boise')) {
    city = 'Boise';
    state = 'ID';
  } else if (nameOrId.includes('knoxville')) {
    city = 'Knoxville';
    state = 'TN';
  } else if (nameOrId.includes('tacoma')) {
    city = 'Tacoma';
    state = 'WA';
  } else if (nameOrId.includes('spokane')) {
    city = 'Spokane';
    state = 'WA';
  } else if (nameOrId.includes('worcester')) {
    city = 'Worcester';
    state = 'MA';
  } else if (nameOrId.includes('greensboro')) {
    city = 'Greensboro';
    state = 'NC';
  } else if (nameOrId.includes('reno')) {
    city = 'Reno';
    state = 'NV';
  } else if (nameOrId.includes('chattanooga')) {
    city = 'Chattanooga';
    state = 'TN';
  } else if (nameOrId.includes('richmond')) {
    city = 'Richmond';
    state = 'VA';
  }
  
  const targetCity = `${city}, ${state}`;

  const service = (profile?.service || profile?.niche || '').toLowerCase();
  let keywords: string[] = [];
  
  if (service.includes('tree')) {
    keywords = ["tree trimming", "tree removal", "stump grinding", "arborist", "emergency tree service"];
  } else if (service.includes('epoxy')) {
    keywords = ["epoxy flooring", "garage floor coating", "commercial epoxy", "metallic epoxy", "concrete prep"];
  } else if (service.includes('concrete') || service.includes('paving')) {
    keywords = ["concrete pouring", "concrete sealing", "driveway paving", "patio installation", "concrete repair"];
  } else if (service.includes('appliance')) {
    keywords = ["appliance repair", "refrigerator repair", "washer dryer repair", "oven repair", "dishwasher repair"];
  } else if (service.includes('pest')) {
    keywords = ["pest control", "exterminator", "termite treatment", "bed bug removal", "rodent control"];
  } else if (service.includes('junk')) {
    keywords = ["junk removal", "trash hauling", "appliance cleanout", "estate cleanout", "construction debris"];
  } else if (service.includes('drywall')) {
    keywords = ["drywall repair", "sheetrock installation", "ceiling repair", "wall patching", "popcorn ceiling removal"];
  } else if (service.includes('gutter')) {
    keywords = ["gutter cleaning", "gutter installation", "gutter guards", "seamless gutters", "gutter repair"];
  } else if (service.includes('pressure') || service.includes('wash')) {
    keywords = ["pressure washing", "power washing", "house washing", "roof cleaning", "driveway cleaning"];
  } else {
    keywords = ["local service", "professional contractor", "affordable pricing", "top rated"];
  }

  return { targetCity, keywords };
}

export function SiteLauncher() {
  const { user } = useUser();
  const params = useParams();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userIdSlug = params?.userId as string;
  const profileId = userIdSlug || user?.uid;

  // Active step in Wizard
  const [activeStep, setActiveStep] = useState<StepId>('domain');

  // Input states
  const [domainInput, setDomainInput] = useState('');
  const [isSubmittingDomain, setIsSubmittingDomain] = useState(false);
  const [checkingDns, setCheckingDns] = useState(false);
  const [configuringNamecheap, setConfiguringNamecheap] = useState(false);

  // GSC actions states
  const [generatingGscToken, setGeneratingGscToken] = useState(false);
  const [verifyingGsc, setVerifyingGsc] = useState(false);
  const [customGscToken, setCustomGscToken] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);

  // Local SEO states
  const [targetCity, setTargetCity] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [isSavingLocalSeo, setIsSavingLocalSeo] = useState(false);

  // Blog Engine states
  const [postingSchedule, setPostingSchedule] = useState<'3x-daily' | 'daily' | 'weekly' | 'manual'>('daily');
  const [isSavingBlogSchedule, setIsSavingBlogSchedule] = useState(false);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [blogLogs, setBlogLogs] = useState<string[]>([]);

  // Fetch Business Profile
  const profileDocRef = useMemoFirebase(() => {
    if (!profileId || !firestore) return null;
    return doc(firestore, 'businessProfiles', profileId);
  }, [profileId, firestore]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<any>(profileDocRef);

  // Fetch Custom Domain
  const customDomainsRef = useMemoFirebase(() => {
    if (!profileId || !firestore) return null;
    return collection(firestore, `businessProfiles/${profileId}/customDomains`);
  }, [profileId, firestore]);
  const { data: domains, isLoading: isDomainsLoading } = useCollection(customDomainsRef);

  const activeDomainDoc = domains && domains.length > 0 ? domains[0] : null;
  const activeDomain = activeDomainDoc?.domain || '';

  // Seed default inputs from Firestore and auto-save defaults if empty
  useEffect(() => {
    if (profile && firestore && profileId) {
      const defaults = getEstablishedDefaults(profile);
      const updatedCity = profile.targetCity || defaults.targetCity;
      const updatedKeywords = profile.nicheKeywords || defaults.keywords;

      setTargetCity(updatedCity);
      setKeywordsInput(profile.nicheKeywords ? profile.nicheKeywords.join(', ') : defaults.keywords.join(', '));
      setPostingSchedule(profile.blogPostingSchedule || 'daily');

      const needsUpdate = !profile.targetCity || !profile.nicheKeywords || profile.nicheKeywords.length === 0;
      if (needsUpdate) {
        const docRef = doc(firestore, 'businessProfiles', profileId);
        setDocumentNonBlocking(docRef, {
          targetCity: updatedCity,
          nicheKeywords: updatedKeywords,
        }, { merge: true });
      }

      // Initialize custom token input with existing token if present
      if (profile.googleSiteVerification && !customGscToken) {
        setCustomGscToken(profile.googleSiteVerification);
      }
    }
  }, [profile, firestore, profileId]);

  // Determine active step based on progress if first loading
  useEffect(() => {
    if (activeDomainDoc) {
      if (activeDomainDoc.status === 'active') {
        if (profile?.googleSiteVerified) {
          setActiveStep('sitemap-indexing');
        } else {
          setActiveStep('gsc-verification');
        }
      } else {
        setActiveStep('dns');
      }
    } else {
      setActiveStep('domain');
    }
  }, [activeDomainDoc, profile]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId || !firestore) return;

    let domain = domainInput.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '');
    domain = domain.replace(/\/.*$/, '');

    if (!domain || !domain.includes('.')) {
      toast({
        title: 'Invalid Domain',
        description: 'Please enter a valid domain (e.g., example.com)',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingDomain(true);
    try {
      const docRef = doc(firestore, `businessProfiles/${profileId}/customDomains/${domain}`);
      await setDocumentNonBlocking(docRef, {
        id: domain,
        businessProfileId: profileId,
        domain: domain,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }, { merge: true });

      setDomainInput('');
      toast({
        title: 'Domain Connection Registered',
        description: `${domain} registered. Configuring Firebase App Hosting...`,
      });

      // Check status to trigger API call immediately
      handleCheckDns(domain);
      setActiveStep('dns');
    } catch (error) {
      console.error('Error adding domain', error);
      toast({ title: 'Error', description: 'Failed to connection domain.', variant: 'destructive' });
    } finally {
      setIsSubmittingDomain(false);
    }
  };

  const handleCheckDns = async (domainName: string) => {
    if (!profileId) return;
    setCheckingDns(true);
    try {
      const res = await fetch('/api/check-domain-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainName, userId: profileId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'DNS check failed');

      toast({
        title: `DNS Resolved — ${data.status.toUpperCase()}`,
        description: data.detail,
      });

      if (data.status === 'active' || data.status === 'provisioning') {
        setActiveStep('gsc-verification');
      }
    } catch (error: any) {
      toast({
        title: 'DNS Verification Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCheckingDns(false);
    }
  };

  const handleConfigureNamecheap = async () => {
    if (!profileId || !activeDomain) return;
    setConfiguringNamecheap(true);
    try {
      const res = await fetch('/api/dns/configure-namecheap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: activeDomain, userId: profileId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Configuration failed');

      toast({
        title: 'Namecheap DNS Configured!',
        description: data.detail || 'DNS records added successfully.',
      });

      // Automatically trigger check dns status
      handleCheckDns(activeDomain);
    } catch (error: any) {
      toast({
        title: 'Auto-Configuration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setConfiguringNamecheap(false);
    }
  };

  const handleGetGscToken = async () => {
    if (!profileId || !activeDomain) return;
    setGeneratingGscToken(true);
    try {
      const res = await fetch('/api/gsc/verify-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getToken', userId: profileId, domain: activeDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get GSC verification token');

      toast({
        title: 'Verification Tag Stored',
        description: 'Successfully generated GSC HTML Tag and saved to your landing page header.',
      });
    } catch (error: any) {
      toast({
        title: 'Google Verification Token Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGeneratingGscToken(false);
    }
  };

  const handleSaveCustomToken = async () => {
    if (!profileId || !firestore) return;
    if (!customGscToken.trim()) {
      toast({ title: 'Invalid Token', description: 'Please enter a valid token or meta tag.', variant: 'destructive' });
      return;
    }
    
    setIsSavingToken(true);
    try {
      // Extract token if user pasted the full HTML meta tag
      const match = customGscToken.match(/content="([^"]+)"/);
      const cleanToken = match ? match[1] : customGscToken.trim();

      const docRef = doc(firestore, 'businessProfiles', profileId);
      await setDocumentNonBlocking(docRef, {
        googleSiteVerification: cleanToken,
      }, { merge: true });
      
      setCustomGscToken(cleanToken);
      
      toast({
        title: 'Verification Tag Stored',
        description: 'Successfully saved custom Google Site Verification tag. It will be injected into your site headers.',
      });
    } catch (error: any) {
      toast({
        title: 'Error Saving Token',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleVerifyGscOwnership = async () => {
    if (!profileId || !activeDomain) return;
    setVerifyingGsc(true);
    try {
      const res = await fetch('/api/gsc/verify-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', userId: profileId, domain: activeDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      toast({
        title: 'Google Verified!',
        description: data.detail || 'Site verified and registered in Google Search Console.',
      });

      setActiveStep('sitemap-indexing');
    } catch (error: any) {
      toast({
        title: 'Google Verification Pending',
        description: error.message || 'Make sure your domain DNS changes have propagated and metadata is updated.',
        variant: 'destructive',
      });
    } finally {
      setVerifyingGsc(false);
    }
  };

  const handleSaveLocalSeo = async () => {
    if (!profileId || !firestore) return;
    setIsSavingLocalSeo(true);
    try {
      const cleanKeywords = keywordsInput
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 0);

      const docRef = doc(firestore, 'businessProfiles', profileId);
      await setDocumentNonBlocking(docRef, {
        targetCity: targetCity.trim(),
        nicheKeywords: cleanKeywords,
      }, { merge: true });

      // Trigger server action to generate surrounding cities/neighborhoods and interlinking
      const res = await generateLocalSeoAndInterlinking(profileId);
      if (!res.success) {
        throw new Error(res.error || 'Failed to auto-generate local SEO assets.');
      }

      toast({
        title: 'Local SEO Updated & Generated',
        description: 'Business schema, surrounding cities, and network interlinking successfully generated.',
      });
      setActiveStep('blog-seo');
    } catch (error: any) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    } finally {
      setIsSavingLocalSeo(false);
    }
  };

  const handleSaveBlogSchedule = async () => {
    if (!profileId || !firestore) return;
    setIsSavingBlogSchedule(true);
    try {
      const docRef = doc(firestore, 'businessProfiles', profileId);
      await setDocumentNonBlocking(docRef, {
        blogPostingSchedule: postingSchedule,
      }, { merge: true });

      toast({
        title: 'Content Strategy Saved',
        description: `Automated posting set to ${postingSchedule}.`,
      });
    } catch (error: any) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    } finally {
      setIsSavingBlogSchedule(false);
    }
  };

  const handleTriggerManualBlog = async () => {
    if (!profileId) return;
    setIsGeneratingBlog(true);
    setBlogLogs(['[System] Initiating Gemini AI Content Writer...', '[System] Contextualizing with local keywords...']);

    try {
      const timer1 = setTimeout(() => setBlogLogs(prev => [...prev, '[SEO Agent] Analyzing local search volume...', '[SEO Agent] Formulating high-intent title strategy...']), 2000);
      const timer2 = setTimeout(() => setBlogLogs(prev => [...prev, '[Gemini] Drafting comprehensive long-form article structure...', '[Gemini] Writing light-themed local service callouts...', '[Deepgram/Gemini] Integrating keyword references...']), 5000);
      const timer3 = setTimeout(() => setBlogLogs(prev => [...prev, '[System] Associating matching niche imagery from library...', '[System] Creating dynamic article slug...']), 8000);

      const res = await triggerBlogGeneration(profileId);
      
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (res.success) {
        setBlogLogs(prev => [...prev, '[Success] Successfully created new article!', '[Success] Firestore blog collection sync completed. Wait for rebuild...']);
        toast({
          title: 'AI Article Generated',
          description: 'Successfully published new SEO article!',
        });
      } else {
        throw new Error(res.error || 'Failed to trigger blog generation.');
      }
    } catch (error: any) {
      setBlogLogs(prev => [...prev, `[Error] Blog generation failed: ${error.message}`]);
      toast({
        title: 'AI Writing Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  // Generate local business schema markup to display
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': profile?.businessName || 'T3 Niche Business',
    'image': profile?.logoUrl || '/images/default-logo.png',
    'email': profile?.contactEmail || '',
    'telephone': profile?.phoneNumber || '',
    'url': activeDomain ? `https://${activeDomain}` : '',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': targetCity || 'Tampa',
      'addressRegion': 'FL',
    },
    'description': profile?.metaDescription || profile?.service || 'Professional Niche Services',
  };

  if (isProfileLoading || isDomainsLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Dynamic checklist completions
  const isStepCompleted = (stepId: StepId) => {
    switch (stepId) {
      case 'domain':
        return !!activeDomain;
      case 'dns':
        return activeDomainDoc?.status === 'active';
      case 'gsc-verification':
        return !!profile?.googleSiteVerified;
      case 'sitemap-indexing':
        return !!profile?.sitemapSubmitted;
      case 'local-seo':
        return !!profile?.targetCity && !!profile?.nicheKeywords && profile.nicheKeywords.length > 0;
      case 'blog-seo':
        return !!profile?.blogPostingSchedule && profile.blogPostingSchedule !== 'manual';
      default:
        return false;
    }
  };

  const completedCount = STEPS.filter(step => isStepCompleted(step.id)).length;
  const progressPercentage = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="space-y-6 w-full">
      {/* Dynamic Launch Progress Header Card */}
      <Card className="border-border/40 bg-slate-900/60 backdrop-blur-md overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
              <h2 className="text-base font-bold text-slate-100">Site Launch Completion Checklist</h2>
            </div>
            <p className="text-xs text-slate-400">
              Complete all launch steps to get your website fully certified, indexed, and automated.
            </p>
            {/* Progress bar container */}
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden border border-slate-700/50">
              <div 
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between shrink-0 gap-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Progress</span>
            <span className="text-2xl font-black text-indigo-400 font-mono leading-none mt-1">{progressPercentage}%</span>
            <span className="text-[10px] text-slate-400 mt-1 font-semibold">{completedCount} of {STEPS.length} Completed</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Wizard Step List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-slate-900/40 border border-border/40 rounded-xl p-4 space-y-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-indigo-400 mb-3">Launch Steps</h3>
            {STEPS.map((step, idx) => {
              const isCompleted = isStepCompleted(step.id);
              const isActive = activeStep === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-all text-xs ${
                    isActive
                      ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-white font-medium'
                      : 'text-muted-foreground hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`mt-0.5 rounded-full p-0.5 ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5 flex items-center justify-center font-bold text-[9px]">{idx + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className={`font-semibold ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>{step.title}</p>
                      {isCompleted && (
                        <span className="text-[8px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded shrink-0 border border-green-500/15">
                          Done
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      {/* Wizard Content Panel */}
      <div className="lg:col-span-3">
        <Card className="border-border/40 bg-slate-950/40 backdrop-blur-md">
          {activeStep === 'domain' && (
            <>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Globe className="h-5 w-5 text-indigo-400" />
                  Step 1: Custom Domain Setup
                </CardTitle>
                <CardDescription>
                  Enter the domain you bought at your registrar (e.g. GoDaddy, Namecheap) to connect your customer-facing marketing website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeDomain ? (
                  <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-200">Connected Custom Domain</p>
                      <p className="text-xs text-muted-foreground font-mono">{activeDomain}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveStep('dns')} className="gap-2">
                      DNS Config
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleAddDomain} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain" className="text-slate-300 font-semibold text-sm">Enter Custom Domain Name</Label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          id="domain"
                          placeholder="e.g. tampaepoxycoatings.com"
                          value={domainInput}
                          onChange={(e) => setDomainInput(e.target.value)}
                          className="flex-1 bg-slate-900 border-border/50 text-white placeholder:text-slate-500"
                        />
                        <Button type="submit" disabled={isSubmittingDomain || !domainInput} className="bg-indigo-600 hover:bg-indigo-500">
                          {isSubmittingDomain ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Add Domain
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Do not include http:// or www. Just input the clean address, e.g. <code>richmondjunkpros.com</code>
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </>
          )}

          {activeStep === 'dns' && (
            <>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-amber-400" />
                  Step 2: Add DNS Records to Registrar
                </CardTitle>
                <CardDescription>
                  Configure these records at your DNS registrar so traffic resolves to Google Firebase App Hosting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!activeDomain ? (
                  <div className="text-center p-6 text-muted-foreground">Please configure Step 1: Domain Mapping first.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Domain: </span>
                        <strong className="text-sm font-mono text-white">{activeDomain}</strong>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleConfigureNamecheap}
                          disabled={configuringNamecheap}
                          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs h-9 shadow-md shadow-orange-500/10"
                        >
                          {configuringNamecheap ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4 text-orange-200" />
                          )}
                          Auto-Configure Namecheap DNS
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckDns(activeDomain)}
                          disabled={checkingDns}
                          className="bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 h-9"
                        >
                          {checkingDns ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-400" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4 text-indigo-400" />
                          )}
                          Check Status Live
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-border/40 bg-slate-950/60 text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                            <th className="p-3">Type</th>
                            <th className="p-3">Host/Name</th>
                            <th className="p-3">Target Value</th>
                            <th className="p-3 text-right">Copy</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 font-mono">
                          {/* A Records */}
                          {(activeDomainDoc?.dnsRecords?.aRecords || ['35.219.200.2']).map((ip: string, idx: number) => (
                            <tr key={`a-${idx}`} className="hover:bg-muted/5">
                              <td className="p-3 text-slate-400">A</td>
                              <td className="p-3 text-slate-400">@</td>
                              <td className="p-3 text-white font-semibold">{ip}</td>
                              <td className="p-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    navigator.clipboard.writeText(ip);
                                    toast({ title: 'Copied A Record!', description: ip });
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}

                          {/* TXT Record */}
                          <tr className="hover:bg-muted/5">
                            <td className="p-3 text-indigo-400">TXT</td>
                            <td className="p-3 text-indigo-400">@</td>
                            <td className="p-3 text-indigo-300 truncate max-w-[240px]" title={activeDomainDoc?.dnsRecords?.txtRecord}>
                              {activeDomainDoc?.dnsRecords?.txtRecord || `fah-claim=002-02-${activeDomainDoc?.uid || 'pending'}`}
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  const text = activeDomainDoc?.dnsRecords?.txtRecord || `fah-claim=002-02-${activeDomainDoc?.uid}`;
                                  navigator.clipboard.writeText(text);
                                  toast({ title: 'Copied TXT Record!', description: text });
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>

                          {/* CNAME SSL Record */}
                          <tr className="hover:bg-muted/5">
                            <td className="p-3 text-amber-400">CNAME</td>
                            <td className="p-3 text-amber-400 truncate max-w-[120px]" title={activeDomainDoc?.dnsRecords?.cnameHost || '_acme-challenge'}>
                              {activeDomainDoc?.dnsRecords?.cnameHost || '_acme-challenge'}
                            </td>
                            <td className="p-3 text-amber-300 truncate max-w-[240px]" title={activeDomainDoc?.dnsRecords?.cnameValue || 'waiting for API...'}>
                              {activeDomainDoc?.dnsRecords?.cnameValue || '[SSL verification challenge preparing]'}
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={!activeDomainDoc?.dnsRecords?.cnameValue}
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  if (activeDomainDoc?.dnsRecords?.cnameValue) {
                                    navigator.clipboard.writeText(activeDomainDoc.dnsRecords.cnameValue);
                                    toast({ title: 'Copied CNAME target!', description: activeDomainDoc.dnsRecords.cnameValue });
                                  }
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {activeStep === 'gsc-verification' && (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                    Step 3: Google Ownership Verification
                  </CardTitle>
                  {profile?.googleSiteVerified ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20 text-[11px] px-2 py-0.5">
                      Verified
                    </Badge>
                  ) : profile?.googleSiteVerification ? (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 text-[11px] px-2 py-0.5 animate-pulse">
                      Pending Verification
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/20 text-[11px] px-2 py-0.5">
                      Not Generated
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Inject your Google verification token into the page head dynamically, then request Google to check ownership.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!activeDomain ? (
                  <div className="text-center p-6 text-muted-foreground">Please configure Step 1: Domain Mapping first.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl border border-indigo-500/20 bg-slate-900/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-200">Current Token Status</h4>
                        {profile?.googleSiteVerified && (
                          <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                            Ownership Confirmed
                          </span>
                        )}
                      </div>
                      
                      {profile?.googleSiteVerification ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                              <CheckCircle2 className="h-4 w-4" />
                              HTML Meta tag injected:
                            </div>
                            {!profile?.googleSiteVerified && (
                              <Button
                                onClick={handleGetGscToken}
                                disabled={generatingGscToken}
                                variant="ghost"
                                className="text-[10px] h-6 text-muted-foreground hover:text-indigo-400 p-0 px-2"
                              >
                                {generatingGscToken ? 'Regenerating...' : 'Regenerate Token'}
                              </Button>
                            )}
                          </div>
                          <code className="block bg-slate-950 p-2.5 rounded text-[11px] text-indigo-300 overflow-x-auto select-all">
                            &lt;meta name=&quot;google-site-verification&quot; content=&quot;{profile.googleSiteVerification}&quot; /&gt;
                          </code>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            You haven&apos;t generated a Google verification token yet.
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="customGscToken" className="text-slate-300 font-semibold text-xs">Custom Verification Tag or Token</Label>
                            <Input
                              id="customGscToken"
                              placeholder='e.g. <meta name="google-site-verification" content="YOUR_TOKEN" />'
                              value={customGscToken}
                              onChange={(e) => setCustomGscToken(e.target.value)}
                              className="bg-slate-900 border-border/50 text-white placeholder:text-slate-500 text-xs"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={handleSaveCustomToken}
                              disabled={isSavingToken || !customGscToken}
                              className="bg-indigo-600 hover:bg-indigo-500 text-xs h-9 flex-1"
                            >
                              {isSavingToken ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                              Save & Inject Verification Tag
                            </Button>
                            <Button
                              onClick={handleGetGscToken}
                              disabled={generatingGscToken}
                              variant="outline"
                              className="text-xs h-9"
                            >
                              {generatingGscToken ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Auto-Generate'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-200">Trigger Ownership Verification</h4>
                      <p className="text-xs text-muted-foreground">
                        After saving/injecting your token, wait a few moments (or up to 15 minutes for SSL/DNS to propagate). Then click below to verify ownership directly with Google Search Console.
                      </p>
                      <Button
                        onClick={handleVerifyGscOwnership}
                        disabled={verifyingGsc || !profile?.googleSiteVerification || profile?.googleSiteVerified}
                        className="bg-indigo-600 hover:bg-indigo-500 w-full"
                      >
                        {verifyingGsc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        {profile?.googleSiteVerified ? 'Ownership Fully Verified & Registered' : 'Verify & Add to Search Console'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {activeStep === 'sitemap-indexing' && (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Search className="h-5 w-5 text-indigo-400" />
                    Step 4: Sitemap XML & Google Indexing
                  </CardTitle>
                  {profile?.googleSiteIndexed ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20 text-[11px] px-2 py-0.5">
                      Indexing Complete
                    </Badge>
                  ) : profile?.sitemapSubmitted ? (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 text-[11px] px-2 py-0.5 animate-pulse">
                      Indexing Pending
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/20 text-[11px] px-2 py-0.5">
                      Not Indexed
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Submit your dynamically compiled sitemap so Google starts crawling and index matching all landing pages and blog posts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!activeDomain ? (
                  <div className="text-center p-6 text-muted-foreground">Please configure Step 1: Domain Mapping first.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Sitemap Location:</span>
                        <p className="text-xs font-mono text-indigo-300 select-all">https://{activeDomain}/sitemap.xml</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-slate-800"
                        onClick={() => window.open(`https://${activeDomain}/sitemap.xml`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">Google Indexing Status</span>
                        {profile?.googleSiteIndexed ? (
                          <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Live on Google Search
                          </span>
                        ) : profile?.sitemapSubmitted ? (
                          <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 animate-pulse">
                            <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Crawl & Indexing In Progress
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-500/10 px-2 py-0.5 rounded border border-slate-500/20">
                            Submission Required
                          </span>
                        )}
                      </div>
                      
                      {profile?.googleSiteIndexed ? (
                        <div className="p-3 bg-green-500/5 rounded-lg text-xs space-y-1 text-slate-300 border border-green-500/10">
                          <p className="font-semibold text-green-400">All pages indexed successfully!</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Google has processed your sitemap. Your homepage, blog index, and all published articles are live and searchable on Google.
                          </p>
                        </div>
                      ) : profile?.sitemapSubmitted ? (
                        <div className="p-3 bg-slate-900/80 rounded-lg text-xs space-y-1.5 text-slate-300 border border-slate-800/60">
                          <p className="font-semibold text-indigo-400">Google Crawl Status: Pending</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Your sitemap has been accepted by Google Search Console. Google is currently crawling your pages. This process normally completes within 24-48 hours.
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground p-1">
                          Click &quot;Submit Sitemap Now&quot; below to trigger initial crawling and indexing.
                        </p>
                      )}
                    </div>

                    <div className="p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-200">
                          {profile?.sitemapSubmitted ? 'Sitemap Submitted' : 'Submit XML Sitemap'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Google automatically crawls the sitemap periodically. When creating new content or landing pages, you can trigger a manual crawl update.
                        </p>
                      </div>
                      <Button
                        onClick={handleVerifyGscOwnership} // This triggers sitemap submit inside the verify action
                        disabled={verifyingGsc || profile?.sitemapSubmitted}
                        className={profile?.sitemapSubmitted 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20 text-xs h-9 w-full sm:w-auto hover:bg-green-500/10" 
                          : "bg-indigo-600 hover:bg-indigo-500 text-xs h-9 font-semibold w-full sm:w-auto"
                        }
                      >
                        {verifyingGsc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {profile?.sitemapSubmitted ? 'Sitemap Successfully Submitted' : 'Submit Sitemap Now'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {activeStep === 'local-seo' && (
            <>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-400" />
                  Step 5: Local SEO Schema Builder & Keywords
                </CardTitle>
                <CardDescription>
                  Configure local targeting settings to auto-inject LocalBusiness structured metadata schemas into your landing pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-slate-300 text-xs uppercase font-semibold">Target Service City/State</Label>
                      <Input
                        id="city"
                        placeholder="e.g. Tampa, FL"
                        value={targetCity}
                        onChange={(e) => setTargetCity(e.target.value)}
                        className="bg-slate-900 border-border/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keywords" className="text-slate-300 text-xs uppercase font-semibold">Target Keywords (Comma Separated)</Label>
                      <Input
                        id="keywords"
                        placeholder="e.g. tree trimming, oak pruning, stump removal"
                        value={keywordsInput}
                        onChange={(e) => setKeywordsInput(e.target.value)}
                        className="bg-slate-900 border-border/50 text-white"
                      />
                    </div>

                    <Button onClick={handleSaveLocalSeo} disabled={isSavingLocalSeo} className="bg-indigo-600 hover:bg-indigo-500 w-full mt-4">
                      {isSavingLocalSeo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                      Save Local Settings & Generate Schema
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground uppercase font-semibold block">Generated JSON-LD Schema</span>
                    <pre className="bg-slate-950 p-4 rounded-xl text-[10px] text-indigo-300 font-mono max-h-[220px] overflow-y-auto border border-border/30">
                      {JSON.stringify(schemaMarkup, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {activeStep === 'blog-seo' && (
            <>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  Step 6: AI Content Engine & Scheduler
                </CardTitle>
                <CardDescription>
                  Configure automated article posting frequency and manually execute the Gemini Content Builder.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Scheduling Column */}
                  <div className="md:col-span-1 border border-border/40 bg-slate-900/30 rounded-xl p-4 space-y-4">
                    <h4 className="text-xs uppercase font-bold tracking-wide text-indigo-400">Schedule Strategy</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <Label htmlFor="sched-3x" className="text-slate-300">3x Daily Posting (SEO Sprint)</Label>
                        <Switch
                          id="sched-3x"
                          checked={postingSchedule === '3x-daily'}
                          onCheckedChange={(checked) => checked && setPostingSchedule('3x-daily')}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <Label htmlFor="sched-daily" className="text-slate-300">Daily Blog Post (Standard)</Label>
                        <Switch
                          id="sched-daily"
                          checked={postingSchedule === 'daily'}
                          onCheckedChange={(checked) => checked && setPostingSchedule('daily')}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <Label htmlFor="sched-weekly" className="text-slate-300">Weekly Blog Post (Maintenance)</Label>
                        <Switch
                          id="sched-weekly"
                          checked={postingSchedule === 'weekly'}
                          onCheckedChange={(checked) => checked && setPostingSchedule('weekly')}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <Label htmlFor="sched-manual" className="text-slate-300">Manual / Off</Label>
                        <Switch
                          id="sched-manual"
                          checked={postingSchedule === 'manual'}
                          onCheckedChange={(checked) => checked && setPostingSchedule('manual')}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveBlogSchedule} disabled={isSavingBlogSchedule} className="w-full text-xs h-9" variant="outline">
                      {isSavingBlogSchedule ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                      Save Schedule Settings
                    </Button>
                  </div>

                  {/* Manual AI Post Column */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-bold tracking-wide text-indigo-400">Manual AI Article Builder</h4>
                      <p className="text-xs text-muted-foreground">
                        Want a post right now? Trigger our Gemini agent to write, illustrate, and publish a detailed post immediately using your target local keywords.
                      </p>
                    </div>

                    <Button onClick={handleTriggerManualBlog} disabled={isGeneratingBlog} className="bg-indigo-600 hover:bg-indigo-500 w-full">
                      {isGeneratingBlog ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Generate SEO Article Instantly
                    </Button>

                    {/* AI Log Console */}
                    {blogLogs.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">Agent Build logs:</span>
                        <div className="bg-slate-950 border border-border/30 rounded-xl p-3 h-[120px] overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1">
                          {blogLogs.map((log, index) => (
                            <div key={index} className={log.startsWith('[Error]') ? 'text-red-400' : log.startsWith('[Success]') ? 'text-green-400' : 'text-slate-300'}>
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  </div>
  );
}
