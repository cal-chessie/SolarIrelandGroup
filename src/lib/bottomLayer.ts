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

/**
 * The intake owns the whole screen while it is open (Intake OS, ui-spec 4.6).
 * Everything that lives in the bottom layer steps aside: the bees, the
 * "Panels resting" pill, the chat bee and its toast, the sticky bar, the
 * cookie settings button, the exit popup and the scroll progress bar.
 *
 * `body[data-intake-open]` is the CSS hook; `useIntakeOpen()` is the React one.
 * `body[data-intake-layer]` additionally marks the full-screen layer over a
 * page, so the page underneath can be hidden and made inert.
 */
const INTAKE_EVENT = 'sig:intake-open';
const INTAKE_FLAG = 'intakeOpen';
const INTAKE_LAYER_FLAG = 'intakeLayer';

export function setIntakeOpen(open: boolean, opts: { layer?: boolean } = {}) {
  if (typeof document === 'undefined') return;
  if (open) {
    document.body.dataset[INTAKE_FLAG] = '1';
    if (opts.layer) document.body.dataset[INTAKE_LAYER_FLAG] = '1';
  } else {
    delete document.body.dataset[INTAKE_FLAG];
    delete document.body.dataset[INTAKE_LAYER_FLAG];
  }
  window.dispatchEvent(new CustomEvent(INTAKE_EVENT, { detail: open }));
}

export function isIntakeOpen(): boolean {
  return typeof document !== 'undefined' && document.body.dataset[INTAKE_FLAG] === '1';
}

export function useIntakeOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(document.body.dataset[INTAKE_FLAG] === '1');
    const onChange = (e: Event) => setOpen(!!(e as CustomEvent).detail);
    window.addEventListener(INTAKE_EVENT, onChange);
    return () => window.removeEventListener(INTAKE_EVENT, onChange);
  }, []);

  return open;
}
