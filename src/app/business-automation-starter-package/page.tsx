import type { Metadata } from 'next';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Pricing from '@/components/sections/pricing';
import WhatsInTheBox from '@/components/sections/whats-in-the-box';

export const metadata: Metadata = {
    title: 'Business Automation Starter Package | T3 Automations',
    description: 'Business Automation Starter Package',
};

export default function BusinessAutomationStarterPackagePage() {
  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1">
        <Pricing />
        <WhatsInTheBox />
      </main>
      <Footer />
    </div>
  );
}
