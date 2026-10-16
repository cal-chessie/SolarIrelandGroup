/**
 * Live mode: AISolar's answers turned into the site's contract (contract.ts)
 * and the UI's existing honest states. Pure, no IO, so every mapping is unit
 * tested against shapes recorded from V5 (src/__tests__/intake-live.test.ts).
 *
 * The rules:
 *   - AISolar's maths has authority. Figures pass through untouched; nothing
 *     here computes, rounds or fills a number.
 *   - Never invent a booking. "booked" or "moved" reaches the screen only with
 *     the claimed time AISolar returned; anything less is a request.
 *   - Anything malformed is treated as "no answer", never guessed at.
 *   - The device token (AISolar's booking token) is lifted out for the site's
 *     HttpOnly cookie and the browser always gets null.
 */
import type {
  BookingOutcome,
  HoldResponse,
  IntakeConfig,
  IntakeError,
  Quote,
  QuoteResponse,
  Slot,
  SlotDay,
  SlotsResponse,
  SubmitResponse,
} from '@/lib/intake/contract';
import type { CallResult } from './client';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isIso = (v: unknown): v is string => isStr(v) && !Number.isNaN(Date.parse(v));
const HEX64 = /^[a-f0-9]{64}$/;

export interface Adapted<T> {
  status: number;
  body: T | IntakeError;
  /** Why it was not a clean answer, for the server log (never personal data). */
  note?: string;
}

const unavailable = (note: string): Adapted<never> => ({ status: 503, body: { ok: false, error: 'intake_unavailable' }, note });
const serverError = (note: string): Adapted<never> => ({ status: 503, body: { ok: false, error: 'server_error' }, note });
const rateLimited: Adapted<never> = { status: 429, body: { ok: false, error: 'rate_limited' } };

function why(r: CallResult): string {
  if (r.failure) return `aisolar_${r.failure}`;
  const reason = isObj(r.data) && isStr(r.data.reason) ? r.data.reason : isObj(r.data) && isStr(r.data.error) ? r.data.error : 'no_reason';
  return `aisolar_${r.status}_${reason}`.slice(0, 80);
}

/* ------------------------------------------------------------------ */
/*  intake-config                                                      */
/* ------------------------------------------------------------------ */

const numList = (v: unknown): v is number[] => Array.isArray(v) && v.every(isNum);
const strList = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);

