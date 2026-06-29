'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, MapPin, CheckCircle2, 
  XCircle, Plus, Activity, Info, Loader2,
  HelpCircle, ArrowLeft, LayoutDashboard, LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import TranslatedText from '@/components/TranslatedText';

interface Opportunity {
  id: string;
  niche: string;
  location: string;
  population: number;
  difficulty: 'Low' | 'Medium' | 'High';
  domain: string;
  available?: boolean;
  checking?: boolean;
  score?: number;
  isCustom?: boolean;
}

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    niche: 'Drywall Repair',
    location: 'Tacoma, WA',
    population: 941000,
    difficulty: 'Low',
    domain: 'tacomadrywallexperts.com',
  },
  {
    id: '2',
    niche: 'Drywall Repair',
    location: 'Tacoma, WA',
    population: 941000,
    difficulty: 'Low',
    domain: 'drywallrepairtacoma.com',
  },
  {
    id: '3',
    niche: 'Gutter Services',
    location: 'Spokane, WA',
    population: 605000,
    difficulty: 'Low',
    domain: 'spokanegutterexperts.com',
  },
  {
    id: '4',
    niche: 'Pressure Washing',
    location: 'Worcester, MA',
    population: 881000,
    difficulty: 'Low',
    domain: 'worcesterpressurewashing.com',
  },
  {
    id: '5',
    niche: 'Pressure Washing',
    location: 'Worcester, MA',
    population: 881000,
    difficulty: 'Low',
    domain: 'pressurewashingworcester.com',
  },
  {
    id: '6',
    niche: 'Junk Removal',
    location: 'Greensboro, NC',
    population: 801000,
    difficulty: 'Low',
    domain: 'greensborojunkpros.com',
  },
  {
    id: '7',
    niche: 'Epoxy Flooring',
    location: 'Reno, NV',
    population: 490000,
    difficulty: 'Medium',
    domain: 'renoepoxypros.com',
  },
  {
    id: '8',
    niche: 'Pest Control',
    location: 'Chattanooga, TN',
    population: 396000,
    difficulty: 'Medium',
    domain: 'chattanoogapestcontrol.com',
  }
];

