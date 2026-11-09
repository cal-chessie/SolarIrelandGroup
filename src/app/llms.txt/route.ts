import { installCostEur, seaiGrant, DOMESTIC_MIN_KWP, ENERGY, fmtEur } from '@/lib/estimate';
import { SOLAR_DATA } from '@/lib/solar-data';

/**
 * /llms.txt, generated from the engine and the canon.
 *
 * The hand-written version carried three claims the site itself had already
 * retracted: a "BER C3 or lower" eligibility rule that does not exist in the
 * SEAI scheme, a 10-year installation warranty when the binding Terms say 5,
 * and prices that were roughly EUR 1,700 out of date. This is the first file an
 * AI engine reads about the business, so those were the facts most likely to be
 * repeated back to a customer by a model.
 *
 * Generated, not typed, for the same reason as pricing.md and HomeSchema.
 */

export const dynamic = 'force-static';

const SITE = 'https://solarirelandgroup.ie';
const EUR = (n: number) => fmtEur(n).replace('€', 'EUR ');

export function GET() {
  const grant = seaiGrant(DOMESTIC_MIN_KWP);
  const panelsOnly = installCostEur(DOMESTIC_MIN_KWP);

  const body = `# Solar Ireland Group

> SEAI-registered solar panel installer serving all 32 counties of Ireland since 2019. Start with a free bill analysis: upload an electricity bill and get a free estimate of your system size, savings, SEAI grant and payback, read from your actual day and night usage. Then a call with our team to go through it. We install solar PV, battery storage and EV chargers for homes and handle the SEAI grant paperwork.

Solar Ireland Group is a solar installer in the Republic of Ireland, founded in 2019. How it works: 1) free bill analysis and estimate on the website, 2) a call to go through your numbers, 3) a site survey and an itemised quote, 4) installation, usually in a single day, by a RECI-registered team. Domestic solar carries 0% VAT in Ireland. The SEAI Solar PV grant is ${EUR(grant)} in the Republic of Ireland. We also handle the ESB Networks grid connection notification and the post-works BER assessment.

## Key pages
- [Solar calculator](${SITE}/solar-calculator): the free bill analysis and estimate: system size, annual savings, payback and 25-year return from your bill
- [Home](${SITE}/): overview, starting from the free bill analysis
- [Services](${SITE}/services): solar PV, battery storage and EV charging, with package prices
- [Financing](${SITE}/financing): solar loans in Ireland, repayments and how the SEAI grant fits with a loan
- [About](${SITE}/about): the team and certifications
- [Contact](${SITE}/contact)
- [Blog](${SITE}/blog): SEAI grant guides, cost breakdowns and county guides
- [Pricing](${SITE}/pricing.md): full price list, generated from our own pricing engine

## Most-asked questions, answered
- [Are solar panels worth it in Ireland?](${SITE}/blog/are-solar-panels-worth-it-ireland-2026)
- [How much do solar panels cost in Ireland?](${SITE}/blog/how-much-do-solar-panels-cost-ireland-2026)
- [The SEAI solar grant: amounts and how to apply](${SITE}/blog/complete-guide-seai-solar-grant-2026)
- [How many solar panels do I need?](${SITE}/blog/how-many-solar-panels-do-i-need-ireland)
- [What is my MPRN and where do I find it?](${SITE}/blog/what-is-my-mprn-number-ireland)
- [The ESB Networks NC6 form](${SITE}/blog/nc6-form-solar-grid-connection-ireland)
- [Do I need a smart meter for solar?](${SITE}/blog/smart-meter-required-solar-panels-ireland)
- [Clean Export Guarantee explained](${SITE}/blog/clean-export-guarantee-explained)
- [Do solar panels work in winter?](${SITE}/blog/solar-panels-in-winter-do-they-work)
- [Planning permission for solar panels](${SITE}/blog/planning-permission-solar-panels-ireland)

## Pricing, in short
- ${DOMESTIC_MIN_KWP} kWp panels only: ${EUR(panelsOnly)}, or ${EUR(panelsOnly - grant)} after the SEAI grant
- ${DOMESTIC_MIN_KWP} kWp is our domestic minimum and the exact size at which the grant reaches its full ${EUR(grant)}
- Larger systems cost less per kWp. Full list at ${SITE}/pricing.md

## The SEAI grant
- ${EUR(grant)}, Republic of Ireland only (26 counties)
- Eligibility: homeowners, including private landlords; home built and occupied before 2025, its own MPRN, no previous solar funding at that MPRN
- There is no minimum BER. The BER assessment happens after the work, before the grant is paid
- Apply online and wait for SEAI's letter of offer before any work starts; the works must then be completed within 8 months
- SEAI pays the grant into the bank account nominated on the Request for Payment form; SEAI says to allow 4 to 6 weeks once it has all completion documents including the post-works BER, longer if the home is inspected. By default that is the homeowner's account
- The SEAI battery grant is ${EUR(SOLAR_DATA.batteryGrant.amount)} for a battery of ${SOLAR_DATA.batteryGrant.minLabel} (nothing under 5 kWh), on the same application as the panels, up to ${EUR(SOLAR_DATA.batteryGrant.withSolarMax)} together
- The SEAI EV charger grant is EUR 300

## How we estimate savings
Our figures come from one published engine, not a sales spreadsheet, and every constant has a source:
- Generation: ${ENERGY.generationPerKwp} kWh per kWp per year. PVGIS for a south-facing Irish roof at 30 degrees after standard system losses
- Unit rate: ${Math.round(ENERGY.unitRateEur * 100)}c per kWh including VAT, the bottom of the current Irish market band, so savings are not overstated
- Standing charge: ${EUR(ENERGY.standingChargeAnnualEur)} a year, which solar never removes
- Export: ${SOLAR_DATA.export.label}, a typical supplier rate under the Clean Export Guarantee. Each supplier sets its own export rate (roughly 18.5c to 24c per kWh in 2026); the CRU oversees the scheme and sets no minimum rate
- Self-consumption: 30-50% for an Irish home with no battery, roughly 70-85% with one
- Typical result for a 3-bed semi: ${SOLAR_DATA.savings.rangeLabel} a year, around ${SOLAR_DATA.savings.label} typical, payback about ${SOLAR_DATA.savings.paybackYears} years, ${SOLAR_DATA.savings.range25yrLabel} over 25 years
- Estimates are panels only. A battery is sized and priced after the call and the survey, not quoted online

## Facts
- Coverage: all 32 counties. The SEAI grant applies in the 26 Republic of Ireland counties
- Certifications: SEAI-registered, RECI-registered electricians, wiring to I.S. 10101
- Grid connection: notified to ESB Networks under NC6 for domestic and NC7 for commercial
- Warranty: 25-year panel performance warranty, 5-year workmanship warranty
- The AI bill analysis reads the day and night usage split from your electricity bill. It does not read your roof from a photo or from satellite imagery
- Contact: ${SOLAR_DATA.provider.email}, ${SOLAR_DATA.provider.phone}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
