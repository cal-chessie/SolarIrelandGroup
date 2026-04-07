import type { Metadata } from 'next';
import { articles, getArticleBySlug } from '@/lib/blog-data';
import BlogPostClient from './BlogPostClient';

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
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `https://solarireland.com/blog/${slug}`,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      url: `https://solarireland.com/blog/${slug}`,
      siteName: 'Solar Ireland',
      locale: 'en_IE',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
