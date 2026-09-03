import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import FinancingClient from './FinancingClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const PAGE_URL = 'https://solarirelandgroup.ie/financing';

export const metadata: Metadata = {
  title: 'Solar Panel Financing & Payment Plans',
  description:
    'Solar panel financing in Ireland. Use our free calculator to see monthly repayments, compare upfront versus finance, and how the €1,800 SEAI grant helps.',
  keywords: [
    'solar panel financing Ireland',
    'solar payment plan',
    'solar panel loan Ireland',
    'solar finance calculator',
    'pay monthly solar panels',
    'green loan Ireland',
    'SEAI grant financing',
    'solar panel cost breakdown',
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'en-IE': PAGE_URL,
      'x-default': PAGE_URL,
    },
  },
  openGraph: {
    title: 'Solar Panel Financing & Payment Plans',
    description:
      'Use our free financing calculator to see monthly repayments for solar panels in Ireland. Compare upfront vs finance with the €1,800 SEAI grant included.',
    url: PAGE_URL,
    type: 'website',
    locale: 'en_IE',
    siteName: 'Solar Ireland',
    images: [
      {
        url: '/og-financing.jpg',
        width: 1344,
        height: 768,
        alt: 'Solar Panel Financing Calculator Ireland',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Panel Financing Ireland | Payment Plans & Calculator',
    description:
      'Free payment plan calculator. See monthly repayments and compare financing options for solar panels in Ireland.',
    images: ['/og-financing.jpg'],
    creator: '@solarireland',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

function FinancingSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Solar Panel Financing Calculator',
          description:
            'Free financing calculator for solar panels in Ireland. Calculate monthly repayments, compare payment plans, and see how the SEAI grant affects your financing.',
          url: PAGE_URL,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
          },
          creator: {
            '@type': 'Organization',
            name: 'Solar Ireland',
            url: 'https://solarirelandgroup.ie',
          },
        }),
      }}
    />
  );
}

function FinancingFAQSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          '@id': PAGE_URL + '#faq',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Can I get finance for solar panels in Ireland?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Several Irish banks and credit unions offer green loans specifically for solar panel installations. Typical rates range from 5.5% to 8.9% APR, with repayment terms from 3 to 10 years. Many customers find that their monthly savings on electricity bills exceed their loan repayments from day one.',
              },
            },
            {
              '@type': 'Question',
              name: 'How does the SEAI grant work with financing?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The €1,800 SEAI grant is paid directly to your installer after the system is commissioned. This means the grant automatically reduces the amount you need to finance. For example, a €6,500 system becomes €4,700 after the grant - so you only need to borrow €4,700.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is it better to pay upfront or finance solar panels?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Paying upfront gives the best return on investment - a typical payback of 5-7 years. However, financing can be cash-flow positive from day one if your monthly electricity savings exceed your loan repayments. With green loan rates as low as 5.5% APR, financed solar can still deliver significant long-term savings.',
              },
            },
            {
              '@type': 'Question',
              name: 'What deposit do I need for solar panel finance?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Many green loans in Ireland require no deposit at all. The SEAI grant effectively acts as a deposit since it reduces the total installation cost. Some providers offer 100% finance on solar panel installations up to €15,000, with flexible repayment terms.',
              },
            },
          ],
        }),
      }}
    />
  );
}

export default function FinancingPage() {
  noStore();
  return (
    <>
      <FinancingSchema />
      <FinancingFAQSchema />
      <FinancingClient />
    </>
  );
}
