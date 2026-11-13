# County page playbook

County pages are **service pages of the main site**, not standalone sites. One template, one route, one data file per county:

| | |
|---|---|
| Data | `src/data/counties/<slug>.ts` (type in `types.ts`, registry in `index.ts`) |
| Template | `src/components/county/CountyPage.tsx` (+ `CountyEstimator`, `CountyActions`) |
| Route | `src/app/counties/[county]/page.tsx`, `dynamicParams = false` so an unknown county is a real 404 |

Adding Dublin or Galway means writing one data file and adding it to `COUNTIES`. Nothing else should need to change. If it does, the template is wrong; fix the template, not the copy.

Related: [docs/memory/13-the-county-network.md](memory/13-the-county-network.md) (the licensing model and why county pages must not compete with installer sites).

---

## 1. The data each county needs

Every field must be true, local and sourced. If you cannot source a field, leave the feature out rather than filling it.

| Field | What it is | Source |
|---|---|---|
| `slug`, `name`, `province` | URL slug and display name | |
| `indexable` | Preview flag. `false` = noindex and out of the sitemap | Cal flips it at go-live |
| `updated` | ISO date, the sitemap `lastmod` | change whenever the page content changes |
| `wikipedia` | `areaServed.sameAs` for the county | en.wikipedia.org |
| `pvgis.*` | Yield for the county town: annual kWh/kWp and the 12 monthly values, with the exact API URL and fetch date | PVGIS PVcalc v5.3, `peakpower=1&loss=14&angle=35&aspect=0`, same settings for every county so they compare |
| `pvgis.dublinKwhPerKwp` | The Dublin reference, same settings | the same API at 53.3498, -6.2603 |
| `towns` | Real towns and districts actually served | Cal or the licensed installer |
| `townsIntro`, `housingNote`, `farmNote` | One to three plain sentences each, specific to the county | local knowledge; no invented facts |
| `extraFaqs` | County-only questions people really search | Search Console queries, People Also Ask |

All money figures (install cost, grant, payback, savings) come from `src/lib/estimate.ts` with the county yield passed as `generationPerKwp`. **Never type a price or saving into a data file.** Grants come from `src/lib/solar-data.ts`.

## 2. Unique local substance (the doorway-page line)

Google's spam policy treats near-identical pages that only swap a place name as doorway pages. The template supplies structure and the shared facts (SEAI, ESB Networks, NC6). What makes each page earn its place is local substance, and every county needs real items from this list before `indexable` goes true:

