'use client';

import { useState, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BumblebeeMascot from './BumblebeeMascot';

interface BillAnalysis {
  provider: string;
  monthlyBill: number;
  annualUsage: number;
  homeType: string;
  annualSaving: number;
  paybackPeriod: number;
  seaiGrant: number;
  twentyFiveYearValue: number;
  systemSize: string;
}

const HOME_TYPES = ['Detached', 'Semi-detached', 'Terraced', 'Apartment', 'Bungalow'];
const PROVIDERS = [
  'ESB',
  'Electric Ireland',
  'Bord Gáis Energy',
  'SSE Airtricity',
  'Energia',
  'Panda',
  'PrepayPower',
  'Other',
];

export default function BillAnalyser() {
  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. You can try entering your details manually.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleManualAnalyse = async () => {
    const bill = parseFloat(monthlyBill);
    const usage = parseFloat(annualUsage);

    if (!bill || bill <= 0 || !usage || usage <= 0) {
      setError('Please enter your monthly bill and annual usage.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await fetch('/api/analyse-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyBill: bill,
          annualUsage: usage,
          homeType,
          provider,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to calculate savings.');
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setError(null);
    setUploadedFile(null);
  };

  return (
    <section id="calculator" className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <Sparkles className="inline-block w-9 h-9 text-amber-400 mr-2 -mt-1" />
            AI Bill <span className="text-gradient">Analyser</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your electricity bill and our AI will show you exactly what
            solar will save you.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-sm">AI Bill Analyser</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* No results yet — show input */}
              {!analysis && !isAnalyzing && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Mode toggle */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <button
                      onClick={() => {
                        setMode('upload');
                        reset();
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        mode === 'upload'
                          ? 'bg-amber-400 text-black'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Upload className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                      Upload Bill
                    </button>
                    <button
                      onClick={() => {
                        setMode('manual');
                        reset();
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        mode === 'manual'
                          ? 'bg-amber-400 text-black'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <FileText className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                      Enter Manually
                    </button>
                  </div>

                  {/* Upload Mode */}
                  {mode === 'upload' && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center p-10 sm:p-14 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        dragOver
                          ? 'border-amber-400 bg-amber-400/5'
                          : 'border-white/10 hover:border-amber-400/40 hover:bg-white/[0.02]'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(file);
                        }}
                      />

                      <Upload
                        className={`w-12 h-12 mb-4 ${dragOver ? 'text-amber-400' : 'text-gray-500'}`}
                      />
                      <p className="text-white font-medium mb-1">
                        {uploadedFile || 'Drop your electricity bill here'}
                      </p>
                      <p className="text-sm text-gray-500 text-center">
                        Photo, scan or PDF &mdash; ESB, Electric Ireland, Bord
                        Gáis, SSE Airtricity
                      </p>

                      {uploadedFile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reset();
                          }}
                          className="mt-3 text-xs text-gray-400 hover:text-white flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                  )}

                  {/* Manual Mode */}
                  {mode === 'manual' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="monthly-bill"
                            className="block text-sm text-gray-400 mb-2"
                          >
                            Monthly Bill (&euro;)
                          </label>
                          <div className="relative">
                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                              id="monthly-bill"
                              type="number"
                              placeholder="160"
                              value={monthlyBill}
                              onChange={(e) => setMonthlyBill(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="annual-usage"
                            className="block text-sm text-gray-400 mb-2"
                          >
                            Annual Usage (kWh)
                          </label>
                          <div className="relative">
                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                              id="annual-usage"
                              type="number"
                              placeholder="4800"
                              value={annualUsage}
                              onChange={(e) => setAnnualUsage(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="home-type"
                            className="block text-sm text-gray-400 mb-2"
                          >
                            Home Type
                          </label>
                          <div className="relative">
                            <select
                              id="home-type"
                              value={homeType}
                              onChange={(e) => setHomeType(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white appearance-none focus:outline-none focus:border-amber-400/50 transition-colors"
                            >
                              {HOME_TYPES.map((t) => (
                                <option key={t} value={t} className="bg-zinc-900">
                                  {t}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="provider"
                            className="block text-sm text-gray-400 mb-2"
                          >
                            Provider
                          </label>
                          <div className="relative">
                            <select
                              id="provider"
                              value={provider}
                              onChange={(e) => setProvider(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white appearance-none focus:outline-none focus:border-amber-400/50 transition-colors"
                            >
                              {PROVIDERS.map((p) => (
                                <option key={p} value={p} className="bg-zinc-900">
                                  {p}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleManualAnalyse}
                        className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-3 rounded-xl"
                      >
                        <Sparkles className="mr-2 w-4 h-4" />
                        Analyse My Savings
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Loading state */}
              {isAnalyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <div className="mb-6">
                    <BumblebeeMascot size="lg" />
                  </div>
                  <p className="text-white font-medium mb-1">
                    {mode === 'upload'
                      ? 'Analysing your bill...'
                      : 'Calculating your savings...'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Our AI is reading the details from your electricity bill
                  </p>
                </motion.div>
              )}

              {/* Results */}
              {analysis && !isAnalyzing && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Bill summary */}
                  {mode === 'upload' && (
                    <div className="flex items-center justify-between mb-6 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-sm font-medium">
                            {analysis.provider}
                          </p>
                          <p className="text-xs text-gray-500">
                            {analysis.homeType} home
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-amber-400">
                          &euro;{analysis.monthlyBill}/month
                        </p>
                        <p className="text-xs text-gray-500">
                          {analysis.annualUsage.toLocaleString()} kWh/year
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Result cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <ResultCard
                      icon={Euro}
                      label="Annual Saving"
                      value={`€${analysis.annualSaving.toLocaleString()}`}
                      sub={`with ${analysis.systemSize} system`}
                    />
                    <ResultCard
                      icon={Clock}
                      label="Payback Period"
                      value={`${analysis.paybackPeriod} yrs`}
                      sub="after SEAI grant"
                    />
                    <ResultCard
                      icon={Zap}
                      label="SEAI Grant"
                      value={`€${analysis.seaiGrant.toLocaleString()}`}
                      sub={`for ${analysis.systemSize} system`}
                    />
                    <ResultCard
                      icon={TrendingUp}
                      label="25-Year Value"
                      value={`€${analysis.twentyFiveYearValue.toLocaleString()}`}
                      sub="electricity saved"
                    />
                  </div>

                  {/* Solar Recommendation */}
                  <div className="rounded-xl bg-amber-400/[0.05] border border-amber-400/20 p-5 mb-6">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Solar Recommendation
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Based on your electricity usage of{' '}
                      <span className="text-white font-medium">
                        {analysis.annualUsage.toLocaleString()} kWh/year
                      </span>{' '}
                      from{' '}
                      <span className="text-white font-medium">
                        {analysis.provider}
                      </span>
                      , we recommend a{' '}
                      <span className="text-amber-400 font-medium">
                        {analysis.systemSize}
                      </span>{' '}
                      solar PV system. This would offset a significant portion of
                      your electricity costs and pay for itself in approximately{' '}
                      <span className="text-white font-medium">
                        {analysis.paybackPeriod} years
                      </span>
                      . Contact us for a free site survey to get a precise
                      quote for your home.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-semibold py-3 rounded-xl"
                      asChild
                    >
                      <a
                        href={`https://wa.me/353873958424?text=Hi%2C%20I%20analysed%20my%20bill%20and%20would%20like%20a%20free%20survey.%20Monthly%20bill%3A%20%E2%82%AC${analysis.monthlyBill}%2C%20Usage%3A%20${analysis.annualUsage}%20kWh%2C%20Provider%3A%20${encodeURIComponent(analysis.provider)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get Your Free Survey
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={reset}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10 py-3 rounded-xl"
                    >
                      Analyse Another Bill
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            {/* Disclaimer */}
            {!analysis && !isAnalyzing && (
              <p className="mt-6 text-xs text-gray-600 text-center">
                Estimates based on current SEAI grant rates, average Irish solar
                yields, and your reported usage. Actual savings depend on roof
                orientation, shading, and consumption patterns.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ResultCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
      <Icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-amber-400">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}
