'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const calendarSchema = z.object({
  bookingUrl: z.string().url('Please enter a valid URL (e.g., https://calendly.com/your-name)').optional().or(z.literal('')),
});

type CalendarFormValues = z.infer<typeof calendarSchema>;

export default function CalendarPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const businessProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `businessProfiles/${user.uid}`);
  }, [user, firestore]);

  const { data: businessProfile, isLoading } = useDoc<{ bookingUrl?: string }>(businessProfileRef);

  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarSchema),
    defaultValues: {
      bookingUrl: '',
    },
  });

  useEffect(() => {
    if (businessProfile) {
      form.reset({
        bookingUrl: businessProfile.bookingUrl || '',
      });
    }
  }, [businessProfile, form]);

  const onSubmit = async (data: CalendarFormValues) => {
    if (!businessProfileRef || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save details. Please try again.' });
      return;
    }

    try {
      await setDoc(businessProfileRef, { bookingUrl: data.bookingUrl }, { merge: true });

      toast({
        title: 'Success!',
        description: 'Your booking system configuration has been saved.',
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ variant: "destructive", title: "Save Failed", description: error.message || "Could not save calendar details." });
    }
  };

  const currentBookingUrl = form.watch('bookingUrl');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground animate-pulse">Loading calendar settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          Calendar & Booking
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking System Integration</CardTitle>
              <CardDescription>
                Connect your existing calendar or booking tool (like Calendly, Acuity, or Cal.com) to allow leads to book appointments directly.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bookingUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking URL</FormLabel>
                        <FormControl>
                          <div className="flex relative">
                            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://calendly.com/your-name" className="pl-9" {...field} value={field.value ?? ''} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Paste the link to your public booking page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Integration</CardTitle>
              <CardDescription>
                When a booking URL is provided, your AI Voice Agent will be able to share this link with callers to schedule appointments autonomously.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full min-h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Booking Page Preview</CardTitle>
                {currentBookingUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(currentBookingUrl, '_blank')}>
                    Open <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative">
              {currentBookingUrl ? (
                <iframe 
                  src={currentBookingUrl} 
                  className="w-full h-full border-0 absolute inset-0"
                  title="Booking Calendar Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-muted/20">
                  <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">No Booking Link Configured</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Enter your Calendly or other scheduling link on the left to see your calendar preview here and enable booking features.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
