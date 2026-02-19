import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
  const faqs = [
    {
      question: "Is the trial run of the AI Voice Assistant free?",
      answer: "Yes, the trial run is completely free. We want you to experience the full power of our AI without any commitment."
    },
    {
      question: "How long does it take to set up?",
      answer: "Setup is incredibly fast. We can typically get your AI Voice Assistant up and running within 24-48 hours after our initial consultation."
    },
    {
      question: "Can it integrate with my existing CRM?",
      answer: "Absolutely. Our AI Voice Assistant is designed to seamlessly integrate with most popular CRMs, ensuring a smooth workflow for your team."
    },
    {
        question: "How is it billed?",
        answer: "We offer flexible monthly and annual plans. You'll be billed at the beginning of each cycle. We also have usage-based pricing for additional features and talk time."
    }
  ];

  export default function Faq() {
    return (
      <section className="bg-secondary text-secondary-foreground py-20 md:py-28">
        <div className="container max-w-4xl">
          <div className="mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full mt-12">
            {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg font-semibold">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                    {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    )
  }
  