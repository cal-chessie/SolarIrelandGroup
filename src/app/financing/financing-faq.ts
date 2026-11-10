import { installCostEur, homeGrant, DOMESTIC_MIN_KWP } from '@/lib/estimate';

/**
 * The financing answers, in one place, so the visible FAQ and the FAQPage
 * JSON-LD can never say different things.
 *
 * Truth rules for this file (9 Nov 2026):
 *  - No APR, no lender rate and no lender product is quoted. Every lender sets
 *    its own rate and terms; the page used to print "5.5% to 8.9% APR" and
 *    "100% finance up to €15,000", which nobody had sourced.
 *  - The SBCI Home Energy Upgrade Loan Scheme does NOT fund solar PV on its
 *    own (sbci.gov.ie, seai.ie). Solar can only ride along as part of a deeper
 *    retrofit. The page used to say the opposite.
 *  - Prices come from the engine, never typed.
 */
const GROSS = installCostEur(DOMESTIC_MIN_KWP);
const NET = GROSS - homeGrant(DOMESTIC_MIN_KWP);
const eur = (n: number) => `€${n.toLocaleString('en-IE')}`;

export const FINANCING_ANSWER =
  'Yes. Irish banks and credit unions offer green and home improvement loans that can pay for solar panels; each lender sets its own rate and term. The SEAI grant of €1,800 is paid after the work, so you may need to borrow the full price at first. The SBCI Home Energy Upgrade Loan does not cover solar on its own.';

export const FINANCING_FAQS: { q: string; a: string }[] = [
  {
    q: 'Can I get a loan for solar panels in Ireland?',
    a: `Yes. Irish banks and credit unions offer personal, green and home improvement loans that can be used for solar panels. Each lender sets its own interest rate, term and conditions, so compare the APR each one quotes you rather than any figure you see advertised. A ${DOMESTIC_MIN_KWP} kWp system costs ${eur(GROSS)} installed, or ${eur(NET)} after the €1,800 SEAI grant, which tells you roughly how much you would need to borrow.`,
  },
  {
    q: 'Does the Home Energy Upgrade Loan cover solar panels?',
    a: 'Not on its own. The SBCI Home Energy Upgrade Loan Scheme, offered through participating banks and credit unions, is for energy upgrades that have an SEAI grant. Loans for solar PV panels only are not eligible. Solar can be included as part of a deeper retrofit, for example alongside insulation and a heat pump. Check the current rules at sbci.gov.ie and seai.ie.',
  },
  {
    q: 'How does the SEAI grant work with a loan?',
    a: `SEAI pays the €1,800 grant after the work is done: once your completion documents and the post-works BER are in, SEAI says to allow 4 to 6 weeks for payment. A battery of 5 kWh or more adds a flat €600 SEAI battery grant on the same application, so solar and battery together can reach €2,400. By default it goes into your own bank account, so the usual pattern is that you pay, or borrow, the full ${eur(GROSS)} for a ${DOMESTIC_MIN_KWP} kWp system and the grant follows, which you can then put against the loan. A registered contractor can instead offer the price net of the grant, in which case you borrow ${eur(NET)}. Ask which applies before you arrange finance.`,
  },
  {
    q: 'Is it better to pay upfront or finance solar panels?',
    a: 'Paying upfront gives the best return, because there is no interest: a typical system pays for itself in about 6 to 7 years. A loan can still make sense if the monthly saving on your electricity bill is close to, or more than, the monthly repayment. Whether it is depends on the rate and term your lender offers, so use the calculator on this page with the rate you are actually quoted.',
  },
  {
    q: 'Can I add solar to my mortgage?',
    a: 'Some lenders offer mortgage top-ups or green mortgage options that can fund energy upgrades. Mortgage rates are usually lower than personal loan rates, but spreading a small amount over a long term can mean paying more interest in total. Ask your mortgage lender what it offers and compare the total cost of credit, not just the monthly figure.',
  },
  {
    q: 'What if I sell my house before the loan is paid off?',
    a: 'A personal or green loan is a loan to you, not to the house, so it stays with you when you sell; you would normally clear it from the sale proceeds or keep repaying it. The panels and the better BER stay with the house. We do not put a euro figure on what solar adds to a sale price, because that depends on the property and the market.',
  },
];
