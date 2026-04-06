'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from '@/lib/motion';
import {
  CheckCircle2,
  ExternalLink,
  Info,
  Euro,
  Home,
  FileCheck,
  Calendar,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  Shield,
  XCircle,
  PartyPopper,
  ChevronDown,
  Wrench,
  ClipboardCheck,
  BadgeEuro,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ═══════════════════════════════════════════
   ANIMATED GRANT COUNTER
   ═══════════════════════════════════════════ */
function AnimatedGrant({ show }: { show: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toString());
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (show && inView && !hasAnimated.current) {
      hasAnimated.current = true;
      animate(count, SOLAR_DATA.grant.amount, { duration: 1.8, ease: 'easeOut' });
    }
  }, [show, inView, count]);

  return (
    <span ref={ref} className="tabular-nums">
      €<motion.span>{rounded}</motion.span>
    </span>
  );
}

/* ═══════════════════════════════════════════
   ELIGIBILITY CHECKER
   ═══════════════════════════════════════════ */
type CheckResult = 'yes' | 'no' | 'unsure' | null;

interface CheckStep {
  id: string;
  question: string;
  options: { label: string; value: CheckResult }[];
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

const checkSteps: CheckStep[] = [
  {
    id: 'owner',
    question: 'Do you own your home?',
    options: [
      { label: 'Yes, I own it', value: 'yes' },
      { label: 'No, I rent', value: 'no' },
      { label: 'Not sure', value: 'unsure' },
    ],
    detail: 'The SEAI grant is only available to owner-occupiers, not renters.',
    icon: Home,
  },
  {
    id: 'year',
    question: 'When was your home built?',
    options: [
      { label: 'Before 2021', value: 'yes' },
      { label: '2021 or later', value: 'no' },
      { label: 'Not sure', value: 'unsure' },
    ],
    detail: 'Homes built before 2021 qualify. Newer builds typically have higher BER ratings or already meet energy standards.',
    icon: Calendar,
  },
  {
    id: 'ber',
    question: 'Do you know your BER rating?',
    options: [
      { label: 'C3 or lower', value: 'yes' },
      { label: 'Better than C3', value: 'no' },
      { label: "No BER / Not sure", value: 'unsure' },
    ],
    detail: 'Your home needs a BER rating of C3 or lower. Pre-1978 homes with no BER may also qualify. If you\'re unsure, we can check during the free survey.',
    icon: FileCheck,
  },
];

function EligibilityChecker() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, CheckResult>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const step = checkSteps[currentStep];
  const StepIcon = step.icon;

