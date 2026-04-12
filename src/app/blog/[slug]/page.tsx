import type { Metadata } from 'next';
import { articles, getArticleBySlug } from '@/lib/blog-data';
import BlogPostClient from './BlogPostClient';

const SITE_URL = 'https://solarireland.com';

interface Props {
  params: Promise<{ slug: string }>;
}

// ─── Category-level keyword & about mappings ─────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  grants: [
    'SEAI grant', 'solar panel grant Ireland', 'solar grant 2026',
    'government grants', 'Clean Export Guarantee', 'SEAI eligibility',
  ],
  savings: [
    'solar savings', 'reduce electricity bill', 'solar ROI Ireland',
    'energy savings', 'solar payback period', 'feed-in tariff',
  ],
  guides: [
    'solar panel guide', 'how to install solar panels', 'solar PV Ireland',
    'solar panel tips', 'solar energy guide', 'residential solar',
  ],
  technology: [
    'solar panel technology', 'solar PV system', 'solar inverter',
    'photovoltaic panels', 'solar battery storage', 'solar efficiency',
  ],
  county: [
    'solar panels county Ireland', 'solar installers near me',
    'regional solar installation', 'local solar companies Ireland',
  ],
  news: [
    'solar energy news Ireland', 'renewable energy updates',
    'solar industry trends', 'solar policy Ireland',
  ],
};

const CATEGORY_ABOUT: Record<string, { name: string; url?: string }[]> = {
  grants: [
    { name: 'SEAI Grant', url: 'https://www.seai.ie/grants/' },
    { name: 'Clean Export Guarantee' },
    { name: 'Solar Panel Subsidies' },
  ],
  savings: [
    { name: 'Energy Cost Savings' },
    { name: 'Solar Panel ROI' },
    { name: 'Electricity Bill Reduction' },
  ],
  guides: [
    { name: 'Solar Panel Installation Guide' },
    { name: 'Residential Solar PV' },
    { name: 'Solar Energy Tips' },
  ],
  technology: [
    { name: 'Solar Photovoltaic Technology' },
    { name: 'Solar Battery Storage' },
    { name: 'Solar Inverters' },
  ],
  county: [
    { name: 'Regional Solar Installation' },
    { name: 'Solar Installers Ireland' },
  ],
  news: [
    { name: 'Solar Energy Industry' },
    { name: 'Renewable Energy Policy' },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a keyword list from article title words + category keywords. */
function buildKeywords(article: ReturnType<typeof getArticleBySlug>): string {
  if (!article) return '';
  // Extract meaningful words from title (filter short stop-words)
  const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'it', 'with', 'how', 'your', 'you', 'our']);
  const titleWords = article.title
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const catKeywords = CATEGORY_KEYWORDS[article.category] ?? [];
  // Deduplicate while preserving order
  const seen = new Set<string>();
  const all = [...titleWords, ...catKeywords];
  const unique = all.filter(k => {
    if (seen.has(k.toLowerCase())) return false;
    seen.add(k.toLowerCase());
    return true;
  });
  return unique.join(', ');
}

/** Resolve the article image URL with fallback. */
function resolveImageUrl(article: ReturnType<typeof getArticleBySlug>): string {
  if (article?.image) return `${SITE_URL}${article.image}`;
  return `${SITE_URL}/og-blog.png`;
}

/** Count words by splitting text content by whitespace. */
function computeWordCount(article: ReturnType<typeof getArticleBySlug>): number {
  if (!article) return 0;
  let total = 0;
  for (const s of article.content) {
    if (s.type === 'paragraph') total += s.text.split(/\s+/).filter(Boolean).length;
    else if (s.type === 'heading') total += s.text.split(/\s+/).filter(Boolean).length;
    else if (s.type === 'callout') total += (s.title + ' ' + s.body).split(/\s+/).filter(Boolean).length;
    else if ((s.type === 'bulletList' || s.type === 'numberedList') && Array.isArray(s.items))
      total += s.items.reduce((a: number, i: string) => a + i.split(/\s+/).filter(Boolean).length, 0);
    else if (s.type === 'table')
      total += [...s.headers, ...s.rows.flat()].join(' ').split(/\s+/).filter(Boolean).length;
    else if (s.type === 'cta') total += s.text.split(/\s+/).filter(Boolean).length;
  }
  return total;
}

