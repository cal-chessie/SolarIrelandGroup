import { NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/leadBridge';

/**
 * GET /api/survey-context?lt=<lead token>
 *
 * Resolves an estimate-email magic link into the prefill subset by calling
 * AISolar's lead-context function server-side (URL derived from the ingest
 * URL, so the AISolar coupling stays out of the browser). The token itself
 * is the auth; a bad or expired link simply returns ok:false and the cold
 * form works as normal.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }
    const { searchParams } = new URL(request.url);
    const lt = searchParams.get('lt') || '';
    if (lt.length < 32 || lt.length > 128) {
      return NextResponse.json({ ok: false }, { status: 400 });
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
    });
  } catch (error) {
    console.error('[survey-context] lookup failed:', error);
    return NextResponse.json({ ok: false });
  }
}
