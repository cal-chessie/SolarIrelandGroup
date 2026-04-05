import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CookieConsent from "@/components/CookieConsent";
import ExitIntent from "@/components/solar/ExitIntent";

/* ═══════════════════════════════════════════════════════════════
   FONTS
   ═══════════════════════════════════════════════════════════════ */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const SITE_URL = "https://solarireland.com";
const SITE_NAME = "Solar Ireland";
const SITE_DESCRIPTION =
  "SEAI-registered solar panel installers serving homes across Ireland. Get a free AI-powered electricity bill analysis and honest quote. We install quality solar PV systems to help you reduce your electricity bills by up to €1,100/year with a €1,800 SEAI grant.";
const SITE_KEYWORDS = [
  "solar panels Ireland",
  "solar panel installation Ireland",
  "SEAI grant solar",
  "solar PV Ireland",
  "solar panel cost Ireland 2026",
  "solar panel grants Ireland",
  "renewable energy Ireland",
  "Solar Ireland",
  "solar panel installers near me",
  "best solar company Ireland",
  "solar electricity Ireland",
  "home solar panels Ireland",
  "solar battery storage Ireland",
  "clean export guarantee",
  "SEAI registered installer",
  "solar panel savings calculator",
  "AI bill analyser solar",
  "free solar survey Ireland",
  "solar panels Dublin",
  "solar panels Cork",
  "solar panels Galway",
  "solar panels Limerick",
  "residential solar Ireland",
  "how much do solar panels cost Ireland",
  "solar panel payback period Ireland",
];

/* ═══════════════════════════════════════════════════════════════
   VIEWPORT — Separate export for Next.js 14+ App Router
   ═══════════════════════════════════════════════════════════════ */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#FACC15" },
  ],
  colorScheme: "dark",
};

/* ═══════════════════════════════════════════════════════════════
   COMPREHENSIVE SEO METADATA — World-Class 2026 Edition
   ═══════════════════════════════════════════════════════════════ */
export const metadata: Metadata = {
  /* ─── Title Template (inherited by all pages) ─── */
  title: {
    default: "Solar Ireland | #1 Rated Solar Panel Installers | SEAI Registered | Free AI Bill Analysis",
    template: "%s | Solar Ireland",
  },

  /* ─── Description ─── */
  description: SITE_DESCRIPTION,

  /* ─── Keywords (still relevant for Bing/Yahoo) ─── */
  keywords: SITE_KEYWORDS,

  /* ─── Authors & Creator ─── */
  authors: [{ name: "Solar Ireland", url: SITE_URL }],
  creator: "Solar Ireland",
  publisher: "Solar Ireland",
  metadataBase: new URL(SITE_URL),

  /* ─── Alternates (hreflang) ─── */
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-IE": SITE_URL,
      "en-GB": SITE_URL,
      "en": SITE_URL,
    },
  },

  /* ─── Robots ─── */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
      "noimageindex": false,
    },
  },

  /* ─── Icons ─── */
  icons: {
    icon: [
      { url: "/logo-favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/bumblebee-favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo-favicon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/logo-favicon.png",
        color: "#FACC15",
      },
    ],
  },

  /* ─── Manifest ─── */
  manifest: "/manifest.json",

  /* ─── Open Graph (Facebook, LinkedIn, etc.) ─── */
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Solar Ireland | #1 Rated Solar Panel Installers | Save €1,100/Year",
    description:
      "SEAI-registered solar panel installers. Free AI-powered electricity bill analysis. Save up to €1,100/year with a €1,800 SEAI grant. Serving all 32 counties across Ireland.",
    images: [
      {
        url: "/hero-solar.jpg",
        width: 1920,
        height: 1080,
        alt: "Solar Ireland - Professional solar panel installation on an Irish home",
        type: "image/jpeg",
      },
      {
        url: "/fb-cover.png",
        width: 1640,
        height: 624,
        alt: "Solar Ireland - SEAI Registered Solar Panel Installers",
        type: "image/png",
      },
    ],
  },

  /* ─── Twitter Card ─── */
  twitter: {
    card: "summary_large_image",
    title: "Solar Ireland | Save €1,100/Year with Solar Panels",
    description:
      "Free AI-powered electricity bill analysis. SEAI-registered installers. €1,800 grant available. Serving all of Ireland.",
    images: ["/hero-solar.jpg"],
    creator: "@solarireland",
  },

  /* ─── Facebook ─── */
  facebook: {
    appId: undefined,
  },

  /* ─── Verification ─── (add real keys when available) ─── */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    // yandex: "",
    // bing: "",
  },

  /* ─── Other Meta ─── */
  category: "Home Improvement",
  classification: "Solar Energy - Residential Installation",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Solar Ireland",
    "application-name": "Solar Ireland",
    "msapplication-TileColor": "#FACC15",
    "msapplication-TileImage": "/logo-favicon.png",
  },
};

