
'use client';

import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { T3LogoText } from '@/components/ui/logo';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="max-w-3xl">
              <p className="text-primary font-semibold uppercase tracking-wider">Talk to us</p>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl mt-2">Schedule a free consultation</h1>
              <p className="mt-6 text-lg text-muted-foreground">In this meeting, we'll discuss:</p>
              <ul className="mt-4 space-y-3 text-lg text-foreground/80">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span>Your current business challenges and where you need help</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span>The value of professional, 24/7 customer engagement</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span>How we can help you improve your business operations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span>The range of solutions we offer for small and midsize businesses</span>
                </li>
              </ul>
            </div>

            <div className="mt-16 bg-card p-8 md:p-12 rounded-lg">
                <div className="grid md:grid-cols-2 gap-16 items-start">
                    <div className="space-y-6">
                        <T3LogoText className="text-primary" />
                        <h2 className="text-3xl font-bold">T3 Automations Consultation</h2>
                        <p className="text-muted-foreground">Learn how T3 Automations can help your business.</p>
                        <p className="text-muted-foreground">We'll address your questions and discuss solutions, whether you're interested in our receptionist, chat, or outreach services.</p>
                    </div>
                    <form className="space-y-6">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" type="text" placeholder="Name" />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="Email" />
                        </div>
                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Message" rows={5} />
                        </div>
                        <Button type="submit" className="w-full text-lg py-6">Send</Button>
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
