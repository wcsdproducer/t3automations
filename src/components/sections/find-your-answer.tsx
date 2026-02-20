import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

const checklistItems = [
  'Takes 3 minutes',
  'Completely Free',
  'Immediate Recommendations',
];

export default function FindYourAnswer() {
  return (
    <section className="bg-[#F5F0E7] text-secondary-foreground py-12 md:py-20">
      <div className="container mx-auto flex justify-center">
        <div className="flex flex-col items-center gap-6">
          <Link href="/assessment">
            <Button size="lg" className="h-auto px-6 py-3 md:px-8 md:py-4 text-lg md:text-xl font-bold rounded-lg">
              Start Your Assessment
            </Button>
          </Link>
          <div className="flex flex-col gap-3">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-6 w-6 text-primary" />
                <span className="font-medium text-base md:text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
