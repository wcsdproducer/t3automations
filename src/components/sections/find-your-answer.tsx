import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const checklistItems = [
  'Never miss a lead',
  'Completely free',
  'Automation from our website',
];

export default function FindYourAnswer() {
  return (
    <section className="bg-secondary text-secondary-foreground py-20">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
        <Button className="h-24 px-8 text-lg">Find Your Answer!</Button>
        <div className="flex flex-col gap-2">
          {checklistItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
