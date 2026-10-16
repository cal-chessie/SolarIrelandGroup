// @vitest-environment node
/**
 * Intake OS slice 3W: live mode, proven without touching production.
 *
 * - The read shapes (intake-config, intake-quote, survey-availability) are the
 *   real answers from V5 through the TEST DOOR on 16 Oct 2026, quote tokens
 *   redacted (fixtures/intake-live/*.json).
 * - The write shapes (survey-hold, ingest-lead v2) are AISolar's own, copied
 *   from its handler tests (survey-hold/handler_test.ts, ingest-lead/v2_test.ts),
 *   because no agent may submit a lead or a hold to production.
 * - The routes run against a mocked fetch: nothing here reaches the network.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import configFx from './fixtures/intake-live/intake-config.json';
import quoteFx from './fixtures/intake-live/intake-quote.json';
import slotsFx from './fixtures/intake-live/survey-availability.json';
import { intakeMode, liveEnv } from '@/lib/intake/mode';
import { adaptConfig, adaptHold, adaptQuote, adaptSlots, adaptSubmit, outboxAnswer } from '@/lib/intake/live/adapt';
import type { CallResult } from '@/lib/intake/live/client';
import { toIngestBody } from '@/lib/intake/live/ingest';
import { alertText, backoffMinutes, holdInOutbox, replayDue, STUCK_AFTER, type OutboxRow, type OutboxStore } from '@/lib/intake/live/outbox';
import { toBillRead } from '@/lib/intake/live/billRead';
import { validateQuoteRequest } from '@/lib/intake/validate';
import type { SubmitRequest } from '@/lib/intake/contract';

const ok = (data: unknown, status = 200): CallResult => ({ status, data, failure: null });
const down = (failure: 'timeout' | 'network' = 'network'): CallResult => ({ status: 0, data: null, failure });
const ORIGINS = ['https://aisolar.ie', 'https://www.aisolar.ie'];
const SAT9 = '2026-10-17T08:00:00.000Z';
const SAT11 = '2026-10-17T10:00:00.000Z';
const HEX = (c: string) => c.repeat(64);
const CODE = 'x'.repeat(43);

const ENV_KEYS = ['INTAKE_CONTRACT_MODE', 'INTAKE_AISOLAR_URL', 'INTAKE_SOURCE_KEY', 'AISOLAR_SOURCE_KEY', 'VERCEL_ENV', 'POSTMARK_SERVER_TOKEN', 'OWNER_ALERT_EMAIL', 'OWNER_ALERT_FROM', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'CRON_SECRET'];
let saved: Record<string, string | undefined> = {};
beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.restoreAllMocks();
});

function setLive() {
  process.env.INTAKE_CONTRACT_MODE = 'live';
  process.env.INTAKE_AISOLAR_URL = 'https://abcdefghijklmnop.supabase.co/functions/v1';
  process.env.INTAKE_SOURCE_KEY = 'src_testdoor_0123456789abcdef';
}

/* ------------------------------------------------------------------ */

describe('mode: live is fail closed', () => {
  it('is off with no flag, and off when the flag is live but the env is missing or malformed', () => {
    expect(intakeMode()).toBe('off');
    process.env.INTAKE_CONTRACT_MODE = 'live';
    expect(intakeMode()).toBe('off');
    process.env.INTAKE_AISOLAR_URL = 'https://abcdefghijklmnop.supabase.co/functions/v1';
    expect(intakeMode()).toBe('off');
    process.env.INTAKE_SOURCE_KEY = 'short';
    expect(intakeMode()).toBe('off');
    process.env.INTAKE_SOURCE_KEY = 'src_testdoor_0123456789abcdef';
    expect(intakeMode()).toBe('live');
    process.env.INTAKE_AISOLAR_URL = 'http://abcdefghijklmnop.supabase.co/functions/v1';
    expect(intakeMode()).toBe('off');
    process.env.INTAKE_AISOLAR_URL = 'https://evil.example.com/functions/v1';
    expect(intakeMode()).toBe('off');
  });

  it('never borrows the website door key (Preview holds the real one)', () => {
    process.env.INTAKE_CONTRACT_MODE = 'live';
    process.env.INTAKE_AISOLAR_URL = 'https://abcdefghijklmnop.supabase.co/functions/v1';
    process.env.AISOLAR_SOURCE_KEY = 'src_realwebsitedoor_0123456789';
    expect(intakeMode()).toBe('off');
    expect(liveEnv()).toBeNull();
  });

  it('runs on production when configured; the flag must be exactly "live"', () => {
    setLive();
    process.env.VERCEL_ENV = 'production';
    expect(intakeMode()).toBe('live');
    process.env.INTAKE_CONTRACT_MODE = 'LIVE';
    expect(intakeMode()).toBe('off');
  });

  it('keeps the stub off production', () => {
    process.env.INTAKE_CONTRACT_MODE = 'stub';
    process.env.VERCEL_ENV = 'production';
    expect(intakeMode()).toBe('off');
  });
});

