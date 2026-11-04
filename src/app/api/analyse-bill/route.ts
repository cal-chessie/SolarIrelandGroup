import { NextResponse } from 'next/server';
import type { AnalyserFailure, AnalyserRead, AnalyserResponse } from '@/lib/intake/contract';
import { intakeMode } from '@/lib/intake/mode';
import { scenarioOf, sleep } from '@/lib/intake/stub/state';
import { ANALYSER_PROMPT, anonymousOf, canPrice, isNotABill, toAnalyserRead } from '@/lib/analyser/read';
import { STUB_FAILURES, STUB_READS } from '@/lib/analyser/stub';

/**
 * POST /api/analyse-bill  (multipart, field "bill": a photo, screenshot or PDF)
 *
 * Cal's Bill Analyser, rebuilt for the call funnel (4 Nov 2026). It READS the
 * bill and nothing else: every field comes back as printed or null, and the
 * saving is priced by /api/intake/quote, the same AISolar quote the manual
 * side shows, so one bill has one number (CALL-FUNNEL-PLAN ruling 1). The old
 * route's own maths, its supplier-table rates shown as the customer's, and
 * its "160" and "4800" stand-ins are gone (ruling 2).
 *
 * What happens to the file, exactly (the privacy line on the page says this
 * and no more):
 *   1. It is held in this server's memory for this one request. It is never
 *      written to disk, logged, or kept after the answer goes back.
 *   2. It is sent to OpenRouter (the AI reading service, model
 *      BILL_VISION_MODEL, default google/gemini-2.5-flash) to pick out the
 *      figures. What OpenRouter and the model provider retain is governed by
 *      that account's settings, which no code here can see, so the page makes
 *      no promise about them.
 *   3. The figures come back to the visitor's browser, including the name,
 *      Eircode, MPRN and address if printed. Those personal fields leave the
 *      browser only if the visitor books the call (they ride on that request).
 *   4. Anonymous figures (supplier, rates, standing charge, units, the bill
 *      as a monthly figure) go to AISolar's bill dataset, with no name,
 *      address, Eircode, MPRN, image or lead reference
 *      (docs/memory/12-the-bill-dataset.md).
 *
 * STUB mode (INTAKE_CONTRACT_MODE=stub, never production): the file is
 * checked for size and type and discarded unread. Nothing goes to OpenRouter
 * or AISolar. The answer is a fixture chosen by the si_stub_scenario cookie.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']);
const READ_TIMEOUT_MS = 45_000;

// Best-effort per-IP throttle, per serverless instance. Each read costs a
// vision call, so it stays tight.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitHits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateLimitHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  rateLimitHits.set(ip, hits);
  if (rateLimitHits.size > 5000) rateLimitHits.clear();
  return hits.length > RATE_LIMIT_MAX;
}

const answer = (body: AnalyserResponse, status = 200) => NextResponse.json(body, { status, headers: { 'cache-control': 'no-store' } });
const fail = (reason: AnalyserFailure, status: number, partial: Partial<AnalyserRead> | null = null) => answer({ ok: false, reason, partial }, status);

/** The fields worth carrying to the manual side when a read cannot be priced. */
function partialOf(read: AnalyserRead): Partial<AnalyserRead> | null {
  const out: Partial<AnalyserRead> = {};
  for (const [k, v] of Object.entries(read)) if (v !== null) (out as Record<string, unknown>)[k] = v;
  return Object.keys(out).length ? out : null;
}

export async function POST(request: Request) {
  if (isRateLimited(clientIp(request))) return fail('rate_limited', 429);

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get('bill');
    file = f instanceof File ? f : null;
  } catch {
    file = null;
  }
  if (!file) return fail('unreadable', 400);
  if (file.size > MAX_FILE_BYTES) return fail('too_big', 413);
  const mime = (file.type || 'image/jpeg').toLowerCase();
  if (!TYPES.has(mime)) return fail('wrong_type', 415);

  if (intakeMode() === 'stub') {
    // The bytes are not read, not kept and not sent anywhere.
    const scenario = scenarioOf(request) || 'default';
    await sleep(scenario === 'bill_timeout' ? 3000 : scenario === 'bill_slow' ? 13_500 : 1800);
    const f = STUB_FAILURES[scenario];
    if (f) return fail(f.reason, f.status, f.partial);
    return answer({ ok: true, read: STUB_READS[scenario] ?? STUB_READS.default });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return fail('offline', 503);

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0) return fail('unreadable', 400);
  if (bytes.length > MAX_FILE_BYTES) return fail('too_big', 413);

  const model = process.env.BILL_VISION_MODEL || 'google/gemini-2.5-flash';
  // A PDF goes as a file part, an image as an image part.
  const part =
    mime === 'application/pdf'
      ? { type: 'file', file: { filename: 'bill.pdf', file_data: `data:application/pdf;base64,${bytes.toString('base64')}` } }
      : { type: 'image_url', image_url: { url: `data:${mime};base64,${bytes.toString('base64')}` } };

  let content = '';
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://solarirelandgroup.ie',
        'X-Title': 'Solar Ireland Bill Analyser',
      },
      body: JSON.stringify({ model, temperature: 0, messages: [{ role: 'user', content: [{ type: 'text', text: ANALYSER_PROMPT }, part] }] }),
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
    if (res.status === 429) return fail('rate_limited', 429);
    if (!res.ok) {
      console.error('[analyse-bill] reader answered', res.status);
      return fail('offline', 503);
    }
    const data = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string } }[] } | null;
    content = data?.choices?.[0]?.message?.content || '';
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    console.error('[analyse-bill] reader failed:', timedOut ? 'timeout' : 'network');
    return timedOut ? fail('timeout', 504) : fail('offline', 503);
  }

  const m = content.match(/\{[\s\S]*\}/);
  let raw: unknown = null;
  try {
    raw = m ? JSON.parse(m[0]) : null;
  } catch {
    raw = null;
  }
  if (!raw) return fail('unreadable', 200);

  const read = toAnalyserRead(raw);
  if (isNotABill(raw, read)) return fail('not_bill', 200);
  if (!canPrice(read)) return fail('unreadable', 200, partialOf(read));

  // Anonymous, and deliberately not awaited: the visitor never waits for our bookkeeping.
  void recordObservation(anonymousOf(read));
  return answer({ ok: true, read });
}

/**
 * One anonymous reading to the platform (docs/memory/12-the-bill-dataset.md).
 * A fixed set of coarse figures: no name, email, phone, MPRN, Eircode,
 * address, image or lead reference, and no timestamp. Silent by design.
 */
async function recordObservation(o: ReturnType<typeof anonymousOf>): Promise<void> {
  const ingestUrl = process.env.AISOLAR_INGEST_URL;
  const sourceKey = process.env.AISOLAR_SOURCE_KEY;
  if (!ingestUrl || !sourceKey) return;
  const url = ingestUrl.replace(/ingest-lead\/?$/, 'ingest-bill-observation');
  if (url === ingestUrl) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-source-key': sourceKey },
      body: JSON.stringify({ source: 'bill_upload', ...o }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Never surfaces. A dropped observation costs a row, not a customer.
  }
}
