'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/solar/Navbar';
import Hero from '@/components/solar/Hero';
import HowItWorks from '@/components/solar/HowItWorks';
import WhySolar from '@/components/solar/WhySolar';
import CustomerInstalls from '@/components/solar/CustomerInstalls';
import GrantInfo from '@/components/solar/GrantInfo';
import BillAnalyser from '@/components/solar/BillAnalyser';
import FAQ from '@/components/solar/FAQ';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import PageLoader from '@/components/solar/PageLoader';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate minimum load time so skeleton is visible briefly
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <PageLoader isLoading={loading} />

      {!loading && (
        <>
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
        </>
      )}
    </div>
  );
}
