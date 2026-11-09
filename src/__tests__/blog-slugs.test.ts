import { describe, it, expect } from 'vitest';
import { articles } from '@/lib/blog-data';
import { BLOG_SLUGS } from '@/lib/blog-slugs';

// middleware.ts 404s any /blog/<slug> not in BLOG_SLUGS, so a new article that
// is missing from that list ships as a 404. This keeps the two in step.
describe('BLOG_SLUGS', () => {
  it('lists exactly the slugs in blog-data', () => {
    expect([...BLOG_SLUGS].sort()).toEqual(articles.map((a) => a.slug).sort());
  });
});
