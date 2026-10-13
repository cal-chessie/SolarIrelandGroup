import { gate, json, readJson } from '@/lib/intake/http';
import type { Segment, SlotsResponse } from '@/lib/intake/contract';
import { STUB_SETTINGS } from '@/lib/intake/stub/settings';
import { stubSlotDays, todayDublin } from '@/lib/intake/stub/slots';
import { cookieValue, scenarioOf } from '@/lib/intake/stub/state';

/**
 * POST /api/intake/slots
 *
 * survey-availability (backend-spec 3.4): { from, days, segment } in, only
 * free slots out, grouped by day. A full day is left out. Never names a
 * surveyor to an anonymous caller.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const blocked = gate(request);
  if (blocked) return blocked;
  const scenario = scenarioOf(request);
  if (scenario === 'times_down') return json({ ok: false, error: 'server_error' }, 503);

  const body = (await readJson(request)) as { from?: string; days?: number; segment?: string } | null;
  const segment: Segment = body?.segment === 'commercial' ? 'commercial' : 'domestic';
  const from = typeof body?.from === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.from) ? body.from : todayDublin();
  const days = Math.min(Math.max(Number(body?.days) || 14, 1), 31);
  const S = STUB_SETTINGS.survey;

  const res: SlotsResponse = {
    timezone: S.timezone,
    visitMinutes: segment === 'commercial' ? S.businessVisitMinutes : S.visitMinutes,
    settingsUpdatedAt: STUB_SETTINGS.settingsUpdatedAt,
    days: scenario === 'no_times' ? [] : stubSlotDays(from, days, segment, { ignoreHoldToken: cookieValue(request, 'si_hold') }),
  };
  return json(res);
}
