/**
 * STUB ONLY. The Bill Analyser's fixture reads, one per scenario the test
 * harness sets with the si_stub_scenario cookie. In stub mode the uploaded
 * file is checked for size and type and then discarded unread: no vision
 * model, no AISolar observation, nothing stored, nothing logged.
 *
 * Every fixture is a made-up bill. The names, Eircodes and MPRNs are
 * invented and only shaped to pass the format checks.
 */
import type { AnalyserFailure, AnalyserRead } from '@/lib/intake/contract';
import { toAnalyserRead, type BillRead } from './read';

const raw = (o: Record<string, unknown>) => toAnalyserRead({ isElectricityBill: true, ...o });

export const STUB_READS: Record<string, BillRead> = {
  // A two-month day and night bill: the main case and the AISolar fact.
  default: raw({
    supplier: 'Electric Ireland',
    periodStart: '2026-08-12',
    periodEnd: '2026-10-10',
    amountDueEur: 284.1,
    unitRateEur: 0.3804,
    nightRateEur: 0.2105,
    standingChargeEur: 0.6849,
    standingChargeUnit: 'per_day',
    dayKwh: 430,
    nightKwh: 290,
    totalKwh: 720,
    accountName: 'Mary Byrne',
    isBusiness: false,
    eircode: 'D06 X285',
    mprn: '10012345678',
    supplyAddress: '14 Elm Road, Rathmines, Dublin 6',
  }),
  // A two-month smart bill: day, night and a separate 5pm to 7pm peak line.
  bill_smart: raw({
    supplier: 'Electric Ireland',
    periodStart: '2026-08-14',
    periodEnd: '2026-10-12',
    amountDueEur: 318.65,
    unitRateEur: 0.3651,
    nightRateEur: 0.1876,
    peakRateEur: 0.4512,
    standingChargeEur: 0.6849,
    standingChargeUnit: 'per_day',
    dayKwh: 420,
    nightKwh: 260,
    peakKwh: 110,
    totalKwh: 790,
    accountName: 'Niamh Doyle',
    isBusiness: false,
    eircode: 'A92 F2X4',
  }),
  // A two-month bill on one 24-hour rate: no night rate, no peak. (Scenario
  // names are letters and underscores only, the cookie pattern in stub/state.ts.)
  bill_flat: raw({
    supplier: 'Bord Gáis Energy',
    periodStart: '2026-08-05',
    periodEnd: '2026-10-03',
    amountDueEur: 251.8,
    unitRateEur: 0.3795,
    standingChargeEur: 0.7134,
    standingChargeUnit: 'per_day',
    totalKwh: 560,
    accountName: 'Tom Ryan',
    isBusiness: false,
  }),
  // A one-month single-rate bill, no Eircode on it.
  bill_single: raw({
    supplier: 'SSE Airtricity',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    amountDueEur: 142.6,
    unitRateEur: 0.3912,
    standingChargeEur: 0.7,
    standingChargeUnit: 'per_day',
    totalKwh: 310,
    accountName: 'Sean Kelly',
    isBusiness: false,
  }),
  // Night heavy (an EV charged overnight): the battery grant line.
  bill_night: raw({
    supplier: 'Energia',
    periodStart: '2026-08-01',
    periodEnd: '2026-09-30',
    amountDueEur: 412.35,
    unitRateEur: 0.4012,
    nightRateEur: 0.168,
    standingChargeEur: 0.66,
    standingChargeUnit: 'per_day',
    dayKwh: 520,
    nightKwh: 980,
    totalKwh: 1500,
    accountName: 'Aoife Walsh',
    isBusiness: false,
    eircode: 'P31 K7W2',
  }),
  // Partial: the amount but no dates (so no period) and no units.
  bill_partial: raw({
    supplier: 'Electric Ireland',
    amountDueEur: 190.4,
    accountName: 'Mary Byrne',
    isBusiness: false,
  }),
  // A business bill.
  bill_business: raw({
    supplier: 'SSE Airtricity',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    amountDueEur: 1150,
    unitRateEur: 0.285,
    standingChargeEur: 1.92,
    standingChargeUnit: 'per_day',
    totalKwh: 3600,
    accountName: 'Kelly Convenience Ltd',
    isBusiness: true,
  }),
};

/** Failures, with what was read so far (carried to the manual side). */
export const STUB_FAILURES: Record<string, { reason: AnalyserFailure; partial: Partial<AnalyserRead> | null; status: number }> = {
  bill_offline: { reason: 'offline', partial: null, status: 503 },
  bill_unreadable: { reason: 'unreadable', partial: { supplier: 'Bord Gáis Energy', accountName: 'Aoife Walsh' }, status: 200 },
  bill_not_bill: { reason: 'not_bill', partial: null, status: 200 },
  bill_timeout: { reason: 'timeout', partial: null, status: 504 },
  bill_rate_limited: { reason: 'rate_limited', partial: null, status: 429 },
};
