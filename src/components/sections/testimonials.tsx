'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import TranslatedText from '../TranslatedText';

const testimonials = [
  {
    author: 'James Thornton',
    title: 'Vanguard Urban Living',
    quote:
      "The ROI we've seen with T3 Solutions has been incredible. They didn't just hand us a tool; they built a solution that scaled our operations and modernized our entire workflow. Huge shoutout to John and Joey for their forward-thinking approach and relentless focus on our success. They are truly the gold standard for AI integration.",
  },
  {
    author: 'Max Liepe',
    title: 'CEO, Sunny Day Solar Company',
    quote:
      "T3 Solutions has been a game-changer for our business. Rather than acting as a standard vendor, they operate as a seamless extension of our internal team. Their custom AI implementation didn't just improve our efficiency—it fundamentally sharpened our competitive advantage. If you want a forward-thinking partner invested in your long-term growth, I can't recommend them highly enough.",
  },
  {
    author: 'Felipe Cavalcante',
    title: 'FC Flooring',
    quote:
      "Total game-changers. T3 Solutions integrated seamlessly into our workflow and delivered an AI solution that has revolutionized our efficiency. John, Joey, and the crew are true professionals who stay ahead of the curve. If you're looking for a competitive edge, this is the team you want in your corner.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-[#F5F0E7]">
        <div className="container">
            <div className="mx-auto max-w-2xl text-center">
                <p className="text-primary font-semibold uppercase tracking-wider"><TranslatedText>Social Proof</TranslatedText></p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-secondary-foreground sm:text-4xl">
                    <TranslatedText>What Our Clients Say About Our AI Agents</TranslatedText>
                </h2>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                    <Card key={index} className="bg-card text-card-foreground flex flex-col">
                        <CardContent className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-0.5 mb-4">
                                <Star className="w-5 h-5 text-primary fill-primary" />
                                <Star className="w-5 h-5 text-primary fill-primary" />
                                <Star className="w-5 h-5 text-primary fill-primary" />
                                <Star className="w-5 h-5 text-primary fill-primary" />
                                <Star className="w-5 h-5 text-primary fill-primary" />
                            </div>
                            <p className="flex-1">
                                <TranslatedText>{testimonial.quote}</TranslatedText>
                            </p>
                            <div className="mt-6">
                                <p className="font-semibold"><TranslatedText>{testimonial.author}</TranslatedText></p>
                                <p className="text-sm text-muted-foreground"><TranslatedText>{testimonial.title}</TranslatedText></p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </section>
  );
}
