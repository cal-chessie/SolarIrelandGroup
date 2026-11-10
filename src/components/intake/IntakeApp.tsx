'use client';

/**
 * INTAKE OS: the one intake behind every door on the site.
 *
 * The call funnel (4 Nov 2026, INTAKE/design/lane-a-plan.md): Road 2, the
 * manual side. Your bill (optional), your estimate, your call, then the
 * confirmation, for a home or a business. The website sells one thing, the
 * free 15-minute call: no survey times, no Eircode field, no kWh required.
 * The ask and the confirmation are CallAsk.tsx, shared with the Bill
 * Analyser (Road 1), which also hands over what it read (carry.ts).
 *
 * Earlier, three screens (Your bill, optional; Your time; Your details) plus the
 * confirmation, for a home or a business. The Apple pass (3 Nov 2026) built
 * to INTAKE/design/APPLE-DECISIONS.md, which wins over apple-ui-spec.md,
 * apple-ux-spec.md and DECISIONS.md where they disagree: no separate home or
 * business screen; one hero figure and a receipt of three; Screen 2 as two
 * views under 1024 px (the estimate, then the times) and two equal lanes
 * from 1024; a date strip and only the real times as pills; dark only.
 *
 * Variants:
 *   layer : a full-screen layer over the page a door was on. The URL becomes
 *           /estimate?..., back walks the screens, and back from the first
 *           screen closes the layer onto the page exactly where it was.
 *   page  : a cold load or refresh of /estimate. The same
 *           intake as the page itself.
 *
 * Every figure on screen comes from /api/intake/quote and is never derived
 * here. CSS keyframes and transitions only: this file must never import
 * src/lib/motion.tsx, which silently ignores object animate props.
 */
import './intake.css';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Building2, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, House, Camera, Info, WifiOff, X } from 'lucide-react';
import type { BillReadResult, CallBillRead, IntakeConfig, Quote, Segment, SubmitResponse } from '@/lib/intake/contract';
import { cents, eur, kwp, num, years } from '@/lib/intake/format';
import { intakeHref, type IntakeOpenOptions } from '@/lib/intake/open';
import { setIntakeOpen, useCookieBannerVisible } from '@/lib/bottomLayer';
import { trackEvent } from '@/lib/analytics';
import { funnel } from '@/lib/intake/funnel';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { MAX_UPLOAD_BYTES, TOO_BIG_LINE } from '@/lib/intake/upload';
import { CallAsk, CallDone, callDoneCopy, type CallDetails } from './CallAsk';
import { takeCarry } from './carry';
import { cachedQuote, getConfig, getQuotes, readBillPhoto } from './api';
import {
  clearDeviceDraft,
  doorFromSeg,
  freshDraft,
  loadDeviceDraft,
  loadSession,
  monthlyBill,
  PACKAGES,
  quoteItemOf,
  saveDeviceDraft,
  saveSession,
  segFromDoor,
  validStep,
  type DeviceDraft,
  type Draft,
  type Step,
} from './model';
import { Collapse, EuroInput, Field, NoteRow, parseEuro, PrimaryButton, Spinner, TextInput } from './ui';

export interface IntakeAppProps {
  variant: 'layer' | 'page';
  initial: IntakeOpenOptions & { stepRaw?: string | null };
  onClose?: () => void;
}

const STEP_NAME: Record<Step, string> = {
  segment: 'Get your estimate',
  bill: 'Your bill',
  time: 'Your estimate',
  details: 'Your call',
  done: 'Estimate sent',
};
const STEP_COUNT: Partial<Record<Step, string>> = { bill: '1 of 3', time: '2 of 3', details: '3 of 3' };

const TAG_TEXT = {
  you_told_us: 'You told us',
  from_your_bill: 'Read from your bill',
  from_your_eircode: 'From your Eircode',
  from_page: 'From the page you came from',
  assumed: 'Assumed',
} as const;
type ProvTag = keyof typeof TAG_TEXT;

const WA = (text: string) => buildWhatsAppUrl({ source: 'intake', customMessage: text });

function track(event: string, properties: Record<string, string | number | boolean | null | undefined>) {
  try {
    trackEvent({ event, properties });
  } catch {
    /* analytics never breaks the intake */
  }
}

function breakpoint(): 'phone' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth < 640 ? 'phone' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
}

