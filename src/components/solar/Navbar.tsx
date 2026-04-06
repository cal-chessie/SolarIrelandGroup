'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  BookOpen,
  Wrench,
  MapPin,
  Users,
  MessageSquare,
} from 'lucide-react';

/* ═══════════════════════════════════════════
   NAV DATA
   ═══════════════════════════════════════════ */
const navLinks = [
  {
    label: 'Services',
    href: '/services',
    icon: Wrench,
    color: 'amber',
    description: 'Solar PV, batteries, EV charging',
    gradient: 'from-amber-400/20 to-orange-400/10',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-400/20',
    isPage: true,
  },
  {
    label: 'Counties',
    href: '/counties',
    icon: MapPin,
    color: 'sky',
    description: 'Solar across all 32 counties',
    gradient: 'from-sky-400/20 to-blue-400/10',
    iconBg: 'bg-sky-400/10',
    iconColor: 'text-sky-400',
    borderHover: 'hover:border-sky-400/20',
    isPage: true,
  },
  {
    label: 'Blog',
    href: '/blog',
    icon: BookOpen,
    color: 'emerald',
    description: 'Solar tips, guides & news',
    gradient: 'from-emerald-400/20 to-teal-400/10',
    iconBg: 'bg-emerald-400/10',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-400/20',
    isPage: true,
  },
  {
    label: 'About',
    href: '/about',
    icon: Users,
    color: 'violet',
    description: 'Our story & team',
    gradient: 'from-violet-400/20 to-purple-400/10',
    iconBg: 'bg-violet-400/10',
    iconColor: 'text-violet-400',
    borderHover: 'hover:border-violet-400/20',
    isPage: true,
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: MessageSquare,
    color: 'rose',
    description: 'Get in touch',
    gradient: 'from-rose-400/20 to-pink-400/10',
    iconBg: 'bg-rose-400/10',
    iconColor: 'text-rose-400',
    borderHover: 'hover:border-rose-400/20',
    isPage: true,
  },
  {
    label: 'AI Bill Analyser',
    href: '/#calculator',
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
    href: '/#faq',
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
   HAMBURGER ICON — pure CSS morphing
   ═══════════════════════════════════════════ */
function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      <span
        className={`absolute h-[1.5px] bg-white rounded-full origin-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'rotate-45 w-5' : 'w-[18px] -translate-y-1.5'
        }`}
      />
      <span
        className={`absolute h-[1.5px] bg-white rounded-full w-4 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
        }`}
      />
      <span
        className={`absolute h-[1.5px] bg-white rounded-full origin-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? '-rotate-45 w-5' : 'w-3.5 translate-y-1.5'
        }`}
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
   MOBILE MENU PANEL — pure CSS transitions
   ═══════════════════════════════════════════ */
function MobileMenu({
  isOpen,
  onClose,
  activeSection,
  pathname,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  pathname: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  const navigateTo = useCallback(
    (href: string) => {
      onClose();
      setTimeout(() => {
        if (href.startsWith('/')) {
          // Page link — navigate
          if (href.includes('#')) {
            // Hash link on a page (e.g. /#calculator)
            const [path, hash] = href.split('#');
            if (path === '/' || path === '') {
              // Same page anchor
              document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.location.href = href;
            }
          } else {
            window.location.href = href;
          }
        } else if (href.startsWith('#')) {
          document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    },
    [onClose]
  );

  const sectionId = (href: string) => href.replace('/#', '').replace('#', '');
  const isActive = (href: string) => {
    if (href.startsWith('/') && !href.startsWith('/#')) {
      return pathname === href || pathname.startsWith(href + '/');
    }
    return activeSection === sectionId(href);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the panel for accessibility
      panelRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`fixed inset-x-0 top-0 z-50 md:hidden max-h-[100dvh] overflow-y-auto overscroll-contain transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ scrollbarWidth: 'none' }}
        aria-hidden={!isOpen}
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

          {/* Navigation links — staggered with CSS transition-delay */}
          <div className="px-4 py-4 space-y-1.5">
            {navLinks.map((link, i) => {
              const Icon = link.icon;
              const linkActive = isActive(link.href);

              return (
                <button
                  key={link.href}
                  onClick={() => navigateTo(link.href)}
                  style={{
                    transitionDelay: isOpen ? `${60 + i * 40}ms` : '0ms',
                  }}
                  className={`
                    w-full text-left rounded-2xl p-4 flex items-center gap-4
                    transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] group relative overflow-hidden
                    ${
                      isOpen
                        ? 'translate-x-0 opacity-100'
                        : '-translate-x-5 opacity-0'
                    }
                    ${
                      linkActive
                        ? 'bg-white/[0.06] border border-white/[0.1]'
                        : `border border-transparent hover:bg-white/[0.03]`
                    }
                    ${link.highlight && !linkActive ? 'hover:bg-amber-400/[0.04] hover:border-amber-400/15' : ''}
                  `}
                >
                  {/* Active indicator dot */}
                  {linkActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-amber-400 transition-all duration-300" />
                  )}

                  {/* Icon */}
                  <div
                    className={`
                      shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200
                      ${link.iconBg}
                      ${linkActive ? 'scale-110' : 'group-hover:scale-105'}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${link.iconColor}`} />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[15px] font-semibold transition-colors ${
                          linkActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
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
                      linkActive
                        ? 'text-amber-400 translate-x-0'
                        : 'text-gray-700 -translate-x-1 group-hover:translate-x-0 group-hover:text-gray-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-white/[0.05]" />

          {/* CTA section — delayed entrance */}
          <div
            className={`px-4 py-5 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: isOpen ? '400ms' : '0ms' }}
          >
            {/* Primary CTA */}
            <button
              onClick={() => navigateTo('/#calculator')}
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
          </div>

          {/* Trust signals — delayed entrance */}
          <div
            className={`px-4 pb-6 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: isOpen ? '550ms' : '0ms' }}
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
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   MAIN NAVBAR
   ═══════════════════════════════════════════ */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection();
  const pathname = usePathname();

  // Track scroll for navbar background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigateTo = (href: string) => {
    if (href.startsWith('/') && !href.startsWith('/#')) {
      window.location.href = href;
    } else if (href.startsWith('/#')) {
      // Hash link — navigate to homepage then scroll
      const hash = href.slice(2);
      if (window.location.pathname === '/') {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = href;
      }
    } else if (href.startsWith('#')) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
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
            ? 'bg-black/95 border-b border-white/[0.05]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 active:scale-95 transition-transform"
          >
            <img src="/logo-sm.png" alt="Solar Ireland" className="h-12 w-auto" />
            <span className="font-bold text-white hidden sm:inline text-lg tracking-wide">
              Solar Ireland
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = link.href.startsWith('/') && !link.href.startsWith('/#')
                ? (pathname === link.href || pathname.startsWith(link.href + '/'))
                : activeSection === link.href.replace('/#', '').replace('#', '');
              return (
                <button
                  key={link.href}
                  onClick={() => navigateTo(link.href)}
                  className={`text-xs font-medium uppercase tracking-wider transition-colors relative py-1 ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-amber-400 transition-all duration-300" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <button
              onClick={() => navigateTo('/#calculator')}
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
        pathname={pathname}
      />
    </>
  );
}
