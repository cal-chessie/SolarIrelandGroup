'use client';

/**
 * Mounted once in the root layout. Every door calls openIntake(); this host
 * answers by laying the intake over the current page (any width), so opening
 * is instant and closing returns to the page exactly where it was.
 *
 * The intake code itself loads on first use, or quietly once the page is
 * idle, so marketing pages do not carry it in their first load.
 */
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { INTAKE_REQUEST_EVENT, INTAKE_PATH, type IntakeOpenOptions } from '@/lib/intake/open';

const loadApp = () => import('./IntakeApp');
const IntakeApp = dynamic(loadApp, { ssr: false });

export default function IntakeHost() {
  const [open, setOpen] = useState<{ opts: IntakeOpenOptions; n: number } | null>(null);

  useEffect(() => {
    const w = window as unknown as { __siIntakeHost?: boolean };
    w.__siIntakeHost = true;
    const onRequest = (e: Event) => {
      if (window.location.pathname === INTAKE_PATH) return;
      const opts = (e as CustomEvent<IntakeOpenOptions>).detail;
      setOpen((o) => ({ opts, n: (o?.n ?? 0) + 1 }));
    };
    window.addEventListener(INTAKE_REQUEST_EVENT, onRequest);
    // Warm the chunk once the page is idle, so the first tap opens at once.
    const warm = () => void loadApp();
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const t = ric ? ric(warm, { timeout: 4000 }) : window.setTimeout(warm, 2500);
    return () => {
      window.removeEventListener(INTAKE_REQUEST_EVENT, onRequest);
      w.__siIntakeHost = false;
      if (!ric) window.clearTimeout(t as number);
    };
  }, []);

  if (!open) return null;
  return <IntakeApp key={open.n} variant="layer" initial={open.opts} onClose={() => setOpen(null)} />;
}
