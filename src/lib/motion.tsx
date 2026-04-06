'use client';

/* ═══════════════════════════════════════════════════════════════
   MOTION LITE — Drop-in framer-motion replacement (~3KB vs ~220KB)
   Uses CSS keyframes + IntersectionObserver instead of JS animation.

   Supported API surface:
   • motion.div / motion.span / motion.a / motion.section / etc.
   • initial, animate, whileInView, viewport, transition, variants
   • whileHover, whileTap (CSS :hover/:active)
   • AnimatePresence (simplified — no exit animations)
   ═══════════════════════════════════════════════════════════════ */

import React, {
  useRef, useEffect, useState, Children, type ReactNode, type CSSProperties,
} from 'react';

/* ─── Variant Propagation Context ─────────────────────── */
const MotionContext = React.createContext<{
  parentAnimate: string | StyleObj | null;
  parentVariants: Record<string, any> | null;
}>({ parentAnimate: null, parentVariants: null });

/* ─── Types ─────────────────────────────────────── */
type StyleObj = Record<string, number | string>;

interface MotionProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: any;
  initial?: StyleObj | string;
  animate?: StyleObj | string;
  whileInView?: StyleObj | string;
  whileHover?: StyleObj;
  whileTap?: StyleObj;
  viewport?: { once?: boolean; margin?: string };
  transition?: { duration?: number; delay?: number; staggerChildren?: number; ease?: string };
  variants?: Record<string, any>;
  exit?: StyleObj;
  layout?: boolean;
  layoutId?: string;
  [key: string]: any;
}

/* ─── Animation Detection ──────────────────────── */
function getAnimType(props: MotionProps): string | null {
  // Check inline styles first (initial={{ opacity: 0, y: 30 }})
  const init = typeof props.initial === 'object' ? props.initial : {};

  const hasY = init.y != null && init.y !== 0;
  const hasX = init.x != null && init.x !== 0;
  const hasScale = init.scale != null && init.scale !== 1;
  const hasOpacity = init.opacity != null && init.opacity < 1;
  const hasRotate = init.rotate != null && init.rotate !== 0;

  if (hasY && hasScale) return 'fade-scale-up';
  if (hasX && hasY) return 'fade-up'; // treat x+y as fade-up (translateY dominates)
  if (hasY) return 'fade-up';
  if (hasScale) return 'scale-in';
  if (hasRotate) return 'fade-rotate';
  if (hasOpacity && !hasY && !hasScale) return 'fade-in';

  // Check variants ({ hidden: { opacity: 0, y: 24 } })
  const hidden = props.variants?.hidden;
  if (hidden && typeof hidden === 'object') {
    if (hidden.y != null && hidden.y !== 0) {
      if (hidden.scale != null && hidden.scale !== 1) return 'fade-scale-up';
      return 'fade-up';
    }
    if (hidden.x != null && hidden.x !== 0) return 'slide-in';
    if (hidden.scale != null && hidden.scale !== 1) return 'scale-in';
    if (hidden.rotate != null && hidden.rotate !== 0) return 'fade-rotate';
    if (hidden.opacity != null) return 'fade-in';
  }

  // Stagger container — no own animation
  if (props.variants?.visible?.transition?.staggerChildren && !hidden) return null;

  // If animate="visible" with no specific hidden state, default fade-in
  if (props.animate === 'visible' || props.whileInView === 'visible') return 'fade-in';

  return null;
}

