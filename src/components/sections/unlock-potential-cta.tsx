import { Button } from "../ui/button";
import Link from "next/link";

export default function UnlockPotentialCta() {
    return (
        <section className="bg-[#81ADBB] py-20">
            <div className="container text-center text-[#F5F0E7]">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Unlock Your Potential</h2>
                <p className="mt-4 text-lg">Transform Your Business with Our AI Solutions</p>
                <div className="mt-8 flex justify-center">
                    <Link href="/signup">
                        <Button variant="outline" size="lg" className="bg-transparent border-2 border-[#F5F0E7] text-[#F5F0E7] hover:bg-[#F5F0E7] hover:text-[#81ADBB] transition-colors duration-300">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
