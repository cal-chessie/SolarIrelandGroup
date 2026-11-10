'use client';

/**
 * /book-survey is the call ask (12/10 brief, 9 Nov 2026).
 *
 * The URL stays: live estimate emails link here with ?lt=, the homeowner's
 * own magic link. The page sells one thing, the free 15-minute call. No date
 * or time picker, no survey slot, no Eircode. The 45-minute or remote survey
 * is sold on the call and inside AISolar.
 *
 *  - Cold: one bill question first (the same chips as the exit quiz and the
 *    intake, home or business), priced through /api/intake/quote so the
 *    request carries a quote token and AISolar emails a real estimate. Then
 *    the shared ask (CallAsk). Skipping the bill is fine: the ask then
 *    promises a call, never an estimate (H2, 9 Nov review).
 *  - ?lt= with full details on file: "Is this you?" and one button. A bill on
 *    file is priced silently; no bill on file asks the one question first.
 *  - ?lt= with something missing: the form, prefilled with what is on file.
 *  - A device that already asked: "Cal is ringing you today" (inside CallAsk).
 *
 * Every submit goes through /api/intake/submit as intent "call" with the
 * magic link threaded, so a return visit never makes a second lead.
 */
import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Phone } from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import { askHeadline, CallAsk, CallDone, CallRemembered, EMPTY_CALL, forgetCall, readCallMemory, type CallDetails, type CallMemory } from '@/components/intake/CallAsk';
import { getConfig, getQuotes, monthlyBillItem } from '@/components/intake/api';
import type { IntakeConfig, Quote, Segment } from '@/lib/intake/contract';
import { eur, isEmail, isPhone } from '@/lib/intake/format';
import { funnel } from '@/lib/intake/funnel';
import { stripSensitiveParams } from '@/lib/privacyUrl';
import { SOLAR_DATA } from '@/lib/solar-data';
import { parseLinkToken } from '@/lib/intake/linkToken';
import '@/components/intake/intake.css';

const PHONE = SOLAR_DATA.provider.phone;
const PHONE_HREF = `tel:${PHONE.replace(/\s+/g, '')}`;
const FALLBACK_CHIPS = { domestic: [80, 120, 160, 220, 300], commercial: [300, 600, 1000, 2000, 4000] };

/** The bill question's answer: a tapped amount, or skipped (the call works it out). */
type Bill = { amount: number; orMore: boolean; from: 'chip' | 'link' } | 'skipped' | null;

