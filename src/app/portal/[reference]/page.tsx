import type { Metadata } from 'next';
import PortalDashboardClient from './PortalDashboardClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Customer Portal',
};

export default function PortalDashboardPage() {
  return <PortalDashboardClient />;
}
