import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function TrustedBy() {
    const testimonialImage = PlaceHolderImages.find((img) => img.id === 'testimonial-steven-forester');
    return (
        <section className="bg-secondary text-secondary-foreground py-20 md:py-28">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center">
                    T3 Automations is trusted by 5,000+ businesses
                </h2>
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
