'use client';

/**
 * The exit quiz (Cal, 9 Nov 2026; restyled and lengthened 11 Nov). Four
 * one-tap questions (home or business, what they are after, the bill, what
 * else is in the house), an honest result, then the same ask as every other
 * road ("Send my full estimate", or "Ring me today" when there is no quote).
 *
 * The look is the old exit popup's, class for class (Cal, 11 Nov): the dark
 * card with the yellow top edge, the logo ring and name, the green pill, the
 * two-tone headline, icon-tile option cards, small trust chips, the yellow
 * full-width CTA and quiet secondary buttons. Its claims did not come along:
 * no "1-Day Install", no portal, no typical-house saving, no VAT line. Every
 * figure is the engine's; every trust chip is a fact the site states.
 *
 * When it may open is lib/intake/exitGate.ts: never over a form someone is
 * filling, never on /estimate or /book-survey, never after the analyser has
 * started or a lead was sent, desktop exit intent only after 20 seconds,
 * phones after 45 seconds and half the page (or a fast scroll up), once a
 * week, and dismissed means gone.
 *
 * The range comes from the one engine, through the same /api/intake/quote
 * path the analyser and the manual road use: the bill they tapped, priced
 * 15% either side because they said "roughly". No maths here. An EV charger
 * on its own gets no solar figure. The submit is the call contract (intent
 * "call"), with the quiz answers and the interest in the lead's attribution
 * (meta.pkg) and the door "exit-quiz".
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import {
  X,
  ArrowLeft,
  ArrowRight,
  House,
  Building2,
  Sun,
  PlugZap,
  Zap,
  BatteryCharging,
  Thermometer,
  Car,
  CircleSlash,
  Check,
  Shield,
  Award,
  FileCheck,
  MessageCircle,
  Percent,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';
import { CallAsk, CallDone, EMPTY_CALL, type CallDetails } from '@/components/intake/CallAsk';
import { getConfig, getQuotes } from '@/components/intake/api';
import type { IntakeConfig, Quote, QuoteRequestItem, Segment } from '@/lib/intake/contract';
import { eur } from '@/lib/intake/format';
import { EXIT_KEYS, exitMayOpen, readExitState, type ExitTrigger } from '@/lib/intake/exitGate';
import { billBand, funnel } from '@/lib/intake/funnel';
import { SOLAR_DATA } from '@/lib/solar-data';
import { estimate } from '@/lib/estimate';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import '@/components/intake/intake.css';

const PHONE = SOLAR_DATA.provider.phone;
const PHONE_HREF = `tel:${PHONE.replace(/\s+/g, '')}`;
const FALLBACK_CHIPS = { domestic: [80, 120, 160, 220, 300], commercial: [300, 600, 1000, 2000, 4000] };
/* The SEAI home charger grant, as the site already states it (services page,
   seai.ie, read 18 Oct 2026). */
const CHARGER_GRANT = 'up to €300';

/* "A typical 3-bed semi saves about ..." (Cal, 11 Nov): the one engine on the
   same input the site's 3-bed semi guide uses (4,200 kWh a year), never a
   typed figure. Rounded to the nearest €10. */
const TYPICAL_SEMI_SAVING = Math.round(estimate({ annualUsageKwh: 4200, homeId: 'semi' }).totalAnnualBenefitEur / 10) * 10;

