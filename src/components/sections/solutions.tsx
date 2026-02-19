import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, MessageSquare, PhoneForwarded } from 'lucide-react';

const aiTypes = [
  {
    icon: <Filter className="h-8 w-8 text-primary" />,
    title: 'Lead Qualification Agent',
    description:
      'Automatically qualifies inbound leads, asks screening questions, and routes high-intent prospects to your sales team.',
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: 'Appointment Booking Agent',
    description:
      'Integrates with calendars to autonomously schedule, reschedule, and confirm appointments with clients and leads.',
  },
  {
    icon: <PhoneForwarded className="h-8 w-8 text-primary" />,
    title: 'Proactive Outreach Agent',
    description:
      'Executes outbound calling campaigns for customer feedback, promotions, or re-engagement initiatives.',
  },
];

export default function AiTypes() {
  return (
    <section id="ai-types" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-primary font-semibold uppercase tracking-wider">Our Technology</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Types of AI Voice Assistants
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Deploy specialized AI agents to automate and enhance your business operations.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {aiTypes.map((solution) => (
            <Card key={solution.title} className="bg-card text-center">
              <CardHeader className="items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {solution.icon}
                </div>
                <CardTitle className="mt-4">{solution.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>{solution.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
