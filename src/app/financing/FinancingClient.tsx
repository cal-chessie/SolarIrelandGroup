'use client';

import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import PageIntake from '@/components/solar/PageIntake';
import FAQ from '@/components/solar/FAQ';
import {
  Euro,
  Calculator,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  CreditCard,
  PiggyBank,
  Banknote,
  Percent,
  CalendarDays,
  BarChart3,
  ChevronDown,
  Lightbulb,
  BadgeCheck,
  ArrowDownRight,
  Zap,
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { SOLAR_DATA } from '@/lib/solar-data';
import { estimate, installCostEur, homeGrant, PRICING } from '@/lib/estimate';
import { FINANCING_ANSWER, FINANCING_FAQS } from './financing-faq';

// The after-grant range, worked out by the engine rather than typed: the smallest
// system we fit (4 kWp, panels only, solar grant) up to the Premium package
// (8 kWp with a 10 kWh battery, solar plus battery grant).
const NET_LOW = installCostEur(4, 0) - homeGrant(4, 0);
const NET_HIGH = installCostEur(8, 10) - homeGrant(8, 10);
const eurWhole = (n: number) => `€${n.toLocaleString('en-IE')}`;

/* ─── Data ─── */

/**
 * Sizes and prices come from the engine, never from a table typed here.
 *
 * This table used to carry its own prices, and every one of them was wrong:
 * €4,500 for an apartment, €6,000 for a semi, €10,500 for the biggest system a
 * domestic connection allows. Those were the pre-consolidation figures, so the
 * financing page was quoting monthly repayments on money nobody would ever be
 * lent. The apartment row was also 2.64 kWp, below the 4 kWp domestic floor,
 * which we do not sell.
 *
 * Panels-only, matching the engine's stance: a battery is the consultant's to
 * price on the day, so it is not financed here either.
 */
const SYSTEM_PRESETS = [4, 5, 6, 8, 9.7].map((kwp, i) => ({
  label: ['Apartment / Terrace', 'Semi-Detached (3 bed)', 'Detached (4 bed)', 'Large Detached (5+ bed)', 'Maximum System'][i],
  icon: ['🏢', '🏠', '🏡', '🏰', '⚡'][i],
  kwp,
  panels: Math.round((kwp * 1000) / PRICING.panelWatts),
  costBeforeGrant: installCostEur(kwp),
  // What the engine says a house sized for this array actually saves. The page
  // used to assume a flat 18% of net cost, which is a fifth savings model and
  // exactly the drift that made four engines disagree in the first place.
  ...(() => {
    // sizeSystemKwp aims an array at about 85% of annual usage, so invert it to
    // get the household this system would have been sized for.
    const annualUsageKwh = Math.round((kwp * SOLAR_DATA.system.generationPerKwp) / 0.85);
    const e = estimate({ annualUsageKwh, systemSizeKwp: kwp });
    return { annualSaving: e.totalAnnualBenefitEur, grantEur: e.grantEur };
  })(),
}));

/**
 * Loan terms with ONE example rate. Not an offer and not any lender's APR:
 * every Irish lender sets its own, and the page used to print a rate per term
 * labelled "Representative APR" that nobody had sourced. 7% is a round
 * illustration so the maths can run; the page says so next to it.
 */
const EXAMPLE_RATE = 7;
const FINANCE_TERMS = [
  { months: 36, label: '3 years', rate: EXAMPLE_RATE },
  { months: 60, label: '5 years', rate: EXAMPLE_RATE },
  { months: 84, label: '7 years', rate: EXAMPLE_RATE },
  { months: 120, label: '10 years', rate: EXAMPLE_RATE },
];

const DEPOSIT_OPTIONS = [0, 10, 20, 30, 50];

function calculateFinancing(
  systemCost: number,
  grant: number,
  depositPercent: number,
  termMonths: number,
  apr: number,
  /** From the engine, per system size. Never derived from the price. */
  annualSaving: number
) {
  const netCost = systemCost - grant;
  const depositAmount = netCost * (depositPercent / 100);
  const loanAmount = netCost - depositAmount;

  // Monthly interest rate from APR
  const monthlyRate = apr / 100 / 12;
  let monthlyPayment: number;
  let totalInterest: number;

  if (monthlyRate === 0 || loanAmount <= 0) {
    monthlyPayment = loanAmount / termMonths;
    totalInterest = 0;
  } else {
    monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    totalInterest = monthlyPayment * termMonths - loanAmount;
  }

  const totalRepayable = loanAmount + totalInterest;
  const totalOutOfPocket = depositAmount + totalRepayable;

  const monthlySaving = annualSaving / 12;
  const netMonthlyCost = monthlyPayment - monthlySaving;

  // Payback
  const paybackUpfront = netCost / annualSaving;
  const paybackFinanced = monthlySaving > 0 ? totalOutOfPocket / annualSaving : Infinity;

  // 25-year net savings
  const saving25yrUpfront = annualSaving * 25 - netCost;
  const saving25yrFinanced = annualSaving * 25 - totalOutOfPocket;

  return {
    systemCost,
    grant,
    netCost,
    depositAmount,
    depositPercent,
    loanAmount,
    termMonths,
    apr,
    monthlyPayment,
    totalInterest,
    totalRepayable,
    totalOutOfPocket,
    annualSaving,
    monthlySaving,
    netMonthlyCost,
    paybackUpfront,
    paybackFinanced,
    saving25yrUpfront,
    saving25yrFinanced,
  };
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDec(n: number) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/* ─── Components ─── */

function FinancingHero() {
  return (
    <section className="relative pt-32 pb-16 px-4 bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-400/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />

      {/* Desktop (lg+): copy left, the four facts as a 2x2 block right, in the
          site's wide container (Cal: "financing seems cramped to mobile"). */}
      <div className="max-w-4xl lg:max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto text-center lg:text-left relative z-10 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:items-center">
        <div>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-green-400/10 text-green-400 border border-green-400/20 mb-6">
          <CreditCard className="w-3.5 h-3.5" />
          Solar Financing
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
          Solar Panel{' '}
          <span className="text-gradient">Payment Plans</span>{' '}
          <br />
          for Irish Homes
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
          See exactly what your monthly repayments would be. Compare upfront vs finance,
          factor in the €1,800 SEAI grant, and find out if solar pays for itself from day one.
        </p>

        {/* The page was 13.6 screens tall with nothing to act on above the
            fold and no link to the booking form anywhere on it. */}
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10 lg:mb-0">
          <a
            href="/solar-calculator"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm whitespace-nowrap transition-all active:scale-[0.98] shadow-lg shadow-amber-400/15"
          >
            Price it on my bill
          </a>
          <a
            href="/solar-calculator?src=financing"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-green-400/25 bg-green-400/10 text-green-400 font-medium text-sm whitespace-nowrap hover:bg-green-400/20 transition-all active:scale-[0.98]"
          >
            Check my savings
          </a>
        </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 lg:gap-5 max-w-3xl mx-auto lg:max-w-none">
          {[
            { icon: CreditCard, label: 'Banks & Credit Unions', sub: 'Green and home improvement loans' },
            { icon: Percent, label: 'Your Lender Sets the APR', sub: 'Compare the rate you are quoted' },
            { icon: TrendingUp, label: 'Savings vs Repayments', sub: 'See both side by side' },
            { icon: Shield, label: '€1,800 Grant (ROI)', sub: 'We guide you through it' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center text-center lg:items-start lg:text-left p-4 lg:p-6 rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-green-400/20 transition-colors"
              >
                <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-green-400 mb-2 lg:mb-3" />
                <p className="text-sm lg:text-lg font-semibold text-white">{item.label}</p>
                <p className="text-[11px] lg:text-sm text-gray-500 mt-0.5 lg:mt-1">{item.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * The direct answer to the loans searches ("solar panel loans", "loan for
 * solar panels"), as plain server-rendered text near the top, plus the three
 * facts that decide how much you borrow. Official sources only, no rates.
 */
function FinancingShortAnswer() {
  return (
    <section className="px-4 pb-12 lg:pt-8 lg:pb-20 bg-[#0a0a0a]">
      <div className="max-w-3xl lg:max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto lg:grid lg:grid-cols-2 lg:gap-16">
        <div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 lg:leading-tight">
          Can you get a loan for <span className="text-gradient">solar panels in Ireland?</span>
        </h2>
        <p className="text-base sm:text-lg xl:text-xl text-gray-200 leading-relaxed border-l-2 border-green-400/60 pl-4 mb-6 lg:mb-0 lg:max-w-[70ch]">
          {FINANCING_ANSWER}
        </p>
        </div>
        <ul className="space-y-3 lg:space-y-5 lg:self-end">
          <li className="flex items-start gap-2.5 text-sm lg:text-[17px] text-gray-400 leading-relaxed lg:p-5 lg:rounded-2xl lg:bg-white/[0.02] lg:border lg:border-white/[0.05]">
            <CheckCircle2 className="w-4 h-4 text-green-400/60 shrink-0 mt-0.5" />
            <span>
              <span className="text-white font-semibold">What a system costs:</span> a 4 kWp system is{' '}
              {eurWhole(installCostEur(4))} installed, or {eurWhole(NET_LOW)} after the SEAI grant. See the{' '}
              <a href="/blog/how-much-do-solar-panels-cost-ireland-2026" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">full solar panel cost guide</a>.
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-sm lg:text-[17px] text-gray-400 leading-relaxed lg:p-5 lg:rounded-2xl lg:bg-white/[0.02] lg:border lg:border-white/[0.05]">
            <CheckCircle2 className="w-4 h-4 text-green-400/60 shrink-0 mt-0.5" />
            <span>
              <span className="text-white font-semibold">When the grant arrives:</span> after the work and the post-works BER, so plan to fund the full price first. The{' '}
              <a href="/blog/complete-guide-seai-solar-grant-2026" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">SEAI solar grant guide</a>{' '}
              covers the steps.
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-sm lg:text-[17px] text-gray-400 leading-relaxed lg:p-5 lg:rounded-2xl lg:bg-white/[0.02] lg:border lg:border-white/[0.05]">
            <CheckCircle2 className="w-4 h-4 text-green-400/60 shrink-0 mt-0.5" />
            <span>
              <span className="text-white font-semibold">Whether it pays:</span> compare your repayment with the monthly saving. Start with{' '}
              <a href="/blog/are-solar-panels-worth-it-ireland-2026" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">are solar panels worth it in Ireland</a>, then get your own figure from the{' '}
              <a href="/solar-calculator?src=financing-answer" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">free solar savings calculator</a>.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function TrustBadges() {
  const badges = [
    { icon: Shield, label: 'SEAI Registered', desc: 'Fully certified installer' },
    { icon: CheckCircle2, label: 'Transparent Pricing', desc: 'No hidden fees' },
    { icon: Euro, label: '€1,800 Grant (ROI)', desc: 'You apply online, we guide you' },
    { icon: BadgeCheck, label: 'Lender-Ready Quotes', desc: 'Itemised for a loan application' },
  ];

  return (
    <section className="py-8 px-4 bg-[#0a0a0a] border-y border-white/[0.04]">
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto">
        <div className="flex flex-wrap items-center justify-center lg:justify-between gap-6 sm:gap-10">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-2.5">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-green-400/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm lg:text-base font-semibold text-white">{badge.label}</p>
                  <p className="text-[11px] lg:text-sm text-gray-500">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinancingCalculator() {
  const [systemIndex, setSystemIndex] = useState(1);
  const [depositPercent, setDepositPercent] = useState(0);
  const [termMonths, setTermMonths] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  // Desktop (lg+): the answer column sits beside the inputs, so it updates
  // live instead of waiting for the button. Phones keep the button flow.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const resultsShown = showResults || wide;

  const system = SYSTEM_PRESETS[systemIndex];
  const term = FINANCE_TERMS.find((t) => t.months === termMonths) ?? FINANCE_TERMS[1];

  const result = useMemo(
    () =>
      calculateFinancing(
        system.costBeforeGrant,
        system.grantEur,
        depositPercent,
        termMonths,
        term.rate,
        system.annualSaving
      ),
    [system.costBeforeGrant, system.grantEur, system.annualSaving, depositPercent, termMonths, term.rate]
  );

  const isCashFlowPositive = result.netMonthlyCost < 0;

  return (
    <section className="py-20 lg:py-28 px-4 bg-[#0a0a0a]">
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <Calculator className="w-3.5 h-3.5" />
            Payment Calculator
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold mb-4 lg:mb-5 lg:leading-tight">
            Calculate Your{' '}
            <span className="text-gradient">Monthly Repayments</span>
          </h2>
          <p className="text-gray-400 text-lg xl:text-xl max-w-2xl mx-auto">
            Pick your system size, choose your deposit and loan term, and see exactly
            what you&apos;d pay each month - with the SEAI grant already deducted.
          </p>
        </div>

        {/* Desktop (lg+): the inputs on the left, the answer on the right, side
            by side, so the repayment sits next to the choices that drive it. */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="lg:border-r lg:border-white/[0.04]">
          {/* System Selection */}
          <div className="p-6 sm:p-8 border-b border-white/[0.04]">
            <h3 className="text-sm lg:text-base font-semibold text-white mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              1. Choose Your System
            </h3>
            <p className="text-xs lg:text-sm text-gray-500 mb-5 lg:leading-relaxed">
              The size of system that fits your home determines the total cost.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
              {SYSTEM_PRESETS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setSystemIndex(i); setShowResults(false); }}
                  className={`
                    relative text-left p-4 rounded-xl border transition-all active:scale-[0.98]
                    ${
                      systemIndex === i
                        ? 'bg-green-400/[0.06] border-green-400/30 ring-1 ring-green-400/10'
                        : 'bg-white/[0.01] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]'
                    }
                  `}
                >
                  <span className="text-lg mb-1 block">{s.icon}</span>
                  <p className="text-xs lg:text-sm font-semibold text-white leading-tight">{s.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{s.panels} panels · {s.kwp} kWp</p>
                  <p className="text-sm lg:text-base font-bold text-amber-400 mt-1.5">{fmt(s.costBeforeGrant)}</p>
                  {systemIndex === i && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-green-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Grant Summary */}
          <div className="px-6 sm:px-8 py-4 border-b border-white/[0.04] bg-amber-400/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <Euro className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">SEAI Grant Worked Into These Figures</p>
                  <p className="text-xs text-gray-500">
                    {fmt(system.costBeforeGrant)} − {SOLAR_DATA.grant.label} grant ={' '}
                    <span className="text-green-400 font-bold">{fmt(result.netCost)} after grant</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-400">-{SOLAR_DATA.grant.label}</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">Grant savings</p>
              </div>
            </div>
          </div>

          {/* Deposit */}
          <div className="p-6 sm:p-8 border-b border-white/[0.04]">
            <h3 className="text-sm lg:text-base font-semibold text-white mb-1 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-green-400" />
              2. Deposit Amount
            </h3>
            <p className="text-xs lg:text-sm text-gray-500 mb-5 lg:leading-relaxed">
              Choose how much to pay upfront. Whether a deposit is needed is up to your lender.
            </p>
            <div className="flex flex-wrap gap-2">
              {DEPOSIT_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => { setDepositPercent(d); setShowResults(false); }}
                  className={`
                    px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95
                    ${
                      depositPercent === d
                        ? 'bg-green-400/10 border-green-400/30 text-green-400'
                        : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/[0.12] hover:text-white'
                    }
                  `}
                >
                  {d === 0 ? 'No Deposit' : `${d}%`}
                </button>
              ))}
            </div>
            {depositPercent > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                Your deposit: <span className="text-white font-semibold">{fmt(result.depositAmount)}</span>
                {' '}· Remaining loan: <span className="text-white font-semibold">{fmt(result.loanAmount)}</span>
              </p>
            )}
          </div>

          {/* Loan Term */}
          <div className="p-6 sm:p-8 border-b border-white/[0.04]">
            <h3 className="text-sm lg:text-base font-semibold text-white mb-1 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-sky-400" />
              3. Loan Term &amp; Rate
            </h3>
            <p className="text-xs lg:text-sm text-gray-500 mb-5 lg:leading-relaxed">
              Longer terms mean lower monthly payments but more interest overall. The calculator uses an
              example rate of {EXAMPLE_RATE}% so the sums can run: it is not an offer or any lender&apos;s APR.
              Use the rate your bank or credit union actually quotes you.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
              {FINANCE_TERMS.map((t) => (
                <button
                  key={t.months}
                  onClick={() => { setTermMonths(t.months); setShowResults(false); }}
                  className={`
                    p-4 rounded-xl border text-center transition-all active:scale-[0.98]
                    ${
                      termMonths === t.months
                        ? 'bg-sky-400/[0.06] border-sky-400/30 ring-1 ring-sky-400/10'
                        : 'bg-white/[0.01] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]'
                    }
                  `}
                >
                  <p className="text-sm font-bold text-white">{t.label}</p>
                  <p className="text-lg font-bold text-sky-400 mt-1">{t.rate}%</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">Example rate, not an offer</p>
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button (phones; on desktop the results are live) */}
          <div className="p-6 sm:p-8 lg:hidden">
            <button
              onClick={() => setShowResults(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Calculator className="w-5 h-5" />
              Calculate Monthly Repayments
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Results */}
          {resultsShown && (
            <div className="border-t border-white/[0.04] lg:border-t-0">
              {/* Primary Result */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-green-400/[0.04] to-transparent text-center">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your Estimated Monthly Repayment</p>
                <p className="text-5xl sm:text-6xl xl:text-7xl font-bold text-white mb-2">
                  {fmtDec(result.monthlyPayment)}
                </p>
                <p className="text-sm text-gray-400">
                  over {termMonths} months at an example rate of {term.rate}%
                </p>

                {isCashFlowPositive && (
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/20">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-green-400">
                      Cash-flow positive! You save {fmt(Math.abs(result.netMonthlyCost))}/month
                    </span>
                  </div>
                )}
                {!isCashFlowPositive && (
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20">
                    <ArrowDownRight className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">
                      Net cost: {fmt(result.netMonthlyCost)}/month until payback
                    </span>
                  </div>
                )}

                {/* The calculator answered the question and then offered
                    nothing. This is the highest intent moment on the page. */}
                <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="/solar-calculator?src=financing-calc"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm whitespace-nowrap transition-all active:scale-[0.98]"
                  >
                    Check my savings
                  </a>
                  <a
                    href="/solar-calculator"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/[0.12] bg-white/[0.03] text-gray-300 hover:text-white text-sm whitespace-nowrap transition-all"
                  >
                    Check it against my actual bill
                  </a>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="p-6 sm:p-8">
                <h4 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Full Cost Breakdown
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: 'System Cost', value: fmt(result.systemCost), sub: 'Before grant', color: 'text-gray-400' },
                    { label: 'After SEAI Grant', value: fmt(result.netCost), sub: `-${SOLAR_DATA.grant.label} applied`, color: 'text-green-400' },
                    { label: `Deposit (${depositPercent}%)`, value: fmt(result.depositPercent > 0 ? result.depositAmount : 0), sub: depositPercent === 0 ? 'No upfront cost' : 'Paid today', color: 'text-white' },
                    { label: 'Loan Amount', value: fmt(result.loanAmount), sub: `Over ${term.label} at ${term.rate}%`, color: 'text-sky-400' },
                    { label: 'Monthly Payment', value: fmtDec(result.monthlyPayment), sub: 'Estimated repayment', color: 'text-amber-400' },
                    { label: 'Total Interest', value: fmt(result.totalInterest), sub: 'Cost of borrowing', color: 'text-rose-400' },
                    { label: 'Total Repayable', value: fmt(result.totalRepayable), sub: 'Loan + interest', color: 'text-white' },
                    { label: 'Total Out of Pocket', value: fmt(result.totalOutOfPocket), sub: 'Deposit + all repayments', color: 'text-white' },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-[11px] text-gray-600 uppercase tracking-wider">{item.label}</p>
                      <p className={`text-lg font-bold ${item.color} mt-1`}>{item.value}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{item.sub}</p>
                    </div>
                  ))}
                </div>

                {/* The figures above finance the AFTER-GRANT cost, which assumes
                    the grant is assigned to us. SEAI's default is to pay it to
                    the homeowner instead, and in that case the amount borrowed
                    at the start is the full price. Saying so is not optional:
                    it changes what the customer actually signs for. */}
                <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-amber-400/[0.06] border border-amber-400/15">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <span className="font-semibold text-white">About the grant timing.</span>{' '}
                    These figures assume the {SOLAR_DATA.grant.label} grant is applied to your price
                    up front. SEAI pays the grant into whichever bank account is nominated on the
                    Request for Payment form (SEAI says to allow 4 to 6 weeks once it has all the
                    completion documents and the post-works BER), and by default that account is yours. Ask us at quote stage which
                    applies to your job, because if the grant comes to you the amount you borrow at
                    the start is {fmt(result.systemCost)}, not {fmt(result.netCost)}.
                  </p>
                </div>
              </div>

              {/* Comparison Toggle */}
              <div className="px-6 sm:px-8 pb-6">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                >
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Compare: Upfront vs Financed
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showComparison ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showComparison && (
                <div className="px-6 sm:px-8 pb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Upfront */}
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-green-400/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Banknote className="w-5 h-5 text-green-400" />
                        <h5 className="text-sm font-bold text-white">Pay Upfront</h5>
                        <span className="ml-auto px-2 py-0.5 rounded-md bg-green-400/10 text-[10px] font-bold text-green-400 uppercase">
                          Best ROI
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Total Cost</span>
                          <span className="text-sm font-bold text-white">{fmt(result.netCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Annual Savings</span>
                          <span className="text-sm font-bold text-green-400">{fmt(result.annualSaving)}/yr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Payback Period</span>
                          <span className="text-sm font-bold text-amber-400">{result.paybackUpfront.toFixed(1)} years</span>
                        </div>
                        <div className="flex justify-between border-t border-white/[0.06] pt-3">
                          <span className="text-xs text-gray-500">25-Year Net Savings</span>
                          <span className="text-sm font-bold text-green-400">{fmt(result.saving25yrUpfront)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financed */}
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-sky-400/20">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-sky-400" />
                        <h5 className="text-sm font-bold text-white">Finance over {term.label}</h5>
                        {isCashFlowPositive && (
                          <span className="ml-auto px-2 py-0.5 rounded-md bg-green-400/10 text-[10px] font-bold text-green-400 uppercase">
                            Cash-flow +
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Total Out of Pocket</span>
                          <span className="text-sm font-bold text-white">{fmt(result.totalOutOfPocket)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Monthly Payment</span>
                          <span className="text-sm font-bold text-sky-400">{fmtDec(result.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Net Monthly Cost</span>
                          <span className={`text-sm font-bold ${isCashFlowPositive ? 'text-green-400' : 'text-amber-400'}`}>
                            {result.netMonthlyCost > 0 ? '+' : ''}{fmt(result.netMonthlyCost)}/mo
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-white/[0.06] pt-3">
                          <span className="text-xs text-gray-500">25-Year Net Savings</span>
                          <span className="text-sm font-bold text-green-400">{fmt(result.saving25yrFinanced)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinancingOptions() {
  const options = [
    {
      title: 'Green or Home Improvement Loan',
      icon: Banknote,
      color: 'green',
      tag: 'Flexible',
      tagColor: 'bg-green-400/10 text-green-400',
      iconBg: 'bg-green-400/10',
      iconColor: 'text-green-400',
      items: [
        'Offered by Irish banks and credit unions',
        'Each lender sets its own rate, term and deposit rules',
        'Compare the APR and total cost of credit you are quoted',
        'The SEAI grant arrives after the work, so you can put it against the loan',
        'Solar on its own is not covered by the SBCI Home Energy Upgrade Loan',
        'Use the calculator above with the rate you are actually offered',
      ],
    },
    {
      title: 'Pay Upfront',
      icon: PiggyBank,
      color: 'amber',
      tag: 'Best ROI',
      tagColor: 'bg-amber-400/10 text-amber-400',
      iconBg: 'bg-amber-400/10',
      iconColor: 'text-amber-400',
      items: [
        'Fastest payback: about 6 to 7 years after the SEAI grant',
        'Highest 25-year return on investment',
        'No interest costs - every cent goes to savings',
        'Worth comparing with what your savings currently earn',
        `${eurWhole(NET_LOW)} to ${eurWhole(NET_HIGH)} typical out-of-pocket cost after the grants`,
        'A better BER rating for the house',
      ],
    },
    {
      title: 'Mortgage Top-Up',
      icon: CreditCard,
      color: 'sky',
      tag: 'Ask Your Lender',
      tagColor: 'bg-sky-400/10 text-sky-400',
      iconBg: 'bg-sky-400/10',
      iconColor: 'text-sky-400',
      items: [
        'Add solar cost to your existing mortgage, where your lender allows it',
        'Mortgage rates are usually lower than personal loan rates',
        'Spread over the remaining mortgage term',
        'A long term can mean more interest in total: compare the full cost',
        'SEAI grant reduces the amount you need to add',
        'Speak to your lender about green mortgage top-ups',
      ],
    },
  ];

  return (
    <section className="py-20 lg:py-28 px-4 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <Lightbulb className="w-3.5 h-3.5" />
            Your Options
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold mb-4 lg:mb-5 lg:leading-tight">
            Three Ways to{' '}
            <span className="text-gradient">Pay for Solar</span>
          </h2>
          <p className="text-gray-400 text-lg xl:text-xl max-w-2xl mx-auto">
            Every option has merits - the right one depends on your savings, mortgage situation,
            and whether you want to be cash-flow positive from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.title}
                className="relative p-6 lg:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
              >
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${opt.tagColor} mb-4`}>
                  {opt.tag}
                </span>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${opt.iconColor}`} />
                  </div>
                  <h3 className="text-lg xl:text-xl font-bold text-white">{opt.title}</h3>
                </div>
                <ul className="space-y-3">
                  {opt.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400/60 shrink-0 mt-0.5" />
                      <span className="text-sm lg:text-base text-gray-400 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowFinancingWorks() {
  const steps = [
    {
      num: '01',
      title: 'Get Your Free Estimate',
      desc: 'Upload a bill to the free solar calculator for your system size, saving and payback, then talk it through with us on a call. A site survey confirms the roof and you get an itemised quote, with prices shown before and after the SEAI grant, and we guide you through your grant application, which you make online before any work starts.',
    },
    {
      num: '02',
      title: 'Arrange Your Finance',
      desc: 'If you choose to borrow, take the itemised quote to your bank or credit union. Each lender sets its own rate, term and approval time, so compare the APR and total cost of credit you are quoted. Solar on its own is not covered by the SBCI Home Energy Upgrade Loan.',
    },
    {
      num: '03',
      title: 'Installation in One Day',
      desc: 'Once finance is approved (or you pay upfront), we install your system in a single day. Our RECI-registered team handles scaffolding, panel mounting, wiring, and commissioning. We also submit the ESB grid connection notification on your behalf.',
    },
    {
      num: '04',
      title: 'Start Saving Immediately',
      desc: 'Your system starts generating electricity the same day. Depending on the rate and term, your monthly saving on electricity can come close to, or beat, your loan repayment, and the SEAI grant follows a few weeks after the paperwork is in.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 px-4 bg-[#0a0a0a]">
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <Clock className="w-3.5 h-3.5" />
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold mb-4 lg:mb-5 lg:leading-tight">
            From Quote to{' '}
            <span className="text-gradient">Saving in Days</span>
          </h2>
          <p className="text-gray-400 text-lg xl:text-xl max-w-2xl mx-auto">
            The financing process is simpler than you might think. Here&apos;s the step-by-step journey from
            initial inquiry to lower electricity bills.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative p-6 lg:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-green-400/20 transition-colors"
            >
              <span className="text-4xl font-bold text-white/[0.04] absolute top-4 right-6">
                {step.num}
              </span>
              <h3 className="text-lg xl:text-xl font-bold text-white mb-2 lg:mb-3">{step.title}</h3>
              <p className="text-sm lg:text-base text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinancingFAQ() {
  // One source for the visible FAQ and the FAQPage schema (financing-faq.ts).
  // The old inline list printed unsourced APRs, wrongly said the SBCI loan
  // covers solar on its own, and showed a literal "${fmtEur(...)}" to readers.
  const faqs = FINANCING_FAQS;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 lg:py-28 px-4 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-3xl lg:max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <div className="text-center lg:text-left mb-14 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-violet-400/[0.06] border border-violet-400/[0.1] mb-5">
            <HelpCircle className="w-3 h-3 text-violet-400" />
            Financing FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold mb-4 lg:mb-5 lg:leading-tight">
            Financing{' '}
            <span className="text-gradient">Questions Answered</span>
          </h2>
          <p className="text-gray-400 text-lg xl:text-xl max-w-2xl mx-auto">
            Common questions about paying for solar panels in Ireland. Can&apos;t find your answer? Ask us directly.
          </p>
        </div>

        <div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-xl overflow-hidden border transition-all duration-300 ${
                openIndex === i
                  ? 'bg-white/[0.04] border-white/[0.1]'
                  : 'bg-white/[0.01] border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 lg:px-6 lg:py-5 text-left group"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm sm:text-[15px] lg:text-[17px] font-medium text-gray-300 group-hover:text-white transition-colors leading-snug">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                    openIndex === i ? 'rotate-180 text-amber-400' : 'text-gray-600'
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 lg:px-6 lg:pb-5">
                  <p className="text-sm lg:text-base text-gray-400 leading-relaxed pl-0">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center lg:text-left">
          <p className="text-sm lg:text-base text-gray-500">
            Still have questions?{' '}
            <a
              href={buildWhatsAppUrl({ source: 'financing-faq' })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              Ask us on WhatsApp →
            </a>
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-3xl lg:max-w-5xl mx-auto text-center">
        <div className="rounded-2xl border border-green-400/20 bg-gradient-to-b from-green-400/[0.06] to-transparent p-10 sm:p-14 lg:p-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold mb-4 lg:mb-5 lg:leading-tight">
            Ready to See Your{' '}
            <span className="text-gradient">Payment Options?</span>
          </h2>
          <p className="text-gray-400 text-lg xl:text-xl mb-8 max-w-xl lg:max-w-2xl mx-auto">
            Get a free, itemised quote with financing breakdown. We&apos;ll show you exactly
            what you&apos;d pay upfront, monthly, and over 25 years. Every figure itemised, nothing added later.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={buildWhatsAppUrl({
                source: 'financing-page-cta',
                customMessage: "Hi, I'd like to discuss financing options for solar panels.",
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Get Free Quote
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/solar-calculator"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/[0.08] text-gray-300 font-medium text-sm hover:border-white/[0.15] hover:text-white transition-all"
            >
              <Calculator className="w-4 h-4" />
              Savings Calculator
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Client Component ─── */

export default function FinancingClient() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main>
        <FinancingHero />
        <FinancingShortAnswer />
        <TrustBadges />
        <FinancingCalculator />
        <FinancingOptions />
        <HowFinancingWorks />
        <FinancingFAQ />
        <FinalCTA />
      </main>

      <Footer />
      <WhatsAppChat />
      <PageIntake sticky={{ label: 'Check my savings', href: '/solar-calculator' }} exit={true} />
    </div>
  );
}
