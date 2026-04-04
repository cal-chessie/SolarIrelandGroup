'use client';

import { motion } from 'framer-motion';

const installs = [
  {
    src: '/install-1.jpg',
    alt: 'Solar panel installation on a modern Irish home with tiled roof',
    caption: 'Tiled roof — seamless integration',
  },
  {
    src: '/install-2.jpg',
    alt: 'Solar PV system on a two-story Irish house',
    caption: 'Flush-mount — clean finish',
  },
];

export default function CustomerInstalls() {
  return (
    <section id="our-work" className="py-24 sm:py-32 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Our work
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl">
            Real installs on
            <br />
            <span className="text-gradient">real Irish homes.</span>
          </h2>
        </motion.div>

        {/* Image grid — asymmetric for visual interest */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {installs.map((install, i) => (
            <motion.div
              key={i}
              className={`relative group rounded-2xl overflow-hidden ${
                i === 0 ? 'sm:col-span-3' : 'sm:col-span-2'
              }`}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <img
                src={install.src}
                alt={install.alt}
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                  i === 0 ? 'h-64 sm:h-80 lg:h-96' : 'h-64 sm:h-80 lg:h-96'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  {install.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
