/**
 * leadBridge — server-only forwarding core shared by every lead route.
 *
 * One implementation of "get this lead into AISolar, never lose it":
 *   1. POST to AISolar ingest-lead with the server-only x-source-key.
 *   2. Fallback to SIG's own `website_leads` table if AISolar is unreachable.
 *
 * /api/lead and /api/contact both import this so the two doors can never
 * drift apart. Import only from server code — the source key must never
 * reach the browser.
 */

export interface BridgeLead {
  brand: 'solar-ireland';
  source: string;
  name: string;
  email?: string;
  phone?: string;
  county?: string;
  address?: string;
  eircode?: string;
  monthlyBill?: number;
  annualKwh?: number;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface BridgeResult {
  ok: boolean;
  leadId?: string | null;
  fallback?: boolean;
}

// ─── Shared abuse guards (honeypot + best-effort per-IP throttle) ───
// Both lead doors (/api/lead, /api/contact) use these so neither can drift
// into an unthrottled spam channel that pumps junk into AISolar.
const RATE_LIMIT_MAX = 12;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitHits = new Map<string, number[]>();

export function isRateLimited(request: Request): boolean {
  const fwd = request.headers.get('x-forwarded-for');
  const ip = fwd ? fwd.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  const hits = (rateLimitHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  rateLimitHits.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

/** Hidden fields bots fill in. Accept-and-drop when tripped. */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const filled = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
  return filled(body.company) || filled(body.website_url);
}

export async function forwardLead(lead: BridgeLead): Promise<BridgeResult> {
  // ─── Primary: AISolar ingest-lead ───
  const ingestUrl = process.env.AISOLAR_INGEST_URL;
  const sourceKey = process.env.AISOLAR_SOURCE_KEY;

  if (ingestUrl && sourceKey) {
    try {
      const res = await fetch(ingestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-source-key': sourceKey },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return { ok: true, leadId: data.leadId ?? null };
      }
      console.error('[leadBridge] ingest-lead responded', res.status);
    } catch (err) {
      console.error('[leadBridge] ingest-lead unreachable:', err);
    }
  }

  // ─── Fallback: persist to SIG so nothing is ever dropped ───
  const persisted = await persistFallback(lead);
  if (persisted) return { ok: true, fallback: true };

  return { ok: false };
}

async function persistFallback(lead: BridgeLead): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return false;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, serviceKey);
    const { error } = await supabase.from('website_leads').insert({
      source: lead.source,
      name: lead.name,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      county: lead.county ?? null,
      address: lead.address ?? null,
      monthly_bill: lead.monthlyBill ?? null,
      annual_kwh: lead.annualKwh ?? null,
      message: lead.message ?? null,
      meta: lead.meta ?? null,
      forwarded: false,
    });
    if (error) {
      console.error('[leadBridge] fallback insert failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[leadBridge] fallback persist error:', err);
    return false;
  }
}
