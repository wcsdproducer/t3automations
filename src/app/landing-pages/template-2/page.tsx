'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Brush, Hammer, Building } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function LandingPageTemplate2() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'lp2-hero');
  const aboutImage = PlaceHolderImages.find(img => img.id === 'lp2-about');
  const galleryImages = [
    PlaceHolderImages.find(img => img.id === 'lp2-gal1'),
    PlaceHolderImages.find(img => img.id === 'lp2-gal2'),
    PlaceHolderImages.find(img => img.id === 'lp2-gal3'),
    PlaceHolderImages.find(img => img.id === 'lp2-gal4'),
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 p-6 flex justify-between items-center bg-background/30 backdrop-blur-md transition-colors duration-300">
        <h1 className="text-2xl font-bold text-white tracking-wider">LuxeFinish</h1>
        <nav className="hidden md:flex gap-6 items-center">
            <a href="#services" className="text-sm font-medium text-white hover:text-primary transition-colors">Services</a>
            <a href="#about" className="text-sm font-medium text-white hover:text-primary transition-colors">About Us</a>
            <a href="#reviews" className="text-sm font-medium text-white hover:text-primary transition-colors">Reviews</a>
            <a href="#contact" className="text-sm font-medium text-white hover:text-primary transition-colors">Contact</a>
        </nav>
        <a href="#contact">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">Contact Us</Button>
        </a>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-end p-8 md:p-12 text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              data-ai-hint={heroImage.imageHint}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-bold">Exquisite Home Renovations</h2>
            <p className="mt-4 text-lg md:text-xl">We bring your vision to life with unparalleled craftsmanship and design.</p>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 md:py-24 px-6 bg-secondary">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold">Our Signature Services</h3>
            <p className="text-muted-foreground mt-2">Crafting beautiful and functional spaces.</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="p-6">
                    <Brush className="h-10 w-10 text-primary" />
                    <h4 className="mt-4 text-xl font-semibold">Interior Design & Remodeling</h4>
                    <p className="mt-2 text-muted-foreground">Full-service design and construction for kitchens, bathrooms, and entire homes.</p>
                </div>
                <div className="p-6">
                    <Hammer className="h-10 w-10 text-primary" />
                    <h4 className="mt-4 text-xl font-semibold">Custom Cabinetry & Millwork</h4>
                    <p className="mt-2 text-muted-foreground">Bespoke woodworking solutions to add character and functionality to your space.</p>
                </div>
                <div className="p-6">
                    <Building className="h-10 w-10 text-primary" />
                    <h4 className="mt-4 text-xl font-semibold">Exterior & Landscape Design</h4>
                    <p className="mt-2 text-muted-foreground">Enhancing curb appeal and creating beautiful outdoor living areas.</p>
                </div>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.map((image, i) => image && (
                <div key={i} className="aspect-square relative rounded-lg overflow-hidden group">
                  <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-black/20"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-16 md:py-24 px-6 bg-background">
            <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                {aboutImage && (
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                        <Image src={aboutImage.imageUrl} alt={aboutImage.description} data-ai-hint={aboutImage.imageHint} fill className="object-cover" />
                    </div>
                )}
                <div>
                    <h3 className="text-3xl font-bold">The LuxeFinish Difference</h3>
                    <p className="mt-4 text-muted-foreground">LuxeFinish was founded on the principle of artistry in construction. We believe every renovation is an opportunity to create something truly special. Our team of designers, architects, and master craftsmen work in harmony to deliver a seamless experience and a final product that exceeds every expectation.</p>
                </div>
            </div>
        </section>


        {/* Google Reviews Section */}
        <section id="reviews" className="py-16 md:py-24 px-6 bg-secondary">
          <div className="container mx-auto max-w-4xl">
             <h3 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card>
                 <CardContent className="p-6">
                  <div className="flex text-yellow-400 mb-2"> <Star fill="currentColor"/> <Star fill="currentColor"/> <Star fill="currentColor"/> <Star fill="currentColor"/> <Star fill="currentColor"/> </div>
                  <p className="text-muted-foreground">"LuxeFinish transformed our outdated kitchen into a modern masterpiece. The attention to detail was impeccable."</p>
                  <p className="font-semibold mt-4">- The Johnson Family</p>
                 </CardContent>
               </Card>
                <Card>
                 <CardContent className="p-6">
                  <div className="flex text-yellow-400 mb-2"> <Star fill="currentColor"/> <Star fill="currentColor"/> <Star fill="currentColor"/> <Star fill="currentColor"/> <Star fill="currentColor"/> </div>
                  <p className="text-muted-foreground">"Professional, timely, and the final result exceeded all our expectations. Highly recommend their services!"</p>
                  <p className="font-semibold mt-4">- Mark & Sarah Lee</p>
                 </CardContent>
               </Card>
             </div>
          </div>
        </section>

         {/* Contact Section */}
        <section id="contact" className="py-16 md:py-24 px-6">
            <div className="container mx-auto max-w-2xl text-center">
                <h3 className="text-3xl font-bold">Start Your Transformation</h3>
                <p className="text-muted-foreground mt-2">Contact us today for a consultation on your next project.</p>
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
        <p>&copy; {new Date().getFullYear()} LuxeFinish. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
