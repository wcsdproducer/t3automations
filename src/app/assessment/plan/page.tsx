'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { T3LogoText } from '@/components/ui/logo';

function PlanPageContent() {
  const searchParams = useSearchParams();
  const scoreParam = searchParams.get('score');
  const score = scoreParam ? parseInt(scoreParam, 10) : 0;

  const getResultMessage = () => {
    if (score >= 8) {
      return "Excellent! You're a marketing pro. Let's talk about how our AI can automate your success and take you to the next level.";
    }
    if (score >= 5) {
      return "You've got a solid foundation. Let us show you how to fill in the gaps and turn more leads into customers.";
    }
    return "There's a huge opportunity for growth. Our AI solutions can build and execute a customer acquisition strategy for you.";
  };

  const getPersonalizedPlan = () => {
    const plan = [];
    if (score < 5) {
      plan.push(
        "Focus on establishing a strong online presence. A professional website and active social media are crucial first steps.",
        "Implement a system to collect customer reviews. Social proof is powerful for building trust.",
        "Start with basic SEO to ensure your business is found by local customers."
      );
    } else if (score < 8) {
      plan.push(
        "Automate lead follow-up to respond to inquiries instantly. This is a key area for growth.",
        "Utilize email marketing to nurture leads and stay in touch with existing customers.",
        "Consider running targeted online advertising campaigns to increase lead flow."
      );
    } else {
      plan.push(
        "Scale your successful marketing efforts through advanced automation.",
        "Implement an AI-driven sales system to handle high volume and qualify leads 24/7.",
        "Optimize your data and systems for a 'single source of truth' to make data-driven decisions."
      );
    }
    return plan;
  };
  
  const plan = getPersonalizedPlan();
  const yesNoQuestionsCount = 10; 

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-12 bg-background">
      <div className="container max-w-4xl w-full">
        <Card className="shadow-lg w-full">
            <div className="p-8">
                <div className="text-center mb-8">
                    <T3LogoText className="text-primary text-3xl" />
                    <h1 className="text-2xl font-bold mt-4">Your Custom Automation Plan</h1>
                    <p className="text-muted-foreground">Generated on: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="mb-8 p-6 bg-muted/20 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Your Assessment Score</h2>
                    <p className="text-5xl font-bold text-primary">{score}<span className="text-xl text-muted-foreground">/{yesNoQuestionsCount}</span></p>
                    <p className="text-lg text-muted-foreground mt-2">{getResultMessage()}</p>
                </div>
                
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Your Immediate Implementation Plan</h2>
                    <ul className="space-y-4">
                    {plan.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <span className="text-base">{item}</span>
                        </li>
                    ))}
                    </ul>
                </div>

                <div className="mt-12 pt-8 border-t text-center">
                    <p className="text-lg font-semibold">Ready to turn these insights into action?</p>
                    <p className="mt-2 text-muted-foreground">Schedule a free, no-obligation consultation with one of our automation experts.</p>
                    
                    <div className="mt-6">
                        <Link href="/contact">
                            <Button size="lg">Book a Free Consultation</Button>
                        </Link>
                    </div>

                    <div className="mt-12">
                        <p className="font-bold">T3 Automations</p>
                        <p className="text-sm text-muted-foreground">Email: contact@t3automations.com</p>
                        <p className="text-sm text-muted-foreground">Phone: (123) 456-7890</p>
                    </div>
                </div>
            </div>
        </Card>
      </div>
    </main>
  );
}


export default function PlanPage() {
    return (
        <div className="flex flex-col bg-background">
            <Header />
            <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
                <PlanPageContent />
            </React.Suspense>
            <Footer />
        </div>
    );
}