export function adaptConfig(r: CallResult): Adapted<IntakeConfig> {
  if (r.status === 429) return rateLimited;
  if (r.status !== 200 || !isObj(r.data)) return unavailable(why(r));
  const d = r.data;
  const e = d.estimate as Obj | undefined;
  const b = d.bill as Obj | undefined;
  const s = d.survey as Obj | undefined;
  const ok =
    isStr(d.rulesVersion) && isStr(d.settingsUpdatedAt) && isStr(d.portalOrigin) && /^https:\/\//.test(d.portalOrigin) &&
    isObj(e) && isNum(e.minKwp) && isNum(e.maxKwp) && isNum(e.horizonYears) && isNum(e.exportRateEur) && isNum(e.unitRateDefaultEur) &&
    Array.isArray(e.suppliers) && e.suppliers.every((x) => isObj(x) && isStr(x.name) && isNum(x.unitRateEur)) &&
    (e.minSystem === null || (isObj(e.minSystem) && isNum(e.minSystem.kwp) && isNum(e.minSystem.netCostEur) && isNum(e.minSystem.grantEur) && isNum(e.minSystem.grossCostEur))) &&
    isObj(e.business) && typeof e.business.showPrice === 'boolean' && typeof e.business.showHorizon === 'boolean' &&
    isObj(b) && isObj(b.chips) && numList(b.chips.domestic) && numList(b.chips.commercial) && typeof b.readerEnabled === 'boolean' &&
    isObj(s) && isStr(s.timezone) && isNum(s.visitMinutes) && isNum(s.businessVisitMinutes) && isNum(s.arrivalWindowMinutes) &&
    isObj(s.startTimes) && strList(s.startTimes.weekday) && strList(s.startTimes.saturday) && strList(s.startTimes.sunday) &&
    isNum(s.maxDaysAhead) && isNum(s.minNoticeHours) && isNum(s.holdMinutes) && strList(s.closedDates) &&
    (s.homeownerFacingName === null || isStr(s.homeownerFacingName)) && (s.welcomeCallName === null || isStr(s.welcomeCallName));
  if (!ok) return unavailable('aisolar_config_shape');
  const E = e as Obj & { suppliers: { name: string; unitRateEur: number }[]; business: { showPrice: boolean; showHorizon: boolean }; minSystem: IntakeConfig['estimate']['minSystem'] };
  const B = b as Obj & { chips: { domestic: number[]; commercial: number[] }; readerEnabled: boolean };
  const S = s as Obj & { startTimes: { weekday: string[]; saturday: string[]; sunday: string[] }; closedDates: string[] };
  const config: IntakeConfig = {
    rulesVersion: d.rulesVersion as string,
    settingsUpdatedAt: d.settingsUpdatedAt as string,
    estimate: {
      minKwp: E.minKwp as number,
      maxKwp: E.maxKwp as number,
      horizonYears: E.horizonYears as number,
      exportRateEur: E.exportRateEur as number,
      unitRateDefaultEur: E.unitRateDefaultEur as number,
      suppliers: E.suppliers.map((x) => ({ name: x.name, unitRateEur: x.unitRateEur })),
      minSystem: E.minSystem ? { kwp: E.minSystem.kwp, grossCostEur: E.minSystem.grossCostEur, grantEur: E.minSystem.grantEur, netCostEur: E.minSystem.netCostEur } : null,
      business: { showPrice: E.business.showPrice, showHorizon: E.business.showHorizon },
    },
    bill: { chips: { domestic: [...B.chips.domestic], commercial: [...B.chips.commercial] }, readerEnabled: B.readerEnabled },
    survey: {
      timezone: S.timezone as string,
      visitMinutes: S.visitMinutes as number,
      businessVisitMinutes: S.businessVisitMinutes as number,
      arrivalWindowMinutes: S.arrivalWindowMinutes as number,
      startTimes: { weekday: [...S.startTimes.weekday], saturday: [...S.startTimes.saturday], sunday: [...S.startTimes.sunday] },
      maxDaysAhead: S.maxDaysAhead as number,
      minNoticeHours: S.minNoticeHours as number,
      holdMinutes: S.holdMinutes as number,
      closedDates: [...S.closedDates],
      homeownerFacingName: (S.homeownerFacingName as string | null) ?? null,
      welcomeCallName: (S.welcomeCallName as string | null) ?? null,
    },
    portalOrigin: d.portalOrigin as string,
  };
  return { status: 200, body: config };
}

/* ------------------------------------------------------------------ */
/*  intake-quote                                                       */
/* ------------------------------------------------------------------ */

function pickQuote(q: unknown): Quote | null {
  if (!isObj(q) || typeof q.hasBasis !== 'boolean' || !Array.isArray(q.assumptions)) return null;
  if (q.hasBasis && !isObj(q.figures)) return null;
  const f = q.figures as Obj | null;
  if (f && !(isNum(f.kwp) && isNum(f.annualSavingEur) && isNum(f.grantEur) && Array.isArray(f.options) && Array.isArray(f.monthlyGeneration))) return null;
  return {
    hasBasis: q.hasBasis,
    figures: q.hasBasis ? (f as unknown as Quote['figures']) : null,
    assumptions: q.assumptions as Quote['assumptions'],
    quoteToken: isStr(q.quoteToken) && q.quoteToken.length > 0 ? q.quoteToken : null,
    expiresAt: isIso(q.expiresAt) ? q.expiresAt : null,
  };
}

