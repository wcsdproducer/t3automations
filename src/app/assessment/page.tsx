'use client';

import React, { useState } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const questions: {
  question: string;
  category: string;
  type: 'yes-no' | 'multiple-choice-single' | 'multiple-choice-multiple' | 'text';
  options?: string[];
}[] = [
  { question: "Have you clearly defined your target audience?", category: "Best Practices", type: 'yes-no' },
  { question: "Do you have a professional, mobile-friendly website?", category: "Best Practices", type: 'yes-no' },
  { question: "Are you actively using social media for your business?", category: "Best Practices", type: 'yes-no' },
  { question: "Do you have a system for collecting customer reviews or testimonials?", category: "Best Practices", type: 'yes-no' },
  { question: "Are you running any online advertising campaigns (e.g., Google Ads, Facebook Ads)?", category: "Best Practices", type: 'yes-no' },
  { question: "Do you maintain an email list for marketing to potential and existing customers?", category: "Best Practices", type: 'yes-no' },
  { question: "Have you optimized your website for search engines (SEO)?", category: "Best Practices", type: 'yes-no' },
  { question: "Do you regularly create and share content (e.g., blog posts, videos, articles)?", category: "Best Practices", type: 'yes-no' },
  { question: "Do you have a documented process for following up with new leads?", category: "Best Practices", type: 'yes-no' },
  { question: "Do you track how customers find your business (e.g., referral source, marketing channel)?", category: "Best Practices", type: 'yes-no' },
  {
    question: "Which best describes your current situation?",
    category: "Let’s Drill Down",
    type: 'multiple-choice-single',
    options: [
      "We need more leads.",
      "We have leads, but we’re struggling to follow up fast enough.",
      "Our sales team is overwhelmed by repetitive manual tasks.",
      "Our customer acquisition cost (CAC) is too high/unsustainable.",
      "We are ready to scale, but don't have the systems to handle the volume."
    ]
  },
  {
    question: "Which of these best describes the outcome that you would like to achieve in the next 90 days?",
    category: "Let’s Drill Down",
    type: 'multiple-choice-multiple',
    options: [
      "Recapture 'lost' revenue by automating our lead follow-up.",
      "Reduce operational overhead by automating repetitive manual tasks.",
      "Launch a 24/7 AI-driven sales or support system.",
      "Scale our appointment volume without increasing our headcount.",
      "Clean up our data and sync our systems for a 'single source of truth'."
    ]
  },
  {
    question: "What is the biggest obstacle that you think is stopping you from achieving your goal?",
    category: "Let’s Drill Down",
    type: 'multiple-choice-single',
    options: [
      "Our current systems don't 'talk' to each other.",
      "We don't have the internal technical expertise to build or manage AI.",
      "Our team is buried in 'busy work' and has no time to implement new tech.",
      "We've tried other tools or agencies, but they were too complex/didn't work.",
      "Lack of clarity on where AI actually fits into our specific workflow."
    ]
  },
  {
    question: "Where would an AI-driven 'extra set of hands' make the biggest impact right now?",
    category: "Let’s Drill Down",
    type: 'multiple-choice-single',
    options: [
      "Handling basic administrative tasks and data entry.",
      "Managing and nurturing our existing lead database via SMS and Email.",
      "Replacing/Augmenting our front-line Sales or Support with 24/7 AI Voice Agents.",
      "Building a fully integrated, end-to-end automated sales funnel (from Lead to Close)."
    ]
  },
  {
    question: "Is there anything else that you think we need to know about?",
    category: "Let’s Drill Down",
    type: 'text'
  },
];

const yesNoQuestionsCount = questions.filter(q => q.type === 'yes-no').length;

