'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap,
  Euro,
  Clock,
  TrendingUp,
  Leaf,
  Sun,
  ArrowRight,
  MessageCircle,
  Home,
  Building2,
  Warehouse,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   CALCULATION ENGINE — all client-side, no API calls
   ═══════════════════════════════════════════════════════════════ */

interface HomeProfile {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  avgRoofKwp: number;    // typical usable roof capacity
  description: string;
}

const HOME_PROFILES: HomeProfile[] = [
  {
    id: 'apartment',
    label: 'Apartment / Terrace',
    icon: Building2,
    avgRoofKwp: 2.5,
    description: 'Smaller roof, 6-8 panels',
  },
  {
    id: 'semi',
    label: 'Semi-Detached',
    icon: Home,
    avgRoofKwp: 4,
    description: 'Standard roof, 10-12 panels',
  },
  {
    id: 'detached',
    label: 'Detached',
    icon: Warehouse,
    avgRoofKwp: 6,
    description: 'Large roof, 14-16 panels',
  },
];

function calculateSavings(monthlyBill: number, homeId: string) {
  const annualBill = monthlyBill * 12;
  const home = HOME_PROFILES.find((h) => h.id === homeId) || HOME_PROFILES[1];
  const systemSize = home.avgRoofKwp;

  // ─── Generation ───
  // 1070 kWh/kWp/year — SEAI TMY data for south-facing Irish roof at 35° tilt
  // Matches the BillAnalyser API exactly so numbers are consistent across the site
  const annualGeneration = systemSize * 1070;

  // ─── Estimate usage from bill ───
  // Real Irish standing charge: ~€130/yr (€10.80/mo avg across providers)
  // Real Irish unit rate: ~€0.42/kWh (2026 avg across Electric Ireland, ESB, SSE, etc.)
  const standingChargeAnnual = 130;
  const unitRate = 0.42;
  const energyBill = Math.max(annualBill - standingChargeAnnual, 100);
  const estimatedUsage = Math.round(energyBill / unitRate);

  // ─── Self-consumption ───
  // Irish homes typically self-consume 40-55% of generated solar.
  // We use 50% flat — matches the BillAnalyser API methodology exactly.
  // (Higher in summer when generation exceeds usage, lower in winter)
  const selfConsumed = Math.min(annualGeneration * 0.5, estimatedUsage * 0.5);
  const exported = annualGeneration - selfConsumed;

  // ─── Savings ───
  const annualSaving = Math.round(selfConsumed * unitRate);
  const annualExport = Math.round(exported * SOLAR_DATA.export.ratePerKwh);
  const totalAnnualBenefit = annualSaving + annualExport;

  // ─── System cost ───
  const installCost = systemSize * 1500 + 2000;
  const costAfterGrant = installCost - SOLAR_DATA.grant.amount;

  // ─── Payback ───
  const paybackYears = Math.max(
    Math.round((costAfterGrant / totalAnnualBenefit) * 10) / 10,
    4
  );

  // ─── Bill reduction % ───
  // Solar only reduces your energy charges, NOT standing charges.
  // So compare savings against energy-only bill, not total bill.
  const energyBillReduction = Math.round(
    (totalAnnualBenefit / Math.max(energyBill, 1)) * 100
  );
  // Cap at 70% — even with a perfect system you can't offset 100% of energy costs
  // (night-time usage, winter short days, shading all reduce output)
  const billReduction = Math.min(energyBillReduction, 70);

  // ─── 25-year savings ───
  // 0.5% annual panel degradation, 3% electricity price inflation
  let total25yr = 0;
  let yearlyOutput = annualGeneration;
  let currentPrice = unitRate;
  for (let yr = 1; yr <= 25; yr++) {
    const selfUsed = Math.min(yearlyOutput * 0.5, estimatedUsage * 0.5);
    const exp = yearlyOutput - selfUsed;
    total25yr += selfUsed * currentPrice + exp * SOLAR_DATA.export.ratePerKwh;
    yearlyOutput *= 0.995;
    currentPrice *= 1.03;
  }
  total25yr = Math.round(total25yr);

  // ─── Carbon ───
  // Ireland grid: 0.29 kg CO2/kWh (2024 EPA data)
  const co2PerYear = Math.round(annualGeneration * 0.29);
  const treesEquiv = Math.round(co2PerYear / 22); // 1 tree absorbs ~22kg CO2/yr

  return {
    systemSize,
    annualGeneration,
    annualSaving,
    annualExport,
    totalAnnualBenefit,
    installCost,
    costAfterGrant,
    paybackYears,
    total25yr,
    co2PerYear,
    treesEquiv,
    billReduction,
    panelsEstimate: Math.round(systemSize * 2.8), // ~2.8 panels per kWp
    estimatedUsage,
    unitRate,
  };
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER — RAF-based, GPU-safe
   ═══════════════════════════════════════════════════════════════ */

function AnimatedValue({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1200,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);
  const prevValue = useRef(0);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      const start = performance.now();
      const from = 0;
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setDisplay(from + (value - from) * ease);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      return;
    }

    // Subsequent changes: animate from previous value
    const from = prevValue.current;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * ease);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    prevValue.current = value;
  }, [value, duration]);

  const formatted = display.toFixed(decimals).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ','
  );

  return (
    <span className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BILL SLIDER — custom range input styled for dark theme
   ═══════════════════════════════════════════════════════════════ */

function BillSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  // Map bill range €50-€500 to percentage 0-100
  const pct = ((value - 50) / (500 - 50)) * 100;

  return (
    <div className="w-full">
      {/* Big number display */}
      <div className="text-center mb-6">
        <div className="inline-flex items-baseline gap-1">
          <span className="text-5xl sm:text-6xl font-bold text-white">
            €
            <AnimatedValue
              value={value}
              duration={400}
            />
          </span>
          <span className="text-xl text-gray-400 font-medium">/month</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Drag to set your electricity bill
        </p>
      </div>

      {/* Custom slider track */}
      <div className="relative h-3 rounded-full bg-white/[0.06] cursor-pointer group">
        {/* Filled portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-100 ease-out"
          style={{ width: `${pct}%` }}
        />

        {/* Step markers */}
        {[0, 25, 50, 75, 100].map((mark) => (
          <div
            key={mark}
            className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-white/[0.06]"
            style={{ left: `${mark}%` }}
          />
        ))}

        {/* Native range input (invisible but functional) */}
        <input
          type="range"
          min={50}
          max={500}
          step={5}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Monthly electricity bill amount"
        />

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 shadow-lg shadow-amber-400/30 border-2 border-black transition-all duration-100 ease-out group-hover:scale-110 group-active:scale-95"
          style={{ left: `${pct}%` }}
        />

        {/* Glow on thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-400/20 pointer-events-none transition-all duration-100"
          style={{ left: `${pct}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2.5 text-xs text-gray-600">
        <span>€50</span>
        <span>€150</span>
        <span>€275</span>
        <span>€400</span>
        <span>€500</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME TYPE SELECTOR
   ═══════════════════════════════════════════════════════════════ */

function HomeTypeSelector({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {HOME_PROFILES.map((home) => {
        const Icon = home.icon;
        const isActive = selected === home.id;
        return (
          <button
            key={home.id}
            type="button"
            onClick={() => onChange(home.id)}
            className={`
              quick-calc-home-btn
              relative flex flex-col items-center gap-2 p-4 rounded-xl
              border transition-all duration-300 cursor-pointer
              ${isActive
                ? 'bg-amber-400/10 border-amber-400/30 shadow-lg shadow-amber-400/5'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
              }
            `}
          >
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                transition-all duration-300
                ${isActive
                  ? 'bg-amber-400/15 text-amber-400'
                  : 'bg-white/[0.04] text-gray-500'
                }
              `}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p
                className={`text-sm font-semibold transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
              >
                {home.label}
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {home.description}
              </p>
            </div>
            {isActive && (
              <span className="absolute -top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-amber-400 quick-calc-check-pop" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESULTS DISPLAY — animated reveal
   ═══════════════════════════════════════════════════════════════ */

function ResultsPanel({
  results,
  monthlyBill,
  homeType,
}: {
  results: ReturnType<typeof calculateSavings>;
  monthlyBill: number;
  homeType: string;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="quick-calc-results space-y-4">
      {/* ─── Hero Number: Annual Savings ─── */}
      <div className="text-center py-6 rounded-2xl bg-gradient-to-b from-amber-400/[0.08] to-transparent border border-amber-400/10">
        <p className="text-xs uppercase tracking-[0.15em] text-amber-400/70 font-semibold mb-2">
          You could save every year
        </p>
        <p className="text-5xl sm:text-6xl font-bold text-white">
          €
          <AnimatedValue
            value={results.totalAnnualBenefit}
            duration={1400}
          />
        </p>
        <p className="text-sm text-gray-400 mt-2">
          That's{' '}
          <span className="text-amber-400 font-semibold">
            up to {results.billReduction}% off
          </span>{' '}
          your energy bill
        </p>

        {/* Mini stat row */}
        <div className="flex items-center justify-center gap-4 mt-5">
          {[
            {
              icon: Zap,
              label: 'System',
              value: `${results.systemSize}kWp`,
            },
            {
              icon: Sun,
              label: 'Panels',
              value: `~${results.panelsEstimate}`,
            },
            {
              icon: Clock,
              label: 'Payback',
              value: `${results.paybackYears}yr`,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-1.5 text-xs text-gray-400"
              >
                <Icon className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  <span className="text-white font-semibold">
                    {stat.value}
                  </span>{' '}
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Stat Grid ─── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            icon: Euro,
            label: 'Bill after solar',
            value: `€${(
              monthlyBill * 12 -
              results.totalAnnualBenefit
            ).toLocaleString()}/yr`,
            color: 'text-green-400',
            bgColor: 'bg-green-400/10',
            sub: `Save €${results.annualSaving.toLocaleString()} + earn €${results.annualExport.toLocaleString()} export`,
          },
          {
            icon: TrendingUp,
            label: '25-year savings',
            value: `€${(Math.round(results.total25yr / 1000))}k+`,
            color: 'text-amber-400',
            bgColor: 'bg-amber-400/10',
            sub: `After ${SOLAR_DATA.grant.label} grant + install costs`,
          },
          {
            icon: Leaf,
            label: 'CO₂ offset per year',
            value: `${results.co2PerYear.toLocaleString()}kg`,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-400/10',
            sub: `Equivalent to ${results.treesEquiv} trees planted`,
          },
          {
            icon: Zap,
            label: 'Energy generated',
            value: `${results.annualGeneration.toLocaleString()}kWh`,
            color: 'text-sky-400',
            bgColor: 'bg-sky-400/10',
            sub: `Export surplus at ${SOLAR_DATA.export.label}`,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="quick-calc-stat-card rounded-xl bg-white/[0.02] border border-white/[0.06] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">
                {stat.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* ─── Expandable Details ─── */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-gray-500 hover:text-amber-400 transition-colors cursor-pointer"
      >
        <span>{showDetails ? 'Hide breakdown' : 'Show full breakdown'}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            showDetails ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-500 ease-out ${
          showDetails ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 pb-2">
            {/* Cost breakdown */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Cost Breakdown
              </h4>
              {[
                { label: 'Estimated install cost', value: `€${results.installCost.toLocaleString()}`, dim: false },
                { label: `Less ${SOLAR_DATA.grant.label} SEAI grant`, value: `-€${SOLAR_DATA.grant.amount.toLocaleString()}`, dim: false, color: 'text-amber-400' },
                { label: 'Cost after grant', value: `€${results.costAfterGrant.toLocaleString()}`, bold: true, color: 'text-white' },
                { label: 'Annual benefit', value: `€${results.totalAnnualBenefit.toLocaleString()}/yr`, bold: true, color: 'text-green-400' },
                { label: 'Simple payback', value: `${results.paybackYears} years`, bold: true, color: 'text-amber-400' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span
                    className={`text-sm font-semibold ${
                      row.color || (row.dim ? 'text-gray-600' : 'text-gray-300')
                    } ${row.bold ? 'font-bold' : ''}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Savings sources */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Where Your Savings Come From
              </h4>
              <div className="space-y-2">
                {/* Bar: self-consumption */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Self-consumed solar</span>
                    <span className="text-green-400 font-semibold">
                      €{results.annualSaving.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 quick-calc-bar-fill"
                      style={{
                        width: `${Math.min(
                          (results.annualSaving / results.totalAnnualBenefit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                {/* Bar: export */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Clean Export Guarantee</span>
                    <span className="text-amber-400 font-semibold">
                      €{results.annualExport.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 quick-calc-bar-fill"
                      style={{
                        width: `${Math.min(
                          (results.annualExport / results.totalAnnualBenefit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CTAs ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <a
          href={buildWhatsAppUrl({
            source: 'quick-calculator',
            monthlyBill,
            homeType: HOME_PROFILES.find(h => h.id === homeType)?.label || 'Semi-Detached',
            annualSaving: results.totalAnnualBenefit,
            paybackYears: results.paybackYears,
            total25yrSaving: results.total25yr,
            recommendedSystem: results.systemSize,
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="quick-calc-cta-whatsapp flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          Get Your Free Quote
          <ArrowRight className="w-4 h-4" />
        </a>
        <a
          href="#calculator"
          className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] text-amber-400 font-semibold text-sm hover:bg-amber-400/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          <Zap className="w-4 h-4" />
          Detailed AI Analysis
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-600 text-center leading-relaxed">
        Estimates based on SEAI grant rates, Met Éireann solar irradiance data for Ireland,
        and average self-consumption ratios. Actual savings depend on roof orientation, shading,
        and your consumption patterns. A free site survey gives you exact figures.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function QuickSavingsCalculator() {
  const [monthlyBill, setMonthlyBill] = useState(160);
  const [homeType, setHomeType] = useState('semi');
  const [showResults, setShowResults] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const results = calculateSavings(monthlyBill, homeType);

  const handleCalculate = useCallback(() => {
    setShowResults(true);
  }, []);

  const handleReset = useCallback(() => {
    setShowResults(false);
  }, []);

  return (
    <section
      id="quick-calculator"
      ref={sectionRef}
      className="py-20 px-4 bg-[#0a0a0a] relative"
    >
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 amber-line" />

      <div className="max-w-3xl mx-auto">
        {/* ─── Section Header ─── */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
              <Zap className="w-3.5 h-3.5" />
              Instant Results
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How Much Could You{' '}
              <span className="text-gradient">Save?</span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Two clicks. No signup. No bill upload needed. See your estimated
              savings right now.
            </p>
          </motion.div>
        </div>

        {/* ─── Calculator Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden shadow-2xl shadow-black/20">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Step 1: Bill Slider */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-bold">
                  1
                </span>
                <h3 className="text-sm font-semibold text-white">
                  Your Monthly Electricity Bill
                </h3>
              </div>
              <BillSlider value={monthlyBill} onChange={setMonthlyBill} />
            </div>

            {/* Step 2: Home Type */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                    showResults
                      ? 'bg-amber-400/20 text-amber-400'
                      : 'bg-white/[0.06] text-gray-600'
                  }`}
                >
                  2
                </span>
                <h3 className="text-sm font-semibold text-white">
                  Your Home Type
                </h3>
              </div>
              <HomeTypeSelector
                selected={homeType}
                onChange={setHomeType}
              />
            </div>

            {/* Step 3: Calculate / Reset */}
            {!showResults ? (
              <button
                type="button"
                onClick={handleCalculate}
                className="quick-calc-calc-btn w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-base shadow-xl shadow-amber-400/20 hover:shadow-amber-400/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <Euro className="w-5 h-5" />
                Show My Savings
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="quick-calc-reset-btn w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm hover:bg-white/[0.06] hover:text-white transition-all duration-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start Over
              </button>
            )}
          </div>

          {/* ─── Results (animated reveal) ─── */}
          {showResults && (
            <div className="border-t border-white/[0.06] p-6 sm:p-8 bg-white/[0.01]">
              <ResultsPanel results={results} monthlyBill={monthlyBill} homeType={homeType} />
            </div>
          )}
        </div>
        </motion.div>

        {/* ─── Trust signals below card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: Clock, label: 'Takes 5 seconds', sub: 'No signup needed' },
            {
              icon: Euro,
              label: '100% free',
              sub: 'No hidden costs',
            },
            {
              icon: Sun,
              label: 'SEAI accurate',
              sub: 'Based on real data',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]"
              >
                <Icon className="w-4 h-4 text-gray-500 mb-1.5" />
                <p className="text-[11px] text-gray-300 font-medium">
                  {item.label}
                </p>
                <p className="text-[10px] text-gray-600">{item.sub}</p>
              </div>
            );
          })}
        </div>
        </motion.div>

        {/* Link to detailed analyser */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
        <p className="text-center text-xs text-gray-600 mt-4">
          Want a personalised AI-powered report?{' '}
          <a
            href="#calculator"
            className="text-amber-400/70 hover:text-amber-400 underline underline-offset-2 transition-colors"
          >
            Upload your bill →
          </a>
        </p>
        </motion.div>
      </div>
    </section>
  );
}
