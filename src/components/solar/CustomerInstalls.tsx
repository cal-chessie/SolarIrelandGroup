'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Real installs (homepage, #our-work). Restructure, 11 Nov 2026: sits just
 * above the FAQ (Cal: "put the install pictures above the faq").
 *
 * A modern edge-to-edge scroll-snap strip on phones, an aligned 4-column grid
 * on desktop with one lead photo spanning two. Every photo is one of Solar
 * Ireland's own jobs (Cal, 11 Nov 2026). Which photo belongs to which job
 * record is not known yet, so each carries only what is visible in it: no
 * county, size, savings or date. The job records are kept in
 * _TRASH/fake-photos-2026-11-11/install-job-records.ts.txt. Never guess a
 * mapping. The old auto-advancing carousel, the four-chip strip (Premium
 * Panels, 1-Day Install) and the WhatsApp "ask for more photos" link are gone;
 * the old file is in _TRASH/homepage-restructure-2026-11-11/.
 */
const installs = [
  {
    src: '/installs/solar-ireland-group-family-home-roof.webp',
    alt: 'Two-storey family home with solar panels across the whole roof, patio in front',
    caption: 'Family home, full roof array',
  },
  {
    src: '/installs/commercial-flat-roof-solar.webp',
    alt: 'Rows of solar panels on a commercial flat roof under a blue sky',
    caption: 'Commercial flat roof',
  },
  {
    src: '/installs/in-roof-solar-slate.webp',
    alt: 'Black in-roof solar panels set into a slate roof, scaffold alongside',
    caption: 'In-roof panels on a slate roof',
  },
  {
    src: '/installs/two-storey-home-black-solar-panels.webp',
    alt: 'White two-storey house with black solar panels on the roof',
    caption: 'Two-storey home, black panels',
  },
  {
    src: '/installs/red-brick-semi-solar-panels.webp',
    alt: 'Red-brick semi-detached house with black solar panels, a tree in front',
    caption: 'Red-brick semi, black panels',
  },
  {
    src: '/installs/new-build-home-solar-scaffold.webp',
    alt: 'New-build two-storey house in scaffold with solar panels fitted on the roof',
    caption: 'New build, panels on before the scaffold comes down',
  },
  {
    src: '/installs/solar-panels-slate-roof-home.webp',
    alt: 'Slate-roof home with solar panels, seen over a wall from a building site',
    caption: 'Slate roof, fitted mid-build',
  },
];

function Lightbox({ index, onClose, onStep }: { index: number; onClose: () => void; onStep: (d: number) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = installs[index];

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = overflow;
      prev?.focus();
    };
  }, [onClose, onStep]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8 motion-fade-in"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close photo"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={item.src}
        alt={item.alt}
        className="max-w-full max-h-[78vh] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="mt-4 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => onStep(-1)} aria-label="Previous photo" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="text-[13px] text-gray-300 min-w-[12rem] text-center">{item.caption}</p>
        <button type="button" onClick={() => onStep(1)} aria-label="Next photo" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function CustomerInstalls() {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + installs.length) % installs.length)), []);

  return (
    <section id="our-work" className="h-sec" aria-labelledby="work-title">
      <div className="h-wrap">
        <div className="h-head">
          <div data-reveal="">
            <span className="h-kicker">
              <span className="h-ring" aria-hidden="true" />
              Real jobs
            </span>
            <h2 id="work-title" className="h-title">
              Roofs we&apos;ve fitted.
            </h2>
          </div>
          <div data-reveal="" style={{ ['--d' as string]: 1 }}>
            <p className="h-lead">Every photo here is one of our own installs, from family semis to a commercial flat roof.</p>
          </div>
        </div>
      </div>

      <div className="h-strip-wrap">
        <ul className="h-strip" aria-label="Photos of our installs" data-reveal="">
          {installs.map((p, i) => (
            <li key={p.src} className={`h-shot ${i === 0 ? 'h-shot--lead' : ''}`} style={{ ['--d' as string]: i % 4 }}>
              <figure className="m-0 h-full">
                <button type="button" onClick={() => setOpen(i)} aria-label={`View larger: ${p.caption}`}>
                  <span className="h-shot__frame block">
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes={i === 0 ? '(min-width: 768px) 50vw, 82vw' : '(min-width: 768px) 25vw, 82vw'}
                      className="object-cover"
                    />
                  </span>
                </button>
                <figcaption>{p.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      {open !== null ? <Lightbox index={open} onClose={close} onStep={step} /> : null}
    </section>
  );
}
