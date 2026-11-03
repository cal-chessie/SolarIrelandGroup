import { intakeHref, parseIntakeQuery } from './open';

/**
 * Where /book-survey sends a visitor (APPLE-DECISIONS, "Doors").
 *
 * Every visit is a 308 to the one intake, entered at the survey times, as a
 * home unless the link said business, with the page's own context kept.
 * The guard: a magic link (?lt=, a returning homeowner's lead token from an
 * old estimate email) returns null, so the page keeps rendering the booking
 * form that threads that token into /api/lead. Proven in
 * src/__tests__/book-survey-door.test.tsx.
 */
export function bookSurveyRedirect(sp: Record<string, string | string[] | undefined>): string | null {
  const lt = Array.isArray(sp.lt) ? sp.lt[0] : sp.lt;
  if (typeof lt === 'string' && lt.length > 0) return null;
  const q = parseIntakeQuery(sp);
  return intakeHref({
    door: 'book-survey',
    segment: q.segment ?? 'home',
    step: 'time',
    bill: q.bill,
    per: q.per,
    pkg: q.pkg,
    county: q.county,
    src: q.src,
  });
}