export default function IntakeApp({ variant, initial, onClose }: IntakeAppProps) {
  /* ── State ─────────────────────────────────────────────────────── */

  const [config, setConfig] = useState<IntakeConfig | null>(null);
  const [configFailed, setConfigFailed] = useState(false);

  // Deterministic first render (no storage reads), so the server render and
  // the first client render agree. Storage is merged in the mount effect.
  // A door that does not know the segment opens as a home, with the switch on
  // Screen 1 (APPLE-DECISIONS 1: no separate home-or-business screen).
  const [draft, setDraft] = useState<Draft>(() => {
    const d = freshDraft(initial);
    d.flowId = '';
    const seg = segFromDoor(initial.segment);
    d.segment = seg ?? 'domestic';
    d.segmentProv = seg ? 'from_page' : 'assumed';
    if (initial.bill != null) {
      d.bill = initial.bill;
      d.billText = String(initial.bill);
      d.per = initial.per === '2months' ? '2months' : 'month';
      d.billMethod = 'typed';
    }
    return d;
  });
  const [step, setStep] = useState<Step>(() => {
    const want = (initial.stepRaw as Step | null) || initial.step || 'bill';
    return want === 'time' ? 'time' : 'bill';
  });
  const [hydrated, setHydrated] = useState(false);
  /** Lanes side by side from 1024 px; under that, one view at a time. */
  const [wide, setWide] = useState(false);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [preview, setPreview] = useState<Quote | null>(null);
  const [updatedFlash, setUpdatedFlash] = useState(false);
  const sharpenTick = useRef(0);
  const shownTick = useRef(0);

  const [billError, setBillError] = useState<string | null>(null);
  const [pendingChip, setPendingChip] = useState<number | null>(null);
  const [kwhOpen, setKwhOpen] = useState(false);
  const [kwhText, setKwhText] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sharpKwh, setSharpKwh] = useState('');
  const [sharpKwhError, setSharpKwhError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<{ status: 'idle' | 'reading' | 'unreadable' | 'error' | 'too_large'; preview: string | null; where: 'bill' | 'time' }>({
    status: 'idle',
    preview: null,
    where: 'bill',
  });

  const [online, setOnline] = useState(true);
  const [backOnline, setBackOnline] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [resumeOffer, setResumeOffer] = useState<DeviceDraft | null>(null);
  const [depth, setDepth] = useState(1);
  /** Once Screen 1 was on screen the switch was seen, so "Change" is not repeated later. */
  const [billSeen, setBillSeen] = useState(false);

  const cookiePending = useCookieBannerVisible();

  const rootRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const depthRef = useRef(1);
  const draftRef = useRef(draft);
  const stepRef = useRef(step);
  const actionsRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const billInputRef = useRef<HTMLInputElement>(null);
  const photoRowRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const openerRef = useRef<Element | null>(null);
  const scrollYRef = useRef(0);
  const closedRef = useRef(false);
  const openedAt = useRef(0);
  const claimedRef = useRef(false);
  const firstStepRef = useRef<Step | null>(null);

  draftRef.current = draft;
  stepRef.current = step;

  const update = useCallback((patch: Partial<Draft> | ((d: Draft) => Partial<Draft>)) => {
    setDraft((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) }));
  }, []);
  const updateCall = useCallback((patch: Partial<CallDetails>) => {
    setDraft((d) => ({ ...d, call: { ...d.call, ...patch } }));
  }, []);

  const seg = draft.segment;
  const isBiz = seg === 'commercial';
  const who = config?.survey.homeownerFacingName ?? null;
  const figures = quote?.hasBasis ? quote.figures : null;
  const hasBasis = draft.bill != null || draft.annualKwh != null;

  /* ── URL and history ───────────────────────────────────────────── */

  const urlFor = useCallback((s: Step, d: Draft = draftRef.current) => {
    const base = intakeHref({
      door: d.door,
      segment: doorFromSeg(d.segment),
      bill: d.bill,
      per: d.per,
      pkg: d.pkg,
      county: d.countyContext,
      src: d.src,
    });
    if (s === 'segment') return base;
    return `${base}${base.includes('?') ? '&' : '?'}step=${s}`;
  }, []);

  const go = useCallback(
    (next: Step, opts: { replace?: boolean } = {}) => {
      const d = opts.replace ? depthRef.current : depthRef.current + 1;
      const state = { ...(window.history.state || {}), si: 1, sid: 'intake', d, step: next };
      if (opts.replace) window.history.replaceState(state, '', urlFor(next));
      else window.history.pushState(state, '', urlFor(next));
      depthRef.current = d;
      setDepth(d);
      setStep(next);
    },
    [urlFor],
  );

  const finishClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    const d = draftRef.current;
    track('intake_close', { last_step: stepRef.current, ms_since_open: Date.now() - openedAt.current, door: d.door });
    setIntakeOpen(false);
    if (variant === 'layer') {
      const b = document.body;
      b.style.position = '';
      b.style.top = '';
      b.style.left = '';
      b.style.right = '';
      b.style.width = '';
      window.scrollTo(0, scrollYRef.current);
      const el = openerRef.current as HTMLElement | null;
      if (el && typeof el.focus === 'function') el.focus({ preventScroll: true });
    }
    onClose?.();
  }, [onClose, variant]);

  const close = useCallback(() => {
    if (variant === 'layer') {
      const d = depthRef.current;
      if (d > 0 && window.history.state?.si) window.history.go(-d);
      else finishClose();
      return;
    }
    let to = '/';
    try {
      const ref = document.referrer ? new URL(document.referrer) : null;
      if (ref && ref.origin === window.location.origin && ref.pathname !== '/estimate') to = ref.pathname + ref.search;
    } catch {
      /* default home */
    }
    window.location.assign(to);
  }, [finishClose, variant]);

  const back = useCallback(() => {
    if (depthRef.current > 1) window.history.back();
    else close();
  }, [close]);

  /* ── Mount: merge storage, claim the history entry, lock the page ─ */

  useEffect(() => {
    openedAt.current = Date.now();
    openerRef.current = document.activeElement;
    const session = loadSession();
    let d: Draft = draftRef.current;
    const fromUrlStep = (initial.stepRaw as Step | null) || null;
    if (session) {
      const base = session.result && fromUrlStep !== 'done' ? { ...freshDraft(initial), call: session.call } : session;
      d = { ...base, door: initial.door || base.door, src: initial.src ?? base.src, pkg: initial.pkg ?? base.pkg, countyContext: initial.county ?? base.countyContext };
      const seg0 = segFromDoor(initial.segment);
      if (seg0) {
        d.segment = seg0;
        d.segmentProv = 'from_page';
      }
      if (initial.bill != null) {
        d.bill = initial.bill;
        d.billText = String(initial.bill);
        d.per = initial.per === '2months' ? '2months' : 'month';
        d.billMethod = 'typed';
        d.skipped = false;
      }
    } else {
      d = { ...d };
    }
    if (!d.segment) {
      d.segment = 'domestic';
      d.segmentProv = 'assumed';
    }
    if (!d.flowId) d.flowId = freshDraft().flowId;

    // From the Bill Analyser: whatever it read comes over, so nothing is typed twice.
    const carry = initial.door?.startsWith('analyser') ? takeCarry() : null;
    if (carry) {
      const r = carry.read ?? {};
      d.segment = carry.segment;
      d.segmentProv = 'from_page';
      d.carry = { from: carry.from, supplier: r.supplier ?? null, eircode: r.eircode ?? null, mprn: r.mprn ?? null, address: r.address ?? null };
      if (r.accountName && !d.call.name) d.call = { ...d.call, name: r.accountName };
      const has = r.unitRateEur != null || r.standingChargeAnnualEur != null || r.annualKwh != null;
      if (has) {
        const dayR = r.dayKwh ?? null;
        const nightR = r.nightKwh ?? null;
        const yr = r.annualKwh ?? null;
        const split = dayR !== null && nightR !== null && yr !== null && dayR + nightR > 0 ? { day: Math.round((yr * dayR) / (dayR + nightR)), night: Math.round((yr * nightR) / (dayR + nightR)) } : null;
        const br: BillReadResult = {
          amountEur: r.amountEur != null && r.period ? r.amountEur : null,
          period: r.period ?? null,
          supplier: null,
          annualKwh: yr,
          unitRateEur: r.unitRateEur ?? null,
          standingChargeAnnualEur: r.standingChargeAnnualEur ?? null,
          dayKwh: split ? split.day : null,
          nightKwh: split ? split.night : null,
        };
        d.billRead = br;
        if (r.annualKwh != null) d.annualKwh = r.annualKwh;
      }
    }

    let first: Step;
    if (variant === 'page' && fromUrlStep) first = validStep(fromUrlStep, d);
    else if (initial.step) first = validStep(initial.step, d);
    else first = 'bill';
    if (first === 'time' && d.bill == null && d.annualKwh == null) d.skipped = true;
    firstStepRef.current = first;

    // Same device, half-finished: offer to pick up (ux-spec 2.4).
    const dd = loadDeviceDraft();
    if (dd && d.bill == null && first === 'bill') setResumeOffer(dd);

    setDraft(d);
    draftRef.current = d;
    setStep(first);
    stepRef.current = first;

    // Claim the history entry once. React's dev StrictMode runs this effect
    // twice; a second push would leave a stray entry that back lands on.
    if (!claimedRef.current) {
      const state = { ...(window.history.state || {}), si: 1, sid: 'intake', d: 1, step: first };
      if (variant === 'layer') window.history.pushState(state, '', urlFor(first, d));
      else window.history.replaceState(state, '', urlFor(first, d));
      depthRef.current = 1;
      setDepth(1);
      scrollYRef.current = window.scrollY;
      claimedRef.current = true;
    }

    setIntakeOpen(true, { layer: variant === 'layer' });
    if (variant === 'layer') {
      const b = document.body;
      b.style.position = 'fixed';
      b.style.top = `-${scrollYRef.current}px`;
      b.style.left = '0';
      b.style.right = '0';
      b.style.width = '100%';
    }
    setHydrated(true);
    setOnline(navigator.onLine);
    track('intake_door_open', {
      door: d.door,
      preset_segment: d.segmentProv === 'from_page' ? d.segment : null,
      segment_prov: d.segmentProv === 'from_page' ? 'from_page' : d.segmentProv === 'assumed' ? 'default' : 'you_told_us',
      entered_at: first,
      breakpoint: breakpoint(),
      flow_id: d.flowId,
    });

    let alive = true;
    getConfig().then((c) => {
      if (!alive) return;
      if (c) setConfig(c);
      else setConfigFailed(true);
    });
    return () => {
      alive = false;
      if (!closedRef.current) {
        setIntakeOpen(false);
        if (variant === 'layer') {
          const b = document.body;
          b.style.position = '';
          b.style.top = '';
          b.style.width = '';
        }
      }
    };
    // Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Lanes from 1024: one listener, so the markup can follow (h1 vs h2, sheet vs disclosure). */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  /* Back and forward walk the screens; back past the first closes. */
  useEffect(() => {
    const onPop = () => {
      const s = window.history.state as { si?: number; d?: number; step?: Step } | null;
      if (!s?.si) {
        if (variant === 'layer') finishClose();
        return;
      }
      const d = draftRef.current;
      depthRef.current = s.d ?? 1;
      setDepth(s.d ?? 1);
      if (d.result) {
        // After a booking, back leaves the flow; it never returns to a form.
        if (variant === 'layer') window.history.go(-(s.d ?? 1));
        else window.location.replace('/');
        return;
      }
      const target = validStep(s.step ?? 'bill', d);
      setSheetOpen(false);
      setStep(target);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [finishClose, variant]);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    const el = sheetOpenerRef.current;
    if (el) setTimeout(() => el.focus({ preventScroll: true }), 0);
  }, []);

  /* Escape closes the sheet or menu first, then the layer (keeping the draft, ux-spec 8.1). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (sheetOpen) {
        e.preventDefault();
        closeSheet();
        return;
      }
      if (variant !== 'layer') return;
      close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, closeSheet, sheetOpen, variant]);

  /* The phone sheet: focus moves in, Tab stays in, the page behind holds still. */
  useEffect(() => {
    if (!sheetOpen || wide) return;
    const el = sheetRef.current;
    const root = rootRef.current;
    const prevOverflow = root?.style.overflowY ?? '';
    if (root && variant === 'layer') root.style.overflowY = 'hidden';
    const t = setTimeout(() => el?.querySelector<HTMLElement>('[data-sheet-title]')?.focus({ preventScroll: true }), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !el) return;
      const f = Array.from(el.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex="0"]')).filter((n) => !n.closest('[inert]') && n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      if (root && variant === 'layer') root.style.overflowY = prevOverflow;
    };
  }, [sheetOpen, wide, variant]);

  /* Online and offline. */
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const on = () => {
      setOnline(true);
      setBackOnline(true);
      t = setTimeout(() => setBackOnline(false), 3000);
    };
    const off = () => {
      setOnline(false);
      setBackOnline(false);
    };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      if (t) clearTimeout(t);
    };
  }, []);

  /* The bar rides above the keyboard (iOS ignores resizes-content). */
  useEffect(() => {
    const vv = window.visualViewport;
    const root = rootRef.current;
    if (!vv || !root) return;
    const fit = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty('--si-kb', `${kb > 80 ? kb : 0}px`);
      root.dataset.kb = kb > 80 ? 'up' : 'down';
    };
    fit();
    vv.addEventListener('resize', fit);
    vv.addEventListener('scroll', fit);
    return () => {
      vv.removeEventListener('resize', fit);
      vv.removeEventListener('scroll', fit);
    };
  }, []);

  /* Nothing hides under the bar: content keeps the bar's height free. */
  useEffect(() => {
    const root = rootRef.current;
    const el = actionsRef.current;
    if (!root) return;
    if (!el) {
      root.style.setProperty('--si-bar-space', '0px');
      return;
    }
    const measure = () => {
      const fixed = getComputedStyle(el).position === 'fixed' && getComputedStyle(el).display !== 'none';
      root.style.setProperty('--si-bar-space', fixed ? `${el.offsetHeight}px` : '0px');
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  });

  /* Keep the tab's copy current (refresh and resume work). */
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => saveSession(draft), 150);
    return () => clearTimeout(t);
  }, [draft, hydrated]);

  /* The URL follows segment and bill, never anything personal. */
  useEffect(() => {
    if (!hydrated) return;
    const s = window.history.state;
    if (s?.si) window.history.replaceState(s, '', urlFor(stepRef.current));
  }, [draft.segment, draft.bill, draft.per, hydrated, urlFor]);

  /* The quote for what they have given, re-priced in place on any change. */
  const qItem = useMemo(() => quoteItemOf(draft), [draft]);
  const qKey = qItem ? JSON.stringify(qItem) : null;
  useEffect(() => {
    if (!hydrated) return;
    if (!qItem) {
      setQuote(null);
      setQuoteStatus('idle');
      return;
    }
    const hit = cachedQuote(qItem);
    if (hit) {
      setQuote(hit);
      setQuoteStatus('ready');
      return;
    }
    let alive = true;
    setQuoteStatus('loading');
    getQuotes([qItem]).then((r) => {
      if (!alive) return;
      if (r && r[0]) {
        setQuote(r[0]);
        setQuoteStatus('ready');
      } else {
        setQuote(null);
        setQuoteStatus('error');
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qKey, hydrated]);

  /* "Updated" for three seconds after a change in the sheet lands. */
  useEffect(() => {
    if (quoteStatus !== 'ready' || !figures) return;
    if (sharpenTick.current > shownTick.current) {
      shownTick.current = sharpenTick.current;
      setUpdatedFlash(true);
      setAnnounce(`Estimate updated: about ${eur(figures.annualSavingEur)} a year`);
      const t = setTimeout(() => setUpdatedFlash(false), 3000);
      return () => clearTimeout(t);
    }
    if (step === 'time') {
      setAnnounce(`Estimate ready: about ${eur(figures.annualSavingEur)} a year`);
      track('intake_estimate_shown', { at_minimum: figures.sizedAtMinimum, kwp_band: Math.round(figures.kwp), segment: seg, flow_id: draft.flowId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote, quoteStatus]);

  /* The six chips are priced in one call while Screen 1 is open. */
  useEffect(() => {
    if (step !== 'bill' || !seg || !config) return;
    const amounts = isBiz ? config.bill.chips.commercial : config.bill.chips.domestic;
    const items = amounts
      .map((a) => quoteItemOf({ ...draftRef.current, bill: a, per: 'month', annualKwh: null, billRead: null }))
      .filter((q): q is NonNullable<typeof q> => q != null);
    void getQuotes(items);
  }, [step, seg, config, isBiz]);

  /* Desktop, Screen 1: the right lane is the estimate building live as they type (debounced, cached). */
  const billNow = parseEuro(draft.billText);
  useEffect(() => {
    if (step !== 'bill' || !wide || !seg) return;
    if (billNow == null) {
      setPreview(null);
      return;
    }
    const item = quoteItemOf({ ...draftRef.current, bill: billNow, annualKwh: null, billRead: null });
    if (!item) return;
    const hit = cachedQuote(item);
    if (hit) {
      setPreview(hit);
      return;
    }
    let alive = true;
    const t = setTimeout(() => {
      getQuotes([item]).then((r) => {
        if (alive && r && r[0]) setPreview(r[0]);
      });
    }, 320);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [step, wide, seg, billNow, draft.per]);

  /* Each screen: focus its heading, start at the top, say where we are. */
  useEffect(() => {
    if (!hydrated) return;
    const root = rootRef.current;
    if (variant === 'layer' && root) root.scrollTop = 0;
    else window.scrollTo(0, 0);
    const t = setTimeout(() => h1Ref.current?.focus({ preventScroll: true }), 30);
    if (step === 'details' || (step === 'time' && wide)) track('intake_ask_shown', { segment: seg, view: wide ? 'lanes' : 'ask', flow_id: draftRef.current.flowId });
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, hydrated]);

  useEffect(() => {
    if (step === 'bill') setBillSeen(true);
  }, [step]);

  /* ── Actions ───────────────────────────────────────────────────── */

  const chooseSegment = (s: Segment) => {
    const was = draftRef.current.segment;
    if (s === was && draftRef.current.segmentProv === 'you_told_us') return;
    update({ segment: s, segmentProv: 'you_told_us' });
    track('intake_segment_chosen', { value: s, changed: !!was && was !== s, flow_id: draft.flowId });
  };

  const commitBill = (amount: number, method: 'typed' | 'chip', per: 'month' | '2months') => {
    update((d) => {
      const nd = { ...d, bill: amount, billText: String(amount), per, billMethod: method, skipped: false };
      saveDeviceDraft(nd);
      return nd;
    });
    track('intake_bill_given', { method, per, band: Math.round(amount / 25) * 25, segment: seg, flow_id: draft.flowId });
    setResumeOffer(null);
  };

  const onBillSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseEuro(draft.billText);
    const kwh = kwhOpen ? Number(kwhText.replace(/[,\s]/g, '')) : NaN;
    const kwhOk = Number.isFinite(kwh) && kwh >= 100;
    if (amount == null && !kwhOk) {
      // Not an error: nothing is wrong yet (ui-spec 4.3). Calm words, amber edge.
      setBillError('Type an amount, tap the closest, or skip the bill.');
      billInputRef.current?.focus();
      return;
    }
    setBillError(null);
    if (kwhOk) update({ annualKwh: Math.round(kwh) });
    if (amount != null) commitBill(amount, 'typed', draft.per);
    else update({ skipped: false });
    go('time');
  };

  const onChip = (amount: number) => {
    setPendingChip(amount);
    commitBill(amount, 'chip', 'month');
    // The choice is seen for a beat, then the flow moves on (one tap, ux-spec 11.7).
    setTimeout(() => {
      setPendingChip(null);
      go('time');
    }, 160);
  };

  const onSkip = () => {
    update({ bill: null, billText: '', skipped: true, billMethod: null, annualKwh: null, billRead: null });
    track('intake_bill_skipped', { segment: seg, flow_id: draft.flowId });
    setBillError(null);
    go('time');
  };

  const onResume = () => {
    const r = resumeOffer;
    if (!r) return;
    update({ segment: r.segment, segmentProv: 'you_told_us', bill: r.bill, billText: String(r.bill), per: r.per, pkg: r.pkg ?? draftRef.current.pkg, billMethod: 'typed', skipped: false });
    setResumeOffer(null);
    track('intake_resume', { from: 'device' });
    go('time');
  };

  const onStartAgain = () => {
    clearDeviceDraft();
    setResumeOffer(null);
  };

  const addMyBill = () => {
    go('bill');
    setTimeout(() => billInputRef.current?.focus(), 80);
  };

  const onPhotoPicked = async (file: File | undefined, where: 'bill' | 'time') => {
    if (!file) return;
    // Over the upload cap: say so before a byte is sent (M9).
    if (file.size > MAX_UPLOAD_BYTES) {
      setPhoto({ status: 'too_large', preview: null, where });
      track('intake_photo', { result: 'too_large' });
      funnel('read_fail', { door: 'intake', reason: 'too_large' });
      return;
    }
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setPhoto({ status: 'reading', preview, where });
    track('intake_photo', { result: 'started' });
    funnel('upload_started', { door: 'intake', method: 'photo' });
    const started = Date.now();
    const r = await readBillPhoto(file);
    if (preview) URL.revokeObjectURL(preview);
    if (!r.ok) {
      setPhoto({ status: r.reason === 'unreadable' ? 'unreadable' : r.reason === 'too_large' ? 'too_large' : 'error', preview: null, where });
      track('intake_photo', { result: 'failed', ms: Date.now() - started });
      funnel('read_fail', { door: 'intake', reason: r.reason });
      // The row changes in place; nothing ever sits under the bar (ui-spec 4.5).
      setTimeout(() => photoRowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 40);
      return;
    }
    const read = r.read;
    track('intake_photo', { result: 'read', ms: Date.now() - started, fields_read: Object.values(read).filter((v) => v != null).length });
    funnel('read_ok', { door: 'intake' });
    const supplierKnown = read.supplier && config?.estimate.suppliers.some((s) => s.name === read.supplier) ? read.supplier : null;
    // "Updated" only when an estimate on screen changes; a first read is not an update.
    if (where === 'time' && stepRef.current === 'time') sharpenTick.current += 1;
    update((d) => ({
      billRead: read,
      bill: read.amountEur ?? d.bill,
      billText: read.amountEur != null ? String(read.amountEur) : d.billText,
      per: read.period === 'two_months' ? '2months' : read.period === 'month' ? 'month' : d.per,
      billMethod: 'photo',
      annualKwh: read.annualKwh ?? d.annualKwh,
      supplier: supplierKnown ?? d.supplier,
      skipped: false,
    }));
    setPhoto({ status: 'idle', preview: null, where });
    if (where === 'bill' || stepRef.current !== 'time') go('time');
  };

  const pickSupplier = (name: string | null) => {
    sharpenTick.current += 1;
    update({ supplier: name });
    track('intake_assumption_changed', { field: 'supplier' });
  };

  const applyKwh = () => {
    const k = Number(sharpKwh.replace(/[,\s]/g, ''));
    if (!Number.isFinite(k) || k < 100) {
      setSharpKwhError('Type your yearly use in kWh, for example 4,200.');
      return;
    }
    setSharpKwhError(null);
    sharpenTick.current += 1;
    update({ annualKwh: Math.round(k), billRead: null });
    track('intake_assumption_changed', { field: 'kwh' });
  };

  const openSheet = (e: { currentTarget: HTMLElement }) => {
    sheetOpenerRef.current = e.currentTarget;
    setSheetOpen((o) => !o);
    track('intake_how_opened', { segment: seg });
  };

  /** The call is booked in: the confirmation replaces the form, and back leaves the flow. */
  const onCallSent = (res: SubmitResponse, details: CallDetails, sent: { estimate: boolean }) => {
    clearDeviceDraft();
    const d = draftRef.current;
    const next = { ...d, call: details, result: res, callEstimate: sent.estimate };
    setDraft(next);
    draftRef.current = next;
    saveSession(next);
    const st = { ...(window.history.state || {}), si: 1, sid: 'intake', d: depthRef.current, step: 'done' };
    window.history.replaceState(st, '', urlFor('done', next));
    setStep('done');
    setAnnounce(callDoneCopy({ held: !!res.fallback, who, first: '', estimate: sent.estimate }).announce);
  };

  /* ── Pieces ────────────────────────────────────────────────────── */

  const prov = (p: ProvTag | 'estimate' | 'settings') => ({ 'data-figure': '', 'data-prov': p });
  const waLink = WA('Hi Solar Ireland Group, I have a question about solar.');

  const trustLine = (
    <p className="si-foot-line">
      <span>SEAI registered installer</span>
      <span aria-hidden="true">·</span>
      <span>RECI registered</span>
      <span aria-hidden="true">·</span>
      <span>
        Questions?{' '}
        <a href={waLink} target="_blank" rel="noopener noreferrer">
          WhatsApp us
        </a>
      </span>
    </p>
  );
  const legalLine = (
    <p className="si-foot-line">
      <a href="/privacy" target="_blank" rel="noopener">
        Privacy
      </a>
      <span aria-hidden="true">·</span>
      <a href="/terms" target="_blank" rel="noopener">
        Terms
      </a>
      <span aria-hidden="true">·</span>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('cookie-consent-open-settings'))}>
        Cookie settings
      </button>
    </p>
  );

  /** The cookie line: the first screen only, at the foot of its content, never sticky (APPLE-DECISIONS 7). */
  const cookieLine =
    cookiePending && depth === 1 ? (
      <div className="si-cookie" role="region" aria-label="Cookies">
        <p>Cookies: essential only, unless you say otherwise.</p>
        <div className="si-cookie__actions">
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('sig:cookie-action', { detail: 'accept' }))}>
            Accept all
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('sig:cookie-action', { detail: 'reject' }))}>
            Essential only
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('cookie-consent-open-settings'))}>
            Manage
          </button>
        </div>
      </div>
    ) : null;

  /** "Change" where the segment was set for them (DECISIONS 3), back to the switch on Screen 1. */
  const segTag =
    draft.segmentProv !== 'you_told_us' && !billSeen ? (
      <div className="si-seg-tag">
        {isBiz ? <Building2 size={16} aria-hidden="true" /> : <House size={16} aria-hidden="true" />}
        <span>{isBiz ? 'For your business' : 'For your home'}</span>
        <span className="si-seg-tag__dot" aria-hidden="true">
          ·
        </span>
        <button type="button" className="si-btn--quiet" onClick={() => go('bill')} aria-label={`Change: ${isBiz ? 'for your business' : 'for your home'}`}>
          Change
        </button>
      </div>
    ) : null;

  /* ── Screen 1: your bill ──────────────────────────────────────── */

  /** From the Bill Analyser: say why they are here and what came with them, once. */
  const carried = draft.carry;
  const carryWhy: Record<string, string> = {
    offline: 'Our bill reader is having a rest, so three quick questions instead.',
    unreadable: "We couldn't read that bill clearly, so three quick questions instead.",
    not_bill: "That didn't look like an electricity bill, so three quick questions instead.",
    timeout: 'Your bill took too long to read, so three quick questions instead.',
    rate_limited: 'Our bill reader needs a minute, so three quick questions instead.',
    too_big: 'That file was too big for us, so three quick questions instead.',
    wrong_type: "We couldn't open that file, so three quick questions instead.",
  };
  const carriedBits = carried ? [carried.supplier ? carried.supplier : null, draft.call.name ? 'your name' : null, carried.eircode ? 'your Eircode' : null].filter(Boolean) : [];
  const carryNote =
    carried && step === 'bill' && (carryWhy[carried.from] || carriedBits.length) ? (
      <div className="si-mb-12" data-carry={carried.from}>
        <NoteRow plain icon={<Info size={16} aria-hidden="true" />}>
          {carryWhy[carried.from] ?? ''}
          {carriedBits.length ? ` We kept ${carriedBits.join(' and ')} from your bill.` : ''}
        </NoteRow>
      </div>
    ) : null;

  const resumeRow = resumeOffer ? (
    <div className="si-resume">
      <Clock size={16} aria-hidden="true" />
      <p>
        Pick up where you left off?{' '}
        <b>
          {resumeOffer.segment === 'commercial' ? 'Business' : 'Home'}, about{' '}
          <span {...prov('you_told_us')}>{eur(resumeOffer.per === '2months' ? resumeOffer.bill / 2 : resumeOffer.bill)}</span> a month.
        </b>
      </p>
      <div className="si-resume__actions">
        <button type="button" className="si-btn si-btn--secondary si-btn--sm" onClick={onResume}>
          Continue
        </button>
        <button type="button" className="si-btn--quiet" onClick={onStartAgain}>
          Start again
        </button>
      </div>
    </div>
  ) : null;

  const chips = config ? (isBiz ? config.bill.chips.commercial : config.bill.chips.domestic) : isBiz ? [500, 1000, 2000, 3000, 5000, 8000] : [80, 120, 160, 200, 250, 300];
  const readerOn = !!config?.bill.readerEnabled;

  const fileInput = readerOn ? (
    <input
      ref={fileRef}
      type="file"
      accept="image/*,application/pdf"
      className="si-sr"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(e) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        void onPhotoPicked(f, stepRef.current === 'time' ? 'time' : 'bill');
      }}
    />
  ) : null;

  const photoRow = (where: 'bill' | 'time') => {
    if (!readerOn) return null;
    const here = photo.where === where;
    if (photo.status === 'reading' && here) {
      return (
        <div className="si-photo si-photo--reading" role="status" ref={photoRowRef}>
          <span className="si-reading__thumb" aria-hidden="true">
            {photo.preview ? <img src={photo.preview} alt="" /> : null}
            <span className="si-reading__line" />
          </span>
          <span className="si-photo__text">
            <span className="si-photo__title">
              Reading your bill <Spinner />
            </span>
            <span className="si-photo__line">This takes a few seconds.</span>
          </span>
        </div>
      );
    }
    const tooBig = photo.status === 'too_large' && here;
    const failed = (photo.status === 'unreadable' || photo.status === 'error' || photo.status === 'too_large') && here;
    return (
      <div ref={photoRowRef}>
        <button type="button" className="si-photo" data-state={failed ? 'unreadable' : 'idle'} onClick={() => fileRef.current?.click()}>
          <span className="si-photo__icon" aria-hidden="true">
            {failed ? <Info size={20} /> : <Camera size={20} />}
          </span>
          <span className="si-photo__text">
            <span className="si-photo__title">
              {tooBig ? 'That file is too big for us' : failed ? "We couldn't read that one clearly" : where === 'bill' ? 'Or add a photo of your bill' : 'Use a photo of your bill'}
            </span>
            <span className="si-photo__line">
              {tooBig
                ? TOO_BIG_LINE
                : failed
                ? draft.bill != null
                  ? 'Try another photo. Until then we use the amount you gave us.'
                  : 'Try another photo, or type the amount.'
                : 'An AI service reads the figures off it. You check them.'}
            </span>
          </span>
          {failed ? <span className="si-photo__again">Try again</span> : <ChevronRight className="si-photo__chev" size={16} aria-hidden="true" />}
        </button>
      </div>
    );
  };

  const amountField = (
    <div className="si-amount" data-invalid={billError ? 'nudge' : undefined}>
      <label htmlFor="si-bill" className="si-sr">
        Your bill in euro
      </label>
      <EuroInput
        id="si-bill"
        ref={billInputRef}
        value={draft.billText}
        invalid={false}
        placeholder="150"
        aria-describedby={billError ? 'si-bill-msg' : draft.per === '2months' && billNow != null ? 'si-bill-per' : undefined}
        onChange={(e) => {
          update({ billText: e.target.value.replace(/[^\d.,€\s]/g, '').slice(0, 9) });
          if (billError) setBillError(null);
        }}
      />
      <fieldset className="si-per">
        <legend className="si-sr">How often does the bill come?</legend>
        {(
          [
            { v: 'month' as const, t: 'a month', a: 'a month' },
            { v: '2months' as const, t: '2 months', a: 'every 2 months' },
          ]
        ).map((o) => (
          <label key={o.v} data-checked={draft.per === o.v ? 'true' : 'false'}>
            <input type="radio" name="si-per" value={o.v} checked={draft.per === o.v} onChange={() => update({ per: o.v })} aria-label={o.a} />
            <span aria-hidden="true">{o.t}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );

  const billLeft = (
    <form className="si-screen-in si-screen" onSubmit={onBillSubmit} noValidate>
      {resumeRow}
      {carryNote}
      <fieldset className="si-pillswitch" role="radiogroup" aria-label="Is this for your home or a business?">
        <legend className="si-sr">Is this for your home or a business?</legend>
        {(
          [
            { v: 'domestic' as Segment, icon: <House size={16} aria-hidden="true" />, t: 'Home' },
            { v: 'commercial' as Segment, icon: <Building2 size={16} aria-hidden="true" />, t: 'Business' },
          ]
        ).map((o) => (
          <label key={o.v} data-checked={seg === o.v ? 'true' : 'false'}>
            <input type="radio" name="si-seg-switch" value={o.v} checked={seg === o.v} onChange={() => chooseSegment(o.v)} />
            {o.icon}
            <span>{o.t}</span>
          </label>
        ))}
        <span className="si-pillswitch__thumb" aria-hidden="true" data-at={isBiz ? '1' : '0'} />
      </fieldset>
      <h1 className="si-title" ref={h1Ref} tabIndex={-1} id="si-bill-q">
        {isBiz ? 'Roughly what does the business spend on electricity?' : "Roughly what's your electricity bill?"}
      </h1>
      <p className="si-hint">{isBiz ? "A rough figure is fine. It's the total on a recent bill for the premises." : "A rough figure is fine. It's the total on the front of your bill."}</p>
      <div className="si-group">
        {amountField}
        {draft.per === '2months' && billNow != null && !billError ? (
          <p className="si-help" id="si-bill-per">
            <span {...prov('you_told_us')}>{eur(billNow)}</span> every 2 months, so <span {...prov('you_told_us')}>{eur(billNow / 2)}</span> a month.
          </p>
        ) : null}
        {billError ? (
          <p className="si-help si-help--nudge" id="si-bill-msg" role="status">
            {billError}
          </p>
        ) : null}
      </div>
      <div className="si-group">
        <p className="si-group-label" id="si-chips-label">
          Or pick the closest
        </p>
        <div className="si-chips" role="group" aria-labelledby="si-chips-label">
          {chips.map((a, i) => (
            <button
              key={a}
              type="button"
              className="si-chip"
              data-selected={pendingChip === a ? 'true' : 'false'}
              aria-label={`About ${eur(a)}${i === chips.length - 1 ? ' or more' : ''} a month`}
              onClick={() => onChip(a)}
            >
              {eur(a)}
              {i === chips.length - 1 ? '+' : ''}
            </button>
          ))}
        </div>
        {isBiz ? (
          <div className="si-mt-8">
            <button type="button" className="si-btn--quiet" aria-expanded={kwhOpen} onClick={() => setKwhOpen((o) => !o)}>
              I know our yearly kWh <ChevronDown size={16} aria-hidden="true" style={{ transform: kwhOpen ? 'rotate(180deg)' : undefined }} />
            </button>
            <Collapse open={kwhOpen}>
              <div style={{ paddingTop: 8 }}>
                <Field id="si-kwh" label="Yearly use in kWh" hint="It's on the annual statement.">
                  <TextInput id="si-kwh" inputMode="numeric" enterKeyHint="go" value={kwhText} onChange={(e) => setKwhText(e.target.value.replace(/[^\d,\s]/g, ''))} />
                </Field>
              </div>
            </Collapse>
          </div>
        ) : null}
      </div>
      {/* Just failed a read on the analyser: the photo row is not offered again here. */}
      {readerOn && !(draft.carry && carryWhy[draft.carry.from]) ? <div className="si-group">{photoRow('bill')}</div> : null}
      {fileInput}
      <div className="si-actions" ref={actionsRef}>
        <div className="si-actions__inner">
          <div className="si-pair">
            <button type="button" className="si-btn si-btn--secondary" onClick={onSkip} aria-label="Skip the bill and book a free call">
              Skip the bill
            </button>
            <PrimaryButton label="Show my estimate" arrow={false} offline={!online} offlineLabel="Offline" />
          </div>
          <p className="si-actions__note">No bill to hand? You can still book a free 15-minute call.</p>
        </div>
      </div>
      {cookieLine}
    </form>
  );

  /* ── The estimate: one hero, a receipt of three, one line, one link ── */

  const supplierChosen = draft.supplier && config?.estimate.suppliers.find((s) => s.name === draft.supplier);
  const monthly = monthlyBill(draft);
  const fromPhoto = !!draft.billRead;
  const rateProv: ProvTag = fromPhoto && draft.billRead?.unitRateEur ? 'from_your_bill' : supplierChosen ? 'you_told_us' : 'assumed';
  const billProv: ProvTag = fromPhoto ? 'from_your_bill' : 'you_told_us';
  const pkg = draft.pkg ? PACKAGES[draft.pkg.toLowerCase()] : undefined;

  const tagEl = (p: ProvTag) => (
    <span className="si-tag" data-prov-tag={p}>
      {TAG_TEXT[p]}
    </span>
  );

  const provRows: { name: string; value: ReactNode; tag: ProvTag; prov: ProvTag }[] = figures
    ? [
        {
          name: 'Home or business',
          value: isBiz ? 'For your business' : 'For your home',
          tag: draft.segmentProv === 'from_page' ? 'from_page' : draft.segmentProv === 'assumed' ? 'assumed' : 'you_told_us',
          prov: draft.segmentProv === 'from_page' ? 'from_page' : draft.segmentProv === 'assumed' ? 'assumed' : 'you_told_us',
        },
        ...(draft.bill != null
          ? [{ name: 'Your bill', value: draft.per === '2months' ? `${eur(draft.bill)} every 2 months (${eur(monthly ?? 0)} a month)` : `${eur(draft.bill)} a month`, tag: billProv, prov: billProv }]
          : []),
        {
          name: 'Yearly use',
          value:
            draft.annualKwh != null
              ? `${num(figures.annualKwh)} kWh`
              : `About ${num(figures.annualKwh)} kWh, worked out from your ${draft.per === '2months' && draft.bill != null ? `${eur(draft.bill)} every 2 months` : `${eur(monthly ?? 0)} a month`}`,
          tag: billProv,
          prov: billProv,
        },
        { name: 'Unit rate', value: `${cents(figures.unitRateEur)} a unit${supplierChosen ? `, ${supplierChosen.name}` : ''}`, tag: rateProv, prov: rateProv },
        { name: 'Export rate', value: `${cents(figures.exportRateEur)} for each unit you send back`, tag: 'assumed', prov: 'assumed' },
        {
          name: 'Daytime use',
          value: draft.billRead?.dayKwh ? 'Your own day and night split' : isBiz ? 'A typical business, mostly in daylight' : "A typical home's share in daylight hours",
          tag: draft.billRead?.dayKwh ? 'from_your_bill' : 'assumed',
          prov: draft.billRead?.dayKwh ? 'from_your_bill' : 'assumed',
        },
        ...(isBiz
          ? [
              // NDMG truths (audit 36): "up to", the lower of the table or 45%
              // of the cost, the enhanced rates' 6 July 2027 deadline, 13.5% VAT.
              { name: 'Grant', value: 'Non-Domestic Microgeneration Grant (NDMG), up to the lower of its table amount or 45% of the cost, at the enhanced rates for applications made by 6 July 2027', tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
              { name: 'VAT', value: '13.5% VAT on business solar', tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
              { name: 'Price', value: 'Worked out with you after the call, in your proposal', tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
            ]
          : [
              { name: 'System size', value: `We start at ${kwp(config?.estimate.minKwp ?? 4)}`, tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
              { name: 'Grant', value: `${eur(figures.grantEur)} SEAI grant`, tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
              { name: 'VAT', value: '0% VAT on home solar panels', tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
            ]),
      ]
    : [];

  type Fig = NonNullable<typeof figures>;

  /** The hero and the receipt. `live` is the Screen 1 desktop preview: no link, no tags. */
  const heroAndReceipt = (f: Fig, opts: { live?: boolean } = {}) => (
    <div className="si-est__body si-reveal" key={opts.live ? `live-${f.annualSavingEur}` : (qKey ?? 'q')}>
      <div className="si-hero">
        <p className="si-hero__pre">About</p>
        <p className="si-hero__fig">
          <b {...prov('estimate')} aria-describedby={opts.live ? undefined : 'si-hero-per si-prov-line'}>
            {eur(f.annualSavingEur)}
          </b>
        </p>
        <p className="si-hero__per" id={opts.live ? undefined : 'si-hero-per'}>
          a year, off {isBiz ? 'the' : 'your'} bill and from the power you send back
        </p>
      </div>
      <dl className="si-receipt">
        {isBiz ? (
          <>
            <div className="si-receipt__row">
              <dt>System, about</dt>
              <dd {...prov('estimate')}>{kwp(f.kwp)}</dd>
            </div>
            <div className="si-receipt__row">
              <dt>NDMG grant, up to</dt>
              <dd {...prov('estimate')}>{eur(f.grantEur)}</dd>
            </div>
            <div className="si-receipt__row">
              <dt>Your price</dt>
              <dd className="si-receipt__words">In your proposal</dd>
            </div>
          </>
        ) : (
          <>
            <div className="si-receipt__row">
              <dt>
                After your <span {...prov('estimate')}>{eur(f.grantEur)}</span> SEAI grant
              </dt>
              <dd {...prov('estimate')}>{f.netCostEur != null ? eur(f.netCostEur) : ''}</dd>
            </div>
            <div className="si-receipt__row">
              <dt>Pays back in about</dt>
              <dd {...prov('estimate')}>{f.paybackYears != null ? years(f.paybackYears) : ''}</dd>
            </div>
            <div className="si-receipt__row">
              <dt>{f.sizedAtMinimum ? 'Our smallest system' : 'System'}</dt>
              <dd {...prov('estimate')}>{kwp(f.kwp)}</dd>
            </div>
          </>
        )}
      </dl>
    </div>
  );

  const basisShort = figures ? (
    <>
      {fromPhoto ? (
        'From your bill.'
      ) : draft.annualKwh != null ? (
        <>
          From the <span {...prov('you_told_us')}>{num(draft.annualKwh)} kWh</span> a year you told us.
        </>
      ) : draft.per === '2months' && draft.bill != null ? (
        <>
          From the <span {...prov('you_told_us')}>{eur(draft.bill)}</span> every 2 months you told us.
        </>
      ) : (
        <>
          From the <span {...prov('you_told_us')}>{eur(monthly ?? 0)}</span> a month you told us.
        </>
      )}{' '}
      {isBiz ? 'Indicative, not a quote.' : 'Close estimate, not a quote.'}
    </>
  ) : null;

  const selfPct = figures && figures.annualSavingEur > 0 ? Math.round((figures.selfUseSavingEur / figures.annualSavingEur) * 100) : 50;

  /** "How we worked this out": a bottom sheet under 1024, a disclosure in the lane from 1024. */
  const sheetBody = figures ? (
    <div className="si-how">
      {isBiz ? (
        <p className="si-how__lead">
          The NDMG pays up to the lower of its table amount or 45% of the cost. These enhanced rates are for applications made by 6 July 2027. Business solar
          carries 13.5% VAT. We work out the price with you after the call.
        </p>
      ) : null}
      <div className="si-how__split">
        <div className="si-partsbar" aria-hidden="true">
          <span className="si-partsbar__self" style={{ width: `${selfPct}%` }} />
          <span className="si-partsbar__export" style={{ width: `${100 - selfPct}%` }} />
        </div>
        <p>
          <span className="si-parts__key si-partsbar__self" aria-hidden="true" />
          <b {...prov('estimate')}>{eur(figures.selfUseSavingEur)}</b> off {isBiz ? 'the' : 'your'} bill
        </p>
        <p>
          <span className="si-parts__key si-partsbar__export" aria-hidden="true" />
          <b {...prov('estimate')}>{eur(figures.exportIncomeEur)}</b> for the power you send back at <span {...prov('assumed')}>{cents(figures.exportRateEur)}</span>
        </p>
      </div>
      {!isBiz && figures.horizonSavingsEur != null ? (
        <p className="si-how__line">
          Over <span {...prov('settings')}>{figures.horizonYears} years</span>, about <b {...prov('estimate')}>{eur(figures.horizonSavingsEur)}</b>.
        </p>
      ) : null}
      {!isBiz && figures.sizedAtMinimum ? (
        <p className="si-how__line">
          We start at <b {...prov('assumed')}>{kwp(config?.estimate.minKwp ?? 4)}</b>. That&apos;s what your figures use.
        </p>
      ) : null}
      {pkg && !isBiz && pkg.kwp !== figures.kwp ? (
        <p className="si-how__line">
          You were looking at the <b {...prov('from_page')}>{pkg.name} ({kwp(pkg.kwp)})</b>. For your bill we&apos;d suggest <b {...prov('estimate')}>{kwp(figures.kwp)}</b>. We
          can talk through both on the call.
        </p>
      ) : null}
      <p className="si-group-label si-how__h">What we used</p>
      <div className="si-prov">
        {provRows.map((r) => (
          <div className="si-prov__row" key={r.name}>
            <div>
              <span className="si-prov__name">{r.name}</span>
              <span className="si-prov__value" {...prov(r.prov)}>
                {r.value}
              </span>
            </div>
            {tagEl(r.tag)}
          </div>
        ))}
      </div>
      <p className="si-group-label si-how__h">Make it closer</p>
      {!isBiz && config ? (
        <fieldset>
          <legend className="si-small">Who&apos;s your supplier?</legend>
          <div className="si-chips si-chips--2 si-mt-8">
            {config.estimate.suppliers.map((s) => (
              <button key={s.name} type="button" className="si-chip si-chip--name" aria-pressed={draft.supplier === s.name} onClick={() => pickSupplier(s.name)}>
                {s.name}
              </button>
            ))}
            <button type="button" className="si-chip si-chip--name" aria-pressed={!draft.supplier} onClick={() => pickSupplier(null)}>
              Not sure
            </button>
          </div>
        </fieldset>
      ) : null}
      <div className="si-mt-24">
        <Field id="si-sharp-kwh" label={isBiz ? 'I know our yearly kWh' : 'I know my yearly kWh'} hint="It's on your annual statement, or in your supplier's app." error={sharpKwhError}>
          <div className="si-inline-field">
            <TextInput
              id="si-sharp-kwh"
              inputMode="numeric"
              enterKeyHint="go"
              value={sharpKwh}
              invalid={!!sharpKwhError}
              aria-describedby={sharpKwhError ? 'si-sharp-kwh-error' : undefined}
              onChange={(e) => setSharpKwh(e.target.value.replace(/[^\d,\s]/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyKwh();
                }
              }}
            />
            <button type="button" className="si-btn si-btn--secondary" onClick={applyKwh}>
              Use this
            </button>
          </div>
        </Field>
      </div>
      {readerOn ? <div className="si-mt-16">{photoRow('time')}</div> : null}
      <p className="si-how__line si-mt-16">Panels only. Ask about a battery on the call.</p>
    </div>
  ) : null;

  const howLink = figures ? (
    <button type="button" className="si-btn--quiet si-how-link" aria-expanded={sheetOpen} aria-controls={wide ? 'si-how' : 'si-sheet'} onClick={openSheet}>
      {wide && sheetOpen ? 'Hide how we worked this out' : 'How we worked this out'}
      <ChevronRight size={16} aria-hidden="true" style={{ transform: wide && sheetOpen ? 'rotate(90deg)' : undefined }} />
    </button>
  ) : null;

  const minSys = config?.estimate.minSystem;
  const noBillBlock = (
    <div className="si-est">
      <h1 className="si-title" ref={h1Ref} tabIndex={-1}>
        No bill, no problem.
      </h1>
      <p className="si-hint">{isBiz ? 'We size it with you on the call.' : 'We work it out with you on the call.'}</p>
      {!isBiz && minSys ? (
        <dl className="si-receipt si-mt-32">
          <div className="si-receipt__row">
            <dt>Our smallest home system</dt>
            <dd {...prov('settings')}>{kwp(minSys.kwp)}</dd>
          </div>
          <div className="si-receipt__row">
            <dt>
              After your <span {...prov('settings')}>{eur(minSys.grantEur)}</span> SEAI grant
            </dt>
            <dd {...prov('settings')}>{eur(minSys.netCostEur)}</dd>
          </div>
        </dl>
      ) : null}
      <button type="button" className="si-btn--quiet si-mt-16" onClick={addMyBill}>
        Add my bill to see my saving <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );

  const estimateLoading = (
    <div className="si-est__loading" aria-busy="true">
      <p className="si-caption">Working out your figures</p>
      <div className="si-est__body">
        <div className="si-hero">
          <span className="si-skel" style={{ height: 20, width: 56, marginTop: 8 }} />
          <span className="si-skel si-skel--hero" />
          <span className="si-skel" style={{ height: 20, width: '60%', marginTop: 8 }} />
        </div>
        <div className="si-receipt si-receipt--skel" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div className="si-receipt__row" key={i}>
              <span className="si-skel" style={{ height: 16, width: '46%' }} />
              <span className="si-skel" style={{ height: 18, width: 64 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const estimateHead = (
    <div className="si-est__head">
      <h1 className="si-est__title" ref={h1Ref} tabIndex={-1}>
        Your estimate
      </h1>
      <span className="si-tag">{isBiz ? 'Indicative estimate' : 'Close estimate'}</span>
      {updatedFlash ? (
        <span className="si-updated">
          <Check size={14} aria-hidden="true" /> Updated
        </span>
      ) : null}
    </div>
  );

  const estimateMain = !hasBasis ? (
    noBillBlock
  ) : quoteStatus === 'error' || (configFailed && !figures) ? (
    <div className="si-est">
      {estimateHead}
      <p className="si-est__down">We can&apos;t work out your figures this second.</p>
      <p className="si-hint">You can still book your free call, and we go through your figures with you then.</p>
    </div>
  ) : figures ? (
    <div className="si-est">
      {estimateHead}
      {heroAndReceipt(figures)}
      <p className="si-prov-line" id="si-prov-line">
        {basisShort}
      </p>
      {howLink}
      {wide ? (
        <Collapse open={sheetOpen} id="si-how">
          {sheetBody}
          <button type="button" className="si-btn si-btn--secondary si-btn--sm si-mt-16" onClick={closeSheet}>
            Done
          </button>
        </Collapse>
      ) : null}
    </div>
  ) : (
    <div className="si-est">
      {estimateHead}
      {estimateLoading}
    </div>
  );

  const timeLeft = (
    <div className="si-screen-in si-screen">
      {segTag}
      {estimateMain}
      {/* Phones and portrait tablets: the estimate's one primary moves on to the ask. */}
      <div className="si-actions si-actions--phone" ref={actionsRef}>
        <div className="si-actions__inner">
          <PrimaryButton
            type="button"
            arrow={false}
            label={
              <span className="si-btn__in">
                Get my full estimate <ChevronRight size={18} aria-hidden="true" />
              </span>
            }
            onClick={() => go('details')}
          />
        </div>
      </div>
      {cookieLine}
    </div>
  );

  /* ── The ask: name, mobile, email, a best time (CallAsk, shared with Road 1) ── */

  const det = draft.call;
  const carry = draft.carry;
  const br = draft.billRead;
  const callBill: CallBillRead | null = br
    ? {
        supplier: carry?.supplier ?? draft.supplier,
        periodStart: null,
        periodEnd: null,
        amountEur: draft.bill,
        period: draft.bill != null ? (draft.per === '2months' ? 'two_months' : 'month') : null,
        unitRateEur: br.unitRateEur,
        nightRateEur: null,
        standingChargeAnnualEur: br.standingChargeAnnualEur,
        periodKwh: null,
        dayKwh: br.dayKwh,
        nightKwh: br.nightKwh,
        annualKwh: draft.annualKwh,
      }
    : null;
  const phoneChip =
    !wide && figures ? (
      <span className="si-estchip">
        About <b {...prov('estimate')}>{eur(figures.annualSavingEur)}</b> a year
        {!isBiz && figures.netCostEur != null ? (
          <>
            <span aria-hidden="true"> · </span>
            <b {...prov('estimate')}>{eur(figures.netCostEur)}</b> after grant
          </>
        ) : null}
      </span>
    ) : null;

  const askBlock = (asH1: boolean) => (
    <div className="si-screen-in si-screen">
      {phoneChip}
      <CallAsk
        idPrefix="si"
        details={det}
        onDetails={updateCall}
        who={who}
        online={online}
        heading={quote?.quoteToken ? 'Where should we send your full estimate?' : `Where should ${who || 'we'} ring you?`}
        headingLevel={asH1 ? 'h1' : 'h2'}
        headingRef={asH1 ? h1Ref : undefined}
        sub={
          quote?.quoteToken
            ? `Your full estimate by email, then a free 15-minute call with ${who || 'Solar Ireland Group'} to go through it and answer your questions. No visit, no obligation.`
            : `A free 15-minute call with ${who || 'Solar Ireland Group'} to work out your estimate with you and answer your questions. No visit, no obligation.`
        }
        ctx={{
          segment: seg || 'domestic',
          door: draft.door,
          road: 'intake',
          src: draft.src,
          pkg: draft.pkg,
          countyContext: draft.countyContext,
          flowId: draft.flowId,
          monthlyBill: monthlyBill(draft),
          annualKwh: draft.annualKwh,
          billPeriod: draft.bill != null ? (draft.per === '2months' ? 'two_months' : 'month') : null,
          supplier: draft.supplier,
          quoteToken: quote?.quoteToken ?? null,
          billRead: callBill,
          carry: carry ? { eircode: carry.eircode, mprn: carry.mprn, address: carry.address } : null,
        }}
        onSent={onCallSent}
        bar={
          asH1
            ? (button, extra) => (
                <div className="si-actions" ref={actionsRef}>
                  <div className="si-actions__inner">
                    {button}
                    {extra}
                  </div>
                </div>
              )
            : undefined
        }
      />
    </div>
  );

  /* ── Confirmation ──────────────────────────────────────────────── */

  const doneLeft = (
    <div className="si-screen-in si-screen">
      <CallDone details={det} who={who} headingRef={h1Ref} headingLevel="h1" held={!!draft.result?.fallback} estimate={draft.callEstimate !== false} />
      <footer className="si-lane-foot si-lane-foot--left">{trustLine}</footer>
    </div>
  );
  const doneRight = (
    <div className="si-screen-in si-screen">
      <h2 className="si-lane-title">Your figures</h2>
      {figures ? (
        <div className="si-mt-24">{heroAndReceipt(figures, { live: true })}</div>
      ) : (
        <p className="si-sub si-mt-16">No bill yet. We work out your figures with you on the call.</p>
      )}
      <footer className="si-lane-foot">
        <div className="si-only-phone">{trustLine}</div>
        {legalLine}
      </footer>
    </div>
  );

  /* ── Screen 1, desktop right lane: the estimate building live ──── */

  const liveFig = preview?.hasBasis ? preview.figures : null;
  const billRight = (
    <div className="si-screen-in si-screen si-live">
      <div className="si-est__head">
        <h2 className="si-est__title">Your estimate</h2>
        <span className="si-tag">{isBiz ? 'Indicative estimate' : 'Close estimate'}</span>
      </div>
      {liveFig && billNow != null ? (
        <>
          {heroAndReceipt(liveFig, { live: true })}
          <p className="si-small si-mt-16">
            From the <span {...prov('you_told_us')}>{eur(billNow)}</span> {draft.per === '2months' ? 'every 2 months' : 'a month'} you typed. Show my estimate, then book a free call.
          </p>
        </>
      ) : (
        <>
          <p className="si-live__empty">Your estimate appears here as soon as you give us a bill.</p>
          <div className="si-est__body" aria-hidden="true">
            <div className="si-hero">
              <span className="si-skel si-skel--line" style={{ width: 56 }} />
              <span className="si-skel si-skel--hero si-skel--line" />
              <span className="si-skel si-skel--line" style={{ width: '60%' }} />
            </div>
            <div className="si-receipt si-receipt--ghost">
              {(isBiz ? ['System, about', 'NDMG grant, up to', 'Your price'] : ['After your SEAI grant', 'Pays back in about', 'System']).map((l) => (
                <div className="si-receipt__row" key={l}>
                  <span>{l}</span>
                  <span className="si-skel si-skel--line" style={{ width: 64 }} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <footer className="si-lane-foot">{trustLine}</footer>
    </div>
  );

  /* ── Assemble ──────────────────────────────────────────────────── */

  const progressState: ('done' | 'current' | 'future')[] =
    step === 'bill' ? ['current', 'future', 'future'] : step === 'time' && !wide ? ['done', 'current', 'future'] : step === 'done' && !draft.result?.fallback ? ['done', 'done', 'done'] : ['done', 'done', 'current'];
  const headerName = (step === 'time' || step === 'details') && wide ? 'Your call' : STEP_NAME[step];
  const headerCount = step === 'done' ? null : (step === 'time' && wide ? STEP_COUNT.details : STEP_COUNT[step]) ?? null;
  const showPhoneBack = depth > 1 && step !== 'done';

  let left: ReactNode;
  let right: ReactNode;
  if (step === 'bill' || step === 'segment') {
    left = billLeft;
    right = billRight;
  } else if (step === 'time' || (step === 'details' && wide)) {
    // From 1024: the estimate and the ask side by side, one screen.
    left = timeLeft;
    right = wide ? askBlock(false) : null;
  } else if (step === 'details') {
    left = askBlock(true);
    right = null;
  } else {
    left = doneLeft;
    right = doneRight;
  }

  return (
    <div
      ref={rootRef}
      className={`si-intake ${variant === 'layer' ? 'si-layer' : 'si-page'}`}
      data-entering={variant === 'layer' ? 'true' : undefined}
      data-step={step}
      data-wide={wide ? 'true' : 'false'}
      data-segment={seg ?? 'unknown'}
      data-outcome={step === 'done' ? (draft.result?.fallback ? 'held' : 'call') : undefined}
      role={variant === 'layer' ? 'dialog' : undefined}
      aria-modal={variant === 'layer' ? 'true' : undefined}
      aria-label={variant === 'layer' ? 'Get your solar estimate and book a free call' : undefined}
      lang="en-IE"
    >
      <header className="si-header">
        <div className="si-header__bar">
          {showPhoneBack ? (
            <button type="button" className="si-icon-btn" onClick={back} aria-label="Back">
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
          ) : (
            <a className="si-mark" href="/" aria-label="Solar Ireland Group home">
              <img src="/logo-sm.webp" alt="" width={28} height={32} />
            </a>
          )}
          <div className="si-header__centre" aria-hidden="true">
            <span className="si-header__step">{headerName}</span>
          </div>
          <div className="si-header__end">
            <button type="button" className="si-icon-btn" onClick={close} aria-label="Close">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="si-header__desk">
          <div className="si-header__half si-header__half--left">
            <a className="si-mark" href="/">
              <img src="/logo-sm.webp" alt="" width={32} height={36} />
              <span className="si-mark__name">Solar Ireland Group</span>
            </a>
            {depth > 1 && step !== 'done' ? (
              <button type="button" className="si-header-link si-header-back" onClick={back}>
                <ChevronLeft size={16} aria-hidden="true" /> Back
              </button>
            ) : null}
          </div>
          <div className="si-header__half si-header__half--right">
            <button type="button" className="si-header-link" onClick={close}>
              Back to the site <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        {(
          <ol className="si-progress" aria-label="Progress">
            {['Your bill', 'Your estimate', 'Your call'].map((l, i) => (
              <li key={l} data-state={progressState[i]} aria-current={progressState[i] === 'current' ? 'step' : undefined}>
                <span className="si-progress__dot" aria-hidden="true">
                  {progressState[i] === 'done' ? <Check size={12} strokeWidth={3} /> : i + 1}
                </span>
                <span className="si-progress__label">
                  {l}
                  <span className="si-sr">{progressState[i] === 'done' ? ', done' : progressState[i] === 'current' ? ', current step' : ''}</span>
                </span>
                <span className="si-progress__bar" aria-hidden="true" />
              </li>
            ))}
          </ol>
        )}
        <p className="si-sr">{headerCount ? `${headerName}, step ${headerCount}` : headerName}</p>
      </header>

      {!online || backOnline ? (
        <div className="si-offline" role="status" data-back={backOnline ? 'true' : 'false'}>
          {backOnline ? <Check size={16} aria-hidden="true" /> : <WifiOff size={16} aria-hidden="true" />}
          <span>{backOnline ? 'Back online.' : "You're offline. Your answers are safe on this page."}</span>
        </div>
      ) : null}

      <main className="si-main">
        <section className="si-lane si-lane--left" aria-label={step === 'time' ? 'Your estimate' : undefined}>
          <div className="si-col">{left}</div>
        </section>
        <section className="si-lane si-lane--right" aria-label={step === 'bill' || step === 'done' ? 'Your estimate' : 'Your free call'} hidden={right === null}>
          <div className="si-col">{right}</div>
        </section>
      </main>

      {sheetOpen && !wide && figures ? (
        <div className="si-sheet-wrap">
          <div className="si-scrim" onClick={closeSheet} aria-hidden="true" />
          <div className="si-sheet" id="si-sheet" role="dialog" aria-modal="true" aria-labelledby="si-sheet-title" ref={sheetRef}>
            <div className="si-sheet__grab" aria-hidden="true" />
            <div className="si-sheet__head">
              <h2 className="si-sheet__title" id="si-sheet-title" tabIndex={-1} data-sheet-title="">
                How we worked this out
              </h2>
              <button type="button" className="si-icon-btn" onClick={closeSheet} aria-label="Close">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="si-sheet__body">
              {updatedFlash ? (
                <p className="si-updated si-mb-12">
                  <Check size={14} aria-hidden="true" /> Updated: about <b {...prov('estimate')}>{eur(figures.annualSavingEur)}</b> a year
                </p>
              ) : null}
              {sheetBody}
              <button type="button" className="si-btn si-btn--secondary si-mt-24" onClick={closeSheet}>
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="si-sr" aria-live="polite" role="status">
        {announce}
      </div>
    </div>
  );
}
