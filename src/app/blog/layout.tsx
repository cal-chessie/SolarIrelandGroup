import type { Metadata } from 'next';
import { articles } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Solar Energy Blog | Tips, Guides, Grants & News for Irish Homeowners',
  description:
    'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
  openGraph: {
    title: 'Solar Energy Blog | Tips, Guides, Grants & News',
    description:
      'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
    url: 'https://solarireland.org/blog',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarireland.org/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'Solar Ireland — Solar Energy Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Ireland Blog | Solar Tips, Guides & News',
    description:
      'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators.',
    images: ['https://solarireland.org/og-blog.png'],
  },
  alternates: {
    canonical: 'https://solarireland.org/blog',
  },
};

const blogPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': 'https://solarireland.org/blog',
  name: 'Solar Energy Blog',
  description: 'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and installation tips.',
  url: 'https://solarireland.org/blog',
  inLanguage: 'en-IE',
  isPartOf: { '@id': 'https://solarireland.org/#website' },
  publisher: { '@id': 'https://solarireland.org/#organization' },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://solarireland.org/og-blog.png',
    width: 1200,
    height: 630,
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://solarireland.org',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://solarireland.org/blog',
    },
  ],
};

const blogFeedSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Solar Ireland Blog',
  description: 'Expert solar panel advice for Irish homeowners.',
  url: 'https://solarireland.org/blog',
  inLanguage: 'en-IE',
  publisher: {
    '@type': 'Organization',
    name: 'Solar Ireland',
    url: 'https://solarireland.org',
    logo: {
      '@type': 'ImageObject',
      url: 'https://solarireland.org/logo-lg.png',
      width: 512,
      height: 512,
    },
  },
  blogPost: articles.slice(0, 10).map((article) => ({
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    url: `https://solarireland.org/blog/${article.slug}`,
    datePublished: article.date,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    image: 'https://solarireland.org/og-blog.png',
  })),
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogFeedSchema) }} />
      {children}
    </>
  );
}
