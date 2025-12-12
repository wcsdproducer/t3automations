import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Gem, Rocket } from 'lucide-react';

const pricingData = [
  {
    title: 'Launch',
    tag: 'Quick Start',
    tagIcon: <Rocket className="h-4 w-4 mr-2" />,
    price: '$399',
    setupFee: '$0',
    originalSetupFee: '$199',
    period: '/mo',
    rate: '+ $0.65/min',
    description: 'Month-to-month only',
    features: [
      'Makes outbound calls',
      'Initial sales intake',
      'Responds to questions',
      'Forwards contact details',
      'Voice & personality customization',
    ],
    buttonText: 'Get Started',
    variant: 'default' as 'default' | 'primary' | 'secondary',
  },
  {
    title: 'Pro',
    tag: 'Most Popular',
    tagIcon: <Star className="h-4 w-4 mr-2" />,
    price: '$1,499',
    setupFee: '$0',
    originalSetupFee: '$1,000',
    period: '/mo',
    rate: '+ $0.65/min',
    description: '',
    features: [
      'SMS + Email follow-up',
      'Client Dashboard Login',
      'Call transfer options',
      'CRM Integration',
      'Appointment Scheduling',
      'Slack channel support',
    ],
    commitmentSavings: [
      {
        term: '6-Month Commitment',
        price: '$1,299/mo',
        savings: 'Save $200 per month (Total: $1,200)',
      },
      {
        term: '12-Month Commitment',
        price: '$999/mo',
        savings: 'Save $500 per month (Total: $6,000)',
        bestValue: true,
      },
    ],
    allProFeatures: true,
    buttonText: 'Get Started',
    variant: 'primary' as 'default' | 'primary' | 'secondary',
  },
  {
    title: 'Pro Saver',
    tag: 'Lower Monthly',
    tagIcon: <Gem className="h-4 w-4 mr-2" />,
    price: '$499',
    setupFee: '$5,000',
    period: '/mo',
    rate: '+ $0.65/min',
    description: '',
    features: [
        'SMS + Email follow-up',
        'Client Dashboard Login',
        'Call transfer options',
        'CRM Integration',
        'Appointment Scheduling',
        'Slack channel support',
    ],
    commitmentSavings: [
        {
          term: '6-Month Commitment',
          price: '$499/mo',
          savings: 'Setup fee: $4,500 (Save $500)',
        },
        {
          term: '12-Month Commitment',
          price: '$499/mo',
          savings: 'Setup fee: $3,800 (Save $1,200)',
          bestValue: true,
        },
      ],
    allProFeatures: true,
    buttonText: 'Get Started',
    variant: 'secondary' as 'default' | 'primary' | 'secondary',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-card">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Flexible Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose a plan that scales with your business.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {pricingData.map((plan) => (
            <Card
              key={plan.title}
              className={`relative flex flex-col ${plan.variant === 'primary' ? 'border-primary border-2 shadow-2xl scale-105' : ''} ${plan.variant === 'secondary' ? 'border-purple-500' : ''}`}
            >
              <CardHeader className="items-center">
                <Badge
                  className={`flex items-center ${
                    plan.variant === 'primary' ? 'bg-primary text-primary-foreground' : plan.variant === 'secondary' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {plan.tagIcon} {plan.tag}
                </Badge>
                <CardTitle className="mt-4 text-3xl font-bold">{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6">
                <div className="text-center">
                    {plan.originalSetupFee && <p className="text-sm text-muted-foreground line-through">{plan.originalSetupFee} Setup Fee</p>}
                    <p className="text-4xl font-extrabold">{plan.setupFee} <span className="text-2xl font-medium text-muted-foreground">Setup Fee</span></p>
                    <p className="mt-2 text-5xl font-extrabold">{plan.price}<span className="text-xl font-medium text-muted-foreground">{plan.period}</span></p>
                    <p className="text-sm text-muted-foreground">{plan.rate}</p>
                </div>

                <div className="w-full h-px bg-border my-6"></div>

                {plan.commitmentSavings && (
                  <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                    <h4 className="text-center font-semibold">Commitment Savings:</h4>
                    {plan.commitmentSavings.map((saving) => (
                      <div key={saving.term} className={`relative rounded-md border p-3 ${saving.bestValue ? (plan.variant === 'secondary' ? 'border-purple-500' : 'border-green-500') : 'border-border'}`}>
                        {saving.bestValue && <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs ${plan.variant === 'secondary' ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'}`}><Star className="h-3 w-3 mr-1"/> Best Value</Badge>}
                        <p className="font-semibold">{saving.term}: {saving.price}</p>
                        <p className="text-sm text-muted-foreground">{saving.savings}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold">{plan.allProFeatures ? 'All Pro Features:' : 'Core Features:'}</h4>
                  <ul className="mt-4 space-y-3">
                    {plan.allProFeatures && (
                        <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>All Core Features</span>
                      </li>
                    )}
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button className={`w-full ${plan.variant === 'primary' ? 'bg-primary hover:bg-primary/90' : plan.variant === 'secondary' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}>
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
