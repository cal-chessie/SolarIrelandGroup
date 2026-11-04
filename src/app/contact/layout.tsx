import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us & Book a Free Call',
  description:
    'Get in touch with Solar Ireland. WhatsApp, phone, email, or fill in our contact form. A free 15-minute call about your bill, across all 32 counties.',
  openGraph: {
    title: 'Contact Us & Book a Free Call',
    description:
      'Get in touch with Solar Ireland. WhatsApp, phone, email, or contact form. A free 15-minute call about your bill.',
    url: 'https://solarirelandgroup.ie/contact',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-contact.png',
        width: 1344,
        height: 768,
        alt: 'Solar Ireland - Contact Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Solar Ireland | Free 15-Minute Call',
    description:
      'WhatsApp, phone, email, or contact form. A free 15-minute call.',
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
