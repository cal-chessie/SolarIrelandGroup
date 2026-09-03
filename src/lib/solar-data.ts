
export const SOLAR_DATA = {
  grant: {
    amount: 1800,
    label: '€1,800',
    authority: 'SEAI',
    eligibility: 'Owner-occupiers of homes built before 2021 with BER C3 or lower',
    processTime: '4-8 weeks',
  },
  savings: {
    avgAnnual: 1400,
    label: '€1,400/yr',
    paybackYears: 5,
    total25yr: 48000,
    label25yr: '€48k+',
  },
  export: {
    ratePerKwh: 0.21,
    label: '€0.21/kWh',
    scheme: 'Clean Export Guarantee (CEG)',
    annualRange: '€200–€400',
  },
  system: {
    avgSizeKwp: 4,
    generationPerKwp: 1050, // kWh per kWp per year in Ireland
    panelWarranty: 25,
    installTime: '1 day',
    warrantyLabel: '25+ years',
  },
  provider: {
    name: 'Solar Ireland',
    phone: '+353 87 395 8424',
    phoneDisplay: '+353 87 395 8424',
    email: 'cal@solarireland.org',
    website: 'solarirelandgroup.ie',
    whatsapp: '353873958424',
  },
  social: {
    facebook: 'https://www.facebook.com/solarireland',
    instagram: 'https://www.instagram.com/solarireland',
    linkedin: 'https://www.linkedin.com/company/solarireland',
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
