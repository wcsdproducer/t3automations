'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitLead } from '@/app/actions/leads';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone number is required'),
  notes: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "You must agree to receive SMS communications.",
  }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface BlogLeadFormProps {
  businessProfileId: string;
  companyName: string;
}

export function BlogLeadForm({ businessProfileId, companyName }: BlogLeadFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', notes: '', consent: false },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    const res = await submitLead({ ...data, businessProfileId });
    setIsSubmitting(false);

    if (res.success) {
      toast({
        title: 'Success!',
        description: 'Your request has been submitted. We will contact you shortly.',
      });
      form.reset();
    } else {
      toast({
        title: 'Error',
        description: res.error || 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-sm max-w-lg mx-auto mt-12 text-slate-800">
      <h3 className="text-2xl font-bold text-center text-slate-900">Need Professional Assistance?</h3>
      <p className="text-center text-slate-500 text-sm mt-1.5">
        Get a free, no-obligation estimate from our expert local team today.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Input 
            placeholder="Your Name" 
            className="bg-white" 
            {...form.register('name')} 
          />
          {form.formState.errors.name && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <Input 
            type="email" 
            placeholder="Your Email" 
            className="bg-white" 
            {...form.register('email')} 
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <Input 
            type="tel" 
            placeholder="Phone Number" 
            className="bg-white" 
            {...form.register('phone')} 
          />
          {form.formState.errors.phone && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>

        <div>
          <Textarea 
            placeholder="Briefly describe what service you need help with..." 
            className="bg-white" 
            rows={3} 
            {...form.register('notes')} 
          />
          {form.formState.errors.notes && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.notes.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-2 text-left bg-white p-4 rounded-xl border border-slate-200">
          <Checkbox 
            id="blog-consent" 
            checked={form.watch('consent')} 
            onCheckedChange={(checked) => form.setValue('consent', checked as boolean, { shouldValidate: true })} 
          />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="blog-consent" className="text-xs font-semibold text-slate-900 leading-none">
              I agree to receive SMS communications from {companyName}.
            </label>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              By checking this box, you consent to receive text messages regarding your service request. Message and data rates may apply. Reply STOP to opt-out. See our <a href={`/api/legal/privacy?userId=${businessProfileId}`} target="_blank" className="underline hover:text-blue-600">Privacy Policy</a>.
            </p>
          </div>
        </div>
        {form.formState.errors.consent && (
          <p className="text-xs text-red-500 mt-1">{form.formState.errors.consent.message}</p>
        )}

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-lg transition-colors mt-6" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting Estimate Request...' : 'GET MY FREE ESTIMATE'}
        </Button>
      </form>
    </div>
  );
}
