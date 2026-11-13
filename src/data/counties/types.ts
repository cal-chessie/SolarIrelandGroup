/**
 * One county service page = one data file. The template is
 * src/components/county/CountyPage.tsx; the route is /counties/[county].
 *
 * HARD RULES: read the top of docs/county-page-playbook.md before touching
 * any county. Every county-specific field must stop being true if another
 * county's name is put in. Text that is true for every county is national and
 * lives once in src/data/national-faqs.ts or the template, never here.
 * The county gate (src/data/counties/gate.ts, tested by county-gate.test.ts)
 * blocks indexable: true until the minimums below are met.
 */

/** A local fact from an official, dated source (CSO, SEAI, PVGIS, county council, SEC, ESB Networks). */
export interface LocalFact {
  /** Our own words. One fact, figure first. Must stop being true in another county. */
  text: string;
  /** The publisher and document, e.g. "CSO, Census 2022 Profile 2". */
  source: string;
  /** Direct https link to the source. */
  sourceUrl: string;
  /** When the source is dated, ISO year-month or date, e.g. "2024-01". */
  date: string;
}

/** Real, permissioned proof. Never templated, never reused, never faked. */
export interface ProofItem {
  kind: 'install' | 'photo' | 'sponsorship' | 'press';
  /** What it is, in our words: town, system, month, result; or the club and what we fund. */
  text: string;
  /** Where it happened in the county. */
  town: string;
  /** When it happened, ISO year-month or date. */
  date: string;
  /** Written permission on file. Without it the item does not count. */
  permission: {
    /** Who gave permission (role, not a private name, e.g. "homeowner", "club secretary"). */
    grantedBy: string;
    /** Where the written permission is kept, e.g. a signed form reference. */
    evidence: string;
    date: string;
  };
  /** Optional public link (press article, club page). */
  url?: string;
}

/** A question people in this county actually ask. National questions do not belong here. */
export interface LocalFaq {
  q: string;
  a: string;
  /** Where the question came from: Search Console query, People Also Ask, county development plan section. */
  searchSource: string;
}

export interface CountyData {
  slug: string;
  name: string;
  province: 'Connacht' | 'Leinster' | 'Munster' | 'Ulster';
  /**
   * Preview flag. false = noindex and out of the sitemap. Flip at go-live,
   * and only when the county gate passes (the build throws otherwise).
   */
  indexable: boolean;
  /** sitemap lastmod, ISO date. Change it only when the page content changes. */
  updated: string;
  wikipedia: string;
  pvgis: {
    /** The point PVGIS was queried at: the county town. */
    place: string;
    lat: number;
    lon: number;
    api: string;
    fetched: string;
    kwhPerKwp: number;
    monthlyKwhPerKwp: readonly number[];
    /** The Dublin reference, same settings, for the comparison. */
    dublinKwhPerKwp: number;
  };
  /** Real towns served, confirmed by the installer. */
  towns: readonly string[];
  /** One sentence on where the county runs, naming real places in it. */
  townsIntro: string;
  /** Minimum 3 for indexable. Official, dated, sourced. Leave empty rather than invent. */
  localFacts: readonly LocalFact[];
  /** Minimum 2 for indexable. Real and permissioned only. */
  proofItems: readonly ProofItem[];
  /** Minimum 2 for indexable. From real local search data, each with its searchSource. */
  localFaqs: readonly LocalFaq[];
}
