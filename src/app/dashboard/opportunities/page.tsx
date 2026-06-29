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

import { scoutOpportunitiesWithAI } from '@/app/actions/opportunities';

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

export default function OpportunitiesPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  
  // AI Scout state
  const [isScouting, setIsScouting] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleAIScout = async () => {
    setIsScouting(true);
    toast({
      title: 'AI Opportunity Scout Activated',
      description: 'Scouting, checking domain records, and scoring opportunities...',
    });

    const res = await scoutOpportunitiesWithAI();
    if (!res.success || !res.opportunities) {
      toast({
        title: 'Scouting Failed',
        description: res.error || 'Failed to scout opportunities with AI.',
        variant: 'destructive',
      });
      setIsScouting(false);
      return;
    }

    const availableOpps = (res.opportunities as Opportunity[]).filter(o => o.available === true);

    setOpportunities(prev => {
      const merged = [...availableOpps, ...prev];
      // remove duplicates by domain
      const unique = merged.filter((item, index, self) => 
        self.findIndex(t => t.domain === item.domain) === index
      );
      return unique.sort((a, b) => (b.score || 0) - (a.score || 0));
    });

    setIsScouting(false);
    toast({
      title: 'Scouting Complete!',
      description: `Identified and verified ${availableOpps.length} available opportunities.`,
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* AI Opportunity Scout Panel */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm self-start space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">AI Opportunity Scout</h2>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Activate the AI scout to autonomously analyze US metropolitan areas and identify high-yield local service niches with low-competition exact-match domain assets.
            </p>
            
            <Button 
              onClick={handleAIScout}
              disabled={isScouting}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold h-12 text-sm flex items-center justify-center gap-2"
            >
              {isScouting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scouting Markets...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-indigo-200" />
                  Scout Opportunities with AI
                </>
              )}
            </Button>

            <div className="bg-slate-900/40 p-4 rounded-xl text-xs space-y-2 border border-slate-800">
              <span className="font-bold flex items-center gap-1 text-slate-350"><Info className="h-3.5 w-3.5 text-indigo-400" /> T3 Score Engine Formula:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 leading-normal">
                <li><strong>Population (40%):</strong> Ideal target is 500k-1.2M people for optimized call volume vs low competition density.</li>
                <li><strong>Difficulty (30%):</strong> Low organic agency dominance gets max points.</li>
                <li><strong>Domain (30%):</strong> Live DNS availability checks. Exact Match Domain availability gets max points.</li>
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
                {opportunities.length === 0 && isScouting ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-400 font-medium">Scouting high-potential markets and verifying domain records...</p>
                  </div>
                ) : opportunities.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No opportunities found. Click "Scout Opportunities with AI" to generate.
                  </div>
                ) : (
                  opportunities.map((opp, idx) => (
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
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