type Interest = 'solar' | 'ev' | 'both';
const INTERESTS: { v: Interest; t: string; d: string; icon: LucideIcon; tone: 'yellow' | 'green' }[] = [
  { v: 'solar', t: 'Solar panels', d: 'Cut the bill with your own power', icon: Sun, tone: 'yellow' },
  { v: 'ev', t: 'An EV charger', d: 'Charge the car at home', icon: PlugZap, tone: 'green' },
  { v: 'both', t: 'Both', d: 'Panels, and a charger that can run off them', icon: Zap, tone: 'yellow' },
];
const EXTRAS = [
  { v: 'battery', t: 'Battery', icon: BatteryCharging },
  { v: 'heat_pump', t: 'Heat pump', icon: Thermometer },
  { v: 'ev', t: 'Electric car', icon: Car },
] as const;
type Extra = (typeof EXTRAS)[number]['v'];
type Stage = 'segment' | 'interest' | 'bill' | 'extras' | 'result' | 'ask' | 'done';
const ORDER: Stage[] = ['segment', 'interest', 'bill', 'extras', 'result', 'ask'];
const TRUST: { icon: LucideIcon; label: string; color: string }[] = [
  { icon: Shield, label: 'SEAI Registered', color: 'text-green-400/70' },
  { icon: Award, label: '25-year panel warranty', color: 'text-yellow-400/70' },
  { icon: Check, label: '5-year workmanship', color: 'text-sky-400/70' },
  { icon: FileCheck, label: 'We book your BER', color: 'text-violet-400/70' },
];
/* Homes only: business solar is not zero-rated (Cal, 11 Nov). */
const HOME_VAT = { icon: Percent, label: '0% VAT on solar for homes', color: 'text-sky-400/70' };

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

/* The old popup's feature card, as a tap target. */
function OptionCard({
  icon: Icon,
  title,
  sub,
  tone = 'yellow',
  pressed,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  sub?: string;
  tone?: 'yellow' | 'green';
  pressed?: boolean;
  onClick: () => void;
}) {
  const tile =
    tone === 'green'
      ? 'from-green-400/10 to-green-500/[0.05] border-green-400/10'
      : 'from-yellow-400/10 to-yellow-500/[0.05] border-yellow-400/10';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`group w-full min-h-11 text-left flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-300 ${
        pressed
          ? 'bg-yellow-400/[0.06] border-yellow-400/40'
          : 'bg-white/[0.015] border-white/[0.05] hover:bg-white/[0.025] hover:border-white/[0.08]'
      }`}
    >
      <span
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tile} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className={`w-[18px] h-[18px] ${tone === 'green' ? 'text-green-400' : 'text-yellow-400'}`} aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-bold text-white mb-0.5">{title}</span>
        {sub ? <span className="block text-xs text-gray-400 leading-relaxed">{sub}</span> : null}
      </span>
      {pressed ? <Check className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" /> : null}
    </button>
  );
}

/* The old popup's quiet secondary button, as a chip. */
const chipClass = (pressed = false) =>
  `flex items-center justify-center gap-2 min-h-12 px-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
    pressed
      ? 'bg-yellow-400/[0.06] border-yellow-400/40 text-white'
      : 'bg-white/[0.03] border-white/[0.06] text-gray-200 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1]'
  }`;
