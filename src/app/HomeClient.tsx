'use client';

import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/solar/Navbar'), {
  ssr: false,
  loading: () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 animate-pulse" />
          <span className="text-white font-bold text-lg tracking-tight">Solar Ireland</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Services', 'Calculator', 'About', 'FAQ', 'Contact'].map((item) => (
            <span key={item} className="text-sm text-gray-500">{item}</span>
          ))}
        </div>
        <div className="h-10 w-28 rounded-xl bg-amber-400/10 animate-pulse" />
      </div>
    </header>
  ),
});

const Hero = dynamic(() => import('@/components/solar/Hero'), {
  ssr: false,
  loading: () => (
    <section className="relative min-h-[90vh] flex items-center bg-[#0a0a0a] pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="max-w-3xl">
          <div className="h-3 w-28 bg-amber-400/20 rounded-full mb-6 animate-pulse" />
          <div className="h-12 sm:h-14 w-full bg-white/[0.03] rounded-lg mb-3 animate-pulse" />
          <div className="h-12 sm:h-14 w-3/4 bg-white/[0.03] rounded-lg mb-6 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-white/[0.02] rounded mb-8 animate-pulse" />
          <div className="flex gap-4">
            <div className="h-14 w-52 rounded-xl bg-amber-400/15 animate-pulse" />
            <div className="h-14 w-40 rounded-xl bg-white/[0.04] animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  ),
});

const ScrollProgress = dynamic(() => import('@/components/solar/ScrollProgress'), { ssr: false });
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
