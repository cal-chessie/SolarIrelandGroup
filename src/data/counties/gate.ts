import type { CountyData } from './types';
import { NATIONAL_FAQS } from '../national-faqs';

/**
 * THE COUNTY GATE. Read the HARD RULES at the top of docs/county-page-playbook.md.
 *
 * A county page may only be indexable when it carries real local substance:
 * official dated facts, permissioned proof and real local questions, none of
 * them name-swappable and none reused from another county. This module is pure
 * so the same rules run in the test (src/data/counties/county-gate.test.ts) and
 * at build time (src/data/counties/index.ts throws if an indexable county fails).
 */

export const MIN_LOCAL_FACTS = 3;
export const MIN_PROOF_ITEMS = 2;
export const MIN_LOCAL_FAQS = 2;

/** The 26 counties of the Republic, for the national-text checks. */
export const IRISH_COUNTIES = [
  'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
  'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
] as const;

export const PLACEHOLDER = '{{COUNTY}}';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Put the placeholder where the county name was. */
export function swapName(text: string, name: string): string {
  return text.replace(new RegExp(`\\b${esc(name)}\\b`, 'gi'), PLACEHOLDER);
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** Every county-specific string the page shows, labelled. */
export function countyStrings(c: CountyData): { field: string; text: string }[] {
  return [
    { field: 'townsIntro', text: c.townsIntro },
    ...c.localFacts.map((f, i) => ({ field: `localFacts[${i}]`, text: f.text })),
    ...c.proofItems.map((p, i) => ({ field: `proofItems[${i}]`, text: p.text })),
    ...c.localFaqs.flatMap((f, i) => [
      { field: `localFaqs[${i}].q`, text: f.q },
      { field: `localFaqs[${i}].a`, text: f.a },
    ]),
  ];
}

/**
 * Local anchors: something in the text other than the county name that ties
 * it to this county. A town served (other than one named after the county), a
 * figure (a dated statistic, a plan year), or an Irish county named as a
 * comparison. A string with none of these is the county name on national text.
 */
function hasLocalAnchor(text: string, c: CountyData): boolean {
  const swapped = swapName(text, c.name);
  if (/\d/.test(swapped)) return true;
  const towns = c.towns.filter((t) => !new RegExp(`\\b${esc(c.name)}\\b`, 'i').test(t));
  return towns.some((t) => new RegExp(`\\b${esc(t)}\\b`, 'i').test(swapped));
}

export interface SwapResult {
  field: string;
  text: string;
  reason: string;
}

/**
 * The swap test. A county string fails when, with the county name swapped
 * for a placeholder, it (a) matches another county's string (a template),
 * (b) matches a national FAQ (national text dressed with the name), or
 * (c) has no local anchor left (only the name made it "local").
 */
export function swapTest(c: CountyData, all: readonly CountyData[]): SwapResult[] {
  const others = all.filter((o) => o.slug !== c.slug);
  const otherSwapped = new Set(others.flatMap((o) => countyStrings(o).map((s) => norm(swapName(s.text, o.name)))));
  const national = new Set(NATIONAL_FAQS.flatMap((f) => [norm(f.q), norm(f.a)]));
  // National text with the name dropped in: "in Roscommon" for "in Ireland", or the name simply added.
  const asNational = (n: string) => [
    n.replaceAll(PLACEHOLDER.toLowerCase(), 'ireland'),
    norm(n.replaceAll(` in ${PLACEHOLDER.toLowerCase()}`, '').replaceAll(PLACEHOLDER.toLowerCase(), '')),
  ];
  const fails: SwapResult[] = [];
  for (const s of countyStrings(c)) {
    const n = norm(swapName(s.text, c.name));
    if (otherSwapped.has(n)) fails.push({ ...s, reason: 'identical to another county once the name is swapped (template)' });
    else if (asNational(n).some((x) => national.has(x)))
      fails.push({ ...s, reason: 'national text with the county name dropped in' });
    else if (!hasLocalAnchor(s.text, c)) fails.push({ ...s, reason: 'stays true for any county: no town, figure or local anchor besides the name' });
  }
  return fails;
}

/** Text that appears in more than one county (facts, proof, FAQs are never reused). */
export function duplicatesAcross(all: readonly CountyData[]): string[] {
  const seen = new Map<string, string>();
  const dups: string[] = [];
  for (const c of all) {
    const items = [
      ...c.localFacts.map((f) => f.text),
      ...c.proofItems.map((p) => p.text),
      ...c.localFaqs.flatMap((f) => [f.q, f.a]),
    ];
    for (const t of items) {
      const k = norm(swapName(t, c.name));
      const prev = seen.get(k);
      if (prev && prev !== c.slug) dups.push(`${c.slug} repeats ${prev}: "${t}"`);
      else seen.set(k, c.slug);
    }
  }
  return dups;
}

export interface GateReport {
  slug: string;
  indexable: boolean;
  ready: boolean;
  reasons: string[];
  /** Share of county-specific words that pass the swap test. */
  uniqueShare: number;
  /** County-specific words that pass the swap test / those plus the national FAQ words on the page. */
  pageLocalShare: number;
}

export function gate(c: CountyData, all: readonly CountyData[]): GateReport {
  const reasons: string[] = [];

  const facts = c.localFacts.filter((f) => f.text.trim() && f.source.trim() && /^https:\/\//.test(f.sourceUrl) && f.date.trim());
  if (facts.length < c.localFacts.length) reasons.push(`${c.localFacts.length - facts.length} local fact(s) missing source, https sourceUrl or date`);
  if (facts.length < MIN_LOCAL_FACTS) reasons.push(`localFacts ${facts.length}/${MIN_LOCAL_FACTS}: needs official, dated, sourced local facts`);

  const proof = c.proofItems.filter((p) => p.text.trim() && p.permission.evidence.trim() && p.permission.grantedBy.trim() && p.permission.date.trim());
  if (proof.length < c.proofItems.length) reasons.push(`${c.proofItems.length - proof.length} proof item(s) without written permission evidence`);
  if (proof.length < MIN_PROOF_ITEMS) reasons.push(`proofItems ${proof.length}/${MIN_PROOF_ITEMS}: needs real, permissioned installs, photos, sponsorships or press`);

  const faqs = c.localFaqs.filter((f) => f.q.trim() && f.a.trim() && f.searchSource.trim());
  if (faqs.length < c.localFaqs.length) reasons.push(`${c.localFaqs.length - faqs.length} local FAQ(s) without a searchSource`);
  if (faqs.length < MIN_LOCAL_FAQS) reasons.push(`localFaqs ${faqs.length}/${MIN_LOCAL_FAQS}: needs questions from real local search data`);

  const swaps = swapTest(c, all);
  for (const s of swaps) reasons.push(`swap test failed on ${s.field}: ${s.reason}`);

  for (const d of duplicatesAcross(all).filter((d) => d.startsWith(`${c.slug} `))) reasons.push(`duplicate: ${d}`);

  const strings = countyStrings(c);
  const failed = new Set(swaps.map((s) => s.field));
  const total = strings.reduce((n, s) => n + words(s.text), 0);
  const passing = strings.filter((s) => !failed.has(s.field)).reduce((n, s) => n + words(s.text), 0);
  const national = NATIONAL_FAQS.reduce((n, f) => n + words(f.q) + words(f.a), 0);

  return {
    slug: c.slug,
    indexable: c.indexable,
    ready: reasons.length === 0,
    reasons,
    uniqueShare: total ? passing / total : 0,
    pageLocalShare: passing / (passing + national),
  };
}

/** Build-time guard: an indexable county that fails the gate stops the build. */
export function assertCountyGate(all: readonly CountyData[]): void {
  const blocked = all.map((c) => gate(c, all)).filter((r) => r.indexable && !r.ready);
  if (blocked.length) {
    throw new Error(
      `County gate: indexable county page(s) fail the gate. Set indexable: false or fix the data. ` +
        `See the HARD RULES at the top of docs/county-page-playbook.md.\n` +
        blocked.map((r) => `- ${r.slug}: ${r.reasons.join('; ')}`).join('\n'),
    );
  }
}
