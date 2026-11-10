import type { Metadata } from 'next';

export const metadata: Metadata = {
  // The site sells the free estimate (bill analysis), not the survey, so the
  // contact title says estimate. No "15-minute call" wording.
  title: { absolute: 'Contact Solar Ireland Group | Free Estimate From Your Bill' },
  description:
    'Phone, WhatsApp or email Solar Ireland Group, or upload a bill for a free estimate. SEAI-registered installers in all 32 counties. Our front desk answers 24/7.',
  openGraph: {
    title: 'Contact Solar Ireland Group | Free Solar Estimate From Your Bill',
    description:
      'Phone, WhatsApp or email Solar Ireland Group, or upload a bill for a free estimate. SEAI-registered installers in all 32 counties. Our front desk answers 24/7.',
    url: 'https://solarirelandgroup.ie/contact',
    siteName: 'Solar Ireland Group',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-contact.png',
        width: 1344,
        height: 768,
        alt: 'Solar Ireland Group - Contact Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Solar Ireland Group | Free Solar Estimate From Your Bill',
    description:
      'Phone, WhatsApp or email Solar Ireland Group, or upload a bill for a free estimate. SEAI-registered installers in all 32 counties. Our front desk answers 24/7.',
    images: ['https://solarirelandgroup.ie/og-contact.png'],
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
