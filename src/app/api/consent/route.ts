import { NextResponse } from 'next/server';

/**
 * POST /api/consent
 *
 * Persists cookie consent records to Supabase for GDPR audit trail.
 * Falls back silently if Supabase is not configured.
 */

export const runtime = 'nodejs';

// Only these cookie categories are accepted; anything else is rejected.
const ALLOWED_CONSENT_KEYS = new Set(['necessary', 'analytics', 'marketing', 'preferences', 'functional']);
const MAX_SOURCE_PAGE_CHARS = 512;
const MAX_USER_AGENT_CHARS = 1024;

// Lightweight in-memory per-IP throttle. Best-effort only: per serverless
// instance, not coordinated across instances. A real distributed rate limiter
// still needs shared infra (Redis/KV).
const RATE_LIMIT_MAX = 20; // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per 60s
const rateLimitHits = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateLimitHits.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  rateLimitHits.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(getClientIp(request))) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { consent_state, source_page, user_agent } = body;

    // Validate required fields
    if (!consent_state || typeof consent_state !== 'object' || Array.isArray(consent_state)) {
      return NextResponse.json(
        { error: 'consent_state is required' },
        { status: 400 }
      );
    }

    // Bound the shape: a small object of known boolean category flags only.
    const keys = Object.keys(consent_state);
    if (keys.length === 0 || keys.length > ALLOWED_CONSENT_KEYS.size) {
      return NextResponse.json(
        { error: 'Invalid consent_state' },
        { status: 400 }
      );
    }
    for (const key of keys) {
      if (!ALLOWED_CONSENT_KEYS.has(key) || typeof consent_state[key] !== 'boolean') {
        return NextResponse.json(
          { error: 'Invalid consent_state' },
          { status: 400 }
        );
      }
    }

    // Bound the free-text metadata fields.
    if (source_page !== undefined && (typeof source_page !== 'string' || source_page.length > MAX_SOURCE_PAGE_CHARS)) {
      return NextResponse.json({ error: 'Invalid source_page' }, { status: 400 });
    }
    if (user_agent !== undefined && (typeof user_agent !== 'string' || user_agent.length > MAX_USER_AGENT_CHARS)) {
      return NextResponse.json({ error: 'Invalid user_agent' }, { status: 400 });
    }

    // Try to persist to Supabase (graceful fallback if not configured)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Generate a session ID from the request
      const sessionId =
        request.headers.get('x-session-id') ||
        request.headers.get('x-forwarded-for') ||
        crypto.randomUUID();

      await supabase.from('cookie_consent_records').insert({
        session_id: sessionId,
        consent_state: consent_state,
        source_page: source_page || '/',
        user_agent: user_agent || null,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[consent] Failed to persist consent:', error);
    return NextResponse.json(
      { error: 'Failed to persist consent' },
      { status: 500 }
    );
  }
}
