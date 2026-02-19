import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function TrustedBy() {
    const testimonialImage = PlaceHolderImages.find((img) => img.id === 'testimonial-1');
    return (
        <section className="bg-secondary text-secondary-foreground py-20 md:py-28">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    T3 Automations is trusted by 5,000+ businesses
                </h2>
                <div className="mt-8 flex justify-center gap-4">
                    <Button variant="link" className="text-primary">G2</Button>
                    <Button variant="link" className="text-primary">Capterra</Button>
                    <Button variant="link" className="text-primary">Google Reviews</Button>
                    <Button variant="link" className="text-primary">Clutch</Button>
                </div>
                <div className="mt-12 max-w-3xl mx-auto bg-card text-card-foreground p-8 rounded-lg shadow-lg">
                    <p className="text-5xl font-bold text-primary">“</p>
                    <p className="text-2xl font-semibold italic">Converts callers into clients</p>
                    <p className="mt-4 text-muted-foreground">T3 Automations allows our law firm to be responsive in a way we could never be on our own. Our potential new clients are able to immediately speak with a professional and we have a much higher conversion rate as a result.</p>
                    <div className="mt-6 flex items-center justify-center gap-4">
                        {testimonialImage && (
                            <Image
                            src={testimonialImage.imageUrl}
                            alt="Wayne R."
                            data-ai-hint="person"
                            width={56}
                            height={56}
                            className="rounded-full"
                            />
                        )}
                         <div>
                            <p className="font-semibold">Wayne R.</p>
                            <p className="text-sm text-muted-foreground">The R. Law Firm</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}