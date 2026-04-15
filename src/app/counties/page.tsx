import type { Metadata } from 'next';
import CountiesClient from './CountiesClient';

export const metadata: Metadata = {
  title: 'Solar Panel Installation by County | All 32 Counties of Ireland',
  description: 'Solar panel installation available in all 32 counties across Ireland. Find local installers, county-specific pricing, and generation data for your area.',
  alternates: {
    canonical: 'https://solarireland.org/counties',
  },
  openGraph: {
    title: 'Solar Panels by County | All 32 Counties of Ireland',
    description: 'Solar panel installation available in all 32 counties. Find county-specific pricing, generation data, and local installers.',
    url: 'https://solarireland.org/counties',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Panels by County | All 32 Counties',
    description: 'Solar panel installation available across all 32 counties of Ireland.',
  },
};

export default function CountiesPage() {
  return <CountiesClient />;
}
