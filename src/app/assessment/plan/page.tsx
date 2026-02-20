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
  const answersParam = searchParams.get('answers');
  const answers: Record<number, string | string[]> = answersParam ? JSON.parse(answersParam) : {};

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
            title = "Strategy for Generating More Leads";
            recommendation = "To generate more leads, focus on a multi-channel approach. Consider using targeted online advertising and content marketing to attract your ideal customers.";
        } else if (situation.includes("struggling to follow up")) {
            title = "Strategy for Improving Lead Follow-Up";
            recommendation = "To improve lead follow-up, consider implementing an automated system to instantly engage new leads via SMS and email. This ensures no opportunity is missed.";
        } else if (situation.includes("overwhelmed by repetitive manual tasks")) {
            title = "Strategy for Automating Repetitive Tasks";
            recommendation = "To free up your team, identify and automate repetitive tasks such as data entry, lead qualification, and appointment scheduling. This will allow them to focus on high-value activities.";
        } else if (situation.includes("cost is too high")) {
            title = "Strategy for Reducing Customer Acquisition Cost";
            recommendation = "To reduce your customer acquisition cost, focus on optimizing your ad campaigns. Additionally, implement a lead nurturing system to maximize the value of every lead you generate.";
        } else if (situation.includes("ready to scale")) {
            title = "Strategy for Building Scalable Systems";
            recommendation = "To prepare your business for scale, build robust and automated systems for lead management and customer onboarding. This will help handle increased volume without needing to increase headcount.";
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
                title = "How to Recapture 'Lost' Revenue";
                recommendation = "Implement an automated lead follow-up sequence to re-engage and convert leads that have gone cold. This can help recapture lost revenue opportunities.";
            } else if (outcome.includes("Reduce operational overhead")) {
                title = "How to Reduce Operational Overhead";
                recommendation = "Map your current workflows to identify key areas for automation, like data entry and reporting. This can significantly reduce operational overhead.";
            } else if (outcome.includes("Launch a 24/7 AI-driven")) {
                title = "How to Launch a 24/7 AI-Driven System";
                recommendation = "Consider deploying a 24/7 AI-driven system to handle inbound calls, answer common questions, and qualify leads. This provides round-the-clock coverage.";
            } else if (outcome.includes("Scale our appointment volume")) {
                title = "How to Scale Appointment Volume";
                recommendation = "An automated appointment booking system that integrates with your team's calendars can allow leads to book meetings automatically, helping you scale appointment volume efficiently.";
            } else if (outcome.includes("Clean up our data")) {
                title = "How to Clean Up Data & Sync Systems";
                recommendation = "Set up integrations between your key systems (CRM, email, etc.) to create a single source of truth for your customer data. This ensures consistency and accuracy.";
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
            title = "How to Overcome System Integration Challenges";
            recommendation = "To solve this, focus on system integration. Connect your disparate software tools to create a seamless flow of data across your business. Tools like Zapier or Make can be a good starting point for this.";
        } else if (obstacle.includes("don't have the internal technical expertise")) {
            title = "How to Address a Lack of Technical Expertise";
            recommendation = "Since you lack internal technical expertise, consider upskilling your team with online courses, hiring a freelance automation expert, or partnering with a specialized agency. Start with simple, low-code automation tools to build confidence.";
        } else if (obstacle.includes("team is buried in 'busy work'")) {
            title = "How to Free Your Team from 'Busy Work'";
            recommendation = "The first step is to identify and prioritize the 'busy work' that can be automated. Start with small, high-impact tasks to demonstrate the value of automation and free up time for more strategic initiatives.";
        } else if (obstacle.includes("tried other tools or agencies")) {
            title = "How to Find the Right Solution After Past Failures";
            recommendation = "Past negative experiences can be discouraging. The key is to find the right-fit solution. Instead of one-size-fits-all tools, look for solutions that can be custom-tailored to your specific workflow for better results.";
        } else if (obstacle.includes("Lack of clarity on where AI fits")) {
            title = "How to Find the Right Place for AI in Your Business";
            recommendation = "To gain clarity, start by mapping your current business processes. Identify bottlenecks and repetitive tasks. This will help you pinpoint the highest-impact opportunities where AI and automation can be applied.";
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
            title = "Recommendation for Administrative Tasks";
            recommendation = "AI agents are excellent for automating administrative tasks like data entry, scheduling, and generating reports. Look into tools that can handle these functions to free up significant time for your team.";
        } else if (aiImpact.includes("nurturing our existing lead database")) {
            title = "Recommendation for Nurturing Leads";
            recommendation = "Implement an automated SMS and email nurturing campaign to re-engage your existing lead database. This is a powerful way to identify new opportunities and drive repeat business.";
        } else if (aiImpact.includes("Replacing/Augmenting our front-line Sales")) {
            title = "Recommendation for Front-line Sales/Support";
            recommendation = "AI Voice Agents can be used to handle front-line sales and support calls 24/7. They can qualify leads, answer FAQs, and route complex issues to your human team, ensuring you never miss a call.";
        } else if (aiImpact.includes("end-to-end automated sales funnel")) {
            title = "Recommendation for Building an Automated Sales Funnel";
            recommendation = "Building a fully automated sales funnel is a powerful goal. This involves integrating tools for lead capture, qualification, appointment booking, and follow-up to create a seamless customer acquisition process.";
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
