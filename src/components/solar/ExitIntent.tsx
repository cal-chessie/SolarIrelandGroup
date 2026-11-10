'use client';

/**
 * The exit quiz (Cal, 9 Nov 2026). Three one-tap questions, an honest saving
 * range, then the same ask as every other road ("Send my full estimate").
 *
 * When it may open is lib/intake/exitGate.ts: never over a form someone is
 * filling, never on /estimate or /book-survey, never after the analyser has
 * started or a lead was sent, desktop exit intent only after 20 seconds,
 * phones after 45 seconds and half the page (or a fast scroll up), once a
 * week, and dismissed means gone.
 *
 * The range comes from the one engine, through the same /api/intake/quote
 * path the analyser and the manual road use: the bill they tapped, priced
 * 15% either side because they said "roughly". No maths here. The submit is
 * the call contract (intent "call"), with the quiz answers in the lead's
 * attribution (meta.pkg) and the door "exit-quiz".
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { CallAsk, CallDone, EMPTY_CALL, type CallDetails } from '@/components/intake/CallAsk';
import { getConfig, getQuotes } from '@/components/intake/api';
import type { IntakeConfig, Quote, QuoteRequestItem, Segment } from '@/lib/intake/contract';
import { eur } from '@/lib/intake/format';
import { EXIT_KEYS, exitMayOpen, readExitState, type ExitTrigger } from '@/lib/intake/exitGate';
import { billBand, funnel } from '@/lib/intake/funnel';
import { SOLAR_DATA } from '@/lib/solar-data';
import '@/components/intake/intake.css';

const PHONE = SOLAR_DATA.provider.phone;
const PHONE_HREF = `tel:${PHONE.replace(/\s+/g, '')}`;
const FALLBACK_CHIPS = { domestic: [80, 120, 160, 220, 300], commercial: [300, 600, 1000, 2000, 4000] };
const EXTRAS = [
  { v: 'ev', t: 'An electric car' },
  { v: 'heat_pump', t: 'A heat pump' },
  { v: 'battery', t: 'A home battery' },
] as const;
type Extra = (typeof EXTRAS)[number]['v'];
type Stage = 'segment' | 'bill' | 'extras' | 'result' | 'ask' | 'done';

function flowId(): string {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}
const setLs = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* private mode */
  }
};
const setSs = (k: string, v: string) => {
  try {
    sessionStorage.setItem(k, v);
  } catch {
    /* private mode */
  }
};
const item = (segment: Segment, amountEur: number): QuoteRequestItem => ({
  segment,
  bill: { amountEur: Math.round(amountEur), period: 'month' },
  annualKwh: null,
  supplier: null,
  homeType: 'unknown',
  billRead: null,
});

