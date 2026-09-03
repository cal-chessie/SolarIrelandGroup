import { articles } from '@/lib/blog-data';
import BlogClient from './BlogClient';

const SITE_URL = 'https://solarirelandgroup.ie';

// Blog-index structured data. This lives on /blog ONLY (this page component),
// not in blog/layout.tsx - a layout wraps /blog AND every /blog/[slug] article,
// so index schema placed there would falsely re-emit the blog-feed and the
// "Home > Blog" breadcrumb on every article page. The CollectionPage and the
// Blog feed carry DISTINCT @ids so they never collide on /blog.
const blogSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/blog#webpage`,
      name: 'Solar Energy Blog',
      description:
        'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
      url: `${SITE_URL}/blog`,
      inLanguage: 'en-IE',
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      about: {
        '@id': `${SITE_URL}/#business`,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-blog.png`,
        width: 1344,
        height: 768,
      },
    },
    {
      '@type': 'Blog',
      '@id': `${SITE_URL}/blog`,
      name: 'Solar Ireland Blog',
      description:
        'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
      url: `${SITE_URL}/blog`,
      inLanguage: 'en-IE',
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      blogPost: articles.slice(0, 10).map((article) => ({
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt,
        url: `${SITE_URL}/blog/${article.slug}`,
        datePublished: article.date,
        author: {
          '@type': 'Person',
          name: article.author,
        },
        image: `${SITE_URL}/og-blog.png`,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE_URL}/blog#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${SITE_URL}/blog`,
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
