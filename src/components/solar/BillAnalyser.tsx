'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Sparkles,
  Euro,
  Clock,
  Zap,
  TrendingUp,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Battery,
  Leaf,
  BarChart3,
  Sun,
  ArrowRight,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Shield,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BumblebeeMascot from './BumblebeeMascot';

/* ─── Types ─── */
interface MonthlyProfile {
  month: string;
  generation: number;
  consumption: number;
  selfConsumed: number;
  exported: number;
  saving: number;
  exportEarning: number;
}

interface SystemComparison {
  size: number;
  generation: number;
  annualSaving: number;
  annualExport: number;
  paybackYears: number;
  cost: number;
  grant: number;
}

interface AnalysisResult {
  provider: string;
  monthlyBill: number;
  annualUsage: number;
  homeType: string;
  unitRate: number;
  standingCharge: number;
  confidence: number;
  extractedFields: string[];
  billingPeriod: string | null;
  recommendedSystem: number;
  installCost: number;
  seaiGrant: number;
  costAfterGrant: number;
  annualSaving: number;
  annualExportEarning: number;
  totalAnnualBenefit: number;
  paybackYears: number;
  roiPercent: number;
  total25YearSavings: number;
  co2Saved25Years: number;
  monthlyProfile: MonthlyProfile[];
  systemComparisons: SystemComparison[];
  batteryWorthwhile: boolean;
  batteryReason: string;
  estimatedBatteryCost: number;
  batteryPaybackYears: number;
  annualCo2Saved: number;
  treesEquiv25Years: number;
}

/* ─── Constants ─── */
const HOME_TYPES = ['Detached', 'Semi-detached', 'Terraced', 'Apartment', 'Bungalow'];
const PROVIDERS = [
  'ESB', 'Electric Ireland', 'Bord Gáis Energy', 'SSE Airtricity',
  'Energia', 'Panda', 'Yuno', 'Community Power', 'Pinergy', 'PrepayPower', 'Other',
];

const ANALYSIS_STEPS = [
  { label: 'Reading bill details', icon: FileText, duration: 800 },
  { label: 'Identifying provider rates', icon: Zap, duration: 600 },
  { label: 'Calculating solar generation', icon: Sun, duration: 700 },
  { label: 'Building your savings report', icon: Sparkles, duration: 500 },
];

/* ─── Animated Counter ─── */
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}{display.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}
    </span>
  );
}

/* ─── Confidence Badge ─── */
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 80 ? 'text-green-400 bg-green-400/10 border-green-400/20'
    : confidence >= 50 ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    : 'text-red-400 bg-red-400/10 border-red-400/20';
  const label = confidence >= 80 ? 'High confidence' : confidence >= 50 ? 'Medium confidence' : 'Low confidence';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Shield className="w-3 h-3" />
      {label}
    </span>
  );
}

