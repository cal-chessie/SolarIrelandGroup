'use client';

import type { ReactNode } from 'react';

/**
 * The hero's "Check my savings" button: the only part of the hero that needs
 * JavaScript (perf, 13 Nov 2026). The hero itself is a server component, so
 * its markup ships as HTML with no client code. Without JS the plain
 * #calculator anchor still lands on the analyser.
 */
export default function HeroCta({ className, children }: { className?: string; children: ReactNode }) {
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
    <a
      href="#calculator"
      onClick={(e) => {
        e.preventDefault();
        toAnalyser();
      }}
      className={className}
    >
      {children}
    </a>
  );
}
