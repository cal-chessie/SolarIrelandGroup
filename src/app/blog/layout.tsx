import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar Energy Blog',
  description:
    'Honest, jargon-free advice about solar panels in Ireland. From SEAI grant guides and cost breakdowns to county spotlights and technology updates — everything you need to go solar.',
  openGraph: {
    title: 'Solar Energy Blog | Solar Ireland',
    description:
      'Expert guides on solar panels in Ireland — grants, costs, savings, and installation tips from SEAI-registered installers.',
    url: 'https://solarireland.com/blog',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarireland.com/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'Solar Ireland — Solar Energy Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Energy Blog | Solar Ireland',
    description:
      'Expert guides on solar panels in Ireland — grants, costs, savings, and installation tips.',
    images: ['https://solarireland.com/og-blog.png'],
  },
  alternates: {
    canonical: 'https://solarireland.com/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
