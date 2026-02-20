'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { T3LogoText } from '@/components/ui/logo';

function PlanPageContent() {
  const searchParams = useSearchParams();
  const scoreParam = searchParams.get('score');
  const score = scoreParam ? parseInt(scoreParam, 10) : 0;
  const answersParam = searchParams.get('answers');
  const answers: Record<number, string | string[]> = answersParam ? JSON.parse(answersParam) : {};

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
    const plan: {title: string, description: string}[] = [];

    // Recommendations for 'no' answers to yes/no questions
    for (let i = 0; i < 10; i++) {
        if (answers[i] === 'no') {
            switch (i) {
                case 0:
                    plan.push({
                        title: "Define Your Target Audience",
                        description: "Clearly defining your ideal customer is the foundation of all marketing. We recommend creating detailed buyer personas to guide your strategy, messaging, and targeting."
                    });
                    break;
                case 1:
                    plan.push({
                        title: "Build a Professional Website",
                        description: "Your website is your digital storefront. We recommend developing a modern, mobile-responsive website that clearly communicates your value and makes it easy for visitors to convert."
                    });
                    break;
                case 2:
                    plan.push({
                        title: "Leverage Social Media",
                        description: "Establish a presence on the social media platforms where your target audience is most active. We recommend creating a content calendar and engaging with your followers consistently."
                    });
                    break;
                case 3:
                     plan.push({
                        title: "Implement a Review Collection System",
                        description: "Social proof is critical for building trust. We recommend automating the process of requesting reviews from happy customers via email or SMS."
                    });
                    break;
                case 4:
                    plan.push({
                        title: "Launch Online Advertising Campaigns",
                        description: "Paid ads can drive immediate traffic and leads. We recommend starting with a small, targeted campaign on a platform like Facebook or Google to test messaging and audiences."
                    });
                    break;
                case 5:
                    plan.push({
                        title: "Start Building an Email List",
                        description: "Email marketing provides a direct line to your audience. We recommend using a lead magnet (e.g., a free guide) to capture email addresses and nurturing them with valuable content."
                    });
                    break;
                case 6:
                    plan.push({
                        title: "Invest in Search Engine Optimization (SEO)",
                        description: "SEO helps your business get found on Google. We recommend focusing on local SEO basics, such as optimizing your Google Business Profile and building local citations."
                    });
                    break;
                case 7:
                    plan.push({
                        title: "Develop a Content Marketing Strategy",
                        description: "Content builds authority and attracts your target audience. We recommend creating helpful blog posts, videos, or guides that address your customers' pain points."
                    });
                    break;
                case 8:
                    plan.push({
                        title: "Create a Lead Follow-Up Process",
                        description: "Speed is critical for converting leads. We recommend implementing an automated system to respond to new inquiries within minutes via SMS and email to book an appointment."
                    });
                    break;
                case 9:
                    plan.push({
                        title: "Track Your Marketing Channels",
                        description: "Understanding where your customers come from is key to optimizing your marketing spend. We recommend using tracking tools like UTM parameters and analytics to measure the ROI of each channel."
                    });
                    break;
            }
        }
    }

    // Recommendations based on multiple choice questions
    const situation = answers[10] as string;
    if (situation) {
        let recommendation = "";
        let title = "";
        if (situation.includes("need more leads")) {
            title = "Generate More Leads";
            recommendation = "To generate more leads, we'll focus on a multi-channel approach including targeted online advertising and content marketing to attract your ideal customers.";
        } else if (situation.includes("struggling to follow up")) {
            title = "Improve Lead Follow-Up Speed";
            recommendation = "To solve follow-up struggles, we will implement an AI-powered system that instantly engages every new lead via SMS and email, ensuring no opportunity is missed.";
        } else if (situation.includes("overwhelmed by repetitive manual tasks")) {
            title = "Automate Repetitive Tasks";
            recommendation = "To free up your sales team, we'll automate repetitive tasks like data entry, lead qualification, and appointment scheduling, allowing them to focus on high-value activities.";
        } else if (situation.includes("cost is too high")) {
            title = "Reduce Customer Acquisition Cost";
            recommendation = "To reduce your customer acquisition cost, we will optimize your ad campaigns and implement a lead nurturing system to maximize the value of every lead you generate.";
        } else if (situation.includes("ready to scale")) {
            title = "Build Systems for Scale";
            recommendation = "To prepare your business for scale, we'll build robust, automated systems for lead management and customer onboarding that can handle increased volume without increasing headcount.";
        }
        if (recommendation) {
            plan.push({ title, description: recommendation });
        }
    }
    
    const desiredOutcome = answers[11] as string[];
    if (desiredOutcome && desiredOutcome.length > 0) {
        desiredOutcome.forEach(outcome => {
            let recommendation = "";
            let title = "";
            if (outcome.includes("Recapture 'lost' revenue")) {
                title = "Recapture 'Lost' Revenue";
                recommendation = "We will implement an automated lead follow-up sequence to re-engage and convert leads that have previously gone cold, recapturing lost revenue opportunities.";
            } else if (outcome.includes("Reduce operational overhead")) {
                title = "Reduce Operational Overhead";
                recommendation = "We will map your current workflows and identify key areas for automation, such as data entry and reporting, to significantly reduce operational overhead.";
            } else if (outcome.includes("Launch a 24/7 AI-driven")) {
                title = "Launch a 24/7 AI-Driven System";
                recommendation = "We will deploy a 24/7 AI Voice Agent to handle inbound calls, answer common questions, and qualify leads, providing round-the-clock sales and support coverage.";
            } else if (outcome.includes("Scale our appointment volume")) {
                title = "Scale Appointment Volume";
                recommendation = "Our AI appointment booking system will integrate with your team's calendars, allowing leads to book meetings automatically, scaling your appointment volume efficiently.";
            } else if (outcome.includes("Clean up our data")) {
                title = "Clean Up Data & Sync Systems";
                recommendation = "We will set up integrations between your key systems (CRM, email, etc.) to create a single source of truth for your customer data, ensuring consistency and accuracy.";
            }
            if (recommendation) {
                plan.push({ title, description: recommendation });
            }
        });
    }

    const obstacle = answers[12] as string;
    if (obstacle) {
        let recommendation = "";
        let title = "";
        if (obstacle.includes("systems don't 'talk'")) {
            title = "Integrate Your Systems";
            recommendation = "Our team specializes in system integration. We will connect your disparate software tools to create a seamless flow of data across your business.";
        } else if (obstacle.includes("don't have the internal technical expertise")) {
            title = "Leverage Our Expertise";
            recommendation = "We act as your dedicated AI and automation partner. Our team will handle all the technical implementation and management, so you don't need in-house expertise.";
        } else if (obstacle.includes("team is buried in 'busy work'")) {
            title = "Free Up Your Team";
            recommendation = "Our automation solutions are designed to lift the burden of 'busy work' from your team, freeing them up to focus on strategic initiatives and customer-facing activities.";
        } else if (obstacle.includes("tried other tools or agencies")) {
            title = "Get a Custom-Tailored Solution";
            recommendation = "We differentiate ourselves by building custom, fully-integrated solutions tailored to your specific workflow, rather than providing one-size-fits-all tools that often fail.";
        } else if (obstacle.includes("Lack of clarity on where AI fits")) {
            title = "Get a Strategic AI Roadmap";
            recommendation = "Our process begins with a deep-dive consultation to map your workflows and identify the highest-impact opportunities for AI, providing you with a clear, strategic implementation roadmap.";
        }
         if (recommendation) {
            plan.push({ title, description: recommendation });
        }
    }

    const aiImpact = answers[13] as string;
    if (aiImpact) {
        let recommendation = "";
        let title = "";
        if (aiImpact.includes("administrative tasks")) {
            title = "Automate Administrative Tasks";
            recommendation = "We can deploy AI agents to automate administrative tasks like data entry, scheduling, and generating reports, freeing up significant time for your team.";
        } else if (aiImpact.includes("nurturing our existing lead database")) {
            title = "Nurture Your Lead Database";
            recommendation = "We will implement an automated SMS and email nurturing campaign to re-engage your existing lead database, identifying new opportunities and driving repeat business.";
        } else if (aiImpact.includes("Replacing/Augmenting our front-line Sales")) {
            title = "Deploy a 24/7 AI Voice Agent";
            recommendation = "Our AI Voice Agents can handle front-line sales and support calls 24/7, qualifying leads, answering FAQs, and routing complex issues to your human team.";
        } else if (aiImpact.includes("end-to-end automated sales funnel")) {
            title = "Build an Automated Sales Funnel";
            recommendation = "We will design and build a fully automated sales funnel, from initial lead capture and qualification to appointment booking and follow-up, creating a hands-free customer acquisition machine.";
        }
        if (recommendation) {
            plan.push({ title, description: recommendation });
        }
    }

    if (plan.length === 0) {
        plan.push({
            title: "Continue Your Success",
            description: "Your marketing and sales processes are already strong. We recommend exploring advanced automation strategies to further scale your success, such as predictive lead scoring and personalized customer journeys."
        });
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
                    <ul className="space-y-6">
                      {plan.map((item, index) => (
                        <li key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <p className="mt-1 text-muted-foreground">{item.description}</p>
                          </div>
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