/* ------------------------------------------------------------------ */

describe('intake-config', () => {
  it('passes the recorded V5 config through field for field', () => {
    const a = adaptConfig(ok(configFx.body));
    expect(a.status).toBe(200);
    expect(a.body).toEqual(configFx.body);
  });
  it('a refused door, a 500 or a malformed body is the honest "unavailable" (503); a limit is 429', () => {
    expect(adaptConfig(ok({ ok: false, error: 'intake_unavailable', reason: 'invalid_source_key' }, 401))).toMatchObject({ status: 503, body: { ok: false, error: 'intake_unavailable' } });
    expect(adaptConfig(ok({ ok: false, error: 'intake_unavailable', reason: 'engine_not_configured' }, 409)).status).toBe(503);
    expect(adaptConfig(down('timeout')).status).toBe(503);
    expect(adaptConfig(ok({ ...configFx.body, estimate: { ...configFx.body.estimate, minKwp: '4' } })).status).toBe(503);
    expect(adaptConfig(ok({ ok: false, error: 'rate_limited' }, 429)).status).toBe(429);
  });
});

describe('intake-quote', () => {
  const body = quoteFx.body;
  it('passes AISolar\'s figures through untouched (EUR 110: 4 kWp, 878 a year, net 6,400, 7.3 years)', () => {
    const a = adaptQuote(ok(body), 4);
    expect(a.status).toBe(200);
    const res = a.body as { quotes: { figures: unknown; hasBasis: boolean; quoteToken: string | null }[] };
    expect(res.quotes.map((q) => q.figures)).toEqual(body.quotes.map((q) => (q.hasBasis ? q.figures : null)));
    const f = res.quotes[0].figures as Record<string, number>;
    expect([f.kwp, f.annualSavingEur, f.netCostEur, f.paybackYears, f.horizonSavingsEur]).toEqual([4, 878, 6400, 7.3, 24881]);
    expect(res.quotes[2].figures).toMatchObject({ grantScheme: 'NDMG', grossCostEur: null, indicative: true, priceBasis: 'proposal' });
    expect(res.quotes[3].hasBasis).toBe(false);
    expect(res.quotes[3].figures).toBeNull();
    expect(res.quotes[0].quoteToken).toBeTruthy();
    expect(Object.keys(a.body)).not.toContain('smallestHomeSystem');
  });
  it('a count that does not match what was asked, or a broken quote, is never shown', () => {
    expect(adaptQuote(ok(body), 3).status).toBe(503);
    expect(adaptQuote(ok({ ...body, quotes: [{ ...body.quotes[0], figures: null }, ...body.quotes.slice(1)] }), 4).status).toBe(503);
  });
  it('maps refusals and failures to the UI states', () => {
    expect(adaptQuote(ok({ ok: false, error: 'pii_not_allowed', reason: 'personal_data_not_accepted' }, 400), 1)).toMatchObject({ status: 400, body: { error: 'pii_not_allowed' } });
    expect(adaptQuote(ok({ ok: false, error: 'invalid' }, 400), 1)).toMatchObject({ status: 400, body: { error: 'invalid' } });
    expect(adaptQuote(ok({ ok: false, error: 'intake_unavailable', reason: 'settings_invalid' }, 503), 1)).toMatchObject({ status: 503, body: { error: 'server_error' } });
    expect(adaptQuote(down(), 1).status).toBe(503);
    expect(adaptQuote(ok({}, 429), 1).status).toBe(429);
  });
});