  const handleAnswer = (value: CheckResult) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);

    if (currentStep < checkSteps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 250);
    } else {
      setIsComplete(true);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsComplete(false);
    setIsRevealed(false);
  };

  // Determine eligibility
  const hasNo = Object.values(answers).some((v) => v === 'no');
  const hasUnsure = Object.values(answers).some((v) => v === 'unsure');
  const eligible = isComplete && !hasNo;
  const ineligible = isComplete && hasNo;

  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Am I eligible?</h3>
            <p className="text-xs text-gray-500 mt-1">Quick 3-step eligibility checker</p>
          </div>
          {isComplete && (
            <button
              onClick={reset}
              className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              Start again
            </button>
          )}
        </div>

        {/* Progress bar */}
        {!isComplete && (
          <div className="flex items-center gap-2 mb-6">
            {checkSteps.map((s, i) => (
              <div key={s.id} className="flex-1 flex items-center gap-2">
                <div
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i < currentStep
                      ? 'bg-green-400'
                      : i === currentStep
                        ? 'bg-amber-400'
                        : 'bg-white/[0.06]'
                  }`}
                />
                {i === currentStep && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] text-amber-400 font-bold shrink-0"
                  >
                    Step {i + 1}/{checkSteps.length}
                  </motion.span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Steps / Result */}
      <div className="px-6 sm:px-8 pb-6 sm:pb-8">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question */}
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
                  <StepIcon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm sm:text-[15px] font-semibold text-white">{step.question}</p>
                  <p className="text-xs text-gray-600 mt-1">{step.detail}</p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {step.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(opt.value)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12] transition-all active:scale-[0.98] text-left"
                  >
                    <span className="text-gray-600">→</span>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Already answered steps */}
              {currentStep > 0 && (
                <div className="mt-5 pt-4 border-t border-white/[0.04] space-y-2">
                  {checkSteps.slice(0, currentStep).map((prev) => {
                    const PrevIcon = prev.icon;
                    const prevAnswer = answers[prev.id];
                    return (
                      <div key={prev.id} className="flex items-center gap-2.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <span className="text-gray-500">{prev.question}</span>
                        <span className="text-gray-400 font-medium ml-auto">{prev.options.find(o => o.value === prevAnswer)?.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Result card */}
              {!isRevealed ? (
                <button
                  onClick={() => setIsRevealed(true)}
                  className="w-full flex flex-col items-center justify-center py-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.04] transition-all active:scale-[0.99]"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="w-8 h-8 text-amber-400 mb-3" />
                  </motion.div>
                  <p className="text-sm font-semibold text-white mb-1">See your result</p>
                  <p className="text-xs text-gray-600">Tap to reveal</p>
                </button>
              ) : eligible && !ineligible ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                  >
                    <PartyPopper className="w-10 h-10 text-green-400 mx-auto mb-3" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-green-400 mb-2">
                    {hasUnsure ? 'You likely qualify!' : 'You qualify!'}
                  </h4>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed mb-1">
                    Based on your answers, you appear eligible for the <AnimatedGrant show={isRevealed} /> SEAI Solar PV grant.
                  </p>
                  {hasUnsure && (
                    <p className="text-xs text-gray-600 mb-4">We&apos;ll confirm everything during your free survey.</p>
                  )}
                  <motion.a
                    href={buildWhatsAppUrl({ source: 'grant-checker', eligible: true })}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-400/15"
                  >
                    <Zap className="w-4 h-4" />
                    Book Free Survey
                    <ArrowRight className="w-4 h-4" />
                  </motion.a>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <h4 className="text-xl font-bold text-red-400 mb-2">Not eligible</h4>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed mb-1">
                    Based on your answers, you don&apos;t appear to qualify for the SEAI grant right now.
                  </p>
                  <p className="text-xs text-gray-600 mb-4">
                    However, solar panels can still save you money without the grant. Get in touch and we&apos;ll give you honest advice.
                  </p>
                  <motion.a
                    href={buildWhatsAppUrl({ source: 'grant-checker', eligible: false })}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    Still interested? Chat with us
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </motion.a>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GRANT TIMELINE
   ═══════════════════════════════════════════ */
const timelineSteps = [
  {
    icon: ClipboardCheck,
    title: 'Free Survey',
    description: 'We visit your home, assess your roof, and confirm your eligibility.',
    duration: '~45 min',
    who: 'We handle this',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/20',
  },
  {
    icon: FileCheck,
    title: 'Grant Application',
    description: 'We submit your SEAI grant application on your behalf. Approval typically takes 2-4 weeks.',
    duration: '2-4 weeks',
    who: 'We handle this',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  {
    icon: Wrench,
    title: 'Installation Day',
    description: 'Our RECI-registered team installs your system. Scaffolding, mounting, wiring — done in a day.',
    duration: '1 day',
    who: 'We handle this',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
  },
  {
    icon: BadgeEuro,
    title: 'Grant Paid',
    description: `After post-install BER assessment, SEAI pays ${SOLAR_DATA.grant.label} directly - deducted from your invoice.`,
    duration: '4-8 weeks',
    who: 'SEAI pays us',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/20',
  },
];

function GrantTimeline() {
  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">How the grant works</h3>
      <p className="text-xs text-gray-500 mb-6">From survey to savings — we handle the hard parts</p>

      <div className="space-y-0">
        {timelineSteps.map((step, i) => {
          const StepIcon = step.icon;
          const isLast = i === timelineSteps.length - 1;

          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex gap-4"
            >
              {/* Left: icon + connector */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center shrink-0`}>
                  <StepIcon className={`w-5 h-5 ${step.color}`} />
                </div>
                {!isLast && (
                  <div className="w-px flex-1 bg-white/[0.06] my-2" />
                )}
              </div>

              {/* Right: content */}
              <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${step.bg} text-[10px] font-medium ${step.color}`}>
                    <Clock className="w-2.5 h-2.5" />
                    {step.duration}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md bg-white/[0.02] text-[10px] text-gray-600`}>
                  <Shield className={`w-3 h-3 ${step.color} opacity-50`} />
                  {step.who}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GRANT HERO — big animated €1,800
   ═══════════════════════════════════════════ */
function GrantHero({ isInView }: { isInView: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const selfInView = useInView(ref, { once: true, margin: '-40px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toString());
  const show = isInView && selfInView;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (show && !hasAnimated.current) {
      hasAnimated.current = true;
      animate(count, SOLAR_DATA.grant.amount, { duration: 2, ease: 'easeOut' });
    }
  }, [show, count]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center mb-10 sm:mb-14"
    >
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/[0.06] border border-amber-400/[0.1] mb-6">
        <Euro className="w-3 h-3 text-amber-400" />
        <span className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-[0.15em]">
          SEAI Grant
        </span>
      </div>

      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-[1.1]">
        Up to{' '}
        <span className="text-gradient tabular-nums">€<motion.span>{rounded}</motion.span></span>
        {' '}grant for solar PV.
      </h2>
      <p className="mt-4 text-gray-500 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
        The Irish government pays you to go solar. <a href="#faq" className="text-amber-400 hover:text-amber-300 transition-colors">Got questions? Check our FAQ</a>
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   KEY FACTS CARD — horizontal row
   ═══════════════════════════════════════════ */
function KeyFactsRow() {
  const facts = [
    { label: 'Grant amount', value: SOLAR_DATA.grant.label, icon: Euro, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Min. system', value: '2 kWp', icon: Zap, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { label: 'Eligible homes', value: 'Pre-2021', icon: Home, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'BER required', value: 'C3 or lower', icon: FileCheck, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {facts.map((fact) => {
        const FactIcon = fact.icon;
        return (
          <div key={fact.label} className="glass-card rounded-xl p-4 sm:p-5 hover:bg-white/[0.04] transition-colors">
            <div className={`w-8 h-8 rounded-lg ${fact.bg} flex items-center justify-center mb-3`}>
              <FactIcon className={`w-4 h-4 ${fact.color}`} />
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">{fact.value}</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">{fact.label}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function GrantInfo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  return (
    <section id="grant-info" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 relative noise-bg overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-0 w-[600px] h-[400px] bg-amber-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10" ref={sectionRef}>
        {/* ─── Hero with animated grant amount ─── */}
        <GrantHero isInView={isInView} />

        {/* ─── Key facts — full-width row ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 sm:mb-10"
        >
          <KeyFactsRow />
        </motion.div>

        {/* ─── Two-column: Eligibility checker + Timeline ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Eligibility checker */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <EligibilityChecker />
          </motion.div>

          {/* Right: Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <GrantTimeline />
          </motion.div>
        </div>

        {/* ─── Disclaimer + SEAI link ─── */}
        <motion.div
          className="mt-10 sm:mt-12 flex items-start gap-3 glass-card rounded-xl p-4 sm:p-5"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Info className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Grant values and eligibility criteria are set by the SEAI and may change. We confirm the latest details during your free survey and submit the application on your behalf. Visit{' '}
            <a
              href="https://www.seai.ie/grants/home-energy-grants/solar-pv/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              seai.ie
              <ExternalLink className="w-3 h-3" />
            </a>{' '}
            for current information.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
