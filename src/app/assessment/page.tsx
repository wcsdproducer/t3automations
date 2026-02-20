'use client';

import React, { useState } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const questions: { question: string; category: string }[] = [
  { question: "Have you clearly defined your target audience?", category: "Best Practices" },
  { question: "Do you have a professional, mobile-friendly website?", category: "Best Practices" },
  { question: "Are you actively using social media for your business?", category: "Best Practices" },
  { question: "Do you have a system for collecting customer reviews or testimonials?", category: "Best Practices" },
  { question: "Are you running any online advertising campaigns (e.g., Google Ads, Facebook Ads)?", category: "Best Practices" },
  { question: "Do you maintain an email list for marketing to potential and existing customers?", category: "Best Practices" },
  { question: "Have you optimized your website for search engines (SEO)?", category: "Best Practices" },
  { question: "Do you regularly create and share content (e.g., blog posts, videos, articles)?", category: "Best Practices" },
  { question: "Do you have a documented process for following up with new leads?", category: "Best Practices" },
  { question: "Do you track how customers find your business (e.g., referral source, marketing channel)?", category: "Best Practices" },
];

export default function AssessmentPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  const handleAnswer = (answer: 'yes' | 'no') => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizFinished(false);
  };

  const calculateScore = () => {
    return Object.values(answers).filter(answer => answer === 'yes').length;
  };

  const score = calculateScore();
  const progress = quizFinished ? 100 : (currentQuestionIndex / questions.length) * 100;

  const getResultMessage = () => {
    if (score >= 8) {
      return "Excellent! You're a marketing pro. Let's talk about how our AI can automate your success and take you to the next level.";
    }
    if (score >= 5) {
      return "You've got a solid foundation. Let us show you how to fill in the gaps and turn more leads into customers.";
    }
    return "There's a huge opportunity for growth. Our AI solutions can build and execute a customer acquisition strategy for you.";
  };

  return (
    <div className="flex flex-col bg-background">
      <Header />
      <main className="min-h-screen pt-20 flex flex-col items-center justify-center px-4">
        <div className="container max-w-2xl w-full">
          <Card className="shadow-lg w-full">
            {quizFinished ? (
              <div className="text-center p-6 md:p-8">
                <CardHeader>
                  <CardTitle className="text-2xl md:text-3xl">Quiz Complete!</CardTitle>
                  <CardDescription>Here are your results.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl md:text-6xl font-bold text-primary mb-4">{score}<span className="text-xl md:text-2xl text-muted-foreground">/{questions.length}</span></p>
                  <p className="text-base md:text-lg text-muted-foreground mb-8 min-h-[56px]">
                    {getResultMessage()}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/contact">
                        <Button size="lg">Book a Free Consultation</Button>
                    </Link>
                    <Button size="lg" variant="outline" onClick={restartQuiz}>Take Quiz Again</Button>
                  </div>
                </CardContent>
              </div>
            ) : (
              <>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-xl md:text-2xl">Free Assessment Quiz</CardTitle>
                  <CardDescription>See how your customer acquisition strategy stacks up.</CardDescription>
                  <div className="pt-4">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground mt-2 text-right">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="text-center py-8 px-4 md:px-6">
                  {questions[currentQuestionIndex].category && (currentQuestionIndex === 0 || questions[currentQuestionIndex].category !== questions[currentQuestionIndex - 1].category) && (
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">
                      {questions[currentQuestionIndex].category}
                    </h3>
                  )}
                  <p className="text-lg md:text-xl font-semibold mb-8 min-h-[120px] md:min-h-[84px] flex items-center justify-center">
                    {questions[currentQuestionIndex].question}
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => handleAnswer('yes')} className="w-28 md:w-32 h-12 text-lg bg-[#1A1A1A] hover:bg-[#C6410F]">Yes</Button>
                    <Button onClick={() => handleAnswer('no')} className="w-28 md:w-32 h-12 text-lg bg-[#1A1A1A] hover:bg-[#C6410F]">No</Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
