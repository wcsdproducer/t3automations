
'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useStorage } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';

const profileSchema = z.object({
  businessName: z.string().min(2, 'Business name is required.'),
  contactEmail: z.string().email('Invalid email address.'),
  phoneNumber: z.string().min(10, 'Invalid phone number.'),
  websiteUrl: z.string().url('Invalid URL.').optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
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
  const { toast } = useToast();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const businessProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `businessProfiles/${user.uid}`);
  }, [user, firestore]);

  const { data: businessProfile, isLoading } = useDoc<ProfileFormValues>(businessProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: '',
      contactEmail: '',
      phoneNumber: '',
      websiteUrl: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    if (businessProfile) {
      form.reset({
        ...businessProfile,
        phoneNumber: formatPhoneNumber(businessProfile.phoneNumber),
        websiteUrl: businessProfile.websiteUrl || '',
        logoUrl: businessProfile.logoUrl || '',
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
            const filePath = `businessProfiles/${user.uid}/logos/${crypto.randomUUID()}-${logoFile.name}`;
            const fileStorageRef = storageRef(storage, filePath);
            await uploadBytes(fileStorageRef, logoFile);
            logoUrlToSave = await getDownloadURL(fileStorageRef);
        }
        
        const updateData = {
            ...data,
            phoneNumber: data.phoneNumber.replace(/[^\d]/g, ''),
            websiteUrl: data.websiteUrl || '',
            logoUrl: logoUrlToSave,
        };

        await setDoc(businessProfileRef, updateData, { merge: true });

        toast({
          title: 'Success!',
          description: 'Your company details have been updated.',
        });
        
        setLogoFile(null);
    } catch (error: any) {
        console.error("Error updating profile:", error);
        toast({ variant: "destructive", title: "Save Failed", description: error.message || "Could not save company details." });
    }
  };

  if (isLoading) {
    return <p>Loading company details...</p>;
  }
  
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Company Details</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Business Information</CardTitle>
          <CardDescription>Update your company's profile information here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

    