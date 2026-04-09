import type { Metadata } from 'next';
import { articles } from '@/lib/blog-data';

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

const blogPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': 'https://solarireland.com/blog',
  name: 'Solar Energy Blog',
  description: 'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and installation tips.',
  url: 'https://solarireland.com/blog',
  inLanguage: 'en-IE',
  isPartOf: { '@id': 'https://solarireland.com/#website' },
  publisher: { '@id': 'https://solarireland.com/#organization' },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://solarireland.com/og-blog.png',
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
      item: 'https://solarireland.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://solarireland.com/blog',
    },
  ],
};

const blogFeedSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Solar Ireland Blog',
  description: 'Expert solar panel advice for Irish homeowners.',
  url: 'https://solarireland.com/blog',
  inLanguage: 'en-IE',
  publisher: {
    '@type': 'Organization',
    name: 'Solar Ireland',
    url: 'https://solarireland.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://solarireland.com/logo-lg.png',
      width: 512,
      height: 512,
    },
  },
  blogPost: articles.slice(0, 10).map((article) => ({
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    url: `https://solarireland.com/blog/${article.slug}`,
    datePublished: article.date,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    image: 'https://solarireland.com/og-blog.png',
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
