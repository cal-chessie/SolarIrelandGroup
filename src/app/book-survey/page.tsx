import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import BookSurveyClient from './BookSurveyClient';
import { bookSurveyRedirect } from '@/lib/intake/bookSurvey';

export const metadata: Metadata = {
  title: 'Book a Free Solar Survey',
  description:
    'Pick a real time for a free, no-obligation solar site survey: a 15-minute phone call first, then about 45 minutes at your home. SEAI registered. All 32 counties.',
  alternates: {
    canonical: 'https://solarirelandgroup.ie/estimate',
  },
  openGraph: {
    title: 'Book a Free Solar Survey',
    description:
      'A free site survey: a 15-minute phone call first, then about 45 minutes at your home. SEAI registered, all 32 counties. Pick a real time online.',
    url: 'https://solarirelandgroup.ie/book-survey',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Free Solar Survey',
    description:
      'A free site survey: a 15-minute phone call first, then about 45 minutes at your home. Pick a real time online.',
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
        'A free, no-obligation site survey in two steps: a 15-minute phone call first, then about 45 minutes at your home, where the surveyor checks the roof, the fuse board and the meter. Your proposal follows in your project page.',
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
          'Book a free, no-obligation site survey for your home: a 15-minute phone call first, then about 45 minutes at your home.',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://solarirelandgroup.ie/estimate',
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
        target: 'https://solarirelandgroup.ie/estimate',
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
            text: 'Yes, free and with no obligation. The surveyor checks the roof, the fuse board and the meter and goes through your figures. If solar is not right for your house, they will say so on the day.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does a solar survey take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Two steps: a 15-minute phone call first, then about 45 minutes at your home. Your proposal follows in your project page.',
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
 * /book-survey is a 308 to the one intake (APPLE-DECISIONS, "Doors"): the
 * survey times, as a home unless the link said business, with src, pkg and
 * county kept. The guard: a magic link (?lt=) from an old estimate email
 * still renders the booking form that threads the lead token into
 * /api/lead, so nothing in an inbox breaks (book-survey-door.test.tsx).
 */
export default async function BookSurveyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const to = bookSurveyRedirect(sp);
  if (to) permanentRedirect(to);
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
