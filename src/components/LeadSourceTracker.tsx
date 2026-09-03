'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * LeadSourceTracker
 *
 * One delegated click listener that attributes every lead-generating
 * click-through, so leads can be traced back to the exact page and CTA that
 * produced them. Fires clean, named events to GA4 + PostHog (both are already
 * consent-gated inside trackEvent):
 *   - whatsapp_click  (any wa.me / api.whatsapp.com link)
 *   - phone_click     (tel: links)
 *   - email_click     (mailto: links)
 *   - cta_click       (the "Analyse Bill" and "Book Survey" journeys)
 *
 * Every event carries { page, cta, destination }. A CTA can override the label
 * with a data-lead-source="..." attribute; otherwise the button's aria-label or
 * text is used. Mounted once in the root layout, so it covers every page and
 * every current and future CTA without per-button wiring.
 */
export default function LeadSourceTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest('a, button') as HTMLElement | null;
      if (!el) return;

      const page = window.location.pathname + window.location.search;
      const override = el.getAttribute('data-lead-source');
      const label =
        override ||
        (el.getAttribute('aria-label') || el.textContent || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 60) ||
        'unlabelled';
      const href = (el.getAttribute('href') || '').toLowerCase();

      if (href.includes('wa.me/') || href.includes('api.whatsapp.com')) {
        trackEvent({
          event: 'whatsapp_click',
          properties: { page, cta: label, destination: 'whatsapp' },
        });
      } else if (href.startsWith('tel:')) {
        trackEvent({ event: 'phone_click', properties: { page, cta: label } });
      } else if (href.startsWith('mailto:')) {
        trackEvent({ event: 'email_click', properties: { page, cta: label } });
      } else if (
        href === '#calculator' ||
        href.startsWith('/solar-calculator') ||
        /analyse|analyser|calculator/i.test(label)
      ) {
        trackEvent({
          event: 'cta_click',
          properties: { page, cta: label, destination: 'bill-analyser' },
        });
      } else if (href.startsWith('/book-survey') || /book.*survey|free survey/i.test(label)) {
        trackEvent({
          event: 'cta_click',
          properties: { page, cta: label, destination: 'book-survey' },
        });
      }
    };

    // Capture phase so we still record the click even if a handler stops
    // propagation or navigates away.
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
