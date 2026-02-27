
'use client';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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

export function LandingPageManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const businessProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `businessProfiles/${user.uid}`);
  }, [user, firestore]);

  const { data: businessProfile, isLoading } = useDoc(businessProfileRef);

  const [selectedTemplate, setSelectedTemplate] = useState('template-3');
  const [heroEffect, setHeroEffect] = useState('slideshow');
  const [service, setService] = useState('HVAC Maintenance & Repair');

  useEffect(() => {
    if (businessProfile) {
      setSelectedTemplate(businessProfile.defaultLandingPage || 'template-3');
      setHeroEffect(businessProfile.heroEffect || 'slideshow');
      setService(businessProfile.service || 'HVAC Maintenance & Repair');
    }
  }, [businessProfile]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!user || !firestore || !businessProfileRef) return;

    setDocumentNonBlocking(businessProfileRef, { defaultLandingPage: templateId }, { merge: true });

    toast({
      title: 'Landing Page Updated',
      description: `Your default landing page is now ${templateId.replace('-', ' ')}.`,
    });
  };

  const handleHeroEffectChange = (effect: string) => {
    setHeroEffect(effect);
    if (!user || !firestore || !businessProfileRef) return;

    setDocumentNonBlocking(businessProfileRef, { heroEffect: effect }, { merge: true });

    toast({
      title: 'Site Preference Updated',
      description: `Hero section effect set to ${effect}.`,
    });
  };

  const handleServiceChange = (selectedService: string) => {
    setService(selectedService);
    if (!user || !firestore || !businessProfileRef) return;

    setDocumentNonBlocking(businessProfileRef, { service: selectedService }, { merge: true });

    toast({
      title: 'Site Preference Updated',
      description: `Primary service set to ${selectedService}.`,
    });
  };

  const landingPageUrl = `/landing-pages/${selectedTemplate}?heroEffect=${heroEffect}`;

  if (isLoading) {
    return <p>Loading landing page settings...</p>;
  }

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Landing Page Management</CardTitle>
          <CardDescription>Select a default landing page template for your business. View a live preview below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Select onValueChange={handleTemplateChange} value={selectedTemplate}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template-1">Classic Professional</SelectItem>
                <SelectItem value="template-2">Modern Visual</SelectItem>
                <SelectItem value="template-3">Direct Response</SelectItem>
                <SelectItem value="template-4">Friendly Local</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Site Preferences
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Site Preferences</DialogTitle>
                  <DialogDescription>
                    Customize the look and feel of your landing page.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Service Category</h4>
                    <Select value={service} onValueChange={handleServiceChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                            {homeServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <h4 className="font-medium">Hero Section Effect</h4>
                  <RadioGroup value={heroEffect} onValueChange={handleHeroEffectChange}>
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
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Done</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
