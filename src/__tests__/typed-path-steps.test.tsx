/**
 * The typed path's step order.
 *
 * 16 Nov 2026: a typed amount used to land on "Your call" from 1024, the
 * estimate ticked off unseen beside the form, so the estimate got its own step.
 * 17 Nov 2026 (Cal, option A): the estimate now builds live on "Your bill",
 * beside the amount, and a tapped amount only moves the estimate, it never
 * navigates. One primary, "Send my estimate", goes straight to the contact
 * details. So at every width: Your bill (with the live estimate), then Your
 * call, then the confirmation. Nothing on it says a bill was read, and
 * AISolar is told the lead came from a typed amount (meta.door), with no
 * bill read attached.
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

const events = (name: string) => vi.mocked(trackEvent).mock.calls.filter(([e]) => e.event === name).map(([e]) => e.properties ?? {});
const hero = () => document.querySelector('.si-live-card .si-hero__fig b')?.textContent ?? null;

async function walk(wide: boolean) {
  setWidth(wide);
  render(<IntakeApp variant="page" initial={{ door: 'analyser-manual', segment: 'home', step: 'bill', stepRaw: 'bill' }} />);
  await waitFor(() => expect(stepOf()).toBe('bill'));

  // Step 1, before any amount: a calm prompt, never a made-up personal number.
  expect(progress()).toEqual(['current', 'future']);
  expect(document.querySelector('.si-header__step')?.textContent).toBe('Your bill');
  expect(hero()).toBeNull();
  expect(lanesText()).toContain('Pick your monthly bill to see your estimate');

  // A suggested amount moves the estimate and nothing else.
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'About €200 a month' }));
  });
  await waitFor(() => expect(hero()).toMatch(/^€[\d,]+$/), { timeout: 4000 });
  expect(stepOf()).toBe('bill');
  expect(window.location.search).toContain('step=bill');
  expect(document.getElementById('si-name')).toBeNull();
  const at200 = hero();

  // Typing moves it too (debounced), still on "Your bill".
  fireEvent.change(document.getElementById('si-bill')!, { target: { value: '150' } });
  await waitFor(() => expect(hero()).not.toBe(at200), { timeout: 4000 });
  await waitFor(() => expect(lanesText()).toContain('From the €150 a month you told us.'), { timeout: 4000 });
  expect(stepOf()).toBe('bill');
  expect(lanesText()).toContain('for what you send back at');
  expect(lanesText()).toContain('From the €150 a month you told us. Close estimate, not a quote.');
  expect(lanesText()).toContain('Your estimate goes to your inbox, and one of our team will ring you to talk it through.');
  expect(lanesText()).toContain('What your number is based on');
  expect(lanesText()).toContain('Why the battery is left out');
  expect(lanesText()).not.toMatch(BILL_READ_WORDS);

  // The events: shown once, the amount changes (debounced), a panel opened.
  await waitFor(() => expect(events('typed_estimate_shown')).toHaveLength(1), { timeout: 4000 });
  await waitFor(() => expect(events('typed_amount_changed').some((p) => p.band === 150 && p.method === 'typed')).toBe(true), { timeout: 4000 });
  const how = document.querySelector<HTMLButtonElement>('[data-open="how"]')!;
  await act(async () => {
    fireEvent.click(how);
  });
  expect(how.getAttribute('aria-expanded')).toBe('true');
  expect(document.querySelector('[data-xp="how"] .si-xp__btn')?.getAttribute('aria-expanded')).toBe('true');
  expect(events('typed_expand').at(-1)).toMatchObject({ panel: 'how' });

  // Step 2: "Send my estimate" goes straight to the contact details. No estimate step between.
  await act(async () => {
    fireEvent.click(screen.getAllByRole('button', { name: /Send my estimate/ })[0]);
  });
  await waitFor(() => expect(document.getElementById('si-name')).toBeTruthy(), { timeout: 4000 });
  expect(stepOf()).toBe('details');
  expect(progress()).toEqual(['done', 'current']);
  expect(events('typed_send_click')).toHaveLength(1);
  expect(lanesText()).toContain('worked out from the amount you gave us');
  expect(lanesText()).not.toMatch(BILL_READ_WORDS);

  fireEvent.change(document.getElementById('si-name')!, { target: { value: 'Mary Byrne' } });
  fireEvent.change(document.getElementById('si-mobile')!, { target: { value: '0871234567' } });
  fireEvent.change(document.getElementById('si-email')!, { target: { value: 'mary@example.invalid' } });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Send my savings' }));
  });

  // Then the call.
  await waitFor(() => expect(stepOf()).toBe('done'));
  expect(lanesText()).toContain('Your estimate is on its way to your inbox.');
  expect(lanesText()).not.toMatch(BILL_READ_WORDS);
  expect(submitted).toHaveLength(1);
  expect(submitted[0].billRead).toBeNull();
  expect(submitted[0].meta.door).toBe('analyser-typed');
  expect(submitted[0].monthlyBill).toBe(150);
}

describe('the typed path: the estimate builds live on "Your bill"', () => {
  it('desktop (from 1024): amount with the live estimate, details, call', async () => {
    await walk(true);
  }, 20000);
  it('phone: amount with the live estimate, details, call', async () => {
    await walk(false);
  }, 20000);
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

describe('no estimate step for a typed amount', () => {
  it('an old ?step=time link with a typed amount opens on "Your bill"; a bill read and no bill keep their step', async () => {
    const { freshDraft, validStep } = await import('@/components/intake/model');
    const typedDraft = { ...freshDraft(), segment: 'domestic' as const, bill: 160 };
    expect(validStep('time', typedDraft)).toBe('bill');
    expect(validStep('time', { ...typedDraft, billRead: { amountEur: 160, period: 'month', supplier: null, annualKwh: 4200, unitRateEur: 0.35, standingChargeAnnualEur: null, dayKwh: null, nightKwh: null } })).toBe('time');
    expect(validStep('time', { ...freshDraft(), segment: 'domestic' as const })).toBe('time');
  });
});
