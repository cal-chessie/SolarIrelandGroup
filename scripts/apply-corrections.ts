/**
 * apply-corrections.ts - deterministic truth-fixes for existing blog articles.
 *
 * Usage: bun scripts/apply-corrections.ts <corrections.json> <out.json>
 *   corrections.json: { "<slug>": { replace?: [[find,repl]...], deleteSectionsContaining?: [substr...] } }
 *
 * Reads current articles from blog-data, applies exact string replacements to
 * every string value in the matched article, optionally drops content sections
 * containing a marker, and writes { written:[], corrected:[changed articles] }
 * for integrate-blog.ts. Reports every find that did NOT match, so no fix fails
 * silently. No AI, fully deterministic.
 */
import { articles } from '../src/lib/blog-data';
import { readFileSync, writeFileSync } from 'fs';

type Corr = { replace?: [string, string][]; deleteSectionsContaining?: string[] };
const corrections: Record<string, Corr> = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const outPath = process.argv[3];

const bySlug = new Map(articles.map((a) => [a.slug, a]));
const changed: any[] = [];
const misses: string[] = [];
let hits = 0;

function deepReplace(node: any, find: string, repl: string): number {
  let n = 0;
  if (typeof node === 'string') return 0; // strings are replaced by their container
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      if (typeof node[i] === 'string') {
        if (node[i].includes(find)) { node[i] = node[i].split(find).join(repl); n++; }
      } else n += deepReplace(node[i], find, repl);
    }
  } else if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      if (typeof node[k] === 'string') {
        if (node[k].includes(find)) { node[k] = node[k].split(find).join(repl); n++; }
      } else n += deepReplace(node[k], find, repl);
    }
  }
  return n;
}

for (const [slug, corr] of Object.entries(corrections)) {
  const a = bySlug.get(slug);
  if (!a) { misses.push(`SLUG NOT FOUND: ${slug}`); continue; }
  const copy = JSON.parse(JSON.stringify(a));
  let touched = false;

  for (const [find, repl] of corr.replace ?? []) {
    const n = deepReplace(copy, find, repl);
    if (n === 0) misses.push(`${slug}: NO MATCH for "${find.slice(0, 60)}${find.length > 60 ? '...' : ''}"`);
    else { hits += n; touched = true; }
  }

  if (corr.deleteSectionsContaining?.length) {
    const before = copy.content.length;
    copy.content = copy.content.filter((s: any) => {
      const blob = JSON.stringify(s);
      return !corr.deleteSectionsContaining!.some((m) => blob.includes(m));
    });
    const removed = before - copy.content.length;
    if (removed === 0) misses.push(`${slug}: deleteSectionsContaining matched nothing`);
    else { touched = true; }
  }

  if (touched) changed.push(copy);
}

writeFileSync(outPath, JSON.stringify({ written: [], corrected: changed }));
console.log(`replacements applied: ${hits} | articles changed: ${changed.length}`);
if (misses.length) {
  console.log(`\nMISSES (${misses.length}) - fix these strings:`);
  for (const m of misses) console.log('  - ' + m);
} else {
  console.log('all corrections matched.');
}
