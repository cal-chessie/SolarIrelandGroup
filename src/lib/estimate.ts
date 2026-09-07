/**
 * THE savings engine. One formula, one set of constants, every surface.
 *
 * Before this file was consolidated there were three engines: this one, a
 * copy inside QuickSavingsCalculator, and a third with different constants in
 * the analyse-bill API. The same bill could produce three different answers.
 * Nothing may fork it again. If a number needs to change, change it here.
 *
 * ── What this engine is for ───────────────────────────────────────────────
 * It produces a CLOSE estimate, not a proposal. The consultant proposes.
 * Everything here is therefore deliberately conservative, and deliberately
 * PANELS ONLY:
 *
 *   - No battery in the cost, and no battery in the savings. A battery lifts
 *     self-consumption from roughly 40% to roughly 75%, and that difference
 *     is the consultant's to size, price and sell on the day. Quoting it here
 *     would spend their upside and commit us to a number we have not surveyed.
 *   - Every figure should be one the survey can meet or beat. An estimate the
 *     consultant has to walk backwards from is worse than no estimate.
 *   - 4 kWp is the domestic floor and the typical system. Smaller arrays are
 *     not a good investment in this market: the fixed costs hardly change
 *     while the generation and the grant both drop away. 4 kWp is also the
 *     exact point the SEAI grant reaches its full €1,800, so it is where a
 *     homeowner takes maximum grant and maximum saving. Nothing below it is
 *     sized, quoted or shown in a comparison.
 *
 * ── Evidence for each constant (checked 7 Sep 2026) ───────────────────────
 * Unit rate 35c/kWh   Electric Ireland's standard 24hr rate from 1 Jul 2026 is
 *                     38.04c incl VAT; the market sits at 35-38c. We take the
 *                     bottom of the band, so we never overstate a saving.
 * Standing charge     €250/yr. Electric Ireland is €250.77 incl VAT. Solar
 *                     never removes this, so it is stripped out before we
 *                     derive usage from a bill.
 * Export 20c/kWh      The CRU minimum Clean Export Guarantee obligation
 *                     (CRU/24/019). Suppliers currently pay between 18.5c and
 *                     24c, so the regulated floor is the safe figure.
 * Yield 950 kWh/kWp   PVGIS for a south-facing roof at 30 degrees in Dublin is
 *                     about 972 kWh/kWp/yr after standard 14% system losses;
 *                     the national average is about 884. 950 describes a good
 *                     roof without pretending every roof is one.
 * Self-consumption    30-50% for an Irish home with no battery (35-45% typical).
 *                     Modelled across that band by how well the array matches
 *                     the household's usage. NOT the 65-80% the old engines
 *                     used, which is a figure only a battery reaches.
 * SEAI grant          Tiered, not flat: €700/kWp for the first 2 kWp, then
 *                     €200/kWp to 4 kWp, capped at €1,800 (so €1,800 needs a
 *                     full 4 kWp; a 2.5 kWp system draws €1,500). All three
 *                     old engines applied a flat €1,800 to every size.
 *
 * Install pricing below is Solar Ireland's own commercial pricing, not an
 * external figure. It is the one block here Cal owns and should confirm.
 */
import { SOLAR_DATA } from '@/lib/solar-data';

/** Market/regulatory inputs. Sourced above; change only with new evidence. */
export const ENERGY = {
  unitRateEur: 0.35,
  standingChargeAnnualEur: 250,
  exportRateEur: SOLAR_DATA.export.ratePerKwh,
  generationPerKwp: SOLAR_DATA.system.generationPerKwp,
  panelDegradationPerYear: 0.005,
  energyPriceInflationPerYear: 0.03,
  /** kg CO2 per kWh displaced, EirGrid grid intensity. */
  co2PerKwh: 0.29,
  /** kg CO2 a mature tree absorbs per year. */
  co2PerTreePerYear: 22,
} as const;

/** Solar Ireland's own install pricing. Not evidence, a commercial decision. */
export const PRICING = {
  perKwpEur: 1600,
  baseInstallEur: 1800,
  panelWatts: 440,
} as const;

/**
 * The domestic floor. Below 4 kWp the economics stop making sense: the fixed
 * costs (scaffolding, design, commissioning, the ESB paperwork) barely move,
 * while the generation and the grant both fall away. 4 kWp is also exactly
 * where the SEAI grant tops out at its full €1,800, so it is the point where a
 * homeowner takes the most grant and the most saving for the same day's work.
 * We do not size, quote or compare anything smaller.
 */
export const DOMESTIC_MIN_KWP = 4;

/** Self-consumption band for a system with NO battery. */
const SELF_USE_MIN = 0.30;
const SELF_USE_MAX = 0.50;

export const HOME_TYPES = [
  { id: 'apartment', label: 'Apartment / Terrace', minKwp: DOMESTIC_MIN_KWP, maxKwp: 6 },
  { id: 'semi', label: 'Semi-Detached', minKwp: DOMESTIC_MIN_KWP, maxKwp: 8 },
  { id: 'detached', label: 'Detached', minKwp: DOMESTIC_MIN_KWP, maxKwp: 9.7 },
] as const;