describe('survey-availability and the hold', () => {
  it('passes the recorded V5 days through, labels included ("9am", "11:30am", "2pm")', () => {
    const a = adaptSlots(ok(slotsFx.body));
    expect(a.status).toBe(200);
    expect(a.body).toEqual(slotsFx.body);
  });
  it('drops a day with no valid slot, refuses a malformed day', () => {
    const a = adaptSlots(ok({ ...slotsFx.body, days: [{ date: '2026-10-17', label: 'Sat 17 Oct', slots: [{ startsAt: 'nope', endsAt: SAT11, label: '9am' }] }] }));
    expect((a.body as { days: unknown[] }).days).toEqual([]);
    expect(adaptSlots(ok({ ...slotsFx.body, days: [{ date: 17 }] })).status).toBe(503);
    expect(adaptSlots(down()).status).toBe(503);
  });
  it('hold shapes from AISolar survey-hold', () => {
    expect(adaptHold(ok({ ok: true, holdToken: HEX('f'), startsAt: SAT9, expiresAt: '2026-10-14T09:10:00.000Z' })).body).toEqual({ ok: true, holdToken: HEX('f'), startsAt: SAT9, expiresAt: '2026-10-14T09:10:00.000Z' });
    expect(adaptHold(ok({ ok: false, outcome: 'slot_unavailable', alternatives: [{ startsAt: '2026-10-17T10:30:00.000Z', endsAt: '2026-10-17T12:30:00.000Z', label: '11:30am' }] })).body).toEqual({ ok: false, outcome: 'slot_unavailable', alternatives: [{ startsAt: '2026-10-17T10:30:00.000Z', endsAt: '2026-10-17T12:30:00.000Z', label: '11:30am' }] });
    expect(adaptHold(ok({ ok: true, released: true })).body).toEqual({ ok: true, released: true });
    expect(adaptHold(ok({ ok: true, holdToken: 'not-a-token', startsAt: SAT9, expiresAt: SAT11 })).status).toBe(503);
    expect(adaptHold(ok({ ok: false, error: 'invalid', reason: 'session_required' }, 400)).status).toBe(503);
  });
});

/* ------------------------------------------------------------------ */

const ctxAsked = { asked: true, portalOrigins: ORIGINS };
const freshBooked = {
  ok: true, leadId: '11111111-1111-4111-8111-111111111111', path: 'fresh',
  booking: { outcome: 'booked', startsAt: SAT9, endsAt: SAT11, surveyorFirstName: 'Cal' },
  estimate: { quoteVersion: 1, figures: quoteFx.body.quotes[0].figures },
  handoff: { code: CODE, expiresAt: '2026-10-16T12:10:00.000Z', portalUrl: 'https://aisolar.ie/h' },
  deviceToken: HEX('a'), next: 'portal',
};

