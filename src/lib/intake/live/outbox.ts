/**
 * Live mode: the outbox (DECISIONS 4 "Fallback", backend-spec 4.7).
 *
 * When AISolar does not accept a finished intake (down, slow, a 5xx, a wrong
 * door), the lead must not be lost and nobody may be told it is booked:
 *
 *   1. HOLD it in the site's own Supabase table `website_leads` (the old
 *      /api/lead fallback table, no schema change: the exact ingest-lead body,
 *      its idempotency key and the retry state ride in `meta`).
 *   2. ALERT the owner through the site's own mail path (Postmark, its own
 *      server token), which does not depend on AISolar.
 *   3. REPLAY it later with the SAME idempotency key, so a replay can never
 *      make a second lead (AISolar keeps the first answer per key).
 *
 * The homeowner is told "Saved, not booked yet" only when step 1 or step 2
 * actually happened. If neither is configured the submit answers a plain
 * failure and the form offers the phone: honest, never a silent loss.
 *
 * Everything is injected so outbox_test runs it with no network.
 */
import type { CallResult } from './client';
import { adaptSubmit } from './adapt';
import type { IngestBody } from './ingest';
import { dayLong, dublinDate, timeLabel } from '@/lib/intake/format';

export interface OutboxMeta {
  intake: 'v2';
  idempotencyKey: string;
  payload: IngestBody;
  attempts: number;
  lastError: string;
  nextAttemptAt: string;
  heldAt: string;
  parked?: boolean;
  stuckAlerted?: boolean;
  forwardedAt?: string;
  aisolarLeadId?: string | null;
  outcome?: string;
  legacy?: boolean;
}

export interface OutboxRow {
  id: string;
  meta: OutboxMeta;
}

export interface OutboxStore {
  findByKey(key: string): Promise<{ id: string } | null>;
  insert(row: Record<string, unknown>): Promise<boolean>;
  listPending(limit: number): Promise<OutboxRow[]>;
  update(id: string, patch: { forwarded?: boolean; meta: OutboxMeta }): Promise<boolean>;
}

export interface Alerter {
  send(subject: string, text: string): Promise<boolean>;
}

export interface OutboxDeps {
  store: OutboxStore | null;
  alert: Alerter | null;
  now: () => Date;
}

/* ------------------------------------------------------------------ */
/*  Real effects, from env (null when not configured)                  */
/* ------------------------------------------------------------------ */

export function supabaseStore(): OutboxStore | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const client = async () => {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(url, key, { auth: { persistSession: false } });
  };
  return {
    async findByKey(k) {
      const db = await client();
      const { data, error } = await db.from('website_leads').select('id').eq('meta->>idempotencyKey', k).limit(1).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? { id: String(data.id) } : null;
    },
    async insert(row) {
      const db = await client();
      const { error } = await db.from('website_leads').insert(row);
      if (error) console.error('[intake outbox] insert failed:', error.message);
      return !error;
    },
    async listPending(limit) {
      const db = await client();
      const { data, error } = await db
        .from('website_leads')
        .select('id, meta')
        .eq('forwarded', false)
        .eq('meta->>intake', 'v2')
        .order('created_at', { ascending: true })
        .limit(limit);
      if (error) throw new Error(error.message);
      return (data ?? []) as OutboxRow[];
    },
    async update(id, patch) {
      const db = await client();
      const { error } = await db.from('website_leads').update(patch).eq('id', id);
      if (error) console.error('[intake outbox] update failed:', error.message);
      return !error;
    },
  };
}

