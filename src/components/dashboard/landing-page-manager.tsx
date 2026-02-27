'use client';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';

const homeServices = [
    "HVAC Maintenance & Repair",
    "Plumbing",
    "Electrical Services",
    "Roofing Repair & Replacement",
    "Appliance Repair",
    "Gutter Cleaning & Repair",
    "Siding & Exterior Repair",
    "Garage Door Services",
    "Lawn Care & Mowing",
    "Landscaping & Garden Design",
    "Tree Services",
    "Pressure Washing",
    "Pest Control",
    "Pool Maintenance & Cleaning",
    "Fence Installation & Repair",
    "Snow Removal",
    "House Cleaning (Maid Services)",
    "Carpet & Upholstery Cleaning",
    "Interior & Exterior Painting",
    "Handyman Services",
    "Drywall Repair & Installation",
    "Flooring Installation",
    "Window Washing",
    "Furniture Assembly",
    "Smart Home Installation",
    "Solar Panel Installation",
    "Home Security Monitoring",
    "Senior Home Modifications",
    "Air Duct & Vent Cleaning",
    "Junk Removal & Moving"
];

const getTemplateForService = (service: string): string => {
    const cleaningServices = ["House Cleaning (Maid Services)", "Carpet & Upholstery Cleaning", "Window Washing", "Junk Removal & Moving", "Air Duct & Vent Cleaning", "Pressure Washing"];
    const hvacServices = ["HVAC Maintenance & Repair", "Solar Panel Installation"];
    const luxuryRemodelServices = ["Landscaping & Garden Design", "Interior & Exterior Painting", "Flooring Installation", "Drywall Repair & Installation", "Appliance Repair"];
    
    if (cleaningServices.includes(service)) {
        return 'template-4'; // Friendly local service theme
    }
    if (hvacServices.includes(service)) {
        return 'template-3'; // Direct response theme
    }
    if (luxuryRemodelServices.includes(service)) {
        return 'template-2'; // Modern visual theme for remodels
    }
    return 'template-1'; // Classic professional theme for other trades
};


export function LandingPageManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const businessProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `businessProfiles/${user.uid}`);
  }, [user, firestore]);

  const { data: businessProfile, isLoading } = useDoc(businessProfileRef);

  // State for the live preview
  const [selectedTemplate, setSelectedTemplate] = useState('template-3');
  const [heroEffect, setHeroEffect] = useState('slideshow');
  const [service, setService] = useState('HVAC Maintenance & Repair');
  
  // Draft state for the form controls
  const [draftService, setDraftService] = useState(service);
  const [draftHeroEffect, setDraftHeroEffect] = useState(heroEffect);
  const [draftTemplate, setDraftTemplate] = useState(selectedTemplate);


  useEffect(() => {
    if (businessProfile) {
      const savedService = businessProfile.service || 'HVAC Maintenance & Repair';
      const savedTemplate = businessProfile.defaultLandingPage || getTemplateForService(savedService);
      const savedHeroEffect = businessProfile.heroEffect || 'slideshow';

      // Live state
      setSelectedTemplate(savedTemplate);
      setHeroEffect(savedHeroEffect);
      setService(savedService);

      // Draft state for controls
      setDraftService(savedService);
      setDraftHeroEffect(savedHeroEffect);
      setDraftTemplate(savedTemplate);
    }
  }, [businessProfile]);

  const handleApplyChanges = () => {
    if (!user || !firestore || !businessProfileRef) return;

    const updates = {
      service: draftService,
      heroEffect: draftHeroEffect,
      defaultLandingPage: draftTemplate,
    };

    setDocumentNonBlocking(businessProfileRef, updates, { merge: true });

    // Update live state to reflect changes in preview
    setService(draftService);
    setHeroEffect(draftHeroEffect);
    setSelectedTemplate(draftTemplate);

    toast({
      title: 'Site Preferences Applied',
      description: 'Your landing page preview has been updated.',
    });
  };
  
  const handleScrollToDns = () => {
    const dnsSection = document.getElementById('dns-records');
    if (dnsSection) {
      dnsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const landingPageUrl = `/landing-pages/${selectedTemplate}?heroEffect=${heroEffect}&service=${encodeURIComponent(service)}&phone=${encodeURIComponent(businessProfile?.phoneNumber || '(000) 000-0000')}&logo=${encodeURIComponent(businessProfile?.logoUrl || '')}&companyName=${encodeURIComponent(businessProfile?.businessName || '')}`;

  if (isLoading) {
    return <p>Loading landing page settings...</p>;
  }

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <CardTitle>Landing Page Management</CardTitle>
                    <CardDescription>Select a default landing page template for your business. View a live preview below.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleScrollToDns} className="mt-4 sm:mt-0 shrink-0">
                  Add Your Own Domain
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="text-lg font-semibold">Site Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <Label>Template Style</Label>
                <p className="text-sm text-muted-foreground min-h-[40px]">Choose the overall look and feel for your page.</p>
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
                <p className="text-sm text-muted-foreground min-h-[40px]">This will provide relevant content for your page.</p>
                <Select value={draftService} onValueChange={setDraftService}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                        {homeServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hero Section Effect</Label>
                <p className="text-sm text-muted-foreground min-h-[40px]">
                  Choose the visual style for the top of your page.
                </p>
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

              <div>
                <Button onClick={handleApplyChanges} className="w-full">Apply Changes</Button>
              </div>
            </div>
          </div>
          
          <Separator />

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link href={landingPageUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                View Live Page <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="aspect-[16/9] w-full bg-muted rounded-md overflow-hidden border">
            <iframe
              src={landingPageUrl}
              className="w-full h-full"
              title="Landing Page Preview"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
