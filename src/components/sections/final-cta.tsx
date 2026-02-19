import { Button } from "../ui/button";

export default function FinalCta() {
    return (
        <section className="bg-accent text-accent-foreground py-20">
            <div className="container text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Take the faster path to growth. <br/> Get T3 Automations today.</h2>
                <p className="mt-4 text-lg">No software to install. No training required.</p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button size="lg">Book a call</Button>
                    <Button size="lg" variant="outline">Watch a demo</Button>
                </div>
            </div>
        </section>
    );
}
