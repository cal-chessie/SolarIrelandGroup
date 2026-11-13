'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import dynamic from 'next/dynamic';
import Navbar from '@/components/solar/Navbar';
import ScrollProgress from '@/components/solar/ScrollProgress';
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
 * Perf (12 Nov 2026): this is now only the client shell (hash recovery,
 * scroll reveals, nav, footer, floating widgets). The sections themselves are
 * passed in as `children` from src/app/page.tsx, a server component, so the
 * static ones (HomeTrust, HowItWorks, WhySolar, HomeClose, Popular guides)
 * ship no JS; the interactive ones stay client islands.
 *
 * Perf (13 Nov 2026): the footer is passed in the same way (`footer`), so
 * it renders on the server too and only its small leaves hydrate.
 */
export default function HomeClient({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // The floating widgets (chat bubble, sticky CTA, exit intent) mount once
  // the browser is idle, so their JS stays off the first-paint path.
  const [widgets, setWidgets] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setWidgets(true), { timeout: 2000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setWidgets(true), 600);
    return () => clearTimeout(t);
  }, []);

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
      <main>{children}</main>
      {footer}
      {widgets && <WhatsAppChat />}
      {widgets && (
        <PageIntake sticky={{ label: 'Check my savings', scrollTo: 'calculator' }} exit={true} />
      )}
    </div>
  );
}
