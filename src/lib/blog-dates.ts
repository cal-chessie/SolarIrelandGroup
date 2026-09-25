/**
 * Blog dates: display vs machine-readable.
 *
 * Posts carry a human date string ("12 Apr 2026") for the byline. Schema.org
 * datePublished/dateModified and Open Graph article:published_time REQUIRE
 * ISO 8601 ("2026-04-12"); the human string is invalid there and Google's Rich
 * Results test drops it. This converts one to the other for the machine fields
 * only, so the byline keeps reading the way a person expects.
 *
 * Fail-safe: an unparseable string is returned unchanged rather than turned
 * into a wrong date. Deterministic (no locale, no Date parsing), so the value
 * is identical on the server and in the browser and never mismatches hydration.
 */
const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

/** "12 Apr 2026" -> "2026-04-12". Returns the input unchanged if it does not match. */
export function toISODate(human: string): string {
  const m = human.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})$/);
  if (!m) return human;
  const mm = MONTHS[m[2].slice(0, 3)];
  if (!mm) return human;
  return `${m[3]}-${mm}-${m[1].padStart(2, '0')}`;
}
