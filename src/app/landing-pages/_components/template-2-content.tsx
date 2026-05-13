'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Brush, Hammer, Building, Phone } from 'lucide-react';
import Image from 'next/image';
import { type ImagePlaceholder } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React, { useState, useEffect, useRef } from 'react';
import { getContentForService } from '@/lib/landing-page-content';
import type { TemplateProps } from '@/lib/template-props';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitLead } from '@/app/actions/leads';
import { useToast } from '@/hooks/use-toast';
function formatPhone(value: string) {
  if (!value) return value;
  const d = value.replace(/\D/g, '');
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

export function Template2Content({
  businessProfileId,
  heroEffect = 'slideshow',
  service = 'Handyman Services',
  phone: phoneProp = '(000) 000-0000',
  logoUrl = '',
  companyName: companyNameProp = '',
  bookingUrl,
}: TemplateProps) {
  const [content, setContent] = useState<any>(null);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Phone number is required'),
    notes: z.string().optional(),
    consent: z.boolean().refine(val => val === true, {
      message: "You must agree to receive SMS communications.",
    }),
  });

  type ContactFormValues = z.infer<typeof contactSchema>;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', notes: '', consent: false },
  });

  const onSubmit = async (data: ContactFormValues) => {
    if (!businessProfileId) {
      toast({ title: 'Error', description: 'Could not submit request. Missing profile.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const res = await submitLead({ ...data, businessProfileId });
    setIsSubmitting(false);
    if (res.success) {
      toast({ title: 'Success', description: 'Your request has been submitted. We will be in touch shortly!' });
      form.reset();
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to submit request', variant: 'destructive' });
    }
  };

  useEffect(() => { setContent(getContentForService(service)); }, [service]);

  if (!content) return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;

  const phone = formatPhone(phoneProp);
  const companyName = companyNameProp || content.companyName;
  const aboutImage = content.images.about;
  const galleryImages: ImagePlaceholder[] = content.images.gallery || [];
  const heroImages: ImagePlaceholder[] = content.images.hero;
  const singleHeroImage = heroImages[0];

  const heroContent = (
    <div className="relative z-10 max-w-3xl opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-4xl md:text-6xl font-bold">{content.hero.title}</h2>
      <p className="mt-4 text-lg md:text-xl">{content.hero.subtitle}</p>
      <div className="flex flex-wrap gap-4 mt-8">
        <a href="#contact">
          <Button size="lg" className="transition-transform hover:scale-105">Get a Free Quote</Button>
        </a>
        {bookingUrl && (
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white transition-transform hover:scale-105">Book Appointment</Button>
          </a>
        )}
      </div>
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
        <Carousel plugins={[plugin.current]} className="absolute inset-0 w-full h-full" opts={{ loop: true }}>
          <CarouselContent>
            {heroImages.map((image) => (
              <CarouselItem key={image.id}>
                <div className="relative h-screen w-full">
                  <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" priority />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        {heroContent}
      </section>
    );
  };

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 p-6 flex justify-between items-center bg-background/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {logoUrl && <Image src={logoUrl} alt={`${companyName} Logo`} width={140} height={40} className="h-10 w-auto object-contain" />}
          <h1 className="text-2xl font-bold text-white tracking-wider">{companyName}</h1>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <a href="#services" className="text-sm font-medium text-white hover:text-primary transition-colors">Services</a>
          <a href="#about" className="text-sm font-medium text-white hover:text-primary transition-colors">About Us</a>
          <a href="#reviews" className="text-sm font-medium text-white hover:text-primary transition-colors">Reviews</a>
          <a href="#contact" className="text-sm font-medium text-white hover:text-primary transition-colors">Contact</a>
        </nav>
        <a href={`tel:${phone}`} className="flex items-center gap-2 font-semibold text-white">
          <Phone className="h-5 w-5" /><span>{phone}</span>
        </a>
      </header>

      <main>
        {renderHero()}

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
            {galleryImages.length > 0 && (
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryImages.map((image, i) => image && (
                  <div key={i} className="aspect-square relative rounded-lg overflow-hidden group">
                    <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

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

        <section id="reviews" className="py-16 md:py-24 px-6 bg-secondary">
          <div className="container mx-auto max-w-6xl">
            <h3 className="text-3xl font-bold text-center mb-12">{content.reviews.title}</h3>
            <Carousel opts={{ align: 'start', loop: true }} plugins={[plugin.current]} className="w-full">
              <CarouselContent>
                {content.reviews.items.map((review: any, index: number) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                        <CardContent className="p-6 flex flex-col flex-grow">
                          <div className="flex text-yellow-400 mb-2">{[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}</div>
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

        <section id="contact" className="py-16 md:py-24 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-bold">{content.contact.title}</h3>
            <p className="text-muted-foreground mt-2">{content.contact.subtitle}</p>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4 text-left">
              <div>
                <Input placeholder="Full Name" {...form.register('name')} />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Input type="email" placeholder="Email Address" {...form.register('email')} />
                {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
              </div>
              <div>
                <Input type="tel" placeholder="Phone Number" {...form.register('phone')} />
                {form.formState.errors.phone && <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>}
              </div>
              <div>
                <Textarea placeholder="Tell us about your dream project..." {...form.register('notes')} />
                {form.formState.errors.notes && <p className="text-sm text-destructive mt-1">{form.formState.errors.notes.message}</p>}
              </div>
              <div className="flex items-start space-x-2 text-left mt-4 bg-background p-4 rounded-md border">
                <Checkbox 
                  id="consent" 
                  checked={form.watch('consent')} 
                  onCheckedChange={(checked) => form.setValue('consent', checked as boolean, { shouldValidate: true })} 
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I agree to receive SMS text messages from {companyName}.
                  </label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By checking this box, you consent to receive SMS messages regarding your inquiry. Message and data rates may apply. Reply STOP to opt-out. See our <a href={`/api/legal/privacy?userId=${businessProfileId}`} target="_blank" className="underline text-primary">Privacy Policy</a> and <a href={`/api/legal/tos?userId=${businessProfileId}`} target="_blank" className="underline text-primary">Terms of Service</a>.
                  </p>
                </div>
              </div>
              {form.formState.errors.consent && <p className="text-sm text-destructive mt-1 text-left">{form.formState.errors.consent.message}</p>}
              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Schedule Consultation'}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 text-center text-muted-foreground bg-secondary border-t">
        <p>&copy; {new Date().getFullYear()} {companyName}. All Rights Reserved.</p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <a href={`/api/legal/privacy?userId=${businessProfileId}`} target="_blank" className="hover:underline">Privacy Policy</a>
          <a href={`/api/legal/tos?userId=${businessProfileId}`} target="_blank" className="hover:underline">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
