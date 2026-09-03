import type { Metadata } from 'next';
import { articles, getArticleBySlug } from '@/lib/blog-data';
import BlogPostClient from './BlogPostClient';

const SITE_URL = 'https://solarirelandgroup.ie';

// Derive a rendered <title> that stays <=60 chars. The "%s | Solar Ireland"
// root template adds 16 chars, which pushes most article titles well past 60,
// so we set an absolute title instead. We first drop any trailing clause after
// a colon or dash, then re-add the " | Solar Ireland" brand only if it still
// fits; otherwise we keep the (already truthful) shortened title on its own.
function metaTitleForArticle(fullTitle: string): string {
  const sepAt = fullTitle.search(/:\s|\s[–—-]\s/);
  let base = (sepAt !== -1 ? fullTitle.slice(0, sepAt) : fullTitle).trim();
  if (base.length > 60) {
    base = base.slice(0, 60).replace(/\s+\S*$/, '').trim();
  }
  const branded = `${base} | Solar Ireland`;
  return branded.length <= 60 ? branded : base;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const ogTitle = `${article.title} | Solar Ireland`;
  const ogDescription = article.excerpt;

  return {
    // Absolute (bypasses the "%s | Solar Ireland" template) to keep <title> <=60.
    title: { absolute: metaTitleForArticle(article.title) },
    description: article.excerpt,
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.date,
      authors: [article.author],
      url: `${SITE_URL}/blog/${slug}`,
      siteName: 'Solar Ireland',
      locale: 'en_IE',
      images: [
        {
          url: `${SITE_URL}/og-blog.png`,
          width: 1344,
          height: 768,
          alt: article.title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [`${SITE_URL}/og-blog.png`],
    },
  };
}

function getArticleSchema(slug: string) {
  const article = getArticleBySlug(slug);
  if (!article) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: 'Solar Energy Consultant',
      url: SITE_URL,
      worksFor: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Solar Ireland',
        url: SITE_URL,
      },
      sameAs: [
        'https://www.linkedin.com/in/cal-oreilly',
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Solar Ireland',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
    image: `${SITE_URL}/og-blog.png`,
    wordCount: article.content.reduce((acc, s) => {
      if (s.type === 'paragraph') return acc + s.text.length;
      if (s.type === 'heading') return acc + s.text.length;
      if (s.type === 'callout') return acc + s.title.length + s.body.length;
      if ((s.type === 'bulletList' || s.type === 'numberedList') && Array.isArray(s.items)) return acc + s.items.reduce((a: number, i: string) => a + i.length, 0);
      if (s.type === 'table') return acc + s.headers.reduce((a: number, h: string) => a + h.length, 0) + s.rows.flat().reduce((a: number, r: string) => a + r.length, 0);
      if (s.type === 'cta') return acc + s.text.length;
      return acc;
    }, 0),
    articleSection: article.category.charAt(0).toUpperCase() + article.category.slice(1),
    inLanguage: 'en-IE',
  };
}

function getBreadcrumbSchema(slug: string) {
  const article = getArticleBySlug(slug);
  if (!article) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}/blog/${slug}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/blog/${slug}` },
    ],
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const articleSchema = getArticleSchema(slug);
  const breadcrumbSchema = getBreadcrumbSchema(slug);

  return (
    <>
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <BlogPostClient slug={slug} />
    </>
  );
}
