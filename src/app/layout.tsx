import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import ExitIntent from "@/components/solar/ExitIntent";

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


const SITE_URL = "https://solarireland.com";
const SITE_NAME = "Solar Ireland";
const SITE_DESCRIPTION =
  "SEAI-registered solar panel installers serving all 32 counties across Ireland. Get a free AI-powered electricity bill analysis and honest quote. We install quality solar PV systems to help you reduce your electricity bills by up to €1,100/year with a €1,800 SEAI grant (Republic of Ireland only).";
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

export const metadata: Metadata = {

  title: {
    default: "Solar Ireland | #1 Rated Solar Panel Installers | SEAI Registered | Free AI Bill Analysis",
    template: "%s | Solar Ireland",
  },


  description: SITE_DESCRIPTION,


  keywords: SITE_KEYWORDS,


  authors: [{ name: "Solar Ireland", url: SITE_URL }],
  creator: "Solar Ireland",
  publisher: "Solar Ireland",
  metadataBase: new URL(SITE_URL),


  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-IE": SITE_URL,
      "en-GB": SITE_URL,
      "en": SITE_URL,
    },
  },


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


  manifest: "/manifest.webmanifest",


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


  twitter: {
    card: "summary_large_image",
    title: "Solar Ireland | Save €1,100/Year with Solar Panels",
    description:
      "Free AI-powered electricity bill analysis. SEAI-registered installers. €1,800 grant available. Serving all of Ireland.",
    images: ["/hero-solar.jpg"],
    creator: "@solarireland",
  },


  facebook: {
    appId: "",
  },


  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },


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
    "https://www.tiktok.com/@solarireland",
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
    {
      "@type": "AdministrativeArea",
      name: "Ulster",
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
      text: "Installation is completed in a single day. Scaffolding goes up in the morning, panels are mounted and wired by our certified team, and the system is fully commissioned before we leave. The €1,800 SEAI grant (Republic of Ireland) is deducted from your final bill.",
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
      "Available to owner-occupiers of homes built before 2021. Property must have a BER rating of C3 or lower, or be a pre-1978 home with no BER. Grant paid directly to installer after completion.",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IE" className="dark" suppressHydrationWarning dir="ltr">
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link rel="preload" as="image" href="/logo-sm.webp" type="image/webp" />



        <script
          type="application/ld+json"
          id="schema-organization"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />


        <script
          type="application/ld+json"
          id="schema-local-business"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />


        <script
          type="application/ld+json"
          id="schema-webpage"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webPageSchema),
          }}
        />


        <script
          type="application/ld+json"
          id="schema-service"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceSchema),
          }}
        />


        <script
          type="application/ld+json"
          id="schema-howto"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema),
          }}
        />


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
        {/* Skip to main content — visible on keyboard focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-amber-400 focus:text-black focus:text-sm focus:font-bold focus:shadow-lg focus:shadow-amber-400/20 focus:outline-2 focus:outline-offset-2 focus:outline-amber-400"
        >
          Skip to main content
        </a>
        <div id="main-content" role="main" tabIndex={-1} className="outline-none focus:outline-none">
          {children}
        </div>
        <CookieConsent />
        <ExitIntent />

        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                  cookie_flags: 'SameSite=None;Secure',
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
