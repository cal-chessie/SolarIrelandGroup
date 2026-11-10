/**
 * The exit quiz (9 Nov review): what it tells analytics (M7) and what a stray
 * tap on the scrim may do (M8).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { billBand } from '@/lib/intake/funnel';
import { EXIT_KEYS } from '@/lib/intake/exitGate';

vi.mock('@/components/intake/intake.css', () => ({}));

type W = Window & { __siFunnel?: Record<string, unknown>[] };

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  sessionStorage.setItem(EXIT_KEYS.siteStart, String(Date.now() - 120_000));
  (window as W).__siFunnel = [];
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
  Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true });
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input);
    const res = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { 'content-type': 'application/json' } });
    if (url.includes('/api/intake/quote')) {
      const q = (s: number) => ({ hasBasis: true, figures: { annualSavingEur: s }, assumptions: [], quoteToken: `t${s}`, expiresAt: '2026-11-10T00:00:00Z' });
      return res({ quotes: [q(600), q(500), q(700)] });
    }
    return res({ ok: false }, 503);
  });
});
afterEach(() => vi.restoreAllMocks());

async function openQuiz() {
  const { default: ExitIntent } = await import('@/components/solar/ExitIntent');
  render(<ExitIntent />);
  act(() => {
    document.documentElement.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0 }));
  });
  await screen.findByText(/home or a business/);
}

async function toAsk() {
  fireEvent.click(screen.getByRole('button', { name: /^My home/ }));
  fireEvent.click(await screen.findByRole('button', { name: /^Solar panels/ }));
  fireEvent.click(await screen.findByRole('button', { name: '€160' }));
  fireEvent.click(await screen.findByRole('button', { name: /Show my saving/ }));
  fireEvent.click(await screen.findByRole('button', { name: /See my full savings/ }));
  await screen.findByLabelText('Your name');
}

const scrim = () => document.querySelector('.exit-intent-backdrop') as HTMLElement;

describe('exit quiz analytics (M7)', () => {
  it('bills go out as bands, never the amount', () => {
    for (const a of [80, 120, 160, 220, 300]) expect(billBand('domestic', a)).not.toContain(String(a));
    expect(billBand('domestic', 160)).toBe('150_250');
    expect(billBand('commercial', 4000)).toBe('2500_plus');
  });
  it('the quiz funnel carries the band, not the tapped figure', async () => {
    await openQuiz();
    fireEvent.click(screen.getByRole('button', { name: /^My home/ }));
    fireEvent.click(await screen.findByRole('button', { name: /^Solar panels/ }));
    fireEvent.click(await screen.findByRole('button', { name: '€160' }));
    const bill = (window as W).__siFunnel!.find((e) => e.door === 'exit-quiz' && e.step === 'bill');
    expect(bill?.value).toBe('150_250');
    expect(JSON.stringify((window as W).__siFunnel)).not.toMatch(/"160"|:160\b/);
  });
  it('the layout denies consent before gtag("js") and configures nothing before consent', () => {
    const src = readFileSync(path.resolve(__dirname, '../app/layout.tsx'), 'utf8');
    const deny = src.indexOf("gtag('consent', 'default'");
    const js = src.indexOf("gtag('js'");
    const config = src.indexOf("gtag('config'");
    const check = src.indexOf('consent.categories && consent.categories.analytics');
    expect(deny).toBeGreaterThan(-1);
    expect(deny).toBeLessThan(js);
    expect(check).toBeLessThan(config);
    expect(src.match(/gtag\('consent', 'default'/g)).toHaveLength(1);
  });
});

describe('exit quiz scrim (M8)', () => {
  it('before any typing: a scrim tap closes it, and only for the week, never forever', async () => {
    await openQuiz();
    fireEvent.click(scrim());
    expect(document.querySelector('[data-exit-quiz]')).toBeNull();
    expect(localStorage.getItem(EXIT_KEYS.dismissed)).toBeNull();
    expect(Number(localStorage.getItem(EXIT_KEYS.shownAt))).toBeGreaterThan(0);
  });
  it('once details are typed: a scrim tap asks first and keeps every character', async () => {
    await openQuiz();
    await toAsk();
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Mary Byrne' } });
    fireEvent.click(scrim());
    expect(document.querySelector('[data-exit-quiz]')).not.toBeNull();
    expect(await screen.findByText('Leave? Your details will be lost.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Stay' }));
    expect((screen.getByLabelText('Your name') as HTMLInputElement).value).toBe('Mary Byrne');
    fireEvent.click(scrim());
    fireEvent.click(await screen.findByRole('button', { name: 'Leave' }));
    await waitFor(() => expect(document.querySelector('[data-exit-quiz]')).toBeNull());
    expect(localStorage.getItem(EXIT_KEYS.dismissed)).toBeNull();
  });
  it('Maybe later and the close button still mean gone', async () => {
    await openQuiz();
    fireEvent.click(screen.getByRole('button', { name: 'Maybe later' }));
    expect(localStorage.getItem(EXIT_KEYS.dismissed)).toBe('1');
  });
});
