'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  MessageCircle,
  ArrowRight,
  Shield,
  Zap,
  Sun,
  CheckCircle2,
  Star,
  ChevronDown,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ═══════════════════════════════════════════════════════════════
   SIMPLIFIED HERO — Decluttered, GPU-safe animations only
   ─────────────────────────────────────────────────────────────
   ❌ NO CSS filter (drop-shadow, backdrop-filter)
   ✅ ONLY transform + opacity (GPU-composited)
   ✅ box-shadow is safe (composited separately)
   ✅ will-change for GPU layer promotion
   ✅ contain: layout style for paint isolation
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   HERO COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const bumblebeeRef = useRef<HTMLDivElement>(null);

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
        const x = ((e.clientX - cx) / cx) * 8;
        const y = ((e.clientY - cy) / cy) * 5;
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
      style={{ contain: 'layout' }}
    >
      {/* ═══════════════════════════════════════
          BACKGROUND LAYERS
          ═══════════════════════════════════════ */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Hero image */}
        <Image
          src="/hero-solar.webp"
          alt=""
          fill
          sizes="100vw"
          className="hero-bg object-cover"
          priority
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
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-28 pb-28 sm:pb-32">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-6">
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
                className="hero-fade-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95]"
                style={{ animationDelay: '0.2s' }}
              >
                <span className="text-white">Your Energy.</span>
              </h1>
              <h1
                className="hero-fade-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95]"
                style={{ animationDelay: '0.35s' }}
              >
                <span className="text-gradient">Your Asset.</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className="hero-fade-up mt-5 sm:mt-6 text-base sm:text-lg text-gray-200/90 max-w-lg leading-relaxed mx-auto lg:mx-0"
              style={{ animationDelay: '0.5s' }}
            >
              Upload your electricity bill and our AI will show you exactly what
              solar will save you. We handle everything — survey, install,
              and your <strong className="text-white font-semibold">{SOLAR_DATA.grant.label} SEAI grant</strong>.
            </p>

            {/* CTAs */}
            <div
              className="hero-fade-up mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto lg:items-start"
              style={{ animationDelay: '0.65s' }}
            >
              {/* Primary CTA — shimmer sweep */}
              <button
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                className="hero-cta-shimmer inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm tracking-wide shadow-xl shadow-amber-400/20 w-full sm:w-auto relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  <Zap className="w-4 h-4" />
                  Analyse My Bill — Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
              {/* Secondary CTA */}
              <a
                href={buildWhatsAppUrl({ source: 'hero' })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full border border-white/20 bg-black/30 text-white text-sm tracking-wide w-full sm:w-auto hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                WhatsApp Us
              </a>
            </div>

            {/* Trust bar — compact */}
            <div
              className="hero-fade-up mt-8 sm:mt-10"
              style={{ animationDelay: '0.8s' }}
            >
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-x-5">
                {[
                  { icon: Shield, label: 'RECI Registered', color: 'text-green-400' },
                  { icon: CheckCircle2, label: 'SEAI Certified', color: 'text-amber-400' },
                  { icon: Star, label: '25-Year Warranty', color: 'text-sky-400' },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-gray-300">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span>{item.label}</span>
                    {i < 2 && <span className="text-white/20 ml-1 hidden sm:inline">·</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right Side: Bumblebee (smaller) ─── */}
          <div className="flex-shrink-0 lg:mt-4 hidden sm:block">
            <div
              ref={bumblebeeRef}
              className="hero-fade-up transition-transform duration-500 ease-out"
              style={{ animationDelay: '0.4s', willChange: 'transform' }}
            >
              <Image
                src="/bumblebee-hero.webp"
                alt="Solar Ireland Bumblebee"
                width={160}
                height={160}
                className={`w-36 h-36 md:w-44 md:h-44 ${loaded ? 'bumblebee-float' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* ─── Service Areas — subtle ─── */}
        <div
          className="hero-fade-up mt-12 sm:mt-14 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 text-[11px] sm:text-xs text-gray-400"
          style={{ animationDelay: '0.9s' }}
        >
          {SOLAR_DATA.serviceAreas.map((area) => (
            <span key={area} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green-400/60" />
              {area}
            </span>
          ))}
          <span className="text-white/10">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-amber-400/60" />
            Free surveys nationwide
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SCROLL INDICATOR — simple chevron
          ═══════════════════════════════════════ */}
      <div
        className="hero-fade-up absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        style={{ animationDelay: '1.1s' }}
      >
        <ChevronDown className="w-5 h-5 text-white/25 scroll-bounce" />
      </div>
    </section>
  );
}
