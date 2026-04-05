/* ═══════════════════════════════════════════════════════════════
   SOLAR DATA — Single Source of Truth
   ─────────────────────────────────────────────────────────────
   All hardcoded numbers used across the Solar Ireland website.
   If a number changes (e.g. SEAI grant amount), update it HERE
   and every component picks it up automatically.
   ═══════════════════════════════════════════════════════════════ */

export const SOLAR_DATA = {
  grant: {
    amount: 1800,
    label: '€1,800',
    authority: 'SEAI',
    eligibility: 'Owner-occupiers of homes built before 2021 with BER C3 or lower',
    processTime: '4-8 weeks',
  },
  savings: {
    avgAnnual: 1100,
    label: '€1,100/yr',
    paybackYears: 6,
    total25yr: 38000,
    label25yr: '€38k+',
  },
  export: {
    ratePerKwh: 0.21,
    label: '€0.21/kWh',
    scheme: 'Clean Export Guarantee (CEG)',
    annualRange: '€200–€400',
  },
  system: {
    avgSizeKwp: 4,
    generationPerKwp: 900, // kWh per kWp per year in Ireland
    panelWarranty: 25,
    installTime: '1 day',
    warrantyLabel: '25+ years',
  },
  provider: {
    name: 'Solar Ireland',
    phone: '+353 87 395 8424',
    phoneDisplay: '+353 87 395 8424',
    email: 'cal@solarireland.com',
    website: 'solarireland.com',
    whatsapp: '353873958424',
  },
  certifications: ['SEAI Registered', 'RECI Certified', 'NSAI Compliant', 'Safe Electric'],
  serviceAreas: ['Connacht', 'Leinster', 'Munster'],
  coverage: {
    totalCounties: 23,
    provinces: 3,
    label: '23 counties across Ireland',
  },
} as const;
