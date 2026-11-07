'use client';

import dynamic from 'next/dynamic';
import MobileStickyCTA from './MobileStickyCTA';

const ExitIntent = dynamic(() => import('./ExitIntent'), { ssr: false });

/**
 * The two catch-them-before-they-go widgets, mounted per page with the next
 * step that actually suits that page.
 *
 * They used to live in HomeClient only, so eleven pages had no sticky CTA and
 * no exit capture at all: a visitor who landed on a county page or a blog
 * article from search could read the whole thing and leave without ever being
 * offered anything.
 *
 * Deliberately NOT mounted globally from the layout. Two kinds of page should
 * not have these:
 *
 *   - /book-survey and /contact, where the visitor is already mid-intake. An
 *     exit popup over a half-filled form is hostile, and a sticky bar competes
 *     with the thing it is trying to sell.
 *   - /privacy, /terms, /cookies and the portal, where someone is reading a
 *     legal document or checking their own installation. Selling there is rude
 *     and it is not what they came for.
 */
export default function PageIntake({
  sticky,
  exit = true,
}: {
  /** Pass null for pages that should not carry a sticky bar. */
  sticky?: { label: string; scrollTo?: string | null; href?: string } | null;
  exit?: boolean;
}) {
  return (
    <>
      {sticky ? (
        <MobileStickyCTA label={sticky.label} scrollTo={sticky.scrollTo ?? null} href={sticky.href} />
      ) : null}
      {exit ? <ExitIntent /> : null}
    </>
  );
}
