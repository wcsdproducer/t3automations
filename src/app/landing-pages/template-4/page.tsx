
'use client';
import { Button } from '@/components/ui/button';
import { Phone, CheckCircle, Star } from 'lucide-react';
import Image from 'next/image';
import { type ImagePlaceholder } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getContentForService } from '@/lib/landing-page-content';

function TemplateContent() {
  const searchParams = useSearchParams();
  const heroEffect = searchParams.get('heroEffect') || 'slideshow';
  const service = searchParams.get('service') || 'House Cleaning (Maid Services)';
  
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    setContent(getContentForService(service));
  }, [service]);
  
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  if (!content) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  const heroImages = content.images.hero;
  const singleHeroImage = heroImages[0];
  const galleryImages = content.images.gallery;
  const aboutImage = content.images.about;
  
  const heroContent = (
    <div className="relative z-10 px-6 opacity-0 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
       <h2 className="text-4xl md:text-6xl font-bold">{content.hero.title}</h2>
       <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto">{content.hero.subtitle}</p>
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
            <h1 className="text-2xl font-bold text-primary">{content.companyName}</h1>
            <nav className="hidden md:flex gap-4 items-center text-sm font-medium">
                <a href="#services" className="hover:text-primary transition-colors">Services</a>
                <a href="#about" className="hover:text-primary transition-colors">Why Us</a>
                <a href="#reviews" className="hover:text-primary transition-colors">Reviews</a>
                 <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </nav>
            <a href="tel:(555) 123-4567" className="hidden md:flex items-center gap-2 font-semibold">
                <Phone className="h-5 w-5" />
                <span>(555) 123-4567</span>
            </a>
        </div>
      </header>

      <main>
        {renderHero()}
        
        {/* Services Section */}
        <section id="services" className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h3 className="text-3xl font-bold">{content.services.title}</h3>
                <p className="mt-2 text-muted-foreground">{content.services.subtitle}</p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {galleryImages.slice(0, 3).map((serviceImg: ImagePlaceholder, index: number) => (
                        <div key={index} className="group">
                             {serviceImg && (
                                <div className="aspect-video relative rounded-lg overflow-hidden shadow-lg">
                                    <Image src={serviceImg.imageUrl} alt={serviceImg.description} data-ai-hint={serviceImg.imageHint} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                </div>
                             )}
                            <h4 className="text-xl font-semibold mt-4">{content.services.items[index]?.title || 'Our Service'}</h4>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* About Us / Why Choose Us */}
        <section id="about" className="py-16 md:py-24 px-6">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            {aboutImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden group">
                    <Image src={aboutImage.imageUrl} alt={aboutImage.description} data-ai-hint={aboutImage.imageHint} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            )}
            <div>
              <h3 className="text-3xl font-bold">{content.about.title}</h3>
              <p className="mt-4 text-muted-foreground">{content.about.body}</p>
              <ul className="mt-6 space-y-4">
                {content.about.points.map((point: string, index: number) => (
                  <li key={index} className="font-medium flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> {point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        
        {/* Google Reviews Section */}
        <section id="reviews" className="bg-white py-16 md:py-24 px-6">
          <div className="container mx-auto max-w-6xl text-center">
            <h3 className="text-3xl font-bold">{content.reviews.title}</h3>
            <div className="mt-12">
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
                      <div className="p-1">
                        <div className="p-8 rounded-lg bg-background transition-shadow hover:shadow-xl">
                          <div className="flex text-yellow-400 mb-4 justify-center"> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> </div>
                          <p className="text-xl italic text-muted-foreground">"{review.quote}"</p>
                          <p className="font-semibold mt-6">{review.author}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>

         {/* Call to Action / Contact */}
        <section id="contact" className="py-16 md:py-24 px-6">
            <div className="container mx-auto text-center max-w-3xl">
                <h3 className="text-3xl font-bold">{content.contact.title}</h3>
                <p className="text-lg mt-2 text-muted-foreground">{content.contact.subtitle}</p>
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
        <p>&copy; {new Date().getFullYear()} {content.companyName}. Serving our local community with pride.</p>
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
