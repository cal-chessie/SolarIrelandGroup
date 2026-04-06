'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  ArrowRight,
  Shield,
  Zap,
  Euro,
  Sun,
  Clock,
  CheckCircle2,
  Star,
  ChevronDown,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ═══════════════════════════════════════════════════════════════
   WORLD-CLASS HERO — GPU-safe animations only
   ─────────────────────────────────────────────────────────────
   ❌ NO CSS filter (drop-shadow, backdrop-filter)
   ✅ ONLY transform + opacity (GPU-composited)
   ✅ box-shadow is safe (composited separately)
   ✅ will-change for GPU layer promotion
   ✅ requestAnimationFrame for JS counters
   ✅ contain: layout style for paint isolation
   ═══════════════════════════════════════════════════════════════ */

/* ─── Animated counter hook ─── */
function useCounter(target: number, duration = 2200, loaded = false) {
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!loaded || hasRun.current) return;
    hasRun.current = true;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(target * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    // Double-rAF to ensure paint is settled before we start
    requestAnimationFrame(() => requestAnimationFrame(tick));
  }, [loaded, target, duration]);

  return value;
}

/* ─── Live savings ticker hook ─── */
function useLiveTicker(baseK: number) {
  const [k, setK] = useState(baseK);
  const totalRef = useRef(baseK);

  useEffect(() => {
    const id = setInterval(() => {
      totalRef.current += Math.random() * 0.4 + 0.05;
      setK(Math.round(totalRef.current * 10) / 10);
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, []);

  return k;
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED STAT PILL
   ═══════════════════════════════════════════════════════════════ */
function StatPill({
  icon: Icon,
  label,
  target,
  prefix = '',
  suffix = '',
  color,
  loaded,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  target: number;
  prefix?: string;
  suffix?: string;
  color: string;
  loaded: boolean;
}) {
  const value = useCounter(target, 2200, loaded);

  return (
    <div className="stat-pill group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/30 border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 overflow-hidden">
      <div
        className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white leading-tight tabular-nums">
          {prefix}<span className="tabular-nums">{value.toLocaleString()}</span>{suffix}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const bumblebeeRef = useRef<HTMLDivElement>(null);
  const liveSavings = useLiveTicker(847.3);

  /* ─── Deferred animation start ─── */
  useEffect(() => {
    const start = () => setLoaded(true);
    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback(start, { timeout: 600 });
    } else {
      setTimeout(start, 150);
    }
  }, []);

  /* ─── Mouse parallax on bumblebee ─── */
  useEffect(() => {
    const el = bumblebeeRef.current;
    if (!el) return;
    let ticking = false;

    const onMove = (e: MouseEvent) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const x = ((e.clientX - cx) / cx) * 10;
        const y = ((e.clientY - cy) / cy) * 6;
        el.style.transform = `translate(${x}px, ${y}px)`;
        ticking = false;
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      className="hero-section relative min-h-screen flex items-center overflow-hidden"
      style={{ contain: 'layout style' }}
    >
      {/* ═══════════════════════════════════════
          BACKGROUND LAYERS
          ═══════════════════════════════════════ */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Hero image */}
        <img
          src="/hero-solar.jpg"
          alt=""
          width={1920}
          height={1080}
          className="hero-bg w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        {/* Gradient overlay */}
        <div className="hero-bg absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0a0a0a]" />

        {/* ─── Animated gradient orbs (GPU-safe: opacity + transform only) ─── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-orb hero-orb-1 absolute w-[700px] h-[700px] rounded-full -top-64 -right-64 opacity-0" style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 70%)' }} />
          <div className="hero-orb hero-orb-2 absolute w-[500px] h-[500px] rounded-full bottom-10 -left-40 opacity-0" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)' }} />
          <div className="hero-orb hero-orb-3 absolute w-[300px] h-[300px] rounded-full top-1/2 left-1/2 opacity-0" style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 70%)' }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-32 sm:pb-36">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-6">
          {/* ─── Text Column ─── */}
          <div className="max-w-2xl flex-1 text-center lg:text-left">
            {/* Badge */}
            <span
              className="hero-fade-up inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-black/40 text-amber-400 border border-white/[0.15]"
              style={{ animationDelay: '0.1s' }}
            >
              <Sun className="w-3.5 h-3.5" />
              SEAI Registered Installer
            </span>

            {/* Headline */}
            <div className="mt-6 sm:mt-8">
              <h1
                className="hero-fade-up text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[0.95]"
                style={{ animationDelay: '0.2s' }}
              >
                <span className="text-white">Your Energy.</span>
              </h1>
              <h1
                className="hero-fade-up text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[0.95]"
                style={{ animationDelay: '0.35s' }}
              >
                <span className="text-gradient">Your Asset.</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className="hero-fade-up mt-6 text-base sm:text-lg text-gray-200/90 max-w-lg leading-relaxed mx-auto lg:mx-0"
              style={{ animationDelay: '0.5s' }}
            >
              Upload your electricity bill and our AI will show you exactly what
              solar will save you. We handle everything — survey, install,
              and your <strong className="text-white font-semibold">{SOLAR_DATA.grant.label} SEAI grant</strong>.
            </p>

            {/* CTAs */}
            <div
              className="hero-fade-up mt-8 sm:mt-10 flex flex-col sm:flex-row items-center lg:items-start gap-3"
              style={{ animationDelay: '0.65s' }}
            >
              {/* Primary CTA — shimmer sweep */}
              <a
                href="#calculator"
                className="hero-cta-shimmer inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm tracking-wide shadow-xl shadow-amber-400/20 w-full sm:w-auto justify-center relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  <Zap className="w-4 h-4" />
                  Analyse My Bill — Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </a>
              {/* Secondary CTA */}
              <a
                href={buildWhatsAppUrl({ source: 'hero' })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-white/20 bg-black/30 text-white text-sm tracking-wide w-full sm:w-auto justify-center hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                WhatsApp Us
              </a>
            </div>

            {/* Trust bar */}
            <div
              className="hero-fade-up flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-10"
              style={{ animationDelay: '0.8s' }}
            >
              {[
                { icon: Shield, label: 'RECI Registered', color: 'text-green-400' },
                { icon: CheckCircle2, label: 'SEAI Certified', color: 'text-amber-400' },
                { icon: Star, label: '5-Year Warranty', color: 'text-sky-400' },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-gray-300">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span>{item.label}</span>
                  {i < 2 && <span className="text-white/20 ml-1">·</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right Side: Bumblebee + Stats ─── */}
          <div className="flex-shrink-0 lg:mt-8 w-full lg:w-auto">
            <div className="flex flex-col items-center gap-6">
              {/* Bumblebee — CSS float + JS parallax */}
              <div
                ref={bumblebeeRef}
                className="hero-fade-up transition-transform duration-500 ease-out"
                style={{ animationDelay: '0.4s', willChange: 'transform' }}
              >
                <img
                  src="/bumblebee-hero.png"
                  alt="Solar Ireland Bumblebee"
                  width={224}
                  height={224}
                  className={`w-48 h-48 sm:w-56 sm:h-56 ${loaded ? 'bumblebee-float' : ''}`}
                />
              </div>

              {/* Live savings — animated ticker */}
              <div
                className="hero-fade-up inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 border border-white/[0.08]"
                style={{ animationDelay: '0.55s' }}
              >
                <Euro className="w-3.5 h-3.5 text-green-400" />
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-400">Irish homes saving right now:</span>
                  <span className="text-xs font-bold text-green-400 tabular-nums">
                    €{liveSavings.toLocaleString('en-IE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k
                  </span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>

              {/* Stat pills — animated counters */}
              <div
                className="hero-fade-up grid grid-cols-2 gap-3 w-full max-w-xs"
                style={{ animationDelay: '0.7s' }}
              >
                <StatPill icon={Euro} label="Avg. annual saving" target={SOLAR_DATA.savings.avgAnnual} prefix="€" suffix="/yr" color="bg-green-400/10 text-green-400" loaded={loaded} />
                <StatPill icon={Clock} label="Payback period" target={SOLAR_DATA.savings.paybackYears} suffix=" years" color="bg-amber-400/10 text-amber-400" loaded={loaded} />
                <StatPill icon={Zap} label="25-year savings" target={Math.round(SOLAR_DATA.savings.total25yr / 1000)} prefix="€" suffix="k+" color="bg-sky-400/10 text-sky-400" loaded={loaded} />
                <StatPill icon={Sun} label="SEAI grant" target={SOLAR_DATA.grant.amount} prefix="€" color="bg-violet-400/10 text-violet-400" loaded={loaded} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Service Areas ─── */}
        <div
          className="hero-fade-up mt-14 sm:mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2.5 text-xs text-gray-300"
          style={{ animationDelay: '0.9s' }}
        >
          {SOLAR_DATA.serviceAreas.map((area) => (
            <span key={area} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
              {area}
            </span>
          ))}
          <span className="text-white/15">|</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
            Free surveys nationwide
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SCROLL INDICATOR
          ═══════════════════════════════════════ */}
      <div
        className="hero-fade-up absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        style={{ animationDelay: '1.1s' }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Scroll</span>
        <ChevronDown className="w-4 h-4 text-white/30 scroll-bounce" />
      </div>
    </section>
  );
}
