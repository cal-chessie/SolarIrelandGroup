'use client';

import { useEffect } from 'react';


import dynamic from 'next/dynamic';
import Navbar from '@/components/solar/Navbar';
import Hero from '@/components/solar/Hero';
import ScrollProgress from '@/components/solar/ScrollProgress';
import StatsBar from '@/components/solar/StatsBar';
import HowItWorks from '@/components/solar/HowItWorks';
import WhySolar from '@/components/solar/WhySolar';
import CustomerInstalls from '@/components/solar/CustomerInstalls';
import GrantInfo from '@/components/solar/GrantInfo';
import BillAnalyser from '@/components/solar/BillAnalyser';
import FAQ from '@/components/solar/FAQ';
import Footer from '@/components/solar/Footer';

// Client-only widgets - no SSR needed, no hydration risk
const WhatsAppChat = dynamic(() => import('@/components/solar/WhatsAppChat'), { ssr: false });
const PageIntake = dynamic(() => import('@/components/solar/PageIntake'), { ssr: false });

export default function HomeClient() {
  // Hash recovery. A cold load of /#calculator left the visitor at the top of
  // a 15,000px page: the browser tries to jump before the images below the
  // fold have laid out, the anchor moves, and the jump is lost. A warm load
  // worked, which is what made it look intermittent. Re-apply it after mount
  // and once more after paint. (hash-recovery)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    let tries = 0;
    const jump = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: tries === 0 ? 'auto' : 'smooth' });
      tries += 1;
      if (tries < 3) setTimeout(jump, 350);
    };
    const t = setTimeout(jump, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <WhySolar />
        <CustomerInstalls />
        <GrantInfo />
        <BillAnalyser />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppChat />
      <PageIntake sticky={{ label: 'See My Savings - Free', scrollTo: 'calculator' }} exit={true} />
    </div>
  );
}
