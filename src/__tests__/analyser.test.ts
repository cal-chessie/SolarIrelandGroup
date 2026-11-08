/**
 * The Bill Analyser's read (src/lib/analyser/read.ts): read off the bill or
 * null, never a default; a two-month bill stays two months; the day/night
 * split comes back; personal fields only when they look right.
 */
import { describe, expect, it } from 'vitest';
import { anonymousOf, billDays, canPrice, isNotABill, periodOf, toAnalyserRead } from '@/lib/analyser/read';
import { STUB_READS } from '@/lib/analyser/stub';

describe('the analyser read', () => {
  it('a two-month day and night bill: period from the dates, split returned, yearly use worked out, standing charge to a year', () => {
    const r = toAnalyserRead({
      isElectricityBill: true,
      supplier: 'Electric Ireland',
      periodStart: '2026-08-12',
      periodEnd: '2026-10-10',
      amountDueEur: '€284.10',
      unitRateEur: 0.3804,
      nightRateEur: 0.2105,
      standingChargeEur: 0.6849,
      standingChargeUnit: 'per_day',
      dayKwh: 430,
      nightKwh: 290,
      accountName: 'Mary Byrne',
      eircode: 'd06x285',
      mprn: '10 012 345 678',
      supplyAddress: '14 Elm Road,   Rathmines',
    });
    expect(r.days).toBe(60);
    expect(r.period).toBe('two_months');
    expect(r.amountEur).toBe(284.1);
    expect(r.dayKwh).toBe(430);
    expect(r.nightKwh).toBe(290);
    expect(r.periodKwh).toBe(720);
    expect(r.annualKwh).toBe(4380);
    expect(r.annualKwhSource).toBe('worked_out');
    expect(r.standingChargeAnnualEur).toBe(249.99);
    expect(r.eircode).toBe('D06 X285');
    expect(r.mprn).toBe('10012345678');
    expect(r.address).toBe('14 Elm Road, Rathmines');
  });

  it('never invents a figure: missing stays null (no 160, no 4800, no supplier-table rate)', () => {
    const r = toAnalyserRead({ supplier: 'Electric Ireland', amountDueEur: 190.4 });
    expect(r.period).toBeNull();
    expect(r.days).toBeNull();
    expect(r.unitRateEur).toBeNull();
    expect(r.standingChargeAnnualEur).toBeNull();
    expect(r.annualKwh).toBeNull();
    expect(r.periodKwh).toBeNull();
    expect(canPrice(r)).toBe(true);
    expect(canPrice(toAnalyserRead({ supplier: 'Energia' }))).toBe(false);
  });

  it('a printed yearly figure wins and says so; bad values are dropped', () => {
    const r = toAnalyserRead({ annualKwh: 5360, totalKwh: 700, periodStart: '2026-01-01', periodEnd: '2026-02-28', unitRateEur: 41.4, eircode: 'ABC', mprn: '12345678901', standingChargeEur: 250, standingChargeUnit: 'per_day' });
    expect(r.annualKwh).toBe(5360);
    expect(r.annualKwhSource).toBe('bill');
    expect(r.unitRateEur).toBeNull();
    expect(r.eircode).toBeNull();
    expect(r.mprn).toBeNull();
    expect(r.standingChargeAnnualEur).toBeNull();
  });

  it('a night rate only counts with a day reading; a single-rate bill has no split', () => {
    const r = toAnalyserRead({ totalKwh: 310, nightKwh: 100, nightRateEur: 0.2 });
    expect(r.dayKwh).toBeNull();
    expect(r.nightKwh).toBeNull();
    expect(r.nightRateEur).toBeNull();
  });

  it('periods: 20 to 45 days is a month, 46 to 75 is two, anything else unknown', () => {
    expect(periodOf(billDays('2026-09-01', '2026-09-30'))).toBe('month');
    expect(periodOf(billDays('2026-08-01', '2026-09-30'))).toBe('two_months');
    expect(periodOf(billDays('2026-01-01', '2026-12-31'))).toBeNull();
    expect(billDays('2026-10-10', '2026-08-12')).toBeNull();
  });

  it('not a bill: the reader says so, or nothing at all was found', () => {
    expect(isNotABill({ isElectricityBill: false }, toAnalyserRead({ supplier: 'Flogas' }))).toBe(true);
    expect(isNotABill({}, toAnalyserRead({}))).toBe(true);
    expect(isNotABill({}, toAnalyserRead({ supplier: 'Energia' }))).toBe(false);
  });

  it('the anonymous record carries no name, Eircode, MPRN or address', () => {
    const a = anonymousOf(STUB_READS.default);
    const keys = Object.keys(a);
    for (const k of ['accountName', 'eircode', 'mprn', 'address', 'name']) expect(keys).not.toContain(k);
    expect(JSON.stringify(a)).not.toMatch(/Mary|D06|10012345678|Elm Road/);
    expect(a.monthlyBill).toBeCloseTo(144.04, 1);
  });

  it('a smart bill: the peak rate and peak units come back as printed, beside a day reading only', () => {
    const r = toAnalyserRead({ dayKwh: 420, nightKwh: 260, peakKwh: 110, unitRateEur: 0.3651, nightRateEur: 0.1876, peakRateEur: '€0.4512' });
    expect(r.peakRateEur).toBe(0.4512);
    expect(r.peakKwh).toBe(110);
    expect(r.periodKwh).toBe(790);
    const single = toAnalyserRead({ totalKwh: 310, unitRateEur: 0.39, peakRateEur: 0.45, peakKwh: 40 });
    expect(single.peakRateEur).toBeNull();
    expect(single.peakKwh).toBeNull();
  });

  it('never invents a peak: a day and night bill with no peak line has none', () => {
    expect(STUB_READS.default.peakRateEur).toBeNull();
    expect(STUB_READS.default.peakKwh).toBeNull();
    expect(toAnalyserRead({ dayKwh: 400, nightKwh: 200, peakRateEur: 'n/a', peakKwh: null }).peakRateEur).toBeNull();
  });

  it('the anonymous record does not carry the peak line (AISolar owns that shape)', () => {
    expect(Object.keys(anonymousOf(STUB_READS.bill_smart))).not.toContain('peakRateEur');
  });

  it('the stub fixtures are honest reads too', () => {
    expect(STUB_READS.bill_smart.peakRateEur).toBe(0.4512);
    expect(STUB_READS.bill_smart.peakKwh).toBe(110);
    expect(STUB_READS.bill_smart.period).toBe('two_months');
    expect(STUB_READS.bill_flat.nightRateEur).toBeNull();
    expect(STUB_READS.bill_flat.peakRateEur).toBeNull();
    expect(STUB_READS.bill_flat.dayKwh).toBeNull();
    expect(STUB_READS.bill_flat.unitRateEur).toBe(0.3795);
    expect(STUB_READS.default.period).toBe('two_months');
    expect(STUB_READS.bill_single.dayKwh).toBeNull();
    expect(STUB_READS.bill_partial.period).toBeNull();
    expect(STUB_READS.bill_business.segment).toBe('commercial');
    expect(STUB_READS.bill_night.eircode).toBe('P31 K7W2');
  });
});
