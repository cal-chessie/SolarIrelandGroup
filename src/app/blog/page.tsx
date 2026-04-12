import type { Metadata } from 'next';
import { articles } from '@/lib/blog-data';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Solar Energy Blog | Tips, Guides, Grants & News for Irish Homeowners',
  description:
    'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
  keywords: [
    'solar panels Ireland',
    'SEAI solar grant',
    'solar panel cost Ireland',
    'solar energy blog',
    'clean export guarantee',
    'solar battery storage',
    'solar panel installation Ireland',
    'solar panel grants 2026',
    'Irish solar energy tips',
    'renewable energy Ireland',
  ],
  alternates: {
    canonical: 'https://solarireland.com/blog',
  },
  openGraph: {
    title: 'Solar Energy Blog | Tips, Guides, Grants & News',
    description:
      'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
    url: 'https://solarireland.com/blog',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Ireland Blog | Solar Tips, Guides & News',
    description:
      'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators.',
  },
};

function parseDate(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

function getAboutTags(category: string, title: string): string[] {
  const categoryTags: Record<string, string[]> = {
    grants: [
      'solar grants',
      'SEAI grant',
      'government grants',
      'solar panel funding',
    ],
    savings: [
      'solar panel savings',
      'solar costs',
      'solar ROI',
      'energy savings',
      'solar payback',
    ],
    guides: [
      'solar panel guide',
      'solar installation guide',
      'solar energy tips',
      'residential solar',
    ],
    technology: [
      'solar panel technology',
      'solar panel brands',
      'solar panel comparison',
      'solar panel efficiency',
    ],
    county: [
      'solar panels Dublin',
      'solar panels Ireland',
      'regional solar installation',
    ],
    news: [
      'SEAI news',
      'solar industry news',
      'solar policy updates',
      'solar grants news',
    ],
  };

  const base = categoryTags[category] || ['solar panels', 'solar energy'];

  if (title.toLowerCase().includes('battery')) {
    base.push('solar battery storage');
  }
  if (title.toLowerCase().includes('heat pump')) {
    base.push('heat pumps', 'solar and heat pumps');
  }
  if (title.toLowerCase().includes('smart meter')) {
    base.push('smart meter', 'Clean Export Guarantee');
  }
  if (title.toLowerCase().includes('rental') || title.toLowerCase().includes('landlord')) {
    base.push('rental property solar', 'landlord solar panels');
  }
  if (title.toLowerCase().includes('planning permission')) {
    base.push('planning permission', 'solar regulations');
  }
  if (title.toLowerCase().includes('winter')) {
    base.push('winter solar output', 'seasonal solar performance');
  }

  return base;
}

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
      blogPost: articles.map((article) => ({
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt,
        url: `https://solarireland.com/blog/${article.slug}`,
        datePublished: parseDate(article.date),
        dateModified: parseDate(article.date),
        author: {
          '@type': 'Person',
          name: article.author,
          jobTitle: 'Solar Energy Consultant',
          worksFor: {
            '@id': 'https://solarireland.com/#organization',
          },
        },
        image: {
          '@type': 'ImageObject',
          url: `https://solarireland.com${article.image}`,
          width: 1200,
          height: 630,
        },
        about: getAboutTags(article.category, article.title),
      })),
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
