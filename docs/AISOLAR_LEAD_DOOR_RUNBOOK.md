# SIG → AISolar lead door: go-live runbook

State as of 6 Sep 2026, all verified with tools:

- SIG side is BUILT and parked on `SolarIrelandGroup` branch `a-star-2026` @ `3910a8b`
  (`/api/lead` → forwards to AISolar `ingest-lead` with `x-source-key`; never-drop
  fallback to a SIG `website_leads` table; email-first intake UI on home,
  book-survey, exit-intent). NOT on main - held so the live form can't 502.
- Solar Ireland BRAND exists on live V5 with fixed id
  `b00daf6b-560e-4726-9f55-23810af3612b` (dark + amber theme,
  `20260806_widget_brand.sql`).
- `ingest-lead` IS deployed on live V5 (`ywizcsulurxoqjdgnkvc`) but a bad-key
  probe returns HTTP 500 `{"error":"Unknown error"}` where the code path should
  give 401 "Invalid source key" → something in its runtime is broken on live
  (suspects: `resolve_lead_door` RPC / `sources` rows not migrated, a missing
  secret, or the durable rate-limit table). Needs function logs to diagnose.
- No `src_…` door key is baked in either repo; the key must be read (or minted)
  from the live DB.
- The July management token at `~/.supabase/aisolar-token` is DEAD (401).

## Step 1 - restore access (Cal, one action)
Either drop a fresh Supabase access token into `~/.supabase/aisolar-token`
(supabase.com → account → access tokens), or run Step 2's SQL yourself in the
dashboard SQL editor for project `ywizcsulurxoqjdgnkvc`.

## Step 2 - read (or mint) the Solar Ireland door key
```sql
-- does the door exist?
select b.name, s.source_key, s.active
from public.brands b
left join public.sources s on s.brand_id = b.id and s.kind = 'website'
where b.id = 'b00daf6b-560e-4726-9f55-23810af3612b';

-- mint if missing (idempotent - same guard as 20260731_lead_doors.sql)
insert into public.sources (brand_id, tenant_id, source_key, kind, label, active)
select b.id, b.tenant_id, 'src_'||encode(gen_random_bytes(18),'hex'), 'website',
       b.name||' website', true
from public.brands b
where b.id = 'b00daf6b-560e-4726-9f55-23810af3612b'
  and not exists (select 1 from public.sources s
                  where s.brand_id = b.id and s.kind = 'website');

-- read it back
select s.source_key from public.sources s
where s.brand_id = 'b00daf6b-560e-4726-9f55-23810af3612b'
  and s.kind = 'website' and s.active;
```
Keys are brand-scoped and revocable (`sources.active=false`), injection-only by
design - safe to place in server env.

## Step 3 - fix the ingest-lead 500
Check the function logs (dashboard → Edge Functions → ingest-lead → logs) while
re-running the probe:
```bash
curl -s -X POST -H "x-source-key: src_probe_invalid" -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ANON>" -H "apikey: <ANON>" \
  "https://ywizcsulurxoqjdgnkvc.supabase.co/functions/v1/ingest-lead" \
  -d '{"name":"probe","email":"probe@example.invalid","source":"website_contact"}'
```
Expected once healthy: 401 "Invalid source key". Verify on live DB:
`select 1 from pg_proc where proname='resolve_lead_door';` and that
`public.sources` has rows. Apply `20260731_lead_doors.sql` if missing.

## Step 4 - SIG env + fallback table
- Vercel (SolarIrelandGroup project) env vars, then redeploy:
  - `AISOLAR_INGEST_URL=https://ywizcsulurxoqjdgnkvc.supabase.co/functions/v1/ingest-lead`
  - `AISOLAR_SOURCE_KEY=<the src_… key from Step 2>`
- Apply `SolarIrelandGroup/supabase/website_leads.sql` to SIG's own Supabase
  project (never-drop fallback; code degrades gracefully without it).

## Step 5 - ship + prove
- Merge SIG branch: `a-star-2026` → `main` (this is what ships the new home
  intake; NOTE the branch tip also carries two blog commits already
  cherry-picked to main - rebase the branch onto main first to avoid duplicate
  content commits: `git rebase origin/main a-star-2026` then resolve trivially).
- End-to-end proof: submit a lead on solarirelandgroup.ie with a REAL inbox →
  row in AISolar `leads` (+ touchpoint) → lead_intake agent estimate → branded
  estimate email arrives via Postmark.
- Postmark pre-check (Cal, in the AIOS account): server 20227465 must be
  APPROVED for sending to external recipients; every past test only ever went to
  cal@renewably.ie, which also passes in the pending-approval sandbox.
- Also set the Solar Ireland tenant's `tenant_brand` in `tenant_settings` so the
  estimate email is Solar Ireland-branded (resolveEmailBrand falls back to the
  AISolar default otherwise).
