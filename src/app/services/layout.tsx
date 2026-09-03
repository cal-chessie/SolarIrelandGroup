import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar Panel Services Ireland | PV, Battery & EV Charging Installation',
  description:
    'Complete solar panel services in Ireland - residential PV installation from €4,500, battery storage, EV charger setup, SEAI grant handling, BER assessments & free surveys. All 32 counties.',
  openGraph: {
    title: 'Solar Panel Services Ireland | PV, Battery & EV Charging',
    description:
      'Residential solar PV from €4,500, battery storage, EV charging. SEAI grant handled. Serving all 32 counties with 10-year workmanship warranty.',
    url: 'https://solarirelandgroup.ie/services',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-services.png',
        width: 1200,
        height: 630,
        alt: 'Solar Ireland - Solar Panel Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Panel Services Ireland | PV, Battery & EV Charging',
    description:
      'Residential solar PV from €4,500, battery storage, EV charging. SEAI grant handled. Serving all 32 counties.',
    images: ['https://solarirelandgroup.ie/og-services.png'],
  },
  alternates: {
    canonical: 'https://solarirelandgroup.ie/services',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://solarirelandgroup.ie',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Services',
                item: 'https://solarirelandgroup.ie/services',
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': 'https://solarirelandgroup.ie/services',
            name: 'Solar Panel Services Ireland',
            description: 'Full-service solar panel installation across Ireland. Solar PV, battery storage, EV charger installation, SEAI grant assistance, BER assessment, and ongoing maintenance.',
            url: 'https://solarirelandgroup.ie/services',
            inLanguage: 'en-IE',
            isPartOf: { '@id': 'https://solarirelandgroup.ie/#website' },
            about: { '@id': 'https://solarirelandgroup.ie/#business' },
            primaryImageOfPage: {
              '@type': 'ImageObject',
              url: 'https://solarirelandgroup.ie/hero-solar.jpg',
              width: 1920,
              height: 1080,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Solar Ireland Services',
            description: 'Complete range of solar panel and clean energy services for Irish homes.',
            numberOfItems: 6,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Residential Solar PV Installation', url: 'https://solarirelandgroup.ie/services#solar-pv' },
              { '@type': 'ListItem', position: 2, name: 'Battery Storage Installation', url: 'https://solarirelandgroup.ie/services#battery-storage' },
              { '@type': 'ListItem', position: 3, name: 'EV Charger Installation', url: 'https://solarirelandgroup.ie/services#ev-charging' },
              { '@type': 'ListItem', position: 4, name: 'SEAI Grant Assistance', url: 'https://solarirelandgroup.ie/services#seai-grant' },
              { '@type': 'ListItem', position: 5, name: 'BER Assessment', url: 'https://solarirelandgroup.ie/services#ber-assessment' },
              { '@type': 'ListItem', position: 6, name: 'Maintenance & Monitoring', url: 'https://solarirelandgroup.ie/services#maintenance' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
