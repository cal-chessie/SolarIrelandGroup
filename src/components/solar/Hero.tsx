'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import BumblebeeMascot from './BumblebeeMascot';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-end sm:items-center justify-center overflow-hidden">
      {/* Background image — extends behind navbar */}
      <div className="absolute -top-20 left-0 right-0 bottom-0">
        <img
          src="/hero-solar.jpg"
          alt="Modern black frameless solar panels on an Irish home"
          className="w-full h-full object-cover scale-105"
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-20 sm:pb-24">
        <div className="max-w-2xl">
          {/* Bumblebee — subtle, off to the side on desktop */}
          <motion.div
            className="hidden lg:block absolute -right-4 top-8"
            initial={{ opacity: 0, scale: 0.6, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <BumblebeeMascot size="hero" />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-white/[0.06] backdrop-blur-sm text-amber-400 border border-white/[0.08]">
              SEAI Registered Installer
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="mt-6 text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          >
            <span className="text-white">Your Energy.</span>
            <br />
            <span className="text-gradient">Your Asset.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg text-gray-400 max-w-lg leading-relaxed mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
          >
            Upload your electricity bill and our AI will show you exactly what
            solar will save you. We handle everything &mdash; survey, install,
            and your SEAI grant.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-start gap-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            <Button
              size="lg"
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-7 py-3.5 text-sm rounded-full tracking-wide glow-amber"
              asChild
            >
              <a href="#calculator">
                <MessageCircle className="mr-2 h-4 w-4" />
                Analyse My Bill
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/[0.15] text-white hover:bg-white/[0.08] px-7 py-3.5 text-sm rounded-full tracking-wide"
              asChild
            >
              <a href="mailto:cal@solarireland.com">
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </a>
            </Button>
          </motion.div>

          {/* Service areas */}
          <motion.div
            className="mt-12 flex items-center gap-6 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Connacht
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Leinster
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Munster
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
