/**
 * The intake's figures from the site's frozen engine, src/lib/estimate.ts,
 * with Cal's 13 Oct settings (./stub/settings.ts). Pure: no crypto, no
 * server imports, so it runs in the browser as well as on the server.
 *
 * Two callers, one set of numbers:
 *   - the stub quote route (./stub/quote.ts), which signs the result;
 *   - the intake itself, when /api/intake/quote is down or off, so a typed
 *     bill amount always gets a rough estimate instead of a dead end.
 *     AISolar's maths has authority, and for the same inputs it gives the
 *     same answer (a EUR 160 home bill: EUR 1,037 a year, EUR 6,750 after
 *     the grant, in both engines).
 *
 * This file does no saving or price maths of its own; it only picks the
 * inputs and reshapes the engine's result into the contract.
 */
import {
  commercialEstimate,
  commercialUsageFromMonthlyBill,
  estimate,
  sizeSystemKwp,
  systemOptions,
  usageFromMonthlyBill,
} from '@/lib/estimate';
import type { Quote, QuoteAssumption, QuoteFigures, QuoteRequestItem } from '@/lib/intake/contract';
import { STUB_SETTINGS } from './stub/settings';

const S = STUB_SETTINGS;

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

export function quoteFigures(req: QuoteRequestItem): { figures: QuoteFigures | null; assumptions: QuoteAssumption[] } {
  const E = S.estimate;
  const monthly = monthlyFromBill(req.bill);
  const fromBillPhoto = !!req.billRead;
  const assumptions: QuoteAssumption[] = [];

  if (req.bill && monthly != null) {
    assumptions.push({ field: 'bill', value: Math.round(monthly * 100) / 100, provenance: fromBillPhoto ? 'from_your_bill' : 'you_told_us' });
  }

  if (req.segment === 'domestic') {
    const usage = req.annualKwh ?? (monthly != null ? usageFromMonthlyBill(monthly) : null);
    if (usage == null || usage <= 0) return { figures: null, assumptions };
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
    return { figures, assumptions };
  }

  // Business: indicative, NDMG, and no price (DECISIONS 2).
  let unitRate: number = S.estimate.commercialUnitRateDefaultEur;
  let rateProv: QuoteAssumption['provenance'] = 'assumed';
  if (req.billRead?.unitRateEur) {
    unitRate = req.billRead.unitRateEur;
    rateProv = 'from_your_bill';
  }
  const usage = req.annualKwh ?? (monthly != null ? commercialUsageFromMonthlyBill(monthly, unitRate) : null);
  if (usage == null || usage <= 0) return { figures: null, assumptions };
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
  return { figures, assumptions };
}


/**
 * A rough estimate computed here, for when the quote service cannot answer.
 * Unsigned (no quote token): it is never stored as a quote, only shown.
 */
export function roughQuote(req: QuoteRequestItem): Quote {
  const { figures, assumptions } = quoteFigures(req);
  return { hasBasis: figures != null, figures, assumptions, quoteToken: null, expiresAt: null };
}
