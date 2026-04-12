'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/solar/Navbar';
import Hero from '@/components/solar/Hero';
import ScrollProgress from '@/components/solar/ScrollProgress';

const StatsBar = dynamic(() => import('@/components/solar/StatsBar'));
const HowItWorks = dynamic(() => import('@/components/solar/HowItWorks'));
const WhySolar = dynamic(() => import('@/components/solar/WhySolar'));
const CustomerInstalls = dynamic(() => import('@/components/solar/CustomerInstalls'));
const GrantInfo = dynamic(() => import('@/components/solar/GrantInfo'));
const QuickSavingsCalculator = dynamic(() => import('@/components/solar/QuickSavingsCalculator'));
const BillAnalyser = dynamic(() => import('@/components/solar/BillAnalyser'));
const FAQ = dynamic(() => import('@/components/solar/FAQ'));
const Footer = dynamic(() => import('@/components/solar/Footer'));
const WhatsAppChat = dynamic(() => import('@/components/solar/WhatsAppChat'), { ssr: false });
const ExitIntent = dynamic(() => import('@/components/solar/ExitIntent'), { ssr: false });

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
        <QuickSavingsCalculator />
        <BillAnalyser />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppChat />
      <ExitIntent />
    </div>
  );
}
