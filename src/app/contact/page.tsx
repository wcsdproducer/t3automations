'use client';

import React, { useEffect, useActionState, useRef } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { handleContactForm } from '@/app/actions';
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
      {pending ? 'Sending...' : 'Send'}
    </Button>
  );
}

export default function ContactPage() {
  const [state, formAction] = useActionState(handleContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    } else if (state.message && state.errors) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Form',
        description: 'Please fill out all the required fields.',
      });
    }
  }, [state, toast]);

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1 pt-20 flex flex-col">
        <section className="py-8 flex-grow flex flex-col">
          <div className="container flex flex-col flex-grow">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold tracking-tight mt-2">Schedule a free consultation</h1>
              <p className="mt-4 text-base text-muted-foreground">In this meeting, we'll discuss:</p>
              <ul className="mt-4 space-y-2 text-xs text-foreground/80">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Your current business challenges and where you need help</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>The value of professional, 24/7 customer engagement</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>How we can help you improve your business operations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>The range of solutions we offer for small and midsize businesses</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 bg-card p-6 rounded-lg flex-grow flex flex-col">
              <div className="grid md:grid-cols-2 gap-8 items-start flex-grow">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">T3 Automations Consultation</h2>
                  <p className="text-muted-foreground text-sm">
                    Learn how T3 Automations can help your business.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    We'll address your questions and discuss solutions, whether you're interested in our
                    receptionist, chat, or outreach services.
                  </p>
                </div>
                <form ref={formRef} action={formAction} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" type="text" placeholder="Name" required />
                    {state.errors?.name && (
                      <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="Email" required />
                    {state.errors?.email && (
                      <p className="text-destructive text-sm mt-1">{state.errors.email[0]}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" placeholder="Message" rows={3} required />
                    {state.errors?.message && (
                      <p className="text-destructive text-sm mt-1">{state.errors.message[0]}</p>
                    )}
                  </div>
                  <SubmitButton />
                  {state.success && (
                    <p className="text-green-500 text-sm mt-2 text-center">{state.message}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}