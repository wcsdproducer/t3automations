'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '../ui/button';

const testimonials = [
  {
    quote:
      'Smith.ai is our inbound sales team. Having a trained and personable voice has transformed our ability to answer the phone and convert callers to clients.',
    author: 'Jeremy Fremont',
    title: 'Fremont Law Firm',
    imageId: 'testimonial-1',
  },
   {
    quote:
      'The responsiveness and professionalism of the virtual receptionists have been a game-changer for our customer service. Highly recommended!',
    author: 'Sarah Johnson',
    title: 'Tech Innovators',
    imageId: 'testimonial-1',
  },
  {
    quote:
      'Our lead qualification process has become so much more efficient. We are saving time and focusing on high-quality leads.',
    author: 'Michael Chen',
    title: 'Marketing Pro',
    imageId: 'testimonial-1',
  },
];

export default function Testimonials() {
  const testimonialImage = PlaceHolderImages.find((img) => img.id === 'testimonial-1');
  return (
    <section className="py-20 md:py-28 bg-background">
        <div className="container text-center">
            <div className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">CUSTOMER REVIEWS</div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Total call coverage, powered by AI + humans
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
                Whether it's after-hours, in the middle of the night, AI Receptionists and our live agents ensure your calls are always answered, so you never miss a lead.
            </p>
            <Carousel
                opts={{
                align: 'start',
                loop: true,
                }}
                className="mx-auto mt-16 w-full max-w-4xl"
            >
                <CarouselContent>
                {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index}>
                    <div className="p-1">
                        <Card className="border-0 bg-transparent shadow-none">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            {testimonialImage && (
                                <Image
                                src={testimonialImage.imageUrl}
                                alt={testimonial.author}
                                data-ai-hint="person"
                                width={80}
                                height={80}
                                className="mb-4 rounded-full"
                                />
                            )}
                            <p className="italic text-lg text-muted-foreground">
                            "{testimonial.quote}"
                            </p>
                            <p className="mt-4 font-bold">{testimonial.author}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                        </CardContent>
                        </Card>
                    </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
            <div className='mt-8'>
                <Button>Speak with our sales team</Button>
            </div>
        </div>
    </section>
  );
}
