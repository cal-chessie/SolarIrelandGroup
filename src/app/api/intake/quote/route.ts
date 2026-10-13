import { gate, json, readJson } from '@/lib/intake/http';
import { quoteMany, validateQuoteRequest } from '@/lib/intake/stub/quote';
import { scenarioOf } from '@/lib/intake/stub/state';

/**
 * POST /api/intake/quote
 *
 * The intake-quote contract (backend-spec 1.5): 1 to 8 PII-free requests in,
 * figures, provenance and a signed quote token out. The six bill chips can be
 * priced in one round trip.
 *
 * Stub: the site's frozen engine (src/lib/estimate.ts) with Cal's 13 Oct
 * settings. Live (slices 1 and 2): a server-to-server call to AISolar's
 * intake-quote with the source key, same shapes, no UI change.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const blocked = gate(request);
  if (blocked) return blocked;
  if (scenarioOf(request) === 'quote_down') return json({ ok: false, error: 'server_error' }, 503);

  const body = await readJson(request);
  const v = validateQuoteRequest(body);
  if (!v.ok) return json({ ok: false, error: v.error, detail: v.detail }, 400);
  return json(quoteMany(v.items));
}
