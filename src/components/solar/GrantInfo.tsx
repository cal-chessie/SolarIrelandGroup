'use client';

import { motion } from 'framer-motion';
import { Info, CheckCircle2, ExternalLink } from 'lucide-react';

export default function GrantInfo() {
  return (
    <section id="grant-info" className="py-24 sm:py-32 px-5 sm:px-8 relative noise-bg">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            SEAI Grant
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl">
            Up to <span className="text-gradient">€1,800</span> grant
            <br />
            for solar PV.
          </h2>
        </motion.div>

        {/* Main grant card */}
        <motion.div
          className="glass-card rounded-2xl p-8 sm:p-10 mb-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Amber accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              'Available to owner-occupiers of homes built before 2021',
              'Property must have a BER rating of C3 or lower',
              'BER assessment required after installation',
              'Must use an SEAI-registered installer',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          className="flex items-start gap-3 text-sm"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Info className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
          <p className="text-gray-600 leading-relaxed">
            Grant values and eligibility criteria are set by the SEAI and may change.
            We confirm the latest details during your free survey and submit the
            application on your behalf. Visit{' '}
            <a
              href="https://www.seai.ie/grants/home-energy-grants/solar-pv/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
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
