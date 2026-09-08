import { installCostEur, seaiGrant, DOMESTIC_MIN_KWP, fmtEur } from '@/lib/estimate';
import { SOLAR_DATA } from '@/lib/solar-data';

/**
 * /pricing.md, generated from the engine.
 *
 * This was a hand-written file in public/ and it went badly stale: it quoted
 * 4 kWp at EUR 6,500 (real: 8,200), a battery package at EUR 11,000 (real:
 * 11,400), a "BER C3 or lower" eligibility rule that does not exist, a 10-year
 * installation warranty when the binding Terms say 5, and a promise that the
 * grant "is deducted from your final invoice" which is only one of the two
 * mechanisms SEAI allows.
 *
 * It is the file AI engines read to learn what this business charges, so a
 * wrong number here is a wrong number quoted back to a customer by a model.
 * Generating it is the only way it stays true: same reason HomeSchema.tsx
 * computes its JSON-LD prices instead of typing them.
 */

export const dynamic = 'force-static';

const EUR = (n: number) => fmtEur(n).replace('€', 'EUR ');

export function GET() {
  const grant = seaiGrant(DOMESTIC_MIN_KWP);
  const panelsOnly = installCostEur(DOMESTIC_MIN_KWP);
  const withBattery = installCostEur(DOMESTIC_MIN_KWP, 5);
  const battery5 = installCostEur(0, 5) - installCostEur(0);
  const largest = installCostEur(9.7);

  const body = `# Pricing - Solar Ireland Group

All prices are for the Republic of Ireland and reflect the 0% VAT rate on domestic solar.

${DOMESTIC_MIN_KWP} kWp is our domestic minimum. Below it the fixed costs barely change while the generation and the grant both fall away, and ${DOMESTIC_MIN_KWP} kWp is the exact size at which the SEAI grant reaches its full ${EUR(grant)}. We do not quote smaller systems.

Every quote is itemised after a free home survey, so the final price depends on system size, roof complexity, and whether you add battery storage.

## Standard Solar PV (${DOMESTIC_MIN_KWP} kWp)
- For a typical 3-4 bedroom home
- Price: ${EUR(panelsOnly)}
- Price after the ${EUR(grant)} SEAI grant: ${EUR(panelsOnly - grant)}

## Solar PV + 5 kWh Battery Storage (${DOMESTIC_MIN_KWP} kWp)
- Higher self-consumption: roughly 70-85% rather than 30-50%
- Price: ${EUR(withBattery)}
- Price after the ${EUR(grant)} SEAI grant: ${EUR(withBattery - grant)}

## How the price scales
Larger systems cost less per kWp, because scaffolding, design, commissioning and the day's labour barely change between a small roof and a large one.
- ${DOMESTIC_MIN_KWP} kWp panels only: ${EUR(panelsOnly)}
- 6 kWp panels only: ${EUR(installCostEur(6))}
- 8 kWp panels only: ${EUR(installCostEur(8))}
- 9.7 kWp panels only (the standard domestic ESB connection limit): ${EUR(largest)}
- Battery storage, 5 kWh added to a system: about ${EUR(battery5)}

## What is included
- Free home survey and itemised quote
- Free AI electricity bill analysis
- SEAI grant application prepared and submitted on your behalf. Approval is SEAI's decision
- Installation by RECI-registered electricians, usually in a single day
- ESB Networks grid connection notification and the post-works BER assessment
- 25-year panel performance warranty; 5-year workmanship warranty (per our Terms)

## Grants and incentives
- SEAI Solar PV grant: ${EUR(grant)}, Republic of Ireland only (26 counties)
- Eligibility: owner-occupier, home built and occupied before 2021, its own MPRN, no previous solar funding at that MPRN. There is no minimum BER; a BER assessment is carried out after the work, before the grant is paid
- SEAI EV charger grant: EUR 300
- There is no standalone SEAI battery grant
- 0% VAT on domestic solar in Ireland
- Clean Export Guarantee: your supplier pays for surplus you export, at least ${SOLAR_DATA.export.label}

## How the grant is paid
SEAI pays the grant into the bank account nominated on the Request for Payment form, normally about 4 to 6 weeks after the post-works BER is published. By default that account is the homeowner's. A registered contractor may instead offer the price net of the grant, with their account nominated on that form. We confirm which applies at quote stage.

## Typical savings
- A typical 3-bed semi with a ${DOMESTIC_MIN_KWP} kWp system: ${SOLAR_DATA.savings.rangeLabel} a year, around ${SOLAR_DATA.savings.label} being typical
- Payback: about ${SOLAR_DATA.savings.paybackYears} years on a panels-only system
- Over 25 years: ${SOLAR_DATA.savings.range25yrLabel}
- Figures are estimates from your bill, not a quote. The survey confirms them.

Contact: ${SOLAR_DATA.provider.email}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
