import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const steps = [
  {
    step: 1,
    title: 'NEW LEAD CALLS',
    description: 'Prospect initiates call after discovery through marketing channels.',
    imageId: 'how-it-works-1',
  },
  {
    step: 2,
    title: 'AI VOICE ASSISTANT QUALIFIES',
    description: 'Intelligent dialogue assesses lead against pre-defined criteria & scoring.',
    imageId: 'how-it-works-2',
  },
  {
    step: 3,
    title: 'AI VIEWS AVAILABILITY & BOOKS',
    description: 'AI accesses real-time calendar, identifies open slots, and schedules appointment instantly.',
    imageId: 'how-it-works-3',
  },
];

const Arrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground hidden lg:block">
    <path d="M14.43 5.92999L20.5 12L14.43 18.07" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.5 12H20.33" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI VOICE AGENT: STREAMLINED LEAD CAPTURE & SCHEDULING
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            AUTOMATING THE PATH FROM INTEREST TO APPOINTMENT
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-4 relative">
          <div className="hidden lg:flex justify-around items-center absolute w-full top-1/2 -translate-y-1/2 left-0 right-0" style={{ zIndex: 1, top: '40%' }}>
            <div className="w-1/3"></div>
            <Arrow />
            <div className="w-1/3"></div>
            <Arrow />
            <div className="w-1/3"></div>
          </div>
          {steps.map((step) => {
            const stepImage = PlaceHolderImages.find((img) => img.id === step.imageId);
            return (
              <div key={step.step} className="relative z-10 flex flex-col items-center text-center p-6 bg-card rounded-xl border-gray-200 border">
                 <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gray-700 text-white shadow-lg">
                        <div className="flex flex-col items-center">
                        <span className="text-xs font-bold">STEP</span>
                        <span className="text-3xl font-bold">{step.step}</span>
                        </div>
                    </div>
                </div>
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                {stepImage && (
                  <div className="my-6">
                    <Image
                      src={stepImage.imageUrl}
                      alt={step.title}
                      data-ai-hint={stepImage.imageHint}
                      width={200}
                      height={150}
                      className="object-contain h-40"
                    />
                  </div>
                )}
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
            <div className="inline-block bg-gray-100 rounded-lg px-8 py-4">
                <p className="text-lg font-semibold text-gray-700 tracking-wide">
                EFFICIENCY. ACCURACY. 24/7 AVAILABILITY. SCALABLE GROWTH.
                </p>
            </div>
        </div>
      </div>
    </section>
  );
}
