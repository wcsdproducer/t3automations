import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Calendar, Headset, PhoneForwarded } from 'lucide-react';

const solutions = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'Lead Qualification Agent',
    description:
      'Automatically qualifies inbound leads, asks screening questions, and routes high-intent prospects to your sales team.',
  },
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: 'Appointment Booking Agent',
    description:
      'Integrates with calendars to autonomously schedule, reschedule, and confirm appointments with clients and leads.',
  },
  {
    icon: <Headset className="h-8 w-8 text-primary" />,
    title: 'Customer Support Agent',
    description:
      'Provides 24/7 first-line customer support, answers FAQs, and resolves common issues to improve satisfaction.',
  },
  {
    icon: <PhoneForwarded className="h-8 w-8 text-primary" />,
    title: 'Proactive Outreach Agent',
    description:
      'Executes outbound calling campaigns for customer feedback, promotions, or re-engagement initiatives.',
  },
];

export default function Solutions() {
  return (
    <section id="solutions" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI Solutions for Every Business Need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Deploy specialized AI agents to automate and enhance your business operations.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {solutions.map((solution) => (
            <Card key={solution.title} className="transform border-0 bg-transparent shadow-none transition-transform duration-300 hover:scale-105">
              <CardHeader className="items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {solution.icon}
                </div>
                <CardTitle className="mt-4">{solution.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>{solution.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
