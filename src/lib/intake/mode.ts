/**
 * Which backend the intake routes talk to.
 *
 *   'live' : AISolar's intake-config, intake-quote, survey-availability,
 *            survey-hold and ingest-lead v2, server to server with the
 *            intake's own door key (see ./live/*). Same routes, same shapes,
 *            so the screens never change.
 *   'stub' : fixtures computed on this server. Never forwards anything to
 *            AISolar, Postmark, /api/lead or any database.
 *   'off'  : every intake route answers 503 and the UI shows its honest
 *            "can't reach the booking system" states.
 *
 * Fail closed.
 *
 * Live runs only when ALL are true:
 *   1. INTAKE_CONTRACT_MODE is exactly "live", and
 *   2. INTAKE_AISOLAR_URL is an https Supabase functions base
 *      (https://<ref>.supabase.co/functions/v1), and
 *   3. INTAKE_SOURCE_KEY looks like a door key.
 * The intake never falls back to AISOLAR_SOURCE_KEY: Vercel's Preview scope
 * holds the real website door, and a preview must only ever use the test door.
 *
 * The stub runs only when BOTH are true:
 *   1. INTAKE_CONTRACT_MODE is exactly "stub", and
 *   2. this is not a production deployment: VERCEL_ENV is not "production",
 *      and a production Node build only runs it on a Vercel preview.
 * So a stray env flag on the live site can never turn fake bookings on, and a
 * missing flag can never turn them on either.
 *
 * Server only: nothing here may be imported by a client component.
 */
export type IntakeMode = 'stub' | 'live' | 'off';

export interface LiveEnv {
  /** "https://<ref>.supabase.co/functions/v1", no trailing slash. */
  base: string;
  sourceKey: string;
}

const BASE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/?$/;
const KEY = /^[A-Za-z0-9_-]{16,200}$/;

/** The live door, or null when anything is missing or malformed. */
export function liveEnv(): LiveEnv | null {
  const base = (process.env.INTAKE_AISOLAR_URL || '').trim();
  const sourceKey = (process.env.INTAKE_SOURCE_KEY || '').trim();
  if (!BASE.test(base) || !KEY.test(sourceKey)) return null;
  return { base: base.replace(/\/+$/, ''), sourceKey };
}

export function intakeMode(): IntakeMode {
  const flag = process.env.INTAKE_CONTRACT_MODE;
  if (flag === 'live') return liveEnv() ? 'live' : 'off';
  if (flag !== 'stub') return 'off';
  if (process.env.VERCEL_ENV === 'production') return 'off';
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview') return 'off';
  return 'stub';
}

/** The live door when, and only when, the intake is in live mode. */
export function liveMode(): LiveEnv | null {
  return intakeMode() === 'live' ? liveEnv() : null;
}

export const UNAVAILABLE = { ok: false as const, error: 'intake_unavailable' as const };
