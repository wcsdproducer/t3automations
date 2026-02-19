'use client';

import React, { useState } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { T3LogoText } from '@/components/ui/logo';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name || !email || !message) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill out all the fields.",
      });
      return;
    }

    // Here you would typically send the form data to a server
    console.log({ name, email, message });

    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll be in touch soon.",
    });

    // Clear form
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1 pt-20 flex flex-col">
        <section className="py-8 flex-grow flex flex-col">
          <div className="container flex flex-col flex-grow">
            <div className="max-w-3xl">
              <p className="text-primary font-semibold uppercase tracking-wider">Talk to us</p>
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
                        <T3LogoText className="text-primary" />
                        <h2 className="text-2xl font-bold">T3 Automations Consultation</h2>
                        <p className="text-muted-foreground text-sm">Learn how T3 Automations can help your business.</p>
                        <p className="text-muted-foreground text-sm">We'll address your questions and discuss solutions, whether you're interested in our receptionist, chat, or outreach services.</p>
                    </div>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              type="text"
                              placeholder="Name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                        </div>
                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                              id="message"
                              placeholder="Message"
                              rows={3}
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              required
                            />
                        </div>
                        <Button type="submit" className="w-full text-md py-4">Send</Button>
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
