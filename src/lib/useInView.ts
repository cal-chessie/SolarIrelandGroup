'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * True once `ref` is in the viewport (framer-motion's useInView signature).
 * Split out of src/lib/motion.tsx (which re-exports it) so the footer can use
 * it without shipping the motion shim on every page (perf, 13 Nov 2026).
 */
export function useInView(
  ref: RefObject<HTMLElement | null>,
  options?: { once?: boolean; margin?: string; amount?: number },
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const marginVal = Math.abs(parseInt(options?.margin || '0px') || 0);
    const inViewNow =
      el.getBoundingClientRect().top < window.innerHeight - marginVal &&
      el.getBoundingClientRect().bottom > marginVal &&
      el.getBoundingClientRect().left < window.innerWidth - marginVal &&
      el.getBoundingClientRect().right > marginVal;
    if (inViewNow) {
      setIsInView(true);
      return; // No need for observer if already in view (once=true default)
    }

    const once = options?.once !== false;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        rootMargin: options?.margin || '0px',
        threshold: options?.amount || 0,
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options?.once, options?.margin, options?.amount]);

  return isInView;
}
