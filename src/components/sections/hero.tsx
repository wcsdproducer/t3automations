import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Hero() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <section className="relative bg-card py-20 md:py-32">
      <div className="container z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Your 24/7 AI-Powered Virtual Receptionist
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Never miss a call, qualify every lead, and schedule appointments effortlessly.
            Elevate your customer experience and boost efficiency with the power of AI.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Try The Demo
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
        {heroImage && (
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                width={1200}
                height={800}
                className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