describe('ingest-lead v2 answers', () => {
  it('fresh and booked: shown as booked with the claimed time; the device token goes to the cookie, never the browser', () => {
    const a = adaptSubmit(ok(freshBooked), ctxAsked);
    expect(a.kind).toBe('answer');
    if (a.kind !== 'answer') return;
    expect(a.deviceToken).toBe(HEX('a'));
    expect(a.body.deviceToken).toBeNull();
    expect(a.body.booking).toEqual({ outcome: 'booked', startsAt: SAT9, endsAt: SAT11, surveyorFirstName: 'Cal' });
    expect(a.body.handoff?.portalUrl).toBe('https://aisolar.ie/h');
    expect(a.body.estimate?.figures).toEqual(quoteFx.body.quotes[0].figures);
    expect(a.body.next).toBe('portal');
  });
  it('a hand-off to any other host is dropped, and the homeowner is pointed to their email', () => {
    const a = adaptSubmit(ok({ ...freshBooked, handoff: { ...freshBooked.handoff, portalUrl: 'https://evil.example/h' } }), ctxAsked);
    expect(a.kind === 'answer' && a.body.handoff).toBeNull();
    expect(a.kind === 'answer' && a.body.next).toBe('check_email');
  });
  it('"booked" without a time is never shown as booked', () => {
    const a = adaptSubmit(ok({ ...freshBooked, booking: { outcome: 'booked', surveyorFirstName: 'Cal' } }), ctxAsked);
    expect(a.kind === 'answer' && a.body.booking.outcome).toBe('requested');
  });
  it('slot taken: the alternatives come through for the pick-another-time state', () => {
    const a = adaptSubmit(ok({ ...freshBooked, booking: { outcome: 'slot_unavailable', alternatives: [{ startsAt: '2026-10-17T09:00:00.000Z', endsAt: '2026-10-17T11:00:00.000Z', label: '11am' }] }, next: 'pick_another_time' }), ctxAsked);
    expect(a.kind === 'answer' && a.body.booking.alternatives?.map((s) => s.label)).toEqual(['11am']);
    expect(a.kind === 'answer' && a.body.next).toBe('pick_another_time');
  });
  it('threaded: this device already booked; deduped by email: a booking exists, never revealed', () => {
    const t = adaptSubmit(ok({ ...freshBooked, path: 'threaded', booking: { outcome: 'already_booked', existing: { startsAt: SAT9, endsAt: SAT11 } }, handoff: null, deviceToken: null, next: 'check_email' }), ctxAsked);
    expect(t.kind === 'answer' && t.body.booking.existing).toEqual({ startsAt: SAT9, endsAt: SAT11 });
    const d = adaptSubmit(ok({ ...freshBooked, path: 'deduped', booking: { outcome: 'already_booked', existing: null }, estimate: null, handoff: null, deviceToken: null, next: 'check_email' }), ctxAsked);
    expect(d.kind === 'answer' && d.body.booking).toEqual({ outcome: 'already_booked', existing: null });
    expect(d.kind === 'answer' && d.deviceToken).toBeNull();
  });
  it('the old path (intakeV2 off): captured, shown as a request, nothing claimed or handed off', () => {
    const asked = adaptSubmit(ok({ ok: true, leadId: '22222222-2222-4222-8222-222222222222' }), ctxAsked);
    expect(asked).toMatchObject({ kind: 'answer', legacy: true, deviceToken: null, body: { path: 'fresh', booking: { outcome: 'requested' }, handoff: null, estimate: null, next: 'check_email' } });
    const notAsked = adaptSubmit(ok({ ok: true, leadId: '22222222-2222-4222-8222-222222222222' }), { asked: false, portalOrigins: ORIGINS });
    expect(notAsked.kind === 'answer' && notAsked.body.booking.outcome).toBe('none');
  });
  it('a 400 is the form\'s failure; everything else is retried with the same key, then held', () => {
    expect(adaptSubmit(ok({ ok: false, error: 'invalid', reason: 'invalid_request', fields: { phone: 'invalid' } }, 400), ctxAsked)).toMatchObject({ kind: 'invalid', body: { error: 'invalid', fields: { phone: 'invalid' } } });
    expect(adaptSubmit(ok({ ok: false, error: 'server_error', reason: 'in_flight' }, 409), ctxAsked)).toMatchObject({ kind: 'retry', rateLimited: false });
    expect(adaptSubmit(ok({ ok: false, error: 'server_error', reason: 'lead_not_created' }, 500), ctxAsked).kind).toBe('retry');
    expect(adaptSubmit(ok({ error: 'Invalid source key' }, 401), ctxAsked).kind).toBe('retry');
    expect(adaptSubmit(ok({ error: 'Rate limit exceeded' }, 429), ctxAsked)).toMatchObject({ kind: 'retry', rateLimited: true });
    expect(adaptSubmit(down('timeout'), ctxAsked)).toMatchObject({ kind: 'retry', note: 'aisolar_timeout' });
    expect(adaptSubmit(ok({ ok: true, path: 'sideways', booking: { outcome: 'booked' }, next: 'portal', leadId: null }), ctxAsked).kind).toBe('retry');
  });
  it('the outbox answer is "saved, not booked"', () => {
    expect(outboxAnswer()).toMatchObject({ path: 'outbox', fallback: true, booking: { outcome: 'none' }, handoff: null, deviceToken: null });
  });
});

