/**
 * integrate-blog.ts — one-shot integrator for workflow-authored articles.
 *
 * Usage: bun scripts/integrate-blog.ts <articles.json>
 *   where articles.json = { written: Article[], corrected: Article[] }
 *
 * Rebuilds src/lib/blog-data.ts as: [ ...written (new, top of feed), ...existing
 * (with corrected versions swapped in by slug) ], preserving the type header and
 * helper functions verbatim. Validates hard before writing: section shapes,
 * category ids, unique slugs, internal link targets, em-dash ban, required fields.
 */
import { articles } from '../src/lib/blog-data';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const VALID_CATEGORIES = new Set(['grants', 'guides', 'news', 'county', 'savings', 'technology']);
const VALID_ICON_BG = new Set(['bg-amber-400/10', 'bg-emerald-400/10', 'bg-orange-400/10', 'bg-rose-400/10', 'bg-sky-400/10', 'bg-violet-400/10']);
const NON_BLOG_LINKS = new Set(['/book-survey', '/solar-calculator', '/#calculator', '/counties', '/financing', '/contact', '/services']);

type AnyArticle = Record<string, any>;
const errors: string[] = [];
const err = (s: string) => errors.push(s);

function validateSection(slug: string, s: AnyArticle, i: number) {
  const at = `${slug} content[${i}]`;
  switch (s.type) {
    case 'paragraph': if (typeof s.text !== 'string' || !s.text.trim()) err(`${at}: paragraph needs text`); break;
    case 'heading':
      if (s.level !== 2 && s.level !== 3) err(`${at}: heading level must be 2|3`);
      if (typeof s.text !== 'string' || !s.text.trim()) err(`${at}: heading needs text`);
      break;
    case 'callout':
      if (!['tip', 'warning', 'info', 'stat'].includes(s.variant)) err(`${at}: bad callout variant '${s.variant}'`);
      if (typeof s.title !== 'string' || typeof s.body !== 'string') err(`${at}: callout needs title+body`);
      break;
    case 'bulletList': case 'numberedList':
      if (!Array.isArray(s.items) || s.items.length === 0 || s.items.some((x: any) => typeof x !== 'string')) err(`${at}: ${s.type} needs string items`);
      break;
    case 'table':
      if (!Array.isArray(s.headers) || !Array.isArray(s.rows)) { err(`${at}: table needs headers+rows`); break; }
      for (const [ri, row] of s.rows.entries()) {
        if (!Array.isArray(row) || row.length !== s.headers.length) err(`${at}: row ${ri} width ${Array.isArray(row) ? row.length : 'n/a'} != headers ${s.headers.length}`);
      }
      break;
    case 'divider': break;
    case 'cta':
      if (typeof s.text !== 'string' || typeof s.href !== 'string') err(`${at}: cta needs text+href`);
      break;
    default: err(`${at}: unknown section type '${s.type}'`);
  }
  // Only the documented keys, so the TS union compiles.
  const allowed: Record<string, string[]> = {
    paragraph: ['type', 'text'], heading: ['type', 'level', 'text'],
    callout: ['type', 'variant', 'title', 'body'], bulletList: ['type', 'items'],
    numberedList: ['type', 'items'], table: ['type', 'headers', 'rows'],
    divider: ['type'], cta: ['type', 'text', 'href'],
  };
  const ok = allowed[s.type];
  if (ok) for (const k of Object.keys(s)) if (!ok.includes(k)) err(`${at}: unexpected key '${k}'`);
}

function textOf(a: AnyArticle): string {
  return JSON.stringify(a);
}

