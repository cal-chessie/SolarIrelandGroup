// @vitest-environment node
/**
 * The /book-survey door (Apple pass, APPLE-DECISIONS "Doors").
 *
 * /book-survey becomes a 308 to the one intake, with one guard: a returning
 * homeowner's magic link (?lt=, the lead token in an old estimate email) must
 * keep working. That path still renders the booking form that threads the lead
 * token into /api/lead, so nothing in an inbox breaks.
 *
 * Written before the redirect landed, so the guard was proven first.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/book-survey/BookSurveyClient', () => ({ default: function BookSurveyClient() { return null; } }));
vi.mock('@/components/intake/IntakePage', () => ({ default: function IntakePage() { return null; } }));

import { bookSurveyRedirect } from '@/lib/intake/bookSurvey';

const TOKEN = 'a'.repeat(64);

describe('/book-survey: the magic-link guard', () => {
  it('a magic link (?lt=) is never redirected', () => {
    expect(bookSurveyRedirect({ lt: TOKEN })).toBeNull();
    expect(bookSurveyRedirect({ lt: TOKEN, src: 'email' })).toBeNull();
  });

  it('everything else goes to the intake at the survey times, as a home by default', () => {
    expect(bookSurveyRedirect({})).toBe('/estimate?for=home&step=time&door=book-survey');
  });

  it('keeps the page context (src, pkg, county) and a business door', () => {
    const to = bookSurveyRedirect({ src: 'grant-checker', pkg: 'Premium', county: 'Cork', for: 'business' });
    const q = new URLSearchParams(to!.split('?')[1]);
    expect(to!.startsWith('/estimate?')).toBe(true);
    expect(q.get('for')).toBe('business');
    expect(q.get('step')).toBe('time');
    expect(q.get('src')).toBe('grant-checker');
    expect(q.get('pkg')).toBe('Premium');
    expect(q.get('county')).toBe('Cork');
    expect(q.get('door')).toBe('book-survey');
  });

  it('an empty or junk lt is not a magic link', () => {
    expect(bookSurveyRedirect({ lt: '' })).toBe('/estimate?for=home&step=time&door=book-survey');
  });

  it('the page: lt renders the token-threading form; no lt throws a 308 to /estimate', async () => {
    const { default: Page } = await import('@/app/book-survey/page');
    const withToken = await Page({ searchParams: Promise.resolve({ lt: TOKEN }) });
    const json = JSON.stringify(withToken, (_k, v) => (typeof v === 'function' ? `fn:${v.name}` : v));
    expect(json).toContain('fn:BookSurveyClient');
    expect(json).not.toContain('fn:IntakePage');

    let digest = '';
    try {
      await Page({ searchParams: Promise.resolve({ src: 'nav' }) });
    } catch (e) {
      digest = String((e as { digest?: string }).digest || '');
    }
    expect(digest).toContain('NEXT_REDIRECT');
    expect(digest).toContain('/estimate?for=home&step=time&src=nav&door=book-survey');
    expect(digest).toContain('308');
  });
});

describe('/book-survey: the middleware answers a real 308', () => {
  it('no token: 308 to /estimate; a magic link passes through', async () => {
    const { NextRequest } = await import('next/server');
    const { middleware } = await import('@/middleware');
    const plain = middleware(new NextRequest('https://solarirelandgroup.ie/book-survey?src=nav'));
    expect(plain.status).toBe(308);
    expect(plain.headers.get('location')).toBe('https://solarirelandgroup.ie/estimate?for=home&step=time&src=nav&door=book-survey');
    const magic = middleware(new NextRequest(`https://solarirelandgroup.ie/book-survey?lt=${TOKEN}`));
    expect(magic.status).toBe(200);
    expect(magic.headers.get('location')).toBeNull();
  });
});
