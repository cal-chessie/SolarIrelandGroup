'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useInView, animate } from 'framer-motion';
import { MessageCircle, ArrowRight, Shield, Zap, Euro, Sun, Clock, CheckCircle2, Star, ChevronDown } from 'lucide-react';
import BumblebeeMascot from './BumblebeeMascot';

/* ═══════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════ */
function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (decimals > 0) return v.toFixed(decimals);
    return Math.round(v).toString();
  });

  if (isInView) {
    animate(count, value, { duration: 2, ease: 'easeOut' });
  }

  return (
    <span ref={ref}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════
   SCROLL INDICATOR
   ═══════════════════════════════════════════ */
function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Scroll</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-4 h-4 text-white/30" />
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   LIVE SAVINGS TICKER
   ═══════════════════════════════════════════ */
function SavingsTicker() {
  const [currentSaving, setCurrentSaving] = useState(0);

  useEffect(() => {
    // Simulate a running total of what Irish homes with solar are saving right now
    const base = 847293; // starting euro amount
    const interval = setInterval(() => {
      setCurrentSaving((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);
    setCurrentSaving(base);
    return () => clearInterval(interval);
  }, []);

  const formatted = (currentSaving / 1000).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.8 }}
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.08]"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Euro className="w-3.5 h-3.5 text-green-400" />
      </motion.div>
      <div className="flex items-baseline gap-1">
        <span className="text-xs text-gray-400">Irish homes saving right now:</span>
        <span className="text-xs font-bold text-green-400 tabular-nums">€{formatted}k</span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   STAT PILL
   ═══════════════════════════════════════════ */
function StatPill({ icon: Icon, label, value, prefix, suffix, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/30 backdrop-blur-md border border-white/[0.08] hover:border-white/[0.15] transition-colors cursor-default"
    >
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-bold text-white leading-none">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        </p>
        <p className="text-[10px] text-gray-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   TRUST BAR
   ═══════════════════════════════════════════ */
function TrustBar() {
  const items = [
    { icon: Shield, label: 'RECI Registered', color: 'text-green-400' },
    { icon: CheckCircle2, label: 'SEAI Certified', color: 'text-amber-400' },
    { icon: Star, label: '5-Year Warranty', color: 'text-sky-400' },
  ];

  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.8 }}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 + i * 0.1, duration: 0.4 }}
          className="flex items-center gap-1.5 text-[11px] text-gray-400"
        >
          <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
          <span>{item.label}</span>
          {i < items.length - 1 && <span className="text-white/10 ml-1">·</span>}
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN HERO
   ═══════════════════════════════════════════ */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax on background
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Content fade out on scroll
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  // Gradient intensifies on scroll (smooth transition to page bg)
  const gradientOpacity = useTransform(scrollYProgress, [0.2, 0.8], [0, 0.6]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* ─── Background with parallax ─── */}
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <img
          src="/hero-solar.jpg"
          alt="Modern black frameless solar panels on an Irish home"
          className="w-full h-[120%] object-cover"
        />
        {/* Base gradient — gentle dark at top, mostly clear in middle, fade to page bg at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 via-50% to-[#0a0a0a]" />
        {/* Scroll-activated darkening layer */}
        <motion.div
          className="absolute inset-0 bg-[#0a0a0a]"
          style={{ opacity: gradientOpacity }}
        />
      </motion.div>

      {/* ─── Ambient light effects ─── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-400/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* ─── Main content ─── */}
      <motion.div
        className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-32 sm:pb-36"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-6">
          {/* ─── Text column ─── */}
          <div className="max-w-2xl flex-1 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-black/30 backdrop-blur-sm text-amber-400 border border-white/[0.15]">
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sun className="w-3.5 h-3.5" />
                </motion.span>
                SEAI Registered Installer
              </span>
            </motion.div>

            {/* Headline — staggered line reveal */}
            <div className="mt-6 sm:mt-8">
              <motion.h1
                className="text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[0.95]"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <span className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">Your Energy.</span>
              </motion.h1>
              <motion.h1
                className="text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[0.95]"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <span className="text-gradient drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">Your Asset.</span>
              </motion.h1>
            </div>

            {/* Subtitle */}
            <motion.p
              className="mt-6 text-base sm:text-lg text-gray-200/90 max-w-lg leading-relaxed mx-auto lg:mx-0 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            >
              Upload your electricity bill and our AI will show you exactly what
              solar will save you. We handle everything — survey, install,
              and your <strong className="text-white font-semibold">€1,800 SEAI grant</strong>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center lg:items-start gap-3"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: 'easeOut' }}
            >
              <motion.a
                href="#calculator"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm tracking-wide shadow-xl shadow-amber-400/20 hover:shadow-amber-400/30 transition-shadow w-full sm:w-auto justify-center"
              >
                <Zap className="w-4 h-4" />
                Analyse My Bill — Free
                <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="https://wa.me/353873958424?text=Hi%2C%20I%20have%20a%20question%20about%20solar%20panels."
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm text-white text-sm tracking-wide hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                WhatsApp Us
              </motion.a>
            </motion.div>

            {/* Trust bar */}
            <TrustBar />
          </div>

          {/* ─── Right side: Bumblebee + Stats ─── */}
          <motion.div
            className="flex-shrink-0 lg:mt-8 w-full lg:w-auto"
            initial={{ opacity: 0, scale: 0.7, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex flex-col items-center gap-6">
              {/* Bumblebee */}
              <div className="relative group cursor-pointer">
                {/* Animated glow rings */}
                <motion.div
                  className="absolute -inset-8 rounded-full bg-amber-400/[0.04] blur-2xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute -inset-14 rounded-full bg-amber-400/[0.02] blur-3xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
                <div className="relative">
                  <BumblebeeMascot size="hero" />
                </div>
              </div>

              {/* Live savings ticker */}
              <SavingsTicker />

              {/* Stat pills grid */}
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-[280px]">
                <StatPill
                  icon={Euro}
                  label="Avg. annual saving"
                  value={1100}
                  prefix="€"
                  suffix="/yr"
                  color="bg-green-400/10 text-green-400"
                />
                <StatPill
                  icon={Clock}
                  label="Payback period"
                  value={6}
                  suffix=" years"
                  color="bg-amber-400/10 text-amber-400"
                />
                <StatPill
                  icon={Zap}
                  label="25-year savings"
                  value={38}
                  prefix="€"
                  suffix="k+"
                  color="bg-sky-400/10 text-sky-400"
                />
                <StatPill
                  icon={Sun}
                  label="SEAI grant"
                  value={1800}
                  prefix="€"
                  color="bg-violet-400/10 text-violet-400"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Service areas (bottom of hero) ─── */}
        <motion.div
          className="mt-16 sm:mt-20 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-gray-300/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          {['Connacht', 'Leinster', 'Munster'].map((area) => (
            <span key={area} className="flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
              {area}
            </span>
          ))}
          <span className="text-white/15">|</span>
          <span className="flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
            Free surveys nationwide
          </span>
        </motion.div>
      </motion.div>

      {/* ─── Scroll indicator ─── */}
      <ScrollIndicator />
    </section>
  );
}
