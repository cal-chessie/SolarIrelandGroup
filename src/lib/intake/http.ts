import { NextResponse } from 'next/server';
import { intakeMode, UNAVAILABLE } from './mode';

/**
 * Shared plumbing for the /api/intake/* routes.
 *
 * Its own rate limiter, separate from the one /api/lead and /api/contact
 * share: one intake visit makes a handful of reads (config, times, quotes,
 * the Eircode lookup), and spending the lead form's 12 a minute on those
 * would lock real enquiries out.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120;
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : request.headers.get('x-real-ip') || 'local').trim();
}

export function intakeRateLimited(request: Request, max = MAX_PER_WINDOW): boolean {
  // One bucket per route per visitor, so a burst of reads never locks out
  // the submit, and the submit's tighter limit is its own.
  let route = 'intake';
  try {
    route = new URL(request.url).pathname;
  } catch {
    /* keep the shared bucket */
  }
  const key = `${route}|${clientIp(request)}`;
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { 'cache-control': 'no-store', ...headers } });
}

/** Fail closed: 503 unless the stub is explicitly on; 429 when over the limit. */
export function gate(request: Request, max?: number): Response | null {
  if (intakeMode() === 'off') return json(UNAVAILABLE, 503);
  if (intakeRateLimited(request, max)) return json({ ok: false, error: 'rate_limited' }, 429);
  return null;
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    const text = await request.text();
    if (text.length > 20_000) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}
