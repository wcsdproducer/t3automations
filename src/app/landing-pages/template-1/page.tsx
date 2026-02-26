'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, ShieldCheck, Smile } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPageTemplate1() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'lp1-hero');

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="py-4 px-6 md:px-12 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold text-primary">ProHome Services</h1>
        <Button>Get a Free Quote</Button>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center text-center text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              data-ai-hint={heroImage.imageHint}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 p-4">
            <h2 className="text-4xl md:text-6xl font-bold">Reliable Home Services, Done Right.</h2>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">From leaky faucets to full renovations, our team of certified professionals is here to help.</p>
            <Button size="lg" className="mt-8">Book Your Service Today</Button>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 md:py-24 px-6">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold">Our Services</h3>
            <p className="text-muted-foreground mt-2">Quality you can trust, for every part of your home.</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg">
                <Wrench className="h-10 w-10 mx-auto text-primary" />
                <h4 className="mt-4 text-xl font-semibold">General Repairs</h4>
                <p className="mt-2 text-muted-foreground">Fixing, maintaining, and improving your home with precision and care.</p>
              </div>
              <div className="p-6 border rounded-lg">
                <ShieldCheck className="h-10 w-10 mx-auto text-primary" />
                <h4 className="mt-4 text-xl font-semibold">Plumbing & Electrical</h4>
                <p className="mt-2 text-muted-foreground">Safe and certified solutions for your most critical home systems.</p>
              </div>
              <div className="p-6 border rounded-lg">
                <Smile className="h-10 w-10 mx-auto text-primary" />
                <h4 className="mt-4 text-xl font-semibold">Painting & Remodeling</h4>
                <p className="mt-2 text-muted-foreground">Transforming your space with a fresh look and expert craftsmanship.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="bg-muted py-16 md:py-24 px-6">
          <div className="container mx-auto max-w-2xl">
            <h3 className="text-3xl font-bold text-center">Request a Free Estimate</h3>
            <form className="mt-8 space-y-4">
              <Input placeholder="Your Name" />
              <Input type="email" placeholder="Your Email" />
              <Textarea placeholder="Tell us about your project..." />
              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} ProHome Services. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
