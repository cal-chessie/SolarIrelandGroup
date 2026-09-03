import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story, Team & Certifications',
  description:
    'Meet the Solar Ireland team. SEAI-registered solar installers serving all 32 counties. No hard sell, honest pricing, and 25-year warranties.',
  openGraph: {
    title: 'Our Story, Team & Certifications',
    description:
      'SEAI-registered solar installers serving all 32 counties. No hard sell, honest pricing, and 25-year warranties.',
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
      'SEAI-registered solar installers serving all 32 counties. No hard sell, honest pricing, and 25-year warranties.',
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