export function adaptQuote(r: CallResult, asked: number): Adapted<QuoteResponse> {
  if (r.status === 429) return rateLimited;
  if (r.status === 400) {
    const pii = isObj(r.data) && r.data.error === 'pii_not_allowed';
    return { status: 400, body: { ok: false, error: pii ? 'pii_not_allowed' : 'invalid' }, note: why(r) };
  }
  if (r.status !== 200 || !isObj(r.data) || !Array.isArray(r.data.quotes)) return serverError(why(r));
  const d = r.data;
  const quotes = (d.quotes as unknown[]).map(pickQuote);
  if (quotes.length !== asked || quotes.some((q) => q === null) || !isStr(d.rulesVersion)) return serverError('aisolar_quote_shape');
  return {
    status: 200,
    body: {
      rulesVersion: d.rulesVersion as string,
      rulesHash: isStr(d.rulesHash) ? d.rulesHash : '',
      settingsUpdatedAt: isStr(d.settingsUpdatedAt) ? d.settingsUpdatedAt : '',
      quotes: quotes as Quote[],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  survey-availability and the hold                                   */
/* ------------------------------------------------------------------ */

function pickSlot(v: unknown): Slot | null {
  if (!isObj(v) || !isIso(v.startsAt) || !isIso(v.endsAt) || !isStr(v.label)) return null;
  return { startsAt: v.startsAt, endsAt: v.endsAt, label: v.label };
}

function pickSlots(v: unknown): Slot[] {
  return Array.isArray(v) ? (v.map(pickSlot).filter(Boolean) as Slot[]) : [];
}

export function adaptSlots(r: CallResult): Adapted<SlotsResponse> {
  if (r.status === 429) return rateLimited;
  if (r.status !== 200 || !isObj(r.data) || !Array.isArray(r.data.days)) return serverError(why(r));
  const d = r.data;
  const days: SlotDay[] = [];
  for (const day of d.days as unknown[]) {
    if (!isObj(day) || !isStr(day.date) || !/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !isStr(day.label)) return serverError('aisolar_slots_shape');
    const slots = pickSlots(day.slots);
    if (slots.length) days.push({ date: day.date, label: day.label, slots });
  }
  return {
    status: 200,
    body: {
      timezone: isStr(d.timezone) ? d.timezone : 'Europe/Dublin',
      visitMinutes: isNum(d.visitMinutes) ? d.visitMinutes : 0,
      settingsUpdatedAt: isStr(d.settingsUpdatedAt) ? d.settingsUpdatedAt : '',
      days,
    },
  };
}

export function adaptHold(r: CallResult): Adapted<HoldResponse> {
  if (r.status === 429) return rateLimited;
  if (r.status !== 200 || !isObj(r.data)) return serverError(why(r));
  const d = r.data;
  if (d.ok === true && d.released === true) return { status: 200, body: { ok: true, released: true } };
  if (d.ok === true && isStr(d.holdToken) && HEX64.test(d.holdToken) && isIso(d.startsAt) && isIso(d.expiresAt)) {
    return { status: 200, body: { ok: true, holdToken: d.holdToken, startsAt: d.startsAt, expiresAt: d.expiresAt } };
  }
  if (d.ok === false && d.outcome === 'slot_unavailable') {
    return { status: 200, body: { ok: false, outcome: 'slot_unavailable', alternatives: pickSlots(d.alternatives) } };
  }
  return serverError('aisolar_hold_shape');
}

/* ------------------------------------------------------------------ */
/*  ingest-lead v2                                                     */
/* ------------------------------------------------------------------ */

const OUTCOMES = new Set<BookingOutcome>(['booked', 'moved', 'slot_unavailable', 'invalid_slot', 'already_booked', 'requested', 'none']);
const PATHS = new Set(['fresh', 'threaded', 'deduped']);
const NEXTS = new Set(['portal', 'check_email', 'pick_another_time']);
const CODE = /^[A-Za-z0-9_-]{43}$/;

export type SubmitAdapted =
  /** AISolar answered: show it. deviceToken is for the HttpOnly cookie only. */
  | { kind: 'answer'; body: SubmitResponse; deviceToken: string | null; legacy: boolean }
  /** AISolar refused the request itself (400): the form shows its failure state; replaying cannot help. */
  | { kind: 'invalid'; status: 400; body: IntakeError; note: string }
  /** No usable answer: retry with the same idempotency key, then the outbox. */
  | { kind: 'retry'; rateLimited: boolean; note: string };

export interface SubmitContext {
  /** The homeowner asked for a time (a slot or a requested day). */
  asked: boolean;
  /** Portal origins a hand-off form may post to (CSP form-action keeps the same list). */
  portalOrigins: string[];
}

export function adaptSubmit(r: CallResult, ctx: SubmitContext): SubmitAdapted {
  if (r.status === 400 && isObj(r.data)) {
    const fields = isObj(r.data.fields) ? (r.data.fields as Record<string, string>) : undefined;
    return { kind: 'invalid', status: 400, body: { ok: false, error: 'invalid', ...(fields ? { fields } : {}) }, note: why(r) };
  }
  if (r.status !== 200 || !isObj(r.data) || r.data.ok !== true) return { kind: 'retry', rateLimited: r.status === 429, note: why(r) };
  const d = r.data;

  // ingest-lead's old path (the tenant's intakeV2 is off and this is not the
  // test door, or a rollback): the lead IS captured, but nothing was booked or
  // priced in this request. Say exactly that: a request, confirmed by email.
  if (!('path' in d)) {
    if (!(d.leadId === null || isStr(d.leadId))) return { kind: 'retry', rateLimited: false, note: 'aisolar_legacy_shape' };
    return {
      kind: 'answer',
      legacy: true,
      deviceToken: null,
      body: {
        ok: true,
        leadId: (d.leadId as string | null) ?? null,
        path: 'fresh',
        booking: { outcome: ctx.asked ? 'requested' : 'none' },
        estimate: null,
        handoff: null,
        deviceToken: null,
        next: 'check_email',
      },
    };
  }

  const booking = d.booking as Obj | undefined;
  if (!PATHS.has(d.path as string) || !isObj(booking) || !OUTCOMES.has(booking.outcome as BookingOutcome) || !NEXTS.has(d.next as string) || !(d.leadId === null || isStr(d.leadId))) {
    return { kind: 'retry', rateLimited: false, note: 'aisolar_submit_shape' };
  }

  let outcome = booking.outcome as BookingOutcome;
  const out: SubmitResponse['booking'] = { outcome };
  if (outcome === 'booked' || outcome === 'moved') {
    if (isIso(booking.startsAt) && isIso(booking.endsAt)) {
      out.startsAt = booking.startsAt;
      out.endsAt = booking.endsAt;
    } else {
      // A booking with no time is not a booking the site can show.
      outcome = 'requested';
      out.outcome = outcome;
    }
  }
  if (booking.surveyorFirstName === null || isStr(booking.surveyorFirstName)) out.surveyorFirstName = booking.surveyorFirstName as string | null;
  if (outcome === 'slot_unavailable' || outcome === 'invalid_slot') out.alternatives = pickSlots(booking.alternatives);
  if (outcome === 'already_booked') {
    const ex = booking.existing;
    out.existing = isObj(ex) && isIso(ex.startsAt) && isIso(ex.endsAt) ? { startsAt: ex.startsAt, endsAt: ex.endsAt } : null;
  }

  const est = d.estimate;
  const estimate = isObj(est) && isNum(est.quoteVersion) && isObj(est.figures) ? { quoteVersion: est.quoteVersion, figures: est.figures as unknown as NonNullable<SubmitResponse['estimate']>['figures'] } : null;

  let handoff: SubmitResponse['handoff'] = null;
  const h = d.handoff;
  if (isObj(h) && isStr(h.code) && CODE.test(h.code) && isIso(h.expiresAt) && isStr(h.portalUrl)) {
    const okUrl = ctx.portalOrigins.some((o) => h.portalUrl === `${o}/h`);
    if (okUrl) handoff = { code: h.code, expiresAt: h.expiresAt, portalUrl: h.portalUrl as string };
  }

  let next = d.next as SubmitResponse['next'];
  if (next === 'portal' && !handoff) next = 'check_email';

  return {
    kind: 'answer',
    legacy: false,
    deviceToken: isStr(d.deviceToken) && HEX64.test(d.deviceToken) ? d.deviceToken : null,
    body: {
      ok: true,
      leadId: (d.leadId as string | null) ?? null,
      path: d.path as SubmitResponse['path'],
      booking: out,
      estimate,
      handoff,
      deviceToken: null,
      next,
    },
  };
}

/** The answer when the lead is held on the site (outbox): saved, not booked, nothing claimed. */
export function outboxAnswer(): SubmitResponse {
  return { ok: true, leadId: null, path: 'outbox', booking: { outcome: 'none' }, estimate: null, handoff: null, deviceToken: null, next: 'check_email', fallback: true };
}
