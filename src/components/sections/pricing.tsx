import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ban, Check } from 'lucide-react';
import Link from 'next/link';
import TranslatedText from '../TranslatedText';

const PlanFeature = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <Check className="h-4 w-4 text-primary flex-shrink-0" />
    <span className="text-muted-foreground text-xs">{children}</span>
  </div>
);

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <TranslatedText>Business Automation Starter Package</TranslatedText>
          </h2>
          <p className="mt-4 text-sm text-primary">
            <TranslatedText>All tiers include $0.25/min usage charges • Phone Numbers are $3.00/ea • First month due upon signing up</TranslatedText>
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-8">
          <div className="text-center space-y-4">
            <div>
              <span className="text-6xl font-extrabold text-foreground">$1,499</span>
              <span className="text-2xl font-medium text-muted-foreground">/mo</span>
            </div>
            <p className="text-muted-foreground">+ $.025/min</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-primary" />
                <span><TranslatedText>No Setup Fee</TranslatedText></span>
              </div>
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-primary" />
                <span><TranslatedText>No Contract</TranslatedText></span>
              </div>
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-primary" />
                <span><TranslatedText>No Hidden Costs</TranslatedText></span>
              </div>
            </div>
            <Link href="/contact">
              <Button size="lg" className="rounded-full sm:px-32 py-3 font-bold my-5 mx-2.5 sm:w-auto w-[calc(100%-20px)]"><TranslatedText>Get Started</TranslatedText></Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
            <Card className="bg-card flex flex-col p-6 border-white border-2">
              <CardHeader className="p-0 text-center">
                <CardTitle className="text-lg"><TranslatedText>6-MONTH COMMITMENT</TranslatedText></CardTitle>
                <CardDescription className="text-primary font-semibold"><TranslatedText>Paid upfront</TranslatedText></CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6 p-0 mt-6">
                <div className="text-center">
                  <span className="text-4xl font-bold">$1,299</span>
                  <span className="text-xl text-muted-foreground">/mo</span>
                  <span className="ml-2 text-muted-foreground line-through"><TranslatedText>was</TranslatedText> $1,499/mo</span>
                </div>
                <div className="flex flex-col md:flex-row justify-around items-start md:items-center gap-4">
                  <PlanFeature><TranslatedText>Save $200 per month</TranslatedText></PlanFeature>
                  <PlanFeature><TranslatedText>Total savings: $1,200</TranslatedText></PlanFeature>
                  <PlanFeature><TranslatedText>2-year price lock</TranslatedText></PlanFeature>
                </div>
              </CardContent>
              <div className="mt-6 flex justify-center">
                <Badge variant="default" className="rounded-md px-4 py-2 text-sm bg-primary hover:bg-primary/90"><TranslatedText>Save - 13%</TranslatedText></Badge>
              </div>
            </Card>

            <Card className="bg-card border-primary flex flex-col p-6 border-2">
              <CardHeader className="p-0 text-center">
                <CardTitle className="text-lg"><TranslatedText>12-MONTH COMMITMENT</TranslatedText></CardTitle>
                <CardDescription className="text-primary font-semibold"><TranslatedText>Paid upfront</TranslatedText></CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6 p-0 mt-6">
                <div className="text-center">
                  <span className="text-4xl font-bold">$999</span>
                  <span className="text-xl text-muted-foreground">/mo</span>
                  <span className="ml-2 text-muted-foreground line-through"><TranslatedText>was</TranslatedText> $1,499/mo</span>
                </div>
                <div className="flex flex-col md:flex-row justify-around items-start md:items-center gap-4">
                  <PlanFeature><TranslatedText>Save $500 per month</TranslatedText></PlanFeature>
                  <PlanFeature><TranslatedText>Total savings: $6,000</TranslatedText></PlanFeature>
                  <PlanFeature><TranslatedText>5-year price lock</TranslatedText></PlanFeature>
                </div>
              </CardContent>
              <div className="mt-6 flex justify-center">
                <Badge variant="default" className="rounded-md px-4 py-2 text-sm bg-primary hover:bg-primary/90"><TranslatedText>Best Value - 33% off</TranslatedText></Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
