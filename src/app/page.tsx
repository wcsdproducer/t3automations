import AnalyticsDashboard from '@/components/sections/analytics-dashboard';
import AnsweringService from '@/components/sections/answering-service';
import AppointmentScheduling from '@/components/sections/appointment-scheduling';
import Features from '@/components/sections/features';
import Footer from '@/components/sections/footer';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import LeadQualification from '@/components/sections/lead-qualification';
import MessageAndGreetings from '@/components/sections/message-and-greetings';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <AnsweringService />
        <LeadQualification />
        <div className="py-12 md:py-20">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <AnalyticsDashboard />
              <AppointmentScheduling />
            </div>
          </div>
        </div>
        <MessageAndGreetings />
      </main>
      <Footer />
    </div>
  );
}