/* ═══════════════════════════════════════════════════════════════
   JSON-LD STRUCTURED DATA — Full Suite for Google Rich Results
   ═══════════════════════════════════════════════════════════════ */

/* ─── 1. Organization / Brand ─── */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo-lg.png`,
    width: 512,
    height: 512,
    caption: "Solar Ireland Logo",
  },
  description:
    "SEAI-registered solar panel installation company serving homes and businesses across all 32 counties of Ireland.",
  email: "cal@solarireland.com",
  telephone: "+353 87 395 8424",
  sameAs: [
    "https://www.facebook.com/solarireland",
    "https://www.instagram.com/solarireland",
    "https://www.linkedin.com/company/solarireland",
  ],
  foundingDate: "2023",
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    minValue: 5,
    maxValue: 20,
  },
  areaServed: {
    "@type": "Country",
    name: "Ireland",
  },
  knowsAbout: [
    "Solar Panel Installation",
    "Solar PV Systems",
    "SEAI Grants",
    "Battery Storage",
    "Clean Export Guarantee",
    "BER Assessment",
  ],
};

/* ─── 2. LocalBusiness — Primary entity ─── */
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: SITE_NAME,
  image: `${SITE_URL}/hero-solar.jpg`,
  url: SITE_URL,
  telephone: "+353 87 395 8424",
  email: "cal@solarireland.com",
  logo: `${SITE_URL}/logo-lg.png`,
  description:
    "SEAI-registered solar panel installation company serving homes across Ireland. Free AI-powered electricity bill analysis, honest quotes, and quality installations with a €1,800 SEAI grant available.",
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Cash, Credit Card, Bank Transfer",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "IE",
    addressLocality: "Dublin",
    addressRegion: "Leinster",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "53.3498",
    longitude: "-6.2603",
  },
  areaServed: [
    {
      "@type": "AdministrativeArea",
      name: "Leinster",
      containedInPlace: { "@type": "Country", name: "Ireland" },
    },
    {
      "@type": "AdministrativeArea",
      name: "Munster",
      containedInPlace: { "@type": "Country", name: "Ireland" },
    },
    {
      "@type": "AdministrativeArea",
      name: "Connacht",
      containedInPlace: { "@type": "Country", name: "Ireland" },
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Solar Panel Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Residential Solar PV Installation",
          description:
            "Complete solar panel installation for Irish homes, including survey, SEAI grant application, installation, and commissioning.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Solar Battery Storage Installation",
          description:
            "Lithium-ion battery storage systems to maximise self-consumption of solar energy.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Free AI-Powered Electricity Bill Analysis",
          description:
            "Upload your electricity bill and our AI will show you exactly what solar will save you.",
        },
      },
    ],
  },
};

/* ─── 3. WebPage + BreadcrumbList ─── */
const webPageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": SITE_URL,
      name: "Solar Ireland | #1 Rated Solar Panel Installers | SEAI Registered",
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
        width: 1920,
        height: 1080,
      },
      mainEntity: {
        "@id": `${SITE_URL}/#faq`,
      },
      potentialAction: {
        "@type": "ReadAction",
        target: SITE_URL,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "en-IE",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
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

/* ─── 4. FAQPage Schema (Google FAQ Rich Results) ─── */
const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "How much do solar panels cost in Ireland in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A typical residential solar PV system costs between €4,500 and €7,500 before the €1,800 SEAI grant. After the grant, you are looking at approximately €2,700 to €5,700 out of pocket. The exact cost depends on the system size, roof complexity, and whether you want battery storage. We provide itemised quotes so you can see exactly where your money goes — no hidden costs, no surprises.",
      },
    },
    {
      "@type": "Question",
      name: "How much could I save with solar panels?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A typical 3-bed semi-detached home with a 4 kWp system can save between €800 and €1,400 per year on electricity bills, depending on your usage patterns and whether you have a battery. Over 25 years, total savings typically range from €30,000 to €50,000. Use our AI Bill Analyser for a personalised savings calculation based on your actual electricity usage.",
      },
    },
    {
      "@type": "Question",
      name: "How long is the solar panel payback period?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most homeowners see a full payback within 5 to 7 years after the €1,800 SEAI grant. A 4 kWp system costing around €6,500 (after grant) with annual savings of €1,000 would pay for itself in roughly 6.5 years. After that, every kilowatt-hour generated is essentially free electricity for the remaining 18+ years of the panel warranty.",
      },
    },
    {
      "@type": "Question",
      name: "What is the SEAI grant and am I eligible?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The SEAI offers a Solar PV grant of €1,800 towards the cost of installing solar panels on your home. To be eligible, you must be the owner-occupier of a home built before 2021, and the property must have a BER rating of C3 or lower (or be a pre-1978 home with no BER). The grant is paid directly to your installer after completion. We verify your eligibility during the free survey and handle the entire application on your behalf.",
      },
    },
    {
      "@type": "Question",
      name: "How long does solar panel installation take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The physical installation is completed in a single day for a standard residential system. The scaffolding goes up first thing in the morning, our RECI-registered team mounts and wires the panels during the day, and the system is fully commissioned before we leave. We also handle the ESB Networks grid connection notification.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need planning permission for solar panels in Ireland?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In the vast majority of cases, no. Solar panels are considered permitted development in Ireland. The panels must not extend more than 50cm from the roof surface, and the total area must not exceed 12 square metres or 50% of the roof area, whichever is less. Exceptions apply for protected structures and certain designated areas. We check all planning requirements during the free survey.",
      },
    },
    {
      "@type": "Question",
      name: "What about cloudy days and winter in Ireland?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Solar panels still generate electricity on cloudy days — typically 10-25% of their rated output compared to a sunny day. While winter production is lower (roughly 30-40% of summer output), the system is sized to maximise annual generation. Any shortfall is automatically covered by the grid. Most homeowners find that their summer surplus offsets the winter deficit.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer battery storage in Ireland?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. A battery stores excess electricity generated during the day for use in the evening or overnight, increasing your self-consumption from around 40-50% to 80%+. A typical 5 kWh lithium-ion battery costs around €4,000-€5,000 installed. The payback on batteries is longer (8-12 years) compared to panels alone, but they are worth considering if you are out during the day or want to maximise energy independence.",
      },
    },
    {
      "@type": "Question",
      name: "What happens to electricity I don't use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Any excess electricity your panels generate that you don't use is automatically exported to the grid. Under the ESB Clean Export Guarantee scheme, your electricity supplier pays you €0.21/kWh for exported energy. For a typical 4 kWp system, this can add €200-€400 per year to your savings. The export payment appears as a credit on your electricity bill through your smart meter.",
      },
    },
    {
      "@type": "Question",
      name: "Will solar panels work on my roof?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Solar panels work on most Irish roof types — tiled, slate, and metal. South-facing roofs with a pitch of 30-40 degrees are optimal, but east/west-facing roofs still produce excellent results (typically 80-85% of a south-facing output). During the free survey, we assess your roof orientation, pitch, shading, and structural suitability to give you an honest recommendation.",
      },
    },
  ],
};

