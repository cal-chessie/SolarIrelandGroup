import { gate, json } from '@/lib/intake/http';
import { liveMode } from '@/lib/intake/mode';
import { liveConfig } from '@/lib/intake/live/config';
import { readBillWithVision, toBillRead } from '@/lib/intake/live/billRead';
import { scenarioOf, sleep } from '@/lib/intake/stub/state';
import type { BillReadResponse, IntakeConfig } from '@/lib/intake/contract';

/**
 * POST /api/intake/bill  (multipart, field "bill")
 *
 * The "make it exact" bill photo read. Stands in for analyse-bill v2
 * (backend-spec 1.8: read only, unread fields come back null, never a default).
 *
 * LIVE: only when AISolar's Settings say the reader is on. The photo is read
 * by the site's vision model (lib/intake/live/billRead.ts) and nothing is kept
 * on this server: no file, no log, no copy. A read with no amount and no
 * yearly use answers "unreadable", so the homeowner types it instead.
 *
 * STUB: the image is checked for type and size and then discarded unread. It
 * is not stored, not logged and not sent anywhere: no vision model, no
 * AISolar bill observation. The answer is a fixed two-month bill.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']);

export async function POST(request: Request) {
  const env = liveMode();
  // Each live read costs a vision call: a tighter limit than the stub's.
  const blocked = gate(request, env ? 6 : 20);
  if (blocked) return blocked;

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get('bill');
    file = f instanceof File ? f : null;
  } catch {
    file = null;
  }
  if (!file) return json({ ok: false, reason: 'unreadable' } satisfies BillReadResponse, 400);
  if (file.size > 5 * 1024 * 1024) return json({ ok: false, reason: 'too_large' } satisfies BillReadResponse, 400);
  if (file.type && !TYPES.has(file.type)) return json({ ok: false, reason: 'wrong_type' } satisfies BillReadResponse, 400);

  if (env) {
    const cfg = await liveConfig(env, request);
    const config = cfg.status === 200 ? (cfg.body as IntakeConfig) : null;
    if (!config || !config.bill.readerEnabled) return json({ ok: false, reason: 'unavailable' } satisfies BillReadResponse);
    const v = await readBillWithVision(file);
    if (!v.ok) return json({ ok: false, reason: v.reason } satisfies BillReadResponse);
    const read = toBillRead(v.raw, config.estimate.suppliers.map((s) => s.name));
    if (read.amountEur == null && read.annualKwh == null) return json({ ok: false, reason: 'unreadable' } satisfies BillReadResponse);
    return json({ ok: true, read } satisfies BillReadResponse);
  }

  await sleep(1600);
  if (scenarioOf(request) === 'bill_unreadable') return json({ ok: false, reason: 'unreadable' } satisfies BillReadResponse);

  return json({
    ok: true,
    read: {
      amountEur: 284,
      period: 'two_months',
      supplier: 'Electric Ireland',
      annualKwh: 4380,
      unitRateEur: 0.3804,
      standingChargeAnnualEur: 251,
      dayKwh: 2628,
      nightKwh: 1752,
    },
  } satisfies BillReadResponse);
}
