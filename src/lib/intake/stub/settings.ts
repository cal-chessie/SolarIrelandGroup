/**
 * STUB ONLY. Solar Ireland's intake Settings as DECISIONS.md and Cal's
 * answers of 13 Oct set them, held here until AISolar's owner Settings serve
 * them (backend-spec 2.2). Every value below is a Setting Cal can change in
 * AISolar; nothing here is meant to survive the switch to live mode.
 */

export const STUB_SETTINGS = {
  rulesVersion: 'ie-2026.10-stub',
  settingsUpdatedAt: '2026-10-13T06:00:00.000Z',

  estimate: {
    /** Cal: home minimum 4 kWp. DECISIONS 2: maximum 8 kWp by default (the site's unknown-home cap). */
    minKwp: 4,
    maxKwp: 8,
    /** Cal: 25-year view, saving includes export. The frozen site engine models exactly 25 years. */
    horizonYears: 25,
    /** Cal: export 18c. */
    exportRateEur: 0.18,
    /** Cal: unit rate per supplier where known, 35c otherwise. */
    unitRateDefaultEur: 0.35,
    /** The site engine's commercial floor (estimate.ts COMMERCIAL_RATE_FLOOR). */
    commercialUnitRateDefaultEur: 0.24,
    /**
     * Seeded from the site's analyser table (api/analyse-bill PROVIDER_RATES,
     * day rates). DECISIONS 2: each is "check this"; Cal confirms before launch.
     */
    suppliers: [
      { name: 'Electric Ireland', unitRateEur: 0.422 },
      { name: 'Bord Gáis Energy', unitRateEur: 0.412 },
      { name: 'SSE Airtricity', unitRateEur: 0.418 },
      { name: 'Energia', unitRateEur: 0.408 },
      { name: 'Panda', unitRateEur: 0.425 },
      { name: 'PrepayPower', unitRateEur: 0.442 },
      { name: 'Yuno', unitRateEur: 0.405 },
      { name: 'Community Power', unitRateEur: 0.399 },
      { name: 'Pinergy', unitRateEur: 0.435 },
    ],
    quoteValidityDays: 30,
    /** DECISIONS 2: no business price on the intake, no 25-year figure for business. */
    business: { showPrice: false, showHorizon: false },
  },

  bill: {
    /** ux-spec 3.1 amounts; Cal sanity-checks them on the first screenshots. */
    chips: {
      domestic: [80, 120, 160, 200, 250, 300],
      commercial: [500, 1000, 2000, 3000, 5000, 8000],
    },
    /** Cal: "The AI bill reader is on." In stub mode the read is a fixture. */
    readerEnabled: true,
  },

  survey: {
    timezone: 'Europe/Dublin',
    /** Cal, 13 Oct: the home survey takes 45 minutes; DECISIONS 3: 2-hour arrival window. */
    visitMinutes: 45,
    businessVisitMinutes: 90,
    arrivalWindowMinutes: 120,
    /** DECISIONS 3: Mon to Fri 9am, 11:30am, 2pm; Sat 9am, 11:30am. */
    startTimes: {
      weekday: ['09:00', '11:30', '14:00'],
      saturday: ['09:00', '11:30'],
      sunday: [] as string[],
    },
    dailyCapPerSurveyor: 3,
    minNoticeHours: 18,
    maxDaysAhead: 14,
    holdMinutes: 10,
    /** Irish public holidays, pre-filled from gov.ie (check this) and editable in Settings. */
    closedDates: [
      '2026-10-26', '2026-12-25', '2026-12-26', '2026-12-28',
      '2027-01-01', '2027-02-01', '2027-03-17', '2027-03-29', '2027-05-03',
      '2027-06-07', '2027-08-02', '2027-10-25', '2027-12-25', '2027-12-27', '2027-12-28',
    ],
    homeownerFacingName: 'Cal',
    welcomeCallName: 'Cal',
  },

  portalOrigin: 'https://aisolar.ie',
} as const;
