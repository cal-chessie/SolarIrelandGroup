'use client';

import { motion } from 'framer-motion';

export default function BrandBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-64 sm:h-80 md:h-96">
        <img
          src="/fb-cover.png"
          alt="Solar Ireland - Sun-Powered Solutions, Made in Ireland"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/logo-md.png"
              alt="Solar Ireland"
              className="h-16 sm:h-20 mx-auto mb-4"
            />
            <p className="text-white text-lg sm:text-xl font-medium tracking-wide">
              Sun-Powered Solutions, Made in Ireland
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
