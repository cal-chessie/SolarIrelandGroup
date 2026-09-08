# 04 · The AISolar integration

**Solar Ireland is the door. AISolar is the product behind it.** This page is the whole path a lead walks, every hop, and every place it has silently died.

← [README](README.md) · related: [03 Savings engine](03-savings-engine.md) · [09 Open items](09-open-items.md)

---

## The operating frame

AISolar is the product Cal sells to installers. Solar Ireland is his **golden client**: his own live deployment, dogfooded for weeks so the frontend gets right before other installers see it. Every change here is really two changes: what it does for Solar Ireland, and what it proves about AISolar.

The two repos are separate:

| | Solar Ireland | AISolar |
|---|---|---|
| Path | `~/Desktop/SONSSONS/repos/SolarIrelandGroup` | `~/Desktop/SONSSONS/repos/AISolar/aisolar` |
| Stack | Next.js 16 App Router, React 19, Tailwind v4, bun | Supabase, Deno edge functions |
| Deploy | Vercel from `main` | `bunx supabase functions deploy` |
| Branch | `main` and `a-star-2026`, kept in sync | `golden-client-lead-engine` (from `pkg-02-truth-j1`) |

---

## The chain

```
  site form
    └─ submitLead()                     src/lib/submitLead.ts
        └─ POST /api/lead               src/app/api/lead/route.ts
            └─ forwardLead()            src/lib/leadBridge.ts
                ├─ AISolar ingest-lead  header: x-source-key
                │     └─ leads insert
                │         └─ trigger enqueue_lead_intake()
                │             └─ agent_queue row
                │                 └─ agent-drain (pg_cron)
                │                     └─ lead_intake handler
                │                         ├─ estimate PDF  → customer, Postmark
                │                         └─ solarbrief    → owner, Postmark
                └─ fallback: SIG website_leads table (never lose a lead)
```

### Live identifiers

| | |
|---|---|
| AISolar project | `ywizcsulurxoqjdgnkvc` |
| Solar Ireland brand | `b00daf6b-560e-4726-9f55-23810af3612b` |
| Tenant | `664e46db-…` |
| Source key | `src_d283e…` (server env only, never the browser) |
| Minted by | `20260731_lead_doors.sql` |

**Read the `sources` table before minting anything.** The door already exists; minting blind creates a second one and splits the lead stream.

---

## The two silent breakages

Both were fixed 7 Sep 2026 and both are proven live. They are recorded here because each was invisible for weeks and each wasted hours chasing the wrong suspect.

### The trigger never matched the site

`enqueue_lead_intake()` only fired on sources `bill_upload` and `ai_analyser`. The site sends `bill_analyser`, `website_survey`, `website_contact`, `website_chat`, `website_qualified` and `exit_intent`. **No website lead had ever auto-enqueued.** Every "successful" estimate in the history of this system was a drain someone ran by hand.

Postmark was blamed first and was never the problem. Widened by `20260907120000_enqueue_website_leads.sql`, which now matches all six website values plus the two legacy ones.

**The lesson:** when an automated thing "sometimes works", check whether the automated path has ever actually run, before debugging the thing at the end of it.

### The unique index ate every email record

`touchpoints_one_per_agent_per_lead_per_day` rejected the agent's second insert on the same lead, every time, so the record of the email being sent was silently dropped. Fixed by consolidating to **one** touchpoint per lead.

**Proof it now works:** a lead fired at 20:50 was picked up unattended by cron in about 60 seconds, `emailKind: compact_pdf`, `estimateEmailSent: true`, and the first `channel:"email"` touchpoint this system has ever written.

---

## What the site sends

`LeadInput` in `src/lib/submitLead.ts`. Sources are a closed set, validated again server-side against `ALLOWED_SOURCES` in the route:

`bill_analyser` · `website_survey` · `website_qualified` · `exit_intent` · `website_contact` · `website_chat`

Top-level fields: `name`, `email`, `phone`, `county`, `address`, `eircode`, `monthlyBill`, `annualKwh`, `message`.

Everything else travels in `meta`, and every one of these makes the estimate less of a guess. Before 7 Sep the platform only ever saw a monthly figure and an annual usage:

`page` · `homeType` · `estimatedAnnualSaving` · `surveyDate` · `surveyTime` · `segment` (domestic/commercial) · `occupants` · `provider` · `packageInterest` · `roofType` · `householdSize` · `billRead`

### Guards on the door

- **Honeypot**: hidden `company` and `website_url` fields. Tripped means accept with 200 and drop silently, so the bot learns nothing.
- **Rate limit**: 12 requests per IP per 60s, in-process (`leadBridge.ts`). Best effort only, since it does not survive a cold start. Real rate limiting still needs infra Cal picks.
- **`sanitiseBillRead()`**: the analyser's read is model output and therefore untrusted. Bounded to 30 keys, keys stripped to `[\w.-]` and 40 chars, values coerced to string and cut at 120 chars.
- **Name derivation**: AISolar requires a name plus an email or phone. Rather than reject a valid contact for want of a name, the route derives one from the email local part.
- **Never drop**: if AISolar is unreachable the lead persists to SIG's own `website_leads` table and the response carries `fallback: true`. **Success copy must not promise an inbox on that path**, because no estimate email fires from the fallback.

---

## What the agent does with it