/* ─── 5. Service Schema ─── */
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/#service`,
  name: "Residential Solar Panel Installation",
  description:
    "Complete solar PV system installation for Irish homes. Includes free AI-powered electricity bill analysis, free home survey, SEAI grant application, professional installation by RECI-certified electricians, and post-install BER assessment. Save up to €1,100/year with a €1,800 SEAI grant.",
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
    lowPrice: "4500",
    highPrice: "7500",
    priceCurrency: "EUR",
    offerCount: "3",
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
          name: "Standard Solar PV (4 kWp)",
          description: "4 kWp solar panel system for a typical 3-4 bedroom home",
        },
        price: "6500",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: "4700",
          priceCurrency: "EUR",
          name: "Price after €1,800 SEAI Grant",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Solar PV + Battery Storage",
          description: "Solar panels with 5kWh battery storage for maximum self-consumption",
        },
        price: "11000",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: "9200",
          priceCurrency: "EUR",
          name: "Price after €1,800 SEAI Grant",
        },
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
};

/* ─── 6. HowTo Schema (for "How It Works" section) ─── */
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
    value: "6500",
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
      text: "Upload a recent electricity bill to our AI-powered Bill Analyser. It reads your actual usage and calculates exactly how much you could save with solar panels — personalised to your home.",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "Get Your Free Home Survey",
      text: "Our RECI-certified team visits your home to assess your roof, orientation, shading, and electrical setup. We give you an honest, itemised quote with no hidden costs — and we handle the full SEAI grant application for you.",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "Installation Day",
      text: "Installation is completed in a single day. Scaffolding goes up in the morning, panels are mounted and wired by our certified team, and the system is fully commissioned before we leave. The €1,800 SEAI grant is deducted from your final bill.",
      position: 3,
    },
  ],
};

