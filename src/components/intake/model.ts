'use client';

/**
 * The intake's carried object on the device, and where each part is kept.
 *
 *   URL              non-personal: segment, bill, period, step, door (open.ts)
 *   sessionStorage   this tab only: everything typed, the chosen time, the outcome
 *   localStorage     14 days, non-personal: segment, bill, period, package (the
 *                    "pick up where you left off" line), and the booked date
 *                    and time only (no name, no token), ux-spec 2.4 and 5.3.
 */
import type { BillReadResult, QuoteRequestItem, Segment, Slot, SubmitResponse } from '@/lib/intake/contract';
import type { IntakeOpenOptions, IntakeStep } from '@/lib/intake/open';
import { EMPTY_CALL, type CallDetails } from './CallAsk';

export type Step = IntakeStep;

export interface Details {
  eircode: string;
  address: string;
  county: string;
  businessName: string;
  name: string;
  mobile: string;
  email: string;
  manual: boolean;
}

export interface Draft {
  v: 1;
  flowId: string;
  segment: Segment | null;
  /** 'assumed': a door that did not know, opened as a home with the switch on screen (APPLE-DECISIONS 1). */
  segmentProv: 'from_page' | 'you_told_us' | 'assumed' | null;
  billText: string;
  per: 'month' | '2months';
  bill: number | null;
  billMethod: 'typed' | 'chip' | 'photo' | null;
  skipped: boolean;
  annualKwh: number | null;
  supplier: string | null;
  billRead: BillReadResult | null;
  slot: Slot | null;
  holdToken: string | null;
  requestedDay: { date: string; part: 'morning' | 'afternoon' } | null;
  details: Details;
  /** The call funnel: the ask's fields (name, mobile, email, best time). */
  call: CallDetails;
  /** What the Bill Analyser read and handed over (never in a URL). */
  carry: { from: string; supplier: string | null; eircode: string | null; mprn: string | null; address: string | null } | null;
  idemKey: string | null;
  result: SubmitResponse | null;
  /** The call went with a priced bill, so an estimate email is coming (absent means yes, as before). */
  callEstimate?: boolean;
  resultSlot: Slot | null;
  emailSentTo: string | null;
  door: string;
  src: string | null;
  pkg: string | null;
  countyContext: string | null;
}

export const EMPTY_DETAILS: Details = {
  eircode: '',
  address: '',
  county: '',
  businessName: '',
  name: '',
  mobile: '',
  email: '',
  manual: false,
};

