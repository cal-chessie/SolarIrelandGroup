# 11 · The AISolar back end

What sits behind the door. Written for someone who has never opened the AISolar repo.

← [README](README.md) · related: [04 The integration](04-aisolar-integration.md)

Repo: `~/Desktop/SONSSONS/repos/AISolar/aisolar`. Vite + React front end, Supabase Postgres and Deno edge functions, project `ywizcsulurxoqjdgnkvc`. Roughly 85 migrations and 24 edge functions. Branch `golden-client-lead-engine`.

---

## The one-paragraph version

AISolar is a multi-tenant operating system for solar installers. One deployment serves many installer businesses. A **tenant** is a business, a **brand** is a marketing face that business puts on a website, and a **source** is a signed door that lets a website inject leads into exactly one brand. A lead lands in `leads` carrying its tenant and brand forever. From there a queue-and-worker runtime moves it through a fixed lifecycle, firing one agent per stage transition, and every customer-facing email is branded as the tenant, never as AISolar.

Solar Ireland is one tenant. Everything in [04](04-aisolar-integration.md) is that tenant walking this machine.

---

## The data model

```
tenants ──< brands ──< sources(source_key)
   │                        │
   │            resolve_lead_door(key) → {tenant_id, brand_id}
   │                        │
   └──────< leads(tenant_id, origin_brand_id, workflow_stage) <┘
                │
    ┌───────────┼───────────┬──────────────┬────────────┐
lead_intake  touchpoints  agent_queue  site_surveys  invoices
                              │              │            │
                          agent_runs     proposals ──> seai_applications
```

| Table | What it is |
|---|---|
| `tenants` | One installer business. Carries trading name, white-label accent and logo, Stripe customer and subscription, seats, trial end. Created by the `provision_tenant()` RPC at signup, which makes the card-payer admin, consultant and installer at once with a 7-day trial. |
| `brands` | Marketing identities under a tenant, so one business can run "Solar Roscommon" and "Solar Ireland" separately. Carries domain and a theme. |
| `sources` | One signed door per brand. `source_key` is unique and the header the website sends. |
| `leads` | The spine. Tenant, brand, source, `workflow_stage`, MPRN, monthly bill, annual consumption, score, assigned consultant and installer, plus an `access_token` (with expiry and revoke) that is how a customer reaches their own portal without an account. **Provenance columns never change**: `origin_source_id`, `origin_brand_id`, `origin_domain`. |
| `lead_intake` | One row per lead, the single source of truth for bill and design data as it hardens: extracted, then confirmed at survey, then finalised at proposal. |
| `touchpoints` | Append-only log of anything customer-facing: channel, direction, actor, agent, summary. |
| `site_surveys` | Surveyor, date, roof measurements, recommended design. |
| `proposals` | System size, costs, and a `status` that is **never** auto-advanced past draft by an agent. |
| `invoices` | Deposit and final amounts and their paid flags. `deposit_paid` flipping true is itself a trigger. |
| `installers` | The people who can be assigned work. `availability_status` decides whether a lead can be booked at all. |
| `tenant_settings` | `(tenant_id, key)` with a JSON value. Keys that matter: **`tenant_brand`** (drives all email and PDF branding), `pricing`, `proposal_terms`, `finance_config`, `company_compliance`. |

**Tenancy is enforced in the database.** A migration rewrote RLS across `leads` and nineteen child tables, replacing blanket `authenticated` policies with `has_tenant_access(auth.uid(), tenant_id)`, plus `can_see_lead()` and `own_lead()` helpers. Customer access is separate: the `leads` select policy compares `access_token` against an `x-access-token` header, so a homeowner can open their own record with a link and nothing else.

---

## The agent runtime

This is the part worth understanding properly, because it is where work actually happens and where it silently stopped happening for weeks.

**`agent_queue`** holds jobs: `agent_id`, `lead_id`, `trigger_data`, priority, `run_after`, `locked_until`, `attempts`, `max_attempts` (3), and `failed_at` / `failed_reason` for the dead-letter.

