/**
 * Which backend the intake routes talk to.
 *
 *   'stub' : fixtures computed on this server. Never forwards anything to
 *            AISolar, Postmark, /api/lead or any database.
 *   'off'  : every intake route answers 503 and the UI shows its honest
 *            "can't reach the booking system" states.
 *
 * Fail closed. The stub runs only when BOTH are true:
 *   1. INTAKE_CONTRACT_MODE is exactly "stub", and
 *   2. this is not a production deployment: VERCEL_ENV is not "production",
 *      and a production Node build only runs it on a Vercel preview.
 * So a stray env flag on the live site can never turn fake bookings on, and a
 * missing flag can never turn them on either.
 *
 * Slices 1 and 2 add 'live' (AISolar's intake-config, intake-quote,
 * survey-availability and ingest-lead v2) behind these same routes.
 */
export type IntakeMode = 'stub' | 'off';

export function intakeMode(): IntakeMode {
  if (process.env.INTAKE_CONTRACT_MODE !== 'stub') return 'off';
  if (process.env.VERCEL_ENV === 'production') return 'off';
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview') return 'off';
  return 'stub';
}

export const UNAVAILABLE = { ok: false as const, error: 'intake_unavailable' as const };
