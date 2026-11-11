'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import dynamic from 'next/dynamic';
import Navbar from '@/components/solar/Navbar';
import Hero from '@/components/solar/Hero';
import ScrollProgress from '@/components/solar/ScrollProgress';
import HomeTrust from '@/components/solar/HomeTrust';
import HowItWorks from '@/components/solar/HowItWorks';
import WhySolar from '@/components/solar/WhySolar';
import CustomerInstalls from '@/components/solar/CustomerInstalls';
import GrantInfo from '@/components/solar/GrantInfo';
import BillAnalyser from '@/components/solar/BillAnalyser';
import FAQ from '@/components/solar/FAQ';
import HomeClose from '@/components/solar/HomeClose';
import Footer from '@/components/solar/Footer';
import './home.css';

// Client-only widgets - no SSR needed, no hydration risk
const WhatsAppChat = dynamic(() => import('@/components/solar/WhatsAppChat'), { ssr: false });
const PageIntake = dynamic(() => import('@/components/solar/PageIntake'), { ssr: false });

/**
 * The homepage (restructure, 11 Nov 2026, INTAKE/design/homepage/DECISIONS.md).
 * The Bill Analyser moves from near the bottom to straight under the hero:
 * the visitor's own number goes first, the argument after it.
 *
 *   1 Hero  2 Analyser  3 Trust  4 What happens next  5 Grants  6 The value
 *   7 Real installs (Cal: "above the faq")  8 FAQ  9 Close band, guides, footer
 *
 * StatsBar is cut (its averages competed with the visitor's own figure).
 *
 * `guides` is the server-rendered "Popular guides" list (src/components/solar/PopularGuides.tsx).
 */
export default function HomeClient({ guides }: { guides?: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Hash recovery. A cold load of /#calculator could land at the top: the
  // browser jumps before the images below the fold have laid out, the anchor
  // moves, and the jump is lost. Re-apply it after mount and once more after
  // paint. (hash-recovery)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    let tries = 0;
    const jump = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: tries === 0 ? 'auto' : 'smooth' });
      tries += 1;
      if (tries < 3) setTimeout(jump, 350);
    };
    const t = setTimeout(jump, 120);
    return () => clearTimeout(t);
  }, []);

  // Scroll reveals (home.css "Reveal contract"). Content is visible at rest;
  // anything already on screen is marked in before the root class goes on, so
  // nothing above the fold flashes, and without JS nothing is hidden.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add('is-in');
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    for (const el of els) if (!el.classList.contains('is-in')) io.observe(el);
    root.classList.add('si-home--reveal');
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="si-home min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <BillAnalyser />
        <HomeTrust />
        <HowItWorks />
        <GrantInfo />
        <WhySolar />
        <CustomerInstalls />
        <FAQ variant="home" />
        <HomeClose />
        {guides}
      </main>
      <Footer variant="home" />
      <WhatsAppChat />
      <PageIntake sticky={{ label: 'Check my savings', scrollTo: 'calculator' }} exit={true} />
    </div>
  );
}
