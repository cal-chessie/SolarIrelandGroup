'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import DaylightTrack from './DaylightTrack';
import {
  Shield,
  Sun,
  CheckCircle2,
  Star,
  ChevronDown,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import BillAnalyser from './BillAnalyser';


export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const bumblebeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const start = () => setLoaded(true);
    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback(start, { timeout: 600 });
    } else {
      setTimeout(start, 150);
    }
  }, []);

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
      {/* 
          BACKGROUND LAYERS
           */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/hero-solar.webp"
          alt=""
          fill
          sizes="100vw"
          quality={85}
          className="hero-bg hero-kenburns object-cover"
          priority
        />
        <div className="hero-bg absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0a0a0a]" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-orb hero-orb-1 absolute w-[700px] h-[700px] rounded-full -top-64 -right-64 opacity-0" style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 70%)' }} />
          <div className="hero-orb hero-orb-2 absolute w-[500px] h-[500px] rounded-full bottom-10 -left-40 opacity-0" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)' }} />
          <div className="hero-orb hero-orb-3 absolute w-[300px] h-[300px] rounded-full top-1/2 left-1/2 opacity-0" style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 70%)' }} />
        </div>
      </div>

      {/* CONTENT: Cal's Bill Analyser is the hero door (CALL-FUNNEL-PLAN
          ruling 3). The promise on the left, the upload on the right; once a
          bill is chosen the analyser takes the whole width in place. */}
      <div id="calculator" style={{ scrollMarginTop: 72 }} className="relative z-10 w-full max-w-6xl xl:max-w-[74rem] 2xl:max-w-[86rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 sm:pb-28">
        <div className="hero-fade-up" style={{ animationDelay: '0.2s' }}>
          <BillAnalyser
            variant="hero"
            door="hero"
            intro={
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-black/40 text-amber-400 border border-white/[0.15]">
                  <Sun className="w-3.5 h-3.5" />
                  SEAI Registered Installer
                </span>
                <h1 className="mt-5 sm:mt-7 text-[2rem] leading-[1.05] sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold tracking-tight">
                  <span className="hero-lcp block text-white">Snap your electricity bill.</span>
                  <span className="hero-lcp block text-gradient hero-sheen">See what solar would save you.</span>
                </h1>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg xl:text-xl text-gray-200/90 max-w-xl leading-relaxed mx-auto lg:mx-0">
                  We read your supplier, your unit rate and your day and night split, then show you the saving. Free, and nothing to sign up for to see it.
                </p>
                <div className="mt-6 hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2">
                  {[
                    { icon: Shield, label: 'RECI Registered', color: 'text-green-400' },
                    { icon: CheckCircle2, label: 'SEAI Certified', color: 'text-amber-400' },
                    { icon: Star, label: '25-Year Warranty', color: 'text-sky-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-300">
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 hidden lg:flex items-center gap-6">
                  <div ref={bumblebeeRef} className="transition-transform duration-500 ease-out" style={{ willChange: 'transform' }}>
                    <Image src="/bumblebee-hero.webp" alt="Solar Ireland Bumblebee" width={112} height={112} className={`w-24 h-24 ${loaded ? 'bumblebee-float' : ''}`} />
                  </div>
                  <DaylightTrack className="shrink-0" />
                </div>
              </div>
            }
          />
        </div>

        <div className="hero-fade-up mt-10 sm:mt-14 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 text-[11px] sm:text-xs text-gray-400" style={{ animationDelay: '0.9s' }}>
          {SOLAR_DATA.serviceAreas.map((area) => (
            <span key={area} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green-400/60" />
              {area}
            </span>
          ))}
          <span className="text-white/10">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-amber-400/60" />
            Free 15-minute call, all 32 counties
          </span>
        </div>
      </div>

      {/* 
          SCROLL INDICATOR - simple chevron
           */}
      <div
        className="hero-fade-up absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        style={{ animationDelay: '1.1s' }}
      >
        <ChevronDown className="w-5 h-5 text-white/25 scroll-bounce" />
      </div>
    </section>
  );
}
