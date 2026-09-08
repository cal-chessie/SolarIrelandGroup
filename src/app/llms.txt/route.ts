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

> SEAI-registered solar panel installer serving Ireland. We install solar PV, battery storage and EV chargers for homes, prepare and submit the SEAI grant application, and offer a free AI electricity bill analysis that reads your actual day and night usage to estimate your savings.

Solar Ireland Group is a solar installer in the Republic of Ireland. A standard residential system is installed in a single day by a RECI-registered team. Domestic solar carries 0% VAT in Ireland. The SEAI Solar PV grant is ${EUR(grant)} in the Republic of Ireland. We also handle the ESB Networks grid connection notification and the post-works BER assessment.

## Key pages
- [Home](${SITE}/): overview and the free AI bill analysis
- [Services](${SITE}/services): solar PV, battery storage and EV charging, with package prices
- [Solar calculator](${SITE}/solar-calculator): annual savings, payback and 25-year return from your bill
- [Financing](${SITE}/financing): repayment options and what you would actually borrow
- [Book a survey](${SITE}/book-survey): free, no-obligation home survey
- [About](${SITE}/about): the team and certifications
- [Blog](${SITE}/blog): SEAI grant guides, cost breakdowns and county guides
- [Contact](${SITE}/contact)
- [Pricing](${SITE}/pricing.md): full price list, generated from our own pricing engine

## Pricing, in short
- ${DOMESTIC_MIN_KWP} kWp panels only: ${EUR(panelsOnly)}, or ${EUR(panelsOnly - grant)} after the SEAI grant
- ${DOMESTIC_MIN_KWP} kWp is our domestic minimum and the exact size at which the grant reaches its full ${EUR(grant)}
- Larger systems cost less per kWp. Full list at ${SITE}/pricing.md

## The SEAI grant
- ${EUR(grant)}, Republic of Ireland only (26 counties)
- Eligibility: owner-occupier, home built and occupied before 2021, its own MPRN, no previous solar funding at that MPRN
- There is no minimum BER. The BER assessment happens after the work, before the grant is paid
- SEAI pays the grant into the bank account nominated on the Request for Payment form, normally about 4 to 6 weeks after the post-works BER is published. By default that is the homeowner's account
- The SEAI EV charger grant is EUR 300. There is no standalone battery grant

## How we estimate savings
Our figures come from one published engine, not a sales spreadsheet, and every constant has a source:
- Generation: ${ENERGY.generationPerKwp} kWh per kWp per year. PVGIS for a south-facing Irish roof at 30 degrees after standard system losses
- Unit rate: ${Math.round(ENERGY.unitRateEur * 100)}c per kWh including VAT, the bottom of the current Irish market band, so savings are not overstated
- Standing charge: ${EUR(ENERGY.standingChargeAnnualEur)} a year, which solar never removes
- Export: ${SOLAR_DATA.export.label}, the CRU minimum Clean Export Guarantee obligation under CRU/24/019. Suppliers may pay more
- Self-consumption: 30-50% for an Irish home with no battery, roughly 70-85% with one
- Typical result for a 3-bed semi: ${SOLAR_DATA.savings.rangeLabel} a year, around ${SOLAR_DATA.savings.label} typical, payback about ${SOLAR_DATA.savings.paybackYears} years, ${SOLAR_DATA.savings.range25yrLabel} over 25 years
- Estimates are panels only. A battery is sized and priced at the survey, not quoted online

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
