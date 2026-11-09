/**
 * GA4 only reads Arguments objects from dataLayer. trackEvent used to push a
 * plain array, which gtag.js ignores, so no custom event reached GA4.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from '@/lib/analytics';

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
const w = window as W;
const isArguments = (x: unknown) => Object.prototype.toString.call(x) === '[object Arguments]';

beforeEach(() => {
  process.env.NEXT_PUBLIC_GA_ID = 'G-TEST123';
  localStorage.setItem('solar-ireland-cookie-consent', JSON.stringify({ categories: { analytics: true } }));
  delete w.dataLayer;
  delete w.gtag;
});
afterEach(() => {
  delete process.env.NEXT_PUBLIC_GA_ID;
  localStorage.clear();
  delete w.dataLayer;
  delete w.gtag;
});

describe('trackEvent reaches GA4', () => {
  it('before gtag.js has defined gtag(): pushes an Arguments object, as Google\'s snippet does', () => {
    trackEvent({ event: 'whatsapp_click', properties: { source: 'navbar' } });
    const last = w.dataLayer?.at(-1);
    expect(isArguments(last)).toBe(true);
    expect(Array.from(last as ArrayLike<unknown>)).toEqual(['event', 'whatsapp_click', { source: 'navbar' }]);
  });
  it('when the layout has defined gtag(): calls it with the event', () => {
    const g = vi.fn();
    w.gtag = g;
    trackEvent({ event: 'contact_form_submit', properties: { page: '/contact' } });
    expect(g).toHaveBeenCalledWith('event', 'contact_form_submit', { page: '/contact' });
  });
  it('without analytics consent: nothing is pushed', () => {
    localStorage.setItem('solar-ireland-cookie-consent', JSON.stringify({ categories: { analytics: false } }));
    trackEvent({ event: 'whatsapp_click' });
    expect(w.dataLayer).toBeUndefined();
  });
  it('without a GA id (live today): nothing is pushed', () => {
    delete process.env.NEXT_PUBLIC_GA_ID;
    trackEvent({ event: 'whatsapp_click' });
    expect(w.dataLayer).toBeUndefined();
  });
});
