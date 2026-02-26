'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPageTemplate2() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'lp2-hero');
  const galleryImages = [
    PlaceHolderImages.find(img => img.id === 'lp2-gal1'),
    PlaceHolderImages.find(img => img.id === 'lp2-gal2'),
    PlaceHolderImages.find(img => img.id === 'lp2-gal3'),
    PlaceHolderImages.find(img => img.id === 'lp2-gal4'),
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-10 p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-wider">LuxeFinish</h1>
        <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">Contact Us</Button>
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
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold">Exquisite Home Renovations</h2>
            <p className="mt-4 text-lg md:text-xl max-w-lg">We bring your vision to life with unparalleled craftsmanship and design.</p>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 md:py-24 px-6 bg-secondary">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold">Our Work</h3>
            <p className="text-muted-foreground mt-2">A glimpse into our portfolio of transformations.</p>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.map((image, i) => image && (
                <div key={i} className="aspect-square relative rounded-lg overflow-hidden">
                  <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 px-6">
          <div className="container mx-auto max-w-4xl">
             <h3 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card>
                 <CardContent className="p-6">
                  <div className="flex text-yellow-400 mb-2"> <Star /> <Star /> <Star /> <Star /> <Star /> </div>
                  <p className="text-muted-foreground">"LuxeFinish transformed our outdated kitchen into a modern masterpiece. The attention to detail was impeccable."</p>
                  <p className="font-semibold mt-4">- The Johnson Family</p>
                 </CardContent>
               </Card>
                <Card>
                 <CardContent className="p-6">
                  <div className="flex text-yellow-400 mb-2"> <Star /> <Star /> <Star /> <Star /> <Star /> </div>
                  <p className="text-muted-foreground">"Professional, timely, and the final result exceeded all our expectations. Highly recommend their services!"</p>
                  <p className="font-semibold mt-4">- Mark & Sarah Lee</p>
                 </CardContent>
               </Card>
             </div>
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
