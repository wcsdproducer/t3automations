'use client';

import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <section className="relative flex h-screen flex-col justify-center items-center text-white">
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
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="container z-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Are you ready to scale your business?
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-200">
            America's highest-rated live chat & virtual receptionist service.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Button size="lg">Website Chat</Button>
            <Button size="lg">Answering Service</Button>
            <Button size="lg">Outbound Calls</Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <ChevronDown className="h-8 w-8 animate-bounce" />
      </div>
    </section>
  );
}
