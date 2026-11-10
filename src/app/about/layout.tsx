import type { Metadata } from 'next';

export const metadata: Metadata = {
  // "Since 2019" is true: Cal founded Solar Ireland Group in 2019 (confirmed 9 Nov 2026).
  title: { absolute: 'About Solar Ireland Group: SEAI Installers Since 2019' },
  description:
    "SEAI-registered, all 32 counties, itemised quotes, a 25-year panel warranty and a straight answer if your roof won't suit. Meet the people behind it.",
  openGraph: {
    title: 'About Solar Ireland Group: SEAI Installers Since 2019',
    description:
      "SEAI-registered, all 32 counties, itemised quotes, a 25-year panel warranty and a straight answer if your roof won't suit. Meet the people behind it.",
    url: 'https://solarirelandgroup.ie/about',
    siteName: 'Solar Ireland Group',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-about.png',
        width: 1344,
        height: 768,
        alt: 'Solar Ireland Group - About Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Solar Ireland Group: SEAI Installers Since 2019',
    description:
      "SEAI-registered, all 32 counties, itemised quotes, a 25-year panel warranty and a straight answer if your roof won't suit. Meet the people behind it.",
    images: ['https://solarirelandgroup.ie/og-about.png'],
  },
  alternates: {
    canonical: 'https://solarirelandgroup.ie/about',
  },
};

export default function AboutLayout({
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
                name: 'About Us',
                item: 'https://solarirelandgroup.ie/about',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
