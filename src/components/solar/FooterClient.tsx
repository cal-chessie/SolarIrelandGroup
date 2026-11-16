'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp } from 'lucide-react';
import { useInView } from '@/lib/useInView';

/**
 * The footer's interactive leaves (perf, 13 Nov 2026). Footer.tsx is a shared
 * component with no hooks, so a server page (home, privacy, terms, ...)
 * renders its markup as HTML with no client JS; only these small pieces
 * hydrate. Each one reproduces what the motion shim (src/lib/motion.tsx) did
 * for the same element, so nothing looks or behaves differently.
 */

/** The main link grid: settles up once the footer is 50px into the viewport.
 *  Visible at rest (16 Nov 2026): it used to sit at opacity 0, in the server
 *  HTML too, until the observer fired, so a fast scroll (or no JS) met a
 *  blank footer. Now only a transform moves; the links are always there. */
export function FooterGrid({ className, children }: { className: string; children: ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  // Watch the <footer> itself, as the original did, not the grid inside it.
  // Declared before useInView so it runs first.
  useEffect(() => {
    footerRef.current = gridRef.current?.closest('footer') ?? gridRef.current;
  }, []);
  const isInView = useInView(footerRef, { once: true, margin: '-50px' });

  return (
    <div
      ref={gridRef}
      className={`${className} ${isInView ? 'translate-y-0' : 'translate-y-6'}`}
    >
      {children}
    </div>
  );
}

function inViewport(el: HTMLElement, margin: string): boolean {
  const r = el.getBoundingClientRect();
  const m = Math.abs(parseInt(margin) || 0);
  return r.top < window.innerHeight - m && r.bottom > m && r.left < window.innerWidth - m && r.right > m;
}

/**
 * A scroll reveal for the footer rows. Visible in the server HTML and at
 * every moment after it (16 Nov 2026: it used to go to opacity 0 after mount
 * until the observer fired, which left blank rows on a fast scroll). After
 * mount, anything already on screen stays put; a `fade-up` row below the
 * fold sits 12px low and settles when it scrolls in (transform only). A
 * `fade-in` row has nothing to move, so it is simply there.
 */
export function Reveal({
  anim,
  duration = 0.6,
  delay = 0,
  margin = '0px',
  className,
  style,
  children,
}: {
  anim: 'fade-up' | 'fade-in';
  duration?: number;
  delay?: number;
  margin?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // 'ssr': server HTML and first client render, untouched. 'static': it was
  // on screen at mount (or there is nothing to move), so it stays put.
  // 'low' until it scrolls in, then 'play'.
  const [phase, setPhase] = useState<'ssr' | 'static' | 'low' | 'play'>('ssr');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      anim !== 'fade-up' ||
      inViewport(el, margin) ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setPhase('static');
      return;
    }
    setPhase('low');
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPhase((p) => (p === 'low' ? 'play' : p));
          io.unobserve(e.target);
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [anim, margin]);

  let st = style;
  if (phase === 'low') {
    st = { ...style, transform: 'translateY(12px)' };
  } else if (phase === 'play') {
    st = {
      ...style,
      transform: 'none',
      transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    };
  }

  return (
    <div ref={ref} className={className} style={st}>
      {children}
    </div>
  );
}

export function BackToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      data-motion-hover-scale="1.1"
      data-motion-hover-y="-2"
      data-motion-tap-scale="0.9"
      className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all"
      aria-label="Back to top"
    >
      <ChevronUp className="w-4 h-4" />
    </button>
  );
}

/** Reopens the cookie banner (DeferredConsent replays it if the banner is not up yet). */
export function CookieSettingsButton({ className }: { className: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('cookie-consent-open-settings'))}
      className={className}
    >
      Cookie settings
    </button>
  );
}

/** "Check my savings" lands on the Bill Analyser: in place on the homepage, the calculator page anywhere else. */
export function SavingsLink({ className, children }: { className: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <a href={pathname === '/' ? '#calculator' : '/solar-calculator'} className={className}>
      {children}
    </a>
  );
}
