/**
 * submitLead - the one client-side helper every intake uses.
 *
 * Posts to /api/lead (the server bridge that holds the AISolar source key and
 * forwards into AISolar's ingest-lead). Never talks to AISolar directly, so the
 * source key stays server-side. Fire-and-report: returns a small result the UI
 * uses to show success or fall back to WhatsApp/phone.
 */

export type LeadSource =
  | 'bill_analyser'
  | 'website_survey'
  | 'exit_intent'
  | 'website_contact'
  | 'website_chat';

export interface LeadInput {
  source: LeadSource;
  name?: string;
  email?: string;
  phone?: string;
  county?: string;
  address?: string;
  eircode?: string;
  monthlyBill?: number;
  annualKwh?: number;
  message?: string;
  homeType?: string;
  estimatedAnnualSaving?: number;
  /** Hidden honeypot fields - leave undefined; bots fill them. */
  company?: string;
  website_url?: string;
}

export interface LeadResult {
  ok: boolean;
  leadId?: string | null;
  error?: string;
}

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, page: typeof window !== 'undefined' ? window.location.pathname : undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || 'Something went wrong. Please try again.' };
    return { ok: true, leadId: data?.leadId ?? null };
  } catch {
    return { ok: false, error: 'Network error. Please check your connection and try again.' };
  }
}
