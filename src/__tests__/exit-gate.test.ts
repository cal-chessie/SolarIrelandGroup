/** The exit quiz's timing rules (Cal, 9 Nov: never over a form someone is filling). */
import { describe, expect, it } from 'vitest';
import { exitBlocked, exitMayOpen, WEEK_MS, type ExitState } from '@/lib/intake/exitGate';

const T0 = 1_000_000_000_000;
const base = (o: Partial<ExitState> = {}): ExitState => ({
  path: '/', now: T0 + 60_000, siteStart: T0, fieldFocused: false, typed: false, analyserStarted: false, analyserActive: false,
  intakeOpen: false, chatOpen: false, leadSent: false, shownAt: null, dismissed: false, seenThisSession: false, ...o,
});
const exit = { kind: 'exit-intent' } as const;

describe('exit quiz gate', () => {
  it('desktop: exit intent after 20 seconds on the site, nothing else', () => {
    expect(exitMayOpen(base(), exit, false)).toBe(true);
    expect(exitMayOpen(base({ now: T0 + 19_000 }), exit, false)).toBe(false);
    expect(exitMayOpen(base(), { kind: 'scroll-depth', depth: 0.9 }, false)).toBe(false);
    expect(exitMayOpen(base(), { kind: 'fast-up' }, false)).toBe(false);
  });
  it('phone: 45 seconds and half the page, or a fast scroll up after 20 seconds', () => {
    expect(exitMayOpen(base({ now: T0 + 46_000 }), { kind: 'scroll-depth', depth: 0.5 }, true)).toBe(true);
    expect(exitMayOpen(base({ now: T0 + 40_000 }), { kind: 'scroll-depth', depth: 0.8 }, true)).toBe(false);
    expect(exitMayOpen(base({ now: T0 + 60_000 }), { kind: 'scroll-depth', depth: 0.4 }, true)).toBe(false);
    expect(exitMayOpen(base({ now: T0 + 21_000 }), { kind: 'fast-up' }, true)).toBe(true);
    expect(exitMayOpen(base(), exit, true)).toBe(false);
  });
  it('never over a field with focus, or once anything was typed this session', () => {
    expect(exitBlocked(base({ fieldFocused: true }))).toBe('field_focused');
    expect(exitBlocked(base({ typed: true }))).toBe('typed');
  });
  it('never on /estimate, /book-survey, the portal or admin', () => {
    for (const path of ['/estimate', '/book-survey', '/portal/abc', '/admin']) expect(exitBlocked(base({ path }))).toBe('path');
    expect(exitBlocked(base({ path: '/services' }))).toBeNull();
  });
  it('never after the analyser started, while the intake or chat is open, or after a lead', () => {
    expect(exitBlocked(base({ analyserStarted: true }))).toBe('analyser');
    expect(exitBlocked(base({ analyserActive: true }))).toBe('analyser');
    expect(exitBlocked(base({ intakeOpen: true }))).toBe('intake_open');
    expect(exitBlocked(base({ chatOpen: true }))).toBe('chat_open');
    expect(exitBlocked(base({ leadSent: true }))).toBe('lead_sent');
  });
  it('once a week, and dismissed means gone', () => {
    expect(exitBlocked(base({ shownAt: T0 - WEEK_MS + 120_000 }))).toBe('shown_this_week');
    expect(exitBlocked(base({ shownAt: T0 - WEEK_MS - 1 }))).toBeNull();
    expect(exitBlocked(base({ dismissed: true, shownAt: T0 - 30 * WEEK_MS }))).toBe('dismissed');
  });
});
