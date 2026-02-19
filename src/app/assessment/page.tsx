'use client';

import React, { useEffect, useActionState, useRef } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { handleAssessmentForm } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
  errors: undefined,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full text-md py-4" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </Button>
  );
}

export default function AssessmentPage() {
  const [state, formAction] = useActionState(handleAssessmentForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Submission Successful',
        description: state.message,
      });
      formRef.current?.reset();
    } else if (state.message && state.errors) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Form',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1 pt-20 flex flex-col">
        <section className="py-8 flex-grow flex flex-col">
          <div className="container flex flex-col flex-grow items-center justify-center">
            <div className="bg-card p-8 rounded-lg w-full max-w-lg shadow-lg">
                <h1 className="text-2xl font-bold tracking-tight text-center mb-6">Assessment</h1>
                <form ref={formRef} action={formAction} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" type="text" placeholder="Your Name" required />
                    {state.errors?.name && (
                      <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
                    {state.errors?.email && (
                      <p className="text-destructive text-sm mt-1">{state.errors.email[0]}</p>
                    )}
                  </div>
                   <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="(123) 456-7890" required />
                    {state.errors?.phone && (
                      <p className="text-destructive text-sm mt-1">{state.errors.phone[0]}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea id="comment" name="comment" placeholder="Your comment here..." rows={4} required />
                    {state.errors?.comment && (
                      <p className="text-destructive text-sm mt-1">{state.errors.comment[0]}</p>
                    )}
                  </div>
                  <SubmitButton />
                  {state.success && !state.errors && (
                    <p className="text-green-500 text-sm mt-2 text-center">{state.message}</p>
                  )}
                </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
