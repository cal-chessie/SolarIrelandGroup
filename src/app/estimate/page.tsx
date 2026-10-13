import type { Metadata } from 'next';
import IntakePage from '@/components/intake/IntakePage';
import { parseIntakeQuery } from '@/lib/intake/open';

/**
 * /estimate: the one intake (Intake OS). Every door on the site opens it as a
 * layer over the page; this route is what a refresh, a shared link or a
 * no-layer fallback lands on. The URL never holds personal data.
 */
export const metadata: Metadata = {
  title: 'Your solar estimate and free site survey',
  description: 'See what solar would save you from your electricity bill, then book a free site survey with Solar Ireland.',
  alternates: { canonical: 'https://solarirelandgroup.ie/estimate' },
  robots: { index: false, follow: true },
};

export default async function EstimatePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = parseIntakeQuery(await searchParams);
  return <IntakePage initial={q} />;
}
