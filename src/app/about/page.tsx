import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Solar Ireland | Our Story, Team & Certifications',
  description: 'Meet the Solar Ireland team. SEAI-registered solar installers serving all 32 counties. No hard sell, honest pricing, and 25-year warranties.',
  alternates: {
    canonical: 'https://solarireland.com/about',
  },
  openGraph: {
    title: 'About Solar Ireland | Our Story, Team & Certifications',
    description: 'SEAI-registered solar installers serving all 32 counties. No hard sell, honest pricing, and 25-year warranties.',
    url: 'https://solarireland.com/about',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Solar Ireland | Our Story & Team',
    description: 'SEAI-registered solar installers serving all 32 counties.',
  },
};

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://solarireland.com/about',
  name: 'About Solar Ireland',
  description: 'Meet the Solar Ireland team. SEAI-registered solar installers serving all 32 counties.',
  url: 'https://solarireland.com/about',
  inLanguage: 'en-IE',
  isPartOf: { '@id': 'https://solarireland.com/#website' },
  mainEntity: {
    '@type': 'Organization',
    '@id': 'https://solarireland.com/#organization',
    name: 'Solar Ireland',
    url: 'https://solarireland.com',
    foundingDate: '2023',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 5,
      maxValue: 20,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Ireland',
    },
    knowsAbout: [
      'Solar Panel Installation',
      'Solar PV Systems',
      'SEAI Grants',
      'Battery Storage',
      'Clean Export Guarantee',
      'BER Assessment',
    ],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://solarireland.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'About',
      item: 'https://solarireland.com/about',
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <AboutClient />
    </>
  );
}
