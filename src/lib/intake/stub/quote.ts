/**
 * STUB ONLY. The intake-quote contract (backend-spec 1.5) answered by the
 * site's own engine, src/lib/estimate.ts, parameterised by the Settings
 * object in ./settings.ts with Cal's 13 Oct answers applied:
 *
 *   home 4 to 8 kWp, export 18c, the annual saving INCLUDES export (and both
 *   parts are returned), the 25-year view, unit rate per supplier else 35c,
 *   no business price (DECISIONS 2).
 *
 * estimate.ts is not edited: it is called with explicit inputs. This file
 * does no saving or price maths of its own; it only picks the inputs and
 * reshapes the engine's result into the contract.
 */
import { createHash, createHmac } from 'node:crypto';
import {
  commercialEstimate,
  commercialUsageFromMonthlyBill,
  estimate,
  installCostEur,
  seaiGrant,
  sizeSystemKwp,
  systemOptions,
  usageFromMonthlyBill,
} from '@/lib/estimate';
import type {
  IntakeConfig,
  Quote,
  QuoteAssumption,
  QuoteFigures,
  QuoteRequestItem,
  QuoteResponse,
} from '@/lib/intake/contract';
import { STUB_SETTINGS } from './settings';

const S = STUB_SETTINGS;
const STUB_SECRET = 'intake-stub-signing-key-not-a-secret';

export function rulesHash(): string {
  return createHash('sha256').update(JSON.stringify({ estimate: S.estimate, survey: S.survey })).digest('hex');
}

export function stubConfig(): IntakeConfig {
  const min = S.estimate.minKwp;
  const gross = installCostEur(min);
  const grant = seaiGrant(min);
  return {
    rulesVersion: S.rulesVersion,
    settingsUpdatedAt: S.settingsUpdatedAt,
    estimate: {
      minKwp: S.estimate.minKwp,
      maxKwp: S.estimate.maxKwp,
      horizonYears: S.estimate.horizonYears,
      exportRateEur: S.estimate.exportRateEur,
      unitRateDefaultEur: S.estimate.unitRateDefaultEur,
      suppliers: S.estimate.suppliers.map((s) => ({ ...s })),
      minSystem: { kwp: min, grossCostEur: gross, grantEur: grant, netCostEur: Math.max(gross - grant, 0) },
      business: { ...S.estimate.business },
    },
    bill: {
      chips: { domestic: [...S.bill.chips.domestic], commercial: [...S.bill.chips.commercial] },
      readerEnabled: S.bill.readerEnabled,
    },
    survey: {
      timezone: S.survey.timezone,
      visitMinutes: S.survey.visitMinutes,
      businessVisitMinutes: S.survey.businessVisitMinutes,
      arrivalWindowMinutes: S.survey.arrivalWindowMinutes,
      startTimes: {
        weekday: [...S.survey.startTimes.weekday],
        saturday: [...S.survey.startTimes.saturday],
        sunday: [...S.survey.startTimes.sunday],
      },
      maxDaysAhead: S.survey.maxDaysAhead,
      minNoticeHours: S.survey.minNoticeHours,
      holdMinutes: S.survey.holdMinutes,
      closedDates: [...S.survey.closedDates],
      homeownerFacingName: S.survey.homeownerFacingName,
      welcomeCallName: S.survey.welcomeCallName,
    },
    portalOrigin: S.portalOrigin,
  };
}

/* ------------------------------------------------------------------ */
/*  Validation (PII-free by contract)                                  */
/* ------------------------------------------------------------------ */

const ALLOWED = new Set(['segment', 'bill', 'annualKwh', 'supplier', 'homeType', 'billRead']);
const PII = new Set(['name', 'email', 'phone', 'mobile', 'eircode', 'address', 'county', 'businessName']);
const HOME_TYPES = new Set(['apartment', 'terrace', 'semi', 'detached', 'bungalow', 'other', 'unknown']);

export type QuoteValidation =
  | { ok: true; items: QuoteRequestItem[] }
  | { ok: false; error: 'invalid' | 'pii_not_allowed'; detail: string };

