'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const testimonials = [
  {
    author: 'Jeremy Fremont',
    title: 'Fremont Law Firm',
    quote:
      'Their service is our inbound sales team. Having a trained and personable voice has transformed our ability to answer the phone and convert callers to clients.',
    imageId: 'testimonial-1',
  },
   {
    author: 'Sarah Johnson',
    title: 'Tech Innovators',
    quote:
      'The responsiveness and professionalism of the virtual receptionists have been a game-changer for our customer service. Highly recommended!',
    imageId: 'testimonial-1',
  },
  {
    author: 'Michael Chen',
    title: 'Marketing Pro',
    quote:
      'Our lead qualification process has become so much more efficient. We are saving time and focusing on high-quality leads.',
    imageId: 'testimonial-1',
  },
];

export default function Testimonials() {
  const testimonialImage = PlaceHolderImages.find((img) => img.id === 'testimonial-1');

  return (
    <section className="py-20 md:py-28 bg-secondary text-secondary-foreground">
        <div className="container">
            <div className="mx-auto max-w-2xl text-center">
                <p className="text-primary font-semibold uppercase tracking-wider">Social Proof</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                    What Our Clients Say About Our AI Agents
                </h2>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                    <Card key={index} className="bg-card text-card-foreground">
                        <CardHeader className="flex-row items-center gap-4">
                            {testimonialImage && (
                                <Image
                                src={testimonialImage.imageUrl}
                                alt={testimonial.author}
                                data-ai-hint="person"
                                width={56}
                                height={56}
                                className="rounded-full"
                                />
                            )}
                            <div>
                                <CardTitle>{testimonial.author}</CardTitle>
                                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="italic text-muted-foreground">
                            "{testimonial.quote}"
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </section>
  );
}
