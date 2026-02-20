import { Button } from "../ui/button";
import Link from "next/link";

export default function FinalCta() {
    return (
        <section className="bg-[#81ADBB] text-[#F5F0E7] py-20">
            <div className="container text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Take the faster path to growth. <br/> Get T3 Automations today.</h2>
                <p className="mt-4 text-lg">No software to install. No training required.</p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link href="/contact" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-48">Book a call</Button>
                    </Link>
                    <Button size="lg" variant="outline" className="bg-transparent border-2 border-[#F5F0E7] text-[#F5F0E7] hover:bg-[#F5F0E7] hover:text-[#81ADBB] transition-colors duration-300 w-full sm:w-48">Watch a demo</Button>
                </div>
            </div>
        </section>
    );
}
