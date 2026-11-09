/**
 * Keep the homeowner's keys out of analytics (M6, 9 Nov review).
 *
 * A magic link (?lt=) opens a homeowner's own details, so it must never reach
 * GA4, PostHog, a Referer or the address bar's history. These strip the known
 * key parameters and leave everything else (utm_*, src) for attribution.
 *
 * Pure: shared by /book-survey, the PostHog before_send hook and the tests.
 * layout.tsx carries the same list inline for the GA4 config (SENSITIVE_PARAMS).
 */
export const SENSITIVE_PARAMS = ['lt', 'token', 'access_token', 'booking_token'] as const;

/** The URL without its key parameters. Anything that does not parse comes back unchanged. */
export function stripSensitiveParams(href: string): string {
  if (typeof href !== 'string' || !href.includes('?')) return href;
  try {
    const abs = /^[a-z][a-z0-9+.-]*:/i.test(href);
    const u = new URL(href, 'https://solarirelandgroup.ie');
    let changed = false;
    for (const k of SENSITIVE_PARAMS) {
      if (u.searchParams.has(k)) {
        u.searchParams.delete(k);
        changed = true;
      }
    }
    if (!changed) return href;
    const qs = u.searchParams.toString();
    const rest = `${u.pathname}${qs ? `?${qs}` : ''}${u.hash}`;
    return abs ? `${u.origin}${rest}` : rest;
  } catch {
    return href;
  }
}

type Bag = Record<string, unknown> | undefined | null;

function scrubBag(bag: Bag): void {
  if (!bag || typeof bag !== 'object') return;
  for (const [k, v] of Object.entries(bag)) {
    if (typeof v === 'string' && v.includes('?') && SENSITIVE_PARAMS.some((p) => v.includes(`${p}=`))) bag[k] = stripSensitiveParams(v);
  }
}

/** PostHog before_send: every URL-shaped property (current URL, referrer, initial URL, $set) loses its keys. */
export function scrubPostHogEvent<T extends { properties?: Bag; $set?: Bag; $set_once?: Bag } | null>(event: T): T {
  if (!event) return event;
  scrubBag(event.properties);
  scrubBag(event.$set);
  scrubBag(event.$set_once);
  const props = event.properties as Record<string, Bag> | undefined;
  if (props) {
    scrubBag(props.$set);
    scrubBag(props.$set_once);
  }
  return event;
}
