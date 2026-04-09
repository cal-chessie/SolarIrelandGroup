'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  X,
  Zap,
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
  CalendarCheck,
  CreditCard,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com/solarireland', label: 'Facebook', color: 'hover:text-[#1877F2] hover:border-[#1877F2]/30' },
  { href: 'https://www.instagram.com/solarireland', label: 'Instagram', color: 'hover:text-[#E4405F] hover:border-[#E4405F]/30' },
  { href: 'https://www.tiktok.com/@solarireland', label: 'TikTok', color: 'hover:text-white hover:border-white/30' },
  { href: 'https://www.linkedin.com/company/solarireland', label: 'LinkedIn', color: 'hover:text-[#0A66C2] hover:border-[#0A66C2]/30' },
] as const;

// Mobile nav — all pages + sections
const mobileLinks = [
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
  },
  {
    label: 'Calculator',
    href: '/solar-calculator',
    icon: Sparkles,
    color: 'amber',
    description: 'Savings calculator & AI bill analyser',
    gradient: 'from-amber-400/20 to-yellow-400/10',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-400/20',
    highlight: true,
  },
  {
    label: 'Financing',
    href: '/financing',
    icon: CreditCard,
    color: 'green',
    description: 'Payment plans & finance calculator',
    gradient: 'from-green-400/20 to-emerald-400/10',
    iconBg: 'bg-green-400/10',
    iconColor: 'text-green-400',
    borderHover: 'hover:border-green-400/20',
  },
  {
    label: 'Book Survey',
    href: '/book-survey',
    icon: CalendarCheck,
    color: 'green',
    description: 'Book a free home solar assessment',
    gradient: 'from-green-400/20 to-emerald-400/10',
    iconBg: 'bg-green-400/10',
    iconColor: 'text-green-400',
    borderHover: 'hover:border-green-400/20',
    highlight: true,
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
  },
  {
    label: 'Portal',
    href: '/portal',
    icon: Shield,
    color: 'sky',
    description: 'Track your installation',
    gradient: 'from-sky-400/20 to-blue-400/10',
    iconBg: 'bg-sky-400/10',
    iconColor: 'text-sky-400',
    borderHover: 'hover:border-sky-400/20',
    highlight: true,
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

// Desktop nav — all 7 links with proper styling
const desktopNavLinks = [
  { label: 'Services', href: '/services', isBookSurvey: false },
  { label: 'Counties', href: '/counties', isBookSurvey: false },
  { label: 'Calculator', href: '/solar-calculator', isBookSurvey: false },
  { label: 'Financing', href: '/financing', isBookSurvey: false },
  { label: 'Book Survey', href: '/book-survey', isBookSurvey: true },
  { label: 'Blog', href: '/blog', isBookSurvey: false },
  { label: 'Portal', href: '/portal', isBookSurvey: false },
];

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

function useActiveSection() {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const sectionIds = mobileLinks.map((l) => l.href.replace('#', ''));

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
          if (href.includes('#')) {
            const [path, hash] = href.split('#');
            if (path === '/' || path === '') {
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
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
        id="mobile-menu"
        tabIndex={-1}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        className={`fixed inset-x-0 top-0 z-50 md:hidden max-h-[100dvh] overflow-y-auto overscroll-contain transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ scrollbarWidth: 'none' }}
        aria-hidden={!isOpen}
      >
        <div className="min-h-full bg-[#0a0a0a] border-b border-white/[0.06]">
          {/* Mobile header bar */}
          <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.05]">
            <div className="flex items-center gap-2.5">
              <Image src="/logo-sm.webp" alt="Solar Ireland" className="h-7 w-auto" width={28} height={28} />
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

          {/* Mobile nav links */}
          <div className="px-4 py-4 space-y-1">
            {mobileLinks.map((link, i) => {
              const Icon = link.icon;
              const linkActive = isActive(link.href);

              return (
                <button
                  key={link.href}
                  onClick={() => navigateTo(link.href)}
                  style={{
                    transitionDelay: isOpen ? `${50 + i * 30}ms` : '0ms',
                  }}
                  className={`
                    w-full text-left rounded-xl px-4 py-3 flex items-center gap-3.5
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
                  {linkActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-amber-400 transition-all duration-300" />
                  )}

                  <div
                    className={`
                      shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
                      ${link.iconBg}
                      ${linkActive ? 'scale-110' : 'group-hover:scale-105'}
                    `}
                  >
                    <Icon className={`w-[18px] h-[18px] ${link.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold transition-colors ${
                          linkActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {link.label}
                      </span>
                      {link.highlight && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-400/15 text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                          AI
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      {link.description}
                    </span>
                  </div>

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

          <div className="mx-4 h-px bg-white/[0.05]" />

          {/* CTA buttons */}
          <div
            className={`px-4 py-5 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: isOpen ? '400ms' : '0ms' }}
          >
            <button
              onClick={() => navigateTo('/#calculator')}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-amber-400/15"
            >
              <Zap className="w-4 h-4" />
              Analyse My Bill
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigateTo('/book-survey')}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-black font-bold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-green-400/15 mt-3"
            >
              <CalendarCheck className="w-4 h-4" />
              Book Free Survey
              <ArrowRight className="w-4 h-4" />
            </button>

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

          {/* Trust badges */}
          <div
            className={`px-4 pb-6 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: isOpen ? '550ms' : '0ms' }}
          >
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <div className="grid grid-cols-4 gap-2">
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
                  <p className="text-[10px] font-semibold text-gray-400">€1,800 Grant (ROI)</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center mx-auto mb-1.5">
                    <CalendarCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-400">Free Survey</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-600 ${s.color} transition-all active:scale-90`}
                  aria-label={s.label}
                >
                  {s.label === 'Facebook' && (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  )}
                  {s.label === 'Instagram' && (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  )}
                  {s.label === 'TikTok' && (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                  )}
                  {s.label === 'LinkedIn' && (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  )}
                </a>
              ))}
            </div>

            <p className="text-[10px] text-gray-700 text-center mt-4">
              © {new Date().getFullYear()} Solar Ireland · SEAI Registered Installer
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const activeSection = useActiveSection();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigateTo = (href: string) => {
    if (href.startsWith('/') && !href.startsWith('/#')) {
      window.location.href = href;
    } else if (href.startsWith('/#')) {
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
        role="banner"
        aria-label="Site navigation"
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled
            ? 'bg-black/95 border-b border-white/[0.06] shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              if (pathname !== '/') {
                window.location.href = '/';
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 shrink-0 active:scale-95 transition-transform"
          >
            <Image
              src="/logo-sm.webp"
              alt="Solar Ireland"
              className="h-10 w-auto sm:h-11"
              width={44}
              height={44}
              priority
            />
            <span className="font-bold text-white hidden sm:inline text-base lg:text-lg tracking-wide">
              Solar Ireland
            </span>
          </button>

          {/* Desktop nav — 7 links */}
          <div className="hidden lg:flex items-center gap-5">
            {desktopNavLinks.map((link) => {
              const isActive = link.href.startsWith('/') && !link.href.startsWith('/#')
                ? (pathname === link.href || pathname.startsWith(link.href + '/'))
                : activeSection === link.href.replace('/#', '').replace('#', '');
              return (
                <button
                  key={link.href}
                  onClick={() => navigateTo(link.href)}
                  className={`text-xs font-medium uppercase tracking-wider transition-colors relative py-1 whitespace-nowrap ${
                    link.isBookSurvey
                      ? 'text-green-400 font-semibold'
                      : link.href === '/portal'
                      ? 'text-sky-400 font-semibold'
                      : isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && !link.isBookSurvey && link.href !== '/portal' && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-amber-400 transition-all duration-300" />
                  )}
                  {link.isBookSurvey && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-green-400/60 transition-all duration-300" />
                  )}
                  {link.href === '/portal' && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-sky-400/60 transition-all duration-300" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigateTo('/#calculator')}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs px-5 py-2 rounded-full uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20 whitespace-nowrap"
            >
              Analyse Bill
            </button>
            <button
              onClick={() => navigateTo('/book-survey')}
              className="bg-green-400 hover:bg-green-300 text-black font-bold text-xs px-5 py-2 rounded-full uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-green-400/10 hover:shadow-green-400/20 whitespace-nowrap"
            >
              Book Free Survey
            </button>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-white hover:bg-white/[0.08] transition-colors active:scale-90"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <HamburgerIcon isOpen={isOpen} />
          </button>
        </div>
      </nav>

      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activeSection={activeSection}
        pathname={pathname}
      />
    </>
  );
}
