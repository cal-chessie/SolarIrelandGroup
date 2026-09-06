'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

/**
 * MobileStickyCTA — thumb-reach lead capture on small screens.
 *
 * Appears once the visitor scrolls past the hero (its own CTAs are gone by
 * then) and hides again while the analyser is on screen, so it never sits on
 * top of the thing it links to. Desktop never sees it.
 */
export default function MobileStickyCTA() {
  const [pastHero, setPastHero] = useState(false);
  const [analyserVisible, setAnalyserVisible] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.9);
      // Duck out near the page bottom so the footer's Privacy/Terms row and
      // back-to-top button stay tappable on mobile.
      const doc = document.documentElement;
      setNearFooter(window.innerHeight + window.scrollY >= doc.scrollHeight - 360);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const analyser = document.getElementById('calculator');
    if (!analyser) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAnalyserVisible(entry.isIntersecting),
      { rootMargin: '0px 0px -20% 0px' }
    );
    observer.observe(analyser);
    return () => observer.disconnect();
  }, []);

  const visible = pastHero && !analyserVisible && !nearFooter;
  if (!visible) return null;

  return (
    // Right clearance keeps the chat FAB's corner free (it sits at right-6, z-50).
    <div
      className="sticky-cta-enter lg:hidden fixed bottom-0 left-0 right-[5.5rem] z-40 pl-3 pb-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <button
        onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-400 text-black font-bold text-sm shadow-2xl shadow-black/50 border border-amber-300/40 active:scale-[0.98] transition-transform"
      >
        <Zap className="w-4 h-4" />
        See My Savings — Free
      </button>
    </div>
  );
}