/* ------------------------------------------------------------------ */

function submitReq(over: Partial<SubmitRequest> = {}): SubmitRequest {
  return {
    source: 'website_survey', name: 'Mary Byrne', email: 'Mary.Test@Example.ie', phone: '087 123 4567', eircode: 'D06X285', county: 'Dublin', address: null,
    monthlyBill: 110, annualKwh: null, quoteToken: 'payload.mac', slot: { startsAt: '2026-10-17T09:00:00+01:00', holdToken: HEX('b') }, requestedDay: null,
    emailEstimate: false, onExisting: 'ask',
    meta: { segment: 'domestic', businessName: 'ignored for a home', door: 'hero', page: '/', src: null, pkg: null, countyContext: null, billPeriod: 'month', supplier: null, flowId: 'f1' },
    ...over,
  };
}

describe('the ingest-lead body', () => {
  it('is built field by field: nothing a browser adds rides along', () => {
    const raw = { ...submitReq(), company: 'x', website_url: 'y', is_test: true, tenant_id: 'z' } as unknown as SubmitRequest;
    const b = toIngestBody(raw, HEX('c'));
    expect(Object.keys(b).sort()).toEqual(['address', 'annualKwh', 'brand', 'county', 'eircode', 'email', 'emailEstimate', 'leadToken', 'meta', 'monthlyBill', 'name', 'onExisting', 'phone', 'quoteToken', 'requestedDay', 'slot', 'source'].sort());
    expect(b.email).toBe('mary.test@example.ie');
    expect(b.slot).toEqual({ startsAt: SAT9, holdToken: HEX('b') });
    expect(b.meta.surveySlotISO).toBe(SAT9);
    expect(b.meta.businessName).toBeNull();
    expect(b.leadToken).toBe(HEX('c'));
  });
  it('a non-hex hold token or device token is dropped; a slot wins over a requested day', () => {
    const b = toIngestBody(submitReq({ slot: { startsAt: SAT9, holdToken: 'stub-uuid' }, requestedDay: { date: '2026-10-20', part: 'morning' } }), 'not-hex');
    expect(b.slot?.holdToken).toBeNull();
    expect(b.requestedDay).toBeNull();
    expect(b.leadToken).toBeUndefined();
  });
  it('keeps the business name for a business', () => {
    const b = toIngestBody(submitReq({ meta: { ...submitReq().meta, segment: 'commercial', businessName: 'Byrne Hardware' } }), null);
    expect(b.meta).toMatchObject({ segment: 'commercial', businessName: 'Byrne Hardware' });
  });
});

/* ------------------------------------------------------------------ */

function memStore(rows: OutboxRow[] = []) {
  const inserted: Record<string, unknown>[] = [];
  const updates: { id: string; patch: Parameters<OutboxStore['update']>[1] }[] = [];
  const store: OutboxStore = {
    findByKey: async (k) => {
      const hit = rows.find((r) => r.meta.idempotencyKey === k) ?? inserted.find((r) => (r.meta as { idempotencyKey: string }).idempotencyKey === k);
      return hit ? { id: 'x' } : null;
    },
    insert: async (row) => (inserted.push(row), true),
    listPending: async () => rows,
    update: async (id, patch) => (updates.push({ id, patch }), true),
  };
  return { store, inserted, updates };
}
const KEY = '9b2f0c1e-3d4a-4b5c-8d6e-7f8091a2b3c4';
const NOW = new Date('2026-10-16T12:00:00.000Z');

