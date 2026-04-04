import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let monthlyBill: number;
    let annualUsage: number;
    let provider: string = 'Unknown';
    let homeType: string = 'Semi-detached';

    if (contentType.includes('multipart/form-data')) {
      // File upload mode — use VLM to read the bill
      const formData = await request.formData();
      const file = formData.get('bill') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file uploaded.' },
          { status: 400 }
        );
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
                text: `This is an electricity bill from Ireland. Extract the following information and return it as JSON only (no markdown, no explanation):
- "provider": the electricity provider name (e.g. "Electric Ireland", "ESB", "Bord Gáis Energy", "SSE Airtricity", "Energia", "Panda", etc.)
- "monthlyBill": the total bill amount in euros as a number
- "annualUsage": the annual electricity consumption in kWh as a number (look for "kWh", "consumption", "annual usage", or calculate from a monthly reading)
- "billingPeriod": the billing period covered

If you cannot find a value, use null. Return ONLY valid JSON.`,
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
      // Extract JSON from the response (may be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse bill details from the image.');
      }

      const billData = JSON.parse(jsonMatch[0]);

      monthlyBill = billData.monthlyBill || 160;
      annualUsage = billData.annualUsage || 4800;
      provider = billData.provider || 'Unknown';
    } else {
      // Manual entry mode
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

    // Calculate savings based on the bill data
    const results = calculateSavings(monthlyBill, annualUsage, provider, homeType);

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error('Bill analysis error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to analyse bill. Please try entering your details manually.',
      },
      { status: 500 }
    );
  }
}

function calculateSavings(
  monthlyBill: number,
  annualUsage: number,
  provider: string,
  homeType: string
) {
  // Determine optimal system size based on annual usage
  // Rule of thumb: system should generate ~40-60% of annual usage for best ROI
  const targetGeneration = annualUsage * 0.5;
  const kwpNeeded = targetGeneration / 875; // ~875 kWh/kWp in Ireland (average)

  // Round to nearest standard system size
  const systemSizes = [2, 3, 4, 5, 6];
  let systemKwp = systemSizes[0];
  for (const size of systemSizes) {
    if (size <= kwpNeeded + 0.5) systemKwp = size;
  }

  // Generation estimate
  const annualGeneration = systemKwp * 875;

  // Electricity price: estimate from monthly bill
  const estimatedPricePerKwh = monthlyBill * 12 / annualUsage;
  const pricePerKwh = Math.max(0.25, Math.min(0.50, estimatedPricePerKwh));

  // Self-consumption rate (conservative 50%)
  const selfConsumption = 0.5;
  const selfConsumedKwh = annualGeneration * selfConsumption;

  // Annual savings from self-consumed electricity
  const annualSaving = Math.round(selfConsumedKwh * pricePerKwh);

  // System cost (2026 prices, after SEAI grant)
  const costPerKwp = 1600;
  const seaiGrant = systemKwp >= 4 ? 1800 : systemKwp >= 2 ? 1200 : 900;
  const installCostBeforeGrant = systemKwp * costPerKwp + 2500;
  const costAfterGrant = installCostBeforeGrant - seaiGrant;

  // Payback period
  const paybackPeriod =
    annualSaving > 0
      ? Math.round((costAfterGrant / annualSaving) * 10) / 10
      : 99;

  // 25-year value (with 0.5% annual degradation)
  let totalSavings = 0;
  let yearlyOutput = annualGeneration;
  for (let i = 0; i < 25; i++) {
    totalSavings += yearlyOutput * selfConsumption * pricePerKwh;
    yearlyOutput *= 0.995;
  }
  const twentyFiveYearValue = Math.round(totalSavings);

  return {
    provider,
    monthlyBill: Math.round(monthlyBill),
    annualUsage: Math.round(annualUsage),
    homeType,
    systemSize: `${systemKwp} kWp`,
    annualSaving,
    paybackPeriod,
    seaiGrant,
    twentyFiveYearValue,
  };
}
