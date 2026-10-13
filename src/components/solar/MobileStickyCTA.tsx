'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useCookieBannerVisible, useIntakeOpen } from '@/lib/bottomLayer';
import { intakeHref, openIntake, type DoorSegment } from '@/lib/intake/open';

/**
 * MobileStickyCTA - thumb-reach door on small screens (Intake OS).
 *
 * Every page's bar opens the same intake: "Get my solar estimate", Screen 1,
 * or the home-or-business question when the page does not know. It appears
 * once the visitor has scrolled past the first screen, hides while an inline
 * bill door (scrollTo) is on screen, near the footer, under the cookie sheet,
 * and while the intake itself is open. Desktop never sees it.
 *
 * `label` and `href` are kept for the existing callers but no longer change
 * the bar: one door, one label, one flow.
 */
export default function MobileStickyCTA({
  scrollTo = 'calculator',
  segment = null,
}: {
  label?: string;
  scrollTo?: string | null;
  href?: string;
  segment?: DoorSegment | null;
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

  // Stand down while the cookie sheet owns the bottom of the screen, and
  // while the intake is open (it has its own bar).
  const cookieBanner = useCookieBannerVisible();
  const intakeOpen = useIntakeOpen();
  const visible = pastHero && !targetVisible && !nearFooter && !cookieBanner && !intakeOpen;
  if (!visible) return null;

  const opts = { door: 'sticky', segment, step: 'bill' as const };
  return (
    // Right clearance keeps the chat FAB's corner free (it sits at right-6, z-50).
    <div
      className="sticky-cta-enter lg:hidden fixed bottom-0 left-0 right-[6rem] z-40 pl-3 pb-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <a
        href={intakeHref(opts)}
        onClick={(e) => {
          e.preventDefault();
          openIntake(opts);
        }}
        className="w-full min-h-[52px] flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-400 text-black font-semibold text-[16px] shadow-2xl shadow-black/50 border border-amber-300/40"
      >
        Get my solar estimate
        <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
      </a>
    </div>
  );
}
