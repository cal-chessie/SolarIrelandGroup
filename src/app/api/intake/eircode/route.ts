import { gate, json } from '@/lib/intake/http';
import { isValidEircode, normaliseEircode } from '@/lib/eircode';
import { routingArea } from '@/lib/intake/routingKeys';
import { scenarioOf } from '@/lib/intake/stub/state';
import type { EircodeResponse } from '@/lib/intake/contract';

/**
 * GET /api/intake/eircode?code=D06X285
 *
 * The intake's address lookup. Stub mode answers from the routing key with a
 * sample address, so no Google Geocoding call (and no paid key) is used while
 * the intake is built. The live wiring hands this to the existing lookup in
 * /api/eircode, unchanged.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const blocked = gate(request, 60);
  if (blocked) return blocked;

  const code = new URL(request.url).searchParams.get('code') || '';
  if (!isValidEircode(code)) return json({ ok: false, reason: 'invalid' } satisfies EircodeResponse, 400);
  if (scenarioOf(request) === 'eircode_down') return json({ ok: false, reason: 'unavailable' } satisfies EircodeResponse);

  const area = routingArea(normaliseEircode(code));
  if (!area) return json({ ok: false, reason: 'not_found' } satisfies EircodeResponse);
  const street = area.area === 'Dublin 6' ? '12 Main Street, Rathmines' : '12 Main Street';
  return json({ ok: true, address: `${street}, ${area.area}`, county: area.county } satisfies EircodeResponse);
}
