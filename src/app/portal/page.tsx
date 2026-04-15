import type { Metadata } from 'next';
import PortalLandingClient from './PortalLandingClient';

export const metadata: Metadata = {
  title: 'Customer Portal | Track Your Solar Installation | Solar Ireland',
  description:
    'Track every step of your solar panel installation in real time. View your progress, download documents, and stay updated on your SEAI grant application.',
  alternates: {
    canonical: 'https://solarireland.org/portal',
  },
  openGraph: {
    title: 'Customer Portal | Solar Ireland',
    description:
      'Track your solar installation progress in real time. View milestones, documents, and SEAI grant status.',
    url: 'https://solarireland.org/portal',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
};

export default function PortalPage() {
  return <PortalLandingClient />;
}
