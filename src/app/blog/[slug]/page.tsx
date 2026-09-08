import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

/**
 * Only the real article slugs exist as routes.
 *
 * Without this, /blog/anything-at-all rendered a page and returned HTTP 200
 * with "index, follow" in the head: an unlimited supply of indexable junk URLs
 * hanging off the domain. notFound() inside the component was not enough,
 * because generateMetadata had already emitted indexable metadata by then.
 * dynamicParams = false settles it at the routing layer instead, and has the
 * side benefit of statically generating all 23 articles.
 */
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  // notFound() has to be called HERE, not in the component.
  // generateMetadata runs before the response opens. The component runs after
  // the root layout has already begun streaming (it awaits headers() for the
  // CSP nonce), and by then the 200 is committed and cannot be changed, which
  // is why an unknown slug used to render the 404 page with an HTTP 200.
  if (!article) notFound();

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
  if (!article) notFound();

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: 'Founder, Solar Ireland',
      url: `${SITE_URL}/about`,
      worksFor: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Solar Ireland',
        url: SITE_URL,
      },
      // No sameAs until there is a real profile to point at. The handle that
      // used to sit here belonged to a person who does not exist, which is
      // exactly the kind of author signal Google is checking.
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
  if (!article) notFound();
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

  // The guard has to be here, in the component, as the first thing it does.
  // dynamicParams = false does nothing on this site because the root layout
  // reads headers() for the CSP nonce, which makes every route dynamic, so
  // nothing is ever statically generated and there is no routing-layer check.
  if (!getArticleBySlug(slug)) notFound();

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
