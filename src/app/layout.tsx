import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CookieConsent from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solar Ireland | Solar Panel Installation | SEAI Registered Installer",
  description:
    "SEAI-registered solar panel installers serving homes across Ireland. Get a free survey and honest quote. We install quality solar PV systems to help you reduce your electricity bills.",
  keywords: [
    "solar panels Ireland",
    "solar PV installation",
    "SEAI grant solar",
    "solar panel cost Ireland",
    "renewable energy Ireland",
    "Solar Ireland",
  ],
  authors: [{ name: "Solar Ireland" }],
  icons: {
    icon: "/logo-favicon.png",
  },
  openGraph: {
    title: "Solar Ireland | Solar Panel Installation",
    description:
      "SEAI-registered solar panel installers. Free surveys, honest quotes, quality installations across Ireland.",
    url: "https://solarireland.com",
    siteName: "Solar Ireland",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Ireland | Solar Panel Installation",
    description:
      "SEAI-registered solar panel installers. Free surveys, honest quotes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/hero-solar.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Solar Ireland",
              description:
                "SEAI-registered solar panel installation company serving homes across Ireland.",
              url: "https://solarireland.com",
              email: "cal@solarireland.com",
              areaServed: [
                { "@type": "AdministrativeArea", name: "Connacht" },
                { "@type": "AdministrativeArea", name: "Leinster" },
                { "@type": "AdministrativeArea", name: "Munster" },
              ],
              serviceType: "Solar Panel Installation",
              priceRange: "$$",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
