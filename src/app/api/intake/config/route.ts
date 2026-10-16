import { gate, json } from '@/lib/intake/http';
import { liveMode } from '@/lib/intake/mode';
import { liveConfig } from '@/lib/intake/live/config';
import { stubConfig } from '@/lib/intake/stub/quote';

/**
 * GET /api/intake/config
 *
 * The intake's copy values (backend-spec 2.4, intake-config): sizes, export
 * rate, horizon, supplier list, survey length and window, start times, the
 * name homeowners see. PII-free. Prices never come from here, only from
 * /api/intake/quote (the one exception, the no-bill fact strip, is marked in
 * the contract).
 *
 * Live: AISolar's intake-config through the intake's door, cached 60 seconds.
 * Stub: fixtures. Off: 503 (fail closed, see lib/intake/mode.ts).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const blocked = gate(request);
  if (blocked) return blocked;
  const env = liveMode();
  if (env) {
    const a = await liveConfig(env, request);
    return json(a.body, a.status);
  }
  return json(stubConfig());
}
