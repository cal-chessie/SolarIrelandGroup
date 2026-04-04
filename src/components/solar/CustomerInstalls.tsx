'use client';

import { motion } from 'framer-motion';

const installs = [
  {
    src: '/install-1.jpg',
    alt: 'Solar panel installation on a modern Irish home with tiled roof and green surroundings',
  },
  {
    src: '/install-2.jpg',
    alt: 'Solar PV system on a two-story Irish house with white exterior on a sunny day',
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

export default function CustomerInstalls() {
  return (
    <section id="our-work" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Our <span className="text-gradient">Work</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real installations on real Irish homes. No stock photos, no
            gimmicks &mdash; just quality work that speaks for itself.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {installs.map((install, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group rounded-2xl overflow-hidden border border-white/[0.06]"
            >
              <img
                src={install.src}
                alt={install.alt}
                className="w-full h-72 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/70 text-sm font-medium">
                  {index === 0
                    ? 'Tiled roof installation, seamless integration'
                    : 'Flush-mounted system on rendered exterior'}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-center mt-8 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Every home is different &mdash; we design each system to suit your
          specific roof and energy needs.
        </motion.p>
      </div>
    </section>
  );
}
