import BlogClient from './BlogClient';

const blogSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Blog',
      '@id': 'https://solarireland.org/blog',
      name: 'Solar Ireland Blog',
      description:
        'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
      url: 'https://solarireland.org/blog',
      inLanguage: 'en-IE',
      isPartOf: {
        '@id': 'https://solarireland.org/#website',
      },
      publisher: {
        '@id': 'https://solarireland.org/#organization',
      },
      blogPost: [
        {
          '@type': 'BlogPosting',
          headline: 'How Much Do Solar Panels Cost in Ireland in 2026?',
          description:
            'A complete breakdown of solar panel costs in Ireland including the €1,800 SEAI grant, installation prices, and payback periods for 2026.',
          url: 'https://solarireland.org/blog/how-much-do-solar-panels-cost-ireland-2026',
          datePublished: '2025-01-15T00:00:00+00:00',
          dateModified: '2026-01-10T00:00:00+00:00',
          author: {
            '@type': 'Organization',
            name: 'Solar Ireland',
            url: 'https://solarireland.org',
          },
        },
        {
          '@type': 'BlogPosting',
          headline: 'SEAI Solar Grant Guide: Everything You Need to Know',
          description:
            'Step-by-step guide to the €1,800 SEAI solar PV grant. Eligibility, application process, timeline, and tips for maximising your grant.',
          url: 'https://solarireland.org/blog/complete-guide-seai-solar-grant-2026',
          datePublished: '2025-02-20T00:00:00+00:00',
          dateModified: '2026-02-15T00:00:00+00:00',
          author: {
            '@type': 'Organization',
            name: 'Solar Ireland',
            url: 'https://solarireland.org',
          },
        },
        {
          '@type': 'BlogPosting',
          headline: 'Solar Panels in Winter: Do They Actually Work in Ireland?',
          description:
            'Discover how solar panels perform during Irish winters. Real data on December output, cloudy day generation, and why winter solar is better than you think.',
          url: 'https://solarireland.org/blog/solar-panels-in-winter-do-they-work',
          datePublished: '2025-09-10T00:00:00+00:00',
          dateModified: '2026-03-01T00:00:00+00:00',
          author: {
            '@type': 'Organization',
            name: 'Solar Ireland',
            url: 'https://solarireland.org',
          },
        },
      ],
    },
    {
      '@type': 'CollectionPage',
      '@id': 'https://solarireland.org/blog#page',
      name: 'Solar Energy Blog',
      description:
        'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
      url: 'https://solarireland.org/blog',
      inLanguage: 'en-IE',
      isPartOf: {
        '@id': 'https://solarireland.org/#website',
      },
      about: {
        '@id': 'https://solarireland.org/#business',
      },
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
