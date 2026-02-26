'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Star, Wrench, Shield, Thermometer } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Textarea } from '@/components/ui/textarea';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React from 'react';

export default function LandingPageTemplate3() {
  const aboutImage = PlaceHolderImages.find(img => img.id === 'lp3-about');
  const heroImages = [
    PlaceHolderImages.find(img => img.id === 'lp3-hero-1'),
    PlaceHolderImages.find(img => img.id === 'lp3-hero-2'),
    PlaceHolderImages.find(img => img.id === 'lp3-hero-3'),
  ].filter(Boolean);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  
  return (
    <div className="bg-background text-foreground">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-primary">CoolBreeze HVAC</h1>
                <nav className="hidden md:flex gap-6 items-center">
                    <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">Services</a>
                    <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">Why Us</a>
                    <a href="#reviews" className="text-sm font-medium hover:text-primary transition-colors">Reviews</a>
                </nav>
                 <a href="#contact">
                    <Button>Get a Free Quote</Button>
                </a>
            </div>
        </header>

      <main>
        {/* Hero Section */}
        <section className="h-screen relative flex items-center justify-center text-center text-white">
          <Carousel
            plugins={[plugin.current]}
            className="absolute inset-0 w-full h-full"
            opts={{ loop: true }}
          >
            <CarouselContent>
              {heroImages.map((image) => image && (
                <CarouselItem key={image.id}>
                  <div className="relative h-screen w-full">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      data-ai-hint={image.imageHint}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 p-4 opacity-0 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <p className="text-primary font-semibold">24/7 EMERGENCY HVAC REPAIR</p>
                <h1 className="text-4xl md:text-6xl font-extrabold mt-2">Don't Sweat It!</h1>
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-200">We'll Fix Your AC Fast.</h2>
                  <ul className="space-y-3 mt-6 max-w-md mx-auto text-left">
                    <li className="flex items-center gap-3 text-lg"><Check className="h-6 w-6 text-green-500" /> <span className="font-medium">24/7 Emergency Service</span></li>
                    <li className="flex items-center gap-3 text-lg"><Check className="h-6 w-6 text-green-500" /> <span className="font-medium">Certified & Insured Technicians</span></li>
                    <li className="flex items-center gap-3 text-lg"><Check className="h-6 w-6 text-green-500" /> <span className="font-medium">Upfront, Honest Pricing</span></li>
                </ul>
                  <a href="#contact">
                    <Button type="submit" className="w-full md:w-auto !mt-8 transition-transform hover:scale-105" size="lg">GET MY FREE QUOTE NOW</Button>
                  </a>
            </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 md:py-24 px-4">
             <div className="container mx-auto text-center">
                <h3 className="text-3xl font-bold">Complete HVAC Services</h3>
                <p className="text-muted-foreground mt-2">Keeping you comfortable all year round.</p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 border rounded-lg flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <Thermometer className="h-10 w-10 mx-auto text-primary" />
                    <h4 className="mt-4 text-xl font-semibold">AC & Furnace Repair</h4>
                    <p className="mt-2 text-muted-foreground">Fast, reliable repairs to get your system back up and running.</p>
                </div>
                <div className="p-6 border rounded-lg flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <Wrench className="h-10 w-10 mx-auto text-primary" />
                    <h4 className="mt-4 text-xl font-semibold">System Maintenance</h4>
                    <p className="mt-2 text-muted-foreground">Preventative tune-ups to ensure efficiency and extend your system's life.</p>
                </div>
                <div className="p-6 border rounded-lg flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <Shield className="h-10 w-10 mx-auto text-primary" />
                    <h4 className="mt-4 text-xl font-semibold">New System Installation</h4>
                    <p className="mt-2 text-muted-foreground">High-efficiency heating and cooling solutions tailored to your home.</p>
                </div>
                </div>
            </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="bg-muted py-16 md:py-24 px-4">
            <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                 {aboutImage && (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                        <Image src={aboutImage.imageUrl} alt={aboutImage.description} data-ai-hint={aboutImage.imageHint} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                )}
                <div>
                    <h3 className="text-3xl font-bold">Why Choose CoolBreeze?</h3>
                    <p className="mt-4 text-muted-foreground">We're a family-owned business dedicated to honest service and quality workmanship. When your HVAC system fails, you need a team you can trust to be there quickly and get the job done right the first time. That's our promise to you.</p>
                </div>
            </div>
        </section>

        {/* Google Reviews Section */}
        <section id="reviews" className="py-16 md:py-24 px-4">
            <div className="container mx-auto text-center">
                <h3 className="text-3xl font-bold">Our Customers Feel the Difference</h3>
                 <div className="mt-12 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="p-6 border rounded-lg transition-all duration-300 hover:shadow-lg hover:border-primary">
                        <div className="flex text-yellow-400 mb-2"> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> </div>
                        <p className="italic">"Our AC went out on the hottest day of the year. CoolBreeze was here within an hour and had us cool again in no time. Lifesavers!"</p>
                        <p className="font-semibold mt-4">- Jenny T.</p>
                    </div>
                    <div className="p-6 border rounded-lg transition-all duration-300 hover:shadow-lg hover:border-primary">
                        <div className="flex text-yellow-400 mb-2"> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> </div>
                        <p className="italic">"Honest pricing and great service. They explained everything clearly and didn't try to upsell me. I'll be using them for all my HVAC needs."</p>
                        <p className="font-semibold mt-4">- David R.</p>
                    </div>
                 </div>
            </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-primary text-primary-foreground py-16 md:py-24">
            <div className="container mx-auto px-4">
                 <div className="bg-muted text-foreground p-8 rounded-lg shadow-lg max-w-lg mx-auto">
                    <h3 className="text-2xl font-bold text-center">Get Your Free Repair Quote Now!</h3>
                    <p className="text-center text-muted-foreground mt-2">Fill out the form below for an instant callback.</p>
                    <form className="mt-6 space-y-4">
                    <Input placeholder="Name" required />
                    <Input type="tel" placeholder="Phone Number" required />
                    <Textarea placeholder="Briefly describe the issue..." required />
                    <Button type="submit" className="w-full !mt-6" size="lg">GET MY FREE QUOTE</Button>
                    <p className="text-xs text-center text-muted-foreground pt-2">We respect your privacy. No spam, ever.</p>
                    </form>
                </div>
            </div>
        </section>
      </main>
      
      <footer className="py-6 text-center text-muted-foreground">
        <p>CoolBreeze HVAC &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
