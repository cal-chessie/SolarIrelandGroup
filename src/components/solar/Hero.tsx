'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import BumblebeeMascot from './BumblebeeMascot';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay - extends behind navbar */}
      <div className="absolute -top-16 left-0 right-0 bottom-0 z-0">
        <img
          src="/hero-solar.jpg"
          alt="Modern black frameless solar panels on an Irish home"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-[#0a0a0a]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        {/* Bumblebee mascot floating at top */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: -30, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <BumblebeeMascot size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
            SEAI Registered Installer
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        >
          <span className="text-white">Cut Your Electricity Bills</span>
          <br />
          <span className="text-gradient">With Solar Power</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          Upload your electricity bill and our AI will show you exactly what
          solar will save you. We then handle everything &mdash; free survey,
          installation, and your full SEAI grant application.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
        >
          <Button
            size="lg"
            className="bg-amber-400 hover:bg-amber-500 text-black font-semibold px-8 py-6 text-lg rounded-xl glow-amber"
            asChild
          >
            <a href="#calculator">
              <MessageCircle className="mr-2 h-5 w-5" />
              Analyse My Bill
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white px-8 py-6 text-lg rounded-xl"
            asChild
          >
            <a href="mailto:cal@solarireland.com">
              <Mail className="mr-2 h-5 w-5" />
              Email Us
            </a>
          </Button>
        </motion.div>

        <motion.p
          className="mt-6 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Serving Connacht, Leinster &amp; Munster
        </motion.p>
      </div>
    </section>
  );
}
