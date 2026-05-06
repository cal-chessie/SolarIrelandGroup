'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

/**
 * PostHog Provider — Solar Ireland
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

    function initPostHog(): void {
      if (initialized) return;
      initialized = true;

      posthog.init(phKey, {
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
        // Disable by default — will be enabled when consent is given
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
              // No consent yet — opt out until user decides
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
        initPostHog();
        // Re-enable capturing if it was opted out
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
    }

    // Check if consent already exists
    try {
      const raw = localStorage.getItem('solar-ireland-cookie-consent');
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.categories?.analytics) {
          initPostHog();
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
