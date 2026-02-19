import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star } from 'lucide-react';

const ClutchLogo = () => (
    <svg width="64" height="20" viewBox="0 0 84 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground">
      <path d="M21.12 16.79c-1.32 1.32-3.08 2.03-4.84 2.03-1.76 0-3.52-.7-4.84-2.03-1.32-1.32-2.03-3.08-2.03-4.84s.7-3.52 2.03-4.84c1.32-1.32 3.08-2.03 4.84-2.03s3.52.7 4.84 2.03c1.32 1.32 2.03 3.08 2.03 4.84s-.7 3.52-2.03 4.84zM16.28 7.37c-1.21 0-2.32.47-3.15 1.3-.82.83-1.3 1.94-1.3 3.15s.47 2.32 1.3 3.15c.83.82 1.94 1.3 3.15 1.3s2.32-.47 3.15-1.3c.82-.83 1.3-1.94 1.3-3.15s-.47-2.32-1.3-3.15c-.83-.82-1.94-1.3-3.15-1.3z" fill="currentColor"/>
      <path d="M25.7 5.15h2.8v14.4h-2.8zM34.73 19.55h-3.4l-1.33-4.83h-3.32v4.83h-2.8V5.15h6.12c1.41 0 2.61.46 3.6 1.38 1 .92 1.5 2.14 1.5 3.67 0 1.38-.4 2.53-1.2 3.45-.8.92-1.87 1.48-3.2 1.68l1.62 4.22h.01zM31.21 7.42h-2.9v4.55h2.9c.77 0 1.4-.25 1.88-.76.48-.5.72-1.2.72-2.05 0-.8-.24-1.43-.72-1.9-.48-.48-1.11-.74-1.88-.74zM49.2 19.55l-2.04-6.3h-4.94l-2.04 6.3h-3l5.58-14.4h3.2l5.58 14.4H49.2zm-4.5-8.55h4.1l-2.05-6.12-2.05 6.12zM59.95 16.79c-1.32 1.32-3.08 2.03-4.84 2.03-1.76 0-3.52-.7-4.84-2.03-1.32-1.32-2.03-3.08-2.03-4.84s.7-3.52 2.03-4.84c1.32-1.32 3.08-2.03 4.84-2.03s3.52.7 4.84 2.03c1.32 1.32 2.03 3.08 2.03 4.84s-.7 3.52-2.03 4.84zM55.11 7.37c-1.21 0-2.32.47-3.15 1.3-.82.83-1.3 1.94-1.3 3.15s.47 2.32 1.3 3.15c.83.82 1.94 1.3 3.15 1.3s2.32-.47 3.15-1.3c.82-.83 1.3-1.94 1.3-3.15s-.47-2.32-1.3-3.15c-.83-.82-1.94-1.3-3.15-1.3zM69.05 5.15h2.8v11.8h4.6v2.6h-7.4V5.15z" fill="currentColor"/>
      <path d="M79.86 19.55V5.15h2.8v14.4h-2.8z" fill="currentColor"/>
    </svg>
  );
  
  const GoogleGLogo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.99 12.24c0-.82-.07-1.62-.21-2.39H12v4.51h5.6c-.24 1.45-1 2.7-2.18 3.56v2.96h3.8c2.22-2.04 3.5-5.15 3.5-8.64z" fill="#4285F4"/>
      <path d="M12 22c3.31 0 6.08-1.1 8.12-2.99l-3.8-2.96c-1.1.74-2.5.18-3.21-1.24H12v-4.51H4.07c.82 5.05 5.27 8.64 10.93 8.64z" fill="#34A853"/>
      <path d="M4.07 14.35c-.17-.52-.27-1.07-.27-1.64s.1-1.12.27-1.64V7.11H.27C.09 7.65 0 8.3 0 9v6c0 .7.09 1.35.27 1.89l3.8-2.54z" fill="#FBBC05"/>
      <path d="M12 4c1.79 0 3.39.63 4.65 1.84l3.41-3.41C18.08 1.1 15.31 0 12 0 6.34 0 1.89 3.59.07 8.64L3.87 11.6c.71-4.22 4.42-7.6 8.13-7.6z" fill="#EA4335"/>
    </svg>
  );
  
  const CapterraLogo = () => (
    <svg width="80" height="20" viewBox="0 0 100 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.2 24.1L0 15.6V9.4l13.2-8.5h6.4L6.4 15v.9l13.2 8.2h-6.4z" fill="#0084CE"/>
      <path d="M21.9 12.5c0-4.1 2.7-7.1 6.5-7.1 2.9 0 5 .8 6.5 2l-2.4 3.3c-1-1-2.4-1.5-4-1.5-2.2 0-3.7 1.6-3.7 4.3s1.5 4.3 3.7 4.3c1.6 0 3-.5 4-1.5l2.4 3.3c-1.5 1.3-3.6 2-6.5 2-3.8 0-6.5-3-6.5-7.1zM51.1 19.3V5.8h4.8v13.5h-4.8zM68.5 19.3l-2-2.7c-1.5 1.1-3.3 1.7-5.3 1.7-3.8 0-6.6-3-6.6-7.1 0-4.1 2.8-7.1 6.6-7.1 2 0 3.8.6 5.3 1.7l2-2.7C67.1 1.7 64.6 1 61.2 1c-6 0-11.2 4.5-11.2 11.5S55.2 24 61.2 24c3.4 0 5.9-1.7 7.3-3.7zM85.4 19.3l-2-2.7c-1.5 1.1-3.3 1.7-5.3 1.7-3.8 0-6.6-3-6.6-7.1 0-4.1 2.8-7.1 6.6-7.1 2 0 3.8.6 5.3 1.7l2-2.7c-1.4-2-3.9-2.7-7.3-2.7-6 0-11.2 4.5-11.2 11.5s5.2 11.5 11.2 11.5c3.4 0 5.9-1.7 7.3-3.7zM98.6 19.3l-4.5-6.9v6.9h-4.8V1h4.8v6.9l4.5-6.9h5.7L99 11.2l5.3 8.1h-5.7z" fill="#002C42"/>
    </svg>
  );
  
  const TrustpilotLogo = ({ className } : { className?: string}) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="currentColor"/>
    </svg>
  );
  
  
  const ReviewSource = ({ logo, name, rating }: { logo: React.ReactNode, name: string, rating: string }) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {logo}
        <span className="font-bold text-foreground">{name}</span>
        <span className="font-semibold">{rating}</span>
        <span className="hidden md:inline">stars</span>
      </div>
    );

