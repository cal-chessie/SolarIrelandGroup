/**
 * The blog slugs that exist, as a tiny standalone module.
 *
 * middleware.ts needs this to 404 unknown /blog/* URLs, and it cannot import
 * blog-data.ts: that file is ~4,800 lines of article bodies and middleware
 * runs on every document request. Generated from blog-data.ts by
 * scripts/gen-blog-slugs.ts; re-run it when articles change.
 */
export const BLOG_SLUGS: ReadonlySet<string> = new Set([
  'are-solar-panels-worth-it-ireland-2026',
  'battery-storage-is-it-worth-the-extra-cost',
  'best-time-of-year-to-get-solar-panels-ireland',
  'clean-export-guarantee-explained',
  'complete-guide-seai-solar-grant-2026',
  'do-solar-panels-improve-ber-rating-ireland',
  'east-vs-south-vs-west-facing-roofs-solar',
  'how-many-solar-panels-do-i-need-ireland',
  'how-much-do-solar-panels-cost-ireland-2026',
  'how-to-read-electricity-bill-ireland-solar',
  'longi-vs-jinko-vs-trina-best-solar-panels',
  'nc6-form-solar-grid-connection-ireland',
  'planning-permission-solar-panels-ireland',
  'seai-grant-stay-e1800-2026-what-it-means',
  'smart-meter-required-solar-panels-ireland',
  'solar-panel-installation-process-ireland',
  'solar-panels-3-bed-semi-ireland-cost',
  'solar-panels-and-heat-pumps-perfect-partnership',
  'solar-panels-cork-complete-guide',
  'solar-panels-dublin-ultimate-guide',
  'solar-panels-ev-charger-ireland',
  'solar-panels-in-winter-do-they-work',
  'solar-panels-rental-property-landlord-guide',
]);
