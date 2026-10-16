import { gate, json, readJson } from '@/lib/intake/http';
import { liveMode } from '@/lib/intake/mode';
import { validateQuoteRequest } from '@/lib/intake/validate';
import { adaptQuote } from '@/lib/intake/live/adapt';
import { callAISolar, visitorHeaders } from '@/lib/intake/live/client';
import { quoteMany } from '@/lib/intake/stub/quote';
import { scenarioOf } from '@/lib/intake/stub/state';

/**
 * POST /api/intake/quote
 *
 * The intake-quote contract (backend-spec 1.5): 1 to 8 PII-free requests in,
 * figures, provenance and a signed quote token out. The six bill chips can be
 * priced in one round trip.
 *
 * Live: the request is checked here first (nothing personal can ride along),
 * then priced by AISolar's intake-quote through the intake's door. The site
 * does no maths: the figures on screen are AISolar's, field for field.
 * Stub: the site's frozen engine (src/lib/estimate.ts) with Cal's 13 Oct
 * settings, never on production.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const blocked = gate(request);
  if (blocked) return blocked;
  const env = liveMode();
  if (!env && scenarioOf(request) === 'quote_down') return json({ ok: false, error: 'server_error' }, 503);

  const body = await readJson(request);
  const v = validateQuoteRequest(body);
  if (!v.ok) return json({ ok: false, error: v.error, detail: v.detail }, 400);

  if (env) {
    const r = await callAISolar(env, 'intake-quote', { method: 'POST', body: { requests: v.items }, headers: visitorHeaders(env, request), timeoutMs: 8000 });
    const a = adaptQuote(r, v.items.length);
    if (a.note) console.error('[intake quote]', a.note);
    return json(a.body, a.status);
  }
  return json(quoteMany(v.items));
}
