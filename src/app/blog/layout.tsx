import type { Metadata } from 'next';

// Metadata only. The blog-index JSON-LD (CollectionPage, Blog feed, breadcrumb)
// lives in blog/page.tsx so it renders on /blog ONLY. It must NOT sit in this
// layout, which also wraps every /blog/[slug] article and would otherwise leak
// the blog-feed and "Home > Blog" breadcrumb (whose @id is /blog, not the
// article) onto every post.
export const metadata: Metadata = {
  title: 'Solar Blog: Tips, Guides & SEAI Grants',
  description:
    'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
  openGraph: {
    title: 'Solar Energy Blog | Tips, Guides, Grants & News',
    description:
      'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators, and county-specific solar tips.',
    url: 'https://solarirelandgroup.ie/blog',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-blog.png',
        width: 1344,
        height: 768,
        alt: 'Solar Ireland - Solar Energy Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Ireland Blog | Solar Tips, Guides & News',
    description:
      'Expert solar panel advice for Irish homeowners. SEAI grant guides, cost breakdowns, savings calculators.',
    images: ['https://solarirelandgroup.ie/og-blog.png'],
  },
  alternates: {
    canonical: 'https://solarirelandgroup.ie/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
