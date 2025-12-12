'use client';

import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative flex items-center justify-center h-screen bg-background">
      <div className="video-background">
        <iframe
          src="https://www.youtube.com/embed/onMNHAorvIY?autoplay=1&mute=1&loop=1&playlist=onMNHAorvIY&controls=0&showinfo=0&autohide=1&modestbranding=1&vq=hd1080"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>
      <div className="container z-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl text-gray-800">
            Convert conversations to clients
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Win and retain more business with AI-first, multi-channel comms for your home services company.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Button size="lg" onClick={() => router.push('#demos')}>
              <Bot className="mr-2 h-5 w-5" /> Try our AI
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
