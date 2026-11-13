'use client';

import Image from 'next/image';
import { ArrowRight, ChevronDown, MessageCircle, Sun } from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
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
 *
 * Desktop (lg and up, 11 Nov 2026, third pass). Cal on the live desktop: "the
 * header is to small for the page and the writing is centred as if you were
 * on mobile". From 1024 this is the ORIGINAL desktop composition (dbbf329):
 * copy left-aligned, the headline at its original lg:6xl / xl:7xl size, the
 * WhatsApp Us pill beside the yellow button, the provinces line under the
 * trust row, and the large bee with "Daylight over Ireland" floating upper
 * right over the image. Every change below is an lg: class or an lg media
 * rule in home.css, so the phone hero is untouched.
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
          quality={65}
          className="hero-bg hero-kenburns object-cover"
          // LCP element on every breakpoint. Next 16 `preload` emits the head
          // preload; fetchPriority lifts it above the JS chunks.
          preload
          fetchPriority="high"
        />
        <div className="hero-bg absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0a0a0a]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 sm:pb-16 lg:pt-28 lg:pb-32">
        <div className="mx-auto max-w-3xl text-center flex flex-col items-center lg:relative lg:mx-0 lg:max-w-none lg:text-left lg:items-start">
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
            className="hero-fade-up mt-4 sm:mt-6 text-base sm:text-lg xl:text-xl text-gray-200/90 max-w-xl lg:max-w-lg xl:max-w-xl leading-relaxed"
            style={{ animationDelay: '0.35s' }}
          >
            Upload your electricity bill and our AI will show you exactly what solar will save you.
          </p>

          <div
            className="hero-fade-up mt-6 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-1 sm:gap-6 lg:justify-start lg:gap-3 w-full sm:w-auto"
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
              className="h-quiet h-hero__wa-quiet justify-center"
            >
              or WhatsApp us
            </a>
            {/* Desktop only: the original secondary pill. */}
            <a
              href={buildWhatsAppUrl({ source: 'hero' })}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center justify-center whitespace-nowrap gap-2 px-8 min-h-[56px] rounded-full border border-white/[0.12] bg-black/30 text-white text-base font-medium hover:bg-white/[0.08] hover:border-white/25 transition-colors duration-200 active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
              WhatsApp Us
            </a>
          </div>

          <p className="hero-fade-up h-hero__trust" style={{ animationDelay: '0.65s' }}>
            <span>SEAI Registered Installers</span>
            <span>RECI registered</span>
            <span>Since 2019</span>
          </p>

          {/* The bee and "Daylight over Ireland" back where they were on main
              (Cal: "put the panels resting back where it was too"): stacked
              under the trust row on phones; from 1024 they float upper right
              over the image, side by side, as on the original desktop.
              Phones: the floating chat bee stays put now (hiding it on
              scroll made the page stutter), so this stack centres in the
              lane left of it (the 5.5rem the sticky CTA also leaves) and
              "Daylight over Ireland" never sits under it. */}
          <div className="mt-4 sm:mt-8 max-sm:pr-[5.5rem] flex flex-col items-center gap-4 lg:absolute lg:right-0 lg:top-4 lg:mt-0 lg:flex-row lg:gap-6">
            <div className="hero-fade-up" style={{ animationDelay: '0.4s' }}>
              <Image
                src="/bumblebee-hero.webp"
                alt="Solar Ireland's bumblebee"
                width={160}
                height={160}
                className="h-bee h-bee--bob w-20 h-20 sm:w-28 sm:h-28 lg:w-40 lg:h-40 xl:w-44 xl:h-44"
              />
            </div>
            <div>
              <DaylightTrack className="hero-fade-up shrink-0" style={{ animationDelay: '0.55s' }} />
            </div>
          </div>

          {/* Desktop only: where we install, as on the original. The site
              sells the estimate and the call, so no survey line here. */}
          <p className="hero-fade-up hidden lg:flex mt-12 flex-wrap items-center gap-5 text-xs text-gray-400" style={{ animationDelay: '0.8s' }}>
            {SOLAR_DATA.serviceAreas.map((area) => (
              <span key={area} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-green-400/60" aria-hidden="true" />
                {area}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="hero-fade-up hidden lg:block absolute bottom-6 left-1/2 -translate-x-1/2 z-20" style={{ animationDelay: '1s' }} aria-hidden="true">
        <ChevronDown className="w-5 h-5 text-white/25 scroll-bounce" />
      </div>
    </section>
  );
}
