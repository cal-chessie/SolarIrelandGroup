// @vitest-environment node
/**
 * The 9 Nov code review fixes (review-fixes branch). Routes run against a
 * mocked fetch: nothing here reaches the network.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LINK_TOKEN, parseLinkToken } from '@/lib/intake/linkToken';
import { toIngestBody } from '@/lib/intake/live/ingest';
import type { SubmitRequest } from '@/lib/intake/contract';

const HEX = (c: string) => c.repeat(64);
const KEY = '9b2f0c1e-3d4a-4b5c-8d6e-7f8091a2b3c4';

const ENV_KEYS = ['INTAKE_CONTRACT_MODE', 'INTAKE_AISOLAR_URL', 'INTAKE_SOURCE_KEY', 'AISOLAR_SOURCE_KEY', 'VERCEL_ENV', 'POSTMARK_SERVER_TOKEN', 'OWNER_ALERT_EMAIL', 'OWNER_ALERT_FROM', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'CRON_SECRET', 'AISOLAR_INGEST_URL'];
let saved: Record<string, string | undefined> = {};
beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.restoreAllMocks();
});

function setLive() {
  process.env.INTAKE_CONTRACT_MODE = 'live';
  process.env.INTAKE_AISOLAR_URL = 'https://abcdefghijklmnop.supabase.co/functions/v1';
  process.env.INTAKE_SOURCE_KEY = 'src_testdoor_0123456789abcdef';
}

type Seen = { url: string; headers: Record<string, string>; body: unknown };
function mockFetch(answer: (url: string, seen: Seen) => Response | Promise<Response>) {
  const seen: Seen[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input);
    const headers = Object.fromEntries(new Headers(init?.headers).entries());
    const s = { url, headers, body: init?.body ? JSON.parse(String(init.body)) : null };
    seen.push(s);
    return answer(url, s);
  });
  return seen;
}
const jsonRes = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

function callReq(over: Partial<SubmitRequest> = {}): SubmitRequest {
  return {
    source: 'website_qualified', intent: 'call', bestTime: null, name: 'Mary Byrne', email: 'mary@example.ie', phone: '087 123 4567',
    eircode: null, county: null, address: null, mprn: null, monthlyBill: null, annualKwh: null, quoteToken: null, slot: null, requestedDay: null,
    emailEstimate: false, billRead: null, linkToken: null,
    meta: { segment: 'domestic', businessName: null, door: 'book-survey', page: '/book-survey', src: null, pkg: null, countyContext: null, billPeriod: null, supplier: null, flowId: 'f1' },
    ...over,
  };
}

const freshCall = { ok: true, leadId: '11111111-1111-4111-8111-111111111111', path: 'fresh', booking: { outcome: 'none' }, estimate: null, handoff: null, deviceToken: null, next: 'check_email' };

/* ------------------------------------------------------------------ */
/*  M2: one magic-link token shape, the one AISolar mints               */
/* ------------------------------------------------------------------ */

describe('magic-link tokens (M2)', () => {
  it('accepts exactly the 64-hex shape agent-drain mints (two UUIDs, dashes out), any case, trimmed', () => {
    const minted = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '');
    expect(LINK_TOKEN.test(minted)).toBe(true);
    expect(parseLinkToken(minted)).toBe(minted);
    expect(parseLinkToken(`  ${minted.toUpperCase()} `)).toBe(minted);
  });
  it('refuses anything else: base64url, short, long, non-strings', () => {
    for (const bad of ['A'.repeat(40) + '_-', 'a'.repeat(63), 'a'.repeat(65), 'g'.repeat(64), '', null, 42, undefined]) expect(parseLinkToken(bad)).toBeNull();
  });
  it('a mangled link never fails the submit: it is dropped and the call goes through as a fresh one', async () => {
    setLive();
    const seen = mockFetch(() => jsonRes(freshCall));
    const { POST } = await import('@/app/api/intake/submit/route');
    const res = await POST(new Request('http://localhost/api/intake/submit', { method: 'POST', headers: { 'x-idempotency-key': KEY }, body: JSON.stringify(callReq({ linkToken: 'AbC_-'.repeat(8) })) }));
    expect(res.status).toBe(200);
    expect(seen).toHaveLength(1);
    expect(seen[0].body).not.toHaveProperty('leadToken');
    expect(seen[0].headers).not.toHaveProperty('x-access-token');
  });
  it('a real link threads the call: leadToken in the body, the access header too', async () => {
    setLive();
    const seen = mockFetch(() => jsonRes({ ...freshCall, path: 'threaded' }));
    const { POST } = await import('@/app/api/intake/submit/route');
    const res = await POST(new Request('http://localhost/api/intake/submit', { method: 'POST', headers: { 'x-idempotency-key': KEY }, body: JSON.stringify(callReq({ linkToken: HEX('e') })) }));
    expect(res.status).toBe(200);
    expect(seen[0].body).toMatchObject({ leadToken: HEX('e') });
    expect(seen[0].headers['x-access-token']).toBe(HEX('e'));
  });
  it('the ingest body never carries a non-hex link', () => {
    expect(toIngestBody(callReq({ linkToken: 'x'.repeat(64) }), null)).not.toHaveProperty('leadToken');
  });
});

