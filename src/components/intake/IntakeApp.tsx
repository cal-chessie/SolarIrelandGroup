'use client';

/**
 * INTAKE OS: the one intake behind every door on the site.
 *
 * Three screens (Your bill, optional; Your time; Your details) plus the
 * confirmation, for a home or a business, built to INTAKE/design/ux-spec.md,
 * ui-spec.md and DECISIONS.md. Two equal lanes from 1024 px, one lane with a
 * survey band and a thumb-zone bar below it.
 *
 * Variants:
 *   layer : a full-screen layer over the page a door was on. The URL becomes
 *           /estimate?..., back walks the screens, and back from the first
 *           screen closes the layer onto the page exactly where it was.
 *   page  : a cold load or refresh of /estimate (or /book-survey). The same
 *           intake as the page itself.
 *
 * Every figure on screen comes from /api/intake/quote and is never derived
 * here. CSS keyframes and transitions only: this file must never import
 * src/lib/motion.tsx, which silently ignores object animate props.
 */
import './intake.css';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  House,
  Info,
  Link2,
  MapPin,
  MessageCircle,
  Tag,
  WifiOff,
  X,
} from 'lucide-react';
import type { IntakeConfig, Quote, Segment, Slot, SlotDay, SubmitRequest, SubmitResponse } from '@/lib/intake/contract';
import {
  addDays,
  cents,
  dayLong,
  dayOfMonth,
  dayShort,
  dublinDate,
  eur,
  firstName,
  hhmmLabel,
  isEmail,
  isNorthernIreland,
  isPhone,
  kwp,
  monthShort,
  NI_COUNTIES,
  num,
  ROI_COUNTIES,
  timeLabel,
  wallTime,
  weekdayIndex,
  weekdayLong,
  weekdayShort,
  windowLabel,
  years,
} from '@/lib/intake/format';
import { formatEircode, isValidEircode, normaliseEircode } from '@/lib/eircode';
import { routingArea } from '@/lib/intake/routingKeys';
import { intakeHref, type IntakeOpenOptions } from '@/lib/intake/open';
import { setIntakeOpen, useCookieBannerVisible } from '@/lib/bottomLayer';
import { trackEvent } from '@/lib/analytics';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import {
  cachedQuote,
  getConfig,
  getQuotes,
  getSlots,
  holdSlot,
  lookupEircode,
  newKey,
  readBillPhoto,
  releaseSlot,
  submitIntake,
} from './api';
import {
  clearDeviceDraft,
  doorFromSeg,
  freshDraft,
  loadDeviceBooking,
  loadDeviceDraft,
  loadSession,
  monthlyBill,
  PACKAGES,
  quoteItemOf,
  saveDeviceBooking,
  saveDeviceDraft,
  saveSession,
  segFromDoor,
  validStep,
  type DeviceBooking,
  type DeviceDraft,
  type Details,
  type Draft,
  type Step,
} from './model';
import { Banner, Collapse, EuroInput, Field, NoteRow, parseEuro, PrimaryButton, Segmented, Spinner, TextInput, Timeline, type TimelineRow } from './ui';

export interface IntakeAppProps {
  variant: 'layer' | 'page';
  initial: IntakeOpenOptions & { stepRaw?: string | null };
  onClose?: () => void;
}

type DetailsIssue =
  | null
  | { kind: 'taken'; lost: Slot; alternatives: Slot[] }
  | { kind: 'existing'; existing: { startsAt: string; endsAt: string } }
  | { kind: 'failed' }
  | { kind: 'rate' };

type LookupState =
  | { status: 'idle' }
  | { status: 'looking' }
  | { status: 'found'; address: string; county?: string }
  | { status: 'missing' }
  | { status: 'down' };