/* ─── Motion Element ───────────────────────────── */
function MotionElement(tag: string, props: MotionProps) {
  const localRef = useRef<HTMLElement>(null);
  const ref = props.ref || localRef;
  const parentCtx = React.useContext(MotionContext);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  // Track if element was already visible on first mount — if so, never animate (prevents flash)
  const wasInViewportOnMount = useRef(false);

  // Ensure animations start only after client mount (SSR-safe)
  // On mount, immediately check if element is already in viewport
  // to prevent the visible→hidden→visible flash
  useEffect(() => {
    setMounted(true);
    // Synchronous viewport check on mount
    const el = ref.current as HTMLElement | null;
    if (el) {
      const rect = el.getBoundingClientRect();
      const margin = props.viewport?.margin || '0px';
      const marginVal = Math.abs(parseInt(margin) || 0);
      if (
        rect.top < window.innerHeight + marginVal &&
        rect.bottom > -marginVal &&
        rect.left < window.innerWidth + marginVal &&
        rect.right > -marginVal
      ) {
        wasInViewportOnMount.current = true;
        // Also set inView for whileInView elements
        if (props.whileInView) {
          setInView(true);
        }
      }
    }
  }, []);

  const useScrollTrigger = !!props.whileInView && !props.animate;

  useEffect(() => {
    if (!useScrollTrigger) return;

    // Use a callback ref pattern to handle cases where ref isn't set yet
    // (common with dynamically imported / lazy-loaded components)
    let el = ref.current as HTMLElement | null;

    const once = props.viewport?.once !== false;

    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(e.target);
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin: props.viewport?.margin || '0px' },
    );

    function startObserving() {
      el = ref.current as HTMLElement | null;
      if (el) {
        observer.observe(el);
      } else {
        // Retry after a frame if ref isn't available yet (dynamic import timing)
        const raf = requestAnimationFrame(() => {
          el = ref.current as HTMLElement | null;
          if (el) observer.observe(el);
        });
        return () => cancelAnimationFrame(raf);
      }
    }

    const cleanup = startObserving();
    return () => {
      observer.disconnect();
      if (typeof cleanup === 'function') cleanup();
    };
  }, [useScrollTrigger, props.viewport?.once, props.viewport?.margin]);

  const animType = getAnimType(props);
  const duration = props.transition?.duration || 0.6;
  const delay = props.transition?.delay || 0;

  // Determine if animation should be active:
  // 1. animate="visible" (string variant name pattern from parent)
  // 2. whileInView + actually in view (scroll-triggered)
  // 3. animate is a non-empty object (e.g. { opacity: 1, y: 0 }) — animate after mount
  const hasObjectAnimate = props.animate != null && typeof props.animate !== 'string' && Object.keys(props.animate as object).length > 0;
  // Support variant propagation: if no explicit animate, inherit from parent context
  const effectiveAnimate = props.animate ?? (typeof parentCtx.parentAnimate === 'string' ? parentCtx.parentAnimate : null);
  const wantAnimate = mounted && (
    effectiveAnimate === 'visible' ||
    hasObjectAnimate ||
    (useScrollTrigger && inView)
  );

  // CRITICAL FLASH PREVENTION:
  // If element was already in viewport on first mount, NEVER apply animation.
  // Animation CSS uses fill-mode:both which immediately sets opacity:0,
  // causing a visible→invisible→visible flash for above-the-fold content.
  // wasInViewportOnMount is set synchronously in the mount useEffect.
  const shouldAnimate = wantAnimate && !wasInViewportOnMount.current;

  // Build className
  // During SSR (mounted=false): no animation classes — content renders fully visible.
  // After mount:
  //   - If was in viewport on mount: no class → stays visible, zero flash
  //   - If below viewport & triggered: apply animation class (fade-up etc)
  //   - If below viewport & NOT yet triggered: hide with motion-hidden
  let animClass = '';
  if (animType && mounted && !wasInViewportOnMount.current) {
    if (shouldAnimate) {
      animClass = `motion-${animType}`;
    } else if (!inView && useScrollTrigger) {
      // Only apply motion-hidden for elements with their own whileInView observer.
      // Elements relying on parent variant propagation don't have their own observer,
      // so they should just be visible immediately (no animation, but not hidden).
      animClass = 'motion-hidden';
    }
  }

  // Build style
  const motionStyle: CSSProperties = shouldAnimate && animType
    ? {
        ...props.style,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }
    : props.style;

  // Build hover/tap data attributes for CSS
  const hoverAttrs: Record<string, string> = {};
  if (props.whileHover) {
    if (props.whileHover.scale != null) hoverAttrs['data-motion-hover-scale'] = String(props.whileHover.scale);
    if (props.whileHover.y != null) hoverAttrs['data-motion-hover-y'] = String(props.whileHover.y);
    if (props.whileHover.x != null) hoverAttrs['data-motion-hover-x'] = String(props.whileHover.x);
  }
  if (props.whileTap) {
    if (props.whileTap.scale != null) hoverAttrs['data-motion-tap-scale'] = String(props.whileTap.scale);
  }

  // Filter out motion-specific props before spreading
  const {
    initial, animate, whileInView, whileHover, whileTap,
    viewport, transition, variants, exit, layout, layoutId,
    children, className, style, ref: _ref,
    ...rest
  } = props;

  const finalClassName = [className, animClass].filter(Boolean).join(' ');

  // Handle MotionValue children (render their current value as string)
  let processedChildren: ReactNode = children;

  // Check if single child is a MotionValue-like object
  if (
    children != null &&
    typeof children === 'object' &&
    !Array.isArray(children) &&
    'get' in (children as any) &&
    typeof (children as any).get === 'function'
  ) {
    processedChildren = String((children as any).get());
  } else if (Array.isArray(children) || (children != null && typeof children === 'object' && '$$typeof' in (children as any))) {
    // Map over React children array/fragment
    processedChildren = Children.map(children, (child: any) => {
      if (child != null && typeof child === 'object' && 'get' in child && typeof child.get === 'function') {
        return String(child.get());
      }
      return child;
    });
  }

  const Element = tag as any;

  // Determine what to pass to children via context
  const ctxAnimate = props.animate ?? parentCtx?.parentAnimate ?? null;
  const ctxVariants = props.variants ?? null;

  return (
    <MotionContext.Provider value={{ parentAnimate: ctxAnimate, parentVariants: ctxVariants }}>
      <Element
        ref={ref}
        className={finalClassName}
        style={motionStyle}
        {...hoverAttrs}
        {...rest}
      >
        {processedChildren}
      </Element>
    </MotionContext.Provider>
  );
}

