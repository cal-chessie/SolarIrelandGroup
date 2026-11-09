'use client';

/**
 * /book-survey is the call ask (12/10 brief, 9 Nov 2026).
 *
 * The URL stays: live estimate emails link here with ?lt=, the homeowner's
 * own magic link. The page sells one thing, the free 15-minute call. No date
 * or time picker, no survey slot, no Eircode. The 45-minute or remote survey
 * is sold on the call and inside AISolar.
 *
 *  - Cold: the shared ask (CallAsk), name, mobile, email, optional best time.
 *  - ?lt= with full details on file: "Is this you?" and one button.
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
import { CallAsk, CallDone, EMPTY_CALL, type CallDetails } from '@/components/intake/CallAsk';
import { getConfig } from '@/components/intake/api';
import type { IntakeConfig, Segment } from '@/lib/intake/contract';
import { isEmail, isPhone } from '@/lib/intake/format';
import { SOLAR_DATA } from '@/lib/solar-data';
import '@/components/intake/intake.css';

const PHONE = SOLAR_DATA.provider.phone;
const PHONE_HREF = `tel:${PHONE.replace(/\s+/g, '')}`;
const LT = /^[A-Za-z0-9_-]{32,128}$/;

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
  const token = lt && LT.test(lt) ? lt : null;
  const [link, setLink] = useState<Link>(token ? { state: 'loading' } : { state: 'none' });
  const [segment, setSegment] = useState<Segment>(startSegment);
  const [details, setDetails] = useState<CallDetails>(EMPTY_CALL);
  const [config, setConfig] = useState<IntakeConfig | null>(null);
  const [sent, setSent] = useState<CallDetails | null>(null);
  const [fid, setFid] = useState('');
  const [online, setOnline] = useState(true);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const who = config?.survey.homeownerFacingName ?? null;

  useEffect(() => {
    setFid(flowId());
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

  /* The magic link: fetch the prefill server side (the token is the auth). */
  useEffect(() => {
    if (!token) return;
    let alive = true;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    fetch(`/api/survey-context?lt=${encodeURIComponent(token)}`, { signal: ctrl.signal, cache: 'no-store' })
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

  const ctx = link.state === 'ready' ? link.ctx : null;
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
        <button key={v} type="button" className="si-chip si-chip--name" aria-pressed={segment === v} onClick={() => setSegment(v)}>
          {t}
        </button>
      ))}
    </div>
  );

  let card;
  if (sent) {
    card = (
      <CallDone
        details={sent}
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
  } else {
    card = (
      <>
        {segmentPick}
        <CallAsk
          idPrefix="si-bs"
          details={details}
          onDetails={(p) => setDetails((d) => ({ ...d, ...p }))}
          who={who}
          online={online}
          confirm={confirm}
          cta="Book my free 15-minute call"
          heading={confirm ? 'Is this you?' : link.state === 'ready' ? 'Check your details' : 'Who should we ring?'}
          headingLevel="h2"
          sub={confirm ? 'One tap and the call is booked. Say when suits best, if you like.' : undefined}
          ctx={{
            segment,
            door: 'book-survey',
            src,
            pkg: null,
            countyContext: null,
            flowId: fid,
            monthlyBill: ctx?.monthlyBill ?? null,
            annualKwh: null,
            billPeriod: null,
            supplier: null,
            quoteToken: null,
            billRead: null,
            carry: null,
            linkToken: token,
          }}
          onSent={(_res, d) => setSent(d)}
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
              <p className="si-an-kicker">Free 15-minute call</p>
              <h1 id="si-bs-h1" className="si-callpage__h1">
                Book your free 15-minute call
              </h1>
              <p className="si-callpage__sub">
                A phone call with {name}, not a visit. We go through your electricity bill and what solar would save you, and answer anything about the SEAI grant. No obligation.
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
            <section className="si-an-card si-callpage__card" aria-label="Book the call">
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
