
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, ShieldCheck, Smile, Star, Phone, Mail, Clock } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getContentForService } from '@/lib/landing-page-content';

function TemplateContent() {
  const searchParams = useSearchParams();
  const heroEffect = searchParams.get('heroEffect') || 'slideshow';
  const service = searchParams.get('service') || 'Handyman Services';
  
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    setContent(getContentForService(service));
  }, [service]);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  if (!content) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }
  
  const aboutImage = content.images.about;
  const heroImages = content.images.hero;
  const singleHeroImage = heroImages[0];

  const heroContent = (
    <div className="relative z-10 p-4 opacity-0 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
      <h2 className="text-4xl md:text-6xl font-bold">{content.hero.title}</h2>
      <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">{content.hero.subtitle}</p>
      <a href="#contact">
          <Button size="lg" className="mt-8 transition-transform hover:scale-105">{content.hero.cta}</Button>
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
                <div className="absolute inset-0 bg-black/50" />
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
        <div className="absolute inset-0 bg-black/50" />
        {heroContent}
      </section>
    );
  };

  const serviceIcons = {
    'Expert Consultation': <Wrench className="h-10 w-10 mx-auto text-primary" />,
    'Quality Installation & Repair': <ShieldCheck className="h-10 w-10 mx-auto text-primary" />,
    'Ongoing Maintenance': <Smile className="h-10 w-10 mx-auto text-primary" />,
  };
  
  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center border-b bg-background/80 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-primary">{content.companyName}</h1>
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
        {renderHero()}

        {/* Services Section */}
        <section id="services" className="py-16 md:py-24 px-6">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold">{content.services.title}</h3>
            <p className="text-muted-foreground mt-2">{content.services.subtitle}</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.services.items.map((item: any, index: number) => (
                <div key={index} className="p-6 border rounded-lg flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  {serviceIcons[item.title as keyof typeof serviceIcons] || <Wrench className="h-10 w-10 mx-auto text-primary" />}
                  <h4 className="mt-4 text-xl font-semibold">{item.title.replace(`${service}`, '')}</h4>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="bg-muted py-16 md:py-24 px-6">
            <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h3 className="text-3xl font-bold">{content.about.title}</h3>
                    <p className="mt-4 text-muted-foreground">{content.about.body}</p>
                    <ul className="mt-6 space-y-2">
                      {content.about.points.map((point: string, index: number) => (
                        <li key={index} className="flex items-center gap-3"><Wrench className="h-5 w-5 text-primary" /> {point}</li>
                      ))}
                    </ul>
                </div>
                 {aboutImage && (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                        <Image src={aboutImage.imageUrl} alt={aboutImage.description} data-ai-hint={aboutImage.imageHint} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                )}
            </div>
        </section>
        
        {/* Google Reviews Section */}
        <section id="reviews" className="py-16 md:py-24 px-6">
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
                      <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:border-primary h-full flex flex-col justify-between">
                        <div>
                          <div className="flex text-yellow-400 mb-2"> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> </div>
                          <p className="text-muted-foreground">"{review.quote}"</p>
                        </div>
                        <p className="font-semibold mt-4">{review.author}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact" className="bg-muted py-16 md:py-24 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-bold">{content.contact.title}</h3>
            <p className="text-muted-foreground mt-2">{content.contact.subtitle}</p>
            <form className="mt-8 space-y-4 text-left">
              <Input placeholder="Your Name" />
              <Input type="email" placeholder="Your Email" />
              <Textarea placeholder="Tell us about your project..." />
              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
             <div className="mt-8 text-muted-foreground">
                <p className="flex items-center justify-center gap-2"><Phone className="h-5 w-5 text-primary" /> (555) 123-4567</p>
                <p className="flex items-center justify-center gap-2 mt-2"><Mail className="h-5 w-5 text-primary" /> contact@{content.companyName.toLowerCase().replace(/\s/g, '')}.com</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} {content.companyName}. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default function LandingPageTemplate1() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
            <TemplateContent />
        </Suspense>
    )
}