function flowId(): string {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

interface LinkContext {
  ok: boolean;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  eircode?: string | null;
  address?: string | null;
  monthlyBill?: number | null;
  segment?: 'domestic' | 'commercial' | null;
}

type Link = { state: 'none' } | { state: 'loading' } | { state: 'ready'; full: boolean; ctx: LinkContext } | { state: 'failed' };

export default function BookSurveyClient({ lt, segment: startSegment, src }: { lt: string | null; segment: Segment; src: string | null }) {
  // Only the 64-hex token AISolar mints: anything else is the cold form, never a card that fails on every tap.
  const token = parseLinkToken(lt);
  const [link, setLink] = useState<Link>(token ? { state: 'loading' } : { state: 'none' });
  const [segment, setSegment] = useState<Segment>(startSegment);
  const [details, setDetails] = useState<CallDetails>(EMPTY_CALL);
  const [config, setConfig] = useState<IntakeConfig | null>(null);
  const [sent, setSent] = useState<{ d: CallDetails; held: boolean; estimate: boolean } | null>(null);
  const [bill, setBill] = useState<Bill>(null);
  // This device already asked: "ringing you today", never the bill question again.
  const [memory, setMemory] = useState<CallMemory | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [pricing, setPricing] = useState(false);
  const billHeadRef = useRef<HTMLHeadingElement>(null);
  const askHeadRef = useRef<HTMLHeadingElement>(null);
  const priceSeq = useRef(0);
  const [fid, setFid] = useState('');
  const [online, setOnline] = useState(true);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const who = config?.survey.homeownerFacingName ?? null;

  useEffect(() => {
    setFid(flowId());
    setMemory(readCallMemory());
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    let alive = true;
    getConfig().then((c) => alive && c && setConfig(c));
    return () => {
      alive = false;
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  /* The magic link leaves the address bar at once (M6): never in history, a bookmark, a screenshot or analytics. */
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('lt')) return;
    window.history.replaceState(window.history.state, '', stripSensitiveParams(url.href));
  }, []);

  /* The magic link: fetch the prefill server side by POST (the token is the auth). */
  useEffect(() => {
    if (!token) return;
    let alive = true;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    fetch('/api/survey-context', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lt: token }),
      signal: ctrl.signal,
      cache: 'no-store',
    })
      .then((r) => r.json())
      .catch(() => null)
      .then((d: LinkContext | null) => {
        if (!alive) return;
        if (!d || !d.ok) return setLink({ state: 'failed' });
        setDetails((x) => ({
          ...x,
          name: d.name?.trim() || x.name,
          mobile: d.phone?.trim() || x.mobile,
          email: d.email?.trim() || x.email,
        }));
        if (d.segment === 'commercial') setSegment('commercial');
        const full = !!d.name && d.name.trim().length >= 2 && !!d.phone && isPhone(d.phone) && !!d.email && isEmail(d.email);
        setLink({ state: 'ready', full, ctx: d });
      })
      .finally(() => clearTimeout(t));
    return () => {
      alive = false;
      ctrl.abort();
      clearTimeout(t);
    };
  }, [token]);

  useEffect(() => {
    if (sent) doneRef.current?.focus({ preventScroll: false });
  }, [sent]);

  /** Price the bill through the one engine (/api/intake/quote); the token is what makes AISolar email the estimate. */
  const price = (seg: Segment, amount: number) => {
    const seq = ++priceSeq.current;
    setPricing(true);
    setQuote(null);
    getQuotes([monthlyBillItem(seg, amount)]).then((r) => {
      if (seq !== priceSeq.current) return;
      setPricing(false);
      setQuote(r && r[0]?.quoteToken ? r[0] : null);
    });
  };

  /* A bill on file from the magic link: priced quietly, no question asked. */
  const linkBill = link.state === 'ready' ? link.ctx.monthlyBill ?? null : null;
  useEffect(() => {
    if (linkBill == null || !(linkBill > 0) || bill !== null) return;
    setBill({ amount: Math.round(linkBill), orMore: false, from: 'link' });
    price(segment, linkBill);
    // segment is read once here; a later switch re-asks the bill (pickSegment).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkBill]);

  const pickSegment = (v: Segment) => {
    if (v === segment) return;
    setSegment(v);
    // Home and business chips differ: a bill tapped for one is not an answer for the other.
    if (bill !== null && bill !== 'skipped') {
      priceSeq.current += 1;
      setBill(null);
      setQuote(null);
      setPricing(false);
    }
  };

  const answerBill = (b: Bill) => {
    setBill(b);
    if (b && b !== 'skipped') price(segment, b.amount);
    else {
      priceSeq.current += 1;
      setQuote(null);
      setPricing(false);
    }
    if (b === null) {
      setTimeout(() => billHeadRef.current?.focus({ preventScroll: true }), 30);
      return;
    }
    funnel('quiz_answered', { door: 'book-survey', step: 'bill', value: b === 'skipped' ? 'skipped' : 'given', flow_id: fid });
    setTimeout(() => askHeadRef.current?.focus({ preventScroll: true }), 30);
  };

  const confirm = link.state === 'ready' && link.full;
  const name = who || 'Solar Ireland';

  const segmentPick = (
    <div className="si-callpage__seg" role="group" aria-label="Who the call is for">
      {(
        [
          ['domestic', 'My home'],
          ['commercial', 'My business'],
        ] as const
      ).map(([v, t]) => (
        <button key={v} type="button" className="si-chip si-chip--name" aria-pressed={segment === v} onClick={() => pickSegment(v)}>
          {t}
        </button>
      ))}
    </div>
  );

  let card;
  if (sent) {
    card = (
      <CallDone
        details={sent.d}
        held={sent.held}
        estimate={sent.estimate}
        who={who}
        headingRef={doneRef}
        headingLevel="h2"
        footer={
          <p className="si-callpage__more">
            <a className="si-btn--quiet" href="/solar-calculator">
              Want your figures before the call? Read my bill <ChevronRight size={16} aria-hidden="true" />
            </a>
          </p>
        }
      />
    );
  } else if (link.state === 'loading') {
    card = (
      <div className="si-callpage__finding" role="status" aria-live="polite">
        <span className="si-callpage__pulse" aria-hidden="true" />
        Finding your details
      </div>
    );
  } else if (memory && !token) {
    card = (
      <CallRemembered
        memory={memory}
        who={who}
        headingLevel="h2"
        onAnother={() => {
          forgetCall();
          setMemory(null);
        }}
      />
    );
  } else if (bill === null) {
    const chips = (config?.bill.chips ?? FALLBACK_CHIPS)[segment];
    card = (
      <>
        {segmentPick}
        <div className="si-callpage__bill" data-bill-question="">
          <h2 className="si-ask__title" ref={billHeadRef} tabIndex={-1}>
            Roughly what&apos;s your electricity bill a month?
          </h2>
          <p className="si-ask__sub">One tap. It turns into your full estimate, sent by email, before {name} rings you.</p>
          <div className="si-exit__chips" role="group" aria-label="Your monthly electricity bill">
            {chips.map((a, i) => {
              const orMore = i === chips.length - 1;
              return (
                <button key={a} type="button" className="si-chip si-chip--name" onClick={() => answerBill({ amount: a, orMore, from: 'chip' })}>
                  {eur(a)}
                  {orMore ? '+' : ''}
                </button>
              );
            })}
          </div>
          <button type="button" className="si-btn--quiet si-callpage__skip" onClick={() => answerBill('skipped')}>
            Not sure? Skip this and {who || 'we'} will work it out with you on the call
          </button>
        </div>
      </>
    );
  } else if (pricing) {
    card = (
      <div className="si-callpage__finding" role="status" aria-live="polite">
        <span className="si-callpage__pulse" aria-hidden="true" />
        Working out your estimate
      </div>
    );
  } else {
    const priced = bill !== 'skipped' && quote?.figures ? { amount: bill.amount, saving: quote.figures.annualSavingEur } : null;
    card = (
      <>
        {segmentPick}
        {bill !== 'skipped' && bill.from === 'chip' ? (
          <p className="si-callpage__billset">
            Bill: about {eur(bill.amount)}
            {bill.orMore ? '+' : ''} a month.{' '}
            <button type="button" className="si-btn--quiet" onClick={() => answerBill(null)}>
              Change
            </button>
          </p>
        ) : null}
        <CallAsk
          idPrefix="si-bs"
          details={details}
          onDetails={(p) => setDetails((d) => ({ ...d, ...p }))}
          who={who}
          online={online}
          confirm={confirm}
          cta="Send my full estimate"
          heading={confirm ? 'Is this you?' : link.state === 'ready' ? 'Check your details' : askHeadline({ estimate: !!quote }).heading}
          headingLevel="h2"
          headingRef={askHeadRef}
          sub={
            confirm
              ? quote
                ? 'One tap and your full estimate is on its way. Say when suits best for the call, if you like.'
                : `One tap and ${who || 'we'} will ring you today. Say when suits best, if you like.`
              : priced
                ? `On about ${eur(priced.amount)} a month, solar could save you around ${eur(priced.saving)} a year. ${askHeadline({ estimate: true }).sub}`
                : askHeadline({ estimate: !!quote }).sub
          }
          ctx={{
            segment,
            door: 'book-survey',
            road: 'book-survey',
            src,
            pkg: null,
            countyContext: null,
            flowId: fid,
            monthlyBill: bill && bill !== 'skipped' ? bill.amount : null,
            annualKwh: null,
            billPeriod: bill && bill !== 'skipped' ? 'month' : null,
            supplier: null,
            // The priced bill: AISolar emails the estimate only when this rides with the call.
            quoteToken: quote?.quoteToken ?? null,
            billRead: null,
            carry: null,
            // Thread only onto a link that resolved: a dead or expired link sends as a fresh call.
            linkToken: link.state === 'ready' ? token : null,
          }}
          onSent={(res, d, s) => setSent({ d, held: !!res.fallback, estimate: s.estimate })}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="si-analyser si-an--section si-callpage">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto si-callpage__lanes">
            <section className="si-callpage__intro" aria-labelledby="si-bs-h1">
              <p className="si-an-kicker">Free estimate and call</p>
              <h1 id="si-bs-h1" className="si-callpage__h1">
                Get your full solar estimate
              </h1>
              <p className="si-callpage__sub">
                Tell us roughly what your electricity bill is and we email your full estimate. Then {name} rings you for a free 15-minute call, not a visit, to go through it and answer anything about the SEAI grant. No obligation.
              </p>
            </section>
            <section className="si-callpage__more-lane" aria-label="What happens on the call">
              <p className="si-group-label">On the call we&apos;ll</p>
              <ul className="si-done-call__list">
                <li>Go through your figures with you</li>
                <li>Answer anything you want to ask about solar and the SEAI grant</li>
                <li>Agree the next step with you, if you want one</li>
              </ul>
              <div className="si-callpage__alt">
                <a className="si-btn--quiet" href="/solar-calculator">
                  Want your figures first? Read my bill <ChevronRight size={16} aria-hidden="true" />
                </a>
                <a className="si-btn--quiet" href={PHONE_HREF}>
                  <Phone size={14} aria-hidden="true" /> Rather ring now? {PHONE}
                </a>
              </div>
            </section>
            <section className="si-an-card si-callpage__card" aria-label="Your estimate and call">
              {card}
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
}
