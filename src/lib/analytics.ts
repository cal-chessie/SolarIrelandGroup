/**
 * Analytics — Solar Ireland
 *
 * Unified event tracking layer for Google Analytics 4 and PostHog.
 * All analytics calls are consent-gated — events only fire when the user
 * has opted into the "analytics" cookie category.
 *
 * Usage:
 *   import { trackEvent, trackPageView } from '@/lib/analytics';
 *   trackEvent('whatsapp_click', { source: 'navbar' });
 */

/* ------------------------------------------------------------------ */
/*  Cookie consent check                                              */
/* ------------------------------------------------------------------ */

const CONSENT_KEY = 'solar-ireland-cookie-consent';

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data?.categories?.analytics === true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Google Analytics 4 helpers                                        */
/* ------------------------------------------------------------------ */

function getGaId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_ID;
}

function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(args);
}

function gaEnabled(): boolean {
  return !!getGaId();
}

/* ------------------------------------------------------------------ */
/*  PostHog helpers                                                   */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPostHog(): any {
  if (typeof window === 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ph = (window as any).posthog;
    return ph ?? null;
  } catch {
    return null;
  }
}

function posthogEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_POSTHOG_KEY && !!process.env.NEXT_PUBLIC_POSTHOG_HOST;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export interface TrackEventParams {
  /** Event name — use snake_case, e.g. "whatsapp_click" */
  event: string;
  /** Additional properties to send with the event */
  properties?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Track a custom analytics event.
 * Fires to both GA4 and PostHog (if configured and consent given).
 */
export function trackEvent({ event, properties = {} }: TrackEventParams): void {
  if (!hasAnalyticsConsent()) return;

  // GA4
  if (gaEnabled()) {
    gtag('event', event, properties);
  }

  // PostHog
  if (posthogEnabled()) {
    try {
      const ph = getPostHog();
      ph?.capture(event, properties);
    } catch {
      // silent
    }
  }
}

/**
 * Track a page view (useful for SPA navigations in Next.js App Router).
 * GA4 handles most page views via the config script in layout.tsx,
 * but PostHog benefits from explicit pageview calls.
 */
export function trackPageView(path: string): void {
  if (!hasAnalyticsConsent()) return;

  if (gaEnabled()) {
    gtag('config', getGaId(), {
      page_path: path,
    });
  }

  if (posthogEnabled()) {
    try {
      const ph = getPostHog();
      ph?.capture('$pageview', { $current_url: path });
    } catch {
      // silent
    }
  }
}

/**
 * Identify a user across analytics providers.
 * Call this when a user logs in or completes a form with their email.
 */
export function identifyUser(
  distinctId: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (!hasAnalyticsConsent()) return;

  if (gaEnabled()) {
    gtag('set', 'user_id', distinctId);
  }

  if (posthogEnabled()) {
    try {
      const ph = getPostHog();
      ph?.identify(distinctId, properties);
    } catch {
      // silent
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Preset event helpers                                              */
/* ------------------------------------------------------------------ */

/** WhatsApp click — call from every WhatsApp CTA */
export function trackWhatsAppClick(source: string): void {
  trackEvent({
    event: 'whatsapp_click',
    properties: { source, page: window.location.pathname },
  });
}

/** Phone number click */
export function trackPhoneClick(source: string): void {
  trackEvent({
    event: 'phone_click',
    properties: { source, page: window.location.pathname },
  });
}

/** Email click */
export function trackEmailClick(source: string): void {
  trackEvent({
    event: 'email_click',
    properties: { source, page: window.location.pathname },
  });
}

/** Contact form submission */
export function trackContactFormSubmit(): void {
  trackEvent({
    event: 'contact_form_submit',
    properties: { page: window.location.pathname },
  });
}

/** Survey booking submission */
export function trackSurveyBooking(): void {
  trackEvent({
    event: 'survey_booking_submit',
    properties: { page: window.location.pathname },
  });
}

/** Bill analyser usage */
export function trackBillAnalyserUsage(mode: 'upload' | 'manual'): void {
  trackEvent({
    event: 'bill_analyser_used',
    properties: { mode, page: window.location.pathname },
  });
}

/** Calculator interaction */
export function trackCalculatorUsage(): void {
  trackEvent({
    event: 'savings_calculator_used',
    properties: { page: window.location.pathname },
  });
}

/** Newsletter signup */
export function trackNewsletterSignup(source: string): void {
  trackEvent({
    event: 'newsletter_signup',
    properties: { source, page: window.location.pathname },
  });
}

/** Exit intent trigger */
export function trackExitIntent(action: string): void {
  trackEvent({
    event: 'exit_intent',
    properties: { action, page: window.location.pathname },
  });
}

/** Cookie consent decision */
export function trackConsentDecision(
  analyticsAccepted: boolean,
  marketingAccepted: boolean
): void {
  // Consent events fire even without analytics consent (they ARE the consent)
  // so we fire them unconditionally to GA4/PostHog if the scripts are loaded.
  // But we only fire if the user ACCEPTED analytics (chicken-and-egg).
  // Solution: always fire via gtag (which is loaded regardless), PostHog only if analytics accepted.
  if (gaEnabled()) {
    gtag('event', 'cookie_consent_decision', {
      analytics: analyticsAccepted,
      marketing: marketingAccepted,
    });
  }
  if (posthogEnabled() && analyticsAccepted) {
    try {
      const ph = getPostHog();
      ph?.capture('cookie_consent_decision', {
        analytics: analyticsAccepted,
        marketing: marketingAccepted,
      });
    } catch {
      // silent
    }
  }
}
