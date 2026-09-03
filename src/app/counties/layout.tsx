import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar Panel Installation by County | All 32 Counties of Ireland',
  description:
    'Find trusted local solar panel installers in every county in Ireland. From Dublin to Donegal, Cork to Cavan - compare prices, SEAI grants, generation estimates and get a free solar survey near you. Solar Ireland covers all 32 counties with SEAI-registered installations.',
  keywords: [
    'solar panels Ireland',
    'solar panel installers by county',
    'solar panels Dublin',
    'solar panels Cork',
    'solar panels Galway',
    'solar panels Kerry',
    'solar panels Limerick',
    'solar panels Donegal',
    'solar panels Wicklow',
    'solar panels Kildare',
    'solar panels Meath',
    'solar panels Wexford',
    'solar panels Waterford',
    'solar panels Tipperary',
    'solar panels Mayo',
    'solar panels Kilkenny',
    'solar panel installation Ireland',
    'SEAI grant solar panels',
    'solar PV Ireland',
    'solar energy Ireland by county',
    'free solar survey Ireland',
    'solar panel cost Ireland',
    'local solar installers',
    '32 counties solar panels',
  ],
  alternates: {
    canonical: 'https://solarirelandgroup.ie/counties',
    languages: {
      'en-IE': 'https://solarirelandgroup.ie/counties',
      'en-GB': 'https://solarirelandgroup.ie/counties',
    },
  },
  openGraph: {
    title: 'Solar Panel Installation by County | All 32 Counties of Ireland',
    description:
      'Find trusted local solar panel installers in every county in Ireland. Compare prices, SEAI grants, and get a free solar survey near you.',
    url: 'https://solarirelandgroup.ie/counties',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-counties.png',
        width: 1200,
        height: 630,
        alt: 'Solar Ireland - Solar Panel Installers in All 32 Counties',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Panel Installation by County | All 32 Counties of Ireland',
    description:
      'Find trusted local solar panel installers in every county in Ireland. Compare prices, SEAI grants, and get a free survey.',
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
