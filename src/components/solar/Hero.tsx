'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import BumblebeeMascot from './BumblebeeMascot';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image — full bleed, extends behind navbar */}
      <div className="absolute inset-0">
        <img
          src="/hero-solar.jpg"
          alt="Modern black frameless solar panels on an Irish home"
          className="w-full h-full object-cover"
        />
        {/* Gradient: gentle dark at top (navbar area), mostly clear in middle, fade to page bg at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 via-50% to-[#0a0a0a]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-20 sm:pb-24">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-4">
          {/* Text column */}
          <div className="max-w-2xl flex-1">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-black/30 backdrop-blur-sm text-amber-400 border border-white/[0.15]">
                SEAI Registered Installer
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="mt-6 text-[2.75rem] sm:text-6xl md:text-7xl lg:text-7xl font-bold tracking-tight leading-[0.95] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            >
              <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Your Energy.</span>
              <br />
              <span className="text-gradient drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Your Asset.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-base sm:text-lg text-gray-200 max-w-lg leading-relaxed mb-10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
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
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-7 py-3.5 text-sm rounded-full tracking-wide shadow-lg shadow-amber-400/20"
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
                className="border-white/20 bg-black/30 backdrop-blur-sm text-white hover:bg-white/10 px-7 py-3.5 text-sm rounded-full tracking-wide"
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
              className="mt-12 flex items-center gap-6 text-xs text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <span className="flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Connacht
              </span>
              <span className="flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Leinster
              </span>
              <span className="flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Munster
              </span>
            </motion.div>
          </div>

          {/* Bumblebee — always visible, right side */}
          <motion.div
            className="flex-shrink-0 lg:mt-16"
            initial={{ opacity: 0, scale: 0.6, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Subtle light backdrop behind bumblebee so it pops against dark image */}
              <div className="absolute -inset-6 bg-white/5 rounded-full blur-2xl" />
              <div className="relative">
                <BumblebeeMascot size="hero" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
