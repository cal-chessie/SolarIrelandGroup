'use client';

import { useState } from 'react';
import { motion } from '@/lib/motion';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  Shield,
  Lock,
  FileText,
  MessageSquare,
  Phone,
  Mail,
  Sun,
  ChevronRight,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import { SOLAR_DATA } from '@/lib/solar-data';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function PortalLandingClient() {
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = reference.trim().toUpperCase();
    if (!clean) {
      setError('Please enter your reference number');
      return;
    }
    // Navigate to the portal dashboard
    window.location.href = `/portal/${encodeURIComponent(clean)}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-amber-400/[0.04] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-green-400/[0.03] rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-8 sm:pb-12">
            <motion.nav
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 text-sm text-gray-500 mb-8"
            >
              <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-300">Customer Portal</span>
            </motion.nav>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Secure Portal
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Track Your Solar{' '}
                <span className="text-gradient">Installation</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl mx-auto mb-10">
                Enter your reference number to see every step of your solar journey — from survey to switch-on, all in one place.
              </p>
            </motion.div>

            {/* LOOKUP FORM */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-lg mx-auto"
            >
              <form onSubmit={handleLookup} className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                    <Search className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Find Your Project</h2>
                    <p className="text-xs text-gray-500">Enter your Solar Ireland reference number</p>
                  </div>
                </div>

                <div className="relative mb-4">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Sun className="w-4 h-4 text-gray-600" />
                  </div>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => { setReference(e.target.value); setError(''); }}
                    placeholder="SI-2026-0042"
                    className={`w-full pl-11 pr-4 py-4 rounded-xl bg-white/[0.04] border text-sm text-white placeholder-gray-600 focus:outline-none transition-all font-mono tracking-wider text-center text-lg ${
                      error ? 'border-red-400/50 focus:border-red-400' : 'border-white/[0.08] focus:border-amber-400/40'
                    }`}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400 mb-4 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-amber-400/15"
                >
                  <Search className="w-4 h-4" />
                  View My Portal
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-gray-600 text-center mt-4">
                  Can&apos;t find your reference? Check your confirmation email or{' '}
                  <a
                    href={`mailto:${SOLAR_DATA.provider.email}`}
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                  >
                    contact us
                  </a>
                  </p>
              </form>
            </motion.div>
          </div>
        </section>

        {/* WHAT'S INSIDE */}
        <section className="py-16 sm:py-20 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Everything in <span className="text-gradient">One Place</span>
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                Your dedicated portal to track, manage, and stay informed about your solar installation.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: '📋',
                  title: 'Live Progress',
                  desc: 'See exactly where your installation stands with a real-time visual timeline of every milestone.',
                  color: 'amber',
                },
                {
                  icon: '📄',
                  title: 'Documents',
                  desc: 'Download your quote, grant approval, completion certificate, and all installation paperwork.',
                  color: 'sky',
                },
                {
                  icon: '💰',
                  title: 'Grant Tracker',
                  desc: 'Monitor your SEAI grant application status and see when your €1,800 payment (ROI) is on its way.',
                  color: 'green',
                },
                {
                  icon: '💬',
                  title: 'Direct Support',
                  desc: 'Message your dedicated project manager or jump on a WhatsApp call anytime.',
                  color: 'violet',
                },
              ].map((item, i) => {
                const colorMap: Record<string, string> = {
                  amber: 'border-amber-400/10 hover:border-amber-400/20',
                  sky: 'border-sky-400/10 hover:border-sky-400/20',
                  green: 'border-green-400/10 hover:border-green-400/20',
                  violet: 'border-violet-400/10 hover:border-violet-400/20',
                };
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`glass-card rounded-2xl p-6 border ${colorMap[item.color]}`}
                  >
                    <span className="text-3xl mb-4 block">{item.icon}</span>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SUPPORT */}
        <section className="py-12 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500 mb-4">Need help finding your reference?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`mailto:${SOLAR_DATA.provider.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.06] transition-all"
              >
                <Mail className="w-4 h-4 text-sky-400" />
                Email Us
              </a>
              <a
                href="https://www.facebook.com/solarlreland"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.06] transition-all"
              >
                <MessageSquare className="w-4 h-4 text-green-400" />
                WhatsApp
              </a>
              <a
                href={`tel:${SOLAR_DATA.provider.phone}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.06] transition-all"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                {SOLAR_DATA.provider.phoneDisplay}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
