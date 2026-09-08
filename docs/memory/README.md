# Solar Ireland · project memory

**If you are an agent picking this repo up, start here and read in order. It is written to be read in full.**

Everything known about this site and its integration with AISolar, split so you can hold one topic at a time. Every claim was verified against the source or the git history on 7 September 2026, and where something is uncertain it says so rather than guessing.

---

## Read in this order

| | | Read it when |
|---|---|---|
| **[01 · What this is](01-what-this-is.md)** | The business, the AISolar frame, the standing rules, the vocabulary | **Always. Read this first.** |
| **[02 · Repo map](02-repo-map.md)** | Commands, branches, config, env vars, directory map, tests, `_TRASH` | You need to run, build or find something |
| **[03 · The savings engine](03-savings-engine.md)** | Every constant with its evidence, the 4 kWp floor, scale pricing, the daytime cap | **Before touching any number, anywhere** |
| **[04 · The AISolar integration](04-aisolar-integration.md)** | The lead chain hop by hop, the two silent breakages, the two PDFs, deploy commands | You are touching intake, the agent, or estimate email |
| **[05 · Pricing and offers](05-pricing-and-offers.md)** | The three packages, the marketing package, the rule about fixing one price | Before editing any published price |
| **[06 · Frontend and mobile](06-frontend-and-mobile.md)** | The motion shim, the bottom layer, the chat on a phone, verification discipline | You are changing UI, or something looks broken |
| **[07 · Content, SEO and truth](07-content-seo-and-truth.md)** | What may be claimed, what was removed as untrue, every figure in copy, schema traps | You are writing or editing copy |
| **[08 · Server, admin, portal](08-server-admin-portal.md)** | The nine API routes, the unauthenticated demo apps, where the secrets are | You are touching anything server-side |
| **[09 · Open items](09-open-items.md)** | Cal's next builds, verified defects, decisions only he can make | **Every session. This is the to-do.** |
| **[10 · History and lessons](10-history-and-lessons.md)** | Why it looks like this, the mistakes, decisions not to reverse | Before deciding something here is arbitrary |
| **[11 · The AISolar back end](11-aisolar-backend.md)** | The data model, the agent runtime, tenancy and branding, what is scaffolded but not live | You are working on the platform side, or need to know what is real |

---

## The one-screen version

**Solar Ireland is AISolar's golden client.** AISolar is the product Cal sells to installers; this site is his own live deployment, dogfooded so the frontend is right before another installer sees it. Every change here is two changes: what it does for this installer, and what it proves about the product.

**One savings engine**, [`src/lib/estimate.ts`](../../src/lib/estimate.ts). There used to be four and the same bill got different answers. The AISolar agent mirrors it inline because Deno cannot import from the Next app; that mirror is the only permitted copy and the two change together.

**The site gives a close estimate, never a proposal.** Conservative constants, panels only, no battery in the savings, 4 kWp floor. The battery is the consultant's to sell.

**Every intake goes to AISolar** through `submitLead` → `/api/lead` → `leadBridge` → `ingest-lead` → a DB trigger → `agent-drain` → an estimate PDF and an owner brief. A real bill read earns the full two-page PDF; manual entry gets the compact one plus a written letter.

**Standing rules:** no em dashes anywhere a human sees. No slop. The front desk is open 24/7, never suggest office hours. Never claim SMS, WhatsApp automation or roof detection on this site. No testimonials without permissioned proof. Official sources only, never a competitor. Dead files to `_TRASH`, never `rm`. No push without an explicit yes.

**Right now:** the site is live on `main`, the funnel is proven end to end, and the two things blocking real bookings are both in AISolar, not here. The test suite is red on one stale assertion. Several corrections landed in one place and missed their siblings. All of it is in [09](09-open-items.md).

---

## What is deliberately not in here

- **Secrets.** No keys, no tokens. Env var *names* and what breaks without them are in [02](02-repo-map.md).
- **Anything unverified stated as fact.** Where a thing is contested it is written as a conflict, not resolved by me. The testimonial question in [09](09-open-items.md) is the live example.
- **The blog article bodies.** Twenty-three articles were not re-swept for stale figures in the 7 Sep pass, and [07](07-content-seo-and-truth.md) says so rather than implying coverage.

---

## Keeping this true

This is memory, so a stale line here is worse than no line. When you change something the docs describe, update the doc in the same commit.

- A number changes → [03](03-savings-engine.md) or [05](05-pricing-and-offers.md), and re-grep the copy inventory in [07](07-content-seo-and-truth.md).
- A defect in [09](09-open-items.md) gets fixed → strike it from the table, and if it taught something, add it to [10](10-history-and-lessons.md).
- Cal settles an open decision → move it out of [09](09-open-items.md) into wherever it now belongs, and note the reversal rule in [10](10-history-and-lessons.md) if it must not be undone.

The sibling docs in `docs/` are older and narrower: [`site-canon.md`](../site-canon.md) (the 2 Sep audit canon, vocabulary still good, status sections stale), [`AISOLAR_LEAD_DOOR_RUNBOOK.md`](../AISOLAR_LEAD_DOOR_RUNBOOK.md) (complete, keep for the SQL), [`AUTHORITY_CAMPAIGN.md`](../AUTHORITY_CAMPAIGN.md), [`NEXT_SPRINT.md`](../NEXT_SPRINT.md) (holds the photography shot list).

*Written 7 September 2026, from a full read of the repo, the git history and the AISolar side.*
