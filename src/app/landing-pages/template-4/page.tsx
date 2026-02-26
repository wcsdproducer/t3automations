'use client';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPageTemplate4() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'lp4-hero');

  return (
    <div className="bg-[#F8F5F2] text-[#4A3F35]">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">SparkleClean</h1>
            <a href="tel:1-800-123-4567" className="flex items-center gap-2 font-semibold">
                <Phone className="h-5 w-5" />
                <span>1-800-123-4567</span>
            </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-16 md:py-24 text-center px-6">
            <h2 className="text-4xl md:text-5xl font-bold">Your Home, Spotlessly Clean.</h2>
            <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto text-muted-foreground">The friendly, reliable cleaning service your neighborhood trusts.</p>
            <Button size="lg" className="mt-8">Book Your Cleaning</Button>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white py-16 md:py-24 px-6">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            {heroImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={heroImage.imageUrl} alt={heroImage.description} data-ai-hint={heroImage.imageHint} fill className="object-cover" />
              </div>
            )}
            <div>
              <h3 className="text-3xl font-bold">Why Your Neighbors Choose Us</h3>
              <p className="mt-4 text-muted-foreground">We're not just a company; we're part of the community. We treat every home like our own.</p>
              <ul className="mt-6 space-y-4">
                <li className="font-medium">✓ Eco-Friendly & Pet-Safe Products</li>
                <li className="font-medium">✓ Background-Checked & Trained Staff</li>
                <li className="font-medium">✓ 100% Satisfaction Guarantee</li>
              </ul>
            </div>
          </div>
        </section>

         {/* Call to Action */}
        <section className="py-16 md:py-24 text-center px-6">
            <h3 className="text-3xl font-bold">Ready for a Sparkling Home?</h3>
            <p className="text-lg mt-2 text-muted-foreground">Get 20% off your first cleaning!</p>
            <Button size="lg" className="mt-6">Claim Your Discount</Button>
        </section>
      </main>

       {/* Footer */}
      <footer className="py-8 px-6 text-center text-muted-foreground bg-white border-t">
        <p>&copy; {new Date().getFullYear()} SparkleClean. Serving our local community with pride.</p>
      </footer>
    </div>
  );
}
