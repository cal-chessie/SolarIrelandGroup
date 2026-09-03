'use client';

import { useEffect, useRef } from 'react';

/**
 * Thin amber progress bar fixed to the top of the viewport.
 * Shows scroll depth - uses pure CSS width transition, no Framer Motion.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set initial
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 h-[2px] z-[100] transition-[width] duration-150 ease-out"
      style={{
        width: '0%',
        background: 'linear-gradient(90deg, #facc15 0%, #f59e0b 50%, #fbbf24 100%)',
        boxShadow: '0 0 12px rgba(250, 204, 21, 0.4), 0 0 4px rgba(250, 204, 21, 0.3)',
      }}
    />
  );
}
