import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ─── Irish Energy Provider Rates (2026) ───
const PROVIDER_RATES: Record<string, { dayRate: number; nightRate: number; standingCharge: number; exportRate: number }> = {
  'Electric Ireland': { dayRate: 0.422, nightRate: 0.231, standingCharge: 11.18, exportRate: 0.21 },
  'ESB': { dayRate: 0.422, nightRate: 0.231, standingCharge: 11.18, exportRate: 0.21 },
  'Bord Gáis Energy': { dayRate: 0.412, nightRate: 0.225, standingCharge: 10.85, exportRate: 0.21 },
  'SSE Airtricity': { dayRate: 0.418, nightRate: 0.228, standingCharge: 10.98, exportRate: 0.21 },
  'Energia': { dayRate: 0.408, nightRate: 0.222, standingCharge: 10.72, exportRate: 0.21 },
  'Panda': { dayRate: 0.425, nightRate: 0.235, standingCharge: 11.30, exportRate: 0.21 },
  'PrepayPower': { dayRate: 0.442, nightRate: 0.245, standingCharge: 9.50, exportRate: 0.21 },
  'Yuno': { dayRate: 0.405, nightRate: 0.220, standingCharge: 10.50, exportRate: 0.21 },
  'Community Power': { dayRate: 0.399, nightRate: 0.218, standingCharge: 10.40, exportRate: 0.21 },
  'Pinergy': { dayRate: 0.435, nightRate: 0.238, standingCharge: 11.00, exportRate: 0.21 },
};

const DEFAULT_RATES = { dayRate: 0.42, nightRate: 0.23, standingCharge: 11.00, exportRate: 0.21 };

// ─── Monthly Solar Generation Profile (kWh per kWp) ───
// Based on SEAI TMY data for typical south-facing Irish roof at 35° tilt
const MONTHLY_YIELD_PER_KWP = [
  42,  // Jan
  62,  // Feb
  97,  // Mar
  129, // Apr
  152, // May
  152, // Jun
  147, // Jul
  139, // Aug
  107, // Sep
  68,  // Oct
  42,  // Nov
  33,  // Dec
]; // Total: ~1070 kWh/kWp/year (slightly above 875 average, accounts for good conditions)

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── CO2 emission factor ───
// Ireland grid: 0.296 kg CO2/kWh (2024 EPA data, slight reduction assumed by 2026)
const CO2_FACTOR = 0.29;

interface BillExtraction {
  provider: string | null;
  monthlyBill: number | null;
  annualUsage: number | null;
  billingPeriod: string | null;
  unitRate: number | null;
  standingCharge: number | null;
  vat: number | null;
  dayNightMeter: boolean;
  confidence: number;
  extractedFields: string[];
}

interface AnalysisResult {
  // Bill info
  provider: string;
  monthlyBill: number;
  annualUsage: number;
  homeType: string;
  unitRate: number;
  standingCharge: number;

  // VLM info
  confidence: number;
  extractedFields: string[];
  billingPeriod: string | null;

  // Recommended system
  recommendedSystem: number;
  installCost: number;
  seaiGrant: number;
  costAfterGrant: number;

  // Savings
  annualSaving: number;
  annualExportEarning: number;
  totalAnnualBenefit: number;
  paybackYears: number;
  roiPercent: number;

  // 25 year projection
  total25YearSavings: number;
  co2Saved25Years: number;

  // Monthly breakdown
  monthlyProfile: {
    month: string;
    generation: number;
    consumption: number;
    selfConsumed: number;
    exported: number;
    saving: number;
    exportEarning: number;
  }[];

  // System comparisons
  systemComparisons: {
    size: number;
    generation: number;
    annualSaving: number;
    annualExport: number;
    paybackYears: number;
    cost: number;
    grant: number;
  }[];

  // Battery assessment
  batteryWorthwhile: boolean;
  batteryReason: string;
  estimatedBatteryCost: number;
  batteryPaybackYears: number;

  // Carbon
  annualCo2Saved: number;
  treesEquiv25Years: number;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let monthlyBill: number;
    let annualUsage: number;
    let provider: string = 'Unknown';
    let homeType: string = 'Semi-detached';
    let unitRate: number | null = null;
    let standingCharge: number | null = null;
    let billingPeriod: string | null = null;
    let confidence = 100;
    let extractedFields: string[] = ['All manual'];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('bill') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';

      const zai = await ZAI.create();

