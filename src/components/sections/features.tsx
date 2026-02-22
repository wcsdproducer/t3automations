import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, CheckCircle, Calendar, Clock, Users, Star } from 'lucide-react';
import TranslatedText from '../TranslatedText';

const benefits = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Instant Response',
    description: 'Our AI agents are trained to respond to your leads in seconds, not minutes.',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Never Miss A Lead',
    description: 'With 24/7/365 availability, we ensure every potential customer is greeted and qualified.',
  },
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: 'Automated Appointment Booking',
    description: 'Qualified leads can book directly on your calendar without you lifting a finger.',
  },
  {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: '24/7/365 Availability',
    description: 'Our service never sleeps, providing constant coverage for your business.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Seamless CRM Integration',
    description: 'Automatically sync lead data with your existing CRM for streamlined workflow.',
  },
  {
    icon: <Star className="h-8 w-8 text-primary" />,
    title: 'Custom-Trained For You',
    description: 'We train our agents on the specifics of your business for a personalized experience.',
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="bg-[#F5F0E7] py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
           <p className="text-primary font-semibold uppercase tracking-wider"><TranslatedText>How we help</TranslatedText></p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-secondary-foreground sm:text-4xl">
            <TranslatedText>Discover the Benefits of Automation</TranslatedText>
          </h2>
          <p className="mt-4 text-lg text-secondary-foreground/80">
            <TranslatedText>Stop losing customers to your competition. We've got you covered.</TranslatedText>
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="bg-card text-card-foreground border-none shadow-lg">
              <CardHeader>
                <div className="flex items-start gap-4">
                    {benefit.icon}
                    <CardTitle><TranslatedText>{benefit.title}</TranslatedText></CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground"><TranslatedText>{benefit.description}</TranslatedText></p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
