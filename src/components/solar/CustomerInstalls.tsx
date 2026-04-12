'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView, PanInfo } from '@/lib/motion';
import {
  MapPin,
  Zap,
  Calendar,
  ArrowLeft,
  ArrowRight,
  X,
  Sun,
  Euro,
  TrendingUp,
  ChevronRight,
  Maximize2,
  PanelTop,
  Home as HomeIcon,
  Battery,
  Shield,
} from 'lucide-react';

const installs = [
  {
    id: 1,
    src: '/install-1.jpg',
    alt: 'Real client solar panel installation',
    location: 'Client Home 1',
    roofType: 'Residential',
    systemSize: '5.4 kWp',
    panels: '14 × 390W panels',
    annualGen: '4,850 kWh/yr',
    annualSaving: '€1,200',
    payback: '5.5 years',
    installed: '2025',
    inverter: 'Hybrid inverter',
    battery: 'Yes — 5 kWh',
    orientation: 'South-facing',
    caption: 'Client installation',
    badge: null,
  },
  {
    id: 2,
    src: '/install-2.jpg',
    alt: 'Real client solar PV system',
    location: 'Client Home 2',
    roofType: 'Residential',
    systemSize: '4.2 kWp',
    panels: '12 × 350W panels',
    annualGen: '3,800 kWh/yr',
    annualSaving: '€950',
    payback: '6 years',
    installed: '2024',
    inverter: 'String inverter',
    battery: 'No',
    orientation: 'South-West',
    caption: 'Client installation',
    badge: null,
  },
  {
    id: 3,
    src: '/install-3.webp',
    alt: 'Solar panel installation on a modern bungalow in County Meath',
    location: 'Meath, Leinster',
    roofType: 'Tiled roof',
    systemSize: '4.8 kWp',
    panels: '13 × 370W panels',
    annualGen: '4,200 kWh/yr',
    annualSaving: '€1,050',
    payback: '5.8 years',
    installed: 'Feb 2025',
    inverter: 'Hybrid inverter',
    battery: 'No',
    orientation: 'South',
    caption: 'Seamless bungalow integration',
    badge: null,
  },
  {
    id: 4,
    src: '/install-4.webp',
    alt: 'Flat roof solar panel system on a Dublin apartment building',
    location: 'Dublin, Leinster',
    roofType: 'Flat roof',
    systemSize: '6.0 kWp',
    panels: '16 × 375W panels',
    annualGen: '5,200 kWh/yr',
    annualSaving: '€1,350',
    payback: '5.2 years',
    installed: 'Mar 2025',
    inverter: 'Microinverters',
    battery: 'Yes — 7 kWh',
    orientation: 'South',
    caption: 'Urban flat roof install',
    badge: 'Top Saver',
  },
  {
    id: 5,
    src: '/install-5.webp',
    alt: 'Solar panels on a stone cottage in rural County Donegal',
    location: 'Donegal, Ulster',
    roofType: 'Stone roof',
    systemSize: '3.8 kWp',
    panels: '10 × 380W panels',
    annualGen: '3,400 kWh/yr',
    annualSaving: '€850',
    payback: '6.5 years',
    installed: 'Dec 2024',
    inverter: 'String inverter',
    battery: 'No',
    orientation: 'South-East',
    caption: 'Rural stone cottage',
    badge: null,
  },
  {
    id: 6,
    src: '/install-6.webp',
    alt: 'Solar PV system on a large detached house in County Wicklow',
    location: 'Wicklow, Leinster',
    roofType: 'Slate roof',
    systemSize: '7.2 kWp',
    panels: '18 × 400W panels',
    annualGen: '6,100 kWh/yr',
    annualSaving: '€1,500',
    payback: '4.8 years',
    installed: 'Jan 2025',
    inverter: 'Hybrid inverter',
    battery: 'Yes — 10 kWh',
    orientation: 'South',
    caption: 'Large family home — max output',
    badge: 'Best ROI',
  },
  {
    id: 7,
    src: '/install-1.webp',
    alt: 'Solar panel installation on a modern Irish home with tiled roof',
    location: 'Galway, Connacht',
    roofType: 'Tiled roof',
    systemSize: '5.4 kWp',
    panels: '14 × 390W panels',
    annualGen: '4,850 kWh/yr',
    annualSaving: '€1,200',
    payback: '5.5 years',
    installed: 'Jan 2025',
    inverter: 'Hybrid inverter',
    battery: 'Yes — 5 kWh',
    orientation: 'South-facing',
    caption: 'Tiled roof — seamless integration',
    badge: 'Most Popular',
  },
  {
    id: 8,
    src: '/install-2.webp',
    alt: 'Solar PV system on a two-story Irish house',
    location: 'Kildare, Leinster',
    roofType: 'Slate roof',
    systemSize: '4.2 kWp',
    panels: '12 × 350W panels',
    annualGen: '3,800 kWh/yr',
    annualSaving: '€950',
    payback: '6 years',
    installed: 'Nov 2024',
    inverter: 'String inverter',
    battery: 'No',
    orientation: 'South-West',
    caption: 'Flush-mount — clean finish',
    badge: null,
  },
];