describe('the outbox', () => {
  it('holds the exact body with its key, alerts the owner once, and a repeat of the key does neither again', async () => {
    const { store, inserted } = memStore();
    const sent: string[] = [];
    const alert = { send: async (s: string) => (sent.push(s), true) };
    const payload = toIngestBody(submitReq(), null);
    const first = await holdInOutbox({ key: KEY, payload, reason: 'aisolar_timeout' }, { store, alert, now: () => NOW });
    expect(first).toEqual({ held: true, stored: true, alerted: true, repeat: false });
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({ forwarded: false, email: 'mary.test@example.ie', meta: { intake: 'v2', idempotencyKey: KEY, attempts: 0, payload } });
    expect(sent[0]).toBe('Lead held on the website: Mary Byrne, 087 123 4567. AISolar did not accept it.');
    const again = await holdInOutbox({ key: KEY, payload, reason: 'aisolar_timeout' }, { store, alert, now: () => NOW });
    expect(again).toMatchObject({ held: true, repeat: true, alerted: false });
    expect(inserted).toHaveLength(1);
    expect(sent).toHaveLength(1);
  });
  it('with no storage the alert is the only copy and says so; with neither, nothing is claimed', async () => {
    const texts: string[] = [];
    const alertOnly = await holdInOutbox({ key: KEY, payload: toIngestBody(submitReq(), null), reason: 'aisolar_500_lead_not_created' }, { store: null, alert: { send: async (_s, t) => (texts.push(t), true) }, now: () => NOW });
    expect(alertOnly).toMatchObject({ held: true, stored: false, alerted: true });
    expect(texts[0]).toContain('This email is the only copy');
    expect(texts[0]).toContain('Saturday 17 October, 9am');
    const nothing = await holdInOutbox({ key: KEY, payload: toIngestBody(submitReq(), null), reason: 'x' }, { store: null, alert: null, now: () => NOW });
    expect(nothing.held).toBe(false);
  });
  it('alert copy has no dashes and no internal jargon in the homeowner line', () => {
    const { subject, text } = alertText(toIngestBody(submitReq(), null), KEY, 'aisolar_timeout', true);
    expect(`${subject}\n${text}`).not.toMatch(/[\u2013\u2014]/);
    expect(text).toContain('They were told: "Saved, not booked yet. We\'ll confirm by email."');
  });
  it('backs off 1, 2, 4, 8, 16, then every 30 minutes', () => {
    expect([1, 2, 3, 4, 5, 6, 9].map(backoffMinutes)).toEqual([1, 2, 4, 8, 16, 30, 30]);
  });
});

describe('the replay', () => {
  const payload = toIngestBody(submitReq(), null);
  const row = (id: string, over: Partial<OutboxRow['meta']> = {}): OutboxRow => ({ id, meta: { intake: 'v2', idempotencyKey: `${KEY.slice(0, -1)}${id}`, payload, attempts: 0, lastError: 'x', nextAttemptAt: '2026-10-16T11:59:00.000Z', heldAt: '2026-10-16T11:58:00.000Z', ...over } });

  it('sends each due lead with its own key; an answer marks it forwarded; not-due and parked rows wait', async () => {
    const rows = [row('1'), row('2', { nextAttemptAt: '2026-10-16T12:30:00.000Z' }), row('3', { parked: true })];
    const { store, updates } = memStore(rows);
    const keys: string[] = [];
    const r = await replayDue({ store, alert: null, now: () => NOW, portalOrigins: ORIGINS, send: async (_p, k) => (keys.push(k), ok(freshBooked)) });
    expect(keys).toEqual([rows[0].meta.idempotencyKey]);
    expect(r).toMatchObject({ pending: 2, due: 1, forwarded: 1 });
    expect(updates[0]).toMatchObject({ id: '1', patch: { forwarded: true, meta: { aisolarLeadId: freshBooked.leadId, outcome: 'booked' } } });
  });
  it('a failure backs off; the owner hears once when it is stuck; a refusal parks it and tells the owner', async () => {
    const rows = [row('1', { attempts: STUCK_AFTER - 1 }), row('2')];
    const { store, updates } = memStore(rows);
    const subjects: string[] = [];
    let n = 0;
    const r = await replayDue({
      store, now: () => NOW, portalOrigins: ORIGINS,
      alert: { send: async (s) => (subjects.push(s), true) },
      send: async () => (n++ === 0 ? down() : ok({ ok: false, error: 'invalid', fields: { email: 'invalid' } }, 400)),
    });
    expect(r).toMatchObject({ retrying: 1, parked: 1 });
    expect(updates[0].patch.meta).toMatchObject({ attempts: STUCK_AFTER, stuckAlerted: true, nextAttemptAt: '2026-10-16T12:30:00.000Z' });
    expect(updates[1].patch.meta).toMatchObject({ parked: true });
    expect(subjects).toHaveLength(2);
  });
});

