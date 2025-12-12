import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    step: 1,
    title: 'A New Lead Comes In',
    description: 'They click on an ad, submit a webform, or send you a request.',
  },
  {
    step: 2,
    title: 'AI Qualifies the Lead',
    description: 'Our AI answers their questions and qualifies the lead based on your criteria.',
  },
  {
    step: 3,
    title: 'AI Books the Appointment',
    description: 'Qualified prospects are scheduled directly on your team\'s calendar.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-gray-800 text-white">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            From first click to qualified meeting in 3 simple steps.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => {
            return (
              <Card key={step.step} className="bg-card text-card-foreground border-gray-700 flex flex-col">
                <CardHeader className="relative items-center text-center pt-12">
                  <div className="absolute -top-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {step.step}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow text-center">
                  <CardTitle className="text-lg font-semibold">{step.title}</CardTitle>
                  <CardDescription className="mt-2 text-gray-400">{step.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
