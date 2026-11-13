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

/** The main link grid: rises in once the footer is 50px into the viewport. */
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
      className={`${className} ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
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
 * A scroll reveal, exactly as `motion.div` with `initial` + `whileInView`
 * (viewport once) rendered it: visible in the server HTML; after mount,
 * anything already on screen stays put, anything below is hidden and plays
 * `motion-<anim>` when it scrolls in.
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
  // on screen at mount, so it stays put. 'hidden' until it scrolls in, then
  // 'play'.
  const [phase, setPhase] = useState<'ssr' | 'static' | 'hidden' | 'play'>('ssr');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inViewport(el, margin)) {
      setPhase('static');
      return;
    }
    setPhase('hidden');
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPhase((p) => (p === 'hidden' ? 'play' : p));
          io.unobserve(e.target);
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  let cls = className ?? '';
  let st = style;
  if (phase === 'play') {
    cls = `${cls} motion-${anim}`.trim();
    st = { ...style, animationDuration: `${duration}s`, animationDelay: `${delay}s` };
  } else if (phase === 'hidden') {
    cls = `${cls} motion-hidden`.trim();
    st = { ...style, opacity: 0 };
  }

  return (
    <div ref={ref} className={cls} style={st}>
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
