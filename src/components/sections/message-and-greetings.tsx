'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function MessageAndGreetings() {
  const { toast } = useToast();
  const [greeting, setGreeting] = useState("Welcome to [Your Company]! How can I help you today?");

  const handleTakeMessage = () => {
    toast({
      title: 'Message Sent',
      description: 'Your message has been recorded and sent.',
    });
  };

  const handleUpdateGreeting = () => {
    toast({
      title: 'Greeting Updated',
      description: 'Your custom greeting is now active.',
    });
  };

  return (
    <section className="bg-card py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            More Than Just Answering Calls
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From taking detailed messages to representing your brand with custom greetings, we've got you covered.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Message Taking & Delivery</CardTitle>
              <CardDescription>
                Never miss an important message. Our AI records detailed notes and delivers them instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="(555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Type your message here." />
              </div>
              <Button className="w-full" onClick={handleTakeMessage}>Take Message</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Your Brand, Your Voice</CardTitle>
              <CardDescription>
                Enable businesses to create and update custom greetings to align with their brand voice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted p-4">
                <p className="text-sm italic text-muted-foreground">
                  "{greeting}"
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="greeting">Customize Greeting</Label>
                <Textarea id="greeting" value={greeting} onChange={(e) => setGreeting(e.target.value)} />
              </div>
              <Button variant="outline" className="w-full" onClick={handleUpdateGreeting}>Update Greeting</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
