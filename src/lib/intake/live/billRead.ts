/**
 * Live mode: the "make it exact" bill photo read (backend-spec 1.8: read only,
 * an unread field comes back null, never a default).
 *
 * The photo goes to the same vision model the site's analyser already uses,
 * through OpenRouter, server to server (OPENROUTER_API_KEY, BILL_VISION_MODEL).
 * This server keeps nothing: the bytes live in memory for the one request and
 * are not written, logged or forwarded anywhere else. No name, account number
 * or MPRN is asked for. What happens to the image at OpenRouter and the model
 * provider is governed by that account's settings, which no code here can see
 * (see the truth gate note in INTAKE/build/slice3w-progress.md), so the intake
 * makes no retention promise on screen.
 *
 * The prompt asks for figures exactly as printed. The only arithmetic is a
 * unit conversion of a printed value: a daily standing charge to a year, and
 * the billing dates to one month or two. A figure the model cannot see stays
 * null, and an amount with no clear billing period is not used at all (a
 * two-month bill read as one month would double an estimate).
 */
import type { BillReadResult } from '@/lib/intake/contract';

const PROMPT = `You are reading a photo or scan of an Irish electricity bill.
Return ONLY a JSON object with these fields, copied exactly as printed. Use null for anything you cannot see clearly. Never guess, never estimate.
{
  "supplier": "the electricity supplier's name as printed",
  "amountDueEur": "the total amount for this bill in euro, including VAT, as a number",
  "periodStart": "the first day of the billing period, YYYY-MM-DD",
  "periodEnd": "the last day of the billing period, YYYY-MM-DD",
  "unitRateEur": "the price per kWh in euro for the main (24 hour or day) rate, as a number, e.g. 0.3804",
  "standingChargeEur": "the standing charge amount as a number",
  "standingChargeUnit": "per_day, per_period or per_year, whichever the bill states for that amount",
  "dayKwh": "kWh used at the day (or 24 hour) rate in this billing period, as a number",
  "nightKwh": "kWh used at the night rate in this billing period, as a number, or null if there is no night rate",
  "annualKwh": "a yearly consumption figure in kWh ONLY if the bill prints one, else null"
}
Do not include names, addresses, account numbers or MPRN. No markdown, no explanation.`;

const num = (v: unknown, lo: number, hi: number): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v.replace(/[€,\s]/g, '')) : NaN;
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null;
};

const day = (v: unknown): number | null => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const t = Date.parse(`${v}T00:00:00Z`);
  return Number.isFinite(t) ? t : null;
};

/** The model's JSON, reduced to the site's BillReadResult. Pure: tested in intake-live.test.ts. */
export function toBillRead(raw: unknown, knownSuppliers: string[]): BillReadResult {
  const r = (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
  const start = day(r.periodStart);
  const end = day(r.periodEnd);
  const days = start !== null && end !== null && end >= start ? Math.round((end - start) / 86_400_000) + 1 : null;
  const period = days === null ? null : days >= 20 && days <= 45 ? 'month' : days >= 46 && days <= 75 ? 'two_months' : null;
  const amount = num(r.amountDueEur, 1, 250_000);

  let standingAnnual: number | null = null;
  const sc = num(r.standingChargeEur, 0, 5000);
  if (sc !== null) {
    if (r.standingChargeUnit === 'per_day') standingAnnual = sc * 365;
    else if (r.standingChargeUnit === 'per_year') standingAnnual = sc;
    else if (r.standingChargeUnit === 'per_period' && days) standingAnnual = (sc / days) * 365;
    if (standingAnnual !== null) standingAnnual = Math.round(standingAnnual * 100) / 100;
    if (standingAnnual !== null && standingAnnual > 2000) standingAnnual = null;
  }

  // Only a supplier the Settings list knows (the chips); anything else stays null.
  const plain = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const supplierRaw = typeof r.supplier === 'string' ? plain(r.supplier) : '';
  const supplier = supplierRaw
    ? knownSuppliers.find((s) => plain(s) === supplierRaw) ??
      knownSuppliers.find((s) => supplierRaw.includes(plain(s)) || plain(s).includes(supplierRaw)) ??
      null
    : null;

  const dayKwh = num(r.dayKwh, 1, 10_000_000);
  const nightKwh = num(r.nightKwh, 0, 10_000_000);
  return {
    amountEur: period ? amount : null,
    period: amount !== null ? period : null,
    supplier,
    annualKwh: num(r.annualKwh, 100, 5_000_000),
    unitRateEur: num(r.unitRateEur, 0.05, 1),
    standingChargeAnnualEur: standingAnnual,
    dayKwh,
    nightKwh: dayKwh !== null ? nightKwh : null,
  };
}

export type VisionResult = { ok: true; raw: unknown } | { ok: false; reason: 'unavailable' | 'unreadable' };

export async function readBillWithVision(file: File, fetcher: typeof fetch = fetch): Promise<VisionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, reason: 'unavailable' };
  const model = process.env.BILL_VISION_MODEL || 'google/gemini-2.5-flash';
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024) return { ok: false, reason: 'unreadable' };
  const mime = file.type || 'image/jpeg';
  try {
    const res = await fetcher('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'HTTP-Referer': 'https://solarirelandgroup.ie',
        'X-Title': 'Solar Ireland intake bill read',
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [{ role: 'user', content: [{ type: 'text', text: PROMPT }, { type: 'image_url', image_url: { url: `data:${mime};base64,${bytes.toString('base64')}` } }] }],
      }),
      signal: AbortSignal.timeout(40_000),
    });
    if (!res.ok) return { ok: false, reason: 'unavailable' };
    const data = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string } }[] } | null;
    const content = data?.choices?.[0]?.message?.content || '';
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) return { ok: false, reason: 'unreadable' };
    try {
      return { ok: true, raw: JSON.parse(m[0]) };
    } catch {
      return { ok: false, reason: 'unreadable' };
    }
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
