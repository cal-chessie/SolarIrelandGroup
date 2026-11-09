'use client';

/**
 * Cal's Bill Analyser, rebuilt for the call funnel (4 Nov 2026).
 *
 * Road 1 of two. Upload a bill, we read it, we show what it says, one thing
 * they did not know, one saving (AISolar's figure, the same quote the manual
 * side shows), then name, mobile, email and "Send my full estimate". Built to
 * INTAKE/design/analyser-cro-spec.md under CALL-FUNNEL-PLAN.md (and Cal's
 * answers there, which win), in the Apple intake's visual language.
 *
 * The rules this file keeps:
 *   - Every figure on screen is read off the bill (and says so), worked out
 *     from the bill (and says so), or from AISolar's quote. Nothing else.
 *   - The reveal and the saving are never gated. Nothing is asked first.
 *   - Every failure has its own words and lands on the manual side carrying
 *     whatever was read. No dead ends, no grey button without a reason.
 *   - No Eircode field. An Eircode read off the bill rides on the call.
 *   - CSS keyframes only (src/lib/motion.tsx ignores object animates), off
 *     under reduced motion.
 */
import '@/components/intake/intake.css';
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { Camera, ChevronRight, FileText, Info, RotateCcw, Upload } from 'lucide-react';
import type { AnalyserFailure, AnalyserRead, AnalyserResponse, CallBillRead, IntakeConfig, Quote, QuoteRequestItem, Segment, SubmitResponse } from '@/lib/intake/contract';
import { cents, eur, kwp, num, years } from '@/lib/intake/format';
import { intakeHref, openIntake } from '@/lib/intake/open';
import { trackEvent } from '@/lib/analytics';
import { funnel } from '@/lib/intake/funnel';
import { SOLAR_DATA } from '@/lib/solar-data';
import { getConfig, getQuotes } from '@/components/intake/api';
import { CallAsk, CallDone, EMPTY_CALL, type CallDetails } from '@/components/intake/CallAsk';
import { Spinner } from '@/components/intake/ui';
import { CARRY_KEY, type AnalyserCarry } from '@/components/intake/carry';
import type { BillRead } from '@/lib/analyser/read';

type Phase = 'door' | 'tips' | 'reading' | 'reveal' | 'failed' | 'done';
type Failure = { reason: AnalyserFailure; partial: Partial<AnalyserRead> | null };

const MAX_BYTES = 5 * 1024 * 1024;
const TIPS_KEY = 'si-camera-tips-seen';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function track(event: string, properties: Record<string, string | number | boolean | null | undefined> = {}) {
  try {
    trackEvent({ event, properties });
  } catch {
    /* analytics never breaks the analyser */
  }
}

function flowId(): string {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

/** "12 Aug to 10 Oct 2026" from two ISO days. */
function periodLabel(a: string | null, b: string | null): string | null {
  if (!a || !b) return null;
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return `${da} ${MONTHS[ma - 1]}${ya !== yb ? ` ${ya}` : ''} to ${db} ${MONTHS[mb - 1]} ${yb}`;
}

/** Shrink a phone photo before it leaves the phone: longest edge 2000 px, JPEG 0.85. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1_500_000 && file.type !== 'image/heic' && file.type !== 'image/heif') {
      bmp.close();
      return file;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    if (!blob || blob.size >= file.size) return file;
    track('upload_shrunk', { before: file.size, after: blob.size });
    return new File([blob], 'bill.jpg', { type: 'image/jpeg' });
  } catch {
    // HEIC on a browser that cannot decode it: send it as it is.
    return file;
  }
}

/** Upload with real progress (fetch cannot report it). */
function upload(file: File, onProgress: (p: number) => void, onSent: () => void): Promise<{ status: number; data: AnalyserResponse | null }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/analyse-bill');
    xhr.timeout = 55_000;
    xhr.responseType = 'json';
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.upload.onload = () => onSent();
    xhr.onload = () => resolve({ status: xhr.status, data: (xhr.response as AnalyserResponse | null) ?? null });
    xhr.onerror = () => resolve({ status: 0, data: null });
    xhr.ontimeout = () => resolve({ status: 504, data: { ok: false, reason: 'timeout' } });
    const form = new FormData();
    form.append('bill', file);
    xhr.send(form);
  });
}

const FAIL_COPY: Record<AnalyserFailure, { title: string; line: string }> = {
  offline: { title: 'Our bill reader is having a rest.', line: 'Three quick questions get you the same estimate.' },
  unreadable: { title: "We couldn't read that one clearly.", line: 'It happens with photos taken at an angle or in low light.' },
  not_bill: { title: "That doesn't look like an electricity bill.", line: "We need the one with your units (kWh) on it. Gas bills won't work." },
  too_big: { title: 'That file is too big for us.', line: 'A photo, a screenshot or a PDF under 5 MB works.' },
  wrong_type: { title: "We can't open that type of file.", line: 'A photo, a screenshot or a PDF works.' },
  timeout: { title: 'This is taking longer than it should.', line: 'Your bill may be very long. Try a photo of just the page with your units.' },
  rate_limited: { title: 'Give us a minute.', line: "You've sent a few bills quickly. Try again shortly, or answer 3 questions now." },
};

