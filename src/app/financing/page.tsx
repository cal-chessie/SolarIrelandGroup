import type { Metadata } from 'next';
import FinancingClient from './FinancingClient';
import { FINANCING_FAQS } from './financing-faq';


const PAGE_URL = 'https://solarirelandgroup.ie/financing';

const META_TITLE = 'Solar Panel Loans Ireland: Monthly Repayment Calculator';
const META_DESCRIPTION =
  'Work out monthly repayments on a solar loan in Ireland, compare paying upfront against finance, and see what the €1,800 SEAI grant takes off the total.';

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'en-IE': PAGE_URL,
      'x-default': PAGE_URL,
    },
  },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    locale: 'en_IE',
    siteName: 'Solar Ireland Group',
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
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: ['/og-financing.jpg'],
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
          name: 'Solar Panel Loan Repayment Calculator',
          description:
            'Free solar loan repayment calculator for Irish homes. Work out monthly repayments at the rate your lender quotes, compare paying upfront against a loan, and see how the SEAI grant affects what you borrow.',
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
            name: 'Solar Ireland Group',
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
          // The same array the visible FAQ renders, so the two cannot drift.
          mainEntity: FINANCING_FAQS.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }),
      }}
    />
  );
}

export default function FinancingPage() {
  return (
    <>
      <FinancingSchema />
      <FinancingFAQSchema />
      <FinancingClient />
    </>
  );
}
