import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Solar Ireland',
  description:
    'Terms and conditions for Solar Ireland solar PV installation services, SEAI grant applications, battery storage, and maintenance across Ireland. Irish consumer rights protected.',
  openGraph: {
    title: 'Terms and Conditions | Solar Ireland',
    description:
      'Terms and conditions for Solar Ireland solar PV installation, battery storage, and SEAI grant services.',
    url: 'https://solarireland.com/terms',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms and Conditions | Solar Ireland',
    description:
      'Terms and conditions for solar PV installation and related services in Ireland.',
  },
  alternates: {
    canonical: 'https://solarireland.com/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