export function validateQuoteRequest(body: unknown): QuoteValidation {
  const reqs = (body as { requests?: unknown })?.requests;
  if (!Array.isArray(reqs) || reqs.length < 1 || reqs.length > 8) {
    return { ok: false, error: 'invalid', detail: 'requests must hold 1 to 8 items' };
  }
  const items: QuoteRequestItem[] = [];
  for (const raw of reqs) {
    if (!raw || typeof raw !== 'object') return { ok: false, error: 'invalid', detail: 'item' };
    for (const k of Object.keys(raw)) {
      if (PII.has(k)) return { ok: false, error: 'pii_not_allowed', detail: k };
      if (!ALLOWED.has(k)) return { ok: false, error: 'invalid', detail: `unknown field ${k}` };
    }
    const r = raw as Record<string, unknown>;
    if (r.segment !== 'domestic' && r.segment !== 'commercial') return { ok: false, error: 'invalid', detail: 'segment' };
    let bill: QuoteRequestItem['bill'] = null;
    if (r.bill != null) {
      const b = r.bill as { amountEur?: unknown; period?: unknown };
      const amt = Number(b.amountEur);
      if (!Number.isFinite(amt) || amt < 1 || amt > 100000) return { ok: false, error: 'invalid', detail: 'bill.amountEur' };
      if (b.period !== 'month' && b.period !== 'two_months') return { ok: false, error: 'invalid', detail: 'bill.period' };
      bill = { amountEur: amt, period: b.period };
    }
    let annualKwh: number | null = null;
    if (r.annualKwh != null) {
      const k = Number(r.annualKwh);
      if (!Number.isFinite(k) || k < 100 || k > 5_000_000) return { ok: false, error: 'invalid', detail: 'annualKwh' };
      annualKwh = Math.round(k);
    }
    const supplier = typeof r.supplier === 'string' ? r.supplier.slice(0, 80) : null;
    const homeType = (typeof r.homeType === 'string' && HOME_TYPES.has(r.homeType) ? r.homeType : 'unknown') as QuoteRequestItem['homeType'];
    let billRead: QuoteRequestItem['billRead'] = null;
    if (r.billRead && typeof r.billRead === 'object') {
      const br = r.billRead as Record<string, unknown>;
      const num = (v: unknown, lo: number, hi: number) => {
        const n = Number(v);
        return Number.isFinite(n) && n >= lo && n <= hi ? n : undefined;
      };
      billRead = {
        unitRateEur: num(br.unitRateEur, 0.05, 1),
        standingChargeAnnualEur: num(br.standingChargeAnnualEur, 0, 2000),
        dayKwh: num(br.dayKwh, 1, 5_000_000),
        nightKwh: num(br.nightKwh, 0, 5_000_000),
      };
    }
    items.push({ segment: r.segment, bill, annualKwh, supplier, homeType, billRead });
  }
  return { ok: true, items };
}

/* ------------------------------------------------------------------ */
/*  The quote                                                          */
/* ------------------------------------------------------------------ */

function monthlyFromBill(bill: QuoteRequestItem['bill']): number | null {
  if (!bill) return null;
  return bill.period === 'two_months' ? bill.amountEur / 2 : bill.amountEur;
}

/** Which of the engine's home caps matches the Settings maximum (8 = the site's default "semi"). */
function homeIdForMax(maxKwp: number): string {
  if (maxKwp <= 6) return 'apartment';
  if (maxKwp <= 8) return 'semi';
  return 'detached';
}

function sign(record: unknown, expiresAt: string): string {
  const payload = Buffer.from(JSON.stringify({ v: 1, stub: true, record, expiresAt })).toString('base64url');
  const mac = createHmac('sha256', STUB_SECRET).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}

/** Reads a stub quote token back (used by the submit stub to echo the stored estimate). */
export function readQuoteToken(token: string | null | undefined): QuoteFigures | null {
  if (!token || typeof token !== 'string') return null;
  const [payload, mac] = token.split('.');
  if (!payload || !mac) return null;
  const expect = createHmac('sha256', STUB_SECRET).update(payload).digest('base64url');
  if (expect !== mac) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (new Date(data.expiresAt).getTime() < Date.now()) return null;
    return data.record?.figures ?? null;
  } catch {
    return null;
  }
}