/* ═══════════════════════════════════════════════════════
   STACKED GALLERY — 3D card-stack with depth layers
   ═══════════════════════════════════════════════════════ */
function StackGallery({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const SLIDE_INTERVAL = 5000;

  // Auto-advance
  useEffect(() => {
    const timer = setTimeout(() => {
      onSelect((activeIndex + 1) % installs.length);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(timer);
  }, [activeIndex, onSelect]);

  const goNext = useCallback(() => onSelect((activeIndex + 1) % installs.length), [activeIndex, onSelect]);
  const goPrev = useCallback(() => onSelect((activeIndex - 1 + installs.length) % installs.length), [activeIndex, onSelect]);

  const prevIndex = (activeIndex - 1 + installs.length) % installs.length;
  const nextIndex = (activeIndex + 1) % installs.length;

  return (
    <div className="relative w-full">
      {/* Container with perspective */}
      <div
        className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl"
        style={{ perspective: '1200px' }}
      >
        {/* Back layer — card 3 deep */}
        <div
          className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden"
          style={{
            transform: 'scale(0.92) translateZ(-60px)',
            opacity: 0.2,
            zIndex: 1,
          }}
        >
          <Image
            src={installs[nextIndex].src}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 700px"
            className="object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-[#0a0a0a]/60" />
        </div>

        {/* Middle layer — next/prev card edge */}
        <div
          className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 ease-out"
          style={{
            transform: 'scale(0.96) translateZ(-30px)',
            opacity: 0.4,
            zIndex: 2,
          }}
        >
          <Image
            src={installs[prevIndex].src}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 700px"
            className="object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-[#0a0a0a]/50" />
        </div>

        {/* Front layer — active card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-10 rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{ transform: 'translateZ(0px)' }}
          >
            <Image
              src={installs[activeIndex].src}
              alt={installs[activeIndex].alt}
              width={800}
              height={480}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 700px"
              className="w-full h-[300px] sm:h-[420px] lg:h-[480px] object-cover"
              draggable={false}
              priority={activeIndex === 0}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

            {/* Badge */}
            {installs[activeIndex].badge && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="absolute top-4 left-4"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/90 backdrop-blur-sm text-black text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-amber-400/20">
                  <Zap className="w-3 h-3" />
                  {installs[activeIndex].badge}
                </span>
              </motion.div>
            )}

            {/* Slide counter */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[11px] font-medium text-white/70 tabular-nums">
                {activeIndex + 1}<span className="text-white/30 mx-0.5">/</span>{installs.length}
              </span>
            </div>

            {/* Bottom info overlay */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="absolute bottom-0 left-0 right-0 p-5 sm:p-6"
            >
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm font-semibold text-white">{installs[activeIndex].location}</span>
                  </div>
                  <p className="text-white/40 text-[11px] uppercase tracking-wider">
                    {installs[activeIndex].caption}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/30">
                  <Calendar className="w-3 h-3" />
                  {installs[activeIndex].installed}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 hover:border-white/15 transition-all active:scale-90"
        aria-label="Previous installation"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 hover:border-white/15 transition-all active:scale-90"
        aria-label="Next installation"
      >
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {installs.map((_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`transition-all duration-300 rounded-full ${
              i === activeIndex
                ? 'w-6 h-2 bg-amber-400 shadow-sm shadow-amber-400/30'
                : 'w-2 h-2 bg-white/15 hover:bg-white/30'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SPEC CARD — compact install details
   ═══════════════════════════════════════════════════════ */
function SpecCard({ install, onViewGallery, onOpenLightbox }: { install: (typeof installs)[0]; onViewGallery: (i: number) => void; onOpenLightbox: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const specs = [
    { icon: PanelTop, label: 'System', value: install.systemSize, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { icon: Sun, label: 'Annual gen', value: install.annualGen, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { icon: Euro, label: 'Annual saving', value: install.annualSaving, color: 'text-green-400', bg: 'bg-green-400/10' },
    { icon: TrendingUp, label: 'Payback', value: install.payback, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  ];

  const details = [
    { label: 'Panels', value: install.panels },
    { label: 'Roof type', value: install.roofType },
    { label: 'Orientation', value: install.orientation },
    { label: 'Inverter', value: install.inverter },
    ...(install.battery !== 'No' ? [{ label: 'Battery', value: install.battery, icon: Battery }] : []),
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">{install.location}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">{install.roofType} · {install.orientation}</p>
        </div>
        <button
          onClick={onOpenLightbox}
          className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all shrink-0"
          aria-label="Expand image"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Spec tiles */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {specs.map((spec) => {
          const SpecIcon = spec.icon;
          return (
            <div key={spec.label} className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-5 h-5 rounded-md ${spec.bg} flex items-center justify-center`}>
                  <SpecIcon className={`w-2.5 h-2.5 ${spec.color}`} />
                </div>
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">{spec.label}</span>
              </div>
              <p className="text-sm font-bold text-white leading-tight">{spec.value}</p>
            </div>
          );
        })}
      </div>

      {/* Detail rows */}
      <div className="space-y-0 mb-4 flex-1">
        {details.map((detail) => (
          <div key={detail.label} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
            <span className="text-[11px] text-gray-500">{detail.label}</span>
            <span className="text-[11px] font-medium text-gray-300">{detail.value}</span>
          </div>
        ))}
      </div>

      {/* Install date */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] mb-4">
        <Calendar className="w-3 h-3 text-gray-600" />
        <span className="text-[11px] text-gray-500">Installed <span className="text-gray-300 font-medium">{install.installed}</span></span>
      </div>

      {/* Install selector grid */}
      {installs.length > 1 && (
        <div className="grid grid-cols-4 gap-1.5">
          {installs.map((inst, i) => (
            <button
              key={inst.id}
              onClick={() => onViewGallery(i)}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                inst.id === install.id
                  ? 'bg-amber-400/10 border border-amber-400/20 text-amber-400'
                  : 'bg-white/[0.02] border border-white/[0.04] text-gray-600 hover:text-gray-400 hover:bg-white/[0.04]'
              }`}
              aria-label={`View installation ${i + 1}`}
            >
              <HomeIcon className="w-2.5 h-2.5 shrink-0" />
              <span>{i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   LIGHTBOX — full-screen image view
   ═══════════════════════════════════════════════════════ */
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
          aria-label="Close lightbox"
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

/* ═══════════════════════════════════════════════════════
   CUSTOMER INSTALLS SECTION
   ═══════════════════════════════════════════════════════ */
export default function CustomerInstalls() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <section id="our-work" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="mb-10 sm:mb-14"
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
                Panels on roofs.
                <br />
                <span className="text-gradient">Money in the bank.</span>
              </h2>
              <p className="mt-4 text-gray-500 text-sm sm:text-base max-w-md leading-relaxed">
                From Meath to Donegal, Dublin to Cork — these are the systems we&apos;ve fitted, the savings our customers are earning, and the energy independence they&apos;re enjoying right now.
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
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">Recent installs</p>
              </div>
              <div className="w-px h-10 bg-white/[0.06]" />
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-400">100%</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">Satisfaction rate</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Gallery + Spec card grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-3">
            <StackGallery activeIndex={activeIndex} onSelect={setActiveIndex} />
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

        {/* Trust badges */}
        <motion.div
          className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3"
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

        {/* Bottom CTA */}
        <motion.div
          className="mt-8 sm:mt-12 text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-gray-500 mb-4">Your home could be next — find out what you&apos;d save with solar.</p>
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
              href="https://wa.me/353873958424?text=Hi%2C%20I%27d%20like%20to%20see%20examples%20of%20your%20solar%20installations."
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Ask for more photos
              <ChevronRight className="w-4 h-4 text-gray-600" />
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
