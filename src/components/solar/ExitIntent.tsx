'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import X from 'lucide-react/dist/esm/icons/x.js';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle.js';
import Zap from 'lucide-react/dist/esm/icons/zap.js';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right.js';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard.js';
import Users from 'lucide-react/dist/esm/icons/users.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import Clock from 'lucide-react/dist/esm/icons/clock.js';
import Star from 'lucide-react/dist/esm/icons/star.js';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up.js';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';


const SESSION_KEY = 'solar-ireland-exit-seen';
const PAGE_VISITS_KEY = 'solar-ireland-page-visits';
const MIN_TIME_ON_PAGE_MS = 30_000;


export default function ExitIntent() {
  const [show, setShow] = useState(false);
  const hasTriggered = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const pageLoadTimeRef = useRef(0);


  const trigger = useCallback(() => {
    if (hasTriggered.current) return;
    const pageVisits = parseInt(sessionStorage.getItem(PAGE_VISITS_KEY) || '0', 10);
    const timeOnPage = Date.now() - pageLoadTimeRef.current;
    if (pageVisits < 2 && timeOnPage < MIN_TIME_ON_PAGE_MS) return;
    hasTriggered.current = true;
    setTimeout(() => setShow(true), 350);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Increment page visit counter for this session
    const visits = parseInt(sessionStorage.getItem(PAGE_VISITS_KEY) || '0', 10) + 1;
    sessionStorage.setItem(PAGE_VISITS_KEY, visits.toString());

    // Record when this page loaded
    pageLoadTimeRef.current = Date.now();

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0) trigger();
    };
    document.documentElement.addEventListener('mouseleave', onMouseLeave);

    let tabHidden = false;
    const onVisChange = () => {
      if (document.visibilityState === 'hidden') {
        tabHidden = true;
      } else if (tabHidden) {
        tabHidden = false;
        trigger();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    let maxScroll = 0;
    let scrollTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      const st = window.scrollY;
      if (st > maxScroll) maxScroll = st;
      if (maxScroll > 400 && st < 100) {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          maxScroll = 0;
          trigger();
        }, 300);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const idleTimer = setTimeout(trigger, MIN_TIME_ON_PAGE_MS);

    return () => {
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimer);
      clearTimeout(idleTimer);
    };
  }, [trigger]);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  const close = useCallback(() => {
    setShow(false);
    sessionStorage.setItem(SESSION_KEY, '1');
  }, []);

  const handleCTA = useCallback(() => {
    close();
  }, [close]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [show, close]);

  if (!show) return null;

  const whatsappUrl = buildWhatsAppUrl({
    source: 'exit-intent',
    customMessage:
      "Hi Solar Ireland! I was on your site and I'm really interested in solar panels. I'd love to hear about the project portal and get a free roof survey.",
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Special offer before you leave"
    >
      <div className="exit-intent-backdrop absolute inset-0 bg-black/60" onClick={close} />

      <div
        ref={cardRef}
        className="exit-intent-card relative w-full max-w-[480px] rounded-2xl bg-[#0e0e0e] border border-white/[0.06] shadow-2xl shadow-black/60 overflow-hidden"
      >
        <div className="relative h-1 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
          <div className="exit-intent-shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        <div className="flex items-center justify-between px-6 pt-5 pb-1 sm:px-8">
          <div className="exit-intent-el exit-intent-el-0 flex items-center gap-3">
            <Image
              src="/logo-sm.webp"
              alt="Solar Ireland"
              width={120}
              height={36}
              className="h-9 sm:h-10 w-auto opacity-90"
            />
            <span className="font-bold text-white text-base tracking-wide opacity-90">
              Solar Ireland
            </span>
          </div>
          <button
            onClick={close}
            className="exit-intent-el exit-intent-el-0 w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-amber-400/[0.03] rounded-full blur-[80px] pointer-events-none" />

        <div className="relative p-6 sm:p-8 pt-4">
          <div className="exit-intent-el exit-intent-el-1 flex items-center gap-2 mb-5 px-3 py-2 rounded-full bg-green-500/[0.06] border border-green-500/[0.1] w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-[11px] text-green-400/90 font-medium">
              SEAI-registered installer — trusted by 200+ Irish homeowners
            </span>
          </div>

          <div className="exit-intent-el exit-intent-el-2 mb-6">
            <h3 className="text-2xl sm:text-[28px] font-bold text-white leading-[1.15] mb-2.5 tracking-tight">
              Wait — don&apos;t leave{' '}
              <span className="text-gradient">€1,800</span>
              <br />
              <span className="text-gradient">on the table (ROI)</span>
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              The SEAI grant (Republic of Ireland only) drops this into your account. Combined with savings of
              {' '}<span className="text-gray-400 font-medium">€1,100+/year</span>,
              your system literally pays for itself.
            </p>
          </div>

          <div className="space-y-2.5 mb-6">
            <div className="exit-intent-el exit-intent-el-3 group flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05] hover:bg-white/[0.025] hover:border-white/[0.08] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/10 to-amber-500/[0.05] border border-amber-400/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <LayoutDashboard className="w-[18px] h-[18px] text-amber-400" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-white mb-0.5">
                  Track Your Project in Real Time
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your personal portal shows every milestone — survey, design, install,
                  commissioning. You&apos;re never left wondering what&apos;s happening.
                </p>
              </div>
            </div>

            <div className="exit-intent-el exit-intent-el-4 group flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05] hover:bg-white/[0.025] hover:border-white/[0.08] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400/10 to-green-500/[0.05] border border-green-400/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-[18px] h-[18px] text-green-400" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-white mb-0.5">
                  Talk Directly With the Team
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Message your project manager and installers directly. No call centres,
                  no tickets — just real people who know your name and your roof.
                </p>
              </div>
            </div>
          </div>

          <div className="exit-intent-el exit-intent-el-5 flex items-center gap-2 mb-6 flex-wrap">
            {[
              { icon: Shield, label: 'SEAI Registered', color: 'text-green-400/70' },
              { icon: Clock, label: '1-Day Install', color: 'text-amber-400/70' },
              { icon: Star, label: '4.9★ Rated', color: 'text-yellow-400/70' },
              { icon: TrendingUp, label: '€38k+ 25yr Savings', color: 'text-sky-400/70' },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                <Icon className={`w-3 h-3 ${color}`} />
                <span className="text-[10px] text-gray-500 font-medium">{label}</span>
              </div>
            ))}
          </div>

          <div className="exit-intent-el exit-intent-el-6 flex items-center justify-center gap-1.5 mb-4">
            <Clock className="w-3 h-3 text-amber-400/60" />
            <span className="text-[11px] text-gray-500">
              Limited availability this month
            </span>
          </div>

          <div className="exit-intent-el exit-intent-el-7">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCTA}
              className="exit-intent-cta flex items-center justify-center gap-2.5 w-full px-6 py-[15px] rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-[15px] shadow-lg shadow-green-500/25 hover:shadow-green-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 relative overflow-hidden"
            >
              <span className="absolute inset-0 exit-intent-cta-shimmer" />
              <MessageCircle className="w-[18px] h-[18px] relative z-10" />
              <span className="relative z-10">Get Your Free Survey</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </a>
          </div>

          <div className="exit-intent-el exit-intent-el-8 flex items-center gap-2.5 mt-3">
            <a
              href="#calculator"
              onClick={handleCTA}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[13px]">Quick Calculator</span>
            </a>
            <button
              onClick={close}
              className="px-5 py-3 rounded-xl text-[13px] text-gray-500 border border-white/[0.08] hover:text-gray-300 hover:border-white/[0.15] transition-all duration-200"
            >
              Maybe later
            </button>
          </div>

          <div className="exit-intent-el exit-intent-el-9 flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/[0.04]">
            <span className="flex items-center gap-1 text-[10px] text-gray-600">
              <Shield className="w-3 h-3" />
              {SOLAR_DATA.certifications[0]}
            </span>
            <span className="text-gray-800">·</span>
            <span className="text-[10px] text-gray-600">
              {SOLAR_DATA.certifications[1]}
            </span>
            <span className="text-gray-800">·</span>
            <span className="text-[10px] text-gray-600">No spam</span>
          </div>
        </div>
      </div>
    </div>
  );
}
