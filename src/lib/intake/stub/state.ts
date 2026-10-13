/**
 * STUB ONLY. In-memory state for the stub routes: slot holds, idempotent
 * submit answers and this-device bookings. Process memory, never a database;
 * a server restart forgets it, which is fine for fixtures.
 *
 * Kept on globalThis so dev hot reloads do not wipe it mid-test.
 */
interface StubStore {
  holds: Map<string, { token: string; expiresAt: number }>;
  idem: Map<string, { status: number; body: unknown; at: number }>;
  devices: Map<string, { booking: { startsAt: string; endsAt: string } | null; at: number }>;
}

const g = globalThis as unknown as { __siIntakeStub?: StubStore };

export function store(): StubStore {
  if (!g.__siIntakeStub) {
    g.__siIntakeStub = { holds: new Map(), idem: new Map(), devices: new Map() };
  }
  return g.__siIntakeStub;
}

/** Live holds only; expired ones free their slot with no action (backend 3.5). */
export function liveHolds(): Map<string, { token: string; expiresAt: number }> {
  const s = store();
  const now = Date.now();
  for (const [k, v] of s.holds) if (v.expiresAt <= now) s.holds.delete(k);
  return s.holds;
}

/** Read the scenario switch the test harness sets. Stub mode only. */
export function scenarioOf(request: Request): string | null {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)si_stub_scenario=([a-z_]+)/);
  return m ? m[1] : null;
}

export function cookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
