'use client';

import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from 'react';

/**
 * Perf (12 Nov 2026): hydrate a below-the-fold client section only when it
 * comes near the viewport.
 *
 * The server still renders the full section into the HTML (visible content
 * and SEO text are unchanged). In the browser, during the first hydration,
 * the section's boundary suspends on a promise that resolves when the
 * wrapper is within `rootMargin` of the viewport, when the visitor points at
 * or focuses inside it, or at once when the URL hash targets something in
 * it. While suspended React leaves the server HTML exactly as it is, so
 * nothing moves; on wake the section's chunk loads and hydrates in place.
 *
 * After the first hydration (a client-side navigation back to the page)
 * islands render straight away, so nothing is ever blank.
 */

let firstHydrationDone = false;

type Gate = { done: boolean; promise: Promise<void>; open: () => void };

function GateView({ gate, children }: { gate: Gate | null; children: ReactNode }) {
  if (gate && !gate.done) throw gate.promise;
  return <>{children}</>;
}

type Tracked<T> = Promise<T> & { status?: string; value?: T };

/** Start the import and mark the promise so React.lazy reads it synchronously once settled. */
function track<T>(p: Promise<T>): Tracked<T> {
  const t = p as Tracked<T>;
  t.then(
    (v) => {
      t.status = 'fulfilled';
      t.value = v;
    },
    () => {
      t.status = 'rejected';
    },
  );
  return t;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyIsland<C extends ComponentType<any>>(
  load: () => Promise<{ default: C }>,
  { rootMargin = '600px 0px' }: { rootMargin?: string } = {},
) {
  let mod: Tracked<{ default: C }> | null = null;
  const get = () => (mod ??= track(load()));
  // On the server the module is imported up front, so by render time the
  // lazy resolves synchronously and the section is in the first HTML flush
  // (no streamed boundary).
  if (typeof window === 'undefined') get();
  const Lazy = lazy(get);

  function Island(props: ComponentProps<C>) {
    const ref = useRef<HTMLDivElement>(null);
    // One gate per mounted island; null on the server and after first hydration.
    const [gate] = useState<Gate | null>(() => {
      if (typeof window === 'undefined' || firstHydrationDone) return null;
      const g = { done: false } as Gate;
      g.promise = new Promise<void>((r) => {
        g.open = () => {
          g.done = true;
          r();
        };
      });
      return g;
    });

    useEffect(() => {
      firstHydrationDone = true;
    }, []);

    useEffect(() => {
      if (!gate || gate.done) return;
      const el = ref.current;
      let io: IntersectionObserver | null = null;
      let woken = false;
      // Hold the section's exact box until it has hydrated (14 Nov, Cal on
      // his iPhone: "down the page the scroll jumps"). While suspended React
      // keeps the server HTML, but if the boundary is ever client-rendered
      // instead (an update reaching it before it hydrates) its fallback is
      // empty for a moment. Safari has no scroll anchoring, so a section
      // collapsing above the reader moves the whole page. The wrapper keeps
      // the measured height (it never adds space: it equals the content)
      // and lets go once the content is back.
      let raf = 0;
      const reserve = () => {
        if (!el?.firstElementChild) return;
        el.style.minHeight = '';
        el.style.minHeight = `${el.getBoundingClientRect().height}px`;
      };
      const release = () => {
        const tick = () => {
          // Content is back once any rendered child has height (a section
          // can lead with its JSON-LD <script>, which never does).
          const back = !!el && [...el.children].some((c) => c.getBoundingClientRect().height > 0);
          if (!el || back) {
            if (el) el.style.minHeight = '';
            window.removeEventListener('resize', reserve);
            return;
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(() => (raf = requestAnimationFrame(tick)));
      };
      reserve();
      window.addEventListener('resize', reserve);
      const onHash = () => {
        const id = window.location.hash.slice(1);
        const t = id ? document.getElementById(decodeURIComponent(id)) : null;
        if (t && el?.contains(t)) wake();
      };
      function cleanup() {
        io?.disconnect();
        window.removeEventListener('resize', reserve);
        el?.removeEventListener('pointerdown', wake, { capture: true });
        el?.removeEventListener('focusin', wake, { capture: true });
        window.removeEventListener('hashchange', onHash);
      }
      function wake() {
        if (woken) return;
        woken = true;
        cleanup();
        // Load first, then release the boundary: the module is ready, so the
        // section hydrates in one pass over the server HTML (no blank frame).
        const open = () => {
          gate!.open();
          release();
        };
        get().then(open, open);
      }
      if (el && 'IntersectionObserver' in window) {
        io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) wake();
          },
          { rootMargin },
        );
        io.observe(el);
      } else {
        wake();
      }
      el?.addEventListener('pointerdown', wake, { capture: true });
      el?.addEventListener('focusin', wake, { capture: true });
      window.addEventListener('hashchange', onHash);
      onHash();
      return () => {
        cleanup();
        cancelAnimationFrame(raf);
      };
    }, [gate]);

    return (
      <div ref={ref} data-island="">
        <Suspense fallback={null}>
          <GateView gate={gate}>
            {typeof window === 'undefined' && mod?.status === 'fulfilled' && mod.value ? (
              <mod.value.default {...props} />
            ) : (
              <Lazy {...props} />
            )}
          </GateView>
        </Suspense>
      </div>
    );
  }

  return Island;
}
