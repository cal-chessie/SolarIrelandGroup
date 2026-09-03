'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
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

/* ─── Data ─── */

const SYSTEM_PRESETS = [
  { label: 'Apartment (1-2 bed)', panels: 6, kwp: 2.64, costBeforeGrant: 4500, icon: '🏢' },
  { label: 'Semi-Detached (3 bed)', panels: 10, kwp: 4.4, costBeforeGrant: 6000, icon: '🏠' },
  { label: 'Detached (4 bed)', panels: 14, kwp: 6.16, costBeforeGrant: 7500, icon: '🏡' },
  { label: 'Large Detached (5+ bed)', panels: 18, kwp: 7.92, costBeforeGrant: 9000, icon: '🏰' },
  { label: 'Maximum System', panels: 22, kwp: 9.68, costBeforeGrant: 10500, icon: '⚡' },
];

const FINANCE_TERMS = [
  { months: 36, label: '3 years', rate: 5.9 },
  { months: 60, label: '5 years', rate: 6.4 },
  { months: 84, label: '7 years', rate: 6.9 },
  { months: 120, label: '10 years', rate: 7.9 },
];

const DEPOSIT_OPTIONS = [0, 10, 20, 30, 50];

function calculateFinancing(
  systemCost: number,
  grant: number,
  depositPercent: number,
  termMonths: number,
  apr: number
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

  // Annual savings estimate (conservative)
  const annualSaving = netCost * 0.18;
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

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-green-400/10 text-green-400 border border-green-400/20 mb-6">
          <CreditCard className="w-3.5 h-3.5" />
          Solar Financing
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Solar Panel{' '}
          <span className="text-gradient">Payment Plans</span>
          <br />
          for Irish Homes
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          See exactly what your monthly repayments would be. Compare upfront vs finance,
          factor in the €1,800 SEAI grant, and find out if solar pays for itself from day one.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { icon: CreditCard, label: 'From 0% Deposit', sub: 'Many green loans' },
            { icon: Percent, label: '5.5–7.9% APR', sub: 'Green loan rates' },
            { icon: TrendingUp, label: 'Cash-Flow Positive', sub: 'Savings > repayments' },
            { icon: Shield, label: '€1,800 Grant (ROI)', sub: 'Reduces your loan' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-green-400/20 transition-colors"
              >
                <Icon className="w-5 h-5 text-green-400 mb-2" />
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
    { icon: CheckCircle2, label: 'Transparent Pricing', desc: 'No hidden fees' },
    { icon: Euro, label: '€1,800 Grant (ROI)', desc: 'Automatic deduction' },
    { icon: BadgeCheck, label: 'Green Loan Friendly', desc: 'Work with all major lenders' },
  ];

  return (
    <section className="py-8 px-4 bg-[#0a0a0a] border-y border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-green-400" />
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

function FinancingCalculator() {
  const [systemIndex, setSystemIndex] = useState(1);
  const [depositPercent, setDepositPercent] = useState(0);
  const [termMonths, setTermMonths] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const system = SYSTEM_PRESETS[systemIndex];
  const term = FINANCE_TERMS.find((t) => t.months === termMonths) ?? FINANCE_TERMS[1];

  const result = useMemo(
    () =>
      calculateFinancing(
        system.costBeforeGrant,
        SOLAR_DATA.grant.amount,
        depositPercent,
        termMonths,
        term.rate
      ),
    [system.costBeforeGrant, depositPercent, termMonths, term.rate]
  );

  const isCashFlowPositive = result.netMonthlyCost < 0;

  return (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <Calculator className="w-3.5 h-3.5" />
            Payment Calculator
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Calculate Your{' '}
            <span className="text-gradient">Monthly Repayments</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Pick your system size, choose your deposit and loan term, and see exactly
            what you&apos;d pay each month - with the SEAI grant already deducted.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          {/* System Selection */}
          <div className="p-6 sm:p-8 border-b border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              1. Choose Your System
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              The size of system that fits your home determines the total cost.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                  <p className="text-xs font-semibold text-white leading-tight">{s.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{s.panels} panels · {s.kwp} kWp</p>
                  <p className="text-sm font-bold text-amber-400 mt-1.5">{fmt(s.costBeforeGrant)}</p>
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
                  <p className="text-sm font-semibold text-white">SEAI Grant Automatically Applied</p>
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
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-green-400" />
              2. Deposit Amount
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Choose how much to pay upfront. Many green loans require no deposit - the grant acts as your deposit.
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
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-sky-400" />
              3. Loan Term &amp; Rate
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Longer terms mean lower monthly payments but more interest overall.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  <p className="text-[10px] text-gray-600 mt-0.5">Representative APR</p>
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <div className="p-6 sm:p-8">
            <button
              onClick={() => setShowResults(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Calculator className="w-5 h-5" />
              Calculate Monthly Repayments
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          {showResults && (
            <div className="border-t border-white/[0.04]">
              {/* Primary Result */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-green-400/[0.04] to-transparent text-center">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your Estimated Monthly Repayment</p>
                <p className="text-5xl sm:text-6xl font-bold text-white mb-2">
                  {fmtDec(result.monthlyPayment)}
                </p>
                <p className="text-sm text-gray-400">
                  over {termMonths} months at {term.rate}% APR
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
              </div>

              {/* Breakdown Grid */}
              <div className="p-6 sm:p-8">
                <h4 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Full Cost Breakdown
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'System Cost', value: fmt(result.systemCost), sub: 'Before grant', color: 'text-gray-400' },
                    { label: 'After SEAI Grant', value: fmt(result.netCost), sub: `-${SOLAR_DATA.grant.label} applied`, color: 'text-green-400' },
                    { label: 'Deposit ({depositPercent}%)', value: fmt(result.depositPercent > 0 ? result.depositAmount : 0), sub: depositPercent === 0 ? 'No upfront cost' : 'Paid today', color: 'text-white' },
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
    </section>
  );
}

function FinancingOptions() {
  const options = [
    {
      title: 'Green Loan (Recommended)',
      icon: Banknote,
      color: 'green',
      tag: 'Most Popular',
      tagColor: 'bg-green-400/10 text-green-400',
      iconBg: 'bg-green-400/10',
      iconColor: 'text-green-400',
      items: [
        '5.5–7.9% APR from Irish banks & credit unions',
        'Repayment terms from 3 to 10 years',
        'Typically no deposit required',
        'SEAI grant reduces the loan amount automatically',
        'Monthly savings often exceed repayments from day one',
        'Available from AIB, Bank of Ireland, PTSB, credit unions',
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
        'Fastest payback: 5–7 years after SEAI grant',
        'Highest 25-year return on investment',
        'No interest costs - every cent goes to savings',
        'Best option if you have savings earning less than 7%',
        '€2,700–€8,700 typical out-of-pocket cost after grant',
        'Instant equity increase in your property',
      ],
    },
    {
      title: 'Mortgage Top-Up',
      icon: CreditCard,
      color: 'sky',
      tag: 'Lowest Rate',
      tagColor: 'bg-sky-400/10 text-sky-400',
      iconBg: 'bg-sky-400/10',
      iconColor: 'text-sky-400',
      items: [
        'Add solar cost to your existing mortgage',
        'Typically the lowest interest rate available',
        'Spread over remaining mortgage term (15–25 years)',
        'Monthly impact is minimal on a large mortgage',
        'SEAI grant reduces the amount you need to add',
        'Speak to your lender about green mortgage top-ups',
      ],
    },
  ];

  return (
    <section className="py-20 px-4 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <Lightbulb className="w-3.5 h-3.5" />
            Your Options
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Three Ways to{' '}
            <span className="text-gradient">Pay for Solar</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Every option has merits - the right one depends on your savings, mortgage situation,
            and whether you want to be cash-flow positive from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.title}
                className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
              >
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${opt.tagColor} mb-4`}>
                  {opt.tag}
                </span>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${opt.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{opt.title}</h3>
                </div>
                <ul className="space-y-3">
                  {opt.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400/60 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-400 leading-relaxed">{item}</span>
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
      title: 'Get Your Free Quote',
      desc: 'Book a free, no-obligation site survey. We assess your roof, recommend the optimal system size, and provide a detailed itemised quote. The SEAI grant of €1,800 is deducted from the price shown - no extra paperwork required on your end.',
    },
    {
      num: '02',
      title: 'Apply for Green Finance',
      desc: 'If you choose to finance, we can recommend lenders currently offering competitive green loan rates. Most Irish banks and credit unions have dedicated solar/energy efficiency loans with rates from 5.5% APR. The application is straightforward and typically takes 3–5 business days.',
    },
    {
      num: '03',
      title: 'Installation in One Day',
      desc: 'Once finance is approved (or you pay upfront), we install your system in a single day. Our RECI-registered team handles scaffolding, panel mounting, wiring, and commissioning. We also submit the ESB grid connection notification on your behalf.',
    },
    {
      num: '04',
      title: 'Start Saving Immediately',
      desc: 'Your system starts generating electricity the same day. With a green loan, your monthly savings on electricity often exceed your loan repayment from the very first month - meaning solar costs you nothing extra and actually puts money in your pocket from day one.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <Clock className="w-3.5 h-3.5" />
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            From Quote to{' '}
            <span className="text-gradient">Saving in Days</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The financing process is simpler than you might think. Here&apos;s the step-by-step journey from
            initial inquiry to lower electricity bills.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-green-400/20 transition-colors"
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

function FinancingFAQ() {
  const faqs = [
    {
      q: 'Can I get finance for solar panels in Ireland?',
      a: `Yes. Several Irish banks and credit unions offer green loans specifically for solar panel installations. Typical rates range from 5.5% to 8.9% APR, with repayment terms from 3 to 10 years. AIB, Bank of Ireland, and PTSB all have dedicated green loan products. Many customers find that their monthly savings on electricity bills exceed their loan repayments from day one, making the decision a no-brainer. We can recommend suitable lenders during your free survey.`,
    },
    {
      q: 'How does the SEAI grant work with financing?',
      a: `The €1,800 SEAI grant (Republic of Ireland only) is paid directly to your installer (us) after the system is commissioned and a post-install BER assessment is completed. This means the grant automatically reduces the amount you need to finance. For example, if you choose a €6,000 system, the grant brings it down to €4,200 - so you only need to borrow €4,200. You never have to pay the full amount and wait for a refund.`,
    },
    {
      q: 'Is it better to pay upfront or finance solar panels?',
      a: `It depends on your circumstances. Paying upfront gives the best pure return on investment - a typical payback of 5–7 years - because there are no interest costs. However, financing can be cash-flow positive from day one if your monthly electricity savings exceed your loan repayments. With green loan rates as low as 5.5% APR, financed solar still delivers €20,000–€35,000 in net savings over 25 years. If your savings are earning less than 5% in a deposit account, financing at 5.5% while earning 18% ROI on solar makes financial sense.`,
    },
    {
      q: 'What deposit do I need for solar panel finance?',
      a: `Many green loans in Ireland require no deposit at all - you can borrow 100% of the post-grant cost. The SEAI grant effectively acts as a deposit since it reduces the total installation cost before you even need to borrow. Some lenders offer green loans up to €15,000 with no deposit and flexible repayment terms. Even a small deposit of 10–20% can significantly reduce your monthly repayments and total interest paid.`,
    },
    {
      q: 'Can I add solar to my existing mortgage?',
      a: `Yes, this is called a mortgage top-up and it can be the cheapest option. Because mortgage rates (typically 3.5–4.5%) are lower than personal loan rates, your monthly cost is minimal when spread over your remaining mortgage term. For example, adding €4,200 to a €200,000 mortgage over 20 years adds roughly €25/month. Contact your existing lender to ask about green or energy-efficiency mortgage top-ups. Not all lenders offer this, but most major Irish banks do.`,
    },
    {
      q: 'What if I sell my house before the loan is paid off?',
      a: `Solar panels add significant value to your property - typically €10,000–€15,000 according to the SEAI and BER assessment data. You have a few options: pay off the remaining loan balance from the sale proceeds (the increase in property value usually covers this), transfer the loan to your new property, or the buyer can assume the green loan in some cases. Either way, solar is a net positive for your property value and selling price.`,
    },
    {
      q: 'Are there any government-backed green finance schemes?',
      a: `While the Irish government doesn&apos;t directly offer solar loans, the SEAI grant significantly reduces your upfront cost. Additionally, the Home Energy Upgrade Loan scheme, launched in partnership with the Strategic Banking Corporation of Ireland (SBCI), offers reduced-rate loans for energy efficiency improvements including solar panels. These loans are available through participating lenders at rates that can be 1–2% lower than standard personal loans. We can check your eligibility during the survey.`,
    },
    {
      q: 'How quickly can I get approved for a green loan?',
      a: `Most green loan applications are approved within 3–5 business days. Online applications through your bank are typically fastest. Credit union loans may take slightly longer (5–7 days) but often offer more competitive rates. We recommend applying for finance before or immediately after your free survey so everything is in place for installation day. There&apos;s no obligation to proceed even if you&apos;re pre-approved.`,
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-violet-400/[0.06] border border-violet-400/[0.1] mb-5">
            <HelpCircle className="w-3 h-3 text-violet-400" />
            Financing FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Financing{' '}
            <span className="text-gradient">Questions Answered</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Common questions about paying for solar panels in Ireland. Can&apos;t find your answer? Ask us directly.
          </p>
        </div>

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
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left group"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm sm:text-[15px] font-medium text-gray-300 group-hover:text-white transition-colors leading-snug">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                    openIndex === i ? 'rotate-180 text-amber-400' : 'text-gray-600'
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-400 leading-relaxed pl-0">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
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
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto text-center">
        <div className="rounded-2xl border border-green-400/20 bg-gradient-to-b from-green-400/[0.06] to-transparent p-10 sm:p-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to See Your{' '}
            <span className="text-gradient">Payment Options?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Get a free, itemised quote with financing breakdown. We&apos;ll show you exactly
            what you&apos;d pay upfront, monthly, and over 25 years - no hidden fees, no pressure.
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
        <TrustBadges />
        <FinancingCalculator />
        <FinancingOptions />
        <HowFinancingWorks />
        <FinancingFAQ />
        <FinalCTA />
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