export function postmarkAlerter(): Alerter | null {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  const to = process.env.OWNER_ALERT_EMAIL;
  const from = process.env.OWNER_ALERT_FROM;
  if (!token || !to || !from) return null;
  return {
    async send(subject, text) {
      try {
        const res = await fetch('https://api.postmarkapp.com/email', {
          method: 'POST',
          headers: { accept: 'application/json', 'content-type': 'application/json', 'x-postmark-server-token': token },
          body: JSON.stringify({ From: from, To: to, Subject: subject.slice(0, 200), TextBody: text, MessageStream: 'outbound' }),
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) console.error('[intake outbox] owner alert refused:', res.status);
        return res.ok;
      } catch {
        console.error('[intake outbox] owner alert unreachable');
        return false;
      }
    },
  };
}

export function outboxDeps(): OutboxDeps {
  return { store: supabaseStore(), alert: postmarkAlerter(), now: () => new Date() };
}

/* ------------------------------------------------------------------ */
/*  Hold                                                               */
/* ------------------------------------------------------------------ */

function askedLine(p: IngestBody): string {
  if (p.slot) return `${dayLong(dublinDate(p.slot.startsAt))}, ${timeLabel(p.slot.startsAt)} (not booked)`;
  if (p.requestedDay) return `${dayLong(p.requestedDay.date)}, ${p.requestedDay.part} (a request)`;
  return 'No time asked';
}

export function alertText(p: IngestBody, key: string, reason: string, stored: boolean): { subject: string; text: string } {
  const who = [p.name || 'No name', p.phone || p.email].join(', ');
  const lines = [
    'A homeowner finished the website intake, but AISolar did not accept the lead.',
    `Reason: ${reason}`,
    '',
    `Name: ${p.name || ''}`,
    `Mobile: ${p.phone || ''}`,
    `Email: ${p.email}`,
    `Eircode: ${p.eircode || ''}`,
    `Address: ${p.address || ''}`,
    `County: ${p.county || ''}`,
    `Home or business: ${p.meta.segment === 'commercial' ? `Business${p.meta.businessName ? `, ${p.meta.businessName}` : ''}` : 'Home'}`,
    `Asked for: ${askedLine(p)}`,
    `Bill: ${p.monthlyBill != null ? `€${p.monthlyBill} a month` : 'not given'}`,
    '',
    'They were told: "Saved, not booked yet. We\'ll confirm by email."',
    '',
    stored
      ? 'The website holds this lead and sends it again every few minutes until AISolar accepts it, with the same reference, so it can never become two leads. When it lands you get the usual new-lead alert from AISolar.'
      : 'This email is the only copy: the website has no outbox storage configured. Add the lead in AISolar by hand and confirm a time with them.',
    '',
    `Reference: ${key}`,
  ];
  return { subject: `Lead held on the website: ${who}. AISolar did not accept it.`, text: lines.join('\n') };
}

export async function holdInOutbox(
  e: { key: string; payload: IngestBody; reason: string },
  deps: OutboxDeps,
): Promise<{ held: boolean; stored: boolean; alerted: boolean; repeat: boolean }> {
  const now = deps.now();
  let stored = false;
  let repeat = false;
  if (deps.store) {
    try {
      const existing = await deps.store.findByKey(e.key);
      if (existing) {
        stored = true;
        repeat = true;
      } else {
        const p = e.payload;
        const meta: OutboxMeta = {
          intake: 'v2',
          idempotencyKey: e.key,
          payload: p,
          attempts: 0,
          lastError: e.reason,
          nextAttemptAt: new Date(now.getTime() + 60_000).toISOString(),
          heldAt: now.toISOString(),
        };
        stored = await deps.store.insert({
          source: p.source,
          name: p.name || p.email.split('@')[0],
          email: p.email,
          phone: p.phone,
          county: p.county,
          address: [p.address, p.eircode].filter(Boolean).join(', ') || null,
          monthly_bill: p.monthlyBill,
          annual_kwh: p.annualKwh,
          message: null,
          meta,
          forwarded: false,
        });
      }
    } catch (err) {
      console.error('[intake outbox] store unavailable:', err instanceof Error ? err.message : 'unknown');
      stored = false;
    }
  }
  let alerted = false;
  if (!repeat && deps.alert) {
    const { subject, text } = alertText(e.payload, e.key, e.reason, stored);
    alerted = await deps.alert.send(subject, text);
  }
  return { held: stored || alerted, stored, alerted, repeat };
}

/* ------------------------------------------------------------------ */
/*  Replay                                                             */
/* ------------------------------------------------------------------ */

/** Minutes to wait after the nth failed attempt: 1, 2, 4, 8, 16, then every 30. */
export function backoffMinutes(attempts: number): number {
  return Math.min(2 ** Math.max(attempts - 1, 0), 30);
}

/** After this many failed replays (about five hours), the owner is told once more. */
export const STUCK_AFTER = 15;

export interface ReplayDeps extends OutboxDeps {
  send: (payload: IngestBody, key: string) => Promise<CallResult>;
  portalOrigins: string[];
}

export interface ReplayReport {
  pending: number;
  due: number;
  forwarded: number;
  retrying: number;
  parked: number;
}

export async function replayDue(deps: ReplayDeps, limit = 10): Promise<ReplayReport | null> {
  if (!deps.store) return null;
  const now = deps.now();
  const rows = (await deps.store.listPending(100)).filter((r) => r.meta && r.meta.intake === 'v2' && !r.meta.parked && r.meta.payload && r.meta.idempotencyKey);
  const due = rows.filter((r) => Date.parse(r.meta.nextAttemptAt) <= now.getTime()).slice(0, limit);
  const report: ReplayReport = { pending: rows.length, due: due.length, forwarded: 0, retrying: 0, parked: 0 };

  for (const row of due) {
    const m = row.meta;
    const r = await deps.send(m.payload, m.idempotencyKey);
    const a = adaptSubmit(r, { asked: !!(m.payload.slot || m.payload.requestedDay), portalOrigins: deps.portalOrigins });
    const at = deps.now();
    if (a.kind === 'answer') {
      await deps.store.update(row.id, {
        forwarded: true,
        meta: { ...m, forwardedAt: at.toISOString(), aisolarLeadId: a.body.leadId, outcome: a.body.booking.outcome, legacy: a.legacy },
      });
      report.forwarded += 1;
    } else if (a.kind === 'invalid') {
      // AISolar read it and refused it: sending it again cannot help. A person has to.
      await deps.store.update(row.id, { meta: { ...m, parked: true, lastError: a.note } });
      if (deps.alert) {
        const { text } = alertText(m.payload, m.idempotencyKey, a.note, true);
        await deps.alert.send(`Held website lead refused by AISolar: ${m.payload.name || m.payload.email}. It needs a person.`, text.replace(/The website holds this lead[^\n]*/, 'AISolar refused this lead as sent, so the website has stopped retrying it. Add it in AISolar by hand.'));
      }
      report.parked += 1;
    } else {
      const attempts = (m.attempts || 0) + 1;
      const stuck = attempts >= STUCK_AFTER && !m.stuckAlerted;
      await deps.store.update(row.id, {
        meta: { ...m, attempts, lastError: a.note, nextAttemptAt: new Date(at.getTime() + backoffMinutes(attempts) * 60_000).toISOString(), ...(stuck ? { stuckAlerted: true } : {}) },
      });
      if (stuck && deps.alert) {
        const { text } = alertText(m.payload, m.idempotencyKey, a.note, true);
        await deps.alert.send(`Website lead still not accepted by AISolar after ${attempts} tries: ${m.payload.name || m.payload.email}`, text);
      }
      report.retrying += 1;
    }
  }
  return report;
}
