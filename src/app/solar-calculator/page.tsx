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
      'en-GB': CALC_URL,
      'en': CALC_URL,
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
        width: 1920,
        height: 1080,
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

function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much can I save with solar panels in Ireland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most Irish households save between €800 and €1,400 per year with solar panels. A typical 4kWp system on a semi-detached home with a €160/month electricity bill can save around €1,400 annually, including €200-€400 in Clean Export Guarantee earnings. Savings depend on your electricity usage, roof orientation, and self-consumption rate.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many solar panels do I need in Ireland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most Irish homes need between 8 and 16 solar panels (3.5kWp to 7kWp systems). The number depends on your electricity usage, available roof space, and budget. Apartments may fit 4-6 panels, while larger detached homes can accommodate up to 22 panels (9.7kWp). Our calculator recommends the optimal number based on your specific situation.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the payback period for solar panels in Ireland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'With the €1,800 SEAI grant (Republic of Ireland), most solar panel systems in Ireland pay for themselves in 5 to 7 years. After that, the panels continue generating free electricity for their 25+ year lifespan, delivering total savings of €30,000 to €60,000 over 25 years depending on electricity price increases.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the SEAI solar grant work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The SEAI (Sustainable Energy Authority of Ireland) offers a €1,800 grant towards solar panel installation in the Republic of Ireland (26 counties). You must be an owner-occupier of a home built before 2021 with a BER rating of C3 or lower. The grant is deducted directly from your installation cost by your SEAI-registered installer, so you don\'t need to pay upfront and claim it back.',
        },
      },
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
  return (
    <>
      <CalculatorSchema />
      <FAQSchema />
      <SolarCalculatorClient />
    </>
  );
}
