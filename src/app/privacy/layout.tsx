import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Solar Ireland — GDPR Compliant Data Protection',
  description:
    'How Solar Ireland collects, uses, and protects your personal data in compliance with GDPR, the Data Protection Act 2018, and Irish data protection law. Learn about your 9 enforceable privacy rights.',
  openGraph: {
    title: 'Privacy Policy | Solar Ireland',
    description:
      'How Solar Ireland collects, uses, and protects your personal data in compliance with GDPR and Irish data protection law.',
    url: 'https://solarireland.com/privacy',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Solar Ireland',
    description:
      'GDPR-compliant privacy policy. Learn about your data rights.',
  },
  alternates: {
    canonical: 'https://solarireland.com/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
