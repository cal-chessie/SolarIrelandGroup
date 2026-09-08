# 02 · Repo map, config and commands

Everything you need to run, build and navigate this repo without opening twenty files first.

← [README](README.md) · related: [08 Server, admin and portal](08-server-admin-portal.md)

---

## Commands

```bash
bun run dev      # next dev -p 3000 -H 0.0.0.0
bun run build    # next build            (the gate: must pass)
bun run start    # next start -p 3000 -H 0.0.0.0
bun run lint     # eslint .              (must exit 0)
bun run test     # vitest run
bun run test:watch
```

`bun run db:push` is a **no-op echo stub**. It pushes nothing. Do not rely on it.

> **Two lockfiles exist.** `bun.lock` is newer and authoritative; `package-lock.json` is stale. `README.md` still says `npm install`, which contradicts that. Use bun.

> **Preview discipline:** after every rebuild, `preview_stop` then `preview_start`. I repeatedly screenshotted stale builds and reported fixes that had not shipped. See [06 Frontend and mobile](06-frontend-and-mobile.md#verification-discipline).

---

## Branches and deploy

| | |
|---|---|
| Remote | `github.com/cal-chessie/SolarIrelandGroup` |
| Branches | `main` and `a-star-2026`, deliberately kept identical |
| Deploy | Vercel, automatically from `main`. **Merging to main is the go-live.** |
| Commit trailer | `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` |
| Author | Always Cal `<cal@renewably.ie>` |

Rules: no push without an explicit yes, then prove it with `git ls-remote`. No destructive git. Dead files go to `_TRASH` with a note, **never `rm`**.

`vercel.json` permanently redirects `solarireland.org` and `www.solarireland.org` to `https://solarirelandgroup.ie`. The `.org` is Cal's spare exact-match domain, registered 15 Apr 2026, never built.

---

## Stack

Next.js 16 App Router · React 19 · Tailwind v4 (CSS-first, `@tailwindcss/postcss`, no separate CLI step) · TypeScript 5 (`strict: true` but `noImplicitAny: false`) · shadcn/ui new-york, neutral · Supabase JS 2 · PostHog · Recharts · lucide-react · vitest + jsdom + testing-library. Node 20 per `.nvmrc`.

Path alias `@/*` → `./src/*`. Typecheck excludes `supabase`, `scripts`, `examples`, `skills`.

---

## Directory map

```
src/
  app/
    page.tsx + HomeClient        the home page (dynamic, unstable_noStore)
    layout.tsx                   metadata, JSON-LD graph, GA gate
    middleware.ts  (src/)        CSP nonce, host canonicalisation
    about counties services      marketing pages
    financing blog blog/[slug]
    solar-calculator             the analyser page
    book-survey                  the booking intake
    contact cookies privacy terms
    admin/  portal/[reference]/  internal-looking, currently MOCK and UNAUTHENTICATED
    api/                         9 routes, see 08
    robots.ts sitemap.ts
  components/
    solar/                       17 site components, see 06
    ui/                          shadcn primitives
    CookieConsent PostHogProvider
  lib/
    estimate.ts        THE savings engine, see 03
    solar-data.ts      canonical facts
    submitLead.ts      client intake helper
    leadBridge.ts      server forwarding core (holds the source key)
    motion.tsx         the custom animation shim, see 06
    bottomLayer.ts     mobile bottom-layer coordination
    blog-data.ts       23 articles
    analytics.ts whatsapp.ts eircode.ts supabase.ts utils.ts
    admin-mock-data.ts admin-types.ts
  __tests__/           21 tests
supabase/              schema.sql, website_leads.sql, 6 edge functions
scripts/               3 bun/python tools
docs/                  this folder, plus the canon and runbooks
public/                assets, llms.txt, pricing.md, GSC verification
_TRASH/                retired files, never deleted
```

---

## Config worth knowing

**`next.config.ts`**: `optimizePackageImports: ['lucide-react']` (works around Turbopack HMR corruption on per-icon tree-shaking). Images: `remotePatterns` allows only `solarirelandgroup.ie`, formats avif/webp. `poweredByHeader: false`, `trailingSlash: false`. A long `headers()` block sets nosniff, SAMEORIGIN, `XSS-Protection: 0`, Referrer-Policy, a Permissions-Policy blocking camera/mic/geolocation/payment/usb/interest-cohort, HSTS 2 years preload, COOP `same-origin-allow-popups`, CORP cross-origin, plus cache rules: HTML `no-store`, `/api/*` `no-store`, `/_next/static` immutable 1 year, sitemap and robots 1 hour.

**`src/middleware.ts`**: the real CSP. Per-request nonce (`btoa(crypto.randomUUID())`), `strict-dynamic`, `frame-ancestors 'self'`, PostHog host appended to `connect-src` only when it matches an https-only regex, violations posted to `/api/csp-report`. Also does www→non-www and trailing-slash 301s before the CSP work. Skips `_next/static`, `_next/image`, favicons and prefetch requests.

> **`ENFORCE_IN_PRODUCTION = false`** at line 34. CSP is **report-only** in production. That is correct for now; flipping it is a Cal decision once the report logs are clean. See [09 Open items](09-open-items.md).

**`src/app/robots.ts`**: explicitly allows the search bots and the AI/AEO crawlers: GPTBot, ChatGPT-User, OAI-SearchBot, Google-Extended, anthropic-ai, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Applebot-Extended, Amazonbot, Meta-ExternalAgent, cohere-ai. Explicitly blocks **CCBot** and **Bytespider**. Everything disallows `/api/`, `/admin/`, `/portal/`.

**`src/app/sitemap.ts`**: 12 hand-maintained static URLs plus one per blog slug. With 23 articles that is **35 URLs**, which matches what Google Search Console reported reading.

---

## Environment variables

Every `process.env` read in the codebase, and what happens when it is missing.

| Variable | Read at | Missing means |
|---|---|---|
| `AISOLAR_INGEST_URL` | `leadBridge.ts:59`, `api/survey-context:28` | Leads fall back to the SIG `website_leads` table |
| `AISOLAR_SOURCE_KEY` | `leadBridge.ts:60` | Same fallback |
| `SUPABASE_SERVICE_ROLE_KEY` | `leadBridge.ts:89` | The fallback itself fails, and the lead is lost |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | `supabase.ts:13`, `api/consent:84`, `api/admin-dashboard:10` | `supabase.ts` silently defaults to `''`; consent logging no-ops; dashboard serves mock |
| `OPENROUTER_API_KEY` | `api/analyse-bill:194`, `api/chat:184` | Analyser returns 503 `uploadUnavailable` and steers to manual entry; chat returns 503 with a WhatsApp handoff |
| `BILL_VISION_MODEL` | `api/analyse-bill:206` | Defaults to `google/gemini-2.5-flash` |
| `CHAT_MODEL` | `api/chat:213` | Same default |
| `GOOGLE_MAPS_API_KEY` | `api/eircode:47` | Eircode lookup returns `{ok:false, reason:'unavailable'}`, never blocks the UI |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | `layout.tsx:184` | Verification meta omitted |
| `NEXT_PUBLIC_GA_ID` | `layout.tsx:425`, `analytics.ts:36` | GA script not rendered at all |
| `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST` | `PostHogProvider.tsx:16`, `middleware.ts:44` | PostHog disabled, and not added to `connect-src` |

> **`.env.example` is out of date.** It does not document `OPENROUTER_API_KEY`, `GOOGLE_MAPS_API_KEY`, `BILL_VISION_MODEL` or `CHAT_MODEL`, all of which the code reads. It does document `ZAI_API_KEY`, which nothing reads.

**No secret reaches the browser.** Swept 7 Sep 2026: the four server-only secrets live in `api/*/route.ts` and `leadBridge.ts`, and `leadBridge.ts` is imported only by route handlers, never by a `"use client"` file. The `NEXT_PUBLIC_` Supabase values are the anon key, which is public by design and RLS-protected.

---

## Supabase in THIS repo

Distinct from AISolar's project. See [04](04-aisolar-integration.md) for that one.

- **`supabase/schema.sql`**: 24 tables with RLS (profiles, contact_submissions, survey_bookings, bill_analyses, blog tables, counties, testimonials, customers, documents, notifications, cookie_consent_records, chat_conversations and more). The file header claims 25; it is 24.
- **`supabase/website_leads.sql`**: the never-drop fallback table for `/api/lead`. RLS allows `service_role` only; writes work because the service-role key bypasses RLS.
- **Six edge functions**, all added in one commit (`9803bf8`) and never wired since: `admin-dashboard-api` (called by `/api/admin-dashboard`, but wrapped in try/catch with a mock fallback, so it is optional by design), and five that **no code in `src/` ever calls**: `run-automation`, `sync-gbp-reviews`, `whatsapp-qualify-lead`, `whatsapp-send-message`, `whatsapp-webhook`. They are dormant scaffolding.
- **There is no `supabase/config.toml`.** This checkout is not linked to a Supabase CLI project, which is consistent with those functions never having been deployed from here.

> The dormant `whatsapp-*` functions are a Meta Business API bot. They are **not** the WhatsApp on the live site, which is a plain `wa.me` click-to-chat link. Do not let their existence become a claim that an AI answers WhatsApp. See [01 What this is](01-what-this-is.md#truth-rules).

---

## Scripts

Run with bun or python directly; none is wired into `package.json`.

- **`scripts/integrate-blog.ts`**: `bun scripts/integrate-blog.ts <articles.json>`. Rebuilds `src/lib/blog-data.ts`, validating section shapes, category ids, unique slugs, internal link targets and **the em-dash ban** before it writes.
- **`scripts/apply-corrections.ts`**: `bun scripts/apply-corrections.ts <corrections.json> <out.json>`. Deterministic string-replace and section-delete over existing articles, reporting anything that did not match. No AI, so a correction either lands or is reported, never guessed.
- **`scripts/gen-blog-images.py`**: PIL generator for 1200x630 blog hero graphics in the site's dark ground `#0b0d10` and yellow `#facc15`, one data motif per article. Explicit placeholders until real photography lands; the shot list is in [`docs/NEXT_SPRINT.md`](../NEXT_SPRINT.md).

---

## Tests

`vitest`, jsdom, `src/__tests__/unit.test.ts`, **21 tests** covering `SOLAR_DATA` values, `buildWhatsAppUrl` construction and `cn()` merge behaviour.

> ⚠️ **The suite is currently red.** `unit.test.ts:15` asserts `SOLAR_DATA.savings.avgAnnual` is `1400`. The engine consolidation on 7 Sep lowered it to `1100` and the test was never updated. **1 failed, 20 passed.** The test is wrong, not the value: see [03](03-savings-engine.md). Fixing it is in [09 Open items](09-open-items.md).

---

## `_TRASH`

Policy, from its own README: *not deleted, parked, restore with `git mv`*.

- **`HomeEstimateIntake.tsx.retired`**: a bill-and-house-type home lead form, retired 7 Sep in commit `0ddf961` so the home page carries **one** intake (`BillAnalyser`) instead of two competing ones. Its README note records something useful: it was the only importer of `lib/estimate.ts`, so the engine looked live while three separate copies of the maths did the real work elsewhere.

---

## Other docs in `docs/`

| File | Status |
|---|---|
| [`site-canon.md`](../site-canon.md) | The 2 Sep audit canon. Vocabulary and truth rules still hold; the "known from recon" and "already done" sections are stale. |
| [`AISOLAR_LEAD_DOOR_RUNBOOK.md`](../AISOLAR_LEAD_DOOR_RUNBOOK.md) | **Complete.** Every step is done. Keep it for the SQL snippets, do not work from it as a to-do list. |
| [`AUTHORITY_CAMPAIGN.md`](../AUTHORITY_CAMPAIGN.md) | The GSC and brand-authority push. |
| [`NEXT_SPRINT.md`](../NEXT_SPRINT.md) | Carries the real-photography shot list. |
