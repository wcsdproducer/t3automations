'use client';

import { handleLeadQualification } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { leadQualificationSchema } from '@/lib/types';
import React from 'react';
import type { LeadQualificationOutput } from '@/ai/flows/lead-qualification-and-routing';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function LeadQualification() {
  const [result, setResult] = React.useState<LeadQualificationOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof leadQualificationSchema>>({
    resolver: zodResolver(leadQualificationSchema),
    defaultValues: {
      callerName: 'Alex Doe',
      callerPhoneNumber: '123-456-7890',
      callerEmail: 'alex.doe@example.com',
      companyName: 'TechCorp',
      jobTitle: 'Product Manager',
      reasonForCalling: 'I saw your new AI receptionist and I am interested in a demo for my company. We have about 50 employees.',
      predefinedCriteria: 'Qualify if company size > 20 employees or if caller is a manager or executive. Disqualify if asking for support.',
    },
  });

  async function onSubmit(values: z.infer<typeof leadQualificationSchema>) {
    setIsSubmitting(true);
    setResult(null);
    const response = await handleLeadQualification({}, values);
    if (response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Qualification Failed',
        description: response.message,
      });
    }
    setIsSubmitting(false);
  }

  return (
    <section className="py-20 md:py-28">
      <div className="container grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
        <Card className="shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Lead Qualification Demo</CardTitle>
                <CardDescription>Enter lead details to see the AI qualification in action.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="callerName" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="callerPhoneNumber" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="callerEmail" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="jobTitle" render={({ field }) => (
                  <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="reasonForCalling" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>Reason for Calling</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="predefinedCriteria" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>Qualification Criteria</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={isSubmitting} className="w-full sm:col-span-2">
                  {isSubmitting ? 'Qualifying...' : 'Qualify Lead'}
                </Button>
              </CardContent>
            </form>
          </Form>
        </Card>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Automated Lead Qualification</h2>
          <p className="text-lg text-muted-foreground">
            Focus your sales team on the hottest leads. Our AI qualifies prospects in real-time, saving you time and boosting conversion rates.
          </p>
          {result && (
            <Alert className="mt-6">
              <AlertTitle className="flex items-center gap-2">
                {result.isQualified ? (
                  <>
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    <span>Lead Qualified</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Qualified</Badge>
                  </>
                ) : (
                  <>
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    <span>Lead Not Qualified</span>
                    <Badge variant="destructive">Not Qualified</Badge>
                  </>
                )}
              </AlertTitle>
              <AlertDescription className="mt-4 space-y-4">
                <div>
                  <p className="font-semibold">Reasoning:</p>
                  <p className="text-muted-foreground">{result.qualificationReason}</p>
                </div>
                <div>
                  <p className="font-semibold">Routing Instructions:</p>
                  <p className="text-muted-foreground">{result.routingInstructions}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </section>
  );
}
