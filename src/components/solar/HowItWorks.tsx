'use client';

import { motion } from 'framer-motion';
import { ClipboardCheck, FileText, Zap } from 'lucide-react';

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Free Home Survey',
    description:
      'We visit your home to assess your roof space, orientation, shading, and current energy usage. There is no charge and no obligation to proceed.',
  },
  {
    icon: FileText,
    title: 'Honest Quote & Design',
    description:
      'You receive a detailed, transparent proposal outlining the recommended system size, expected generation, and a full breakdown of costs. No hidden fees, no pressure.',
  },
  {
    icon: Zap,
    title: 'Installation & Handover',
    description:
      'Our SEAI-registered team installs your system, typically completed within one day. We handle everything including the grant application paperwork.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A straightforward process from start to finish. No hard sell, just
            honest advice about whether solar is right for your home.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-400/20 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-400/10 text-amber-400 mb-5">
                <step.icon className="w-7 h-7" />
              </div>
              <span className="absolute top-4 right-4 text-5xl font-bold text-white/[0.04]">
                {index + 1}
              </span>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
