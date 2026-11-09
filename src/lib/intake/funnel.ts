'use client';

/**
 * The call funnel, one event per step, so Cal can see where clicks die.
 *
 * Every step fires the same event name, `funnel_step`, with `step` set to one
 * of FUNNEL_STEPS. In GA4 that is one exploration (event name funnel_step,
 * broken down by step); in PostHog one funnel on funnel_step filtered by step.
 * `door` says which door it came through (analyser, intake, book-survey).
 *
 * Uses only what the site already loads: the gtag() the layout defines for
 * GA4 (NEXT_PUBLIC_GA_ID) and the posthog-js instance PostHogProvider starts.
 * Consent-gated on the same cookie choice as lib/analytics.ts: nothing fires
 * until the visitor has said yes to analytics.
 *
 * It calls the page's own window.gtag directly (lib/analytics now does the
 * same, since its old plain-array push never reached GA4).
 *
 * Never personal data: no name, mobile, email, Eircode or bill figures.
 */
import posthog from 'posthog-js';

export const FUNNEL_STEPS = [
  'analyser_viewed',
  'upload_started',
  'read_ok',
  'read_fail',
  'ask_shown',
  'submit_ok',
  'submit_error',
] as const;
export type FunnelStep = (typeof FUNNEL_STEPS)[number];

type Props = Record<string, string | number | boolean | null | undefined>;

const CONSENT_KEY = 'solar-ireland-cookie-consent';

function consented(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return !!raw && JSON.parse(raw)?.categories?.analytics === true;
  } catch {
    return false;
  }
}

/** For tests and the DOM self-test: the last steps fired on this page. */
const RECENT_MAX = 30;

export function funnel(step: FunnelStep, props: Props = {}): void {
  if (typeof window === 'undefined') return;
  const payload: Props = { step, page: window.location.pathname, ...props };
  try {
    const w = window as unknown as { __siFunnel?: Props[]; gtag?: (...a: unknown[]) => void };
    w.__siFunnel = [...(w.__siFunnel ?? []), payload].slice(-RECENT_MAX);
    if (!consented()) return;
    if (typeof w.gtag === 'function') w.gtag('event', 'funnel_step', payload);
    const ph = posthog as unknown as { __loaded?: boolean; capture?: (e: string, p: Props) => void };
    if (ph && ph.__loaded && typeof ph.capture === 'function') ph.capture('funnel_step', payload);
  } catch {
    /* measurement never breaks the funnel */
  }
}
