import type { Metadata } from 'next';
import ServicesClient from './ServicesClient';

export const metadata: Metadata = {
  title: 'Solar Panel Services Ireland | PV, Battery & EV Charging Installation',
  description:
    'Complete solar panel services in Ireland — residential PV installation from €4,500, battery storage, EV charger setup, SEAI grant handling, BER assessments & free surveys. All 32 counties.',
  alternates: {
    canonical: 'https://solarireland.org/services',
  },
  openGraph: {
    title: 'Solar Panel Services Ireland | PV, Battery & EV Charging',
    description:
      'Residential solar PV from €4,500, battery storage, EV charging. SEAI grant handled. Serving all 32 counties with 10-year workmanship warranty.',
    url: 'https://solarireland.org/services',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Panel Services Ireland | PV, Battery & EV Charging',
    description:
      'Residential solar PV from €4,500, battery storage, EV charging. SEAI grant handled. Serving all 32 counties.',
  },
};

const servicesSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': 'https://solarireland.org/#service-solar-pv',
      name: 'Residential Solar PV Installation',
      description:
        'Complete solar panel installation for Irish homes. Tier-1 panels (LONGi, Jinko, Trina), hybrid or string inverters, smart monitoring, and a €1,800 SEAI grant. Systems from 4 kWp to 10 kWp saving €800–€1,400/year.',
      url: 'https://solarireland.org/services',
      provider: {
        '@id': 'https://solarireland.org/#business',
      },
      serviceType: 'Solar Panel Installation',
      areaServed: {
        '@type': 'Country',
        name: 'Ireland',
      },
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '4500',
        highPrice: '7500',
        priceCurrency: 'EUR',
        offerCount: '3',
      },
    },
    {
      '@type': 'Service',
      '@id': 'https://solarireland.org/#service-battery',
      name: 'Solar Battery Storage Installation',
      description:
        'Lithium-ion battery storage (5–13 kWh) to maximise solar self-consumption up to 80%+. AC, DC & hybrid coupling. Blackout protection option available.',
      url: 'https://solarireland.org/services',
      provider: {
        '@id': 'https://solarireland.org/#business',
      },
      serviceType: 'Battery Storage',
      areaServed: {
        '@type': 'Country',
        name: 'Ireland',
      },
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '4000',
        highPrice: '8000',
        priceCurrency: 'EUR',
      },
    },
    {
      '@type': 'Service',
      '@id': 'https://solarireland.org/#service-ev',
      name: 'EV Charger Installation',
      description:
        'Smart home EV charging (7.4 kW – 22 kW) with solar divert capability. Zappi, Wallbox, myEnergi brands. SEAI €600 grant available. Charge your car from excess solar for free.',
      url: 'https://solarireland.org/services',
      provider: {
        '@id': 'https://solarireland.org/#business',
      },
      serviceType: 'EV Charger Installation',
      areaServed: {
        '@type': 'Country',
        name: 'Ireland',
      },
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '1200',
        highPrice: '2500',
        priceCurrency: 'EUR',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://solarireland.org/services',
      name: 'Solar Panel Services Ireland',
      description:
        'Complete solar panel services in Ireland — residential PV installation, battery storage, EV charger setup, SEAI grant handling & free surveys.',
      url: 'https://solarireland.org/services',
      inLanguage: 'en-IE',
      isPartOf: {
        '@id': 'https://solarireland.org/#website',
      },
      about: {
        '@id': 'https://solarireland.org/#business',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://solarireland.org/services#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://solarireland.org',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Services',
          item: 'https://solarireland.org/services',
        },
      ],
    },
  ],
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <ServicesClient />
    </>
  );
}