export default function OpportunitiesPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [loadingAll, setLoadingAll] = useState(false);
  
  // Custom calculator state
  const [customNiche, setCustomNiche] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customState, setCustomState] = useState('');
  const [customPopulation, setCustomPopulation] = useState('500000');
  const [customDifficulty, setCustomDifficulty] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Scoring function
  const calculateScore = (opp: Opportunity) => {
    let score = 0;

    // 1. Population Score (max 40 pts)
    const pop = opp.population;
    if (pop < 200000) score += 15;
    else if (pop >= 200000 && pop < 500000) score += 30;
    else if (pop >= 500000 && pop <= 1200000) score += 40; // Ideal range
    else score += 25; // Large city, high traffic but offsets competition

    // 2. Difficulty Score (max 30 pts)
    if (opp.difficulty === 'Low') score += 30;
    else if (opp.difficulty === 'Medium') score += 20;
    else score += 10;

    // 3. Domain Availability Score (max 30 pts)
    if (opp.available === true) {
      score += 30;
    } else if (opp.available === false) {
      score += 0;
    } else {
      score += 15; // Unknown status neutral weight
    }

    return score;
  };

  const checkDomainAvailability = async (oppsToCheck: Opportunity[]) => {
    const listToFetch = oppsToCheck.map(o => o.domain).join(',');
    if (!listToFetch) return {};

    try {
      const res = await fetch(`/api/dns/check-domain?domains=${listToFetch}`);
      const data = await res.json();
      if (data.results) {
        const resultsMap: Record<string, boolean> = {};
        data.results.forEach((r: any) => {
          resultsMap[r.domain] = r.available;
        });
        return resultsMap;
      }
    } catch (err) {
      console.error('Failed to verify domain availability:', err);
    }
    return {};
  };

  const handleVerifyAll = async () => {
    setLoadingAll(true);
    // Set all checking state
    setOpportunities(prev => prev.map(o => ({ ...o, checking: true })));

    const results = await checkDomainAvailability(opportunities);

    setOpportunities(prev => {
      const updated = prev.map(o => {
        const available = results[o.domain.toLowerCase()] ?? o.available;
        const newOpp = {
          ...o,
          available,
          checking: false,
        };
        newOpp.score = calculateScore(newOpp);
        return newOpp;
      });
      // Sort descending by score
      return updated.sort((a, b) => (b.score || 0) - (a.score || 0));
    });

    setLoadingAll(false);
    toast({
      title: 'Real-Time Audit Completed',
      description: 'Domain records checked and opportunity ranks recalculated.',
    });
  };

  // Run initial score calculation and auto-verify domain availability on mount
  useEffect(() => {
    // 1. Map initial scores
    setOpportunities(prev => {
      const mapped = prev.map(o => ({
        ...o,
        score: calculateScore(o)
      }));
      return mapped.sort((a, b) => (b.score || 0) - (a.score || 0));
    });

    // 2. Auto-run Namecheap availability check
    const autoVerify = async () => {
      setLoadingAll(true);
      setOpportunities(prev => prev.map(o => ({ ...o, checking: true })));
      
      const results = await checkDomainAvailability(INITIAL_OPPORTUNITIES);
      
      setOpportunities(prev => {
        const updated = prev.map(o => {
          const available = results[o.domain.toLowerCase()] ?? o.available;
          const newOpp = {
            ...o,
            available,
            checking: false,
          };
          newOpp.score = calculateScore(newOpp);
          return newOpp;
        });
        return updated.sort((a, b) => (b.score || 0) - (a.score || 0));
      });
      setLoadingAll(false);
    };

    autoVerify();
  }, []);

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNiche || !customCity || !customState) {
      toast({
        title: 'Validation Error',
        description: 'Please populate Niche, City, and State fields.',
        variant: 'destructive'
      });
      return;
    }

    // Format domain suggestions
    const formattedCity = customCity.toLowerCase().replace(/[^a-z0-9]/g, '');
    const formattedNiche = customNiche.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanNicheParts = formattedNiche.replace('services', '').replace('repair', '').replace('cleaning', '');
    
    // Domain suggestion e.g. "tacomadrywallexperts.com"
    const suggestedDomain = `${formattedCity}${cleanNicheParts}experts.com`;

    setIsCalculating(true);

    const checkRes = await checkDomainAvailability([{ domain: suggestedDomain } as Opportunity]);
    const available = checkRes[suggestedDomain] ?? true; // assume available if fail check

    const newOpp: Opportunity = {
      id: Date.now().toString(),
      niche: customNiche,
      location: `${customCity}, ${customState.toUpperCase()}`,
      population: parseInt(customPopulation) || 500000,
      difficulty: customDifficulty,
      domain: suggestedDomain,
      available,
      isCustom: true,
    };

    newOpp.score = calculateScore(newOpp);

    setOpportunities(prev => {
      const newList = [newOpp, ...prev];
      return newList.sort((a, b) => (b.score || 0) - (a.score || 0));
    });

    setIsCalculating(false);
    setCustomNiche('');
    setCustomCity('');
    setCustomState('');
    
    toast({
      title: 'Opportunity Calculated!',
      description: `Domain ${suggestedDomain} is ${available ? 'Available' : 'Taken'}. Ranked with score of ${newOpp.score}/100.`,
    });
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
        <p className="mt-4 text-slate-400 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-indigo-400" />
            <Link href="/dashboard" className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-90">
              T3 Automations Asset Manager
            </Link>
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
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Website Portfolio
          </Link>
        </div>

        {/* Title block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Opportunity Finder</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Identify and rank high-potential local service locations and domain assets built for Google & LLM search dominance.
            </p>
          </div>
          <Button 
            onClick={handleVerifyAll} 
            disabled={loadingAll}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold flex items-center gap-2 h-11"
          >
            {loadingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            Run Domain & Score Check
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Custom Analyzer Form */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm self-start space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Activity className="h-5 w-5 text-indigo-450" />
              <h2 className="text-lg font-bold text-white">Custom Site Evaluator</h2>
            </div>
            
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Niche / Service</label>
                <Input 
                  placeholder="e.g. Drywall Repair, HVAC"
                  value={customNiche}
                  onChange={e => setCustomNiche(e.target.value)}
                  className="bg-slate-850 border-slate-700 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">City</label>
                  <Input 
                    placeholder="e.g. Tacoma"
                    value={customCity}
                    onChange={e => setCustomCity(e.target.value)}
                    className="bg-slate-850 border-slate-700 text-white placeholder-slate-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">State (Code)</label>
                  <Input 
                    placeholder="e.g. WA"
                    maxLength={2}
                    value={customState}
                    onChange={e => setCustomState(e.target.value)}
                    className="bg-slate-850 border-slate-700 text-white placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  Metropolitan Population
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger type="button"><HelpCircle className="h-3.5 w-3.5 text-slate-400" /></TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-slate-900 border border-slate-800 text-slate-200">
                        Enter the county or broader metro population. The ideal range is 500k-1.2M.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <Input 
                  type="number"
                  value={customPopulation}
                  onChange={e => setCustomPopulation(e.target.value)}
                  className="bg-slate-850 border-slate-700 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Estimated SEO Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCustomDifficulty(d)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-colors ${
                        customDifficulty === d 
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                          : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold h-11"
              >
                {isCalculating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Analyze & Add to Ranks
              </Button>
            </form>

            <div className="bg-slate-900/40 p-4 rounded-xl text-xs space-y-2 border border-slate-800">
              <span className="font-bold flex items-center gap-1"><Info className="h-3.5 w-3.5 text-indigo-400" /> T3 Score Engine Formula:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 leading-normal">
                <li><strong>Population (40%):</strong> Ideal target is 500k-1.2M people for optimized call volume vs low competition density.</li>
                <li><strong>Difficulty (30%):</strong> Low organic agency dominance gets max points.</li>
                <li><strong>Domain (30%):</strong> Live Namecheap API query verification. Exact Match Domain availability gets max points.</li>
              </ul>
            </div>
          </div>

          {/* Opportunity Rankings Table/Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Niche Rankings & Lead Potential</span>
                <Badge variant="outline" className="text-xs text-slate-400 border-slate-800 bg-slate-950">
                  Sorted by Potential Score
                </Badge>
              </div>

              <div className="divide-y divide-slate-800">
                {opportunities.map((opp, idx) => (
                  <div key={opp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-white">{opp.niche}</span>
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-red-500" /> {opp.location}
                        </span>
                        {opp.isCustom && (
                          <Badge className="bg-emerald-600/15 hover:bg-emerald-600/15 text-emerald-400 text-[10px] py-0 border-none font-bold">
                            Custom
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                        <span>Metro Pop: <strong>{(opp.population / 1000).toFixed(0)}k</strong></span>
                        <span className="h-1 w-1 bg-slate-850 rounded-full" />
                        <span>SEO Difficulty: <strong className={
                          opp.difficulty === 'Low' ? 'text-emerald-500' : opp.difficulty === 'Medium' ? 'text-amber-500' : 'text-red-500'
                        }>{opp.difficulty}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-slate-400 font-mono select-all bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{opp.domain}</span>
                        {opp.checking ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                        ) : opp.available === true ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Domain Available
                          </span>
                        ) : opp.available === false ? (
                          <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5" /> Taken
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Domain unchecked</span>
                        )}
                      </div>
                    </div>

                    {/* Circular Score Gauge */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-black text-indigo-400">
                          {opp.score ?? 50}<span className="text-xs font-normal text-slate-400">/100</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opportunity</span>
                      </div>
                      <div className="h-10 w-10 rounded-full border-4 border-slate-800 flex items-center justify-center relative overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-indigo-500/10 transition-all"
                          style={{ height: `${opp.score ?? 50}%`, bottom: 0, top: 'auto' }}
                        />
                        <span className="text-xs font-black text-indigo-400 relative z-10">#{idx + 1}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