- **Required:** its own PVGIS yield, cited with the fetch date (the template shows it in the hero, the estimator, the chart and the yield table).
- **Required:** real towns served, and county-specific housing and farm notes.
- **Strongly wanted, only with proof:** real completed installs in the county (with the homeowner's written permission for any photo or detail), local photographs taken by us, local sponsorships such as a GAA club (only if the sponsorship is real and current), local grid or planning quirks.
- **Never:** invented installs, stock photos presented as local jobs, reviews, ratings, install counts or testimonials without permissioned proof.

**The swap test:** paste another county's name into the page. If it still reads true, the page is not local enough. Aim for well over half of the visible words to be specific to the county (its yield and months, towns, housing and farm notes, local installs, local questions). The shared SEAI, NC6 and planning sections are fine because they are framed around the county and answer real questions.

**Scale gate:** at 30 county pages, re-audit uniqueness across all of them before adding more; at 50, stop and justify. Launch three, measure, then roll out (memory doc 13).

If a county cannot get at least two of the "strongly wanted" items, it does not get a page yet. Three good pages beat thirty-two thin ones (see memory doc 13 on sequencing).

## 3. Keywords and linking

- **Head terms stay on the home page:** "solar ireland", "solar panels ireland", "solar in ireland". County pages do not target them; they link up to the home page, `/counties` and the national guides.
- **County pages target** "solar <county>", "solar panels <county>", "solar installers <county>". The title pattern is `Solar Panels <County> | Installers, Costs and SEAI Grant`.
- **Town-level terms** ("solar panels Boyle") belong to the licensed installer's own county site, not here. Listing towns served is fine; building town pages here is not.
- One H1 per page. Sections answer first, then explain.
- Every county page links to `/counties`, `/`, the SEAI grant guide, the NC6 guide, the farm and business grant pages, and two or three cost guides. `/counties` links to every live county page (`COUNTY_PAGES` in `CountiesClient.tsx`).
- Never name a competitor. Official sources only: seai.ie, esbnetworks.ie, CRU, PVGIS, gov.ie.

## 4. Schema

One `@graph` per page, emitted by the template:

- `BreadcrumbList`: Home, Counties, the county.
- `Service` with `areaServed` an `AdministrativeArea` (the county, `sameAs` Wikipedia), `provider` the existing `https://solarirelandgroup.ie/#business` and `brand` the existing `#organization`. The `hasMap` and `sameAs` live on that LocalBusiness node in `src/app/layout.tsx`; county pages reference it and never mint a new LocalBusiness.
- `WebPage` with `dateModified` (the data file's `updated`), `isPartOf` the site `#website`, `breadcrumb` and `mainEntity` pointing at the Service.
- `areaServed.geo` uses the county town coordinates to 5 decimals, and `containsPlace` lists the towns served.
- `FAQPage` built from the questions actually shown on the page. Only real questions with the answer visible on the page. Google retired FAQ rich results in May 2026, so this is kept for AI answer engines, not for a SERP feature.
- **Never** `aggregateRating`, `Review` or star markup unless the reviews are real, on the page, and about this business. No new `LocalBusiness` node per county.

## 5. Tracking

Through the existing layer in `src/lib/analytics.ts` (GA4 + PostHog, consent-gated). No new vendor without reporting it first.

| Event | Fired by | Properties |
|---|---|---|
| `county_analyser_start` | any Bill Analyser door on a county page | `county`, `placement` (hero, estimator, close), `page` |
| `county_call_click` | the 15-minute call door | `county`, `placement`, `page` |
| `county_phone_click` | the phone link | `county`, `placement`, `page` (LeadSourceTracker also fires the generic `phone_click` on every `tel:` link, so the county event has its own name to avoid a double count) |
| `savings_calculator_used` | first touch of the estimator | `page` |

The intake doors also carry `door=county`, `county=<slug>` and `src=county-<slug>`, so the lead in AISolar shows which county page it came from. In GA4, register `county` and `placement` as event-scoped custom dimensions and mark `county_analyser_start`, `county_call_click` and `county_phone_click` as key events.

## 6. Preview flag

`indexable: false` in the data file gives `noindex, follow` and keeps the page out of `sitemap.xml`. Preview deployments are additionally behind Vercel deployment protection.

## 7. Go-live checklist (after the gate in section 10)

1. Cal approves the preview. Truth pass: no em dashes, no exclamation marks, no SMS / WhatsApp automation / roof detection / AI phone claims, no "SEAI Registered Partner", no competitor names.
2. Re-fetch PVGIS with the stored API URL; update the figures and `fetched` if they moved.
3. Set `indexable: true` and `updated` to today in the data file.
4. Sitemap: automatic from the flag. Check `/sitemap.xml` on the preview.
5. `llms.txt` (`src/app/llms.txt/route.ts`): add the county page to the page list.
6. `/counties`: add the slug to `COUNTY_PAGES` in `CountiesClient.tsx` so the card links in.
7. Middleware: `src/middleware.ts` only allow-lists blog slugs today, so county routes need nothing. Re-check if that changes.
8. `bun run build` and `bun run lint` pass; mobile Lighthouse 90+ Performance and 100 for Accessibility, Best Practices and SEO; CLS about 0.
9. After merge: run PageSpeed Insights on the live URL (lab now, CrUX field data once traffic builds), inspect the URL in Search Console, and watch the `solar <county>` queries in the Performance report.
10. Merge to `main` (Cal's call), then `node scripts/indexnow-ping.mjs` for the new URL and request indexing in Search Console.

## 8. On-page and AI-answer rules (from the SEO skill pass, 13 Nov 2026)

- Title 50 to 60 characters with the county and "solar panels"; description 140 to 160 characters; one H1 "Solar panels in <County>".
- The first paragraph answers "is solar worth it here" with numbers, in under 60 words, because AI answers mostly cite the top of a page.
- H2s are phrased as the questions people ask ("How much sun does <County> get?").
- Every figure carries its source inline (PVGIS, seai.ie, esbnetworks.ie) and the page shows a visible "Updated" date. Refresh each county at least quarterly and on every grant change; stale pages lose AI citations.
- The estimate is server-rendered at the reference bill so crawlers and AI agents see real numbers without JavaScript.
- Off-site presence matters more for AI answers than on-page tweaks: claim Bing Places and Apple Business Connect for the real business (not per county), and keep the GBP accurate. No fake mentions on Reddit or anywhere else.
- No named author or reviewer is shown until a real, consenting person with a real credential signs the content off. Do not invent one.

## 9. Voice, copy structure and UX copy

**Voice:** [docs/voice-profile.md](voice-profile.md) is the voice for every county. Read it before writing a data file.

**Section order (one idea per section):**
1. Hero: H1 "Solar panels in <County>", then the outcome in numbers (yield, saving, payback) and the two doors.
2. The live estimate (the interactive proof of the numbers).
3. The local fact: how much sun the county gets against Dublin, and why the roof and house matter more.
4. How it works, as steps with an actor: SEAI grant, then ESB Networks and the NC6.
5. Farms and businesses (TAMS, the SEAI business grant).
6. Proof: real installs in the county, only with permission. If there are none yet, leave the section out. Never fill it.
7. Towns served.
8. Questions (objections answered with numbers).
9. One closing invitation.

**Stop-slop pass (required for every county):** run every line of the data file and any new template copy through the `stop-slop` skill. No adverbs, active voice with a named actor, no "not X, it's Y", no throat-clearing, no pull-quote lines, varied sentence length, county facts over vague claims, no em dashes, no exclamation marks. Score it on the five dimensions (directness, rhythm, trust, authenticity, density); 40/50 or higher to ship. Record the score in the commit message.

**UX copy:**
- Buttons start with a verb and say what happens, in the site's words: "Check my savings" opens the Bill Analyser; "Book a free 15-minute call" opens the intake at the time step; "Check my savings with my bill" carries the slider's bill into the analyser. Do not invent new labels per county.
- Inputs have a visible label and a spoken value (`aria-valuetext` on the slider, "€160 a month").
- The estimator computes in the browser with no network call, so it has no loading or error state. The analyser's own loading and error states live in the intake and use its wording; county pages link into them and never restate them.
- Any estimate is captioned as a close estimate with its basis (panels only, the PVGIS yield, the bill used).

## 10. Go-live gate (website-a-star verification loop)

All of these, with the output seen, before Cal is asked to merge:

1. `bun run build` passes and lists `/counties/<slug>` under `/counties/[county]`; `bun run lint` exits 0.
2. SSR grep: `curl` the page from `bun run start` and grep for the H1, the yield figure, the reference saving and the `noindex` or `index` value you expect.
3. JSON-LD: `python3 ~/.claude/skills/website-a-star/scripts/validate_jsonld.py http://localhost:3000 counties/<slug>`; every block parses, and the Service `provider` is `#business` and `brand` is `#organization`.
4. Meta lengths: rendered title 60 characters or fewer, description 155 or fewer (`meta_lengths.py`).
5. Browser console clean on load and after moving the slider.
6. Contrast computed, not eyeballed: body text on the dark ground at `white/60` or above; never brand yellow text on a light ground.
7. LCP: the H1 or hero paragraph paints at full opacity from the first frame. Only below-the-fold elements animate, transform only, finite, off under reduced motion. No `priority` image unless it is the LCP image.
8. No theatre: every button opens something real, every figure is engine-computed or sourced and captioned.
9. Field-notes traps: no single-quoted `${...}` strings in data files, no `className=` inside HTML strings, phone and mail links encoded once, one tracking event per click (check LeadSourceTracker before adding any `tel:`/`mailto:`/`wa.me` event).
10. `~/.claude/skills/website-a-star/scripts/scan_secrets.sh` on the diff before any push; prove the push with `git ls-remote`.

## 11. Legal and policy checks

- **Google Business Profile:** no per-county GBP for Solar Ireland, and never a virtual office or mailbox address. A GBP only exists at a real, staffed premises (the licensed installer's own, for their own site). County pages never show a fake or "local" address.
- **Reviews:** no review gating (asking only happy customers, or filtering before the review link), no scripted review text, no incentives. Reviews go on the GBP that earned them.
- **Doorway pages:** see section 2. Swapping the county name is not a page.
- **Consent (GDPR and the ePrivacy Regulations, S.I. 336/2011):** analytics fire only after the visitor opts into the analytics category in the cookie banner; `trackEvent` already checks this. No tracking pixel, no fingerprinting, nothing personal in URLs or event properties (the bill amount on an intake link is not personal data; names, emails, phones and MPRNs never go in a URL or an event).
- **Photos of people or homes:** written permission from the homeowner, kept on file, before any appears.
- **Claims:** every figure must be reproducible from the engine or a cited official source on the day it is published.
