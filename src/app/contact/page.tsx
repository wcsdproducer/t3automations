'use client';

import React, { useEffect, useRef } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { handleContactForm } from '@/app/actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import TranslatedText from '@/components/TranslatedText';

const initialState = {
  message: '',
  errors: undefined,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full text-md py-4" disabled={pending}>
      {pending ? <TranslatedText>Sending...</TranslatedText> : <TranslatedText>Send</TranslatedText>}
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
        <section className="py-8 flex-grow flex flex-col px-4 sm:px-0">
          <div className="container flex flex-col flex-grow">
            <div className="bg-card p-6 rounded-lg flex-grow flex flex-col">
              <div className="grid md:grid-cols-2 gap-8 items-start flex-grow">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mt-2"><TranslatedText>Schedule a free consultation</TranslatedText></h1>
                  <p className="mt-4 text-base text-muted-foreground"><TranslatedText>In this meeting, we'll discuss:</TranslatedText></p>
                  <ul className="mt-4 space-y-2 text-xs text-foreground/80">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span><TranslatedText>Your current business challenges and where you need help</TranslatedText></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span><TranslatedText>The value of professional, 24/7 customer engagement</TranslatedText></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span><TranslatedText>How we can help you improve your business operations</TranslatedText></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span><TranslatedText>The range of solutions we offer for small and midsize businesses</TranslatedText></span>
                    </li>
                  </ul>
                </div>

                <form ref={formRef} action={formAction} className="space-y-4">
                  <div>
                    <Label htmlFor="name"><TranslatedText>Name</TranslatedText></Label>
                    <Input id="name" name="name" type="text" placeholder="Name" required />
                    {state.errors?.name && (
                      <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email"><TranslatedText>Email</TranslatedText></Label>
                    <Input id="email" name="email" type="email" placeholder="Email" required />
                    {state.errors?.email && (
                      <p className="text-destructive text-sm mt-1">{state.errors.email[0]}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="message"><TranslatedText>Message</TranslatedText></Label>
                    <Textarea id="message" name="message" placeholder="Message" rows={3} required />
                    {state.errors?.message && (
                      <p className="text-destructive text-sm mt-1">{state.errors.message[0]}</p>
                    )}
                  </div>
                  <SubmitButton />
                  {state.success && (
                    <p className="text-green-500 text-sm mt-2 text-center"><TranslatedText>{state.message}</TranslatedText></p>
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
