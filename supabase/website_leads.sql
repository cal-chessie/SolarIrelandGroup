-- website_leads — fallback capture for /api/lead
--
-- Primary path for every intake is AISolar's ingest-lead edge function. This
-- table only catches leads when AISolar is unconfigured or unreachable, so a
-- lead is NEVER dropped. Rows are written by the SIG server route using the
-- service-role key (which bypasses RLS); no public or anon access is granted.
--
-- Apply to the Solar Ireland Supabase project (Dashboard → SQL editor, or
-- `supabase db execute`). Safe to run more than once.

CREATE TABLE IF NOT EXISTS website_leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  county        TEXT,
  address       TEXT,
  monthly_bill  NUMERIC,
  annual_kwh    INTEGER,
  message       TEXT,
  meta          JSONB,
  forwarded     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS website_leads_forwarded_idx ON website_leads (forwarded) WHERE forwarded = false;

ALTER TABLE website_leads ENABLE ROW LEVEL SECURITY;

-- No public/anon policies: inserts come from the server via the service-role
-- key, which bypasses RLS. Admins (service role / dashboard) retain full access.
CREATE POLICY website_leads_admin_all ON website_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);
