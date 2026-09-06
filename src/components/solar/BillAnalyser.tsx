'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, usePrefersReducedMotion } from '@/lib/motion';
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
  ChevronRight,
  Battery,
  Leaf,
  BarChart3,
  Sun,
  ArrowRight,
  Share2,
  Download,
  Building2,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Shield,
  Info,
  Camera,
  Image as ImageIcon,
  ScanLine,
  Home,
  Users,
  Lightbulb,
  Lock,
  Timer,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BumblebeeMascot from './BumblebeeMascot';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { submitLead } from '@/lib/submitLead';
import { trackEvent } from '@/lib/analytics';
import { isValidEircode, formatEircode } from '@/lib/eircode';

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

const HOME_TYPES = ['Detached', 'Semi-detached', 'Terraced', 'Apartment', 'Bungalow'];
const PROVIDERS = [
  'ESB', 'Electric Ireland', 'Bord Gáis Energy', 'SSE Airtricity',
  'Energia', 'Panda', 'Yuno', 'Community Power', 'Pinergy', 'PrepayPower', 'Other',
];

const PROVIDER_COLORS: Record<string, string> = {
  'Electric Ireland': 'bg-green-500/15 text-green-400 border-green-500/20',
  'ESB': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'Bord Gáis Energy': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'SSE Airtricity': 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  'Energia': 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  'Panda': 'bg-red-500/15 text-red-400 border-red-500/20',
  'Yuno': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'Community Power': 'bg-lime-500/15 text-lime-400 border-lime-500/20',
  'Pinergy': 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  'PrepayPower': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'Other': 'bg-white/[0.06] text-gray-400 border-white/[0.08]',
};

const ANALYSIS_STEPS = [
  { label: 'Reading bill details', icon: FileText, duration: 800 },
  { label: 'Matching provider rates', icon: Zap, duration: 600 },
  { label: 'Modelling solar generation', icon: Sun, duration: 700 },
  { label: 'Building your savings report', icon: Sparkles, duration: 500 },
];