/** Strip common markdown formatting from text. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // bold
    .replace(/\*(.+?)\*/g, '$1')       // italic
    .replace(/__(.+?)__/g, '$1')       // underscore bold
    .replace(/_(.+?)_/g, '$1')         // underscore italic
    .replace(/~~(.+?)~~/g, '$1')       // strikethrough
    .replace(/`(.+?)`/g, '$1')         // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/^#{1,6}\s+/gm, '')        // headings
    .replace(/^>\s+/gm, '')             // blockquotes
    .replace(/[-*+]\s+/gm, '')          // list markers
    .replace(/\n{2,}/g, ' ')            // collapse newlines
    .replace(/\n/g, ' ')                // single newline → space
    .trim();
}

/** Clean a FAQ question string. */
function cleanQuestion(q: string): string {
  return q.replace(/\?+$/, '').trim() + '?';
}

// ─── Metadata ────────────────────────────────────────────────────────────────

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
  const ogImage = resolveImageUrl(article);
  const keywords = buildKeywords(article);

  return {
    title: article.title,
    description: article.excerpt,
    keywords,
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
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
          type: article.image?.endsWith('.webp') ? 'image/webp' : 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}

// ─── JSON-LD Schemas ─────────────────────────────────────────────────────────

function getArticleSchema(slug: string) {
  const article = getArticleBySlug(slug);
  if (!article) return null;

  const articleUrl = `${SITE_URL}/blog/${slug}`;
  const orgId = `${SITE_URL}/#organization`;
  const authorId = `${SITE_URL}/#author/${article.author.toLowerCase().replace(/\s+/g, '-')}`;

  // Find the first paragraph for speakable
  const firstParagraph = article.content.find(s => s.type === 'paragraph');
  const speakableSelectors: string[] = [
    `#${CSS.escape(article.title)}`,
  ];
  if (firstParagraph) {
    speakableSelectors.push(`#${CSS.escape(article.title)} ~ p`);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      '@id': authorId,
      name: article.author,
      jobTitle: 'Solar Energy Consultant',
      url: SITE_URL,
      worksFor: {
        '@type': 'Organization',
        '@id': orgId,
        name: 'Solar Ireland',
        url: SITE_URL,
      },
      sameAs: [
        'https://www.linkedin.com/in/cal-oreilly',
      ],
    },
    publisher: {
      '@type': 'Organization',
      '@id': orgId,
      name: 'Solar Ireland',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-lg.png`,
        width: 512,
        height: 512,
      },
    },
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    image: resolveImageUrl(article),
    wordCount: computeWordCount(article),
    articleSection: article.category.charAt(0).toUpperCase() + article.category.slice(1),
    inLanguage: 'en-IE',
    about: (CATEGORY_ABOUT[article.category] ?? []).map(item => ({
      '@type': 'Thing',
      name: item.name,
      ...(item.url ? { sameAs: item.url } : {}),
    })),
    keywords: buildKeywords(article),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: speakableSelectors,
    },
  };
}

function getFaqSchema(slug: string) {
  const article = getArticleBySlug(slug);
  if (!article) return null;

  const qaPairs: { question: string; answer: string }[] = [];
  for (let i = 0; i < article.content.length; i++) {
    const section = article.content[i];
    if (section.type === 'heading' && section.level === 2 && qaPairs.length < 5) {
      // Look for the next paragraph after this heading, up to 3 blocks away
      for (let j = i + 1; j < Math.min(i + 3, article.content.length); j++) {
        if (article.content[j].type === 'paragraph') {
          const rawText = (article.content[j] as { type: 'paragraph'; text: string }).text;
          qaPairs.push({
            question: cleanQuestion(section.text),
            answer: stripMarkdown(rawText).slice(0, 500),
          });
          break;
        }
      }
    }
  }

  if (qaPairs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/blog/${slug}#faq`,
    mainEntity: qaPairs.map(qa => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
      },
    })),
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
      { '@type': 'ListItem', '@id': `${SITE_URL}/#breadcrumb-home`, position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', '@id': `${SITE_URL}/blog#breadcrumb-blog`, position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', '@id': `${SITE_URL}/blog/${slug}#breadcrumb-article`, position: 3, name: article.title, item: `${SITE_URL}/blog/${slug}` },
    ],
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const articleSchema = getArticleSchema(slug);
  const faqSchema = getFaqSchema(slug);
  const breadcrumbSchema = getBreadcrumbSchema(slug);

  return (
    <>
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
