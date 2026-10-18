
/**
 * Every grant the site prices with, as DATA with the dates each table applies.
 * One schedule per scheme; src/lib/estimate.ts holds the one function per grant
 * that reads it. Read on seai.ie on 16 Oct 2026, official sources only:
 *   solar   /grants/home-energy-grants/individual-grants/solar-electricity-grant
 *   battery /grants/home-energy-grants/individual-grants/battery
 *   NDMG    /grants/business-grants/commercial-solar-pv
 * The enhanced welfare grants (up to €9,000) depend on payments an estimate
 * cannot know, so they are deliberately not modelled.
 */
export const GRANT_SCHEDULES = {
  verifiedOn: '2026-10-16',
  /** SEAI Solar Electricity Grant: pro rata per kWp inside each tier, capped. */
  solarPv: {
    source: 'https://www.seai.ie/grants/home-energy-grants/individual-grants/solar-electricity-grant',
    tiers: [
      { uptoKwp: 2, perKwpEur: 700 },
      { uptoKwp: 4, perKwpEur: 200 },
    ],
    maxEur: 1800,
  },
  /** SEAI battery grant: a flat amount at the minimum size or above, nothing below. */
  battery: {
    source: 'https://www.seai.ie/grants/home-energy-grants/individual-grants/battery',
    minKwh: 5,
    flatEur: 600,
    /** Solar and battery together on one application. */
    maxWithSolarEur: 2400,
    /** 0% fitted with panels in the same job; 23% fitted on its own. */
    vatRate: { withPanels: 0, batteryOnly: 0.23 },
  },
  /**
   * Non-Domestic Microgen Grant, most specific table first. The enhanced table is
   * the temporary "effective 45% rate" for NEW applications from 6 Oct 2026 to
   * 6 Jul 2027 inclusive, read on seai.ie 16 Oct 2026. SEAI pays the lower of the
   * table and costShareCap of the invoiced cost (stated for the enhanced table).
   * The STANDARD table is NOT verified: seai.ie no longer publishes it, so these
   * are our Jul 2026 bands, kept only as the fallback after 6 Jul 2027. Re-verify
   * on seai.ie before then (src/__tests__/grants.test.ts fails from 1 Jun 2027).
   * Small sizes take the last fixed amount at or below them; each band adds per
   * whole kWp.
   */
  ndmg: [
    {
      id: 'ndmg-enhanced-2026',
      source: 'https://www.seai.ie/grants/business-grants/commercial-solar-pv',
      verified: true,
      appliesFrom: '2026-10-06',
      appliesTo: '2027-07-06',
      fixedEur: [
        { kwp: 1, eur: 1800 },
        { kwp: 2, eur: 3600 },
        { kwp: 3, eur: 4200 },
        { kwp: 4, eur: 4800 },
      ],
      bands: [
        { fromKwp: 7, toKwp: 20, perKwpEur: 600 },
        { fromKwp: 21, toKwp: 200, perKwpEur: 400 },
        { fromKwp: 201, toKwp: 1000, perKwpEur: 300 },
      ],
      maxEur: 325200,
      costShareCap: 0.45,
    },
    {
      id: 'ndmg-standard',
      source: 'https://www.seai.ie/grants/business-grants/commercial-solar-pv',
      // NOT verified on seai.ie (no longer published there). Re-verify before 6 Jul 2027.
      verified: false,
      appliesFrom: null,
      appliesTo: null,
      fixedEur: [
        { kwp: 1, eur: 900 },
        { kwp: 2, eur: 2400 },
      ],
      bands: [
        { fromKwp: 7, toKwp: 20, perKwpEur: 300 },
        { fromKwp: 21, toKwp: 200, perKwpEur: 200 },
        { fromKwp: 201, toKwp: 1000, perKwpEur: 150 },
      ],
      maxEur: 162600,
      costShareCap: null,
    },
  ],
} as const;