**A job's life:**

```
queued        run_after <= now, not locked, not failed
  ↓ claim_next_agent_job()   FOR UPDATE SKIP LOCKED, sets locked_until, attempts+1
claimed
  ↓ handler runs
success → complete_agent_job()  deletes the row
failure → fail_agent_job()      releases the lock, backs off 2^attempts minutes
                                at attempts >= max_attempts, sets failed_at
                                (dead-lettered) and notifies admins
```

**What enqueues:**

| Trigger | Fires |
|---|---|
| `leads` INSERT (`enqueue_lead_intake`) | `lead_intake` |
| `leads.workflow_stage` UPDATE (`enqueue_stage_agent`) | the agent for that stage |
| `invoices.deposit_paid` false → true | `install_coordinator` |
| pg_cron, direct with a fixed `agent_id` | `follow_up` 09:00, `customer_digest` Mon 10:00, `payment_reminder` 09:30, `stale_lead_escalator` 08:00, all Dublin time |

**`agent-drain` is the only execution path.** pg_cron calls it every minute. Per agent it claims up to 5 jobs, dispatches to a handler in its registry, writes an `agent_runs` row (queued, running, then success or failed), and calls the complete or fail RPC. Auth is either the service-role key (that is cron) or an admin JWT scoped to the same tenant (that is a manual trigger).

> **The bug that hid here for weeks.** `enqueue_lead_intake` only matched sources `bill_upload` and `ai_analyser`. Every website source (`bill_analyser`, `website_contact`, `website_chat`, `website_survey`, `website_qualified`, `exit_intent`) fell through, so **no website lead ever enqueued** and the whole autonomous chain was schema-present but dead for web leads. Fixed by `20260907120000_enqueue_website_leads.sql`. When something "sometimes works", check whether the automatic path has ever run.

---

## The lead lifecycle

`canonical_lead_stages()` defines the only legal values, and a BEFORE trigger (`assert_canonical_lead_stage`) rejects anything else, so no client can invent a stage:

```
new → intake_complete → survey_scheduled → survey_complete → proposal_drafted
    → proposal_sent → approved → deposit_paid → install_scheduled
    → installing → installed → final_paid → completed
```

| Transition | Agent |
|---|---|
| row INSERT | `lead_intake` |
| `intake_complete` | `survey_scheduler` |
| `survey_complete` | `proposal_drafter` |
| `proposal_sent` | `follow_up` |
| `approved` | `grant_submitter` |
| `installed` | `post_install` |
| `invoices.deposit_paid` → true | `install_coordinator` |

Reaching `installed` is additionally gated by `complete_install()`, a SECURITY DEFINER function bound to the current transaction id, so a raw client UPDATE cannot forge an installation.

---

## Multi-tenancy and branding

A leaked source key can only inject into its own brand, because `resolve_lead_door(source_key)` maps the key to exactly one `{tenant_id, brand_id}`. `ingest-lead` accepts either the modern per-brand `x-source-key` or a legacy single-tenant `x-ingest-key` plus a deployment secret.

**What decides the branding a homeowner sees:** `resolveEmailBrand(supabase, tenantId)` reads `tenant_settings` key `tenant_brand` for name, accent, logo, reply-to and footer. With no row, it falls back to the AISolar default, which on a customer email is a bug, not a default.

There are **two email lanes** and mixing them is the recurring failure:

- **Lane 1**, product to installer: SaaS billing and subscription mail. AISolar branding is correct here.
- **Lane 2**, tenant to homeowner: every lifecycle email. Must carry the resolved tenant brand. AISolar must be invisible.

> Most Lane 2 mail is sent **inline inside `agent-drain` handlers**, not through the standalone `send-*` functions. Several of those inline sends still hardcode an "AISOLAR team" sign-off inside an otherwise tenant-branded wrapper. That is a live Lane 2 leak and it is in [09](09-open-items.md).

Email provider is **Postmark**. Suppression is checked against `email_suppressions`, which `postmark-webhook` fills from bounces and complaints, and it fails open.

