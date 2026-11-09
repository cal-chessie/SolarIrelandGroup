/**
 * When the intake should be live and is not (H1, 9 Nov review): every intake
 * route answers 503 and the homeowner sees "can't reach the booking system".
 * That must never be silent.
 *
 *   - console.error once per cold start, naming which variable is wrong
 *     (never its value);
 *   - the owner alert through the outbox's own Postmark path, at most once an
 *     hour per server instance.
 *
 * Server only.
 */
import { after } from 'next/server';
import { intakeMisconfig } from './mode';
import { postmarkAlerter, type Alerter } from './live/outbox';

export const ALERT_EVERY_MS = 60 * 60_000;

let logged = false;
let lastAlertAt = 0;

/** Tests only: forget this instance's log and alert stamps. */
export function resetMisconfigReport(): void {
  logged = false;
  lastAlertAt = 0;
}

export interface MisconfigDeps {
  alert: Alerter | null;
  now: number;
  /** Runs the alert after the response (next/server after), or awaits it in tests. */
  defer: (p: Promise<unknown>) => void;
}

function defaultDefer(p: Promise<unknown>) {
  try {
    after(p);
  } catch {
    void p; // outside a request (a script): let it run
  }
}

/** Returns the problems it found (empty when the mode is what was asked for). */
export function reportMisconfig(deps: Partial<MisconfigDeps> = {}): string[] {
  const problems = intakeMisconfig();
  if (!problems.length) return problems;
  if (!logged) {
    logged = true;
    console.error(`[intake] misconfigured, every intake route answers 503: ${problems.join('; ')}.`);
  }
  const now = deps.now ?? Date.now();
  if (lastAlertAt && now - lastAlertAt < ALERT_EVERY_MS) return problems;
  const alert = deps.alert !== undefined ? deps.alert : postmarkAlerter();
  if (!alert) return problems;
  lastAlertAt = now;
  const text = [
    'The website intake is switched off because its settings are wrong, so homeowners cannot send their details from the site right now.',
    '',
    ...problems.map((p) => `- ${p}`),
    '',
    'Fix the variable in Vercel (Project, Settings, Environment Variables) and redeploy.',
    'Until then every road on the site shows its "ring us" fallback. This alert repeats at most once an hour.',
  ].join('\n');
  (deps.defer ?? defaultDefer)(alert.send('Website intake is OFF: a setting is wrong', text));
  return problems;
}
