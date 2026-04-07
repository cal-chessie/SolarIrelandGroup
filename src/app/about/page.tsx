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

export default function AboutPage() {
  return <AboutClient />;
}
