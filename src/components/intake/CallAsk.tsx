'use client';

/**
 * The one ending of both roads (CALL-FUNNEL-PLAN, 4 Nov 2026): name, mobile,
 * email, an optional best time to ring, and "Send my full estimate". The Bill
 * Analyser (Road 1) and the Apple intake (Road 2) both render this, so the
 * ask, its errors, its failures and its confirmation are word for word the
 * same on both.
 *
 * No Eircode field, no address, no survey, no slot. If the bill reader read a
 * valid Eircode, one line says it will be used, with a way to leave it off.
 *
 * Cal's answers (4 Nov): the best time is one tap and never required; the
 * confirmation says "Cal will ring you today. If it's late, first thing
 * tomorrow." Never office hours, never a working day, never "we'll tell you
 * straight".
 */
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { CircleAlert, Mail, MapPin, MessageCircle, Phone, PhoneIncoming, UserPlus } from 'lucide-react';
import type { BestTime, CallBillRead, Segment, SubmitRequest, SubmitResponse } from '@/lib/intake/contract';
import { firstName, isEmail, isPhone, normalisePhone } from '@/lib/intake/format';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';
import { funnel, generateLead, type LeadRoad } from '@/lib/intake/funnel';
import { ndmgDoubledLive, SOLAR_DATA } from '@/lib/solar-data';
import { newKey, submitIntake } from './api';
import { Banner, Field, PrimaryButton, TextInput } from './ui';

export interface CallDetails {
  name: string;
  mobile: string;
  email: string;
  bestTime: BestTime | null;
}

export const EMPTY_CALL: CallDetails = { name: '', mobile: '', email: '', bestTime: null };

export interface CallCarry {
  eircode: string | null;
  mprn: string | null;
  address: string | null;
}

export interface CallContext {
  segment: Segment;
  door: string;
  src: string | null;
  pkg: string | null;
  countyContext: string | null;
  flowId: string;
  monthlyBill: number | null;
  annualKwh: number | null;
  billPeriod: 'month' | 'two_months' | null;
  supplier: string | null;
  quoteToken: string | null;
  billRead: CallBillRead | null;
  carry: CallCarry | null;
  /** The magic link (?lt=) this ask was opened from, so the call threads onto that lead. */
  linkToken?: string | null;
  /** Which road the lead came by, for GA4 generate_lead (never sent to the API). */
  road?: LeadRoad;
}

/* ------------------------------------------------------------------ */
/*  The returning visitor: this device already asked for a call        */
/* ------------------------------------------------------------------ */

const MEMORY_KEY = 'si_call_requested';
const MEMORY_DAYS = 7;

export interface CallMemory {
  v: 1;
  at: number;
  first: string | null;
  bestTime: BestTime | null;
}

/** First name and time only: never the mobile, email or anything from the bill. */
export function rememberCall(d: CallDetails): void {
  try {
    const m: CallMemory = { v: 1, at: Date.now(), first: firstName(d.name) || null, bestTime: d.bestTime };
    localStorage.setItem(MEMORY_KEY, JSON.stringify(m));
  } catch {
    /* private mode: the ask simply shows again next time */
  }
}

export function readCallMemory(now = Date.now()): CallMemory | null {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return null;
    const m = JSON.parse(raw) as CallMemory;
    if (!m || m.v !== 1 || typeof m.at !== 'number' || now - m.at > MEMORY_DAYS * 86400000 || m.at > now + 60000) return null;
    return m;
  } catch {
    return null;
  }
}

export function forgetCall(): void {
  try {
    localStorage.removeItem(MEMORY_KEY);
  } catch {
    /* nothing to forget */
  }
}