export default function AssessmentPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const currentQuestion = questions[currentQuestionIndex];

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleAnswer = (answer: 'yes' | 'no') => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
    handleNextQuestion();
  };

  const handleMultipleChoiceSingleChange = (value: string) => {
    setAnswers(prev => ({...prev, [currentQuestionIndex]: value}));
  };

  const handleMultipleChoiceMultipleChange = (option: string, checked: boolean) => {
    const currentAnswers = (answers[currentQuestionIndex] as string[]) || [];
    let newAnswers: string[];
    if (checked) {
      newAnswers = [...currentAnswers, option];
    } else {
      newAnswers = currentAnswers.filter(item => item !== option);
    }
    setAnswers(prev => ({...prev, [currentQuestionIndex]: newAnswers}));
  };
  
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers(prev => ({...prev, [currentQuestionIndex]: event.target.value}));
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizFinished(false);
  };

  const calculateScore = () => {
    return Object.values(answers).filter(answer => typeof answer === 'string' && answer === 'yes').length;
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
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="container max-w-2xl w-full">
          <Card className="shadow-lg w-full">
            {quizFinished ? (
              <div className="text-center p-6 md:p-8">
                <CardHeader>
                  <CardTitle className="text-2xl md:text-3xl">Quiz Complete!</CardTitle>
                  <CardDescription>Here are your results.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl md:text-6xl font-bold text-primary mb-4">{score}<span className="text-xl md:text-2xl text-muted-foreground">/{yesNoQuestionsCount}</span></p>
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
                  {currentQuestion.category && (currentQuestionIndex === 0 || currentQuestion.category !== questions[currentQuestionIndex - 1].category) && (
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">
                      {currentQuestion.category}
                    </h3>
                  )}
                  <div className="min-h-[120px] md:min-h-[84px] flex flex-col items-center justify-center mb-8">
                    <p className="text-lg md:text-xl font-semibold">
                      {currentQuestion.question}
                    </p>
                    {currentQuestionIndex >= yesNoQuestionsCount && currentQuestion.type === 'multiple-choice-single' && (
                      <p className="text-muted-foreground text-sm mt-2">(Choose one)</p>
                    )}
                    {currentQuestionIndex >= yesNoQuestionsCount && currentQuestion.type === 'multiple-choice-multiple' && (
                      <p className="text-muted-foreground text-sm mt-2">(Choose all that apply)</p>
                    )}
                  </div>
                  
                  {currentQuestion.type === 'yes-no' && (
                    <div className="flex justify-center gap-4">
                      <Button onClick={() => handleAnswer('yes')} className="w-28 md:w-32 h-12 text-lg bg-[#1A1A1A] hover:bg-[#C6410F]">Yes</Button>
                      <Button onClick={() => handleAnswer('no')} className="w-28 md:w-32 h-12 text-lg bg-[#1A1A1A] hover:bg-[#C6410F]">No</Button>
                    </div>
                  )}

                  {currentQuestion.type === 'multiple-choice-single' && (
                    <div className="space-y-4 text-left max-w-md mx-auto">
                        <RadioGroup onValueChange={handleMultipleChoiceSingleChange} value={answers[currentQuestionIndex] as string}>
                            {currentQuestion.options?.map(option => (
                                <div key={option} className="flex items-center space-x-2 p-3 rounded-md border hover:bg-muted transition-colors">
                                    <RadioGroupItem value={option} id={option} />
                                    <Label htmlFor={option} className="flex-1 cursor-pointer">{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        <Button onClick={handleNextQuestion} className="w-full mt-6" disabled={!answers[currentQuestionIndex]}>Next</Button>
                    </div>
                  )}

                  {currentQuestion.type === 'multiple-choice-multiple' && (
                      <div className="space-y-4 text-left max-w-md mx-auto">
                          {currentQuestion.options?.map(option => (
                              <div key={option} className="flex items-center space-x-2 p-3 rounded-md border hover:bg-muted transition-colors">
                                  <Checkbox 
                                      id={option} 
                                      onCheckedChange={(checked) => handleMultipleChoiceMultipleChange(option, !!checked)} 
                                      checked={((answers[currentQuestionIndex] as string[]) || []).includes(option)}
                                  />
                                  <Label htmlFor={option} className="flex-1 cursor-pointer">{option}</Label>
                              </div>
                          ))}
                          <Button onClick={handleNextQuestion} className="w-full mt-6">Next</Button>
                      </div>
                  )}

                  {currentQuestion.type === 'text' && (
                      <div className="space-y-4 max-w-md mx-auto">
                          <Textarea 
                              onChange={handleTextChange} 
                              value={answers[currentQuestionIndex] as string || ''}
                              rows={5}
                              placeholder="Your comments here..."
                          />
                          <Button onClick={handleNextQuestion} className="w-full mt-4">Next</Button>
                      </div>
                  )}

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
