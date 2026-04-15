import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Meet the Solar Ireland team — SEAI-registered solar panel installers serving all 32 counties. Learn our story, meet the team, and discover why 200+ Irish homeowners trust us.',
  openGraph: {
    title: 'About Us | Solar Ireland',
    description:
      'SEAI-registered solar panel installers serving all 32 counties of Ireland. Honest advice, quality installations, and genuine aftercare.',
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
    title: 'About Us | Solar Ireland',
    description:
      'SEAI-registered solar panel installers serving all 32 counties of Ireland.',
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
