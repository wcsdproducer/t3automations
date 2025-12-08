import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Bot, User } from 'lucide-react';

export default function Hero() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <section className="relative bg-background py-20 md:py-32">
      <div className="container z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Convert conversations to clients
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Win and retain more business with AI-first or human-first, multi-channel comms for your home services company.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Button size="lg">
              <Bot className="mr-2 h-5 w-5" /> AI Receptionist
            </Button>
            <Button size="lg" variant="outline">
              <User className="mr-2 h-5 w-5" /> Virtual Receptionist
            </Button>
          </div>
        </div>
        {heroImage && (
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="relative aspect-video">
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  fill
                  className="rounded-md object-cover shadow-2xl ring-1 ring-gray-900/10"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button aria-label="Play video" className="flex h-20 w-20 items-center justify-center rounded-full bg-white/40 backdrop-blur-sm transition hover:bg-white/60">
                    <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
