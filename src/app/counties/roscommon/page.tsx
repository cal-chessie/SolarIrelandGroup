import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Sun,
  Euro,
  Zap,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';

const PAGE_URL = 'https://solarirelandgroup.ie/counties/roscommon';

// Towns and districts we serve across County Roscommon. Real, recognisable
// places so the local intent is genuine, not keyword stuffing.
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

// Pricing matches the site's canonical figures (the estimate engine and the
// home/FAQ copy): a 4 kWp system is €8,200 installed, €6,400 after the €1,800
// SEAI grant. Generation is the Roscommon figure from the county dataset.
const INSTALLED_4KWP = 8200;
const NET_4KWP = 6400;
const GRANT = 1800;
const GENERATION_KWH = 3380;

const FAQS = [
  {
    question: 'Do you install solar panels in County Roscommon?',
    answer:
      'Yes. Solar Ireland installs solar panels right across County Roscommon: Roscommon Town, Boyle, Castlerea, Ballaghaderreen, Strokestown, Elphin, Monksland and the surrounding rural areas. The quickest way to start is our free AI bill analyser, which reads your electricity bill and shows what solar would save your home before anyone visits.',
  },
  {
    question: 'How much do solar panels cost in Roscommon?',
    answer:
      'A standard 4 kWp system for a 3 to 4 bedroom home is €8,200 installed, or €6,400 after the €1,800 SEAI grant. Larger systems cost more but work out better per kWp. Rather than guess, upload your bill to our AI analyser and it gives you a figure based on your actual usage and roof.',
  },
  {
    question: 'How much electricity will solar panels generate in Roscommon?',
    answer:
      'A typical domestic system in Roscommon generates around 3,380 kWh of electricity a year. Roscommon has plenty of open, unshaded roof space on bungalows and farmhouses, which suits solar well. The households that benefit most are the ones using electricity during the day.',
  },
  {
    question: 'Is the €1,800 SEAI grant available in Roscommon?',
    answer:
      'Yes. Roscommon is in the Republic of Ireland, so the full SEAI Solar PV grant of up to €1,800 applies to homes built and occupied before 2021. Domestic solar also carries 0% VAT. We prepare and submit the grant paperwork for you, and a BER assessment is carried out after the work is finished, before the grant is paid.',
  },
  {
    question: 'Do I need planning permission for solar panels in Roscommon?',
    answer:
      'For the vast majority of Roscommon homes, no. Since 2022 rooftop solar on houses is exempt from planning permission across Ireland with no cap on panel area, provided a few standard conditions are met. We confirm your specifics before installation.',
  },
];

