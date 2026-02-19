'use client';

import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';

const stats = [
  { value: '5,000+', label: 'Happy Customers' },
  { value: '20M+', label: 'Calls Handled' },
  { value: '1M+', label: 'Appointments Booked' },
];

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative flex h-screen flex-col justify-center items-center bg-background text-white">
      <div className="video-background">
        <iframe
          src="https://www.youtube.com/embed/onMNHAorvIY?autoplay=1&mute=1&loop=1&playlist=onMNHAorvIY&controls=0&showinfo=0&autohide=1&modestbranding=1&vq=hd1080"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>
       <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div className="container z-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Automate Your Success
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-200">
            Streamline your operations, boost efficiency, and drive growth with our intelligent automation solutions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Button size="lg" onClick={() => router.push('#demos')} className="bg-white text-primary hover:bg-white/90">
              <Bot className="mr-2 h-5 w-5" /> Try our AI
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 left-0 right-0 z-20">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold">{stat.value}</p>
                <p className="mt-1 text-base text-gray-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
