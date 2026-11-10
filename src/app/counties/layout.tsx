import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar Installation in All 32 Counties',
  description:
    'Solar panel installers across all 32 counties, Dublin to Donegal. Compare prices, SEAI grants and generation estimates, and get a free estimate from your bill.',
  alternates: {
    canonical: 'https://solarirelandgroup.ie/counties',
    languages: {
      'en-IE': 'https://solarirelandgroup.ie/counties',
      'x-default': 'https://solarirelandgroup.ie/counties',
    },
  },
  openGraph: {
    title: 'Solar Installation in All 32 Counties',
    description:
      'Find trusted local solar panel installers in every county in Ireland. Compare prices, SEAI grants, and get a free solar estimate from your bill.',
    url: 'https://solarirelandgroup.ie/counties',
    siteName: 'Solar Ireland Group',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-counties.png',
        width: 1152,
        height: 864,
        alt: 'Solar Ireland Group - Solar Panel Installers in All 32 Counties',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Installation in All 32 Counties',
    description:
      'Find trusted local solar panel installers in every county in Ireland. Compare prices, SEAI grants, and get a free estimate.',
    images: ['https://solarirelandgroup.ie/og-counties.png'],
  },
};

export default function CountiesLayout({
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
                name: 'County Directory',
                item: 'https://solarirelandgroup.ie/counties',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
