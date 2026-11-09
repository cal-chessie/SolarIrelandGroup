import { randomBytes } from 'node:crypto';
import { after } from 'next/server';
import { gate, json, readJson } from '@/lib/intake/http';
import { BEST_TIMES, type SubmitRequest, type SubmitResponse } from '@/lib/intake/contract';
import { dublinDate, isEmail, isPhone, wallTime } from '@/lib/intake/format';
import { isValidEircode } from '@/lib/eircode';
import { liveMode, type LiveEnv } from '@/lib/intake/mode';
import { LINK_TOKEN, parseLinkToken } from '@/lib/intake/linkToken';
import { portalOrigins } from '@/lib/intake/portal';
import { adaptSubmit, outboxAnswer } from '@/lib/intake/live/adapt';
import { callAISolar, visitorHeaders } from '@/lib/intake/live/client';
import { toIngestBody, type IngestBody } from '@/lib/intake/live/ingest';
import { holdInOutbox, outboxDeps, replayDue } from '@/lib/intake/live/outbox';
import { readQuoteToken } from '@/lib/intake/stub/quote';
import { STUB_SETTINGS } from '@/lib/intake/stub/settings';
import { alternativesAfter, fixtureTaken, gridSlot } from '@/lib/intake/stub/slots';
import { cookieValue, liveHolds, scenarioOf, sleep, store } from '@/lib/intake/stub/state';

/**
 * POST /api/intake/submit
 *
 * ingest-lead v2 as the site's route (backend-spec 4.2), with an
 * x-idempotency-key on every attempt (4.6): a double tap or a retry returns
 * the first answer and never makes a second lead.
 *
 * STUB: answers with fixtures and NEVER forwards anything anywhere. No
 * AISolar, no Postmark, no /api/lead, no database, no log of personal data.
 * The device cookie and holds live in process memory only.
 *
 * LIVE: forwards to AISolar ingest-lead v2 (x-intake-version: 2) through the
 * intake's door, with the same idempotency key on the first try and the one
 * retry. AISolar decides the booking inside the request; the site shows only
 * what it answered (lib/intake/live/adapt.ts). The device token it mints goes
 * into an HttpOnly cookie and comes back as leadToken on the next submit.
 * When AISolar does not accept it, the lead goes to the site's outbox and the
 * owner is alerted (lib/intake/live/outbox.ts); the homeowner is told "saved,
 * not booked yet" only if one of those actually happened.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Calls AISolar with its own deadlines (submit: up to 12s + 0.8s + 9s, then the outbox); 60s is the plan's
// ceiling the other AISolar routes already use, so a slow answer is never cut off by the platform first.
export const maxDuration = 60;

const DEVICE = 'si_device';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX64 = /^[a-f0-9]{64}$/;

type Fields = Record<string, string>;

function validate(b: SubmitRequest): Fields {
  const f: Fields = {};
  if (!b || typeof b !== 'object') return { body: 'invalid' };
  if (!b.meta || (b.meta.segment !== 'domestic' && b.meta.segment !== 'commercial')) f.segment = 'invalid';
  if (typeof b.email !== 'string' || !isEmail(b.email)) f.email = 'invalid';
  if (b.intent !== undefined && b.intent !== 'call') f.intent = 'invalid';
  if (b.intent === 'call') {
    // The call contract (CALL-FUNNEL-PLAN.md): name, mobile, email. No slot,
    // no day, never an Eircode. A best time is optional and one of four.
    if (typeof b.name !== 'string' || b.name.trim().length < 2) f.name = 'required';
    if (typeof b.phone !== 'string' || !isPhone(b.phone)) f.phone = 'invalid';
    if (b.slot || b.requestedDay) f.slot = 'not_for_a_call';
    if (b.bestTime != null && !BEST_TIMES.includes(b.bestTime)) f.bestTime = 'invalid';
    if (b.mprn != null && (typeof b.mprn !== 'string' || !/^10\d{9}$/.test(b.mprn))) f.mprn = 'invalid';
    if (b.eircode != null && (typeof b.eircode !== 'string' || !isValidEircode(b.eircode))) f.eircode = 'invalid';
    return f;
  }
  const booking = !!b.slot || !!b.requestedDay;
  if (booking) {
    if (typeof b.name !== 'string' || b.name.trim().length < 2) f.name = 'required';
    if (typeof b.phone !== 'string' || !isPhone(b.phone)) f.phone = 'invalid';
    const hasEircode = typeof b.eircode === 'string' && isValidEircode(b.eircode);
    const hasAddress = typeof b.address === 'string' && b.address.trim().length > 3 && typeof b.county === 'string' && !!b.county;
    if (!hasEircode && !hasAddress) f.eircode = 'invalid';
    if (b.meta?.segment === 'commercial' && (typeof b.meta.businessName !== 'string' || b.meta.businessName.trim().length < 2)) {
      f.businessName = 'required';
    }
  }
  if (b.requestedDay && (!/^\d{4}-\d{2}-\d{2}$/.test(b.requestedDay.date) || !['morning', 'afternoon'].includes(b.requestedDay.part))) {
    f.requestedDay = 'invalid';
  }
  return f;
}

/**
 * A magic link that is not the 64-hex shape AISolar mints (lib/intake/linkToken.ts)
 * is dropped, never refused: the request still goes through as a fresh call,
 * so a mangled link can never make the button fail on every tap.
 */
