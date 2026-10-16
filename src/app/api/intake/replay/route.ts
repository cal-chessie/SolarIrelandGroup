import { timingSafeEqual } from 'node:crypto';
import { gate, json } from '@/lib/intake/http';
import { liveMode } from '@/lib/intake/mode';
import { portalOrigins } from '@/lib/intake/portal';
import { callAISolar } from '@/lib/intake/live/client';
import { outboxDeps, replayDue } from '@/lib/intake/live/outbox';

/**
 * GET|POST /api/intake/replay   (Authorization: Bearer <CRON_SECRET>)
 *
 * Sends the leads held in the site's outbox to AISolar again, each with its
 * own idempotency key, so a replay can never make a second lead
 * (backend-spec 4.7). Backoff 1, 2, 4, 8, 16, then every 30 minutes. A lead
 * AISolar refuses outright is parked and the owner told once; one still not
 * accepted after about five hours is flagged to the owner once more.
 *
 * Who calls it: any scheduler holding the secret (a Vercel cron sends the
 * Bearer header itself when CRON_SECRET is set; AISolar's pg_cron can call it
 * too). Every accepted live submit also sends due leads, at most every five
 * minutes per server, so the outbox drains the moment AISolar is back.
 *
 * Answers counts only, never a lead. Live mode only.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET || '';
  if (secret.length < 16) return false;
  const got = Buffer.from(request.headers.get('authorization') || '');
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

async function handle(request: Request) {
  const blocked = gate(request, 30);
  if (blocked) return blocked;
  const env = liveMode();
  if (!env) return json({ ok: false, error: 'intake_unavailable' }, 503);
  if (!authorised(request)) return json({ ok: false, error: 'not_found' }, 404);
  const deps = outboxDeps();
  if (!deps.store) return json({ ok: false, error: 'outbox_not_configured' }, 503);
  try {
    const report = await replayDue({
      ...deps,
      send: (payload, key) => callAISolar(env, 'ingest-lead', { method: 'POST', body: payload, headers: { 'x-intake-version': '2', 'x-idempotency-key': key }, timeoutMs: 15_000 }),
      portalOrigins: portalOrigins(),
    });
    return json({ ok: true, ...report });
  } catch (err) {
    console.error('[intake replay] failed:', err instanceof Error ? err.message : 'unknown');
    return json({ ok: false, error: 'server_error' }, 500);
  }
}

export const GET = handle;
export const POST = handle;