export const SOLAR_DATA = {
  grant: {
    amount: GRANT_SCHEDULES.solarPv.maxEur,
    label: '€1,800',
    authority: 'SEAI',
    // SEAI conditions for the Solar PV grant (seai.ie, 16 Oct 2026): the home
    // must have been built and occupied before 2025, have an MPRN, not have
    // drawn solar funding before, and a post-works BER must be completed before
    // the grant is paid. There is NO minimum BER to qualify - the site used to
    // claim C3 or lower, which would have turned away eligible homes.
    eligibility: 'Homeowners, including private landlords, of homes built and occupied before 2025, with a post-works BER',
    processTime: '4-8 weeks',
  },
  // The SEAI battery grant: on top of the solar grant, on the same application.
  // The site estimate stays panels only, so this is said, never priced into it.
  batteryGrant: {
    amount: GRANT_SCHEDULES.battery.flatEur,
    label: '€600',
    minKwh: GRANT_SCHEDULES.battery.minKwh,
    minLabel: '5 kWh or more',
    withSolarMax: GRANT_SCHEDULES.battery.maxWithSolarEur,
    withSolarMaxLabel: '€2,400',
  },
  savings: {
    // These single figures are what the hero stats count up to, so they must be
    // what the engine (src/lib/estimate.ts) actually returns for a typical home,
    // not the top of the range. A 3-bed semi on a €160/month bill comes out at
    // about €1,100/yr, 6.6 years, €31k over 25 years. Ranges used in prose
    // ("€800 to €1,400") stay valid: €1,400 is reached around €200/month.
    avgAnnual: 1100,
    label: '€1,100/yr',
    // The range prose quotes. It lived only as loose text, so components drifted
    // apart: WhySolar said "€800 to €1,200" while the FAQ on the same site said
    // "€800 to €1,400" for the same system. Every range now reads from here.
    rangeMin: 800,
    rangeMax: 1400,
    rangeLabel: '€800 to €1,400',
    paybackYears: 6,
    // Optimistic headline point (energy-price inflation + export income over the
    // panels' 25yr life). total25yr/label25yr drive the hero stat and describe a
    // TYPICAL home: the engine returns about €31k over 25 years for the €160/mo
    // reference home, so "€30k+" holds there.
    total25yr: 30000,
    label25yr: '€30k+',
    // The honest hedge used in prose, so every 25-year range reads from HERE. The
    // floor is set to the engine's true minimum: even the lightest qualifying home
    // (a forced 4 kWp on an €80-100/mo bill) returns about €26,100 over 25 years,
    // so €25,000 is a floor no home falls below. It used to say €30,000, which
    // overstated the low end against the engine (estimate.ts has authority).
    range25yrLabel: '€25,000 to €50,000',
  },
  export: {
    // The CRU's minimum Clean Export Guarantee obligation (CRU/24/019).
    // Suppliers currently pay between 18.5c and 24c, so the regulated floor is
    // the figure we can always stand over.
    ratePerKwh: 0.20,
    label: '€0.20/kWh',
    scheme: 'Clean Export Guarantee (CEG)',
    annualRange: '€200 to €800',
  },
  system: {
    avgSizeKwp: 4,
    // PVGIS puts a south-facing 30 degree roof in Dublin at about 972 kWh/kWp
    // after standard losses; the national average is about 884. 950 describes a
    // good roof without assuming every roof is one.
    generationPerKwp: 950,
    panelWarranty: 25,
    installTime: '1 day',
    warrantyLabel: '25+ years',
  },
  provider: {
    name: 'Solar Ireland',
    phone: '+353 87 395 8424',
    phoneDisplay: '+353 87 395 8424',
    email: 'sales@solarirelandgroup.ie',
    website: 'solarirelandgroup.ie',
    whatsapp: '353873958424',
  },
  social: {
    facebook: 'https://www.facebook.com/SolarIrelandGroup',
    instagram: 'https://www.instagram.com/solarireland',
    tiktok: 'https://www.tiktok.com/@solarireland',
    threads: 'https://www.threads.com/@solarireland',
  },
  certifications: ['SEAI Registered', 'RECI Certified', 'NSAI Compliant', 'Safe Electric'],
  serviceAreas: ['Connacht', 'Leinster', 'Munster', 'Ulster'],
  coverage: {
    totalCounties: 32,
    provinces: 4,
    label: 'All 32 counties across Ireland',
  },
} as const;
