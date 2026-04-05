'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/solar/Navbar';
import Hero from '@/components/solar/Hero';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';

/* ═══════════════════════════════════════════════════════════════
   Lazy-load ALL below-fold components.
   This keeps Framer Motion out of the initial JS bundle
   and prevents it from initializing during hydration.
   ═══════════════════════════════════════════════════════════════ */

const HowItWorks = dynamic(() => import('@/components/solar/HowItWorks'), {
  loading: () => <SectionSkeleton id="how-it-works" title="How It Works" />,
});

const WhySolar = dynamic(() => import('@/components/solar/WhySolar'), {
  loading: () => <SectionSkeleton id="why-solar" title="Why Solar" />,
});

const CustomerInstalls = dynamic(() => import('@/components/solar/CustomerInstalls'), {
  loading: () => <SectionSkeleton id="our-work" title="Our Work" />,
});

const GrantInfo = dynamic(() => import('@/components/solar/GrantInfo'), {
  loading: () => <SectionSkeleton id="grant-info" title="Grants & Support" />,
});

const QuickSavingsCalculator = dynamic(() => import('@/components/solar/QuickSavingsCalculator'), {
  loading: () => <SectionSkeleton id="quick-calculator" title="How Much Could You Save?" />,
});

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

const FAQ = dynamic(() => import('@/components/solar/FAQ'), {
  loading: () => <SectionSkeleton id="faq" title="FAQ" />,
});

const Footer = dynamic(() => import('@/components/solar/Footer'), {
  loading: () => <FooterSkeleton />,
});

/* ═══════════════════════════════════════════════════════════════
   LOADING SKELETONS — lightweight, zero Framer Motion
   ═══════════════════════════════════════════════════════════════ */

function SectionSkeleton({ id, title }: { id: string; title: string }) {
  return (
    <section id={id} className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{title}</h2>
          <div className="w-20 h-1 bg-amber-400/20 rounded-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-8">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] mb-4" />
              <div className="h-5 bg-white/[0.04] rounded w-3/4 mb-3" />
              <div className="h-4 bg-white/[0.03] rounded w-full mb-2" />
              <div className="h-4 bg-white/[0.03] rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterSkeleton() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/[0.04] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-white/[0.05] rounded w-24 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-white/[0.03] rounded w-full" />
                <div className="h-3 bg-white/[0.03] rounded w-3/4" />
                <div className="h-3 bg-white/[0.03] rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE — only Hero, Navbar, ScrollProgress, WhatsAppChat
   load immediately (all Framer Motion-free)
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main>
        <Hero />
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
    </div>
  );
}
