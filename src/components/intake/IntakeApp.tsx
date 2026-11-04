'use client';

/**
 * INTAKE OS: the one intake behind every door on the site.
 *
 * Three screens (Your bill, optional; Your time; Your details) plus the
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  House,
  Info,
  MapPin,
  MessageCircle,
  WifiOff,
  X,
} from 'lucide-react';
import type { IntakeConfig, Quote, Segment, Slot, SlotDay, SubmitRequest, SubmitResponse } from '@/lib/intake/contract';
import {
  addDays,
  betweenLabel,
  cents,
  dayLong,
  dayOfMonth,
  dayShort,
  dublinDate,
  eur,
  firstName,
  isEmail,
  isNorthernIreland,
  isPhone,
  kwp,
  monthShort,
  NI_COUNTIES,
  num,
  ROI_COUNTIES,
  timeLabel,
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

/**
 * The reminder goes 24 hours before the survey. A survey booked for less than
 * a day away (the notice is 18 hours) gets no reminder, so none is promised.
 */
function reminderDue(startsAt: string): boolean {
  return new Date(startsAt).getTime() - Date.now() > 26 * 3600000;
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
    `DESCRIPTION:${who ? `${who} arrives` : 'We arrive'} ${betweenLabel(slot.startsAt, slot.endsAt)}. The survey takes about ${visitMinutes} minutes.`,
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
    details: `${who ? `${who} arrives` : 'We arrive'} ${betweenLabel(slot.startsAt, slot.endsAt)}. The survey takes about ${visitMinutes} minutes.`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/* ================================================================== */

/** The 15-minute phone call is step one of the survey (APPLE-DECISIONS 2). Never merged with the visit length. */
const CALL_MINUTES = 15;

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
  /** Phones and portrait tablets: Screen 2 is two views, the estimate then the times (APPLE-DECISIONS). */
  const [timeView, setTimeView] = useState<'estimate' | 'times'>('estimate');

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [preview, setPreview] = useState<Quote | null>(null);
  const [updatedFlash, setUpdatedFlash] = useState(false);
  const sharpenTick = useRef(0);
  const shownTick = useRef(0);

  const [slots, setSlots] = useState<SlotDay[] | null>(null);
  const [slotsStatus, setSlotsStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [slotsFor, setSlotsFor] = useState<Segment | null>(null);
  const [gone, setGone] = useState<string[]>([]);
  const [pickDay, setPickDay] = useState<string | null>(null);
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const [timesNote, setTimesNote] = useState<Slot | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqDate, setReqDate] = useState<string | null>(null);
  const [reqPart, setReqPart] = useState<'morning' | 'afternoon'>('morning');
  const [reqError, setReqError] = useState<string | null>(null);

  const [billError, setBillError] = useState<string | null>(null);
  const [pendingChip, setPendingChip] = useState<number | null>(null);
  const [kwhOpen, setKwhOpen] = useState(false);
  const [kwhText, setKwhText] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sharpKwh, setSharpKwh] = useState('');
  const [sharpKwhError, setSharpKwhError] = useState<string | null>(null);
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
  const [typing, setTyping] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' });
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [issue, setIssue] = useState<DetailsIssue>(null);
  const [rateLeft, setRateLeft] = useState(0);

  const [online, setOnline] = useState(true);
  const [backOnline, setBackOnline] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [calOpen, setCalOpen] = useState(false);
  const [resumeOffer, setResumeOffer] = useState<DeviceDraft | null>(null);
  const [deviceBooked, setDeviceBooked] = useState<DeviceBooking | null>(null);
  const [depth, setDepth] = useState(1);
  /** Once Screen 1 was on screen the switch was seen, so "Change" is not repeated later. */
  const [billSeen, setBillSeen] = useState(false);

  const cookiePending = useCookieBannerVisible();

  const rootRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const depthRef = useRef(1);
  const draftRef = useRef(draft);
  const stepRef = useRef(step);
  const timesTitleRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);
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
  const place = isBiz ? 'premises' : 'home';
  const surveyLine = `Two steps, both free: a ${CALL_MINUTES}-minute phone call${who ? ` with ${who}` : ''} first, then about ${visitMinutes} minutes at your ${place}.`;

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
    (next: Step, opts: { replace?: boolean; view?: 'estimate' | 'times' } = {}) => {
      const d = opts.replace ? depthRef.current : depthRef.current + 1;
      const view = opts.view ?? (next === 'time' ? 'estimate' : undefined);
      const state = { ...(window.history.state || {}), si: 1, sid: 'intake', d, step: next, view };
      if (opts.replace) window.history.replaceState(state, '', urlFor(next));
      else window.history.pushState(state, '', urlFor(next));
      depthRef.current = d;
      setDepth(d);
      if (view) setTimeView(view);
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
    if (!d.segment) {
      d.segment = 'domestic';
      d.segmentProv = 'assumed';
    }
    if (!d.flowId) d.flowId = freshDraft().flowId;

    let first: Step;
    if (variant === 'page' && fromUrlStep) first = validStep(fromUrlStep, d);
    else if (initial.step) first = validStep(initial.step, d);
    else first = 'bill';
    if (first === 'time' && d.bill == null && d.annualKwh == null) d.skipped = true;
    const firstView: 'estimate' | 'times' = first === 'time' && d.bill == null && d.annualKwh == null ? 'times' : 'estimate';
    firstStepRef.current = first;

    // Same device, half-finished: offer to pick up (ux-spec 2.4).
    const dd = loadDeviceDraft();
    if (dd && d.bill == null && first === 'bill') setResumeOffer(dd);
    // Same device, already booked (ux-spec 5.3).
    const booked = loadDeviceBooking();
    if (booked && first !== 'done') setDeviceBooked(booked);

    setDraft(d);
    draftRef.current = d;
    setStep(first);
    stepRef.current = first;
    setTimeView(firstView);

    // Claim the history entry once. React's dev StrictMode runs this effect
    // twice; a second push would leave a stray entry that back lands on.
    if (!claimedRef.current) {
      const state = { ...(window.history.state || {}), si: 1, sid: 'intake', d: 1, step: first, view: first === 'time' ? firstView : undefined };
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
      const s = window.history.state as { si?: number; d?: number; step?: Step; view?: 'estimate' | 'times' } | null;
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
      if (stepRef.current === 'details' && target !== 'details' && d.holdToken) {
        releaseSlot(d.holdToken, d.segment || 'domestic');
        setDraft((x) => ({ ...x, holdToken: null }));
      }
      setIssue(null);
      setSheetOpen(false);
      if (target === 'time') setTimeView(s.view ?? (d.bill == null && d.annualKwh == null ? 'times' : 'estimate'));
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
      if (calOpen) {
        setCalOpen(false);
        return;
      }
      close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [calOpen, close, closeSheet, sheetOpen, variant]);

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
    const target = step === 'time' && !wide && timeView === 'times' ? timesTitleRef : h1Ref;
    const t = setTimeout(() => target.current?.focus({ preventScroll: true }), 30);
    if (step === 'time') track('intake_times_shown', { segment: seg, view: wide ? 'lanes' : timeView, flow_id: draftRef.current.flowId });
    if (step === 'details') track('intake_details_shown', { segment: seg, flow_id: draftRef.current.flowId });
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, hydrated, deviceBooked, timeView]);

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

  /* Rate limited: the button counts down to the next try. */
  useEffect(() => {
    if (rateLeft <= 0) return;
    const t = setTimeout(() => setRateLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [rateLeft]);

  useEffect(() => {
    if (issue && bannerRef.current) bannerRef.current.focus({ preventScroll: false });
  }, [issue]);

  useEffect(() => {
    if (step === 'bill') setBillSeen(true);
  }, [step]);

  /* ── Actions ───────────────────────────────────────────────────── */

  const chooseSegment = (s: Segment) => {
    const was = draftRef.current.segment;
    if (s === was && draftRef.current.segmentProv === 'you_told_us') return;
    update({ segment: s, segmentProv: 'you_told_us' });
    track('intake_segment_chosen', { value: s, changed: !!was && was !== s, flow_id: draft.flowId });
    if (s !== was) setSlotsFor(null);
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
    go('time', { view: 'estimate' });
  };

  const onChip = (amount: number) => {
    setPendingChip(amount);
    commitBill(amount, 'chip', 'month');
    // The choice is seen for a beat, then the flow moves on (one tap, ux-spec 11.7).
    setTimeout(() => {
      setPendingChip(null);
      go('time', { view: 'estimate' });
    }, 160);
  };

  const onSkip = () => {
    update({ bill: null, billText: '', skipped: true, billMethod: null, annualKwh: null, billRead: null });
    track('intake_bill_skipped', { segment: seg, flow_id: draft.flowId });
    setBillError(null);
    go('time', { view: 'times' });
  };

  const onResume = () => {
    const r = resumeOffer;
    if (!r) return;
    update({ segment: r.segment, segmentProv: 'you_told_us', bill: r.bill, billText: String(r.bill), per: r.per, pkg: r.pkg ?? draftRef.current.pkg, billMethod: 'typed', skipped: false });
    setResumeOffer(null);
    track('intake_resume', { from: 'device' });
    go('time', { view: 'estimate' });
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
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setPhoto({ status: 'reading', preview, where });
    track('intake_photo', { result: 'started' });
    const started = Date.now();
    const r = await readBillPhoto(file);
    if (preview) URL.revokeObjectURL(preview);
    if (!r.ok) {
      setPhoto({ status: r.reason === 'unreadable' ? 'unreadable' : 'error', preview: null, where });
      track('intake_photo', { result: 'failed', ms: Date.now() - started });
      // The row changes in place; nothing ever sits under the bar (ui-spec 4.5).
      setTimeout(() => photoRowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 40);
      return;
    }
    const read = r.read;
    track('intake_photo', { result: 'read', ms: Date.now() - started, fields_read: Object.values(read).filter((v) => v != null).length });
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
    if (where === 'bill' || stepRef.current !== 'time') go('time', { view: 'estimate' });
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

  /** A time that has gone leaves the band at once (APPLE-DECISIONS 9). */
  const dropSlot = (startsAt: string) => setGone((g) => (g.includes(startsAt) ? g : [...g, startsAt]));

  const pickSlot = async (slot: Slot) => {
    if (pendingSlot) return;
    setPendingSlot(slot.startsAt);
    setTimesNote(null);
    const prev = draftRef.current.holdToken;
    setIssue(null);
    const d = new Date(slot.startsAt);
    track('intake_slot_picked', { days_out: Math.round((d.getTime() - Date.now()) / 86400000), weekday: weekdayIndex(dublinDate(d)), flow_id: draft.flowId });
    // The quiet 10-minute hold (DECISIONS 3). Awaited here, with the pick on
    // screen for at least 160 ms, so a time taken in the last seconds is told
    // on this screen and never on the next.
    const [r] = await Promise.all([holdSlot(slot.startsAt, seg || 'domestic', prev), new Promise((res) => setTimeout(res, 160))]);
    if (r && 'ok' in r && r.ok === false) {
      setPendingSlot(null);
      dropSlot(slot.startsAt);
      setTimesNote(slot);
      setAnnounce(`Sorry, ${weekdayLong(dublinDate(slot.startsAt))} ${slot.label} has just gone. Pick another.`);
      return;
    }
    update({ slot, requestedDay: null, idemKey: null, holdToken: r && 'holdToken' in r ? r.holdToken : null });
    setPendingSlot(null);
    go('details');
  };

  const onRequestDay = (e: FormEvent) => {
    e.preventDefault();
    if (!reqDate) {
      setReqError('Pick a day first.');
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
      setEmailError("That email doesn't look right. Check the part after the @.");
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
  const whoOr = who || 'the surveyor';
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const d = draft.details;
    const eirValid = isValidEircode(d.eircode);
    if (!d.manual) {
      if (!d.eircode.trim()) e.eircode = 'Add your Eircode, or type the address instead.';
      else if (!eirValid) e.eircode = "That Eircode doesn't look complete yet, for example D02 X285.";
    } else if (!eirValid) {
      if (d.address.trim().length < 4) e.address = 'Add the house number and street, then the town.';
      if (!d.county) e.county = 'Choose the county.';
    }
    if (isBiz && d.businessName.trim().length < 2) e.businessName = 'Add the business name so we know who to ask for.';
    if (d.name.trim().length < 2) e.name = `Add your name so ${whoOr} knows who to ask for.`;
    if (!d.mobile.trim()) e.mobile = `Add a mobile number so ${whoOr} can ring you.`;
    else if (!isPhone(d.mobile)) e.mobile = 'That number looks short. Irish mobiles start 08 and have 10 digits.';
    if (!d.email.trim()) e.email = 'Add your email for your confirmation.';
    else if (!isEmail(d.email)) e.email = "That email doesn't look right. Check the part after the @.";
    return e;
  }, [draft.details, isBiz, whoOr]);
  // An error shows after the field is left or on submit, and never while it is being typed in.
  const errOf = (k: string) => (typing === k ? null : showAll || touched[k] ? errors[k] ?? null : null);
  const touch = (k: string) => {
    setTyping((t) => (t === k ? null : t));
    setTouched((t) => (t[k] ? t : { ...t, [k]: true }));
  };
  const typed = (k: string) => setTyping(k);
  const ERROR_ORDER = ['eircode', 'address', 'county', 'businessName', 'name', 'mobile', 'email'];
  const liveErrorCount = ERROR_ORDER.filter((k) => errors[k]).length;

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
    if (busy || !online || rateLeft > 0) return;
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
    let r = await submitIntake(body, key);
    // A failed route is retried once, silently, with the same key, so a blip
    // never makes a second lead and never reaches the homeowner (ux-spec 6).
    if (r.status !== 429 && (r.status !== 200 || !r.data || !(r.data as SubmitResponse).ok)) {
      await new Promise((res) => setTimeout(res, 3000));
      r = await submitIntake(body, key);
    }
    setBusy(false);
    const res = r.data as SubmitResponse | null;
    if (r.status === 429) {
      setIssue({ kind: 'rate' });
      setRateLeft(60);
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
      if (slot) {
        dropSlot(slot.startsAt);
        setIssue({ kind: 'taken', lost: slot, alternatives: res.booking.alternatives ?? [] });
      } else setIssue({ kind: 'failed' });
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
    const next = { ...d, slot: slot ?? d.slot, result: res, resultSlot, idemKey: null, holdToken: null };
    setDraft(next);
    draftRef.current = next;
    saveSession(next);
    const st = { ...(window.history.state || {}), si: 1, sid: 'intake', d: depthRef.current, step: 'done' };
    window.history.replaceState(st, '', urlFor('done', next));
    setStep('done');
    if (booked && resultSlot) setAnnounce(`Booked. ${dayLong(dublinDate(resultSlot.startsAt))}, arrive ${betweenLabel(resultSlot.startsAt, resultSlot.endsAt)}.`);
  };

  const onDetailsSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowAll(true);
    setTyping(null);
    const first = ERROR_ORDER.find((k) => errors[k]);
    if (first) {
      setErrorCount(liveErrorCount);
      const el = document.getElementById(`si-${first}`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: 'center' });
      setAnnounce(`${liveErrorCount === 1 ? 'One thing' : `${liveErrorCount} things`} to add before we can book you. ${errors[first]}`);
      return;
    }
    setErrorCount(0);
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

  const prov = (p: ProvTag | 'estimate' | 'settings') => ({ 'data-figure': '', 'data-prov': p });
  const waLink = WA("Hi Solar Ireland, I have a question about my survey booking.");

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
    const failed = (photo.status === 'unreadable' || photo.status === 'error') && here;
    return (
      <div ref={photoRowRef}>
        <button type="button" className="si-photo" data-state={failed ? 'unreadable' : 'idle'} onClick={() => fileRef.current?.click()}>
          <span className="si-photo__icon" aria-hidden="true">
            {failed ? <Info size={20} /> : <Camera size={20} />}
          </span>
          <span className="si-photo__text">
            <span className="si-photo__title">
              {failed ? "We couldn't read that one clearly" : where === 'bill' ? 'Or add a photo of your bill' : 'Use a photo of your bill'}
            </span>
            <span className="si-photo__line">
              {failed
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
      {readerOn ? <div className="si-group">{photoRow('bill')}</div> : null}
      {fileInput}
      <div className="si-actions" ref={actionsRef}>
        <div className="si-actions__inner">
          <div className="si-pair">
            <button type="button" className="si-btn si-btn--secondary" onClick={onSkip} aria-label="Skip the bill and just book a survey">
              Skip the bill
            </button>
            <PrimaryButton label="Show my estimate" arrow={false} offline={!online} offlineLabel="Offline" />
          </div>
          <p className="si-actions__note">You can still book your free survey.</p>
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
              { name: 'Price', value: 'Worked out with you at the site survey', tag: 'assumed' as ProvTag, prov: 'assumed' as ProvTag },
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
              <dd className="si-receipt__words">At your site survey</dd>
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
          carries 13.5% VAT. We work out the price with you at the site survey.
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
          You were looking at the <b {...prov('from_page')}>{pkg.name} ({kwp(pkg.kwp)})</b>. For your bill we&apos;d suggest <b {...prov('estimate')}>{kwp(figures.kwp)}</b>. Your
          surveyor will talk through both.
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
      <p className="si-how__line si-mt-16">Panels only. Your surveyor can talk you through a battery.</p>
    </div>
  ) : null;

  const howLink = figures ? (
    <button type="button" className="si-btn--quiet si-how-link" aria-expanded={sheetOpen} aria-controls={wide ? 'si-how' : 'si-sheet'} onClick={openSheet}>
      {wide && sheetOpen ? 'Hide how we worked this out' : 'How we worked this out'}
      <ChevronRight size={16} aria-hidden="true" style={{ transform: wide && sheetOpen ? 'rotate(90deg)' : undefined }} />
    </button>
  ) : null;

  const emailBlock = figures ? (
    <div className="si-exits">
      {draft.emailSentTo ? (
        <p className="si-small" role="status">
          Sent to <b className="si-white">{draft.emailSentTo}</b>. The times are still here when you&apos;re ready.
        </p>
      ) : (
        <div className="si-exits__row">
          <button type="button" className="si-btn--quiet" aria-expanded={emailOpen} aria-controls="si-email-est" onClick={() => setEmailOpen((o) => !o)}>
            Email me this estimate
          </button>
          <span className="si-exits__dot" aria-hidden="true">
            ·
          </span>
          <button type="button" className="si-btn--quiet" onClick={copyShare}>
            {shareCopied ? (
              <>
                <Check size={14} aria-hidden="true" /> Link copied
              </>
            ) : (
              'Share'
            )}
          </button>
        </div>
      )}
      {!draft.emailSentTo ? (
        <Collapse open={emailOpen} id="si-email-est">
          <form onSubmit={sendEstimateEmail} noValidate className="si-email-form">
            <Field id="si-est-email" label="Your email" error={emailError}>
              <TextInput
                id="si-est-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="go"
                value={emailText}
                invalid={!!emailError}
                onChange={(e) => setEmailText(e.target.value)}
              />
            </Field>
            <Field id="si-est-name" label="First name, optional">
              <TextInput id="si-est-name" autoComplete="given-name" value={emailName} onChange={(e) => setEmailName(e.target.value)} />
            </Field>
            <button type="submit" className="si-btn si-btn--secondary si-mt-16">
              {emailBusy ? (
                <>
                  <Spinner /> Sending
                </>
              ) : (
                'Send my estimate'
              )}
            </button>
            <p className="si-help">One email with your figures and your project page. Nothing after it.</p>
          </form>
        </Collapse>
      ) : null}
    </div>
  ) : null;

  const minSys = config?.estimate.minSystem;
  /** Skipped the bill: one fact and one quiet way back, never a second bill form (APPLE-DECISIONS 6). */
  const noBillFact =
    !isBiz && minSys ? (
      <>
        Our smallest home system, <span {...prov('settings')}>{kwp(minSys.kwp)}</span>, <span {...prov('settings')}>{eur(minSys.netCostEur)}</span> after your{' '}
        <span {...prov('settings')}>{eur(minSys.grantEur)}</span> SEAI grant.
      </>
    ) : null;

  const noBillBlock = (
    <div className="si-est">
      <h1 className="si-title" ref={h1Ref} tabIndex={-1}>
        No bill, no problem.
      </h1>
      <p className="si-hint">{isBiz ? 'Your surveyor sizes it with you at the premises.' : 'Your surveyor works it out with you at the survey.'}</p>
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
      <p className="si-hint">You can still book, and your estimate will be in your project page.</p>
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
      {hasBasis && figures ? emailBlock : null}
      {/* Phones and portrait tablets: the estimate view's one primary moves on to the times. */}
      <div className="si-actions si-actions--phone" ref={actionsRef}>
        <div className="si-actions__inner">
          <PrimaryButton
            type="button"
            arrow={false}
            label={
              <span className="si-btn__in">
                Pick a survey time <ChevronRight size={18} aria-hidden="true" />
              </span>
            }
            onClick={() => go('time', { view: 'times' })}
          />
        </div>
      </div>
      {cookieLine}
    </div>
  );

  /* ── Screen 2: the times ──────────────────────────────────────── */

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
      return times.length > 0 && dd >= first && dd <= last && !(config?.survey.closedDates ?? []).includes(dd);
    };
    return (
      <form onSubmit={onRequestDay} noValidate className="si-request">
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
        {reqError ? (
          <p className="si-help" role="status">
            {reqError}
          </p>
        ) : null}
        <div className="si-mt-16">
          <PrimaryButton label={reqDate ? `Ask for ${dayLong(reqDate)}, ${reqPart}` : 'Ask for this day'} offline={!online} arrow={false} />
        </div>
        <p className="si-help">{who || 'We'} will ring you to fit you in. It isn&apos;t booked until then.</p>
      </form>
    );
  };

  const freeDays = (slots ?? [])
    .map((d) => ({ ...d, slots: d.slots.filter((s) => !gone.includes(s.startsAt)) }))
    .filter((d) => d.slots.length > 0)
    .slice(0, 14);
  const noTimes = slotsStatus === 'ready' && freeDays.length === 0;
  const timesDown = slotsStatus === 'error';
  const heldDay = draft.slot ? dublinDate(draft.slot.startsAt) : null;
  const activeDay =
    (pickDay && freeDays.find((d) => d.date === pickDay)?.date) || (heldDay && freeDays.find((d) => d.date === heldDay)?.date) || freeDays[0]?.date || null;
  const dayTimes = freeDays.find((d) => d.date === activeDay)?.slots ?? [];

  const onDayKey = (e: ReactKeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const n = freeDays[Math.max(0, Math.min(freeDays.length - 1, i + delta))];
    if (!n) return;
    setPickDay(n.date);
    const el = e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-day="${n.date}"]`);
    el?.focus();
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  const TimesTitle = wide ? 'h2' : 'h1';
  const phoneChip = !wide ? (
    figures ? (
      <p className="si-estchip">
        About <b {...prov('estimate')}>{eur(figures.annualSavingEur)}</b> a year
        {!isBiz && figures.netCostEur != null ? (
          <>
            <span aria-hidden="true"> · </span>
            <b {...prov('estimate')}>{eur(figures.netCostEur)}</b> after grant
          </>
        ) : null}
      </p>
    ) : !hasBasis ? (
      <div className="si-estchip si-estchip--nobill">
        <p>{noBillFact ?? 'No bill yet. Your surveyor works it out with you.'}</p>
        <button type="button" className="si-btn--quiet" onClick={addMyBill}>
          Add my bill
        </button>
      </div>
    ) : null
  ) : null;

  const timeRight = (
    <div className="si-screen-in si-screen">
      {!wide && !hasBasis ? segTag : null}
      <TimesTitle className="si-lane-title" ref={timesTitleRef} id="si-times-title" tabIndex={-1} style={{ scrollMarginTop: 72 }}>
        Pick a time for your free site survey
      </TimesTitle>
      <p className="si-sub">{surveyLine}</p>
      {phoneChip}
      {timesNote ? (
        <div className="si-mt-16">
          <NoteRow plain icon={<Info size={16} aria-hidden="true" />}>
            <span role="status">
              Sorry, {weekdayLong(dublinDate(timesNote.startsAt))} {timesNote.label} has just gone. Pick another.
            </span>
          </NoteRow>
        </div>
      ) : null}
      {timesDown ? (
        <div className="si-notice">
          <p className="si-notice__title">We can&apos;t load live times this second.</p>
          <p>Ask for a day below and {who || 'we'} will ring you to fit you in.</p>
        </div>
      ) : null}
      {noTimes ? (
        <div className="si-notice">
          <p className="si-notice__title">We&apos;re fully booked for the next two weeks.</p>
          <p>Ask for a day below and {who || 'we'} will ring you to fit you in.</p>
        </div>
      ) : null}
      {!timesDown && !noTimes ? (
        <div className="si-times">
          {slotsStatus !== 'ready' ? (
            <div aria-busy="true">
              <div className="si-days">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <span key={i} className="si-skel si-skel--day" />
                ))}
              </div>
              <div className="si-pills">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="si-skel si-skel--pill" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="si-days" role="radiogroup" aria-label="Days with free times">
                {freeDays.map((day, i) => {
                  const on = day.date === activeDay;
                  return (
                    <button
                      key={day.date}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      tabIndex={on ? 0 : -1}
                      data-day={day.date}
                      className="si-day"
                      aria-label={`${dayLong(day.date)}, ${day.slots.length} ${day.slots.length === 1 ? 'time' : 'times'}`}
                      onClick={() => setPickDay(day.date)}
                      onKeyDown={(e) => onDayKey(e, i)}
                    >
                      <span className="si-day__wd">{weekdayShort(day.date)}</span>
                      <span className="si-day__d">{dayOfMonth(day.date)}</span>
                      <span className="si-day__m">{monthShort(day.date)}</span>
                    </button>
                  );
                })}
              </div>
              <ul className="si-pills" aria-label={activeDay ? `Times on ${dayLong(activeDay)}` : 'Times'}>
                {dayTimes.map((s) => {
                  const picked = pendingSlot === s.startsAt || draft.slot?.startsAt === s.startsAt;
                  return (
                    <li key={s.startsAt}>
                      <button
                        type="button"
                        className="si-pill"
                        data-picked={picked ? 'true' : 'false'}
                        data-just-picked={pendingSlot === s.startsAt ? '' : undefined}
                        aria-label={`${dayLong(dublinDate(s.startsAt))}, arrive ${betweenLabel(s.startsAt, s.endsAt)}`}
                        onClick={() => void pickSlot(s)}
                      >
                        {picked ? <Check size={16} aria-hidden="true" /> : null}
                        {s.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="si-window-note">Each time is the start of a {windowHours}-hour arrival window.</p>
            </>
          )}
        </div>
      ) : null}
      <div className="si-mt-8">
        {timesDown || noTimes ? (
          <p className="si-group-label si-mt-16">Ask for a day</p>
        ) : (
          <button type="button" className="si-btn--quiet" aria-expanded={requestOpen} aria-controls="si-request" onClick={() => setRequestOpen((o) => !o)}>
            None of these work? Ask for another day
          </button>
        )}
        <Collapse open={requestOpen || timesDown || noTimes} id="si-request">
          {requestPanel()}
        </Collapse>
      </div>
      {!wide && hasBasis && figures ? <div className="si-mt-24">{emailBlock}</div> : null}
    </div>
  );

  /* ── Screen 3: your details ───────────────────────────────────── */

  const det = draft.details;
  const eirValid = isValidEircode(det.eircode);
  const takenNow = issue?.kind === 'taken';
  const whenText = takenNow
    ? 'Pick a new time'
    : draft.slot
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
        <div className="si-issue">
          <Banner bannerRef={bannerRef} icon={<Info size={16} aria-hidden="true" />} role="status">
            <b>
              Sorry, {weekdayLong(dublinDate(issue.lost.startsAt))} {issue.lost.label} has just gone.
            </b>{' '}
            {issue.alternatives.length ? 'The closest times are below. One tap books it, with everything you typed kept.' : 'Pick another time and everything you typed stays.'}
          </Banner>
          {issue.alternatives.length ? (
            <ul className="si-pills si-mt-12" aria-label="The closest free times">
              {issue.alternatives.slice(0, 3).map((s) => (
                <li key={s.startsAt}>
                  <button type="button" className="si-pill si-pill--two" aria-label={`Book ${dayLong(dublinDate(s.startsAt))}, arrive ${betweenLabel(s.startsAt, s.endsAt)}`} onClick={() => void pickAlternative(s)}>
                    <span className="si-pill__day">{dayShort(dublinDate(s.startsAt))}</span>
                    <span>{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
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
        <div className="si-issue">
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
        <div className="si-issue">
          <Banner bannerRef={bannerRef} tone="error" icon={<CircleAlert size={16} aria-hidden="true" />} role="alert">
            <b>Too many tries from this connection.</b> Wait a minute, then try again. Everything you typed stays here.
          </Banner>
        </div>
      );
    }
    // Failed after the silent retry: say so plainly, keep everything, offer a second way (ux-spec 6).
    return (
      <div className="si-issue">
        <Banner
          bannerRef={bannerRef}
          tone="error"
          icon={<CircleAlert size={16} aria-hidden="true" />}
          role="alert"
          action={
            <a
              className="si-btn--quiet"
              href={WA(`Hi Solar Ireland, I tried to book a site survey${draft.slot ? ` for ${dayShort(dublinDate(draft.slot.startsAt))} at ${draft.slot.label}` : ''} and it didn't go through.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={14} aria-hidden="true" /> Send it by WhatsApp instead
            </a>
          }
        >
          <b>That didn&apos;t go through, and nothing was booked yet.</b> Your details are still here. Try again, or WhatsApp us.
        </Banner>
      </div>
    );
  })();

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

  const eircodeHint =
    det.manual || lookup.status === 'found' ? null : lookup.status === 'looking' ? (
      'Finding your address'
    ) : (
      <>
        We&apos;ll find the address. Don&apos;t know it? Look it up at{' '}
        <a className="si-inline" href="https://finder.eircode.ie" target="_blank" rel="noopener noreferrer">
          eircode.ie
        </a>
        .
      </>
    );

  const placeFields = (
    <div className="si-form__place">
      <Field id="si-eircode" label="Eircode" hint={eircodeHint} error={det.manual ? null : errOf('eircode')}>
        <TextInput
          id="si-eircode"
          name="postal-code"
          mono
          autoComplete="postal-code"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          maxLength={8}
          value={det.eircode}
          readOnly={busy}
          invalid={!det.manual && !!errOf('eircode')}
          aria-describedby={!det.manual && errOf('eircode') ? 'si-eircode-error' : 'si-eircode-hint'}
          end={lookupEnd}
          onChange={(e) => {
            typed('eircode');
            updateDetails({ eircode: formatEircodeInput(e.target.value) });
          }}
          onBlur={() => touch('eircode')}
        />
      </Field>
      {lookupFound ? (
        <p className="si-found" aria-live="polite">
          <MapPin size={16} aria-hidden="true" />
          <span className="si-found__addr" {...prov('from_your_eircode')}>
            {lookupFound.address}
          </span>
          <button type="button" className="si-btn--quiet" onClick={() => updateDetails({ manual: true })}>
            Not right?
          </button>
        </p>
      ) : null}
      {lookup.status === 'down' || lookup.status === 'missing' ? (
        <div className="si-mt-8">
          <NoteRow plain icon={<Info size={16} aria-hidden="true" />}>
            {lookup.status === 'missing'
              ? "We couldn't find that Eircode. Check it, or add the address below."
              : "We couldn't look that one up just now. Add the address and we'll check it at the survey."}
          </NoteRow>
        </div>
      ) : null}
      {!det.manual && !lookupFound ? (
        <button type="button" className="si-btn--quiet" onClick={() => updateDetails({ manual: true })}>
          No Eircode? Type the address
        </button>
      ) : null}
      <Collapse open={det.manual}>
        <div style={{ paddingTop: 16 }}>
          <Field
            id="si-address"
            label="Address"
            hint="House number and street, then the town."
            error={eirValid ? null : errOf('address')}
            tag={lookup.status === 'down' && det.address ? <span className="si-tag si-tag--fill">From your Eircode</span> : undefined}
          >
            <TextInput
              id="si-address"
              autoComplete="street-address"
              autoCapitalize="words"
              enterKeyHint="next"
              value={det.address}
              readOnly={busy}
              invalid={!eirValid && !!errOf('address')}
              aria-describedby={!eirValid && errOf('address') ? 'si-address-error' : undefined}
              onChange={(e) => {
                typed('address');
                updateDetails({ address: e.target.value });
              }}
              onBlur={() => touch('address')}
            />
          </Field>
          <Field id="si-county" label="County" error={eirValid ? null : errOf('county')}>
            <div className="si-input-wrap">
              <select
                id="si-county"
                className="si-select"
                autoComplete="address-level1"
                value={det.county}
                disabled={busy}
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
                SEAI grants apply in the Republic of Ireland. We&apos;ll talk you through the options for your area.
              </NoteRow>
            </div>
          ) : null}
        </div>
      </Collapse>
    </div>
  );

  const peopleField = (k: 'businessName' | 'name' | 'mobile' | 'email') => {
    const common = {
      readOnly: busy,
      invalid: !!errOf(k),
      onBlur: () => touch(k),
    };
    if (k === 'businessName')
      return (
        <Field id="si-businessName" label="Business name" error={errOf('businessName')}>
          <TextInput
            id="si-businessName"
            name="businessName"
            autoComplete="organization"
            autoCapitalize="words"
            enterKeyHint="next"
            value={det.businessName}
            aria-describedby={errOf('businessName') ? 'si-businessName-error' : undefined}
            onChange={(e) => {
              typed('businessName');
              updateDetails({ businessName: e.target.value });
            }}
            {...common}
          />
        </Field>
      );
    if (k === 'name')
      return (
        <Field id="si-name" label="Your name" error={errOf('name')}>
          <TextInput
            id="si-name"
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            value={det.name}
            aria-describedby={errOf('name') ? 'si-name-error' : undefined}
            onChange={(e) => {
              typed('name');
              updateDetails({ name: e.target.value });
            }}
            {...common}
          />
        </Field>
      );
    if (k === 'mobile')
      return (
        <Field id="si-mobile" label="Mobile" hint={`So ${whoOr} can ring you for the ${CALL_MINUTES}-minute call.`} error={errOf('mobile')}>
          <TextInput
            id="si-mobile"
            name="tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
            value={det.mobile}
            aria-describedby={errOf('mobile') ? 'si-mobile-error' : 'si-mobile-hint'}
            onChange={(e) => {
              typed('mobile');
              updateDetails({ mobile: e.target.value });
            }}
            {...common}
          />
        </Field>
      );
    return (
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
          value={det.email}
          aria-describedby={errOf('email') ? 'si-email-error' : 'si-email-hint'}
          onChange={(e) => {
            typed('email');
            updateDetails({ email: e.target.value });
          }}
          {...common}
        />
      </Field>
    );
  };

  const shownErrors = showAll ? liveErrorCount : 0;
  const primaryLabel =
    rateLeft > 0 ? (
      `Try again in ${rateLeft}s`
    ) : issue?.kind === 'failed' ? (
      'Try again'
    ) : (
      <>
        <span className="si-only-desk">{bookLabelDesk}</span>
        <span className="si-only-phone">{draft.slot ? 'Book my survey' : 'Send my request'}</span>
      </>
    );

  const detailsLeft = (
    <form className="si-screen-in si-screen" onSubmit={onDetailsSubmit} noValidate>
      {issueBanner}
      <h1 className="si-title" ref={h1Ref} tabIndex={-1}>
        {isBiz ? "Where's the business, and who do we ask for?" : "Where's the survey, and who do we ask for?"}
      </h1>
      {shownErrors > 0 && errorCount > 0 ? (
        <p className="si-err-summary" ref={summaryRef} role="status">
          <CircleAlert size={16} aria-hidden="true" />
          {shownErrors === 1 ? 'One thing to add before we can book you.' : `${shownErrors} things to add before we can book you.`}
        </p>
      ) : null}
      <div className="si-form">
        {placeFields}
        <div className="si-form__people">
          {isBiz ? peopleField('businessName') : null}
          {peopleField('name')}
          <div className="si-form__pair">
            {peopleField('mobile')}
            {peopleField('email')}
          </div>
        </div>
      </div>
      <div className="si-actions" ref={actionsRef}>
        <div className="si-actions__inner">
          <PrimaryButton
            label={primaryLabel}
            busy={busy}
            busyLabel={
              <>
                <span className="si-only-desk">{busyLabel}</span>
                <span className="si-only-phone">{draft.slot ? 'Booking your survey' : 'Sending your request'}</span>
              </>
            }
            offline={!online || rateLeft > 0}
            offlineLabel={rateLeft > 0 ? `Try again in ${rateLeft}s` : undefined}
          />
          {slow ? (
            <p className="si-still" role="status">
              Still working. Please keep this page open.
            </p>
          ) : null}
        </div>
      </div>
      <p className="si-legal">
        We use these details to arrange your survey.{' '}
        <a href="/privacy" target="_blank" rel="noopener">
          Privacy notice
        </a>
        .
      </p>
    </form>
  );

  const surveySteps: TimelineRow[] = draft.slot
    ? [
        { lead: `Step 1, a ${CALL_MINUTES}-minute call`, line: `${who || 'We'} ring${who ? 's' : ''} you before your visit to talk it through and answer your questions.` },
        {
          lead: `Step 2, ${dayLong(dublinDate(draft.slot.startsAt))}`,
          line: `About ${visitMinutes} minutes at your ${place}. ${who || 'Your surveyor'} checks the roof, the fuse board and the meter.`,
        },
        { lead: 'After the survey', line: 'Your proposal follows in your project page.' },
      ]
    : [
        { lead: `${who || 'We'} ring${who ? 's' : ''} you to confirm a time`, line: 'On the mobile you give here.' },
        { lead: `Then a ${CALL_MINUTES}-minute call and the visit`, line: `About ${visitMinutes} minutes at your ${place}.` },
      ];

  const detailsRight = (
    <div className="si-screen-in si-screen">
      <h2 className="si-lane-title">Your survey</h2>
      <dl className="si-receipt si-mt-24">
        <div className="si-receipt__row">
          <dt>{draft.slot ? 'Day' : 'You asked for'}</dt>
          <dd>{draft.slot ? dayLong(dublinDate(draft.slot.startsAt)) : draft.requestedDay ? dayLong(draft.requestedDay.date) : ''}</dd>
        </div>
        <div className="si-receipt__row">
          <dt>{draft.slot ? 'Arrival' : 'Part of the day'}</dt>
          <dd>{takenNow ? 'Pick a new time' : draft.slot ? windowLabel(draft.slot.startsAt, draft.slot.endsAt) : draft.requestedDay ? `${draft.requestedDay.part}, to confirm` : ''}</dd>
        </div>
        <div className="si-receipt__row">
          <dt>Where</dt>
          <dd>At your {place}</dd>
        </div>
        {who ? (
          <div className="si-receipt__row">
            <dt>With</dt>
            <dd>{who}</dd>
          </div>
        ) : null}
      </dl>
      <button type="button" className="si-btn--quiet si-mt-8" disabled={busy} onClick={() => window.history.back()}>
        Change the time
      </button>
      <p className="si-sub si-mt-24">{surveyLine}</p>
      <Timeline rows={surveySteps} />
      {figures ? (
        <p className="si-small si-mt-24">
          Your estimate, about <b className="si-white" {...prov('estimate')}>{eur(figures.annualSavingEur)}</b> a year, comes with your confirmation.
        </p>
      ) : null}
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

  const calendarButton =
    rs && doneKind === 'booked' ? (
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

  const doneMark =
    doneKind === 'booked' ? (
      <span className="si-done-mark" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    ) : (
      <span className="si-done-mark si-done-mark--grey" aria-hidden="true">
        {doneKind === 'requested' ? <CalendarClock size={26} /> : doneKind === 'saved' ? <Clock size={26} /> : <CalendarCheck size={26} />}
      </span>
    );

  const doneLeft = (
    <div className="si-screen-in si-screen">
      {doneMark}
      <h1 className="si-title si-mt-24" ref={h1Ref} tabIndex={-1}>
        {doneKind === 'booked'
          ? `You're booked, ${fname}.${isBiz && det.businessName.trim() ? ` ${det.businessName.trim()} is on the calendar.` : ''}`
          : doneKind === 'requested'
            ? `Thanks, ${fname}. Your request is in.`
            : doneKind === 'saved'
              ? `We have your details, ${fname}.`
              : 'It looks like you already have a survey with us.'}
      </h1>
      <p className="si-facts">
        {doneKind === 'booked' && rs && rsDate
          ? `${dayLong(rsDate)}. ${who || 'Your surveyor'} will arrive ${betweenLabel(rs.startsAt, rs.endsAt)} at ${placeLine()}.`
          : doneKind === 'requested' && draft.requestedDay
            ? `You asked for ${dayLong(draft.requestedDay.date)}, in the ${draft.requestedDay.part}. It isn't booked yet. ${who || 'We'} will ring you on ${det.mobile.trim()} to fix a time.`
            : doneKind === 'requested' && draft.slot
              ? `You asked for ${dayLong(dublinDate(draft.slot.startsAt))} at ${draft.slot.label}. It isn't booked yet. ${who || 'We'} will ring you on ${det.mobile.trim()} to fix a time.`
              : doneKind === 'saved'
                ? `Our booking system didn't confirm ${draft.slot ? `${weekdayLong(dublinDate(draft.slot.startsAt))} at ${draft.slot.label}` : 'your request'} just now, so it isn't booked yet. ${who || 'We'} will ring you on ${det.mobile.trim()} to confirm it, and you'll get an email once it's locked in.`
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
            <p className="si-small si-mt-24">Your project page link is in your email.</p>
            {calendarButton ? <div className="si-done-actions">{calendarButton}</div> : null}
          </>
        )
      ) : doneKind === 'saved' ? (
        <div className="si-done-actions">
          <a
            className="si-btn si-btn--secondary"
            href={WA(`Hi Solar Ireland, I just tried to book a site survey${draft.slot ? ` for ${dayShort(dublinDate(draft.slot.startsAt))} at ${draft.slot.label}` : ''}.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} aria-hidden="true" /> WhatsApp us
          </a>
        </div>
      ) : null}
      <footer className="si-lane-foot si-lane-foot--left">{trustLine}</footer>
    </div>
  );

  const doneRows: TimelineRow[] = (() => {
    const name = who || 'We';
    const rings = `${name} ring${name === 'We' ? '' : 's'}`;
    if (doneKind === 'booked' && rs && rsDate) {
      const rows: TimelineRow[] = [
        { lead: 'Now', line: `Your confirmation is on its way to ${det.email.trim()}, with ${figures ? 'your estimate and ' : ''}a calendar invite.`, state: 'done' },
      ];
      if (!figures) rows.push({ lead: 'Want your estimate before the survey?', line: 'Add a photo of your bill in your project page.' });
      rows.push({ lead: `Step 1, a ${CALL_MINUTES}-minute call`, line: `${rings} you on ${det.mobile.trim()} before your visit to talk it through and answer your questions.` });
      if (reminderDue(rs.startsAt)) rows.push({ lead: dayLong(addDays(rsDate, -1)), line: 'A reminder by email, the day before.' });
      rows.push({
        lead: `Step 2, ${dayLong(rsDate)}, ${windowLabel(rs.startsAt, rs.endsAt)}`,
        line: `About ${visitMinutes} minutes at your ${place}. ${name === 'We' ? 'Your surveyor' : name} checks the roof, the fuse board and the meter. Have someone ${isBiz ? 'on site' : 'home'} who can show the way in.`,
      });
      rows.push({ lead: 'After the survey', line: isBiz ? 'Your proposal, with the real price, follows in your project page.' : 'Your proposal follows in your project page.' });
      return rows;
    }
    if (doneKind === 'requested') {
      return [
        { lead: 'Now', line: `Your request is saved, and a note is on its way to ${det.email.trim()}.`, state: 'done' },
        { lead: 'Soon', line: `${rings} you on ${det.mobile.trim()} to fix a time.` },
        { lead: "Once it's locked in", line: `Your confirmation email, then a ${CALL_MINUTES}-minute call and about ${visitMinutes} minutes at your ${place}.` },
      ];
    }
    if (doneKind === 'saved') {
      return [
        { lead: 'Now', line: 'Your details are with us. Nothing is booked yet.' },
        { lead: 'Soon', line: `${rings} you on ${det.mobile.trim()} to confirm a time.` },
        { lead: "Once it's locked in", line: 'Your confirmation email, with your project page link and a calendar invite.' },
      ];
    }
    return [
      { lead: 'Check your inbox', line: 'The email has a button that opens your project page.' },
      { lead: 'In your project page', line: 'See your survey time, or change it.' },
    ];
  })();

  const doneRight = (
    <div className="si-screen-in si-screen">
      <h2 className="si-lane-title">What happens next</h2>
      <Timeline rows={doneRows} />
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
            From the <span {...prov('you_told_us')}>{eur(billNow)}</span> {draft.per === '2months' ? 'every 2 months' : 'a month'} you typed. Show my estimate to pick a survey time.
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

  const showDeviceBooked = !!deviceBooked && step !== 'done' && (step === 'bill' || step === 'time');
  // Green only for booked (APPLE-DECISIONS 9): a request or "saved, not booked yet" keeps the last step amber.
  const progressState: ('done' | 'current' | 'future')[] =
    step === 'bill'
      ? ['current', 'future', 'future']
      : step === 'time'
        ? ['done', 'current', 'future']
        : step === 'details'
          ? ['done', 'done', 'current']
          : doneKind === 'booked'
            ? ['done', 'done', 'done']
            : ['done', 'done', 'current'];
  const headerName = step === 'done' ? doneHeader : showDeviceBooked ? 'Your survey' : step === 'time' && !wide && timeView === 'times' ? 'Pick a time' : STEP_NAME[step];
  const headerCount = step === 'done' || showDeviceBooked ? null : STEP_COUNT[step] ?? null;
  const showPhoneBack = depth > 1 && step !== 'done' && !showDeviceBooked;

  let left: ReactNode;
  let right: ReactNode;
  if (showDeviceBooked && deviceBooked) {
    const dbDate = dublinDate(deviceBooked.startsAt);
    left = (
      <div className="si-screen-in si-screen">
        <span className="si-done-mark si-done-mark--grey" aria-hidden="true">
          <CalendarCheck size={26} />
        </span>
        <h1 className="si-title si-mt-24" ref={h1Ref} tabIndex={-1}>
          You already have a survey booked.
        </h1>
        <p className="si-facts">
          {dayLong(dbDate)}, arrive {windowLabel(deviceBooked.startsAt, deviceBooked.endsAt)}.
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
        <p className="si-small si-mt-16">For a second property or a business.</p>
      </div>
    );
    right = (
      <div className="si-screen-in si-screen">
        <h2 className="si-lane-title">What happens next</h2>
        <Timeline
          rows={[
            { lead: `Step 1, a ${CALL_MINUTES}-minute call`, line: `${who || 'We'} ring${who ? 's' : ''} you before your visit.` },
            ...(reminderDue(deviceBooked.startsAt) ? [{ lead: dayLong(addDays(dbDate, -1)), line: 'A reminder by email, the day before.' }] : []),
            {
              lead: `Step 2, ${dayLong(dbDate)}, ${windowLabel(deviceBooked.startsAt, deviceBooked.endsAt)}`,
              line: `About ${visitMinutes} minutes at your ${place}.`,
            },
            { lead: 'Need to change the time?', line: 'Do it in your project page. The link is in your confirmation email.' },
          ]}
        />
      </div>
    );
  } else if (step === 'bill' || step === 'segment') {
    left = billLeft;
    right = billRight;
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
      data-view={step === 'time' ? timeView : undefined}
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
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
          ) : (
            <a className="si-mark" href="/" aria-label="Solar Ireland home">
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
              <span className="si-mark__name">Solar Ireland</span>
            </a>
            {depth > 1 && step !== 'done' && !showDeviceBooked ? (
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
        {showDeviceBooked ? null : (
          <ol className="si-progress" aria-label="Progress">
            {['Your bill', 'Your time', 'Your details'].map((l, i) => (
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

      {step === 'details' && whenText ? (
        <div className="si-summary-band" data-taken={takenNow ? 'true' : 'false'}>
          <Calendar size={16} aria-hidden="true" />
          <span className="si-summary-band__text">{whenText}</span>
          <button type="button" className="si-btn--quiet" disabled={busy} onClick={() => window.history.back()}>
            Change
          </button>
        </div>
      ) : null}

      <main className="si-main">
        <section className="si-lane si-lane--left" aria-label={step === 'time' ? 'Your estimate' : undefined}>
          <div className="si-col">{left}</div>
        </section>
        <section className="si-lane si-lane--right" aria-label={step === 'time' ? 'Survey times' : step === 'bill' ? 'Your estimate' : 'Your survey'}>
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
