import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ban, Check } from 'lucide-react';

const PlanFeature = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <Check className="h-4 w-4 text-primary" />
    <span className="text-muted-foreground text-xs whitespace-nowrap">{children}</span>
  </div>
);

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pricing that scales with your success
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your business needs
          </p>
          <p className="mt-4 text-sm text-primary">
            All tiers include $0.25/min usage charges • Phone Numbers are $3.00/ea • First month due upon signing up
          </p>
        </div>

        <div className="mt-16 flex flex-col items-center gap-16">
          <div className="text-center space-y-4">
            <div>
              <span className="text-6xl font-extrabold text-foreground">$1,499</span>
              <span className="text-2xl font-medium text-muted-foreground">/mo</span>
            </div>
            <p className="text-muted-foreground">+ $.025/min</p>
            <div className="flex justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-primary" />
                <span>No Setup Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-primary" />
                <span>No Contract</span>
              </div>
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-primary" />
                <span>No Hidden Costs</span>
              </div>
            </div>
            <Button size="lg" className="rounded-full px-48 py-3 font-bold mt-8 mb-[136px]">Get Started</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
            <Card className="bg-card flex flex-col p-6 border-white border-2">
              <CardHeader className="p-0 text-center">
                <CardTitle className="text-lg">6-MONTH COMMITMENT</CardTitle>
                <CardDescription className="text-primary font-semibold">Paid upfront</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6 p-0 mt-6">
                <div className="text-center">
                  <span className="text-4xl font-bold">$1,299</span>
                  <span className="text-xl text-muted-foreground">/mo</span>
                  <span className="ml-2 text-muted-foreground line-through">was $1,499/mo</span>
                </div>
                <div className="flex justify-around items-center gap-4">
                  <PlanFeature>Save $200 per month</PlanFeature>
                  <PlanFeature>Total savings: $1,200</PlanFeature>
                  <PlanFeature>2-year price lock</PlanFeature>
                </div>
              </CardContent>
              <div className="mt-6 flex justify-center">
                <Badge variant="default" className="rounded-md px-4 py-2 text-sm bg-primary hover:bg-primary/90">Save - 13%</Badge>
              </div>
            </Card>

            <Card className="bg-card border-primary flex flex-col p-6 border-2">
              <CardHeader className="p-0 text-center">
                <CardTitle className="text-lg">12-MONTH COMMITMENT</CardTitle>
                <CardDescription className="text-primary font-semibold">Paid upfront</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6 p-0 mt-6">
                <div className="text-center">
                  <span className="text-4xl font-bold">$999</span>
                  <span className="text-xl text-muted-foreground">/mo</span>
                  <span className="ml-2 text-muted-foreground line-through">was $1,499/mo</span>
                </div>
                <div className="flex justify-around items-center gap-4">
                  <PlanFeature>Save $500 per month</PlanFeature>
                  <PlanFeature>Total savings: $6,000</PlanFeature>
                  <PlanFeature>5-year price lock</PlanFeature>
                </div>
              </CardContent>
              <div className="mt-6 flex justify-center">
                <Badge variant="default" className="rounded-md px-4 py-2 text-sm bg-primary hover:bg-primary/90">Best Value - 33% off</Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
