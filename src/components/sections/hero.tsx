'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative flex h-screen flex-col justify-center items-center text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <iframe
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2"
          src="https://www.youtube.com/embed/sat_OOmdCAo?autoplay=1&mute=1&loop=1&playlist=sat_OOmdCAo&controls=0&showinfo=0&autohide=1&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1"
          frameBorder="0"
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="container z-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Are you ready to scale your business?
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-200">
            Answer 15 questions that will help you get
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Button size="lg" className="rounded-full font-bold">MORE LEADS</Button>
            <Button size="lg" className="rounded-full font-bold">MORE QUOTES</Button>
            <Button size="lg" className="rounded-full font-bold">MORE JOBS</Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <ChevronDown className="h-8 w-8 animate-bounce" />
      </div>
    </section>
  );
}
