'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Check, Star, Phone, ShieldCheck, Award, ThumbsUp, 
  Calendar, ArrowRight, Wrench, Sparkles, CheckCircle2,
  AlertTriangle, Hammer, Timer, ShieldAlert, Send
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
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

const Loader2 = ({ className }: { className?: string }) => <LucideIcons.Loader2 className={className} />;

function formatPhone(value: string) {
  if (!value) return value;
  const d = value.replace(/\D/g, '');
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

export function ApplianceRepairTemplate({
  businessProfileId,
  heroEffect = 'slideshow',
  service = 'Appliance Repair',
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
      toast({
        title: 'Quote Requested Successfully',
        description: 'Our appliance technicians will call or text you shortly.',
      });
      form.reset();
    } else {
      toast({ title: 'Submission Failed', description: res.error, variant: 'destructive' });
    }
  };

  useEffect(() => {
    const staticContent = getContentForService(service);
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
          title: websiteConfig.reviews?.title || staticContent.reviews?.title,
          items: uniqueReviews
        },
        images: staticContent.images,
        about: {
          ...staticContent.about,
          ...websiteConfig.about,
        },
        hero: {
          ...staticContent.hero,
          ...websiteConfig.hero,
        },
        services: {
          ...staticContent.services,
          ...websiteConfig.services,
        }
      });
    } else {
      setContent(staticContent);
    }
  }, [service, websiteConfig]);

  if (!content) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const phone = phoneProp || content.phone || '(000) 000-0000';
  const companyName = companyNameProp || content.companyName || 'Appliance Repair Pros';
  const displayCity = targetCity || 'Tampa';

  // Merge database reviews with fallback large reviews list, de-duplicating by quote text
  const userReviews = Array.isArray(websiteConfig?.reviews) ? websiteConfig.reviews : [];
  const defaultReviews = Array.isArray(content.reviews?.items) ? content.reviews.items : [];
  const allReviews = [...userReviews, ...defaultReviews];
  const uniqueReviews = allReviews.filter(
    (review, index, self) => self.findIndex(r => r.quote === review.quote) === index
  );

  const localFaqs = [
    {
      question: `How quickly can an appliance repair technician arrive in ${displayCity}?`,
      answer: "We offer priority same-day service slots for urgent household appliance emergencies (like refrigerators that stop cooling) scheduled before 12:00 PM. All other diagnostics are typically scheduled within 24 hours."
    },
    {
      question: "Do your repair trucks carry replacement parts?",
      answer: "Yes! Our technicians arrive in fully equipped vans stocked with a wide range of common OEM replacement parts for major brands like Samsung, LG, Whirlpool, GE, and Frigidaire, allowing us to complete over 85% of repairs in a single visit."
    },
    {
      question: "What is your repair warranty coverage?",
      answer: "We back all of our residential repair services with a solid 90-day parts and labor warranty. If the same issue returns within 90 days, we'll return to fix it at zero cost to you."
    },
    {
      question: "Do you charge a service call or diagnostic fee?",
      answer: "We charge a flat service diagnostic fee to cover the technician's travel and comprehensive troubleshooting. However, if you choose to proceed with our recommended repair estimate, we waive the diagnostic fee entirely."
    }
  ];

  const appServices = [
    { title: "Refrigerator & Freezer Repair", icon: <Check className="text-blue-600 h-5 w-5" />, desc: "Fixing cooling failures, compressor issues, leaks, water dispensers, and built-in ice makers." },
    { title: "Washer & Dryer Repair", icon: <Check className="text-blue-600 h-5 w-5" />, desc: "Resolving drum spinning issues, drainage failures, loud noises, faulty belts, and heating coil burnouts." },
    { title: "Oven, Range & Stove Repair", icon: <Check className="text-blue-600 h-5 w-5" />, desc: "Repairing gas igniters, electric heating elements, thermostat sensors, and broken digital controls." },
    { title: "Dishwasher Repair", icon: <Check className="text-blue-600 h-5 w-5" />, desc: "Fixing pooling water, spray arm blockages, door latch leaks, and electronic control cycle errors." },
    { title: "Garbage Disposal Repair", icon: <Check className="text-blue-600 h-5 w-5" />, desc: "Clearing internal jams safely, replacing motors, repairing water leaks, and wiring reset switches." },
    { title: "Microwave & Ice Maker Service", icon: <Check className="text-blue-600 h-5 w-5" />, desc: "Restoring door micro-switches, control panels, ice harvest assemblies, and cooling lines." }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans antialiased">
      <AeoSchema
        companyName={companyName}
        phone={phone}
        service={service}
        logoUrl={logoUrl}
        description={content.hero?.subtitle}
        targetCity={displayCity}
      />

      {/* Top Banner Contact bar */}
      <div className="bg-blue-900 text-blue-100 py-2.5 px-6 text-center text-xs font-semibold flex justify-center items-center gap-4">
        <span>⏱️ Same-Day Priority Diagnostics & Repair Slots</span>
        <span className="hidden sm:inline border-l border-blue-800 h-4" />
        <a href={`tel:${phone}`} className="flex items-center gap-1 hover:underline">
          <Phone className="h-3.5 w-3.5 text-blue-300" /> Call {displayCity} Technicians: {phone}
        </a>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {logoUrl && <Image src={logoUrl} alt={`${companyName} Logo`} width={140} height={40} className="h-10 w-auto object-contain" />}
          <div className="text-xl md:text-2xl font-black text-blue-950 flex items-center gap-1.5">
            <Wrench className="h-6 w-6 text-blue-600" />
            <span>{companyName}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a href={blogLink} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Blog</a>
          <a 
            href={`tel:${phone}`} 
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold inline-flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 rounded-md shrink-0 transition-colors"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 px-6 md:px-12 bg-gradient-to-br from-blue-50/50 to-white overflow-hidden border-b border-slate-100">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 border-none font-bold text-xs uppercase px-3 py-1 tracking-wider">
                📞 Same-Day Service Availability
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                {content.hero?.title || `Same-Day Appliance Repair & Service in ${displayCity}`}
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {content.hero?.subtitle || "Don't let a broken refrigerator, washer, or oven ruin your schedule. Our licensed local technicians arrive on-time with fully stocked vans to fix your household appliances today."}
              </p>
              {/* Quick features checklist in hero */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-w-lg">
                {(content.about?.points || ["Same-Day Priority Service", "Licensed & Insured Techs", "90-Day Repair Warranty", "No Hidden Diagnostic Fees"]).map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <a 
                  href={`tel:${phone}`} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-base font-extrabold flex items-center justify-center gap-3 py-4 px-8 rounded-md shadow-lg shadow-blue-500/15 transition-colors"
                >
                  <Phone className="h-5 w-5" /> Call {phone}
                </a>
                <a 
                  href="#quote-form" 
                  className="w-full sm:w-auto border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-bold text-base flex items-center justify-center py-4 px-8 rounded-md transition-colors"
                >
                  Request Service Online
                </a>
              </div>
            <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Licensed & Insured</span>
              <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-emerald-500" /> 90-Day Parts & Labor Warranty</span>
              <span className="flex items-center gap-1.5"><Timer className="h-4 w-4 text-emerald-500" /> W-2 Background Checked Techs</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-[4/3] md:aspect-square w-full rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
            <Image 
              src={content.images?.hero?.[0]?.imageUrl || "/images/appliance-hero.png"} 
              alt="Professional technician repairing a refrigerator" 
              fill 
              className="object-cover" 
              priority 
            />
          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <section className="bg-white py-6 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <h4 className="text-xl md:text-2xl font-black text-blue-600">85%+</h4>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">First Visit Fix Rate</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xl md:text-2xl font-black text-blue-600">Same-Day</h4>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Priority Service Slots</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xl md:text-2xl font-black text-blue-600">90-Day</h4>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Parts & Labor Warranty</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xl md:text-2xl font-black text-blue-600">5-Star</h4>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Local Customer Reviews</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
          <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 border-none font-bold text-xs uppercase px-3 py-1 tracking-wider">
            🛠️ Certified Technicians
          </Badge>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Comprehensive Household Appliance Repair
          </h3>
          <p className="text-slate-600 text-sm md:text-base">
            We service all major brands, models, and types of household appliances.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {appServices.map((srv, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 w-fit rounded-xl text-blue-600">{srv.icon}</div>
                <h4 className="text-lg font-bold text-slate-900">{srv.title}</h4>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{srv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Diagnostic Process */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative aspect-[4/3] md:aspect-square w-full rounded-[32px] overflow-hidden shadow-2xl border-4 border-slate-50">
            <Image 
              src={content.images?.about?.imageUrl || "/images/appliance-about.png"} 
              alt="Technician repairing washing machine" 
              fill 
              className="object-cover" 
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 border-none font-bold text-xs uppercase px-3 py-1 tracking-wider">
              📋 Our Simple Process
            </Badge>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
              How We Repair Your Appliances Today
            </h3>
            
            <div className="space-y-6 pt-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-extrabold text-sm flex items-center justify-center">1</div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm md:text-base">Diagnostic Visit & Troubleshooting</h5>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed mt-1">Our certified technician arrives, disassembles the housing, and diagnoses the root cause of your appliance issue.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-extrabold text-sm flex items-center justify-center">2</div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm md:text-base">Upfront Estimate Approval</h5>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed mt-1">We provide a transparent, upfront quote for the parts and labor. If you approve the repair, we waive the diagnostic fee entirely.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-extrabold text-sm flex items-center justify-center">3</div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm md:text-base">Immediate Repair & Calibration</h5>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed mt-1">We install genuine OEM replacement parts and calibrate your machine, verifying safety and proper operation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 border-none font-bold text-xs uppercase px-3 py-1 tracking-wider">
              ⭐ Highly Rated
            </Badge>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              What Your Neighbors Are Saying
            </h3>
            <p className="text-slate-500 text-xs md:text-sm">Verified 5-star customer testimonials from home and business owners.</p>
          </div>

          <Carousel 
            plugins={[plugin.current]} 
            onMouseEnter={() => plugin.current.stop()} 
            onMouseLeave={() => plugin.current.play()}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {uniqueReviews.map((review, idx) => (
                <CarouselItem key={idx} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[220px]">
                    <p className="text-slate-600 italic text-xs leading-relaxed line-clamp-5">&quot;{review.quote}&quot;</p>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                      <div>
                        <p className="font-bold text-xs text-slate-900">{review.author}</p>
                        <p className="text-[10px] text-slate-400">{review.location}</p>
                      </div>
                      <div className="flex text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Accordion FAQs */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 border-none font-bold text-xs uppercase px-3 py-1 tracking-wider">
            💡 Common Questions
          </Badge>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {localFaqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="bg-white px-6 py-2 border border-slate-100 rounded-xl">
              <AccordionTrigger className="font-bold text-left text-slate-900 hover:text-blue-600 hover:no-underline text-sm md:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-500 leading-relaxed text-xs md:text-sm pt-2 border-t border-slate-50">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Lead Form & Click-to-call Footer CTA */}
      <section id="quote-form" className="py-16 md:py-24 px-6 md:px-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 space-y-6 self-center">
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              Schedule Your Same-Day Diagnostic Call
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Call us directly to secure our next available technician or submit the secure form. We will call or text you within 15 minutes of receiving your form submission to verify your address and scheduling.
            </p>
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Direct Dispatch Line</span>
                <p className="text-xl md:text-2xl font-black text-blue-600 mt-1">{phone}</p>
              </div>
              <a href={`tel:${phone}`}>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-6">
                  Call Dispatcher
                </Button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-50 border border-slate-100 p-8 rounded-3xl">
            <h4 className="text-xl font-bold text-slate-900 mb-6">Request Diagnostic Call</h4>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...form.register('name')} className="bg-white border-slate-200" />
                  {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...form.register('email')} className="bg-white border-slate-200" />
                  {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="(555) 555-5555"
                  className="bg-white border-slate-200"
                  {...form.register('phone', {
                    onChange: (e) => {
                      e.target.value = formatPhone(e.target.value);
                    }
                  })}
                />
                {form.formState.errors.phone && <p className="text-red-500 text-xs">{form.formState.errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Describe the Issue (e.g. Refrigerator not cooling)</Label>
                <Textarea id="notes" {...form.register('notes')} className="bg-white border-slate-200 min-h-[80px]" />
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="consent" 
                    checked={form.watch('consent')}
                    onCheckedChange={(checked) => form.setValue('consent', !!checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="consent" className="text-slate-500 text-xs leading-normal font-normal">
                    I agree to receive automated SMS communications and calls regarding my request. Standard message/data rates apply.
                  </Label>
                </div>
                {form.formState.errors.consent && <p className="text-red-500 text-xs">{form.formState.errors.consent.message}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 w-full text-base font-bold py-6 mt-4">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit Request
              </Button>
            </form>
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="font-semibold text-slate-200">© {new Date().getFullYear()} {companyName}. All Rights Reserved.</p>
          <p className="max-w-2xl mx-auto leading-relaxed text-[10px]">
            Disclaimer: All services are provided by certified local appliance technicians. Standard diagnostic and dispatch fees apply. SMS opt-in consent covers immediate quote confirmation, service bookings, and scheduling check-ins.
          </p>
          <div className="flex justify-center gap-6 text-[10px] pt-2">
            <a href="/privacy" className="hover:text-white underline">Privacy Policy</a>
            <a href="/tos" className="hover:text-white underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