/* ------------------------------------------------------------------ */

describe('the bill photo read', () => {
  const suppliers = ['Electric Ireland', 'Bord Gáis Energy', 'SSE Airtricity'];
  it('reads a two-month bill, a daily standing charge to a year, and the supplier from the Settings list', () => {
    expect(toBillRead({ supplier: 'Bord Gais Energy Ltd', amountDueEur: 284.12, periodStart: '2026-08-01', periodEnd: '2026-09-30', unitRateEur: 0.3804, standingChargeEur: 0.6877, standingChargeUnit: 'per_day', dayKwh: 640, nightKwh: 290, annualKwh: null }, suppliers))
      .toEqual({ amountEur: 284.12, period: 'two_months', supplier: 'Bord Gáis Energy', annualKwh: null, unitRateEur: 0.3804, standingChargeAnnualEur: 251.01, dayKwh: 640, nightKwh: 290 });
  });
  it('never guesses: no period means no amount; unread or out-of-range fields are null', () => {
    expect(toBillRead({ amountDueEur: '€142.00', unitRateEur: 4.2, supplier: 'Someone Else', nightKwh: 200 }, suppliers))
      .toEqual({ amountEur: null, period: null, supplier: null, annualKwh: null, unitRateEur: null, standingChargeAnnualEur: null, dayKwh: null, nightKwh: null });
    expect(toBillRead(null, suppliers).amountEur).toBeNull();
    expect(toBillRead({ amountDueEur: 120, periodStart: '2026-09-01', periodEnd: '2026-09-30' }, suppliers)).toMatchObject({ amountEur: 120, period: 'month' });
  });
});

describe('the quote request is checked to AISolar\'s bounds', () => {
  it('a home bill above 5,000 a month, or a long supplier, is refused or trimmed here first', () => {
    expect(validateQuoteRequest({ requests: [{ segment: 'domestic', bill: { amountEur: 6000, period: 'month' } }] }).ok).toBe(false);
    expect(validateQuoteRequest({ requests: [{ segment: 'commercial', bill: { amountEur: 6000, period: 'month' } }] }).ok).toBe(true);
    const v = validateQuoteRequest({ requests: [{ segment: 'domestic', bill: null, annualKwh: 4000, supplier: `  ${'x'.repeat(70)} ` }] });
    expect(v.ok && v.items[0].supplier?.length).toBe(60);
    expect(validateQuoteRequest({ requests: [{ segment: 'domestic', email: 'a@b.ie' }] })).toMatchObject({ ok: false, error: 'pii_not_allowed' });
  });
});

/* ------------------------------------------------------------------ */
/*  The routes, end to end against a mocked AISolar                    */
/* ------------------------------------------------------------------ */

type Seen = { url: string; headers: Record<string, string>; body: unknown };
function mockFetch(answer: (url: string, seen: Seen) => Response | Promise<Response>) {
  const seen: Seen[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input);
    const headers = Object.fromEntries(new Headers(init?.headers).entries());
    const s = { url, headers, body: init?.body ? JSON.parse(String(init.body)) : null };
    seen.push(s);
    return answer(url, s);
  });
  return seen;
}
const jsonRes = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

