import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Solar Ireland | Our Story, Team & Certifications',
  description:
    'Meet the Solar Ireland team. SEAI-registered solar installers serving all 32 counties. No hard sell, honest pricing, and 25-year warranties.',
  openGraph: {
    title: 'About Solar Ireland | Our Story, Team & Certifications',
    description:
      'SEAI-registered solar installers serving all 32 counties. No hard sell, honest pricing, and 25-year warranties.',
    url: 'https://solarireland.org/about',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarireland.org/og-about.png',
        width: 1200,
        height: 630,
        alt: 'Solar Ireland — About Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Solar Ireland | Our Story, Team & Certifications',
    description:
      'SEAI-registered solar installers serving all 32 counties. No hard sell, honest pricing, and 25-year warranties.',
    images: ['https://solarireland.org/og-about.png'],
  },
  alternates: {
    canonical: 'https://solarireland.org/about',
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
                item: 'https://solarireland.org',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'About Us',
                item: 'https://solarireland.org/about',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
