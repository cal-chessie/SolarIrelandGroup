import type { Metadata } from 'next';
import BookSurveyClient from './BookSurveyClient';

export const metadata: Metadata = {
  title: 'Book a Free Solar Survey | Solar Ireland',
  description:
    'Book your free no-obligation solar survey in under 60 seconds. Our SEAI-registered team will assess your roof, calculate your savings, and provide an honest itemised quote. Available across all 32 counties.',
  alternates: {
    canonical: 'https://solarireland.com/book-survey',
  },
  openGraph: {
    title: 'Book a Free Solar Survey | Solar Ireland',
    description:
      'Free roof assessment, savings calculation, and itemised quote. SEAI-registered installers covering all 32 counties. Book in under 60 seconds.',
    url: 'https://solarireland.com/book-survey',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Free Solar Survey | Solar Ireland',
    description:
      'Free roof assessment, savings calculation, and itemised quote. Book in under 60 seconds.',
  },
};

const bookSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Action',
      '@id': 'https://solarireland.com/#book-survey-action',
      name: 'Book Free Solar Survey',
      description:
        'Book a free, no-obligation solar survey for your home. A SEAI-registered assessor will visit your property, evaluate your roof, and provide an honest itemised quote with estimated savings.',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://solarireland.com/book-survey',
        inLanguage: 'en-IE',
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      agent: {
        '@type': 'Organization',
        '@id': 'https://solarireland.com/#organization',
      },
    },
    {
      '@type': 'Service',
      '@id': 'https://solarireland.com/#service-survey',
      name: 'Free Home Solar Survey',
      description:
        'A comprehensive, no-obligation roof and energy assessment. Our assessor evaluates roof orientation, pitch, shading, structural suitability, and electrical setup. You receive an honest itemised quote with estimated annual savings, SEAI grant eligibility, and payback period.',
      url: 'https://solarireland.com/book-survey',
      provider: {
        '@id': 'https://solarireland.com/#business',
      },
      serviceType: 'Solar Panel Site Survey',
      areaServed: {
        '@type': 'Country',
        name: 'Ireland',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '0',
          priceCurrency: 'EUR',
          name: 'Free — No Obligation',
        },
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://solarireland.com/book-survey',
      name: 'Book a Free Solar Survey',
      description:
        'Book your free no-obligation solar survey. SEAI-registered assessors covering all 32 counties of Ireland.',
      url: 'https://solarireland.com/book-survey',
      inLanguage: 'en-IE',
      isPartOf: {
        '@id': 'https://solarireland.com/#website',
      },
      about: {
        '@id': 'https://solarireland.com/#business',
      },
      potentialAction: {
        '@type': 'ReserveAction',
        target: 'https://solarireland.com/book-survey',
        result: {
          '@type': 'Reservation',
          name: 'Free Solar Home Survey',
        },
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://solarireland.com/book-survey#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://solarireland.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Book a Survey',
          item: 'https://solarireland.com/book-survey',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://solarireland.com/book-survey#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is the solar survey really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, completely free with no obligation. Our assessor visits your home, evaluates your roof and energy usage, and provides an honest itemised quote. You are under no pressure to proceed.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does a solar survey take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The survey typically takes 30 to 45 minutes. We assess your roof orientation, pitch, shading, structural suitability, and electrical setup. You receive your itemised quote within 48 hours.',
          },
        },
        {
          '@type': 'Question',
          name: 'What areas do you cover?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We cover all 32 counties across Ireland. Our assessors are based in Dublin, Cork, Galway, and Limerick, so we can reach most locations within a few days.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens after I book?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We will confirm your appointment by text and email within 2 hours. On the day, our assessor arrives at your chosen time, evaluates your property, and delivers your quote within 48 hours.',
          },
        },
      ],
    },
  ],
};

export default function BookSurveyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
      <BookSurveyClient />
    </>
  );
}
