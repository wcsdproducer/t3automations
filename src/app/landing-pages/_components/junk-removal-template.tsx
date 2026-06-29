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
  Calendar, ArrowRight, Trash2, Sparkles, CheckCircle2,
  AlertTriangle, Timer, Send, Truck
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
import { ChatbotWidget } from './chatbot-widget';

const Loader2 = ({ className }: { className?: string }) => <LucideIcons.Loader2 className={className} />;

function formatPhone(value: string) {
  if (!value) return value;
  const d = value.replace(/\D/g, '');
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

export function JunkRemovalTemplate({
  businessProfileId,
  heroEffect = 'slideshow',
  service = 'Junk Removal',
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
        title: 'Hauling Scheduled Successfully',
        description: 'Our junk removal team will call or text you shortly to confirm your time slot.',
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
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const phone = phoneProp || content.phone || '(000) 000-0000';
  const companyName = companyNameProp || content.companyName || 'Junk Removal Pros';
  const displayCity = targetCity || 'Tampa';

  const userReviews = Array.isArray(websiteConfig?.reviews) ? websiteConfig.reviews : [];
  const defaultReviews = Array.isArray(content.reviews?.items) ? content.reviews.items : [];
  const allReviews = [...userReviews, ...defaultReviews];
  const uniqueReviews = allReviews.filter(
    (review, index, self) => self.findIndex(r => r.quote === review.quote) === index
  );

  const localFaqs = [
    {
      question: `How do you calculate junk removal pricing in ${displayCity}?`,
      answer: "Pricing is based on volume — specifically how much space your items take up in our custom hauling trucks. We provide free, no-obligation estimates on-site before we do any lifting, so you know exactly what to expect."
    },
    {
      question: "Do you remove single items or only full truckloads?",
      answer: "We do both! We haul everything from a single appliance or mattress to full house cleanouts, commercial office clearouts, and construction debris. No job is too small or too large."
    },
    {
      question: "What do you do with the items you collect?",
      answer: "We are committed to eco-friendly disposal. We carefully sort all hauled materials to donate usable furniture, clothes, and appliances to local charities, and recycle metals, paper, and electronics to keep up to 60% of waste out of landfills."
    },
    {
      question: "Are you licensed and insured to work on my property?",
      answer: "Yes, absolutely. We are fully licensed, bonded, and carry comprehensive general liability and workers' compensation insurance. Our professional crews are background-checked and trained in safe lifting protocols."
    }
  ];

  const junkServices = [
    { title: "Residential Cleanouts", icon: <Truck className="text-amber-600 h-5 w-5" />, desc: "Complete clearing of garages, attics, basements, and estates. We lift, load, and sweep up afterwards." },
    { title: "Furniture & Appliance Removal", icon: <Trash2 className="text-amber-600 h-5 w-5" />, desc: "Safe disposal and recycling of old sofas, mattresses, refrigerators, washers, dryers, and bulky electronics." },
    { title: "Commercial Junk Hauling", description: "Office decluttering, property management cleanouts, retail fixture removals, and warehouse clearing services.", icon: <Truck className="text-amber-600 h-5 w-5" /> },
    { title: "Yard Debris & Outdoor Waste", icon: <Trash2 className="text-amber-600 h-5 w-5" />, desc: "Clearing branches, storm debris, old sheds, hot tubs, fences, and general outdoor clutter." },
    { title: "Construction Debris Cleanup", icon: <Truck className="text-amber-600 h-5 w-5" />, desc: "Fast cleanup of drywall, wood, tiling, concrete, and remodeling waste for contractors and homeowners." },
    { title: "Eco-Friendly Sorting & Donation", icon: <Trash2 className="text-amber-600 h-5 w-5" />, desc: "We sort all items to donate to local charities and recycle plastics, wood, and metals to minimize landfill waste." }
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
      <div className="bg-slate-950 text-amber-100 py-2.5 px-6 text-center text-xs font-semibold flex justify-center items-center gap-4">
        <span>📦 Fast, Friendly, Eco-Friendly Junk Removal Services</span>
        <span className="hidden sm:inline border-l border-slate-800 h-4" />
        <a href={`tel:${phone}`} className="flex items-center gap-1 hover:underline">
          <Phone className="h-3.5 w-3.5 text-amber-400" /> Call {displayCity} Haulers: {phone}
        </a>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {logoUrl && <Image src={logoUrl} alt={`${companyName} Logo`} width={140} height={40} className="h-10 w-auto object-contain" />}
          <div className="text-xl md:text-2xl font-black text-slate-950 flex items-center gap-1.5">
            <Truck className="h-6 w-6 text-amber-600" />
            <span>{companyName}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a href={blogLink} className="text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors">Blog</a>
          <a 
            href={`tel:${phone}`} 
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold inline-flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 rounded-md shrink-0 transition-colors"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 px-6 md:px-12 bg-gradient-to-br from-amber-50/50 to-white overflow-hidden border-b border-slate-100">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-800 border-none font-bold text-xs uppercase px-3 py-1 tracking-wider">
                🚚 Professional Decluttering & Hauling
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                {content.hero?.title || `Fast & Affordable Junk Removal in ${displayCity}`}
              </h1>
              <p className="text-slate-650 text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {content.hero?.subtitle || "Clear the clutter and reclaim your space. Our friendly, insured hauling crews do all the heavy lifting, loading, cleaning, and eco-friendly disposal."}
              </p>
              {/* Quick features checklist in hero */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-w-lg">
                {(content.about?.points || ["Same/Next-Day Services", "Licensed & Fully Insured Crew", "Donation & Recycling Focused", "Free On-Site Estimates"]).map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-slate-750">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-12 px-8">
                  <a href="#quote-form">Get Free Estimate <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-200 hover:bg-slate-50 font-bold h-12 px-8">
                  <a href={`tel:${phone}`} className="text-slate-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-amber-600" /> {phone}
                  </a>
                </Button>
              </div>
            </div>

            {/* Right side: Hero image or slider */}
            <div className="lg:col-span-5 relative w-full aspect-[4/3] sm:aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-amber-950/10 border border-slate-100 bg-slate-100">
              {content.images?.hero && content.images.hero.length > 0 ? (
                <Carousel plugins={[plugin.current]} className="w-full h-full" onMouseEnter={plugin.current.stop} onMouseLeave={plugin.current.reset}>
                  <CarouselContent className="h-full">
                    {content.images.hero.map((img: any, idx: number) => (
                      <CarouselItem key={idx} className="relative w-full h-full aspect-square">
                        <Image src={img.imageUrl} alt={img.description} fill priority={idx === 0} sizes="(max-w-768px) 100vw, 50vw" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-200">
                  <Truck className="h-16 w-16 text-amber-300" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section id="services" className="py-16 md:py-24 px-6 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-800 border-none font-bold text-xs uppercase px-3 py-1">
                ⚙️ Full Hauling Solutions
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {content.services?.title || "Professional Junk Removal Services"}
              </h2>
              <p className="text-slate-650 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                {content.services?.subtitle || "No matter how big or bulky, our teams arrive ready to lift, haul, clean up, and responsibly dispose of your unwanted items."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(content.services?.items || junkServices).map((srv: any, idx: number) => (
                <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-lg transition-shadow duration-300 space-y-3">
                  <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    {srv.icon || <Trash2 className="text-amber-600 h-5 w-5" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{srv.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{srv.desc || srv.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Middle CTA / Trust strip */}
        <section className="bg-slate-950 text-white py-12 px-6 text-center border-t border-slate-900">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-black">Same-Day and Next-Day Junk Removal slots are filling fast in {displayCity}.</h2>
            <p className="text-amber-250 text-sm md:text-base max-w-2xl mx-auto">
              Call us immediately to reserve your hauling slot and have our friendly crew quote your job on-site today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href={`tel:${phone}`} className="bg-amber-500 hover:bg-amber-400 text-white font-bold h-12 px-8 rounded-md inline-flex items-center justify-center gap-2 text-sm transition-colors">
                <Phone className="h-4 w-4" /> Call {phone}
              </a>
              {bookingUrl && (
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="bg-transparent hover:bg-white/10 text-white font-bold h-12 px-8 rounded-md border border-white/20 inline-flex items-center justify-center text-sm transition-colors">
                  Book Hauling Online
                </a>
              )}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-24 px-6 md:px-12 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side: Photo */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-100">
              {content.images?.about?.imageUrl ? (
                <Image src={content.images.about.imageUrl} alt={content.images.about.description} fill sizes="(max-w-768px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-200">
                  <ShieldCheck className="h-16 w-16 text-amber-300" />
                </div>
              )}
            </div>

            {/* Right side: Info */}
            <div className="space-y-6">
              <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-800 border-none font-bold text-xs uppercase px-3 py-1">
                👥 Eco-Friendly Disposers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {content.about?.title || `Your Local Junk Removal Specialists in ${displayCity}`}
              </h2>
              <p className="text-slate-650 text-base leading-relaxed">
                {content.about?.body || "We are dedicated to helping our neighbors clear clutter responsibly. Our teams handle everything from single item removals to massive estate clearouts, prioritizing donations and recycling to minimize waste."}
              </p>
              
              <div className="space-y-3.5">
                {(content.about?.points || ["Professional, Uniformed Crews", "Licensed & Fully Insured Haulers", "Upfront Pricing with No Hidden Fees"]).map((point: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                    <Check className="h-5 w-5 text-amber-600 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-16 md:py-24 px-6 md:px-12 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-800 border-none font-bold text-xs uppercase px-3 py-1">
                📸 Results Showcase
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Our Hauling Crews In Action</h2>
              <p className="text-slate-600 max-w-xl mx-auto text-sm">
                Take a look at how we clear out commercial office spaces, residential garages, yards, and construction debris safely.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.images?.gallery && content.images.gallery.length > 0 ? (
                content.images.gallery.map((img: any, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-md border border-slate-200/50 bg-slate-200 group">
                    <Image src={img.imageUrl} alt={img.description} fill sizes="(max-w-768px) 100vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-355" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-xs font-semibold">{img.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square rounded-xl bg-slate-200 flex items-center justify-center">
                    <Truck className="h-8 w-8 text-slate-400" />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="reviews" className="py-16 md:py-24 px-6 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-800 border-none font-bold text-xs uppercase px-3 py-1">
                ⭐ Rated 5 Stars
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {content.reviews?.title || `What Your Neighbors in ${displayCity} Say`}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {uniqueReviews.slice(0, 3).map((review: any, idx: number) => (
                <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-xl relative space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-750 text-sm leading-relaxed italic">"{review.quote}"</p>
                  </div>
                  <span className="text-xs font-bold text-slate-950 block">{review.author}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faq" className="py-16 md:py-24 px-6 md:px-12 bg-slate-50 border-t border-slate-100">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-800 border-none font-bold text-xs uppercase px-3 py-1">
                ❓ FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {(content.faqs || localFaqs).map((faq: any, idx: number) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="bg-white border border-slate-200/60 rounded-lg px-6 py-1">
                  <AccordionTrigger className="text-sm md:text-base font-bold text-slate-900 hover:text-amber-600 transition-colors text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-650 text-sm leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact/Quote Form */}
        <section id="quote-form" className="py-16 md:py-24 px-6 md:px-12 bg-white">
          <div className="max-w-3xl mx-auto space-y-8 bg-slate-50 border border-slate-100 p-8 md:p-12 rounded-2xl shadow-sm">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {content.contact?.title || "Get a Free Junk Removal Estimate"}
              </h2>
              <p className="text-slate-600 text-sm">
                {content.contact?.subtitle || "Complete the form below to receive a free, no-obligation hauling estimate."}
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase">Your Name</Label>
                  <Input id="name" placeholder="John Doe" className="bg-white border-slate-200" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-xs text-red-500 font-semibold">{form.formState.errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="(555) 555-5555" 
                    className="bg-white border-slate-200" 
                    {...form.register('phone')} 
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      form.setValue('phone', formatted);
                    }}
                  />
                  {form.formState.errors.phone && <p className="text-xs text-red-500 font-semibold">{form.formState.errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="bg-white border-slate-200" {...form.register('email')} />
                {form.formState.errors.email && <p className="text-xs text-red-500 font-semibold">{form.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-bold text-slate-700 uppercase">Tell us what needs hauling (Optional)</Label>
                <Textarea id="notes" placeholder="Describe the items, location of items (e.g. garage, yard), or any special instructions..." className="bg-white border-slate-200 min-h-[100px]" {...form.register('notes')} />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="consent" 
                    checked={form.watch('consent')} 
                    onCheckedChange={(checked) => form.setValue('consent', checked === true)} 
                    className="border-slate-300 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 mt-1" 
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="consent" className="text-xs text-slate-500 font-medium leading-normal">
                      By checking this box, you agree to receive SMS communications, phone calls, and email updates from {companyName} regarding your hauling request at the number provided above. Consent is not a condition of purchase. Message and data rates may apply.
                    </label>
                    {form.formState.errors.consent && <p className="text-xs text-red-500 font-semibold">{form.formState.errors.consent.message}</p>}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold h-12 text-sm flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Estimate Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 md:px-12 border-t border-slate-850">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-500" />
            <span className="text-white font-bold">{companyName}</span>
          </div>
          <p className="text-xs text-slate-550">© {new Date().getFullYear()} {companyName}. All rights reserved. Professional eco-friendly local junk removal.</p>
        </div>
      </footer>

      {/* Capturing AI Chatbot context widget */}
      {businessProfileId && <ChatbotWidget businessProfileId={businessProfileId} />}
    </div>
  );
}
