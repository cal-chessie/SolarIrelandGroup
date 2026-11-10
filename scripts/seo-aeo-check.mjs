#!/usr/bin/env node
/**
 * SEO/AEO gate for the 9 Nov 2026 pass.
 *
 * Renders every page the pass touched (against a running server) and prints:
 *   - <title> length (target 50 to 60) and meta description length (140 to 155)
 *   - whether og:title / og:description match the <title> / description
 *   - every JSON-LD block: does it parse, and what @type it carries
 *   - canonical href, and any noindex
 *   - em dashes in the title/description (never allowed)
 * Exits 1 if anything fails.
 *
 * Usage:  bun run build && bun run start   (in another terminal)
 *         node scripts/seo-aeo-check.mjs [baseUrl]    default http://localhost:3000
 */
const BASE = process.argv[2] || 'http://localhost:3000';

const PAGES = [
  '/',
  '/solar-calculator',
  '/financing',
  '/about',
  '/contact',
  '/blog/are-solar-panels-worth-it-ireland-2026',
  '/blog/solar-panel-installation-process-ireland',
  '/blog/do-solar-panels-improve-ber-rating-ireland',
  '/blog/solar-panels-cork-complete-guide',
  '/blog/nc6-form-solar-grid-connection-ireland',
  '/blog/solar-panels-3-bed-semi-ireland-cost',
  '/blog/solar-panels-ev-charger-ireland',
  '/blog/complete-guide-seai-solar-grant-2026',
  '/blog/how-much-do-solar-panels-cost-ireland-2026',
  '/blog/solar-panels-in-winter-do-they-work',
  '/blog/clean-export-guarantee-explained',
  '/blog/east-vs-south-vs-west-facing-roofs-solar',
  '/blog/planning-permission-solar-panels-ireland',
  '/blog/solar-panels-dublin-ultimate-guide',
  '/blog/smart-meter-required-solar-panels-ireland',
  '/blog/how-many-solar-panels-do-i-need-ireland',
  '/blog/best-time-of-year-to-get-solar-panels-ireland',
  '/blog/solar-panels-rental-property-landlord-guide',
  '/blog/solar-panel-maintenance-ireland-do-they-need-cleaning',
  '/blog/what-is-my-mprn-number-ireland',
  // 10 Nov 2026 feedback batches: pages changed, and the two new pages.
  '/services',
  '/counties',
  '/counties/roscommon',
  '/commercial-solar-grant',
  '/blog/seai-battery-grant-600-explained',
  '/blog/do-solar-panels-add-value-to-your-home-ireland',
  '/blog/how-to-read-electricity-bill-ireland-solar',
  '/blog/battery-storage-is-it-worth-the-extra-cost',
  '/blog/solar-panels-and-heat-pumps-perfect-partnership',
  '/blog/seai-grant-stay-e1800-2026-what-it-means',
  // Must be UNCHANGED (on hold): reported, not length-gated.
  '/blog/longi-vs-jinko-vs-trina-best-solar-panels',
];
// Reported, not length-gated: the on-hold post, and pages the 10 Nov batches
// touched only in body copy whose meta predates the 9 Nov pass (their
// lengths and og mismatches are pre-existing, logged in
// INTAKE/seo/google-safety-check.md, and out of the batches' scope).
const HOLD = new Set([
  '/blog/longi-vs-jinko-vs-trina-best-solar-panels',
  '/services',
  '/counties',
  '/counties/roscommon',
  '/blog/do-solar-panels-add-value-to-your-home-ireland',
  '/blog/battery-storage-is-it-worth-the-extra-cost',
  '/blog/seai-grant-stay-e1800-2026-what-it-means',
]);

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const meta = (html, attr, name) => {
  const re = new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, 'i');
  const re2 = new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${name}"`, 'i');
  const m = html.match(re) || html.match(re2);
  return m ? decode(m[1]) : null;
};

let failed = 0;
for (const path of PAGES) {
  const res = await fetch(BASE + path);
  const html = await res.text();
  const title = decode((html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '');
  const desc = meta(html, 'name', 'description') || '';
  const ogTitle = meta(html, 'property', 'og:title');
  const ogDesc = meta(html, 'property', 'og:description');
  const robots = meta(html, 'name', 'robots') || '';
  const canonical = ((html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i) || [])[1]) || '(none)';
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);

  const problems = [];
  if (res.status !== 200) problems.push(`HTTP ${res.status}`);
  if (!HOLD.has(path)) {
    if (title.length < 50 || title.length > 60) problems.push(`title ${title.length}`);
    if (desc.length < 140 || desc.length > 155) problems.push(`desc ${desc.length}`);
    if (ogTitle !== title) problems.push('og:title != title');
    if (ogDesc !== desc) problems.push('og:description != description');
  }
  if (/—/.test(title + desc)) problems.push('em dash');
  if (/noindex/i.test(robots)) problems.push('NOINDEX');
  const types = [];
  for (const b of blocks) {
    try {
      const j = JSON.parse(b);
      const t = j['@type'] || (Array.isArray(j['@graph']) ? j['@graph'].map((n) => n['@type']).join('+') : '?');
      types.push(Array.isArray(t) ? t.join('+') : t);
    } catch (e) {
      problems.push(`JSON-LD parse error: ${e.message}`);
    }
  }
  if (problems.length) failed++;
  console.log(
    `${problems.length ? 'FAIL' : 'ok  '} ${path}\n` +
      `     title (${title.length}): ${title}\n` +
      `     desc  (${desc.length}): ${desc}\n` +
      `     canonical: ${canonical}\n` +
      `     JSON-LD: ${blocks.length} block(s) [${types.join(', ')}]` +
      (problems.length ? `\n     PROBLEMS: ${problems.join('; ')}` : ''),
  );
}
console.log(failed ? `\n${failed} page(s) failed` : '\nall pages passed');
process.exit(failed ? 1 : 0);