/** Share of a month's annual generation, Irish seasonal shape. */
export const MONTHLY_GENERATION_SHARE = [
  0.032, 0.047, 0.081, 0.109, 0.131, 0.134, 0.127, 0.110, 0.086, 0.059, 0.036, 0.028,
] as const;

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * SEAI domestic solar PV grant. Tiered: €700/kWp to 2 kWp, €200/kWp from 2 to
 * 4 kWp, capped at €1,800. Systems under 2 kWp are not eligible.
 */
export function seaiGrant(kwp: number): number {
  // Kept exact even though we never size below 4 kWp (where it is already at
  // the full €1,800), so the tiers stay correct if the scheme or the floor
  // ever changes.
  if (kwp < 2) return 0;
  const firstTier = Math.min(kwp, 2) * 700;
  const secondTier = Math.max(0, Math.min(kwp, 4) - 2) * 200;
  return Math.min(Math.round(firstTier + secondTier), SOLAR_DATA.grant.amount);
}

/**
 * How much of what the panels make gets used in the house rather than
 * exported. No battery: a well-matched array reaches the top of the Irish
 * band, an oversized one falls to the bottom.
 */
export function selfConsumptionRatio(annualGenerationKwh: number, annualUsageKwh: number): number {
  if (annualUsageKwh <= 0) return SELF_USE_MIN;
  const cover = annualGenerationKwh / annualUsageKwh;
  // cover <= 0.3 of usage: nearly all of it is absorbed -> top of the band.
  // cover >= 1.2 of usage: a lot has nowhere to go -> bottom of the band.
  const t = clamp((cover - 0.3) / 0.9, 0, 1);
  return clamp(SELF_USE_MAX - (SELF_USE_MAX - SELF_USE_MIN) * t, SELF_USE_MIN, SELF_USE_MAX);
}

/** Annual kWh implied by a monthly bill, with the standing charge removed. */
export function usageFromMonthlyBill(monthlyBillEur: number): number {
  const annualBill = monthlyBillEur * 12;
  const energyOnly = Math.max(annualBill - ENERGY.standingChargeAnnualEur, 100);
  return Math.round(energyOnly / ENERGY.unitRateEur);
}

/** Size the array to the roof type and the household's actual usage. */
export function sizeSystemKwp(annualUsageKwh: number, homeId?: string): number {
  const home = HOME_TYPES.find((h) => h.id === homeId) || HOME_TYPES[1];
  // Aim to generate about 85% of annual usage, then clamp to what the roof takes.
  const ideal = (annualUsageKwh * 0.85) / ENERGY.generationPerKwp;
  const rounded = Math.round(ideal * 2) / 2;
  // Never below the domestic floor, whatever the usage says.
  return clamp(rounded, Math.max(home.minKwp, DOMESTIC_MIN_KWP), home.maxKwp);
}

export interface EstimateResult {
  annualBillEur: number;
  annualUsageKwh: number;
  systemSizeKwp: number;
  panels: number;
  annualGenerationKwh: number;
  selfConsumptionPct: number;
  selfConsumedKwh: number;
  exportedKwh: number;
  annualSavingFromSelfUseEur: number;
  annualExportEarningsEur: number;
  totalAnnualBenefitEur: number;
  annualBillAfterSolarEur: number;
  monthlyBillAfterSolarEur: number;
  monthlySavingsEur: number;
  billReductionPct: number;
  installCostEur: number;
  grantEur: number;
  costAfterGrantEur: number;
  paybackYears: number;
  total25yrSavingsEur: number;
  co2PerYearKg: number;
  treesEquivalent: number;
  monthlyGeneration: { month: string; generationKwh: number }[];
}

/**
 * The estimate. Panels only, conservative inputs, honest about what it is.
 * `unitRateEur` may be passed when a real bill has been read, so a customer's
 * own tariff is used instead of the market figure.
 */
