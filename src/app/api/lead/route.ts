import { NextResponse } from 'next/server';
import { forwardLead, isRateLimited, isHoneypotTripped, type BridgeLead } from '@/lib/leadBridge';

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


function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
function posNum(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}


/**
 * Keep only simple label/value pairs from the analyser's bill read, bounded in
 * both count and length. This is model output, so it is treated as untrusted.
 */
function sanitiseBillRead(raw: unknown): Record<string, string> | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (Object.keys(out).length >= 30) break;
    if (v === null || v === undefined || v === '') continue;
    if (typeof v !== 'string' && typeof v !== 'number' && typeof v !== 'boolean') continue;
    const key = k.slice(0, 40).replace(/[^\w.-]/g, '');
    if (!key) continue;
    out[key] = String(v).slice(0, 120);
  }
  return Object.keys(out).length ? out : undefined;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Honeypot: bots fill hidden fields. Accept (200) but drop silently.
    if (isHoneypotTripped(body)) {
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

    const lead: BridgeLead = {
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
        surveyDate: str(body.surveyDate, MAX.generic) || undefined,
        surveyTime: str(body.surveyTime, MAX.generic) || undefined,
        // What the forms actually collect. Every one of these makes the
        // estimate less of a guess, and none of them reached the platform
        // before: it was seeing a monthly figure and an annual usage.
        segment: body.segment === 'commercial' ? 'commercial' : (body.segment === 'domestic' ? 'domestic' : undefined),
        occupants: str(body.occupants, MAX.generic) || undefined,
        provider: str(body.provider, MAX.generic) || undefined,
        roofType: str(body.roofType, MAX.generic) || undefined,
        householdSize: str(body.householdSize, MAX.generic) || undefined,
        // The analyser's read of a real uploaded bill. Values only, capped,
        // so a bad extraction can never post arbitrary payloads onward.
        billRead: sanitiseBillRead(body.billRead),
      },
    };

    const result = await forwardLead(lead);
    if (result.ok) {
      return NextResponse.json({ ok: true, leadId: result.leadId ?? null, ...(result.fallback ? { fallback: true } : {}) });
    }

    // Nothing captured the lead - tell the UI so it can offer WhatsApp/phone.
    return NextResponse.json({ error: 'We could not submit that just now. Please try WhatsApp or call us.' }, { status: 502 });
  } catch (error) {
    console.error('[lead] Failed to process lead:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

