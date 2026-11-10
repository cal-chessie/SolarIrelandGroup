/**
 * GA4 generate_lead (10 Nov 2026): one per successful lead, consent-gated
 * like funnel_step, never personal data, and every road wired.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { generateLead } from '@/lib/intake/funnel';

const CONSENT_KEY = 'solar-ireland-cookie-consent';
type W = Window & { gtag?: (...a: unknown[]) => void };

const consent = (analytics: boolean) =>
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, categories: { necessary: true, analytics, marketing: false } }));

beforeEach(() => {
  localStorage.clear();
  (window as W).gtag = vi.fn();
});

describe('generate_lead', () => {
  it('fires the GA4 recommended event with EUR, value 0 and the road', () => {
    consent(true);
    generateLead('book-survey');
    expect((window as W).gtag).toHaveBeenCalledWith('event', 'generate_lead', {
      currency: 'EUR',
      value: 0,
      lead_source: 'book-survey',
    });
  });

  it('stays silent without analytics consent', () => {
    generateLead('contact');
    consent(false);
    generateLead('contact');
    expect((window as W).gtag).not.toHaveBeenCalled();
  });

  it('every lead road calls it, and contact also reports submit_error', () => {
    const read = (f: string) => readFileSync(path.resolve(__dirname, '..', f), 'utf8');
    expect(read('components/intake/CallAsk.tsx')).toMatch(/generateLead\(ctx\.road \?\? 'intake'\)/);
    expect(read('components/solar/BillAnalyser.tsx')).toMatch(/road: 'analyser'/);
    expect(read('components/intake/IntakeApp.tsx')).toMatch(/road: 'intake'/);
    expect(read('app/book-survey/BookSurveyClient.tsx')).toMatch(/road: 'book-survey'/);
    expect(read('components/solar/ExitIntent.tsx')).toMatch(/road: 'exit-quiz'/);
    const contact = read('app/contact/ContactClient.tsx');
    expect(contact).toMatch(/generateLead\('contact'\)/);
    expect(contact).toMatch(/funnel\('submit_error', \{ door: 'contact'/);
  });
});
