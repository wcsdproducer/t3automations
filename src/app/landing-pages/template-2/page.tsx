
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Brush, Hammer, Building, Phone } from 'lucide-react';
import Image from 'next/image';
import { type ImagePlaceholder } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getContentForService } from '@/lib/landing-page-content';

function TemplateContent() {
  const searchParams = useSearchParams();
  const heroEffect = searchParams.get('heroEffect') || 'slideshow';
  const service = searchParams.get('service') || 'Handyman Services';
  const phoneParam = searchParams.get('phone') || '(000) 000-0000';
  
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    setContent(getContentForService(service));
  }, [service]);

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const phone = formatPhoneNumber(phoneParam);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  if (!content) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }
  
  const aboutImage = content.images.about;
  const galleryImages = content.images.gallery;
  const heroImages = content.images.hero;
  const singleHeroImage = heroImages[0];

  const heroContent = (
    <div className="relative z-10 max-w-3xl opacity-0 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
      <h2 className="text-4xl md:text-6xl font-bold">{content.hero.title}</h2>
      <p className="mt-4 text-lg md:text-xl">{content.hero.subtitle}</p>
    </div>
  );

  const renderHero = () => {
    if (heroEffect === 'parallax' && singleHeroImage) {
      return (
        <section
          className="h-screen relative flex items-end p-8 md:p-12 text-white bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${singleHeroImage.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          {heroContent}
        </section>
      );
    }
    
    return (
      <section className="h-screen relative flex items-end p-8 md:p-12 text-white">
        <Carousel
          plugins={[plugin.current]}
          className="absolute inset-0 w-full h-full"
          opts={{ loop: true }}
        >
          <CarouselContent>
            {heroImages.map((image: ImagePlaceholder) => (
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        {heroContent}
      </section>
    );
  }

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 p-6 flex justify-between items-center bg-background/30 backdrop-blur-md transition-colors duration-300">
        <h1 className="text-2xl font-bold text-white tracking-wider">{content.companyName}</h1>
        <nav className="hidden md:flex gap-6 items-center">
            <a href="#services" className="text-sm font-medium text-white hover:text-primary transition-colors">Services</a>
            <a href="#about" className="text-sm font-medium text-white hover:text-primary transition-colors">About Us</a>
            <a href="#reviews" className="text-sm font-medium text-white hover:text-primary transition-colors">Reviews</a>
            <a href="#contact" className="text-sm font-medium text-white hover:text-primary transition-colors">Contact</a>
        </nav>
        <div className="flex items-center gap-6">
            <a href={`tel:${phone}`} className="hidden md:flex items-center gap-2 font-semibold text-white">
                <Phone className="h-5 w-5" />
                <span>{phone}</span>
            </a>
        </div>
      </header>

      <main>
        {renderHero()}

        {/* Services Section */}
        <section id="services" className="py-16 md:py-24 px-6 bg-secondary">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold">{content.services.title}</h3>
            <p className="text-muted-foreground mt-2">{content.services.subtitle}</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="p-6 transition-all duration-300 hover:bg-background/50 rounded-lg">
                    <Brush className="h-10 w-10 text-primary" />
                    <h4 className="mt-4 text-xl font-semibold">Interior Design & Remodeling</h4>
                    <p className="mt-2 text-muted-foreground">Full-service design and construction for kitchens, bathrooms, and entire homes.</p>
                </div>
                <div className="p-6 transition-all duration-300 hover:bg-background/50 rounded-lg">
                    <Hammer className="h-10 w-10 text-primary" />
                    <h4 className="mt-4 text-xl font-semibold">Custom Cabinetry & Millwork</h4>
                    <p className="mt-2 text-muted-foreground">Bespoke woodworking solutions to add character and functionality to your space.</p>
                </div>
                <div className="p-6 transition-all duration-300 hover:bg-background/50 rounded-lg">
                    <Building className="h-10 w-10 text-primary" />
                    <h4 className="mt-4 text-xl font-semibold">Exterior & Landscape Design</h4>
                    <p className="mt-2 text-muted-foreground">Enhancing curb appeal and creating beautiful outdoor living areas.</p>
                </div>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.map((image: ImagePlaceholder, i: number) => image && (
                <div key={i} className="aspect-square relative rounded-lg overflow-hidden group">
                  <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-16 md:py-24 px-6 bg-background">
            <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                {aboutImage && (
                    <div className="relative aspect-square rounded-lg overflow-hidden group">
                        <Image src={aboutImage.imageUrl} alt={aboutImage.description} data-ai-hint={aboutImage.imageHint} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                )}
                <div>
                    <h3 className="text-3xl font-bold">{content.about.title}</h3>
                    <p className="mt-4 text-muted-foreground">{content.about.body}</p>
                </div>
            </div>
        </section>


        {/* Google Reviews Section */}
        <section id="reviews" className="py-16 md:py-24 px-6 bg-secondary">
          <div className="container mx-auto max-w-6xl">
            <h3 className="text-3xl font-bold text-center mb-12">{content.reviews.title}</h3>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[plugin.current]}
              className="w-full"
            >
              <CarouselContent>
                {content.reviews.items.map((review: any, index: number) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                        <CardContent className="p-6 flex flex-col flex-grow">
                          <div className="flex text-yellow-400 mb-2"> <Star fill="currentColor"/> <Star fill="currentColor"/> <Star fill="currentColor"/> <Star fill="currentColor"/> <Star fill="currentColor"/> </div>
                          <p className="text-muted-foreground flex-grow">"{review.quote}"</p>
                          <p className="font-semibold mt-4">{review.author}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>

         {/* Contact Section */}
        <section id="contact" className="py-16 md:py-24 px-6">
            <div className="container mx-auto max-w-2xl text-center">
                <h3 className="text-3xl font-bold">{content.contact.title}</h3>
                <p className="text-muted-foreground mt-2">{content.contact.subtitle}</p>
                <form className="mt-8 space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="First Name" />
                        <Input placeholder="Last Name" />
                    </div>
                    <Input type="email" placeholder="Email Address" />
                    <Textarea placeholder="Tell us about your dream project..." />
                    <Button type="submit" className="w-full">Schedule Consultation</Button>
                </form>
            </div>
        </section>
      </main>

       {/* Footer */}
       <footer className="py-8 px-6 text-center text-muted-foreground bg-secondary">
        <p>&copy; {new Date().getFullYear()} {content.companyName}. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default function LandingPageTemplate2() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
            <TemplateContent />
        </Suspense>
    )
}
