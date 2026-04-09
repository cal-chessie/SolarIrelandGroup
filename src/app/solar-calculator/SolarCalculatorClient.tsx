'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import FAQ from '@/components/solar/FAQ';
import {
  Zap,
  Euro,
  Sun,
  Shield,
  Clock,
  TrendingUp,
  Leaf,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { SOLAR_DATA } from '@/lib/solar-data';

const QuickSavingsCalculator = dynamic(
  () => import('@/components/solar/QuickSavingsCalculator'),
  {
    loading: () => (
      <section className="py-20 px-4 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        </div>
      </section>
    ),
  }
);

const BillAnalyser = dynamic(() => import('@/components/solar/BillAnalyser'), {
  loading: () => (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      </div>
    </section>
  ),
});


function CalculatorHero() {
  return (
    <section className="relative pt-32 pb-16 px-4 bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-400/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-6">
          <Zap className="w-3.5 h-3.5" />
          Free Solar Calculator
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Solar Panel{' '}
          <span className="text-gradient">Savings Calculator</span>
          <br />
          for Irish Homes
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          See exactly how much you could save with solar panels. Enter your electricity bill,
          pick your home type, and get an instant personalised estimate — no signup, no hassle.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { icon: Euro, label: '€1,800 SEAI Grant (ROI)', sub: 'Automatically included' },
            { icon: Clock, label: '5-7 Year Payback', sub: 'After grant deduction' },
            { icon: TrendingUp, label: '€40k+ Over 25 Years', sub: 'Rising energy prices' },
            { icon: Leaf, label: '2,500+ kg CO₂/yr', sub: 'Environmental impact' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-amber-400/20 transition-colors"
              >
                <Icon className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


function TrustBadges() {
  const badges = [
    { icon: Shield, label: 'SEAI Registered', desc: 'Fully certified installer' },
    { icon: CheckCircle2, label: 'No Hidden Costs', desc: 'Transparent pricing' },
    { icon: Sun, label: 'Real Irish Data', desc: 'Met Éireann irradiance data' },
    { icon: Euro, label: '440W Premium Panels', desc: 'Modern high-efficiency panels' },
  ];

  return (
    <section className="py-8 px-4 bg-[#0a0a0a] border-y border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{badge.label}</p>
                  <p className="text-[11px] text-gray-500">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


function CalculatorExplainer() {
  const steps = [
    {
      num: '01',
      title: 'Enter Your Bill',
      desc: 'Move the slider to your monthly electricity bill amount. We use the current average Irish unit rate (34c/kWh including VAT) and €200/year standing charges for accurate calculations.',
    },
    {
      num: '02',
      title: 'Pick Your Home Type',
      desc: 'Choose from Apartment, Semi-Detached, or Detached. This determines how many panels can fit on your roof — up to 22 premium 440W panels for larger homes.',
    },
    {
      num: '03',
      title: 'See Your Savings',
      desc: 'Get instant results: annual savings, monthly bill reduction, system size, payback period, and 25-year savings projection. Expand for monthly generation charts and full cost breakdown.',
    },
    {
      num: '04',
      title: 'Get Your Free Quote',
      desc: 'Happy with the numbers? Send your estimate directly to our team via WhatsApp for a free, no-obligation site survey and personalised quote.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Our Calculator Uses{' '}
            <span className="text-gradient">Real Irish Data</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            No fluff, no guesswork. Every figure is backed by SEAI grant rates, Met Éireann solar irradiance data, and current electricity prices from Irish providers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/20 transition-colors"
            >
              <span className="text-4xl font-bold text-white/[0.04] absolute top-4 right-6">
                {step.num}
              </span>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function DataTransparency() {
  const factors = [
    { label: 'Generation rate', value: '1,000 kWh per kWp', source: 'Met Éireann, well-optimized south-facing Irish roof' },
    { label: 'Panel wattage', value: '440W', source: 'Modern premium residential panels (2024/2025 stock)' },
    { label: 'Max panels', value: '22 panels (9.7 kWp)', source: 'Standard domestic ESB connection limit' },
    { label: 'Unit rate', value: '34c/kWh incl. VAT', source: 'Average across Irish electricity providers 2025/2026' },
    { label: 'Standing charge', value: '€200/year', source: 'Average Irish standing charges 2025/2026' },
    { label: 'SEAI grant', value: `${SOLAR_DATA.grant.label}`, source: 'Current SEAI Solar PV grant for owner-occupiers' },
    { label: 'Export rate', value: SOLAR_DATA.export.label, source: `Clean Export Guarantee (${SOLAR_DATA.export.scheme})` },
    { label: 'CO₂ factor', value: '0.29 kg/kWh', source: 'EirGrid 2024 marginal emission factor for Ireland' },
  ];

  return (
    <section className="py-20 px-4 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Our <span className="text-gradient">Data Sources</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Full transparency on every number. No inflated figures — we use conservative, real-world Irish data so your estimate is honest and realistic.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Factor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Source</th>
                </tr>
              </thead>
              <tbody>
                {factors.map((f, i) => (
                  <tr key={f.label} className={i < factors.length - 1 ? 'border-b border-white/[0.04]' : ''}>
                    <td className="px-6 py-4 text-sm text-gray-300 font-medium">{f.label}</td>
                    <td className="px-6 py-4 text-sm text-amber-400 font-bold">{f.value}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 hidden sm:table-cell">{f.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6 leading-relaxed max-w-xl mx-auto">
          Actual savings depend on roof orientation, pitch, shading, and your consumption patterns.
          These figures represent a well-optimized installation. A free site survey gives you exact, personalised numbers.
        </p>
      </div>
    </section>
  );
}


function FinalCTA() {
  return (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto text-center">
        <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-b from-amber-400/[0.06] to-transparent p-10 sm:p-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to See Your <span className="text-gradient">Exact Savings?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            The calculator gives you a great estimate. For exact figures based on your roof, get a free site survey — it takes 30 minutes and there&apos;s zero obligation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={buildWhatsAppUrl({
                source: 'calculator-page-cta',
                monthlyBill: 160,
                homeType: 'Semi-Detached',
                annualSaving: 1100,
                paybackYears: 5,
                total25yrSaving: 48000,
                recommendedSystem: 5.5,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Get Free Site Survey
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/[0.08] text-gray-300 font-medium text-sm hover:border-white/[0.15] hover:text-white transition-all"
            >
              Back to Home
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
        <CalculatorHero />
        <TrustBadges />
        <QuickSavingsCalculator />
        <CalculatorExplainer />
        <BillAnalyser />
        <DataTransparency />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
