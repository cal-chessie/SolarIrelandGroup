'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  MessageCircle,
  Zap,
  ArrowRight,
  LayoutDashboard,
  Users,
  Sun,
  Shield,
  Phone,
  Clock,
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ═══════════════════════════════════════════════════════════════
   EXIT INTENT — Smart last-chance popup
   ─────────────────────────────────────────────────────────────
   Triggers once per SESSION when the mouse exits the viewport
   top edge (classic exit intent signal). Uses sessionStorage
   so it reappears on new visits but not page reloads.
   ═══════════════════════════════════════════════════════════════ */

const SESSION_KEY = 'solar-ireland-exit-intent-seen';

export default function ExitIntent() {
  const [show, setShow] = useState(false);
  const hasTriggered = useRef(false);
  const isMobile = useRef(false);

  /* ─── Detect exit intent (mouse leaving viewport top) ─── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (hasTriggered.current) return;
    // Only trigger if mouse moves above the viewport quickly
    if (e.clientY <= 0 && e.movementY < 0) {
      hasTriggered.current = true;
      // Small delay so it feels natural, not jarring
      setTimeout(() => setShow(true), 400);
    }
  }, []);

  /* ─── Detect mobile back button / tab switch ─── */
  const handleVisibilityChange = useCallback(() => {
    if (
      !hasTriggered.current &&
      document.visibilityState === 'hidden' &&
      isMobile.current
    ) {
      hasTriggered.current = true;
      // Show when they come back
      const handler = () => {
        setShow(true);
        document.removeEventListener('visibilitychange', handler);
      };
      setTimeout(handler, 500);
    }
  }, []);

  useEffect(() => {
    // Skip if already seen this session
    if (sessionStorage.getItem(SESSION_KEY)) {
      hasTriggered.current = true;
      return;
    }

    isMobile.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Desktop: mouse leave detection
    if (!isMobile.current) {
      document.addEventListener('mouseout', handleMouseMove);
    }

    // Mobile: tab switch / back button
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mouseout', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleMouseMove, handleVisibilityChange]);

  /* ─── Close handler — mark as seen in sessionStorage ─── */
  const close = useCallback(() => {
    setShow(false);
    sessionStorage.setItem(SESSION_KEY, '1');
  }, []);

  /* ─── CTA click handler — close + open WhatsApp ─── */
  const handleCTA = useCallback(() => {
    close();
  }, [close]);

  if (!show) return null;

  const whatsappUrl = buildWhatsAppUrl({
    source: 'exit-intent',
    customMessage:
      "Hi Solar Ireland! I was checking out your site and I'm interested in solar panels. I'd love to learn about your project portal and get a free survey.",
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Special offer before you leave"
    >
      {/* Backdrop — fade in */}
      <div
        className="exit-intent-backdrop absolute inset-0 bg-black/60"
        onClick={close}
      />

      {/* Card — slide up from below */}
      <div className="exit-intent-card relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-[#111111] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden">
        {/* ─── Top accent bar ─── */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

        {/* ─── Close button ─── */}
        <button
          onClick={close}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-colors duration-200"
          aria-label="Close popup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          {/* ─── Header ─── */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/[0.08] border border-amber-400/[0.12] mb-4">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.12em]">
                Before You Go
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-2">
              Your solar journey starts with a{' '}
              <span className="text-gradient">free 5-minute chat</span>
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              No pressure, no jargon. Tell us about your home and we&apos;ll give
              you an honest answer on whether solar makes sense for you.
            </p>
          </div>

          {/* ─── Feature Cards ─── */}
          <div className="space-y-3 mb-6">
            {/* Project Portal */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-9 h-9 rounded-lg bg-amber-400/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-0.5">
                  Track Your Project in Real Time
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your personal project portal lets you follow every step — from
                  survey to installation to commissioning. Always know exactly
                  where things stand.
                </p>
              </div>
            </div>

            {/* Team Chat */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-9 h-9 rounded-lg bg-green-400/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-0.5">
                  Talk Directly With the Team
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  No call centres. Chat directly with your dedicated project
                  manager and installation team — real people who know your roof.
                </p>
              </div>
            </div>

            {/* Quick highlights */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: Shield, label: 'SEAI Registered' },
                { icon: Clock, label: '1-Day Install' },
                { icon: Phone, label: 'Free Survey' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg bg-white/[0.015] border border-white/[0.04]"
                >
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[9px] text-gray-500 text-center leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── CTA Buttons ─── */}
          <div className="space-y-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCTA}
              className="flex items-center justify-center gap-2.5 w-full px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              Chat With Us Now
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="flex gap-2.5">
              <a
                href="#calculator"
                onClick={handleCTA}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Quick Calculator
              </a>
              <button
                onClick={close}
                className="px-5 py-3.5 rounded-xl text-sm text-gray-600 hover:text-gray-400 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>

          {/* ─── Trust line ─── */}
          <p className="text-center text-[10px] text-gray-600 mt-4">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3 h-3" />
              SEAI Registered · RECI Certified · No spam, ever
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
