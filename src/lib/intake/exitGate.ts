/**
 * When the exit quiz may open (Cal, 9 Nov: "it jumps up at the worst times
 * like filling out a form already"). Pure, so the rules are tested, not hoped.
 *
 * Never:
 *  - while an input, textarea or select has focus, or once anything has been
 *    typed on the site this session;
 *  - on /estimate, /book-survey, the portal or admin;
 *  - after the Bill Analyser has started, or while the intake is open, or
 *    over an open chat;
 *  - after a lead was sent from this device;
 *  - within 7 days of the last time it was shown; ever again once dismissed.
 * Desktop: exit intent only, after 20 seconds on the site.
 * Phone: after 45 seconds and half the page scrolled, or a fast scroll up
 * (after 20 seconds).
 */
export const EXIT_KEYS = {
  siteStart: 'si_site_t0',
  typed: 'si_typed',
  analyserStarted: 'si_analyser_started',
  shownAt: 'si_exit_shown_at',
  dismissed: 'si_exit_dismissed',
  leadSent: 'si_lead_sent',
  callMemory: 'si_call_requested',
  legacySeen: 'solar-ireland-exit-seen',
} as const;

export const BLOCKED_PATHS = ['/estimate', '/book-survey', '/portal', '/admin'];
export const WEEK_MS = 7 * 86400000;
export const DESKTOP_MIN_MS = 20_000;
export const PHONE_MIN_MS = 45_000;
export const FAST_UP_MIN_MS = 20_000;

export interface ExitState {
  path: string;
  now: number;
  siteStart: number;
  fieldFocused: boolean;
  typed: boolean;
  analyserStarted: boolean;
  analyserActive: boolean;
  intakeOpen: boolean;
  chatOpen: boolean;
  leadSent: boolean;
  shownAt: number | null;
  dismissed: boolean;
  seenThisSession: boolean;
}

export type ExitTrigger = { kind: 'exit-intent' } | { kind: 'scroll-depth'; depth: number } | { kind: 'fast-up' };

/** Why it may not open, or null when it may. */
export function exitBlocked(s: ExitState): string | null {
  if (BLOCKED_PATHS.some((p) => s.path === p || s.path.startsWith(p + '/'))) return 'path';
  if (s.dismissed) return 'dismissed';
  if (s.shownAt !== null && s.now - s.shownAt < WEEK_MS) return 'shown_this_week';
  if (s.seenThisSession) return 'seen_this_session';
  if (s.leadSent) return 'lead_sent';
  if (s.fieldFocused) return 'field_focused';
  if (s.typed) return 'typed';
  if (s.analyserStarted || s.analyserActive) return 'analyser';
  if (s.intakeOpen) return 'intake_open';
  if (s.chatOpen) return 'chat_open';
  return null;
}

export function exitMayOpen(s: ExitState, t: ExitTrigger, phone: boolean): boolean {
  if (exitBlocked(s)) return false;
  const onSite = s.now - s.siteStart;
  if (!phone) return t.kind === 'exit-intent' && onSite >= DESKTOP_MIN_MS;
  if (t.kind === 'scroll-depth') return onSite >= PHONE_MIN_MS && t.depth >= 0.5;
  if (t.kind === 'fast-up') return onSite >= FAST_UP_MIN_MS;
  return false;
}

/** Read the state from this browser. */
export function readExitState(): ExitState {
  const ls = (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };
  const ss = (k: string) => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  };
  const now = Date.now();
  let siteStart = Number(ss(EXIT_KEYS.siteStart));
  if (!Number.isFinite(siteStart) || siteStart <= 0) {
    siteStart = now;
    try {
      sessionStorage.setItem(EXIT_KEYS.siteStart, String(now));
    } catch {
      /* private mode */
    }
  }
  const a = document.activeElement;
  const shown = Number(ls(EXIT_KEYS.shownAt));
  let callAt = 0;
  try {
    callAt = Number(JSON.parse(ls(EXIT_KEYS.callMemory) || 'null')?.at) || 0;
  } catch {
    callAt = 0;
  }
  return {
    path: window.location.pathname,
    now,
    siteStart,
    fieldFocused: !!a && a.matches('input, textarea, select, [contenteditable="true"]'),
    typed: ss(EXIT_KEYS.typed) === '1',
    analyserStarted: ss(EXIT_KEYS.analyserStarted) === '1',
    analyserActive: document.body.dataset.analyserActive === '1',
    intakeOpen: document.body.dataset.intakeOpen === '1' || !!document.querySelector('.si-intake'),
    chatOpen: document.body.dataset.sigChatOpen === '1',
    leadSent: ls(EXIT_KEYS.leadSent) === '1' || (callAt > 0 && now - callAt < 30 * 86400000),
    shownAt: Number.isFinite(shown) && shown > 0 ? shown : null,
    dismissed: ls(EXIT_KEYS.dismissed) === '1',
    seenThisSession: ss(EXIT_KEYS.legacySeen) === '1',
  };
}
