import { NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/leadBridge';
import { isValidEircode } from '@/lib/eircode';
import { lookupEircode } from '@/lib/eircodeLookup';

/**
 * GET /api/eircode?code=D02X285
 *
 * Resolves a valid Eircode to the home it belongs to via Google Geocoding
 * (server-side key, never shipped to the browser). Returns address, county
 * and coordinates so the intake can confirm "that's the one we'll survey"
 * and the lead lands in AISolar with a real county attached.
 *
 * Degrades honestly: no key or no match returns ok:false and the UI simply
 * keeps its format-validation hint. The lookup itself lives in
 * lib/eircodeLookup.ts, shared with the intake's /api/intake/eircode.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const raw = searchParams.get('code') || '';
    if (!isValidEircode(raw)) {
      return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
    }
    const r = await lookupEircode(raw);
    if (r.kind === 'unavailable') return NextResponse.json({ ok: false, reason: 'unavailable' });
    return NextResponse.json(r.value);
  } catch (error) {
    console.error('[eircode] lookup failed:', error);
    return NextResponse.json({ ok: false, reason: 'error' });
  }
}
