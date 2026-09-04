import { NextResponse } from 'next/server';

/**
 * POST /api/lead
 *
 * The single lead door for the whole site. Every intake (home estimate,
 * solar-calculator, book-survey, exit-intent, contact, chat) posts here.
 *
 * Flow:
 *   1. Validate + sanitise the payload.
 *   2. Forward to the AISolar `ingest-lead` edge function with the server-only
 *      x-source-key (the Solar Ireland "door"). AISolar creates the lead, and a
 *      DB trigger enqueues the lead_intake agent that scores it, estimates the
 *      system, and sends the branded estimate by email (Postmark) downstream.
 *   3. FALLBACK - if AISolar is not configured yet, or the call fails, persist
 *      the lead to SIG's own `website_leads` table so a lead is NEVER lost.
 *
 * The x-source-key and AISolar URL live only in server env - never the browser.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_SOURCES = new Set([
  'website_contact',
  'website_chat',
  'website_survey',
  'website_qualified',
  'exit_intent',
  'bill_analyser',
]);

const MAX = { name: 120, email: 254, phone: 40, county: 60, address: 300, eircode: 12, message: 2000, generic: 200 };

// Lightweight in-memory per-IP throttle (best-effort, per instance). A durable
// limiter needs shared infra; tracked as a needs-Cal item.
const RATE_LIMIT_MAX = 12;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitHits = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateLimitHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  rateLimitHits.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
function posNum(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(getClientIp(request))) {
      return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Honeypot: bots fill hidden fields. Accept (200) but drop silently.
    if (str(body.company, 100) || str(body.website_url, 100)) {
      return NextResponse.json({ ok: true });
    }

    const email = str(body.email, MAX.email).toLowerCase();
    const phone = str(body.phone, MAX.phone);
    let name = str(body.name, MAX.name);

    // AISolar requires name + (email or phone). Never lose a valid contact for
    // want of a name - derive a placeholder from the email local part.
    if (!name && email) name = email.split('@')[0].replace(/[._-]+/g, ' ').slice(0, MAX.name) || 'Website lead';
    if (!name && phone) name = 'Website lead';

    if (!email && !phone) {
      return NextResponse.json({ error: 'An email or phone number is required.' }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const source = ALLOWED_SOURCES.has(body.source) ? (body.source as string) : 'website_contact';

    const lead = {
      brand: 'solar-ireland',
      source,
      name,
      email: email || undefined,
      phone: phone || undefined,
      county: str(body.county, MAX.county) || undefined,
      address: str(body.address, MAX.address) || undefined,
      eircode: str(body.eircode, MAX.eircode) || undefined,
      monthlyBill: posNum(body.monthlyBill) ?? undefined,
      annualKwh: posNum(body.annualKwh) ?? undefined,
      message: str(body.message, MAX.message) || undefined,
      meta: {
        page: str(body.page, MAX.generic) || undefined,
        homeType: str(body.homeType, MAX.generic) || undefined,
        estimatedAnnualSaving: posNum(body.estimatedAnnualSaving) ?? undefined,
      },
    };

    // ─── Primary: forward to AISolar ───
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
          return NextResponse.json({ ok: true, leadId: data.leadId ?? null });
        }
        // 4xx from ingest (bad payload) is worth surfacing; still fall back so
        // the lead is captured somewhere.
        console.error('[lead] ingest-lead responded', res.status);
      } catch (err) {
        console.error('[lead] ingest-lead unreachable:', err);
      }
    }

    // ─── Fallback: persist to SIG so nothing is ever dropped ───
    const persisted = await persistFallback(lead);
    if (persisted) return NextResponse.json({ ok: true, fallback: true });

    // Nothing captured the lead - tell the UI so it can offer WhatsApp/phone.
    return NextResponse.json({ error: 'We could not submit that just now. Please try WhatsApp or call us.' }, { status: 502 });
  } catch (error) {
    console.error('[lead] Failed to process lead:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

async function persistFallback(lead: Record<string, unknown>): Promise<boolean> {
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
      console.error('[lead] fallback insert failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[lead] fallback persist error:', err);
    return false;
  }
}
