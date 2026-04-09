import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Solar Ireland',
  description:
    'How Solar Ireland uses cookies on our website. Learn about essential, analytics, and marketing cookies, how to manage your preferences, and your rights under GDPR and the ePrivacy Directive.',
  openGraph: {
    title: 'Cookie Policy | Solar Ireland',
    description:
      'Cookie policy for Solar Ireland. Learn how we use cookies, manage your preferences, and understand your rights.',
    url: 'https://solarireland.com/cookies',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cookie Policy | Solar Ireland',
    description:
      'Cookie policy for Solar Ireland. Manage your cookie preferences.',
  },
  alternates: {
    canonical: 'https://solarireland.com/cookies',
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
