/**
 * The Bill Analyser's read: the vision model's JSON, reduced to what the
 * analyser may show (contract.ts AnalyserRead). Pure, so every rule is tested
 * (src/__tests__/analyser.test.ts).
 *
 * The rules (analyser-cro-spec.md 6 and 10, CALL-FUNNEL-PLAN.md ruling 2):
 *   - Every figure is read off the bill or null. No default, no supplier
 *     table, no "160" or "4800" standing in for a figure the reader missed.
 *   - The only arithmetic is a unit conversion of printed values: the days
 *     between the printed dates, a daily standing charge to a year, and a
 *     yearly use worked out from this bill's units over its days (tagged
 *     "worked out from this bill", never "from your bill").
 *   - The bill amount is a period total. Whether it covers one month or two
 *     comes from the printed dates. With no dates the period is unknown and
 *     the page asks; a two-month bill is never shown as a month.
 *   - Personal fields (name, Eircode, MPRN, address) are kept only when they
 *     look right, and leave this server only in the visitor's own browser.
 */
import type { AnalyserRead, Segment } from '@/lib/intake/contract';
import { formatEircode, isValidEircode, normaliseEircode } from '@/lib/eircode';

export const ANALYSER_PROMPT = `You are reading a photo, screenshot or PDF of an Irish electricity bill.
Return ONLY a JSON object with these fields, copied exactly as printed. Use null for anything you cannot see clearly. Never guess, never estimate, never work anything out.
{
  "isElectricityBill": true if this is an electricity bill, false if it is anything else (a gas bill, a letter, a receipt, a photo of something else),
  "supplier": "the electricity supplier's name as printed",
  "periodStart": "the first day of the billing period, YYYY-MM-DD",
  "periodEnd": "the last day of the billing period, YYYY-MM-DD",
  "amountDueEur": "the total charge for this billing period in euro, including VAT, as a number",
  "unitRateEur": "the price per kWh in euro for the day rate, or the 24 hour rate on a single rate bill, before VAT if both are shown, as a number, e.g. 0.3804",
  "nightRateEur": "the price per kWh in euro for the night rate, or null if there is no night rate",
  "standingChargeEur": "the standing charge amount as printed, as a number",
  "standingChargeUnit": "per_day, per_period or per_year, whichever the bill states for that amount",
  "dayKwh": "kWh used at the day rate in this billing period, or null on a single rate bill",
  "nightKwh": "kWh used at the night rate in this billing period, or null",
  "totalKwh": "total kWh used in this billing period",
  "annualKwh": "a yearly consumption figure in kWh ONLY if the bill prints one, else null",
  "accountName": "the account holder's name exactly as printed, or null",
  "isBusiness": true if the account is clearly a business account, false if clearly a home, null if unsure,
  "eircode": "the Eircode of the supply address as printed, or null",
  "mprn": "the MPRN (11 digits, starts with 10) as printed, or null",
  "supplyAddress": "the supply address on one line as printed, without the Eircode, or null"
}
No markdown, no explanation.`;

type Obj = Record<string, unknown>;

const num = (v: unknown, lo: number, hi: number): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v.replace(/[€,\s]/g, '')) : NaN;
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null;
};

const isoDay = (v: unknown): string | null => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return Number.isFinite(Date.parse(`${v}T00:00:00Z`)) ? v : null;
};

const text = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.replace(/\s+/g, ' ').trim();
  if (!t || /^null$/i.test(t)) return null;
  return t.slice(0, max);
};

const round = (n: number, dp = 0) => Math.round(n * 10 ** dp) / 10 ** dp;

/** Days in the billing period, inclusive of both printed dates. */
export function billDays(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  if (!(b >= a)) return null;
  const d = Math.round((b - a) / 86_400_000) + 1;
  return d >= 7 && d <= 400 ? d : null;
}

/** One month (20 to 45 days) or two (46 to 75); anything else stays unknown. */
export function periodOf(days: number | null): AnalyserRead['period'] {
  if (days === null) return null;
  if (days >= 20 && days <= 45) return 'month';
  if (days >= 46 && days <= 75) return 'two_months';
  return null;
}

