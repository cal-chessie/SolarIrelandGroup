import { describe, it, expect } from 'vitest';
import { articles, type Article } from '@/lib/blog-data';
import { estimate, installCostEur, seaiGrant, homeGrant, PRICING } from '@/lib/estimate';
import { SOLAR_DATA, WELFARE_HIGHER_GRANT } from '@/lib/solar-data';

// Every euro and panel figure a post states must agree with the one engine
// (src/lib/estimate.ts). Before 16 Nov 2026 the posts quoted the yearly saving
// as €800 to €1,400, €920, €975 and €1,000, and 4 kWp as 9 or 10 panels.
// The checks parse a few key sentence shapes, sentence by sentence, and assert
// against the engine's functions rather than literals, so a pricing change in
// the engine flags every post that has gone stale. See docs/fact-sheet.md.

const eur = (s: string) => Number(s.replace(/[€,\s]/g, ''));

/** Every human-visible string in a post, split into sentences. */
function sentences(a: Article): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  const push = (where: string, t?: string) => {
    if (!t) return;
    const plain = t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
    for (const s of plain.split(/(?<=[.!?])\s+/)) out.push({ where, text: s });
  };
  push('seoDescription', a.seoDescription);
  push('answer', a.answer);
  push('excerpt', a.excerpt);
  a.content.forEach((c, i) => {
    if (c.type === 'paragraph') push(`content[${i}]`, c.text);
    if (c.type === 'callout') push(`content[${i}]`, c.body);
    if (c.type === 'bulletList' || c.type === 'numberedList') c.items.forEach((t) => push(`content[${i}]`, t));
  });
  return out;
}

// Business and farm posts quote the commercial engine and NDMG tables.
const domestic = articles.filter((a) => !/business|farm/.test(a.slug));

/** The engine's yearly benefit for a size, across every home it could sit on. */
function savingBand(kwp: number): [number, number] {
  let lo = Infinity;
  let hi = 0;
  for (let u = 2000; u <= 12000; u += 250) {
    const t = estimate({ annualUsageKwh: u, systemSizeKwp: kwp }).totalAnnualBenefitEur;
    lo = Math.min(lo, t);
    hi = Math.max(hi, t);
  }
  return [lo * 0.95, hi * 1.05];
}

describe('blog figures agree with the engine', () => {
  it('no post quotes the retired €800 to €1,400 range as a typical saving', () => {
    const bad: string[] = [];
    for (const a of domestic) {
      for (const s of sentences(a)) {
        if (/(€|EUR\s?)?800\s?(?:-|–|to)\s?(?:€|EUR\s?)?1,?400/.test(s.text)) bad.push(`${a.slug} ${s.where}: ${s.text}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('a stated yearly saving for an N kWp system sits inside the engine band for N kWp', () => {
    const bad: string[] = [];
    const re = /(\d+(?:\.\d)?)\s?kWp[^.]{0,80}?\bsaves?\b(?: about| roughly)?\s€([\d,]+)\s(?:a|per)\syear/i;
    for (const a of domestic) {
      for (const s of sentences(a)) {
        const m = s.text.match(re);
        if (!m) continue;
        const [lo, hi] = savingBand(Number(m[1]));
        const v = eur(m[2]);
        if (v < lo || v > hi) bad.push(`${a.slug} ${s.where}: ${m[0]} (engine ${Math.round(lo)} to ${Math.round(hi)})`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('an installed price or net cost for an N kWp panels-only system matches installCostEur and the grant', () => {
    const bad: string[] = [];
    const reInstalled = /(\d+(?:\.\d)?)\s?kWp[^.€]{0,40}?(?:costs|is)\s€([\d,]+)(?:\s(?:installed|before))/gi;
    const reNet = /(\d+(?:\.\d)?)\s?kWp[^.]{0,80}?€([\d,]+)\s(?:after the|net)\b/gi;
    for (const a of domestic) {
      for (const s of sentences(a)) {
        if (/batter/i.test(s.text)) continue; // a priced battery is a different case
        for (const m of s.text.matchAll(reInstalled)) {
          const k = Number(m[1]);
          if (eur(m[2]) !== installCostEur(k)) bad.push(`${a.slug} ${s.where}: ${m[0]} (engine ${installCostEur(k)})`);
        }
        for (const m of s.text.matchAll(reNet)) {
          const k = Number(m[1]);
          const net = installCostEur(k) - seaiGrant(k);
          // "€8,200 installed, €6,400 after" puts both figures in one match window;
          // only the figure right before "after"/"net" is the net cost.
          if (eur(m[2]) !== net) bad.push(`${a.slug} ${s.where}: ${m[0]} (engine net ${net})`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('every grant total quoted is one SEAI actually pays', () => {
    const allowed = new Set([
      SOLAR_DATA.grant.amount,
      SOLAR_DATA.batteryGrant.amount,
      homeGrant(4, 5),
      WELFARE_HIGHER_GRANT.solarMaxEur,
      WELFARE_HIGHER_GRANT.totalMaxEur,
      SOLAR_DATA.ndmgDoubled.maxEur,
      300, // the SEAI EV charger grant
    ]);
    const bad: string[] = [];
    const re = /(?:grants?\s(?:of\s)?up to|SEAI pays up to)\s€([\d,]+)/gi;
    for (const a of articles) {
      for (const s of sentences(a)) {
        for (const m of s.text.matchAll(re)) if (!allowed.has(eur(m[1]))) bad.push(`${a.slug} ${s.where}: ${m[0]}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('a 4 kWp system is stated as the engine panel count', () => {
    const panels4 = Math.round((4 * 1000) / PRICING.panelWatts);
    const bad: string[] = [];
    const after = /(?<![\d.])4\s?kWp[^.\d]{0,20}?(?:\(|,\s)(?:about\s)?(\d+)(?:\s?(?:-|–|to)\s?(\d+))?\spanels/gi;
    const before = /\b(\d+)\spanels,\sa\s4\s?kWp\b/gi;
    const check = (a: Article, where: string, text: string) => {
      for (const m of text.matchAll(after)) if (Number(m[1]) !== panels4 || m[2]) bad.push(`${a.slug} ${where}: ${m[0]}`);
      for (const m of text.matchAll(before)) if (Number(m[1]) !== panels4) bad.push(`${a.slug} ${where}: ${m[0]}`);
    };
    for (const a of domestic) {
      for (const s of sentences(a)) check(a, s.where, s.text);
      a.content.forEach((c, i) => {
        if (c.type !== 'table') return;
        c.rows.forEach((r) => {
          // A row that is exactly a 4 kWp size, with a panel count cell.
          if (!/^4\s?kWp\b/i.test(r[0]) || /4\.\d|[-–]/.test(r[0])) return;
          const cell = r.find((x) => /\bpanels\b/.test(x)) ?? r[0];
          const m = cell.match(/(\d+)(?:\s?(?:-|–|to)\s?(\d+))?\spanels/);
          if (m && (Number(m[1]) !== panels4 || m[2])) bad.push(`${a.slug} content[${i}] table: ${r.join(' | ')}`);
        });
      });
    }
    expect(bad).toEqual([]);
  });
});
