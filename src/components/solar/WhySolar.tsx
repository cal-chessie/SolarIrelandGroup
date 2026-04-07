'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from '@/lib/motion';
import {
  PiggyBank,
  TrendingUp,
  ShieldCheck,
  Sun,
  Zap,
  ArrowUpRight,
  Euro,
  Home as HomeIcon,
  Battery,
  ArrowRight,
  Info,
  MessageCircle,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ═══════════════════════════════════════════════════════
   DATA — all Irish-specific, zero carbon messaging
   ═══════════════════════════════════════════════════════ */

const stats = [
  { icon: Euro, label: 'Avg. annual saving', value: SOLAR_DATA.savings.avgAnnual, prefix: '€', suffix: '/yr', color: 'text-green-400', bg: 'bg-green-400/10' },
  { icon: TrendingUp, label: 'SEAI grant', value: SOLAR_DATA.grant.amount, prefix: '€', suffix: '', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { icon: Zap, label: 'Payback period', value: SOLAR_DATA.savings.paybackYears, prefix: '', suffix: ' years', color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { icon: Sun, label: 'Panel warranty', value: SOLAR_DATA.system.panelWarranty, prefix: '', suffix: '+ yrs', color: 'text-violet-400', bg: 'bg-violet-400/10' },
];

// Irish residential electricity prices (all-in per kWh, incl. VAT, PSO levy, standing charges)
const priceData = [
  { year: 2019, price: 0.24 },
  { year: 2020, price: 0.25 },
  { year: 2021, price: 0.28 },
  { year: 2022, price: 0.39 },
  { year: 2023, price: 0.36 },
  { year: 2024, price: 0.33 },
  { year: 2025, price: 0.31 },
];

// Monthly solar generation in Ireland (SEAI TMY Dublin, kWh per kWp installed)
const monthlyGen = [
  { month: 'Jan', gen: 29 },
  { month: 'Feb', gen: 48 },
  { month: 'Mar', gen: 76 },
  { month: 'Apr', gen: 103 },
  { month: 'May', gen: 125 },
  { month: 'Jun', gen: 131 },
  { month: 'Jul', gen: 123 },
  { month: 'Aug', gen: 113 },
  { month: 'Sep', gen: 88 },
  { month: 'Oct', gen: 60 },
  { month: 'Nov', gen: 34 },
  { month: 'Dec', gen: 24 },
];

const benefits = [
  {
    icon: PiggyBank,
    title: 'Slash Your Bills',
    stat: 'Up to 70%',
    statLabel: 'reduction on bills',
    description:
      'A typical Irish home with a 4kWp system saves €800–€1,200 per year on electricity. As ESB and other supplier prices rise year on year, your savings actually grow — your panels produce the same free energy regardless of what electricity costs on the open market.',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'hover:border-green-400/15',
  },
  {
    icon: TrendingUp,
    title: '€1,800 SEAI Grant',
    stat: '€1,800',
    statLabel: 'government grant',
    description:
      'The SEAI Solar PV scheme pays up to €1,800 towards your installation in 2026. Available to owner-occupiers of homes built before 2021 with a BER rating of C3 or lower. Our team handles the full grant application on your behalf — all included in the price.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'hover:border-amber-400/15',
  },
  {
    icon: Zap,
    title: 'Earn from Excess Energy',
    stat: SOLAR_DATA.export.label,
    statLabel: 'microgeneration tariff',
    description:
      `Under the Clean Export Guarantee, your energy supplier pays you ${SOLAR_DATA.export.label} for every kWh of excess solar energy you export to the national grid. Any energy your home doesn't use during the day is automatically sold — it appears as a credit on your bill.`,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'hover:border-sky-400/15',
  },
  {
    icon: HomeIcon,
    title: 'Boost Your BER Rating',
    stat: 'Higher',
    statLabel: 'property value',
    description:
      "Solar panels significantly improve your Building Energy Rating — a legal requirement when selling or renting a property in Ireland. A better BER makes your home more attractive to buyers and can increase market value. We coordinate the post-install BER assessment as part of our service.",
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'hover:border-violet-400/15',
  },
];

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER — lightweight RAF, no Framer Motion pipeline
   ═══════════════════════════════════════════════════════ */
function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          obs.disconnect();
          const duration = 2000;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * value;
            el.textContent = prefix + (decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString()) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, prefix, suffix, decimals]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════
   STAT CARD — animated number on scroll
   ═══════════════════════════════════════════════════════ */
function StatCard({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  color,
  bg,
}: (typeof stats)[0]) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 cursor-default"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-base sm:text-xl font-bold text-white leading-tight truncate">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        </p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   ENERGY PRICE CHART — the "problem" visual
   ═══════════════════════════════════════════════════════ */
function PriceChart() {
  const maxPrice = Math.max(...priceData.map((d) => d.price));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById('price-chart-bars');
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md bg-red-400/10 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-red-400" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400/80">
            The Energy Crisis
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white">
          Irish electricity prices keep rising
        </h3>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5 leading-relaxed">
          Average residential rate per kWh — all-in including VAT, PSO levy, and standing
          charges. Source: CRU, SEAI.
        </p>
      </div>

      {/* Horizontal bars — newest year at top */}
      <div id="price-chart-bars" className="space-y-2.5 sm:space-y-3">
        {[...priceData].reverse().map((d, i) => {
          const widthPercent = (d.price / maxPrice) * 100;
          const isCrisis = d.year === 2022;
          const isCurrent = d.year === 2025;
          const isPreCrisis = d.year < 2022;

          return (
            <div key={d.year} className="group">
              <div className="flex items-center gap-3">
                {/* Year label */}
                <span className="text-[11px] sm:text-xs text-gray-500 w-10 text-right font-mono shrink-0">
                  {d.year}
                </span>

                {/* Bar track */}
                <div className="flex-1 h-7 sm:h-8 rounded-lg bg-white/[0.03] overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                      isCrisis
                        ? 'bg-gradient-to-r from-red-500/80 to-red-400/50'
                        : isCurrent
                          ? 'bg-gradient-to-r from-amber-400/70 to-amber-400/35'
                          : isPreCrisis
                            ? 'bg-gradient-to-r from-amber-500/35 to-amber-500/15'
                            : 'bg-gradient-to-r from-amber-500/50 to-amber-500/25'
                    }`}
                    style={{
                      width: visible ? `${widthPercent}%` : '0%',
                      transitionDelay: `${i * 70}ms`,
                    }}
                  />
                  {/* Crisis badge */}
                  {isCrisis && visible && (
                    <span
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-red-400 uppercase tracking-wider hidden sm:inline motion-fade-in"
                      style={{ animationDelay: `${i * 70 + 500}ms` }}
                    >
                      Peak
                    </span>
                  )}
                </div>

                {/* Price label */}
                <span
                  className={`text-[11px] sm:text-xs font-mono w-11 sm:w-12 shrink-0 tabular-nums ${
                    isCrisis
                      ? 'text-red-400 font-bold'
                      : isCurrent
                        ? 'text-amber-400 font-bold'
                        : 'text-gray-400'
                  }`}
                >
                  €{d.price.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary callout */}
      <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 text-green-400" />
        </div>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          <span className="text-white font-semibold">
            Solar protects you from price rises.
          </span>{' '}
          Once installed, your panels generate free electricity regardless of what the
          ESB or any supplier charges. The more prices go up, the more valuable your
          system becomes.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MONTHLY GENERATION CHART — the "proof" visual
   ═══════════════════════════════════════════════════════ */
function GenerationChart() {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const maxGen = Math.max(...monthlyGen.map((d) => d.gen));
  const annualTotal = monthlyGen.reduce((sum, d) => sum + d.gen, 0);

  useEffect(() => {
    const el = document.getElementById('gen-chart-bars');
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-col sm:flex-row gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-amber-400/10 flex items-center justify-center">
              <Sun className="w-3 h-3 text-amber-400" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-400/80">
              SEAI Typical Meteorological Year
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Solar works year-round in Ireland
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5 leading-relaxed">
            Average monthly output per kWp installed — Dublin TMY data. Ireland gets{' '}
            <span className="text-white/70 font-medium">75–85% of the solar
            resource</span> that southern Spain receives.
          </p>
        </div>

        {/* Annual badge */}
        <div className="px-3.5 py-2 rounded-xl bg-amber-400/[0.08] border border-amber-400/[0.12] shrink-0 self-start">
          <p className="text-[10px] text-gray-500 mb-0.5">4kWp system annual output</p>
          <p className="text-sm sm:text-base font-bold text-amber-400 tabular-nums">
            ~{(annualTotal * 4).toLocaleString()} kWh
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="relative">
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[100, 75, 50, 25].map((pct) => (
            <div
              key={pct}
              className="border-t border-white/[0.03]"
              style={{ height: '1px' }}
            />
          ))}
        </div>

        <div id="gen-chart-bars" className="flex justify-between gap-[3px] sm:gap-2 h-[160px] sm:h-[200px] relative">
          {monthlyGen.map((d, i) => {
            const heightPercent = (d.gen / maxGen) * 100;
            const intensity = d.gen / maxGen;
            const isHovered = hoveredMonth === i;
            const genFor4kWp = d.gen * 4;

            return (
              <div
                key={d.month}
                className="flex-1 flex flex-col items-center gap-2 cursor-pointer select-none h-full"
                onMouseEnter={() => setHoveredMonth(i)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Bar wrapper */}
                <div className="w-full flex-1 relative min-h-0">
                  {/* Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-lg bg-amber-400 text-black shadow-lg shadow-amber-400/20 whitespace-nowrap"
                    >
                      <span className="text-[10px] font-bold tabular-nums">
                        {genFor4kWp} kWh
                      </span>
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rotate-45" />
                    </motion.div>
                  )}
                  {/* Bar */}
                  <div
                    className={`w-full absolute bottom-0 left-0 right-0 rounded-t-sm sm:rounded-t-md transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] transition-colors duration-200 ${
                      isHovered
                        ? 'bg-amber-400 shadow-lg shadow-amber-400/20'
                        : intensity > 0.85
                          ? 'bg-amber-400/50'
                          : intensity > 0.6
                            ? 'bg-amber-400/35'
                            : intensity > 0.35
                              ? 'bg-amber-400/25'
                              : 'bg-amber-400/15'
                    }`}
                    style={{
                      height: visible ? `${heightPercent}%` : '0%',
                      transitionDelay: `${i * 50}ms`,
                    }}
                  />
                </div>

                {/* Month label */}
                <span
                  className={`text-[8px] sm:text-[10px] font-medium transition-colors duration-200 ${
                    isHovered ? 'text-amber-400' : 'text-gray-600'
                  }`}
                >
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom insight */}
      <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-sky-400" />
        </div>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          Even in <span className="text-white font-semibold">December</span>, a 4kWp
          system generates roughly{' '}
          <span className="text-white font-semibold">96 kWh</span> — enough to power
          your lights, TV, fridge, and washing machine for the entire month. Solar
          panels work on light, not heat, so they perform well in Irish weather.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BENEFIT CARD — expandable on click
   ═══════════════════════════════════════════════════════ */
function BenefitCard({
  benefit,
  index,
}: {
  benefit: (typeof benefits)[0];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = benefit.icon;

  return (
    <motion.div
      className={`glass-card rounded-2xl p-5 sm:p-7 cursor-pointer transition-all duration-300 ${benefit.border} ${
        expanded ? 'ring-1 ring-white/[0.06]' : ''
      }`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top row: icon + stat */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl ${benefit.bg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${benefit.color}`} />
        </div>
        <div className="text-right">
          <p className={`text-xl sm:text-2xl font-bold ${benefit.color} leading-none`}>
            {benefit.stat}
          </p>
          <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-600 mt-1">
            {benefit.statLabel}
          </p>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-white mb-1">
        {benefit.title}
      </h3>

      {/* Expandable description */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          {benefit.description}
        </p>
      </div>

      {/* Toggle hint */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[10px] text-gray-600">
          {expanded ? 'Tap to collapse' : 'Tap for details'}
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-gray-600"
        >
          <ArrowUpRight className="w-3 h-3" />
        </motion.span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function WhySolar() {
  return (
    <section id="why-solar" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
      {/* Honeycomb background */}
      <div className="absolute inset-0 honeycomb-bg" />

      {/* Ambient glows */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[400px] bg-amber-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-400/[0.015] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ─── Section header ─── */}
        <motion.div
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/[0.06] border border-amber-400/[0.1] mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-[0.15em]">
              Why go solar
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl leading-[1.1]">
            Stop renting
            <br />
            <span className="text-gradient">your energy.</span>
          </h2>
          <p className="mt-4 text-gray-500 text-sm sm:text-base max-w-lg leading-relaxed">
            Every year, Irish homeowners send thousands of euro to energy suppliers.
            Solar flips that — generate your own electricity, sell the excess to the
            grid, and lock in savings for 25+ years.
          </p>
        </motion.div>

        {/* ─── Stats row ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* ─── Energy Price Rise Chart ─── */}
        <div className="mb-10 sm:mb-14">
          <PriceChart />
        </div>

        {/* ─── Benefits grid ─── */}
        <div className="mb-10 sm:mb-14">
          <motion.h3
            className="text-lg sm:text-xl font-bold text-white mb-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            The key benefits
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {benefits.map((benefit, i) => (
              <BenefitCard key={benefit.title} benefit={benefit} index={i} />
            ))}
          </div>
        </div>

        {/* ─── Monthly Generation Chart ─── */}
        <div className="mb-10 sm:mb-14">
          <GenerationChart />
        </div>

        {/* ─── Microgeneration earnings callout ─── */}
        <motion.div
          className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-sky-500/[0.08] to-sky-400/[0.04] border border-sky-400/[0.1] p-5 sm:p-7 mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-400/10 flex items-center justify-center shrink-0">
              <Euro className="w-6 h-6 text-sky-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                Get paid for the energy you don&apos;t use
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Under Ireland&apos;s Clean Export Guarantee (CEG), your electricity supplier
                must pay you for excess solar exported to the grid. Most suppliers
                currently offer{' '}
                <span className="text-white font-semibold">{SOLAR_DATA.export.label}</span> — paid
                automatically as a credit on your electricity bill. A typical 4kWp
                system can earn €200–€400 per year from exports alone.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── CTA strip ─── */}
        <motion.div
          className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400/10 to-amber-500/[0.04] border border-amber-400/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Ready to start saving?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Upload your electricity bill and get an instant AI-powered savings
              estimate — completely free.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <motion.a
              href="#calculator"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-400/15 whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              Analyse My Bill
              <ArrowRight className="w-4 h-4" />
            </motion.a>
            <motion.a
              href={buildWhatsAppUrl({ source: 'why-solar' })}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 text-green-400" />
              <span className="hidden sm:inline">WhatsApp</span>
            </motion.a>
          </div>
        </motion.div>

        {/* ─── Trust line ─── */}
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] sm:text-xs text-gray-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            { icon: Sun, label: 'SEAI Registered' },
            { icon: ShieldCheck, label: 'RECI Certified' },
            { icon: Zap, label: '25+ Year Panel Warranty' },
            { icon: Battery, label: 'Battery Options Available' },
          ].map((item, i) => (
            <span key={item.label} className="flex items-center gap-2">
              <item.icon className="w-3.5 h-3.5 text-amber-400/40" />
              {item.label}
              {i < 3 && (
                <span className="text-white/[0.06] ml-1">·</span>
              )}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
