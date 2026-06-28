'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Check, Star, Phone, ShieldCheck, Award, ThumbsUp, 
  Calendar, ArrowRight, Hammer, Columns, Grid, LayoutGrid, ShieldAlert,
  HardHat, CheckCircle2 
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import { type ImagePlaceholder } from '@/lib/placeholder-images';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { getContentForService } from '@/lib/landing-page-content';
import type { TemplateProps } from '@/lib/template-props';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitLead } from '@/app/actions/leads';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { AeoSchema } from '@/components/AeoSchema';
import { ChatbotWidget } from './chatbot-widget';

function formatPhone(value: string) {
  if (!value) return value;
  const d = value.replace(/\D/g, '');
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

function ServiceIcon({ name, className }: { name?: string; className?: string }) {
  if (name === 'Hammer') return <Hammer className={className} />;
  if (name === 'Grid') return <Grid className={className} />;
  if (name === 'Columns') return <Columns className={className} />;
  if (name === 'Shield') return <ShieldCheck className={className} />;
  if (name === 'Palette') return <Award className={className} />;
  
  const Icon = (LucideIcons as any)[name || 'LayoutGrid'] || LayoutGrid;
  return <Icon className={className} />;
}

export function PavingConcreteTemplate({
  businessProfileId,
  heroEffect = 'slideshow',
  service = 'Paving & Concrete',
  phone: phoneProp = '(000) 000-0000',
  logoUrl = '',
  companyName: companyNameProp = '',
  bookingUrl,
  websiteConfig,
  targetCity,
}: TemplateProps) {
  const [content, setContent] = useState<any>(null);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blogLink, setBlogLink] = useState('/blog');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/pages/')) {
        setBlogLink(`/pages/${businessProfileId}/blog`);
      } else if (window.location.pathname.startsWith('/landing-pages/')) {
        setBlogLink('#');
      } else {
        setBlogLink('/blog');
      }
    }
  }, [businessProfileId]);

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
    const staticContent = getContentForService("Paving & Concrete");
    if (websiteConfig) {
      const mergedReviews = [
        ...(websiteConfig.reviews?.items || []),
        ...(staticContent.reviews?.items || [])
      ];
      const uniqueReviews = Array.from(new Map(mergedReviews.map(item => [item.quote, item])).values());

      setContent({
        ...websiteConfig,
        reviews: {
          ...websiteConfig.reviews,
          title: websiteConfig.reviews?.title || staticContent.reviews.title,
          items: uniqueReviews
        },
        images: staticContent.images,
      });
    } else {
      setContent(staticContent);
    }
  }, [websiteConfig]);

  if (!content) return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;

  const phone = formatPhone(phoneProp);
  const companyName = companyNameProp || content.companyName;
  const aboutImage = content.images.about;
  const heroImages: ImagePlaceholder[] = content.images.hero;
  const singleHeroImage = heroImages[0];

  const heroContent = (
    <div className="relative z-10 p-6 max-w-4xl text-left">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-750 text-sm font-semibold mb-6">
        <HardHat className="h-4 w-4" /> Tampa's Paving & Concrete Engineering Experts
      </div>
      <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
        {content.hero.title}
      </h2>
      <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
        {content.hero.subtitle}
      </p>

      {/* Quick features list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-lg">
        {["Fiber & Rebar Reinforcements", "Precise Drainage & Slope Layouts", "Commercial & Residential Paving", "Licensed & Bonded Contractors"].map((feat, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
            <CheckCircle2 className="h-5 w-5 text-blue-700 shrink-0" />
            <span>{feat}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mt-10">
        <a href="#contact">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-600/20">
            {content.hero.ctaText || "GET A FREE QUOTE"}
          </Button>
        </a>
        <a href={`tel:${phone}`}>
          <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50 text-slate-800 font-bold h-14 px-8 rounded-xl flex items-center gap-2 bg-white">
            <Phone className="h-5 w-5 text-blue-600" /> Call {phone}
          </Button>
        </a>
      </div>
    </div>
  );

  return (
    <div className="bg-white text-slate-900 font-sans antialiased">
      <AeoSchema
        companyName={companyName}
        phone={phone}
        service={service}
        logoUrl={logoUrl}
        description={content.hero?.subtitle}
        targetCity={targetCity}
      />
      
      {/* Top Banner Contact bar */}
      <div className="bg-slate-900 text-slate-100 py-2.5 px-6 text-center text-xs font-semibold flex justify-center items-center gap-4">
        <span>🏗️ Custom Poured Concrete & Brick Paver Solutions</span>
        <span className="hidden sm:inline border-l border-slate-750 h-4" />
        <a href={`tel:${phone}`} className="flex items-center gap-1 hover:underline">
          <Phone className="h-3.5 w-3.5" /> Call Paving Crew: {phone}
        </a>
      </div>

      <header className="sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {logoUrl && <Image src={logoUrl} alt={`${companyName} Logo`} width={140} height={40} className="h-10 w-auto object-contain" />}
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-1.5">
            <Columns className="h-6 w-6 text-blue-650" />
            <span>{companyName}</span>
          </h1>
        </div>
        <nav className="hidden md:flex gap-8 items-center text-sm font-bold text-slate-600">
          <a href="#services" className="hover:text-blue-650 transition-colors">Services</a>
          <a href="#process" className="hover:text-blue-650 transition-colors">How We Work</a>
          <a href="#about" className="hover:text-blue-650 transition-colors">About Us</a>
          <a href="#reviews" className="hover:text-blue-650 transition-colors">Reviews</a>
          <a href="#faqs" className="hover:text-blue-650 transition-colors">FAQs</a>
          <a href={blogLink} className="hover:text-blue-650 transition-colors">Blog</a>
        </nav>
        <a href={`tel:${phone}`} className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-800 font-bold px-4 py-2 rounded-xl border border-blue-100 text-sm hover:bg-blue-100 transition-all">
          <Phone className="h-4 w-4" /><span>{phone}</span>
        </a>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-blue-50/50 via-white to-slate-50 py-20 px-6 overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-70" />
          <div className="container mx-auto grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              {heroContent}
            </div>
            <div className="lg:col-span-5 relative aspect-[4/3] md:aspect-square w-full rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
              {heroImages && heroImages[0] ? (
                <Image src={heroImages[0].imageUrl} alt="Paving and Driveway" fill className="object-cover" priority />
              ) : (
                <div className="absolute inset-0 bg-blue-100 flex items-center justify-center"><Columns className="h-20 w-20 text-blue-650" /></div>
              )}
            </div>
          </div>
        </section>

        {/* Dynamic Trust Badges Strip */}
        <section className="bg-slate-50 border-y border-slate-100 py-12">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: ShieldCheck, title: "Licensed & Bonded", desc: "Fully certified contractors carrying comprehensive project liability policies." },
                { icon: Award, title: "Fiber-Reinforced Slabs", desc: "Our concrete includes reinforcing mesh and fibers to prevent structural cracks." },
                { icon: ThumbsUp, title: "Drainage-Slope Engineered", desc: "Every driveway layout is calculated to prevent water ponding or run-off damage." }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center p-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 border border-blue-100">
                    <item.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-lg">{item.title}</h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 md:py-28 px-6 bg-white">
          <div className="container mx-auto text-center max-w-5xl">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Paving Services</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-5 tracking-tight">
              {content.services.title}
            </h2>
            <div className="w-16 h-1 mx-auto mt-4 rounded bg-blue-600" />
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-base">
              {content.services.subtitle}
            </p>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.services.items?.map((item: any, i: number) => (
                <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-left group">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                      <ServiceIcon name={item.iconName || item.icon} className="h-6 w-6 text-blue-650" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-slate-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                  <a href="#contact" className="mt-8 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 hover:underline">
                    <span>Request Quote</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Process / How it Works section */}
        {content.process && (
          <section id="process" className="py-20 md:py-28 px-6 bg-slate-50 border-y border-slate-100">
            <div className="container mx-auto text-center max-w-5xl">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Engineering Method</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-5 tracking-tight">
                {content.process.title || "How It Works"}
              </h2>
              <div className="w-16 h-1 mx-auto mt-4 rounded bg-blue-600" />
              <p className="text-slate-500 mt-4 max-w-xl mx-auto text-base">
                {content.process.subtitle || "The concrete and paver preparation process we execute on every project."}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
                {content.process.steps?.map((step: any, i: number) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 relative hover:shadow-lg transition-all text-center group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm text-white shadow-md transition-all duration-300 group-hover:scale-110 bg-blue-600">
                      0{step.number || (i + 1)}
                    </div>
                    <h3 className="text-lg font-bold mt-4 text-slate-900">{step.title}</h3>
                    <p className="text-slate-500 mt-3 text-sm leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        <section className="bg-white py-20 md:py-28 px-6">
          <div className="container mx-auto text-center max-w-5xl">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Our Standards</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-5 tracking-tight">
              Why Choose Our Concrete Services
            </h2>
            <div className="w-16 h-1 mx-auto mt-4 rounded bg-blue-600" />
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-base">
              We focus on structural integrity and aesthetics to provide beautiful surfaces built for the long haul.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              {[
                { icon: "ShieldCheck", title: "Compacted Sub-Bases", desc: "Thorough excavation and heavy sub-grade stone compaction to prevent settling." },
                { icon: "Hammer", title: "Fiber Reinforced Slabs", desc: "We mix steel/synthetic fibers and structural rebar to optimize concrete strength." },
                { icon: "Columns", title: "Drainage Management", desc: "Precise slope leveling keeps rainwater flowing away from foundations." },
                { icon: "ThumbsUp", title: "Stamped & Sealed options", desc: "A wide variety of stamps, borders, and joint-stabilizing protective sealers." }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-150/70 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6">
                      <ServiceIcon name={item.icon} className="h-6 w-6 text-blue-650" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-lg">{item.title}</h4>
                    <p className="text-slate-500 mt-3 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-slate-50 py-20 md:py-28 px-6 border-t border-slate-100">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center max-w-5xl">
            {aboutImage && (
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-slate-200/50 group">
                <Image src={aboutImage.imageUrl} alt={aboutImage.description} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            )}
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Tampa Paving Pros</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-5 tracking-tight">
                {content.about.title}
              </h2>
              <div className="w-12 h-1 mt-3 rounded bg-blue-600" />
              <p className="mt-6 text-slate-600 leading-relaxed text-base">
                {content.about.body}
              </p>
              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(content.about.points || [
                  "Fiber-Reinforced Concrete",
                  "Precise Slope & Drainage",
                  "Licensed & Fully Insured",
                  "Free On-Site Consultations"
                ]).map((pt: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                    <Check className="h-5 w-5 text-blue-650 flex-shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="py-20 md:py-28 px-6 bg-white">
          <div className="container mx-auto text-center max-w-5xl">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Client Reviews</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-5 tracking-tight">
              {content.reviews.title}
            </h2>
            <div className="w-16 h-1 mx-auto mt-4 rounded bg-blue-600" />
            
            <div className="mt-16 max-w-4xl mx-auto">
              <Carousel opts={{ align: 'start', loop: true }} plugins={[plugin.current]} className="w-full">
                <CarouselContent>
                  {content.reviews.items.map((review: any, index: number) => (
                    <CarouselItem key={index} className="md:basis-1/2 p-2">
                      <div className="h-full bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between text-left hover:shadow-lg transition-all duration-300">
                        <div>
                          <div className="flex text-amber-400 gap-1 mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" className="h-4.5 w-4.5 text-amber-400 stroke-none" />)}
                          </div>
                          <p className="italic text-slate-600 text-sm leading-relaxed">
                            "{review.quote}"
                          </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between border-t border-slate-200/50 pt-4">
                          <p className="font-bold text-sm text-slate-800">{review.author}</p>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{review.location || "Local Customer"}</span>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {content.faqs && content.faqs.length > 0 && (
          <section id="faqs" className="py-20 md:py-28 px-6 bg-slate-50 border-t border-slate-100">
            <div className="container mx-auto max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-700 text-center block">Helpful Information</span>
              <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 mt-5 mb-12 tracking-tight">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {content.faqs.map((faq: any, i: number) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-slate-200 rounded-2xl px-6 bg-white">
                    <AccordionTrigger className="text-left font-bold text-slate-800 text-base md:text-lg hover:no-underline py-4 hover:text-blue-650 transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-500 text-sm leading-relaxed pb-4 pt-1 border-t border-slate-100">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* SMS-Consented Lead Quote Form */}
        <section id="contact" className="relative py-20 md:py-28 px-6 bg-blue-50 border-t border-blue-100">
          <div className="container mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-2xl max-w-lg mx-auto border border-slate-100">
              <h3 className="text-2xl md:text-3xl font-black text-center text-slate-900 tracking-tight">{content.contact.title}</h3>
              <p className="text-center text-slate-500 mt-2 text-sm">{content.contact.subtitle}</p>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
                <div>
                  <Input placeholder="Your Name" className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-xs text-rose-500 mt-1 text-left">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Input type="email" placeholder="Email Address" className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500" {...form.register('email')} />
                  {form.formState.errors.email && <p className="text-xs text-rose-500 mt-1 text-left">{form.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Input type="tel" placeholder="Phone Number" className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500" {...form.register('phone')} />
                  {form.formState.errors.phone && <p className="text-xs text-rose-500 mt-1 text-left">{form.formState.errors.phone.message}</p>}
                </div>
                <div>
                  <Textarea placeholder="Please describe paving or concrete needs (e.g. driveway pour, paver patio, commercial foundation)..." className="min-h-[100px] rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500" {...form.register('notes')} />
                  {form.formState.errors.notes && <p className="text-xs text-rose-500 mt-1 text-left">{form.formState.errors.notes.message}</p>}
                </div>
                
                <div className="flex items-start space-x-3 text-left mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  <Checkbox 
                    id="consent" 
                    checked={form.watch('consent')} 
                    onCheckedChange={(checked) => form.setValue('consent', checked as boolean, { shouldValidate: true })} 
                    className="mt-0.5 border-slate-350 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <div className="grid gap-1.5 leading-tight">
                    <label htmlFor="consent" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      I agree to receive SMS text notifications from {companyName}.
                    </label>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      By checking this box, you consent to receive SMS updates regarding your estimate request. Msg & data rates may apply. Reply STOP to opt-out. Read our <a href={`/api/legal/privacy?userId=${businessProfileId}`} target="_blank" className="underline hover:text-blue-700">Privacy Policy</a>.
                    </p>
                  </div>
                </div>
                {form.formState.errors.consent && <p className="text-xs text-rose-500 mt-1 text-left">{form.formState.errors.consent.message}</p>}
                
                <Button type="submit" className="w-full h-12 font-bold text-white tracking-wide shadow-md transition-all duration-300 hover:scale-102 mt-6 rounded-xl bg-blue-600 hover:bg-blue-750" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Quote Request...' : 'GET MY FREE ESTIMATE'}
                </Button>
                <p className="text-[10px] text-center text-slate-400 mt-3">🔒 All details are securely processed.</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center text-slate-400 border-t border-slate-200/50 bg-white">
        <p className="text-sm font-semibold">&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6 text-xs font-medium">
          <a href={blogLink} className="hover:underline hover:text-slate-700">Blog</a>
          <a href={`/api/legal/privacy?userId=${businessProfileId}`} target="_blank" className="hover:underline hover:text-slate-700">Privacy Policy</a>
          <a href={`/api/legal/tos?userId=${businessProfileId}`} target="_blank" className="hover:underline hover:text-slate-700">Terms of Service</a>
        </div>
      </footer>

      <ChatbotWidget 
        businessProfileId={businessProfileId || ''} 
        companyName={companyName} 
        niche={service} 
      />
    </div>
  );
}
