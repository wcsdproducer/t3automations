import type { Metadata } from 'next';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Pricing from '@/components/sections/pricing';

export const metadata: Metadata = {
    title: 'Business Automation Starter Package | T3 Automations',
    description: 'Pricing that scales with your success. Choose the plan that fits your business needs.',
};

export default function BusinessAutomationStarterPackagePage() {
  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1 pt-20">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
