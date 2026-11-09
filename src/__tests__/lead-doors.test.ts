/**
 * D (12/10 brief): no lead door drops a lead silently. /api/contact and
 * /api/lead either reach AISolar (or the site's own fallback table), or
 * answer an error the page shows, with the phone number in it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as contact } from '@/app/api/contact/route';
import { POST as lead } from '@/app/api/lead/route';
import { SOLAR_DATA } from '@/lib/solar-data';

const KEYS = ['AISOLAR_INGEST_URL', 'AISOLAR_SOURCE_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
let saved: Record<string, string | undefined> = {};
let ip = 0;
beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  for (const k of KEYS) (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k]));
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const req = (url: string, body: unknown) =>
  new Request(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${++ip}` },
    body: JSON.stringify(body),
  });
const CONTACT = { name: 'Mary Test', email: 'mary.test@example.ie', phone: '087 123 4567', message: 'Thinking about panels for the house.' };
const LEAD = { source: 'exit_intent', email: 'mary.test@example.ie' };

describe('/api/contact', () => {
  it('reaches AISolar with the source key when it answers', async () => {
    process.env.AISOLAR_INGEST_URL = 'https://x.supabase.co/functions/v1/ingest-lead';
    process.env.AISOLAR_SOURCE_KEY = 'src_test';
    const f = vi.fn(async () => new Response(JSON.stringify({ leadId: 'L1' }), { status: 200 }));
    vi.stubGlobal('fetch', f);
    const r = await contact(req('/api/contact', CONTACT) as never);
    expect(r.status).toBe(200);
    expect(f).toHaveBeenCalledOnce();
    const [, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)['x-source-key']).toBe('src_test');
    expect(JSON.parse(String(init.body)).source).toBe('website_contact');
  });
  it('AISolar down and no fallback: a visible error with the phone number, never a fake success', async () => {
    process.env.AISOLAR_INGEST_URL = 'https://x.supabase.co/functions/v1/ingest-lead';
    process.env.AISOLAR_SOURCE_KEY = 'src_test';
    vi.stubGlobal('fetch', vi.fn(async () => new Response('down', { status: 503 })));
    const r = await contact(req('/api/contact', CONTACT) as never);
    expect(r.status).toBe(502);
    expect((await r.json()).error).toContain(SOLAR_DATA.provider.phone);
  });
  it('nothing configured at all: still an error, never a silent 200', async () => {
    const r = await contact(req('/api/contact', CONTACT) as never);
    expect(r.status).toBe(502);
  });
  it('a broken body is an error with the phone number', async () => {
    const bad = new Request('http://localhost/api/contact', { method: 'POST', headers: { 'x-forwarded-for': '10.9.9.9' }, body: '{' });
    const r = await contact(bad as never);
    expect(r.status).toBe(500);
    expect((await r.json()).error).toContain(SOLAR_DATA.provider.phone);
  });
});

describe('/api/lead (exit popup, chat pre-screen)', () => {
  it('AISolar down and no fallback: 502 with the phone number', async () => {
    process.env.AISOLAR_INGEST_URL = 'https://x.supabase.co/functions/v1/ingest-lead';
    process.env.AISOLAR_SOURCE_KEY = 'src_test';
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network'); }));
    const r = await lead(req('/api/lead', LEAD));
    expect(r.status).toBe(502);
    expect((await r.json()).error).toContain(SOLAR_DATA.provider.phone);
  });
  it('reaches AISolar when it answers', async () => {
    process.env.AISOLAR_INGEST_URL = 'https://x.supabase.co/functions/v1/ingest-lead';
    process.env.AISOLAR_SOURCE_KEY = 'src_test';
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ leadId: 'L2' }), { status: 200 })));
    const r = await lead(req('/api/lead', LEAD));
    expect(r.status).toBe(200);
    expect((await r.json()).leadId).toBe('L2');
  });
});