const PRESETS = [
  { label: 'Average 3-bed', bill: 160, usage: 4800, home: 'Semi-detached', provider: 'Electric Ireland', icon: Home, desc: '3-4 people, typical usage' },
  { label: 'High usage', bill: 280, usage: 7500, home: 'Detached', provider: 'Electric Ireland', icon: Zap, desc: 'Electric heating, EV, etc.' },
  { label: 'Low usage', bill: 90, usage: 2800, home: 'Apartment', provider: 'Panda', icon: Lightbulb, desc: '1-2 people, efficient home' },
];

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
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
  return <span>{prefix}{display.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}</span>;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 80 ? 'text-green-400 bg-green-400/10 border-green-400/20' : confidence >= 50 ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20';
  const label = confidence >= 80 ? 'High confidence' : confidence >= 50 ? 'Medium confidence' : 'Low confidence';
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${color}`}><Shield className="w-3 h-3" />{label}</span>;
}

function MonthlyChart({ profile }: { profile: MonthlyProfile[] }) {
  const maxVal = Math.max(...profile.map(m => Math.max(m.generation, m.consumption)));
  const chartHeight = 180;
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${profile.length * 60 + 10} ${chartHeight + 40}`} className="w-full min-w-[500px]" style={{ maxHeight: 220 }}>
        {profile.map((m, i) => {
          const x = i * 60 + 5;
          const genH = (m.generation / maxVal) * chartHeight;
          const conH = (m.consumption / maxVal) * chartHeight;
          return (
            <g key={m.month}>
              <rect x={x + 2} y={chartHeight - conH + 30} width={24} height={conH} rx={3} fill="rgba(255,255,255,0.06)" />
              <rect className="chart-bar" x={x + 2} y={chartHeight - genH + 30} width={24} height={genH} rx={3} fill="url(#amberGrad)" style={{ animationDelay: `${i * 50}ms` }} />
              <text x={x + 14} y={chartHeight + 38} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="sans-serif">{m.month}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#facc15" /><stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <rect x={10} y={2} width={10} height={10} rx={2} fill="url(#amberGrad)" />
        <text x={24} y={10} fill="#9ca3af" fontSize={8} fontFamily="sans-serif">Solar Generation</text>
        <rect x={130} y={2} width={10} height={10} rx={2} fill="rgba(255,255,255,0.15)" />
        <text x={144} y={10} fill="#9ca3af" fontSize={8} fontFamily="sans-serif">Your Consumption</text>
      </svg>
    </div>
  );
}

function CostMeter({ before, after }: { before: number; after: number }) {
  const pct = Math.round((1 - after / before) * 100);
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm"><span className="text-gray-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Current annual cost</span><span className="text-white font-semibold">€{before.toLocaleString()}</span></div>
      <div className="relative h-4 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="meter-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-400" style={{ width: '100%' }} />
        <div className="meter-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${Math.max(3, 100 - pct)}%`, animationDelay: '0.5s' }} />
      </div>
      <div className="flex justify-between text-sm"><span className="text-gray-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />After solar</span><span className="text-green-400 font-bold">€{after.toLocaleString()}/yr <span className="text-xs font-normal text-gray-400">({pct}% off)</span></span></div>
    </div>
  );
}

function SystemComparisonCards({ comparisons, recommended }: { comparisons: SystemComparison[]; recommended: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {comparisons.map((c) => {
        const isRec = c.size === recommended;
        return (
          <div key={c.size} className={`relative rounded-xl p-4 text-center transition-all border ${isRec ? 'bg-amber-400/10 border-amber-400/30 ring-1 ring-amber-400/20' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
            {isRec && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-full">Best ROI</span>}
            <p className="text-2xl font-bold text-white">{c.size}<span className="text-sm text-gray-400">kWp</span></p>
            <p className="text-xs text-gray-400 mt-1">{c.generation.toLocaleString()} kWh/yr</p>
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-lg font-bold text-amber-400">€{(c.annualSaving + c.annualExport).toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">annual benefit</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">{c.paybackYears} yr payback</p>
            <p className="text-[10px] text-gray-400">€{(c.cost - c.grant).toLocaleString()} after grant</p>
          </div>
        );
      })}
    </div>
  );
}

function ScanningOverlay({ billPreview }: { billPreview: string | null }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <div className="relative flex flex-col items-center justify-center py-10">
      {billPreview && (
        <div className="relative mb-6 max-w-xs w-full">
          <img src={billPreview} alt="Scanning bill" className="w-full rounded-xl border border-white/[0.06] object-contain max-h-48 opacity-60" />
          <div className="scan-sweep absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" style={{ top: '10%' }} />
          <div className="absolute inset-0 rounded-xl border-2 border-amber-400/30" />
        </div>
      )}
      {!billPreview && (
        <div className="w-48 h-48 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-6 flex items-center justify-center overflow-hidden relative">
          <ScanLine className="w-12 h-12 text-amber-400/40" />
          <div className="scan-sweep absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" style={{ top: '10%' }} />
        </div>
      )}
      <div className="flex items-center gap-2 text-amber-400">
        <div className="spin-slow">
          <ScanLine className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium">AI is reading your bill...</span>
      </div>
    </div>
  );
}

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
  const [billPreviewOpen, setBillPreviewOpen] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [monthlyBill, setMonthlyBill] = useState('');
  const [annualUsage, setAnnualUsage] = useState('');
  const [homeType, setHomeType] = useState('Semi-detached');
  const [provider, setProvider] = useState('Electric Ireland');
  const [occupants, setOccupants] = useState('3');

  // Land the cursor in the first field the moment manual mode opens.
  useEffect(() => {
    if (mode === 'manual' && !analysis && !isAnalyzing) {
      const t = setTimeout(() => document.getElementById('mb')?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [mode, analysis, isAnalyzing]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload a photo, scan, or PDF of your electricity bill.');
      return;
    }
    setUploadedFile(file.name);
    setError(null);
    setBillPreviewOpen(true);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setBillPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisStep(0);
    // Fire the request immediately; the step animation plays alongside it
    // instead of delaying it.
    const request = (async () => {
      const formData = new FormData();
      formData.append('bill', file);
      const res = await fetch('/api/analyse-bill', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const e = new Error(data.error || 'Failed to analyse bill.') as Error & { unavailable?: boolean };
        e.unavailable = res.status === 503 || data.uploadUnavailable === true;
        throw e;
      }
      return data;
    })();
    request.catch(() => {}); // handled below after the animation; silences unhandled-rejection noise
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, ANALYSIS_STEPS[i].duration));
      setAnalysisStep(i + 1);
    }
    try {
      setAnalysis(await request);
    } catch (err: unknown) {
      const e = err as Error & { unavailable?: boolean };
      if (e.unavailable) {
        // Auto-read is off; drop the visitor into manual mode with the reason.
        setMode('manual');
        setUploadedFile(null);
        setBillPreview(null);
        setBillPreviewOpen(false);
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : 'Something went wrong. Try entering your details manually.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }, [handleFile]);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const estimateUsage = (home: string, occ: string) => {
    const base: Record<string, number> = { 'Apartment': 2500, 'Terraced': 3500, 'Semi-detached': 4200, 'Detached': 5200, 'Bungalow': 4500 };
    const mult = { '1': 0.7, '2': 0.85, '3': 1, '4': 1.2, '5': 1.4, '6+': 1.6 };
    return Math.round((base[home] || 4200) * (mult[occ] || 1));
  };

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setMonthlyBill(String(preset.bill));
    setAnnualUsage(String(preset.usage));
    setHomeType(preset.home);
    setProvider(preset.provider);
    setOccupants(preset.usage < 3500 ? '2' : preset.usage > 6000 ? '5' : '3');
  };

  const handleManualAnalyse = async () => {
    const bill = parseFloat(monthlyBill);
    const usage = parseFloat(annualUsage);
    if (!bill || bill <= 0 || !usage || usage <= 0) { setError('Please enter your monthly bill and annual usage.'); return; }
    setError(null);
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisStep(0);
    // Manual mode is pure calculation — request runs alongside a brisk step
    // animation rather than after a long one.
    const request = (async () => {
      const res = await fetch('/api/analyse-bill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ monthlyBill: bill, annualUsage: usage, homeType, provider }) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to calculate.'); }
      return res.json();
    })();
    request.catch(() => {});
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 250));
      setAnalysisStep(i + 1);
    }
    try {
      setAnalysis(await request);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => { setAnalysis(null); setError(null); setUploadedFile(null); setBillPreview(null); setShowDetails(false); setShowBattery(false); setBillPreviewOpen(false); setLeadName(''); setLeadEmail(''); setLeadPhone(''); setLeadEircode(''); setLeadStatus('idle'); setLeadFallback(false); setLeadError(null); };

  // ─── Email-first report capture: the analysis becomes a lead in AISolar ───
  const [segment, setSegment] = useState<'home' | 'business'>('home');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEircode, setLeadEircode] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [leadFallback, setLeadFallback] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  // Business enquiries skip the domestic maths entirely (different grants,
  // different sizing) and go straight to a qualified-lead capture.
  const [biz, setBiz] = useState({ business: '', contact: '', email: '', phone: '', eircode: '', bill: '' });
  const [bizStatus, setBizStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [bizFallback, setBizFallback] = useState(false);
  const [bizError, setBizError] = useState<string | null>(null);

  const buildReportText = (a: AnalysisResult): string => [
    'Solar Ireland - Savings Report',
    '------------------------------',
    `Provider: ${a.provider}`,
    `Monthly bill: €${a.monthlyBill}`,
    `Annual usage: ${a.annualUsage.toLocaleString()} kWh`,
    `Home type: ${a.homeType}`,
    `Recommended system: ${a.recommendedSystem} kWp`,
    `Annual self-consumption saving: €${a.annualSaving.toLocaleString()}`,
    `Annual export earnings: €${a.annualExportEarning.toLocaleString()}`,
    `Total annual benefit: €${a.totalAnnualBenefit.toLocaleString()}`,
    `System cost: €${a.installCost.toLocaleString()} (SEAI grant -€${a.seaiGrant.toLocaleString()} = €${a.costAfterGrant.toLocaleString()})`,
    `Payback: ${a.paybackYears} years · ROI ${a.roiPercent}%/yr`,
    `25-year value: €${a.total25YearSavings.toLocaleString()}`,
    `CO2 saved: ${a.annualCo2Saved.toLocaleString()} kg/yr`,
    `Battery: ${a.batteryWorthwhile ? 'worth considering' : 'not recommended yet'}`,
    '',
    'solarirelandgroup.ie · +353 87 395 8424',
  ].join('\n');

  const downloadReport = () => {
    if (!analysis) return;
    const blob = new Blob([buildReportText(analysis)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solar-ireland-savings-report.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleEmailReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysis || leadStatus === 'sending') return;
    const name = leadName.trim();
    const email = leadEmail.trim();
    const phone = leadPhone.trim();
    const eircode = leadEircode.trim().toUpperCase();
    if (name.length < 2) { setLeadError('Please enter your name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setLeadError('Please enter a valid email address.'); return; }
    if (phone.replace(/[^0-9]/g, '').length < 7) { setLeadError('Please enter a valid mobile number.'); return; }
    if (eircode && !isValidEircode(eircode)) { setLeadError('That Eircode looks incomplete - it should be 7 characters, like D02 X285.'); return; }
    setLeadError(null);
    setLeadStatus('sending');
    const result = await submitLead({
      source: 'bill_analyser',
      name,
      email,
      phone,
      eircode: eircode || undefined,
      monthlyBill: analysis.monthlyBill,
      annualKwh: analysis.annualUsage,
      homeType: analysis.homeType,
      estimatedAnnualSaving: analysis.totalAnnualBenefit,
      message: buildReportText(analysis),
    });
    if (result.ok) {
      setLeadFallback(result.fallback === true);
      setLeadStatus('sent');
      trackEvent({ event: 'lead_submit', properties: { source: 'bill_analyser', fallback: result.fallback === true } });
    } else {
      setLeadStatus('idle');
      setLeadError(result.error || 'Something went wrong. Please try again or WhatsApp us.');
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bizStatus === 'sending') return;
    const business = biz.business.trim();
    const email = biz.email.trim();
    const phone = biz.phone.trim();
    if (business.length < 2) { setBizError('Please enter your business name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone.replace(/[^0-9]/g, '').length < 7) {
      setBizError('Please enter an email or a phone number so we can come back to you.');
      return;
    }
    setBizError(null);
    setBizStatus('sending');
    const billNum = parseFloat(biz.bill);
    const result = await submitLead({
      source: 'website_qualified',
      name: biz.contact.trim() || business,
      email: email || undefined,
      phone: phone || undefined,
      eircode: biz.eircode.trim().toUpperCase() || undefined,
      monthlyBill: Number.isFinite(billNum) && billNum > 0 ? billNum : undefined,
      homeType: 'Commercial',
      message: `Commercial solar enquiry from ${business}${biz.bill ? ` - approx €${biz.bill}/month electricity` : ''}. Requested a tailored commercial assessment via the bill analyser.`,
    });
    if (result.ok) {
      setBizFallback(result.fallback === true);
      setBizStatus('sent');
      trackEvent({ event: 'lead_submit', properties: { source: 'website_qualified', segment: 'business' } });
    } else {
      setBizStatus('idle');
      setBizError(result.error || 'Something went wrong. Please try again or WhatsApp us.');
    }
  };

  const annualCost = analysis ? Math.round(analysis.monthlyBill * 12) : 0;
  const costAfter = analysis ? annualCost - analysis.totalAnnualBenefit : 0;

  return (
    <section id="calculator" className="py-20 px-4 bg-[#0a0a0a] scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> AI Powered
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Bill <span className="text-gradient">Analyser</span></h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your electricity bill or tell us about your usage. Our AI builds a personalised savings report with your optimal system, monthly projections, and 25-year outlook.
          </p>
        </motion.div>

        <motion.div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden shadow-2xl shadow-black/20"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, delay: 0.15 }}>

          <AnimatePresence mode="wait">
            {/* 
                INPUT STATE - THE INTAKE
                 */}
            {!analysis && !isAnalyzing && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
                  <div className="flex items-center justify-center gap-0">
                    {[
                      { n: 1, label: 'Upload or enter' },
                      { n: 2, label: 'AI analysis' },
                      { n: 3, label: 'Your report' },
                    ].map((step, i) => (
                      <div key={step.n} className="flex items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step.n === 1 ? 'bg-amber-400 text-black' : 'bg-white/[0.06] text-gray-500'}`}>
                            {step.n}
                          </div>
                          <span className={`text-xs hidden sm:inline ${step.n === 1 ? 'text-white font-medium' : 'text-gray-400'}`}>{step.label}</span>
                        </div>
                        {i < 2 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 sm:p-8">
                  {/* HOME / BUSINESS */}
                  <div className="flex items-center justify-center gap-1 mb-6 p-1 rounded-xl bg-white/[0.04] w-fit mx-auto border border-white/[0.04]">
                    <button onClick={() => setSegment('home')} aria-pressed={segment === 'home'}
                      className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-lg text-sm font-semibold transition-all ${segment === 'home' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
                      <Home className="w-4 h-4" /> Home
                    </button>
                    <button onClick={() => setSegment('business')} aria-pressed={segment === 'business'}
                      className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-lg text-sm font-semibold transition-all ${segment === 'business' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
                      <Building2 className="w-4 h-4" /> Business
                    </button>
                  </div>

                  {segment === 'home' && (
                  <div className="flex items-center justify-center gap-1 mb-8 p-1 rounded-xl bg-white/[0.04] w-fit mx-auto border border-white/[0.04]">
                    <button onClick={() => { setMode('upload'); reset(); }} aria-pressed={mode === 'upload'}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'upload' ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
                      <Camera className="w-4 h-4" /> Upload Bill
                    </button>
                    <button onClick={() => { setMode('manual'); reset(); }} aria-pressed={mode === 'manual'}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
                      <Euro className="w-4 h-4" /> Enter Manually
                    </button>
                  </div>
                  )}

                  {/* 
                      UPLOAD MODE
                       */}
                  {segment === 'home' && mode === 'upload' && (
                    <div className="space-y-5">
                      <div
                        onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center p-10 sm:p-14 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 group ${dragOver
                          ? 'border-amber-400 bg-amber-400/[0.07] scale-[1.01] shadow-xl shadow-amber-400/10'
                          : 'border-white/10 hover:border-amber-400/30 hover:bg-white/[0.02]'
                        }`}
                      >
                        <input ref={fileInputRef} type="file" accept="image/*,.pdf" aria-label="Upload electricity bill" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                        <motion.div
                          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${dragOver ? 'bg-amber-400/20 scale-110' : 'bg-white/[0.04] group-hover:bg-amber-400/10'}`}
                          animate={prefersReducedMotion ? undefined : (!dragOver ? { y: [0, -4, 0] } : { scale: [1, 1.05, 1] })}
                          transition={prefersReducedMotion ? undefined : (!dragOver ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.6, repeat: Infinity })}
                        >
                          <Upload className={`w-9 h-9 transition-colors duration-300 ${dragOver ? 'text-amber-400' : 'text-gray-500 group-hover:text-amber-400'}`} />
                        </motion.div>

                        <p className="text-white font-semibold text-lg mb-1">
                          {dragOver ? 'Drop it here!' : 'Drag your bill here'}
                        </p>
                        <p className="text-sm text-gray-400 text-center mb-4">
                          or <span className="text-amber-400 underline underline-offset-2">browse files</span> - photo, scan or PDF
                        </p>

                        <button
                          onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-sm text-gray-300 transition-colors border border-white/[0.08]"
                        >
                          <Camera className="w-4 h-4" /> Take a Photo
                        </button>
                        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" aria-label="Take photo of electricity bill" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider mr-1">Works with:</span>
                          {['Electric Ireland', 'ESB', 'Bord Gáis', 'SSE Airtricity', 'Energia', 'Panda'].map(p => (
                            <span key={p} className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${PROVIDER_COLORS[p] || 'bg-white/[0.04] text-gray-500 border-white/[0.06]'}`}>{p}</span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { icon: Lock, label: 'Bill data stays private', sub: 'Processed & deleted' },
                          { icon: Timer, label: 'Takes ~15 seconds', sub: 'AI-powered analysis' },
                          { icon: CheckCircle2, label: 'Free, no signup', sub: 'No email required' },
                        ].map((item) => (
                          <div key={item.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <item.icon className="w-4 h-4 text-gray-500 mb-1.5" />
                            <p className="text-[11px] text-gray-300 font-medium">{item.label}</p>
                            <p className="text-[10px] text-gray-400">{item.sub}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-xs text-gray-400">or try a quick example</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {PRESETS.map((preset) => {
                          const PresetIcon = preset.icon;
                          return (
                            <button
                              key={preset.label}
                              onClick={() => { setMode('manual'); handlePreset(preset); }}
                              className="group flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/20 hover:bg-amber-400/[0.03] transition-all text-left"
                            >
                              <div className="w-9 h-9 rounded-lg bg-white/[0.04] group-hover:bg-amber-400/10 flex items-center justify-center shrink-0 transition-colors">
                                <PresetIcon className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{preset.label}</p>
                                <p className="text-[11px] text-gray-400">{preset.desc}</p>
                                <p className="text-[11px] text-amber-400/70 mt-0.5">€{preset.bill}/mo · {preset.usage.toLocaleString()} kWh</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-400 transition-colors mt-1 ml-auto shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 
                      MANUAL MODE
                       */}
                  {segment === 'home' && mode === 'manual' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div>
                        <label className="block text-sm text-gray-400 mb-3">How many people live in your home?</label>
                        <div className="flex gap-2">
                          {['1', '2', '3', '4', '5', '6+'].map(n => (
                            <button key={n} onClick={() => setOccupants(n)} aria-pressed={occupants === n}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${occupants === n
                                ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                                : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:border-white/[0.12] hover:text-gray-300'
                              }`}>
                              <Users className="w-3.5 h-3.5 mx-auto mb-0.5" />{n}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="mb" className="block text-sm text-gray-400">Monthly Bill</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">€</span>
                            <input id="mb" type="text" inputMode="numeric" placeholder="160" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (monthlyBill && annualUsage) handleManualAnalyse(); } }} value={monthlyBill} onChange={(e) => setMonthlyBill(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-2xl font-semibold placeholder-gray-700 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all" />
                          </div>
                          <p className="text-[11px] text-gray-400">Found on the front of your electricity bill</p>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="au" className="block text-sm text-gray-400">Annual Usage</label>
                          <div className="relative">
                            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input id="au" type="text" inputMode="numeric" placeholder="4800" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (monthlyBill && annualUsage) handleManualAnalyse(); } }} value={annualUsage} onChange={(e) => setAnnualUsage(e.target.value)}
                              className="w-full pl-12 pr-14 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-2xl font-semibold placeholder-gray-700 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">kWh</span>
                          </div>
                          <button onClick={() => setAnnualUsage(String(estimateUsage(homeType, occupants)))}
                            className="text-[11px] text-amber-400/70 hover:text-amber-400 transition-colors flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Auto-estimate from home type ({estimateUsage(homeType, occupants).toLocaleString()} kWh)
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-400">Home Type</label>
                          <div className="flex flex-wrap gap-2">
                            {HOME_TYPES.map(t => (
                              <button key={t} onClick={() => setHomeType(t)} aria-pressed={homeType === t}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${homeType === t
                                  ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                                  : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:border-white/[0.12] hover:text-gray-300'
                                }`}>{t}</button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-400">Provider</label>
                          <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                            {PROVIDERS.map(p => (
                              <button key={p} onClick={() => setProvider(p)} aria-pressed={provider === p}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${provider === p
                                  ? (PROVIDER_COLORS[p] || 'bg-amber-400/10 border-amber-400/30 text-amber-400')
                                  : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:border-white/[0.12] hover:text-gray-300'
                                }`}>{p}</button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-gray-400 mb-2 uppercase tracking-wider">Quick presets</p>
                        <div className="flex flex-wrap gap-2">
                          {PRESETS.map(preset => (
                            <button key={preset.label} onClick={() => handlePreset(preset)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all">
                              <preset.icon className="w-3 h-3" />
                              {preset.label}
                              <span className="text-gray-400">€{preset.bill}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button onClick={handleManualAnalyse} disabled={!monthlyBill || !annualUsage}
                          className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-4 rounded-xl text-sm shadow-lg shadow-amber-400/20 transition-all disabled:shadow-none">
                          <Sparkles className="mr-2 w-4 h-4" /> Analyse My Savings
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {segment === 'business' && (
                    <div className="space-y-5 max-w-2xl mx-auto">
                      {bizStatus === 'sent' ? (
                        <div className="flex flex-col items-center text-center py-8" role="status" aria-live="polite">
                          <div className="w-12 h-12 rounded-full bg-green-400/15 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-1.5">Thanks — we&apos;re on it</h4>
                          <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                            {bizFallback
                              ? 'We have your details. Our commercial team will size your system properly and come back with real numbers.'
                              : 'Your enquiry is with our commercial team. We\u2019ll model your usage profile and come back with real numbers.'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="text-center">
                            <h3 className="text-lg font-bold text-white mb-1.5">Commercial solar, sized properly</h3>
                            <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
                              Business systems are a different animal — day-use profiles, three-phase supply, accelerated capital
                              allowances instead of the domestic grant. Tell us about the business and we&apos;ll model it for real.
                            </p>
                          </div>
                          <form onSubmit={handleBusinessSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input type="text" placeholder="Business name" aria-label="Business name" value={biz.business}
                                onChange={(e) => setBiz({ ...biz, business: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition-all" />
                              <input type="text" autoComplete="name" placeholder="Contact name" aria-label="Contact name" value={biz.contact}
                                onChange={(e) => setBiz({ ...biz, contact: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition-all" />
                              <input type="email" inputMode="email" autoComplete="email" placeholder="Email" aria-label="Business email" value={biz.email}
                                onChange={(e) => setBiz({ ...biz, email: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition-all" />
                              <input type="tel" inputMode="tel" autoComplete="tel" placeholder="Mobile" aria-label="Business phone" value={biz.phone}
                                onChange={(e) => setBiz({ ...biz, phone: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition-all" />
                              <input type="text" autoComplete="postal-code" placeholder="Eircode" aria-label="Eircode" value={biz.eircode}
                                onChange={(e) => setBiz({ ...biz, eircode: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition-all" />
                              <input type="text" inputMode="numeric" placeholder="Monthly electricity spend (€, approx)" aria-label="Approximate monthly electricity spend in euro" value={biz.bill}
                                onChange={(e) => setBiz({ ...biz, bill: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition-all" />
                            </div>
                            <Button type="submit" disabled={bizStatus === 'sending'}
                              className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-4 rounded-xl text-sm shadow-lg shadow-amber-400/20 transition-all disabled:shadow-none">
                              {bizStatus === 'sending' ? 'Sending…' : <><Building2 className="mr-2 w-4 h-4" /> Get My Commercial Assessment <ArrowRight className="ml-2 w-4 h-4" /></>}
                            </Button>
                            {bizError && (
                              <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {bizError}
                              </p>
                            )}
                          </form>
                        </>
                      )}
                    </div>
                  )}

                  <p className="mt-6 text-[11px] text-gray-400 text-center leading-relaxed">
                    Estimates based on SEAI grant rates, Met Éireann solar irradiance data, and your reported usage.
                    Actual savings depend on roof orientation, shading, and consumption patterns. A free site survey gives you exact figures.
                  </p>
                </div>
              </motion.div>
            )}

            {/* 
                SCANNING STATE (file just uploaded)
                 */}
            {isAnalyzing && billPreviewOpen && analysisStep > 0 && analysisStep < ANALYSIS_STEPS.length && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 sm:p-8">
                <ScanningOverlay billPreview={billPreview} />
              </motion.div>
            )}

            {/* 
                LOADING STATE (API processing)
                 */}
            {isAnalyzing && (!billPreviewOpen || analysisStep >= ANALYSIS_STEPS.length) && (
              <motion.div key="loading" role="status" aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 sm:p-12">
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
                            {done ? <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" /> : active ? <StepIcon className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" /> : <StepIcon className="w-5 h-5 text-gray-400 shrink-0" />}
                            <span className={`text-sm ${done ? 'text-amber-400' : active ? 'text-white' : 'text-gray-600'}`}>{step.label}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 
                RESULTS STATE
                 */}
            {analysis && !isAnalyzing && (
              <motion.div key="results" aria-live="polite" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="px-4 sm:px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center"><FileText className="w-5 h-5 text-amber-400" /></div>
                      <div>
                        <p className="font-semibold text-sm">{analysis.provider}</p>
                        <p className="text-xs text-gray-400">{analysis.annualUsage.toLocaleString()} kWh/yr · {analysis.homeType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {mode === 'upload' && <ConfidenceBadge confidence={analysis.confidence} />}
                      <div className="text-right">
                        <p className="font-semibold text-amber-400">€{analysis.monthlyBill}/mo</p>
                        <p className="text-xs text-gray-400">€{analysis.unitRate.toFixed(3)}/kWh</p>
                      </div>
                    </div>
                  </div>
                  {billPreview && (
                    <div className="mt-3">
                      <button onClick={() => setBillPreviewOpen(!billPreviewOpen)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300 transition-colors">
                        <Info className="w-3 h-3" /> {billPreviewOpen ? 'Hide bill preview' : 'Show bill preview'}
                      </button>
                      {billPreviewOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 overflow-hidden">
                          <img src={billPreview} alt="Uploaded bill" className="max-h-40 rounded-lg border border-white/[0.06] object-contain" />
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-amber-400/10 to-amber-400/[0.03] border border-amber-400/20 p-4 sm:p-5">
                      <Euro className="w-5 h-5 text-amber-400 mb-3" />
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Annual Saving</p>
                      <p className="text-2xl sm:text-3xl font-bold text-amber-400"><AnimatedNumber value={analysis.annualSaving} prefix="€" /></p>
                      <p className="text-[11px] text-gray-400 mt-1">from self-consumption</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
                      <Clock className="w-5 h-5 text-green-400 mb-3" />
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Payback Period</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white"><AnimatedNumber value={analysis.paybackYears} suffix=" yrs" decimals={1} /></p>
                      <p className="text-[11px] text-gray-400 mt-1">after SEAI grant</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
                      <TrendingUp className="w-5 h-5 text-blue-400 mb-3" />
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">25-Year Value</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white"><AnimatedNumber value={analysis.total25YearSavings} prefix="€" /></p>
                      <p className="text-[11px] text-gray-400 mt-1">with 3% price rise</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
                      <Leaf className="w-5 h-5 text-emerald-400 mb-3" />
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">CO₂ Saved</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white"><AnimatedNumber value={analysis.annualCo2Saved} suffix=" kg" /></p>
                      <p className="text-[11px] text-gray-400 mt-1">per year · {analysis.treesEquiv25Years} trees equiv</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400/10 border border-green-400/15 text-sm">
                      <Zap className="w-4 h-4 text-green-400" /><span className="text-gray-400">Export earnings:</span><span className="text-green-400 font-semibold">€{analysis.annualExportEarning}/yr</span>
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-400/10 border border-blue-400/15 text-sm">
                      <Shield className="w-4 h-4 text-blue-400" /><span className="text-gray-400">SEAI Grant:</span><span className="text-blue-400 font-semibold">€{analysis.seaiGrant.toLocaleString()}</span>
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-400/10 border border-purple-400/15 text-sm">
                      <TrendingUp className="w-4 h-4 text-purple-400" /><span className="text-gray-400">ROI:</span><span className="text-purple-400 font-semibold">{analysis.roiPercent}%</span>
                    </span>
                  </div>

                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-6">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-amber-400" /> Your Electricity Cost</h4>
                    <CostMeter before={annualCost} after={costAfter} />
                    <p className="text-xs text-gray-400 mt-3">Based on {analysis.recommendedSystem}kWp system generating {analysis.monthlyProfile.reduce((s, m) => s + m.generation, 0).toLocaleString()} kWh/year. Includes export payments at {SOLAR_DATA.export.label} via the microgeneration scheme.</p>
                  </div>

                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-6">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2"><Sun className="w-4 h-4 text-amber-400" /> Monthly Solar Generation vs Your Usage</h4>
                    <MonthlyChart profile={analysis.monthlyProfile} />
                    <p className="text-xs text-gray-400 mt-3">Based on SEAI Typical Meteorological Year data for Ireland. Actual output depends on roof orientation and shading.</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Compare System Sizes</h4>
                    <SystemComparisonCards comparisons={analysis.systemComparisons} recommended={analysis.recommendedSystem} />
                    <p className="text-xs text-gray-400 mt-3">The {analysis.recommendedSystem}kWp system gives you the best return on investment. A site survey will confirm your roof can fit your preferred size.</p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                    <button onClick={() => setShowBattery(!showBattery)} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <Battery className={`w-5 h-5 ${analysis.batteryWorthwhile ? 'text-green-400' : 'text-gray-500'}`} />
                        <div className="text-left">
                          <p className="text-sm font-semibold">Battery Storage Assessment</p>
                          <p className="text-xs text-gray-400">Should you add a battery to your solar system?</p>
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
                            <div className="text-center p-3 rounded-lg bg-white/[0.03]"><p className="text-lg font-bold text-green-400">€{analysis.estimatedBatteryCost.toLocaleString()}</p><p className="text-[10px] text-gray-400 uppercase">est. cost</p></div>
                            <div className="text-center p-3 rounded-lg bg-white/[0.03]"><p className="text-lg font-bold text-white">{analysis.batteryPaybackYears} yrs</p><p className="text-[10px] text-gray-400 uppercase">battery payback</p></div>
                            <div className="text-center p-3 rounded-lg bg-white/[0.03]"><p className="text-lg font-bold text-amber-400">5 kWh</p><p className="text-[10px] text-gray-400 uppercase">capacity</p></div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                    <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                      <span className="text-sm font-semibold flex items-center gap-2"><Info className="w-4 h-4 text-gray-500" /> Detailed Calculation Breakdown</span>
                      {showDetails ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                    {showDetails && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-5 border-t border-white/[0.06] pt-4">
                        <div className="space-y-3 text-sm">
                          {[
                            ['Annual electricity cost', `€${annualCost.toLocaleString()}`, 'text-white'],
                            ['Provider unit rate', `€${analysis.unitRate.toFixed(4)}/kWh`, 'text-white'],
                            ['Standing charge (est.)', `€${analysis.standingCharge.toFixed(2)}/day`, 'text-white'],
                            ['Recommended system', `${analysis.recommendedSystem} kWp`, 'text-amber-400'],
                            ['Est. annual generation', `${analysis.monthlyProfile.reduce((s, m) => s + m.generation, 0).toLocaleString()} kWh`, 'text-white'],
                            ['Self-consumption saving', `€${analysis.annualSaving.toLocaleString()}/yr`, 'text-white'],
                            [`Export payment (${SOLAR_DATA.export.label})`, `€${analysis.annualExportEarning.toLocaleString()}/yr`, 'text-white'],
                            ['Total annual benefit', `€${analysis.totalAnnualBenefit.toLocaleString()}/yr`, 'text-amber-400 font-bold'],
                            ['System cost (before grant)', `€${analysis.installCost.toLocaleString()}`, 'text-white'],
                            ['SEAI grant', `- €${analysis.seaiGrant.toLocaleString()}`, 'text-blue-400'],
                            ['Cost after grant', `€${analysis.costAfterGrant.toLocaleString()}`, 'text-white'],
                            ['Payback period', `${analysis.paybackYears} years`, 'text-white'],
                            ['Annual CO₂ reduction', `${analysis.annualCo2Saved.toLocaleString()} kg`, 'text-emerald-400'],
                            ['25-year CO₂ reduction', `${analysis.co2Saved25Years.toLocaleString()} kg (${analysis.treesEquiv25Years} trees)`, 'text-emerald-400'],
                          ].map(([label, value, cls]) => (
                            <div key={label as string} className="flex justify-between py-2 border-b border-white/[0.04]">
                              <span className="text-gray-400">{label}</span>
                              <span className={cls}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* ─── EMAIL-FIRST REPORT CAPTURE — every analysis becomes a lead ─── */}
                  <div className="rounded-2xl bg-gradient-to-br from-amber-400/[0.1] via-amber-400/[0.04] to-transparent border border-amber-400/20 p-4 sm:p-7">
                    {leadStatus === 'sent' ? (
                      <div className="flex flex-col items-center text-center py-2" role="status" aria-live="polite">
                        <div className="w-12 h-12 rounded-full bg-green-400/15 flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1.5">We&apos;ve got your details</h4>
                        <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                          Your estimate is saved against <span className="text-white font-medium">{leadEmail.trim()}</span> and
                          our team will send your personalised report and arrange your free survey — no pressure, no hard sell.
                        </p>
                        <a
                          href="/book-survey?src=analyser"
                          onClick={() => {
                            try {
                              const [firstName, ...restName] = leadName.trim().split(/\s+/);
                              sessionStorage.setItem('sig-survey-prefill', JSON.stringify({
                                firstName: firstName || '',
                                lastName: restName.join(' '),
                                email: leadEmail.trim(),
                                phone: leadPhone.trim(),
                                eircode: leadEircode.trim().toUpperCase(),
                                currentBill: analysis ? String(analysis.monthlyBill) : '',
                                notes: analysis ? `From the bill analyser: ${analysis.recommendedSystem}kWp recommended, ~€${analysis.totalAnnualBenefit}/yr benefit.` : '',
                              }));
                            } catch { /* storage unavailable - form still works blank */ }
                          }}
                          className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]">
                          <CalendarCheck className="w-4 h-4" /> Pick my survey time
                        </a>
                        <button onClick={downloadReport}
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-gray-300 hover:text-white hover:bg-white/[0.08] transition-all">
                          <Download className="w-4 h-4" /> Download your summary
                        </button>
                        <a href={buildWhatsAppUrl({ source: 'bill-analyser', annualSaving: analysis.annualSaving, paybackYears: analysis.paybackYears, monthlyBill: analysis.monthlyBill, homeType: analysis.homeType, recommendedSystem: analysis.recommendedSystem, provider: analysis.provider })}
                          target="_blank" rel="noopener noreferrer"
                          className="mt-4 text-xs text-gray-400 hover:text-green-400 transition-colors">
                          Can&apos;t wait? WhatsApp us now →
                        </a>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-white leading-tight">Send me my full estimate</h4>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1 leading-relaxed">
                              We&apos;ll email your full personalised estimate and arrange your free home survey. Your eircode lets us check your roof before we call. No spam, ever.
                            </p>
                          </div>
                        </div>
                        <form onSubmit={handleEmailReport} className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="text" autoComplete="name" placeholder="Your name" aria-label="Your name" value={leadName}
                              onChange={(e) => { setLeadName(e.target.value); if (leadError) setLeadError(null); }}
                              className="w-full px-4 py-3.5 rounded-xl bg-black/30 border border-white/[0.1] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all" />
                            <input type="email" inputMode="email" autoComplete="email" placeholder="Email" aria-label="Email address for your savings report" value={leadEmail}
                              onChange={(e) => { setLeadEmail(e.target.value); if (leadError) setLeadError(null); }}
                              className="w-full px-4 py-3.5 rounded-xl bg-black/30 border border-white/[0.1] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all" />
                            <input type="tel" inputMode="tel" autoComplete="tel" placeholder="Mobile" aria-label="Mobile number" value={leadPhone}
                              onChange={(e) => { setLeadPhone(e.target.value); if (leadError) setLeadError(null); }}
                              className="w-full px-4 py-3.5 rounded-xl bg-black/30 border border-white/[0.1] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all" />
                            <div>
                              <input type="text" autoComplete="postal-code" placeholder="Eircode (for your survey)" aria-label="Eircode" value={leadEircode}
                                onChange={(e) => { setLeadEircode(e.target.value); if (leadError) setLeadError(null); }}
                                className={`w-full px-4 py-3.5 rounded-xl bg-black/30 border text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400/10 transition-all ${leadEircode.trim() && !isValidEircode(leadEircode) ? 'border-amber-400/50' : leadEircode.trim() && isValidEircode(leadEircode) ? 'border-green-400/50' : 'border-white/[0.1] focus:border-amber-400/50'}`} />
                              {leadEircode.trim() && (
                                <p className={`mt-1.5 text-[11px] flex items-center gap-1 ${isValidEircode(leadEircode) ? 'text-green-400' : 'text-amber-400/80'}`}>
                                  {isValidEircode(leadEircode)
                                    ? <><Check className="w-3 h-3" /> {formatEircode(leadEircode)} — we&apos;ll use this to find your home for the survey</>
                                    : <>Doesn&apos;t look like a full Eircode yet (e.g. D02 X285)</>}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button type="submit" disabled={leadStatus === 'sending'}
                            className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-4 rounded-xl text-sm shadow-lg shadow-amber-400/20 transition-all disabled:shadow-none">
                            {leadStatus === 'sending' ? 'Sending…' : <>Send My Full Estimate <ArrowRight className="ml-2 w-4 h-4" /></>}
                          </Button>
                        </form>
                        {leadError && (
                          <p role="alert" className="mt-2.5 text-xs text-red-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {leadError}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-white/[0.05]">
                          <a href={buildWhatsAppUrl({
                            source: 'bill-analyser',
                            annualSaving: analysis.annualSaving,
                            paybackYears: analysis.paybackYears,
                            total25yrSaving: analysis.total25YearSavings,
                            monthlyBill: analysis.monthlyBill,
                            annualUsage: analysis.annualUsage,
                            homeType: analysis.homeType,
                            recommendedSystem: analysis.recommendedSystem,
                            provider: analysis.provider,
                          })} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1.5">
                            <Share2 className="w-3.5 h-3.5" /> Prefer WhatsApp? Send us this analysis
                          </a>
                          <button onClick={downloadReport} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5" /> Download summary
                          </button>
                          <button onClick={reset} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5" /> Start over
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div role="alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mx-6 mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
