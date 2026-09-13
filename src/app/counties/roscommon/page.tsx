import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Sun,
  Euro,
  Zap,
  CheckCircle2,
  ArrowRight,
  Calendar,
  FileCheck,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';

const PAGE_URL = 'https://solarirelandgroup.ie/counties/roscommon';

// Towns and districts we serve across County Roscommon. Kept to real,
// recognisable places so the local intent is genuine, not keyword stuffing.
const TOWNS = [
  'Roscommon Town',
  'Boyle',
  'Castlerea',
  'Ballaghaderreen',
  'Strokestown',
  'Elphin',
  'Monksland (Athlone)',
  'Roosky',
  'Frenchpark',
  'Ballinlough',
  'Knockcroghery',
  'Athleague',
];

// County figures come from the same dataset as the /counties directory card,
// so pricing and generation stay consistent across the site.
const COUNTY = {
  name: 'Roscommon',
  province: 'Connacht',
  population: '72,000',
  generationKwh: 3380,
  costMin: 4300,
  costMax: 6600,
};

const FAQS = [
  {
    question: 'Do you install solar panels in County Roscommon?',
    answer:
      'Yes. Solar Ireland installs solar panels right across County Roscommon: Roscommon Town, Boyle, Castlerea, Ballaghaderreen, Strokestown, Elphin, Monksland and the surrounding rural areas. Surveys are free and we handle the full SEAI grant application for you.',
  },
  {
    question: 'How much do solar panels cost in Roscommon?',
    answer:
      'A typical home system in Roscommon costs from about €4,300 to €6,600 after the €1,800 SEAI grant, depending on system size. A standard 4 kWp system for a 3 to 4 bedroom home is €8,200 installed, or €6,400 after the grant. Use our free bill analyser for an exact figure based on your own electricity usage.',
  },
  {
    question: 'How much electricity will solar panels generate in Roscommon?',
    answer:
      'A typical domestic system in Roscommon generates around 3,380 kWh of electricity a year. Roscommon has plenty of open, unshaded roof space on bungalows and farmhouses, which suits solar well. The households that benefit most are the ones using electricity during the day.',
  },
  {
    question: 'Is the €1,800 SEAI grant available in Roscommon?',
    answer:
      'Yes. Roscommon is in the Republic of Ireland, so the full SEAI Solar PV grant of up to €1,800 applies to homes built and occupied before 2021. Domestic solar also carries 0% VAT. We prepare and submit the grant paperwork on your behalf, and a BER assessment is carried out after the work is finished, before the grant is paid.',
  },
  {
    question: 'Do I need planning permission for solar panels in Roscommon?',
    answer:
      'For the vast majority of Roscommon homes, no. Since 2022 rooftop solar on houses is exempt from planning permission across Ireland with no cap on panel area, provided a few standard conditions are met. We confirm your specifics during the free survey.',
  },
];

