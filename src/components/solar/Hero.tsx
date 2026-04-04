'use client';

import { MessageCircle, ArrowRight, Shield, Zap, Euro, Sun, Clock, CheckCircle2, Star, ChevronDown } from 'lucide-react';

/* ═══════════════════════════════════════════
   STATIC HERO — zero JS execution at mount
   No useEffect. No IntersectionObserver.
   No useState. No animated counters.
   No CSS filters (drop-shadow). No animations.
   Pure static HTML rendered by server + hydrate.
   ═══════════════════════════════════════════ */
export default function Hero() {
  return (
    <section
      className="hero-section relative min-h-screen flex items-center overflow-hidden"
      style={{ contain: 'layout style' }}
    >
      {/* ─── Background ─── */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/hero-solar.jpg"
          alt=""
          width={1920}
          height={1080}
          className="hero-bg w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-bg absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0a0a0a]" />
      </div>

      {/* ─── Content area with solid bg for text contrast (no drop-shadow filters) ─── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-32 sm:pb-36">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-6">
          {/* ─── Text column ─── */}
          <div className="max-w-2xl flex-1 text-center lg:text-left">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-black/40 text-amber-400 border border-white/[0.15]">
              <Sun className="w-3.5 h-3.5" />
              SEAI Registered Installer
            </span>

            {/* Headline */}
            <div className="mt-6 sm:mt-8">
              <h1 className="text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[0.95]">
                <span className="text-white">Your Energy.</span>
              </h1>
              <h1 className="text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[0.95]">
                <span className="text-gradient">Your Asset.</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-gray-200/90 max-w-lg leading-relaxed mx-auto lg:mx-0">
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
                <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-gray-300">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span>{item.label}</span>
                  {i < 2 && <span className="text-white/20 ml-1">·</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right side: Bumblebee + Stats ─── */}
          <div className="flex-shrink-0 lg:mt-8 w-full lg:w-auto">
            <div className="flex flex-col items-center gap-6">
              {/* Bumblebee — completely static */}
              <img
                src="/bumblebee-hero.png"
                alt="Solar Ireland Bumblebee"
                width={224}
                height={224}
                className="w-48 h-48 sm:w-56 sm:h-56"
              />

              {/* Live savings — static value, no ticking */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 border border-white/[0.08]">
                <Euro className="w-3.5 h-3.5 text-green-400" />
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-400">Irish homes saving right now:</span>
                  <span className="text-xs font-bold text-green-400 tabular-nums">€847.3k</span>
                </div>
              </div>

              {/* Stat pills — STATIC values, no animation */}
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-[280px]">
                {[
                  { icon: Euro, label: 'Avg. annual saving', value: '€1,100/yr', color: 'bg-green-400/10 text-green-400' },
                  { icon: Clock, label: 'Payback period', value: '6 years', color: 'bg-amber-400/10 text-amber-400' },
                  { icon: Zap, label: '25-year savings', value: '€38k+', color: 'bg-sky-400/10 text-sky-400' },
                  { icon: Sun, label: 'SEAI grant', value: '€1,800', color: 'bg-violet-400/10 text-violet-400' },
                ].map((stat) => (
                  <div key={stat.label} className="stat-pill flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/30 border border-white/[0.08]">
                    <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-none">{stat.value}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Service areas ─── */}
        <div className="mt-16 sm:mt-20 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-gray-300">
          {['Connacht', 'Leinster', 'Munster'].map((area) => (
            <span key={area} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
              {area}
            </span>
          ))}
          <span className="text-white/15">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
            Free surveys nationwide
          </span>
        </div>
      </div>

      {/* ─── Scroll indicator ─── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Scroll</span>
        <ChevronDown className="w-4 h-4 text-white/30" />
      </div>
    </section>
  );
}