export const metadata: Metadata = {
  title: 'Solar Panel Installers Roscommon | AI Bill Analyser | Solar Ireland',
  description:
    'Solar panel installers in County Roscommon. Upload your electricity bill and our AI shows exactly what solar will save you. €1,800 SEAI grant handled, honest local quotes.',
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
    'solar bill analyser Roscommon',
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
      'Upload your bill and our AI shows what solar saves your Roscommon home. Real local installers, €1,800 SEAI grant handled, honest quotes.',
    url: PAGE_URL,
    siteName: 'Solar Ireland',
    locale: 'en_IE',
    type: 'website',
    images: [
      {
        url: 'https://solarirelandgroup.ie/og-counties.png',
        width: 1152,
        height: 864,
        alt: 'Solar Ireland, solar panel installers in County Roscommon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Panel Installers in Roscommon | Solar Ireland',
    description:
      'Upload your bill and our AI shows what solar saves your Roscommon home. SEAI grant handled, honest local quotes.',
    images: ['https://solarirelandgroup.ie/og-counties.png'],
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
      'Residential solar PV installation across County Roscommon: free AI bill analysis, SEAI grant application, installation by RECI-certified electricians, and post-works BER assessment.',
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
      price: String(INSTALLED_4KWP),
      description: '4 kWp system installed. €6,400 after the €1,800 SEAI grant.',
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

  const stats = [
    { icon: Euro, value: `€${NET_4KWP.toLocaleString()}`, label: `Typical 4 kWp system after the €${GRANT.toLocaleString()} SEAI grant` },
    { icon: Zap, value: `~${GENERATION_KWH.toLocaleString()} kWh`, label: 'Generated per year in Roscommon' },
    { icon: Sparkles, value: 'Free', label: 'Instant AI bill analysis, no obligation' },
  ];

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

        {/* Hero, led by the AI bill analyser */}
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 px-3 py-1 text-xs font-medium text-yellow-400">
            <MapPin className="h-3.5 w-3.5" /> Connacht, County Roscommon
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Solar Panel Installers in <span className="text-yellow-400">Roscommon</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            Upload your electricity bill and our AI shows you exactly what solar would save your Roscommon home, in
            minutes. Real local installers, the €1,800 SEAI grant handled for you, and an honest quote with no hard sell.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/solar-calculator"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300"
            >
              <Sparkles className="h-4 w-4" /> Analyse My Bill
            </Link>
            <Link
              href="/book-survey"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/5"
            >
              Book a survey
            </Link>
          </div>
        </section>

        {/* Local stats */}
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <s.icon className="h-5 w-5 text-yellow-400" />
                <div className="mt-3 text-2xl font-bold">{s.value}</div>
                <div className="mt-1 text-sm text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/40">
            Figures are typical for a 4 kWp home system. Your exact numbers depend on your usage and roof, which is what
            the bill analyser works out.
          </p>
        </section>

        {/* How it works, analyser first */}
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">How it works in Roscommon</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { icon: Sparkles, title: '1. Analyse your bill', body: 'Upload a recent electricity bill. Our AI reads your real usage and shows what solar would generate and save on your Roscommon home.' },
              { icon: FileCheck, title: '2. Quote and grant', body: 'You get an honest, itemised quote. We prepare the €1,800 SEAI grant, the ESB Networks connection and your post-works BER.' },
              { icon: CheckCircle2, title: '3. One-day install', body: 'A RECI-certified team installs and commissions the system in a single day, and you start saving from switch-on.' },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <c.icon className="h-6 w-6 text-yellow-400" />
                <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Towns served */}
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">Towns we serve across Roscommon</h2>
          <p className="mt-3 max-w-2xl text-white/60">
            We install for homeowners county-wide. Don&apos;t see your town? We still cover it. Run your bill through the
            analyser and we will confirm.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {TOWNS.map((town) => (
              <div key={town} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> {town}
              </div>
            ))}
          </div>
        </section>

        {/* Why Roscommon suits solar */}
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">Why Roscommon homes are well suited to solar</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { icon: Sun, title: 'Open, unshaded roofs', body: 'Roscommon bungalows and farmhouses often have large, south-facing roofs with little shading, close to ideal for solar generation.' },
              { icon: FileCheck, title: 'Grant and paperwork done for you', body: 'We prepare and submit the SEAI grant, handle the ESB Networks connection and arrange your post-works BER.' },
              { icon: Euro, title: 'Clear numbers up front', body: 'The AI bill analyser gives you a real savings figure for your own home before you commit to anything.' },
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
          <h2 className="text-2xl font-bold">Solar panels in Roscommon, common questions</h2>
          <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {FAQS.map((f) => (
              <details key={f.question} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold marker:content-['']">
                  <span>{f.question}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-yellow-400 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 to-transparent p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">See what solar saves your Roscommon home</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Upload your electricity bill and our AI does the rest. Real numbers for your home, the €1,800 SEAI grant
              included, no obligation.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/solar-calculator" className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300">
                <Sparkles className="h-4 w-4" /> Analyse My Bill
              </Link>
              <Link href="/counties" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5">
                See all counties <ArrowRight className="h-4 w-4" />
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
