import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import PostHogProvider from "@/components/PostHogProvider";
import LeadSourceTracker from "@/components/LeadSourceTracker";

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


const SITE_URL = "https://solarirelandgroup.ie";
const SITE_NAME = "Solar Ireland";
// Home/default meta description, kept <=155 chars for full SERP display while
// retaining the key entities (Solar Ireland, SEAI, solar panel installers).
const SITE_DESCRIPTION =
  "SEAI-registered solar panel installers across all 32 counties of Ireland. Free AI bill analysis and honest quotes. Cut your electricity bill with solar.";
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
    default: "Solar Ireland | SEAI Solar Panel Installers | 32 Counties",
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
      // Republic-of-Ireland English only, plus x-default as the generic
      // fallback. The old redundant self-aliases (en-GB, generic en) all
      // pointed at the same ROI URL and were dropped.
      "en-IE": SITE_URL,
      "x-default": SITE_URL,
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
      // Browser tab keeps the bee: browsers pick the 16/32px icons for tabs.
      { url: "/bumblebee-16.png", sizes: "16x16", type: "image/png" },
      { url: "/bumblebee-favicon.png", sizes: "32x32", type: "image/png" },
      // Google Search prefers a >=48px square icon, so it picks the Solar
      // Ireland logo (the gold ring on a dark square) for the result listing.
      { url: "/logo-icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/logo-icon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/logo-icon-180.png", sizes: "180x180", type: "image/png" },
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
    title: "Solar Ireland | #1 Rated Solar Panel Installers | Save €1,400/Year",
    description:
      "SEAI-registered solar panel installers. Free AI-powered electricity bill analysis. Save up to €1,400/year with a €1,800 SEAI grant. Serving all 32 counties across Ireland.",
    images: [
      {
        url: "/hero-solar.jpg",
        width: 1344,
        height: 768,
        alt: "Solar Ireland - Professional solar panel installation on an Irish home",
        type: "image/jpeg",
      },
      {
        url: "/fb-cover.png",
        width: 1640,
        height: 924,
        alt: "Solar Ireland - SEAI Registered Solar Panel Installers",
        type: "image/png",
      },
    ],
  },


  twitter: {
    card: "summary_large_image",
    title: "Solar Ireland | Save €1,400/Year with Solar Panels",
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
    "msapplication-TileImage": "/logo-icon-96.png",
  },
};



const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "Solar Ireland Group",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo-lg.png`,
    width: 200,
    height: 226,
    caption: "Solar Ireland Logo",
  },
  description:
    "SEAI-registered solar panel installation company serving homes and businesses across all 32 counties of Ireland.",
  email: "sales@solarirelandgroup.ie",
  telephone: "+353 87 395 8424",
  sameAs: [
    "https://www.facebook.com/solarireland",
    "https://www.instagram.com/solarireland",
    "https://www.tiktok.com/@solarireland",
    "https://www.linkedin.com/company/solarireland",
  ],
  foundingDate: "2019",
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
  email: "sales@solarirelandgroup.ie",
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


// Site-wide WebSite entity. The home-only entities (WebPage, BreadcrumbList,
// Service, HowTo, FinancialProduct) live in <HomeSchema/> and render only on
// "/", so they no longer falsely claim every URL is the home page.
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: "Solar Ireland Group",
  url: SITE_URL,
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
  inLanguage: "en-IE",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading a request header opts the whole tree into dynamic rendering, so
  // Next.js stamps the per-request CSP nonce (set in middleware) onto every
  // script it emits - inline RSC bootstrap, framework chunks, and next/script.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
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
          id="schema-website"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip to main content - visible on keyboard focus only */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-lg focus:bg-amber-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-black focus:shadow-lg"
        >
          Skip to main content
        </a>
        <div id="main-content" tabIndex={-1} className="outline-none focus:outline-none">
          {children}
        </div>
        <CookieConsent />
        <PostHogProvider />
        <LeadSourceTracker />

        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              nonce={nonce}
              strategy="afterInteractive"
            />
            <Script id="ga-init" nonce={nonce} strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                // Check consent before configuring GA4
                try {
                  var consent = JSON.parse(localStorage.getItem('solar-ireland-cookie-consent') || '{}');
                  if (consent.categories && consent.categories.analytics) {
                    gtag('consent', 'update', { analytics_storage: 'granted' });
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                      page_path: window.location.pathname,
                      cookie_flags: 'SameSite=None;Secure',
                    });
                  } else {
                    gtag('consent', 'default', { analytics_storage: 'denied' });
                  }
                } catch (e) {
                  gtag('consent', 'default', { analytics_storage: 'denied' });
                }

                // Listen for consent changes
                window.addEventListener('cookie-consent-update', function(e) {
                  var state = e.detail;
                  if (state && state.categories && state.categories.analytics) {
                    gtag('consent', 'update', { analytics_storage: 'granted' });
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                      page_path: window.location.pathname,
                      cookie_flags: 'SameSite=None;Secure',
                    });
                  } else {
                    gtag('consent', 'update', { analytics_storage: 'denied' });
                  }
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
