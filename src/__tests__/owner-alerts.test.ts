/**
 * Every lead action emails the owner (Cal, 18 Nov 2026: "email notifications
 * for every lead action on the site so I don't miss a thing"). The sender is
 * mocked: nothing is sent.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { forwardLead, leadAlertText, type BridgeLead } from '@/lib/leadBridge';
import { returningText } from '@/lib/intake/live/outbox';
import type { IngestBody } from '@/lib/intake/live/ingest';

const lead: BridgeLead = { brand: 'solar-ireland', source: 'contact-form', name: 'Mary Byrne', email: 'mary@example.ie', phone: '087 123 4567', message: 'Interested in panels' };

afterEach(() => vi.restoreAllMocks());

describe('contact form and chat leads', () => {
  it('email the owner when AISolar takes the lead', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true, leadId: 'l1' }), { status: 200 }));
    process.env.AISOLAR_INGEST_URL ??= 'https://example.test/ingest';
    const sent: { subject: string; text: string }[] = [];
    await forwardLead(lead, { alert: { send: async (subject, text) => (sent.push({ subject, text }), true) } });
    expect(sent).toHaveLength(1);
    expect(sent[0].text).toContain('Mary Byrne');
    expect(sent[0].text).toContain('087 123 4567');
    expect(sent[0].text).toContain('Interested in panels');
  });

  it('say plainly when the lead is NOT in AISolar', () => {
    const m = leadAlertText(lead, { ok: false });
    expect(m.subject).toContain('NOT in AISolar');
    expect(m.text).toContain('This email is the only record');
    expect(leadAlertText(lead, { ok: true, fallback: true }).text).toContain('backup store');
    expect(leadAlertText(lead, { ok: true, leadId: 'x' }).subject).not.toContain('NOT');
  });
});

describe('a returning customer on the intake', () => {
  it('gets its own owner email, because AISolar only emails for a new lead', () => {
    const p = { name: 'Mary Byrne', phone: '0871234567', email: 'mary@example.ie', monthlyBill: 200, meta: { segment: 'domestic', businessName: null, page: '/estimate' } } as unknown as IngestBody;
    const m = returningText(p, 'threaded');
    expect(m.subject).toBe('Returning customer: Mary Byrne');
    expect(m.text).toContain('sent their details again');
    expect(m.text).toContain('€200 a month');
    expect(m.text).not.toMatch(/—/);
  });
});
