/**
 * The homeowner's magic-link token (?lt= on /book-survey).
 *
 * AISolar mints it in agent-drain as two UUIDs with the dashes taken out
 * (`booking_token`, and the older `access_token` the same way): 64 lowercase
 * hex characters. lead-context and ingest-lead accept either. This is the one
 * shape every door on the site accepts: the page, /api/survey-context,
 * /api/intake/submit and /api/lead. Anything else is not a link we minted,
 * and the page falls back to the cold form instead of failing every tap.
 *
 * Pure and dependency free, so the page and the server share it.
 */
export const LINK_TOKEN = /^[a-f0-9]{64}$/;

/** The canonical token (trimmed, lower case), or null when it is not one AISolar minted. */
export function parseLinkToken(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim().toLowerCase();
  return LINK_TOKEN.test(s) ? s : null;
}
