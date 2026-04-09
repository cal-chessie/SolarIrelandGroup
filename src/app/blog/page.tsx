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

const blogSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Blog',
      '@id': 'https://solarireland.com/blog',
      name: 'Solar Ireland Blog',
      description:
        'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
      url: 'https://solarireland.com/blog',
      inLanguage: 'en-IE',
      isPartOf: {
        '@id': 'https://solarireland.com/#website',
      },
      publisher: {
        '@id': 'https://solarireland.com/#organization',
      },
      blogPost: [
        {
          '@type': 'BlogPosting',
          headline: 'How Much Do Solar Panels Cost in Ireland in 2026?',
          description:
            'A complete breakdown of solar panel costs in Ireland including the €1,800 SEAI grant, installation prices, and payback periods for 2026.',
          url: 'https://solarireland.com/blog/how-much-do-solar-panels-cost-ireland',
          datePublished: '2025-01-15T00:00:00+00:00',
          dateModified: '2026-01-10T00:00:00+00:00',
          author: {
            '@type': 'Organization',
            name: 'Solar Ireland',
            url: 'https://solarireland.com',
          },
        },
        {
          '@type': 'BlogPosting',
          headline: 'SEAI Solar Grant Guide: Everything You Need to Know',
          description:
            'Step-by-step guide to the €1,800 SEAI solar PV grant. Eligibility, application process, timeline, and tips for maximising your grant.',
          url: 'https://solarireland.com/blog/seai-solar-grant-guide',
          datePublished: '2025-02-20T00:00:00+00:00',
          dateModified: '2026-02-15T00:00:00+00:00',
          author: {
            '@type': 'Organization',
            name: 'Solar Ireland',
            url: 'https://solarireland.com',
          },
        },
        {
          '@type': 'BlogPosting',
          headline: 'Solar Panels Ireland: Complete 2026 Guide',
          description:
            'Everything you need to know about getting solar panels in Ireland in 2026 — costs, grants, savings, installation process, and choosing the right system.',
          url: 'https://solarireland.com/blog/solar-panels-ireland-guide-2026',
          datePublished: '2025-06-01T00:00:00+00:00',
          dateModified: '2026-03-01T00:00:00+00:00',
          author: {
            '@type': 'Organization',
            name: 'Solar Ireland',
            url: 'https://solarireland.com',
          },
        },
      ],
    },
    {
      '@type': 'CollectionPage',
      '@id': 'https://solarireland.com/blog#page',
      name: 'Solar Energy Blog',
      description:
        'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
      url: 'https://solarireland.com/blog',
      inLanguage: 'en-IE',
      isPartOf: {
        '@id': 'https://solarireland.com/#website',
      },
      about: {
        '@id': 'https://solarireland.com/#business',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://solarireland.com/blog#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://solarireland.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: 'https://solarireland.com/blog',
        },
      ],
    },
  ],
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <BlogClient />
    </>
  );
}