export function quoteOne(req: QuoteRequestItem): Quote {
  const E = S.estimate;
  const monthly = monthlyFromBill(req.bill);
  const fromBillPhoto = !!req.billRead;
  const assumptions: QuoteAssumption[] = [];

  if (req.bill && monthly != null) {
    assumptions.push({ field: 'bill', value: Math.round(monthly * 100) / 100, provenance: fromBillPhoto ? 'from_your_bill' : 'you_told_us' });
  }

  if (req.segment === 'domestic') {
    const usage = req.annualKwh ?? (monthly != null ? usageFromMonthlyBill(monthly) : null);
    if (usage == null || usage <= 0) return { hasBasis: false, figures: null, assumptions, quoteToken: null, expiresAt: null };
    // Typed kWh, or worked out from the bill they gave: either way it rests on
    // what they told us (or what their bill photo said), never on a default.
    assumptions.push({ field: 'annualKwh', value: usage, provenance: fromBillPhoto ? 'from_your_bill' : 'you_told_us' });

    let unitRate: number = E.unitRateDefaultEur;
    let rateProv: QuoteAssumption['provenance'] = 'assumed';
    const supplier = req.supplier ? E.suppliers.find((s) => s.name === req.supplier) : undefined;
    if (req.billRead?.unitRateEur) {
      unitRate = req.billRead.unitRateEur;
      rateProv = 'from_your_bill';
    } else if (supplier) {
      unitRate = supplier.unitRateEur;
      rateProv = 'you_told_us';
    }
    assumptions.push({ field: 'unitRate', value: unitRate, provenance: rateProv });
    assumptions.push({ field: 'exportRate', value: E.exportRateEur, provenance: 'assumed' });

    // DECISIONS 2 (X3): the bill photo's day/night split is used when it gives one.
    const dayKwh = req.billRead?.dayKwh && req.billRead.nightKwh != null ? req.billRead.dayKwh : undefined;
    assumptions.push({ field: 'daytimeShare', value: dayKwh ? Math.round((dayKwh / usage) * 100) / 100 : 0.6, provenance: dayKwh ? 'from_your_bill' : 'assumed' });

    // Size with the engine's own rule, then hold it to the Settings band.
    const engineSize = sizeSystemKwp(usage, homeIdForMax(E.maxKwp));
    const size = Math.min(Math.max(engineSize, E.minKwp), E.maxKwp);
    assumptions.push({ field: 'minKwp', value: E.minKwp, provenance: 'assumed' });

    const e = estimate({
      annualUsageKwh: usage,
      systemSizeKwp: size,
      unitRateEur: unitRate,
      exportRateEur: E.exportRateEur,
      dayUsageKwh: dayKwh,
    });
    const figures: QuoteFigures = {
      kwp: e.systemSizeKwp,
      panels: e.panels,
      annualKwh: e.annualUsageKwh,
      annualSavingEur: e.totalAnnualBenefitEur,
      selfUseSavingEur: e.annualSavingFromSelfUseEur,
      exportIncomeEur: e.annualExportEarningsEur,
      grossCostEur: e.installCostEur,
      grantEur: e.grantEur,
      grantScheme: 'SEAI',
      netCostEur: e.costAfterGrantEur,
      vatRate: 0,
      vatEur: 0,
      paybackYears: e.paybackYears,
      horizonYears: E.horizonYears,
      horizonSavingsEur: e.total25yrSavingsEur,
      horizonNetEur: e.total25yrSavingsEur - e.costAfterGrantEur,
      selfUsePct: e.selfConsumptionPct,
      unitRateEur: unitRate,
      exportRateEur: E.exportRateEur,
      annualBillEur: e.annualBillEur,
      annualBillAfterSolarEur: e.annualBillAfterSolarEur,
      billReductionPct: e.billReductionPct,
      monthlySavingsEur: e.monthlySavingsEur,
      co2PerYearKg: e.co2PerYearKg,
      treesEquivalent: e.treesEquivalent,
      monthlyGeneration: e.monthlyGeneration.map((m) => m.generationKwh),
      options: systemOptions(usage, [4, 5, 6, 7, 8].filter((k) => k >= E.minKwp && k <= E.maxKwp), {
        unitRateEur: unitRate,
        exportRateEur: E.exportRateEur,
      }).map((o) => ({ kwp: o.size, annualSavingEur: o.annualSaving + o.annualExport, grossCostEur: o.cost, paybackYears: o.paybackYears })),
      indicative: false,
      priceBasis: 'estimate',
      sizedAtMinimum: size <= E.minKwp,
    };
    return finish(req, figures, assumptions);
  }

  // Business: indicative, NDMG, and no price (DECISIONS 2).
  let unitRate: number = S.estimate.commercialUnitRateDefaultEur;
  let rateProv: QuoteAssumption['provenance'] = 'assumed';
  if (req.billRead?.unitRateEur) {
    unitRate = req.billRead.unitRateEur;
    rateProv = 'from_your_bill';
  }
  const usage = req.annualKwh ?? (monthly != null ? commercialUsageFromMonthlyBill(monthly, unitRate) : null);
  if (usage == null || usage <= 0) return { hasBasis: false, figures: null, assumptions, quoteToken: null, expiresAt: null };
  assumptions.push({ field: 'annualKwh', value: usage, provenance: fromBillPhoto ? 'from_your_bill' : 'you_told_us' });
  assumptions.push({ field: 'unitRate', value: unitRate, provenance: rateProv });
  assumptions.push({ field: 'exportRate', value: E.exportRateEur, provenance: 'assumed' });
  const dayKwh = req.billRead?.dayKwh && req.billRead.nightKwh != null ? req.billRead.dayKwh : undefined;
  assumptions.push({ field: 'daytimeShare', value: dayKwh ? Math.round((dayKwh / usage) * 100) / 100 : 0.75, provenance: dayKwh ? 'from_your_bill' : 'assumed' });

  const c = commercialEstimate({ annualUsageKwh: usage, unitRateEur: unitRate, exportRateEur: E.exportRateEur, dayUsageKwh: dayKwh });
  const showPrice = E.business.showPrice;
  const figures: QuoteFigures = {
    kwp: c.systemSizeKwp,
    panels: c.panels,
    annualKwh: c.annualUsageKwh,
    annualSavingEur: c.totalAnnualBenefitEur,
    selfUseSavingEur: c.annualSavingFromSelfUseEur,
    exportIncomeEur: c.annualExportEarningsEur,
    grossCostEur: showPrice ? c.installCostExVatEur : null,
    grantEur: c.grantEur,
    grantScheme: 'NDMG',
    netCostEur: showPrice ? c.costAfterGrantEur : null,
    vatRate: c.vatRate,
    vatEur: showPrice ? c.vatEur : null,
    paybackYears: showPrice ? c.paybackYears : null,
    horizonYears: E.horizonYears,
    horizonSavingsEur: E.business.showHorizon ? c.total25yrSavingsEur : null,
    horizonNetEur: null,
    selfUsePct: c.selfConsumptionPct,
    unitRateEur: unitRate,
    exportRateEur: E.exportRateEur,
    annualBillEur: c.annualBillEur,
    annualBillAfterSolarEur: c.annualBillAfterSolarEur,
    billReductionPct: c.billReductionPct,
    monthlySavingsEur: c.monthlySavingsEur,
    co2PerYearKg: c.co2PerYearKg,
    treesEquivalent: c.treesEquivalent,
    monthlyGeneration: c.monthlyGeneration.map((m) => m.generationKwh),
    options: [],
    indicative: true,
    priceBasis: showPrice ? 'estimate' : 'proposal',
    sizedAtMinimum: false,
  };
  return finish(req, figures, assumptions);
}

function finish(req: QuoteRequestItem, figures: QuoteFigures, assumptions: QuoteAssumption[]): Quote {
  const expiresAt = new Date(Date.now() + S.estimate.quoteValidityDays * 86400000).toISOString();
  const quoteToken = sign({ input: req, figures, rulesVersion: S.rulesVersion }, expiresAt);
  return { hasBasis: true, figures, assumptions, quoteToken, expiresAt };
}

export function quoteMany(items: QuoteRequestItem[]): QuoteResponse {
  return {
    rulesVersion: S.rulesVersion,
    rulesHash: rulesHash(),
    settingsUpdatedAt: S.settingsUpdatedAt,
    quotes: items.map(quoteOne),
  };
}
