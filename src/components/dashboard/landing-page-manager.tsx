'use client';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Type, Palette, Globe, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// ─────────────────────────────────────────────────────────────────────────────
// Font Pairs
// ─────────────────────────────────────────────────────────────────────────────
const FONT_PAIRS = [
  { id: 'modern-corporate', name: 'Modern Corporate', heading: 'Inter', body: 'Roboto' },
  { id: 'bold-creative',    name: 'Bold Creative',    heading: 'Montserrat', body: 'Raleway' },
  { id: 'elegant-luxury',  name: 'Elegant Luxury',   heading: 'Playfair Display', body: 'Lato' },
  { id: 'friendly-local',  name: 'Friendly Local',   heading: 'Nunito', body: 'Source Sans Pro' },
  { id: 'tech-forward',    name: 'Tech Forward',      heading: 'Space Grotesk', body: 'IBM Plex Sans' },
  { id: 'classic-serif',   name: 'Classic Serif',    heading: 'Merriweather', body: 'Open Sans' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Color Palettes — each has 4 swatch colors shown in a 2×2 grid
// ─────────────────────────────────────────────────────────────────────────────
const COLOR_PALETTES = [
  {
    id: 'luxury-purple',
    name: 'Luxury Purple',
    colors: ['#7C3AED', '#D97706', '#1E1B4B', '#EC4899'],
  },
  {
    id: 'deep-midnight',
    name: 'Modern Dark',
    colors: ['#1F2937', '#111827', '#06B6D4', '#3B82F6'],
  },
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    colors: ['#2563EB', '#F8FAFC', '#60A5FA', '#1E3A5F'],
  },
  {
    id: 'sunny-yellow',
    name: 'Sunny Yellow',
    colors: ['#F59E0B', '#FFFFFF', '#FB923C', '#E5E7EB'],
  },
  {
    id: 'earthy-green',
    name: 'Earthy Green',
    colors: ['#16A34A', '#F8FAFC', '#15803D', '#1A2E1A'],
  },
  {
    id: 'vibrant-coral',
    name: 'Vibrant Coral',
    colors: ['#EF4444', '#F8FAFC', '#F97316', '#991B1B'],
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    colors: ['#BAE6FD', '#FBCFE8', '#F8FAFC', '#E0F2FE'],
  },
  {
    id: 'clean-minimal',
    name: 'Clean & Minimal',
    colors: ['#F1F5F9', '#1E293B', '#FFFFFF', '#EF4444'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Service list
// ─────────────────────────────────────────────────────────────────────────────
const homeServices = [
  'HVAC Maintenance & Repair',
  'Plumbing',
  'Electrical Services',
  'Roofing Repair & Replacement',
  'Appliance Repair',
  'Gutter Cleaning & Repair',
  'Siding & Exterior Repair',
  'Garage Door Services',
  'Lawn Care & Mowing',
  'Landscaping & Garden Design',
  'Tree Services',
  'Pressure Washing',
  'Pest Control',
  'Pool Maintenance & Cleaning',
  'Fence Installation & Repair',
  'Snow Removal',
  'House Cleaning (Maid Services)',
  'Carpet & Upholstery Cleaning',
  'Interior & Exterior Painting',
  'Handyman Services',
  'Drywall Repair & Installation',
  'Flooring Installation',
  'Window Washing',
  'Furniture Assembly',
  'Smart Home Installation',
  'Solar Panel Installation',
  'Home Security Monitoring',
  'Senior Home Modifications',
  'Air Duct & Vent Cleaning',
  'Junk Removal & Moving',
];

const getTemplateForService = (service: string): string => {
  const cleaningServices = [
    'House Cleaning (Maid Services)',
    'Carpet & Upholstery Cleaning',
    'Window Washing',
    'Junk Removal & Moving',
    'Air Duct & Vent Cleaning',
    'Pressure Washing',
  ];
  const hvacServices = ['HVAC Maintenance & Repair', 'Solar Panel Installation'];
  const luxuryRemodelServices = [
    'Landscaping & Garden Design',
    'Interior & Exterior Painting',
    'Flooring Installation',
    'Drywall Repair & Installation',
    'Appliance Repair',
  ];

  if (cleaningServices.includes(service)) return 'template-4';
  if (hvacServices.includes(service)) return 'template-3';
  if (luxuryRemodelServices.includes(service)) return 'template-2';
  return 'template-1';
};

// ─────────────────────────────────────────────────────────────────────────────
// Color Palette Swatch Component
// ─────────────────────────────────────────────────────────────────────────────
function PaletteSwatch({
  palette,
  isSelected,
  onClick,
}: {
  palette: (typeof COLOR_PALETTES)[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={palette.name}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg p-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary',
        isSelected
          ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
          : 'hover:ring-2 hover:ring-border hover:ring-offset-1'
      )}
    >
      <div className="grid grid-cols-2 gap-0.5 w-14 h-14 rounded-md overflow-hidden border border-border">
        {palette.colors.map((color, i) => (
          <div key={i} style={{ backgroundColor: color }} className="w-full h-full" />
        ))}
      </div>
      <span className="text-xs text-muted-foreground text-center leading-tight max-w-[60px]">
        {palette.name}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function LandingPageManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const businessProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `businessProfiles/${user.uid}`);
  }, [user, firestore]);

  const { data: businessProfile, isLoading } = useDoc(businessProfileRef);

  // Live preview state (what the iframe shows)
  const [selectedTemplate, setSelectedTemplate] = useState('template-3');
  const [heroEffect, setHeroEffect]             = useState('slideshow');
  const [service, setService]                   = useState('HVAC Maintenance & Repair');
  const [fontPair, setFontPair]                 = useState('modern-corporate');
  const [colorPalette, setColorPalette]         = useState('deep-midnight');
  const [published, setPublished]               = useState(false);
  const [copied, setCopied]                     = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  // Draft state (what the controls show, before Publish)
  const [draftTemplate, setDraftTemplate]       = useState(selectedTemplate);
  const [draftHeroEffect, setDraftHeroEffect]   = useState(heroEffect);
  const [draftService, setDraftService]         = useState(service);
  const [draftFontPair, setDraftFontPair]       = useState(fontPair);
  const [draftColorPalette, setDraftColorPalette] = useState(colorPalette);

  useEffect(() => {
    if (businessProfile) {
      const savedService      = businessProfile.service              || 'HVAC Maintenance & Repair';
      const savedTemplate     = businessProfile.defaultLandingPage   || getTemplateForService(savedService);
      const savedHeroEffect   = businessProfile.heroEffect           || 'slideshow';
      const savedFontPair     = businessProfile.fontPair             || 'modern-corporate';
      const savedColorPalette = businessProfile.colorPalette         || 'deep-midnight';

      setSelectedTemplate(savedTemplate);
      setHeroEffect(savedHeroEffect);
      setService(savedService);
      setFontPair(savedFontPair);
      setColorPalette(savedColorPalette);

      setDraftTemplate(savedTemplate);
      setDraftHeroEffect(savedHeroEffect);
      setDraftService(savedService);
      setDraftFontPair(savedFontPair);
      setDraftColorPalette(savedColorPalette);

      // If profile exists with data, page has been published before
      if (businessProfile.defaultLandingPage) setPublished(true);
    }
  }, [businessProfile]);

  // ── Publish (saves + updates live preview) ──────────────────────────────
  const handlePublishClick = () => {
    if (published) {
      setShowPublishConfirm(true);
    } else {
      executePublish();
    }
  };

  const executePublish = () => {
    if (!user || !firestore || !businessProfileRef) return;

    setDocumentNonBlocking(
      businessProfileRef,
      {
        service:            draftService,
        heroEffect:         draftHeroEffect,
        defaultLandingPage: draftTemplate,
        fontPair:           draftFontPair,
        colorPalette:       draftColorPalette,
      },
      { merge: true }
    );

    // Apply draft → live so preview updates
    setService(draftService);
    setHeroEffect(draftHeroEffect);
    setSelectedTemplate(draftTemplate);
    setFontPair(draftFontPair);
    setColorPalette(draftColorPalette);
    setPublished(true);
    setShowPublishConfirm(false);

    toast({
      title: '✅ Published!',
      description: 'Your landing page is now live.',
    });
  };

  // ── URLs ────────────────────────────────────────────────────────────────
  const freeUrl = user ? `${typeof window !== 'undefined' ? window.location.origin : 'https://t3automations.com'}/pages/${user.uid}` : '';
  const customDomain = businessProfile?.customDomain || null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(customDomain ? `https://${customDomain}` : freeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Preview URL ──────────────────────────────────────────────────────────
  const phone       = businessProfile?.phoneNumber  || '(000) 000-0000';
  const logo        = businessProfile?.logoUrl       || '';
  const companyName = businessProfile?.businessName  || '';

  const previewUrl = `/landing-pages/${selectedTemplate}`
    + `?heroEffect=${heroEffect}`
    + `&service=${encodeURIComponent(service)}`
    + `&phone=${encodeURIComponent(phone)}`
    + `&logo=${encodeURIComponent(logo)}`
    + `&companyName=${encodeURIComponent(companyName)}`
    + `&fontPair=${fontPair}`
    + `&colorPalette=${colorPalette}`;

  if (isLoading) {
    return <p className="text-muted-foreground animate-pulse">Loading landing page settings…</p>;
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Landing Page Editor</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Customize and publish your landing page.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={freeUrl || previewUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              Open Preview <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            onClick={handlePublishClick}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Publish
          </Button>
        </div>
      </div>

      {/* ── Published URL Banner ── */}
      {published && freeUrl && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
          <Globe className="h-4 w-4 text-green-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Your page is live at</p>
            <Link
              href={customDomain ? `https://${customDomain}` : freeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary truncate hover:underline"
            >
              {customDomain ? `https://${customDomain}` : freeUrl}
            </Link>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopyUrl}>
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      )}

      {/* ── Site Preferences Card ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Site Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Row 1: Template | Service | Hero Effect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Template Style</Label>
              <Select value={draftTemplate} onValueChange={setDraftTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template-1">Classic Professional</SelectItem>
                  <SelectItem value="template-2">Modern Visual</SelectItem>
                  <SelectItem value="template-3">Direct Response</SelectItem>
                  <SelectItem value="template-4">Friendly Local</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Service Category</Label>
              <Select value={draftService} onValueChange={setDraftService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {homeServices.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hero Section Effect</Label>
              <div className="flex h-10 items-center">
                <RadioGroup
                  value={draftHeroEffect}
                  onValueChange={setDraftHeroEffect}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="slideshow" id="slideshow" />
                    <Label htmlFor="slideshow">Slide Show</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="parallax" id="parallax" />
                    <Label htmlFor="parallax">Parallax Effect</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Separator />

          {/* Row 2: Font Pairing | Color Palettes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Font Pairing */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <Label>Font Pairing</Label>
              </div>
              <Select value={draftFontPair} onValueChange={setDraftFontPair}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a font pair" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_PAIRS.map((fp) => (
                    <SelectItem key={fp.id} value={fp.id}>
                      {fp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Palettes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <Label>Color Palettes</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTES.map((palette) => (
                  <PaletteSwatch
                    key={palette.id}
                    palette={palette}
                    isSelected={draftColorPalette === palette.id}
                    onClick={() => setDraftColorPalette(palette.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Live Preview ── */}
      <div className="aspect-[16/9] w-full bg-muted rounded-lg overflow-hidden border">
        <iframe
          key={previewUrl}
          src={previewUrl}
          className="w-full h-full"
          title="Landing Page Preview"
        />
      </div>

      {/* ── Confirm Publish Dialog ── */}
      <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite live page?</AlertDialogTitle>
            <AlertDialogDescription>
              Your landing page is already live. Do you want to overwrite it with these new settings?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={executePublish} className="bg-orange-500 hover:bg-orange-600 text-white">
              Yes, overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
