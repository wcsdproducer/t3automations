'use client';

import { handleCallTriage } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { IntelligentCallTriageOutput } from '@/ai/flows/intelligent-call-triage';
import { Bot, CheckCircle, HelpCircle } from 'lucide-react';
import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const initialState = {
  message: '',
  data: null as IntelligentCallTriageOutput | null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Triaging...' : 'Triage Call'}
    </Button>
  );
}

export default function AnsweringService() {
  const [state, formAction] = useActionState(handleCallTriage, initialState);
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.message && state.message !== 'Triage complete' && !state.data) {
      toast({
        variant: 'destructive',
        title: 'Triage Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <section className="py-20 md:py-28" id="demos">
      <div className="container text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Explore what our AI can do for you</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          See how our AI can handle your calls, routing them to the right people every time.
        </p>
      </div>
      <div className="container mt-12 grid grid-cols-1 justify-center">
        <div className="max-w-2xl mx-auto w-full">
        <Card className="shadow-lg">
          <form action={formAction}>
            <CardHeader className='text-center'>
              <CardTitle>AI Receptionist</CardTitle>
              <CardDescription>Enter a mock call transcript and routing rules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="callTranscript">Call Transcript</Label>
                <Textarea
                  id="callTranscript"
                  name="callTranscript"
                  placeholder="e.g., 'Hi, I'd like to ask about the pricing for your enterprise plan.'"
                  defaultValue="Hi, I wanted to follow up on an invoice I received. I think there might be a mistake on it. Can you help?"
                  rows={3}
                  required
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="predefinedRules">Routing Rules</Label>
                <Textarea
                  id="predefinedRules"
                  name="predefinedRules"
                  placeholder="e.g., 'If call is about pricing, route to Sales. If about support, route to Tech Support.'"
                  defaultValue="If intent is 'Billing Inquiry', route to 'Billing Department'. If intent is 'Sales', route to 'Sales Team'. Otherwise, route to 'General Support'."
                  rows={3}
                  required
                  className="bg-muted"
                />
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>

          {state.data && (
            <div className="p-6 pt-0">
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>Triage Result</AlertTitle>
                <AlertDescription>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start space-x-3">
                      <HelpCircle className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                      <div>
                        <p className="font-semibold">Caller Intent</p>
                        <p className="text-muted-foreground">{state.data.intent}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Bot className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                      <div>
                        <p className="font-semibold">Suggested Department</p>
                        <p className="text-muted-foreground">{state.data.department}</p>
                      </div>
                    </div>
                     <div className="flex items-start space-x-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                      <div>
                        <p className="font-semibold">Notes</p>
                        <p className="text-muted-foreground">{state.data.notes}</p>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </Card>
        </div>
      </div>
    </section>
  );
}