/* ─── Monthly Bar Chart (pure SVG) ─── */
function MonthlyChart({ profile }: { profile: MonthlyProfile[] }) {
  const maxGen = Math.max(...profile.map(m => m.generation));
  const barWidth = 100 / profile.length;
  const chartHeight = 180;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${profile.length * 60 + 10} ${chartHeight + 40}`} className="w-full min-w-[500px]" style={{ maxHeight: 220 }}>
        {profile.map((m, i) => {
          const x = i * 60 + 5;
          const genH = (m.generation / maxGen) * chartHeight;
          const conH = (m.consumption / maxGen) * chartHeight;

          return (
            <g key={m.month}>
              {/* Consumption bar */}
              <rect x={x + 2} y={chartHeight - conH + 30} width={24} height={conH} rx={3} fill="rgba(255,255,255,0.06)" />
              {/* Generation bar */}
              <motion.rect
                x={x + 2} y={chartHeight - genH + 30} width={24} height={genH} rx={3}
                fill="url(#amberGrad)"
                initial={{ height: 0, y: chartHeight + 30 }}
                animate={{ height: genH, y: chartHeight - genH + 30 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              />
              {/* Month label */}
              <text x={x + 14} y={chartHeight + 38} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="sans-serif">
                {m.month}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        {/* Legend */}
        <rect x={10} y={2} width={10} height={10} rx={2} fill="url(#amberGrad)" />
        <text x={24} y={10} fill="#9ca3af" fontSize={8} fontFamily="sans-serif">Solar Generation</text>
        <rect x={110} y={2} width={10} height={10} rx={2} fill="rgba(255,255,255,0.15)" />
        <text x={124} y={10} fill="#9ca3af" fontSize={8} fontFamily="sans-serif">Your Consumption</text>
      </svg>
    </div>
  );
}

/* ─── Before / After Meter ─── */
function CostMeter({ before, after }: { before: number; after: number }) {
  const pct = Math.round((1 - after / before) * 100);
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Current annual cost</span>
        <span className="text-white font-semibold">€{before.toLocaleString()}</span>
      </div>
      <div className="relative h-4 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
          initial={{ width: '0%' }}
          animate={{ width: `${100 - pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">After solar</span>
        <span className="text-amber-400 font-bold">€{after.toLocaleString()}/yr <span className="text-xs font-normal">({pct}% off)</span></span>
      </div>
    </div>
  );
}

