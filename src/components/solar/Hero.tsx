'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageCircle, ArrowRight, Shield, Zap, Euro, Sun, Clock, CheckCircle2, Star, ChevronDown } from 'lucide-react';
import BumblebeeMascot from './BumblebeeMascot';

/* ═══════════════════════════════════════════
   ANIMATED COUNTER — lightweight RAF
   ═══════════════════════════════════════════ */
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
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
            el.textContent = prefix + Math.round(current).toString() + suffix;
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ═══════════════════════════════════════════
   LIVE SAVINGS TICKER
   ═══════════════════════════════════════════ */
function SavingsTicker() {
  const [currentSaving, setCurrentSaving] = useState(847293);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSaving((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatted = (currentSaving / 1000).toFixed(1);

  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 border border-white/[0.08]">
      <span className="icon-spin-slow text-green-400">
        <Euro className="w-3.5 h-3.5" />
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-xs text-gray-400">Irish homes saving right now:</span>
        <span className="text-xs font-bold text-green-400 tabular-nums">€{formatted}k</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STAT PILL
   ═══════════════════════════════════════════ */
function StatPill({ icon: Icon, label, value, prefix, suffix, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
}) {
  return (
    <div className="stat-pill flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/30 border border-white/[0.08] cursor-default">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-bold text-white leading-none">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        </p>
        <p className="text-[10px] text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN HERO — ZERO framer-motion, pure CSS
   ═══════════════════════════════════════════ */
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ─── Background — static, no parallax ─── */}
      <div className="absolute inset-0">
        <img
          src="/hero-solar.jpg"
          alt="Modern black frameless solar panels on an Irish home"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 via-50% to-[#0a0a0a]" />
      </div>

      {/* ─── Ambient light effects — static CSS ─── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-400/[0.02] rounded-full pointer-events-none" />

      {/* ─── Main content ─── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-32 sm:pb-36">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-6">
          {/* ─── Text column ─── */}
          <div className="max-w-2xl flex-1 text-center lg:text-left">
            {/* Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-black/30 text-amber-400 border border-white/[0.15]">
                <span className="icon-spin-slow">
                  <Sun className="w-3.5 h-3.5" />
                </span>
                SEAI Registered Installer
              </span>
            </div>

            {/* Headline */}
            <div className="mt-6 sm:mt-8">
              <h1 className="text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[0.95]">
                <span className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">Your Energy.</span>
              </h1>
              <h1 className="text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[0.95]">
                <span className="text-gradient drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">Your Asset.</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-gray-200/90 max-w-lg leading-relaxed mx-auto lg:mx-0 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              Upload your electricity bill and our AI will show you exactly what
              solar will save you. We handle everything — survey, install,
              and your <strong className="text-white font-semibold">€1,800 SEAI grant</strong>.
            </p>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center lg:items-start gap-3">
              <a
                href="#calculator"
                className="hero-cta inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm tracking-wide shadow-xl shadow-amber-400/20 w-full sm:w-auto justify-center"
              >
                <Zap className="w-4 h-4" />
                Analyse My Bill — Free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/353873958424?text=Hi%2C%20I%20have%20a%20question%20about%20solar%20panels."
                target="_blank"
                rel="noopener noreferrer"
                className="hero-cta inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-white/20 bg-black/30 text-white text-sm tracking-wide w-full sm:w-auto justify-center"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                WhatsApp Us
              </a>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-10">
              {[
                { icon: Shield, label: 'RECI Registered', color: 'text-green-400' },
                { icon: CheckCircle2, label: 'SEAI Certified', color: 'text-amber-400' },
                { icon: Star, label: '5-Year Warranty', color: 'text-sky-400' },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span>{item.label}</span>
                  {i < 2 && <span className="text-white/10 ml-1">·</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right side: Bumblebee + Stats ─── */}
          <div className="flex-shrink-0 lg:mt-8 w-full lg:w-auto">
            <div className="flex flex-col items-center gap-6">
              {/* Bumblebee with CSS glow rings */}
              <div className="relative group cursor-pointer">
                <div className="hero-glow-ring hero-glow-ring--inner absolute -inset-8 rounded-full bg-amber-400/[0.04]" />
                <div className="hero-glow-ring hero-glow-ring--outer absolute -inset-14 rounded-full bg-amber-400/[0.02]" />
                <div className="relative">
                  <BumblebeeMascot size="hero" />
                </div>
              </div>

              {/* Live savings ticker */}
              <SavingsTicker />

              {/* Stat pills grid */}
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-[280px]">
                <StatPill icon={Euro} label="Avg. annual saving" value={1100} prefix="€" suffix="/yr" color="bg-green-400/10 text-green-400" />
                <StatPill icon={Clock} label="Payback period" value={6} suffix=" years" color="bg-amber-400/10 text-amber-400" />
                <StatPill icon={Zap} label="25-year savings" value={38} prefix="€" suffix="k+" color="bg-sky-400/10 text-sky-400" />
                <StatPill icon={Sun} label="SEAI grant" value={1800} prefix="€" color="bg-violet-400/10 text-violet-400" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Service areas ─── */}
        <div className="mt-16 sm:mt-20 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-gray-300/70">
          {['Connacht', 'Leinster', 'Munster'].map((area) => (
            <span key={area} className="flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
              {area}
            </span>
          ))}
          <span className="text-white/15">|</span>
          <span className="flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
            Free surveys nationwide
          </span>
        </div>
      </div>

      {/* ─── Scroll indicator ─── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Scroll</span>
        <div className="hero-scroll-bounce">
          <ChevronDown className="w-4 h-4 text-white/30" />
        </div>
      </div>
    </section>
  );
}
