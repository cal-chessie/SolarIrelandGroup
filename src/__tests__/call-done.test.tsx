/**
 * The ask and the confirmation every road ends in. Cal, 17 Nov 2026: "they
 * can get the full estimate sent to their email, and let the other 3 points
 * stand with them." Every state leads with the estimate by email, and each
 * one may only say what actually happens.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { askCopy, askHeadline, CallAsk, CallDone, callDoneCopy, type CallContext } from '@/components/intake/CallAsk';

const details = { name: 'Mary Byrne', mobile: '087 123 4567', email: 'mary@example.ie', bestTime: null };
const CALL_FIRST = /^(?:thanks[^.]*\.\s*)?(?:saved\.\s*)?(?:a member of our team|our team|we)?\s*(?:will\s+|'ll\s+)?(?:give you a quick )?ring/i;

afterEach(() => {
  cleanup();
  try {
    window.localStorage.clear();
  } catch {
    /* no storage */
  }
});

const ctxOf = (quoteToken: string | null): CallContext => ({
  segment: 'domestic',
  door: 'intake',
  src: null,
  pkg: null,
  countyContext: null,
  flowId: 'test-flow',
  monthlyBill: 150,
  annualKwh: null,
  billPeriod: 'month',
  supplier: null,
  quoteToken,
  billRead: null,
  carry: null,
});

/**
 * The four states screen 2 can be in: a priced quote (AISolar emails the
 * estimate and its PDF), a rough local estimate (the quote service did not
 * answer), no quote reachable at all, and a held submit (the quote went, but
 * AISolar did not take the lead yet, so the site's outbox holds it).
 */
const STATES = [
  { name: 'quote', token: 'qt_signed', head: { estimate: true, pdf: true }, done: { held: false, estimate: true, pdf: true } },
  { name: 'rough', token: null, head: { estimate: false, rough: true }, done: { held: false, estimate: false, pdf: false } },
  { name: 'no quote', token: null, head: { estimate: false }, done: { held: false, estimate: false, pdf: false } },
  { name: 'held', token: 'qt_signed', head: { estimate: true, pdf: true }, done: { held: true, estimate: true, pdf: true } },
] as const;

describe('estimate first in every state (Cal, 17 Nov 2026)', () => {
  for (const st of STATES) {
    it(`${st.name}: screen 2 asks where to send the estimate, and the call is only the soft line under the button`, () => {
      const h = askHeadline(st.head);
      render(<CallAsk idPrefix="t" details={details} onDetails={() => {}} ctx={ctxOf(st.token)} onSent={() => {}} heading={h.heading} sub={h.sub} />);
      expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Where should we send your estimate?');
      const sub = st.head.pdf
        ? "Your full estimate and PDF breakdown, sent to your inbox. We then discuss what a bill can't tell us, like your roof size and when you use power. You'll receive a fixed-rate proposal with your final savings, your €1,800 SEAI grant (up to €2,400 with a battery) and final numbers."
        : "Your full estimate, sent to your inbox. We then discuss what a bill can't tell us, like your roof size and when you use power. You'll receive a fixed-rate proposal with your final savings, your €1,800 SEAI grant (up to €2,400 with a battery) and final numbers.";
      expect(h.sub).toBe(sub);
      expect(h.sub).not.toMatch(CALL_FIRST);
      const text = document.body.textContent || '';
      expect(text).toContain(sub);
      expect(text).toContain('For the final details, after your estimate.');
      expect(text).toContain('Where we send your estimate.');
      expect(screen.getByRole('button', { name: 'Send my estimate' })).toBeTruthy();
      expect(text).toContain('Then one of our team goes through the final details with you.');
      expect(text).toContain('We only use your details for your estimate and the follow-up.');
      expect(text).not.toMatch(/So we can ring you|note of the call|for this call|ring you shortly|worked out in full|Where should we ring/i);
    });

    it(`${st.name}: the confirmation leads with the estimate and stays true`, () => {
      render(<CallDone details={details} held={st.done.held} estimate={st.done.estimate} pdf={st.done.pdf} />);
      const title = screen.getByRole('heading', { level: 2 }).textContent || '';
      const text = document.body.textContent || '';
      if (st.done.held || !st.done.estimate) {
        // Nothing has been emailed yet: the words never say it is on its way.
        expect(title).toBe('Thanks, Mary. We have your details, and your full estimate will follow by email.');
        expect(text).not.toMatch(/on its way|PDF/i);
      } else {
        expect(title).toBe('Thanks, Mary. Your full estimate and PDF breakdown are on their way to your email.');
      }
      expect(text).toContain('Next, one of our team goes through the final details with you, then you get a fixed-price final proposal.');
      expect(title).not.toMatch(CALL_FIRST);
      expect(text).not.toMatch(/ring you shortly|We'll ring|On the call we/i);
      expect(text).not.toMatch(/\bCal\b/);
    });
  }

  it('a quote without a PDF never promises one', () => {
    expect(askHeadline({ estimate: true, pdf: false }).sub).toBe("Your full estimate, sent to your inbox. We then discuss what a bill can't tell us, like your roof size and when you use power. You'll receive a fixed-rate proposal with your final savings, your €1,800 SEAI grant (up to €2,400 with a battery) and final numbers.");
    expect(askHeadline({ estimate: true, pdf: true, business: true }).sub).not.toMatch(/PDF/);
    expect(callDoneCopy({ held: false, first: 'Mary', estimate: true }).title).toBe('Thanks, Mary. Your full estimate is on its way to your email.');
    expect(callDoneCopy({ held: false, first: 'Mary', estimate: true, pdf: true, business: true }).title).not.toMatch(/PDF/);
  });

  it('the button words are the same with or without a quote', () => {
    for (const estimate of [true, false]) {
      const c = askCopy({ estimate });
      expect(c.cta).toBe('Send my estimate');
      expect(c.promise).toBe('Then one of our team goes through the final details with you.');
    }
  });

  it('the screen-reader line matches, and a business is told about its survey', () => {
    expect(callDoneCopy({ held: true, first: '' }).announce).toBe(
      'We have your details, and your full estimate will follow by email. Next, one of our team goes through the final details with you, then you get a fixed-price final proposal.',
    );
    expect(callDoneCopy({ held: false, first: '', estimate: true, business: true }).facts).toBe(
      'Next, one of our team books your site survey, then you get a fixed-price final proposal.',
    );
  });
});

describe('no first name', () => {
  it('thanks without a name rather than "there"', () => {
    expect(callDoneCopy({ held: false, first: '', estimate: false }).title).toBe('Thanks. We have your details, and your full estimate will follow by email.');
  });
});

describe('the replay cron', () => {
  it('vercel.json schedules /api/intake/replay on a schedule the Hobby plan accepts (at most daily)', () => {
    const v = JSON.parse(readFileSync(path.resolve(__dirname, '../../vercel.json'), 'utf8')) as { crons?: { path: string; schedule: string }[] };
    const c = v.crons?.find((x) => x.path === '/api/intake/replay');
    expect(c).toBeTruthy();
    const [min, hour, dom, mon, dow] = c!.schedule.split(' ');
    expect([min, hour].every((f) => /^\d+$/.test(f))).toBe(true);
    expect([dom, mon, dow]).toEqual(['*', '*', '*']);
  });
});
