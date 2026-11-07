import { NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/leadBridge';
import { isValidEircode, normaliseEircode } from '@/lib/eircode';

/**
 * GET /api/eircode?code=D02X285
 *
 * Resolves a valid Eircode to the home it belongs to via Google Geocoding
 * (server-side key, never shipped to the browser). Returns address, county
 * and coordinates so the intake can confirm "that's the one we'll survey"
 * and the lead lands in AISolar with a real county attached.
 *
 * Degrades honestly: no key or no match returns ok:false and the UI simply
 * keeps its format-validation hint.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Per-instance cache: eircodes are immutable, quota is not.
const cache = new Map<string, ResolvedEircode>();

interface ResolvedEircode {
  ok: boolean;
  address?: string;
  county?: string;
  lat?: number;
  lng?: number;
}

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
    const code = normaliseEircode(raw);

    const cached = cache.get(code);
    if (cached) return NextResponse.json(cached);

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) return NextResponse.json({ ok: false, reason: 'unavailable' });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(code)}&region=ie&components=country:IE&key=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    const data = await res.json().catch(() => null);

    const first = data?.status === 'OK' ? data.results?.[0] : null;
    if (!first) {
      const miss: ResolvedEircode = { ok: false };
      cache.set(code, miss);
      return NextResponse.json(miss);
    }

    const countyRaw = (first.address_components || []).find(
      (c: { types: string[]; long_name: string }) => c.types.includes('administrative_area_level_1')
    )?.long_name as string | undefined;

    const result: ResolvedEircode = {
      ok: true,
      address: first.formatted_address as string,
      county: countyRaw ? countyRaw.replace(/^County\s+/i, '') : undefined,
      lat: first.geometry?.location?.lat,
      lng: first.geometry?.location?.lng,
    };
    cache.set(code, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[eircode] lookup failed:', error);
    return NextResponse.json({ ok: false, reason: 'error' });
  }
}
