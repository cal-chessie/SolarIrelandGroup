import PortalNotice, { portalMetadata } from './PortalNotice';

// No sample customer, no reference box: see PortalNotice.
export const metadata = portalMetadata;

export default function PortalPage() {
  return <PortalNotice />;
}
