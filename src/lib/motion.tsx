'use client';

import React, {
  useRef, useEffect, useState, Children, type ReactNode, type CSSProperties,
} from 'react';

const MotionContext = React.createContext<{
  parentAnimate: string | StyleObj | null;
  parentVariants: Record<string, any> | null;
}>({ parentAnimate: null, parentVariants: null });

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
  drag?: boolean | 'x' | 'y';
  dragConstraints?: any;
  dragElastic?: number;
  onDragEnd?: (event: any, info: any) => void;
  onDragStart?: (event: any, info: any) => void;
  onDrag?: (event: any, info: any) => void;
  [key: string]: any;
}

function getAnimType(props: MotionProps): string | null {
  const init = typeof props.initial === 'object' ? props.initial : {};

  const hasY = init.y != null && init.y !== 0;
  const hasX = init.x != null && init.x !== 0;
  const hasScale = init.scale != null && init.scale !== 1;
  const hasOpacity = init.opacity != null && Number(init.opacity) < 1;
  const hasRotate = init.rotate != null && init.rotate !== 0;

  if (hasY && hasScale) return 'fade-scale-up';
  if (hasX && hasY) return 'fade-up'; // treat x+y as fade-up (translateY dominates)
  if (hasY) return 'fade-up';
  if (hasScale) return 'scale-in';
  if (hasRotate) return 'fade-rotate';
  if (hasOpacity && !hasY && !hasScale) return 'fade-in';

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

  if (props.variants?.visible?.transition?.staggerChildren && !hidden) return null;

  if (props.animate === 'visible' || props.whileInView === 'visible') return 'fade-in';

  return null;
}

function isInViewport(
  el: HTMLElement,
  margin: string,
): boolean {
  const rect = el.getBoundingClientRect();
  const marginVal = Math.abs(parseInt(margin) || 0);
  return (
    rect.top < window.innerHeight - marginVal &&
    rect.bottom > marginVal &&
    rect.left < window.innerWidth - marginVal &&
    rect.right > marginVal
  );
}

function MotionElement(tag: string, rawProps: MotionProps) {
  // Extract `ref` from props (React strips `key` automatically, so we must NOT access it)
  const { ref: propsRef, ...props } = rawProps;
  const localRef = useRef<HTMLElement>(null);
  const ref = propsRef || localRef;
  const parentCtx = React.useContext(MotionContext);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const wasInViewportOnMount = useRef(false);

  const useScrollTrigger = !!props.whileInView && !props.animate;

  // Use useEffect (not useLayoutEffect) to avoid hydration mismatches.
  // useLayoutEffect fires synchronously before hydration commits, causing DOM diffs.
  // useEffect fires after hydration is complete, so state changes are safe.
  useEffect(() => {
    setMounted(true);
    const el = ref.current as HTMLElement | null;
    if (el) {
      const margin = props.viewport?.margin || '0px';
      if (isInViewport(el, margin)) {
        wasInViewportOnMount.current = true;
        if (props.whileInView) {
          setInView(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!useScrollTrigger) return;

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
        return undefined;
      }
      let attempts = 0;
      const raf = requestAnimationFrame(function retry() {
        el = ref.current as HTMLElement | null;
        if (el || ++attempts > 10) {
          if (el) observer.observe(el);
          return;
        }
        requestAnimationFrame(retry);
      });
      return () => cancelAnimationFrame(raf);
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

  const hasObjectAnimate = props.animate != null && typeof props.animate !== 'string' && Object.keys(props.animate as object).length > 0;
  const effectiveAnimate = props.animate ?? (typeof parentCtx.parentAnimate === 'string' ? parentCtx.parentAnimate : null);
  const wantAnimate = mounted && (
    effectiveAnimate === 'visible' ||
    hasObjectAnimate ||
    (useScrollTrigger && inView)
  );

  const shouldAnimate = wantAnimate && !wasInViewportOnMount.current;

  let animClass = '';
  let startHidden = false;
  if (animType && mounted) {
    if (useScrollTrigger) {
      if (mounted && wasInViewportOnMount.current) {
        animClass = '';
      } else if (shouldAnimate) {
        animClass = `motion-${animType}`;
      } else {
        animClass = 'motion-hidden';
        startHidden = true;
      }
    } else if (shouldAnimate) {
      animClass = `motion-${animType}`;
    }
  }

  const motionStyle: CSSProperties = shouldAnimate && animType
    ? {
        ...(props.style || {}),
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }
    : startHidden
      ? { ...(props.style || {}), opacity: 0 }
      : (props.style || {});

  const hoverAttrs: Record<string, string> = {};
  if (props.whileHover) {
    if (props.whileHover.scale != null) hoverAttrs['data-motion-hover-scale'] = String(props.whileHover.scale);
    if (props.whileHover.y != null) hoverAttrs['data-motion-hover-y'] = String(props.whileHover.y);
    if (props.whileHover.x != null) hoverAttrs['data-motion-hover-x'] = String(props.whileHover.x);
  }
  if (props.whileTap) {
    if (props.whileTap.scale != null) hoverAttrs['data-motion-tap-scale'] = String(props.whileTap.scale);
  }

  const {
    initial, animate, whileInView, whileHover, whileTap,
    viewport, transition, variants, exit, layout, layoutId,
    drag, dragConstraints, dragElastic, onDragEnd, onDragStart, onDrag,
    children, className, style, ref: _alreadyExtracted,
    ...rest
  } = props;

  const finalClassName = [className, animClass].filter(Boolean).join(' ');

  let processedChildren: ReactNode = children;

  if (
    children != null &&
    typeof children === 'object' &&
    !Array.isArray(children) &&
    'get' in (children as any) &&
    typeof (children as any).get === 'function'
  ) {
    processedChildren = String((children as any).get());
  } else if (Array.isArray(children) || (children != null && typeof children === 'object' && '$$typeof' in (children as any))) {
    processedChildren = Children.map(children, (child: any) => {
      if (child != null && typeof child === 'object' && 'get' in child && typeof child.get === 'function') {
        return String(child.get());
      }
      return child;
    });
  }

  const Element = tag as any;

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

export const motion = new Proxy({} as Record<string, any>, {
  get(_target, tag: string) {
    return (props: MotionProps) => MotionElement(tag, props);
  },
});

export function AnimatePresence({
  children,
  mode,
}: {
  children: ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
}) {
  return <>{children}</>;
}

export function useInView(
  ref: React.RefObject<HTMLElement | null>,
  options?: { once?: boolean; margin?: string; amount?: number },
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const marginVal = Math.abs(parseInt(options?.margin || '0px') || 0);
    const inViewNow =
      el.getBoundingClientRect().top < window.innerHeight - marginVal &&
      el.getBoundingClientRect().bottom > marginVal &&
      el.getBoundingClientRect().left < window.innerWidth - marginVal &&
      el.getBoundingClientRect().right > marginVal;
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


type Listener = (v: number) => void;

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

export function useMotionValue(initial: number): MotionValue {
  const ref = useRef<MotionValue | null>(null);
  if (!ref.current) ref.current = new MotionValue(initial);
  return ref.current;
}

export function useTransform(
  source: MotionValue,
  transform: (v: number) => string | number,
): MotionValue {
  const derived = useRef<MotionValue | null>(null);
  const [, forceUpdate] = useState(0);

  if (derived.current == null) {
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

export type PanInfo = {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
};
