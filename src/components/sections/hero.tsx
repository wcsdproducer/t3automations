'use client';

import { Button } from '@/components/ui/button';
import { ChevronsDown } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative flex h-screen flex-col justify-start md:justify-center items-center text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        {/* Image for small screens */}
        <div className="block md:hidden w-full h-full relative">
            <Image
                src="https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2F861edc8f-cf9d-43f9-90b4-a878cd821f99.png?alt=media&token=b35d1330-cdcb-46fe-8313-cfdabadaf3e0"
                alt="Hero background on mobile"
                fill
                className="object-cover"
            />
        </div>
        {/* Video for medium screens and up */}
        <iframe
          className="hidden md:block absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 scale-150"
          src="https://www.youtube.com/embed/sat_OOmdCAo?autoplay=1&mute=1&loop=1&playlist=sat_OOmdCAo&controls=0&showinfo=0&autohide=1&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1"
          frameBorder="0"
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      {/* Content Container */}
      <div className="container z-20 text-center px-4 flex flex-col items-center h-full md:h-auto md:justify-center">
        <div className="flex-grow flex items-center justify-center md:flex-grow-0">
          <h1 className="text-3xl font-bold tracking-tight md:text-6xl lg:text-7xl max-w-[800px] mx-auto">
            Are you ready to scale your business?
          </h1>
        </div>
        <div className="pb-24 md:pb-0">
            <p className="mt-4 text-base md:text-xl text-gray-200 max-w-4xl">
              Answer 15 questions that will help you get
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full font-bold text-lg w-full sm:w-auto">MORE LEADS</Button>
              <Button size="lg" className="rounded-full font-bold text-lg w-full sm:w-auto">MORE QUOTES</Button>
              <Button size="lg" className="rounded-full font-bold text-lg w-full sm:w-auto">MORE JOBS</Button>
            </div>
        </div>
      </div>

      {/* Bottom Arrow */}
      <div className="absolute bottom-8 z-20 w-full px-4 text-center">
        <ChevronsDown className="h-12 w-12 md:h-20 md:w-20 animate-bounce text-primary mx-auto" />
      </div>
    </section>
  );
}