/* ─── System Size Comparison Cards ─── */
function SystemComparisonCards({ comparisons, recommended }: { comparisons: SystemComparison[]; recommended: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {comparisons.map((c) => {
        const isRec = c.size === recommended;
        return (
          <div
            key={c.size}
            className={`relative rounded-xl p-4 text-center transition-all border ${
              isRec
                ? 'bg-amber-400/10 border-amber-400/30 ring-1 ring-amber-400/20'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            {isRec && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-full">
                Best ROI
              </span>
            )}
            <p className="text-2xl font-bold text-white">{c.size}<span className="text-sm text-gray-500">kWp</span></p>
            <p className="text-xs text-gray-500 mt-1">{c.generation.toLocaleString()} kWh/yr</p>
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-lg font-bold text-amber-400">€{(c.annualSaving + c.annualExport).toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">annual benefit</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">{c.paybackYears} yr payback</p>
            <p className="text-[10px] text-gray-600">€{(c.cost - c.grant).toLocaleString()} after grant</p>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */
export default function BillAnalyser() {
  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showBattery, setShowBattery] = useState(false);

  // Manual fields
  const [monthlyBill, setMonthlyBill] = useState('');
  const [annualUsage, setAnnualUsage] = useState('');
  const [homeType, setHomeType] = useState('Semi-detached');
  const [provider, setProvider] = useState('Electric Ireland');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload a photo, scan, or PDF of your electricity bill.');
      return;
    }

    setUploadedFile(file.name);
    setError(null);
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisStep(0);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setBillPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Animate through analysis steps
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, ANALYSIS_STEPS[i].duration));
      setAnalysisStep(i + 1);
    }

    try {
      const formData = new FormData();
      formData.append('bill', file);

      const res = await fetch('/api/analyse-bill', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to analyse bill.');
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try entering your details manually.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }, [handleFile]);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleManualAnalyse = async () => {
    const bill = parseFloat(monthlyBill);
    const usage = parseFloat(annualUsage);
    if (!bill || bill <= 0 || !usage || usage <= 0) { setError('Please enter your monthly bill and annual usage.'); return; }

    setError(null);
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisStep(0);

    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, ANALYSIS_STEPS[i].duration));
      setAnalysisStep(i + 1);
    }

    try {
      const res = await fetch('/api/analyse-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyBill: bill, annualUsage: usage, homeType, provider }),
      });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to calculate.'); }
      setAnalysis(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => { setAnalysis(null); setError(null); setUploadedFile(null); setBillPreview(null); setShowDetails(false); setShowBattery(false); };

  const annualCost = analysis ? Math.round(analysis.monthlyBill * 12) : 0;
  const costAfter = analysis ? annualCost - analysis.totalAnnualBenefit : 0;

  return (
    <section id="calculator" className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI Powered
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Bill <span className="text-gradient">Analyser</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your electricity bill or enter your details. Our AI calculates your exact solar savings, optimal system size, and 25-year projection.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden shadow-2xl shadow-black/20"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {/* ─── INPUT STATE ─── */}
          <AnimatePresence mode="wait">
            {!analysis && !isAnalyzing && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 sm:p-8">
                {/* Mode toggle */}
                <div className="flex items-center justify-center gap-2 mb-8 p-1 rounded-xl bg-white/[0.04] w-fit mx-auto">
                  <button onClick={() => { setMode('upload'); reset(); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'upload' ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'text-gray-400 hover:text-white'}`}>
                    <Upload className="w-4 h-4" /> Upload Bill
                  </button>
                  <button onClick={() => { setMode('manual'); reset(); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'text-gray-400 hover:text-white'}`}>
                    <FileText className="w-4 h-4" /> Enter Manually
                  </button>
                </div>

                {/* Upload Mode */}
                {mode === 'upload' && (
                  <div className="space-y-4">
                    <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center p-10 sm:p-14 rounded-xl border-2 border-dashed cursor-pointer transition-all group ${dragOver ? 'border-amber-400 bg-amber-400/5 scale-[1.01]' : 'border-white/10 hover:border-amber-400/30 hover:bg-white/[0.02]'}`}>
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${dragOver ? 'bg-amber-400/20' : 'bg-white/[0.04] group-hover:bg-amber-400/10'}`}>
                        <Upload className={`w-8 h-8 transition-colors ${dragOver ? 'text-amber-400' : 'text-gray-500 group-hover:text-amber-400'}`} />
                      </div>
                      <p className="text-white font-medium mb-1">{uploadedFile || 'Drop your electricity bill here'}</p>
                      <p className="text-sm text-gray-500 text-center">Photo, scan or PDF — works with all Irish providers</p>
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                        {['ESB', 'Electric Ireland', 'Bord Gáis', 'SSE Airtricity', 'Energia'].map(p => (
                          <span key={p} className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[10px] text-gray-500">{p}</span>
                        ))}
                      </div>
                    </div>
                    {uploadedFile && (
                      <button onClick={(e) => { e.stopPropagation(); reset(); }} className="mx-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                        <X className="w-3 h-3" /> Remove &amp; start over
                      </button>
                    )}
                  </div>
                )}

                {/* Manual Mode */}
                {mode === 'manual' && (
                  <div className="space-y-5 max-w-2xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="mb" className="block text-sm text-gray-400 mb-2">Monthly Bill (&euro;)</label>
                        <div className="relative">
                          <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input id="mb" type="number" placeholder="160" value={monthlyBill} onChange={(e) => setMonthlyBill(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="au" className="block text-sm text-gray-400 mb-2">Annual Usage (kWh)</label>
                        <div className="relative">
                          <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input id="au" type="number" placeholder="4800" value={annualUsage} onChange={(e) => setAnnualUsage(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="ht" className="block text-sm text-gray-400 mb-2">Home Type</label>
                        <div className="relative">
                          <select id="ht" value={homeType} onChange={(e) => setHomeType(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white appearance-none focus:outline-none focus:border-amber-400/50 transition-all cursor-pointer">
                            {HOME_TYPES.map((t) => <option key={t} value={t} className="bg-zinc-900">{t}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="pr" className="block text-sm text-gray-400 mb-2">Provider</label>
                        <div className="relative">
                          <select id="pr" value={provider} onChange={(e) => setProvider(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white appearance-none focus:outline-none focus:border-amber-400/50 transition-all cursor-pointer">
                            {PROVIDERS.map((p) => <option key={p} value={p} className="bg-zinc-900">{p}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleManualAnalyse} className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl text-sm shadow-lg shadow-amber-400/20">
                      <Sparkles className="mr-2 w-4 h-4" /> Analyse My Savings
                    </Button>
                  </div>
                )}

                <p className="mt-6 text-[11px] text-gray-600 text-center leading-relaxed">
                  Estimates based on SEAI grant rates, Met Éireann solar irradiance data, and your reported usage.
                  Actual savings depend on roof orientation, shading, and consumption patterns. A free site survey gives you exact figures.
                </p>
              </motion.div>
            )}

            {/* ─── LOADING STATE ─── */}
            {isAnalyzing && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 sm:p-12">
                <div className="flex flex-col items-center">
                  <div className="mb-8"><BumblebeeMascot size="hero" /></div>
                  <div className="w-full max-w-md space-y-4">
                    {ANALYSIS_STEPS.map((step, i) => {
                      const StepIcon = step.icon;
                      const done = i < analysisStep;
                      const active = i === analysisStep;
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}>
                          <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${done ? 'bg-amber-400/5 border border-amber-400/10' : active ? 'bg-white/[0.03] border border-white/[0.06]' : 'border border-transparent'}`}>
                            {done ? <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" /> : active ? <StepIcon className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" /> : <StepIcon className="w-5 h-5 text-gray-700 shrink-0" />}
                            <span className={`text-sm ${done ? 'text-amber-400' : active ? 'text-white' : 'text-gray-600'}`}>{step.label}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── RESULTS STATE ─── */}
            {analysis && !isAnalyzing && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Bill summary bar */}
                <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{analysis.provider}</p>
                        <p className="text-xs text-gray-500">{analysis.annualUsage.toLocaleString()} kWh/yr · {analysis.homeType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {mode === 'upload' && <ConfidenceBadge confidence={analysis.confidence} />}
                      <div className="text-right">
                        <p className="font-semibold text-amber-400">€{analysis.monthlyBill}/mo</p>
                        <p className="text-xs text-gray-500">€{analysis.unitRate.toFixed(3)}/kWh</p>
                      </div>
                    </div>
                  </div>
                  {/* Bill preview thumbnail */}
                  {billPreview && (
                    <div className="mt-3">
                      <button onClick={() => setBillPreview(billPreview => billPreview ? null : billPreview)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                        <Info className="w-3 h-3" /> {billPreview ? 'Hide bill preview' : 'Show bill preview'}
                      </button>
                      {billPreview && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 overflow-hidden">
                          <img src={billPreview} alt="Uploaded bill" className="max-h-40 rounded-lg border border-white/[0.06] object-contain" />
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                  {/* ─── Hero Numbers ─── */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-amber-400/10 to-amber-400/[0.03] border border-amber-400/20 p-5">
                      <Euro className="w-5 h-5 text-amber-400 mb-3" />
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Annual Saving</p>
                      <p className="text-3xl font-bold text-amber-400"><AnimatedNumber value={analysis.annualSaving} prefix="€" /></p>
                      <p className="text-[11px] text-gray-500 mt-1">from self-consumption</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
                      <Clock className="w-5 h-5 text-green-400 mb-3" />
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Payback Period</p>
                      <p className="text-3xl font-bold text-white"><AnimatedNumber value={analysis.paybackYears} suffix=" yrs" decimals={1} /></p>
                      <p className="text-[11px] text-gray-500 mt-1">after SEAI grant</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
                      <TrendingUp className="w-5 h-5 text-blue-400 mb-3" />
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">25-Year Value</p>
                      <p className="text-3xl font-bold text-white"><AnimatedNumber value={analysis.total25YearSavings} prefix="€" /></p>
                      <p className="text-[11px] text-gray-500 mt-1">with 3% price rise</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
                      <Leaf className="w-5 h-5 text-emerald-400 mb-3" />
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">CO₂ Saved</p>
                      <p className="text-3xl font-bold text-white"><AnimatedNumber value={analysis.annualCo2Saved} suffix=" kg" /></p>
                      <p className="text-[11px] text-gray-500 mt-1">per year · {analysis.treesEquiv25Years} trees equiv</p>
                    </div>
                  </div>

                  {/* ─── Export Earning + Grant + ROI strip ─── */}
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400/10 border border-green-400/15 text-sm">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Export earnings:</span>
                      <span className="text-green-400 font-semibold">€{analysis.annualExportEarning}/yr</span>
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-400/10 border border-blue-400/15 text-sm">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400">SEAI Grant:</span>
                      <span className="text-blue-400 font-semibold">€{analysis.seaiGrant.toLocaleString()}</span>
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-400/10 border border-purple-400/15 text-sm">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">ROI:</span>
                      <span className="text-purple-400 font-semibold">{analysis.roiPercent}%</span>
                    </span>
                  </div>

                  {/* ─── Cost Before/After ─── */}
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-400" /> Your Electricity Cost
                    </h4>
                    <CostMeter before={annualCost} after={costAfter} />
                    <p className="text-xs text-gray-500 mt-3">
                      Based on {analysis.recommendedSystem}kWp system generating {analysis.monthlyProfile.reduce((s, m) => s + m.generation, 0).toLocaleString()} kWh/year.
                      Includes export payments at €0.21/kWh via the microgeneration scheme.
                    </p>
                  </div>

                  {/* ─── Monthly Generation Chart ─── */}
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" /> Monthly Solar Generation vs Your Usage
                    </h4>
                    <MonthlyChart profile={analysis.monthlyProfile} />
                    <p className="text-xs text-gray-500 mt-3">
                      Based on SEAI Typical Meteorological Year data for Ireland. Actual output depends on roof orientation and shading.
                    </p>
                  </div>

                  {/* ─── System Size Comparison ─── */}
                  <div>
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" /> Compare System Sizes
                    </h4>
                    <SystemComparisonCards comparisons={analysis.systemComparisons} recommended={analysis.recommendedSystem} />
                    <p className="text-xs text-gray-500 mt-3">
                      The {analysis.recommendedSystem}kWp system gives you the best return on investment. Larger systems generate more but have longer payback. A site survey will confirm your roof can fit your preferred size.
                    </p>
                  </div>

                  {/* ─── Battery Assessment ─── */}
                  <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                    <button onClick={() => setShowBattery(!showBattery)} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <Battery className={`w-5 h-5 ${analysis.batteryWorthwhile ? 'text-green-400' : 'text-gray-500'}`} />
                        <div className="text-left">
                          <p className="text-sm font-semibold">Battery Storage Assessment</p>
                          <p className="text-xs text-gray-500">Should you add a battery to your solar system?</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${analysis.batteryWorthwhile ? 'bg-green-400/10 text-green-400' : 'bg-white/[0.04] text-gray-500'}`}>
                        {analysis.batteryWorthwhile ? 'Worth considering' : 'Not recommended now'}
                      </span>
                    </button>
                    {showBattery && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-5 border-t border-white/[0.06] pt-4">
                        <p className="text-sm text-gray-400 leading-relaxed">{analysis.batteryReason}</p>
                        {analysis.batteryWorthwhile && (
                          <div className="mt-3 grid grid-cols-3 gap-3">
                            <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                              <p className="text-lg font-bold text-green-400">€{analysis.estimatedBatteryCost.toLocaleString()}</p>
                              <p className="text-[10px] text-gray-500 uppercase">est. cost</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                              <p className="text-lg font-bold text-white">{analysis.batteryPaybackYears} yrs</p>
                              <p className="text-[10px] text-gray-500 uppercase">battery payback</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                              <p className="text-lg font-bold text-amber-400">5 kWh</p>
                              <p className="text-[10px] text-gray-500 uppercase">capacity</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* ─── Expandable Detailed Breakdown ─── */}
                  <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                    <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-500" /> Detailed Calculation Breakdown
                      </span>
                      {showDetails ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                    {showDetails && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-5 border-t border-white/[0.06] pt-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Annual electricity cost</span>
                            <span className="text-white font-medium">€{annualCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Provider unit rate</span>
                            <span className="text-white">€{analysis.unitRate.toFixed(4)}/kWh</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Standing charge (est.)</span>
                            <span className="text-white">€{analysis.standingCharge.toFixed(2)}/day</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Recommended system</span>
                            <span className="text-amber-400 font-medium">{analysis.recommendedSystem} kWp</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Est. annual generation</span>
                            <span className="text-white">{analysis.monthlyProfile.reduce((s, m) => s + m.generation, 0).toLocaleString()} kWh</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Self-consumption saving</span>
                            <span className="text-white">€{analysis.annualSaving.toLocaleString()}/yr</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Export payment (€0.21/kWh)</span>
                            <span className="text-white">€{analysis.annualExportEarning.toLocaleString()}/yr</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Total annual benefit</span>
                            <span className="text-amber-400 font-bold">€{analysis.totalAnnualBenefit.toLocaleString()}/yr</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">System cost (before grant)</span>
                            <span className="text-white">€{analysis.installCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">SEAI grant</span>
                            <span className="text-blue-400">- €{analysis.seaiGrant.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Cost after grant</span>
                            <span className="text-white font-medium">€{analysis.costAfterGrant.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Payback period</span>
                            <span className="text-white font-medium">{analysis.paybackYears} years</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-gray-400">Annual CO₂ reduction</span>
                            <span className="text-emerald-400">{analysis.annualCo2Saved.toLocaleString()} kg</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-400">25-year CO₂ reduction</span>
                            <span className="text-emerald-400">{analysis.co2Saved25Years.toLocaleString()} kg ({analysis.treesEquiv25Years} trees)</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* ─── CTA Buttons ─── */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl shadow-lg shadow-amber-400/20" asChild>
                      <a href={`https://wa.me/353873958424?text=${encodeURIComponent(
                        `Hi! I analysed my electricity bill on your site.\n\n` +
                        `📊 Bill: €${analysis.monthlyBill}/mo (${analysis.annualUsage.toLocaleString()} kWh/yr)\n` +
                        `🏢 Provider: ${analysis.provider}\n` +
                        `🏠 Home: ${analysis.homeType}\n` +
                        `☀️ Recommended: ${analysis.recommendedSystem}kWp system\n` +
                        `💰 Est. annual saving: €${analysis.totalAnnualBenefit}\n` +
                        `⏱️ Payback: ${analysis.paybackYears} years\n` +
                        `🌳 CO₂ saved: ${analysis.annualCo2Saved} kg/yr\n\n` +
                        `I'd love a free site survey!`
                      )}`} target="_blank" rel="noopener noreferrer">
                        <Share2 className="mr-2 w-4 h-4" /> Get Your Free Survey
                      </a>
                    </Button>
                    <Button variant="outline" onClick={() => {
                      // Generate a text summary for clipboard
                      const summary = `Solar Ireland Bill Analysis\n${'═'.repeat(35)}\nProvider: ${analysis.provider}\nMonthly Bill: €${analysis.monthlyBill}\nAnnual Usage: ${analysis.annualUsage.toLocaleString()} kWh\nRecommended System: ${analysis.recommendedSystem} kWp\nAnnual Saving: €${analysis.annualSaving.toLocaleString()}\nExport Earnings: €${analysis.annualExportEarning.toLocaleString()}/yr\nTotal Annual Benefit: €${analysis.totalAnnualBenefit.toLocaleString()}\nPayback: ${analysis.paybackYears} years\nCost After Grant: €${analysis.costAfterGrant.toLocaleString()}\n25-Year Value: €${analysis.total25YearSavings.toLocaleString()}\nCO₂ Saved: ${analysis.annualCo2Saved.toLocaleString()} kg/yr`;
                      navigator.clipboard.writeText(summary);
                    }}
                      className="flex-1 border-white/[0.08] text-gray-300 hover:bg-white/[0.04] hover:text-white py-4 rounded-xl">
                      <Download className="mr-2 w-4 h-4" /> Copy Report
                    </Button>
                    <Button variant="outline" onClick={reset}
                      className="sm:flex-none border-white/[0.08] text-gray-400 hover:bg-white/[0.04] hover:text-white py-4 px-6 rounded-xl">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mx-6 mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
