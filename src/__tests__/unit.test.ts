import { describe, it, expect } from 'vitest';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

// ============================================================================
// Solar Data
// ============================================================================
describe('SOLAR_DATA', () => {
  it('has correct grant amount', () => {
    expect(SOLAR_DATA.grant.amount).toBe(1800);
  });

  it('has correct annual savings figure', () => {
    expect(SOLAR_DATA.savings.avgAnnual).toBe(1400);
  });

  it('has correct provider email', () => {
    expect(SOLAR_DATA.provider.email).toBe('sales@solarirelandgroup.ie');
  });

  it('has correct provider phone', () => {
    expect(SOLAR_DATA.provider.phone).toBe('+353 87 395 8424');
  });

  it('has WhatsApp number as digits only', () => {
    expect(SOLAR_DATA.provider.whatsapp).toMatch(/^\d+$/);
  });

  it('covers all 32 counties', () => {
    expect(SOLAR_DATA.coverage.totalCounties).toBe(32);
  });

  it('covers all 4 provinces', () => {
    expect(SOLAR_DATA.coverage.provinces).toBe(4);
    expect(SOLAR_DATA.serviceAreas).toEqual(['Connacht', 'Leinster', 'Munster', 'Ulster']);
  });

  it('has all required social media links', () => {
    expect(SOLAR_DATA.social.facebook).toMatch(/^https:\/\/www\./);
    expect(SOLAR_DATA.social.instagram).toMatch(/^https:\/\/www\./);
    expect(SOLAR_DATA.social.linkedin).toMatch(/^https:\/\/www\./);
    expect(SOLAR_DATA.social.tiktok).toMatch(/^https:\/\/www\./);
  });

  it('has all required certifications', () => {
    expect(SOLAR_DATA.certifications).toContain('SEAI Registered');
    expect(SOLAR_DATA.certifications).toContain('RECI Certified');
  });

  it('has reasonable system generation data', () => {
    expect(SOLAR_DATA.system.generationPerKwp).toBeGreaterThan(0);
    expect(SOLAR_DATA.system.avgSizeKwp).toBeGreaterThan(0);
    expect(SOLAR_DATA.system.panelWarranty).toBeGreaterThanOrEqual(25);
  });
});

// ============================================================================
// WhatsApp URL Builder
// ============================================================================
describe('buildWhatsAppUrl', () => {
  it('generates correct base URL with phone number', () => {
    const url = buildWhatsAppUrl({});
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  });

  it('generates default message for no source', () => {
    const url = buildWhatsAppUrl({});
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toContain('Hi Solar Ireland');
    expect(decoded).toContain('solar panels');
  });

  it('generates hero source message', () => {
    const url = buildWhatsAppUrl({ source: 'hero' });
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toContain('free survey');
  });

  it('generates custom message when provided', () => {
    const url = buildWhatsAppUrl({ customMessage: 'Hello, I want solar!' });
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toBe('Hello, I want solar!');
  });

  it('generates quick action message', () => {
    const url = buildWhatsAppUrl({ quickAction: 'Book a survey for Saturday' });
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toBe('Book a survey for Saturday');
  });

  it('includes bill analyser data when provided', () => {
    const url = buildWhatsAppUrl({
      source: 'bill-analyser',
      monthlyBill: 180,
      homeType: 'Detached',
      provider: 'Electric Ireland',
      recommendedSystem: 6,
      annualSaving: 1800,
      paybackYears: 4,
      total25yrSaving: 52000,
    });
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toContain('€180/mo');
    expect(decoded).toContain('6kWp');
    expect(decoded).toContain('€1,800/yr');
    expect(decoded).toContain('4 year payback');
  });

  it('URL-encodes special characters', () => {
    const url = buildWhatsAppUrl({ customMessage: "I'd like €1,800 off!" });
    expect(url).toContain(encodeURIComponent("I'd like €1,800 off!"));
  });
});

// ============================================================================
// cn() utility
// ============================================================================
describe('cn', () => {
  it('merges class names', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('deduplicates tailwind classes', () => {
    const result = cn('p-4', 'p-6');
    expect(result).toBe('p-6');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('', null, undefined)).toBe('');
  });
});
