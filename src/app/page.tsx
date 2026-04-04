'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/solar/Navbar';
import Hero from '@/components/solar/Hero';
import HowItWorks from '@/components/solar/HowItWorks';
import WhySolar from '@/components/solar/WhySolar';
import CustomerInstalls from '@/components/solar/CustomerInstalls';
import GrantInfo from '@/components/solar/GrantInfo';
import FAQ from '@/components/solar/FAQ';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';

// Lazy-load the heavy BillAnalyser — it's 800+ lines with lots of Framer Motion
const BillAnalyser = dynamic(() => import('@/components/solar/BillAnalyser'), {
  loading: () => (
    <section id="calculator" className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Bill <span className="text-gradient">Analyser</span>
          </h2>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      </div>
    </section>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main>
        <Hero />
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="why-solar">
          <WhySolar />
        </div>
        <div id="our-work">
          <CustomerInstalls />
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
