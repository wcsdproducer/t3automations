import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const demos = [
  { title: 'Solar', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'Kitchens & Baths', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { title: 'Flooring', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { title: 'Carpet Cleaning', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
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
              <CardContent className="pt-4">
                <audio controls className="w-full">
                  <source src={demo.src} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
