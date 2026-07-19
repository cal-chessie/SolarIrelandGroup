/**
 * Forwards leads to the AISOLAR platform (ingest-lead edge function).
 * Fire-and-forget: never blocks or fails the user's submission — email via
 * Postmark remains the safety net if AISOLAR is unreachable.
 *
 * Env: AISOLAR_INGEST_URL (https://<project>.supabase.co/functions/v1/ingest-lead)
 *      AISOLAR_INGEST_KEY (matches the INGEST_API_KEY Supabase secret)
 */
export interface AisolarLead {
  source:
    | 'website_contact'
    | 'website_chat'
    | 'website_survey'
    | 'website_qualified'
    | 'exit_intent'
    | 'bill_analyser';
  name: string;
  email?: string;
  phone?: string;
  county?: string;
  address?: string;
  eircode?: string;
  message?: string;
  monthlyBill?: number;
  annualKwh?: number;
  meta?: Record<string, unknown>;
}

export async function forwardLeadToAisolar(lead: AisolarLead): Promise<void> {
  const url = process.env.AISOLAR_INGEST_URL;
  const key = process.env.AISOLAR_INGEST_KEY;
  if (!url || !key) {
    console.warn('[AISOLAR] AISOLAR_INGEST_URL/KEY not set — lead not forwarded to platform.');
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-ingest-key': key },
      body: JSON.stringify({ brand: 'solar-ireland', ...lead }),
    });
    if (!res.ok) {
      console.error('[AISOLAR] Ingest failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('[AISOLAR] Ingest error:', err);
  }
}
