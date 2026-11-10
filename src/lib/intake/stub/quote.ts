/**
 * STUB ONLY. The intake-quote contract (backend-spec 1.5) answered by the
 * site's own engine, src/lib/estimate.ts, parameterised by the Settings
 * object in ./settings.ts with Cal's 13 Oct answers applied:
 *
 *   home 4 to 8 kWp, export 18c, the annual saving INCLUDES export (and both
 *   parts are returned), the 25-year view, unit rate per supplier else 35c,
 *   no business price (DECISIONS 2).
 *
 * The figures themselves come from ../roughQuote.ts (estimate.ts with
 * explicit inputs), which the intake also uses as its offline fallback; this
 * file only signs them.
 */
import { createHash, createHmac } from 'node:crypto';
import {
  installCostEur,
  seaiGrant,
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
import { quoteFigures } from '@/lib/intake/roughQuote';

export { validateQuoteRequest, type QuoteValidation } from '@/lib/intake/validate';

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
/*  The quote                                                          */
/* ------------------------------------------------------------------ */

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
  const { figures, assumptions } = quoteFigures(req);
  if (!figures) return { hasBasis: false, figures: null, assumptions, quoteToken: null, expiresAt: null };
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
