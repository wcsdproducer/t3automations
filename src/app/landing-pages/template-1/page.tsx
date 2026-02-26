'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, ShieldCheck, Smile, Star, Phone, Mail, Clock } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPageTemplate1() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'lp1-hero');
  const aboutImage = PlaceHolderImages.find(img => img.id === 'lp1-about');


  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center border-b bg-background/80 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-primary">ProHome Services</h1>
        <nav className="hidden md:flex gap-6 items-center">
            <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">Services</a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">About Us</a>
            <a href="#reviews" className="text-sm font-medium hover:text-primary transition-colors">Reviews</a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</a>
        </nav>
        <a href="#contact">
            <Button>Get a Free Quote</Button>
        </a>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-center text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              data-ai-hint={heroImage.imageHint}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 p-4">
            <h2 className="text-4xl md:text-6xl font-bold">Reliable Home Services, Done Right.</h2>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">From leaky faucets to full renovations, our team of certified professionals is here to help.</p>
            <a href="#contact">
                <Button size="lg" className="mt-8">Book Your Service Today</Button>
            </a>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 md:py-24 px-6">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold">Our Services</h3>
            <p className="text-muted-foreground mt-2">Quality you can trust, for every part of your home.</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg flex flex-col items-center">
                <Wrench className="h-10 w-10 mx-auto text-primary" />
                <h4 className="mt-4 text-xl font-semibold">General Repairs</h4>
                <p className="mt-2 text-muted-foreground">Fixing, maintaining, and improving your home with precision and care.</p>
              </div>
              <div className="p-6 border rounded-lg flex flex-col items-center">
                <ShieldCheck className="h-10 w-10 mx-auto text-primary" />
                <h4 className="mt-4 text-xl font-semibold">Plumbing & Electrical</h4>
                <p className="mt-2 text-muted-foreground">Safe and certified solutions for your most critical home systems.</p>
              </div>
              <div className="p-6 border rounded-lg flex flex-col items-center">
                <Smile className="h-10 w-10 mx-auto text-primary" />
                <h4 className="mt-4 text-xl font-semibold">Painting & Remodeling</h4>
                <p className="mt-2 text-muted-foreground">Transforming your space with a fresh look and expert craftsmanship.</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="bg-muted py-16 md:py-24 px-6">
            <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h3 className="text-3xl font-bold">About ProHome Services</h3>
                    <p className="mt-4 text-muted-foreground">For over 15 years, ProHome Services has been the go-to partner for homeowners in our community. We started with a simple mission: to provide reliable, high-quality home repair and remodeling services with a commitment to customer satisfaction. Our team is our family, and we treat every home we work on as if it were our own.</p>
                    <ul className="mt-6 space-y-2">
                        <li className="flex items-center gap-3"><Wrench className="h-5 w-5 text-primary" /> Certified and Insured Professionals</li>
                        <li className="flex items-center gap-3"><Smile className="h-5 w-5 text-primary" /> 100% Satisfaction Guarantee</li>
                        <li className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" /> Punctual and Respectful Service</li>
                    </ul>
                </div>
                 {aboutImage && (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                        <Image src={aboutImage.imageUrl} alt={aboutImage.description} data-ai-hint={aboutImage.imageHint} fill className="object-cover" />
                    </div>
                )}
            </div>
        </section>
        
        {/* Google Reviews Section */}
        <section id="reviews" className="py-16 md:py-24 px-6">
             <div className="container mx-auto max-w-4xl">
             <h3 className="text-3xl font-bold text-center mb-12">Trusted by Your Neighbors</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="border rounded-lg p-6">
                  <div className="flex text-yellow-400 mb-2"> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> </div>
                  <p className="text-muted-foreground">"The ProHome team was fantastic. They were on time, professional, and did an amazing job on our bathroom remodel. We couldn't be happier with the results!"</p>
                  <p className="font-semibold mt-4">- Sarah J.</p>
               </div>
                <div className="border rounded-lg p-6">
                  <div className="flex text-yellow-400 mb-2"> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> </div>
                  <p className="text-muted-foreground">"I had an electrical issue that two other companies couldn't figure out. ProHome diagnosed and fixed it in under an hour. True professionals. Highly recommend."</p>
                  <p className="font-semibold mt-4">- Mike D.</p>
               </div>
             </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact" className="bg-muted py-16 md:py-24 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-bold">Request a Free Estimate</h3>
            <p className="text-muted-foreground mt-2">Let's discuss your next project. Fill out the form below or give us a call!</p>
            <form className="mt-8 space-y-4 text-left">
              <Input placeholder="Your Name" />
              <Input type="email" placeholder="Your Email" />
              <Textarea placeholder="Tell us about your project..." />
              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
             <div className="mt-8 text-muted-foreground">
                <p className="flex items-center justify-center gap-2"><Phone className="h-5 w-5 text-primary" /> (555) 123-4567</p>
                <p className="flex items-center justify-center gap-2 mt-2"><Mail className="h-5 w-5 text-primary" /> contact@prohomeservices.com</p>
            </div>
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
