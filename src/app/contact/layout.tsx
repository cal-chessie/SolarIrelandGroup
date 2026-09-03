import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Solar Ireland | Free Survey, WhatsApp, Phone & Email',
  description:
    'Get in touch with Solar Ireland. WhatsApp, phone, email, or fill in our contact form. Free no-obligation solar survey across all 32 counties.',
  openGraph: {
    title: 'Contact Solar Ireland | Free Survey, WhatsApp, Phone & Email',
    description:
      'Get in touch with Solar Ireland. WhatsApp, phone, email, or contact form. Free no-obligation solar survey.',
    url: 'https://solarirelandgroup.ie/contact',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-contact.png',
        width: 1200,
        height: 630,
        alt: 'Solar Ireland — Contact Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Solar Ireland | Free Solar Survey',
    description:
      'WhatsApp, phone, email, or contact form. Free solar survey.',
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