const STEP_NAME: Record<Step, string> = {
  segment: 'Get your estimate',
  bill: 'Your bill',
  time: 'Your time',
  details: 'Your details',
  done: 'Booked',
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

function formatEircodeInput(v: string): string {
  const s = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  return s.length > 3 ? `${s.slice(0, 3)} ${s.slice(3)}` : s;
}

/* ------------------------------------------------------------------ */
/*  Calendar invite (the same one the confirmation email carries)      */
/* ------------------------------------------------------------------ */

function icsStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function buildIcs(slot: Slot, where: string, who: string | null, visitMinutes: number): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Solar Ireland//Site survey//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:survey-${icsStamp(slot.startsAt)}@solarirelandgroup.ie`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(slot.startsAt)}`,
    `DTEND:${icsStamp(slot.endsAt)}`,
    'SUMMARY:Solar Ireland site survey',
    `LOCATION:${where.replace(/[,;]/g, (m) => `\\${m}`)}`,
    `DESCRIPTION:${who ? `${who} arrives` : 'We arrive'} between ${windowLabel(slot.startsAt, slot.endsAt)}. The survey takes about ${visitMinutes} minutes.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

function googleCalendarUrl(slot: Slot, who: string | null, visitMinutes: number): string {
  // Time and a plain title only: no address or name in a third-party URL.
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Solar Ireland site survey',
    dates: `${icsStamp(slot.startsAt)}/${icsStamp(slot.endsAt)}`,
    details: `${who ? `${who} arrives` : 'We arrive'} between ${windowLabel(slot.startsAt, slot.endsAt)}. The survey takes about ${visitMinutes} minutes.`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/* ================================================================== */

export default function IntakeApp({ variant, initial, onClose }: IntakeAppProps) {
  /* ── State ─────────────────────────────────────────────────────── */

  const [config, setConfig] = useState<IntakeConfig | null>(null);
  const [configFailed, setConfigFailed] = useState(false);

  // Deterministic first render (no storage reads), so the server render and
  // the first client render agree. Storage is merged in the mount effect.
  const [draft, setDraft] = useState<Draft>(() => {
    const d = freshDraft(initial);
    d.flowId = '';
    const seg = segFromDoor(initial.segment);
    if (seg) {
      d.segment = seg;
      d.segmentProv = 'from_page';
    }
    if (initial.bill != null) {
      d.bill = initial.bill;
      d.billText = String(initial.bill);
      d.per = initial.per === '2months' ? '2months' : 'month';
      d.billMethod = 'typed';
    }
    return d;
  });
  const [step, setStep] = useState<Step>(() => {
    const seg = segFromDoor(initial.segment);
    const want = (initial.stepRaw as Step | null) || initial.step || (seg ? 'bill' : 'segment');
    if (want === 'time' || want === 'bill') return seg ? want : 'segment';
    return seg ? 'bill' : 'segment';
  });
  const [hydrated, setHydrated] = useState(false);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [updatedFlash, setUpdatedFlash] = useState(false);
  const sharpenTick = useRef(0);
  const shownTick = useRef(0);

  const [slots, setSlots] = useState<SlotDay[] | null>(null);
  const [slotsStatus, setSlotsStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [slotsFor, setSlotsFor] = useState<Segment | null>(null);
  const [daysShown, setDaysShown] = useState(4);
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqDate, setReqDate] = useState<string | null>(null);
  const [reqPart, setReqPart] = useState<'morning' | 'afternoon'>('morning');
  const [reqError, setReqError] = useState<string | null>(null);

  const [billError, setBillError] = useState<string | null>(null);
  const [pendingChip, setPendingChip] = useState<number | null>(null);
  const [kwhOpen, setKwhOpen] = useState(false);
  const [kwhText, setKwhText] = useState('');
  const [sharpenOpen, setSharpenOpen] = useState(false);
  const [sharpKwh, setSharpKwh] = useState('');
  const [sharpKwhError, setSharpKwhError] = useState<string | null>(null);
  const [addBillText, setAddBillText] = useState('');
  const [addBillPer, setAddBillPer] = useState<'month' | '2months'>('month');
  const [addBillError, setAddBillError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<{ status: 'idle' | 'reading' | 'unreadable' | 'error'; preview: string | null; where: 'bill' | 'time' }>({
    status: 'idle',
    preview: null,
    where: 'bill',
  });

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailText, setEmailText] = useState('');
  const [emailName, setEmailName] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' });
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [issue, setIssue] = useState<DetailsIssue>(null);

  const [online, setOnline] = useState(true);
  const [backOnline, setBackOnline] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [calOpen, setCalOpen] = useState(false);
  const [resumeOffer, setResumeOffer] = useState<DeviceDraft | null>(null);
  const [deviceBooked, setDeviceBooked] = useState<DeviceBooking | null>(null);
  const [changeReturn, setChangeReturn] = useState<Step | null>(null);
  const [barHidden, setBarHidden] = useState(false);
  const [depth, setDepth] = useState(1);

  const cookiePending = useCookieBannerVisible();

  const rootRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const depthRef = useRef(1);
  const draftRef = useRef(draft);
  const stepRef = useRef(step);
  const timesTitleRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const billInputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<Element | null>(null);
  const scrollYRef = useRef(0);
  const closedRef = useRef(false);
  const openedAt = useRef(0);
  const pointerRef = useRef(false);

  draftRef.current = draft;
  stepRef.current = step;

  const update = useCallback((patch: Partial<Draft> | ((d: Draft) => Partial<Draft>)) => {
    setDraft((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) }));
  }, []);
  const updateDetails = useCallback((patch: Partial<Details>) => {
    setDraft((d) => ({ ...d, details: { ...d.details, ...patch } }));
  }, []);

  const seg = draft.segment;
  const isBiz = seg === 'commercial';
  const who = config?.survey.homeownerFacingName ?? null;
  const visitMinutes = config ? (isBiz ? config.survey.businessVisitMinutes : config.survey.visitMinutes) : isBiz ? 90 : 45;
  const windowHours = config ? config.survey.arrivalWindowMinutes / 60 : 2;
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
    if (d.holdToken && !d.result) releaseSlot(d.holdToken, d.segment || 'domestic');
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
      const base = session.result && fromUrlStep !== 'done' ? { ...freshDraft(initial), details: session.details } : session;
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
    if (!d.flowId) d.flowId = freshDraft().flowId;

    let first: Step;
    if (variant === 'page' && fromUrlStep) first = validStep(fromUrlStep, d);
    else if (initial.step) first = validStep(initial.step, d);
    else first = d.segment ? 'bill' : 'segment';
    if (first === 'time' && d.bill == null && d.annualKwh == null) d.skipped = true;

    // Same device, half-finished: offer to pick up (ux-spec 2.4).
    const dd = loadDeviceDraft();
    if (dd && d.bill == null && (first === 'bill' || first === 'segment')) setResumeOffer(dd);
    // Same device, already booked (ux-spec 5.3).
    const booked = loadDeviceBooking();
    if (booked && first !== 'done') setDeviceBooked(booked);

    setDraft(d);
    draftRef.current = d;
    setStep(first);
    stepRef.current = first;

    const state = { ...(window.history.state || {}), si: 1, sid: 'intake', d: 1, step: first };
    if (variant === 'layer') window.history.pushState(state, '', urlFor(first, d));
    else window.history.replaceState(state, '', urlFor(first, d));
    depthRef.current = 1;
    setDepth(1);

    setIntakeOpen(true, { layer: variant === 'layer' });
    if (variant === 'layer') {
      scrollYRef.current = window.scrollY;
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
      const target = validStep(s.step ?? 'segment', d);
      if (stepRef.current === 'details' && target !== 'details' && d.holdToken) {
        releaseSlot(d.holdToken, d.segment || 'domestic');
        setDraft((x) => ({ ...x, holdToken: null }));
      }
      setIssue(null);
      setChangeReturn(null);
      setStep(target);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [finishClose, variant]);

  /* Escape closes the layer and keeps the draft (ux-spec 8.1). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || variant !== 'layer') return;
      if (calOpen) {
        setCalOpen(false);
        return;
      }
      close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [calOpen, close, variant]);

  /* Online and offline. */
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const on = () => {
      setOnline(true);
      setBackOnline(true);
      t = setTimeout(() => setBackOnline(false), 2000);
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
      const fixed = getComputedStyle(el).position === 'fixed';
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

  /* Times are prefetched as soon as the segment is known. */
  useEffect(() => {
    if (!hydrated || !seg || !config) return;
    if (slotsFor === seg && slotsStatus !== 'error') return;
    let alive = true;
    setSlotsStatus('loading');
    setSlotsFor(seg);
    getSlots(dublinDate(new Date()), config.survey.maxDaysAhead + 1, seg).then((r) => {
      if (!alive) return;
      if (r) {
        setSlots(r.days);
        setSlotsStatus('ready');
      } else {
        setSlots(null);
        setSlotsStatus('error');
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, seg, config]);

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

  /* "Updated" for three seconds after a Sharpen change lands. */
  useEffect(() => {
    if (quoteStatus !== 'ready' || !figures) return;
    if (sharpenTick.current > shownTick.current) {
      shownTick.current = sharpenTick.current;
      setUpdatedFlash(true);
      setAnnounce('Updated');
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
    const items = amounts.map((a) => quoteItemOf({ ...draftRef.current, bill: a, per: 'month', annualKwh: null, billRead: null })!).filter(Boolean);
    void getQuotes(items);
  }, [step, seg, config, isBiz]);

  /* Each screen: focus its heading, start at the top, say where we are. */
  useEffect(() => {
    if (!hydrated) return;
    const root = rootRef.current;
    if (variant === 'layer' && root) root.scrollTop = 0;
    else window.scrollTo(0, 0);
    const t = setTimeout(() => h1Ref.current?.focus({ preventScroll: true }), 30);
    setBarHidden(false);
    if (step === 'time') track('intake_times_shown', { segment: seg, flow_id: draftRef.current.flowId });
    if (step === 'details') track('intake_details_shown', { segment: seg, flow_id: draftRef.current.flowId });
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, hydrated, deviceBooked]);

  /* Phones, Screen 2: the bar steps away once the times are the action. */
  useEffect(() => {
    if (step !== 'time') return;
    const el = timesTitleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setBarHidden(e.isIntersecting || e.boundingClientRect.top < 0),
      { root: variant === 'layer' ? rootRef.current : null, rootMargin: '0px 0px -50% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [step, variant, slotsStatus]);

  /* The Eircode lookup, debounced, once the format is valid. */
  const eircode = draft.details.eircode;
  useEffect(() => {
    if (!isValidEircode(eircode)) {
      setLookup({ status: 'idle' });
      return;
    }
    let alive = true;
    setLookup({ status: 'looking' });
    const t = setTimeout(async () => {
      const started = Date.now();
      const r = await lookupEircode(eircode);
      if (!alive) return;
      track('intake_eircode_lookup', { result: r.ok ? 'ok' : r.reason || 'unavailable', ms: Date.now() - started });
      if (r.ok) {
        setLookup({ status: 'found', address: r.address, county: r.county });
        setAnnounce(`Address found: ${r.address}`);
        updateDetails({ manual: false });
      } else {
        const area = routingArea(eircode);
        setLookup({ status: r.reason === 'not_found' ? 'missing' : 'down' });
        const d = draftRef.current.details;
        updateDetails({
          manual: true,
          address: d.address || (area ? area.area : ''),
          county: d.county || (area ? area.county : ''),
        });
      }
    }, 450);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [eircode, updateDetails]);

  /* "Still working" after eight seconds of waiting on the booking. */
  useEffect(() => {
    if (!busy) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, [busy]);

  useEffect(() => {
    if (issue && bannerRef.current) bannerRef.current.focus({ preventScroll: false });
  }, [issue]);

  /* ── Actions ───────────────────────────────────────────────────── */

  const chooseSegment = (s: Segment) => {
    const was = draftRef.current.segment;
    update({ segment: s, segmentProv: 'you_told_us' });
    track('intake_segment_chosen', { value: s, changed: !!was && was !== s, flow_id: draft.flowId });
    if (s !== was) setSlotsFor(null);
    setTimeout(() => {
      if (changeReturn) {
        setChangeReturn(null);
        window.history.back();
      } else {
        go('bill');
      }
    }, 120);
  };

  const startChange = () => {
    setChangeReturn(step);
    go('segment');
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
      setBillError('Type your bill, tap the closest amount, or skip it.');
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
    setTimeout(() => {
      setPendingChip(null);
      go('time');
    }, 120);
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

  const onPhotoPicked = async (file: File | undefined, where: 'bill' | 'time') => {
    if (!file) return;
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setPhoto({ status: 'reading', preview, where });
    track('intake_photo', { result: 'started' });
    const started = Date.now();
    const r = await readBillPhoto(file);
    if (preview) URL.revokeObjectURL(preview);
    if (!r.ok) {
      setPhoto({ status: r.reason === 'unreadable' ? 'unreadable' : 'error', preview: null, where });
      track('intake_photo', { result: 'failed', ms: Date.now() - started });
      return;
    }
    const read = r.read;
    track('intake_photo', { result: 'read', ms: Date.now() - started, fields_read: Object.values(read).filter((v) => v != null).length });
    const supplierKnown = read.supplier && config?.estimate.suppliers.some((s) => s.name === read.supplier) ? read.supplier : null;
    sharpenTick.current += 1;
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

  const useKwh = () => {
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

  const onAddBill = (e: FormEvent) => {
    e.preventDefault();
    const a = parseEuro(addBillText);
    if (a == null) {
      setAddBillError('Type your bill to see your figures.');
      return;
    }
    setAddBillError(null);
    commitBill(a, 'typed', addBillPer);
  };

  const pickSlot = async (slot: Slot) => {
    setPendingSlot(slot.startsAt);
    const prev = draftRef.current.holdToken;
    update({ slot, requestedDay: null, idemKey: null });
    setIssue(null);
    const d = new Date(slot.startsAt);
    track('intake_slot_picked', { days_out: Math.round((d.getTime() - Date.now()) / 86400000), weekday: weekdayIndex(dublinDate(d)), flow_id: draft.flowId });
    setTimeout(() => {
      setPendingSlot(null);
      go('details');
    }, 120);
    // The quiet 10-minute hold (DECISIONS 3): never shown, it just makes
    // "taken while typing" rare.
    const r = await holdSlot(slot.startsAt, seg || 'domestic', prev);
    if (r && 'holdToken' in r) update({ holdToken: r.holdToken });
    else if (r && r.ok === false) {
      setIssue({ kind: 'taken', lost: slot, alternatives: r.alternatives });
      setSlotsFor(null);
    }
  };

  const onRequestDay = (e: FormEvent) => {
    e.preventDefault();
    if (!reqDate) {
      setReqError('Choose a day first.');
      return;
    }
    setReqError(null);
    const prev = draftRef.current.holdToken;
    if (prev) releaseSlot(prev, seg || 'domestic');
    update({ requestedDay: { date: reqDate, part: reqPart }, slot: null, holdToken: null, idemKey: null });
    track('intake_request_other_day', { flow_id: draft.flowId });
    go('details');
  };

  const copyShare = async () => {
    const url = window.location.origin + intakeHref({ door: 'share', segment: doorFromSeg(seg), step: 'time', bill: draft.bill, per: draft.per });
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard blocked: still show the URL in the address bar */
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const sendEstimateEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(emailText)) {
      setEmailError("That email doesn't look right. Check for a typo.");
      return;
    }
    setEmailError(null);
    setEmailBusy(true);
    const body: SubmitRequest = {
      source: 'website_qualified',
      name: emailName.trim() || null,
      email: emailText.trim(),
      phone: null,
      eircode: null,
      county: null,
      address: null,
      monthlyBill: monthlyBill(draft),
      annualKwh: draft.annualKwh,
      quoteToken: quote?.quoteToken ?? null,
      slot: null,
      requestedDay: null,
      emailEstimate: true,
      meta: metaOf(draft, null),
    };
    const r = await submitIntake(body, newKey());
    setEmailBusy(false);
    if (r.status === 200 && r.data && (r.data as SubmitResponse).ok) {
      update({ emailSentTo: emailText.trim() });
      if (!draft.details.email) updateDetails({ email: emailText.trim(), name: draft.details.name || emailName.trim() });
      track('intake_save_estimate', { flow_id: draft.flowId });
    } else if (r.status === 429) {
      setEmailError('Too many tries from this connection. Wait a minute, then try again.');
    } else {
      setEmailError("That didn't go through. Check your connection and try again.");
    }
  };

  /* ── Details: validation and the booking ───────────────────────── */

  const lookupFound = lookup.status === 'found' ? lookup : null;
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const d = draft.details;
    const eirValid = isValidEircode(d.eircode);
    if (!d.manual) {
      if (!d.eircode.trim()) e.eircode = 'Add your Eircode, or type the address instead.';
      else if (!eirValid) e.eircode = "That Eircode doesn't look complete yet. It's 7 characters, like D02 X285.";
    } else if (!eirValid) {
      if (d.address.trim().length < 4) e.address = 'Add the address so we find the right place.';
      if (!d.county) e.county = 'Choose a county.';
    }
    if (isBiz && d.businessName.trim().length < 2) e.businessName = 'Add the business name so we book the right premises.';
    if (d.name.trim().length < 2) e.name = 'Add your name so the surveyor knows who to ask for.';
    if (!d.mobile.trim()) e.mobile = 'Add a mobile number so the surveyor can reach you on the day.';
    else if (!isPhone(d.mobile)) e.mobile = 'That number looks short. Irish mobiles start 08 and have 10 digits.';
    if (!d.email.trim()) e.email = 'Add your email for your confirmation.';
    else if (!isEmail(d.email)) e.email = "That email doesn't look right. Check for a typo.";
    return e;
  }, [draft.details, isBiz]);
  const errOf = (k: string) => (showAll || touched[k] ? errors[k] ?? null : null);
  const touch = (k: string) => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const placeLine = (): string => {
    const d = draft.details;
    const eir = isValidEircode(d.eircode) ? formatEircode(d.eircode) : '';
    if (lookupFound) return lookupFound.address;
    const parts = [d.address.trim(), d.county ? `Co. ${d.county}` : '', eir].filter(Boolean);
    return parts.join(', ');
  };

  function metaOf(d: Draft, businessName: string | null): SubmitRequest['meta'] {
    return {
      segment: d.segment || 'domestic',
      businessName,
      door: d.door,
      page: typeof window !== 'undefined' ? window.location.pathname : '/estimate',
      src: d.src,
      pkg: d.pkg,
      countyContext: d.countyContext,
      billPeriod: d.bill != null ? (d.per === '2months' ? 'two_months' : 'month') : null,
      supplier: d.supplier,
      flowId: d.flowId,
    };
  }

  const doSubmit = async (opts: { slot?: Slot; onExisting?: 'ask' | 'move' } = {}) => {
    const d = draftRef.current;
    const slot = opts.slot ?? d.slot;
    if (busy || !online) return;
    const key = d.idemKey ?? newKey();
    if (!d.idemKey) update({ idemKey: key });
    setBusy(true);
    setIssue(null);
    track('intake_submit', { segment: d.segment, flow_id: d.flowId });
    const det = d.details;
    const eirValid = isValidEircode(det.eircode);
    const body: SubmitRequest = {
      source: 'website_survey',
      name: det.name.trim(),
      email: det.email.trim(),
      phone: det.mobile.trim(),
      eircode: eirValid ? normaliseEircode(det.eircode) : null,
      county: lookupFound?.county || det.county || null,
      address: lookupFound ? null : det.address.trim() || null,
      monthlyBill: monthlyBill(d),
      annualKwh: d.annualKwh,
      quoteToken: quote?.quoteToken ?? null,
      slot: slot ? { startsAt: slot.startsAt, holdToken: d.holdToken } : null,
      requestedDay: slot ? null : d.requestedDay,
      emailEstimate: false,
      onExisting: opts.onExisting ?? 'ask',
      meta: metaOf(d, d.segment === 'commercial' ? det.businessName.trim() : null),
    };
    const started = Date.now();
    const r = await submitIntake(body, key);
    setBusy(false);
    const res = r.data as SubmitResponse | null;
    if (r.status === 429) {
      setIssue({ kind: 'rate' });
      return;
    }
    if (r.status !== 200 || !res || !res.ok) {
      setIssue({ kind: 'failed' });
      track('intake_outcome', { outcome: 'failed', ms: Date.now() - started });
      return;
    }
    track('intake_outcome', { outcome: res.fallback ? 'outbox' : res.booking.outcome, ms: Date.now() - started, flow_id: d.flowId });
    const outcome = res.booking.outcome;
    if (outcome === 'slot_unavailable' || outcome === 'invalid_slot') {
      update({ idemKey: null, holdToken: null });
      setIssue({ kind: 'taken', lost: slot!, alternatives: res.booking.alternatives ?? [] });
      setSlotsFor(null);
      return;
    }
    if (outcome === 'already_booked' && res.booking.existing) {
      update({ idemKey: null });
      setIssue({ kind: 'existing', existing: res.booking.existing });
      return;
    }
    const booked = outcome === 'booked' || outcome === 'moved';
    const resultSlot = booked && res.booking.startsAt && res.booking.endsAt ? { startsAt: res.booking.startsAt, endsAt: res.booking.endsAt, label: timeLabel(res.booking.startsAt) } : slot ?? null;
    if (booked && resultSlot) {
      saveDeviceBooking(resultSlot);
      clearDeviceDraft();
    }
    const next = { ...d, result: res, resultSlot, idemKey: null, holdToken: null };
    setDraft(next);
    draftRef.current = next;
    saveSession(next);
    const st = { ...(window.history.state || {}), si: 1, sid: 'intake', d: depthRef.current, step: 'done' };
    window.history.replaceState(st, '', urlFor('done', next));
    setStep('done');
    if (booked && resultSlot) setAnnounce(`Booked. ${dayLong(dublinDate(resultSlot.startsAt))}, arrive between ${windowLabel(resultSlot.startsAt, resultSlot.endsAt)}.`);
  };

  const onDetailsSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowAll(true);
    const keys = ['eircode', 'address', 'county', 'businessName', 'name', 'mobile', 'email'];
    const first = keys.find((k) => errors[k]);
    if (first) {
      const el = document.getElementById(`si-${first}`);
      el?.focus();
      setAnnounce(errors[first]);
      return;
    }
    void doSubmit();
  };

  const pickAlternative = async (slot: Slot) => {
    update({ slot, idemKey: null });
    const r = await holdSlot(slot.startsAt, seg || 'domestic', draftRef.current.holdToken);
    if (r && 'holdToken' in r) update({ holdToken: r.holdToken });
    void doSubmit({ slot });
  };

  const keepExisting = () => {
    const ex = issue && issue.kind === 'existing' ? issue.existing : null;
    if (ex) setDeviceBooked({ ...ex, at: Date.now() });
    setIssue(null);
  };

  /* ── Pieces ────────────────────────────────────────────────────── */

  const segTag = (
    <div className="si-seg-tag">
      {isBiz ? <Building2 size={16} aria-hidden="true" /> : <House size={16} aria-hidden="true" />}
      <span>{isBiz ? 'For your business' : 'For your home'}</span>
      <span className="si-seg-tag__dot" aria-hidden="true">
        ·
      </span>
      <button type="button" className="si-btn--quiet" onClick={startChange} aria-label={`Change: ${isBiz ? 'for your business' : 'for your home'}`}>
        Change
      </button>
    </div>
  );

  const backText =
    depth > 1 && step !== 'done' ? (
      <button type="button" className="si-back-text si-only-desk" onClick={back}>
        <ChevronLeft size={16} aria-hidden="true" />
        Back
      </button>
    ) : null;

  const howItWorks = (doneFirst: boolean) => (
    <>
      <h2 className="si-lane-title">How this works</h2>
      <Timeline
        numbered
        rows={[
          { lead: 'See your estimate', line: 'On this page, from your bill. No email needed.', state: doneFirst ? 'done' : undefined },
          { lead: 'Pick a time for a free site survey', line: 'Real times, at your home or premises.' },
          { lead: "You're booked", line: 'With your own project page for every step after.' },
        ]}
      />
    </>
  );

  const leftFoot = (
    <footer className="si-lane-foot si-lane-foot--left">
      <p className="si-foot-line">
        <span>SEAI registered installer</span>
        <span aria-hidden="true">·</span>
        <span>RECI registered</span>
        <span aria-hidden="true">·</span>
        <span>
          Questions?{' '}
          <a href={WA("Hi Solar Ireland, I have a question about my survey booking.")} target="_blank" rel="noopener noreferrer">
            WhatsApp us
          </a>
        </span>
      </p>
    </footer>
  );
  const rightFoot = (
    <footer className="si-lane-foot">
      <p className="si-foot-line si-only-phone">
        <span>SEAI registered installer</span>
        <span aria-hidden="true">·</span>
        <span>RECI registered</span>
        <span aria-hidden="true">·</span>
        <span>
          Questions?{' '}
          <a href={WA("Hi Solar Ireland, I have a question about my survey booking.")} target="_blank" rel="noopener noreferrer">
            WhatsApp us
          </a>
        </span>
      </p>
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
    </footer>
  );

  const prov = (p: ProvTag | 'estimate' | 'settings') => ({ 'data-figure': '', 'data-prov': p });

  /* ── Screen: home or business ─────────────────────────────────── */

  const resumeRow = resumeOffer ? (
    <div className="si-mt-16" style={{ marginBottom: 24 }}>
      <NoteRow plain icon={<Clock size={16} aria-hidden="true" />}>
        Pick up where you left off?{' '}
        <b>
          {resumeOffer.segment === 'commercial' ? 'Business' : 'Home'}, about {eur(resumeOffer.per === '2months' ? resumeOffer.bill / 2 : resumeOffer.bill)} a month.
        </b>
      </NoteRow>
      <div className="si-pair si-mt-12">
        <button type="button" className="si-btn si-btn--secondary" onClick={onResume}>
          Continue
        </button>
        <button type="button" className="si-btn si-btn--secondary" onClick={onStartAgain}>
          Start again
        </button>
      </div>
    </div>
  ) : null;

  const segmentLeft = (
    <form className="si-screen-in" onSubmit={(e) => e.preventDefault()}>
      {backText}
      {resumeRow}
      <h1 className="si-title" ref={h1Ref} tabIndex={-1}>
        Is this for your home or a business?
      </h1>
      <fieldset className="si-mt-24">
        <legend className="si-sr">Home or business</legend>
        <div className="si-tiles">
          {(
            [
              { v: 'domestic' as Segment, icon: <House size={24} aria-hidden="true" />, t: 'My home', l: 'House, bungalow or apartment' },
              { v: 'commercial' as Segment, icon: <Building2 size={24} aria-hidden="true" />, t: 'My business', l: 'Shop, office, farm, factory or hotel' },
            ]
          ).map((o) => (
            <label key={o.v} className="si-tile" data-selected={seg === o.v ? 'true' : 'false'}>
              <input
                type="radio"
                name="si-segment"
                value={o.v}
                checked={seg === o.v}
                onPointerDown={() => {
                  pointerRef.current = true;
                }}
                onChange={() => {
                  if (pointerRef.current) chooseSegment(o.v);
                  else update({ segment: o.v, segmentProv: 'you_told_us' });
                  pointerRef.current = false;
                }}
                onClick={() => {
                  if (seg === o.v && pointerRef.current) chooseSegment(o.v);
                  pointerRef.current = false;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    chooseSegment(o.v);
                  }
                }}
              />
              <span className="si-tile__icon">{o.icon}</span>
              {seg === o.v ? <CheckCircle2 className="si-tile__check" size={20} aria-hidden="true" /> : null}
              <span className="si-tile__title">{o.t}</span>
              <span className="si-tile__line">{o.l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="si-small si-mt-16">It changes the grant, the tax and how we size the system.</p>
      {leftFoot}
    </form>
  );

  /* ── Screen: already booked on this device ────────────────────── */

  const deviceBookedLeft = deviceBooked ? (
    <div className="si-screen-in">
      <span className="si-done-mark si-done-mark--grey" aria-hidden="true">
        <CalendarCheck size={24} />
      </span>
      <h1 className="si-title si-mt-24" ref={h1Ref} tabIndex={-1}>
        You already have a survey booked on this device.
      </h1>
      <p className="si-facts">
        {dayLong(dublinDate(deviceBooked.startsAt))}, arrive between {windowLabel(deviceBooked.startsAt, deviceBooked.endsAt)}.
      </p>
      <div className="si-done-actions si-done-actions--two">
        <a className="si-btn si-btn--primary" data-primary="true" href="/portal">
          <span>Open your project page</span>
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        <button type="button" className="si-btn si-btn--secondary" onClick={() => setDeviceBooked(null)}>
          Book another survey
        </button>
      </div>
      <p className="si-small si-mt-16">Book another survey for a second property or for a business.</p>
      {leftFoot}
    </div>
  ) : null;

  /* ── Screen 1: your bill ──────────────────────────────────────── */

  const chips = config ? (isBiz ? config.bill.chips.commercial : config.bill.chips.domestic) : isBiz ? [500, 1000, 2000, 3000, 5000, 8000] : [80, 120, 160, 200, 250, 300];
  const billNow = parseEuro(draft.billText);
  const readerOn = !!config?.bill.readerEnabled;

  const photoBlock = (where: 'bill' | 'time') =>
    readerOn ? (
      <div className={where === 'bill' ? 'si-mt-24' : 'si-mt-16'}>
        {photo.status === 'reading' && photo.where === where ? (
          <div className="si-reading" role="status">
            <span className="si-reading__thumb" aria-hidden="true">
              {photo.preview ? <img src={photo.preview} alt="" /> : null}
              <span className="si-reading__line" />
            </span>
            <div>
              <p className="si-photo__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Reading your bill <Spinner />
              </p>
              <p className="si-photo__line">This can take a few seconds.</p>
            </div>
          </div>
        ) : (
          <button type="button" className="si-photo" onClick={() => fileRef.current?.click()} data-where={where}>
            <span className="si-photo__icon" aria-hidden="true">
              <Camera size={20} />
            </span>
            <span className="si-photo__text">
              <span className="si-photo__title">{where === 'bill' ? 'Add a photo of your bill instead' : 'Make it exact: add a photo of your bill'}</span>
              <span className="si-photo__line">We read the figures for you</span>
            </span>
            <ChevronRight className="si-photo__chev" size={16} aria-hidden="true" />
          </button>
        )}
        {(photo.status === 'unreadable' || photo.status === 'error') && photo.where === where ? (
          <NoteRow
            icon={<Info size={16} aria-hidden="true" />}
            action={
              <button type="button" className="si-btn--quiet" onClick={() => fileRef.current?.click()}>
                Try another photo
              </button>
            }
          >
            {draft.bill != null ? (
              <>
                We couldn't read that bill clearly. Your estimate still uses the <b>{eur(draft.bill)}</b> you gave us.
              </>
            ) : (
              <>We couldn't read that bill clearly. Type your bill instead, or skip it.</>
            )}
          </NoteRow>
        ) : null}
        <p className="si-help">An AI bill reader pulls the figures off your photo.</p>
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
            void onPhotoPicked(f, where);
          }}
        />
      </div>
    ) : null;

  const billLeft = (
    <form className="si-screen-in" onSubmit={onBillSubmit} noValidate>
      {backText}
      {resumeRow}
      <Segmented<Segment>
        name="si-seg-switch"
        legend="Is this for your home or a business?"
        tall
        value={seg}
        onChange={(v) => {
          update({ segment: v, segmentProv: 'you_told_us' });
          setSlotsFor(null);
          track('intake_segment_chosen', { value: v, changed: true, flow_id: draft.flowId });
        }}
        options={[
          { value: 'domestic', label: <><House size={16} aria-hidden="true" /> Home</> },
          { value: 'commercial', label: <><Building2 size={16} aria-hidden="true" /> Business</> },
        ]}
      />
      <h1 className="si-title si-mt-24" ref={h1Ref} tabIndex={-1} id="si-bill-q">
        {isBiz ? 'Roughly what does the business spend on electricity?' : "Roughly what's your electricity bill?"}
      </h1>
      <p className="si-hint">
        {isBiz ? "A rough figure is fine. It's the total on a recent bill for the premises." : "A rough figure is fine. It's the total on the front of your bill."}
      </p>
      <div className="si-mt-24">
        <label htmlFor="si-bill" className="si-sr">
          Your bill in euro
        </label>
        <EuroInput
          id="si-bill"
          ref={billInputRef}
          placeholder={isBiz ? '1,200' : '150'}
          value={draft.billText}
          invalid={false}
          aria-describedby={billError ? 'si-bill-msg' : undefined}
          onChange={(e) => {
            update({ billText: e.target.value.replace(/[^\d.,€\s]/g, '').slice(0, 9) });
            if (billError) setBillError(null);
          }}
        />
        <div className="si-mt-8">
          <Segmented<'month' | '2months'>
            name="si-per"
            legend="How often does the bill come?"
            value={draft.per}
            onChange={(v) => update({ per: v })}
            options={[
              { value: 'month', label: 'a month' },
              { value: '2months', label: 'every 2 months' },
            ]}
          />
        </div>
        {draft.per === '2months' && billNow != null ? (
          <p className="si-help" {...prov('you_told_us')}>
            {eur(billNow)} every 2 months, so {eur(billNow / 2)} a month.
          </p>
        ) : null}
        {billError ? (
          <p className="si-help" id="si-bill-msg" role="status">
            {billError}
          </p>
        ) : null}
      </div>
      <div className="si-mt-24">
        <p className="si-group-label" id="si-chips-label">
          Or tap the closest
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
      </div>
      {isBiz ? (
        <div className="si-mt-16">
          <button type="button" className="si-btn--quiet" aria-expanded={kwhOpen} onClick={() => setKwhOpen((o) => !o)}>
            I know our yearly kWh <ChevronDown size={16} aria-hidden="true" />
          </button>
          <Collapse open={kwhOpen}>
            <div style={{ paddingTop: 8 }}>
              <Field id="si-kwh" label="Yearly use in kWh" hint="It's on the annual statement.">
                <TextInput id="si-kwh" inputMode="numeric" placeholder="45,000" value={kwhText} onChange={(e) => setKwhText(e.target.value.replace(/[^\d,\s]/g, ''))} />
              </Field>
            </div>
          </Collapse>
        </div>
      ) : null}
      {photoBlock('bill')}
      <div className="si-actions" ref={actionsRef}>
        <div className="si-actions__inner">
          <div className="si-pair">
            <button type="button" className="si-btn si-btn--secondary" onClick={onSkip} aria-label="Skip the bill and just book a survey">
              Skip the bill
            </button>
            <PrimaryButton label="Show my estimate" arrow={false} offline={!online} />
          </div>
          <p className="si-actions__note">You can still book your free survey.</p>
        </div>
      </div>
      {leftFoot}
    </form>
  );

  /* ── Screen 2: your estimate (left lane) ──────────────────────── */

  const supplierChosen = draft.supplier && config?.estimate.suppliers.find((s) => s.name === draft.supplier);
  const monthly = monthlyBill(draft);
  const fromPhoto = !!draft.billRead;
  const rateProv: ProvTag = fromPhoto && draft.billRead?.unitRateEur ? 'from_your_bill' : supplierChosen ? 'you_told_us' : 'assumed';
  const billProv: ProvTag = fromPhoto ? 'from_your_bill' : 'you_told_us';
  const pkg = draft.pkg ? PACKAGES[draft.pkg.toLowerCase()] : undefined;

  const basisSentence = figures ? (
    <span id="si-basis">
      {fromPhoto ? (
        <>
          Based on your bill: <span {...prov('from_your_bill')}>{num(figures.annualKwh)} kWh a year</span> and{' '}
          <span {...prov('from_your_bill')}>{cents(figures.unitRateEur)} a unit</span>, read from your bill
          {draft.billRead?.dayKwh ? ', with your own day and night split' : ''}.
        </>
      ) : (
        <>
          Based on{' '}
          {draft.annualKwh != null ? (
            <>
              the <b {...prov('you_told_us')}>{num(draft.annualKwh)} kWh a year</b> you told us
            </>
          ) : draft.per === '2months' && draft.bill != null ? (
            <>
              the <b {...prov('you_told_us')}>{eur(draft.bill)} every 2 months</b> you told us
            </>
          ) : (
            <>
              the <b {...prov('you_told_us')}>{eur(monthly ?? 0)} a month</b> you told us
            </>
          )}
          ,{' '}
          {supplierChosen ? (
            <>
              {supplierChosen.name}'s <b {...prov('you_told_us')}>{cents(figures.unitRateEur)} a unit</b>
            </>
          ) : (
            <>
              an assumed <b {...prov('assumed')}>{cents(figures.unitRateEur)} a unit</b>
            </>
          )}{' '}
          and a typical {isBiz ? "business's" : "home's"} daytime use.
        </>
      )}{' '}
      {isBiz ? 'Indicative, not a quote.' : 'Close estimate, not a quote.'}
    </span>
  ) : null;

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
          tag: draft.segmentProv === 'from_page' ? 'from_page' : 'you_told_us',
          prov: draft.segmentProv === 'from_page' ? 'from_page' : 'you_told_us',
        },
        ...(draft.bill != null
          ? [{ name: 'Your bill', value: draft.per === '2months' ? `${eur(draft.bill)} every 2 months (${eur(monthly ?? 0)} a month)` : `${eur(draft.bill)} a month`, tag: billProv, prov: billProv }]
          : []),
        {
          name: 'Yearly use',
          value: draft.annualKwh != null ? `${num(figures.annualKwh)} kWh` : `About ${num(figures.annualKwh)} kWh, worked out from your bill`,
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
              { name: 'Grant', value: 'Non-Domestic Microgeneration Grant (NDMG)', tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
              { name: 'Price', value: 'Worked out with you at the site survey', tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
            ]
          : [
              { name: 'System size', value: `We start at ${kwp(config?.estimate.minKwp ?? 4)}`, tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
              { name: 'Grant', value: `${eur(figures.grantEur)} SEAI grant`, tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
              { name: 'VAT', value: '0% VAT on home solar panels', tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
            ]),
      ]
    : [];

  const selfPct = figures && figures.annualSavingEur > 0 ? Math.round((figures.selfUseSavingEur / figures.annualSavingEur) * 100) : 50;

  const estimateBlock = figures ? (
    <div className="si-estimate">
      <div className="si-caption-row">
        {isBiz ? <Tag size={16} className="si-muted" aria-hidden="true" /> : null}
        <span className="si-caption">{isBiz ? 'Indicative estimate' : 'Close estimate'}</span>
        {updatedFlash ? (
          <span className="si-updated">
            <Check size={14} aria-hidden="true" /> Updated
          </span>
        ) : null}
      </div>
      <div className="si-reveal" key={qKey ?? 'q'}>
        <p className="si-display">
          About <b {...prov('estimate')} aria-describedby="si-basis">{eur(figures.annualSavingEur)}</b> a year
        </p>
        <div>
          <div className="si-partsbar" aria-hidden="true">
            <span className="si-partsbar__self" style={{ width: `${selfPct}%` }} />
            <span className="si-partsbar__export" style={{ width: `${100 - selfPct}%` }} />
          </div>
          <div className="si-parts">
            <p>
              <span className="si-parts__key si-partsbar__self" aria-hidden="true" />
              <b {...prov('estimate')}>{eur(figures.selfUseSavingEur)}</b> off {isBiz ? 'the' : 'your'} bill
            </p>
            <p>
              <span className="si-parts__key si-partsbar__export" aria-hidden="true" />
              <b {...prov('estimate')}>{eur(figures.exportIncomeEur)}</b> for the power you send back at <span {...prov('assumed')}>{cents(figures.exportRateEur)}</span>
            </p>
          </div>
        </div>
        {isBiz ? <p className="si-body-lg si-white si-mt-16">An indicative estimate for your business. We work out the price with you at the site survey.</p> : null}
        <div className="si-strip" role="list">
          {isBiz ? (
            <>
              <div className="si-strip__cell" role="listitem">
                <span className="si-strip__label">System, about</span>
                <span className="si-strip__value" {...prov('estimate')}>{kwp(figures.kwp)}</span>
              </div>
              <div className="si-strip__cell" role="listitem">
                <span className="si-strip__label">NDMG grant, about</span>
                <span className="si-strip__value" {...prov('estimate')}>{eur(figures.grantEur)}</span>
              </div>
              <div className="si-strip__cell" role="listitem">
                <span className="si-strip__label">Your price</span>
                <span className="si-strip__value si-strip__value--words">At your survey</span>
              </div>
            </>
          ) : (
            <>
              <div className="si-strip__cell" role="listitem">
                <span className="si-strip__label">System</span>
                <span className="si-strip__value" {...prov('estimate')}>{kwp(figures.kwp)}</span>
              </div>
              <div className="si-strip__cell" role="listitem">
                <span className="si-strip__label">After your {eur(figures.grantEur)} SEAI grant</span>
                <span className="si-strip__value" {...prov('estimate')}>{figures.netCostEur != null ? eur(figures.netCostEur) : ''}</span>
              </div>
              <div className="si-strip__cell" role="listitem">
                <span className="si-strip__label">Pays back in about</span>
                <span className="si-strip__value" {...prov('estimate')}>{figures.paybackYears != null ? years(figures.paybackYears) : ''}</span>
              </div>
            </>
          )}
        </div>
        {!isBiz && figures.horizonSavingsEur != null ? (
          <p className="si-long">
            Over {figures.horizonYears} years, about <b {...prov('estimate')}>{eur(figures.horizonSavingsEur)}</b>.
          </p>
        ) : null}
      </div>
      {!isBiz && figures.sizedAtMinimum ? (
        <div className="si-mt-16">
          <NoteRow icon={<Info size={16} aria-hidden="true" />}>
            We start at <b {...prov('assumed')}>{kwp(config?.estimate.minKwp ?? 4)}</b>. That's what your figures use.
          </NoteRow>
        </div>
      ) : null}
      {pkg && !isBiz && pkg.kwp !== figures.kwp ? (
        <NoteRow icon={<Info size={16} aria-hidden="true" />}>
          You were looking at the <b {...prov('from_page')}>{pkg.name} ({kwp(pkg.kwp)})</b>. For your bill we'd suggest <b {...prov('estimate')}>{kwp(figures.kwp)}</b>. Your surveyor will talk through both.
        </NoteRow>
      ) : null}
      <div className={!isBiz && figures.sizedAtMinimum ? '' : 'si-mt-16'}>
        <NoteRow
          icon={<Info size={16} aria-hidden="true" />}
          action={
            <button type="button" className="si-btn--quiet" aria-expanded={sharpenOpen} aria-controls="si-sharpen" onClick={() => setSharpenOpen((o) => !o)}>
              {sharpenOpen ? 'Hide how we worked this out' : 'Sharpen it'} <ChevronDown size={16} aria-hidden="true" style={{ transform: sharpenOpen ? 'rotate(180deg)' : undefined }} />
            </button>
          }
        >
          {basisSentence}
        </NoteRow>
        <Collapse open={sharpenOpen} id="si-sharpen">
          <div style={{ paddingBottom: 8 }}>
            <p className="si-group-label si-mt-8">How we worked this out</p>
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
            {!isBiz && config ? (
              <fieldset className="si-mt-24">
                <legend className="si-group-label">Who's your supplier?</legend>
                <div className="si-chips si-chips--2">
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
              <Field id="si-sharp-kwh" label={isBiz ? 'I know our yearly kWh' : 'I know my yearly kWh'} error={sharpKwhError}>
                <div className="si-inline-field">
                  <TextInput
                    id="si-sharp-kwh"
                    inputMode="numeric"
                    placeholder={isBiz ? '45,000' : '4,200'}
                    value={sharpKwh}
                    invalid={!!sharpKwhError}
                    aria-describedby={sharpKwhError ? 'si-sharp-kwh-error' : undefined}
                    onChange={(e) => setSharpKwh(e.target.value.replace(/[^\d,\s]/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        useKwh();
                      }
                    }}
                  />
                  <button type="button" className="si-btn si-btn--secondary" onClick={useKwh}>
                    Use this
                  </button>
                </div>
              </Field>
            </div>
            {photoBlock('time')}
            <div className="si-mt-16">
              <NoteRow icon={<Info size={16} aria-hidden="true" />}>Panels only. Your surveyor can talk you through a battery.</NoteRow>
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  ) : null;

  const emailBlock = figures ? (
    <div className="si-quiet-pair">
      {draft.emailSentTo ? (
        <NoteRow tone="ok" icon={<Check size={16} aria-hidden="true" />}>
          Sent to <b>{draft.emailSentTo}</b>. The times are still here when you're ready.
        </NoteRow>
      ) : (
        <>
          <button type="button" className="si-btn--quiet" aria-expanded={emailOpen} aria-controls="si-email-est" onClick={() => setEmailOpen((o) => !o)}>
            Not ready? Email me this estimate
          </button>
          <Collapse open={emailOpen} id="si-email-est">
            <form onSubmit={sendEstimateEmail} noValidate style={{ paddingTop: 8, paddingBottom: 8 }}>
              <div className="si-pair" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
                <Field id="si-est-email" label="Your email" error={emailError}>
                  <TextInput
                    id="si-est-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="you@example.ie"
                    value={emailText}
                    invalid={!!emailError}
                    onChange={(e) => setEmailText(e.target.value)}
                  />
                </Field>
                <Field id="si-est-name" label="First name, optional">
                  <TextInput id="si-est-name" autoComplete="given-name" value={emailName} onChange={(e) => setEmailName(e.target.value)} />
                </Field>
              </div>
              <button type="submit" className="si-btn si-btn--secondary si-mt-16">
                {emailBusy ? (
                  <>
                    <Spinner /> Sending
                  </>
                ) : (
                  'Send my estimate'
                )}
              </button>
              <p className="si-help">One email with your figures and your project page. No chasing.</p>
            </form>
          </Collapse>
        </>
      )}
      <button type="button" className="si-btn--quiet" onClick={copyShare}>
        {shareCopied ? (
          <>
            <Check size={14} aria-hidden="true" /> Link copied
          </>
        ) : (
          <>
            <Link2 size={14} aria-hidden="true" /> Share this estimate
          </>
        )}
      </button>
    </div>
  ) : null;

  const minSys = config?.estimate.minSystem;
  const noBillBlock = (
    <div className="si-estimate">
      <p className="si-body-lg">
        <span className="si-white">No bill, no problem.</span>{' '}
        <span className="si-muted">{isBiz ? 'Your surveyor sizes it at the premises.' : 'Your surveyor works it out with you at the survey.'}</span>
      </p>
      {!isBiz && minSys ? (
        <div className="si-strip" role="list">
          <div className="si-strip__cell" role="listitem">
            <span className="si-strip__label">Our smallest home system</span>
            <span className="si-strip__value" {...prov('settings')}>{kwp(minSys.kwp)}</span>
          </div>
          <div className="si-strip__cell" role="listitem">
            <span className="si-strip__label">After your {eur(minSys.grantEur)} SEAI grant</span>
            <span className="si-strip__value" {...prov('settings')}>{eur(minSys.netCostEur)}</span>
          </div>
        </div>
      ) : null}
      <form onSubmit={onAddBill} noValidate className="si-mt-24">
        <p className="si-group-label">
          <label htmlFor="si-addbill">Want your figures now?</label>
        </p>
        <div className="si-addbill">
          <EuroInput
            id="si-addbill"
            compact
            placeholder={isBiz ? '1,200' : '150'}
            value={addBillText}
            invalid={!!addBillError}
            onChange={(e) => {
              setAddBillText(e.target.value.replace(/[^\d.,€\s]/g, '').slice(0, 9));
              if (addBillError) setAddBillError(null);
            }}
          />
          <button type="submit" className="si-btn si-btn--secondary">
            Show
          </button>
          <Segmented<'month' | '2months'>
            name="si-addbill-per"
            legend="How often does the bill come?"
            value={addBillPer}
            onChange={setAddBillPer}
            options={[
              { value: 'month', label: 'a month' },
              { value: '2months', label: 'every 2 months' },
            ]}
          />
        </div>
        {addBillError ? <p className="si-help">{addBillError}</p> : null}
      </form>
      {readerOn ? (
        <button type="button" className="si-btn--quiet si-mt-8" onClick={() => fileRef.current?.click()}>
          or add a photo
        </button>
      ) : null}
      {photo.status === 'reading' ? (
        <p className="si-help" role="status" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Spinner /> Reading your bill
        </p>
      ) : null}
      {readerOn ? (
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
            void onPhotoPicked(f, 'time');
          }}
        />
      ) : null}
      <div className="si-mt-16">
        <NoteRow icon={<Info size={16} aria-hidden="true" />}>
          Bring your latest bill to the survey, or add a photo any time in your project page, and your estimate appears there.
        </NoteRow>
      </div>
    </div>
  );

  const estimateLoading = (
    <div className="si-estimate" aria-busy="true">
      <div className="si-caption-row si-caption">
        <Spinner /> Working out your figures
      </div>
      <span className="si-skel" style={{ height: 44, width: '78%', marginTop: 8 }} />
      <span className="si-skel" style={{ height: 6, width: '100%', marginTop: 16 }} />
      <span className="si-skel" style={{ height: 20, width: '60%', marginTop: 12 }} />
      <span className="si-skel" style={{ height: 88, width: '100%', marginTop: 20 }} />
    </div>
  );

  const timeLeft = (
    <div className="si-screen-in">
      {backText}
      {segTag}
      <h1 className="si-sr" ref={h1Ref} tabIndex={-1}>
        Your estimate and survey times
      </h1>
      <h2 className="si-lane-title si-mt-16">Your estimate</h2>
      {!hasBasis
        ? noBillBlock
        : quoteStatus === 'error' || (configFailed && !figures)
          ? (
            <div className="si-mt-16">
              <NoteRow icon={<Info size={16} aria-hidden="true" />}>We can't work out your figures this second. You can still book, and your estimate will be in your project page.</NoteRow>
            </div>
          )
          : figures
            ? estimateBlock
            : estimateLoading}
      {hasBasis && figures ? emailBlock : null}
      <div className="si-actions si-actions--phone" ref={actionsRef} data-hidden={barHidden ? 'true' : 'false'}>
        <div className="si-actions__inner">
          <PrimaryButton
            type="button"
            arrow={false}
            label={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Pick a survey time <ChevronDown size={18} aria-hidden="true" />
              </span>
            }
            onClick={() => timesTitleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
        </div>
      </div>
      {leftFoot}
    </div>
  );

  /* ── Screen 2: the times (right lane) ─────────────────────────── */

  const columns = useMemo(() => {
    const st = config?.survey.startTimes;
    const all = st ? [...st.weekday, ...st.saturday, ...st.sunday] : ['09:00', '11:30', '14:00'];
    return Array.from(new Set(all)).sort();
  }, [config]);

  const onCellKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const row = (e.currentTarget.closest('[role="group"]') as HTMLElement | null)?.querySelectorAll<HTMLButtonElement>('button.si-cell');
    if (!row) return;
    const list = Array.from(row);
    const i = list.indexOf(e.currentTarget);
    const next = list[i + (e.key === 'ArrowRight' ? 1 : -1)];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  const requestPanel = () => {
    const today = dublinDate(new Date());
    const maxDays = config?.survey.maxDaysAhead ?? 14;
    const first = addDays(today, 1);
    const last = addDays(today, maxDays);
    const startOffset = (weekdayIndex(first) + 6) % 7;
    const gridStart = addDays(first, -startOffset);
    const cells: string[] = [];
    for (let i = 0; ; i += 1) {
      const dd = addDays(gridStart, i);
      if (dd > last && i % 7 === 0) break;
      cells.push(dd);
      if (i > 28) break;
    }
    const surveyDay = (dd: string) => {
      const wd = weekdayIndex(dd);
      const st = config?.survey.startTimes;
      const times = !st ? [] : wd === 0 ? st.sunday : wd === 6 ? st.saturday : st.weekday;
      return times.length > 0 && dd >= first && dd <= last;
    };
    return (
      <form onSubmit={onRequestDay} noValidate style={{ paddingTop: 12, paddingBottom: 8 }}>
        <fieldset>
          <legend className="si-group-label">Which day suits you?</legend>
          <div className="si-week" role="presentation">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((h) => (
              <span key={h} className="si-week__head" aria-hidden="true">
                {h}
              </span>
            ))}
            {cells.map((dd) =>
              surveyDay(dd) ? (
                <button
                  key={dd}
                  type="button"
                  className="si-chip"
                  aria-pressed={reqDate === dd}
                  aria-label={dayLong(dd)}
                  onClick={() => {
                    setReqDate(dd);
                    setReqError(null);
                  }}
                >
                  {dayOfMonth(dd)}
                </button>
              ) : (
                <span key={dd} className="si-week__empty" aria-hidden="true" />
              ),
            )}
          </div>
        </fieldset>
        <div className="si-mt-16">
          <Segmented<'morning' | 'afternoon'>
            name="si-req-part"
            legend="Morning or afternoon?"
            value={reqPart}
            onChange={setReqPart}
            options={[
              { value: 'morning', label: 'Morning' },
              { value: 'afternoon', label: 'Afternoon' },
            ]}
          />
        </div>
        {reqError ? <p className="si-help" role="status">{reqError}</p> : null}
        <div className="si-mt-16">
          <PrimaryButton label="Request this day" offline={!online} />
        </div>
      </form>
    );
  };

  const shownDays = (slots ?? []).slice(0, daysShown);
  const noTimes = slotsStatus === 'ready' && (slots?.length ?? 0) === 0;
  const timesDown = slotsStatus === 'error';

  const timeRight = (
    <div className="si-screen-in">
      <h2 className="si-lane-title" ref={timesTitleRef} id="si-times-title" style={{ scrollMarginTop: 72 }}>
        Pick a time for your free site survey
      </h2>
      <p className="si-sub">
        About {visitMinutes} minutes at your {isBiz ? 'premises' : 'home'}
        {who ? ` with ${who}` : ''}. Free, no obligation.
      </p>
      {timesDown ? (
        <div className="si-mt-16">
          <Banner icon={<CircleAlert size={16} aria-hidden="true" />} role="status">
            <b>We can't load live times this second.</b> Request a day below and {who || 'we'} will call you to fit you in.
          </Banner>
        </div>
      ) : null}
      {noTimes ? (
        <div className="si-mt-16">
          <NoteRow icon={<Info size={16} aria-hidden="true" />}>
            <b>We're fully booked for the next two weeks.</b> Request a time and {who || 'we'} will call you to fit you in.
          </NoteRow>
        </div>
      ) : null}
      {!timesDown && !noTimes ? (
        <div className="si-times">
          <p className="si-window-note">Each time is the start of a {windowHours}-hour arrival window.</p>
          {slotsStatus !== 'ready' ? (
            <div className="si-grid" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div className="si-grid__row" key={i}>
                  <span className="si-skel" style={{ height: 20, width: 56 }} />
                  <span className="si-skel" style={{ height: 48 }} />
                  <span className="si-skel" style={{ height: 48 }} />
                  <span className="si-skel" style={{ height: 48 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="si-grid" role="list" aria-labelledby="si-times-title">
              {shownDays.map((day) => {
                const byCol = columns.map((c) => day.slots.find((s) => wallTime(s.startsAt) === c) ?? null);
                const firstFree = byCol.find(Boolean);
                const selectedHere = byCol.find((s) => s && (draft.slot?.startsAt === s.startsAt || pendingSlot === s.startsAt));
                return (
                  <div className="si-grid__row" role="group" aria-label={dayLong(day.date)} key={day.date}>
                    <span className="si-grid__day" aria-hidden="true">
                      <span className="si-grid__day-phone">
                        {weekdayShort(day.date)} {dayOfMonth(day.date)}
                        <span className="si-grid__day-month">{monthShort(day.date)}</span>
                      </span>
                      <span className="si-grid__day-desk">{dayShort(day.date)}</span>
                    </span>
                    {byCol.map((s, i) =>
                      s ? (
                        <button
                          key={s.startsAt}
                          type="button"
                          className="si-cell"
                          role="listitem"
                          tabIndex={(selectedHere ? selectedHere === s : firstFree === s) ? 0 : -1}
                          data-selected={draft.slot?.startsAt === s.startsAt || pendingSlot === s.startsAt ? 'true' : 'false'}
                          aria-label={`${dayLong(day.date)}, arrive between ${windowLabel(s.startsAt, s.endsAt)}`}
                          onClick={() => void pickSlot(s)}
                          onKeyDown={onCellKey}
                        >
                          {s.label}
                        </button>
                      ) : (
                        <span key={`${day.date}-${i}`} className="si-cell si-cell--empty" aria-hidden="true" />
                      ),
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {slotsStatus === 'ready' && (slots?.length ?? 0) > daysShown ? (
            <button type="button" className="si-btn si-btn--secondary si-more" onClick={() => setDaysShown((n) => n + 4)}>
              More days <ChevronDown size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="si-mt-8">
        {timesDown || noTimes ? (
          <p className="si-group-label si-mt-16">Request a day</p>
        ) : (
          <button type="button" className="si-btn--quiet" aria-expanded={requestOpen} aria-controls="si-request" onClick={() => setRequestOpen((o) => !o)}>
            None of these work? Request another day
          </button>
        )}
        <Collapse open={requestOpen || timesDown || noTimes} id="si-request">
          {requestPanel()}
        </Collapse>
      </div>
      {rightFoot}
    </div>
  );

  /* ── Screen 3: your details ───────────────────────────────────── */

  const det = draft.details;
  const eirValid = isValidEircode(det.eircode);
  const whenText = draft.slot
    ? `${dayShort(dublinDate(draft.slot.startsAt))}, arrive ${windowLabel(draft.slot.startsAt, draft.slot.endsAt)}`
    : draft.requestedDay
      ? `${dayShort(draft.requestedDay.date)}, ${draft.requestedDay.part}, to confirm`
      : '';
  const bookLabelDesk = draft.slot ? `Book ${weekdayLong(dublinDate(draft.slot.startsAt))} ${draft.slot.label}` : 'Send my request';
  const busyLabel = draft.slot ? `Booking ${weekdayLong(dublinDate(draft.slot.startsAt))} ${draft.slot.label}` : 'Sending your request';
  const ni = isNorthernIreland(det.county);

  const issueBanner = (() => {
    if (!issue) return null;
    if (issue.kind === 'taken') {
      return (
        <div className="si-mt-16">
          <Banner bannerRef={bannerRef} icon={<Info size={16} aria-hidden="true" />} role="status">
            <b>
              Sorry, {weekdayLong(dublinDate(issue.lost.startsAt))} {issue.lost.label} has just gone.
            </b>{' '}
            {issue.alternatives.length ? 'The closest times are:' : 'Pick another time and everything you typed stays.'}
          </Banner>
          {issue.alternatives.length ? (
            <div className="si-grid" role="group" aria-label="The closest free times">
              <div className="si-grid__row" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                {issue.alternatives.slice(0, 3).map((s) => (
                  <button
                    key={s.startsAt}
                    type="button"
                    className="si-cell"
                    style={{ height: 'auto', minHeight: 52, flexDirection: 'column', lineHeight: '20px', padding: '6px 4px' }}
                    aria-label={`Book ${dayLong(dublinDate(s.startsAt))}, arrive between ${windowLabel(s.startsAt, s.endsAt)}`}
                    onClick={() => void pickAlternative(s)}
                  >
                    <span className="si-caption">{dayShort(dublinDate(s.startsAt)).replace(/ \w+$/, '')}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button type="button" className="si-btn--quiet" onClick={() => window.history.back()}>
              See the times
            </button>
          )}
        </div>
      );
    }
    if (issue.kind === 'existing') {
      const ex = issue.existing;
      return (
        <div className="si-mt-16">
          <Banner bannerRef={bannerRef} icon={<CalendarCheck size={16} aria-hidden="true" />} role="status">
            <b>
              You already have a survey on {weekdayLong(dublinDate(ex.startsAt))} {dayOfMonth(dublinDate(ex.startsAt))} at {timeLabel(ex.startsAt)}.
            </b>
          </Banner>
          <div className="si-pair si-mt-8">
            <button type="button" className="si-btn si-btn--secondary" onClick={keepExisting}>
              Keep it
            </button>
            <button type="button" className="si-btn si-btn--secondary" onClick={() => void doSubmit({ onExisting: 'move' })}>
              Move it to {draft.slot ? `${weekdayShort(dublinDate(draft.slot.startsAt))} ${draft.slot.label}` : 'this time'}
            </button>
          </div>
        </div>
      );
    }
    if (issue.kind === 'rate') {
      return (
        <div className="si-mt-16">
          <Banner bannerRef={bannerRef} tone="error" icon={<CircleAlert size={16} aria-hidden="true" />} role="alert">
            <b>Too many tries from this connection.</b> Wait a minute, then try again.
          </Banner>
        </div>
      );
    }
    return null;
  })();

  const failedBanner =
    issue?.kind === 'failed' ? (
      <div style={{ marginBottom: 12 }}>
        <Banner bannerRef={bannerRef} tone="error" icon={<CircleAlert size={16} aria-hidden="true" />} role="alert">
          <b>That didn't go through, and nothing was booked.</b> Check your connection and try again.
        </Banner>
      </div>
    ) : null;

  const lookupEnd =
    lookup.status === 'looking' ? (
      <span className="si-input-end si-input-end--muted">
        <Spinner />
      </span>
    ) : lookup.status === 'found' ? (
      <span className="si-input-end si-input-end--ok">
        <Check size={18} aria-hidden="true" />
      </span>
    ) : null;

  const detailsLeft = (
    <form className="si-screen-in" onSubmit={onDetailsSubmit} noValidate>
      {backText}
      {segTag}
      {issueBanner}
      <h1 className="si-title si-mt-16" ref={h1Ref} tabIndex={-1}>
        {isBiz ? "Where's the premises, and who do we ask for?" : "Where's the survey, and who do we ask for?"}
      </h1>
      <div className="si-mt-24">
        <Field
          id="si-eircode"
          label="Eircode"
          hint={det.manual ? null : lookup.status === 'looking' ? 'Finding your address' : lookup.status === 'found' ? null : "We'll find the address."}
          error={det.manual ? null : errOf('eircode')}
        >
          <TextInput
            id="si-eircode"
            name="postal-code"
            mono
            autoComplete="postal-code"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="next"
            maxLength={8}
            placeholder="D02 X285"
            value={det.eircode}
            invalid={!det.manual && !!errOf('eircode')}
            aria-describedby={!det.manual && errOf('eircode') ? 'si-eircode-error' : 'si-eircode-hint'}
            end={lookupEnd}
            onChange={(e) => updateDetails({ eircode: formatEircodeInput(e.target.value) })}
            onBlur={() => touch('eircode')}
          />
        </Field>
        {lookupFound ? (
          <div className="si-note si-note--plain si-mt-8" aria-live="polite">
            <MapPin size={16} aria-hidden="true" style={{ color: 'var(--si-green)' }} />
            <div className="si-note__body">
              <p className="si-white" style={{ fontSize: 15, lineHeight: '22px', fontWeight: 500 }} {...prov('from_your_eircode')}>
                {lookupFound.address}
              </p>
              <p className="si-caption">
                <span className="si-tag" data-prov-tag="from_your_eircode">
                  From your Eircode
                </span>
              </p>
              <button type="button" className="si-btn--quiet" onClick={() => updateDetails({ manual: true })}>
                Not right? Type the address
              </button>
            </div>
          </div>
        ) : null}
        {lookup.status === 'down' || lookup.status === 'missing' ? (
          <div className="si-mt-8">
            <NoteRow plain icon={<Info size={16} aria-hidden="true" />}>
              We couldn't look that one up just now. Add the address and we'll check it at the survey.
            </NoteRow>
          </div>
        ) : null}
        {!det.manual && !lookupFound ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 16 }}>
            <button type="button" className="si-btn--quiet" onClick={() => updateDetails({ manual: true })}>
              No Eircode? Type the address
            </button>
            <a className="si-btn--quiet" href="https://finder.eircode.ie" target="_blank" rel="noopener noreferrer">
              Find your Eircode at eircode.ie
            </a>
          </div>
        ) : null}
        <Collapse open={det.manual}>
          <div style={{ paddingTop: 16 }}>
            <Field id="si-address" label="Address" error={eirValid ? null : errOf('address')} tag={lookup.status === 'down' && det.address ? <span className="si-tag si-tag--fill">From your Eircode</span> : undefined}>
              <TextInput
                id="si-address"
                autoComplete="street-address"
                placeholder="House number and street, town"
                value={det.address}
                invalid={!eirValid && !!errOf('address')}
                aria-describedby={!eirValid && errOf('address') ? 'si-address-error' : undefined}
                onChange={(e) => updateDetails({ address: e.target.value })}
                onBlur={() => touch('address')}
              />
            </Field>
            <Field id="si-county" label="County" error={eirValid ? null : errOf('county')}>
              <div className="si-input-wrap">
                <select
                  id="si-county"
                  className="si-select"
                  value={det.county}
                  aria-invalid={!eirValid && errOf('county') ? 'true' : undefined}
                  aria-describedby={!eirValid && errOf('county') ? 'si-county-error' : undefined}
                  onChange={(e) => updateDetails({ county: e.target.value })}
                  onBlur={() => touch('county')}
                >
                  <option value="">Choose a county</option>
                  {ROI_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <optgroup label="Northern Ireland">
                    {NI_COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <span className="si-input-end si-input-end--muted">
                  <ChevronDown size={18} aria-hidden="true" />
                </span>
              </div>
            </Field>
            {ni ? (
              <div className="si-mt-12">
                <NoteRow
                  icon={<Info size={16} aria-hidden="true" />}
                  action={
                    <a className="si-btn--quiet" href={WA('Hi Solar Ireland, I am in Northern Ireland and would like to talk about solar.')} target="_blank" rel="noopener noreferrer">
                      <MessageCircle size={14} aria-hidden="true" /> WhatsApp us
                    </a>
                  }
                >
                  SEAI grants apply in the Republic of Ireland. We'll talk you through the options for your area.
                </NoteRow>
              </div>
            ) : null}
          </div>
        </Collapse>
      </div>
      {isBiz ? (
        <div className="si-mt-24">
          <Field id="si-businessName" label="Business name" error={errOf('businessName')}>
            <TextInput
              id="si-businessName"
              name="businessName"
              autoComplete="organization"
              enterKeyHint="next"
              value={det.businessName}
              invalid={!!errOf('businessName')}
              aria-describedby={errOf('businessName') ? 'si-businessName-error' : undefined}
              onChange={(e) => updateDetails({ businessName: e.target.value })}
              onBlur={() => touch('businessName')}
            />
          </Field>
        </div>
      ) : null}
      <div className="si-mt-24">
        <Field id="si-name" label="Your name" error={errOf('name')}>
          <TextInput
            id="si-name"
            name="name"
            autoComplete="name"
            enterKeyHint="next"
            value={det.name}
            invalid={!!errOf('name')}
            aria-describedby={errOf('name') ? 'si-name-error' : undefined}
            onChange={(e) => updateDetails({ name: e.target.value })}
            onBlur={() => touch('name')}
          />
        </Field>
        <Field id="si-mobile" label="Mobile" hint="So your surveyor can reach you on the day." error={errOf('mobile')}>
          <TextInput
            id="si-mobile"
            name="tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
            placeholder="087 123 4567"
            value={det.mobile}
            invalid={!!errOf('mobile')}
            aria-describedby={errOf('mobile') ? 'si-mobile-error' : 'si-mobile-hint'}
            onChange={(e) => updateDetails({ mobile: e.target.value })}
            onBlur={() => touch('mobile')}
          />
        </Field>
        <Field id="si-email" label="Email" hint="For your confirmation and your project page." error={errOf('email')}>
          <TextInput
            id="si-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder="you@example.ie"
            value={det.email}
            invalid={!!errOf('email')}
            aria-describedby={errOf('email') ? 'si-email-error' : 'si-email-hint'}
            onChange={(e) => updateDetails({ email: e.target.value })}
            onBlur={() => touch('email')}
            readOnly={busy}
          />
        </Field>
      </div>
      <div className="si-actions" ref={actionsRef}>
        <div className="si-actions__inner">
          {failedBanner}
          <PrimaryButton
            label={
              <>
                <span className="si-only-desk">{bookLabelDesk}</span>
                <span className="si-only-phone">{draft.slot ? 'Book my survey' : 'Send my request'}</span>
              </>
            }
            busy={busy}
            busyLabel={
              <>
                <span className="si-only-desk">{busyLabel}</span>
                <span className="si-only-phone">{draft.slot ? 'Booking your survey' : 'Sending your request'}</span>
              </>
            }
            offline={!online}
          />
          {slow ? <p className="si-still" role="status">Still working. Please keep this page open.</p> : null}
        </div>
      </div>
      <p className="si-legal">
        We use these details to arrange your survey.{' '}
        <a href="/privacy" target="_blank" rel="noopener">
          Privacy notice
        </a>
        .
      </p>
      {leftFoot}
    </form>
  );

  const whatNextRows: TimelineRow[] = draft.slot
    ? [
        { lead: 'A confirmation email, straight away', line: figures ? 'With your project page link, a calendar invite and your estimate.' : 'With your project page link and a calendar invite.' },
        { lead: 'A reminder the day before', line: 'By email, 24 hours before your survey.' },
        { lead: 'Your survey', line: `${who || 'Your surveyor'} checks the roof, the fuse board and the meter, and answers your questions.` },
      ]
    : [
        { lead: `${who || 'We'} call${who ? 's' : ''} you to confirm a time`, line: 'On the mobile you give here.' },
        { lead: "A confirmation email once it's locked in", line: 'With your project page link and a calendar invite.' },
        { lead: 'A reminder the day before', line: 'By email, 24 hours before your survey.' },
      ];

  const detailsRight = (
    <div className="si-screen-in">
      <div className="si-only-desk">
        <h2 className="si-lane-title">Your survey</h2>
        <div className="si-when">
          <CalendarCheck size={20} aria-hidden="true" />
          <div>
            <p className="si-when__date">{draft.slot ? dayLong(dublinDate(draft.slot.startsAt)) : draft.requestedDay ? dayLong(draft.requestedDay.date) : ''}</p>
            <p className="si-when__line">
              {draft.slot
                ? `Arrive between ${windowLabel(draft.slot.startsAt, draft.slot.endsAt)} · about ${visitMinutes} minutes`
                : draft.requestedDay
                  ? `In the ${draft.requestedDay.part}, to confirm by phone`
                  : ''}
            </p>
            {who ? <p className="si-when__who">With {who}</p> : null}
          </div>
          <button type="button" className="si-btn--quiet" onClick={() => window.history.back()}>
            Change
          </button>
        </div>
        {figures ? (
          <>
            <div className="si-strip si-strip--compact" role="list">
              <div className="si-strip__cell" role="listitem">
                <span className="si-strip__label">{isBiz ? 'System, about' : 'System'}</span>
                <span className="si-strip__value" {...prov('estimate')}>{kwp(figures.kwp)}</span>
              </div>
              <div className="si-strip__cell" role="listitem">
                <span className="si-strip__label">{isBiz ? 'NDMG grant, about' : 'After your grant'}</span>
                <span className="si-strip__value" {...prov('estimate')}>{isBiz ? eur(figures.grantEur) : figures.netCostEur != null ? eur(figures.netCostEur) : ''}</span>
              </div>
              <div className="si-strip__cell" role="listitem">
                <span className="si-strip__label">{isBiz ? 'Saving a year, about' : 'Pays back in about'}</span>
                <span className="si-strip__value" {...prov('estimate')}>{isBiz ? eur(figures.annualSavingEur) : figures.paybackYears != null ? years(figures.paybackYears) : ''}</span>
              </div>
            </div>
            {!isBiz ? (
              <p className="si-long">
                About <b {...prov('estimate')}>{eur(figures.annualSavingEur)}</b> a year, including export.
              </p>
            ) : null}
          </>
        ) : (
          <div className="si-mt-16">
            <NoteRow icon={<Info size={16} aria-hidden="true" />}>Your estimate comes later, from your bill or at the survey.</NoteRow>
          </div>
        )}
        <h3 className="si-lane-title si-mt-32">What happens next</h3>
      </div>
      <h2 className="si-lane-title si-only-phone">What happens next</h2>
      <Timeline rows={whatNextRows} />
      {rightFoot}
    </div>
  );

  /* ── Confirmation ──────────────────────────────────────────────── */

  const res = draft.result;
  const doneKind: 'booked' | 'requested' | 'saved' | 'duplicate' = !res
    ? 'booked'
    : res.fallback || res.path === 'outbox'
      ? 'saved'
      : res.booking.outcome === 'requested'
        ? 'requested'
        : res.booking.outcome === 'already_booked'
          ? 'duplicate'
          : 'booked';
  const fname = firstName(det.name);
  const rs = draft.resultSlot;
  const rsDate = rs ? dublinDate(rs.startsAt) : null;
  const doneHeader = doneKind === 'booked' ? 'Booked' : doneKind === 'requested' ? 'Request sent' : doneKind === 'saved' ? 'Saved, not booked yet' : 'Thanks';

  const icsHref = useMemo(() => {
    if (!rs) return null;
    const blob = buildIcs(rs, placeLine(), who, visitMinutes);
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(blob)}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rs?.startsAt, who, visitMinutes, draft.details, lookup]);

  const portalForm = res?.handoff ? (
    <form method="post" action={res.handoff.portalUrl} onSubmit={() => track('intake_portal_open', {})}>
      <input type="hidden" name="code" value={res.handoff.code} />
      <button type="submit" className="si-btn si-btn--primary" data-primary="true">
        <span>Open your project page</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  ) : null;

  const calendarButton = rs ? (
    <div className="si-cal">
      <button type="button" className="si-btn si-btn--secondary" aria-expanded={calOpen} aria-controls="si-cal-menu" onClick={() => setCalOpen((o) => !o)}>
        <CalendarPlus size={18} aria-hidden="true" /> Add to calendar
      </button>
      {calOpen ? (
        <div className="si-cal__menu" id="si-cal-menu">
          <a href={googleCalendarUrl(rs, who, visitMinutes)} target="_blank" rel="noopener noreferrer" onClick={() => track('intake_calendar_add', { kind: 'google' })}>
            Google Calendar
          </a>
          {icsHref ? (
            <a href={icsHref} download="solar-ireland-site-survey.ics" onClick={() => track('intake_calendar_add', { kind: 'ics' })}>
              Apple, Outlook and others (.ics)
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  ) : null;

  const doneLeft = (
    <div className="si-screen-in">
      {doneKind === 'booked' ? (
        <span className="si-done-mark" aria-hidden="true">
          <Check size={24} />
        </span>
      ) : (
        <span className="si-done-mark si-done-mark--grey" aria-hidden="true">
          {doneKind === 'requested' ? <CalendarClock size={24} /> : doneKind === 'saved' ? <Clock size={24} /> : <CalendarCheck size={24} />}
        </span>
      )}
      <h1 className="si-title si-mt-24" ref={h1Ref} tabIndex={-1}>
        {doneKind === 'booked'
          ? `You're booked, ${fname}.${isBiz && det.businessName.trim() ? ` ${det.businessName.trim()} is on the calendar.` : ''}`
          : doneKind === 'requested'
            ? `Thanks, ${fname}. Your request is in.`
            : doneKind === 'saved'
              ? `We have your details, ${fname}.`
              : 'Thanks. It looks like you already have a survey with us.'}
      </h1>
      <p className="si-facts">
        {doneKind === 'booked' && rs && rsDate
          ? `${dayLong(rsDate)}. ${who || 'Your surveyor'} will arrive between ${windowLabel(rs.startsAt, rs.endsAt)} at ${placeLine()}.`
          : doneKind === 'requested' && draft.requestedDay
            ? `You asked for ${dayLong(draft.requestedDay.date)}, in the ${draft.requestedDay.part}. ${who || 'We'} will call you on ${det.mobile.trim()} to confirm a time.`
            : doneKind === 'saved'
              ? `Our booking system didn't confirm ${draft.slot ? `${weekdayLong(dublinDate(draft.slot.startsAt))} at ${draft.slot.label}` : 'your request'} just now, so it isn't booked yet. ${who || 'We'} will call you on ${det.mobile.trim()} to confirm it, and you'll get an email once it's locked in.`
              : "We've emailed you a link to your project page, where you can see or change it."}
      </p>
      {doneKind === 'booked' || doneKind === 'requested' ? (
        portalForm ? (
          <div className={`si-done-actions${calendarButton ? ' si-done-actions--two' : ''}`}>
            {portalForm}
            {calendarButton}
          </div>
        ) : (
          <>
            <div className="si-mt-24">
              <NoteRow icon={<Info size={16} aria-hidden="true" />}>Your project page link is in your confirmation email.</NoteRow>
            </div>
            {calendarButton ? <div className="si-done-actions">{calendarButton}</div> : null}
          </>
        )
      ) : doneKind === 'saved' ? (
        <div className="si-done-actions">
          <a className="si-btn si-btn--secondary" href={WA(`Hi Solar Ireland, I just tried to book a site survey${draft.slot ? ` for ${dayShort(dublinDate(draft.slot.startsAt))} at ${draft.slot.label}` : ''}.`)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} aria-hidden="true" /> WhatsApp us
          </a>
        </div>
      ) : null}
      {leftFoot}
    </div>
  );

  const doneRows: TimelineRow[] = (() => {
    const name = who || 'We';
    if (doneKind === 'booked' && rs && rsDate) {
      const rows: TimelineRow[] = [
        { lead: 'Now', line: `Your confirmation is on its way to ${det.email.trim()}, with ${figures ? 'your estimate and ' : ''}a calendar invite.`, state: 'done' },
      ];
      if (config?.survey.welcomeCallName) rows.push({ lead: 'Today', line: `${config.survey.welcomeCallName} from Solar Ireland will ring you to say hello and confirm the details.` });
      if (!figures) rows.push({ lead: 'Want your estimate before the survey?', line: 'Add a photo of your bill in your project page.' });
      rows.push({ lead: dayLong(addDays(rsDate, -1)), line: 'A reminder by email, the day before.' });
      rows.push({ lead: `${dayLong(rsDate)}, ${windowLabel(rs.startsAt, rs.endsAt)}`, line: `${name === 'We' ? 'Your surveyor' : name} checks the roof, the fuse board and the meter, and answers your questions. Have someone ${isBiz ? 'on site' : 'home'} who can show the way in.` });
      rows.push({ lead: 'After the survey', line: isBiz ? 'Your proposal, with the real price, follows in your project page.' : 'Your proposal follows in your project page.' });
      return rows;
    }
    if (doneKind === 'requested') {
      return [
        { lead: 'Now', line: `Your request is saved, and a note is on its way to ${det.email.trim()}.`, state: 'done' },
        { lead: 'Soon', line: `${name} call${name === 'We' ? '' : 's'} you on ${det.mobile.trim()} to confirm a time.` },
        { lead: "Once it's locked in", line: 'Your confirmation email, with your project page link and a calendar invite.' },
        { lead: 'The day before', line: 'A reminder by email.' },
      ];
    }
    if (doneKind === 'saved') {
      return [
        { lead: 'Now', line: 'Your details are saved on our website.', state: 'done' },
        { lead: 'Soon', line: `${name} call${name === 'We' ? '' : 's'} you on ${det.mobile.trim()} to confirm a time.` },
        { lead: "Once it's locked in", line: 'Your confirmation email, with your project page link and a calendar invite.' },
      ];
    }
    return [
      { lead: 'Check your inbox', line: 'The email has a button that opens your project page.', state: 'done' },
      { lead: 'In your project page', line: 'See your survey time, or change it.' },
    ];
  })();

  const doneRight = (
    <div className="si-screen-in">
      <h2 className="si-lane-title">What happens next</h2>
      <Timeline rows={doneRows} />
      {rightFoot}
    </div>
  );

  /* ── Assemble ──────────────────────────────────────────────────── */

  const showDeviceBooked = !!deviceBooked && step !== 'done' && (step === 'segment' || step === 'bill' || step === 'time');
  const progressState: ('done' | 'current' | 'future')[] =
    step === 'segment'
      ? ['future', 'future', 'future']
      : step === 'bill'
        ? ['current', 'future', 'future']
        : step === 'time'
          ? ['done', 'current', 'future']
          : step === 'details'
            ? ['done', 'done', 'current']
            : ['done', 'done', 'done'];
  const headerName = step === 'done' ? doneHeader : showDeviceBooked ? 'Your survey' : STEP_NAME[step];
  const headerCount = step === 'done' || showDeviceBooked ? null : STEP_COUNT[step] ?? null;
  const showPhoneBack = depth > 1 && step !== 'done' && !showDeviceBooked;

  let left: ReactNode;
  let right: ReactNode;
  if (showDeviceBooked) {
    left = deviceBookedLeft;
    right = (
      <div className="si-screen-in">
        {howItWorks(true)}
        {rightFoot}
      </div>
    );
  } else if (step === 'segment') {
    left = segmentLeft;
    right = (
      <div className="si-screen-in">
        {howItWorks(false)}
        {rightFoot}
      </div>
    );
  } else if (step === 'bill') {
    left = billLeft;
    right = (
      <div className="si-screen-in">
        {howItWorks(billNow != null)}
        {rightFoot}
      </div>
    );
  } else if (step === 'time') {
    left = timeLeft;
    right = timeRight;
  } else if (step === 'details') {
    left = detailsLeft;
    right = detailsRight;
  } else {
    left = doneLeft;
    right = doneRight;
  }

  return (
    <div
      ref={rootRef}
      className={`si-intake ${variant === 'layer' ? 'si-layer' : 'si-page'}`}
      data-entering={variant === 'layer' ? 'true' : undefined}
      data-step={showDeviceBooked ? 'device-booked' : step}
      data-segment={seg ?? 'unknown'}
      data-outcome={step === 'done' ? doneKind : undefined}
      role={variant === 'layer' ? 'dialog' : undefined}
      aria-modal={variant === 'layer' ? 'true' : undefined}
      aria-label={variant === 'layer' ? 'Get your solar estimate and book a survey' : undefined}
      lang="en-IE"
    >
      <header className="si-header">
        <div className="si-header__bar">
          {showPhoneBack ? (
            <button type="button" className="si-icon-btn" onClick={back} aria-label="Back">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
          ) : (
            <a className="si-mark" href="/" aria-label="Solar Ireland home">
              <img src="/logo-sm.webp" alt="" width={28} height={32} />
            </a>
          )}
          <div className="si-header__centre" aria-hidden="true">
            <span className="si-header__step">{headerName}</span>
            {headerCount ? <span className="si-header__count">{headerCount}</span> : null}
          </div>
          <div className="si-header__end">
            <button type="button" className="si-icon-btn" onClick={close} aria-label="Close">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="si-header__desk">
          <div className="si-header__half si-header__half--left">
            <div className="si-header__slot">
              <a className="si-mark" href="/">
                <img src="/logo-sm.webp" alt="" width={32} height={36} />
                <span className="si-mark__name">Solar Ireland</span>
              </a>
            </div>
          </div>
          <div className="si-header__half si-header__half--right">
            <div className="si-header__slot">
              <button type="button" className="si-header-link" onClick={close}>
                Back to the site <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <ol className="si-progress" aria-label="Progress">
          {['Your bill', 'Your time', 'Your details'].map((l, i) => (
            <li key={l} data-state={progressState[i]} aria-current={progressState[i] === 'current' ? 'step' : undefined}>
              <span className="si-progress__bar" aria-hidden="true" />
              <span className="si-progress__label">
                {l}
                <span className="si-sr">{progressState[i] === 'done' ? ', done' : progressState[i] === 'current' ? ', current step' : ''}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="si-sr">{headerCount ? `${headerName}, step ${headerCount}` : headerName}</p>
      </header>

      {cookiePending ? (
        <div className="si-topline" role="region" aria-label="Cookies">
          <span>Cookies:</span>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('sig:cookie-action', { detail: 'reject' }))}>
            Reject all
          </button>
          <span className="si-topline__sep" aria-hidden="true">
            ·
          </span>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('sig:cookie-action', { detail: 'accept' }))}>
            Accept
          </button>
          <span className="si-topline__sep" aria-hidden="true">
            ·
          </span>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('cookie-consent-open-settings'))}>
            Manage
          </button>
        </div>
      ) : null}

      {!online || backOnline ? (
        <div className="si-banner-strip">
          <Banner tone={backOnline ? 'ok' : undefined} icon={backOnline ? <Check size={16} aria-hidden="true" /> : <WifiOff size={16} aria-hidden="true" />} role="status">
            {backOnline ? (
              <b>Back online.</b>
            ) : (
              <>
                <b>You're offline.</b> Your answers are safe on this page. We'll carry on when you're back.
              </>
            )}
          </Banner>
        </div>
      ) : null}

      {step === 'details' && whenText ? (
        <div className="si-summary-band">
          <Calendar size={16} aria-hidden="true" />
          <span className="si-summary-band__text">{whenText}</span>
          <button type="button" className="si-btn--quiet" onClick={() => window.history.back()}>
            Change
          </button>
        </div>
      ) : null}

      <main className="si-main">
        <section className="si-lane si-lane--left" aria-label={step === 'time' ? 'Your estimate' : undefined}>
          <div className="si-col">{left}</div>
        </section>
        <section className="si-lane si-lane--right" aria-label={step === 'time' ? 'Survey times' : 'Your survey'}>
          <div className="si-col">{right}</div>
        </section>
      </main>

      <div className="si-sr" aria-live="polite" role="status">
        {announce}
      </div>
    </div>
  );
}
