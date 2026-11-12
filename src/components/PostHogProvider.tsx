'use client';

import { useEffect } from 'react';
import type { PostHog } from 'posthog-js';
import { scrubPostHogEvent } from '@/lib/privacyUrl';

/**
 * PostHog Provider - Solar Ireland
 *
 * Initializes PostHog on the client side, gated on cookie consent.
 * This component listens for the 'cookie-consent-update' custom event
 * and only initializes PostHog when analytics consent is granted.
 *
 * Place in layout.tsx: <PostHogProvider />
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export default function PostHogProvider() {
  useEffect(() => {
    // Don't init if env vars are missing
    if (!POSTHOG_KEY || !POSTHOG_HOST) return;

    const phKey = POSTHOG_KEY;
    const phHost = POSTHOG_HOST;

    let initialized = false;
    // posthog-js (about 190 KB) loads on demand, only once analytics consent
    // exists, so it no longer sits in the first-load bundle of every page.
    let posthog: PostHog | null = null;
    let pending: Promise<PostHog> | null = null;
    function loadPostHog(): Promise<PostHog> {
      if (!pending) {
        pending = import('posthog-js').then((m) => {
          posthog = m.default;
          (window as unknown as { posthog?: PostHog }).posthog = m.default;
          return m.default;
        });
      }
      return pending;
    }

    async function initPostHog(): Promise<void> {
      if (initialized) return;
      initialized = true;
      const ph0 = await loadPostHog();

      ph0.init(phKey, {
        api_host: phHost,
        // Disable session recording by default (enable via PostHog dashboard)
        disable_session_recording: false,
        // Respect Do Not Track
        respect_dnt: true,
        // Rate limiting
        rate_limiting: {
          events_per_second: 10,
          events_burst_limit: 20,
        },
        // Auto-capture: pageviews, clicks, form submissions
        capture_pageview: false, // We handle this manually in analytics.ts
        capture_pageleave: true,
        // A magic link (?lt=) is a homeowner's key: strip it from every URL PostHog records (M6).
        before_send: (event) => scrubPostHogEvent(event),
        // Disable by default - will be enabled when consent is given
        loaded: (ph) => {
          // Check consent state on load
          try {
            const raw = localStorage.getItem('solar-ireland-cookie-consent');
            if (raw) {
              const data = JSON.parse(raw);
              if (!data?.categories?.analytics) {
                ph.opt_out_capturing();
              }
            } else {
              // No consent yet - opt out until user decides
              ph.opt_out_capturing();
            }
          } catch {
            ph.opt_out_capturing();
          }
        },
      });
    }

    function handleConsentUpdate(e: Event): void {
      const consent = (e as CustomEvent).detail;
      if (consent?.categories?.analytics) {
        // Re-enable capturing if it was opted out
        void initPostHog().then(() => posthog?.opt_in_capturing());
      } else {
        posthog?.opt_out_capturing();
      }
    }

    // Check if consent already exists
    try {
      const raw = localStorage.getItem('solar-ireland-cookie-consent');
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.categories?.analytics) {
          void initPostHog();
        }
      }
    } catch {
      // silent
    }

    // Listen for consent changes
    window.addEventListener('cookie-consent-update', handleConsentUpdate);

    return () => {
      window.removeEventListener('cookie-consent-update', handleConsentUpdate);
    };
  }, []);

  return null;
}
