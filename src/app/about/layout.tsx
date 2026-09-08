import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story, Team & Certifications',
  description:
    'Meet the Solar Ireland team. SEAI-registered installers covering all 32 counties, with itemised quotes and a 25-year panel warranty.',
  openGraph: {
    title: 'Our Story, Team & Certifications',
    description:
      'SEAI-registered solar installers covering all 32 counties. Itemised quotes, 25-year panel warranty, and a straight answer if your roof will not carry it.',
    url: 'https://solarirelandgroup.ie/about',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-about.png',
        width: 1344,
        height: 768,
        alt: 'Solar Ireland - About Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Story, Team & Certifications',
    description:
      'SEAI-registered solar installers covering all 32 counties. Itemised quotes, 25-year panel warranty, and a straight answer if your roof will not carry it.',
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
