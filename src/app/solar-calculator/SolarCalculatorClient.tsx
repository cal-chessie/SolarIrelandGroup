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
import { ENERGY, DOMESTIC_MIN_KWP } from '@/lib/estimate';

import IntakeDoorSection from '@/components/intake/IntakeDoorSection';
import IntakeLink from '@/components/intake/IntakeLink';


function CalculatorExplainer() {
  const steps = [
    {
      num: '01',
      title: 'Type your bill, or tap the closest',
      // Read from the engine, so this can never again describe rates the
      // estimate on the same page is not using.
      desc: `A rough monthly or two-monthly figure is enough, or add a photo of your bill and an AI service reads the figures off it. Without a supplier we use ${Math.round(ENERGY.unitRateEur * 100)}c/kWh including VAT, the bottom of the current Irish market band, and €${ENERGY.standingChargeAnnualEur} a year in standing charges, which solar never removes.`,
    },
    {
      num: '02',
      title: 'See your estimate',
      desc: 'One figure first, your yearly saving, then the cost after your SEAI grant, the payback and the system size. Tap "How we worked this out" to see every assumption and change it.',
    },
    {
      num: '03',
      title: 'Pick a time',
      desc: 'Only real free times are shown. Pick one and add your Eircode, name, mobile and email. No email is needed to see the estimate.',
    },
    {
      num: '04',
      title: 'The free site survey',
      desc: 'Two steps: a 15-minute phone call first, then about 45 minutes at your home to check the roof, the fuse board and the meter. Your proposal follows, and we handle the SEAI paperwork.',
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
    { label: 'Export rate', value: SOLAR_DATA.export.label, source: `${SOLAR_DATA.export.scheme}: the CRU minimum every supplier must pay. Some pay more` },
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
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 sm:p-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            The survey turns a close estimate into <span className="text-gradient">your proposal</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            A free site survey in two steps, with no obligation: a 15-minute phone call first, then about 45 minutes at your home. Pick a real time on this page.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Intake OS: this used to say "Get Free Site Survey" and open
                WhatsApp. It now opens the one intake at the survey times. */}
            <IntakeLink
              opts={{ door: 'calculator-final', segment: 'home', step: 'time' }}
              className="flex items-center gap-2.5 min-h-[52px] px-8 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-[15px] transition-colors"
            >
              Pick a survey time
              <ArrowRight className="w-4 h-4" />
            </IntakeLink>
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
        {/* Apple pass (APPLE-DECISIONS, "Doors"): the URL stays for search, the
            first fold is the bill question. The badge, the four stat tiles
            (including the hard-coded "5-7 Year Payback", never an engine
            figure) and the trust row are gone. id="calculator" keeps old
            #calculator links landing here. */}
        <IntakeDoorSection
          id="calculator"
          door="calculator"
          as="h1"
          hero
          heading="What would solar save you?"
          line="Type your electricity bill and see your estimate on this page, then pick a time for a free site survey. No email needed to see it."
        />
        <CalculatorExplainer />
        <DataTransparency />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
      <WhatsAppChat />
      <PageIntake sticky={{ scrollTo: 'calculator' }} />
    </div>
  );
}