const ctaClass =
  'exit-intent-cta w-full inline-flex items-center justify-center gap-2 px-6 py-[13px] min-h-12 rounded-xl bg-yellow-400 text-black font-bold text-[14px] hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export default function ExitIntent() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('segment');
  const [segment, setSegment] = useState<Segment>('domestic');
  const [interest, setInterest] = useState<Interest | null>(null);
  const [bill, setBill] = useState<{ amount: number; orMore: boolean } | null>(null);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [config, setConfig] = useState<IntakeConfig | null>(null);
  const [quotes, setQuotes] = useState<{ at: Quote; low: Quote; high: Quote } | null>(null);
  const [quoteState, setQuoteState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [details, setDetails] = useState<CallDetails>(EMPTY_CALL);
  const [held, setHeld] = useState(false);
  const [leaving, setLeaving] = useState(false);
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
    (how: 'x' | 'no_thanks' | 'escape' | 'scrim' | 'done' | 'whatsapp') => {
      setOpen(false);
      setLeaving(false);
      // A deliberate no (the X, Maybe later, Escape, WhatsApp instead) means gone. A
      // stray tap on the scrim only closes it: the 7-day rule (shownAt) decides when
      // it may return (M8).
      if (how !== 'done' && how !== 'scrim') setLs(EXIT_KEYS.dismissed, '1');
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

  /* Every step fires funnel_step (quiz_answered) with the step and a value; bills go as bands (M7). */
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

  const typed = !!(details.name.trim() || details.mobile.trim() || details.email.trim());
  const onScrim = () => {
    if (stage === 'done') return close('done');
    // Never throw away what someone typed on a stray tap (M8): ask first.
    if (stage === 'ask' && typed) return setLeaving(true);
    close('scrim');
  };

  const isBiz = segment === 'commercial';
  const chips = (config?.bill.chips ?? FALLBACK_CHIPS)[segment];
  const evOnly = interest === 'ev';
  const low = quotes?.low.figures?.annualSavingEur ?? null;
  const high = quotes?.high.figures?.annualSavingEur ?? null;
  const priced = !evOnly && quoteState === 'ready' && low !== null && high !== null;
  const lo = Math.min(low ?? 0, high ?? 0);
  const hi = Math.max(low ?? 0, high ?? 0);
  const at = ORDER.indexOf(stage);
  const back = at > 0 && stage !== 'done' ? ORDER[at - 1] : null;
  const trust = segment === 'domestic' && stage !== 'segment' ? [...TRUST, HOME_VAT] : TRUST;
  const questions = stage === 'segment' || stage === 'interest' || stage === 'bill' || stage === 'extras';

  const head = (white: ReactNode, yellow: ReactNode) => (
    <h2 className="text-2xl sm:text-[28px] font-bold text-white leading-[1.15] mb-2.5 tracking-tight outline-none" ref={headRef} tabIndex={-1}>
      {white} <span className="text-gradient">{yellow}</span>
    </h2>
  );

  let body: ReactNode;
  if (stage === 'segment') {
    body = (
      <>
        <div className="exit-intent-el exit-intent-el-1 flex items-center gap-2 mb-5 px-3 py-2 rounded-full bg-green-500/[0.06] border border-green-500/[0.1] w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-[11px] text-green-400/90 font-medium">SEAI-registered installer covering all 32 counties</span>
        </div>
        <div className="exit-intent-el exit-intent-el-2 mb-4">
          {head("Is this for your", "home or a business?")}
          <p className="text-sm text-gray-400 leading-relaxed">Four quick taps and we&apos;ll show you what it could save. No email needed to see it.</p>
        </div>
        <div className="exit-intent-el exit-intent-el-3 space-y-2 mb-4">
          {(
            [
              ['domestic', 'My home', 'A house, bungalow or apartment', House, 'yellow'],
              ['commercial', 'A business', 'A shop, farm, office or unit', Building2, 'green'],
            ] as const
          ).map(([v, t, d, icon, tone]) => (
            <OptionCard
              key={v}
              icon={icon}
              title={t}
              sub={d}
              tone={tone}
              onClick={() => {
                setSegment(v);
                setBill(null);
                setQuotes(null);
                setQuoteState('idle');
                answer('segment', v);
                setStage('interest');
              }}
            />
          ))}
        </div>
      </>
    );
  } else if (stage === 'interest') {
    body = (
      <>
        <div className="exit-intent-el exit-intent-el-1 mb-4">
          {head("What are you", "after?")}
          <p className="text-sm text-gray-400 leading-relaxed">
            Pick one. A charger on its own is fine.
            {isBiz ? null : (
              <>
                {' '}
                A typical 3-bed semi saves about <span className="text-gray-300 font-medium">{eur(TYPICAL_SEMI_SAVING)} a year</span> with panels.
              </>
            )}
          </p>
        </div>
        <div className="exit-intent-el exit-intent-el-2 space-y-2 mb-4">
          {INTERESTS.map((x) => (
            <OptionCard
              key={x.v}
              icon={x.icon}
              title={x.t}
              sub={x.d}
              tone={x.tone}
              pressed={interest === x.v}
              onClick={() => {
                setInterest(x.v);
                answer('interest', x.v);
                setStage('bill');
              }}
            />
          ))}
        </div>
      </>
    );
  } else if (stage === 'bill') {
    body = (
      <>
        <div className="exit-intent-el exit-intent-el-1 mb-4">
          {head(isBiz ? "Roughly what's the business's" : "Roughly what's your", "bill a month?")}
          <p className="text-sm text-gray-400 leading-relaxed">Your electricity bill. A rough guess is fine.</p>
        </div>
        <div className="exit-intent-el exit-intent-el-2 grid grid-cols-2 min-[430px]:grid-cols-3 gap-2 mb-4">
          {chips.map((a, i) => {
            const orMore = i === chips.length - 1;
            return (
              <button
                key={a}
                type="button"
                aria-pressed={bill?.amount === a}
                className={chipClass(bill?.amount === a)}
                onClick={() => {
                  setBill({ amount: a, orMore });
                  // A band, never the amount itself (M7).
                  answer('bill', billBand(segment, a));
                  if (interest !== 'ev') price(segment, a);
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
    const none = extras.length === 0;
    body = (
      <>
        <div className="exit-intent-el exit-intent-el-1 mb-4">
          {head("Anything else", isBiz ? 'on site?' : 'in the house?')}
          <p className="text-sm text-gray-400 leading-relaxed">Tap any you have or want. Optional.</p>
        </div>
        <div className="exit-intent-el exit-intent-el-2 grid grid-cols-2 gap-2 mb-5">
          {EXTRAS.map((x) => {
            const on = extras.includes(x.v);
            return (
              <button
                key={x.v}
                type="button"
                aria-pressed={on}
                className={chipClass(on)}
                onClick={() => setExtras((e) => (e.includes(x.v) ? e.filter((y) => y !== x.v) : [...e, x.v]))}
              >
                <x.icon className={`w-4 h-4 ${on ? 'text-yellow-400' : 'text-gray-400'}`} aria-hidden="true" />
                {x.t}
              </button>
            );
          })}
          <button type="button" aria-pressed={none} className={chipClass(none)} onClick={() => setExtras([])}>
            <CircleSlash className={`w-4 h-4 ${none ? 'text-yellow-400' : 'text-gray-400'}`} aria-hidden="true" />
            None
          </button>
        </div>
        <div className="exit-intent-el exit-intent-el-3">
          <button
            type="button"
            className={ctaClass}
            onClick={() => {
              answer('extras', extras.join(',') || 'none');
              setStage('result');
            }}
          >
            {evOnly ? 'See what happens next' : 'Show my saving'} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="mt-2 w-full min-h-11 rounded-xl text-[13px] text-gray-400 hover:text-gray-300 transition-colors"
            onClick={() => {
              setExtras([]);
              answer('extras', 'skipped');
              setStage('result');
            }}
          >
            Skip
          </button>
        </div>
      </>
    );
  } else if (stage === 'result') {
    const waiting = !evOnly && (quoteState === 'loading' || quoteState === 'idle');
    body = (
      <>
        <div className="exit-intent-el exit-intent-el-1 mb-4">
          {evOnly ? head("We'll price your", "EV charger") : priced ? head("Roughly what solar would", "save you") : head("Your", "saving")}
          {evOnly ? (
            <p className="text-sm text-gray-400 leading-relaxed">
              We&apos;ll price your charger and tell you about the SEAI home charger grant, {CHARGER_GRANT}.
            </p>
          ) : waiting ? (
            <p className="text-sm text-gray-400 leading-relaxed" role="status">
              Working it out
            </p>
          ) : priced ? (
            <>
              <div className="si-analyser">
              <p className="si-exit__big" data-figure="" data-prov="aisolar_quote">
                <strong className="text-gradient font-bold">
                  {bill?.orMore ? `From ${eur(lo)}` : `${eur(lo)} to ${eur(hi)}`}
                </strong>
                <span> a year</span>
              </p>
              </div>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                On a bill of about {eur(bill?.amount ?? 0)} a month, from the same engine as your full estimate. Your own bill makes it exact.
                {interest === 'both' ? ` We'll price the charger too, and tell you about the SEAI home charger grant, ${CHARGER_GRANT}.` : ''}
                {extras.length ? ' We will look at the extras you picked on the call.' : ''}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 leading-relaxed" role="alert">
              We couldn&apos;t work that out just now. Leave your details and {who || 'we'} will ring you today and work it out with you, or ring us on{' '}
              <a className="text-yellow-400 underline underline-offset-2" href={PHONE_HREF}>
                {PHONE}
              </a>
              .
            </p>
          )}
        </div>
        {isBiz ? null : (
          <div className="exit-intent-el exit-intent-el-2 group flex items-start gap-3.5 p-3.5 mb-4 rounded-xl bg-white/[0.015] border border-white/[0.05]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/10 to-yellow-500/[0.05] border border-yellow-400/10 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-[18px] h-[18px] text-yellow-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-white mb-0.5">Track your project in real time</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Your project page shows each step, from survey to switch-on.</p>
            </div>
          </div>
        )}
        <div className="exit-intent-el exit-intent-el-3 flex items-center gap-2 mb-5 flex-wrap">
          {trust.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <Icon className={`w-3 h-3 ${color}`} aria-hidden="true" />
              <span className="text-[10px] text-gray-400 font-medium">{label}</span>
            </div>
          ))}
        </div>
        <div className="exit-intent-el exit-intent-el-4">
          <button
            type="button"
            className={ctaClass}
            disabled={waiting}
            onClick={() => {
              answer('result', evOnly ? 'ev_only' : quoteState);
              setStage('ask');
            }}
          >
            {priced ? 'Get my full estimate' : `Ask ${who || 'us'} to ring me`} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </>
    );
  } else if (stage === 'ask') {
    body = (
      <div className="si-analyser si-exit__ask">
        <CallAsk
          idPrefix="si-exit"
          details={details}
          onDetails={(p) => setDetails((d) => ({ ...d, ...p }))}
          who={who}
          heading={
            quotes?.at.quoteToken && !evOnly ? (
              <>
                Where should we send your <span className="text-gradient">full estimate?</span>
              </>
            ) : (
              <>
                Where should {who || 'we'} <span className="text-gradient">ring you?</span>
              </>
            )
          }
          headingLevel="h2"
          headingRef={headRef}
          ctx={{
            segment,
            door: 'exit-quiz',
            road: 'exit-quiz',
            src: 'exit-quiz',
            // The quiz answers ride in the lead's attribution, which AISolar keeps.
            pkg: `quiz:${isBiz ? 'business' : 'home'};interest=${interest ?? ''};bill=${bill?.amount ?? ''}${bill?.orMore ? '+' : ''};extras=${extras.join(',') || 'none'}`,
            countyContext: null,
            flowId: fid,
            monthlyBill: bill?.amount ?? null,
            annualKwh: null,
            billPeriod: bill ? 'month' : null,
            supplier: null,
            // An EV charger on its own carries no solar quote.
            quoteToken: evOnly ? null : (quotes?.at.quoteToken ?? null),
            billRead: null,
            carry: null,
          }}
          onSent={(res, d, sent) => {
            setDetails(d);
            setHeld(!!res.fallback);
            setSentEstimate(sent.estimate);
            setLs(EXIT_KEYS.leadSent, '1');
            funnel('quiz_submitted', { door: 'exit-quiz', segment, interest: interest ?? '', extras: extras.length, flow_id: fid });
            setStage('done');
          }}
        />
      </div>
    );
  } else {
    body = (
      <div className="si-analyser si-exit__ask">
        <CallDone details={details} who={who} headingRef={headRef} headingLevel="h2" held={held} estimate={sentEstimate} />
      </div>
    );
  }

  const whatsappUrl = buildWhatsAppUrl({ source: 'exit-intent', customMessage: 'Hi Solar Ireland Group, I have a question about solar.' });

  // Not inside .si-analyser: intake.css resets buttons outside any cascade
  // layer, which beats every Tailwind utility the old popup's look is made of.
  // Only the shared ask (CallAsk / CallDone) and the engine figure sit in it.
  return (
    <div className="si-exit fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6" data-exit-quiz="" data-stage={stage}>
      <div className="exit-intent-backdrop absolute inset-0 bg-black/60" onClick={onScrim} aria-hidden="true" />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Quick questions about your solar saving"
        className="exit-intent-card relative w-full sm:max-w-[480px] max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#0e0e0e] border border-white/[0.06] shadow-2xl shadow-black/60 overflow-hidden"
      >
        <div className="relative h-1 w-full overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500" />
          <div className="exit-intent-shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-1 sm:px-8 sm:pt-5 shrink-0">
          <div className="exit-intent-el exit-intent-el-0 flex items-center gap-3 min-w-0">
            <Image src="/logo-sm.webp" alt="" width={120} height={135} className="h-9 sm:h-10 w-auto opacity-90" />
            <span className="font-bold text-white text-base tracking-wide opacity-90 truncate">Solar Ireland Group</span>
          </div>
          <button
            type="button"
            onClick={() => close(stage === 'done' ? 'done' : 'x')}
            className="exit-intent-el exit-intent-el-0 w-11 h-11 shrink-0 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/[0.12] transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {stage !== 'done' ? (
          <div className="flex items-center gap-2 px-5 sm:px-8 pt-3 shrink-0">
            {back ? (
              <button
                type="button"
                onClick={() => setStage(back)}
                className="-ml-3 w-11 h-11 shrink-0 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : null}
            <div
              className="flex-1 flex gap-1.5"
              role="progressbar"
              aria-label="Progress"
              aria-valuemin={1}
              aria-valuemax={ORDER.length}
              aria-valuenow={at + 1}
              aria-valuetext={questions ? `Question ${at + 1} of 4` : stage === 'result' ? 'Your result' : 'Your details'}
            >
              {ORDER.map((st, i) => (
                <span key={st} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= at ? 'bg-yellow-400' : 'bg-white/[0.08]'}`} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-yellow-400/[0.03] rounded-full blur-[80px] pointer-events-none" />

        <div className="relative px-5 pt-5 sm:px-8 overflow-y-auto flex-1 min-h-0" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
          {leaving ? (
            <div className="mb-5 p-3.5 rounded-xl bg-yellow-400/[0.06] border border-yellow-400/30" role="alertdialog" aria-labelledby="si-exit-leave">
              <p id="si-exit-leave" className="text-sm font-semibold text-white">
                Leave? Your details will be lost.
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setLeaving(false)}
                  autoFocus
                  className="min-h-11 px-5 rounded-xl bg-yellow-400 text-black font-bold text-[13px] hover:bg-yellow-300 transition-colors"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={() => close('scrim')}
                  className="min-h-11 px-5 rounded-xl text-[13px] text-gray-400 border border-white/[0.08] hover:text-gray-300 hover:border-white/[0.15] transition-all duration-200"
                >
                  Leave
                </button>
              </div>
            </div>
          ) : null}

          {body}

          {questions ? (
            <div className="exit-intent-el exit-intent-el-5 flex items-center gap-2 mt-1 mb-1 flex-wrap">
              {trust.map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <Icon className={`w-3 h-3 ${color}`} aria-hidden="true" />
                  <span className="text-[10px] text-gray-400 font-medium">{label}</span>
                </div>
              ))}
            </div>
          ) : null}

          {stage !== 'done' && stage !== 'ask' ? (
            <div className="exit-intent-el exit-intent-el-6 flex items-center gap-2.5 mt-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  funnel('quiz_answered', { door: 'exit-quiz', step: 'whatsapp', at: stage, flow_id: fid });
                  close('whatsapp');
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-11 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
                <span className="text-[13px]">WhatsApp us instead</span>
              </a>
              <button
                type="button"
                onClick={() => close('no_thanks')}
                className="px-5 py-3 min-h-11 rounded-xl text-[13px] text-gray-400 border border-white/[0.08] hover:text-gray-300 hover:border-white/[0.15] transition-all duration-200"
              >
                Maybe later
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
