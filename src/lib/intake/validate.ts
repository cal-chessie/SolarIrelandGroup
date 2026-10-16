/**
 * The intake-quote request, read strictly (backend-spec 1.5). Shared by the
 * stub and live modes, so both refuse the same things before anything is
 * priced or forwarded: 1 to 8 items, known fields only, never a personal one.
 *
 * Bounds mirror AISolar's intake-quote (supplier up to 60 characters, bill
 * read values inside their plausible bands), so a request the site accepts is
 * one AISolar accepts.
 */
import type { QuoteRequestItem } from '@/lib/intake/contract';

const ALLOWED = new Set(['segment', 'bill', 'annualKwh', 'supplier', 'homeType', 'billRead']);
const PII = new Set(['name', 'email', 'phone', 'mobile', 'eircode', 'address', 'county', 'businessName']);
const HOME_TYPES = new Set(['apartment', 'terrace', 'semi', 'detached', 'bungalow', 'other', 'unknown']);

export type QuoteValidation =
  | { ok: true; items: QuoteRequestItem[] }
  | { ok: false; error: 'invalid' | 'pii_not_allowed'; detail: string };

export function validateQuoteRequest(body: unknown): QuoteValidation {
  const reqs = (body as { requests?: unknown })?.requests;
  if (!Array.isArray(reqs) || reqs.length < 1 || reqs.length > 8) {
    return { ok: false, error: 'invalid', detail: 'requests must hold 1 to 8 items' };
  }
  const items: QuoteRequestItem[] = [];
  for (const raw of reqs) {
    if (!raw || typeof raw !== 'object') return { ok: false, error: 'invalid', detail: 'item' };
    for (const k of Object.keys(raw)) {
      if (PII.has(k)) return { ok: false, error: 'pii_not_allowed', detail: k };
      if (!ALLOWED.has(k)) return { ok: false, error: 'invalid', detail: `unknown field ${k}` };
    }
    const r = raw as Record<string, unknown>;
    if (r.segment !== 'domestic' && r.segment !== 'commercial') return { ok: false, error: 'invalid', detail: 'segment' };
    let bill: QuoteRequestItem['bill'] = null;
    if (r.bill != null) {
      const b = r.bill as { amountEur?: unknown; period?: unknown };
      const amt = Number(b.amountEur);
      const maxBill = r.segment === 'commercial' ? 250_000 : 5_000;
      if (!Number.isFinite(amt) || amt < 1 || amt > maxBill) return { ok: false, error: 'invalid', detail: 'bill.amountEur' };
      if (b.period !== 'month' && b.period !== 'two_months') return { ok: false, error: 'invalid', detail: 'bill.period' };
      bill = { amountEur: amt, period: b.period };
    }
    let annualKwh: number | null = null;
    if (r.annualKwh != null) {
      const k = Number(r.annualKwh);
      const maxKwh = r.segment === 'commercial' ? 5_000_000 : 100_000;
      if (!Number.isFinite(k) || k < 100 || k > maxKwh) return { ok: false, error: 'invalid', detail: 'annualKwh' };
      annualKwh = Math.round(k);
    }
    const supplier = typeof r.supplier === 'string' && r.supplier.trim() ? r.supplier.trim().slice(0, 60) : null;
    const homeType = (typeof r.homeType === 'string' && HOME_TYPES.has(r.homeType) ? r.homeType : 'unknown') as QuoteRequestItem['homeType'];
    let billRead: QuoteRequestItem['billRead'] = null;
    if (r.billRead && typeof r.billRead === 'object') {
      const br = r.billRead as Record<string, unknown>;
      const num = (v: unknown, lo: number, hi: number) => {
        const n = Number(v);
        return Number.isFinite(n) && n >= lo && n <= hi ? n : undefined;
      };
      billRead = {
        unitRateEur: num(br.unitRateEur, 0.05, 1),
        standingChargeAnnualEur: num(br.standingChargeAnnualEur, 0, 2000),
        dayKwh: num(br.dayKwh, 1, 5_000_000),
        nightKwh: num(br.nightKwh, 0, 5_000_000),
      };
    }
    items.push({ segment: r.segment, bill, annualKwh, supplier, homeType, billRead });
  }
  return { ok: true, items };
}
