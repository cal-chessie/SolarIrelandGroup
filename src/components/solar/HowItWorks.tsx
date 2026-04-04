'use client';

import { useState, useRef, useEffect } from 'react';
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
    cta: { href: '#calculator', text: 'Try the AI Analyser', icon: Camera, gradient: 'from-amber-500 to-amber-400', shadow: 'hover:shadow-amber-500/20' },
  },
  {
    number: '02',
    title: 'Free Survey',
    subtitle: 'No obligation, ever',
    description:
      "We visit your home to assess your roof, shading, and energy usage. You'll get an honest recommendation tailored to your home — no pressure, no hard sell. Most surveys take under 45 minutes.",
    icon: Home,
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
    cta: { href: 'https://wa.me/353873958424?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20solar%20survey.', text: 'Book Free Survey', icon: CalendarIcon, gradient: 'from-emerald-500 to-teal-400', shadow: 'hover:shadow-emerald-500/20' },
  },
  {
    number: '03',
    title: 'Install & Save',
    subtitle: 'Done in a day',
    description:
      'Our RECI-registered team installs your system in a single day. We handle the SEAI grant paperwork and ESB grid connection. You start generating clean energy — and savings — from day one.',
    icon: Zap,
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
    cta: { href: 'https://wa.me/353873958424?text=Hi%2C%20I%27d%20like%20to%20get%20a%20quote%20for%20solar%20panels.', text: 'Get a Quote', icon: Wrench, gradient: 'from-sky-500 to-blue-400', shadow: 'hover:shadow-sky-500/20' },
  },
];

/* ═══════════════════════════════════════════
   CALENDAR ICON
   ═══════════════════════════════════════════ */
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" /><path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   STEP CARD — CSS expand/collapse, no Framer Motion
   ═══════════════════════════════════════════ */
function StepCard({
  step,
  index,
  isActive,
  onToggle,
}: {
  step: (typeof steps)[0];
  index: number;
  isActive: boolean;
  onToggle: () => void;
}) {
  const StepIcon = step.icon;
  const CtaIcon = step.cta.icon;
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      {/* Mobile: vertical connector line */}
      {index < steps.length - 1 && (
        <div className="md:hidden absolute left-6 top-[72px] w-px h-[calc(100%-48px)] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
      )}

      <div
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        className={`
          relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 cursor-pointer
          transition-all duration-300 ease-out overflow-hidden
          ${isActive
            ? 'bg-white/[0.06] border border-white/[0.1] shadow-xl shadow-black/20'
            : `bg-white/[0.02] border border-white/[0.06] ${step.accentBorder}`
          }
          group
        `}
      >
        {/* Active glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${step.accent} transition-opacity duration-300 pointer-events-none ${isActive ? 'opacity-[0.03]' : 'opacity-0'}`} />

        {/* Step number badge + chevron */}
        <div className="flex items-start justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`${step.accentBg} rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
              <StepIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
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

          {/* Expand chevron */}
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-600 group-hover:text-gray-400 group-hover:border-white/[0.12] transition-all duration-200 mt-1 ${isActive ? 'rotate-90 text-gray-400 border-white/[0.12]' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Subtitle pill */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${step.accentBg} mb-4`}>
          {index === 0 && <Camera className="w-3 h-3 text-amber-400" />}
          {index === 1 && <Shield className="w-3 h-3 text-emerald-400" />}
          {index === 2 && <Zap className="w-3 h-3 text-sky-400" />}
          <span className="text-[11px] font-medium text-gray-400">{step.subtitle}</span>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-[15px] text-gray-400 leading-relaxed mb-4">
          {step.description}
        </p>

        {/* ─── Expandable section — CSS max-height transition ─── */}
        <div
          ref={contentRef}
          className="grid transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
          style={{
            gridTemplateRows: isActive ? '1fr' : '0fr',
            opacity: isActive ? 1 : 0,
            transitionDelay: isActive ? '0s' : '0s',
          }}
        >
          <div className="min-h-0">
            {/* Feature checklist */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-2 pt-2">
              {step.features.map((feature, fi) => (
                <div
                  key={fi}
                  className="flex items-center gap-2 py-1.5"
                  style={{
                    transitionDelay: isActive ? `${fi * 60}ms` : '0ms',
                  }}
                >
                  <div className={`w-5 h-5 rounded-md ${step.accentBg} flex items-center justify-center shrink-0`}>
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Stat */}
            <div className="text-center mt-4 pt-5 border-t border-white/[0.06]">
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">{step.stat.value}</span>
              {step.stat.unit && <span className="text-lg font-semibold text-gray-400 ml-1">{step.stat.unit}</span>}
              <p className="text-xs text-gray-600 mt-1">{step.stat.label}</p>
            </div>

            {/* CTA button */}
            <a
              href={step.cta.href}
              target={step.cta.href.startsWith('http') ? '_blank' : undefined}
              rel={step.cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              onClick={(e) => e.stopPropagation()}
              className={`mt-5 sm:mt-6 inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r ${step.cta.gradient} text-black text-sm font-semibold ${step.cta.shadow} hover:shadow-lg transition-all active:scale-[0.98]`}
            >
              <CtaIcon className="w-4 h-4" />
              {step.cta.text}
            </a>
          </div>
        </div>

        {/* "Tap to see details" — only when collapsed */}
        <div className={`flex items-center gap-1.5 text-xs text-gray-600 group-hover:text-gray-400 transition-colors ${isActive ? 'hidden' : ''}`}>
          <span>Tap to see details</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DESKTOP TIMELINE CONNECTOR
   ═══════════════════════════════════════════ */
function TimelineConnector({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="hidden md:flex absolute top-0 left-0 right-0 h-full pointer-events-none">
      <div className="relative flex-1 flex items-center justify-center">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent relative">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-400/40 via-emerald-400/40 to-sky-400/40 transition-all duration-500 ease-out"
            style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
          />
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
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ease-out ${
            i === activeIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/10'
          }`}
          style={{
            backgroundColor: i <= activeIndex ? '#facc15' : 'rgba(255,255,255,0.1)',
            width: i === activeIndex ? 24 : 8,
          }}
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

  return (
    <section id="how-it-works" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* ─── Section header ─── */}
        <div className="text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/[0.06] border border-amber-400/[0.1] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-[0.15em]">
              How it works
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-white max-w-2xl mx-auto leading-[1.1]">
            Three steps to
            <br />
            <span className="text-gradient">lower bills.</span>
          </h2>

          <p className="mt-5 sm:mt-6 text-gray-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            From photo to savings in three simple steps. No jargon, no pressure — just honest solar advice.
          </p>

          {/* Bumblebee on header */}
          <div className="flex justify-center mt-6">
            <BumblebeeMascot size="md" flipped />
          </div>
        </div>

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
                onToggle={() => setActiveStep(activeStep === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* Mobile progress dots */}
        <ProgressDots activeIndex={activeStep ?? 0} />

        {/* ─── Bottom trust bar ─── */}
        <div className="mt-14 sm:mt-20">
          <div className="rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-between bg-white/[0.02] border border-white/[0.06]">
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
        </div>
      </div>
    </section>
  );
}
