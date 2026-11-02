import { describe, it, expect } from 'vitest';
import { GRANT_SCHEDULES, SOLAR_DATA } from '@/lib/solar-data';
import {
  seaiGrant,
  batteryGrant,
  homeGrant,
  batteryVatRate,
  ndmgSchedule,
  ndmgTableEur,
  ndmgGrant,
  irishDate,
  installCostEur,
  estimate,
  commercialEstimate,
} from '@/lib/estimate';

// Every figure below is copied from the verified grants file (seai.ie, read
// 16 Oct 2026), not worked out from the code, so a slip in the schedule data
// fails here by name.

describe('SEAI solar grant (unchanged)', () => {
  it('€700/kWp to 2 kWp, €200/kWp to 4 kWp, pro rata, capped at €1,800', () => {
    expect([1, 2, 2.5, 4, 8].map(seaiGrant)).toEqual([700, 1400, 1500, 1800, 1800]);
    expect(SOLAR_DATA.grant.amount).toBe(1800);
    expect(SOLAR_DATA.grant.label).toBe('€1,800');
  });
});

describe('SEAI battery grant (new): a flat €600 at 5 kWh or more', () => {
  it('4.9 kWh draws nothing, 5 kWh draws €600, and it does not scale', () => {
    expect(batteryGrant(4.9)).toBe(0);
    expect(batteryGrant(5)).toBe(600);
    expect(batteryGrant(10)).toBe(600);
    expect(SOLAR_DATA.batteryGrant.amount).toBe(600);
    expect(SOLAR_DATA.batteryGrant.label).toBe('€600');
  });
  it('solar + battery on one application is capped at €2,400', () => {
    expect(homeGrant(4, 5)).toBe(2400);
    expect(homeGrant(8, 10)).toBe(2400);
    expect(homeGrant(4, 4.9)).toBe(1800);
    expect(homeGrant(0, 5)).toBe(600);
    expect(SOLAR_DATA.batteryGrant.withSolarMaxLabel).toBe('€2,400');
    expect(GRANT_SCHEDULES.battery.maxWithSolarEur).toBe(2400);
  });
  it('battery VAT: 0% with panels in the same job, 23% on its own', () => {
    expect([batteryVatRate(true), batteryVatRate(false)]).toEqual([0, 0.23]);
  });
});

describe('the published packages (each carries a 5 kWh+ battery, so the grant is €2,400)', () => {
  // [kWp, battery kWh, list, after grant, with the €1,000 marketing package]
  const rows: Array<[number, number, number, number, number]> = [
    [4, 5, 11400, 9000, 8000],
    [6, 7.5, 13650, 11250, 10250],
    [8, 10, 15900, 13500, 12500],
  ];
  for (const [kwp, kwh, list, after, marketing] of rows) {
    it(`${kwp} kWp + ${kwh} kWh: €${list} list, €${after} after the grant, €${marketing} with the marketing package`, () => {
      expect(installCostEur(kwp, kwh)).toBe(list);
      expect(installCostEur(kwp, kwh) - homeGrant(kwp, kwh)).toBe(after);
      expect(installCostEur(kwp, kwh) - homeGrant(kwp, kwh) - 1000).toBe(marketing);
    });
  }
});

describe('the website estimate stays panels only', () => {
  it('a 4 kWp home estimate carries the €1,800 solar grant and no battery grant', () => {
    const e = estimate({ annualUsageKwh: 4000 });
    expect([e.systemSizeKwp, e.installCostEur, e.grantEur, e.costAfterGrantEur]).toEqual([4, 8200, 1800, 6400]);
  });
});

describe('Non-Domestic Microgen Grant: two dated tables', () => {
  const sizes = [1, 2, 3, 6, 7, 20, 21, 200, 201, 1000, 1500];
  it('enhanced table (6 Oct 2026 to 6 Jul 2027)', () => {
    expect(sizes.map((k) => ndmgTableEur(k, '2026-10-16'))).toEqual(
      [1800, 3600, 4200, 4800, 5400, 13200, 13600, 85200, 85500, 325200, 325200]);
  });
  it('standard table (outside the window)', () => {
    expect(sizes.map((k) => ndmgTableEur(k, '2026-10-01'))).toEqual(
      [900, 2400, 2400, 2400, 2700, 6600, 6800, 42600, 42750, 162600, 162600]);
  });
  it('the window edges: 5 Oct standard, 6 Oct enhanced, 6 Jul 2027 enhanced, 7 Jul 2027 standard', () => {
    expect(['2026-10-05', '2026-10-06', '2027-07-06', '2027-07-07'].map((d) => ndmgSchedule(d).id))
      .toEqual(['ndmg-standard', 'ndmg-enhanced-2026', 'ndmg-enhanced-2026', 'ndmg-standard']);
    expect(irishDate(new Date('2026-10-05T23:30:00Z'))).toBe('2026-10-06');
  });
  it('the 45% cost condition: the lower of the table and 45% of the ex-VAT cost', () => {
    expect(ndmgGrant(4, { asOf: '2026-10-16', costExVatEur: 7200 })).toBe(3240);
    expect(ndmgGrant(20, { asOf: '2026-10-16', costExVatEur: 36000 })).toBe(13200);
    expect(ndmgGrant(4, { asOf: '2026-10-16' })).toBe(4800);
    expect(ndmgGrant(4, { asOf: '2026-10-05', costExVatEur: 1000 })).toBe(2400);
  });
  it('the business estimate prices its grant on the day it is made', () => {
    expect(commercialEstimate({ annualUsageKwh: 40000, asOf: '2026-10-16' }).grantEur).toBe(19600);
    expect(commercialEstimate({ annualUsageKwh: 40000, asOf: '2026-10-05' }).grantEur).toBe(9800);
  });
});

describe('the NDMG tables: verified and not', () => {
  it('the enhanced table is verified on seai.ie; the standard one is marked NOT verified', () => {
    expect(GRANT_SCHEDULES.ndmg.map((t) => t.verified)).toEqual([true, false]);
  });
  it('a date that is not a real day is refused, never rolled over', () => {
    expect(() => ndmgSchedule('2026-13-40')).toThrow(/not a real date/);
    expect(() => ndmgSchedule('2027-02-29')).toThrow(/not a real date/);
    expect(ndmgSchedule('2028-02-29').id).toBe('ndmg-standard');
  });
});

describe('RE-VERIFY THE NDMG BEFORE THE WINDOW CLOSES (dated on purpose)', () => {
  it('fails from 1 Jun 2027 until someone re-checks seai.ie', () => {
    // The enhanced NDMG table runs to 6 Jul 2027. The table after that (the
    // standard one in GRANT_SCHEDULES.ndmg) is NOT verified: seai.ie stopped
    // publishing it. To clear this: read
    // https://www.seai.ie/grants/business-grants/commercial-solar-pv, update
    // GRANT_SCHEDULES.ndmg (and aisolar _shared/grants.ts), then move the date.
    const RECHECK_FROM = '2027-06-01';
    const today = irishDate(new Date());
    expect(today < RECHECK_FROM, `It is ${today}: re-check the NDMG on seai.ie before 6 Jul 2027 (the table after that date is unverified), then update GRANT_SCHEDULES.ndmg and this date.`).toBe(true);
  });
});
