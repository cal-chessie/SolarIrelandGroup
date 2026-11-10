import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Euro,
  ExternalLink,
  FileCheck,
  Percent,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import IntakeLink from '@/components/intake/IntakeLink';
import { ndmgTableEur, VAT_COMMERCIAL } from '@/lib/estimate';
import { SOLAR_DATA } from '@/lib/solar-data';

/**
 * /commercial-solar-grant: the SEAI Non-Domestic Microgen Grant, doubled for
 * applications from 6 Oct 2026 to 6 Jul 2027 (Cal, 11 Nov 2026, batch 3).
 *
 * Every grant figure comes from GRANT_SCHEDULES via ndmgTableEur(), priced on
 * the first day of the doubled window so the table shows that window. Every
 * rule comes from SEAI's own Non-Domestic Microgen Scheme Application Guide
 * V1.5 (30 Sep 2026); VAT and the Accelerated Capital Allowance from
 * revenue.ie. No business saving is stated: the analyser works that out.
 */

const PAGE_URL = 'https://solarirelandgroup.ie/commercial-solar-grant';
const WINDOW_DAY = '2026-10-06';
const N = SOLAR_DATA.ndmgDoubled;

const SOURCES = {
  guide: 'https://seai.ie/grants/business-grants/commercial-solar-pv/Non-Domestic-Microgen-Scheme-Application-Guide.pdf',
  page: 'https://www.seai.ie/grants/business-grants/commercial-solar-pv',
  vat: 'https://www.revenue.ie/en/vat/vat-on-property-and-construction/construction-fixtures-fittings-solar-panels/solar-panels.aspx',
  aca: 'https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-0282026.aspx',
  tripleE: 'https://www.seai.ie/plan-your-energy-journey/for-your-business/energy-efficient-products/triple-e-register-for-products',
};

// Title 54 and description 150 characters, counted by code (scripts/seo-aeo-check.mjs).
const META_TITLE = 'Commercial Solar Grant Ireland: Up to €325,200 in 2026';
const META_DESCRIPTION =
  "SEAI's business solar grant is doubled to up to €325,200 until 6 Jul 2027. The kWp table, the 45% rule, VAT, tax relief and how your business applies.";

const ANSWER =
  "Yes. SEAI's Non-Domestic Microgen Grant pays businesses, farms, public bodies and non-profits up to €325,200 towards solar panels, for applications made from 6 October 2026 to 6 July 2027. SEAI pays the lower of its kWp table or 45% of your invoiced cost, and you need the grant offer before any work starts.";

const eur = (n: number) => `€${n.toLocaleString('en-IE')}`;

/** The table rows, priced by the engine on a day inside the doubled window. */
const TABLE_ROWS: { size: string; grant: string }[] = [
  { size: '1 kWp', grant: eur(ndmgTableEur(1, WINDOW_DAY)) },
  { size: '2 kWp', grant: eur(ndmgTableEur(2, WINDOW_DAY)) },
  { size: '3 kWp', grant: eur(ndmgTableEur(3, WINDOW_DAY)) },
  { size: '4 to 6 kWp', grant: eur(ndmgTableEur(6, WINDOW_DAY)) },
  { size: '7 to 20 kWp', grant: '€600 for each kWp above 6' },
  { size: '21 to 200 kWp', grant: '€400 for each kWp above 20' },
  { size: '201 to 1,000 kWp', grant: '€300 for each kWp above 200' },
  { size: 'Over 1,000 kWp', grant: `${N.maxLabel}, the maximum` },
];
const EXAMPLES = [10, 20, 50, 100, 200, 500, 1000].map((k) => ({ kwp: k, grant: eur(ndmgTableEur(k, WINDOW_DAY)) }));

const VAT_PCT = `${Math.round(VAT_COMMERCIAL * 1000) / 10}%`;

