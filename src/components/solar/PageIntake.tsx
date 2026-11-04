'use client';

import MobileStickyCTA from './MobileStickyCTA';

/**
 * The sticky bar on phones, mounted per page. It opens the one intake, so it
 * takes no label or link of its own (the old label and href props were
 * ignored and are gone, so nobody thinks they work).
 *
 * The old exit popup (ExitIntent) is retired to _TRASH (APPLE-DECISIONS,
 * "Doors"): it collected an email and offered /book-survey and
 * /solar-calculator, a second intake on eight pages.
 *
 * Deliberately NOT mounted globally from the layout: /contact (already an
 * intake card), the legal pages and the portal carry no sticky bar.
 */
export default function PageIntake({
  sticky,
}: {
  /** Pass null for pages that should not carry a sticky bar. */
  sticky?: { scrollTo?: string | null } | null;
}) {
  return sticky ? <MobileStickyCTA scrollTo={sticky.scrollTo ?? null} /> : null;
}