/* ─── 7. FinancialProduct Schema (for Solar Investment) ─── */
const financialProductSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  name: "SEAI Solar PV Grant",
  description:
    "The Sustainable Energy Authority of Ireland (SEAI) offers a €1,800 grant towards the cost of installing solar panels on residential properties in Ireland. The grant is available to owner-occupiers of homes built before 2021.",
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
      "Available to owner-occupiers of homes built before 2021. Property must have a BER rating of C3 or lower, or be a pre-1978 home with no BER. Grant paid directly to installer after completion.",
  },
};

/* ═══════════════════════════════════════════════════════════════
   ROOT LAYOUT
   ═══════════════════════════════════════════════════════════════ */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IE" className="dark" suppressHydrationWarning dir="ltr">
      <head>
        {/* ─── DNS Prefetch for Performance ─── */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        {/* ─── Preconnect for Critical Third Parties ─── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ─── Preload Critical Assets ─── */}
        <link rel="preload" as="image" href="/hero-solar.jpg" type="image/jpeg" />
        <link rel="preload" as="image" href="/logo-sm.png" type="image/png" />
        <link rel="preload" as="font" href="/fonts/Geist-Regular.woff2" type="font/woff2" crossOrigin="anonymous" />

        {/* ─── Feed Autodiscovery ─── */}
        <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} RSS Feed`} href={`${SITE_URL}/feed.xml`} />

        {/* ═══════════════════════════════════════════════════════
            JSON-LD STRUCTURED DATA — Full Suite
            Google uses this for:
            - Rich results (FAQ, HowTo, LocalBusiness, Service)
            - Knowledge Panel (Organization)
            - Breadcrumb navigation
            - Search actions
            ═══════════════════════════════════════════════════════ */}

        {/* Organization + Brand */}
        <script
          type="application/ld+json"
          id="schema-organization"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* LocalBusiness — Primary entity for Google Maps + Local Search */}
        <script
          type="application/ld+json"
          id="schema-local-business"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />

        {/* WebPage + WebSite + BreadcrumbList */}
        <script
          type="application/ld+json"
          id="schema-webpage"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webPageSchema),
          }}
        />

        {/* FAQPage — Google FAQ Rich Results */}
        <script
          type="application/ld+json"
          id="schema-faq"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqPageSchema),
          }}
        />

        {/* Service — Google Service Rich Results */}
        <script
          type="application/ld+json"
          id="schema-service"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceSchema),
          }}
        />

        {/* HowTo — Google How-To Rich Results */}
        <script
          type="application/ld+json"
          id="schema-howto"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema),
          }}
        />

        {/* FinancialProduct — SEAI Grant */}
        <script
          type="application/ld+json"
          id="schema-financial"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(financialProductSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        <CookieConsent />
        <ExitIntent />
      </body>
    </html>
  );
}
