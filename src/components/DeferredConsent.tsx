'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';

/**
 * Perf (12 Nov 2026): the cookie banner and the PostHog bridge render nothing
 * in the server HTML (the banner waits for its own 1.2 s timer), so their JS
 * does not need to run before first paint. This mounts both once the browser
 * is idle (at most 1.5 s after hydration).
 *
 * Consent behaviour is unchanged: both components read the stored choice on
 * mount exactly as before. A "Cookie settings" click (footer, intake) that
 * lands before they mount is remembered and replayed once the banner is up.
 */
type Loaded = { Banner: ComponentType; PostHog: ComponentType };

export default function DeferredConsent() {
  const [mods, setMods] = useState<Loaded | null>(null);
  const openRequested = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const early = () => {
      openRequested.current = true;
    };
    window.addEventListener('cookie-consent-open-settings', early);

    const load = () => {
      Promise.all([import('./CookieConsent'), import('./PostHogProvider')]).then(([c, p]) => {
        if (cancelled) return;
        window.removeEventListener('cookie-consent-open-settings', early);
        setMods({ Banner: c.default, PostHog: p.default });
      });
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (w.requestIdleCallback) idleId = w.requestIdleCallback(load, { timeout: 1500 });
    else timer = setTimeout(load, 300);

    return () => {
      cancelled = true;
      window.removeEventListener('cookie-consent-open-settings', early);
      if (idleId !== undefined && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Replay a settings request that arrived before the banner existed.
  useEffect(() => {
    if (!mods) return;
    if (openRequested.current) {
      const t = setTimeout(() => window.dispatchEvent(new Event('cookie-consent-open-settings')), 0);
      return () => clearTimeout(t);
    }
  }, [mods]);

  if (!mods) return null;
  const { Banner, PostHog } = mods;
  return (
    <>
      <Banner />
      <PostHog />
    </>
  );
}
