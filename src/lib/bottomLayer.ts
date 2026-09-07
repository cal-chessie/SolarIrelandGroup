'use client';

import { useEffect, useState } from 'react';

/**
 * The bottom-right corner is contested: the cookie banner, the mobile sticky
 * CTA and the chat bubble all live there. The banner is a full-width sheet at
 * a higher z-index, so while it is up it buries both lead controls.
 *
 * The banner announces itself here and the other two stand down until the
 * visitor has answered it. One decision on screen at a time.
 */
const EVENT = 'sig:cookie-banner';
const FLAG = 'sigCookieBanner';

export function setCookieBannerVisible(visible: boolean) {
  if (typeof document === 'undefined') return;
  if (visible) document.body.dataset[FLAG] = '1';
  else delete document.body.dataset[FLAG];
  window.dispatchEvent(new CustomEvent(EVENT, { detail: visible }));
}

export function useCookieBannerVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(document.body.dataset[FLAG] === '1');
    const onChange = (e: Event) => setVisible(!!(e as CustomEvent).detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  return visible;
}
