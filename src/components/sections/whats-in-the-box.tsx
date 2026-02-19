import { Check } from 'lucide-react';

const features = [
    { name: "Lead qualification", price: "Free" },
    { name: "Marketing/CRM sync", price: "Free" },
    { name: "Call recording & transcription", price: "Free" },
    { name: "Spam blocking", price: "Free" },
    { name: "Custom knowledge base", price: "Free" },
    { name: "Call summary", price: "Free" },
    { name: "Business texting", price: "Free" },
    { name: "Voicemail", price: "Free" },
    { name: "Call blast", price: "Free" },
    { name: "Call forwarding", price: "Free" },
    { name: "Intelligent routing", price: "$20/mo" },
    { name: "Appointment booking", price: "$20/mo" },
    { name: "Custom dispositions", price: "$10/mo" },
    { name: "Advanced reporting", price: "$30/mo" },
    { name: "HIPAA-compliance", price: "$50/mo" },
    { name: "API access", price: "$50/mo" },
];

export default function WhatsInTheBox() {
  return (
    <section className="bg-secondary text-secondary-foreground py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What's in the box?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Over 20,000 words & phrases, we included:
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          {features.map((feature) => (
            <div key={feature.name} className="flex justify-between border-b border-gray-300 py-2">
                <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature.name}</span>
                </div>
                <span className={`font-semibold ${feature.price.toLowerCase() === 'free' ? 'text-primary' : ''}`}>{feature.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
