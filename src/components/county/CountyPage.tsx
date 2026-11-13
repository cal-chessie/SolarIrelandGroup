import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import { estimate, usageFromMonthlyBill, fmtEur } from '@/lib/estimate';
import { SOLAR_DATA, GRANT_SCHEDULES, ndmgDoubledLine, ndmgDoubledLive } from '@/lib/solar-data';
import type { CountyData } from '@/data/counties/types';
import CountyEstimator from './CountyEstimator';
import CountyActions from './CountyActions';

const SITE = 'https://solarirelandgroup.ie';

/** Every figure on a county page, from the one engine with the county's own yield. */
function build(C: CountyData) {
const PAGE_URL = `${SITE}/counties/${C.slug}`;

// The reference home every figure in the copy reads from: a 3-bed semi on a
// €160 monthly bill, through the one engine, with the county's own yield.
const REF = estimate({ annualUsageKwh: usageFromMonthlyBill(160), homeId: 'semi', generationPerKwp: C.pvgis.kwhPerKwp });
const FOUR = estimate({ annualUsageKwh: usageFromMonthlyBill(160), systemSizeKwp: 4, generationPerKwp: C.pvgis.kwhPerKwp });
const GRANT = SOLAR_DATA.grant.label;
const BATTERY = SOLAR_DATA.batteryGrant;
const VS_DUBLIN = Math.round((1 - C.pvgis.kwhPerKwp / C.pvgis.dublinKwhPerKwp) * 100);
const NDMG_LIVE = ndmgDoubledLive();

const FAQS: { q: string; a: string }[] = [
  {
    q: `Are solar panels worth it in ${C.name}?`,
    a: `For most homes, yes. A south-facing roof in ${C.pvgis.place} makes about ${C.pvgis.kwhPerKwp} kWh per kWp a year (PVGIS, EU Joint Research Centre). On a €160 monthly bill our estimate puts a ${REF.systemSizeKwp} kWp system at about ${fmtEur(REF.totalAnnualBenefitEur)} a year in savings and export income, paying back in about ${REF.paybackYears} years after the ${GRANT} SEAI grant. Homes that use power during the day do best.`,
  },
  {
    q: `How much do solar panels cost in ${C.name}?`,
    a: `A 4 kWp system is ${fmtEur(FOUR.installCostEur)} installed, or ${fmtEur(FOUR.costAfterGrantEur)} after the ${GRANT} SEAI grant. Domestic solar carries 0% VAT. Larger systems cost more in total but less per kWp. The Bill Analyser sizes the system to your own usage.`,
  },
  {
    q: `How much electricity do solar panels make in ${C.name}?`,
    a: `About ${C.pvgis.kwhPerKwp} kWh per kWp a year on a south-facing roof at 35 degrees, so a 4 kWp system makes about ${(4 * C.pvgis.kwhPerKwp).toLocaleString()} kWh. That is about ${VS_DUBLIN}% less than the same roof in Dublin. May is the best month and December the weakest.`,
  },
  {
    q: `Do solar panels work in ${C.name} in winter?`,
    a: `They work, but they make far less. PVGIS puts December at about ${Math.round(C.pvgis.monthlyKwhPerKwp[11] * 4)} kWh for a 4 kWp system against about ${Math.round(C.pvgis.monthlyKwhPerKwp[4] * 4)} kWh in May. Most of the year's saving comes from March to September.`,
  },
  {
    q: `Is the SEAI solar grant available in ${C.name}?`,
    a: `Yes. The SEAI Solar Electricity Grant pays up to ${GRANT} for homes built and occupied before 2025, and a battery of ${BATTERY.minLabel} adds ${BATTERY.label} on the same application, up to ${BATTERY.withSolarMaxLabel} in total. You apply on seai.ie and get approval before any work starts.`,
  },
  {
    q: 'Do I need to tell ESB Networks before I install solar?',
    a: 'Yes, and the installer does it. A home system up to 6 kW on a single-phase supply (11 kW on three-phase) is notified to ESB Networks on the NC6 form. Bigger systems need an NC7 application and ESB Networks approval before connection.',
  },
  {
    q: `Do I need planning permission for solar panels in ${C.name}?`,
    a: 'For almost every house, no. Rooftop solar on a house has been exempt from planning permission since October 2022, with no limit on panel area, subject to standard conditions. Homes in a solar safeguarding zone near an airport or a protected structure follow different rules.',
  },
  {
    q: `Can a ${C.name} farm or business get a solar grant?`,
    a: NDMG_LIVE
      ? `Yes. ${ndmgDoubledLine()} Farms can also look at TAMS, run by the Department of Agriculture. Our guide compares the two.`
      : 'Yes. Businesses can apply for the SEAI Non-Domestic Microgen Grant, and farms can look at TAMS from the Department of Agriculture. Our guide compares the two.',
  },
  ...(C.extraFaqs ?? []),
];

const TITLE = `Solar Panels ${C.name} | Installers, Costs and SEAI Grant`;
const DESCRIPTION = `Solar panels in ${C.name}: ${C.pvgis.kwhPerKwp} kWh per kWp a year, the ${GRANT} SEAI grant and a live estimate for your home. Analyse your bill free.`;

const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Solar Ireland Group',
    locale: 'en_IE',
    type: 'website',
    images: [{ url: `${SITE}/og-counties.png`, width: 1152, height: 864, alt: `Solar panels in County ${C.name}` }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [`${SITE}/og-counties.png`] },
  robots: C.indexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } }
    : { index: false, follow: true },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Counties', item: `${SITE}/counties` },
        { '@type': 'ListItem', position: 3, name: C.name, item: PAGE_URL },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'en-IE',
      dateModified: C.updated,
      isPartOf: { '@id': `${SITE}/#website` },
      breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
      mainEntity: { '@id': `${PAGE_URL}#service` },
      about: { '@id': `${PAGE_URL}#service` },
    },
    {
      '@type': 'Service',
      '@id': `${PAGE_URL}#service`,
      name: `Solar panel installation in County ${C.name}`,
      serviceType: 'Solar PV installation',
      url: PAGE_URL,
      provider: { '@id': `${SITE}/#business` },
      brand: { '@id': `${SITE}/#organization` },
      areaServed: {
        '@type': 'AdministrativeArea',
        name: `County ${C.name}`,
        sameAs: C.wikipedia,
        geo: { '@type': 'GeoCoordinates', latitude: C.pvgis.lat.toFixed(5), longitude: C.pvgis.lon.toFixed(5) },
        containsPlace: C.towns.map((t) => ({ '@type': 'Place', name: t })),
        containedInPlace: { '@type': 'Country', name: 'Ireland' },
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: String(FOUR.installCostEur),
        description: `4 kWp system installed. ${fmtEur(FOUR.costAfterGrantEur)} after the ${GRANT} SEAI grant.`,
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

return { PAGE_URL, REF, FOUR, GRANT, BATTERY, VS_DUBLIN, NDMG_LIVE, FAQS, metadata, schema };
}

export function countyMetadata(C: CountyData): Metadata {
  return build(C).metadata;
}

const h2 = 'text-2xl font-bold tracking-tight sm:text-3xl';
const card = 'rounded-2xl border border-white/10 bg-white/[0.03] p-6';
const body = 'text-[15px] leading-relaxed text-white/75';
const link = 'font-medium text-yellow-300 underline decoration-yellow-300/40 underline-offset-4 hover:decoration-yellow-300';

export default function CountyPage({ county: C }: { county: CountyData }) {
  const { REF, FOUR, GRANT, BATTERY, VS_DUBLIN, NDMG_LIVE, FAQS, schema } = build(C);
  const peakMonth = Math.round(C.pvgis.monthlyKwhPerKwp[4] * 4);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />

      <main className="bg-[#0a0a0a] text-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-24 pb-2 text-sm text-white/60">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/counties" className="hover:text-white">Counties</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white/85">{C.name}</li>
          </ol>
        </nav>

        {/* Hero: the answer first, then the two doors */}
        <section className="mx-auto max-w-6xl px-4 pb-8 pt-6">
          <p className="text-sm font-medium text-yellow-300">County {C.name}, {C.province}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{`Solar panels in ${C.name}`}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            A south-facing roof in {C.name} makes about {C.pvgis.kwhPerKwp} kWh of electricity per kWp a year. On a €160
            monthly bill that is about {fmtEur(REF.totalAnnualBenefitEur)} a year back, and a payback of about{' '}
            {REF.paybackYears} years after the {GRANT} SEAI grant. Upload a bill to see your own figure. A free 15-minute call
            then turns it into a plan.
          </p>
          <p className="mt-3 text-xs text-white/60">
            Updated <time dateTime={C.updated}>{new Date(C.updated).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}</time>.
            Figures from PVGIS, seai.ie and esbnetworks.ie.
          </p>
          <div className="mt-8">
            <CountyActions county={C.slug} placement="hero" phone />
          </div>
          <dl className="county-rise mt-10 grid gap-4 sm:grid-cols-3">
            {[
              [`${C.pvgis.kwhPerKwp} kWh`, `per kWp a year in ${C.pvgis.place} (PVGIS)`],
              [fmtEur(FOUR.costAfterGrantEur), `a 4 kWp system after the ${GRANT} grant`],
              [`${REF.paybackYears} years`, 'payback on a €160 monthly bill'],
            ].map(([v, k]) => (
              <div key={k} className={card}>
                <dd className="text-2xl font-bold tabular-nums">{v}</dd>
                <dt className="mt-1 text-sm text-white/65">{k}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* Live estimate */}
        <section id="estimate" aria-labelledby="estimate-h" className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="estimate-h" className={h2}>Your {C.name} estimate</h2>
          <p className={`mt-3 max-w-2xl ${body}`}>
            Set the slider to your monthly bill. The Bill Analyser&apos;s engine runs the sums with {C.name}&apos;s
            own sunshine figure.
          </p>
          <div className="mt-6">
            <CountyEstimator
              county={C.slug}
              countyName={C.name}
              place={C.pvgis.place}
              kwhPerKwp={C.pvgis.kwhPerKwp}
              monthlyKwhPerKwp={C.pvgis.monthlyKwhPerKwp}
            />
          </div>
        </section>

        {/* Yield vs national */}
        <section aria-labelledby="yield-h" className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="yield-h" className={h2}>How much sun does {C.name} get?</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className={body}>
              <p>
                {C.name} gets about {VS_DUBLIN}% less solar energy than Dublin on the same roof: {C.pvgis.kwhPerKwp} kWh
                per kWp a year against {C.pvgis.dublinKwhPerKwp}. On a 4 kWp system that costs about{' '}
                {Math.round((C.pvgis.dublinKwhPerKwp - C.pvgis.kwhPerKwp) * 4)} kWh a year, a few months on the payback.
              </p>
              <p className="mt-4">
                The roof and the house matter more. {C.housingNote}
              </p>
            </div>
            <div className={card}>
              <table className="w-full text-left text-sm">
                <caption className="mb-3 text-left text-sm font-medium text-white/80">Yield, south-facing roof at 35 degrees</caption>
                <thead className="text-white/60"><tr><th className="pb-2 font-medium">Place</th><th className="pb-2 font-medium">kWh per kWp a year</th></tr></thead>
                <tbody className="tabular-nums">
                  <tr className="border-t border-white/10"><td className="py-2">{C.pvgis.place}</td><td>{C.pvgis.kwhPerKwp}</td></tr>
                  <tr className="border-t border-white/10"><td className="py-2">Dublin</td><td>{C.pvgis.dublinKwhPerKwp}</td></tr>
                  <tr className="border-t border-white/10"><td className="py-2">Best month, May (4 kWp)</td><td>{peakMonth} kWh</td></tr>
                </tbody>
              </table>
              <p className="mt-4 text-xs leading-relaxed text-white/60">
                Source: <a className={link} href={'https://re.jrc.ec.europa.eu/pvg_tools/en/'} rel="noopener">PVGIS, EU Joint Research Centre</a>,
                SARAH3 data 2005 to 2023, 14% system loss, fetched {C.pvgis.fetched}.
              </p>
            </div>
          </div>
        </section>

        {/* SEAI grant steps */}
        <section aria-labelledby="grant-h" className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="grant-h" className={h2}>How do you get the SEAI grant in {C.name}?</h2>
          <p className={`mt-3 max-w-2xl ${body}`}>
            SEAI pays up to {GRANT} toward solar panels on a home built and occupied before 2025, and {BATTERY.label} more
            for a battery of {BATTERY.minLabel}. The order matters: approval comes before any work.
          </p>
          <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Apply on seai.ie', 'You apply online with your MPRN and name your installer. Wait for the approval letter.'],
              ['Install', 'A RECI-registered electrician fits and tests the system, usually in one day.'],
              ['ESB Networks', 'We notify ESB Networks on the NC6 form so your system is registered on the grid.'],
              ['BER and payment', 'A registered BER assessor completes the post-works BER. We send the paperwork and SEAI pays you.'],
            ].map(([t, d], i) => (
              <li key={t} className={card}>
                <span className="text-sm font-semibold text-yellow-300">Step {i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{d}</p>
              </li>
            ))}
          </ol>
          <p className={`mt-5 ${body}`}>
            The full rules are in our <Link className={link} href="/blog/complete-guide-seai-solar-grant-2026">SEAI solar grant guide</Link>{' '}
            and on <a className={link} href={GRANT_SCHEDULES.solarPv.source} rel="noopener">seai.ie</a>.
          </p>
        </section>

        {/* ESB Networks */}
        <section aria-labelledby="esb-h" className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="esb-h" className={h2}>How does ESB Networks connect your solar?</h2>
          <div className={`mt-4 max-w-3xl ${body}`}>
            <p>
              Every {C.name} home is on the ESB Networks grid, whoever supplies your electricity. A system up to 6 kW on a
              single-phase supply, or 11 kW on three-phase, is a microgeneration connection: the installer sends ESB Networks
              the NC6 form and you do not wait for approval. Larger systems, common on farms, need an NC7 application first.
            </p>
            <p className="mt-4">
              Once you export, your supplier pays you for each unit under the Clean Export Guarantee. Each supplier sets its own
              rate. Read more in our <Link className={link} href="/blog/nc6-form-solar-grid-connection-ireland">NC6 guide</Link> and
              on <a className={link} href="https://www.esbnetworks.ie/" rel="noopener">esbnetworks.ie</a>.
            </p>
          </div>
        </section>

        {/* Farms and business */}
        <section aria-labelledby="farm-h" className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="farm-h" className={h2}>Solar for {C.name} farms and businesses</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className={card}>
              <h3 className="text-lg font-semibold">Farms</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {C.farmNote} Our guide sets the two side by side.
              </p>
              <Link className={`mt-3 inline-block text-sm ${link}`} href="/blog/farm-solar-2027-doubled-seai-grant-or-tams">
                Farm solar in 2027: SEAI grant or TAMS
              </Link>
            </div>
            <div className={card}>
              <h3 className="text-lg font-semibold">Businesses</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {NDMG_LIVE ? ndmgDoubledLine() : 'Businesses can apply for the SEAI Non-Domestic Microgen Grant.'} Shops,
                garages, hotels and offices across the county qualify.
              </p>
              <div className="mt-3 flex flex-col gap-1 text-sm">
                <Link className={link} href="/commercial-solar-grant">The SEAI business grant, explained</Link>
                <Link className={link} href="/blog/seai-business-solar-grant-doubled-2027">Why the business grant doubled</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Towns */}
        <section aria-labelledby="towns-h" className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="towns-h" className={h2}>Towns we serve in {C.name}</h2>
          <p className={`mt-3 max-w-2xl ${body}`}>
            {C.townsIntro} If your townland is not listed, we still cover it.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {C.towns.map((t) => (
              <li key={t} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">{t}</li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-h" className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="faq-h" className={h2}>Solar in {C.name}: your questions answered</h2>
          <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {FAQS.map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
                  <h3 className="text-base font-semibold">{f.q}</h3>
                  <span aria-hidden="true" className="text-yellow-300 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Wider reading */}
        <section aria-labelledby="more-h" className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="more-h" className={h2}>Solar in Ireland, more guides</h2>
          <ul className="mt-5 grid gap-2 text-[15px] sm:grid-cols-2">
            <li><Link className={link} href="/blog/how-much-do-solar-panels-cost-ireland-2026">How much solar panels cost in Ireland</Link></li>
            <li><Link className={link} href="/blog/are-solar-panels-worth-it-ireland-2026">Are solar panels worth it in Ireland</Link></li>
            <li><Link className={link} href="/blog/high-winter-bills-is-solar-worth-it-ireland">High winter bills: is solar worth it</Link></li>
            <li><Link className={link} href="/blog/seai-battery-grant-600-explained">The {BATTERY.label} SEAI battery grant</Link></li>
            <li><Link className={link} href="/counties">Solar panels in every county</Link></li>
            <li><Link className={link} href="/">Solar Ireland Group home</Link></li>
          </ul>
        </section>

        {/* Close */}
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-3xl border border-yellow-400/25 bg-gradient-to-br from-yellow-400/10 to-transparent p-8 sm:p-12">
            <h2 className={h2}>See what solar saves your {C.name} home</h2>
            <p className="mt-3 max-w-xl text-white/80">
              Upload a recent bill. The analyser reads your day and night split and gives you a close estimate. A 15-minute call
              with us turns it into a plan.
            </p>
            <div className="mt-7">
              <CountyActions county={C.slug} placement="close" phone />
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppChat />
    </>
  );
}
