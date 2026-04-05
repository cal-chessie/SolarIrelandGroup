import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Solar Ireland',
  description:
    'How Solar Ireland collects, uses, and protects your personal data in compliance with GDPR and Irish data protection law. Learn about your privacy rights.',
  openGraph: {
    title: 'Privacy Policy | Solar Ireland',
    description:
      'How Solar Ireland collects, uses, and protects your personal data in compliance with GDPR and Irish data protection law.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
