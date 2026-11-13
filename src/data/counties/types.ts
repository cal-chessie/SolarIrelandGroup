/**
 * One county service page = one data file. The template is
 * src/components/county/CountyPage.tsx; the route is /counties/[county].
 * Every field here must be true, local and sourced. See docs/county-page-playbook.md.
 */
export interface CountyData {
  slug: string;
  name: string;
  province: 'Connacht' | 'Leinster' | 'Munster' | 'Ulster';
  /** Preview flag. false = noindex and out of the sitemap. Flip at go-live. */
  indexable: boolean;
  /** sitemap lastmod, ISO date. Change it whenever the page content changes. */
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
  towns: readonly string[];
  /** One sentence on where the county runs, for the towns section. */
  townsIntro: string;
  /** Local substance: why homes here suit (or do not suit) solar. Plain, true. */
  housingNote: string;
  /** The farm and business angle for this county. */
  farmNote: string;
  /** Extra county-only questions, real searches only. Merged after the shared ones. */
  extraFaqs?: readonly { q: string; a: string }[];
}
