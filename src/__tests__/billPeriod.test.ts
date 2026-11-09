import { describe, it, expect } from 'vitest';
import { resolveBillPeriod, daysFromPeriodText } from '@/lib/billPeriod';

describe('resolveBillPeriod (audit 29, 34b)', () => {
  it('reads a two-month bill as two months, never one month doubled', () => {
    const r = resolveBillPeriod({ amountEur: 320, billingPeriod: '1 Dec 2025 to 31 Jan 2026', periodUsageKwh: 800 });
    expect(r.days).toBe(62);
    expect(r.twoMonthly).toBe(true);
    expect(r.monthlyBillEur).toBeCloseTo(157.0, 0);
    expect(r.annualUsageKwh).toBe(Math.round((800 * 365) / 62));
    expect(r.missing).toEqual([]);
  });

  it('keeps a monthly bill monthly', () => {
    const r = resolveBillPeriod({ amountEur: 160, billingDays: 30, periodUsageKwh: 400 });
    expect(r.twoMonthly).toBe(false);
    expect(r.monthlyBillEur).toBeCloseTo(162.2, 0);
    expect(r.annualUsageKwh).toBe(4867);
  });

  it('prefers a printed annual figure', () => {
    const r = resolveBillPeriod({ amountEur: 300, billingDays: 61, periodUsageKwh: 700, annualUsageKwh: 4200 });
    expect(r.annualUsageKwh).toBe(4200);
  });

  it('asks instead of guessing when the amount, period or usage is missing', () => {
    expect(resolveBillPeriod({ billingDays: 30, periodUsageKwh: 400 }).missing).toEqual(['amount']);
    expect(resolveBillPeriod({ amountEur: 200, periodUsageKwh: 400 }).missing).toEqual(['period', 'usage']);
    const none = resolveBillPeriod({});
    expect(none.monthlyBillEur).toBeNull();
    expect(none.annualUsageKwh).toBeNull();
    expect(none.missing).toEqual(['period', 'amount', 'usage']);
  });

  it('rejects impossible periods', () => {
    expect(daysFromPeriodText('1 Jan 2026 to 1 Jan 2026')).toBeNull();
    expect(daysFromPeriodText('nonsense')).toBeNull();
    expect(resolveBillPeriod({ amountEur: 100, billingDays: 365, periodUsageKwh: 10 }).missing).toContain('period');
  });
});
