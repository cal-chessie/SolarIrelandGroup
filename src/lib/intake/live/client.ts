/**
 * Live mode: the one place the site talks to AISolar's intake functions.
 *
 * Server to server only. The door key (INTAKE_SOURCE_KEY) rides in the
 * x-source-key header and never reaches a browser, a URL or a log. AISolar
 * only ever sees this server, so the visitor is passed as a keyed hash of
 * their IP (x-visitor-hash) for AISolar's per-visitor limits, never the IP.
 *
 * Every call has a deadline and never throws: the answer is a status (0 when
 * nothing came back) and the parsed body, and the adapters in ./adapt.ts turn
 * that into the site's own shapes and honest states.
 */
import { createHmac } from 'node:crypto';
import type { LiveEnv } from '@/lib/intake/mode';

export type IntakeFn = 'intake-config' | 'intake-quote' | 'survey-availability' | 'survey-hold' | 'ingest-lead';

export interface CallResult {
  /** HTTP status, or 0 when AISolar did not answer (network failure or deadline). */
  status: number;
  data: unknown;
  failure: null | 'timeout' | 'network';
}

export interface CallOpts {
  method: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

export async function callAISolar(env: LiveEnv, fn: IntakeFn, o: CallOpts): Promise<CallResult> {
  const fetcher = o.fetcher ?? fetch;
  try {
    const res = await fetcher(`${env.base}/${fn}`, {
      method: o.method,
      headers: {
        ...(o.body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(o.headers ?? {}),
        'x-source-key': env.sourceKey,
      },
      body: o.body !== undefined ? JSON.stringify(o.body) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(o.timeoutMs ?? 8000),
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, data, failure: null };
  } catch (err) {
    const timeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    return { status: 0, data: null, failure: timeout ? 'timeout' : 'network' };
  }
}

/** The visitor's IP as AISolar's per-visitor bucket key: an HMAC, never the address itself. */
export function visitorHash(env: LiveEnv, request: Request): string | null {
  const fwd = request.headers.get('x-forwarded-for');
  const ip = (fwd ? fwd.split(',')[0] : request.headers.get('x-real-ip') || '').trim();
  if (!ip) return null;
  return createHmac('sha256', `intake-visitor:${env.sourceKey}`).update(ip).digest('hex');
}

/** One browser's hold session (the si_hs cookie) as AISolar's x-session-hash. */
export function sessionHash(env: LiveEnv, sessionId: string): string {
  return createHmac('sha256', `intake-session:${env.sourceKey}`).update(sessionId).digest('hex');
}

/** Headers every browser-driven call carries. */
export function visitorHeaders(env: LiveEnv, request: Request): Record<string, string> {
  const v = visitorHash(env, request);
  return v ? { 'x-visitor-hash': v } : {};
}
