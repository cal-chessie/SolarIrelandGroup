import { gate, json, readJson } from '@/lib/intake/http';
import type { Segment, SlotsResponse } from '@/lib/intake/contract';
import { liveMode } from '@/lib/intake/mode';
import { adaptSlots } from '@/lib/intake/live/adapt';
import { callAISolar, visitorHeaders } from '@/lib/intake/live/client';
import { STUB_SETTINGS } from '@/lib/intake/stub/settings';
import { stubSlotDays, todayDublin } from '@/lib/intake/stub/slots';
import { cookieValue, scenarioOf } from '@/lib/intake/stub/state';

/**
 * POST /api/intake/slots
 *
 * survey-availability (backend-spec 3.4): { from, days, segment } in, only
 * free slots out, grouped by day. A full day is left out. Never names a
 * surveyor to an anonymous caller.
 *
 * Live: AISolar's survey-availability. This browser's own live hold (the
 * HttpOnly si_hold cookie) is passed along so the time it is holding still
 * shows as free to it, and to nobody else.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEX64 = /^[a-f0-9]{64}$/;

export async function POST(request: Request) {
  const blocked = gate(request);
  if (blocked) return blocked;

  const body = (await readJson(request)) as { from?: string; days?: number; segment?: string } | null;
  const segment: Segment = body?.segment === 'commercial' ? 'commercial' : 'domestic';
  const from = typeof body?.from === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.from) ? body.from : todayDublin();
  const days = Math.min(Math.max(Number(body?.days) || 14, 1), 31);

  const env = liveMode();
  if (env) {
    const hold = cookieValue(request, 'si_hold');
    const r = await callAISolar(env, 'survey-availability', {
      method: 'POST',
      body: { from, days, segment, ...(hold && HEX64.test(hold) ? { holdToken: hold } : {}) },
      headers: visitorHeaders(env, request),
      timeoutMs: 8000,
    });
    const a = adaptSlots(r);
    if (a.note) console.error('[intake slots]', a.note);
    return json(a.body, a.status);
  }

  const scenario = scenarioOf(request);
  if (scenario === 'times_down') return json({ ok: false, error: 'server_error' }, 503);
  const S = STUB_SETTINGS.survey;
  const res: SlotsResponse = {
    timezone: S.timezone,
    visitMinutes: segment === 'commercial' ? S.businessVisitMinutes : S.visitMinutes,
    settingsUpdatedAt: STUB_SETTINGS.settingsUpdatedAt,
    days: scenario === 'no_times' ? [] : stubSlotDays(from, days, segment, { ignoreHoldToken: cookieValue(request, 'si_hold') }),
  };
  return json(res);
}
