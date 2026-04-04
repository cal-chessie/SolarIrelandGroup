'use client';

import Navbar from '@/components/solar/Navbar';
import Hero from '@/components/solar/Hero';
import BrandBanner from '@/components/solar/BrandBanner';
import HowItWorks from '@/components/solar/HowItWorks';
import WhySolar from '@/components/solar/WhySolar';
import GrantInfo from '@/components/solar/GrantInfo';
import BillAnalyser from '@/components/solar/BillAnalyser';
import FAQ from '@/components/solar/FAQ';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main>
        <Hero />
        <BrandBanner />
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="why-solar">
          <WhySolar />
        </div>
        <div id="grant-info">
          <GrantInfo />
        </div>
        <div id="calculator">
          <BillAnalyser />
        </div>
        <div id="faq">
          <FAQ />
        </div>
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
