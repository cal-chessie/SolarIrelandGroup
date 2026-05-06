'use client';

import { useEffect, useRef, useState } from 'react';
import { Euro, Clock, Zap, Sun } from 'lucide-react';
import { motion } from '@/lib/motion';
import { SOLAR_DATA } from '@/lib/solar-data';


function useStatCounter(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!start || hasRun.current) return;
    hasRun.current = true;

    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(() => requestAnimationFrame(tick));
  }, [start, target, duration]);

  return value;
}

const STATS = [
  {
    icon: Euro,
    label: 'Avg. Annual Saving',
    target: SOLAR_DATA.savings.avgAnnual,
    prefix: '€',
    suffix: '/yr',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    icon: Clock,
    label: 'Payback Period',
    target: SOLAR_DATA.savings.paybackYears,
    prefix: '',
    suffix: ' years',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: Zap,
    label: '25-Year Savings',
    target: Math.round(SOLAR_DATA.savings.total25yr / 1000),
    prefix: '€',
    suffix: 'k+',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    icon: Sun,
    label: 'SEAI Grant (ROI)',
    target: SOLAR_DATA.grant.amount,
    prefix: '€',
    suffix: '',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
];

function StatCard({
  icon: Icon,
  label,
  target,
  prefix,
  suffix,
  color,
  bg,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  target: number;
  prefix: string;
  suffix: string;
  color: string;
  bg: string;
  active: boolean;
}) {
  const value = useStatCounter(target, 2000, active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 sm:py-5 rounded-xl glass-card"
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${bg} flex items-center justify-center shrink-0`}
        style={{ willChange: 'transform' }}
      >
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
      </div>

      <div className="min-w-0">
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-none tabular-nums">
          {prefix}{value.toLocaleString()}<span className="text-sm sm:text-base font-semibold text-gray-400">{suffix}</span>
        </p>
        <p className="text-[11px] sm:text-xs text-gray-400 mt-1 leading-tight">{label}</p>
      </div>
    </motion.div>
  );
}

export default function StatsBar() {
  return (
    <section className="hidden sm:block relative z-10 -mt-6 sm:-mt-8 pb-8 sm:pb-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        className="max-w-5xl mx-auto rounded-2xl border border-white/[0.06] bg-black/40 p-4 sm:p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {STATS.map((stat) => (
            <StatCard
              key={stat.label}
              {...stat}
              active={true}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
