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

export function LandingPageManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const businessProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `businessProfiles/${user.uid}`);
  }, [user, firestore]);

  const { data: businessProfile, isLoading } = useDoc(businessProfileRef);

  const [selectedTemplate, setSelectedTemplate] = useState('template-1');

  useEffect(() => {
    if (businessProfile?.defaultLandingPage) {
      setSelectedTemplate(businessProfile.defaultLandingPage);
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

  const landingPageUrl = `/landing-pages/${selectedTemplate}`;

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
