/**
 * Every door opens the same intake (ux-spec 2.2). This is the one function a
 * door calls, and the one URL shape it links to.
 *
 * The URL carries only non-personal state (ux-spec 2.4): segment, bill,
 * period, step, package, county, source and door. Name, mobile, email and
 * Eircode never go in it.
 *
 * Tiny on purpose: marketing pages import it, so it must not pull the intake
 * itself into their bundles. The full-screen layer is mounted once by
 * <IntakeHost/> in the root layout and loads on first use (or on idle).
 */

export type DoorSegment = 'home' | 'business';
export type IntakeStep = 'segment' | 'bill' | 'time' | 'details' | 'done';

export interface IntakeOpenOptions {
  /** Which door: hero, sticky, nav, nav-book, footer, blog-end, county, calculator, contact, chat, book-survey ... */
  door: string;
  /** Set by a page that knows (provenance "From the page you came from"). */
  segment?: DoorSegment | null;
  /** Where to enter: Screen 1 (bill) or Screen 2 (time). */
  step?: 'bill' | 'time' | null;
  bill?: number | null;
  per?: 'month' | '2months' | null;
  src?: string | null;
  pkg?: string | null;
  county?: string | null;
}

export const INTAKE_PATH = '/estimate';
export const INTAKE_REQUEST_EVENT = 'sig:intake-request';

const clean = (v: string | null | undefined, max = 60) =>
  v ? v.replace(/[^\w\s.,'&-]/g, '').trim().slice(0, max) || null : null;

export function intakeHref(o: IntakeOpenOptions): string {
  const p = new URLSearchParams();
  if (o.segment) p.set('for', o.segment);
  if (o.step) p.set('step', o.step);
  if (o.bill != null && Number.isFinite(o.bill) && o.bill > 0) p.set('bill', String(Math.round(o.bill)));
  if (o.per && o.per !== 'month') p.set('per', o.per);
  if (o.pkg) p.set('pkg', o.pkg);
  if (o.county) p.set('county', o.county);
  if (o.src) p.set('src', o.src);
  if (o.door) p.set('door', o.door);
  const q = p.toString();
  return q ? `${INTAKE_PATH}?${q}` : INTAKE_PATH;
}

/** Read the intake's options back from a URL query. */
export function parseIntakeQuery(q: URLSearchParams | Record<string, string | string[] | undefined>): IntakeOpenOptions & { stepRaw: string | null } {
  const get = (k: string): string | null => {
    if (q instanceof URLSearchParams) return q.get(k);
    const v = q[k];
    return Array.isArray(v) ? v[0] ?? null : v ?? null;
  };
  const forv = get('for');
  const bill = Number(get('bill'));
  const per = get('per');
  const step = get('step');
  return {
    door: clean(get('door'), 40) || 'direct',
    segment: forv === 'home' || forv === 'business' ? forv : null,
    step: step === 'bill' || step === 'time' ? step : null,
    stepRaw: step,
    bill: Number.isFinite(bill) && bill > 0 && bill < 100000 ? bill : null,
    per: per === '2months' ? '2months' : 'month',
    pkg: clean(get('pkg')),
    county: clean(get('county'), 30),
    src: clean(get('src'), 40),
  };
}

/** Open the intake from any door. Falls back to a plain navigation. */
export function openIntake(o: IntakeOpenOptions): void {
  if (typeof window === 'undefined') return;
  // Carry the page's own context (?src, ?pkg, ?county) unless the door set it.
  const here = new URLSearchParams(window.location.search);
  const full: IntakeOpenOptions = {
    ...o,
    src: o.src ?? clean(here.get('src'), 40),
    pkg: o.pkg ?? clean(here.get('pkg')),
    county: o.county ?? clean(here.get('county'), 30),
  };
  const w = window as unknown as { __siIntakeHost?: boolean };
  if (w.__siIntakeHost && window.location.pathname !== INTAKE_PATH) {
    window.dispatchEvent(new CustomEvent(INTAKE_REQUEST_EVENT, { detail: full }));
    return;
  }
  window.location.assign(intakeHref(full));
}
