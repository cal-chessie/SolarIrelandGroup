'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Menu,
  X,
  Zap,
  TrendingUp,
  Camera,
  HelpCircle,
  Euro,
  ArrowRight,
  Shield,
  Phone,
  Mail,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

/* ═══════════════════════════════════════════
   NAV DATA
   ═══════════════════════════════════════════ */
const navLinks = [
  {
    label: 'How It Works',
    href: '#how-it-works',
    icon: Sparkles,
    color: 'amber',
    description: 'Three steps to lower bills',
    gradient: 'from-amber-400/20 to-orange-400/10',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-400/20',
  },
  {
    label: 'Why Solar',
    href: '#why-solar',
    icon: TrendingUp,
    color: 'emerald',
    description: 'Savings, grants & benefits',
    gradient: 'from-emerald-400/20 to-teal-400/10',
    iconBg: 'bg-emerald-400/10',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-400/20',
  },
  {
    label: 'Our Work',
    href: '#our-work',
    icon: Camera,
    color: 'violet',
    description: 'Real Irish installations',
    gradient: 'from-violet-400/20 to-purple-400/10',
    iconBg: 'bg-violet-400/10',
    iconColor: 'text-violet-400',
    borderHover: 'hover:border-violet-400/20',
  },
  {
    label: 'Grants',
    href: '#grant-info',
    icon: Euro,
    color: 'sky',
    description: '€1,800 SEAI grant explained',
    gradient: 'from-sky-400/20 to-blue-400/10',
    iconBg: 'bg-sky-400/10',
    iconColor: 'text-sky-400',
    borderHover: 'hover:border-sky-400/20',
  },
  {
    label: 'AI Bill Analyser',
    href: '#calculator',
    icon: Zap,
    color: 'amber',
    description: 'Upload your bill, see savings',
    gradient: 'from-amber-400/20 to-yellow-400/10',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-400/20',
    highlight: true,
  },
  {
    label: 'FAQ',
    href: '#faq',
    icon: HelpCircle,
    color: 'rose',
    description: 'Common questions answered',
    gradient: 'from-rose-400/20 to-pink-400/10',
    iconBg: 'bg-rose-400/10',
    iconColor: 'text-rose-400',
    borderHover: 'hover:border-rose-400/20',
  },
];

/* ═══════════════════════════════════════════
   HAMBURGER ICON (animated morph)
   ═══════════════════════════════════════════ */
function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      <motion.span
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 0 : -6,
          width: isOpen ? 20 : 18,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="absolute h-[1.5px] bg-white rounded-full origin-center"
      />
      <motion.span
        animate={{
          opacity: isOpen ? 0 : 1,
          scaleX: isOpen ? 0 : 1,
        }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="absolute h-[1.5px] bg-white rounded-full w-4"
      />
      <motion.span
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? 0 : 6,
          width: isOpen ? 20 : 14,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="absolute h-[1.5px] bg-white rounded-full origin-center"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   ACTIVE SECTION TRACKER
   ═══════════════════════════════════════════ */
function useActiveSection() {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.replace('#', ''));

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { threshold: 0.2, rootMargin: '-80px 0px -40% 0px' }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}

/* ═══════════════════════════════════════════
   MOBILE MENU PANEL
   ═══════════════════════════════════════════ */
function MobileMenu({
  isOpen,
  onClose,
  activeSection,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
}) {
  const scrollTo = useCallback(
    (href: string) => {
      onClose();
      // Wait for close animation to finish
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    },
    [onClose]
  );

  const sectionId = (href: string) => href.replace('#', '');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-0 top-0 z-50 md:hidden max-h-[100dvh] overflow-y-auto overscroll-contain"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="min-h-full bg-[#0a0a0a] border-b border-white/[0.06]">
              {/* Menu header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <img src="/logo-sm.png" alt="Solar Ireland" className="h-7 w-auto" />
                  <span className="font-bold text-white text-sm tracking-wide">Solar Ireland</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation links */}
              <div className="px-4 py-4 space-y-1.5">
                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  const isActive = activeSection === sectionId(link.href);

                  return (
                    <motion.button
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.08 + i * 0.05,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      onClick={() => scrollTo(link.href)}
                      className={`
                        w-full text-left rounded-2xl p-4 flex items-center gap-4
                        transition-all duration-200 active:scale-[0.98] group relative overflow-hidden
                        ${
                          isActive
                            ? 'bg-white/[0.06] border border-white/[0.1]'
                            : `border border-transparent hover:bg-white/[0.03]`
                        }
                        ${link.highlight && !isActive ? 'hover:bg-amber-400/[0.04] hover:border-amber-400/15' : ''}
                      `}
                    >
                      {/* Active indicator dot */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-amber-400"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={`
                          shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200
                          ${link.iconBg}
                          ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                        `}
                      >
                        <Icon className={`w-5 h-5 ${link.iconColor}`} />
                      </div>

                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[15px] font-semibold transition-colors ${
                              isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                            }`}
                          >
                            {link.label}
                          </span>
                          {link.highlight && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-400/15 text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                              AI
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 mt-0.5 block">
                          {link.description}
                        </span>
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                          isActive
                            ? 'text-amber-400 translate-x-0'
                            : 'text-gray-700 -translate-x-1 group-hover:translate-x-0 group-hover:text-gray-500'
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-4 h-px bg-white/[0.05]" />

              {/* CTA section */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="px-4 py-5"
              >
                {/* Primary CTA */}
                <button
                  onClick={() => scrollTo('#calculator')}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-amber-400/15"
                >
                  <Zap className="w-4 h-4" />
                  Analyse My Bill
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Secondary actions */}
                <div className="flex items-center gap-2 mt-3">
                  <a
                    href="https://wa.me/353873958424?text=Hi%2C%20I%20have%20a%20question%20about%20solar%20panels."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-gray-300 hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
                  >
                    <Phone className="w-3.5 h-3.5 text-green-400" />
                    WhatsApp
                  </a>
                  <a
                    href="mailto:cal@solarireland.com"
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-gray-300 hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
                  >
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    Email Us
                  </a>
                </div>
              </motion.div>

              {/* Trust signals */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.4 }}
                className="px-4 pb-6"
              >
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center mx-auto mb-1.5">
                        <Shield className="w-4 h-4 text-green-400" />
                      </div>
                      <p className="text-[10px] font-semibold text-gray-400">SEAI Registered</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center mx-auto mb-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-[10px] font-semibold text-gray-400">RECI Certified</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center mx-auto mb-1.5">
                        <Euro className="w-4 h-4 text-sky-400" />
                      </div>
                      <p className="text-[10px] font-semibold text-gray-400">€1,800 Grant</p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-gray-700 text-center mt-4">
                  © 2024 Solar Ireland · SEAI Registered Installer
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   MAIN NAVBAR
   ═══════════════════════════════════════════ */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Track scroll for navbar background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${
          scrolled
            ? 'bg-black/85 backdrop-blur-xl border-b border-white/[0.05]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 active:scale-95 transition-transform"
          >
            <img src="/logo-sm.png" alt="Solar Ireland" className="h-8 w-auto" />
            <span className="font-bold text-white hidden sm:inline text-sm tracking-wide">
              Solar Ireland
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`text-xs font-medium uppercase tracking-wider transition-colors relative py-1 ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="desktopActive"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-amber-400"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <button
              onClick={() => scrollTo('#calculator')}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs px-5 py-2 rounded-full uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20"
            >
              Analyse Bill
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-white hover:bg-white/[0.08] transition-colors active:scale-90"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <HamburgerIcon isOpen={isOpen} />
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activeSection={activeSection}
      />
    </>
  );
}
