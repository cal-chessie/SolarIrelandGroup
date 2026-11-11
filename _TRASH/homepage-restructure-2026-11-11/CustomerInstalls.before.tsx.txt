'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { SOLAR_DATA } from '@/lib/solar-data';
import { motion, AnimatePresence, useInView, PanInfo } from '@/lib/motion';
import {
  Zap,
  Calendar,
  ArrowLeft,
  ArrowRight,
  X,
  Sun,
  ChevronRight,
  Maximize2,
  PanelTop,
  Shield,
} from 'lucide-react';

// Seven real Solar Ireland Group jobs (Cal, 11 Nov 2026). Which photo belongs
// to which job record is not known yet, so each photo carries only what is
// visible in it: no county, size, savings or date. The job records are kept in
// _TRASH/fake-photos-2026-11-11/install-job-records.ts.txt to re-attach once
// Cal maps them. Never guess a mapping.
const installs = [
  {
    id: 1,
    src: '/installs/solar-ireland-group-family-home-roof.webp',
    width: 1152,
    height: 864,
    alt: 'Two-storey family home with solar panels across the whole roof, patio in front',
    caption: 'Family home, full roof array',
  },
  {
    id: 2,
    src: '/installs/commercial-flat-roof-solar.webp',
    width: 1152,
    height: 864,
    alt: 'Rows of solar panels on a commercial flat roof under a blue sky',
    caption: 'Commercial flat roof',
  },
  {
    id: 3,
    src: '/installs/in-roof-solar-slate.webp',
    width: 928,
    height: 1104,
    alt: 'Black in-roof solar panels set into a slate roof, scaffold alongside',
    caption: 'In-roof panels on a slate roof',
  },
  {
    id: 4,
    src: '/installs/two-storey-home-black-solar-panels.webp',
    width: 1152,
    height: 864,
    alt: 'White two-storey house with black solar panels on the roof',
    caption: 'Two-storey home, black panels',
  },
  {
    id: 5,
    src: '/installs/red-brick-semi-solar-panels.webp',
    width: 976,
    height: 1056,
    alt: 'Red-brick semi-detached house with black solar panels, a tree in front',
    caption: 'Red-brick semi, black panels',
  },
  {
    id: 6,
    src: '/installs/new-build-home-solar-scaffold.webp',
    width: 1152,
    height: 864,
    alt: 'New-build two-storey house in scaffold with solar panels fitted on the roof',
    caption: 'New build, panels on before the scaffold comes down',
  },
  {
    id: 7,
    src: '/installs/solar-panels-slate-roof-home.webp',
    width: 864,
    height: 1152,
    alt: 'Slate-roof home with solar panels, seen over a wall from a building site',
    caption: 'Slate roof, fitted mid-build',
  },
];

