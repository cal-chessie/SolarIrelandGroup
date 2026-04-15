import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Solar Ireland — WhatsApp, phone, email, or our contact form. SEAI-registered solar installers covering all 32 counties. Free home surveys available.',
  openGraph: {
    title: 'Contact Us | Solar Ireland',
    description:
      'Reach Solar Ireland by WhatsApp, phone, or email. Free home surveys and no-obligation quotes for solar panel installation.',
    url: 'https://solarireland.org/contact',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarireland.org/og-contact.png',
        width: 1200,
        height: 630,
        alt: 'Solar Ireland — Contact Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Solar Ireland',
    description:
      'Reach Solar Ireland by WhatsApp, phone, or email. Free home surveys available.',
    images: ['https://solarireland.org/og-contact.png'],
  },
  alternates: {
    canonical: 'https://solarireland.org/contact',
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
                item: 'https://solarireland.org',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Contact',
                item: 'https://solarireland.org/contact',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