function cleanLinkToken(b: SubmitRequest): void {
  if (b && typeof b === 'object' && b.linkToken != null) b.linkToken = parseLinkToken(b.linkToken);
}

/** The honeypots stay honeypots: a filled `company` or `website_url` is a bot, told it worked. */
function isBot(body: SubmitRequest): boolean {
  const raw = body as unknown as Record<string, unknown>;
  return (typeof raw.company === 'string' && !!raw.company) || (typeof raw.website_url === 'string' && !!raw.website_url);
}
const BOT_ANSWER: SubmitResponse = { ok: true, leadId: null, path: 'fresh', booking: { outcome: 'none' }, estimate: null, handoff: null, deviceToken: null, next: 'check_email' };

function deviceCookie(token: string) {
  return `${DEVICE}=${token}; Path=/api/intake; Max-Age=${24 * 3600}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

function handoff() {
  return {
    code: `stub_${randomBytes(24).toString('base64url')}`,
    expiresAt: new Date(Date.now() + 10 * 60000).toISOString(),
    // Stub: a local receiver that explains itself. Live: `${portalOrigin}/h`.
    portalUrl: '/api/intake/handoff',
  };
}

export async function POST(request: Request) {
  const blocked = gate(request, 20);
  if (blocked) return blocked;

  const key = request.headers.get('x-idempotency-key') || '';
  if (!UUID.test(key)) return json({ ok: false, error: 'invalid', fields: { idempotencyKey: 'required' } }, 400);
  const env = liveMode();
  if (env) return liveSubmit(request, key.toLowerCase(), env);

  const S = store();
  const seen = S.idem.get(key);
  if (seen) return json(seen.body, seen.status);

  const scenario = scenarioOf(request);
  if (scenario === 'rate_limited') return json({ ok: false, error: 'rate_limited' }, 429);
  if (scenario === 'fail') return json({ ok: false, error: 'server_error' }, 502);

  const body = (await readJson(request)) as SubmitRequest | null;
  if (!body) return json({ ok: false, error: 'invalid' }, 400);
  cleanLinkToken(body);

  // The honeypots stay honeypots: a filled `company` or `website_url` is a bot.
  if (isBot(body)) return json(BOT_ANSWER);

  const fields = validate(body);
  if (Object.keys(fields).length) return json({ ok: false, error: 'invalid', fields }, 400);

  if (scenario === 'slow') await sleep(9000);

  const segment = body.meta.segment;
  const figures = readQuoteToken(body.quoteToken);
  const estimate = figures ? { quoteVersion: 1, figures } : null;
  const surveyorFirstName = STUB_SETTINGS.survey.homeownerFacingName;

  let deviceToken = cookieValue(request, DEVICE);
  let device = deviceToken ? S.devices.get(deviceToken) : undefined;
  const isNewDevice = !device;
  if (!deviceToken || !device) {
    deviceToken = randomBytes(32).toString('hex');
    device = { booking: null, at: Date.now() };
    S.devices.set(deviceToken, device);
  }
  const leadId = `stub-${deviceToken.slice(0, 12)}`;
  // A magic link (?lt=) names the lead it belongs to: the request threads onto it.
  const viaLink = body.intent === 'call' && typeof body.linkToken === 'string' && LINK_TOKEN.test(body.linkToken);

  let res: SubmitResponse;

  if (scenario === 'unreachable') {
    // AISolar did not answer: the site keeps the lead in its outbox and says
    // "saved, not booked yet". Nothing is booked, nothing is claimed.
    res = { ok: true, leadId: null, path: 'outbox', booking: { outcome: 'none' }, estimate: null, handoff: null, deviceToken: null, next: 'check_email', fallback: true };
    if (body.intent === 'call') res.call = { requested: true, bestTime: body.bestTime ?? null };
  } else if (scenario === 'duplicate') {
    // Same email within 24 hours from another device: no second booking, a
    // portal link by email, and never a word about the existing booking.
    res = { ok: true, leadId: null, path: 'deduped', booking: { outcome: 'already_booked', existing: null }, estimate: null, handoff: null, deviceToken: null, next: 'check_email' };
  } else if (body.intent === 'call') {
    // A free 15-minute call: nothing booked in a calendar, nothing chased.
    // The stub answers like AISolar will and forwards nothing anywhere.
    res = {
      ok: true, leadId, path: isNewDevice && !viaLink ? 'fresh' : 'threaded', booking: { outcome: 'none' }, estimate, handoff: null, deviceToken: null,
      next: 'check_email', call: { requested: true, bestTime: body.bestTime ?? null },
    };
  } else if (body.slot) {
    const slot = gridSlot(body.slot.startsAt);
    const holds = liveHolds();
    const tooSoon = slot ? new Date(slot.startsAt).getTime() < Date.now() + STUB_SETTINGS.survey.minNoticeHours * 3600000 : true;
    const hold = slot ? holds.get(slot.startsAt) : undefined;
    const heldByOther = !!hold && hold.token !== body.slot.holdToken;
    const bookedByOther = slot ? [...S.devices.entries()].some(([tok, d]) => tok !== deviceToken && d.booking?.startsAt === slot.startsAt) : false;
    const taken = slot ? fixtureTaken(dublinDate(slot.startsAt), wallTime(slot.startsAt)) || bookedByOther : false;

    if (device.booking && body.onExisting !== 'move') {
      res = {
        ok: true, leadId, path: 'threaded',
        booking: { outcome: 'already_booked', existing: device.booking, startsAt: slot?.startsAt, endsAt: slot?.endsAt },
        estimate, handoff: null, deviceToken: null, next: 'portal',
      };
    } else if (!slot || tooSoon) {
      res = { ok: true, leadId, path: isNewDevice ? 'fresh' : 'threaded', booking: { outcome: 'invalid_slot', alternatives: alternativesAfter(body.slot.startsAt, segment) }, estimate, handoff: null, deviceToken: null, next: 'pick_another_time' };
    } else if (taken || heldByOther || (scenario === 'slot_taken' && isNewDevice)) {
      res = { ok: true, leadId, path: isNewDevice ? 'fresh' : 'threaded', booking: { outcome: 'slot_unavailable', alternatives: alternativesAfter(slot.startsAt, segment) }, estimate, handoff: null, deviceToken: null, next: 'pick_another_time' };
    } else {
      const moved = !!device.booking;
      if (hold) holds.delete(slot.startsAt);
      device.booking = { startsAt: slot.startsAt, endsAt: slot.endsAt };
      res = {
        ok: true, leadId, path: isNewDevice ? 'fresh' : 'threaded',
        booking: { outcome: moved ? 'moved' : 'booked', startsAt: slot.startsAt, endsAt: slot.endsAt, surveyorFirstName },
        estimate, handoff: isNewDevice || moved ? handoff() : null, deviceToken: null, next: 'portal',
      };
    }
  } else if (body.requestedDay) {
    res = { ok: true, leadId, path: isNewDevice ? 'fresh' : 'threaded', booking: { outcome: 'requested', surveyorFirstName }, estimate, handoff: isNewDevice ? handoff() : null, deviceToken: null, next: 'portal' };
  } else {
    // "Email me this estimate": one estimate email, nothing booked, nothing chased.
    res = { ok: true, leadId, path: isNewDevice ? 'fresh' : 'threaded', booking: { outcome: 'none' }, estimate, handoff: null, deviceToken: null, next: 'check_email' };
  }

  S.idem.set(key, { status: 200, body: res, at: Date.now() });
  if (S.idem.size > 2000) S.idem.clear();
  const out = json(res, 200);
  if (res.path !== 'outbox' && res.path !== 'deduped') out.headers.append('set-cookie', deviceCookie(deviceToken));
  return out;
}

/* ------------------------------------------------------------------ */
/*  Live                                                               */
/* ------------------------------------------------------------------ */

const sleepMs = (ms: number) => new Promise((r) => setTimeout(r, ms));

function sendIngest(env: LiveEnv, payload: IngestBody, key: string, extra: Record<string, string>, timeoutMs: number) {
  return callAISolar(env, 'ingest-lead', {
    method: 'POST',
    body: payload,
    headers: { ...extra, 'x-intake-version': '2', 'x-idempotency-key': key },
    timeoutMs,
  });
}

/** After an accepted submit, AISolar is answering: send any held leads too (at most every 5 minutes per instance). */
let lastReplay = 0;
function kickReplay(env: LiveEnv) {
  if (Date.now() - lastReplay < 5 * 60_000) return;
  const deps = outboxDeps();
  if (!deps.store) return;
  lastReplay = Date.now();
  after(async () => {
    try {
      const report = await replayDue({ ...deps, send: (p, k) => sendIngest(env, p, k, {}, 15_000), portalOrigins: portalOrigins() }, 5);
      if (report && report.due) console.warn('[intake outbox] replay', JSON.stringify(report));
    } catch (err) {
      console.error('[intake outbox] replay failed:', err instanceof Error ? err.message : 'unknown');
    }
  });
}

async function liveSubmit(request: Request, key: string, env: LiveEnv) {
  const body = (await readJson(request)) as SubmitRequest | null;
  if (!body) return json({ ok: false, error: 'invalid' }, 400);
  cleanLinkToken(body);
  if (isBot(body)) return json(BOT_ANSWER);
  const fields = validate(body);
  if (Object.keys(fields).length) return json({ ok: false, error: 'invalid', fields }, 400);

  const device = cookieValue(request, DEVICE);
  const payload = toIngestBody(body, device && HEX64.test(device) ? device : null);
  // A call request is a request someone acts on, like a booking: if AISolar
  // does not take it, it waits in the outbox with the owner alerted.
  const ctx = { asked: !!(payload.slot || payload.requestedDay || payload.intent === 'call'), portalOrigins: portalOrigins() };
  const vh = visitorHeaders(env, request);
  // A magic link may be the lead's access token (older emails) or its booking
  // token: ingest-lead v2 reads the first from this header, the second from
  // body.leadToken (set by toIngestBody). Either way it threads, never duplicates.
  if (body.intent === 'call' && typeof body.linkToken === 'string' && LINK_TOKEN.test(body.linkToken)) vh['x-access-token'] = body.linkToken;

  // One retry with the SAME key: AISolar answers a repeat with its first answer,
  // finishes a half-done one, or says it is still busy. Never a second lead.
  let a = adaptSubmit(await sendIngest(env, payload, key, vh, 12_000), ctx);
  if (a.kind === 'retry' && !a.rateLimited) {
    await sleepMs(800);
    a = adaptSubmit(await sendIngest(env, payload, key, vh, 9_000), ctx);
  }

  if (a.kind === 'answer') {
    if (body.intent === 'call') a.body.call = { requested: true, bestTime: payload.bestTime ?? null };
    if (a.legacy) console.error('[intake submit] AISolar answered on its old path: intakeV2 is off for this door; shown as a request');
    const res = json(a.body, 200);
    if (a.deviceToken) res.headers.append('set-cookie', deviceCookie(a.deviceToken));
    if (a.body.booking.outcome === 'booked' || a.body.booking.outcome === 'moved') {
      res.headers.append('set-cookie', `si_hold=; Path=/api/intake; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    }
    kickReplay(env);
    return res;
  }
  if (a.kind === 'invalid') {
    console.error('[intake submit] AISolar refused the request:', a.note);
    // A call is a person waiting for Cal to ring (M1): a refusal must never drop
    // it. Held parked (a replay cannot help) and the owner told to add it by hand.
    if (body.intent === 'call') {
      const held = await holdInOutbox({ key, payload, reason: `aisolar_refused: ${a.note}`, refused: true }, outboxDeps());
      if (held.held) return json({ ...outboxAnswer(), call: { requested: true, bestTime: payload.bestTime ?? null } }, 200);
    }
    return json(a.body, 400);
  }
  if (a.duplicate) {
    // AISolar is still finishing this same key: the browser's retry gets the first answer.
    console.warn('[intake submit] same key still in flight at AISolar:', a.note);
    return json({ ok: false, error: 'server_error' }, 502);
  }

  console.error('[intake submit] AISolar did not accept it:', a.note);
  // The outbox is for a booking request, whose screen says "saved, not booked
  // yet, we'll call you". An "email me this estimate" is answered with a plain
  // failure instead, because its screen would say "Sent", and it was not.
  if (ctx.asked) {
    const held = await holdInOutbox({ key, payload, reason: a.note }, outboxDeps());
    if (held.held) return json(body.intent === 'call' ? { ...outboxAnswer(), call: { requested: true, bestTime: payload.bestTime ?? null } } : outboxAnswer(), 200);
    console.error('[intake submit] no outbox and no owner alert configured: the homeowner is told it failed');
  }
  return a.rateLimited ? json({ ok: false, error: 'rate_limited' }, 429) : json({ ok: false, error: 'server_error' }, 502);
}