function SwipeGallery({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const SLIDE_INTERVAL = 4500;

  // Auto-advance, but only while the photo is actually on screen. Each install's
  // spec card is a different height, so every advance moved the whole page
  // below it by tens of pixels; on a phone that kept shoving the bill analyser
  // and a freshly opened estimate up under the navbar while the visitor was
  // reading further down. Nobody sees a slide change off screen anyway.
  const [photoOnScreen, setPhotoOnScreen] = useState(false);
  useEffect(() => {
    const el = constraintsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setPhotoOnScreen(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!photoOnScreen) return;
    const timer = setTimeout(() => {
      onSelect((activeIndex + 1) % installs.length);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(timer);
  }, [activeIndex, onSelect, photoOnScreen]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 60;
    if (info.offset.x < -threshold) {
      onSelect((activeIndex + 1) % installs.length);
    } else if (info.offset.x > threshold) {
      onSelect((activeIndex - 1 + installs.length) % installs.length);
    }
  };

  const goNext = () => onSelect((activeIndex + 1) % installs.length);
  const goPrev = () => onSelect((activeIndex - 1 + installs.length) % installs.length);

  return (
    <div className="relative">
      {/* panel-glint: a slow diagonal light crosses the photo on hover, the way
          sun catches real glass. */}
      <div ref={constraintsRef} className="panel-glint overflow-hidden rounded-2xl sm:rounded-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative cursor-grab active:cursor-grabbing"
          >
            <Image
              src={installs[activeIndex].src}
              alt={installs[activeIndex].alt}
              width={installs[activeIndex].width}
              height={installs[activeIndex].height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 700px"
              className="w-full h-[280px] sm:h-[400px] lg:h-[480px] object-cover"
              draggable={false}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {installs.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous photo"
            className="flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/[0.08] items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all z-10"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next photo"
            className="flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/[0.08] items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all z-10"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </>
      )}

      {installs.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {installs.map((_, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              aria-label={`Go to photo ${i + 1}`}
              className="flex items-center justify-center min-h-11 px-2.5 -mx-1 group"
            >
              <span
                className={`block transition-all duration-300 rounded-full ${
                  i === activeIndex
                    ? 'w-6 h-2 bg-amber-400'
                    : 'w-2 h-2 bg-white/15 group-hover:bg-white/30'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecCard({ install, onViewGallery, onOpenLightbox }: { install: (typeof installs)[0]; onViewGallery: (i: number) => void; onOpenLightbox: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const position = installs.findIndex((inst) => inst.id === install.id) + 1;

  // The per-job specs (size, generation, roof, date, panels, inverter,
  // battery) came off here on 11 Nov 2026: the photos are real but which job
  // each one shows is not known yet. See the job records note in
  // _TRASH/fake-photos-2026-11-11/ to re-attach them once Cal maps them.
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">{install.caption}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Photo {position} of {installs.length}</p>
        </div>
        <button
          onClick={onOpenLightbox}
          aria-label="Enlarge install photo"
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all shrink-0"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {installs.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {installs.map((inst, i) => (
            <button
              key={inst.id}
              onClick={() => onViewGallery(i)}
              aria-label={`Show photo ${i + 1}: ${inst.caption}`}
              aria-pressed={inst.id === install.id}
              className={`relative aspect-square overflow-hidden rounded-xl transition-all ${
                inst.id === install.id
                  ? 'ring-2 ring-amber-400/80'
                  : 'opacity-60 hover:opacity-100 ring-1 ring-white/[0.06]'
              }`}
            >
              <Image
                src={inst.src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 sm:p-8"
        onClick={onClose}
      >
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 border border-white/[0.1] flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </motion.button>

        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-full max-h-[85vh] object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default function CustomerInstalls() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <section id="our-work" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto relative z-10">
        <motion.div
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-end justify-between flex-col sm:flex-row gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/[0.06] border border-amber-400/[0.1] mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-[0.15em]">
                  Our work
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl leading-[1.1]">
                Panels on roofs.{' '}
                <br />
                <span className="text-gradient">Money in the bank.</span>
              </h2>
              <p className="mt-4 text-gray-400 text-sm sm:text-base max-w-md leading-relaxed">
                Real roofs we've fitted. Homes and businesses across Ireland.
              </p>
            </div>

            <motion.div
              className="hidden sm:flex items-center gap-6"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{installs.length}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Recent installs</p>
              </div>
              <div className="w-px h-10 bg-white/[0.06]" />
              {/* "100% satisfaction rate" was here. Nothing measured it, and it
                  is the same invented aggregate as the 4.9 rating and the
                  "200+ installs" that came off this site on 3 Sep. Replaced
                  with a fact we can stand over. */}
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-400">{SOLAR_DATA.grant.label}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">SEAI solar grant</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-3">
            <SwipeGallery activeIndex={activeIndex} onSelect={setActiveIndex} />
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <SpecCard
                key={installs[activeIndex].id}
                install={installs[activeIndex]}
                onViewGallery={setActiveIndex}
                onOpenLightbox={() => setLightboxOpen(true)}
              />
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { icon: Shield, label: 'RECI Registered', color: 'text-green-400' },
            { icon: PanelTop, label: 'Premium Panels', color: 'text-amber-400' },
            { icon: Sun, label: '25-Year Warranty', color: 'text-sky-400' },
            { icon: Calendar, label: '1-Day Install', color: 'text-violet-400' },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <ItemIcon className={`w-4 h-4 ${item.color} shrink-0`} />
                <span className="text-xs font-medium text-gray-400">{item.label}</span>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-10 sm:mt-14 text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-gray-400 mb-4">Your home could be next - find out what you'd save with solar.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.a
              href="#calculator"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-400/15"
            >
              <Zap className="w-4 h-4" />
              Get Your Free Estimate
            </motion.a>
            <motion.a
              href={buildWhatsAppUrl({ source: 'customer-installs', customMessage: "Hi, I'd like to see examples of your solar installations." })}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Ask for more photos
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </motion.a>
          </div>
        </motion.div>
      </div>

      {lightboxOpen && (
        <Lightbox
          src={installs[activeIndex].src}
          alt={installs[activeIndex].alt}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
}
