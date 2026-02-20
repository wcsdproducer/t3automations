'use client';

import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const adExamples = [
  {
    title: 'Ad Example 1: Summer Sale',
    description: 'A 15-second ad for our summer promotion.',
    videoSrc: 'https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FIntegrity%20Cleaning%20Ad%201.mov?alt=media&token=a8b3a74f-2757-43fa-812d-cc7b89d2f198'
  },
  {
    title: 'Ad Example 2: New Product Launch',
    description: 'Highlighting the features of our latest product.',
  },
  {
    title: 'Ad Example 3: Customer Testimonial',
    description: 'A short clip featuring a happy customer.',
  },
  {
    title: 'Ad Example 4: Brand Story',
    description: 'Telling the story behind our brand.',
  },
];

export default function MarketingAdsPage() {
  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1 pt-20 flex flex-col">
        <section className="py-12 flex-grow flex flex-col px-4 sm:px-0">
          <div className="container">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">AI-Powered Marketing Ads</h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                We create 4 custom, high-impact video ads for you every month, optimized for platforms like Facebook and Instagram.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {adExamples.map((ad, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{ad.title}</CardTitle>
                    <CardDescription>{ad.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      {ad.videoSrc ? (
                        <video controls className="w-full h-full rounded-md object-cover">
                          <source src={ad.videoSrc} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <p className="text-muted-foreground">Video Placeholder</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
