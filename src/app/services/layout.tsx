import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar Panel Services',
  description:
    'Full-service solar panel installation across Ireland. Solar PV, battery storage, EV charger installation, SEAI grant assistance, BER assessment, and ongoing maintenance.',
  openGraph: {
    title: 'Solar Panel Services Ireland | Solar Ireland',
    description:
      'From residential solar PV and battery storage to EV charging — end-to-end clean energy solutions for Irish homes. Prices from €4,500.',
    url: 'https://solarireland.com/services',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarireland.com/og-services.png',
        width: 1200,
        height: 630,
        alt: 'Solar Ireland — Solar Panel Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Panel Services Ireland | Solar Ireland',
    description:
      'Solar PV, battery storage, EV charging — end-to-end clean energy for Irish homes.',
    images: ['https://solarireland.com/og-services.png'],
  },
  alternates: {
    canonical: 'https://solarireland.com/services',
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
                item: 'https://solarireland.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Services',
                item: 'https://solarireland.com/services',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
