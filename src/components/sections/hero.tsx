'use client';

import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative bg-background py-20 md:py-32">
      <div className="container z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Convert conversations to clients
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Win and retain more business with AI-first, multi-channel comms for your home services company.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Button size="lg" onClick={() => router.push('#demos')}>
              <Bot className="mr-2 h-5 w-5" /> Try our AI
            </Button>
          </div>
        </div>
        <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="relative aspect-video">
                <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-md shadow-2xl ring-1 ring-gray-900/10"
                    src="https://www.youtube.com/embed/wqQarWPIUQg"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
      </div>
    </section>
  );
}
