/**
 * Cold /book-survey (H2, 9 Nov review): one bill question, priced through
 * /api/intake/quote, and the quote token rides with the call so AISolar emails
 * a real estimate. Skipping the bill never promises one.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/components/intake/intake.css', () => ({}));
vi.mock('@/components/solar/Navbar', () => ({ default: () => null }));
vi.mock('@/components/solar/Footer', () => ({ default: () => null }));
vi.mock('@/components/solar/WhatsAppChat', () => ({ default: () => null }));

type Sent = { url: string; body: Record<string, unknown> | null };
let sent: Sent[] = [];

beforeEach(() => {
  sent = [];
  localStorage.clear();
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input);
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    sent.push({ url, body });
    const res = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { 'content-type': 'application/json' } });
    if (url.includes('/api/intake/config')) return res({ ok: false, error: 'intake_unavailable' }, 503);
    if (url.includes('/api/intake/quote')) return res({ quotes: [{ hasBasis: true, figures: { annualSavingEur: 640 }, assumptions: [], quoteToken: 'tok.mac', expiresAt: '2026-11-10T00:00:00Z' }] });
    if (url.includes('/api/intake/submit')) return res({ ok: true, leadId: null, path: 'fresh', booking: { outcome: 'none' }, estimate: null, handoff: null, deviceToken: null, next: 'check_email' });
    return res({ ok: false }, 404);
  });
});
afterEach(() => vi.restoreAllMocks());

async function fillAndSend() {
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Mary Byrne' } });
  fireEvent.change(screen.getByLabelText('Mobile', { exact: false }), { target: { value: '087.123.4567' } });
  fireEvent.change(screen.getByLabelText('Email', { exact: false }), { target: { value: 'mary@example.ie' } });
  fireEvent.submit(document.querySelector('form.si-ask') as HTMLFormElement);
  await waitFor(() => expect(sent.some((s) => s.url.includes('/api/intake/submit'))).toBe(true));
  return sent.find((s) => s.url.includes('/api/intake/submit'))!.body!;
}

describe('/book-survey cold', () => {
  it('asks the bill first, prices it, and sends the quote token with the call', async () => {
    const { default: BookSurveyClient } = await import('@/app/book-survey/BookSurveyClient');
    render(<BookSurveyClient lt={null} segment="domestic" src={null} />);
    expect(await screen.findByText(/electricity bill a month/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '€160' }));
    await screen.findByText(/save you around €640 a year/);
    expect(screen.getByRole('button', { name: 'Send my savings' })).toBeTruthy();
    const quote = sent.find((s) => s.url.includes('/api/intake/quote'))!.body as { requests: { segment: string; bill: { amountEur: number } }[] };
    expect(quote.requests[0]).toMatchObject({ segment: 'domestic', bill: { amountEur: 160 } });
    const body = await fillAndSend();
    expect(body).toMatchObject({ intent: 'call', quoteToken: 'tok.mac', monthlyBill: 160, phone: '087 123 4567' });
    expect((await screen.findByRole('heading', { level: 2, name: /on its way/ })).textContent).toContain('Your full estimate is on its way');
  });

  it('skipping the bill: no estimate promised on the button or the confirmation', async () => {
    const { default: BookSurveyClient } = await import('@/app/book-survey/BookSurveyClient');
    render(<BookSurveyClient lt={null} segment="domestic" src={null} />);
    fireEvent.click(await screen.findByRole('button', { name: /Skip this/ }));
    expect(screen.queryByRole('button', { name: /estimate/i })).toBeNull();
    expect(screen.getByRole('button', { name: 'Ring me today' })).toBeTruthy();
    const body = await fillAndSend();
    expect(body.quoteToken).toBeNull();
    const done = await screen.findByRole('heading', { level: 2, name: /ring you today/ });
    expect(done.textContent).not.toMatch(/estimate/);
    expect(document.body.textContent).not.toMatch(/inbox|on its way/i);
  });
});

describe('/book-survey?lt= (M6)', () => {
  it('takes the token out of the address bar at once and sends it by POST, never in a URL', async () => {
    const lt = 'a'.repeat(64);
    window.history.replaceState(null, '', `/book-survey?lt=${lt}&utm_source=email`);
    const { default: BookSurveyClient } = await import('@/app/book-survey/BookSurveyClient');
    render(<BookSurveyClient lt={lt} segment="domestic" src={null} />);
    await waitFor(() => expect(window.location.search).toBe('?utm_source=email'));
    await waitFor(() => expect(sent.some((s) => s.url.includes('/api/survey-context'))).toBe(true));
    const ctx = sent.find((s) => s.url.includes('/api/survey-context'))!;
    expect(ctx.url).not.toContain(lt);
    expect(ctx.body).toEqual({ lt });
    expect(sent.every((s) => !s.url.includes(lt))).toBe(true);
  });
});

describe('/book-survey returning device', () => {
  it('a device that already asked sees "ringing you today", not the bill question', async () => {
    localStorage.setItem('si_call_requested', JSON.stringify({ v: 1, at: Date.now(), first: 'Mary', bestTime: null }));
    window.history.replaceState(null, '', '/book-survey');
    const { default: BookSurveyClient } = await import('@/app/book-survey/BookSurveyClient');
    render(<BookSurveyClient lt={null} segment="domestic" src={null} />);
    await waitFor(() => expect(document.querySelector('[data-call-remembered]')).not.toBeNull());
    expect(document.querySelector('[data-bill-question]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /need another call/ }));
    expect(await screen.findByText(/electricity bill a month/)).toBeTruthy();
  });
});