/* ------------------------------------------------------------------ */
/*  H1: a misconfigured live intake is never silent                     */
/* ------------------------------------------------------------------ */

describe('misconfigured intake (H1)', () => {
  it('names which variable is wrong, never its value', async () => {
    const { intakeMisconfig } = await import('@/lib/intake/mode');
    expect(intakeMisconfig()).toEqual([]);
    process.env.INTAKE_CONTRACT_MODE = 'live';
    expect(intakeMisconfig()).toEqual(['INTAKE_AISOLAR_URL is missing', 'INTAKE_SOURCE_KEY is missing']);
    process.env.INTAKE_AISOLAR_URL = 'http://secret-host.example/functions/v1';
    process.env.INTAKE_SOURCE_KEY = 'short';
    const p = intakeMisconfig();
    expect(p).toHaveLength(2);
    expect(p.join(' ')).not.toContain('secret-host');
    expect(p.join(' ')).not.toContain('short');
    setLive();
    expect(intakeMisconfig()).toEqual([]);
    delete process.env.INTAKE_CONTRACT_MODE;
    process.env.VERCEL_ENV = 'production';
    expect(intakeMisconfig()).toEqual(['INTAKE_CONTRACT_MODE is missing on production']);
  });

  it('logs once per cold start and alerts the owner at most once an hour', async () => {
    const { reportMisconfig, resetMisconfigReport, ALERT_EVERY_MS } = await import('@/lib/intake/misconfig');
    resetMisconfigReport();
    process.env.INTAKE_CONTRACT_MODE = 'live';
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const sent: string[] = [];
    const alert = { send: async (s: string) => (sent.push(s), true) };
    const defer = (p: Promise<unknown>) => void p;
    const t0 = 1_800_000_000_000;
    reportMisconfig({ alert, now: t0, defer });
    reportMisconfig({ alert, now: t0 + 60_000, defer });
    reportMisconfig({ alert, now: t0 + ALERT_EVERY_MS - 1, defer });
    await Promise.resolve();
    expect(err).toHaveBeenCalledTimes(1);
    expect(String(err.mock.calls[0][0])).toContain('INTAKE_AISOLAR_URL is missing');
    expect(sent).toEqual(['Website intake is OFF: a setting is wrong']);
    reportMisconfig({ alert, now: t0 + ALERT_EVERY_MS + 1, defer });
    await Promise.resolve();
    expect(sent).toHaveLength(2);
    expect(err).toHaveBeenCalledTimes(1);
    resetMisconfigReport();
  });

  it('a route behind the gate reports it and answers 503', async () => {
    const { resetMisconfigReport } = await import('@/lib/intake/misconfig');
    resetMisconfigReport();
    process.env.INTAKE_CONTRACT_MODE = 'live';
    process.env.POSTMARK_SERVER_TOKEN = 'pm-test';
    process.env.OWNER_ALERT_EMAIL = 'owner@example.ie';
    process.env.OWNER_ALERT_FROM = 'site@example.ie';
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const seen = mockFetch(() => jsonRes({ ErrorCode: 0 }));
    const { GET } = await import('@/app/api/intake/config/route');
    const res = await GET(new Request('http://localhost/api/intake/config'));
    expect(res.status).toBe(503);
    await new Promise((r) => setTimeout(r, 10));
    expect(err).toHaveBeenCalled();
    expect(seen.filter((s) => s.url.includes('postmarkapp'))).toHaveLength(1);
    resetMisconfigReport();
  });
});
