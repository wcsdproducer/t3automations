'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Star, Phone, ShieldCheck, Award, ThumbsUp, Calendar, ArrowRight } from 'lucide-react';
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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { AeoSchema } from '@/components/AeoSchema';


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

// Font pairings loaded dynamically
const fontMappings: Record<string, { import: string; headline: string; body: string }> = {
  'modern-corporate': {
    import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    headline: "font-sans",
    body: "font-sans",
  },
  'bold-creative': {
    import: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Open+Sans:wght@400;600&display=swap',
    headline: "'Montserrat', sans-serif",
    body: "'Open Sans', sans-serif",
  },
  'elegant-luxury': {
    import: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Source+Sans+3:wght@400;600&display=swap',
    headline: "'Playfair Display', serif",
    body: "'Source Sans 3', sans-serif",
  },
  'friendly-local': {
    import: 'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap',
    headline: "'Outfit', sans-serif",
    body: "'Inter', sans-serif",
  },
  'tech-forward': {
    import: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap',
    headline: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif",
  },
};

// Color palettes mapping for conversion-optimized components
const colorMappings: Record<string, {
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  primaryBorder: string;
  accentBg: string;
  accentHover: string;
  accentText: string;
  gradientHero: string;
  lightBg: string;
  cardBg: string;
  accentRing: string;
  iconBg: string;
}> = {
  'deep-midnight': {
    primaryBg: 'bg-slate-950',
    primaryHover: 'hover:bg-slate-900',
    primaryText: 'text-slate-950',
    primaryBorder: 'border-slate-950',
    accentBg: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    accentText: 'text-blue-600',
    gradientHero: 'from-slate-950 via-slate-900 to-slate-950',
    lightBg: 'bg-slate-50',
    cardBg: 'bg-white',
    accentRing: 'ring-blue-500',
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  'professional-blue': {
    primaryBg: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryText: 'text-blue-600',
    primaryBorder: 'border-blue-600',
    accentBg: 'bg-amber-500',
    accentHover: 'hover:bg-amber-600',
    accentText: 'text-amber-500',
    gradientHero: 'from-blue-950 via-slate-900 to-black',
    lightBg: 'bg-blue-50/20',
    cardBg: 'bg-white',
    accentRing: 'ring-blue-500',
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  'luxury-purple': {
    primaryBg: 'bg-purple-700',
    primaryHover: 'hover:bg-purple-800',
    primaryText: 'text-purple-700',
    primaryBorder: 'border-purple-700',
    accentBg: 'bg-pink-500',
    accentHover: 'hover:bg-pink-600',
    accentText: 'text-pink-500',
    gradientHero: 'from-purple-950 via-slate-900 to-black',
    lightBg: 'bg-purple-50/20',
    cardBg: 'bg-white',
    accentRing: 'ring-purple-500',
    iconBg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  'sunny-yellow': {
    primaryBg: 'bg-amber-500',
    primaryHover: 'hover:bg-amber-600',
    primaryText: 'text-amber-600',
    primaryBorder: 'border-amber-500',
    accentBg: 'bg-slate-900',
    accentHover: 'hover:bg-slate-800',
    accentText: 'text-slate-900',
    gradientHero: 'from-slate-900 via-amber-950 to-slate-950',
    lightBg: 'bg-amber-50/10',
    cardBg: 'bg-white',
    accentRing: 'ring-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  'earthy-green': {
    primaryBg: 'bg-emerald-700',
    primaryHover: 'hover:bg-emerald-800',
    primaryText: 'text-emerald-700',
    primaryBorder: 'border-emerald-700',
    accentBg: 'bg-amber-500',
    accentHover: 'hover:bg-amber-600',
    accentText: 'text-amber-500',
    gradientHero: 'from-emerald-950 via-stone-900 to-black',
    lightBg: 'bg-emerald-50/20',
    cardBg: 'bg-white',
    accentRing: 'ring-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  'vibrant-coral': {
    primaryBg: 'bg-rose-500',
    primaryHover: 'hover:bg-rose-600',
    primaryText: 'text-rose-500',
    primaryBorder: 'border-rose-500',
    accentBg: 'bg-slate-900',
    accentHover: 'hover:bg-slate-800',
    accentText: 'text-slate-900',
    gradientHero: 'from-rose-950 via-slate-900 to-black',
    lightBg: 'bg-rose-50/10',
    cardBg: 'bg-white',
    accentRing: 'ring-rose-500',
    iconBg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  'soft-pastel': {
    primaryBg: 'bg-teal-600',
    primaryHover: 'hover:bg-teal-700',
    primaryText: 'text-teal-600',
    primaryBorder: 'border-teal-600',
    accentBg: 'bg-orange-400',
    accentHover: 'hover:bg-orange-500',
    accentText: 'text-orange-500',
    gradientHero: 'from-teal-950 via-slate-900 to-black',
    lightBg: 'bg-teal-50/20',
    cardBg: 'bg-white',
    accentRing: 'ring-teal-500',
    iconBg: 'bg-teal-50 dark:bg-teal-950/30',
  },
  'clean-minimal': {
    primaryBg: 'bg-slate-900',
    primaryHover: 'hover:bg-slate-800',
    primaryText: 'text-slate-900',
    primaryBorder: 'border-slate-900',
    accentBg: 'bg-slate-200',
    accentHover: 'hover:bg-slate-300',
    accentText: 'text-slate-800',
    gradientHero: 'from-slate-900 via-slate-950 to-black',
    lightBg: 'bg-slate-50',
    cardBg: 'bg-white',
    accentRing: 'ring-slate-900',
    iconBg: 'bg-slate-100',
  },
};

export function Template3Content({
  businessProfileId,
  heroEffect = 'slideshow',
  service = 'HVAC Maintenance & Repair',
  phone: phoneProp = '(000) 000-0000',
  logoUrl = '',
  companyName: companyNameProp = '',
  bookingUrl,
  websiteConfig,
  fontPair = 'modern-corporate',
  colorPalette = 'deep-midnight',
}: TemplateProps) {
  const [content, setContent] = useState<any>(null);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }));
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHeaderShrunk, setIsHeaderShrunk] = useState(false);
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


  // Fallback scroll listener for header shrinking
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsHeaderShrunk(true);
      } else {
        setIsHeaderShrunk(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  if (!content) return <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">Loading...</div>;

  const isJunkRemoval = service === 'Junk Removal' || service === 'Junk Removal & Moving';
  const phone = formatPhone(phoneProp);
  const companyName = companyNameProp || content.companyName;
  const aboutImage = content.images.about;
  const heroImages: ImagePlaceholder[] = content.images.hero;
  const singleHeroImage = heroImages[0];

  // Resolve current active theme settings
  const theme = colorMappings[colorPalette] || colorMappings['deep-midnight'];
  const font = fontMappings[fontPair] || fontMappings['modern-corporate'];

  const heroContent = (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${theme.primaryBg} bg-opacity-90 shadow-md mb-6`}>
        {isJunkRemoval ? '🚚 ECO-FRIENDLY & RELIABLE HAULING' : '⚡ 24/7 EMERGENCY SERVICE AVAILABLE'}
      </span>
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-none">
        {content.hero.title}
      </h1>
      <p className="mt-6 text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
        {content.hero.subtitle}
      </p>

      {/* Trust Badges Bar */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 text-sm text-slate-200">
        {(content.about.points || [
          "Same-Day / Next-Day Availability",
          "Licensed & Fully Insured Crew",
          "Upfront, Flat-Rate Pricing"
        ]).slice(0, 3).map((point: string, i: number) => (
          <div key={i} className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 shadow-sm">
            <Check className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold">{point}</span>
          </div>
        ))}
      </div>

      {isJunkRemoval ? (
        <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white p-6 rounded-3xl shadow-2xl max-w-md mx-auto mt-10 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-center gap-2">
            📍 Verify Service Availability
          </h3>
          <div className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Enter Zip Code" 
              maxLength={5} 
              className="bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-center font-bold tracking-widest text-lg h-12 border-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500" 
              id="hero-zip-input"
            />
            <Button 
              type="button" 
              className={`bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-6 rounded-xl transition-transform duration-250 active:scale-95`}
              onClick={() => {
                const zip = (document.getElementById('hero-zip-input') as HTMLInputElement)?.value;
                if (!zip || zip.length < 5 || isNaN(Number(zip))) {
                  toast({ title: "Oops!", description: "Please enter a valid 5-digit zip code.", variant: "destructive" });
                } else {
                  toast({ title: "Service Available!", description: `We have active crews in ${zip} today! Let's get your quote.`, variant: "default" });
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              GO
            </Button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Check live if same-day junk hauling is available in your neighborhood.</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <a href="#contact" className="w-full sm:w-auto">
            <Button type="button" className={`w-full h-14 px-8 text-base font-bold shadow-lg ${theme.primaryBg} ${theme.primaryHover} text-white transition-transform duration-300 hover:scale-105 rounded-2xl`}>
              GET MY FREE QUOTE NOW
            </Button>
          </a>
          {bookingUrl && (
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-base font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm transition-transform duration-300 hover:scale-105 rounded-2xl">
                <Calendar className="mr-2 h-5 w-5" /> Book Online
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  );

  const renderHero = () => {
    if (heroEffect === 'parallax' && singleHeroImage) {
      return (
        <section className="min-h-[90vh] md:min-h-screen relative flex items-center justify-center py-20 text-white bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${singleHeroImage.imageUrl})` }}>
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" />
          {heroContent}
        </section>
      );
    }
    return (
      <section className="min-h-[90vh] md:min-h-screen relative flex items-center justify-center py-20 text-white overflow-hidden">
        <Carousel plugins={[plugin.current]} className="absolute inset-0 w-full h-full" opts={{ loop: true }}>
          <CarouselContent>
            {heroImages.map((image) => (
              <CarouselItem key={image.id}>
                <div className="relative h-screen w-full">
                  <Image src={image.imageUrl} alt={image.description} fill className="object-cover" priority />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" />
        {heroContent}
      </section>
    );
  };

  return (
    <div className={`bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-slate-900 selection:text-white`} style={{ fontFamily: font.body }}>
      <AeoSchema
        companyName={companyName}
        phone={phone}
        service={service}
        logoUrl={logoUrl}
        description={content.hero?.subtitle}
        faqs={content.faqs}
      />
      {/* Dynamic font stylesheet loading */}
      {font.import && <link rel="stylesheet" href={font.import} />}

      {/* Header featuring glassmorphism and smooth shrinking transition */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isHeaderShrunk 
          ? 'py-2.5 bg-white/90 dark:bg-slate-900/90 shadow-md border-b border-slate-200/50 dark:border-slate-800/50' 
          : 'py-5 bg-transparent border-b border-transparent'
      } backdrop-blur-md`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt={`${companyName} Logo`} width={160} height={48} className="h-10 w-auto object-contain" />
            ) : (
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight" style={{ fontFamily: font.headline }}>
                <span className={theme.primaryText}>{companyName.split(' ')[0]}</span>
                <span className="text-slate-800 dark:text-white">{companyName.substring(companyName.split(' ')[0].length)}</span>
              </h1>
            )}
          </div>
          <nav className="hidden md:flex gap-8 items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
            <a href="#services" className="hover:text-slate-900 dark:hover:text-white transition-colors">Services</a>
            <a href="#about" className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium">Why Us</a>
            <a href="#reviews" className="hover:text-slate-900 dark:hover:text-white transition-colors">Testimonials</a>
            <a href="#faqs" className="hover:text-slate-900 dark:hover:text-white transition-colors">FAQs</a>
            <a href={blogLink} className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href={`tel:${phone}`} className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs md:text-sm shadow-md transition-all text-white bg-slate-900 dark:bg-white dark:text-slate-950 hover:bg-slate-800 hover:scale-105 active:scale-95`}>
              <Phone className="h-4 w-4 animate-pulse" />
              <span>{phone}</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        {renderHero()}

        {/* Dynamic Trust Badges Strip */}
        <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { icon: ShieldCheck, title: "Licensed & Insured", desc: "Full coverage liability insurance for your ultimate peace of mind." },
                { icon: Award, title: "Top-Rated Crew", desc: "Vetted, experienced local professionals dedicated to exceptional work." },
                { icon: ThumbsUp, title: "Satisfaction Guaranteed", desc: "We are committed to delivering results you will absolutely love." }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center p-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${theme.iconBg}`}>
                    <item.icon className={`h-6 w-6 ${theme.primaryText}`} />
                  </div>
                  <h4 className="font-bold text-lg" style={{ fontFamily: font.headline }}>{item.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section with Animated Hover Highlights */}
        <section id="services" className="py-20 md:py-28 px-4 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto text-center max-w-5xl">
            <span className={`text-xs font-bold uppercase tracking-widest ${theme.primaryText}`}>What We Offer</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-3 tracking-tight" style={{ fontFamily: font.headline }}>
              {content.services.title}
            </h2>
            <div className={`w-16 h-1 mx-auto mt-4 rounded ${theme.primaryBg}`} />
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto text-base">
              {content.services.subtitle}
            </p>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.services.items?.map((item: any, i: number) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left group">
                  <div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${theme.iconBg}`}>
                      <ServiceIcon name={item.iconName || item.icon} className={`h-6 w-6 ${theme.primaryText}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white" style={{ fontFamily: font.headline }}>{item.title}</h3>
                    <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                  <a href="#contact" className={`mt-8 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${theme.primaryText} hover:underline`}>
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
          <section id="process" className="py-20 md:py-28 px-4 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
            <div className="container mx-auto text-center max-w-5xl">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.primaryText}`}>Simple Steps</span>
              <h2 className="text-3xl md:text-5xl font-extrabold mt-3 tracking-tight" style={{ fontFamily: font.headline }}>
                {content.process.title || "How It Works"}
              </h2>
              <div className={`w-16 h-1 mx-auto mt-4 rounded ${theme.primaryBg}`} />
              <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto text-base">
                {content.process.subtitle || "Getting started with us is quick, simple, and stress-free."}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
                {content.process.steps?.map((step: any, i: number) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 relative hover:shadow-lg transition-all text-center group">
                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm text-white shadow-md transition-all duration-300 group-hover:scale-110 ${theme.primaryBg}`}>
                      0{step.number || (i + 1)}
                    </div>
                    <h3 className="text-lg font-bold mt-4 text-slate-800 dark:text-white" style={{ fontFamily: font.headline }}>{step.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Junk Removal Specific Pricing Layout */}
        {isJunkRemoval && (
          <section id="load-pricing" className="bg-slate-50 dark:bg-slate-950 py-20 md:py-28 px-4">
            <div className="container mx-auto text-center max-w-5xl">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.primaryText}`}>Transparent Rates</span>
              <h2 className="text-3xl md:text-5xl font-extrabold mt-3 tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: font.headline }}>
                Affordable Junk Removal Done Right
              </h2>
              <div className={`w-16 h-1 mx-auto mt-4 rounded ${theme.primaryBg}`} />
              <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto text-base">
                Professional hauling services with upfront estimates, highly competitive rates, and absolutely zero surprise fees.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                {[
                  { icon: "ClipboardCheck", title: "Free Upfront Estimates", desc: "No-obligation site pricing assessments before any loading starts." },
                  { icon: "DollarSign", title: "Competitor Price Match", desc: "Budget-friendly options matched to save you the most money." },
                  { icon: "ShieldCheck", title: "All-Inclusive Pricing", desc: "Labor, clean up, transportation, and proper disposal fees included." },
                  { icon: "Recycle", title: "Eco-Friendly Disposal", desc: "We donate and recycle up to 60% of hauled goods to protect the environment." }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left">
                    <div>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${theme.iconBg}`}>
                        <ServiceIcon name={item.icon} className={`h-6 w-6 ${theme.primaryText}`} />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg" style={{ fontFamily: font.headline }}>{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About & Trust Bio Section */}
        <section id="about" className="bg-white dark:bg-slate-900 py-20 md:py-28 px-4 border-t border-slate-100 dark:border-slate-800">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center max-w-5xl">
            {aboutImage && (
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800/50 group">
                <Image src={aboutImage.imageUrl} alt={aboutImage.description} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              </div>
            )}
            <div className="text-left">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.primaryText}`}>About Our Company</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight text-slate-800 dark:text-white" style={{ fontFamily: font.headline }}>
                {content.about.title}
              </h2>
              <div className={`w-12 h-1 mt-3 rounded ${theme.primaryBg}`} />
              <p className="mt-6 text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                {content.about.body}
              </p>
              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(content.about.points || [
                  "Licensed & Fully Insured",
                  "Upfront & Transparent Rates",
                  "Highly Rated Local Crew",
                  "Top-Quality Materials & Equipment"
                ]).map((pt: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonials Carousel Section with Star Review styling */}
        <section id="reviews" className="py-20 md:py-28 px-4 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto text-center max-w-5xl">
            <span className={`text-xs font-bold uppercase tracking-widest ${theme.primaryText}`}>Real Reviews</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-3 tracking-tight" style={{ fontFamily: font.headline }}>
              {content.reviews.title}
            </h2>
            <div className={`w-16 h-1 mx-auto mt-4 rounded ${theme.primaryBg}`} />
            
            <div className="mt-16 max-w-4xl mx-auto">
              <Carousel opts={{ align: 'start', loop: true }} plugins={[plugin.current]} className="w-full">
                <CarouselContent>
                  {content.reviews.items.map((review: any, index: number) => (
                    <CarouselItem key={index} className="md:basis-1/2 p-2">
                      <div className="h-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between text-left hover:shadow-lg transition-all duration-300">
                        <div>
                          <div className="flex text-amber-400 gap-1 mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" className="h-4.5 w-4.5 text-amber-400 stroke-none" />)}
                          </div>
                          <p className="italic text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            "{review.quote}"
                          </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                          <p className="font-bold text-sm text-slate-800 dark:text-white" style={{ fontFamily: font.headline }}>{review.author}</p>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Verified Guest</span>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>

        {/* Collapsible FAQ Section */}
        {content.faqs && content.faqs.length > 0 && (
          <section id="faqs" className="py-20 md:py-28 px-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="container mx-auto max-w-3xl">
              <span className={`text-xs font-bold uppercase tracking-widest text-center block ${theme.primaryText}`}>Got Questions?</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-center mt-3 mb-12 tracking-tight" style={{ fontFamily: font.headline }}>
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {content.faqs.map((faq: any, i: number) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-slate-100 dark:border-slate-800 rounded-2xl px-6 bg-slate-50/50 dark:bg-slate-950/20">
                    <AccordionTrigger className="text-left font-bold text-slate-800 dark:text-white text-base md:text-lg hover:no-underline py-4 hover:text-emerald-600 transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pb-4 pt-1 border-t border-slate-100/50 dark:border-slate-800/50">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* Encapsulated Lead Form wrapped in a distinct premium shadow container */}
        <section id="contact" className={`relative py-20 md:py-28 px-4 ${theme.gradientHero} overflow-hidden`}>
          {/* Subtle background mesh accent */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50" />
          
          <div className="container mx-auto relative z-10">
            <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white p-8 md:p-12 rounded-[32px] shadow-2xl max-w-lg mx-auto border border-white/20 dark:border-slate-800/80 backdrop-blur-md">
              <h3 className="text-2xl md:text-3xl font-extrabold text-center tracking-tight" style={{ fontFamily: font.headline }}>{content.contact.title}</h3>
              <p className="text-center text-slate-500 dark:text-slate-400 mt-2 text-sm">{content.contact.subtitle}</p>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
                <div>
                  <Input placeholder="Your Name" className="h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-xs text-rose-500 mt-1 text-left">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Input type="email" placeholder="Email Address" className="h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950" {...form.register('email')} />
                  {form.formState.errors.email && <p className="text-xs text-rose-500 mt-1 text-left">{form.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Input type="tel" placeholder="Phone Number" className="h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950" {...form.register('phone')} />
                  {form.formState.errors.phone && <p className="text-xs text-rose-500 mt-1 text-left">{form.formState.errors.phone.message}</p>}
                </div>
                <div>
                  <Textarea placeholder="Briefly describe your project details or service needs..." className="min-h-[100px] rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950" {...form.register('notes')} />
                  {form.formState.errors.notes && <p className="text-xs text-rose-500 mt-1 text-left">{form.formState.errors.notes.message}</p>}
                </div>
                
                <div className="flex items-start space-x-3 text-left mt-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <Checkbox 
                    id="consent" 
                    checked={form.watch('consent')} 
                    onCheckedChange={(checked) => form.setValue('consent', checked as boolean, { shouldValidate: true })} 
                    className="mt-0.5 border-slate-300 text-emerald-600 focus:ring-emerald-500 rounded"
                  />
                  <div className="grid gap-1.5 leading-tight">
                    <label htmlFor="consent" className="text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                      I agree to receive SMS text notifications from {companyName}.
                    </label>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                      By checking this box, you consent to receive SMS updates regarding your estimate request. Msg & data rates may apply. Reply STOP to opt-out. Read our <a href={`/api/legal/privacy?userId=${businessProfileId}`} target="_blank" className="underline hover:text-emerald-500">Privacy Policy</a>.
                    </p>
                  </div>
                </div>
                {form.formState.errors.consent && <p className="text-xs text-rose-500 mt-1 text-left">{form.formState.errors.consent.message}</p>}
                
                <Button type="submit" className={`w-full h-12 font-bold text-white tracking-wide shadow-md transition-all duration-300 hover:scale-102 mt-6 rounded-xl ${theme.primaryBg} ${theme.primaryHover}`} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Estimate Request...' : 'GET MY FREE ESTIMATE'}
                </Button>
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-3">🔒 Your data is fully encrypted and secure.</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center text-slate-400 dark:text-slate-500 border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950">
        <p className="text-sm font-semibold">&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6 text-xs font-medium">
          <a href={blogLink} className="hover:underline hover:text-slate-700 dark:hover:text-slate-300">Blog</a>
          <a href={`/api/legal/privacy?userId=${businessProfileId}`} target="_blank" className="hover:underline hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</a>
          <a href={`/api/legal/tos?userId=${businessProfileId}`} target="_blank" className="hover:underline hover:text-slate-700 dark:hover:text-slate-300">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
