/**
 * Intake formatting, shared by the server stub and the browser so every
 * surface writes money, sizes, dates and times the same way.
 *
 * House style (ui-spec 2.3, DECISIONS 3): "€6,400", "4 kWp", "7.3 years",
 * "35c", times 12-hour lowercase ("9am", "11:30am", "2pm"), dates "Sat 17 Oct"
 * in grids and "Saturday 17 October" in sentences. Never a dash: ranges use "to".
 */

export const TZ = 'Europe/Dublin';

const EUR = new Intl.NumberFormat('en-IE', { maximumFractionDigits: 0 });

export function eur(n: number): string {
  return '€' + EUR.format(Math.round(n));
}

export function num(n: number): string {
  return EUR.format(Math.round(n));
}

export function kwp(n: number): string {
  const v = Math.round(n * 10) / 10;
  return `${Number.isInteger(v) ? v : v.toFixed(1)} kWp`;
}

export function years(n: number): string {
  return `${n.toFixed(1)} years`;
}

/** 0.35 -> "35c", 0.422 -> "42.2c" */
export function cents(rateEur: number): string {
  const c = Math.round(rateEur * 1000) / 10;
  return `${Number.isInteger(c) ? c : c.toFixed(1)}c`;
}

/* ------------------------------------------------------------------ */
/*  Dates and times in Irish time                                      */
/* ------------------------------------------------------------------ */

interface Parts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 Sunday .. 6 Saturday
}

const PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  weekday: 'short',
  hourCycle: 'h23',
});

const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function dublinParts(d: Date | string): Parts {
  const date = typeof d === 'string' ? new Date(d) : d;
  const out: Record<string, string> = {};
  for (const p of PARTS.formatToParts(date)) out[p.type] = p.value;
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour) % 24,
    minute: Number(out.minute),
    weekday: WD[out.weekday] ?? 0,
  };
}

/** "2026-10-17" for the Irish calendar day an instant falls on. */
export function dublinDate(d: Date | string): string {
  const p = dublinParts(d);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** The UTC instant for a wall-clock time in Dublin, DST handled. */
export function dublinWallToUtc(date: string, hhmm: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  // Offset of Dublin from UTC at the guessed instant, then correct once.
  const p = dublinParts(new Date(guess));
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  const offset = asUtc - guess;
  return new Date(guess - offset);
}

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** A calendar date string "2026-10-17" read as a plain date (no time zone shift). */
function dateParts(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, wd };
}

export function dayShort(date: string): string {
  const p = dateParts(date);
  return `${DAY_SHORT[p.wd]} ${p.d} ${MON_SHORT[p.m - 1]}`;
}

export function dayLong(date: string): string {
  const p = dateParts(date);
  return `${DAY_LONG[p.wd]} ${p.d} ${MON_LONG[p.m - 1]}`;
}

export function weekdayShort(date: string): string {
  return DAY_SHORT[dateParts(date).wd];
}

export function weekdayLong(date: string): string {
  return DAY_LONG[dateParts(date).wd];
}

export function monthShort(date: string): string {
  return MON_SHORT[dateParts(date).m - 1];
}

export function dayOfMonth(date: string): number {
  return dateParts(date).d;
}

/** 9:00 -> "9am", 11:30 -> "11:30am", 14:00 -> "2pm" */
export function clock(hour: number, minute: number): string {
  const suffix = hour < 12 ? 'am' : 'pm';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0 ? `${h}${suffix}` : `${h}:${String(minute).padStart(2, '0')}${suffix}`;
}

export function timeLabel(iso: string): string {
  const p = dublinParts(iso);
  return clock(p.hour, p.minute);
}

/** "HH:MM" in Dublin, for matching a slot to its grid column. */
export function wallTime(iso: string): string {
  const p = dublinParts(iso);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

export function hhmmLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return clock(h, m);
}

/** "9am to 11am" */
export function windowLabel(startsAt: string, endsAt: string): string {
  return `${timeLabel(startsAt)} to ${timeLabel(endsAt)}`;
}

/** "between 9am and 11am" */
export function betweenLabel(startsAt: string, endsAt: string): string {
  return `between ${timeLabel(startsAt)} and ${timeLabel(endsAt)}`;
}

export function addDays(date: string, n: number): string {
  const p = dateParts(date);
  const t = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

export function weekdayIndex(date: string): number {
  return dateParts(date).wd;
}

/* ------------------------------------------------------------------ */
/*  Contact details                                                    */
/* ------------------------------------------------------------------ */

export function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || '';
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

/** Irish mobile (08x and 10 digits, or +353 8x) or any international number with a plus. */
export function isPhone(v: string): boolean {
  const s = v.replace(/[\s().-]/g, '');
  if (/^(\+353|00353|0)8\d{8}$/.test(s)) return true;
  return /^\+\d{8,15}$/.test(s) && !s.startsWith('+353');
}

/** The 26 counties of the Republic, then the 6 of Northern Ireland. */
export const ROI_COUNTIES = [
  'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
  'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
] as const;

export const NI_COUNTIES = ['Antrim', 'Armagh', 'Down', 'Fermanagh', 'Londonderry', 'Tyrone'] as const;

export function isNorthernIreland(county: string | null | undefined): boolean {
  return !!county && (NI_COUNTIES as readonly string[]).includes(county);
}
