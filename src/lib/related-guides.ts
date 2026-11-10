/**
 * "Related guides" at the end of every blog post: three links chosen by topic
 * cluster, not by the loose category field (Cal, 10 Nov 2026).
 *
 * Search Console showed 411 internal links, nearly all nav and footer. These
 * clusters give every post three in-topic links in the server HTML.
 *
 * Each cluster lists its core guides first (the ones named in the brief),
 * then the posts that sit nearest to it. A post picks the next three core
 * entries after its own position, so links spread across the cluster rather
 * than every post pointing at the same first three.
 */
import { articles, getArticleBySlug } from '@/lib/blog-data';

export interface RelatedGuide {
  href: string;
  title: string;
  excerpt: string;
  category: string;
  iconBg: string;
  iconColor: string;
  /** Blog posts carry a date and read time; site pages carry a short label. */
  date?: string;
  readTime?: string;
  label?: string;
}

/** Site pages that belong in a cluster. Copy is the page's own meta description. */
const PAGES: Record<string, RelatedGuide> = {
  '/financing': {
    href: '/financing',
    title: 'Solar Panel Loans Ireland: Monthly Repayment Calculator',
    excerpt:
      'Work out monthly repayments on a solar loan in Ireland, compare paying upfront against finance, and see what the €1,800 SEAI grant takes off the total.',
    category: 'financing',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
    label: 'Repayment calculator',
  },
  '/counties/roscommon': {
    href: '/counties/roscommon',
    title: 'Solar Panel Installers in Roscommon',
    excerpt:
      'Solar panel installers in County Roscommon. Upload your bill and see what solar would save you, with the €1,800 SEAI grant applied. Honest local quotes.',
    category: 'county',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
    label: 'County guide',
  },
};

type Cluster = { core: string[]; near: string[] };

/** Entries are blog slugs, or site paths starting with "/". */
export const CLUSTERS: Record<string, Cluster> = {
  grant: {
    core: [
      'complete-guide-seai-solar-grant-2026',
      'seai-battery-grant-600-explained',
      'nc6-form-solar-grid-connection-ireland',
      'smart-meter-required-solar-panels-ireland',
      'what-is-my-mprn-number-ireland',
      'clean-export-guarantee-explained',
      'do-solar-panels-improve-ber-rating-ireland',
      'solar-panels-rental-property-landlord-guide',
    ],
    near: ['seai-grant-stay-e1800-2026-what-it-means', 'planning-permission-solar-panels-ireland'],
  },
  cost: {
    core: [
      'how-much-do-solar-panels-cost-ireland-2026',
      'how-many-solar-panels-do-i-need-ireland',
      'solar-panels-3-bed-semi-ireland-cost',
      'are-solar-panels-worth-it-ireland-2026',
      '/financing',
    ],
    near: [
      'battery-storage-is-it-worth-the-extra-cost',
      'do-solar-panels-add-value-to-your-home-ireland',
      'how-to-read-electricity-bill-ireland-solar',
      'longi-vs-jinko-vs-trina-best-solar-panels',
    ],
  },
  performance: {
    core: [
      'solar-panels-in-winter-do-they-work',
      'east-vs-south-vs-west-facing-roofs-solar',
      'best-time-of-year-to-get-solar-panels-ireland',
      'solar-panel-maintenance-ireland-do-they-need-cleaning',
    ],
    near: [
      'solar-panel-installation-process-ireland',
      'solar-panels-ev-charger-ireland',
      'solar-panels-and-heat-pumps-perfect-partnership',
    ],
  },
  local: {
    core: ['solar-panels-dublin-ultimate-guide', 'solar-panels-cork-complete-guide', '/counties/roscommon'],
    near: [],
  },
};

/** Local guides have only two posts and a county page: the SEAI guide fills the third slot. */
const LOCAL_FILL = 'complete-guide-seai-solar-grant-2026';

export function clusterOf(slug: string): string | null {
  for (const [name, c] of Object.entries(CLUSTERS)) {
    if (c.core.includes(slug) || c.near.includes(slug)) return name;
  }
  return null;
}

function toGuide(entry: string): RelatedGuide | null {
  if (entry.startsWith('/')) return PAGES[entry] ?? null;
  const a = getArticleBySlug(entry);
  if (!a) return null;
  return {
    href: `/blog/${a.slug}`,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    iconBg: a.iconBg,
    iconColor: a.iconColor,
    date: a.date,
    readTime: a.readTime,
  };
}

export function getRelatedGuides(slug: string, limit = 3): RelatedGuide[] {
  const name = clusterOf(slug);
  const picks: string[] = [];
  if (name) {
    const { core } = CLUSTERS[name];
    const at = core.indexOf(slug);
    // Start after the post's own place in the core list; a near post starts at 0.
    for (let i = 1; i <= core.length && picks.length < limit; i += 1) {
      const e = core[(Math.max(at, -1) + i + core.length) % core.length];
      if (e !== slug && !picks.includes(e)) picks.push(e);
    }
    if (name === 'local' && picks.length < limit && slug !== LOCAL_FILL) picks.push(LOCAL_FILL);
  }
  // Any post outside the clusters (none today) falls back to the newest posts.
  for (const a of articles) {
    if (picks.length >= limit) break;
    if (a.slug !== slug && !picks.includes(a.slug)) picks.push(a.slug);
  }
  return picks.map(toGuide).filter((g): g is RelatedGuide => g !== null).slice(0, limit);
}
