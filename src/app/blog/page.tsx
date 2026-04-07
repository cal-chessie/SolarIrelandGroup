import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Solar Energy Blog | Tips, Guides, Grants & News for Irish Homeowners',
  description: 'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
  alternates: {
    canonical: 'https://solarireland.com/blog',
  },
  openGraph: {
    title: 'Solar Energy Blog | Tips, Guides, Grants & News',
    description: 'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
    url: 'https://solarireland.com/blog',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Ireland Blog | Solar Tips, Guides & News',
    description: 'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators.',
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
