import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/app/blog/[slug]/post-bill-box.css', () => ({}));
vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn() }));
// The lead call is mocked: nothing is ever sent to AISolar from a test.
vi.mock('@/components/intake/api', () => ({
  newKey: () => 'test-key',
  submitIntake: vi.fn(async () => ({ status: 200, data: { ok: true, leadId: 'x', path: 'fresh', booking: { outcome: 'none' }, estimate: null, handoff: null, deviceToken: null, next: 'check_email' } })),
}));
vi.mock('@/lib/intake/funnel', () => ({ funnel: vi.fn(), generateLead: vi.fn() }));

import { articles } from '@/lib/blog-data';
import PostBillBox, { postBillBoxIndex, uploadHref } from '@/app/blog/[slug]/PostBillBox';
import { trackEvent } from '@/lib/analytics';
import { POST_ORIGIN_KEY, leadAttribution, readPostOrigin, recordPostOrigin } from '@/lib/postOrigin';
import { CallAsk } from '@/components/intake/CallAsk';
import { submitIntake } from '@/components/intake/api';
import { toIngestBody } from '@/lib/intake/live/ingest';
import type { SubmitRequest } from '@/lib/intake/contract';

const SLUG = 'do-solar-panels-add-value-to-your-home-ireland';

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  vi.mocked(trackEvent).mockClear();
  vi.mocked(submitIntake).mockClear();
});

describe('placement', () => {
  it('lands once per post, never at the top, and after the first H2 section where a post has one', () => {
    for (const a of articles) {
      const i = postBillBoxIndex(a.content);
      expect(i, a.slug).toBeGreaterThan(0);
      expect(i, a.slug).toBeLessThanOrEqual(a.content.length);
      const h2 = a.content.flatMap((s, k) => (s.type === 'heading' && s.level === 2 ? [k] : []));
      if (h2.length >= 2 && h2[1] <= a.content.length * 0.6) expect(i, a.slug).toBe(h2[1]);
    }
  });
});

describe('the box', () => {
  it('server-renders two real links into the analyser, carrying the post', () => {
    render(<PostBillBox slug={SLUG} />);
    const upload = screen.getByRole('link', { name: /Upload my bill/ });
    const type = screen.getByRole('link', { name: /Type my bill amount/ });
    expect(upload.getAttribute('href')).toBe(uploadHref(SLUG));
    expect(upload.getAttribute('href')).toBe(`/solar-calculator?src=${SLUG}#calculator`);
    const t = new URL(type.getAttribute('href')!, 'https://x.ie');
    expect(t.pathname).toBe('/estimate');
    expect(t.searchParams.get('src')).toBe(SLUG);
    expect(t.searchParams.get('door')).toBe('blog-inpost');
    expect(t.searchParams.get('step')).toBe('bill');
    expect(screen.getByRole('complementary', { name: 'Your bill, your number' })).toBeTruthy();
  });

  it('copy has no em dashes and no exclamation marks', () => {
    const { container } = render(<PostBillBox slug={SLUG} />);
    expect(container.textContent).not.toMatch(/[\u2014!]/);
  });

  it('a click records the post and fires blog_cta_click with slug and placement', () => {
    render(<PostBillBox slug={SLUG} />);
    fireEvent.click(screen.getByRole('link', { name: /Upload my bill/ }));
    expect(readPostOrigin()).toMatchObject({ src: SLUG, page: `/blog/${SLUG}`, placement: 'in-post' });
    expect(trackEvent).toHaveBeenCalledWith({
      event: 'blog_cta_click',
      properties: expect.objectContaining({ post_slug: SLUG, placement: 'in-post', action: 'upload' }),
    });
  });
});

describe('lead attribution', () => {
  it('the post slug and path ride in the existing meta.src and meta.page', () => {
    recordPostOrigin(SLUG, 'bottom');
    expect(leadAttribution(null, '/solar-calculator')).toEqual({ src: SLUG, page: `/blog/${SLUG}` });
    // The bottom CTA's category tag gives way to the slug; a real door src does not.
    expect(leadAttribution('blog-savings', '/estimate').src).toBe(SLUG);
    expect(leadAttribution('county-cork', '/estimate').src).toBe('county-cork');
  });

  it('nothing from a post: unchanged behaviour', () => {
    expect(leadAttribution(null, '/solar-calculator')).toEqual({ src: null, page: '/solar-calculator' });
  });

  it('an origin older than two hours is ignored', () => {
    sessionStorage.setItem(POST_ORIGIN_KEY, JSON.stringify({ v: 1, src: SLUG, page: `/blog/${SLUG}`, placement: 'in-post', at: Date.now() - 3 * 3600_000 }));
    expect(readPostOrigin()).toBeNull();
  });

  it('a call request from the analyser sends the post to AISolar (network mocked)', async () => {
    recordPostOrigin(SLUG, 'in-post');
    render(
      <CallAsk
        idPrefix="t"
        details={{ name: 'Test Person', mobile: '087 123 4567', email: 'test@example.com', bestTime: null }}
        onDetails={() => {}}
        ctx={{ segment: 'domestic', door: 'calculator', src: null, pkg: null, countyContext: null, flowId: 'f1', monthlyBill: 150, annualKwh: null, billPeriod: 'month', supplier: null, quoteToken: null, billRead: null, carry: null }}
        who="Cal"
        onSent={() => {}}
        heading="Ask"
      />,
    );
    fireEvent.submit(document.querySelector('form.si-ask')!);
    await waitFor(() => expect(submitIntake).toHaveBeenCalled());
    const body = vi.mocked(submitIntake).mock.calls[0][0] as SubmitRequest;
    expect(body.meta).toMatchObject({ door: 'calculator', src: SLUG, page: `/blog/${SLUG}` });
    // And it survives the site's own field-by-field copy into the AISolar body.
    const ingest = toIngestBody(body, null);
    expect(ingest.meta).toMatchObject({ door: 'calculator', src: SLUG, page: `/blog/${SLUG}` });
  });
});

describe('looks native', () => {
  it('the box tokens are the analyser tokens in intake.css', () => {
    const root = process.cwd();
    const box = readFileSync(join(root, 'src/app/blog/[slug]/post-bill-box.css'), 'utf8');
    const intake = readFileSync(join(root, 'src/components/intake/intake.css'), 'utf8');
    const tokens = (css: string) => new Map([...css.matchAll(/(--si-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
    const a = tokens(box.slice(0, box.indexOf('margin-block')));
    const b = tokens(intake.slice(0, intake.indexOf('}', intake.indexOf('.si-analyser {'))));
    expect(a.size).toBeGreaterThan(10);
    for (const [k, v] of a) expect(`${k}: ${v}`).toBe(`${k}: ${b.get(k)}`);
  });
});
