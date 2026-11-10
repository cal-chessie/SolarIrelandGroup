#!/usr/bin/env node
/**
 * IndexNow ping: tells Bing, Yandex, Seznam, Naver and the other IndexNow
 * engines that every URL in the live sitemap is fresh.
 *
 * Run it by hand, AFTER a deploy is live on https://solarirelandgroup.ie.
 * Nothing calls it automatically. The engines fetch the key file below to
 * prove we own the host, so it must already be served by production:
 *   https://solarirelandgroup.ie/25a982be8ae9c8b5fad37aef96e2d0e2.txt
 *
 * The key is public by design (IndexNow ownership is the key file on the host,
 * not a secret). It lives in public/<key>.txt.
 *
 * Usage:  node scripts/indexnow-ping.mjs
 *         node scripts/indexnow-ping.mjs --dry-run   (list the URLs, send nothing)
 */
const HOST = 'solarirelandgroup.ie';
const KEY = '25a982be8ae9c8b5fad37aef96e2d0e2';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000; // IndexNow's per-request limit

const dryRun = process.argv.includes('--dry-run');

/** Every <loc> in a sitemap; follows a sitemap index one level down. */
async function readSitemap(url, depth = 0) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`sitemap ${url} returned HTTP ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) =>
    m[1].replace(/&amp;/g, '&'),
  );
  if (/<sitemapindex[\s>]/.test(xml) && depth === 0) {
    const nested = await Promise.all(locs.map((loc) => readSitemap(loc, 1)));
    return nested.flat();
  }
  return locs;
}

const all = await readSitemap(SITEMAP);
const urlList = [...new Set(all)].filter((u) => {
  try {
    return new URL(u).hostname === HOST;
  } catch {
    return false;
  }
});

if (urlList.length === 0) {
  console.error(`No ${HOST} URLs found in ${SITEMAP}; nothing sent.`);
  process.exit(1);
}
if (urlList.length > MAX_URLS) {
  console.error(`${urlList.length} URLs is over the IndexNow limit of ${MAX_URLS}; nothing sent.`);
  process.exit(1);
}

console.log(`${urlList.length} URLs from ${SITEMAP}`);
if (dryRun) {
  for (const u of urlList) console.log(`  ${u}`);
  console.log('Dry run: nothing sent.');
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});
const body = await res.text();
console.log(`IndexNow responded HTTP ${res.status} ${res.statusText}`);
if (body.trim()) console.log(body.trim());
// 200 = accepted, 202 = accepted, key check pending. Anything else is a failure.
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
