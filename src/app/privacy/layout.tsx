import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Solar Ireland collects, uses, and protects your personal data in compliance with GDPR and Irish data protection law. Learn about your privacy rights.',
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
      'How Solar Ireland collects, uses, and protects your personal data.',
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
