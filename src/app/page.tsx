import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import HomeClient from './HomeClient';
import HomeSchema from '@/components/HomeSchema';
import PopularGuides from '@/components/solar/PopularGuides';

// Home's own title and description. The layout `default` stays as the fallback
// for any route without a title, so it is not edited. The head term leads, the
// Bill Analyser (the hero) comes second; the description sells the free
// estimate and then the call, matching the site's funnel. The brand leads (Cal,
// 10 Nov 2026: Google's site name). Absolute, because
// the "%s | Solar Ireland Group" template would duplicate the brand.
const HOME_TITLE = 'Solar Ireland Group | Know Your Solar Savings in 60 Seconds';
const HOME_DESCRIPTION =
  'Upload your electricity bill and see what solar saves your home, the SEAI grant you qualify for and your payback, sent straight to your inbox.';

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  // No `alternates` here on purpose: the layout's canonical + hreflang apply.
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://solarirelandgroup.ie',
    siteName: 'Solar Ireland Group',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [
      {
        url: '/installs/solar-ireland-group-family-home-roof.jpg',
        width: 1152,
        height: 864,
        alt: 'Solar Ireland Group - Professional solar panel installation on an Irish home',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ['/installs/solar-ireland-group-family-home-roof.jpg'],
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function Home() {
  noStore();
  return (
    <>
      <HomeSchema />
      <HomeClient guides={<PopularGuides />} />
    </>
  );
}
