'use client';

import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TranslatedText from '@/components/TranslatedText';

const adExamples = [
  {
    title: 'Integrity Cleaning & Restoration',
    description: 'A 10-second Meta Ad for an after-holiday promotion.',
    videoSrc: 'https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FIntegrity%20Cleaning%20Ad%201.mov?alt=media&token=a8b3a74f-2757-43fa-812d-cc7b89d2f198'
  },
  {
    title: 'Integrity Cleaning & Restoration',
    description: 'A 9-second Meta Ad for an after-holiday promotion.',
    videoSrc: 'https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FIntegrity%20Cleaning%20Ad%202.mov?alt=media&token=281adae5-5acd-465e-9415-a20889ea1916'
  },
  {
    title: 'Integrity Cleaning & Restoration',
    description: 'A 15-second Meta Ad for an after-holiday promotion.',
    videoSrc: 'https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FIntegrity%20Cleaning%20Ad%203.mov?alt=media&token=25d3d336-fa8e-41d1-a083-b4bf1ba69e3f'
  },
  {
    title: 'Integrity Cleaning & Restoration',
    description: 'A 24-second Meta Ad for remediation and restoration service.',
    videoSrc: 'https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FIntegrity%20Cleaning%20Ad%204.mov?alt=media&token=134b4dd2-d16a-4a41-8104-1cc6d3904520'
  },
  {
    title: 'Integrity Cleaning & Restoration',
    description: 'A 10-second Meta Ad for a carpet cleaning promotion.',
    videoSrc: 'https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FIntegrity%20Cleaning%20Ad%205.mov?alt=media&token=0453cfd1-b20e-425b-b0e5-5cbb4d522975'
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
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"><TranslatedText>AI-Powered Marketing Ads</TranslatedText></h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                <TranslatedText>We create 4 custom, high-impact video ads for you every month, optimized for platforms like Facebook and Instagram.</TranslatedText>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {adExamples.map((ad, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle><TranslatedText>{ad.title}</TranslatedText></CardTitle>
                    <CardDescription><TranslatedText>{ad.description}</TranslatedText></CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      {ad.videoSrc ? (
                        <video controls className="w-full h-full rounded-md object-cover">
                          <source src={ad.videoSrc} type="video/mp4" />
                          <TranslatedText>Your browser does not support the video tag.</TranslatedText>
                        </video>
                      ) : (
                        <p className="text-muted-foreground"><TranslatedText>Video Placeholder</TranslatedText></p>
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