export function toAnalyserRead(raw: unknown): AnalyserRead {
  const r = (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) as Obj;
  const periodStart = isoDay(r.periodStart);
  const periodEnd = isoDay(r.periodEnd);
  const days = billDays(periodStart, periodEnd);

  const dayKwh = num(r.dayKwh, 1, 5_000_000);
  const nightKwh = dayKwh !== null ? num(r.nightKwh, 0, 5_000_000) : null;
  const total = num(r.totalKwh, 1, 5_000_000);
  const periodKwh = total ?? (dayKwh !== null ? dayKwh + (nightKwh ?? 0) : null);

  const printedAnnual = num(r.annualKwh, 100, 10_000_000);
  let annualKwh: number | null = printedAnnual;
  let annualKwhSource: AnalyserRead['annualKwhSource'] = printedAnnual !== null ? 'bill' : null;
  if (annualKwh === null && periodKwh !== null && days !== null && days >= 20) {
    annualKwh = round((periodKwh * 365) / days);
    annualKwhSource = 'worked_out';
  }

  const unit = r.standingChargeUnit === 'per_day' || r.standingChargeUnit === 'per_period' || r.standingChargeUnit === 'per_year' ? r.standingChargeUnit : null;
  const sc = num(r.standingChargeEur, 0.01, 5000);
  let standingAnnual: number | null = null;
  if (sc !== null && unit) {
    if (unit === 'per_day') standingAnnual = sc * 365;
    else if (unit === 'per_year') standingAnnual = sc;
    else if (days) standingAnnual = (sc / days) * 365;
    if (standingAnnual !== null) standingAnnual = round(standingAnnual, 2);
    // A daily charge misread as a yearly one (or the reverse) is not shown.
    if (standingAnnual !== null && (standingAnnual < 20 || standingAnnual > 20_000)) standingAnnual = null;
  }

  const eirRaw = text(r.eircode, 12);
  const eircode = eirRaw && isValidEircode(eirRaw) ? formatEircode(normaliseEircode(eirRaw)) : null;
  const mprnRaw = typeof r.mprn === 'string' || typeof r.mprn === 'number' ? String(r.mprn).replace(/\D/g, '') : '';
  const mprn = /^10\d{9}$/.test(mprnRaw) ? mprnRaw : null;
  const accountName = text(r.accountName, 80);
  const segment: Segment | null = r.isBusiness === true ? 'commercial' : r.isBusiness === false ? 'domestic' : null;

  return {
    supplier: text(r.supplier, 60),
    periodStart,
    periodEnd,
    days,
    amountEur: num(r.amountDueEur, 1, 500_000),
    period: periodOf(days),
    unitRateEur: num(r.unitRateEur, 0.05, 1.5),
    nightRateEur: dayKwh !== null ? num(r.nightRateEur, 0.02, 1.5) : null,
    standingChargeEur: sc !== null && unit ? sc : null,
    standingChargeUnit: sc !== null ? unit : null,
    standingChargeAnnualEur: standingAnnual,
    periodKwh,
    dayKwh,
    nightKwh,
    annualKwh,
    annualKwhSource,
    accountName: accountName && /[a-z]/i.test(accountName) ? accountName : null,
    eircode,
    mprn,
    address: text(r.supplyAddress, 200),
    segment,
  };
}

/** Not an electricity bill: the reader says so, or it found no supplier, no amount and no units. */
export function isNotABill(raw: unknown, read: AnalyserRead): boolean {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Obj;
  if (r.isElectricityBill === false) return true;
  return read.supplier === null && read.amountEur === null && read.periodKwh === null && read.annualKwh === null;
}

/** Enough to price: an amount (the page asks the period if the dates were missed) or a yearly use. */
export function canPrice(read: Pick<AnalyserRead, 'amountEur' | 'annualKwh'>): boolean {
  return read.amountEur !== null || read.annualKwh !== null;
}

/** The figures that may be kept anonymously: never a name, an Eircode, an MPRN, an address or the image. */
export function anonymousOf(read: AnalyserRead) {
  return {
    supplier: read.supplier,
    unitRate: read.unitRateEur,
    standingCharge: read.standingChargeAnnualEur,
    annualKwh: read.annualKwh,
    dayKwh: read.dayKwh,
    nightKwh: read.nightKwh,
    hasDayNightMeter: read.dayKwh !== null ? read.nightKwh !== null : null,
    monthlyBill: read.amountEur !== null && read.days ? round((read.amountEur * 30.42) / read.days, 2) : null,
  };
}
