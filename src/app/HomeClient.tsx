'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/solar/Navbar';
import Hero from '@/components/solar/Hero';
import ScrollProgress from '@/components/solar/ScrollProgress';

const StatsBar = dynamic(() => import('@/components/solar/StatsBar'), { ssr: false });
const HowItWorks = dynamic(() => import('@/components/solar/HowItWorks'), { ssr: false });
const WhySolar = dynamic(() => import('@/components/solar/WhySolar'), { ssr: false });
const CustomerInstalls = dynamic(() => import('@/components/solar/CustomerInstalls'), { ssr: false });
const GrantInfo = dynamic(() => import('@/components/solar/GrantInfo'), { ssr: false });
const QuickSavingsCalculator = dynamic(() => import('@/components/solar/QuickSavingsCalculator'), { ssr: false });
const BillAnalyser = dynamic(() => import('@/components/solar/BillAnalyser'), { ssr: false });
const FAQ = dynamic(() => import('@/components/solar/FAQ'), { ssr: false });
const Footer = dynamic(() => import('@/components/solar/Footer'), { ssr: false });
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
