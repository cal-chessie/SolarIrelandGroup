# Site canon: Solar Ireland Group (solarirelandgroup.ie)

Filled 2 Sep 2026 for the website-a-star pass. Keep current; every audit/apply agent reads this verbatim.

## Identity
- Brand: Solar Ireland (Solar Ireland Group). Site: https://solarirelandgroup.ie (no www redirect). Vercel.
- Repo: `~/Desktop/SONSSONS/repos/SolarIrelandGroup`, working branch `a-star-2026` (never `main`; `main` deploys). Two pre-existing uncommitted files (`package-lock.json`, `public/solar-icon.svg`) are Cal's: never `git add -A`, add specific files only.
- Stack: Next.js 16 App Router, React 19, Tailwind v4, PostHog, Supabase-backed own CRM (admin + portal). `src/app/page.tsx` calls `unstable_noStore()` and renders `HomeClient` (the home is dynamically rendered, so a per-request CSP nonce is possible here, unlike a static site).
- Cal's own go-live step: merge to main. Never do it.

## What this business actually is (Cal, 2 Sep)
The flagship all-in-one platform: the full AI workforce, all 8 agents PLUS 3-4 more Cal built custom, running into its own custom CRM, carrying the continuity of a business relationship across the full customer lifecycle from lead to maintenance. Same methodology as the Renewably product; this is one of Cal's own live deployments and will become Renewably's real proof once it meets this standard.

## Market vocabulary canon
| Required | Banned |
|---|---|
| SEAI grant (EUR 1,800 solar cap; EUR 300 EV charger grant if cited), ESB Networks, NC6 (domestic) / NC7 (commercial), site survey, MPRN, export tariff / Clean Export Guarantee, BER, Safe Electric / RECI, I.S. 10101 | permit / permitting, utility (as in "the utility"), net metering, inspector, zip code, HOA |
Slugs, category keys, component names, asset filenames: Cal's call; display copy follows the canon.

## Truth rules
| Capability / claim | Status | Note |
|---|---|---|
| AI bill analyser / "Free AI Bill Analysis" (reads the bill, calculates savings) | CLAIMABLE | live feature (BillAnalyser.tsx); it reads the day/night split from the bill; it does NOT read a roof from a photo or satellite |
| SMS / missed-call text-back | CLAIMABLE | Twilio on every deployment |
| WhatsApp click-to-chat (wa.me link to a human) | CLAIMABLE as a contact channel | a real link (WhatsAppChat.tsx); do NOT claim an AI agent answers WhatsApp |
| All 8 agents + 3-4 custom, own CRM, lifecycle continuity, SEAI + ESB handled | CLAIMABLE | Cal's statement |
| AI answering live phone calls | NOT | |
| Roof detection / satellite yield promise | NOT | |
| "#1 Rated" (layout.tsx title x3, copy x6) | UNVERIFIED -> needs Cal | rated by whom? keep only with a sourced basis |
| AggregateRating 4.9 from 127 reviews (layout.tsx ~L297) | UNVERIFIED -> needs Cal | if real (Google/Trustpilot), source it; if placeholder it is a critical (fake rating schema) |
| "Save EUR 1,400/Year" (og title, layout.tsx ~L134) and StatsBar "Avg. Annual Saving" / "Payback Period" | UNVERIFIED -> needs Cal | specific outcomes; either a sourced basis or reframed as an illustrative estimate |
| CustomerInstalls entries "Client Home 1", "Client Home 2" | placeholder -> needs Cal | real installs with permission, or remove |
Reversals: adopt immediately when Cal states a capability shipped.

## Positioning canon
- One story: the full workforce (8 + custom), your own CRM, one platform, the whole lifecycle lead to maintenance, with the owner's approval on what goes out.
- Primary CTA: one verb sitewide (audit to find the current one and unify).
- Pricing/offer: as the pricing section states; do not invent tiers.

## Proof policy
No testimonials / reviews / AggregateRating without real permissioned proof. Placeholder installs get removed or replaced with real ones (Cal supplies). Demo/mockup numbers carry an "Illustrative data" caption. Outcome figures need a stated basis.

## Style
No em-dash character anywhere. Active voice, plain words, no slop. Cal's voice: short declarative sentences, Irish solar specifics, no marketing filler.

## Scope
IN: src/app/{page.tsx,HomeClient*,about,blog,book-survey,contact,cookies,counties,financing,privacy,services,solar-calculator,terms}, src/app/{layout.tsx,globals.css,robots.ts,sitemap.ts}, src/components/solar/**, src/components/{CookieConsent,PostHogProvider}.tsx, src/lib/{blog-data,solar-data,motion,whatsapp}.ts(x), public/**, next.config.ts.
OUT (ignore): src/app/admin/**, src/app/portal/**, src/app/api/**, src/lib/{admin-*,supabase,analytics}.ts, supabase/**.

## Known from recon (confirm, then fix)
- `.hero-fade-up` (globals.css ~L217) starts the hero h1 at `opacity: 0` with a 0.7s rise: the LCP fade.
- Two `<h1>` in `src/components/solar/Hero.tsx` (~L96 and ~L102: "Your Energy." / "Your Asset.").
- Title 89 chars, description 296 chars (both truncate).
- robots.ts lists only Googlebot/Bingbot/Slurp/DuckDuckBot: no AI-crawler rules; no llms.txt; no pricing.md.
- CSP is now issued per-request in `src/middleware.ts` (nonce + strict-dynamic, frame-ancestors 'self'); the preview-tool origins were removed and next.config keeps only the header fallbacks.
- og:image points at solarireland.org (a different domain).
- Rich JSON-LD already present (Organization #organization, LocalBusiness #business, WebSite/WebPage/Breadcrumb graph, Service, HowTo, FinancialProduct, FAQPage): confirm it parses and that FAQPage matches the rendered FAQ.

## Engineering rules
Branch `a-star-2026`. No push without an explicit yes; `ls-remote` proof after. No destructive git. Dead files to `_TRASH`, never `rm`. Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Build gate `bun run build` (or npm) must pass; lint must exit 0.

## Already done
Nothing yet on this branch (first pass).
