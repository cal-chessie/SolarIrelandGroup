'use client';

import { useState, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { Upload, Home, Zap, ArrowRight, ChevronRight, Clock, Shield, Leaf, CheckCircle2, Camera, Wrench, PartyPopper } from 'lucide-react';
import BumblebeeMascot from './BumblebeeMascot';

/* ═══════════════════════════════════════════
   STEP DATA
   ═══════════════════════════════════════════ */
const steps = [
  {
    number: '01',
    title: 'Upload Your Bill',
    subtitle: 'AI-powered analysis',
    description:
      'Drop a photo of your electricity bill into our AI analyser. It reads your provider, usage, and spend in seconds — giving you a personalised savings estimate before you even talk to us.',
    icon: Upload,
    iconAlt: Camera,
    accent: 'from-amber-400 to-orange-500',
    accentBg: 'bg-amber-400/10',
    accentBorder: 'hover:border-amber-400/25',
    features: [
      'Camera snap or file upload',
      'Reads all Irish providers',
      'Instant savings estimate',
      'No sign-up required',
    ],
    stat: { value: '~30', unit: 'seconds', label: 'to get your results' },
  },
  {
    number: '02',
    title: 'Free Survey',
    subtitle: 'No obligation, ever',
    description:
      "We visit your home to assess your roof, shading, and energy usage. You'll get an honest recommendation tailored to your home — no pressure, no hard sell. Most surveys take under 45 minutes.",
    icon: Home,
    iconAlt: Shield,
    accent: 'from-emerald-400 to-teal-500',
    accentBg: 'bg-emerald-400/10',
    accentBorder: 'hover:border-emerald-400/25',
    features: [
      'Roof & shading assessment',
      'Usage pattern review',
      'Honest recommendation',
      'Zero cost, zero pressure',
    ],
    stat: { value: '~45', unit: 'minutes', label: 'for a full survey' },
  },
  {
    number: '03',
    title: 'Install & Save',
    subtitle: 'Done in a day',
    description:
      'Our RECI-registered team installs your system in a single day. We handle the SEAI grant paperwork and ESB grid connection. You start generating clean energy — and savings — from day one.',
    icon: Zap,
    iconAlt: Wrench,
    accent: 'from-sky-400 to-blue-500',
    accentBg: 'bg-sky-400/10',
    accentBorder: 'hover:border-sky-400/25',
    features: [
      'RECI-registered electricians',
      'SEAI grant handled for you',
      'ESB grid connection sorted',
      'Saving from day one',
    ],
    stat: { value: '€1,800', unit: '', label: 'SEAI grant included' },
  },
];

/* ═══════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════ */
function AnimatedStat({ value, unit, label }: { value: string; unit: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  const prefix = value.match(/^[^0-9]*/)?.[0] || '';
  const suffix = value.match(/[^0-9]*$/)?.[0] || '';
  const hasNumber = !isNaN(numericValue) && numericValue > 0;

  const count = useMotionValue(0);
  const display = useTransform(count, (v) => {
    if (hasNumber) return `${prefix}${Math.round(v)}${suffix}`;
    return value;
  });

  if (isInView && hasNumber) {
    animate(count, numericValue, { duration: 1.5, ease: 'easeOut' });
  }

  return (
    <div className="text-center mt-6 pt-5 border-t border-white/[0.06]">
      <span ref={ref} className="text-2xl sm:text-3xl font-black text-white tabular-nums">
        {hasNumber ? display : value}
      </span>
      {unit && <span className="text-lg font-semibold text-gray-400 ml-1">{unit}</span>}
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP CARD
   ═══════════════════════════════════════════ */
function StepCard({
  step,
  index,
  isActive,
  onActivate,
}: {
  step: (typeof steps)[0];
  index: number;
  isActive: boolean;
  onActivate: () => void;
}) {
  const StepIcon = step.icon;
  const StepIconAlt = step.iconAlt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="relative"
    >
      {/* Mobile: vertical connector line */}
      {index < steps.length - 1 && (
        <div className="md:hidden absolute left-6 top-[72px] w-px h-[calc(100%-48px)] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
      )}

      <div
        onClick={onActivate}
        className={`
          relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 cursor-pointer
          transition-all duration-500 ease-out overflow-hidden
          ${isActive
            ? `bg-white/[0.06] border border-white/[0.1] shadow-xl shadow-black/20`
            : `glass-card ${step.accentBorder}`
          }
          group
        `}
      >
        {/* Active glow effect */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 bg-gradient-to-br ${step.accent} opacity-[0.03] pointer-events-none`}
            />
          )}
        </AnimatePresence>

        {/* Step number badge */}
        <div className="flex items-start justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Animated icon container */}
            <div className={`relative ${step.accentBg} rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition-all duration-300 ${isActive ? 'scale-105' : ''}`}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <StepIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </motion.div>
              {/* Pulse ring on active */}
              {isActive && (
                <motion.div
                  layoutId={`pulse-${step.number}`}
                  className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.accent} opacity-20 blur-md`}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.1, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>

            <div>
              <span className="block text-[11px] font-bold text-white/20 tracking-widest uppercase">
                Step {step.number}
              </span>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight mt-0.5">
                {step.title}
              </h3>
            </div>
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: isActive ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-600 group-hover:text-gray-400 group-hover:border-white/[0.12] transition-colors mt-1"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Subtitle pill */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${step.accentBg} mb-4`}>
          {index === 0 && <Camera className="w-3 h-3 text-amber-400" />}
          {index === 1 && <Shield className="w-3 h-3 text-emerald-400" />}
          {index === 2 && <Zap className="w-3 h-3 text-sky-400" />}
          <span className="text-[11px] font-medium text-gray-400">{step.subtitle}</span>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-[15px] text-gray-400 leading-relaxed mb-5 sm:mb-6">
          {step.description}
        </p>

        {/* Expandable features */}
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              {/* Feature checklist */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-2">
                {step.features.map((feature, fi) => {
                  const featureIcon = [Camera, Clock, Shield, Leaf][fi] || CheckCircle2;
                  const FeatureIcon = featureIcon;
                  return (
                    <motion.div
                      key={fi}
                      initial={{ opacity: 0, x: fi % 2 === 0 ? -10 : 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: fi * 0.08 }}
                      className="flex items-center gap-2 py-1.5"
                    >
                      <div className={`w-5 h-5 rounded-md ${step.accentBg} flex items-center justify-center shrink-0`}>
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Animated stat */}
              <AnimatedStat value={step.stat.value} unit={step.stat.unit} label={step.stat.label} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick CTA when collapsed */}
        {!isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-xs text-gray-600 group-hover:text-gray-400 transition-colors"
          >
            <span>Tap to see details</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </motion.div>
        )}

        {/* CTA when expanded */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.3 }}
              className="mt-5 sm:mt-6"
            >
              {index === 0 && (
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all active:scale-[0.98]"
                >
                  <Camera className="w-4 h-4" />
                  Try the AI Analyser
                </a>
              )}
              {index === 1 && (
                <a
                  href="https://wa.me/353873958424?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20solar%20survey."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4" />
                  Book Free Survey
                </a>
              )}
              {index === 2 && (
                <a
                  href="https://wa.me/353873958424?text=Hi%2C%20I%27d%20like%20to%20get%20a%20quote%20for%20solar%20panels."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-400 text-black text-sm font-semibold hover:shadow-lg hover:shadow-sky-500/20 transition-all active:scale-[0.98]"
                >
                  <Wrench className="w-4 h-4" />
                  Get a Quote
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   CALENDAR ICON (simple inline SVG)
   ═══════════════════════════════════════════ */
function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" /><path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   DESKTOP TIMELINE CONNECTOR
   ═══════════════════════════════════════════ */
function TimelineConnector({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="hidden md:flex absolute top-0 left-0 right-0 h-full pointer-events-none">
      <div className="relative flex-1 flex items-center">
        <div className="w-full flex items-center justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent relative">
            <motion.div
              layoutId="timeline-progress"
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-400/40 via-emerald-400/40 to-sky-400/40"
              animate={{
                width: `${((activeIndex + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PROGRESS DOTS (mobile)
   ═══════════════════════════════════════════ */
function ProgressDots({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex md:hidden items-center justify-center gap-2 mt-8">
      {steps.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === activeIndex ? 24 : 8,
            backgroundColor: i <= activeIndex ? '#facc15' : 'rgba(255,255,255,0.1)',
          }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 relative noise-bg overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-amber-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10" ref={sectionRef}>
        {/* ─── Section header ─── */}
        <motion.div
          className="text-center mb-14 sm:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={headerInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/[0.06] border border-amber-400/[0.1] mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-[0.15em]">
              How it works
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-white max-w-2xl mx-auto leading-[1.1]">
            Three steps to
            <br />
            <span className="text-gradient">lower bills.</span>
          </h2>

          <p className="mt-5 sm:mt-6 text-gray-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            From photo to savings in three simple steps. No jargon, no pressure — just honest solar advice.
          </p>

          {/* Bumblebee on header */}
          <motion.div
            className="flex justify-center mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <BumblebeeMascot size="md" flipped />
          </motion.div>
        </motion.div>

        {/* ─── Steps grid ─── */}
        <div className="relative">
          <TimelineConnector activeIndex={activeStep ?? 0} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 relative z-10">
            {steps.map((step, i) => (
              <StepCard
                key={step.number}
                step={step}
                index={i}
                isActive={activeStep === i}
                onActivate={() => setActiveStep(activeStep === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* Mobile progress dots */}
        <ProgressDots activeIndex={activeStep ?? 0} />

        {/* ─── Bottom trust bar ─── */}
        <motion.div
          className="mt-14 sm:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="glass-card rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-between">
            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">SEAI Registered</p>
                  <p className="text-[10px] text-gray-600">Fully certified installer</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">RECI Electricians</p>
                  <p className="text-[10px] text-gray-600">Irish-certified</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">NSAI Compliant</p>
                  <p className="text-[10px] text-gray-600">I.S. EN 50559 standard</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <a
              href="#calculator"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-white hover:bg-white/[0.1] hover:border-amber-400/20 transition-all active:scale-[0.98]"
            >
              <PartyPopper className="w-4 h-4 text-amber-400" />
              Get started free
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
