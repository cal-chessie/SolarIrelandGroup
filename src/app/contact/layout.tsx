import type { Metadata } from 'next';

export const metadata: Metadata = {
  // The site sells the free estimate (bill analysis), not the survey, so the
  // contact title says estimate. No "15-minute call" wording.
  title: { absolute: 'Contact Solar Ireland Group | Free Estimate From Your Bill' },
  description:
    'Phone, WhatsApp or email Solar Ireland Group, or upload a bill for a free estimate. SEAI-registered installers in all 32 counties. Front desk open 24/7.',
  openGraph: {
    title: 'Contact Solar Ireland Group | Free Estimate From Your Bill',
    description:
      'Phone, WhatsApp or email Solar Ireland Group, or upload a bill for a free estimate. SEAI-registered installers in all 32 counties. Front desk open 24/7.',
    url: 'https://solarirelandgroup.ie/contact',
    siteName: 'Solar Ireland Group',
    locale: 'en_IE',
    type: 'website',
    // A real Solar Ireland Group install photo (13 Nov 2026), not the old
    // generated card. Same file as a blog cover, 1200x630.
    images: [
      {
        url: 'https://solarirelandgroup.ie/blog/how-to-read-electricity-bill-ireland-solar.webp',
        width: 1200,
        height: 630,
        alt: 'Solar panels on the roof of a red-brick home in Co. Dublin, fitted by Solar Ireland Group',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Solar Ireland Group | Free Estimate From Your Bill',
    description:
      'Phone, WhatsApp or email Solar Ireland Group, or upload a bill for a free estimate. SEAI-registered installers in all 32 counties. Front desk open 24/7.',
    images: ['https://solarirelandgroup.ie/blog/how-to-read-electricity-bill-ireland-solar.webp'],
  },
  alternates: {
    canonical: 'https://solarirelandgroup.ie/contact',
  },
};

export default function ContactLayout({
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
                name: 'Contact',
                item: 'https://solarirelandgroup.ie/contact',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
