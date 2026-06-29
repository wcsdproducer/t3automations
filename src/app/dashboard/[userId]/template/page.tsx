'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, LayoutTemplate, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface TemplateOption {
  id: string;
  name: string;
  niche: string;
  description: string;
  features: string[];
  previewUrl: string;
  thumbnailUrl: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'template-1',
    name: 'Default Template (Modern General)',
    niche: 'General Handyman & Services',
    description: 'Clean, professional corporate design suitable for any local service business with quick estimate forms and trust badges.',
    features: ['High-contrast CTAs', 'Fully responsive layouts', 'Client testimonials section'],
    previewUrl: '/landing-pages/template-1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
  },
  {
    id: 'tree-care',
    name: 'Tree Care Specialists',
    niche: 'Tree Trimming & Removal',
    description: 'Earthy green design optimized for arborist safety checks, large tree removals, storm damage services, and local permits.',
    features: ['ISA Certified arborist badges', '24/7 emergency dispatch highlights', 'Safety process showcase'],
    previewUrl: '/landing-pages/tree-care',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
  },
  {
    id: 'epoxy-flooring',
    name: 'Epoxy Flooring',
    niche: 'Epoxy & Concrete Coatings',
    description: 'Premium modern dark slate theme with high-gloss showcase layout highlighting industrial durability and styling.',
    features: ['Industrial coatings warranties', 'Decorative flake selectors', 'Garage before/after showcases'],
    previewUrl: '/landing-pages/epoxy-flooring',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
  },
  {
    id: 'paving-concrete',
    name: 'Paving & Concrete',
    niche: 'Driveway Paving & Masonry',
    description: 'Solid heavy-construction layout emphasizing concrete placement, brick pavers, custom driveways, and masonry design.',
    features: ['Paver styling portfolios', 'Load capacity indicators', 'Free design consultation flow'],
    previewUrl: '/landing-pages/paving-concrete',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
  },
  {
    id: 'appliance-repair',
    name: 'Appliance Repair',
    niche: 'Household Appliance Services',
    description: 'High-trust corporate theme optimized for urgent same-day diagnostics, refrigerator repairs, and major brand servicing.',
    features: ['Same-day scheduling blocks', '90-day parts & labor warranty', 'Major brand support list'],
    previewUrl: '/landing-pages/appliance-repair',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    niche: 'Exterminators & Pest Defense',
    description: 'Clean eco-friendly green layout emphasizing child & pet safe treatments, termite barriers, and rodent exclusion.',
    features: ['Family & pet friendly guarantees', 'Eco-friendly barrier checklists', 'Targeted stinger removal specials'],
    previewUrl: '/landing-pages/pest-control',
    thumbnailUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
  },
  {
    id: 'junk-removal',
    name: 'Junk Removal',
    niche: 'Hauling, Cleanup & Cleanouts',
    description: 'Eco-conscious dark amber theme optimized for volume-based truck loading quotes, estate cleanouts, and recycling details.',
    features: ['Truck loading scale guides', 'Donation & recycling statistics', 'Same-day residential cleanouts'],
    previewUrl: '/landing-pages/junk-removal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
  },
  {
    id: 'template-2',
    name: 'Legacy Multi-Purpose',
    niche: 'General Trades & Contracting',
    description: 'Clean corporate layout with dynamic services lists and full-width image galleries for multi-trade operations.',
    features: ['Expanded grids', 'Alternative typography', 'General contact details block'],
    previewUrl: '/landing-pages/template-2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
  },
  {
    id: 'template-4',
    name: 'Alternative Clean',
    niche: 'Minimal & Modern',
    description: 'Ultra-minimalist modern layout with focus on typography and clean spacing, reducing friction for estimate submission.',
    features: ['Frictionless quote form', 'Large type hero layouts', 'Minimalist trust badges'],
    previewUrl: '/landing-pages/template-4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
  }
];

export default function TemplateSelectorPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const siteSlug = params.userId as string;
  const router = useRouter();
  const { toast } = useToast();

  const [savingTemplate, setSavingTemplate] = useState<string | null>(null);

  const businessProfileRef = useMemoFirebase(() => {
    if (!user || !firestore || !siteSlug) return null;
    return doc(firestore, 'businessProfiles', siteSlug);
  }, [user, firestore, siteSlug]);

  const { data: businessProfile, isLoading } = useDoc<any>(businessProfileRef);

  const activeTemplate = businessProfile?.defaultLandingPage || 'template-1';

  const handleSelectTemplate = async (templateId: string) => {
    if (!businessProfileRef) return;
    setSavingTemplate(templateId);

    try {
      // Map service defaults to make template content matching nicer
      let newService = businessProfile?.service || 'Handyman Services';
      if (templateId === 'tree-care') newService = 'Tree Services';
      if (templateId === 'epoxy-flooring') newService = 'Epoxy Flooring';
      if (templateId === 'paving-concrete') newService = 'Paving & Concrete';
      if (templateId === 'appliance-repair') newService = 'Appliance Repair';
      if (templateId === 'pest-control') newService = 'Pest Control';
      if (templateId === 'junk-removal') newService = 'Junk Removal';

      await setDoc(
        businessProfileRef,
        {
          defaultLandingPage: templateId,
          service: newService,
        },
        { merge: true }
      );

      toast({
        title: 'Template Updated!',
        description: `Your landing page is now configured to use the ${TEMPLATES.find((t) => t.id === templateId)?.name}.`,
      });
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not save template settings.',
      });
    } finally {
      setSavingTemplate(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground animate-pulse">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-indigo-400" />
            Website Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the styling and content structure for your consumer-facing website.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-1">
        {TEMPLATES.map((tpl) => {
          const isActive = activeTemplate === tpl.id;
          const isUpdating = savingTemplate === tpl.id;

          return (
            <Card
              key={tpl.id}
              className={`flex flex-col overflow-hidden transition-all duration-300 relative border ${
                isActive
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 bg-slate-900/60'
                  : 'border-border/40 hover:border-slate-700 bg-slate-950/40'
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-semibold flex items-center gap-1">
                    <Check className="h-3 w-3" /> Active
                  </Badge>
                </div>
              )}
              
              <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
                <Image
                  src={tpl.thumbnailUrl}
                  alt={tpl.name}
                  fill
                  sizes="(max-w-768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <CardHeader className="p-5 pb-3">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-indigo-400 border-indigo-400/20 text-[10px] uppercase font-bold tracking-wider">
                    {tpl.niche}
                  </Badge>
                  <CardTitle className="text-base text-slate-100 font-bold leading-snug">{tpl.name}</CardTitle>
                </div>
                <CardDescription className="text-xs line-clamp-3 text-slate-400 mt-2">
                  {tpl.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 flex-grow">
                <div className="border-t border-border/40 pt-3 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Template Features</p>
                  <ul className="space-y-1.5">
                    {tpl.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 border-t border-border/40 flex gap-3 mt-auto bg-slate-950/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(tpl.previewUrl, '_blank')}
                  className="flex-1 text-xs border-border/50 hover:bg-slate-900"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
                </Button>
                <Button
                  size="sm"
                  disabled={isActive || isUpdating}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`flex-1 text-xs font-semibold ${
                    isActive
                      ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isUpdating ? 'Activating...' : isActive ? 'Active' : 'Use Template'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