export const metadata: Metadata = {
  title: 'Solar Panel Installers Roscommon | SEAI Grants | Free Survey',
  description:
    'SEAI-registered solar panel installers in County Roscommon: Roscommon Town, Boyle, Castlerea, Strokestown and more. €1,800 grant handled for you. Free survey and honest quote.',
  keywords: [
    'solar panels Roscommon',
    'solar panel installers Roscommon',
    'solar panels Roscommon Town',
    'solar panels Boyle',
    'solar panels Castlerea',
    'solar panels Ballaghaderreen',
    'solar panels Strokestown',
    'solar PV Roscommon',
    'SEAI grant Roscommon',
    'solar panel cost Roscommon',
    'free solar survey Roscommon',
    'solar battery storage Roscommon',
    'solar panels Connacht',
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'en-IE': PAGE_URL,
      'x-default': PAGE_URL,
    },
  },
  openGraph: {
    title: 'Solar Panel Installers in Roscommon | Solar Ireland',
    description:
      'Trusted local solar panel installers across County Roscommon. Compare pricing, SEAI grants and generation, and book a free survey near you.',
    url: PAGE_URL,
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-counties.png',
        width: 1152,
        height: 864,
        alt: 'Solar Ireland - Solar Panel Installers in County Roscommon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Panel Installers in Roscommon | Solar Ireland',
    description:
      'Local solar panel installers across County Roscommon. SEAI grants handled, free survey, honest quotes.',
    images: ['https://solarirelandgroup.ie/og-counties.png'],
    creator: '@solarireland',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RoscommonPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://solarirelandgroup.ie' },
      { '@type': 'ListItem', position: 2, name: 'County Directory', item: 'https://solarirelandgroup.ie/counties' },
      { '@type': 'ListItem', position: 3, name: 'Roscommon', item: PAGE_URL },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${PAGE_URL}#service`,
    name: 'Solar Panel Installation in County Roscommon',
    description:
      'Residential solar PV installation across County Roscommon, including free survey, SEAI grant application, installation by RECI-certified electricians, and post-works BER assessment.',
    serviceType: 'Solar Panel Installation',
    url: PAGE_URL,
    provider: { '@id': 'https://solarirelandgroup.ie/#organization' },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'County Roscommon',
      containedInPlace: { '@type': 'Country', name: 'Ireland' },
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: String(COUNTY.costMin),
      description: 'Typical home solar system, net cost after the €1,800 SEAI grant.',
      availability: 'https://schema.org/InStock',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Navbar />

      <main className="bg-[#0a0a0a] text-white">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-24 pb-2 text-sm text-white/50">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/counties" className="hover:text-white">Counties</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white/80">Roscommon</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 px-3 py-1 text-xs font-medium text-yellow-400">
            <MapPin className="h-3.5 w-3.5" /> Connacht · County Roscommon
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Solar Panel Installers in <span className="text-yellow-400">Roscommon</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            SEAI-registered solar panel installation right across County Roscommon, from Roscommon Town and Boyle
            to Castlerea, Strokestown and Monksland. Free survey, honest quote, and we handle the full €1,800 SEAI
            grant application for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/solar-calculator"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300"
            >
              Analyse My Bill <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/book-survey"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/5"
            >
              <Calendar className="h-4 w-4" /> Book a Free Survey
            </Link>
          </div>
        </section>

        {/* Local stats */}
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Euro, label: 'Typical cost after grant', value: `€${COUNTY.costMin.toLocaleString()} to €${COUNTY.costMax.toLocaleString()}` },
              { icon: Zap, label: 'Annual generation', value: `~${COUNTY.generationKwh.toLocaleString()} kWh` },
              { icon: Sun, label: 'SEAI grant handled', value: 'Up to €1,800' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <s.icon className="h-5 w-5 text-yellow-400" />
                <div className="mt-3 text-2xl font-bold">{s.value}</div>
                <div className="mt-1 text-sm text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Towns served */}
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">Towns we serve across Roscommon</h2>
          <p className="mt-3 max-w-2xl text-white/60">
            We install for homeowners county-wide. Don&apos;t see your town? We still cover it. Get in touch for a free
            consultation.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {TOWNS.map((town) => (
              <div key={town} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> {town}
              </div>
            ))}
          </div>
        </section>

        {/* Why local / process */}
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">Why Roscommon homes are well suited to solar</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { icon: Sun, title: 'Open, unshaded roofs', body: 'Roscommon\'s bungalows and farmhouses often have large, south-facing roofs with little shading, close to ideal for solar generation.' },
              { icon: FileCheck, title: 'Grant & paperwork done for you', body: 'We prepare and submit the SEAI grant, handle the ESB Networks grid connection notification, and arrange your post-works BER.' },
              { icon: CheckCircle2, title: 'One-day installation', body: 'A standard system is installed and commissioned in a single day by our RECI-certified team.' },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <c.icon className="h-6 w-6 text-yellow-400" />
                <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">Solar panels in Roscommon: common questions</h2>
          <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {FAQS.map((f) => (
              <details key={f.question} className="group p-6">
                <summary className="cursor-pointer list-none text-base font-semibold marker:content-['']">
                  {f.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 to-transparent p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Get your free Roscommon solar quote</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Upload your electricity bill and our AI shows you exactly what solar will save your Roscommon home. No
              obligation, no hard sell.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/solar-calculator" className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300">
                Analyse My Bill <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/counties" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5">
                See all counties
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppChat />
    </>
  );
}
