import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar PV, Battery & EV Charger Installation',
  description:
    'Panels-only solar from €8,200 before the SEAI grant, so €6,400 after it. Battery packages from €11,400. Across all 32 counties, with the grant and BER handled and free surveys.',
  openGraph: {
    title: 'Solar Panel Services Ireland | PV, Battery & EV Charging',
    description:
      'Panels-only solar from €8,200 before the SEAI grant (€6,400 after), battery packages from €11,400, EV charging. Grant handled. Serving all 32 counties.',
    url: 'https://solarirelandgroup.ie/services',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-services.png',
        width: 1344,
        height: 768,
        alt: 'Solar Ireland - Solar Panel Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Panel Services Ireland | PV, Battery & EV Charging',
    description:
      'Panels-only solar from €8,200 before the SEAI grant (€6,400 after), battery packages from €11,400, EV charging. Grant handled. Serving all 32 counties.',
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
              width: 1344,
              height: 768,
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
