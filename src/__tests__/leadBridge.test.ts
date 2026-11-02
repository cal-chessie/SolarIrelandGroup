import { describe, it, expect, vi, afterEach } from 'vitest';
import { forwardLead } from '@/lib/leadBridge';

// Audit 31: with AISolar unreachable and the fallback store off, the lead must
// not be reported as captured, and it must be logged loudly in full.
describe('forwardLead when nothing can capture the lead', () => {
  const saved = { ...process.env };
  afterEach(() => { process.env = { ...saved }; vi.restoreAllMocks(); });

  it('returns ok:false and logs the lead as LOST with the fallback-off reason', async () => {
    delete process.env.AISOLAR_INGEST_URL;
    delete process.env.AISOLAR_SOURCE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await forwardLead({ brand: 'solar-ireland', source: 'website_survey', name: 'Test Person', email: 't@example.com', phone: '0870000000' });
    expect(r.ok).toBe(false);
    const lost = err.mock.calls.find((c) => String(c[0]).startsWith('[LEAD LOST'));
    expect(lost).toBeTruthy();
    const body = JSON.parse(String(lost?.[1]));
    expect(body.fallback).toMatch(/fallback store OFF/);
    expect(body.email).toBe('t@example.com');
    expect(body.reason).toMatch(/AISOLAR_INGEST_URL/);
  });
});

describe('forwardLead retries a momentary AISolar outage', () => {
  const saved = { ...process.env };
  afterEach(() => { process.env = { ...saved }; vi.restoreAllMocks(); vi.useRealTimers(); });
  const lead = { brand: 'solar-ireland' as const, source: 'website_survey', name: 'Test Person', email: 't@example.com' };

  it('captures the lead when the second try answers', async () => {
    process.env.AISOLAR_INGEST_URL = 'https://ingest.example/lead';
    process.env.AISOLAR_SOURCE_KEY = 'k';
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ leadId: 'L1' }), { status: 200 }));
    vi.useFakeTimers();
    const p = forwardLead(lead);
    await vi.runAllTimersAsync();
    const r = await p;
    expect(r).toEqual({ ok: true, leadId: 'L1' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry a refused key (401)', async () => {
    process.env.AISOLAR_INGEST_URL = 'https://ingest.example/lead';
    process.env.AISOLAR_SOURCE_KEY = 'k';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('no', { status: 401 }));
    const r = await forwardLead(lead);
    expect(r.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
