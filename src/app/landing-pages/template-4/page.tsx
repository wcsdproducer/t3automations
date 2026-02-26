'use client';
import { Button } from '@/components/ui/button';
import { Phone, CheckCircle, Star } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function TemplateContent() {
  const searchParams = useSearchParams();
  const heroEffect = searchParams.get('heroEffect') || 'slideshow';

  const heroImages = [
    PlaceHolderImages.find(img => img.id === 'lp4-hero-1'),
    PlaceHolderImages.find(img => img.id === 'lp4-hero-2'),
    PlaceHolderImages.find(img => img.id === 'lp4-hero-3'),
  ].filter((img): img is ImagePlaceholder => !!img);
  const singleHeroImage = heroImages[0];
  
  const service1 = PlaceHolderImages.find(img => img.id === 'lp4-service1');
  const service2 = PlaceHolderImages.find(img => img.id === 'lp4-service2');
  const service3 = PlaceHolderImages.find(img => img.id === 'lp4-service3');
  
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const heroContent = (
    <div className="relative z-10 px-6 opacity-0 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
       <h2 className="text-4xl md:text-6xl font-bold">Your Home, Spotlessly Clean.</h2>
       <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto">The friendly, reliable cleaning service your neighborhood trusts.</p>
       <a href="#contact">
           <Button size="lg" className="mt-8 transition-transform hover:scale-105">Book Your Cleaning</Button>
       </a>
    </div>
  );

  const renderHero = () => {
    if (heroEffect === 'parallax' && singleHeroImage) {
      return (
        <section
          className="h-screen relative flex items-center justify-center text-center text-white bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${singleHeroImage.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          {heroContent}
        </section>
      );
    }
    
    return (
      <section className="h-screen relative flex items-center justify-center text-center text-white">
        <Carousel
          plugins={[plugin.current]}
          className="absolute inset-0 w-full h-full"
          opts={{ loop: true }}
        >
          <CarouselContent>
            {heroImages.map((image) => (
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
        <div className="absolute inset-0 bg-black/40"></div>
        {heroContent}
      </section>
    );
  };

  return (
    <div className="bg-[#F8F5F2] text-[#4A3F35]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">SparkleClean</h1>
            <nav className="hidden md:flex gap-4 items-center text-sm font-medium">
                <a href="#services" className="hover:text-primary transition-colors">Services</a>
                <a href="#about" className="hover:text-primary transition-colors">Why Us</a>
                <a href="#reviews" className="hover:text-primary transition-colors">Reviews</a>
                 <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </nav>
            <a href="tel:1-800-123-4567" className="hidden md:flex items-center gap-2 font-semibold">
                <Phone className="h-5 w-5" />
                <span>1-800-123-4567</span>
            </a>
        </div>
      </header>

      <main>
        {renderHero()}
        
        {/* Services Section */}
        <section id="services" className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h3 className="text-3xl font-bold">Our Cleaning Services</h3>
                <p className="mt-2 text-muted-foreground">A perfect clean for every need and budget.</p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: 'Standard Cleaning', img: service1 },
                        { title: 'Deep Cleaning', img: service2 },
                        { title: 'Move-In/Out Cleaning', img: service3 }
                    ].map(service => (
                        <div key={service.title} className="group">
                             {service.img && (
                                <div className="aspect-video relative rounded-lg overflow-hidden shadow-lg">
                                    <Image src={service.img.imageUrl} alt={service.img.description} data-ai-hint={service.img.imageHint} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                </div>
                             )}
                            <h4 className="text-xl font-semibold mt-4">{service.title}</h4>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* About Us / Why Choose Us */}
        <section id="about" className="py-16 md:py-24 px-6">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video rounded-lg overflow-hidden group">
                  <Image src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBjbGVhbmluZ3xlbnwwfHx8fDE3NzI5OTg5MDR8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Professional cleaner" data-ai-hint="professional cleaner" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div>
              <h3 className="text-3xl font-bold">Why Your Neighbors Choose Us</h3>
              <p className="mt-4 text-muted-foreground">We're not just a company; we're part of the community. We take pride in our work and treat every home like our own, using only the best products to ensure a safe and sparkling clean environment for your family and pets.</p>
              <ul className="mt-6 space-y-4">
                <li className="font-medium flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> Eco-Friendly & Pet-Safe Products</li>
                <li className="font-medium flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> Background-Checked & Trained Staff</li>
                <li className="font-medium flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> 100% Satisfaction Guarantee</li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Google Reviews Section */}
        <section id="reviews" className="bg-white py-16 md:py-24 px-6">
            <div className="container mx-auto max-w-4xl text-center">
                <h3 className="text-3xl font-bold">Kind Words From Our Customers</h3>
                <div className="mt-12">
                     <div className="p-8 rounded-lg bg-background transition-shadow hover:shadow-xl">
                         <div className="flex text-yellow-400 mb-4 justify-center"> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> </div>
                        <p className="text-xl italic text-muted-foreground">"SparkleClean is the best! We've used them for years. They are always on time, professional, and our house has never looked better. It's such a relief to come home to a clean house."</p>
                        <p className="font-semibold mt-6">- The Chen Family</p>
                    </div>
                </div>
            </div>
        </section>

         {/* Call to Action / Contact */}
        <section id="contact" className="py-16 md:py-24 px-6">
            <div className="container mx-auto text-center max-w-3xl">
                <h3 className="text-3xl font-bold">Ready for a Sparkling Home?</h3>
                <p className="text-lg mt-2 text-muted-foreground">Get 20% off your first cleaning! Fill out the form below to claim your discount and get a free quote.</p>
                <form className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input placeholder="Your Name" className="md:col-span-1 bg-white" />
                    <Input type="email" placeholder="Your Email" className="md:col-span-1 bg-white" />
                    <Button size="lg" type="submit" className="md:col-span-1 h-12">Claim Your Discount</Button>
                </form>
            </div>
        </section>
      </main>

       {/* Footer */}
      <footer className="py-8 px-6 text-center text-muted-foreground bg-white border-t">
        <p>&copy; {new Date().getFullYear()} SparkleClean. Serving our local community with pride.</p>
      </footer>
    </div>
  );
}


export default function LandingPageTemplate4() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
            <TemplateContent />
        </Suspense>
    )
}
