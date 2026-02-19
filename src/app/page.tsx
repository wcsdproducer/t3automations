import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import FindYourAnswer from '@/components/sections/find-your-answer';
import AudioDemos from '@/components/sections/audio-demos';
import Benefits from '@/components/sections/features'; // Renamed features to benefits
import AiTypes from '@/components/sections/solutions'; // Renamed solutions to AiTypes
import UnlockPotentialCta from '@/components/sections/unlock-potential-cta';
import Testimonials from '@/components/sections/testimonials';
import Pricing from '@/components/sections/pricing';
import WhatsInTheBox from '@/components/sections/whats-in-the-box';
import TrustedBy from '@/components/sections/trusted-by';
import Faq from '@/components/sections/faq';
import FinalCta from '@/components/sections/final-cta';
import Footer from '@/components/sections/footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <FindYourAnswer />
        <AudioDemos />
        <Benefits />
        <AiTypes />
        <UnlockPotentialCta />
        <Testimonials />
        <Pricing />
        <WhatsInTheBox />
        <TrustedBy />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
