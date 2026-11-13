/**
 * THE COUNTY GATE. Cal: "never allow this to happen again".
 * HARD RULES at the top of docs/county-page-playbook.md. Reviewers (human or
 * agent) run `bun run test` and quote this file's output before calling any
 * county page ready, graded or near-done.
 */
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { describe, it, expect, beforeAll } from 'vitest';
import { COUNTIES } from './index';
import { NATIONAL_FAQS } from '../national-faqs';
import { gate, assertCountyGate, swapTest, duplicatesAcross, IRISH_COUNTIES, MIN_LOCAL_FACTS, MIN_PROOF_ITEMS, MIN_LOCAL_FAQS } from './gate';
import type { CountyData } from './types';

const DIR = path.resolve(__dirname);
const pct = (n: number) => `${Math.round(n * 100)}%`;
const reports = COUNTIES.map((c) => gate(c, COUNTIES));

describe('county gate: readiness per county', () => {
  beforeAll(() => {
    // Printed on every run so a reviewer can quote it.
    const lines = reports.map((r) =>
      [
        `COUNTY GATE ${r.slug}: ${r.ready ? 'READY' : 'NOT READY'} (indexable=${r.indexable})`,
        `  unique county text: ${pct(r.uniqueShare)} of county-specific words pass the swap test; local words are ${pct(r.pageLocalShare)} of local plus national FAQ words`,
        ...r.reasons.map((x) => `  - ${x}`),
      ].join('\n'),
    );
    console.log(lines.join('\n'));
  });

  for (const r of reports) {
    const label = r.ready
      ? `${r.slug}: READY (indexable=${r.indexable}, unique ${pct(r.uniqueShare)} of county text, local ${pct(r.pageLocalShare)} vs national FAQs)`
      : `${r.slug}: NOT READY, ${r.reasons.length} blocker(s), indexable=${r.indexable} (unique ${pct(r.uniqueShare)} of county text, local ${pct(r.pageLocalShare)} vs national FAQs) | ${r.reasons.join(' | ')}`;
    it(label, () => {
      // (a) an indexable county must pass every rule; a blocked one must stay noindex.
      if (r.indexable) expect(r.reasons, `${r.slug} is indexable but fails the gate`).toEqual([]);
      else expect(r.indexable).toBe(false);
    });
  }
});

describe('county gate: rules', () => {
  it(`(a) indexable counties meet the minimums (${MIN_LOCAL_FACTS} facts, ${MIN_PROOF_ITEMS} proof, ${MIN_LOCAL_FAQS} local FAQs)`, () => {
    const bad = COUNTIES.filter((c) => c.indexable).filter(
      (c) => c.localFacts.length < MIN_LOCAL_FACTS || c.proofItems.length < MIN_PROOF_ITEMS || c.localFaqs.length < MIN_LOCAL_FAQS,
    );
    expect(bad.map((c) => c.slug)).toEqual([]);
  });

  it('(b) swap test: no indexable county string survives a name swap', () => {
    const fails = COUNTIES.filter((c) => c.indexable).flatMap((c) => swapTest(c, COUNTIES).map((f) => `${c.slug}.${f.field}: ${f.reason}`));
    expect(fails).toEqual([]);
  });

  it('(b) swap test catches a name-swapped template (self-check)', () => {
    const base = COUNTIES[0];
    const fake = (slug: string, name: string): CountyData => ({
      ...base,
      slug,
      name,
      towns: [],
      townsIntro: `We cover all of ${name}.`,
      localFacts: [],
      proofItems: [],
      localFaqs: [{ q: `Do I need planning permission for solar panels in ${name}?`, a: NATIONAL_FAQS[5].a, searchSource: 'test' }],
    });
    const a = fake('a', 'Leitrim');
    const b = fake('b', 'Sligo');
    const fails = swapTest(a, [a, b]).map((f) => f.field);
    expect(fails).toContain('townsIntro');
    expect(fails).toContain('localFaqs[0].q');
    expect(fails).toContain('localFaqs[0].a');
  });

  it('build guard: an indexable county that fails the gate throws (stops bun run build)', () => {
    const flipped = COUNTIES.map((c) => ({ ...c, indexable: true }));
    const anyBlocked = flipped.some((c) => !gate(c, flipped).ready);
    if (anyBlocked) expect(() => assertCountyGate(flipped)).toThrow(/County gate/);
    else expect(() => assertCountyGate(flipped)).not.toThrow();
  });

  it('(c) no proof item, local fact or local FAQ is duplicated across counties', () => {
    expect(duplicatesAcross(COUNTIES)).toEqual([]);
  });

  it('(d) no money or euro figure in a county data file', () => {
    const files = readdirSync(DIR).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && !['types.ts', 'index.ts', 'gate.ts'].includes(f));
    const hits = files.flatMap((f) =>
      readFileSync(path.join(DIR, f), 'utf8')
        .split('\n')
        .map((line, i) => ({ f, i: i + 1, line }))
        .filter(({ line }) => /€|\beuros?\b|\bEUR\b|\d+\s?(c|cent|cents)\b(?! ?(per|a) kwp)/i.test(line)),
    );
    expect(hits.map((h) => `${h.f}:${h.i}: ${h.line.trim()}`)).toEqual([]);
  });

  it('national FAQs never carry a county name', () => {
    const named = NATIONAL_FAQS.filter((f) => IRISH_COUNTIES.some((n) => new RegExp(`\\b${n}\\b`, 'i').test(`${f.q} ${f.a}`)));
    expect(named.map((f) => f.q)).toEqual([]);
  });

  it('the template never builds a FAQ by interpolating the county name', () => {
    const src = readFileSync(path.resolve(DIR, '../../components/county/CountyPage.tsx'), 'utf8');
    expect(src).not.toMatch(/q:\s*`[^`]*\$\{C\.name\}/);
  });
});
