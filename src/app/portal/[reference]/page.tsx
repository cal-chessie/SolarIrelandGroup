import PortalNotice, { portalMetadata } from '../PortalNotice';

// Any /portal/<reference> shows the same honest page. It used to open a made-up
// customer for whatever was typed; see PortalNotice.
export const metadata = portalMetadata;

export default function PortalReferencePage() {
  return <PortalNotice />;
}
