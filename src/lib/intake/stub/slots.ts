/**
 * STUB ONLY. A deterministic survey slot grid that follows DECISIONS 3:
 * Mon to Fri 9am, 11:30am and 2pm; Saturday 9am and 11:30am; cap 3 a day;
 * 18 hours notice; 14 days ahead; Irish public holidays closed. Each slot is
 * the start of a 2-hour arrival window.
 *
 * A fixed hash marks about one slot in five as already taken, so the quiet
 * empty cells and the "slot taken" paths can be seen without any database.
 * The same date always gives the same grid.
 */
import type { Segment, Slot, SlotDay } from '@/lib/intake/contract';
import { addDays, dayShort, dublinDate, dublinWallToUtc, hhmmLabel, weekdayIndex } from '@/lib/intake/format';
import { STUB_SETTINGS } from './settings';
import { liveHolds } from './state';

const SV = STUB_SETTINGS.survey;

function fnv(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** About one in five fixture slots is "already booked by someone else". */
export function fixtureTaken(date: string, hhmm: string): boolean {
  return fnv(`${date}T${hhmm}`) % 5 === 0;
}

function timesFor(date: string): readonly string[] {
  const wd = weekdayIndex(date);
  if (wd === 0) return SV.startTimes.sunday;
  if (wd === 6) return SV.startTimes.saturday;
  return SV.startTimes.weekday;
}

export function todayDublin(): string {
  return dublinDate(new Date());
}

/** Every slot the calendar allows (before taken and holds), for checking a submitted time. */
export function gridSlot(startsAt: string): Slot | null {
  const t = new Date(startsAt);
  if (Number.isNaN(t.getTime())) return null;
  const date = dublinDate(t);
  for (const hhmm of timesFor(date)) {
    const start = dublinWallToUtc(date, hhmm);
    if (start.getTime() === t.getTime()) {
      return {
        startsAt: start.toISOString(),
        endsAt: new Date(start.getTime() + SV.arrivalWindowMinutes * 60000).toISOString(),
        label: hhmmLabel(hhmm),
      };
    }
  }
  return null;
}

export function stubSlotDays(from: string, days: number, _segment: Segment, opts: { ignoreHoldToken?: string | null } = {}): SlotDay[] {
  const today = todayDublin();
  const last = addDays(today, SV.maxDaysAhead);
  const earliest = Date.now() + SV.minNoticeHours * 3600000;
  const holds = liveHolds();
  const out: SlotDay[] = [];
  const start = from < today ? today : from;
  for (let i = 0; i < Math.min(days, 31); i += 1) {
    const date = addDays(start, i);
    if (date > last) break;
    if ((SV.closedDates as readonly string[]).includes(date)) continue;
    const slots: Slot[] = [];
    for (const hhmm of timesFor(date)) {
      const s = dublinWallToUtc(date, hhmm);
      if (s.getTime() < earliest) continue;
      if (fixtureTaken(date, hhmm)) continue;
      const iso = s.toISOString();
      const hold = holds.get(iso);
      if (hold && hold.token !== opts.ignoreHoldToken) continue;
      slots.push({
        startsAt: iso,
        endsAt: new Date(s.getTime() + SV.arrivalWindowMinutes * 60000).toISOString(),
        label: hhmmLabel(hhmm),
      });
    }
    if (slots.length) out.push({ date, label: dayShort(date), slots });
  }
  return out;
}

/** The three nearest free slots after a given time (ux-spec 8, "slot taken"). */
export function alternativesAfter(startsAt: string, segment: Segment): Slot[] {
  const all = stubSlotDays(todayDublin(), SV.maxDaysAhead + 1, segment).flatMap((d) => d.slots);
  const t = new Date(startsAt).getTime();
  const after = all.filter((s) => new Date(s.startsAt).getTime() > t);
  const pool = after.length >= 3 ? after : all.filter((s) => s.startsAt !== startsAt);
  return pool.slice(0, 3);
}