export default function TrustedBy() {
    const testimonialImage = PlaceHolderImages.find((img) => img.id === 'testimonial-steven-forester');
    return (
        <section className="bg-secondary text-secondary-foreground py-20 md:py-28">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center">
                    T3 Automations is trusted by 5,000+ businesses
                </h2>
                <div className="mt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
                    <ReviewSource logo={<ClutchLogo />} name="" rating="4.8" />
                    <ReviewSource logo={<GoogleGLogo />} name="" rating="4.8" />
                    <ReviewSource logo={<CapterraLogo />} name="" rating="4.8" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrustpilotLogo className="text-green-500" />
                        <span className="font-bold text-foreground">Trustpilot</span>
                        <span className="font-semibold">4.8</span>
                        <span className="hidden md:inline">stars</span>
                    </div>
                </div>
                <div className="mt-16 relative pl-10 md:pl-16 max-w-4xl mx-auto">
                    <div className="absolute left-4 md:left-8 top-0 bottom-0 w-1 bg-primary rounded-full"></div>
                    <div className="text-6xl font-bold text-primary -ml-3">“</div>
                    <h3 className="text-2xl md:text-3xl font-bold mt-2">Converts callers into clients</h3>
                    <p className="mt-4 text-muted-foreground max-w-2xl">T3 Solutions is our inbound sales team. Having a trained and personable voice has transformed our ability to answer the phone and convert callers to clients.</p>
                    <div className="mt-6 flex items-center gap-4">
                        {testimonialImage && (
                            <Image
                            src={testimonialImage.imageUrl}
                            alt="Steven Forester"
                            data-ai-hint="man portrait"
                            width={56}
                            height={56}
                            className="rounded-full"
                            />
                        )}
                         <div>
                            <p className="font-semibold">Steven Forester</p>
                            <p className="text-sm text-muted-foreground">Owner, Vertical Solutions LLC</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
