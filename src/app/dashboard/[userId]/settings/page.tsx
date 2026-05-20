
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useStorage } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, CheckCircle2, AlertCircle, FileText, Globe } from 'lucide-react';
import Image from 'next/image';

const profileSchema = z.object({
  // Company Details
  businessName: z.string().min(2, 'Business name is required.'),
  contactEmail: z.string().email('Invalid email address.'),
  phoneNumber: z.string().min(10, 'Invalid phone number.'),
  websiteUrl: z.string().url('Invalid URL.').optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  
  // Brand Setup (A2P 10DLC)
  legalBusinessName: z.string().optional(),
  ein: z.string().optional(),
  businessType: z.string().optional(),
  industry: z.string().optional(),
  brandStatus: z.enum(['unregistered', 'pending', 'verified', 'failed']).optional().default('unregistered'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const params = useParams();
  const siteSlug = params.userId as string;
  const { toast } = useToast();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const businessProfileRef = useMemoFirebase(() => {
    if (!user || !firestore || !siteSlug) return null;
    return doc(firestore, 'businessProfiles', siteSlug);
  }, [user, firestore, siteSlug]);

  const { data: businessProfile, isLoading } = useDoc<ProfileFormValues>(businessProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: '',
      contactEmail: '',
      phoneNumber: '',
      websiteUrl: '',
      logoUrl: '',
      legalBusinessName: '',
      ein: '',
      businessType: '',
      industry: '',
      brandStatus: 'unregistered',
    },
  });

  useEffect(() => {
    if (businessProfile) {
      form.reset({
        ...businessProfile,
        phoneNumber: formatPhoneNumber(businessProfile.phoneNumber || ''),
        websiteUrl: businessProfile.websiteUrl || '',
        logoUrl: businessProfile.logoUrl || '',
        legalBusinessName: businessProfile.legalBusinessName || '',
        ein: businessProfile.ein || '',
        businessType: businessProfile.businessType || '',
        industry: businessProfile.industry || '',
        brandStatus: businessProfile.brandStatus || 'unregistered',
      });
      setLogoPreview(businessProfile.logoUrl || null);
    }
  }, [businessProfile, form]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!businessProfileRef || !user || !storage) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save details. Please try again.' });
        return;
    }

    try {
        let logoUrlToSave = data.logoUrl || '';

        if (logoFile) {
            const filePath = `businessProfiles/${siteSlug}/logos/${crypto.randomUUID()}-${logoFile.name}`;
            const fileStorageRef = storageRef(storage, filePath);
            await uploadBytes(fileStorageRef, logoFile);
            logoUrlToSave = await getDownloadURL(fileStorageRef);
        }
        
        const updateData = {
            ...data,
            phoneNumber: data.phoneNumber ? data.phoneNumber.replace(/[^\d]/g, '') : '',
            websiteUrl: data.websiteUrl || '',
            logoUrl: logoUrlToSave,
        };

        await setDoc(businessProfileRef, updateData, { merge: true });

        toast({
          title: 'Success!',
          description: 'Your settings have been updated.',
        });
        
        setLogoFile(null);
    } catch (error: any) {
        console.error("Error updating profile:", error);
        toast({ variant: "destructive", title: "Save Failed", description: error.message || "Could not save company details." });
    }
  };

  const handleRegisterBrand = async () => {
    // In a real implementation, this would trigger an API route that talks to Telnyx/Twilio
    // to register the brand and update the Firestore status.
    setIsRegistering(true);
    try {
      if (!businessProfileRef) throw new Error("No profile ref");
      
      // Simulate API Call
      await new Promise(r => setTimeout(r, 1500));
      
      await setDoc(businessProfileRef, { brandStatus: 'pending' }, { merge: true });
      toast({ title: 'Brand Registration Submitted', description: 'Your brand registration is now pending approval.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'Failed to submit brand registration.' });
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground animate-pulse">Loading settings...</p>
      </div>
    );
  }
  
  const currentBrandStatus = form.watch('brandStatus');
  
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Company Settings</h1>
      </div>

      <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger 
            value="details" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2"
          >
            Company Details
          </TabsTrigger>
          <TabsTrigger 
            value="brand" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2"
          >
            A2P Compliance (Brand)
          </TabsTrigger>
          <TabsTrigger 
            value="legal" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2"
          >
            Legal Documents
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            
            <TabsContent value="details" className="flex-1 overflow-y-auto mt-0 p-1">
              <Card>
                <CardHeader>
                  <CardTitle>Your Business Information</CardTitle>
                  <CardDescription>Update your company's profile information here. This data is used on your landing page and by your AI Agent.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Business Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@yourbusiness.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(123) 456-7890" 
                            {...field}
                            onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourbusiness.com" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Company Logo</FormLabel>
                    {logoPreview && (
                        <div className="mt-2 flex items-center gap-4">
                            <Image src={logoPreview} alt="Logo preview" width={100} height={100} className="rounded-md object-contain border p-2 bg-muted/20" />
                            <Button 
                                variant="outline" 
                                size="sm"
                                type="button"
                                onClick={() => {
                                    setLogoPreview(null);
                                    setLogoFile(null);
                                    form.setValue('logoUrl', '');
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    )}
                    <FormControl>
                        <Input 
                            type="file" 
                            accept="image/png, image/jpeg, image/gif, image/svg+xml"
                            className="mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    if (file.size > 2 * 1024 * 1024) { // 2MB limit
                                        toast({ variant: 'destructive', title: 'File too large', description: 'Logo image must be less than 2MB.' });
                                        return;
                                    }
                                    setLogoFile(file);
                                    setLogoPreview(URL.createObjectURL(file));
                                    form.setValue('logoUrl', URL.createObjectURL(file)); // to have a value to save
                                }
                            }}
                        />
                    </FormControl>
                    <FormDescription>
                        Upload your company logo (PNG, JPG, GIF, SVG). Max 2MB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="brand" className="flex-1 overflow-y-auto mt-0 p-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>A2P 10DLC Brand Registration</CardTitle>
                      <CardDescription>Register your brand to send compliant SMS/MMS messages to US numbers.</CardDescription>
                    </div>
                    <div>
                      {currentBrandStatus === 'unregistered' && <Badge variant="outline" className="text-yellow-600 border-yellow-600"><AlertCircle className="w-3 h-3 mr-1"/> Unregistered</Badge>}
                      {currentBrandStatus === 'pending' && <Badge variant="outline" className="text-blue-600 border-blue-600"><ShieldAlert className="w-3 h-3 mr-1"/> Pending</Badge>}
                      {currentBrandStatus === 'verified' && <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Verified</Badge>}
                      {currentBrandStatus === 'failed' && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1"/> Failed</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg text-sm mb-6 border">
                    <strong>Why is this required?</strong> To prevent spam, US telecom carriers require businesses to register their brand and message campaigns (A2P 10DLC). If you don't register, your messages may be heavily filtered or blocked entirely.
                  </div>

                  <FormField
                    control={form.control}
                    name="legalBusinessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Acme Corp LLC" {...field} />
                        </FormControl>
                        <FormDescription>Must exactly match your tax registration documents.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employer Identification Number (EIN)</FormLabel>
                        <FormControl>
                          <Input placeholder="XX-XXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                            <SelectItem value="Partnership">Partnership</SelectItem>
                            <SelectItem value="Corporation">Corporation (Inc, Corp)</SelectItem>
                            <SelectItem value="LLC">Limited Liability Company (LLC)</SelectItem>
                            <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="submit" variant="outline" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleRegisterBrand} 
                    disabled={isRegistering || currentBrandStatus === 'pending' || currentBrandStatus === 'verified'}
                  >
                    {isRegistering ? 'Submitting...' : 'Submit for Registration'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="legal" className="flex-1 overflow-y-auto mt-0 p-1">
              <Card>
                <CardHeader>
                  <CardTitle>Legal Documents</CardTitle>
                  <CardDescription>Manage the Privacy Policy and Terms of Service linked on your landing pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                    <FileText className="w-8 h-8 text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">Auto-Generated Privacy Policy</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        We automatically generate a compliant Privacy Policy for you based on your Company Details. This includes the mandatory "No Information Sharing" clause required for SMS compliance.
                      </p>
                      <div className="flex gap-3 mt-4">
                        <Button variant="outline" size="sm" type="button" onClick={() => window.open(`/api/legal/privacy?userId=${siteSlug}`, '_blank')}>
                          <Globe className="w-4 h-4 mr-2"/> View Live Policy
                        </Button>
                      </div>
                    </div>
                  </div>
 
                  <div className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                    <FileText className="w-8 h-8 text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">Auto-Generated Terms of Service</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        We automatically generate compliant Terms of Service for your business, detailing communication practices and opt-out instructions.
                      </p>
                      <div className="flex gap-3 mt-4">
                        <Button variant="outline" size="sm" type="button" onClick={() => window.open(`/api/legal/tos?userId=${siteSlug}`, '_blank')}>
                          <Globe className="w-4 h-4 mr-2"/> View Live Terms
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg text-sm border border-amber-200 dark:border-amber-800">
                    <h5 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">A2P Compliance Note</h5>
                    <p className="text-amber-700 dark:text-amber-500">
                      These documents are injected into your landing page automatically. To ensure campaign approval, do not remove the links to these documents from your live templates.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </form>
        </Form>
      </Tabs>
    </div>
  );
}

    