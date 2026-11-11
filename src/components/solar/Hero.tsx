'use client';

import Image from 'next/image';
import { ArrowRight, Sun } from 'lucide-react';
import DaylightTrack from './DaylightTrack';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/**
 * The homepage hero (11 Nov 2026, second pass).
 *
 * Cal on the restructure: "far better but the hero is not right and their no
 * bee". So this is the ORIGINAL hero's look and structure, the one live on
 * main: centered, the "SEAI Registered Installers" pill on top, the big
 * two-line "Your Energy. / Your Asset." headline, and the bee back under the
 * trust row with a gentle bob (CSS, still under reduced motion).
 *
 * Kept from the restructure (DECISIONS.md R1, R4, R6): one value line with no
 * grant breakdown and no "we handle the survey"; one yellow "Check my
 * savings" button to #calculator; WhatsApp as a quiet text link; one trust
 * row of true facts. The hero image is unchanged.
 */
export default function Hero() {
  const toAnalyser = () => {
    const el = document.getElementById('calculator');
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    // Land the keyboard and screen reader on the analyser's heading too.
    const h = el.querySelector<HTMLElement>('h2');
    if (h) {
      if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
      setTimeout(() => h.focus({ preventScroll: true }), reduce ? 0 : 450);
    }
  };

  return (
    <section className="hero-section h-hero h-hero--v2" aria-labelledby="hero-title">
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
      </div>

      <div className="relative z-10 w-full max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 sm:pb-16">
        <div className="mx-auto max-w-3xl text-center flex flex-col items-center">
          <span
            className="hero-fade-up inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-black/40 text-amber-400 border border-white/[0.15]"
            style={{ animationDelay: '0.1s' }}
          >
            <Sun className="w-3.5 h-3.5" aria-hidden="true" />
            SEAI Registered Installers
          </span>

          <h1
            id="hero-title"
            className="mt-5 sm:mt-8 text-[40px] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight leading-[0.95]"
          >
            <span className="hero-lcp block">
              <span className="text-white">Your Energy.</span>
            </span>
            <span className="hero-lcp block">
              <span className="text-gradient hero-sheen">Your Asset.</span>
            </span>
          </h1>

          <p
            className="hero-fade-up mt-4 sm:mt-6 text-base sm:text-lg xl:text-xl text-gray-200/90 max-w-xl leading-relaxed"
            style={{ animationDelay: '0.35s' }}
          >
            Upload your electricity bill and our AI will show you exactly what solar will save you.
          </p>

          <div
            className="hero-fade-up mt-6 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-1 sm:gap-6 w-full sm:w-auto"
            style={{ animationDelay: '0.5s' }}
          >
            <a
              href="#calculator"
              onClick={(e) => {
                e.preventDefault();
                toAnalyser();
              }}
              className="h-btn"
            >
              Check my savings
              <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
            </a>
            <a
              href={buildWhatsAppUrl({ source: 'hero' })}
              target="_blank"
              rel="noopener noreferrer"
              className="h-quiet justify-center"
            >
              or WhatsApp us
            </a>
          </div>

          <p className="hero-fade-up h-hero__trust" style={{ animationDelay: '0.65s' }}>
            <span>SEAI Registered Installers</span>
            <span>RECI registered</span>
            <span>Since 2019</span>
          </p>

          {/* The bee and "Daylight over Ireland" back where they were on main
              (Cal: "put the panels resting back where it was too"): stacked
              under the trust row on phones, side by side from 1024. The right
              margin on phones keeps the pill clear of the chat FAB (fixed at
              bottom-6 right-6), as the original did. */}
          <div className="mt-4 sm:mt-8 flex flex-col items-center gap-4 lg:flex-row lg:gap-6">
            <div className="hero-fade-up" style={{ animationDelay: '0.4s' }}>
              <Image
                src="/bumblebee-hero.webp"
                alt="Solar Ireland's bumblebee"
                width={160}
                height={160}
                className="h-bee h-bee--bob w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32"
              />
            </div>
            <DaylightTrack className="hero-fade-up shrink-0 mr-12 sm:mr-0" style={{ animationDelay: '0.55s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