export function estimate(input: {
  annualUsageKwh: number;
  homeId?: string;
  systemSizeKwp?: number;
  unitRateEur?: number;
  exportRateEur?: number;
}): EstimateResult {
  const unitRate = input.unitRateEur && input.unitRateEur > 0 ? input.unitRateEur : ENERGY.unitRateEur;
  const exportRate = input.exportRateEur && input.exportRateEur > 0 ? input.exportRateEur : ENERGY.exportRateEur;
  const annualUsageKwh = Math.max(Math.round(input.annualUsageKwh), 0);

  const systemSizeKwp = input.systemSizeKwp ?? sizeSystemKwp(annualUsageKwh, input.homeId);
  const annualGenerationKwh = Math.round(systemSizeKwp * ENERGY.generationPerKwp);
  const panels = Math.round((systemSizeKwp * 1000) / PRICING.panelWatts);

  const ratio = selfConsumptionRatio(annualGenerationKwh, annualUsageKwh);
  // Never claim to self-use more than the house actually consumes.
  const selfConsumedKwh = Math.round(Math.min(annualGenerationKwh * ratio, annualUsageKwh));
  const exportedKwh = Math.max(0, annualGenerationKwh - selfConsumedKwh);

  const annualSavingFromSelfUseEur = Math.round(selfConsumedKwh * unitRate);
  const annualExportEarningsEur = Math.round(exportedKwh * exportRate);
  const totalAnnualBenefitEur = annualSavingFromSelfUseEur + annualExportEarningsEur;

  const annualBillEur = Math.round(annualUsageKwh * unitRate + ENERGY.standingChargeAnnualEur);
  const annualBillAfterSolarEur = Math.max(
    annualBillEur - totalAnnualBenefitEur,
    ENERGY.standingChargeAnnualEur,
  );
  const monthlySavingsEur = Math.round(((annualBillEur - annualBillAfterSolarEur) / 12) * 100) / 100;
  // Measure the reduction against what the bill actually falls to, not against
  // the total benefit. On a low-usage home a 4 kWp array can earn more than the
  // bill, which used to read as "100% off your bill". It never is: the standing
  // charge stays, and the surplus is export income on top rather than a
  // discount. Anything above that floor is stated as earnings, not reduction.
  const billReductionPct = annualBillEur > 0
    ? Math.round(((annualBillEur - annualBillAfterSolarEur) / annualBillEur) * 100)
    : 0;

  const installCostEur = Math.round(systemSizeKwp * PRICING.perKwpEur + PRICING.baseInstallEur);
  const grantEur = seaiGrant(systemSizeKwp);
  const costAfterGrantEur = Math.max(installCostEur - grantEur, 0);
  const paybackYears = totalAnnualBenefitEur > 0
    ? Math.round((costAfterGrantEur / totalAnnualBenefitEur) * 10) / 10
    : 0;

  // 25 years with panel degradation and energy price inflation. Export income
  // is held flat: the CEG rate is not guaranteed to rise.
  let total25yrSavingsEur = 0;
  let generation = annualGenerationKwh;
  let rate = unitRate;
  for (let year = 1; year <= 25; year += 1) {
    const selfUsed = Math.min(generation * ratio, annualUsageKwh);
    const exported = Math.max(0, generation - selfUsed);
    total25yrSavingsEur += selfUsed * rate + exported * exportRate;
    generation *= 1 - ENERGY.panelDegradationPerYear;
    rate *= 1 + ENERGY.energyPriceInflationPerYear;
  }

  const co2PerYearKg = Math.round(annualGenerationKwh * ENERGY.co2PerKwh);

  return {
    annualBillEur,
    annualUsageKwh,
    systemSizeKwp,
    panels,
    annualGenerationKwh,
    selfConsumptionPct: Math.round(ratio * 100),
    selfConsumedKwh,
    exportedKwh,
    annualSavingFromSelfUseEur,
    annualExportEarningsEur,
    totalAnnualBenefitEur,
    annualBillAfterSolarEur,
    monthlyBillAfterSolarEur: Math.round((annualBillAfterSolarEur / 12) * 100) / 100,
    monthlySavingsEur,
    billReductionPct,
    installCostEur,
    grantEur,
    costAfterGrantEur,
    paybackYears,
    total25yrSavingsEur: Math.round(total25yrSavingsEur),
    co2PerYearKg,
    treesEquivalent: Math.round(co2PerYearKg / ENERGY.co2PerTreePerYear),
    monthlyGeneration: MONTH_NAMES.map((month, i) => ({
      month,
      generationKwh: Math.round(annualGenerationKwh * MONTHLY_GENERATION_SHARE[i]),
    })),
  };
}

/** Convenience wrapper for the surfaces that only know a monthly bill. */
export function estimateFromMonthlyBill(monthlyBillEur: number, homeId?: string): EstimateResult {
  return estimate({ annualUsageKwh: usageFromMonthlyBill(monthlyBillEur), homeId });
}

/** Side-by-side sizes for the comparison table. Same engine, fixed sizes. */
export function systemOptions(
  annualUsageKwh: number,
  sizes: number[] = [4, 5, 6, 7, 8],
  opts: { unitRateEur?: number; exportRateEur?: number } = {},
) {
  return sizes.map((systemSizeKwp) => {
    const e = estimate({ annualUsageKwh, systemSizeKwp, ...opts });
    return {
      size: systemSizeKwp,
      generation: e.annualGenerationKwh,
      annualSaving: e.annualSavingFromSelfUseEur,
      annualExport: e.annualExportEarningsEur,
      paybackYears: e.paybackYears,
      cost: e.installCostEur,
      grant: e.grantEur,
    };
  });
}

/**
 * The size with the best return. Sized to the house first, so we recommend
 * what the household can actually use rather than the biggest array.
 */
export function recommendedSize(annualUsageKwh: number, homeId?: string): number {
  return sizeSystemKwp(annualUsageKwh, homeId);
}

export function fmtEur(n: number): string {
  return '€' + Math.round(n).toLocaleString();
}
