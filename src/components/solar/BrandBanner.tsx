'use client';

import { motion } from 'framer-motion';

export default function BrandBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-48 sm:h-64 md:h-72">
        <img
          src="/fb-cover.png"
          alt="Solar Ireland — Sun-Powered Solutions, Made in Ireland"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/logo-md.png"
              alt="Solar Ireland"
              className="h-12 sm:h-16 mx-auto mb-3 opacity-80"
            />
            <p className="text-white/70 text-sm sm:text-base font-medium tracking-wide">
              Sun-Powered Solutions, Made in Ireland
            </p>
          </motion.div>
        </div>
      </div>
      {/* Amber divider line */}
      <div className="amber-line" />
    </section>
  );
}
