import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions for Solar PV',
  description:
    'Terms and conditions for Solar Ireland Group solar PV installation, SEAI grant applications, battery storage and maintenance across Ireland.',
  openGraph: {
    title: 'Terms & Conditions',
    description:
      'Terms and conditions for Solar Ireland Group solar PV installation, battery storage, and SEAI grant services.',
    url: 'https://solarirelandgroup.ie/terms',
    siteName: 'Solar Ireland Group',
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms & Conditions',
    description:
      'Terms and conditions for solar PV installation and related services in Ireland.',
  },
  alternates: {
    canonical: 'https://solarirelandgroup.ie/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