describe('routes in live mode', () => {
  it('config: answers AISolar\'s config through the intake door with a visitor hash, never the IP', async () => {
    setLive();
    const seen = mockFetch(() => jsonRes(configFx.body));
    const { GET } = await import('@/app/api/intake/config/route');
    const res = await GET(new Request('http://localhost/api/intake/config', { headers: { 'x-forwarded-for': '203.0.113.9' } }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(configFx.body);
    expect(seen[0].url).toBe('https://abcdefghijklmnop.supabase.co/functions/v1/intake-config');
    expect(seen[0].headers['x-source-key']).toBe('src_testdoor_0123456789abcdef');
    expect(seen[0].headers['x-visitor-hash']).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(seen[0].headers)).not.toContain('203.0.113.9');
  });

  it('quote: refuses personal data before anything leaves the site', async () => {
    setLive();
    const seen = mockFetch(() => jsonRes(quoteFx.body));
    const { POST } = await import('@/app/api/intake/quote/route');
    const res = await POST(new Request('http://localhost/api/intake/quote', { method: 'POST', body: JSON.stringify({ requests: [{ segment: 'domestic', bill: { amountEur: 110, period: 'month' }, eircode: 'D06X285' }] }) }));
    expect(res.status).toBe(400);
    expect(seen).toHaveLength(0);
  });

  it('submit: v2 header, same key, the cookie device token as leadToken; a fresh device token becomes an HttpOnly cookie only', async () => {
    setLive();
    const seen = mockFetch(() => jsonRes(freshBooked));
    const { POST } = await import('@/app/api/intake/submit/route');
    const res = await POST(new Request('http://localhost/api/intake/submit', {
      method: 'POST',
      headers: { 'x-idempotency-key': KEY, cookie: `si_device=${HEX('d')}; si_stub_scenario=fail` },
      body: JSON.stringify({ ...submitReq(), company: '' }),
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.booking.outcome).toBe('booked');
    expect(body.deviceToken).toBeNull();
    expect(res.headers.get('set-cookie')).toContain(`si_device=${HEX('a')}`);
    expect(res.headers.get('set-cookie')).toContain('HttpOnly');
    expect(seen).toHaveLength(1);
    expect(seen[0].url).toMatch(/\/ingest-lead$/);
    expect(seen[0].headers).toMatchObject({ 'x-intake-version': '2', 'x-idempotency-key': KEY });
    expect(seen[0].body).toMatchObject({ leadToken: HEX('d'), brand: 'solar-ireland', source: 'website_survey' });
    expect(seen[0].body).not.toHaveProperty('company');
  });

  it('submit: AISolar down twice and nothing to hold it in: a plain failure, never "saved"', async () => {
    setLive();
    const seen = mockFetch(() => {
      throw new TypeError('fetch failed');
    });
    const { POST } = await import('@/app/api/intake/submit/route');
    const res = await POST(new Request('http://localhost/api/intake/submit', { method: 'POST', headers: { 'x-idempotency-key': KEY }, body: JSON.stringify(submitReq()) }));
    expect(res.status).toBe(502);
    expect(seen.map((s) => s.headers['x-idempotency-key'])).toEqual([KEY, KEY]);
  });

  it('submit: AISolar down, owner alert configured: saved, not booked, and Cal has the lead by email', async () => {
    setLive();
    process.env.POSTMARK_SERVER_TOKEN = 'pm-test';
    process.env.OWNER_ALERT_EMAIL = 'owner@example.ie';
    process.env.OWNER_ALERT_FROM = 'site@example.ie';
    const seen = mockFetch((url) => (url.includes('postmarkapp') ? jsonRes({ ErrorCode: 0 }) : jsonRes({ ok: false, error: 'server_error', reason: 'lead_not_created' }, 500)));
    const { POST } = await import('@/app/api/intake/submit/route');
    const res = await POST(new Request('http://localhost/api/intake/submit', { method: 'POST', headers: { 'x-idempotency-key': KEY }, body: JSON.stringify(submitReq()) }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ path: 'outbox', fallback: true, booking: { outcome: 'none' } });
    const mail = seen.find((s) => s.url.includes('postmarkapp'));
    expect(mail?.body).toMatchObject({ To: 'owner@example.ie', From: 'site@example.ie' });
    expect((mail?.body as { TextBody: string }).TextBody).toContain('Mary Byrne');
  });

  it('handoff: the stub receiver is gone in live mode (the code posts to the portal host)', async () => {
    setLive();
    const { POST } = await import('@/app/api/intake/handoff/route');
    expect((await POST()).status).toBe(404);
  });

  it('replay: refuses without the secret', async () => {
    setLive();
    process.env.CRON_SECRET = 'a-long-enough-cron-secret';
    const { GET } = await import('@/app/api/intake/replay/route');
    expect((await GET(new Request('http://localhost/api/intake/replay'))).status).toBe(404);
    expect((await GET(new Request('http://localhost/api/intake/replay', { headers: { authorization: 'Bearer a-long-enough-cron-secret' } }))).status).toBe(503);
  });
});
