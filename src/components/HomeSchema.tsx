/**
 * HomeSchema
 *
 * Home-page-only structured data. These types describe the home page and the
 * primary conversion journey, so they must render ONLY on "/" - not on every
 * page via the root layout (that would falsely claim every URL is the WebPage,
 * repeat the home breadcrumb, and re-declare the Service/HowTo/grant offer on
 * pages they don't belong to). Site-wide entities (Organization, LocalBusiness,
 * WebSite) stay in the root layout.
 */

import { installCostEur, seaiGrant, DOMESTIC_MIN_KWP } from "@/lib/estimate";

const SITE_URL = "https://solarirelandgroup.ie";

/**
 * Prices are COMPUTED from the engine, never typed here.
 *
 * They were typed once and went stale: this catalogue was still offering
 * 4 kWp at €6,500 and a battery package at €11,000 months after the real
 * prices became €8,200 and €11,400. Structured data is the worst place for a
 * stale price, because Google can surface it in a rich result and it undercut
 * the real figure by about €1,700. Now the only way for it to drift is for the
 * engine itself to change, which is the point.
 */
const PANELS_ONLY_KWP = DOMESTIC_MIN_KWP;
const BATTERY_KWH = 5;
const PREMIUM_KWP = 8;
const PREMIUM_BATTERY_KWH = 10;

const eur = (n: number) => String(Math.round(n));
const panelsOnly = installCostEur(PANELS_ONLY_KWP);
const withBattery = installCostEur(PANELS_ONLY_KWP, BATTERY_KWH);
const premium = installCostEur(PREMIUM_KWP, PREMIUM_BATTERY_KWH);
const grant = seaiGrant(PANELS_ONLY_KWP);
const SITE_NAME = "Solar Ireland";
const SITE_DESCRIPTION =
  "SEAI-registered solar panel installers serving all 32 counties across Ireland. Get a free AI-powered electricity bill analysis and honest quote. We install quality solar PV systems to help you reduce your electricity bills by up to €1,400/year with a €1,800 SEAI grant (Republic of Ireland only).";

const webPageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": SITE_URL,
      name: "Solar Ireland | SEAI Registered Solar Panel Installers",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      inLanguage: "en-IE",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@id": `${SITE_URL}/#business`,
      },
      datePublished: "2024-01-15T00:00:00+00:00",
      dateModified: new Date().toISOString(),
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/hero-solar.jpg`,
        width: 1344,
        height: 768,
      },
      potentialAction: {
        "@type": "ReadAction",
        target: SITE_URL,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Solar Panel Installation",
          item: SITE_URL,
        },
      ],
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/#service`,
  name: "Residential Solar Panel Installation",
  description:
    "Complete solar PV system installation for Irish homes. Includes free AI-powered electricity bill analysis, free home survey, SEAI grant application, professional installation by RECI-certified electricians, and post-install BER assessment. Save up to €1,400/year with a €1,800 SEAI grant.",
  url: SITE_URL,
  provider: {
    "@id": `${SITE_URL}/#business`,
  },
  areaServed: {
    "@type": "Country",
    name: "Ireland",
  },
  serviceType: "Solar Panel Installation",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: eur(panelsOnly),
    highPrice: eur(premium),
    priceCurrency: "EUR",
    offerCount: "2",
    availability: "https://schema.org/InStock",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Solar Installation Packages",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: `Standard Solar PV (${PANELS_ONLY_KWP} kWp)`,
          description: `${PANELS_ONLY_KWP} kWp solar panel system for a typical 3-4 bedroom home`,
        },
        price: eur(panelsOnly),
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: eur(panelsOnly - grant),
          priceCurrency: "EUR",
          name: `Price after €${grant.toLocaleString()} SEAI Grant`,
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Solar PV + Battery Storage",
          description: `Solar panels with ${BATTERY_KWH}kWh battery storage for maximum self-consumption`,
        },
        price: eur(withBattery),
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: eur(withBattery - grant),
          priceCurrency: "EUR",
          name: `Price after €${grant.toLocaleString()} SEAI Grant`,
        },
      },
    ],
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Get Solar Panels Installed in Ireland",
  description:
    "A simple 3-step process to get solar panels installed on your Irish home with Solar Ireland, from free AI bill analysis to full installation.",
  totalTime: "P14D",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "EUR",
    value: eur(panelsOnly - grant),
  },
  tool: [
    {
      "@type": "HowToTool",
      name: "AI Bill Analyser",
    },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "Upload Your Electricity Bill",
      text: "Upload a recent electricity bill to our AI-powered Bill Analyser. It reads your actual usage and calculates exactly how much you could save with solar panels - personalised to your home.",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "Get Your Free Home Survey",
      text: "Our RECI-certified team visits your home to assess your roof, orientation, shading, and electrical setup. We give you an honest, itemised quote with no hidden costs - and we handle the full SEAI grant application for you.",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "Installation Day",
      text: "Installation is completed in a single day. Scaffolding goes up in the morning, panels are mounted and wired by our certified team, and the system is fully commissioned before we leave. We prepare and submit your €1,800 SEAI grant application (Republic of Ireland). SEAI pays it into the account nominated on the Request for Payment form once your post-works BER is published.",
      position: 3,
    },
  ],
};

const financialProductSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  name: "SEAI Solar PV Grant",
  description:
    "The Sustainable Energy Authority of Ireland (SEAI) offers a €1,800 grant towards the cost of installing solar panels on residential properties in the Republic of Ireland (26 counties). The grant is available to owner-occupiers of homes built before 2021.",
  url: "https://www.seai.ie/grants/home-energy-grants/solar-pv/",
  provider: {
    "@type": "Organization",
    name: "Sustainable Energy Authority of Ireland (SEAI)",
    url: "https://www.seai.ie",
  },
  offers: {
    "@type": "Offer",
    price: "1800",
    priceCurrency: "EUR",
    priceSpecification: {
      "@type": "PriceSpecification",
      price: "1800",
      priceCurrency: "EUR",
      name: "SEAI Solar PV Grant Amount",
    },
  },
  feesAndCommissionsSpecification: {
    "@type": "FeesAndCommissionsSpecification",
    name: "Grant Conditions",
    description:
      "Available to owner-occupiers of homes built and occupied before 2021 with an MPRN. A BER assessment is carried out after the work is finished, before the grant is paid. Grant paid directly to the installer after completion.",
  },
};

export default function HomeSchema() {
  return (
    <>
      <script
        type="application/ld+json"
        id="schema-webpage"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        id="schema-service"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        id="schema-howto"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        id="schema-financial"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductSchema) }}
      />
    </>
  );
}
