import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import SolarCalculatorClient from './SolarCalculatorClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const CALC_URL = 'https://solarirelandgroup.ie/solar-calculator';

export const metadata: Metadata = {
  title: 'Solar Savings Calculator',
  description:
    'Free solar savings calculator for Irish homes. See your annual savings, payback period and 25-year projection, including the €1,800 SEAI grant.',
  keywords: [
    'solar savings calculator Ireland',
    'solar panel savings calculator',
    'how much do solar panels save Ireland',
    'solar panel payback calculator',
    'solar ROI calculator Ireland',
    'how many solar panels do I need',
    'solar panel cost calculator Ireland',
    'SEAI grant calculator',
    'solar panel system size calculator',
    'solar export earnings calculator',
    'solar panel calculator Ireland 2026',
    'free solar calculator',
  ],
  alternates: {
    canonical: CALC_URL,
    languages: {
      'en-IE': CALC_URL,
      'x-default': CALC_URL,
    },
  },
  openGraph: {
    title: 'Solar Savings Calculator Ireland | How Much Can You Save?',
    description:
      'Free solar panel calculator for Irish homes. See your annual savings, payback period, and 25-year ROI based on your actual electricity bill. Includes €1,800 SEAI grant.',
    url: CALC_URL,
    type: 'website',
    locale: 'en_IE',
    siteName: 'Solar Ireland',
    images: [
      {
        url: '/hero-solar.jpg',
        width: 1344,
        height: 768,
        alt: 'Solar panel savings calculator - see how much you can save in Ireland',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Savings Calculator | Free Irish Solar Panel ROI Calculator',
    description:
      'How much could solar panels save you? Enter your electricity bill and find out instantly. SEAI grant included.',
    images: ['/hero-solar.jpg'],
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

function CalculatorSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Solar Ireland Savings Calculator',
    description:
      'Free solar panel savings calculator for Irish homes. Calculate your annual savings, payback period, and 25-year return on investment based on your electricity bill.',
    url: CALC_URL,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    author: {
      '@type': 'Organization',
      name: 'Solar Ireland',
      url: 'https://solarirelandgroup.ie',
    },
    featureList: [
      'Instant annual savings calculation',
      'System size recommendation',
      'Payback period estimation',
      '25-year savings projection',
      'Monthly generation breakdown',
      'Self-consumption analysis',
      'Clean Export Guarantee earnings',
      'CO2 offset calculation',
      'SEAI grant integration',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function SolarCalculatorPage() {
  noStore();
  // The visible FAQ (and its FAQPage schema) is rendered by <FAQ/> inside
  // <SolarCalculatorClient/>; a second schema-only FAQPage here would be an
  // invisible duplicate that contradicts Google's "must match visible content".
  return (
    <>
      <CalculatorSchema />
      <SolarCalculatorClient />
    </>
  );
}
