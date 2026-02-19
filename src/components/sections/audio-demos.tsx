import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const demos = [
  { title: 'Solar', src: 'https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FAI%20Voice%20Agent%20-%20Solar%20Demo.wav?alt=media&token=a7d7be31-efd3-4e0e-b98d-b6648a1b67f0', type: 'audio/wav' },
  { title: 'Kitchens & Baths', src: 'https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FAI%20Voice%20Agent%20-%20Kitchen%20%26%20Bath%20Demo.wav?alt=media&token=0a6b5d1b-bfec-4a92-9f4e-65bb5fcf43ba', type: 'audio/wav' },
  { title: 'Flooring', src: 'https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FAI%20Voice%20Agent%20-%20Flooring%20Demo.wav?alt=media&token=98b22a05-fec7-4911-926f-849f5922677f', type: 'audio/wav' },
  { title: 'Carpet Cleaning', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', type: 'audio/mpeg' },
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
                  <source src={demo.src} type={demo.type} />
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
