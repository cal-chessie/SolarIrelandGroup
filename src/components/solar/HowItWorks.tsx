'use client';

import { motion } from 'framer-motion';
import { Upload, Home, Zap, ArrowRight } from 'lucide-react';
import BumblebeeMascot from './BumblebeeMascot';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload Your Bill',
    description:
      'Drop a photo of your electricity bill into our AI analyser. It reads your provider, usage, and spend in seconds.',
  },
  {
    icon: Home,
    number: '02',
    title: 'Free Survey',
    description:
      "We visit your home to assess your roof, shading, and energy usage. No charge, no obligation — just honest advice.",
  },
  {
    icon: Zap,
    number: '03',
    title: 'Install & Save',
    description:
      'Our SEAI-registered team installs your system in a day. We handle the grant paperwork. You start saving from day one.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-5 sm:px-8 relative noise-bg">
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
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl">
            Three steps to
            <br />
            <span className="text-gradient">lower bills.</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              {/* Connector arrow on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-10 -right-4 lg:-right-5 z-10 text-white/10">
                  <ArrowRight className="w-8 h-8" />
                </div>
              )}

              <div className="glass-card rounded-2xl p-7 sm:p-8 h-full hover:border-amber-400/20 transition-all duration-300 group-hover:bg-white/[0.04]">
                {/* Number */}
                <span className="block text-5xl font-black text-white/[0.04] mb-4 -ml-1">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 mb-5 group-hover:bg-amber-400/15 transition-colors">
                  <step.icon className="w-5 h-5" />
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bumblebee peeking on mobile */}
        <motion.div
          className="md:hidden flex justify-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <BumblebeeMascot size="md" flipped />
        </motion.div>
      </div>
    </section>
  );
}