`handleLeadIntake` in `aisolar/supabase/functions/agent-drain/index.ts`.

### Two paths, two documents

```ts
const hasRealBillRead = Boolean(lead.mprn) || Boolean(billRead);
const pdfVariant = hasRealBillRead ? "full" : "compact";
```

An MPRN only ever appears when a real bill was actually read.

| | Real bill read | Manual entry |
|---|---|---|
| PDF | **full**, two pages | **compact**, the same document on one page |
| Chart height | 176 | 120 |
| Insights | 3 | 2 |
| Read status | bordered card | plain text line |
| Page 2 | "Your next steps", 3-step journey | none, footer reads "Page 1 of 1" |
| Cover email | `buildEstimateEmailBody`, short, "your full estimate is attached" | `buildBillInsightEmailBody`, a written letter |

**Do not swap these.** I got them backwards once and Cal corrected me: *"youve confused the 2 the full pdf comes from the bill insight and is more richer. the manual should be the 2 pages you previously had on one page."*

> **Naming trap:** `buildBillInsightEmailBody` is the letter sent when there is **no** bill yet. Its job is to say what the typed figures genuinely tell us and to ask for a booking or a bill upload. The name reads backwards; the behaviour is correct.

### The email adapts to what came in

`buildBillInsightEmailBody` grows a paragraph for each field it actually has: `occupants` (household size), `segment === 'commercial'` (commercial maths), `packageInterest` (which package they clicked). It also takes `propertyType` and `county`. A rich intake reads differently from a bare one, which was Cal's ask: *"can we work into it changes based on what we recieve just like the estimate too?"*

### The owner brief

`doorBreakdown()` tallies `leads.source` for the tenant over the last 30 days and returns counts by label, so the solarbrief shows **which intake is actually producing leads**. This was Cal's ask: *"if a lead comes in through 1 of the intakes more than the next one i should be able to see that in the aisolar platform, or at least in the solar brief."*

`SOURCE_LABELS` gives them plain names: Bill analyser · Survey booking · Contact form · Chat · Business enquiry · Exit popup · Bill upload · AI analyser · Added by hand.

### The mirrored engine

The agent mirrors [`src/lib/estimate.ts`](../../src/lib/estimate.ts) inline because Deno cannot import from the Next app. Verified at parity 7 Sep 2026:

| Constant | Site | Agent |
|---|---|---|
| Yield | 950 | 950 ✓ |
| Unit rate | 0.35 | 0.35 ✓ |
| Standing charge | 250 | 250 ✓ |
| Export | 0.20 | 0.20 ✓ |
| Self-use band | 0.30-0.50 | 0.30-0.50 ✓ |
| Day share | 0.6 | 0.6 ✓ |
| Grant | 1800 | 1800 ✓ |
| Base / first tier / above | 1800 / 1600 / 700 | 1800 / 1600 / 700 ✓ |
| Domestic min | 4 | 4 ✓ |
| Max kWp | 9.7 (detached) | 9.7 ✓ |
| **Battery pricing** | 1500 + 340/kWh | **absent** |

The battery gap is deliberate and harmless today: the agent never prices a battery, which matches the panels-only stance in [03](03-savings-engine.md). It becomes a real divergence the moment anyone asks the agent to quote storage. **Change both files or neither.**

---

## The other agents

Ten handlers are registered in `agent-drain`: `lead_intake`, `survey_scheduler`, `proposal_drafter`, `follow_up`, `grant_submitter`, `install_coordinator`, `post_install`, `customer_digest`, `stale_lead_escalator`, `payment_reminder`. None is orphaned; each has a firing path.

- **`leads` insert trigger** → `lead_intake`
- **`leads.workflow_stage` change trigger** → `survey_scheduler`, `proposal_drafter`, `follow_up`, `grant_submitter`, `post_install`
- **`invoices` insert trigger** → `install_coordinator`
- **pg_cron direct** → `customer_digest` (Mon 10:00 Dublin), `payment_reminder` (daily 09:30), `stale_lead_escalator` (daily 08:00)

---

## Deploying and diagnosing

```bash
cd ~/Desktop/SONSSONS/repos/AISolar/aisolar
bunx supabase functions deploy agent-drain --project-ref ywizcsulurxoqjdgnkvc --use-api
```

**Never run `bunx supabase db push` in this repo.** It would apply migrations that are deliberately held back. Give Cal the SQL editor URL and let him paste there. And do not hand him raw multi-line SQL to paste into a shell: he hit a dangling `function>` prompt in zsh doing exactly that.

Gotchas that cost real time:

- `agent_runs.trigger_type` accepts only `cron`, `manual`, `db_trigger`. It is a check constraint, not a convention. `manual_verify` fails.
- The failure column is `error_message`, not `error`.
- A missing `agent_runs` row after your own test is usually your own constraint violation, not a pre-existing bug in Cal's system. Check that before reporting it as one.

---

## Historical: the go-live runbook

[`docs/AISOLAR_LEAD_DOOR_RUNBOOK.md`](../AISOLAR_LEAD_DOOR_RUNBOOK.md) was the 6 Sep plan for standing this up. **Every step in it is now complete**: the key is minted, the env is set on Vercel, `website_leads.sql` is applied, the funnel is proven end to end, and the `ingest-lead` 500 is resolved. Keep it for the SQL snippets; do not work from it as a to-do list.
