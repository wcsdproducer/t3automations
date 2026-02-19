import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pricing that scales with your success
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that's right for your business needs.
          </p>
        </div>
        <div className="mt-16 flex flex-col items-center gap-8">
            <div className="text-center">
                <p className="text-6xl font-extrabold text-primary">$1,499<span className="text-2xl font-medium text-muted-foreground">/mo</span></p>
                <p className="text-muted-foreground">Plus usage-based pricing on additional talk time and messages.</p>
                <Button size="lg" className="mt-6">Get Started</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle>6-Month Commitment</CardTitle>
                        <CardDescription>$1,299/mo + usage fees</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Select Plan</Button>
                    </CardFooter>
                </Card>
                <Card className="bg-card border-primary">
                    <CardHeader>
                        <CardTitle>12-Month Commitment</CardTitle>
                        <CardDescription>$999/mo + usage fees</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full">Best Value - Select Plan</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </section>
  );
}
