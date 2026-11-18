/**
 * A cold load or refresh straight onto "Your estimate" (18 Nov 2026):
 * /estimate?for=home&bill=200&door=analyser-manual&step=time stayed on
 * "Working out your figures" forever, though the one quote call came back 200.
 * The figures must appear, with no click through Screen 1, for a fresh tab
 * and for a refresh with the tab's copy already saved.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import IntakeApp from '@/components/intake/IntakeApp';
import { parseIntakeQuery } from '@/lib/intake/open';
import { roughQuote } from '@/lib/intake/roughQuote';
import type { QuoteRequestItem } from '@/lib/intake/contract';

vi.mock('@/components/intake/intake.css', () => ({}));

let quoteCalls = 0;

beforeEach(() => {
  quoteCalls = 0;
  sessionStorage.clear();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  window.matchMedia = ((q: string) => ({
    matches: /min-width:\s*1024px/.test(q),
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  globalThis.fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const u = String(url);
    if (u.includes('/api/intake/quote')) {
      quoteCalls += 1;
      const { requests } = JSON.parse(String(init?.body)) as { requests: QuoteRequestItem[] };
      // A real network round trip, so the reply lands after mount settles.
      await new Promise((r) => setTimeout(r, 30));
      const quotes = requests.map((r) => ({ ...roughQuote(r), quoteToken: 'signed-quote', expiresAt: null }));
      return new Response(JSON.stringify({ rulesVersion: 't', rulesHash: 't', settingsUpdatedAt: 't', quotes }), { status: 200 });
    }
    return new Response('{}', { status: 503 });
  }) as unknown as typeof fetch;
});
afterEach(() => cleanup());

const loading = () => document.querySelector('.si-est__loading');
const hero = () => document.querySelector('.si-hero__fig');

async function loadAt(query: Record<string, string>) {
  window.history.replaceState(null, '', `/estimate?${new URLSearchParams(query)}`);
  render(<IntakeApp variant="page" initial={parseIntakeQuery(query)} />);
  await waitFor(() => expect(document.querySelector('.si-intake')?.getAttribute('data-step')).toBe('time'));
  await waitFor(() => expect(hero()).toBeTruthy(), { timeout: 3000 });
  expect(loading()).toBeNull();
}

describe('a direct load of "Your estimate" shows the figures', () => {
  it('home, fresh tab', async () => {
    await loadAt({ for: 'home', bill: '200', door: 'analyser-manual', step: 'time' });
    expect(quoteCalls).toBeGreaterThan(0);
  });

  it('business, fresh tab', async () => {
    await loadAt({ for: 'business', bill: '1000', door: 'analyser-manual', step: 'time' });
  });

  it('home, refresh with the tab copy already saved', async () => {
    await loadAt({ for: 'home', bill: '200', door: 'analyser-manual', step: 'time' });
    await new Promise((r) => setTimeout(r, 250));
    expect(sessionStorage.getItem('si-intake-v1')).toBeTruthy();
    cleanup();
    await loadAt({ for: 'home', bill: '200', door: 'analyser-manual', step: 'time' });
  });
});