export default function ExitIntent() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('segment');
  const [segment, setSegment] = useState<Segment>('domestic');
  const [bill, setBill] = useState<{ amount: number; orMore: boolean } | null>(null);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [config, setConfig] = useState<IntakeConfig | null>(null);
  const [quotes, setQuotes] = useState<{ at: Quote; low: Quote; high: Quote } | null>(null);
  const [quoteState, setQuoteState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [details, setDetails] = useState<CallDetails>(EMPTY_CALL);
  const [held, setHeld] = useState(false);
  const [sentEstimate, setSentEstimate] = useState(true);
  const [fid, setFid] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const fired = useRef(false);

  const who = config?.survey.homeownerFacingName ?? null;

  /* Remember typing anywhere on the site this session: the quiz never interrupts a form. */
  useEffect(() => {
    const onInput = (e: Event) => {
      if (cardRef.current?.contains(e.target as Node)) return;
      setSs(EXIT_KEYS.typed, '1');
    };
    document.addEventListener('input', onInput, true);
    readExitState(); // stamps the site start time on the first page
    return () => document.removeEventListener('input', onInput, true);
  }, []);

  const tryOpen = useCallback((t: ExitTrigger) => {
    if (fired.current) return;
    const phone = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024;
    if (!exitMayOpen(readExitState(), t, phone)) return;
    fired.current = true;
    setLs(EXIT_KEYS.shownAt, String(Date.now()));
    setSs(EXIT_KEYS.legacySeen, '1');
    setFid(flowId());
    setOpen(true);
    funnel('quiz_shown', { door: 'exit-quiz', trigger: t.kind });
    getConfig().then((c) => c && setConfig(c));
  }, []);

  /* Triggers: desktop exit intent; phone scroll depth and a fast scroll up. */
  useEffect(() => {
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) tryOpen({ kind: 'exit-intent' });
    };
    document.documentElement.addEventListener('mouseleave', onLeave);
    let lastY = window.scrollY;
    let lastT = performance.now();
    let maxDepth = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const t = performance.now();
      const room = document.documentElement.scrollHeight - window.innerHeight;
      if (room > 0) maxDepth = Math.max(maxDepth, y / room);
      const v = (lastY - y) / Math.max(1, t - lastT); // px per ms, up is positive
      if (v > 2.5 && lastY - y > 120 && maxDepth > 0.25) tryOpen({ kind: 'fast-up' });
      else if (maxDepth >= 0.5) tryOpen({ kind: 'scroll-depth', depth: maxDepth });
      lastY = y;
      lastT = t;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // A phone reader who stops at half way still gets it once 45 seconds pass.
    const tick = setInterval(() => {
      if (maxDepth >= 0.5) tryOpen({ kind: 'scroll-depth', depth: maxDepth });
    }, 5000);
    return () => {
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      clearInterval(tick);
    };
  }, [tryOpen]);

  const close = useCallback(
    (how: 'x' | 'no_thanks' | 'escape' | 'scrim' | 'done') => {
      setOpen(false);
      if (how !== 'done') setLs(EXIT_KEYS.dismissed, '1');
      funnel('quiz_answered', { door: 'exit-quiz', step: 'closed', how, at: stage });
    },
    [stage],
  );

  /* Focus into the card, Escape closes, Tab stays inside. */
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => headRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close('escape');
      if (e.key !== 'Tab' || !cardRef.current) return;
      const f = [...cardRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
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
    };
  }, [open, close, stage]);

  /* Each new question: focus its heading so a screen reader hears it. */
  useEffect(() => {
    if (open) setTimeout(() => headRef.current?.focus(), 30);
  }, [stage, open]);

  const answer = (step: string, value: string) => funnel('quiz_answered', { door: 'exit-quiz', step, value, flow_id: fid });

  const price = (seg: Segment, amount: number) => {
    setQuoteState('loading');
    getQuotes([item(seg, amount), item(seg, amount * 0.85), item(seg, amount * 1.15)]).then((r) => {
      if (r && r.length === 3 && r.every((q) => q.figures)) {
        setQuotes({ at: r[0], low: r[1], high: r[2] });
        setQuoteState('ready');
      } else {
        setQuotes(null);
        setQuoteState('error');
      }
    });
  };

  if (!open) return null;

  const chips = (config?.bill.chips ?? FALLBACK_CHIPS)[segment];
  const step = stage === 'segment' ? 1 : stage === 'bill' ? 2 : stage === 'extras' ? 3 : null;
  const low = quotes?.low.figures?.annualSavingEur ?? null;
  const high = quotes?.high.figures?.annualSavingEur ?? null;

  let body;
  if (stage === 'segment') {
    body = (
      <>
        <h2 className="si-exit__h" ref={headRef} tabIndex={-1}>
          Is this for your home or a business?
        </h2>
        <div className="si-exit__chips si-exit__chips--two">
          {(
            [
              ['domestic', 'My home'],
              ['commercial', 'A business'],
            ] as const
          ).map(([v, t]) => (
            <button
              key={v}
              type="button"
              className="si-chip si-chip--name"
              onClick={() => {
                setSegment(v);
                answer('segment', v);
                setStage('bill');
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </>
    );
  } else if (stage === 'bill') {
    body = (
      <>
        <h2 className="si-exit__h" ref={headRef} tabIndex={-1}>
          Roughly what&apos;s your electricity bill a month?
        </h2>
        <div className="si-exit__chips">
          {chips.map((a, i) => {
            const orMore = i === chips.length - 1;
            return (
              <button
                key={a}
                type="button"
                className="si-chip si-chip--name"
                onClick={() => {
                  setBill({ amount: a, orMore });
                  // A band, never the amount itself (M7).
                  answer('bill', billBand(segment, a));
                  price(segment, a);
                  setStage('extras');
                }}
              >
                {eur(a)}
                {orMore ? '+' : ''}
              </button>
            );
          })}
        </div>
      </>
    );
  } else if (stage === 'extras') {
    body = (
      <>
        <h2 className="si-exit__h" ref={headRef} tabIndex={-1}>
          Do you have, or want, any of these?
        </h2>
        <p className="si-exit__sub">Tap any that apply. Optional.</p>
        <div className="si-exit__chips si-exit__chips--stack">
          {EXTRAS.map((x) => (
            <button
              key={x.v}
              type="button"
              className="si-chip si-chip--name"
              aria-pressed={extras.includes(x.v)}
              onClick={() => setExtras((e) => (e.includes(x.v) ? e.filter((y) => y !== x.v) : [...e, x.v]))}
            >
              {x.t}
            </button>
          ))}
        </div>
        <div className="si-exit__go">
          <button
            type="button"
            className="si-btn si-btn--primary"
            onClick={() => {
              answer('extras', extras.join(',') || 'none');
              setStage('result');
            }}
          >
            Show my saving
          </button>
        </div>
      </>
    );
  } else if (stage === 'result') {
    body = (
      <>
        <h2 className="si-exit__h" ref={headRef} tabIndex={-1}>
          {quoteState === 'ready' && low !== null && high !== null ? 'Roughly what solar would save you' : 'Your saving'}
        </h2>
        {quoteState === 'loading' || quoteState === 'idle' ? (
          <p className="si-exit__sub" role="status">
            Working it out
          </p>
        ) : quoteState === 'ready' && low !== null && high !== null ? (
          <>
            <p className="si-exit__big" data-figure="" data-prov="aisolar_quote">
              {bill?.orMore ? `From ${eur(low)}` : `${eur(Math.min(low, high))} to ${eur(Math.max(low, high))}`}
              <span> a year</span>
            </p>
            <p className="si-exit__sub">
              On a bill of about {eur(bill?.amount ?? 0)} a month, from the same engine as your full estimate. Your own bill makes it exact.
              {extras.length ? ' We will look at the extras you picked on the call.' : ''}
            </p>
          </>
        ) : (
          <p className="si-exit__sub" role="alert">
            We couldn&apos;t work that out just now. Leave your details and {who || 'we'} will ring you today and work it out with you, or ring us on{' '}
            <a className="si-inline" href={PHONE_HREF}>
              {PHONE}
            </a>
            .
          </p>
        )}
        <div className="si-exit__go">
          <button
            type="button"
            className="si-btn si-btn--primary"
            disabled={quoteState === 'loading'}
            onClick={() => {
              answer('result', quoteState);
              setStage('ask');
            }}
          >
            {quoteState === 'ready' ? 'Get my full estimate' : `Ask ${who || 'us'} to ring me`}
          </button>
        </div>
      </>
    );
  } else if (stage === 'ask') {
    body = (
      <CallAsk
        idPrefix="si-exit"
        details={details}
        onDetails={(p) => setDetails((d) => ({ ...d, ...p }))}
        who={who}
        heading={quotes?.at.quoteToken ? 'Where should we send your full estimate?' : `Where should ${who || 'we'} ring you?`}
        headingLevel="h2"
        headingRef={headRef}
        ctx={{
          segment,
          door: 'exit-quiz',
          src: 'exit-quiz',
          // The quiz answers ride in the lead's attribution, which AISolar keeps.
          pkg: `quiz:${segment === 'commercial' ? 'business' : 'home'};bill=${bill?.amount ?? ''}${bill?.orMore ? '+' : ''};extras=${extras.join(',') || 'none'}`,
          countyContext: null,
          flowId: fid,
          monthlyBill: bill?.amount ?? null,
          annualKwh: null,
          billPeriod: bill ? 'month' : null,
          supplier: null,
          quoteToken: quotes?.at.quoteToken ?? null,
          billRead: null,
          carry: null,
        }}
        onSent={(res, d, sent) => {
          setDetails(d);
          setHeld(!!res.fallback);
          setSentEstimate(sent.estimate);
          setLs(EXIT_KEYS.leadSent, '1');
          funnel('quiz_submitted', { door: 'exit-quiz', segment, extras: extras.length, flow_id: fid });
          setStage('done');
        }}
      />
    );
  } else {
    body = <CallDone details={details} who={who} headingRef={headRef} headingLevel="h2" held={held} estimate={sentEstimate} />;
  }

  return (
    <div className="si-analyser si-exit" data-exit-quiz="" data-stage={stage}>
      <div className="si-exit__scrim" onClick={() => close(stage === 'done' ? 'done' : 'scrim')} aria-hidden="true" />
      <div className="si-exit__card" ref={cardRef} role="dialog" aria-modal="true" aria-label="Three quick questions about your solar saving">
        <div className="si-exit__top">
          <p className="si-an-kicker">{step ? `Question ${step} of 3` : stage === 'done' ? 'Done' : 'Your saving'}</p>
          <button type="button" className="si-exit__x" aria-label="Close" onClick={() => close(stage === 'done' ? 'done' : 'x')}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {body}
        {stage !== 'done' && stage !== 'ask' ? (
          <button type="button" className="si-btn--quiet si-exit__no" onClick={() => close('no_thanks')}>
            No thanks
          </button>
        ) : null}
      </div>
    </div>
  );
}
