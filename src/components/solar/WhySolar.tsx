'use client';

import { motion } from 'framer-motion';
import { PiggyBank, Leaf, TrendingUp, ShieldCheck, Sun, Zap } from 'lucide-react';

const benefits = [
  {
    icon: PiggyBank,
    title: 'Lower Bills',
    stat: 'Up to 70%',
    statLabel: 'of electricity costs',
    description:
      'A typical Irish home with a 4kWp system can save significantly on annual electricity costs. With energy prices rising year on year, those savings grow over the system\'s 25+ year lifespan. The more prices go up, the more valuable your solar becomes.',
  },
  {
    icon: TrendingUp,
    title: 'SEAI Grant',
    stat: '€1,800',
    statLabel: 'government grant',
    description:
      'The SEAI Solar PV scheme offers up to €1,800 towards your installation in 2026. Available to owner-occupiers of homes built before 2021 with a BER rating of C3 or lower. We handle the entire application on your behalf.',
  },
  {
    icon: Leaf,
    title: 'Carbon Offset',
    stat: '3+ tonnes',
    statLabel: 'CO₂ offset per year',
    description:
      'Solar panels generate clean electricity that produces zero carbon emissions at the point of use. A residential system can offset several tonnes of CO2 annually compared to grid electricity, making it one of the most practical steps an Irish household can take towards reducing its carbon footprint.',
  },
  {
    icon: ShieldCheck,
    title: 'BER Improvement',
    stat: 'Better',
    statLabel: 'energy rating',
    description:
      'Solar panels improve your home\'s Building Energy Rating, a legal requirement when selling or renting in Ireland. A better BER makes your home more attractive to buyers and can increase its market value. We coordinate the post-install BER assessment as part of our service.',
  },
];

export default function WhySolar() {
  return (
    <section id="why-solar" className="py-24 sm:py-32 px-5 sm:px-8 relative">
      {/* Subtle honeycomb background */}
      <div className="absolute inset-0 honeycomb-bg" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Why go solar
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl">
            The practical
            <br />
            <span className="text-gradient">benefits of solar.</span>
          </h2>
        </motion.div>

        {/* Benefits grid — 2 large + 2 small pattern */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              className={`glass-card rounded-2xl p-7 sm:p-8 hover:border-amber-400/15 transition-all duration-300 ${
                i < 2 ? 'md:row-span-1' : ''
              }`}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-amber-400/10 text-amber-400">
                  <benefit.icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-400 leading-none">
                    {benefit.stat}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-1">
                    {benefit.statLabel}
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust line */}
        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-amber-400/50" />
            SEAI Registered
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400/50" />
            Safe Electric
          </span>
          <span className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400/50" />
            25+ Year Panel Warranty
          </span>
        </motion.div>
      </div>
    </section>
  );
}
