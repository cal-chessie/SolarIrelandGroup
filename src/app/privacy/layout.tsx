import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy and Data Protection',
  description:
    'How Solar Ireland Group collects, uses and protects your personal data under GDPR, the Data Protection Act 2018, and your enforceable privacy rights.',
  openGraph: {
    title: 'Privacy Policy | Solar Ireland Group',
    description:
      'How Solar Ireland Group collects, uses, and protects your personal data in compliance with GDPR and Irish data protection law.',
    url: 'https://solarirelandgroup.ie/privacy',
    siteName: 'Solar Ireland Group',
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Solar Ireland Group',
    description:
      'GDPR-compliant privacy policy. Learn about your data rights.',
  },
  alternates: {
    canonical: 'https://solarirelandgroup.ie/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
