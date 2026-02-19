import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
  const faqs = [
    {
      question: "Do you count SPAM calls towards my quota?",
      answer: (
        <>
          Every call answered by your AI Receptionist counts toward your call quota by default. Smith.ai offers AI Receptionist customers an allowance to remove up to 10% of their calls from their bill each billing cycle to account for selected spam calls. Calls from 20 million+ known spammers are automatically filtered out by our system before your AI Receptionist answers, and these calls do not count toward your quota. You can learn more about this <a href="#" className="text-primary underline">here</a>.
        </>
      )
    },
    {
      question: "How do you determine if calls are SPAM?",
      answer: "With technology! Our system automatically blocks over 20 million spam and robocalls from ever getting through. If a new spam number does get through, you can mark it as spam to automatically block the caller and add it to your spam list, so it can’t get through ever again."
    },
    {
      question: "Do I have to sign a contract?",
      answer: "We offer flexible month-to-month plans, but you can receive a significant discount by signing a 6 or 12-month contract. You can cancel your monthly plan at any time."
    },
    {
        question: "How is it billed?",
        answer: "We offer flexible monthly and annual plans. You'll be billed at the beginning of each cycle. We also have usage-based pricing for additional features and talk time."
    }
  ];

  export default function Faq() {
    return (
      <section className="bg-secondary text-secondary-foreground py-20 md:py-28">
        <div className="container">
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
