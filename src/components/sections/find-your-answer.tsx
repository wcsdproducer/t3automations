import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const checklistItems = [
  'Takes 3 minutes',
  'Completely Free',
  'Immediate Recommendations',
];

export default function FindYourAnswer() {
  return (
    <section className="bg-[#F5F0E7] text-secondary-foreground py-12">
      <div className="container mx-auto flex justify-center">
        <div className="flex flex-col items-center gap-6">
          <Button size="lg" className="h-auto px-8 py-4 text-xl font-bold rounded-lg">
            Start Your Assessment
          </Button>
          <div className="flex flex-col gap-3">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-6 w-6 text-primary" />
                <span className="font-medium text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
