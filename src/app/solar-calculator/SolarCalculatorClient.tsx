'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import PageIntake from '@/components/solar/PageIntake';
import FAQ from '@/components/solar/FAQ';
import {
  Zap,
  Euro,
  Sun,
  Shield,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { ENERGY, DOMESTIC_MIN_KWP } from '@/lib/estimate';

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
          <span className="text-gradient">Savings Calculator</span>{' '}
          <br />
          for Irish Homes
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          See what solar would save you, read from your own electricity bill. Upload it or type
          in the amount, and see your saving straight away, with nothing to sign up for.
        </p>

        {/* Only the grant stays: the payback, 25-year and CO2 cards were
            figures the analyser above does not produce (Cal, 9 Nov). */}
        <div className="flex justify-center max-w-3xl mx-auto">
          {[
            { icon: Euro, label: `${SOLAR_DATA.grant.label} SEAI Grant (ROI)`, sub: 'Automatically included' },
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
      title: 'Upload or Type Your Bill',
      desc: 'Take a photo of your bill or upload the PDF, and the analyser reads your unit rate, standing charge and day and night split. No bill to hand? Answer 3 quick questions instead.',
    },
    {
      num: '02',
      title: 'See Your Saving and Battery Case',
      desc: `One yearly saving, priced by the same engine as your full estimate. If your bill is heavy at night, you also see whether a battery is worth a look, with the ${SOLAR_DATA.batteryGrant.label} SEAI battery grant.`,
    },
    {
      num: '03',
      title: 'Get Your Full Estimate by Email',
      desc: 'Add your name, mobile and email, and your full estimate goes to your inbox.',
    },
    {
      num: '04',
      title: 'Cal Rings to Talk It Through',
      desc: "A free 15-minute call today, or first thing tomorrow if it's late. He goes through your figures and answers your questions. No visit, no obligation.",
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
    { label: 'Generation rate', value: `${ENERGY.generationPerKwp.toLocaleString()} kWh per kWp`, source: 'PVGIS, south-facing Irish roof at 30 degrees after standard system losses' },
    { label: 'Panel wattage', value: '440W', source: 'Modern premium residential panels (2024/2025 stock)' },
    { label: 'Max panels', value: '22 panels (9.7 kWp)', source: 'Standard domestic ESB connection limit' },
    { label: 'Unit rate', value: `${Math.round(ENERGY.unitRateEur * 100)}c/kWh incl. VAT`, source: 'The bottom of the 2026 Irish market band, so savings are not overstated' },
    { label: 'Standing charge', value: `€${ENERGY.standingChargeAnnualEur}/year`, source: 'Irish standing charges 2026. Solar never removes this' },
    { label: 'SEAI grant', value: `${SOLAR_DATA.grant.label}`, source: 'Current SEAI Solar PV grant for homeowners, including private landlords' },
    { label: 'Export rate', value: SOLAR_DATA.export.label, source: `${SOLAR_DATA.export.scheme}: a typical supplier rate. Each supplier sets its own` },
    { label: 'CO₂ factor', value: `${ENERGY.co2PerKwh} kg/kWh`, source: 'EirGrid marginal emission factor for Ireland' },
    { label: 'Self-consumption', value: '30-50%', source: 'What an Irish home uses directly with no battery. A battery lifts it to roughly 70-85%' },
    { label: 'Minimum system', value: `${DOMESTIC_MIN_KWP} kWp`, source: 'Our domestic floor, and the size the SEAI grant reaches its full €1,800' },
  ];

  return (
    <section className="py-20 px-4 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Our <span className="text-gradient">Data Sources</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Full transparency on every number. No inflated figures - we use conservative, real-world Irish data so your estimate is honest and realistic.
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
          These figures represent a well-optimized installation. Your full estimate is priced on your own bill, and Cal goes through it with you on the call.
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
            Read your bill above and your full estimate comes by email, priced on your own usage. Then a free 15-minute call to go through it. No visit, no obligation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#calculator"
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Check my savings
              <ArrowRight className="w-4 h-4" />
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
        {/* Cal's Bill Analyser, the same one as the homepage, straight under
            the headline (12/10 brief): it was below the trust badges. Its
            "No bill to hand? Answer 3 quick questions" link is the type-it-in
            road, one tap away. */}
        <BillAnalyser door="calculator" />
        <TrustBadges />
        <CalculatorExplainer />
        <DataTransparency />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
      <WhatsAppChat />
      <PageIntake sticky={{ label: 'Analyse My Bill - Free', scrollTo: 'calculator' }} exit={true} />
    </div>
  );
}
