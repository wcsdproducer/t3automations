'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPageTemplate3() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'lp3-hero');
  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side: Image and Headline */}
          <div>
            <p className="text-primary font-semibold">EMERGENCY HVAC REPAIR</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-2">Don't Sweat It!</h1>
            <h2 className="text-4xl md:text-5xl font-extrabold text-muted-foreground">We'll Fix Your AC Fast.</h2>
            {heroImage && (
              <div className="relative mt-6 rounded-lg overflow-hidden">
                  <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      data-ai-hint={heroImage.imageHint}
                      width={600}
                      height={400}
                      className="w-full"
                  />
              </div>
            )}
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-3"><Check className="h-6 w-6 text-green-500" /> <span className="font-medium">24/7 Emergency Service</span></li>
              <li className="flex items-center gap-3"><Check className="h-6 w-6 text-green-500" /> <span className="font-medium">Certified & Insured Technicians</span></li>
              <li className="flex items-center gap-3"><Check className="h-6 w-6 text-green-500" /> <span className="font-medium">Upfront, Honest Pricing</span></li>
            </ul>
          </div>
          
          {/* Right Side: Form */}
          <div className="bg-muted p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-center">Get Your Free Repair Quote Now!</h3>
            <p className="text-center text-muted-foreground mt-2">Fill out the form below for an instant callback.</p>
            <form className="mt-6 space-y-4">
              <Input placeholder="Name" required />
              <Input type="tel" placeholder="Phone Number" required />
              <Input type="text" placeholder="ZIP Code" required />
              <Button type="submit" className="w-full !mt-6" size="lg">GET MY FREE QUOTE</Button>
              <p className="text-xs text-center text-muted-foreground pt-2">We respect your privacy. No spam, ever.</p>
            </form>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-muted-foreground mt-12">
        <p>CoolBreeze HVAC &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
