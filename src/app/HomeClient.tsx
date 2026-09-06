'use client';

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
const ExitIntent = dynamic(() => import('@/components/solar/ExitIntent'), { ssr: false });
const MobileStickyCTA = dynamic(() => import('@/components/solar/MobileStickyCTA'), { ssr: false });

export default function HomeClient() {
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
      <ExitIntent />
      <MobileStickyCTA />
    </div>
  );
}
