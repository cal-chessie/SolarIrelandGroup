'use client';

import { motion } from 'framer-motion';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function GrantInfo() {
  return (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            SEAI Solar PV <span className="text-gradient">Grant</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The Sustainable Energy Authority of Ireland (SEAI) offers a grant to
            help homeowners with the cost of installing solar panels. Here is what
            you need to know.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.03] p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">
                Grant Amount: Up to &euro;1,800
              </h3>
              <p className="text-gray-400 text-sm">
                The current SEAI Solar PV grant value for 2026. The exact amount
                depends on your system size and eligibility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300">
                Available to owner-occupiers of homes built before 2021
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300">
                Property must have a BER rating of C3 or lower
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300">
                BER assessment required after installation
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300">
                Must use an SEAI-registered installer
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex items-start gap-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium mb-1">Important</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Grant values and eligibility criteria are set by the SEAI and may
              change. We will confirm the latest information during your free
              survey. We submit the grant application on your behalf as part of our
              service &mdash; you do not need to deal with the paperwork yourself.
              Visit{' '}
              <a
                href="https://www.seai.ie/grants/home-energy-grants/solar-pv/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                seai.ie
              </a>{' '}
              for the most up-to-date details.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
