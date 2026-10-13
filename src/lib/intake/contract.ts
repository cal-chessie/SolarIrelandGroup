/**
 * Intake OS: the contract between the website intake and AISolar.
 *
 * These shapes mirror INTAKE/design/backend-spec.md exactly:
 *   section 1.5  intake-quote        -> POST /api/intake/quote
 *   section 2.4  intake-config       -> GET  /api/intake/config
 *   section 3.4  survey-availability -> POST /api/intake/slots
 *   section 3.5  hold_survey_slot    -> POST /api/intake/hold
 *   section 4.2  ingest-lead v2      -> POST /api/intake/submit
 *
 * The site's routes are thin server proxies. Today they run in STUB mode only
 * (see ./mode.ts); slices 1 and 2 swap the stub for AISolar behind the same
 * routes, so the UI never changes. Anything the site adds on top of AISolar's
 * shape is marked SITE below.
 *
 * Nothing in this file is personal data except the submit body, which never
 * goes into a URL, a log or local storage.
 */

export type Segment = 'domestic' | 'commercial';

/** Where a value came from (ux-spec 5.2). Rendered as a tag beside the value. */
export type Provenance =
  | 'you_told_us'
  | 'from_your_bill'
  | 'from_your_eircode'
  | 'from_page'
  | 'assumed';

export type BillPeriod = 'month' | 'two_months';

export type HomeType = 'apartment' | 'terrace' | 'semi' | 'detached' | 'bungalow' | 'other' | 'unknown';

/* ------------------------------------------------------------------ */
/*  intake-config (backend 2.4): copy values, never prices             */
/* ------------------------------------------------------------------ */

export interface IntakeConfig {
  rulesVersion: string;
  settingsUpdatedAt: string;
  estimate: {
    minKwp: number;
    maxKwp: number;
    horizonYears: number;
    exportRateEur: number;
    unitRateDefaultEur: number;
    /** The Settings supplier table, for the "Who's your supplier?" chips. */
    suppliers: { name: string; unitRateEur: number }[];
    /**
     * SITE (DECISIONS 2, "No-bill fact strip"): the smallest home system and its
     * price after the grant, from the Settings price curve. A true price, not a
     * saving. Slice 1 must add this to intake-config.
     */
    minSystem: { kwp: number; grossCostEur: number; grantEur: number; netCostEur: number } | null;
    business: {
      /** DECISIONS 2: no business price on the intake. */
      showPrice: boolean;
      showHorizon: boolean;
    };
  };
  bill: {
    /** ux-spec 3.1: six amounts per segment, euro a month. The last is "or more". */
    chips: { domestic: number[]; commercial: number[] };
    /** Capability check: the photo row only shows when the reader is usable. */
    readerEnabled: boolean;
  };
  survey: {
    timezone: string;
    /** DECISIONS 3: one canon, read from Settings everywhere. */
    visitMinutes: number;
    businessVisitMinutes: number;
    arrivalWindowMinutes: number;
    /** Start times per day kind, 24h "HH:MM", in the tenant time zone. */
    startTimes: { weekday: string[]; saturday: string[]; sunday: string[] };
    maxDaysAhead: number;
    minNoticeHours: number;
    holdMinutes: number;
    /** Days with no surveys (Irish public holidays, editable), so "request a day" never offers one. */
    closedDates: string[];
    /** The name homeowners see for who will survey and call ("Cal"). Null hides it. */
    homeownerFacingName: string | null;
    /** DECISIONS 5: the welcome-call line. Null turns the line off. */
    welcomeCallName: string | null;
  };
  portalOrigin: string;
}

/* ------------------------------------------------------------------ */
/*  intake-quote (backend 1.5)                                         */
/* ------------------------------------------------------------------ */

export interface BillRead {
  unitRateEur?: number;
  standingChargeAnnualEur?: number;
  dayKwh?: number;
  nightKwh?: number;
}

export interface QuoteRequestItem {
  segment: Segment;
  bill: { amountEur: number; period: BillPeriod } | null;
  annualKwh: number | null;
  supplier: string | null;
  homeType: HomeType;
  billRead: BillRead | null;
}

export interface QuoteRequest {
  requests: QuoteRequestItem[];
}

export interface QuoteOption {
  kwp: number;
  annualSavingEur: number;
  grossCostEur: number | null;
  paybackYears: number | null;
}

export interface QuoteFigures {
  kwp: number;
  panels: number;
  annualKwh: number;
  annualSavingEur: number;
  selfUseSavingEur: number;
  exportIncomeEur: number;
  /** Null when the price is left to the proposal (business, DECISIONS 2). */
  grossCostEur: number | null;
  grantEur: number;
  grantScheme: 'SEAI' | 'NDMG';
  netCostEur: number | null;
  vatRate: number;
  vatEur: number | null;
  paybackYears: number | null;
  horizonYears: number;
  horizonSavingsEur: number | null;
  horizonNetEur: number | null;
  selfUsePct: number;
  unitRateEur: number;
  exportRateEur: number;
  annualBillEur: number;
  annualBillAfterSolarEur: number;
  billReductionPct: number;
  monthlySavingsEur: number;
  co2PerYearKg: number;
  treesEquivalent: number;
  monthlyGeneration: number[];
  options: QuoteOption[];
  indicative: boolean;
  priceBasis: 'estimate' | 'proposal';
  sizedAtMinimum: boolean;
}

