import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar Panel Services Ireland | PV, Battery & EV Charging Installation',
  description:
    'Complete solar panel services in Ireland — residential PV installation from €4,500, battery storage, EV charger setup, SEAI grant handling, BER assessments & free surveys. All 32 counties.',
  openGraph: {
    title: 'Solar Panel Services Ireland | PV, Battery & EV Charging',
    description:
      'Residential solar PV from €4,500, battery storage, EV charging. SEAI grant handled. Serving all 32 counties with 10-year workmanship warranty.',
    url: 'https://solarireland.org/services',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarireland.org/og-services.png',
        width: 1200,
        height: 630,
        alt: 'Solar Ireland — Solar Panel Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Panel Services Ireland | PV, Battery & EV Charging',
    description:
      'Residential solar PV from €4,500, battery storage, EV charging. SEAI grant handled. Serving all 32 counties.',
    images: ['https://solarireland.org/og-services.png'],
  },
  alternates: {
    canonical: 'https://solarireland.org/services',
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
                item: 'https://solarireland.org',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Services',
                item: 'https://solarireland.org/services',
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
            '@id': 'https://solarireland.org/services',
            name: 'Solar Panel Services Ireland',
            description: 'Full-service solar panel installation across Ireland. Solar PV, battery storage, EV charger installation, SEAI grant assistance, BER assessment, and ongoing maintenance.',
            url: 'https://solarireland.org/services',
            inLanguage: 'en-IE',
            isPartOf: { '@id': 'https://solarireland.org/#website' },
            about: { '@id': 'https://solarireland.org/#business' },
            primaryImageOfPage: {
              '@type': 'ImageObject',
              url: 'https://solarireland.org/hero-solar.jpg',
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
              { '@type': 'ListItem', position: 1, name: 'Residential Solar PV Installation', url: 'https://solarireland.org/services#solar-pv' },
              { '@type': 'ListItem', position: 2, name: 'Battery Storage Installation', url: 'https://solarireland.org/services#battery-storage' },
              { '@type': 'ListItem', position: 3, name: 'EV Charger Installation', url: 'https://solarireland.org/services#ev-charging' },
              { '@type': 'ListItem', position: 4, name: 'SEAI Grant Assistance', url: 'https://solarireland.org/services#seai-grant' },
              { '@type': 'ListItem', position: 5, name: 'BER Assessment', url: 'https://solarireland.org/services#ber-assessment' },
              { '@type': 'ListItem', position: 6, name: 'Maintenance & Monitoring', url: 'https://solarireland.org/services#maintenance' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
