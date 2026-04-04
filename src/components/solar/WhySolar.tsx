'use client';

import { motion } from 'framer-motion';
import {
  PiggyBank,
  Leaf,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

const benefits = [
  {
    icon: PiggyBank,
    title: 'Lower Electricity Bills',
    description:
      'A typical 4kW solar system in Ireland can generate around 3,400 kWh per year, reducing your reliance on the grid and cutting your electricity costs. With Irish electricity prices rising year on year, the savings only grow over time. Most homeowners see a meaningful reduction in their annual bills within the first year of operation.',
  },
  {
    icon: TrendingUp,
    title: 'SEAI Grant Available',
    description:
      'The SEAI Solar PV scheme offers a grant of up to \u20AC1,800 towards the cost of installing solar panels on your home. The grant is subject to eligibility criteria, including being a homeowner-occupier of a property built before 2021. We handle the application process on your behalf as part of our installation service.',
  },
  {
    icon: Leaf,
    title: 'Reduce Your Carbon Footprint',
    description:
      'Solar panels generate clean, renewable energy that doesn\'t produce carbon emissions. A typical residential solar system can offset several tonnes of CO2 per year compared to grid electricity. As Ireland works towards its 2030 climate targets, generating your own renewable energy at home is one of the most practical steps you can take.',
  },
  {
    icon: ShieldCheck,
    title: 'Increase Your BER Rating',
    description:
      'Installing solar panels improves your home\'s Building Energy Rating (BER), which is the official energy efficiency grade for Irish properties. A better BER rating makes your home more attractive to future buyers and can increase its market value. A BER assessment is required after installation for the SEAI grant, and we coordinate this for you.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function WhySolar() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Go <span className="text-gradient">Solar?</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Solar panels are a practical investment for Irish homeowners. Here are
            the real benefits, without the hype.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-400/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
