/**
 * billPeriod: turn what a bill reader saw into MONTHLY and ANNUAL figures
 * without ever guessing the period.
 *
 * Many Irish bills cover two months. A two-month total read as one month (and
 * a two-month kWh reading multiplied by 12) doubles the bill and the usage,
 * and the system gets sized and priced on a household that does not exist
 * (audit 1 Nov, item 29). The rules here:
 *
 *  - The period comes from the bill itself: the day count the reader saw, or
 *    the two dates of the billing period. Nothing else.
 *  - If the period cannot be established, or the amount is missing, the
 *    result says so (`missing`), and the caller ASKS the visitor. It never
 *    falls back to a default and presents it as read (item 34b: the old route
 *    used EUR 160 / 4,800 kWh and showed them as read off the bill).
 *  - Usage: a printed annual figure wins; otherwise the period's kWh scaled
 *    by the real day count; otherwise it is missing and the visitor is asked.
 *
 * Pure and deterministic: no I/O, no clock.
 */

export const DAYS_PER_MONTH = 365 / 12; // 30.42

/** A billing period a real Irish bill can have (monthly or two-monthly, with slack). */
const MIN_DAYS = 20;
const MAX_DAYS = 75;

export interface BillReadRaw {
  /** The total on the bill, in euros, for whatever period the bill covers. */
  amountEur?: number | null;
  /** Days the bill covers, if the reader saw it printed. */
  billingDays?: number | null;
  /** The billing period as printed, e.g. "1 Dec 2025 to 31 Jan 2026". */
  billingPeriod?: string | null;
  /** kWh used in THIS billing period, as printed. */
  periodUsageKwh?: number | null;
  /** An annual kWh figure, only if the bill prints one. */
  annualUsageKwh?: number | null;
}

export type BillMissing = 'amount' | 'period' | 'usage';

export interface BillPeriodResult {
  /** Days the bill covers, when established from the bill. */
  days: number | null;
  /** True when the bill covers about two months. */
  twoMonthly: boolean;
  /** The bill as a monthly figure, or null when it cannot be established. */
  monthlyBillEur: number | null;
  /** Annual usage, or null when it cannot be established. */
  annualUsageKwh: number | null;
  /** What could not be read. Non-empty means: ask the visitor. */
  missing: BillMissing[];
}

function pos(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v.replace(/[^0-9.]/g, '')) : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Days between the two dates in a printed billing period, inclusive. */
export function daysFromPeriodText(text: string | null | undefined): number | null {
  if (!text || typeof text !== 'string') return null;
  const parts = text.split(/\s+(?:to|until|till|-|\u2013|\u2014)\s+/i);
  if (parts.length !== 2) return null;
  const a = Date.parse(parts[0].trim());
  const b = Date.parse(parts[1].trim());
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return null;
  const days = Math.round((b - a) / 86_400_000) + 1;
  return days >= MIN_DAYS && days <= MAX_DAYS ? days : null;
}

export function resolveBillPeriod(raw: BillReadRaw): BillPeriodResult {
  const missing: BillMissing[] = [];

  const printedDays = pos(raw.billingDays);
  const days =
    printedDays && printedDays >= MIN_DAYS && printedDays <= MAX_DAYS
      ? Math.round(printedDays)
      : daysFromPeriodText(raw.billingPeriod);
  if (days === null) missing.push('period');

  const amount = pos(raw.amountEur);
  if (amount === null) missing.push('amount');

  const monthlyBillEur =
    amount !== null && days !== null ? Math.round(((amount * DAYS_PER_MONTH) / days) * 100) / 100 : null;

  const annualPrinted = pos(raw.annualUsageKwh);
  const periodKwh = pos(raw.periodUsageKwh);
  const annualUsageKwh =
    annualPrinted !== null
      ? Math.round(annualPrinted)
      : periodKwh !== null && days !== null
        ? Math.round((periodKwh * 365) / days)
        : null;
  if (annualUsageKwh === null) missing.push('usage');

  return {
    days,
    twoMonthly: days !== null && days > 45,
    monthlyBillEur,
    annualUsageKwh,
    missing,
  };
}