const dublinDay = (t: number) => new Intl.DateTimeFormat('en-IE', { timeZone: 'Europe/Dublin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(t);
const dublinWeekday = (t: number) => new Intl.DateTimeFormat('en-IE', { timeZone: 'Europe/Dublin', weekday: 'long' }).format(t);

/** What a returning visitor sees instead of a blank form. */
export function CallRemembered({
  memory,
  who,
  onAnother,
  headingLevel = 'h2',
}: {
  memory: CallMemory;
  who: string | null;
  onAnother: () => void;
  headingLevel?: 'h1' | 'h2' | 'h3';
}) {
  const H = headingLevel;
  const today = dublinDay(memory.at) === dublinDay(Date.now());
  const name = who || 'We';
  const verb = who ? 'is' : 'are';
  return (
    <div className="si-ask si-ask--remembered" data-call-remembered="">
      <span className="si-done-mark" aria-hidden="true">
        <PhoneIncoming size={24} />
      </span>
      <H className="si-ask__title si-mt-24">
        {today ? `${name} ${verb} ringing you today${memory.first ? `, ${memory.first}` : ''}.` : `You asked for a free call on ${dublinWeekday(memory.at)}.`}
      </H>
      <p className="si-ask__sub">
        {today
          ? `Your free 15-minute call is booked in. If it's late, first thing tomorrow.${memory.bestTime ? ` ${BEST_LINE[memory.bestTime]}` : ''}`
          : `If ${who || 'we'} ${who ? "hasn't" : "haven't"} reached you yet, ring us on ${PHONE} and we'll take it from there.`}
      </p>
      <div className="si-ask__go si-ask__go--row">
        <a className="si-btn si-btn--secondary" href={PHONE_HREF}>
          <Phone size={18} aria-hidden="true" /> Ring us on {PHONE}
        </a>
        <button type="button" className="si-btn--quiet" onClick={onAnother}>
          Not you, or need another call?
        </button>
      </div>
    </div>
  );
}

const BEST: { v: BestTime; t: string }[] = [
  { v: 'morning', t: 'Morning' },
  { v: 'afternoon', t: 'Afternoon' },
  { v: 'evening', t: 'Evening' },
  { v: 'any', t: 'Any time' },
];

export const BEST_LINE: Record<BestTime, string> = {
  morning: 'You said mornings suit best.',
  afternoon: 'You said afternoons suit best.',
  evening: 'You said evenings suit best.',
  any: 'You said any time suits.',
};

const PHONE = SOLAR_DATA.provider.phone;
const PHONE_HREF = `tel:${PHONE.replace(/\s+/g, '')}`;
const WA = (t: string) => buildWhatsAppUrl({ source: 'call', customMessage: t });

function track(event: string, properties: Record<string, string | number | boolean | null | undefined>) {
  try {
    trackEvent({ event, properties });
  } catch {
    /* analytics never breaks the ask */
  }
}

type Issue = null | { kind: 'failed' } | { kind: 'rate' };

/**
 * The ask's own words, by whether an estimate will really be emailed. With a
 * priced bill: "Send my full estimate" and the same-day call line. Without
 * one (the bill was skipped, or could not be priced): nothing about an email,
 * Cal works the estimate out with them on the call.
 */
export function askCopy(o: { estimate: boolean; who: string | null }): { cta: string; promise: string; busy: string; before: string } {
  const by = o.who || 'We';
  if (o.estimate) {
    return {
      cta: 'Send my savings',
      promise: 'Then we give you a quick ring today to go through it.',
      busy: 'Sending your savings',
      before: 'before we can send your savings',
    };
  }
  return {
    cta: 'Ring me today',
    promise: `${by} will ring you today and work out your estimate with you.`,
    busy: 'Sending',
    before: `before ${o.who || 'we'} can ring you`,
  };
}

/**
 * The ask's heading and sub, one set of words for every door (Cal, 10 Nov:
 * getting their details and sending the estimate comes first, the call
 * second). `estimate`: a priced quote rides with the request, so the email
 * really goes. `rough`: the figures on screen are the local rough estimate,
 * so nothing is emailed now; the call works out the full one. Neither: no
 * bill at all, and the copy promises only the call.
 */
export function askHeadline(o: { estimate: boolean; rough?: boolean; battery?: boolean; business?: boolean }): { heading: string; sub: string } {
  // Cal, 11 Nov: "dont sell the estimate sell the value within it".
  const grant = o.business
    ? ndmgDoubledLive()
      ? `your grant of up to ${SOLAR_DATA.ndmgDoubled.maxLabel} under the doubled business grant`
      : 'your SEAI business grant'
    : `your grant of up to ${SOLAR_DATA.batteryGrant.withSolarMaxLabel}`;
  if (o.estimate) {
    const what = `Your yearly saving, the right system for your roof, ${grant} and when it pays for itself, worked out from your bill and in your inbox now.`;
    return {
      heading: 'Where should we send your savings?',
      sub: o.battery
        ? `${what} Then a quick call about when your home uses power, so you know whether a battery is worth adding, and a proposal with final numbers. No visit, no obligation.`
        : `${what} Then a quick call to check what a bill can't tell us, and a proposal with final numbers. No visit, no obligation.`,
    };
  }
  if (o.rough) {
    return {
      heading: 'Want your savings worked out in full?',
      sub: `We give you a quick ring today to check what a bill can't tell us, like your roof and when you use power, then send you a proposal with your saving, ${grant} and final numbers. No visit, no obligation.`,
    };
  }
  return {
    heading: 'Where should we ring you?',
    sub: "We give you a quick ring today to work out your savings with you and check what a bill can't tell us, like your roof and when you use power. Then we send you a proposal with final numbers. No visit, no obligation.",
  };
}

/**
 * The form. `bar` renders the primary inside the intake's sticky action bar
 * (Road 2 on phones); otherwise the button sits under the fields.
 */
export function CallAsk({
  idPrefix,
  details,
  onDetails,
  ctx,
  who,
  onSent,
  bar,
  heading,
  headingLevel = 'h2',
  headingRef,
  sub,
  online = true,
  actionsRef,
  confirm = false,
  cta = 'Send my savings',
}: {
  idPrefix: string;
  details: CallDetails;
  onDetails: (d: Partial<CallDetails>) => void;
  ctx: CallContext;
  who: string | null;
  onSent: (res: SubmitResponse, d: CallDetails, sent: { estimate: boolean }) => void;
  bar?: (button: ReactNode, extra: ReactNode) => ReactNode;
  heading: ReactNode;
  headingLevel?: 'h1' | 'h2' | 'h3';
  headingRef?: React.Ref<HTMLHeadingElement>;
  sub?: ReactNode;
  online?: boolean;
  actionsRef?: React.Ref<HTMLDivElement>;
  /** Details already known (a magic link): show them as one "Is this you?" tap, with a way to change them. */
  confirm?: boolean;
  /** The primary's label when an estimate will be emailed (a priced bill rides with the request). */
  cta?: string;
}) {
  const [memory, setMemory] = useState<CallMemory | null>(null);
  const [another, setAnother] = useState(false);
  useEffect(() => {
    setMemory(readCallMemory());
  }, []);
  if (memory && !another) {
    return (
      <CallRemembered
        memory={memory}
        who={who}
        headingLevel={headingLevel}
        onAnother={() => {
          forgetCall();
          setAnother(true);
        }}
      />
    );
  }
  return (
    <CallForm
      {...{ idPrefix, details, onDetails, ctx, who, onSent, bar, heading, headingLevel, headingRef, sub, online, actionsRef, confirm, cta }}
    />
  );
}

function CallForm({
  idPrefix,
  details,
  onDetails,
  ctx,
  who,
  onSent,
  bar,
  heading,
  headingLevel = 'h2',
  headingRef,
  sub,
  online = true,
  actionsRef,
  confirm,
  cta,
}: {
  idPrefix: string;
  details: CallDetails;
  onDetails: (d: Partial<CallDetails>) => void;
  ctx: CallContext;
  who: string | null;
  onSent: (res: SubmitResponse, d: CallDetails, sent: { estimate: boolean }) => void;
  bar?: (button: ReactNode, extra: ReactNode) => ReactNode;
  heading: ReactNode;
  headingLevel?: 'h1' | 'h2' | 'h3';
  headingRef?: React.Ref<HTMLHeadingElement>;
  sub?: ReactNode;
  online?: boolean;
  actionsRef?: React.Ref<HTMLDivElement>;
  confirm: boolean;
  cta: string;
}) {
  const [editing, setEditing] = useState(!confirm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [typing, setTyping] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [issue, setIssue] = useState<Issue>(null);
  const [rateLeft, setRateLeft] = useState(0);
  const [useEircode, setUseEircode] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const keyRef = useRef<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const viewed = useRef(false);

  const id = (k: string) => `${idPrefix}-${k}`;
  const whoOr = who || 'we';
  // The estimate email is AISolar's answer to a priced bill (the quote token).
  // No token, no estimate: the copy never promises one (H2, 9 Nov review).
  const estimate = !!ctx.quoteToken;
  const ask = askCopy({ estimate, who });

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track('ask_view', { segment: ctx.segment, door: ctx.door, flow_id: ctx.flowId });
    funnel('ask_shown', { door: ctx.door, segment: ctx.segment, confirm, flow_id: ctx.flowId });
  }, [ctx.segment, ctx.door, ctx.flowId, confirm]);

  useEffect(() => {
    if (!busy) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, [busy]);

  useEffect(() => {
    if (rateLeft <= 0) return;
    const t = setTimeout(() => setRateLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [rateLeft]);

  useEffect(() => {
    if (issue && bannerRef.current) bannerRef.current.focus({ preventScroll: false });
  }, [issue]);

  const errors: Record<string, string> = {};
  if (details.name.trim().length < 2) errors.name = `Add your name so ${whoOr === 'we' ? 'we know' : `${whoOr} knows`} who we're calling.`;
  if (!details.mobile.trim()) errors.mobile = `Add a mobile so ${whoOr} can ring you.`;
  else if (!isPhone(details.mobile)) errors.mobile = 'That mobile looks short. Irish mobiles start 08 and have 10 digits.';
  if (!details.email.trim()) errors.email = 'Add your email.';
  else if (!isEmail(details.email)) errors.email = "Check your email. It needs an @ and a dot.";
  const ORDER = ['name', 'mobile', 'email'];
  const count = ORDER.filter((k) => errors[k]).length;
  const errOf = (k: string) => (typing === k ? null : showAll || touched[k] ? errors[k] ?? null : null);
  const touch = (k: string) => {
    setTyping((t) => (t === k ? null : t));
    setTouched((t) => (t[k] ? t : { ...t, [k]: true }));
  };

  const carry = ctx.carry;
  const eircode = carry?.eircode ?? null;

  const submit = async () => {
    if (busy || !online || rateLeft > 0) return;
    const key = keyRef.current ?? newKey();
    keyRef.current = key;
    setBusy(true);
    setIssue(null);
    track('ask_submit', { segment: ctx.segment, door: ctx.door, best_time: details.bestTime, has_eircode: !!(eircode && useEircode), flow_id: ctx.flowId });
    const body: SubmitRequest = {
      source: 'website_qualified',
      intent: 'call',
      bestTime: details.bestTime,
      name: details.name.trim(),
      email: details.email.trim(),
      phone: normalisePhone(details.mobile),
      eircode: eircode && useEircode ? eircode.replace(/\s+/g, '') : null,
      county: null,
      address: eircode && useEircode ? carry?.address ?? null : null,
      mprn: carry?.mprn ?? null,
      monthlyBill: ctx.monthlyBill,
      annualKwh: ctx.annualKwh,
      quoteToken: ctx.quoteToken,
      slot: null,
      requestedDay: null,
      emailEstimate: false,
      billRead: ctx.billRead,
      linkToken: ctx.linkToken ?? null,
      meta: {
        segment: ctx.segment,
        businessName: null,
        door: ctx.door,
        page: typeof window !== 'undefined' ? window.location.pathname : '/',
        src: ctx.src,
        pkg: ctx.pkg,
        countyContext: ctx.countyContext,
        billPeriod: ctx.billPeriod,
        supplier: ctx.supplier,
        flowId: ctx.flowId,
      },
    };
    const started = Date.now();
    let r = await submitIntake(body, key);
    // One silent retry with the same key: a blip never makes a second lead.
    if (r.status !== 429 && r.status !== 400 && (r.status !== 200 || !r.data || !(r.data as SubmitResponse).ok)) {
      await new Promise((res) => setTimeout(res, 3000));
      r = await submitIntake(body, key);
    }
    setBusy(false);
    const res = r.data as SubmitResponse | null;
    if (r.status === 429) {
      setIssue({ kind: 'rate' });
      setRateLeft(60);
      track('ask_error', { reason: 'rate_limited', flow_id: ctx.flowId });
      funnel('submit_error', { door: ctx.door, reason: 'rate_limited', flow_id: ctx.flowId });
      return;
    }
    if (r.status !== 200 || !res || !res.ok) {
      setIssue({ kind: 'failed' });
      track('ask_error', { reason: r.status === 400 ? 'invalid' : 'failed', ms: Date.now() - started, flow_id: ctx.flowId });
      funnel('submit_error', { door: ctx.door, reason: r.status === 400 ? 'invalid' : r.status === 0 ? 'offline' : 'failed', flow_id: ctx.flowId });
      return;
    }
    keyRef.current = null;
    track('call_booked', { segment: ctx.segment, door: ctx.door, held: !!res.fallback, best_time: details.bestTime, ms: Date.now() - started, flow_id: ctx.flowId });
    funnel('submit_ok', { door: ctx.door, segment: ctx.segment, held: !!res.fallback, threaded: res.path === 'threaded', flow_id: ctx.flowId });
    generateLead(ctx.road ?? 'intake');
    rememberCall(details);
    onSent(res, details, { estimate });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowAll(true);
    setTyping(null);
    const first = ORDER.find((k) => errors[k]);
    if (first) {
      if (!editing) {
        // Something on file does not pass: open the fields, focus the first one.
        setEditing(true);
        setTimeout(() => document.getElementById(id(first))?.focus(), 0);
      }
      setSummary(count === 1 ? `One thing to add ${ask.before}.` : `${count} things to add ${ask.before}.`);
      const el = document.getElementById(id(first));
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: 'center' });
      track('ask_error', { field: first, flow_id: ctx.flowId });
      funnel('submit_error', { door: ctx.door, reason: `missing_${first}`, flow_id: ctx.flowId });
      return;
    }
    setSummary(null);
    void submit();
  };

  const H = headingLevel;

  const issueBanner = !issue ? null : issue.kind === 'rate' ? (
    <Banner bannerRef={bannerRef} tone="error" icon={<CircleAlert size={16} aria-hidden="true" />} role="alert">
      <b>Too many tries from this connection.</b> Wait a minute, then try again. Everything you typed stays here.
    </Banner>
  ) : (
    <Banner
      bannerRef={bannerRef}
      tone="error"
      icon={<CircleAlert size={16} aria-hidden="true" />}
      role="alert"
      action={
        <span className="si-ask__routes">
          <a className="si-btn--quiet" href={PHONE_HREF}>
            <Phone size={14} aria-hidden="true" /> Ring us on {PHONE}
          </a>
          <a className="si-btn--quiet" href={WA("Hi Solar Ireland, I tried to send my details on your website and it didn't go through.")} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={14} aria-hidden="true" /> WhatsApp us
          </a>
        </span>
      }
    >
      <b>That didn&apos;t go through.</b> Your details are still here. Try again, or reach us another way.
    </Banner>
  );

  const label =
    rateLeft > 0 ? `Try again in ${rateLeft}s` : issue?.kind === 'failed' ? 'Try again' : estimate ? cta : ask.cta;
  const button = (
    <PrimaryButton
      label={label}
      arrow={false}
      busy={busy}
      busyLabel={ask.busy}
      offline={!online || rateLeft > 0}
      offlineLabel={rateLeft > 0 ? `Try again in ${rateLeft}s` : undefined}
    />
  );
  // Cal, 9 Nov: the button sells the estimate; the call follows it. The
  // promise sits right where the thumb lands. (The request is still
  // intent "call"; AISolar's call email carries the estimate.)
  const extra = (
    <>
      <p className="si-ask__promise">
        {estimate ? <Mail size={14} aria-hidden="true" /> : <Phone size={14} aria-hidden="true" />} {ask.promise}
      </p>
      {slow ? (
        <p className="si-still" role="status">
          Still working. Please keep this page open.
        </p>
      ) : null}
    </>
  );

  const field = (k: 'name' | 'mobile' | 'email') => {
    const common = { readOnly: busy, invalid: !!errOf(k), onBlur: () => touch(k) };
    if (k === 'name')
      return (
        <Field id={id('name')} label="Your name" error={errOf('name')}>
          <TextInput
            id={id('name')}
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            value={details.name}
            aria-describedby={errOf('name') ? `${id('name')}-error` : undefined}
            onChange={(e) => {
              setTyping('name');
              onDetails({ name: e.target.value });
            }}
            {...common}
          />
        </Field>
      );
    if (k === 'mobile')
      return (
        <Field id={id('mobile')} label="Mobile" hint={`So ${whoOr} can ring you for the call.`} error={errOf('mobile')}>
          <TextInput
            id={id('mobile')}
            name="tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
            value={details.mobile}
            aria-describedby={errOf('mobile') ? `${id('mobile')}-error` : `${id('mobile')}-hint`}
            onChange={(e) => {
              setTyping('mobile');
              onDetails({ mobile: e.target.value });
            }}
            {...common}
          />
        </Field>
      );
    return (
      <Field id={id('email')} label="Email" hint={estimate ? 'So you have a note of your figures and the call.' : 'So you have a note of the call.'} error={errOf('email')}>
        <TextInput
          id={id('email')}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          value={details.email}
          aria-describedby={errOf('email') ? `${id('email')}-error` : `${id('email')}-hint`}
          onChange={(e) => {
            setTyping('email');
            onDetails({ email: e.target.value });
          }}
          {...common}
        />
      </Field>
    );
  };

  return (
    <form className="si-ask" onSubmit={onSubmit} noValidate aria-labelledby={id('title')}>
      {issueBanner ? <div className="si-issue">{issueBanner}</div> : null}
      <H className="si-ask__title" id={id('title')} ref={headingRef} tabIndex={-1}>
        {heading}
      </H>
      {sub ? <p className="si-ask__sub">{sub}</p> : null}
      {summary && showAll && count > 0 ? (
        <p className="si-err-summary" role="status">
          <CircleAlert size={16} aria-hidden="true" />
          {count === 1 ? `One thing to add ${ask.before}.` : `${count} things to add ${ask.before}.`}
        </p>
      ) : null}
      {editing ? (
        <div className="si-ask__fields">
          {field('name')}
          <div className="si-form__pair">
            {field('mobile')}
            {field('email')}
          </div>
        </div>
      ) : (
        <div className="si-ask__me" data-call-confirm="">
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{details.name.trim()}</dd>
            </div>
            <div>
              <dt>Mobile</dt>
              <dd>{details.mobile.trim()}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{details.email.trim()}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="si-btn--quiet"
            onClick={() => {
              setEditing(true);
              setTimeout(() => document.getElementById(id('name'))?.focus(), 0);
            }}
          >
            Not right? Change my details
          </button>
        </div>
      )}
      <fieldset className="si-ask__best">
        <legend className="si-label">
          Best time to ring <span className="si-ask__opt">optional</span>
        </legend>
        <div className="si-chips si-chips--best">
          {BEST.map((o) => (
            <button
              key={o.v}
              type="button"
              className="si-chip si-chip--name"
              aria-pressed={details.bestTime === o.v}
              onClick={() => onDetails({ bestTime: details.bestTime === o.v ? null : o.v })}
            >
              {o.t}
            </button>
          ))}
        </div>
      </fieldset>
      {eircode ? (
        <p className="si-ask__eir">
          <MapPin size={16} aria-hidden="true" />
          {useEircode ? (
            <>
              <span>
                We&apos;ll use <b className="si-white" data-figure="" data-prov="from_your_bill">{eircode}</b> from your bill.
              </span>
              <button type="button" className="si-btn--quiet" onClick={() => setUseEircode(false)}>
                Leave it off
              </button>
            </>
          ) : (
            <>
              <span>We&apos;ll ask for your Eircode on the call.</span>
              <button type="button" className="si-btn--quiet" onClick={() => setUseEircode(true)}>
                Use it after all
              </button>
            </>
          )}
        </p>
      ) : null}
      {bar ? (
        bar(button, extra)
      ) : (
        <div className="si-ask__go" ref={actionsRef}>
          {button}
          {extra}
        </div>
      )}
      <p className="si-legal">
        We only use your details for this call{estimate ? ' and your estimate' : ''}.{' '}
        <a href="/privacy" target="_blank" rel="noopener">
          Privacy notice
        </a>
        .
      </p>
    </form>
  );
}

/** vCard for "Add to contacts", built on tap only. */
function saveContact() {
  const card = ['BEGIN:VCARD', 'VERSION:3.0', 'N:;Solar Ireland Group;;;', 'FN:Solar Ireland', 'ORG:Solar Ireland Group', `TEL;TYPE=CELL:${PHONE.replace(/\s+/g, '')}`, `URL:https://${SOLAR_DATA.provider.website}`, 'END:VCARD'].join('\r\n');
  const url = URL.createObjectURL(new Blob([card], { type: 'text/vcard' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'solar-ireland.vcf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  track('call_contact_saved', {});
}

/** The confirmation, the same on both roads. */
/**
 * What the confirmation says, and what a screen reader hears. `held` is the
 * submit's `fallback`: AISolar did not take it yet, the site's outbox holds it
 * and the owner has it by email (lib/intake/live/outbox.ts). Nothing has been
 * emailed to the homeowner, so the held state never says "check your inbox".
 */
export function callDoneCopy(o: { held: boolean; who: string | null; first: string; estimate?: boolean }): { title: string; facts: string; announce: string } {
  const by = o.who || 'We';
  if (o.held) {
    return {
      title: `Saved. ${by} will ring you today.`,
      facts: "If it's late, first thing tomorrow.",
      announce: `Saved. ${by} will ring you today.`,
    };
  }
  if (o.estimate === false) {
    // No priced bill went with it: no estimate email is coming, so none is promised.
    return {
      title: `Thanks${o.first ? `, ${o.first}` : ''}. ${by} will ring you today.`,
      facts: `${by} will work out your estimate with you on the call. If it's late, first thing tomorrow.`,
      announce: `Sent. ${by} will ring you today.`,
    };
  }
  return {
    title: `Thanks, ${o.first}. Your full estimate is on its way.`,
    facts: `Check your inbox. ${o.who ? `${o.who} rings` : 'We ring'} you today to talk it through. If it's late, first thing tomorrow.`,
    announce: 'Your full estimate is on its way.',
  };
}

export function CallDone({
  details,
  who,
  headingRef,
  headingLevel = 'h2',
  footer,
  held = false,
  estimate = true,
}: {
  details: CallDetails;
  who: string | null;
  headingRef?: React.Ref<HTMLHeadingElement>;
  headingLevel?: 'h1' | 'h2';
  footer?: ReactNode;
  /** The submit answered `fallback`: held on the site, not yet with AISolar. */
  held?: boolean;
  /** A priced bill went with the request, so AISolar emails the estimate. */
  estimate?: boolean;
}) {
  const H = headingLevel;
  const fname = firstName(details.name) || 'there';
  const copy = callDoneCopy({ held, who, first: fname, estimate });
  return (
    <div className="si-done-call" data-call-done={held ? 'held' : estimate ? 'sent' : 'call'}>
      <span className="si-done-mark" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <H className="si-ask__title si-mt-24" ref={headingRef} tabIndex={-1}>
        {copy.title}
      </H>
      <p className="si-facts">{copy.facts}</p>
      <p className="si-done-call__line">
        We&apos;ll ring <b className="si-white">{details.mobile.trim()}</b>.{details.bestTime ? ` ${BEST_LINE[details.bestTime]}` : ''}
      </p>
      <div className="si-done-call__save">
        <p>
          Save our number so you know it&apos;s us:{' '}
          <a className="si-inline" href={PHONE_HREF}>
            {PHONE}
          </a>
        </p>
        <button type="button" className="si-btn si-btn--secondary si-btn--sm" onClick={saveContact}>
          <UserPlus size={18} aria-hidden="true" /> Add to contacts
        </button>
      </div>
      <p className="si-group-label si-mt-32">On the call we&apos;ll</p>
      <ul className="si-done-call__list">
        <li>Go through your figures with you</li>
        <li>Answer anything you want to ask about solar and the SEAI grant</li>
        <li>Agree the next step with you, if you want one</li>
      </ul>
      {footer}
    </div>
  );
}