export function newFlowId(): string {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

export function freshDraft(o?: Partial<IntakeOpenOptions>): Draft {
  return {
    v: 1,
    flowId: newFlowId(),
    segment: null,
    segmentProv: null,
    billText: '',
    per: 'month',
    bill: null,
    billMethod: null,
    skipped: false,
    annualKwh: null,
    supplier: null,
    billRead: null,
    slot: null,
    holdToken: null,
    requestedDay: null,
    details: { ...EMPTY_DETAILS },
    call: { ...EMPTY_CALL },
    carry: null,
    idemKey: null,
    result: null,
    resultSlot: null,
    emailSentTo: null,
    door: o?.door || 'direct',
    src: o?.src ?? null,
    pkg: o?.pkg ?? null,
    countyContext: o?.county ?? null,
  };
}

export const segFromDoor = (s: 'home' | 'business' | null | undefined): Segment | null =>
  s === 'home' ? 'domestic' : s === 'business' ? 'commercial' : null;
export const doorFromSeg = (s: Segment | null): 'home' | 'business' | null =>
  s === 'domestic' ? 'home' : s === 'commercial' ? 'business' : null;

/** The bill as a monthly figure (the "every 2 months" switch halves it). */
export function monthlyBill(d: Pick<Draft, 'bill' | 'per'>): number | null {
  if (d.bill == null) return null;
  return d.per === '2months' ? d.bill / 2 : d.bill;
}

export function quoteItemOf(d: Draft): QuoteRequestItem | null {
  if (!d.segment) return null;
  if (d.bill == null && d.annualKwh == null) return null;
  const br = d.billRead;
  return {
    segment: d.segment,
    bill: d.bill != null ? { amountEur: d.bill, period: d.per === '2months' ? 'two_months' : 'month' } : null,
    annualKwh: d.annualKwh,
    supplier: d.segment === 'domestic' ? d.supplier : null,
    homeType: 'unknown',
    billRead: br
      ? {
          unitRateEur: br.unitRateEur ?? undefined,
          standingChargeAnnualEur: br.standingChargeAnnualEur ?? undefined,
          dayKwh: br.dayKwh ?? undefined,
          nightKwh: br.nightKwh ?? undefined,
        }
      : null,
  };
}

/** The earliest screen that has what a step needs (ux-spec 2.4). */
export function validStep(s: Step | null, d: Draft): Step {
  if (s === 'done') return d.result ? 'done' : validStep('details', d);
  // The call funnel: the ask needs only the segment (no slot, no bill).
  if (s === 'details') return d.segment ? 'details' : 'bill';
  // No separate home-or-business screen (APPLE-DECISIONS 1): every door opens
  // on Screen 1 or 2, with the switch on Screen 1.
  if (s === 'time') return d.segment ? 'time' : 'bill';
  return 'bill';
}

/* ------------------------------------------------------------------ */
/*  Storage                                                            */
/* ------------------------------------------------------------------ */

const SESSION_KEY = 'si-intake-v1';
const DRAFT_KEY = 'si-intake-draft-v1';
const BOOKED_KEY = 'si-intake-booked-v1';
const DAY = 86400000;

export function loadSession(): Draft | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    return d && d.v === 1 ? { ...freshDraft(), ...d, details: { ...EMPTY_DETAILS, ...d.details }, call: { ...EMPTY_CALL, ...(d.call || {}) } } : null;
  } catch {
    return null;
  }
}

export function saveSession(d: Draft) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(d));
  } catch {
    /* private mode: the flow still works, it just will not survive a refresh */
  }
}

export interface DeviceDraft {
  segment: Segment;
  bill: number;
  per: 'month' | '2months';
  pkg: string | null;
  at: number;
}

export function loadDeviceDraft(): DeviceDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as DeviceDraft;
    if (!d || Date.now() - d.at > 14 * DAY || !d.bill || !d.segment) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return d;
  } catch {
    return null;
  }
}

export function saveDeviceDraft(d: Draft) {
  try {
    if (!d.segment || d.bill == null) return;
    const dd: DeviceDraft = { segment: d.segment, bill: d.bill, per: d.per, pkg: d.pkg, at: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(dd));
  } catch {
    /* ignore */
  }
}

export function clearDeviceDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export interface DeviceBooking {
  startsAt: string;
  endsAt: string;
  at: number;
}

export function loadDeviceBooking(): DeviceBooking | null {
  try {
    const raw = localStorage.getItem(BOOKED_KEY);
    if (!raw) return null;
    const b = JSON.parse(raw) as DeviceBooking;
    if (!b?.startsAt || new Date(b.endsAt).getTime() < Date.now()) {
      localStorage.removeItem(BOOKED_KEY);
      return null;
    }
    return b;
  } catch {
    return null;
  }
}

export function saveDeviceBooking(slot: { startsAt: string; endsAt: string }) {
  try {
    localStorage.setItem(BOOKED_KEY, JSON.stringify({ startsAt: slot.startsAt, endsAt: slot.endsAt, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Packages from the services page (ux-spec 5.4)                      */
/* ------------------------------------------------------------------ */

export const PACKAGES: Record<string, { name: string; kwp: number }> = {
  essential: { name: 'Essential', kwp: 4 },
  popular: { name: 'Popular', kwp: 6 },
  premium: { name: 'Premium', kwp: 8 },
};
