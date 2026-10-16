/**
 * Where the confirmation's "Open your project page" may post its single-use
 * code (backend-spec 4.4): the portal host's /h receiver. One list, read by the
 * submit route (a hand-off to any other origin is dropped) and by the CSP's
 * form-action in middleware, so the two can never disagree.
 *
 * INTAKE_PORTAL_ORIGIN adds one more https origin (a tenant subdomain later).
 * Edge-safe: no Node imports.
 */
const BASE_ORIGINS = ['https://aisolar.ie', 'https://www.aisolar.ie'];

export function portalOrigins(): string[] {
  const extra = (process.env.INTAKE_PORTAL_ORIGIN || '').trim().replace(/\/+$/, '');
  return /^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(extra) && !BASE_ORIGINS.includes(extra) ? [...BASE_ORIGINS, extra] : [...BASE_ORIGINS];
}
