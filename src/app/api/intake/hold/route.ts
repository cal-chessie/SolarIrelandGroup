import { randomUUID } from 'node:crypto';
import { gate, json, readJson } from '@/lib/intake/http';
import type { HoldResponse, Segment } from '@/lib/intake/contract';
import { dublinDate, wallTime } from '@/lib/intake/format';
import { STUB_SETTINGS } from '@/lib/intake/stub/settings';
import { alternativesAfter, fixtureTaken, gridSlot } from '@/lib/intake/stub/slots';
import { cookieValue, liveHolds, scenarioOf, store } from '@/lib/intake/stub/state';

/**
 * POST /api/intake/hold
 *
 * The quiet 10-minute hold (DECISIONS 3, backend-spec 3.5 hold_survey_slot).
 * { action: 'hold', startsAt, segment } places it and returns a hold token;
 * { action: 'release', holdToken } lets it go (back, timeout, another choice).
 * One live hold per visitor: a new hold releases the old one. Nothing about
 * the hold is ever shown to the homeowner.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE = 'si_hold';

function withHoldCookie(body: HoldResponse, token: string | null) {
  const res = json(body);
  const maxAge = token ? STUB_SETTINGS.survey.holdMinutes * 60 : 0;
  res.headers.append(
    'set-cookie',
    `${COOKIE}=${token ?? ''}; Path=/api/intake; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  );
  return res;
}

export async function POST(request: Request) {
  const blocked = gate(request, 60);
  if (blocked) return blocked;

  const body = (await readJson(request)) as { action?: string; startsAt?: string; segment?: string; holdToken?: string } | null;
  const holds = liveHolds();
  const mine = body?.holdToken || cookieValue(request, COOKIE);

  if (body?.action === 'release') {
    if (mine) for (const [k, v] of holds) if (v.token === mine) holds.delete(k);
    return withHoldCookie({ ok: true, released: true }, null);
  }

  if (body?.action !== 'hold' || typeof body.startsAt !== 'string') {
    return json({ ok: false, error: 'invalid' }, 400);
  }
  const segment: Segment = body.segment === 'commercial' ? 'commercial' : 'domestic';
  const slot = gridSlot(body.startsAt);
  const iso = slot?.startsAt;
  const tooSoon = slot ? new Date(slot.startsAt).getTime() < Date.now() + STUB_SETTINGS.survey.minNoticeHours * 3600000 : true;
  const takenByFixture = slot ? fixtureTaken(dublinDate(slot.startsAt), wallTime(slot.startsAt)) : true;
  const existing = iso ? holds.get(iso) : undefined;
  const heldByOther = (!!existing && existing.token !== mine) || [...store().devices.values()].some((d) => d.booking?.startsAt === iso);

  if (!slot || !iso || tooSoon || takenByFixture || heldByOther || scenarioOf(request) === 'hold_taken') {
    return json({ ok: false, outcome: 'slot_unavailable', alternatives: alternativesAfter(body.startsAt, segment) } satisfies HoldResponse);
  }

  // One live hold per visitor.
  if (mine) for (const [k, v] of holds) if (v.token === mine) holds.delete(k);
  const token = randomUUID();
  const expiresAt = Date.now() + STUB_SETTINGS.survey.holdMinutes * 60000;
  holds.set(iso, { token, expiresAt });
  return withHoldCookie({ ok: true, holdToken: token, startsAt: iso, expiresAt: new Date(expiresAt).toISOString() }, token);
}
