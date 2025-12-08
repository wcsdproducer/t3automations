import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, CalendarDays, Filter, Mail, PhoneForwarded, Smile } from 'lucide-react';

const features = [
  {
    icon: <PhoneForwarded className="h-8 w-8 text-primary" />,
    title: 'Answering Service',
    description: 'AI-driven call answering to intelligently triage and route calls based on pre-defined rules and caller intent.',
  },
  {
    icon: <Filter className="h-8 w-8 text-primary" />,
    title: 'Custom Instructions',
    description: 'Our team listens to the unique needs of your business and you have total control 24/7.',
  },
  {
    icon: <CalendarDays className="h-8 w-8 text-primary" />,
    title: 'Top-Notch Support',
    description: 'Our client and support teams are mostly based in the US so they\'re experts on all small and mid-sized businesses.',
  },
  {
    icon: <Mail className="h-8 w-8 text-primary" />,
    title: 'Message Taking',
    description: 'Record detailed messages and deliver them via email or SMS to the appropriate personnel.',
  },
  {
    icon: <Smile className="h-8 w-8 text-primary" />,
    title: 'Customizable Greetings',
    description: 'Create and update custom greetings to align with your brand voice and for specific scenarios.',
  },
  {
    icon: <AreaChart className="h-8 w-8 text-primary" />,
    title: 'Analytics Dashboard',
    description: 'Track call volumes, lead quality, and other key metrics to evaluate the effectiveness of the service.',
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-card py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
           <div className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">How we compare</div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why growing businesses choose Smith.ai
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We don't just answer calls. We deliver results.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="transform border-0 bg-transparent shadow-none transition-transform duration-300 hover:scale-105">
              <CardHeader className="items-center text-center">
                {feature.icon}
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription className="mt-2">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