---

## Edge functions worth knowing

Twenty-four exist. These are the ones that matter for the Solar Ireland path:

| Function | Role | Auth |
|---|---|---|
| `ingest-lead` | The public door. Every website lead enters here. | `x-source-key` per brand, or legacy `x-ingest-key` |
| `agent-drain` | The worker. Runs every queued job. | service-role (cron) or admin JWT |
| `lead-context` | Resolves a magic link so a booking form can prefill | `access_token` |
| `mint-estimate-token` / `send-estimate` | One-time token, then the branded estimate PDF | signed one-time token |
| `portal-inbox` | Customer portal writes | `access_token`, no session |
| `data-rights` | GDPR access, portability, erasure | portal token or admin |
| `postmark-webhook` / `stripe-webhook` / `coinbase-webhook` / `slack-approve` | External callbacks | HMAC or provider signature |
| `extract-bill-data` | 21-field AI bill OCR | **gated off** by `BILL_EXTRACTION_ENABLED` |

---

## What exists but is not live

Knowing this stops you debugging something that was never wired, and stops you claiming a capability that does not exist.

- **`create-checkout` and the crypto rail have no callers.** The proposal page wires "accept" and "pay deposit" to toast mocks. Stripe settlement is behind two env flags, both off.
- **Five `send-*` functions have no caller**: `send-proposal-accepted`, `send-survey-notification`, `send-follow-up-digest`, `send-notification-digest`, `send-payment-reminder`. Three were deliberately unscheduled in favour of `agent-drain`'s own handlers. `send-survey-notification` is actively bypassed: the scheduler handler sends its own email inline.
- **`aigrids.route_lead()` and `gate_bridge.offer()`** are a full auto-routing layer that nothing invokes. The hardening migration says so in its own comment.
- **`extract-bill-data` 503s pre-parse** unless its flag is literally `"true"`.
- **`solar-roof`, `lead-context` and `expert-chat`** have no caller inside the AISolar repo. They are plausibly called from sibling marketing sites, which is exactly what Solar Ireland does with `ingest-lead`. Flagged rather than declared dead.

---

## Operating it

```bash
cd ~/Desktop/SONSSONS/repos/AISolar/aisolar
bunx supabase functions deploy agent-drain --project-ref ywizcsulurxoqjdgnkvc --use-api
```

**Never `bunx supabase db push` here.** Migrations are deliberately held back. Give Cal the SQL editor URL instead, and never hand him multi-line SQL to paste into a shell.

Constraints that have cost real time: `agent_runs.trigger_type` accepts only `cron`, `manual`, `db_trigger`. The failure column is `error_message`, not `error`. A missing run row after your own test is usually your own constraint violation.

**Secret names** (values never here): `SUPABASE_*`, `POSTMARK_SERVER_TOKEN` / `POSTMARK_SENDER_EMAIL` / `POSTMARK_WEBHOOK_SECRET`, `OPENROUTER_API_KEY`, `AI_API_KEY` / `AI_BASE_URL` / `AI_CHAT_MODEL` / `AI_VISION_MODEL`, `GOOGLE_SOLAR_KEY`, `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `PAYMENTS_STRIPE_SETTLEMENT_ENABLED` / `STRIPE_LIVE_APPROVED`, `COINBASE_*` / `CRYPTO_CHECKOUT_ENABLED`, `SLACK_SIGNING_SECRET` / `KERNEL_URL` / `KERNEL_SERVICE_ROLE_KEY`, `INGEST_API_KEY` / `AISOLAR_TENANT_ID`, `ALLOWED_ORIGINS`, `SITE_URL`, `OWNER_NOTIFY_EMAIL`, `BILL_EXTRACTION_ENABLED`.

---

## The one thing blocking real bookings

`survey_scheduler` fails "No available installers" on almost every run, because the `installers` table has no row for Cal's tenant with `availability_status = 'available'`. The whole chain in front of it works. One insert fixes it, and it is Cal's write to make. See [09](09-open-items.md).
