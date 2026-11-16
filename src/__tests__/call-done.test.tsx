/**
 * The confirmation every road ends in (9 Nov review). It may only say what
 * actually happened.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { CallDone, callDoneCopy } from '@/components/intake/CallAsk';

const details = { name: 'Mary Byrne', mobile: '087 123 4567', email: 'mary@example.ie', bestTime: null };

describe('CallDone held (H3)', () => {
  it('a held submit (fallback) says "Saved. Our team will ring you shortly." and never "check your inbox"', () => {
    render(<CallDone details={details} held />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Saved. Our team will ring you shortly.');
    const text = document.body.textContent || '';
    expect(text).not.toMatch(/inbox/i);
    expect(text).not.toMatch(/on its way/i);
    expect(text).toContain('087 123 4567');
  });
  it('an accepted submit keeps the estimate promise', () => {
    render(<CallDone details={details} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Thanks, Mary. Your estimate is on its way to your inbox.');
  });
  it('the screen-reader line matches', () => {
    expect(callDoneCopy({ held: true, first: '' }).announce).toBe('Saved. Our team will ring you shortly.');
  });
});

describe('no first name', () => {
  it('thanks without a name rather than "there"', () => {
    expect(callDoneCopy({ held: false, first: '', estimate: false }).title).toBe('Thanks. Our team will ring you shortly.');
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

describe('no priced bill, no estimate promise (H2)', () => {
  it('the ask without a quote token sells the call, not an email', async () => {
    const { askCopy } = await import('@/components/intake/CallAsk');
    const c = askCopy({ estimate: false });
    expect(c.cta).not.toMatch(/estimate/i);
    expect(c.promise).toBe('A member of our team will ring you today and work out your estimate with you.');
    expect(`${c.cta} ${c.promise} ${c.busy}`).not.toMatch(/email|inbox|on its way|send my/i);
    expect(askCopy({ estimate: true }).cta).toBe('Send my savings');
  });
  it('the confirmation without one never says the estimate is on its way', () => {
    render(<CallDone details={details} estimate={false} />);
    const text = document.body.textContent || '';
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Thanks, Mary. Our team will ring you shortly.');
    expect(text).toContain("We'll work out your estimate with you on the call.");
    expect(text).not.toMatch(/inbox|on its way/i);
    expect(text).not.toMatch(/\bCal\b/);
  });
});
