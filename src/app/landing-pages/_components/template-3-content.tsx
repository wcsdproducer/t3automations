'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Star, Phone } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import { type ImagePlaceholder } from '@/lib/placeholder-images';
import { Textarea } from '@/components/ui/textarea';
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

function ServiceIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (LucideIcons as any)[name || 'Wrench'] || LucideIcons.Wrench;
  return <Icon className={className} />;
}

export function Template3Content({
  businessProfileId,
  heroEffect = 'slideshow',
  service = 'HVAC Maintenance & Repair',
  phone: phoneProp = '(000) 000-0000',
  logoUrl = '',
  companyName: companyNameProp = '',
  bookingUrl,
  websiteConfig,
}: TemplateProps) {
  const [content, setContent] = useState<any>(null);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }));
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

  useEffect(() => {
    const staticContent = getContentForService(service);
    if (websiteConfig) {
      setContent({
        ...websiteConfig,
        images: staticContent.images,
      });
    } else {
      setContent(staticContent);
    }
  }, [service, websiteConfig]);

  if (!content) return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;

  const isJunkRemoval = service === 'Junk Removal' || service === 'Junk Removal & Moving';
  const phone = formatPhone(phoneProp);
  const companyName = companyNameProp || content.companyName;
  const aboutImage = content.images.about;
  const heroImages: ImagePlaceholder[] = content.images.hero;
  const singleHeroImage = heroImages[0];

  const heroContent = (
    <div className="relative z-10 p-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <p className="text-primary font-semibold tracking-wider">
        {isJunkRemoval ? 'ECO-FRIENDLY & RELIABLE HAULING' : '24/7 EMERGENCY SERVICE'}
      </p>
      <h1 className="text-4xl md:text-6xl font-extrabold mt-2">{content.hero.title}</h1>
      <h2 className="text-3xl md:text-5xl font-extrabold text-gray-200">{content.hero.subtitle}</h2>
      <ul className="space-y-3 mt-6 max-w-md mx-auto text-left">
        {(content.about.points || [
          "Same-Day / Next-Day Availability",
          "Licensed & Fully Insured Crew",
          "Upfront, Flat-Rate Pricing"
        ]).map((point: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-lg">
            <Check className="h-6 w-6 text-green-500" />
            <span className="font-medium">{point}</span>
          </li>
        ))}
      </ul>
      {isJunkRemoval ? (
        <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl max-w-sm mx-auto mt-8 border border-slate-200/80">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">Check Availability</h3>
          <div className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Enter Zip Code" 
              maxLength={5} 
              className="bg-slate-50 text-slate-900 text-center font-bold tracking-widest text-base h-11" 
              id="hero-zip-input"
            />
            <Button 
              type="button" 
              className="bg-green-600 hover:bg-green-700 text-white font-bold h-11 px-5"
              onClick={() => {
                const zip = (document.getElementById('hero-zip-input') as HTMLInputElement)?.value;
                if (!zip || zip.length < 5 || isNaN(Number(zip))) {
                  toast({ title: "Oops!", description: "Please enter a valid 5-digit zip code.", variant: "destructive" });
                } else {
                  toast({ title: "Service Available!", description: "We have trucks in your zip code today! Fill out the form below to book." });
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              GO
            </Button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Check if same-day pickup slots are open in your neighborhood.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <a href="#contact" className="w-full md:w-auto">
            <Button type="button" className="w-full transition-transform hover:scale-105" size="lg">GET MY FREE QUOTE NOW</Button>
          </a>
          {bookingUrl && (
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Button size="lg" variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white border-white transition-transform hover:scale-105">Book Appointment</Button>
            </a>
          )}
        </div>
      )}
    </div>
  );

  const renderHero = () => {
    if (heroEffect === 'parallax' && singleHeroImage) {
      return (
        <section className="h-screen relative flex items-center justify-center text-center text-white bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${singleHeroImage.imageUrl})` }}>
          <div className="absolute inset-0 bg-black/60" />
          {heroContent}
        </section>
      );
    }
    return (
      <section className="h-screen relative flex items-center justify-center text-center text-white">
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
        <div className="absolute inset-0 bg-black/60" />
        {heroContent}
      </section>
    );
  };

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {logoUrl && <Image src={logoUrl} alt={`${companyName} Logo`} width={140} height={40} className="h-10 w-auto object-contain" />}
            <h1 className="text-xl md:text-2xl font-bold text-primary">{companyName}</h1>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">Services</a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">Why Us</a>
            <a href="#reviews" className="text-sm font-medium hover:text-primary transition-colors">Reviews</a>
          </nav>
          <a href={`tel:${phone}`} className="flex items-center gap-2 font-semibold">
            <Phone className="h-5 w-5" /><span>{phone}</span>
          </a>
        </div>
      </header>

      <main>
        {renderHero()}

        <section id="services" className="py-16 md:py-24 px-4">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold">{content.services.title}</h3>
            <p className="text-muted-foreground mt-2">{content.services.subtitle}</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.services.items?.map((item: any, i: number) => (
                <div key={i} className="p-6 border rounded-lg flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <ServiceIcon name={item.iconName || item.icon} className="h-10 w-10 mx-auto text-primary" />
                  <h4 className="mt-4 text-xl font-semibold">{item.title}</h4>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isJunkRemoval && (
          <section id="load-pricing" className="bg-slate-50 py-16 md:py-24 px-4 border-y border-slate-200">
            <div className="container mx-auto text-center max-w-5xl">
              <h3 className="text-3xl font-extrabold text-slate-900">Transparent Volume-Based Pricing</h3>
              <p className="text-slate-600 mt-2">You only pay for the space your items occupy in our heavy-duty trucks.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {[
                  { title: "Single Item / Min Load", desc: "Mattress, sofa, refrigerator, or appliance pick-up.", space: "15%", bg: "bg-blue-100", bar: "bg-blue-600" },
                  { title: "1/4 Truckload", desc: "Equivalent to 2-3 rooms of general clutter or small renovation piles.", space: "25%", bg: "bg-green-100", bar: "bg-green-600" },
                  { title: "1/2 Truckload", desc: "Equivalent to a full garage, shed, or attic cleanout.", space: "50%", bg: "bg-yellow-100", bar: "bg-yellow-500" },
                  { title: "Full Truckload", desc: "Whole-home cleanouts, large construction debris, estate clearing.", space: "100%", bg: "bg-red-100", bar: "bg-red-600" }
                ].map((load, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{load.title}</h4>
                      <p className="text-xs text-slate-500 mt-2 min-h-[48px] leading-relaxed">{load.desc}</p>
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between items-center text-xs font-semibold mb-1 text-slate-700">
                        <span>Space Occupied</span>
                        <span>{load.space}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className={`${load.bar} h-full`} style={{ width: load.space }} />
                      </div>
                      <a href="#contact" className="block w-full mt-6">
                        <Button variant="outline" className="w-full text-xs font-bold border-slate-200 hover:bg-slate-50 h-9">
                          Book This Load
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-6 italic">Note: Final quotes are always provided upfront on-site before we lift anything.</p>
            </div>
          </section>
        )}

        <section id="about" className="bg-muted py-16 md:py-24 px-4">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            {aboutImage && (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                <Image src={aboutImage.imageUrl} alt={aboutImage.description} data-ai-hint={aboutImage.imageHint} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            )}
            <div>
              <h3 className="text-3xl font-bold">{content.about.title}</h3>
              <p className="mt-4 text-muted-foreground">{content.about.body}</p>
            </div>
          </div>
        </section>

        <section id="reviews" className="py-16 md:py-24 px-4">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold">{content.reviews.title}</h3>
            <div className="mt-12 max-w-5xl mx-auto">
              <Carousel opts={{ align: 'start', loop: true }} plugins={[plugin.current]} className="w-full">
                <CarouselContent>
                  {content.reviews.items.map((review: any, index: number) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-2 h-full">
                        <div className="p-6 border rounded-lg transition-all duration-300 hover:shadow-lg hover:border-primary h-full flex flex-col">
                          <div className="flex text-yellow-400 mb-2">{[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}</div>
                          <p className="italic flex-grow">"{review.quote}"</p>
                          <p className="font-semibold mt-4">{review.author}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-primary text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="bg-muted text-foreground p-8 rounded-lg shadow-lg max-w-lg mx-auto">
              <h3 className="text-2xl font-bold text-center">{content.contact.title}</h3>
              <p className="text-center text-muted-foreground mt-2">{content.contact.subtitle}</p>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                  <Input placeholder="Name" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-sm text-destructive mt-1 text-left">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Input type="email" placeholder="Email Address" {...form.register('email')} />
                  {form.formState.errors.email && <p className="text-sm text-destructive mt-1 text-left">{form.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Input type="tel" placeholder="Phone Number" {...form.register('phone')} />
                  {form.formState.errors.phone && <p className="text-sm text-destructive mt-1 text-left">{form.formState.errors.phone.message}</p>}
                </div>
                <div>
                  <Textarea placeholder="Briefly describe the issue..." {...form.register('notes')} />
                  {form.formState.errors.notes && <p className="text-sm text-destructive mt-1 text-left">{form.formState.errors.notes.message}</p>}
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
                <Button type="submit" className="w-full !mt-6" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'GET MY FREE QUOTE'}
                </Button>
                <p className="text-xs text-center text-muted-foreground pt-2">We respect your privacy. No spam, ever.</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-muted-foreground border-t">
        <p>{companyName} &copy; {new Date().getFullYear()}</p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <a href={`/api/legal/privacy?userId=${businessProfileId}`} target="_blank" className="hover:underline">Privacy Policy</a>
          <a href={`/api/legal/tos?userId=${businessProfileId}`} target="_blank" className="hover:underline">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
