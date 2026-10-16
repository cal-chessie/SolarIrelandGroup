/**
 * Eircode to address, through Google Geocoding (server-side key, never shipped
 * to the browser). One implementation for /api/eircode and the intake's live
 * /api/intake/eircode, so the two lookups can never drift apart.
 *
 * Degrades honestly: no key, no match or an error each say so; nothing is made
 * up. Server only.
 */
import { normaliseEircode } from '@/lib/eircode';

export interface ResolvedEircode {
  ok: boolean;
  address?: string;
  county?: string;
  lat?: number;
  lng?: number;
}

export type LookupResult =
  | { kind: 'found'; value: ResolvedEircode }
  | { kind: 'not_found'; value: ResolvedEircode }
  | { kind: 'unavailable' };

// Per-instance cache: eircodes are immutable, quota is not.
const cache = new Map<string, ResolvedEircode>();

/** The caller has already checked the code with isValidEircode. Throws only on a network or parse failure. */
export async function lookupEircode(raw: string): Promise<LookupResult> {
  const code = normaliseEircode(raw);
  const cached = cache.get(code);
  if (cached) return cached.ok ? { kind: 'found', value: cached } : { kind: 'not_found', value: cached };

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return { kind: 'unavailable' };

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(code)}&region=ie&components=country:IE&key=${key}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  const data = await res.json().catch(() => null);

  const first = data?.status === 'OK' ? data.results?.[0] : null;
  if (!first) {
    const miss: ResolvedEircode = { ok: false };
    cache.set(code, miss);
    return { kind: 'not_found', value: miss };
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
  return { kind: 'found', value: result };
}
