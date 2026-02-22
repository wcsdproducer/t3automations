import { Button } from "../ui/button";
import Link from "next/link";
import TranslatedText from "../TranslatedText";

export default function FinalCta() {
    return (
        <section className="bg-[#81ADBB] text-[#F5F0E7] py-20">
            <div className="container text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl"><TranslatedText>Take the faster path to growth. </TranslatedText><br/><TranslatedText> Get T3 Automations today.</TranslatedText></h2>
                <p className="mt-4 text-lg"><TranslatedText>No software to install. No training required.</TranslatedText></p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link href="/contact" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-48"><TranslatedText>Book a call</TranslatedText></Button>
                    </Link>
                    <Button size="lg" variant="outline" className="bg-transparent border-2 border-[#F5F0E7] text-[#F5F0E7] hover:bg-[#F5F0E7] hover:text-[#81ADBB] transition-colors duration-300 w-full sm:w-48"><TranslatedText>Watch a demo</TranslatedText></Button>
                </div>
            </div>
        </section>
    );
}
