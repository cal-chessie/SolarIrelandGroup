/**
 * The typed path's pay-off (Cal, 17 Nov 2026). "Your bill" sells the next
 * screen without the number; a tapped amount only selects, and "See my
 * estimate" moves on. "Your estimate" reveals the number with the contact
 * form beside it (under it on phones), so the path is two steps before done.
 * Nothing on it says a bill was read, and AISolar is told the lead came from
 * a typed amount (meta.door), with no bill read attached.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import IntakeApp from '@/components/intake/IntakeApp';
import { trackEvent } from '@/lib/analytics';
import { askHeadline, leadDoor } from '@/components/intake/CallAsk';
import { roughQuote } from '@/lib/intake/roughQuote';
import type { QuoteRequestItem, SubmitRequest } from '@/lib/intake/contract';

// The intake's stylesheet is not what this test is about (and PostCSS does not run under vitest).
vi.mock('@/components/intake/intake.css', () => ({}));
// The consent-gated layer: the intake's events go through trackEvent, nowhere else.
vi.mock('@/lib/analytics', async (orig) => ({ ...(await orig<typeof import('@/lib/analytics')>()), trackEvent: vi.fn() }));

const BILL_READ_WORDS = /read your bill|from your bill|we read|bill can't tell|full estimate/i;

function setWidth(wide: boolean) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: wide ? 1440 : 390 });
  window.matchMedia = ((q: string) => ({
    matches: wide && /min-width:\s*1024px/.test(q),
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

let submitted: SubmitRequest[] = [];

beforeEach(() => {
  submitted = [];
  vi.mocked(trackEvent).mockClear();
  sessionStorage.clear();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  globalThis.fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const u = String(url);
    if (u.includes('/api/intake/quote')) {
      const { requests } = JSON.parse(String(init?.body)) as { requests: QuoteRequestItem[] };
      const quotes = requests.map((r) => ({ ...roughQuote(r), quoteToken: 'signed-quote', expiresAt: null }));
      return new Response(JSON.stringify({ rulesVersion: 't', rulesHash: 't', settingsUpdatedAt: 't', quotes }), { status: 200 });
    }
    if (u.includes('/api/intake/submit')) {
      submitted.push(JSON.parse(String(init?.body)) as SubmitRequest);
      return new Response(
        JSON.stringify({ ok: true, leadId: 'l', path: 'fresh', booking: { outcome: 'none' }, estimate: null, handoff: null, deviceToken: null, next: 'check_email', call: { requested: true, bestTime: null } }),
        { status: 200 },
      );
    }
    return new Response('{}', { status: 503 });
  }) as unknown as typeof fetch;
});
afterEach(() => cleanup());

const stepOf = () => document.querySelector('.si-intake')?.getAttribute('data-step');
const progress = () => Array.from(document.querySelectorAll('.si-progress li')).map((l) => (l as HTMLElement).dataset.state);
const lanesText = () =>
  Array.from(document.querySelectorAll('.si-lane'))
    .filter((l) => !(l as HTMLElement).hidden)
    .map((l) => l.textContent)
    .join(' ');

const events = () => vi.mocked(trackEvent).mock.calls.map(([e]) => e.event);

async function walk(wide: boolean) {
  setWidth(wide);
  render(<IntakeApp variant="page" initial={{ door: 'analyser-manual', segment: 'home', step: 'bill', stepRaw: 'bill' }} />);
  await waitFor(() => expect(stepOf()).toBe('bill'));
  expect(progress()).toEqual(['current', 'future']);

  // Screen 1 sells the next screen and never shows a figure.
  // Estimate first, the call a soft second (Cal, 17 Nov 2026), and no call-only skip.
  expect(lanesText()).toContain('Your full estimate and PDF breakdown land in your inbox.');
  expect(lanesText()).toContain('One of our team goes through the final details with you.');
  expect(lanesText()).toContain('You get a fixed-price final proposal.');
  expect(lanesText()).toContain('We book your BER');
  expect(lanesText()).not.toMatch(/Skip the bill|15-minute call/);
  expect(document.querySelector('.si-hero__fig')).toBeNull();

  // Nothing to price yet: the primary waits.
  const see = () => screen.getByRole('button', { name: 'See my estimate' }) as HTMLButtonElement;
  expect(see().disabled).toBe(true);

  // A tapped amount selects and does not navigate.
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'About €160 a month' }));
  });
  await new Promise((r) => setTimeout(r, 400));
  expect(stepOf()).toBe('bill');
  expect(screen.getByRole('button', { name: 'About €160 a month' }).getAttribute('aria-pressed')).toBe('true');
  expect((document.getElementById('si-bill') as HTMLInputElement).value).toBe('160');
  expect(see().disabled).toBe(false);
  expect(document.querySelector('.si-hero__fig')).toBeNull();

  // Typing replaces it; "See my estimate" moves on.
  fireEvent.change(document.getElementById('si-bill')!, { target: { value: '150' } });
  expect(screen.getByRole('button', { name: 'About €160 a month' }).getAttribute('aria-pressed')).toBe('false');
  await act(async () => {
    fireEvent.click(see());
  });
  expect(events()).toContain('typed_see_estimate_click');

  // "Your estimate": the number, and the form on the same screen.
  await waitFor(() => expect(document.querySelector('.si-hero__fig')).toBeTruthy());
  expect(stepOf()).toBe('time');
  expect(progress()).toEqual(['done', 'current']);
  expect(document.querySelector('.si-header__step')?.textContent).toBe('Your estimate');
  expect(document.getElementById('si-name')).toBeTruthy();
  expect(document.querySelector('[data-split]')?.textContent).toMatch(/off your bill \+ .* for what you send back at/);
  expect(lanesText()).toContain('From the €150 a month you told us. Close estimate, not a quote.');
  expect(lanesText()).toContain('Where should we send your estimate?');
  expect(lanesText()).toContain('The full breakdown and a PDF, by email. No visit, no obligation.');
  expect(lanesText()).toContain('Then we go through the final details and send your fixed-price proposal.');
  expect(lanesText()).toContain('For the final details, after your estimate.');
  // The call is mentioned once, under the button: no best-time chips beside the estimate.
  expect(lanesText()).not.toContain('Best time to ring');
  expect(lanesText()).toContain('What your number is based on');
  expect(lanesText()).toContain('Why the battery is left out');
  expect(lanesText()).not.toMatch(BILL_READ_WORDS);
  await waitFor(() => expect(events()).toContain('typed_estimate_shown'));

  // The two amber toggles.
  const how = screen.getByRole('button', { name: /See how we worked this out/ });
  expect(how.getAttribute('aria-expanded')).toBe('false');
  await act(async () => {
    fireEvent.click(how);
  });
  expect(how.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('button', { name: /Make it more accurate/ }).getAttribute('aria-expanded')).toBe('false');
  expect(events()).toContain('typed_expand');

  fireEvent.change(document.getElementById('si-name')!, { target: { value: 'Mary Byrne' } });
  fireEvent.change(document.getElementById('si-mobile')!, { target: { value: '0871234567' } });
  fireEvent.change(document.getElementById('si-email')!, { target: { value: 'mary@example.invalid' } });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Send my estimate' }));
  });
  expect(events()).toContain('typed_send_click');

  // Then done.
  await waitFor(() => expect(stepOf()).toBe('done'));
  expect(progress()).toEqual(['done', 'done']);
  expect(lanesText()).toContain('Thanks, Mary. Your estimate and PDF breakdown are on their way to your inbox.');
  expect(lanesText()).toContain('Next, one of our team goes through the final details with you, then you get a fixed-price proposal.');
  expect(lanesText()).not.toMatch(/On the call we|Save our number/);
  expect(lanesText()).not.toMatch(BILL_READ_WORDS);
  expect(submitted).toHaveLength(1);
  expect(submitted[0].billRead).toBeNull();
  expect(submitted[0].meta.door).toBe('analyser-typed');
  expect(submitted[0].monthlyBill).toBe(150);
}

describe('the typed path pays off on the next screen', () => {
  it('desktop (from 1024): amount, then the estimate with the form beside it, then done', async () => {
    await walk(true);
  });
  it('phone: amount, then the estimate with the form under it, then done', async () => {
    await walk(false);
  });
});

describe('typed words', () => {
  it('the ask never claims a bill was read on a typed amount', () => {
    const h = askHeadline({ estimate: true, typed: true });
    expect(`${h.heading} ${h.sub}`).not.toMatch(BILL_READ_WORDS);
    expect(h.sub).toContain('the amount you gave us');
  });
  it('AISolar hears "typed" through the existing door field, and only on the typed path', () => {
    expect(leadDoor('analyser-manual', 'typed')).toBe('analyser-typed');
    expect(leadDoor('calculator-manual', 'typed')).toBe('calculator-typed');
    expect(leadDoor('nav', 'typed')).toBe('nav-typed');
    expect(leadDoor('analyser-typed', 'typed')).toBe('analyser-typed');
    expect(leadDoor('analyser-offline', 'read')).toBe('analyser-offline');
    expect(leadDoor('nav', 'none')).toBe('nav');
    expect(leadDoor('analyser', undefined)).toBe('analyser');
  });
});

describe('no call-only road (Cal, 17 Nov 2026)', () => {
  it('a link to "Your estimate" with no bill (an old /book-survey link) opens on Screen 1', async () => {
    setWidth(true);
    render(<IntakeApp variant="page" initial={{ door: 'book-survey', segment: 'home', step: 'time', stepRaw: 'time' }} />);
    await waitFor(() => expect(stepOf()).toBe('bill'));
    expect(screen.getByRole('button', { name: 'See my estimate' })).toBeTruthy();
    expect(lanesText()).not.toMatch(/Where should we ring you|No bill, no problem/);
  });
});
