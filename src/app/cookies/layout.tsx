import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy and Your Preferences',
  description:
    'How Solar Ireland Group uses essential, analytics and marketing cookies, how to manage your preferences, and your rights under GDPR.',
  openGraph: {
    title: 'Cookie Policy',
    description:
      'Cookie policy for Solar Ireland Group. Learn how we use cookies, manage your preferences, and understand your rights.',
    url: 'https://solarirelandgroup.ie/cookies',
    siteName: 'Solar Ireland Group',
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cookie Policy',
    description:
      'Cookie policy for Solar Ireland Group. Manage your cookie preferences.',
  },
  alternates: {
    canonical: 'https://solarirelandgroup.ie/cookies',
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
