/**
 * /blog paginates in client state (6 a page), so posts past page one were in
 * no crawlable HTML (Google-safety check, 9 Nov). Every post's link must be in
 * the first render, which is the server HTML, without changing the look.
 */
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { getAllArticleSlugs } from '@/lib/blog-data';

vi.mock('@/components/solar/Navbar', () => ({ default: () => null }));
vi.mock('@/components/solar/Footer', () => ({ default: () => null }));
vi.mock('@/components/solar/WhatsAppChat', () => ({ default: () => null }));

describe('/blog server HTML', () => {
  it('links every post, including /blog/what-is-my-mprn-number-ireland, the extras inside a hidden nav', async () => {
    const { default: BlogClient } = await import('@/app/blog/BlogClient');
    const html = renderToString(<BlogClient />);
    for (const slug of getAllArticleSlugs()) expect(html, slug).toContain(`href="/blog/${slug}"`);
    expect(html).toMatch(/<nav hidden="" data-blog-all-links="">[\s\S]*what-is-my-mprn-number-ireland/);
  });
});
