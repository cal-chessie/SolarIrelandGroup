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
  it('a held submit (fallback) says "Saved. Cal will ring you today." and never "check your inbox"', () => {
    render(<CallDone details={details} who="Cal" held />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Saved. Cal will ring you today.');
    const text = document.body.textContent || '';
    expect(text).not.toMatch(/inbox/i);
    expect(text).not.toMatch(/on its way/i);
    expect(text).toContain('087 123 4567');
  });
  it('an accepted submit keeps the estimate promise', () => {
    render(<CallDone details={details} who="Cal" />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Thanks, Mary. Your full estimate is on its way.');
  });
  it('the screen-reader line matches', () => {
    expect(callDoneCopy({ held: true, who: null, first: '' }).announce).toBe('Saved. We will ring you today.');
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
    const c = askCopy({ estimate: false, who: 'Cal' });
    expect(c.cta).not.toMatch(/estimate/i);
    expect(c.promise).toBe('Cal will ring you today and work out your estimate with you.');
    expect(`${c.cta} ${c.promise} ${c.busy}`).not.toMatch(/email|inbox|on its way|send my/i);
    expect(askCopy({ estimate: true, who: 'Cal' }).cta).toBe('Send my full estimate');
  });
  it('the confirmation without one never says the estimate is on its way', () => {
    render(<CallDone details={details} who="Cal" estimate={false} />);
    const text = document.body.textContent || '';
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Thanks, Mary. Cal will ring you today.');
    expect(text).toContain('Cal will work out your estimate with you on the call.');
    expect(text).not.toMatch(/inbox|on its way/i);
  });
});
