'use client';

/**
 * The intake's browser side of the contract. Talks only to the site's own
 * /api/intake/* routes, never to AISolar, Postmark or /api/lead directly.
 */
import type {
  BillReadResponse,
  EircodeResponse,
  HoldResponse,
  IntakeConfig,
  IntakeError,
  QuoteRequestItem,
  QuoteResponse,
  Quote,
  Segment,
  SlotsResponse,
  SubmitRequest,
  SubmitResponse,
} from '@/lib/intake/contract';

async function call<T>(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<{ status: number; data: T | null }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), init.timeoutMs ?? 15000);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, credentials: 'same-origin', cache: 'no-store' });
    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }
    return { status: res.status, data };
  } catch {
    return { status: 0, data: null };
  } finally {
    clearTimeout(t);
  }
}

/* Settings: cached for 60 seconds, so the screen stays instant (DECISIONS 1). */
let configCache: { at: number; data: IntakeConfig } | null = null;
export async function getConfig(): Promise<IntakeConfig | null> {
  if (configCache && Date.now() - configCache.at < 60000) return configCache.data;
  const r = await call<IntakeConfig>('/api/intake/config');
  if (r.status === 200 && r.data && 'estimate' in r.data) {
    configCache = { at: Date.now(), data: r.data };
    return r.data;
  }
  return configCache?.data ?? null;
}

/* Quotes: cached by their exact inputs, so a chip tap or a switch back is instant. */
const quoteCache = new Map<string, Quote>();
export const quoteKey = (q: QuoteRequestItem) => JSON.stringify(q);

export function cachedQuote(q: QuoteRequestItem): Quote | null {
  return quoteCache.get(quoteKey(q)) ?? null;
}

export async function getQuotes(items: QuoteRequestItem[]): Promise<Quote[] | null> {
  const missing = items.filter((i) => !quoteCache.has(quoteKey(i)));
  if (missing.length) {
    const r = await call<QuoteResponse>('/api/intake/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requests: missing.slice(0, 8) }),
    });
    if (r.status !== 200 || !r.data?.quotes) return null;
    missing.slice(0, 8).forEach((m, i) => {
      const q = r.data!.quotes[i];
      if (q) quoteCache.set(quoteKey(m), q);
    });
  }
  const out = items.map((i) => quoteCache.get(quoteKey(i)) ?? null);
  return out.every(Boolean) ? (out as Quote[]) : null;
}

export async function getSlots(from: string, days: number, segment: Segment): Promise<SlotsResponse | null> {
  const r = await call<SlotsResponse>('/api/intake/slots', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ from, days, segment }),
  });
  return r.status === 200 && r.data?.days ? r.data : null;
}

export async function holdSlot(startsAt: string, segment: Segment, holdToken: string | null): Promise<HoldResponse | null> {
  const r = await call<HoldResponse>('/api/intake/hold', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'hold', startsAt, segment, holdToken }),
  });
  return r.status === 200 ? r.data : null;
}

export function releaseSlot(holdToken: string | null, segment: Segment) {
  if (!holdToken) return;
  void call('/api/intake/hold', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'release', holdToken, segment, startsAt: '' }),
    keepalive: true,
  });
}

export async function submitIntake(body: SubmitRequest, idempotencyKey: string) {
  return call<SubmitResponse | IntakeError>('/api/intake/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-idempotency-key': idempotencyKey },
    body: JSON.stringify(body),
    timeoutMs: 30000,
  });
}

export async function lookupEircode(code: string): Promise<EircodeResponse> {
  const r = await call<EircodeResponse>(`/api/intake/eircode?code=${encodeURIComponent(code.replace(/\s+/g, ''))}`, { timeoutMs: 9000 });
  if (r.data && typeof r.data === 'object' && 'ok' in r.data) return r.data;
  return { ok: false, reason: 'unavailable' };
}

export async function readBillPhoto(file: File): Promise<BillReadResponse> {
  const form = new FormData();
  form.append('bill', file);
  const r = await call<BillReadResponse>('/api/intake/bill', { method: 'POST', body: form, timeoutMs: 50000 });
  if (r.data && typeof r.data === 'object' && 'ok' in r.data) return r.data;
  return { ok: false, reason: 'unavailable' };
}

export function newKey(): string {
  const c = globalThis.crypto as Crypto & { randomUUID?: () => string };
  if (typeof c.randomUUID === 'function') return c.randomUUID();
  // RFC 4122 v4 shape from getRandomValues (older Safari).
  const b = new Uint8Array(16);
  c.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
