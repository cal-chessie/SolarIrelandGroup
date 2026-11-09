import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import HomeClient from './HomeClient';
import HomeSchema from '@/components/HomeSchema';

// Home's own title and description. The layout `default` stays as the fallback
// for any route without a title, so it is not edited. The head term leads, the
// Bill Analyser (the hero) comes second; the description sells the free
// estimate and then the call, matching the site's funnel. Absolute, because
// the "%s | Solar Ireland" template would duplicate the brand.
const HOME_TITLE = 'Solar Panels Ireland | Free Bill Analysis | Solar Ireland';
const HOME_DESCRIPTION =
  'SEAI-registered solar installers in all 32 counties. Upload a bill for a free estimate of your savings, the €1,800 SEAI grant and payback, then a call.';

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  // No `alternates` here on purpose: the layout's canonical + hreflang apply.
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://solarirelandgroup.ie',
    siteName: 'Solar Ireland',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [
      {
        url: '/hero-solar.jpg',
        width: 1344,
        height: 768,
        alt: 'Solar Ireland - Professional solar panel installation on an Irish home',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ['/hero-solar.jpg'],
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
      <HomeClient />
    </>
  );
}
