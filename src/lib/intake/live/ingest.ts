/**
 * Live mode: the body the site sends to AISolar's ingest-lead v2
 * (backend-spec 4.2, AISolar ingest-lead/v2.ts readSubmit).
 *
 * Built field by field from the site's already validated SubmitRequest, never
 * passed through raw, so nothing a browser adds can ride into the platform.
 * The device token (the booking token AISolar minted for this browser, held in
 * the site's HttpOnly cookie) goes as `leadToken`, which threads a returning
 * homeowner onto their own lead.
 */
import type { SubmitRequest } from '@/lib/intake/contract';

export interface IngestBody {
  brand: 'solar-ireland';
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
  onExisting: 'ask' | 'move';
  leadToken?: string;
  meta: {
    segment: 'domestic' | 'commercial';
    businessName: string | null;
    door: string | null;
    page: string | null;
    src: string | null;
    pkg: string | null;
    countyContext: string | null;
    billPeriod: string | null;
    supplier: string | null;
    flowId: string | null;
    /**
     * The picked time again, in the shape ingest-lead's old path reads. The v2
     * path ignores it; if a submit ever lands on the old path (intakeV2 off, or
     * a rollback), the scheduler can still book the homeowner's own pick.
     */
    surveySlotISO?: string;
  };
}

const s = (v: unknown, max: number): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const n = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
const HEX64 = /^[a-f0-9]{64}$/;

export function toIngestBody(b: SubmitRequest, deviceToken: string | null): IngestBody {
  const slotIso = b.slot && typeof b.slot.startsAt === 'string' && !Number.isNaN(Date.parse(b.slot.startsAt)) ? new Date(b.slot.startsAt).toISOString() : null;
  const holdToken = b.slot && typeof b.slot.holdToken === 'string' && HEX64.test(b.slot.holdToken) ? b.slot.holdToken : null;
  const m = b.meta;
  const kwh = n(b.annualKwh);
  const body: IngestBody = {
    brand: 'solar-ireland',
    source: b.source === 'website_qualified' ? 'website_qualified' : 'website_survey',
    name: s(b.name, 200),
    email: String(b.email).trim().toLowerCase().slice(0, 254),
    phone: s(b.phone, 40),
    eircode: s(b.eircode, 12),
    county: s(b.county, 60),
    address: s(b.address, 300),
    monthlyBill: n(b.monthlyBill),
    annualKwh: kwh !== null ? Math.round(kwh) : null,
    quoteToken: typeof b.quoteToken === 'string' && b.quoteToken.length > 0 && b.quoteToken.length < 8000 ? b.quoteToken : null,
    slot: slotIso ? { startsAt: slotIso, holdToken } : null,
    requestedDay: !slotIso && b.requestedDay ? { date: b.requestedDay.date, part: b.requestedDay.part } : null,
    emailEstimate: b.emailEstimate === true,
    onExisting: b.onExisting === 'move' ? 'move' : 'ask',
    meta: {
      segment: m.segment === 'commercial' ? 'commercial' : 'domestic',
      businessName: m.segment === 'commercial' ? s(m.businessName, 200) : null,
      door: s(m.door, 200),
      page: s(m.page, 200),
      src: s(m.src, 200),
      pkg: s(m.pkg, 200),
      countyContext: s(m.countyContext, 200),
      billPeriod: s(m.billPeriod, 20),
      supplier: s(m.supplier, 60),
      flowId: s(m.flowId, 200),
      ...(slotIso ? { surveySlotISO: slotIso } : {}),
    },
  };
  if (deviceToken && HEX64.test(deviceToken)) body.leadToken = deviceToken;
  return body;
}
