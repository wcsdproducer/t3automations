import AnsweringService from '@/components/sections/answering-service';
import AppointmentScheduling from '@/components/sections/appointment-scheduling';
import Features from '@/components/sections/features';
import Footer from '@/components/sections/footer';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import HowItWorks from '@/components/sections/how-it-works';
import Pricing from '@/components/sections/pricing';
import Solutions from '@/components/sections/solutions';
import Testimonials from '@/components/sections/testimonials';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Solutions />
        <Features />
        <AnsweringService />
        <HowItWorks />
        <Testimonials />
        <AppointmentScheduling />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
