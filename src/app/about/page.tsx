import AboutClient from './AboutClient';

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://solarirelandgroup.ie/about',
  name: 'About Solar Ireland',
  description: 'Meet the Solar Ireland team. SEAI-registered solar installers serving all 32 counties.',
  url: 'https://solarirelandgroup.ie/about',
  inLanguage: 'en-IE',
  isPartOf: { '@id': 'https://solarirelandgroup.ie/#website' },
  mainEntity: {
    '@type': 'Organization',
    '@id': 'https://solarirelandgroup.ie/#organization',
    name: 'Solar Ireland',
    url: 'https://solarirelandgroup.ie',
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

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <AboutClient />
    </>
  );
}