      const visionResponse = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert at reading Irish electricity bills. This is a photo/scan of an Irish electricity bill.

Extract EVERYTHING you can and return ONLY a JSON object with these fields:
{
  "provider": "electricity supplier name (e.g. Electric Ireland, ESB, Bord Gáis Energy, SSE Airtricity, Energia, Panda, Yuno, Pinergy, Community Power, PrepayPower)",
  "monthlyBill": "total amount due in euros (number, e.g. 187.42)",
  "annualUsage": "annual consumption in kWh (number). Look for 'annual', 'kWh', 'consumption'. If only a monthly reading is shown, multiply by 12",
  "billingPeriod": "the billing period (e.g. '1 Dec 2025 to 31 Dec 2025')",
  "unitRate": "price per kWh in euros if shown (number, e.g. 0.422)",
  "standingCharge": "daily or monthly standing charge if shown (number)",
  "vat": "VAT rate if shown (e.g. 9 or 13.5)",
  "dayNightMeter": true if you see Day/Night or 24hr/Night readings, false if single rate,
  "dayUsage": "day usage in kWh if shown (number)",
  "nightUsage": "night usage in kWh if shown (number)"
}

Return ONLY valid JSON. No markdown, no explanation. Use null for any field you cannot find.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
            ],
          },
        ],
        thinking: { type: 'disabled' },
      });

      const content = visionResponse.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse bill details from the image. Please try again or enter details manually.');
      }

      const billData: BillExtraction = JSON.parse(jsonMatch[0]);

      monthlyBill = billData.monthlyBill || 160;
      annualUsage = billData.annualUsage || 4800;
      provider = billData.provider || 'Unknown';
      billingPeriod = billData.billingPeriod || null;
      unitRate = billData.unitRate;
      standingCharge = billData.standingCharge;

      // Track what was successfully extracted
      extractedFields = [];
      confidence = 0;
      if (billData.provider) { extractedFields.push('Provider'); confidence += 20; }
      if (billData.monthlyBill) { extractedFields.push('Bill Amount'); confidence += 25; }
      if (billData.annualUsage) { extractedFields.push('Usage (kWh)'); confidence += 25; }
      if (billData.unitRate) { extractedFields.push('Unit Rate'); confidence += 15; }
      if (billData.billingPeriod) { extractedFields.push('Billing Period'); confidence += 10; }
      if (billData.standingCharge) { extractedFields.push('Standing Charge'); confidence += 5; }
    } else {
      const body = await request.json();
      monthlyBill = parseFloat(body.monthlyBill);
      annualUsage = parseFloat(body.annualUsage);
      provider = body.provider || 'Unknown';
      homeType = body.homeType || 'Semi-detached';

      if (!monthlyBill || monthlyBill <= 0 || !annualUsage || annualUsage <= 0) {
        return NextResponse.json(
          { error: 'Please provide valid monthly bill and annual usage.' },
          { status: 400 }
        );
      }
    }

    const results = runFullAnalysis(monthlyBill, annualUsage, provider, homeType, unitRate, standingCharge, billingPeriod, confidence, extractedFields);

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error('Bill analysis error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'Failed to analyse bill. Please try entering your details manually.',
      },
      { status: 500 }
    );
  }
}

function getProviderRates(provider: string) {
  // Fuzzy match provider name
  const key = Object.keys(PROVIDER_RATES).find(
    k => provider.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(provider.toLowerCase())
  );
  return key ? PROVIDER_RATES[key] : DEFAULT_RATES;
}

