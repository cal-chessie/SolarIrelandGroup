'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useCookieBannerVisible } from '@/lib/bottomLayer';

/**
 * MobileStickyCTA - thumb-reach lead capture on small screens.
 *
 * Appears once the visitor has scrolled past the first screen, and hides again
 * while the thing it points at is already on screen, so it never sits on top of
 * its own destination. Desktop never sees it.
 *
 * Configurable per page, because the right next step is not the same
 * everywhere: a visitor on /financing has already priced the thing and should
 * be offered a survey, while a visitor on a blog article has not seen a number
 * yet and should be offered the analyser. Pages where the visitor is already
 * mid-intake (book-survey, contact) pass nothing and get no bar at all.
 */
export default function MobileStickyCTA({
  label = 'See My Savings - Free',
  /** Element id to scroll to. Takes precedence over href when present on the page. */
  scrollTo = 'calculator',
  /** Where to send them when there is nothing to scroll to on this page. */
  href,
}: {
  label?: string;
  scrollTo?: string | null;
  href?: string;
} = {}) {
  const [pastHero, setPastHero] = useState(false);
  const [targetVisible, setTargetVisible] = useState(false);
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
    if (!scrollTo) return;
    const target = document.getElementById(scrollTo);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTargetVisible(entry.isIntersecting),
      { rootMargin: '0px 0px -20% 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [scrollTo]);

  // Stand down while the cookie sheet owns the bottom of the screen.
  const cookieBanner = useCookieBannerVisible();
  const visible = pastHero && !targetVisible && !nearFooter && !cookieBanner;
  if (!visible) return null;

  const onScreenTarget = scrollTo ? document.getElementById(scrollTo) : null;

  const inner = (
    <>
      <Zap className="w-4 h-4" />
      {label}
    </>
  );

  const className =
    'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-400 text-black font-bold text-[15px] shadow-2xl shadow-black/50 border border-amber-300/40 active:scale-[0.98] transition-transform';

  return (
    // Right clearance keeps the chat FAB's corner free (it sits at right-6, z-50).
    <div
      className="sticky-cta-enter lg:hidden fixed bottom-0 left-0 right-[6rem] z-40 pl-3 pb-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {onScreenTarget ? (
        <button onClick={() => onScreenTarget.scrollIntoView({ behavior: 'smooth' })} className={className}>
          {inner}
        </button>
      ) : (
        <a href={href || '/solar-calculator'} className={className}>
          {inner}
        </a>
      )}
    </div>
  );
}