const FAQS = [
  {
    question: 'How much is the commercial solar grant in Ireland?',
    answer: `Up to ${N.maxLabel} under SEAI's Non-Domestic Microgen Grant, for new applications made from ${N.fromLabel} to ${N.toLabel}. A 20 kWp system draws ${eur(ndmgTableEur(20, WINDOW_DAY))} on the table and a 100 kWp system ${eur(ndmgTableEur(100, WINDOW_DAY))}. SEAI pays the lower of the table value or 45% of the invoiced cost.`,
  },
  {
    question: 'Who can apply for the Non-Domestic Microgen Grant?',
    answer:
      'Any business, agricultural, public body or non-profit premises built and occupied on or before 31 December 2024. The grant is once per MPRN, the system must be for your own use on site rather than export only, and it can be up to 1,000 kWp.',
  },
  {
    question: 'Can I start the work before SEAI approves the grant?',
    answer:
      'No. SEAI must issue the grant offer before you buy materials or start any work. Once you accept the offer you have 8 months to finish the install and send in the Declaration of Works.',
  },
  {
    question: 'Does the business grant cover a battery?',
    answer:
      "No. SEAI's guide says batteries and other extras outside the standard solar PV system are not eligible costs, so the invoice you claim on covers the solar system only.",
  },
  {
    question: 'What VAT does a business pay on solar panels?',
    answer: `Revenue applies the reduced rate, ${VAT_PCT}, to the supply and installation of solar panels on a business premises, subject to the two-thirds rule. The 0% rate is for private homes only. A VAT-registered business can usually reclaim the VAT; your accountant confirms that for your business.`,
  },
  {
    question: 'Does a business need a BER for the grant?',
    answer: 'No. SEAI does not require a Building Energy Rating before or after the works for the Non-Domestic Microgen Grant.',
  },
];

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESCRIPTION,
  alternates: { canonical: PAGE_URL, languages: { 'en-IE': PAGE_URL, 'x-default': PAGE_URL } },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Solar Ireland Group',
    locale: 'en_IE',
    type: 'article',
    images: [{ url: 'https://solarirelandgroup.ie/installs/commercial-flat-roof-solar.webp', width: 1152, height: 864, alt: 'Solar panels on a commercial flat roof in Ireland' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: ['https://solarirelandgroup.ie/installs/commercial-flat-roof-solar.webp'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

const card = 'rounded-2xl border border-white/10 bg-white/[0.03] p-6';

export default function CommercialSolarGrantPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://solarirelandgroup.ie' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://solarirelandgroup.ie/services' },
      { '@type': 'ListItem', position: 3, name: 'Commercial solar grant', item: PAGE_URL },
    ],
  };
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${PAGE_URL}#service`,
    name: 'Commercial solar PV installation with the SEAI Non-Domestic Microgen Grant',
    description: ANSWER,
    serviceType: 'Commercial solar panel installation',
    url: PAGE_URL,
    provider: { '@id': 'https://solarirelandgroup.ie/#organization' },
    areaServed: { '@type': 'Country', name: 'Ireland' },
    audience: { '@type': 'BusinessAudience', name: 'Irish businesses, farms, public bodies and non-profits' },
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  };

  const steps = [
    { icon: ClipboardCheck, title: '1. Your bill, then an on-site survey', body: 'Upload a business bill and see your figures. Every business then gets an on-site survey, so the design and quote fit your roof, your meter and when you use power.' },
    { icon: FileCheck, title: '2. The grant offer', body: 'You apply to SEAI and wait for the grant offer before anything is bought or started. We prepare the system details for the application with you.' },
    { icon: CalendarClock, title: '3. Eight months to finish', body: 'Once you accept the offer you have 8 months to complete the works. We make the ESB Networks application your system size needs (NC6 or NC7).' },
    { icon: Wrench, title: '4. Install and claim', body: 'A Safe Electric registered electrician does the electrical work. After you pay the invoice, the Declaration of Works goes in and SEAI pays the grant.' },
  ];

  const trust = [
    { icon: ShieldCheck, title: 'SEAI Registered Installers', body: 'Registered with SEAI for solar PV, installing across Ireland since 2019.' },
    { icon: BadgeCheck, title: 'RECI electricians', body: 'Every install is wired and certified by a RECI registered electrician.' },
    { icon: CheckCircle2, title: '5-year workmanship warranty', body: 'Our own work is covered for five years from the day we switch you on.' },
    { icon: Sparkles, title: '25-year panel warranty', body: 'The panels carry the manufacturer’s 25-year warranty.' },
  ];

  const gallery = [
    { src: '/installs/commercial-flat-roof-solar.webp', alt: 'Rows of solar panels on a commercial flat roof under a blue sky', caption: 'Commercial flat roof' },
    { src: '/installs/two-storey-home-black-solar-panels.webp', alt: 'Black solar panels on a two-storey Irish home', caption: 'Two-storey home' },
    { src: '/installs/in-roof-solar-slate.webp', alt: 'In-roof solar panels set into a slate roof', caption: 'In-roof on slate' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Navbar />

      <main className="bg-[#0a0a0a] text-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-24 pb-2 text-sm text-white/50">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white/80">Commercial solar grant</li>
          </ol>
        </nav>

        <section className="mx-auto max-w-6xl px-4 pb-10 pt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 px-3 py-1 text-xs font-medium text-yellow-400">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> Doubled until {N.toLabel}
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Commercial solar grant <span className="text-yellow-400">Ireland</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70" data-answer="">
              {ANSWER}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <IntakeLink
                opts={{ door: 'commercial-grant-hero', segment: 'business', step: 'bill' }}
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" /> See my savings
              </IntakeLink>
              <a href="#table" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/5">
                The grant by system size
              </a>
            </div>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-white/10">
            <Image
              src="/installs/commercial-flat-roof-solar.webp"
              alt="Rows of solar panels on a commercial flat roof under a blue sky"
              width={1152}
              height={864}
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-auto w-full"
            />
          </figure>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Euro, value: N.maxLabel, label: 'The most SEAI pays, for the first 1,000 kWp' },
              { icon: Percent, value: N.costShareLabel, label: 'Of your invoiced cost, if that is lower than the table' },
              { icon: CalendarClock, value: N.toLabel, label: `The doubled grant is for new applications from ${N.fromLabel} until this date` },
            ].map((s) => (
              <div key={s.label} className={card}>
                <s.icon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                <div className="mt-3 text-2xl font-bold">{s.value}</div>
                <div className="mt-1 text-sm text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10" id="table" aria-labelledby="table-h">
          <h2 id="table-h" className="text-2xl font-bold">The grant by system size</h2>
          <p className="mt-3 max-w-3xl text-white/60">
            SEAI sets the grant by whole kWp and adds each band on top of the one before. This is the doubled table for applications from {N.fromLabel} to {N.toLabel}.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">SEAI Non-Domestic Microgen Grant table, doubled window</caption>
                <thead className="bg-white/[0.04] text-white/70">
                  <tr><th scope="col" className="px-4 py-3 font-semibold">System size</th><th scope="col" className="px-4 py-3 font-semibold">Grant</th></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {TABLE_ROWS.map((r) => (
                    <tr key={r.size}><td className="px-4 py-3 text-white/80">{r.size}</td><td className="px-4 py-3 font-semibold">{r.grant}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Worked examples from the same table</caption>
                <thead className="bg-white/[0.04] text-white/70">
                  <tr><th scope="col" className="px-4 py-3 font-semibold">A system of</th><th scope="col" className="px-4 py-3 font-semibold">Table value</th></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {EXAMPLES.map((e) => (
                    <tr key={e.kwp}><td className="px-4 py-3 text-white/80">{e.kwp.toLocaleString('en-IE')} kWp</td><td className="px-4 py-3 font-semibold">{e.grant}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm text-white/50">
            SEAI then pays the lower of the table value and {N.costShareLabel} of the invoiced cost, a state aid rule. Only the solar PV system counts: batteries and other extras are not eligible costs. Source:{' '}
            <a href={SOURCES.guide} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">SEAI Non-Domestic Microgen Scheme Application Guide</a>.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="who-h">
          <h2 id="who-h" className="text-2xl font-bold">Who can get it</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              'Businesses, farms, public bodies and non-profits',
              'Premises built and occupied on or before 31 December 2024',
              'One grant per MPRN, the meter on your bill',
              'A system for your own use on site, not export only, up to 1,000 kWp',
              'A new system: nothing that another grant scheme has already funded',
              'No BER needed, before or after the works',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="how-h">
          <h2 id="how-h" className="text-2xl font-bold">How it works, start to finish</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((c) => (
              <div key={c.title} className={card}>
                <c.icon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="tax-h">
          <h2 id="tax-h" className="text-2xl font-bold">VAT and tax relief</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className={card}>
              <h3 className="text-lg font-semibold">VAT at {VAT_PCT}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Revenue applies the reduced rate to the supply and installation of solar panels on a business premises, subject to the two-thirds rule: if the goods come to more than two thirds of the contract, the standard rate applies to the whole job. The 0% rate is for private homes.{' '}
                <a href={SOURCES.vat} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">Revenue: solar panels</a>
              </p>
            </div>
            <div className={card}>
              <h3 className="text-lg font-semibold">Accelerated Capital Allowance</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                The ACA lets a business write off the full cost of qualifying energy-efficient equipment in the first year, and Revenue has extended it to 31 December 2030. It covers qualifying equipment only, listed on SEAI&apos;s Triple E register, so check the register with your accountant before you count on it for any part of a solar system.{' '}
                <a href={SOURCES.aca} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">Revenue eBrief 028/26</a>
                {' · '}
                <a href={SOURCES.tripleE} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">Triple E register</a>
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="trust-h">
          <h2 id="trust-h" className="text-2xl font-bold">Who fits it</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((c) => (
              <div key={c.title} className={card}>
                <c.icon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {gallery.map((g) => (
              <figure key={g.src} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <Image src={g.src} alt={g.alt} width={1152} height={864} sizes="(min-width: 640px) 33vw, 100vw" className="h-auto w-full" />
                <figcaption className="px-4 py-3 text-sm text-white/60">{g.caption}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/50">
            Real jobs of ours. More on the <Link href="/services#business" className="underline underline-offset-2 hover:text-white">commercial solar services page</Link>.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="faq-h">
          <h2 id="faq-h" className="text-2xl font-bold">Commercial solar grant, common questions</h2>
          <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {FAQS.map((f) => (
              <details key={f.question} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold marker:content-['']">
                  <span>{f.question}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-yellow-400 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{f.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/50">
            Sources:{' '}
            <a href={SOURCES.page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">SEAI Non-Domestic Microgen Grant</a>,{' '}
            <a href={SOURCES.guide} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">SEAI application guide</a>,{' '}
            <a href={SOURCES.vat} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">Revenue on solar panel VAT</a>. Home solar instead? Read the{' '}
            <Link href="/blog/complete-guide-seai-solar-grant-2026" className="underline underline-offset-2 hover:text-white">SEAI home solar grant guide</Link>.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 to-transparent p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">See what solar saves your business</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Your yearly saving, the right system for your roof and your grant of up to {N.maxLabel} under the doubled business grant, worked out from your bill and sent to your inbox. Then a quick call and an on-site survey. No obligation.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <IntakeLink
                opts={{ door: 'commercial-grant-end', segment: 'business', step: 'bill' }}
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" /> See my savings
              </IntakeLink>
              <Link href="/solar-calculator" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5">
                Use the bill analyser <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/40">
              <a href={SOURCES.page} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white/70">
                The grant on seai.ie <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppChat />
    </>
  );
}
