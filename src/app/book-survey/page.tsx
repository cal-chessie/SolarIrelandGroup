import type { Metadata } from 'next';
import BookSurveyClient from './BookSurveyClient';
import { parseIntakeQuery } from '@/lib/intake/open';

/**
 * /book-survey: the free 15-minute call (12/10 brief, 9 Nov 2026). The URL is
 * kept because live estimate emails link here with ?lt=. No survey is sold on
 * the website: the survey is agreed on the call.
 */
export const metadata: Metadata = {
  // 60 characters with the " | Solar Ireland" template; the description is 153.
  title: 'Get Your Full Solar Estimate and a Free Call',
  description:
    'Tell us your electricity bill and get your full solar estimate by email, then a free 15-minute call about your savings and the SEAI grant. No obligation.',
  alternates: {
    canonical: 'https://solarirelandgroup.ie/book-survey',
  },
  openGraph: {
    title: 'Get Your Full Solar Estimate and a Free Call',
    description:
      'Your full solar estimate by email from your electricity bill, then a free 15-minute phone call, not a visit. We ring you today, or first thing tomorrow if it is late.',
    url: 'https://solarirelandgroup.ie/book-survey',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Your Full Solar Estimate and a Free Call',
    description: 'Your full solar estimate by email, then a free 15-minute call about your savings and the SEAI grant. No obligation.',
  },
};

const bookSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': 'https://solarirelandgroup.ie/#service-call',
      name: 'Free 15-Minute Solar Call',
      description:
        'A free, no-obligation 15-minute phone call. We go through your electricity bill, what solar panels would save you and the SEAI grant, and agree the next step with you if you want one.',
      url: 'https://solarirelandgroup.ie/book-survey',
      provider: { '@id': 'https://solarirelandgroup.ie/#business' },
      serviceType: 'Solar consultation call',
      areaServed: { '@type': 'Country', name: 'Ireland' },
      potentialAction: {
        '@type': 'CommunicateAction',
        '@id': 'https://solarirelandgroup.ie/#book-call-action',
        name: 'Book a free 15-minute call',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://solarirelandgroup.ie/book-survey',
          inLanguage: 'en-IE',
          actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
        },
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://solarirelandgroup.ie/book-survey',
      name: 'Get Your Full Solar Estimate and a Free Call',
      description: 'Your full solar estimate by email from your electricity bill, then a free 15-minute phone call about solar for your home or business. No visit, no obligation.',
      url: 'https://solarirelandgroup.ie/book-survey',
      inLanguage: 'en-IE',
      isPartOf: { '@id': 'https://solarirelandgroup.ie/#website' },
      about: { '@id': 'https://solarirelandgroup.ie/#business' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://solarirelandgroup.ie/book-survey#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://solarirelandgroup.ie' },
        { '@type': 'ListItem', position: 2, name: 'Your full solar estimate', item: 'https://solarirelandgroup.ie/book-survey' },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://solarirelandgroup.ie/book-survey#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is the call really free?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes. It is a free 15-minute phone call with no obligation. Nobody visits your home to book it.' },
        },
        {
          '@type': 'Question',
          name: 'When will you ring me?',
          acceptedAnswer: { '@type': 'Answer', text: "Today. If it's late, first thing tomorrow. You can tell us whether mornings, afternoons or evenings suit best." },
        },
        {
          '@type': 'Question',
          name: 'What happens on the call?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We go through your figures with you, answer anything you want to ask about solar and the SEAI grant, and agree the next step with you if you want one.',
          },
        },
      ],
    },
  ],
};

export default async function BookSurveyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = parseIntakeQuery(sp);
  const raw = Array.isArray(sp.lt) ? sp.lt[0] : sp.lt;
  const forv = Array.isArray(sp.segment) ? sp.segment[0] : sp.segment;
  const business = q.segment === 'business' || forv === 'business' || forv === 'commercial';
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }} />
      <BookSurveyClient lt={typeof raw === 'string' ? raw : null} segment={business ? 'commercial' : 'domestic'} src={q.src ?? null} />
    </>
  );
}