function validateArticle(a: AnyArticle, allSlugs: Set<string>, changed: Set<string>) {
  const s = a.slug || '(no slug)';
  const authored = changed.has(a.slug); // new or corrected this run; existing untouched articles are grandfathered on soft rules
  for (const f of ['slug', 'title', 'excerpt', 'category', 'date', 'readTime', 'author', 'iconBg', 'iconColor']) {
    if (typeof a[f] !== 'string' || !a[f].trim()) err(`${s}: missing/empty ${f}`);
  }
  if (!VALID_CATEGORIES.has(a.category)) err(`${s}: invalid category '${a.category}'`);
  if (a.iconBg && !VALID_ICON_BG.has(a.iconBg)) err(`${s}: invalid iconBg '${a.iconBg}'`);
  if (a.iconBg && a.iconColor) {
    const c = a.iconBg.match(/bg-([a-z]+)-400/)?.[1];
    if (c && a.iconColor !== `text-${c}-400`) err(`${s}: iconColor '${a.iconColor}' does not match iconBg '${a.iconBg}'`);
  }
  if (authored && a.excerpt && a.excerpt.length > 200) err(`${s}: excerpt ${a.excerpt.length} chars (>200)`);
  if (!Array.isArray(a.content) || a.content.length < 8) err(`${s}: content missing or suspiciously short`);
  else a.content.forEach((sec: AnyArticle, i: number) => validateSection(s, sec, i));

  const whole = textOf(a);
  if (whole.includes('—')) err(`${s}: contains an em-dash`);
  for (const m of whole.matchAll(/\]\((\/[^)\s"']+)\)/g)) {
    const href = m[1];
    if (href.startsWith('/blog/')) {
      if (!allSlugs.has(href.slice('/blog/'.length))) err(`${s}: dead internal link ${href}`);
    } else if (!NON_BLOG_LINKS.has(href)) err(`${s}: unexpected link target ${href}`);
  }
  for (const banned of ['permitted development rights in the Republic', 'net metering', 'utility company', 'PureVolt']) {
    if (whole.toLowerCase().includes(banned.toLowerCase())) err(`${s}: banned phrase '${banned}'`);
  }
}

// ─── load ───
const inputPath = process.argv[2];
if (!inputPath) { console.error('usage: bun scripts/integrate-blog.ts <articles.json>'); process.exit(1); }
const payload = JSON.parse(readFileSync(inputPath, 'utf8'));
const written: AnyArticle[] = payload.written ?? [];
const corrected: AnyArticle[] = payload.corrected ?? [];

const existingBySlug = new Map(articles.map((a) => [a.slug, a as AnyArticle]));
for (const c of corrected) if (!existingBySlug.has(c.slug)) err(`corrected '${c.slug}' does not exist in blog-data`);
for (const w of written) if (existingBySlug.has(w.slug)) err(`written '${w.slug}' collides with an existing slug`);
const correctedBySlug = new Map(corrected.map((a) => [a.slug, a]));

const finalArticles: AnyArticle[] = [
  ...written,
  ...articles.map((a) => correctedBySlug.get(a.slug) ?? (a as AnyArticle)),
];

const slugCounts = new Map<string, number>();
for (const a of finalArticles) slugCounts.set(a.slug, (slugCounts.get(a.slug) ?? 0) + 1);
for (const [slug, n] of slugCounts) if (n > 1) err(`duplicate slug in final set: ${slug}`);

const allSlugs = new Set(finalArticles.map((a) => a.slug));
const changedSlugs = new Set<string>([...written.map((a) => a.slug), ...corrected.map((a) => a.slug)]);
for (const a of finalArticles) validateArticle(a, allSlugs, changedSlugs);

if (errors.length) {
  console.error(`VALIDATION FAILED (${errors.length}):`);
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}

// ─── rebuild the file ───
const filePath = join(import.meta.dir, '../src/lib/blog-data.ts');
const src = readFileSync(filePath, 'utf8');
const headEnd = src.indexOf('export const articles');
const tailStart = src.indexOf('export function getArticleBySlug');
if (headEnd === -1 || tailStart === -1) { console.error('could not find array markers in blog-data.ts'); process.exit(1); }

const out = src.slice(0, headEnd)
  + 'export const articles: Article[] = '
  + JSON.stringify(finalArticles, null, 2)
  + ';\n\n'
  + src.slice(tailStart);

writeFileSync(filePath, out);

const words = (a: AnyArticle) => textOf(a).split(/\s+/).length;
console.log(`OK: wrote ${finalArticles.length} articles (${written.length} new, ${corrected.length} corrected, ${finalArticles.length - written.length - corrected.length} untouched kept)`);
console.log('new: ' + written.map((a) => `${a.slug} (~${words(a)}w)`).join(', '));
