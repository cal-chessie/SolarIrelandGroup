import { randomBytes } from 'node:crypto';
import { gate, json, readJson } from '@/lib/intake/http';
import type { SubmitRequest, SubmitResponse } from '@/lib/intake/contract';
import { dublinDate, isEmail, isPhone, wallTime } from '@/lib/intake/format';
import { isValidEircode } from '@/lib/eircode';
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
 * Live (slices 1 and 2): forwards to AISolar ingest-lead with the source key;
 * on any failure it stores the payload in the site's outbox, alerts the owner
 * by the site's own mail path, and answers path "outbox" with fallback true.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEVICE = 'si_device';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Fields = Record<string, string>;

function validate(b: SubmitRequest): Fields {
  const f: Fields = {};
  if (!b || typeof b !== 'object') return { body: 'invalid' };
  if (!b.meta || (b.meta.segment !== 'domestic' && b.meta.segment !== 'commercial')) f.segment = 'invalid';
  if (typeof b.email !== 'string' || !isEmail(b.email)) f.email = 'invalid';
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

  const S = store();
  const seen = S.idem.get(key);
  if (seen) return json(seen.body, seen.status);

  const scenario = scenarioOf(request);
  if (scenario === 'rate_limited') return json({ ok: false, error: 'rate_limited' }, 429);
  if (scenario === 'fail') return json({ ok: false, error: 'server_error' }, 502);

  const body = (await readJson(request)) as SubmitRequest | null;
  if (!body) return json({ ok: false, error: 'invalid' }, 400);

  // The honeypots stay honeypots: a filled `company` or `website_url` is a bot.
  const raw = body as unknown as Record<string, unknown>;
  if ((typeof raw.company === 'string' && raw.company) || (typeof raw.website_url === 'string' && raw.website_url)) {
    return json({ ok: true, leadId: null, path: 'fresh', booking: { outcome: 'none' }, estimate: null, handoff: null, deviceToken: null, next: 'check_email' } satisfies SubmitResponse);
  }

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

  let res: SubmitResponse;

  if (scenario === 'unreachable') {
    // AISolar did not answer: the site keeps the lead in its outbox and says
    // "saved, not booked yet". Nothing is booked, nothing is claimed.
    res = { ok: true, leadId: null, path: 'outbox', booking: { outcome: 'none' }, estimate: null, handoff: null, deviceToken: null, next: 'check_email', fallback: true };
  } else if (scenario === 'duplicate') {
    // Same email within 24 hours from another device: no second booking, a
    // portal link by email, and never a word about the existing booking.
    res = { ok: true, leadId: null, path: 'deduped', booking: { outcome: 'already_booked', existing: null }, estimate: null, handoff: null, deviceToken: null, next: 'check_email' };
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