export default function BillAnalyser({ variant = 'section', door = 'analyser', intro }: { variant?: 'hero' | 'section'; door?: string; intro?: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('door');
  const [segment, setSegment] = useState<Segment>('domestic');
  const [config, setConfig] = useState<IntakeConfig | null>(null);
  const [preview, setPreview] = useState<{ url: string | null; pdf: boolean } | null>(null);
  const [stage, setStage] = useState<'sending' | 'reading' | 'still'>('sending');
  const [progress, setProgress] = useState(0);
  const [read, setRead] = useState<BillRead | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [perPick, setPerPick] = useState<'month' | 'two_months' | null>(null);
  const [kwhEdit, setKwhEdit] = useState<{ open: boolean; text: string; value: number | null; error: string | null }>({ open: false, text: '', value: null, error: null });
  const [amountEdit, setAmountEdit] = useState<{ open: boolean; text: string; value: number | null; error: string | null }>({ open: false, text: '', value: null, error: null });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [details, setDetails] = useState<CallDetails>(EMPTY_CALL);
  const [announce, setAnnounce] = useState('');
  const [online, setOnline] = useState(true);
  const [stickyOn, setStickyOn] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fid, setFid] = useState('');

  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const askRef = useRef<HTMLDivElement>(null);
  const savingRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0);
  const lastFile = useRef<File | null>(null);
  const viewed = useRef(false);

  const who = config?.survey.homeownerFacingName ?? null;

  useEffect(() => {
    setFid(flowId());
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    let alive = true;
    getConfig().then((c) => {
      if (alive && c) setConfig(c);
    });
    return () => {
      alive = false;
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  /* Seen: one event, the first time the analyser is on screen. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting) && !viewed.current) {
        viewed.current = true;
        track('analyser_view', { variant, door });
        funnel('analyser_viewed', { door, variant });
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [variant, door]);

  /* While reading, revealing or asking on a phone, the chat bee and sticky bar step aside. */
  useEffect(() => {
    const active = phase !== 'door';
    if (active) document.body.dataset.analyserActive = '1';
    else delete document.body.dataset.analyserActive;
    return () => {
      delete document.body.dataset.analyserActive;
    };
  }, [phase]);

  /* Each new stage: focus its heading and bring it into view. */
  useEffect(() => {
    if (phase === 'door') return;
    const t = setTimeout(() => {
      const h = headRef.current;
      h?.focus({ preventScroll: true });
      // Bring the whole card into view under the site's fixed bar.
      const box = rootRef.current;
      if (!box) return;
      const top = box.getBoundingClientRect().top;
      if (top < 64 || top > window.innerHeight * 0.5) window.scrollTo({ top: window.scrollY + top - 84, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }, 40);
    return () => clearTimeout(t);
  }, [phase]);

  /* The reading stages are real: sending while the bytes go, reading after, "still" at 12 s. */
  useEffect(() => {
    if (phase !== 'reading' || stage !== 'reading') return;
    const t = setTimeout(() => setStage('still'), 12_000);
    return () => clearTimeout(t);
  }, [phase, stage]);

  /* ── The bill as the quote needs it ─────────────────────────── */

  const seg: Segment = read?.segment ?? segment;
  const isBiz = seg === 'commercial';
  const period = read?.period ?? perPick;
  const amount = amountEdit.value ?? read?.amountEur ?? null;
  const annualKwh = kwhEdit.value ?? read?.annualKwh ?? null;
  // Day, night and (on a smart bill) peak units, as printed. Peak units are
  // evening units on the day side of the meter, so the quote counts them as day.
  const split = useMemo(
    () => (read && read.dayKwh !== null && read.nightKwh !== null && read.dayKwh + read.nightKwh + (read.peakKwh ?? 0) > 0 ? { day: read.dayKwh, night: read.nightKwh, peak: read.peakKwh ?? 0 } : null),
    [read],
  );
  const splitTotal = split ? split.day + split.night + split.peak : 0;
  const dayPct = split ? Math.round((split.day / splitTotal) * 100) : null;
  const peakPct = split && split.peak > 0 ? Math.round((split.peak / splitTotal) * 100) : null;
  const nightPct = split && dayPct !== null ? 100 - dayPct - (peakPct ?? 0) : null;
  const knownSupplier = useMemo(() => {
    const s = read?.supplier;
    if (!s || !config) return null;
    const plain = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    return config.estimate.suppliers.find((x) => plain(s).includes(plain(x.name)) || plain(x.name).includes(plain(s)))?.name ?? null;
  }, [read?.supplier, config]);

  const qItem: QuoteRequestItem | null = useMemo(() => {
    if (!read) return null;
    const bill = amount !== null && period ? { amountEur: amount, period } : null;
    if (!bill && annualKwh === null) return null;
    // The split goes as yearly units, in the proportion the bill shows.
    let dayA: number | undefined;
    let nightA: number | undefined;
    if (split) {
      const base = annualKwh ?? (read.days ? (splitTotal * 365) / read.days : null);
      if (base) {
        dayA = Math.round((base * (split.day + split.peak)) / splitTotal);
        nightA = Math.round(base - dayA);
      }
    }
    return {
      segment: seg,
      bill,
      annualKwh,
      supplier: seg === 'domestic' ? knownSupplier : null,
      homeType: 'unknown',
      billRead: {
        unitRateEur: read.unitRateEur ?? undefined,
        standingChargeAnnualEur: read.standingChargeAnnualEur ?? undefined,
        dayKwh: dayA,
        nightKwh: nightA,
      },
    };
  }, [read, amount, period, annualKwh, split, splitTotal, seg, knownSupplier]);
  const qKey = qItem ? JSON.stringify(qItem) : null;

  useEffect(() => {
    if (!qItem) {
      setQuote(null);
      setQuoteStatus('idle');
      return;
    }
    let alive = true;
    setQuoteStatus('loading');
    getQuotes([qItem]).then((r) => {
      if (!alive) return;
      if (r && r[0]) {
        setQuote(r[0]);
        setQuoteStatus('ready');
        if (r[0].figures) setAnnounce(`What solar could save you: about ${eur(r[0].figures.annualSavingEur)} a year`);
        track('saving_view', { segment: seg, flow_id: fid });
      } else {
        setQuote(null);
        setQuoteStatus('error');
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qKey]);

  /* Phones: the sticky "Send my full estimate" shows once the saving is seen and the ask is not. */
  useEffect(() => {
    if (phase !== 'reveal' || typeof IntersectionObserver === 'undefined') {
      setStickyOn(false);
      return;
    }
    let seen = false;
    let askIn = false;
    const update = () => setStickyOn(seen && !askIn && window.innerWidth < 1024);
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        if (e.target === savingRef.current && e.isIntersecting) seen = true;
        if (e.target === askRef.current) askIn = e.isIntersecting;
      }
      update();
    });
    if (savingRef.current) io.observe(savingRef.current);
    if (askRef.current) io.observe(askRef.current);
    return () => io.disconnect();
  }, [phase, quoteStatus]);

  /* ── Actions ───────────────────────────────────────────────── */

  const reset = useCallback(() => {
    runRef.current += 1;
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setRead(null);
    setFailure(null);
    setPerPick(null);
    setKwhEdit({ open: false, text: '', value: null, error: null });
    setAmountEdit({ open: false, text: '', value: null, error: null });
    setQuote(null);
    setQuoteStatus('idle');
    setPhase('door');
  }, [preview]);

  const fail = (reason: AnalyserFailure, partial: Partial<AnalyserRead> | null = null) => {
    setFailure({ reason, partial });
    setPhase('failed');
    setAnnounce(FAIL_COPY[reason].title);
    track('read_fail', { reason, flow_id: fid });
    funnel('read_fail', { door, reason, flow_id: fid });
  };

  const onFile = async (raw: File | undefined, method: 'camera' | 'file' | 'drop') => {
    if (!raw) return;
    const run = (runRef.current += 1);
    track('upload_start', { method, segment, flow_id: fid });
    funnel('upload_started', { door, method, segment, flow_id: fid });
    // The exit quiz never interrupts someone who has started on their bill.
    try {
      sessionStorage.setItem('si_analyser_started', '1');
    } catch {
      /* private mode */
    }
    const okType = /^image\//.test(raw.type) || raw.type === 'application/pdf' || /\.(pdf|jpe?g|png|webp|heic|heif)$/i.test(raw.name);
    if (!okType) return fail('wrong_type');
    const file = await shrink(raw);
    if (run !== runRef.current) return;
    if (file.size > MAX_BYTES) return fail('too_big');
    lastFile.current = file;
    const pdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview({ url: pdf ? null : URL.createObjectURL(file), pdf });
    setProgress(0);
    setStage('sending');
    setPhase('reading');
    setAnnounce('Reading your bill');
    const started = Date.now();
    const r = await upload(file, (p) => run === runRef.current && setProgress(p), () => run === runRef.current && setStage('reading'));
    if (run !== runRef.current) return;
    const d = r.data;
    if (r.status === 0 || !d) return fail('offline');
    if (!d.ok) return fail(d.reason, d.partial ?? null);
    // The peak line rides beside the contract's fields; an older reader may not send it.
    const extra = d.read as Partial<BillRead>;
    const rd: BillRead = { ...d.read, peakRateEur: extra.peakRateEur ?? null, peakKwh: extra.peakKwh ?? null };
    setRead(rd);
    if (rd.segment) setSegment(rd.segment);
    if (rd.accountName && !details.name) setDetails((x) => ({ ...x, name: rd.accountName ?? '' }));
    setPhase('reveal');
    setAnnounce("Here's what your bill says");
    track('read_ok', {
      fields_read: Object.values(rd).filter((v) => v !== null).length,
      has_split: rd.dayKwh !== null && rd.nightKwh !== null,
      has_eircode: !!rd.eircode,
      ms: Date.now() - started,
      flow_id: fid,
    });
    track('reveal_view', { flow_id: fid });
    funnel('read_ok', { door, has_split: rd.dayKwh !== null && rd.nightKwh !== null, flow_id: fid });
  };

  const openCamera = () => {
    let seen = false;
    try {
      seen = localStorage.getItem(TIPS_KEY) === '1';
    } catch {
      seen = true;
    }
    if (!seen) {
      setPhase('tips');
      return;
    }
    cameraRef.current?.click();
  };

  const tipsGo = () => {
    try {
      localStorage.setItem(TIPS_KEY, '1');
    } catch {
      /* remembered for this visit only */
    }
    setPhase('door');
    cameraRef.current?.click();
  };

  /** To the manual side (Road 2), carrying everything read so far. Personal fields travel in this tab's storage, never the URL. */
  const toManual = (why: string) => {
    const p = (read ?? failure?.partial ?? null) as Partial<AnalyserRead> | null;
    const carry: AnalyserCarry = { v: 1, from: why, segment: p?.segment ?? segment, read: p, at: Date.now() };
    try {
      sessionStorage.setItem(CARRY_KEY, JSON.stringify(carry));
    } catch {
      /* the manual side still works, it just starts empty */
    }
    track('manual_fallback', { from_reason: why, carried: !!p, flow_id: fid });
    const per = p?.period === 'two_months' ? '2months' : 'month';
    const bill = p?.amountEur && p?.period ? p.amountEur : null;
    openIntake({ door: `analyser-${why}`, segment: (p?.segment ?? segment) === 'commercial' ? 'business' : 'home', step: bill ? 'time' : 'bill', bill, per });
  };

  const onSent = (_res: SubmitResponse, d: CallDetails) => {
    setDetails(d);
    setPhase('done');
    setAnnounce('Your full estimate is on its way.');
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void onFile(e.dataTransfer.files?.[0], 'drop');
  };

  /* ── Pieces ─────────────────────────────────────────────────── */

  const prov = (p: string) => ({ 'data-figure': '', 'data-prov': p });
  const tag = (t: 'bill' | 'worked' | 'none') => (
    <span className="si-tag" data-an-tag={t}>
      {t === 'bill' ? 'from your bill' : t === 'worked' ? 'worked out from this bill' : 'not on this bill'}
    </span>
  );

  const inputs = (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="si-sr"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          void onFile(f, 'camera');
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="si-sr"
        tabIndex={-1}
        aria-hidden="true"
        data-an-file=""
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          void onFile(f, 'file');
        }}
      />
    </>
  );

  const privacy = (
    <p className="si-an-privacy">
      This site doesn&apos;t store your bill. An AI reading service reads it and sends back the figures. We keep those figures with no name or address on them. Your name, Eircode and MPRN only reach us if you book the call.{' '}
      <a className="si-inline" href="/privacy#how-we-use">
        How we handle your bill
      </a>
    </p>
  );

  const doorCard = (
    <div className="si-an-card si-an-door" data-dragging={dragging ? 'true' : undefined} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
      <p className="si-an-kicker">{isBiz ? 'Bill Analyser, for a business' : 'Bill Analyser'}</p>
      <h2 className="si-an-door__title">{isBiz ? 'Show us the business bill. We will show you what it says.' : "Show us your bill. We'll show you what it says."}</h2>
      <p className="si-an-door__sub">Photo, screenshot or the PDF from your supplier&apos;s email. You see your figures straight away, with nothing to sign up for.</p>
      <div className="si-an-door__drop" aria-hidden="true">
        <Upload size={22} />
        <span>Drop your bill here, or choose a file</span>
      </div>
      <div className="si-an-door__actions">
        <button type="button" className="si-btn si-btn--primary si-an-phone" onClick={openCamera} data-an-camera="">
          <Camera size={18} aria-hidden="true" /> Take a photo of my bill
        </button>
        <button type="button" className="si-btn si-btn--secondary si-an-phone" onClick={() => fileRef.current?.click()} data-an-choose="">
          Choose a photo or PDF
        </button>
        <button type="button" className="si-btn si-btn--primary si-an-desk" onClick={() => fileRef.current?.click()} data-an-upload="">
          <Upload size={18} aria-hidden="true" /> Upload my bill
        </button>
      </div>
      <p className="si-an-help">Most bills come by email now. The PDF works best.</p>
      {privacy}
      <div className="si-an-links">
        <a
          className="si-btn--quiet"
          href={intakeHref({ door: `${door}-manual`, segment: isBiz ? 'business' : 'home', step: 'bill' })}
          onClick={(e) => {
            e.preventDefault();
            track('manual_fallback', { from_reason: 'no_bill', flow_id: fid });
            openIntake({ door: `${door}-manual`, segment: isBiz ? 'business' : 'home', step: 'bill' });
          }}
        >
          No bill to hand? Answer 3 quick questions <ChevronRight size={16} aria-hidden="true" />
        </a>
        <button type="button" className="si-btn--quiet" onClick={() => setSegment(isBiz ? 'domestic' : 'commercial')}>
          {isBiz ? 'A home bill? Read it as a home' : 'Business bill? Read it as a business'}
        </button>
      </div>
      {inputs}
    </div>
  );

  const tipsCard = (
    <div className="si-an-card si-an-tips">
      <h2 className="si-an-h" ref={headRef} tabIndex={-1}>
        Before you take the photo
      </h2>
      <ul className="si-an-tips__list">
        <li>Lay the bill flat.</li>
        <li>Fill the screen with the page that shows your units (kWh).</li>
        <li>Good light, no flash.</li>
      </ul>
      <div className="si-an-stack">
        <button type="button" className="si-btn si-btn--primary" onClick={tipsGo}>
          <Camera size={18} aria-hidden="true" /> Open camera
        </button>
        <button type="button" className="si-btn--quiet" onClick={() => setPhase('door')}>
          Not now
        </button>
      </div>
      {inputs}
    </div>
  );

  const readingCard = (
    <div className="si-an-card si-an-reading" role="status" aria-busy="true">
      <div className="si-an-thumb" aria-hidden="true">
        {preview?.url ? <img src={preview.url} alt="" /> : <FileText size={40} />}
        <span className="si-an-scan" />
      </div>
      <div className="si-an-reading__text">
        <h2 className="si-an-h" ref={headRef} tabIndex={-1}>
          {stage === 'sending' ? 'Sending your bill' : stage === 'still' ? 'Still reading' : 'Reading your bill'} <Spinner />
        </h2>
        <p className="si-an-line">
          {stage === 'sending'
            ? `Sent ${Math.round(progress * 100)}%`
            : stage === 'still'
              ? 'Bills with a lot on them take a little longer.'
              : 'Our AI is reading your bill. This takes a few seconds.'}
        </p>
        {stage === 'sending' ? (
          <span className="si-an-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
          </span>
        ) : null}
        <button type="button" className="si-btn--quiet" onClick={reset}>
          Wrong photo? Retake
        </button>
      </div>
    </div>
  );

  const failedCard = failure
    ? (() => {
        const c = FAIL_COPY[failure.reason];
        const carried = failure.partial && Object.keys(failure.partial).length ? failure.partial : null;
        const carriedWords = carried ? [carried.supplier ? 'your supplier' : null, carried.accountName ? 'your name' : null, carried.eircode ? 'your Eircode' : null].filter(Boolean) : [];
        const manualFirst = failure.reason === 'offline' || failure.reason === 'rate_limited';
        const answer = (
          <button type="button" className={`si-btn ${manualFirst ? 'si-btn--primary' : 'si-btn--secondary'}`} onClick={() => toManual(failure.reason)} data-an-manual="">
            Answer 3 questions
          </button>
        );
        const retry =
          failure.reason === 'rate_limited' ? null : failure.reason === 'unreadable' ? (
            <button type="button" className="si-btn si-btn--primary" onClick={() => { reset(); setTimeout(openCamera, 30); }} data-an-retry="">
              <RotateCcw size={18} aria-hidden="true" /> Retake the photo
            </button>
          ) : failure.reason === 'offline' ? (
            <button type="button" className="si-btn--quiet" onClick={() => { const f = lastFile.current; if (f) void onFile(f, 'file'); else reset(); }} data-an-retry="">
              Try your bill again
            </button>
          ) : (
            <button type="button" className="si-btn si-btn--primary" onClick={() => { reset(); setTimeout(() => fileRef.current?.click(), 30); }} data-an-retry="">
              {failure.reason === 'timeout' ? 'Try a photo' : failure.reason === 'not_bill' ? 'Try another' : 'Choose another'}
            </button>
          );
        return (
          <div className="si-an-card si-an-failed" data-reason={failure.reason}>
            <span className="si-an-failed__icon" aria-hidden="true">
              <Info size={22} />
            </span>
            <h2 className="si-an-h" ref={headRef} tabIndex={-1}>
              {c.title}
            </h2>
            <p className="si-an-line">{c.line}</p>
            {carriedWords.length ? <p className="si-an-line si-an-carried">We read {carriedWords.join(' and ')}, and we&apos;ll keep {carriedWords.length > 1 ? 'them' : 'it'} for you.</p> : null}
            <div className="si-an-stack">
              {manualFirst ? (
                <>
                  {answer}
                  {retry}
                </>
              ) : (
                <>
                  {retry}
                  {failure.reason === 'unreadable' ? (
                    <button type="button" className="si-btn si-btn--secondary" onClick={() => { reset(); setTimeout(() => fileRef.current?.click(), 30); }}>
                      Choose the PDF instead
                    </button>
                  ) : null}
                  {answer}
                </>
              )}
            </div>
            {inputs}
          </div>
        );
      })()
    : null;

  /* ── The reveal ───────────────────────────────────────────── */

  const figures = quote?.hasBasis ? quote.figures : null;

  const rows: { k: string; name: string; value: ReactNode; t: 'bill' | 'worked' | 'none'; extra?: ReactNode }[] = read
    ? [
        { k: 'supplier', name: 'Supplier', value: read.supplier ?? 'Not on this bill', t: read.supplier ? 'bill' : 'none' },
        {
          k: 'amount',
          name: 'This bill',
          value:
            amount !== null ? (
              <>
                <span {...prov(amountEdit.value !== null ? 'you_told_us' : 'from_your_bill')}>{eur(amount)}</span>
                {read.days ? ` for ${read.days} days` : period === 'month' ? ' for one month' : period === 'two_months' ? ' for two months' : ''}
              </>
            ) : (
              'Not on this bill'
            ),
          t: amountEdit.value !== null ? 'none' : amount !== null ? 'bill' : 'none',
        },
        {
          k: 'rate',
          name: 'Unit rate',
          value:
            read.unitRateEur !== null ? (
              read.nightRateEur !== null ? (
                <>
                  Day <span {...prov('from_your_bill')}>{cents(read.unitRateEur)}</span>, night <span {...prov('from_your_bill')}>{cents(read.nightRateEur)}</span>
                  {read.peakRateEur !== null ? (
                    <>
                      , peak <span {...prov('from_your_bill')}>{cents(read.peakRateEur)}</span>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  <span {...prov('from_your_bill')}>{cents(read.unitRateEur)}</span> a unit
                </>
              )
            ) : (
              'Not on this bill'
            ),
          t: read.unitRateEur !== null ? 'bill' : 'none',
        },
        {
          k: 'standing',
          name: 'Standing charge',
          value:
            read.standingChargeAnnualEur !== null ? (
              read.standingChargeUnit === 'per_day' && read.standingChargeEur !== null ? (
                <>
                  <span {...prov('from_your_bill')}>{cents(read.standingChargeEur)}</span> a day, about <span {...prov('from_your_bill')}>{eur(read.standingChargeAnnualEur)}</span> a year
                </>
              ) : (
                <>
                  About <span {...prov('from_your_bill')}>{eur(read.standingChargeAnnualEur)}</span> a year
                </>
              )
            ) : (
              'Not on this bill'
            ),
          t: read.standingChargeAnnualEur !== null ? 'bill' : 'none',
        },
        {
          k: 'units',
          name: 'Units on this bill',
          value:
            read.periodKwh !== null ? (
              <>
                <span {...prov('from_your_bill')}>{num(read.periodKwh)}</span> units{read.days ? ` over ${read.days} days` : ''}
              </>
            ) : (
              'Not on this bill'
            ),
          t: read.periodKwh !== null ? 'bill' : 'none',
        },
        {
          k: 'yearly',
          name: 'Yearly use',
          value:
            annualKwh !== null ? (
              <>
                About <span {...prov(kwhEdit.value !== null ? 'you_told_us' : read.annualKwhSource === 'bill' ? 'from_your_bill' : 'from_your_bill')}>{num(annualKwh)}</span> units a year
              </>
            ) : (
              'Not on this bill'
            ),
          t: kwhEdit.value !== null ? 'none' : read.annualKwhSource === 'bill' ? 'bill' : read.annualKwhSource === 'worked_out' ? 'worked' : 'none',
        },
      ]
    : [];

  const editTag = (label: string) => <span className="si-tag si-tag--fill">{label}</span>;

  const applyKwh = () => {
    const k = Number(kwhEdit.text.replace(/[,\s]/g, ''));
    if (!Number.isFinite(k) || k < 100 || k > 5_000_000) {
      setKwhEdit((x) => ({ ...x, error: 'Type the yearly units, for example 4,200.' }));
      return;
    }
    setKwhEdit({ open: false, text: '', value: Math.round(k), error: null });
    track('field_edited', { field: 'yearly', flow_id: fid });
  };
  const applyAmount = () => {
    const a = Number(amountEdit.text.replace(/[€,\s]/g, ''));
    if (!Number.isFinite(a) || a < 1 || a > 250_000) {
      setAmountEdit((x) => ({ ...x, error: 'Type the total on the bill, for example 190.40.' }));
      return;
    }
    setAmountEdit({ open: false, text: '', value: Math.round(a * 100) / 100, error: null });
    track('field_edited', { field: 'amount', flow_id: fid });
  };

  const editor = (k: 'amount' | 'yearly') => {
    const st = k === 'amount' ? amountEdit : kwhEdit;
    const set = k === 'amount' ? setAmountEdit : setKwhEdit;
    const apply = k === 'amount' ? applyAmount : applyKwh;
    if (!st.open) return null;
    return (
      <div className="si-an-edit">
        <label className="si-sr" htmlFor={`si-an-edit-${k}`}>
          {k === 'amount' ? 'The total on this bill, in euro' : 'Yearly use in units (kWh)'}
        </label>
        <div className="si-inline-field">
          <div className="si-input-wrap">
            <input
              id={`si-an-edit-${k}`}
              className="si-input"
              inputMode="decimal"
              enterKeyHint="done"
              value={st.text}
              aria-invalid={st.error ? 'true' : undefined}
              aria-describedby={st.error ? `si-an-edit-${k}-error` : `si-an-edit-${k}-hint`}
              onChange={(e) => set((x) => ({ ...x, text: e.target.value.replace(/[^\d.,€\s]/g, '').slice(0, 10), error: null }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  apply();
                }
              }}
            />
          </div>
          <button type="button" className="si-btn si-btn--secondary si-btn--sm" onClick={apply}>
            Use this
          </button>
        </div>
        {st.error ? (
          <p className="si-error" id={`si-an-edit-${k}-error`}>
            {st.error}
          </p>
        ) : (
          <p className="si-help" id={`si-an-edit-${k}-hint`}>
            {k === 'amount' ? "It's the total on the front of the bill." : "It's in the table headed \"Units\" or \"kWh\", or on your annual statement."}
          </p>
        )}
      </div>
    );
  };

  const revealCard = read ? (
    <div className="si-an-card si-an-reveal">
      <h2 className="si-an-h" ref={headRef} tabIndex={-1}>
        Here&apos;s what your bill says
      </h2>
      <p className="si-an-line">
        {[read.supplier, periodLabel(read.periodStart, read.periodEnd)].filter(Boolean).join(', ') || 'Your electricity bill'}
      </p>
      <dl className="si-an-rows">
        {rows.map((r, i) => (
          <div className="si-an-row" key={r.k} style={{ animationDelay: `${i * 70}ms` }} data-row={r.k}>
            <dt>{r.name}</dt>
            <dd>
              <span className="si-an-row__value">{r.value}</span>
              {r.k === 'amount' && amountEdit.value !== null ? editTag('you changed it') : r.k === 'yearly' && kwhEdit.value !== null ? editTag('you changed it') : tag(r.t)}
              {r.k === 'amount' || r.k === 'yearly' ? (
                <button
                  type="button"
                  className="si-btn--quiet si-an-row__edit"
                  aria-expanded={(r.k === 'amount' ? amountEdit : kwhEdit).open}
                  onClick={() => (r.k === 'amount' ? setAmountEdit : setKwhEdit)((x) => ({ ...x, open: !x.open, error: null }))}
                >
                  {(r.k === 'amount' ? amount : annualKwh) === null ? 'Add it' : 'Change'}
                  <span className="si-sr"> {r.name.toLowerCase()}</span>
                </button>
              ) : null}
            </dd>
            {r.k === 'amount' || r.k === 'yearly' ? editor(r.k) : null}
          </div>
        ))}
        {split && dayPct !== null && nightPct !== null ? (
          <div className="si-an-row si-an-row--split" style={{ animationDelay: `${rows.length * 70}ms` }} data-row="split">
            <dt>{peakPct !== null ? 'Day, peak and night' : 'Day and night'}</dt>
            <dd>
              <span className="si-an-row__value">
                <span {...prov('from_your_bill')}>{dayPct}%</span> day,{' '}
                {peakPct !== null ? (
                  <>
                    <span {...prov('from_your_bill')}>{peakPct}%</span> peak,{' '}
                  </>
                ) : null}
                <span {...prov('from_your_bill')}>{nightPct}%</span> night
              </span>
              {tag('bill')}
            </dd>
            <div className="si-an-split" aria-hidden="true">
              <span className="si-an-split__day" style={{ width: `${dayPct}%` }} />
              {peakPct !== null ? <span className="si-an-split__day" style={{ width: `${peakPct}%`, background: 'var(--si-fg)' }} /> : null}
              <span className="si-an-split__night" style={{ width: `${nightPct}%` }} />
            </div>
          </div>
        ) : read.unitRateEur !== null ? (
          <div className="si-an-row" data-row="split">
            <dt>Day and night</dt>
            <dd>
              <span className="si-an-row__value">Single-rate meter</span>
              {tag('bill')}
            </dd>
          </div>
        ) : null}
      </dl>
      {amount !== null && !period && annualKwh === null ? (
        <fieldset className="si-an-per">
          <legend className="si-label">Is that bill for one month or two?</legend>
          <p className="si-help si-an-per__help">We couldn&apos;t see the dates, and a two-month bill read as one would double your figures.</p>
          <div className="si-chips si-chips--best">
            <button type="button" className="si-chip si-chip--name" aria-pressed={perPick === 'month'} onClick={() => setPerPick('month')}>
              One month
            </button>
            <button type="button" className="si-chip si-chip--name" aria-pressed={perPick === 'two_months'} onClick={() => setPerPick('two_months')}>
              Two months
            </button>
          </div>
        </fieldset>
      ) : null}
      <p className="si-an-help si-mt-16">Does this look right? Tap Change on a figure to fix it.</p>
      <button type="button" className="si-btn--quiet" onClick={reset} data-an-different="">
        Use a different bill
      </button>
    </div>
  ) : null;

  /* The one insight, by rule (analyser-cro-spec 6). */
  const exportRate = figures?.exportRateEur ?? config?.estimate.exportRateEur ?? null;
  const insight: { variant: string; lead: ReactNode; support: ReactNode | null } | null = !read
    ? null
    : split && dayPct !== null && read.unitRateEur !== null
      ? {
          variant: 'split',
          lead: (
            <>
              <span {...prov('from_your_bill')}>{dayPct}%</span> of what you use is on your day rate, at <span {...prov('from_your_bill')}>{cents(read.unitRateEur)}</span> a unit. Solar panels work in daylight, so those are the units they replace.
            </>
          ),
          // The battery has its own case below; this line stays on the panels.
          support: <>We size panels to your day use, not your whole bill.</>,
        }
      : read.unitRateEur !== null && exportRate !== null
        ? {
            variant: 'single',
            lead: (
              <>
                Every unit you make and use yourself saves you <span {...prov('from_your_bill')}>{cents(read.unitRateEur)}</span>. Every unit you send back earns about <span {...prov('assumed')}>{cents(exportRate)}</span>.
              </>
            ),
            support: 'So the right size depends on what you use in daylight, not how big your roof is.',
          }
        : null;

  useEffect(() => {
    if (phase === 'reveal' && insight) track('insight_view', { variant: insight.variant, flow_id: fid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, insight?.variant]);

  const standingLine =
    read && read.standingChargeAnnualEur !== null ? (
      <p className="si-an-standing">
        About <span {...prov('from_your_bill')}>{eur(read.standingChargeAnnualEur)}</span> a year of your bill is standing charge. That stays whatever you do. Solar works on the rest.
      </p>
    ) : null;

  /*
   * The battery case, built only from this bill (Cal, 8 Nov 2026: "a good
   * reason for a battery on peak hours and night rate which you need a
   * consultant to further review"). Rates and units as printed, the SEAI
   * battery grant as the one assumed figure, and no battery saving or price:
   * the site's estimate is panels only, the battery is the consultant's to
   * size. It is also the honest reason for the call, because whether a
   * battery pays turns on when the home uses power, which no bill shows.
   */
  const battery: { variant: 'peak' | 'night' | 'single'; body: ReactNode } | null = (() => {
    if (!read || read.unitRateEur === null) return null;
    const day = read.unitRateEur;
    const grant = !isBiz ? (
      <p className="si-an-line">
        SEAI pays a <span {...prov('assumed')}>{SOLAR_DATA.batteryGrant.label}</span> grant on a battery of {SOLAR_DATA.batteryGrant.minLabel.replace(' kWh', '\u00a0kWh')}.
      </p>
    ) : null;
    if (read.peakRateEur !== null || read.nightRateEur !== null) {
      const hasPeak = read.peakRateEur !== null;
      const lead = hasPeak ? (
        <p className="si-an-insight__lead">
          Your peak rate is <span {...prov('from_your_bill')}>{cents(read.peakRateEur as number)}</span> a unit. Those are your dearest units, the ones a battery covers.
        </p>
      ) : (
        <p className="si-an-insight__lead">
          Your night rate is <span {...prov('from_your_bill')}>{cents(read.nightRateEur as number)}</span> a unit, against <span {...prov('from_your_bill')}>{cents(day)}</span> by day.
        </p>
      );
      const peakLine = hasPeak ? (
        <p className="si-an-line">
          Peak is usually 5pm to 7pm on a smart tariff.
          {read.peakKwh !== null && read.peakKwh > 0 ? (
            <>
              {' '}
              <span {...prov('from_your_bill')}>{num(read.peakKwh)}</span> units on this bill were at that rate.
            </>
          ) : null}
        </p>
      ) : null;
      const nightLine =
        read.nightRateEur !== null ? (
          <p className="si-an-line">
            {hasPeak ? (
              <>
                Your night rate is <span {...prov('from_your_bill')}>{cents(read.nightRateEur)}</span>, against <span {...prov('from_your_bill')}>{cents(day)}</span> by day.{' '}
              </>
            ) : null}
            {nightPct !== null ? (
              <>
                <span {...prov('from_your_bill')}>{nightPct}%</span> of your units are already at night.{' '}
              </>
            ) : null}
            A battery can store cheap night units, or daytime solar, and use them in the evening instead of buying at the {hasPeak ? 'peak or day' : 'day'} rate.
          </p>
        ) : (
          <p className="si-an-line">A battery can keep daytime solar for the evening instead of buying at the peak rate.</p>
        );
      return {
        variant: hasPeak ? 'peak' : 'night',
        body: (
          <>
            {lead}
            {peakLine}
            {nightLine}
            {grant}
            <p className="si-an-line">
              Whether a battery pays for your home depends on when you use power: evenings, an EV, a heat pump, the immersion. A bill can&apos;t show that, so the saving below is for panels only. A consultant reviews your home&apos;s energy use with you on the free 15-minute call.
            </p>
          </>
        ),
      };
    }
    return {
      variant: 'single',
      body: (
        <>
          <p className="si-an-line">
            Your bill is on one 24-hour rate of <span {...prov('from_your_bill')}>{cents(day)}</span> a unit, so there is no cheaper night rate to store. A battery here would keep daytime solar for the evening.{' '}
            {!isBiz ? (
              <>
                SEAI pays a <span {...prov('assumed')}>{SOLAR_DATA.batteryGrant.label}</span> grant on a battery of {SOLAR_DATA.batteryGrant.minLabel.replace(' kWh', '\u00a0kWh')}.{' '}
              </>
            ) : null}
            Whether it pays depends on when you use power, which a bill can&apos;t show. A consultant goes through that with you on the call.
          </p>
        </>
      ),
    };
  })();

  useEffect(() => {
    if (phase === 'reveal' && battery) track('battery_view', { variant: battery.variant, flow_id: fid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, battery?.variant]);

  const batteryBlock = battery ? (
    <div className="si-an-saving si-an-battery" data-battery={battery.variant}>
      <p className="si-an-kicker">A battery, from your bill</p>
      {battery.body}
    </div>
  ) : null;

  const savingBlock = (
    <div className="si-an-saving" ref={savingRef}>
      <p className="si-an-kicker">What solar could save you</p>
      {quoteStatus === 'ready' && figures ? (
        <>
          <p className="si-an-saving__fig">
            About <b {...prov('estimate')}>{eur(figures.annualSavingEur)}</b> a year
          </p>
          {isBiz ? (
            <p className="si-an-line">
              With about <span {...prov('estimate')}>{kwp(figures.kwp)}</span> of panels and the NDMG grant of up to <span {...prov('estimate')}>{eur(figures.grantEur)}</span>. Indicative, not a quote. We work out the price with you after the call.
            </p>
          ) : (
            <p className="si-an-line">
              With <span {...prov('estimate')}>{kwp(figures.kwp)}</span> of panels sized to your use.
              {figures.netCostEur != null ? (
                <>
                  {' '}
                  About <span {...prov('estimate')}>{eur(figures.netCostEur)}</span> after the <span {...prov('estimate')}>{eur(figures.grantEur)}</span> SEAI grant
                  {figures.paybackYears != null ? (
                    <>
                      , paying for itself in about <span {...prov('estimate')}>{years(figures.paybackYears)}</span>
                    </>
                  ) : null}
                  .
                </>
              ) : null}{' '}
              A close estimate, not a quote.
            </p>
          )}
        </>
      ) : quoteStatus === 'error' ? (
        <p className="si-an-line si-an-saving__down">We can&apos;t work out your saving this second. {who || 'We'} can go through it with you on the call.</p>
      ) : quoteStatus === 'loading' ? (
        <div aria-busy="true">
          <span className="si-skel si-skel--hero" />
          <span className="si-skel" style={{ height: 18, width: '70%', marginTop: 12, display: 'block' }} />
        </div>
      ) : (
        <p className="si-an-line">Tell us whether the bill is for one month or two and your saving appears here.</p>
      )}
    </div>
  );

  const carry = read ? { eircode: read.eircode, mprn: read.mprn, address: read.address } : null;
  const billRead: CallBillRead | null = read
    ? {
        supplier: read.supplier,
        periodStart: read.periodStart,
        periodEnd: read.periodEnd,
        amountEur: amount,
        period,
        unitRateEur: read.unitRateEur,
        nightRateEur: read.nightRateEur,
        standingChargeAnnualEur: read.standingChargeAnnualEur,
        periodKwh: read.periodKwh,
        dayKwh: read.dayKwh,
        nightKwh: read.nightKwh,
        annualKwh,
      }
    : null;

  const ask = (
    <div className="si-an-ask" ref={askRef} id={`${door}-ask`}>
      <CallAsk
        idPrefix={`si-an-${door}`}
        details={details}
        onDetails={(p) => setDetails((d) => ({ ...d, ...p }))}
        who={who}
        online={online}
        heading="Where should we send your full estimate?"
        headingLevel="h3"
        sub={
          battery
            ? `Your full estimate by email, then a free 15-minute call with ${who || 'Solar Ireland'} about when your home uses power, so you know whether a battery is worth adding to the panels. No visit, no obligation.`
            : `Your full estimate by email, then a free 15-minute call with ${who || 'Solar Ireland'} to go through it and answer your questions. No visit, no obligation.`
        }
        ctx={{
          segment: seg,
          door,
          src: null,
          pkg: null,
          countyContext: null,
          flowId: fid,
          monthlyBill: amount !== null && period ? (period === 'two_months' ? amount / 2 : amount) : null,
          annualKwh,
          billPeriod: period,
          supplier: knownSupplier ?? read?.supplier ?? null,
          quoteToken: quote?.quoteToken ?? null,
          billRead,
          carry,
        }}
        onSent={onSent}
      />
    </div>
  );

  const doneCard = (
    <div className="si-an-card si-an-done">
      <CallDone details={details} who={who} headingRef={headRef} headingLevel="h2" />
    </div>
  );

  let body: ReactNode;
  if (phase === 'door') body = doorCard;
  else if (phase === 'tips') body = tipsCard;
  else if (phase === 'reading') body = readingCard;
  else if (phase === 'failed') body = failedCard;
  else if (phase === 'done') body = doneCard;
  else
    body = (
      <div className="si-an-lanes">
        <div className="si-an-lane">{revealCard}</div>
        <div className="si-an-lane si-an-lane--right si-an-card">
          {insight ? (
            <div className="si-an-insight">
              <p className="si-an-insight__lead">{insight.lead}</p>
              {insight.support ? <p className="si-an-line">{insight.support}</p> : null}
              {standingLine}
            </div>
          ) : standingLine ? (
            <div className="si-an-insight">{standingLine}</div>
          ) : null}
          {batteryBlock}
          {savingBlock}
          {ask}
        </div>
      </div>
    );

  const wide = phase !== 'door';

  return (
    <div
      ref={rootRef}
      // Every "Analyse my bill" door on the site links to #calculator (nav,
      // hero, sticky bar, footer). One analyser per page, so the id is safe.
      id="calculator"
      className={`si-analyser si-an--${variant}`}
      data-phase={phase}
      data-segment={seg}
      data-reason={phase === 'failed' ? failure?.reason : undefined}
      data-wide={wide ? 'true' : 'false'}
    >
      {/* Equal gutters at every width: the site's own section container
          (WhySolar), so neither lane sits flush to a screen edge. */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto">
          {variant === 'hero' && !wide ? (
            <div className="si-an-hero">
              <div className="si-an-hero__intro">{intro}</div>
              <div className="si-an-hero__door">{body}</div>
            </div>
          ) : (
            <div className="si-an-body">{body}</div>
          )}
        </div>
      </div>
      {stickyOn ? (
        <div className="si-an-sticky">
          <button
            type="button"
            className="si-btn si-btn--primary"
            onClick={() => {
              const el = document.getElementById(`si-an-${door}-name`);
              askRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
              setTimeout(() => el?.focus({ preventScroll: true }), 350);
            }}
          >
            Send my full estimate
          </button>
        </div>
      ) : null}
      <div className="si-sr" aria-live="polite" role="status">
        {announce}
      </div>
    </div>
  );
}
