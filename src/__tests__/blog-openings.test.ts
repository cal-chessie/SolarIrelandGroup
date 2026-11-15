import { describe, it, expect } from 'vitest';
import { articles } from '@/lib/blog-data';

// The `answer` renders as the highlighted answer box under the H1. If the first
// body paragraph restates it, the reader sees the same words twice under the
// byline (Cal, 15 Nov 2026: "double paragraphs at the top"). The body must
// open with new information. Overlap is measured on shared three-word runs.
const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[^a-z0-9€%. ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
const trigrams = (s: string) => {
  const w = words(s);
  const out = new Set<string>();
  for (let i = 0; i < w.length - 2; i++) out.add(w.slice(i, i + 3).join(' '));
  return out;
};
const overlap = (a: string, b: string) => {
  const A = trigrams(a);
  const B = trigrams(b);
  let n = 0;
  for (const g of A) if (B.has(g)) n++;
  return n / Math.max(1, Math.min(A.size, B.size));
};

describe('blog openings', () => {
  for (const a of articles) {
    it(`${a.slug}: first paragraph does not restate the answer box`, () => {
      const first = a.content.find((c) => c.type === 'paragraph');
      if (!a.answer || !first || first.type !== 'paragraph') return;
      expect(overlap(a.answer, first.text)).toBeLessThan(0.15);
    });
    it(`${a.slug}: no stray "Last checked" line as its own paragraph`, () => {
      const stray = a.content.filter(
        (c) => c.type === 'paragraph' && /^last (checked|updated)\b/i.test(c.text.trim()),
      );
      expect(stray).toHaveLength(0);
    });
  }
});