export interface QuoteAssumption {
  field: 'bill' | 'annualKwh' | 'unitRate' | 'exportRate' | 'daytimeShare' | 'minKwp';
  value: number | string;
  provenance: 'assumed' | 'you_told_us' | 'from_your_bill';
}

export interface Quote {
  hasBasis: boolean;
  figures: QuoteFigures | null;
  assumptions: QuoteAssumption[];
  quoteToken: string | null;
  expiresAt: string | null;
}

export interface QuoteResponse {
  rulesVersion: string;
  rulesHash: string;
  settingsUpdatedAt: string;
  quotes: Quote[];
}

/* ------------------------------------------------------------------ */
/*  survey-availability (backend 3.4)                                  */
/* ------------------------------------------------------------------ */

export interface SlotsRequest {
  /** YYYY-MM-DD in the tenant time zone. */
  from: string;
  days: number;
  segment: Segment;
}

export interface Slot {
  startsAt: string;
  endsAt: string;
  /** DECISIONS 3: 12-hour, lowercase, "9am", "11:30am", "2pm". */
  label: string;
}

export interface SlotDay {
  date: string;
  label: string;
  slots: Slot[];
}

export interface SlotsResponse {
  timezone: string;
  visitMinutes: number;
  settingsUpdatedAt: string;
  days: SlotDay[];
}

/* ------------------------------------------------------------------ */
/*  hold_survey_slot (backend 3.5), as the site's route                */
/* ------------------------------------------------------------------ */

export interface HoldRequest {
  action: 'hold' | 'release';
  startsAt: string;
  segment: Segment;
  holdToken?: string | null;
}

export type HoldResponse =
  | { ok: true; holdToken: string; startsAt: string; expiresAt: string }
  | { ok: true; released: true }
  | { ok: false; outcome: 'slot_unavailable'; alternatives: Slot[] };

/* ------------------------------------------------------------------ */
/*  ingest-lead v2 (backend 4.2), as the site's submit route           */
/* ------------------------------------------------------------------ */

export type BookingOutcome =
  | 'booked'
  | 'moved'
  | 'slot_unavailable'
  | 'invalid_slot'
  | 'already_booked'
  | 'requested'
  | 'none';

export interface SubmitRequest {
  source: 'website_survey' | 'website_qualified';
  name: string | null;
  email: string;
  phone: string | null;
  eircode: string | null;
  county: string | null;
  address: string | null;
  monthlyBill: number | null;
  annualKwh: number | null;
  quoteToken: string | null;
  slot: { startsAt: string; holdToken: string | null } | null;
  requestedDay: { date: string; part: 'morning' | 'afternoon' } | null;
  emailEstimate: boolean;
  /**
   * SITE: what to do when this device already holds a booking. "ask" returns
   * already_booked with the existing time; "move" moves it (ux-spec 8).
   */
  onExisting?: 'ask' | 'move';
  meta: {
    segment: Segment;
    /** Never `company` or `website_url`: those names are honeypots (contract.md H1). */
    businessName: string | null;
    door: string;
    page: string;
    src: string | null;
    pkg: string | null;
    countyContext: string | null;
    billPeriod: BillPeriod | null;
    supplier: string | null;
    flowId: string;
  };
}

export interface SubmitResponse {
  ok: boolean;
  leadId: string | null;
  /** SITE adds "outbox": AISolar did not accept it, the site holds it and replays. */
  path: 'fresh' | 'threaded' | 'deduped' | 'outbox';
  booking: {
    outcome: BookingOutcome;
    startsAt?: string;
    endsAt?: string;
    surveyorFirstName?: string | null;
    alternatives?: Slot[];
    /** SITE: the time this device already holds, on already_booked. */
    existing?: { startsAt: string; endsAt: string } | null;
  };
  estimate: { quoteVersion: number; figures: QuoteFigures } | null;
  handoff: { code: string; expiresAt: string; portalUrl: string } | null;
  /**
   * AISolar returns the booking token for the site's HttpOnly device cookie
   * (backend 4.6). The site's route sets the cookie and always sends null to
   * the browser, so the token never reaches page script.
   */
  deviceToken: string | null;
  next: 'portal' | 'check_email' | 'pick_another_time';
  /** SITE: true when the lead is held in the site's outbox (not booked). */
  fallback?: boolean;
}

export interface IntakeError {
  ok: false;
  error: 'intake_unavailable' | 'invalid' | 'rate_limited' | 'pii_not_allowed' | 'server_error';
  fields?: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  Bill read (SITE, stands in for analyse-bill v2, backend 1.8)       */
/* ------------------------------------------------------------------ */

export interface BillReadResult {
  amountEur: number | null;
  period: BillPeriod | null;
  supplier: string | null;
  annualKwh: number | null;
  unitRateEur: number | null;
  standingChargeAnnualEur: number | null;
  dayKwh: number | null;
  nightKwh: number | null;
}

export type BillReadResponse =
  | { ok: true; read: BillReadResult }
  | { ok: false; reason: 'unreadable' | 'unavailable' | 'too_large' | 'wrong_type' };

/* ------------------------------------------------------------------ */
/*  Eircode lookup                                                     */
/* ------------------------------------------------------------------ */

export type EircodeResponse =
  | { ok: true; address: string; county?: string }
  | { ok: false; reason?: 'invalid' | 'unavailable' | 'rate_limited' | 'error' | 'not_found' };
