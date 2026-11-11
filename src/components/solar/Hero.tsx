'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import DaylightTrack from './DaylightTrack';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/**
 * The homepage hero (restructure, 11 Nov 2026, DECISIONS.md R1).
 *
 * One promise and one action. The analyser sits straight underneath and
 * already says "See what solar saves you, from your bill.", so the hero does
 * not repeat it: it keeps Cal's headline and gives one value line. The grant
 * breakdown and "we handle the survey and the install" are gone (Cal; the
 * call-only funnel). On phones the hero is 88svh so the top of the analyser
 * peeks above the fold; on desktop the top 64px of the analyser shows.
 *
 * Fixed: the hero image (hero-solar) and its fade into the canvas.
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
    <section className="hero-section h-hero" aria-labelledby="hero-title">
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
        <div className="hero-bg absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-[#0a0a0a]" />
      </div>

      <div className="h-hero__inner">
        <div className="h-wrap">
          <div className="h-hero__grid">
            <div className="text-center sm:text-left">
              <span className="hero-fade-up h-kicker" style={{ animationDelay: '0.1s' }}>
                <span className="h-ring" aria-hidden="true" />
                Solar panels for Irish homes and businesses
              </span>

              <h1 id="hero-title">
                <span className="hero-lcp block">Your Energy.</span>
                <span className="hero-lcp block"><span className="text-gradient hero-sheen">Your Asset.</span></span>
              </h1>

              <p className="hero-fade-up h-hero__sub mx-auto sm:mx-0" style={{ animationDelay: '0.35s' }}>
                Upload your bill and see your yearly saving, the right system and your payback in under a minute.
              </p>

              <div className="hero-fade-up h-hero__acts" style={{ animationDelay: '0.5s' }}>
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
                  className="h-quiet"
                >
                  or WhatsApp us
                </a>
              </div>

              <p className="hero-fade-up h-hero__trust" style={{ animationDelay: '0.65s' }}>
                <span>SEAI Registered Installers</span>
                <span>RECI registered</span>
                <span>Since 2019</span>
              </p>
            </div>

            {/* Where the sun is over Ireland right now (desktop). On phones it
                sits in the trust section, so the hero button stays in the
                thumb zone. */}
            <div className="h-hero__side">
              <DaylightTrack className="hero-fade-up" style={{ animationDelay: '0.8s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
