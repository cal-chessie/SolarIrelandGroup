'use client';

import { useState, useCallback } from 'react';
import {
  Zap,
  Euro,
  Clock,
  TrendingDown,
  Leaf,
  Sun,
  ArrowRight,
  MessageCircle,
  Home,
  Building2,
  Warehouse,
  ChevronDown,
  Check,
  Sparkles,
  PanelTop,
  BatteryCharging,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';


const _CALC_VER = 'v2.8-apr13-2026-cache-fix'; // cache-bust: forces new chunk hash on every meaningful update

const UNIT_RATE = 0.34;          // €/kWh average incl. VAT across providers
const STANDING_CHARGE_ANNUAL = 200; // €/year — Irish standing charges 2025/2026
const GENERATION_PER_KWP = 1000;  // kWh/kWp/yr — well-optimized south-facing Irish roof
const PANEL_WATTS = 440;          // Modern panel wattage
const COST_PER_KWP = 1600;       // €/kWp installed (includes inverter, mounting, labour)
const BASE_INSTALL_COST = 1800;  // Fixed costs (scaffolding, design, commissioning, etc.)
const CEG_RATE = SOLAR_DATA.export.ratePerKwh; // €0.21/kWh — Clean Export Guarantee
const SEAI_GRANT = SOLAR_DATA.grant.amount;    // €1,800
const CO2_PER_KWH = 0.29;        // kg CO2 per kWh (EirGrid 2024 figure for Ireland)
const TREES_PER_YEAR_KG = 22;    // kg CO2 absorbed per tree per year

const MONTHLY_GEN_FACTOR: Record<string, number> = {
  Jan: 0.38, Feb: 0.55, Mar: 0.82, Apr: 1.05,
  May: 1.28, Jun: 1.38, Jul: 1.32, Aug: 1.18,
  Sep: 0.95, Oct: 0.72, Nov: 0.45, Dec: 0.32,
};
const AVG_MONTHLY_FACTOR = Object.values(MONTHLY_GEN_FACTOR).reduce((a, b) => a + b, 0) / 12;


const HOME_PROFILES = [
  { id: 'apartment', label: 'Apartment / Terrace', icon: Building2, minKwp: 1.5, maxKwp: 9.7, description: '4–22 panels' },
  { id: 'semi',      label: 'Semi-Detached',       icon: Home,     minKwp: 2.5, maxKwp: 9.7, description: '6–22 panels' },
  { id: 'detached',  label: 'Detached',            icon: Warehouse, minKwp: 3,   maxKwp: 9.7, description: '8–22 panels' },
];


function calculateSavings(monthlyBill: number, homeId: string) {
  const annualBill = monthlyBill * 12;
  const home = HOME_PROFILES.find((h) => h.id === homeId) || HOME_PROFILES[1];

  const energyCost = Math.max(annualBill - STANDING_CHARGE_ANNUAL, 100);
  const annualUsage = Math.round(energyCost / UNIT_RATE);

  const targetGeneration = annualUsage * 0.85;
  let idealKwp = targetGeneration / GENERATION_PER_KWP;
  idealKwp = Math.round(idealKwp * 2) / 2;
  const systemSizeKwp = Math.max(home.minKwp, Math.min(idealKwp, home.maxKwp));

  const panels = Math.round(systemSizeKwp * (1000 / PANEL_WATTS));

  const annualGeneration = Math.round(systemSizeKwp * GENERATION_PER_KWP);

  const sizeRatio = annualUsage / Math.max(annualUsage + annualGeneration, 1);
  const selfConsumptionRatio = Math.min(0.80, 0.48 + 0.38 * sizeRatio);

  const selfConsumedKwh = Math.round(annualGeneration * selfConsumptionRatio);
  const exportedKwh = annualGeneration - selfConsumedKwh;

  const annualSavingFromSelfUse = Math.round(selfConsumedKwh * UNIT_RATE);
  const annualExportEarnings = Math.round(exportedKwh * CEG_RATE);
  const totalAnnualBenefit = annualSavingFromSelfUse + annualExportEarnings;

  const annualBillAfterSolar = Math.max(annualBill - totalAnnualBenefit, STANDING_CHARGE_ANNUAL);
  const monthlyBillAfterSolar = Math.round((annualBillAfterSolar / 12) * 100) / 100;
  const monthlySavings = Math.round((monthlyBill - monthlyBillAfterSolar) * 100) / 100;
  const billReductionPct = Math.round((totalAnnualBenefit / annualBill) * 100);

  const installCost = Math.round(systemSizeKwp * COST_PER_KWP + BASE_INSTALL_COST);
  const costAfterGrant = installCost - SEAI_GRANT;
  const paybackYears = Math.max(Math.round((costAfterGrant / totalAnnualBenefit) * 10) / 10, 4);

  let total25yrSavings = 0;
  let yearlyGen = annualGeneration;
  let currentUnitRate = UNIT_RATE;
  for (let yr = 1; yr <= 25; yr++) {
    const self = Math.min(yearlyGen * selfConsumptionRatio, annualUsage * selfConsumptionRatio);
    const exp = yearlyGen - self;
    total25yrSavings += Math.round(self * currentUnitRate + exp * CEG_RATE);
    yearlyGen *= 0.995;       // 0.5% annual degradation
    currentUnitRate *= 1.03;   // 3% annual price rise
  }

  const co2PerYear = Math.round(annualGeneration * CO2_PER_KWH);
  const treesEquiv = Math.round(co2PerYear / TREES_PER_YEAR_KG);

  const energyIndependence = Math.round((selfConsumedKwh / annualUsage) * 100);

  const monthlyGeneration = Object.entries(MONTHLY_GEN_FACTOR).map(([month, factor]) => ({
    month,
    generation: Math.round((annualGeneration / 12) * (factor / AVG_MONTHLY_FACTOR)),
    factor,
  }));

  return {
    annualBill, annualUsage, unitRate: UNIT_RATE, standingCharge: STANDING_CHARGE_ANNUAL,
    systemSizeKwp, panels, annualGeneration,
    selfConsumedKwh, exportedKwh, selfConsumptionRatio: Math.round(selfConsumptionRatio * 100),
    energyIndependence,
    annualSavingFromSelfUse, annualExportEarnings, totalAnnualBenefit,
    annualBillAfterSolar, monthlyBillAfterSolar, monthlySavings, billReductionPct,
    installCost, costAfterGrant, paybackYears, total25yrSavings,
    co2PerYear, treesEquiv,
    monthlyGeneration,
  };
}


function fmtEur(n: number): string {
  return '€' + Math.round(n).toLocaleString();
}

function fmtEurDecimal(n: number): string {
  return '€' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


export default function QuickSavingsCalculator() {
  const [monthlyBill, setMonthlyBill] = useState(160);
  const [homeType, setHomeType] = useState('semi');
  const [showDetails, setShowDetails] = useState(false);

  const r = calculateSavings(monthlyBill, homeType);

  const handleBillChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyBill(Number(e.target.value));
  }, []);

  return (
    <section id="quick-calculator" className="py-20 px-4 bg-[#0a0a0a] relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 amber-line" />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <Zap className="w-3.5 h-3.5" />
            Solar Savings Calculator
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How Much Could You{' '}
            <span className="text-gradient">Save?</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Move the slider, pick your home type, and see your savings
            update instantly. Based on real Irish data.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden shadow-2xl shadow-black/20">
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-bold">1</span>
                <h3 className="text-sm font-semibold text-white">Your Monthly Electricity Bill</h3>
              </div>

              <div className="mt-4">
                <div className="text-center mb-4">
                  <span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                    &euro;{monthlyBill}
                  </span>
                  <p className="text-base text-gray-500 mt-2 font-medium">per month electricity bill</p>
                </div>

                <input
                  type="range"
                  min={50}
                  max={500}
                  step={5}
                  value={monthlyBill}
                  onChange={handleBillChange}
                  className="solar-range-input w-full"
                  style={{ '--range-pct': `${((monthlyBill - 50) / 450) * 100}%` } as React.CSSProperties}
                  aria-label="Monthly electricity bill"
                />

                <div className="flex justify-between mt-2 text-xs text-gray-600 font-medium">
                  <span>&euro;50</span>
                  <span>&euro;150</span>
                  <span>&euro;275</span>
                  <span>&euro;400</span>
                  <span>&euro;500</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.06] text-gray-600 text-xs font-bold">2</span>
                <h3 className="text-sm font-semibold text-white">Your Home Type</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {HOME_PROFILES.map((home) => {
                  const Icon = home.icon;
                  const isActive = homeType === home.id;
                  return (
                    <button
                      key={home.id}
                      type="button"
                      onClick={() => setHomeType(home.id)}
                      className={`relative flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-xl border transition-all duration-300 cursor-pointer outline-none ${
                        isActive
                          ? 'bg-amber-400/10 border-amber-400/30 shadow-lg shadow-amber-400/5'
                          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-amber-400/15 text-amber-400' : 'bg-white/[0.04] text-gray-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}>
                          {home.label}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{home.description}</p>
                      </div>
                      {isActive && (
                        <span className="absolute -top-1.5 right-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] p-6 sm:p-8 bg-white/[0.01]">
            <ResultsPanel results={r} monthlyBill={monthlyBill} homeType={homeType} showDetails={showDetails} setShowDetails={setShowDetails} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: Clock, label: 'Takes 5 seconds', sub: 'No signup needed' },
            { icon: Euro, label: '100% free', sub: 'No hidden costs' },
            { icon: Sun, label: 'SEAI accurate', sub: 'Based on real data' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <Icon className="w-4 h-4 text-gray-500 mb-1.5" />
                <p className="text-[11px] text-gray-300 font-medium">{item.label}</p>
                <p className="text-[10px] text-gray-600">{item.sub}</p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Want a personalised AI-powered report?{' '}
          <a href="#calculator" className="text-amber-400/70 hover:text-amber-400 underline underline-offset-2 transition-colors">
            Upload your bill &rarr;
          </a>
        </p>
      </div>
    </section>
  );
}


function ResultsPanel({
  results: r,
  monthlyBill,
  homeType,
  showDetails,
  setShowDetails,
}: {
  results: ReturnType<typeof calculateSavings>;
  monthlyBill: number;
  homeType: string;
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center py-8 rounded-2xl bg-gradient-to-b from-amber-400/[0.08] to-transparent border border-amber-400/10">
        <p className="text-xs uppercase tracking-[0.15em] text-amber-400/70 font-semibold mb-4">
          Estimated Annual Savings
        </p>
        <p className="text-5xl sm:text-6xl font-bold text-white mb-3">
          {fmtEur(r.totalAnnualBenefit)}
        </p>
        <p className="text-sm text-gray-400 mb-6">
          That&apos;s{' '}
          <span className="text-amber-400 font-semibold">~{fmtEur(r.monthlySavings)}/month</span>{' '}
          back in your pocket
        </p>

        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Bill Before</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-400 line-through decoration-red-400/60">
              {fmtEurDecimal(monthlyBill)}
            </p>
            <p className="text-[10px] text-gray-600">per month</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-green-400/15 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xs font-bold text-green-400 mt-1">-{r.billReductionPct}%</span>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Bill After Solar</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-400">
              {fmtEurDecimal(r.monthlyBillAfterSolar)}
            </p>
            <p className="text-[10px] text-gray-600">per month</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 mt-6">
          {[
            { icon: PanelTop, label: 'System', value: `${r.systemSizeKwp}kWp` },
            { icon: Sun, label: 'Panels', value: `${r.panels}` },
            { icon: Clock, label: 'Payback', value: `${r.paybackYears}yr` },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                <Icon className="w-3.5 h-3.5 text-gray-500" />
                <span><span className="text-white font-semibold">{stat.value}</span> {stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            icon: Euro,
            label: 'Monthly saving',
            value: fmtEur(r.monthlySavings),
            color: 'text-green-400',
            bgColor: 'bg-green-400/10',
            sub: `${fmtEur(r.annualSavingFromSelfUse)} self-use + ${fmtEur(r.annualExportEarnings)} export`,
          },
          {
            icon: TrendingDown,
            label: 'Bill after solar',
            value: `${fmtEurDecimal(r.monthlyBillAfterSolar)}/mo`,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-400/10',
            sub: `Down from ${fmtEurDecimal(monthlyBill)}/mo — save ${r.billReductionPct}%`,
          },
          {
            icon: BatteryCharging,
            label: 'Energy independence',
            value: `${r.energyIndependence}%`,
            color: 'text-amber-400',
            bgColor: 'bg-amber-400/10',
            sub: `${r.selfConsumptionRatio}% self-consumed, ${fmtEur(r.exportedKwh)}kWh exported`,
          },
          {
            icon: Leaf,
            label: 'CO\u2082 offset / year',
            value: `${r.co2PerYear.toLocaleString()}kg`,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-400/10',
            sub: `Equivalent to ${r.treesEquiv} trees planted`,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-gray-500 hover:text-amber-400 transition-colors cursor-pointer"
      >
        <span>{showDetails ? 'Hide full breakdown' : 'Show full breakdown'}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      <div className={`grid transition-all duration-500 ease-out ${showDetails ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="space-y-3 pb-2">

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cost &amp; Payback</h4>
              {[
                { label: 'Estimated install cost', value: fmtEur(r.installCost) },
                { label: `Less ${SOLAR_DATA.grant.label} SEAI grant`, value: `-${SOLAR_DATA.grant.label}`, color: 'text-amber-400' },
                { label: 'Cost after grant', value: fmtEur(r.costAfterGrant), bold: true, color: 'text-white' },
                { label: 'Annual benefit', value: `${fmtEur(r.totalAnnualBenefit)}/yr`, bold: true, color: 'text-green-400' },
                { label: 'Simple payback', value: `${r.paybackYears} years`, bold: true, color: 'text-amber-400' },
                { label: '25-year savings (est.)', value: `${fmtEur(r.total25yrSavings)}+`, bold: true, color: 'text-green-400' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className={`text-sm font-semibold ${row.color || 'text-gray-300'} ${row.bold ? 'font-bold' : ''}`}>{row.value}</span>
                </div>
              ))}
              <p className="text-[10px] text-gray-600 leading-relaxed pt-1">
                25-year figure accounts for 3% annual electricity price rises and 0.5% per year panel degradation.
              </p>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Where Your Savings Come From</h4>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Self-consumed solar ({r.selfConsumptionRatio}%)</span>
                    <span className="text-green-400 font-semibold">{fmtEur(r.annualSavingFromSelfUse)}/yr</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500" style={{ width: `${(r.annualSavingFromSelfUse / r.totalAnnualBenefit * 100).toFixed(1)}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">{fmtEur(r.selfConsumedKwh)} kWh used directly — powering your home for free during the day</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Clean Export Guarantee ({SOLAR_DATA.export.label})</span>
                    <span className="text-amber-400 font-semibold">{fmtEur(r.annualExportEarnings)}/yr</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" style={{ width: `${(r.annualExportEarnings / r.totalAnnualBenefit * 100).toFixed(1)}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">{fmtEur(r.exportedKwh)} kWh exported — surplus energy sold back to the grid</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Monthly Generation</h4>
              <p className="text-[10px] text-gray-600">Ireland has strong seasonal variation — you&apos;ll generate 4x more in summer than winter.</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {r.monthlyGeneration.map((m) => {
                  const maxGen = Math.max(...r.monthlyGeneration.map(x => x.generation));
                  const pct = Math.round((m.generation / maxGen) * 100);
                  const isSummer = m.factor >= 1.0;
                  return (
                    <div key={m.month} className="text-center">
                      <p className="text-[10px] text-gray-500 mb-1">{m.month}</p>
                      <div className="h-16 rounded-lg bg-white/[0.04] relative overflow-hidden">
                        <div
                          className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500 ${
                            isSummer ? 'bg-gradient-to-t from-amber-500 to-amber-400' : 'bg-gradient-to-t from-amber-500/40 to-amber-400/40'
                          }`}
                          style={{ height: `${pct}%` }}
                        />
                        <span className="absolute inset-0 flex items-end justify-center pb-1 text-[9px] font-semibold text-white/90">
                          {m.generation}
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-600 mt-0.5">kWh</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Annual Bill Breakdown</h4>
              {[
                { label: 'Current annual bill', value: fmtEur(r.annualBill), color: 'text-gray-300' },
                { label: 'Standing charges (unchanged)', value: fmtEur(r.standingCharge), color: 'text-gray-500', note: 'Solar does not reduce standing charges' },
                { label: 'Current energy cost', value: fmtEur(r.annualUsage * r.unitRate), color: 'text-gray-300' },
                { label: 'Less: solar self-use saving', value: `-${fmtEur(r.annualSavingFromSelfUse)}`, color: 'text-green-400' },
                { label: 'Less: CEG export earnings', value: `-${fmtEur(r.annualExportEarnings)}`, color: 'text-amber-400' },
                { label: 'Bill after solar', value: `${fmtEur(r.annualBillAfterSolar)}/yr`, color: 'text-green-400', bold: true },
                { label: 'Monthly equivalent', value: `${fmtEurDecimal(r.monthlyBillAfterSolar)}/mo`, color: 'text-green-400', bold: true },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.color} ${row.bold ? 'font-bold' : ''}`}>{row.value}</span>
                  </div>
                  {row.note && <p className="text-[9px] text-gray-600 mt-0.5">{row.note}</p>}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <a
          href={buildWhatsAppUrl({
            source: 'quick-calculator',
            monthlyBill,
            homeType: HOME_PROFILES.find((h) => h.id === homeType)?.label || 'Semi-Detached',
            annualSaving: r.totalAnnualBenefit,
            paybackYears: r.paybackYears,
            total25yrSaving: r.total25yrSavings,
            recommendedSystem: r.systemSizeKwp,
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

      <p className="text-[10px] text-gray-600 text-center leading-relaxed">
        Estimates based on SEAI grant rates, Met &Eacute;ireann solar irradiance data for Ireland,
        a {r.unitRate}&cent;/kWh unit rate, and {fmtEur(r.standingCharge)}/yr standing charges.
        Actual savings depend on roof orientation, shading, and your consumption patterns.
        A free site survey gives you exact figures.
      </p>
    </div>
  );
}
