import { describe, expect, it } from 'vitest';
import { roughQuote } from '@/lib/intake/roughQuote';
import { quoteOne } from '@/lib/intake/stub/quote';
import type { QuoteRequestItem } from '@/lib/intake/contract';

const home = (amountEur: number, period: 'month' | 'two_months' = 'month'): QuoteRequestItem => ({
  segment: 'domestic',
  bill: { amountEur, period },
  annualKwh: null,
  supplier: null,
  homeType: 'unknown',
  billRead: null,
});

describe('the rough estimate the intake shows when the quote service is down', () => {
  it('gives a typed home bill the platform figures (EUR 160 a month: 1,037 a year, 6,750 after the grant)', () => {
    const q = roughQuote(home(160));
    expect(q.hasBasis).toBe(true);
    expect(q.figures?.annualSavingEur).toBe(1037);
    expect(q.figures?.netCostEur).toBe(6750);
    expect(q.figures?.grantEur).toBe(1800);
  });

  it('is the same number the quote route gives, unsigned', () => {
    for (const amount of [80, 120, 160, 250]) {
      const rough = roughQuote(home(amount));
      const served = quoteOne(home(amount));
      expect(rough.figures).toEqual(served.figures);
      expect(rough.quoteToken).toBeNull();
      expect(served.quoteToken).toBeTruthy();
    }
  });

  it('prices a two-month bill as half a month each', () => {
    expect(roughQuote(home(240, 'two_months')).figures).toEqual(roughQuote(home(120)).figures);
  });

  it('gives a business bill an indicative figure with no price', () => {
    const q = roughQuote({ ...home(1500), segment: 'commercial' });
    expect(q.hasBasis).toBe(true);
    expect(q.figures?.grantScheme).toBe('NDMG');
    expect(q.figures?.indicative).toBe(true);
  });

  it('has no basis without a bill or usage, so the honest empty state stays', () => {
    const q = roughQuote({ ...home(0), bill: null });
    expect(q.hasBasis).toBe(false);
    expect(q.figures).toBeNull();
  });
});
