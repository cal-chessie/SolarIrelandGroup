import { NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/leadBridge';
import { intakeMode } from '@/lib/intake/mode';
import { stubLinkContext } from '@/lib/intake/stub/linkContext';
import { parseLinkToken } from '@/lib/intake/linkToken';

/**
 * POST /api/survey-context   { "lt": "<lead token>" }
 *
 * POST, never GET (M6, 9 Nov review): the token is the homeowner's key to
 * their own details, so it stays out of URLs, access logs and Referer headers.
 *
 * Resolves an estimate-email magic link into the prefill subset by calling
 * AISolar's lead-context function server-side (URL derived from the ingest
 * URL, so the AISolar coupling stays out of the browser). The token itself
 * is the auth; a bad or expired link simply returns ok:false and the cold
 * form works as normal.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Calls AISolar with its own deadlines (submit: up to 12s + 0.8s + 9s, then the outbox); 60s is the plan's
// ceiling the other AISolar routes already use, so a slow answer is never cut off by the platform first.
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }
    const body = (await request.json().catch(() => null)) as { lt?: unknown } | null;
    const lt = parseLinkToken(body?.lt);
    if (!lt) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Stub (never production): fixture links, so the call ask can be built and shot.
    if (intakeMode() === 'stub') {
      const fx = stubLinkContext(lt);
      return NextResponse.json(fx ? { ok: true, ...fx } : { ok: false });
    }

    const ingestUrl = process.env.AISOLAR_INGEST_URL;
    if (!ingestUrl) return NextResponse.json({ ok: false });
    const contextUrl = ingestUrl.replace(/ingest-lead\/?$/, 'lead-context');
    if (contextUrl === ingestUrl) return NextResponse.json({ ok: false });

    const res = await fetch(contextUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: lt }),
      signal: AbortSignal.timeout(8_000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return NextResponse.json({ ok: false });

    return NextResponse.json({
      ok: true,
      name: data.name ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      eircode: data.eircode ?? null,
      address: data.address ?? null,
      county: data.county ?? null,
      monthlyBill: data.monthlyBill ?? null,
      // Home vs business, so the booking form can auto-select the business variant
      // for a commercial lead. Null until AISolar lead-context returns it; the
      // booking form treats null as home, so this is safe before that ships.
      segment: data.segment ?? null,
    });
  } catch (error) {
    console.error('[survey-context] lookup failed:', error);
    return NextResponse.json({ ok: false });
  }
}
