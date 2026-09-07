
export const SOLAR_DATA = {
  grant: {
    amount: 1800,
    label: '€1,800',
    authority: 'SEAI',
    // SEAI conditions for the Solar PV grant: the home must have been built and
    // occupied before 2021, have an MPRN, not have drawn solar funding before,
    // and a post-works BER must be completed before the grant is paid. There is
    // NO minimum BER to qualify - the site used to claim C3 or lower, which
    // would have turned away homes that are perfectly eligible.
    eligibility: 'Owner-occupiers of homes built and occupied before 2021, with a post-works BER',
    processTime: '4-8 weeks',
  },
  savings: {
    // These single figures are what the hero stats count up to, so they must be
    // what the engine (src/lib/estimate.ts) actually returns for a typical home,
    // not the top of the range. A 3-bed semi on a €160/month bill comes out at
    // about €1,100/yr, 6.6 years, €31k over 25 years. Ranges used in prose
    // ("€800 to €1,400") stay valid: €1,400 is reached around €200/month.
    avgAnnual: 1100,
    label: '€1,100/yr',
    paybackYears: 7,
    // Optimistic headline point (energy-price inflation + export income over the
    // panels' 25yr life). total25yr/label25yr drive the hero stat; range25yrLabel
    // is the honest hedge used in prose so every 25-year figure reads from HERE.
    total25yr: 30000,
    label25yr: '€30k+',
    range25yrLabel: '€30,000 to €50,000',
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
    facebook: 'https://www.facebook.com/solarlreland',
    instagram: 'https://www.instagram.com/solarireland',
    x: 'https://x.com/solarlreland',
    tiktok: 'https://www.tiktok.com/@solarireland',
  },
  certifications: ['SEAI Registered', 'RECI Certified', 'NSAI Compliant', 'Safe Electric'],
  serviceAreas: ['Connacht', 'Leinster', 'Munster', 'Ulster'],
  coverage: {
    totalCounties: 32,
    provinces: 4,
    label: 'All 32 counties across Ireland',
  },
} as const;
