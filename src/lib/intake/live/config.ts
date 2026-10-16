/**
 * Live mode: AISolar's intake-config, cached for 60 seconds per server
 * instance (DECISIONS 1: the screen stays instant; AISolar marks it
 * private, max-age 60 too). A failed read is never cached.
 */
import type { IntakeConfig } from '@/lib/intake/contract';
import type { LiveEnv } from '@/lib/intake/mode';
import { adaptConfig, type Adapted } from './adapt';
import { callAISolar, visitorHeaders } from './client';

const TTL_MS = 60_000;
let cache: { at: number; base: string; body: IntakeConfig } | null = null;

export async function liveConfig(env: LiveEnv, request: Request): Promise<Adapted<IntakeConfig>> {
  if (cache && cache.base === env.base && Date.now() - cache.at < TTL_MS) return { status: 200, body: cache.body };
  const r = await callAISolar(env, 'intake-config', { method: 'GET', headers: visitorHeaders(env, request), timeoutMs: 6000 });
  const a = adaptConfig(r);
  if (a.status === 200) cache = { at: Date.now(), base: env.base, body: a.body as IntakeConfig };
  else if (a.note) console.error('[intake config]', a.note);
  return a;
}
