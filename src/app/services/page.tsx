import ServicesClient from './ServicesClient';

const servicesSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': 'https://solarirelandgroup.ie/#service-solar-pv',
      name: 'Residential Solar PV Installation',
      description:
        'Complete solar panel installation for Irish homes. Tier-1 panels (LONGi, Jinko, Trina), hybrid or string inverters, smart monitoring, and a €1,800 SEAI grant. Systems from 4 kWp to 10 kWp saving €800–€1,400/year.',
      url: 'https://solarirelandgroup.ie/services',
      provider: {
        '@id': 'https://solarirelandgroup.ie/#business',
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
      '@id': 'https://solarirelandgroup.ie/#service-battery',
      name: 'Solar Battery Storage Installation',
      description:
        'Lithium-ion battery storage (5–13 kWh) to maximise solar self-consumption up to 80%+. AC, DC & hybrid coupling. Blackout protection option available.',
      url: 'https://solarirelandgroup.ie/services',
      provider: {
        '@id': 'https://solarirelandgroup.ie/#business',
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
      '@id': 'https://solarirelandgroup.ie/#service-ev',
      name: 'EV Charger Installation',
      description:
        'Smart home EV charging (7.4 kW – 22 kW) with solar divert capability. Zappi, Wallbox, myEnergi brands. SEAI €600 grant available. Charge your car from excess solar for free.',
      url: 'https://solarirelandgroup.ie/services',
      provider: {
        '@id': 'https://solarirelandgroup.ie/#business',
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
    // NOTE: the WebPage node for /services (@id .../services) lives in
    // services/layout.tsx (the richer one, with primaryImageOfPage). It was
    // removed from here to eliminate a duplicate @id on the same route.
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
