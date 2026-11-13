import { estimate, usageFromMonthlyBill, fmtEur } from '@/lib/estimate';
import { SOLAR_DATA, ndmgDoubledLine, ndmgDoubledLive } from '@/lib/solar-data';

/**
 * National questions: the answers are the same in every county, so they are
 * written once, here, and rendered on every county page under a "National
 * questions" heading. NEVER interpolate a county name into these. A question
 * that only works with a county name dropped in is not a county question; it
 * belongs here, phrased for Ireland. See the HARD RULES at the top of
 * docs/county-page-playbook.md. The county gate test fails if any Irish
 * county name appears in this list.
 */
export interface NationalFaq {
  q: string;
  a: string;
}

const FOUR = estimate({ annualUsageKwh: usageFromMonthlyBill(160), systemSizeKwp: 4 });
const GRANT = SOLAR_DATA.grant.label;
const BATTERY = SOLAR_DATA.batteryGrant;

export const NATIONAL_FAQS: readonly NationalFaq[] = [
  {
    q: 'Are solar panels worth it in Ireland?',
    a: `For most homes, yes. Homes that use power during the day do best, because power used at home saves the full import rate. The estimator on this page runs your bill through the Bill Analyser's engine with this county's own PVGIS yield, after the ${GRANT} SEAI grant.`,
  },
  {
    q: 'How much do solar panels cost in Ireland?',
    a: `A 4 kWp system is ${fmtEur(FOUR.installCostEur)} installed, or ${fmtEur(FOUR.costAfterGrantEur)} after the ${GRANT} SEAI grant. Domestic solar carries 0% VAT. Larger systems cost more in total but less per kWp. The Bill Analyser sizes the system to your own usage.`,
  },
  {
    q: 'Do solar panels work in winter?',
    a: 'They work, but they make far less. In Ireland a south-facing system makes several times more in May than in December, and most of the year\'s saving comes from March to September. The yield table on this page shows the figures for this county.',
  },
  {
    q: 'Who can get the SEAI solar grant?',
    a: `The SEAI Solar Electricity Grant pays up to ${GRANT} for homes built and occupied before 2025, and a battery of ${BATTERY.minLabel} adds ${BATTERY.label} on the same application, up to ${BATTERY.withSolarMaxLabel} in total. You apply on seai.ie and get approval before any work starts.`,
  },
  {
    q: 'Do I need to tell ESB Networks before I install solar?',
    a: 'Yes, and the installer does it. A home system up to 6 kW on a single-phase supply (11 kW on three-phase) is notified to ESB Networks on the NC6 form. Bigger systems need an NC7 application and ESB Networks approval before connection.',
  },
  {
    q: 'Do I need planning permission for solar panels on a house?',
    a: 'For almost every house, no. Rooftop solar on a house has been exempt from planning permission since October 2022, with no limit on panel area, subject to standard conditions. Homes in a solar safeguarding zone near an airport or a protected structure follow different rules.',
  },
  {
    q: 'Can a farm or business get a solar grant?',
    a: ndmgDoubledLive()
      ? `Yes. ${ndmgDoubledLine()} Farms can also look at TAMS, run by the Department of Agriculture. Our guide compares the two.`
      : 'Yes. Businesses can apply for the SEAI Non-Domestic Microgen Grant, and farms can look at TAMS from the Department of Agriculture. Our guide compares the two.',
  },
];
