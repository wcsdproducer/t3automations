import React from 'react';
import { T3LogoText } from '../ui/logo';
import { CheckCircle } from 'lucide-react';

interface AssessmentPDFProps {
  score: number;
  yesNoQuestionsCount: number;
  getResultMessage: () => string;
  answers: Record<number, string | string[]>;
}

const AssessmentPDF: React.FC<AssessmentPDFProps> = ({ score, yesNoQuestionsCount, getResultMessage, answers }) => {
  const getPersonalizedPlan = () => {
    // This is a simplified example. A more complex logic could be implemented
    // based on specific answers.
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

  return (
    <div className="p-8 bg-white text-black font-sans" style={{ width: '210mm' }}>
      <div className="text-center mb-8">
        <T3LogoText className="text-primary text-3xl" />
        <h1 className="text-2xl font-bold mt-4">Your Custom Automation Plan</h1>
        <p className="text-muted-foreground">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="mb-8 p-6 bg-gray-100 rounded-lg">
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

      <div className="mt-12 pt-8 border-t border-gray-300 text-center">
        <p className="text-lg font-semibold">Ready to turn these insights into action?</p>
        <p className="mt-2">Schedule a free, no-obligation consultation with one of our automation experts.</p>
        
        <div className="mt-6">
          <p className="font-bold">T3 Automations</p>
          <p>Email: contact@t3automations.com</p>
          <p>Phone: (123) 456-7890</p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPDF;
