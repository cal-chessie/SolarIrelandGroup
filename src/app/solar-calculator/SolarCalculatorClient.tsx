'use client';

import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import PageIntake from '@/components/solar/PageIntake';
import FAQ from '@/components/solar/FAQ';
import {
  ArrowRight,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { SOLAR_DATA } from '@/lib/solar-data';
import BillAnalyser from '@/components/solar/BillAnalyser';


function CalculatorExplainer() {
  const steps = [
    {
      num: '01',
      title: 'Show us your bill',
      desc: 'A photo, a screenshot or the PDF from your supplier. No bill to hand? Answer three quick questions instead.',
    },
    {
      num: '02',
      title: 'See what it says',
      desc: 'Your supplier, your unit rate, your standing charge, your units and your day and night split, each marked as read from your bill. Fix any figure with one tap.',
    },
    {
      num: '03',
      title: 'See your saving',
      desc: `One figure: what solar could save you in a year, with the cost after the ${SOLAR_DATA.grant.label} SEAI grant. A close estimate, not a quote.`,
    },
    {
      num: '04',
      title: 'Book a free 15-minute call',
      desc: 'Name, mobile and email. We ring you to go through your figures and answer your questions. No visit, no obligation.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            From your bill to <span className="text-gradient">a free call</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We read the figures off your own bill, so the saving is about your home, not a typical one.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-4xl font-bold text-white/[0.06] absolute top-4 right-6">{step.num}</span>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function FinalCTA() {
  return (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto text-center">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 sm:p-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Want a person to <span className="text-gradient">go through it with you?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            A free 15-minute phone call. We go through your figures and answer your questions. No visit, no obligation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#calculator"
              className="flex items-center gap-2.5 min-h-[52px] px-8 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-[15px] transition-colors"
            >
              Book a free call
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={buildWhatsAppUrl({ source: 'calculator-page-cta' })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 min-h-[44px] px-4 text-gray-300 font-medium text-sm hover:text-white transition-colors underline underline-offset-4 decoration-white/30"
            >
              <MessageCircle className="w-4 h-4" />
              Or WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


export default function SolarCalculatorClient() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main>
        {/* Call funnel (4 Nov 2026): /solar-calculator is Cal's Bill Analyser
            again, above the fold, with the manual side one tap away. The URL
            stays for search; id="calculator" keeps old links landing here. */}
        <section id="calculator" className="relative px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16" style={{ scrollMarginTop: 72 }}>
          <div className="max-w-6xl xl:max-w-[74rem] 2xl:max-w-[86rem] mx-auto">
            <BillAnalyser
              variant="hero"
              door="calculator"
              intro={
                <div className="text-center lg:text-left">
                  <h1 className="text-[2rem] leading-[1.05] sm:text-5xl lg:text-6xl font-bold tracking-tight">
                    <span className="block text-white">Solar savings calculator.</span>
                    <span className="block text-gradient">Read from your own bill.</span>
                  </h1>
                  <p className="mt-4 sm:mt-6 text-base sm:text-lg xl:text-xl text-gray-200/90 max-w-xl leading-relaxed mx-auto lg:mx-0">
                    Upload your electricity bill and see what it says: your unit rate, your standing charge and your day and night split. Then see what solar could save you.
                  </p>
                </div>
              }
            />
          </div>
        </section>
        <CalculatorExplainer />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
      <WhatsAppChat />
      <PageIntake sticky={{ scrollTo: 'calculator' }} />
    </div>
  );
}
