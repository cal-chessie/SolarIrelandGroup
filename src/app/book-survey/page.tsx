import type { Metadata } from 'next';
import BookSurveyClient from './BookSurveyClient';
import IntakePage from '@/components/intake/IntakePage';
import { parseIntakeQuery } from '@/lib/intake/open';

export const metadata: Metadata = {
  title: 'Book a Free Solar Survey',
  description:
    'Pick a real time for a free, no-obligation solar site survey. Our SEAI-registered team checks your roof and gives an honest itemised quote. All 32 counties.',
  alternates: {
    canonical: 'https://solarirelandgroup.ie/book-survey',
  },
  openGraph: {
    title: 'Book a Free Solar Survey',
    description:
      'Free roof assessment, savings calculation, and itemised quote. SEAI-registered installers covering all 32 counties. Pick a real time online.',
    url: 'https://solarirelandgroup.ie/book-survey',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Free Solar Survey',
    description:
      'Free roof assessment, savings calculation, and itemised quote. Pick a real time online.',
  },
};

const bookSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': 'https://solarirelandgroup.ie/#service-survey',
      name: 'Free Home Solar Survey',
      description:
        'A comprehensive, no-obligation roof and energy assessment. Our assessor evaluates roof orientation, pitch, shading, structural suitability, and electrical setup. You receive an honest itemised quote with estimated annual savings, SEAI grant eligibility, and payback period.',
      url: 'https://solarirelandgroup.ie/book-survey',
      provider: {
        '@id': 'https://solarirelandgroup.ie/#business',
      },
      serviceType: 'Solar Panel Site Survey',
      areaServed: {
        '@type': 'Country',
        name: 'Ireland',
      },
      potentialAction: {
        '@type': 'ReserveAction',
        '@id': 'https://solarirelandgroup.ie/#book-survey-action',
        name: 'Book Free Solar Survey',
        description:
          'Book a free, no-obligation solar survey for your home. A SEAI-registered assessor will visit your property, evaluate your roof, and provide an honest itemised quote with estimated savings.',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://solarirelandgroup.ie/book-survey',
          inLanguage: 'en-IE',
          actionPlatform: [
            'https://schema.org/DesktopWebPlatform',
            'https://schema.org/MobileWebPlatform',
          ],
        },
        result: {
          '@type': 'Reservation',
          name: 'Free Solar Home Survey',
        },
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '0',
          priceCurrency: 'EUR',
          name: 'Free - No Obligation',
        },
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://solarirelandgroup.ie/book-survey',
      name: 'Book a Free Solar Survey',
      description:
        'Book your free no-obligation solar survey. SEAI-registered assessors covering all 32 counties of Ireland.',
      url: 'https://solarirelandgroup.ie/book-survey',
      inLanguage: 'en-IE',
      isPartOf: {
        '@id': 'https://solarirelandgroup.ie/#website',
      },
      about: {
        '@id': 'https://solarirelandgroup.ie/#business',
      },
      potentialAction: {
        '@type': 'ReserveAction',
        target: 'https://solarirelandgroup.ie/book-survey',
        result: {
          '@type': 'Reservation',
          name: 'Free Solar Home Survey',
        },
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://solarirelandgroup.ie/book-survey#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://solarirelandgroup.ie',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Book a Survey',
          item: 'https://solarirelandgroup.ie/book-survey',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://solarirelandgroup.ie/book-survey#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is the solar survey really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, free and with no obligation. The assessor measures your roof, checks shading and reviews your usage, then gives you an itemised quote. If solar is not right for your house, they will say so on the day.',
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
            text: 'You pick a real time on the page. Your confirmation email arrives straight away with a calendar invite and your project page, and a reminder comes the day before. On the day, our surveyor checks the roof, the fuse board and the meter, and goes through your figures with you.',
          },
        },
      ],
    },
  ],
};

/**
 * Intake OS: /book-survey keeps its URL for search and old links, and opens
 * the one intake at Screen 2 (the survey times). A magic link (?lt=) from an
 * old estimate email still gets the old booking form until slice 4 moves those
 * links to the portal sign-in, so nothing in an inbox breaks.
 */
export default async function BookSurveyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const hasMagicLink = typeof sp.lt === 'string' && sp.lt.length > 0;
  const q = parseIntakeQuery(sp);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
      {hasMagicLink ? (
        <BookSurveyClient />
      ) : (
        <IntakePage initial={{ ...q, door: q.door === 'direct' ? 'book-survey' : q.door, step: q.step ?? 'time', stepRaw: q.stepRaw ?? null }} />
      )}
    </>
  );
}
