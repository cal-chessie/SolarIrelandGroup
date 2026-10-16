import { randomBytes, randomUUID } from 'node:crypto';
import { gate, json, readJson } from '@/lib/intake/http';
import type { HoldResponse, Segment } from '@/lib/intake/contract';
import { dublinDate, wallTime } from '@/lib/intake/format';
import { liveMode, type LiveEnv } from '@/lib/intake/mode';
import { adaptHold } from '@/lib/intake/live/adapt';
import { callAISolar, sessionHash, visitorHeaders } from '@/lib/intake/live/client';
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
 *
 * Live: AISolar's survey-hold. "One visitor" is one browser: an HttpOnly
 * session cookie (si_hs, random, this site only) whose keyed hash goes to
 * AISolar as x-session-hash, so two homes behind one mobile network address
 * never release each other's holds.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE = 'si_hold';
const SESSION = 'si_hs';
const HEX64 = /^[a-f0-9]{64}$/;
const secure = () => (process.env.NODE_ENV === 'production' ? '; Secure' : '');

function withHoldCookie(body: HoldResponse, token: string | null, maxAgeSeconds: number, extra: string[] = []) {
  const res = json(body);
  res.headers.append('set-cookie', `${COOKIE}=${token ?? ''}; Path=/api/intake; Max-Age=${token ? maxAgeSeconds : 0}; HttpOnly; SameSite=Lax${secure()}`);
  for (const c of extra) res.headers.append('set-cookie', c);
  return res;
}

async function live(env: LiveEnv, request: Request, body: { action?: string; startsAt?: string; segment?: string; holdToken?: string } | null) {
  const fromBody = typeof body?.holdToken === 'string' && HEX64.test(body.holdToken) ? body.holdToken : null;
  const fromCookie = cookieValue(request, COOKIE);
  const mine = fromBody ?? (fromCookie && HEX64.test(fromCookie) ? fromCookie : null);

  if (body?.action === 'release') {
    if (mine) {
      const r = await callAISolar(env, 'survey-hold', { method: 'POST', body: { action: 'release', holdToken: mine }, headers: visitorHeaders(env, request), timeoutMs: 5000 });
      if (r.status !== 200) console.error('[intake hold] release not confirmed', r.status || r.failure);
    }
    return withHoldCookie({ ok: true, released: true }, null, 0);
  }
  if (body?.action !== 'hold' || typeof body.startsAt !== 'string' || Number.isNaN(Date.parse(body.startsAt))) {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  const known = cookieValue(request, SESSION);
  const newSession = !known || !HEX64.test(known);
  const sid = newSession ? randomBytes(32).toString('hex') : known;
  const segment: Segment = body.segment === 'commercial' ? 'commercial' : 'domestic';
  const r = await callAISolar(env, 'survey-hold', {
    method: 'POST',
    body: { action: 'hold', startsAt: new Date(body.startsAt).toISOString(), segment, ...(mine ? { holdToken: mine } : {}) },
    headers: { ...visitorHeaders(env, request), 'x-session-hash': sessionHash(env, sid) },
    timeoutMs: 6000,
  });
  const a = adaptHold(r);
  if (a.note) console.error('[intake hold]', a.note);
  const sessionCookie = newSession ? [`${SESSION}=${sid}; Path=/api/intake; Max-Age=${24 * 3600}; HttpOnly; SameSite=Lax${secure()}`] : [];
  if (a.status !== 200) {
    const res = json(a.body, a.status);
    for (const c of sessionCookie) res.headers.append('set-cookie', c);
    return res;
  }
  const held = a.body as HoldResponse;
  if (held.ok && 'holdToken' in held) {
    const maxAge = Math.max(Math.round((Date.parse(held.expiresAt) - Date.now()) / 1000), 60);
    return withHoldCookie(held, held.holdToken, maxAge, sessionCookie);
  }
  // Taken: the old hold (if any) was let go by AISolar before it tried this one.
  return withHoldCookie(held, null, 0, sessionCookie);
}

export async function POST(request: Request) {
  const blocked = gate(request, 60);
  if (blocked) return blocked;

  const body = (await readJson(request)) as { action?: string; startsAt?: string; segment?: string; holdToken?: string } | null;
  const env = liveMode();
  if (env) return live(env, request, body);

  const holds = liveHolds();
  const mine = body?.holdToken || cookieValue(request, COOKIE);
  const stubAge = STUB_SETTINGS.survey.holdMinutes * 60;

  if (body?.action === 'release') {
    if (mine) for (const [k, v] of holds) if (v.token === mine) holds.delete(k);
    return withHoldCookie({ ok: true, released: true }, null, stubAge);
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
  return withHoldCookie({ ok: true, holdToken: token, startsAt: iso, expiresAt: new Date(expiresAt).toISOString() }, token, stubAge);
}
