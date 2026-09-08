# 12 · The bill dataset

The one asset in this market that nobody else can build, and the promise that keeps it legal.

← [README](README.md) · related: [11 AISolar back end](11-aisolar-backend.md) · [07 Content and truth](07-content-seo-and-truth.md)

---

## What it is and why it matters

Every AISolar tenant runs a bill analyser. Until 8 Sep 2026 every one of them read a customer's electricity bill, produced an estimate, and **threw the reading away**.

That was deleting the only dataset in Irish solar that a competitor cannot copy:

- **SEAI** publishes grant counts. How many systems were funded.
- **Solar Ireland (the trade association)** publishes member surveys. What installers say.
- **Neither has a consumer touchpoint.** Neither reads real bills.

We read real bills, at volume, across the country: supplier, unit rate, standing charge, annual usage, and the **day/night split**. That last field is the valuable one, because it is what separates a household solar can serve from one it cannot, and it exists nowhere else.

**The network effect is the point.** Every county site feeds it. Every installer using the software feeds it. The aggregate belongs to the platform, and each installer can be handed their own slice back as the incentive to keep feeding it. One tenant's analyser is a lead form; three hundred tenants' analysers are the national picture.

That is what turns "an installer with a website" into the source that gets cited, which is the only realistic route to competing with a trade association for the name. See [09](09-open-items.md).

---

## The promise, and why the schema enforces it

The analyser tells every visitor:

> **Your bill is deleted.** We keep anonymous county stats.

And the privacy policy spells it out in full. That promise has to survive the table, so **the table is shaped to make it true rather than trusting the writer to behave**.

| Rule | Why |
|---|---|
| No name, email, phone, MPRN, address or eircode | **No column exists for them.** They cannot be written by accident. |
| No `lead_id` | A row can never be joined back to a person. |
| **County**, not eircode | An eircode identifies a building. A county does not. |
| **Month**, not a timestamp | This is the one that is easy to get wrong. A precise `created_at` plus a county plus an annual usage figure is enough to line a row up against a `leads` row created the same second and re-identify the household. Under GDPR the test is whether **the controller** can reasonably re-identify, and we hold both tables. A timestamp here would make this personal data and the promise on the site false. |
| `source` is `bill_upload` or `manual` | A real bill read must never be mixed with typed guesses in a published statistic. |

There is no `created_at` column. That is deliberate, not an oversight.

**If you add a column, ask first whether it narrows a row toward one household.** If it does, it does not belong here.

---

## The pieces

| Where | What |
|---|---|
| `aisolar/supabase/migrations/20260908093000_bill_observations.sql` | The table, its indexes and its RLS. Service role writes; a tenant's staff may read **their own rows only**, via `has_tenant_access()`. |
| `aisolar/supabase/functions/ingest-bill-observation/index.ts` | The door. Same auth as `ingest-lead`: an `x-source-key` resolved through `resolve_lead_door()`, so a key is scoped to one brand, is revocable, and can only write for its own tenant. A caller never states its tenant. |
| `SolarIrelandGroup/src/app/api/analyse-bill/route.ts` → `recordObservation()` | The writer. **Never awaited.** The customer waits for their estimate, never for our bookkeeping, and a failure here must never cost a lead. |

**Two gates, not one.** The edge function builds its row from an explicit allow-list and coerces every value, so an upstream change that starts sending an eircode or a name cannot quietly land it: the field is simply never read. The month is stamped server-side, so a caller cannot backdate or sharpen the granularity.

**Configuration:** none of its own. The URL is derived from `AISOLAR_INGEST_URL` by swapping `ingest-lead` for `ingest-bill-observation`, and it reuses `AISOLAR_SOURCE_KEY`. If either is unset, `recordObservation` returns silently and the site behaves exactly as before.

---

## Not yet done

- **The migration is not applied and the function is not deployed.** Until then every analysis still evaporates. Apply the SQL in the Supabase editor (never `db push`, see [11](11-aisolar-backend.md)), then:
  ```bash
  cd ~/Desktop/SONSSONS/repos/AISolar/aisolar
  bunx supabase functions deploy ingest-bill-observation --project-ref ywizcsulurxoqjdgnkvc --use-api
  ```
- **The old SIG-side `bill_analyses` table in `supabase/schema.sql` is the wrong shape and should not be used.** It stores `email` and `session_id`, which is personal data, its RLS is `for insert with check (true)` which is an open pipe, and it is single-tenant. It was never wired to anything. Retire it rather than repurpose it.
- **The report itself.** The dataset is the raw material; the annual "what Irish bills actually show" piece is the thing that earns citations. Do not publish until the sample is large enough to survive a journalist asking how many bills it is based on, and always state that number.
