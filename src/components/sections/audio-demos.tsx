import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, MoreHorizontal } from 'lucide-react';

const demos = [
  { title: 'Solar', duration: '3:11' },
  { title: 'Kitchens & Baths', duration: '3:33' },
  { title: 'Flooring', duration: '2:02' },
  { title: 'Carpet Cleaning', duration: '3:52' },
];

export default function AudioDemos() {
  return (
    <section id="demos" className="bg-background py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
            <p className="text-primary font-semibold uppercase tracking-wider">A few of our agents</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The Most Powerful Receptionist Service
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            24/7 call answering and web chat for small businesses, powered by superior people and technology.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {demos.map((demo) => (
            <Card key={demo.title} className="bg-card">
              <CardHeader>
                <CardTitle>{demo.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-lg font-mono">0:00 / {demo.duration}</div>
                <div className="flex items-center gap-2">
                    <PlayCircle className="h-10 w-10 text-primary cursor-pointer hover:text-primary/80"/>
                    <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