function runFullAnalysis(
  monthlyBill: number,
  annualUsage: number,
  provider: string,
  homeType: string,
  unitRate: number | null,
  standingCharge: number | null,
  billingPeriod: string | null,
  confidence: number,
  extractedFields: string[]
): AnalysisResult {
  const rates = getProviderRates(provider);

  // Use provider's known rate, or derive from bill
  const effectiveRate = unitRate || rates.dayRate;
  const effectiveStanding = standingCharge || rates.standingCharge;

  // Monthly consumption split
  const monthlyUsage = annualUsage / 12;
  const avgDayConsumption = monthlyUsage * 0.65; // 65% during day
  const avgNightConsumption = monthlyUsage * 0.35; // 35% night

  // ─── System sizing: test multiple sizes and find optimal ROI ───
  const systemComparisons: AnalysisResult['systemComparisons'] = [];
  let bestPayback = Infinity;
  let recommendedSystem = 4;

  for (const size of [2, 3, 4, 5, 6, 7]) {
    const gen = size * 1070; // total annual generation
    const selfConsumed = Math.min(gen * 0.5, annualUsage * 0.5); // 50% self-consumption
    const exported = gen - selfConsumed;

    const saving = selfConsumed * effectiveRate;
    const exportEarning = exported * rates.exportRate;
    const totalBenefit = saving + exportEarning;

    // SEAI grant: €1,800 for systems ≥ 2kWp (2026)
    const grant = size >= 2 ? 1800 : 0;
    const installCost = size * 1500 + 2000; // base + per kWp
    const netCost = installCost - grant;

    const payback = totalBenefit > 0 ? netCost / totalBenefit : 99;

    systemComparisons.push({
      size,
      generation: Math.round(gen),
      annualSaving: Math.round(saving),
      annualExport: Math.round(exportEarning),
      paybackYears: Math.round(payback * 10) / 10,
      cost: installCost,
      grant,
    });

    if (payback < bestPayback && payback > 3) {
      bestPayback = payback;
      recommendedSystem = size;
    }
  }

  const best = systemComparisons.find(c => c.size === recommendedSystem) || systemComparisons[2];

  // ─── Monthly profile for recommended system ───
  const monthlyProfile = MONTH_NAMES.map((month, i) => {
    const generation = recommendedSystem * MONTHLY_YIELD_PER_KWP[i];
    const consumption = monthlyUsage;
    const selfConsumed = Math.min(generation * 0.5, consumption * 0.65);
    const exported = Math.max(0, generation - selfConsumed);
    const saving = selfConsumed * effectiveRate;
    const exportEarning = exported * rates.exportRate;

    return {
      month,
      generation: Math.round(generation),
      consumption: Math.round(consumption),
      selfConsumed: Math.round(selfConsumed),
      exported: Math.round(exported),
      saving: Math.round(saving),
      exportEarning: Math.round(exportEarning),
    };
  });

  // ─── Battery assessment ───
  // A battery is worthwhile when self-consumption ratio is low (< 40%)
  // and the household has reasonable day usage
  const selfConsumptionRatio = best.annualSaving / (best.annualSaving + best.annualExport);
  const batteryWorthwhile = selfConsumptionRatio < 0.45 && annualUsage > 3500;
  const estimatedBatteryCost = 4500; // 5kWh battery + installation
  const batteryExtraSaving = batteryWorthwhile
    ? Math.round(best.annualExport * 0.6 * effectiveRate * 0.85) // capture 60% of export at 85% battery efficiency
    : 0;
  const batteryPaybackYears = batteryExtraSaving > 0
    ? Math.round((estimatedBatteryCost / batteryExtraSaving) * 10) / 10
    : 99;
  const batteryReason = batteryWorthwhile
    ? `Your self-consumption is ~${Math.round(selfConsumptionRatio * 100)}%, meaning you're exporting a lot of energy. A battery could capture ~€${batteryExtraSaving}/year more of that, paying for itself in ~${batteryPaybackYears} years.`
    : `Your self-consumption is already strong at ~${Math.round(selfConsumptionRatio * 100)}%. A battery wouldn't add enough benefit to justify the €${estimatedBatteryCost.toLocaleString()} cost.`;

  // ─── Carbon savings ───
  const annualCo2Saved = Math.round(best.generation * CO2_FACTOR);
  const total25YearCo2Saved = Math.round(annualCo2Saved * 22.5); // accounting for degradation
  // Average tree absorbs ~22kg CO2/year in Ireland
  const treesEquiv25Years = Math.round(total25YearCo2Saved / (22 * 25));

  // ─── 25-year total (with 0.5% annual degradation + 3% electricity price increase) ───
  let total25YearSavings = 0;
  let yearlyOutput = best.generation;
  let currentPrice = effectiveRate;
  for (let i = 0; i < 25; i++) {
    const selfUsed = Math.min(yearlyOutput * 0.5, annualUsage * 0.5);
    const exp = yearlyOutput - selfUsed;
    total25YearSavings += selfUsed * currentPrice + exp * rates.exportRate;
    yearlyOutput *= 0.995;
    currentPrice *= 1.03; // 3% annual price rise
  }
  total25YearSavings = Math.round(total25YearSavings);

  const netCost = best.cost - best.grant;
  const roiPercent = Math.round(((best.annualSaving + best.annualExport) / netCost) * 100);

  return {
    provider,
    monthlyBill: Math.round(monthlyBill * 100) / 100,
    annualUsage: Math.round(annualUsage),
    homeType,
    unitRate: effectiveRate,
    standingCharge: effectiveStanding,
    confidence,
    extractedFields,
    billingPeriod,
    recommendedSystem,
    installCost: best.cost,
    seaiGrant: best.grant,
    costAfterGrant: netCost,
    annualSaving: best.annualSaving,
    annualExportEarning: best.annualExport,
    totalAnnualBenefit: best.annualSaving + best.annualExport,
    paybackYears: best.paybackYears,
    roiPercent,
    total25YearSavings,
    co2Saved25Years: total25YearCo2Saved,
    monthlyProfile,
    systemComparisons,
    batteryWorthwhile,
    batteryReason,
    estimatedBatteryCost,
    batteryPaybackYears,
    annualCo2Saved,
    treesEquiv25Years,
  };
}
