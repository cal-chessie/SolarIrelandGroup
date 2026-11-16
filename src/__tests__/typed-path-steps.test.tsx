/**
 * The typed path's step order (Cal, 16 Nov 2026): a typed amount used to land
 * on "Your call" from 1024, the estimate ticked off unseen beside the form.
 * Now, at every width: amount, then the estimate on its own step, then the
 * contact details, then the call. Nothing on it says a bill was read, and
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

async function walk(wide: boolean) {
  setWidth(wide);
  render(<IntakeApp variant="page" initial={{ door: 'analyser-manual', segment: 'home', step: 'bill', stepRaw: 'bill' }} />);
  await waitFor(() => expect(stepOf()).toBe('bill'));

  fireEvent.change(document.getElementById('si-bill')!, { target: { value: '150' } });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'See my savings' }));
  });

  // Step 2 is the estimate, not the form.
  await waitFor(() => expect(document.querySelector('.si-hero__fig')).toBeTruthy());
  expect(stepOf()).toBe('time');
  expect(progress()).toEqual(['done', 'current', 'future']);
  expect(document.querySelector('.si-header__step')?.textContent).toBe('Your estimate');
  expect(document.getElementById('si-name')).toBeNull();
  expect(lanesText()).toContain('What your number is based on');
  expect(lanesText()).toContain('Why the battery is left out');
  expect(lanesText()).not.toMatch(BILL_READ_WORDS);
  await waitFor(() => expect(vi.mocked(trackEvent).mock.calls.some(([e]) => e.event === 'typed_estimate_shown')).toBe(true));

  // Step 3: the contact details.
  await act(async () => {
    fireEvent.click(screen.getAllByRole('button', { name: /Send my estimate/ })[0]);
  });
  await waitFor(() => expect(document.getElementById('si-name')).toBeTruthy());
  expect(stepOf()).toBe('details');
  expect(progress()).toEqual(['done', 'done', 'current']);
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

describe('the typed path never skips the estimate', () => {
  it('desktop (from 1024): amount, estimate, details, call', async () => {
    await walk(true);
  });
  it('phone: amount, estimate, details, call', async () => {
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
