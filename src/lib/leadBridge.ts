import { postmarkAlerter, type Alerter } from '@/lib/intake/live/outbox';
/**
 * leadBridge - server-only forwarding core shared by every lead route.
 *
 * One implementation of "get this lead into AISolar, never lose it":
 *   1. POST to AISolar ingest-lead with the server-only x-source-key, up to
 *      three tries so a momentary outage does not drop the lead.
 *   2. Fallback to SIG's own `website_leads` table if AISolar is unreachable.
 *
 * /api/lead and /api/contact both import this so the two doors can never
 * drift apart. Import only from server code - the source key must never
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
  /** The homeowner's own magic-link token, forwarded to ingest-lead so a return
   *  booking threads onto the existing lead instead of creating a duplicate. */
  leadToken?: string;
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

// Three tries, 8s each, 1s then 2s apart: at most about 27s, inside the
// routes' maxDuration of 30s.
const INGEST_ATTEMPTS = 3;
const INGEST_TIMEOUT_MS = 8_000;
const INGEST_BACKOFF_MS = 1_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function forwardLeadInner(lead: BridgeLead): Promise<BridgeResult> {
  // ─── Primary: AISolar ingest-lead ───
  const ingestUrl = process.env.AISOLAR_INGEST_URL;
  const sourceKey = process.env.AISOLAR_SOURCE_KEY;

  let primaryFailure: string;
  if (ingestUrl && sourceKey) {
    primaryFailure = 'unknown';
    // A blip (AISolar or Supabase down for a moment, a slow cold start) used to
    // lose the lead on the first try. Try up to three times. A 4xx is not
    // retried: a refused key or a bad body will not fix itself in two seconds.
    for (let attempt = 1; attempt <= INGEST_ATTEMPTS; attempt++) {
      try {
        const res = await fetch(ingestUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-source-key': sourceKey },
          body: JSON.stringify(lead),
          signal: AbortSignal.timeout(INGEST_TIMEOUT_MS),
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (attempt > 1) console.warn('[leadBridge] ingest-lead answered on attempt', attempt);
          return { ok: true, leadId: data.leadId ?? null };
        }
        primaryFailure = `ingest-lead responded ${res.status} (attempt ${attempt})`;
        console.error('[leadBridge] ingest-lead responded', res.status, 'attempt', attempt);
        if (res.status < 500 && res.status !== 429) break;
      } catch (err) {
        primaryFailure = `ingest-lead unreachable (attempt ${attempt}): ${err instanceof Error ? err.message : String(err)}`;
        console.error('[leadBridge] ingest-lead unreachable, attempt', attempt, err);
      }
      if (attempt < INGEST_ATTEMPTS) await sleep(INGEST_BACKOFF_MS * attempt);
    }
  } else {
    primaryFailure = 'AISOLAR_INGEST_URL or AISOLAR_SOURCE_KEY is not set';
  }

  // ─── Fallback: persist to SIG so nothing is ever dropped ───
  const fallbackConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const persisted = await persistFallback(lead);
  if (persisted) {
    // Held, but nobody watches website_leads: say so loudly in the logs.
    console.error('[LEAD HELD, NOT IN AISOLAR]', JSON.stringify({
      reason: primaryFailure,
      source: lead.source,
      store: 'website_leads (forwarded=false)',
    }));
    return { ok: true, fallback: true };
  }

  // Nothing captured it. The visitor is told it did not go through (the route
  // answers 502 and every door offers WhatsApp/phone instead of a success
  // screen). The site has no email path of its own, so the lead is written to
  // the server log, loudly and in full, so a person can still call them back
  // from the Vercel logs. Silence here is how leads were lost (audit 31).
  console.error('[LEAD LOST: NOT CAPTURED ANYWHERE]', JSON.stringify({
    reason: primaryFailure,
    fallback: fallbackConfigured
      ? 'website_leads insert failed (see the line above)'
      : 'fallback store OFF: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set',
    source: lead.source,
    name: lead.name,
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    county: lead.county ?? null,
    eircode: lead.eircode ?? null,
    page: (lead.meta as { page?: unknown } | undefined)?.page ?? null,
    at: new Date().toISOString(),
  }));
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
      // The eircode has no column here, and it is the field that tells us which
      // house to survey. Keep it in meta rather than losing it on the one path
      // where the lead already failed to reach the platform.
      meta: { ...(lead.meta ?? {}), ...(lead.eircode ? { eircode: lead.eircode } : {}) },
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

/**
 * Every lead from these doors (the contact form, the chat's lead capture)
 * also emails the owner (Cal, 18 Nov 2026: "email notifications for every
 * lead action on the site so I don't miss a thing"). AISolar's new-lead email
 * covers the intake's own leads; these older doors had none, and a lead that
 * AISolar did not take was only in the logs.
 */
export async function forwardLead(lead: BridgeLead, deps: { alert?: Alerter | null } = {}): Promise<BridgeResult> {
  const result = await forwardLeadInner(lead);
  const alert = deps.alert === undefined ? postmarkAlerter() : deps.alert;
  if (!alert) {
    console.error('[lead] no owner alert configured (POSTMARK_SERVER_TOKEN, OWNER_ALERT_EMAIL, OWNER_ALERT_FROM)');
    return result;
  }
  const m = leadAlertText(lead, result);
  await alert.send(m.subject, m.text);
  return result;
}

export function leadAlertText(lead: BridgeLead, result: BridgeResult): { subject: string; text: string } {
  const where = result.ok && !result.fallback
    ? 'It is in AISolar.'
    : result.ok
      ? 'AISolar did not take it, so the website saved it in its backup store. Add it in AISolar by hand.'
      : 'AISolar did not take it and the website could not save a copy. This email is the only record: add it in AISolar by hand.';
  const lines = [
    `A new lead came in through the website (${lead.source}).`,
    where,
    '',
    `Name: ${lead.name || ''}`,
    `Mobile: ${lead.phone || ''}`,
    `Email: ${lead.email || ''}`,
    lead.county ? `County: ${lead.county}` : '',
    lead.monthlyBill != null ? `Bill: €${lead.monthlyBill} a month` : '',
    lead.message ? `Message: ${lead.message.slice(0, 1500)}` : '',
  ].filter((l, i) => l !== '' || i === 2);
  const flag = result.ok && !result.fallback ? '' : ' (NOT in AISolar)';
  return { subject: `New lead${flag}: ${lead.name || lead.phone || lead.email || 'no name'} via ${lead.source}`, text: lines.join('\n') };
}
