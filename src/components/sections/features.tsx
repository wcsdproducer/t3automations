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
    title: 'Lead Qualification',
    description: 'Evaluate leads based on defined criteria, forwarding qualified leads to sales and filtering out unqualified ones.',
  },
  {
    icon: <CalendarDays className="h-8 w-8 text-primary" />,
    title: 'Appointment Scheduling',
    description: 'Automate scheduling by integrating with calendars, allowing callers to book appointments directly.',
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
    <section id="features" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need, All In One Place
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our AI-powered platform provides a comprehensive suite of tools to manage your communications efficiently.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader>
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