/* ─── motion proxy — motion.div, motion.span, etc. ─── */
export const motion = new Proxy({} as Record<string, any>, {
  get(_target, tag: string) {
    return (props: MotionProps) => MotionElement(tag, props);
  },
});

/* ─── AnimatePresence — simplified pass-through ───
   Handles enter animations; exit animations use CSS transitions
   applied directly on child components via className toggling.
   For accordion collapse: use grid-template-rows CSS pattern.
*/
export function AnimatePresence({
  children,
  mode,
}: {
  children: ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
}) {
  return <>{children}</>;
}

/* ─── useInView hook (framer-motion compatible API) ───
   Takes a ref as first arg, options as second, returns boolean. */
export function useInView(
  ref: React.RefObject<HTMLElement | null>,
  options?: { once?: boolean; margin?: string; amount?: number },
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Synchronous viewport check on mount to prevent flash/delay
    const rect = el.getBoundingClientRect();
    const marginVal = Math.abs(parseInt(options?.margin || '0px') || 0);
    const inViewNow =
      rect.top < window.innerHeight + marginVal &&
      rect.bottom > -marginVal &&
      rect.left < window.innerWidth + marginVal &&
      rect.right > -marginVal;
    if (inViewNow) {
      setIsInView(true);
      return; // No need for observer if already in view (once=true default)
    }

    const once = options?.once !== false;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        rootMargin: options?.margin || '0px',
        threshold: options?.amount || 0,
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options?.once, options?.margin, options?.amount]);

  return isInView;
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED VALUE HOOKS — for counters, progress bars, etc.
   Lightweight replacements for framer-motion's useMotionValue,
   useTransform, and animate function.
   ═══════════════════════════════════════════════════════════════ */

type Listener = (v: number) => void;

/* ─── MotionValue — reactive number ─── */
export class MotionValue {
  private value: number;
  private listeners: Set<Listener> = new Set();

  constructor(initial: number) {
    this.value = initial;
  }

  get(): number { return this.value; }
  set(v: number) {
    this.value = v;
    this.listeners.forEach((fn) => fn(v));
  }

  on(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

/* ─── useMotionValue — hook wrapper ─── */
export function useMotionValue(initial: number): MotionValue {
  const ref = useRef<MotionValue | null>(null);
  if (!ref.current) ref.current = new MotionValue(initial);
  return ref.current;
}

/* ─── useTransform — derive a MotionValue ─── */
export function useTransform(
  source: MotionValue,
  transform: (v: number) => string | number,
): MotionValue {
  const derived = useRef<MotionValue | null>(null);
  const [, forceUpdate] = useState(0);

  if (!derived.current) {
    derived.current = new MotionValue(transform(source.get()) as number);
  }

  useEffect(() => {
    const unsub = source.on((v) => {
      derived.current!.set(transform(v) as number);
      forceUpdate((n) => n + 1); // trigger re-render to update displayed value
    });
    return unsub;
  }, [source, transform]);

  return derived.current;
}

/* ─── animate — animate a value over time ─── */
export function animate(
  motionValue: MotionValue,
  target: number,
  options?: { duration?: number; ease?: string },
): { stop: () => void } {
  const duration = (options?.duration || 1) * 1000;
  const start = motionValue.get();
  const startTime = performance.now();
  let rafId: number;

  function tick(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOut cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    motionValue.set(start + (target - start) * eased);
    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    }
  }

  rafId = requestAnimationFrame(tick);

  return {
    stop: () => cancelAnimationFrame(rafId),
  };
}

/* ─── PanInfo type (for drag handlers) ─── */
export type PanInfo = {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
};
