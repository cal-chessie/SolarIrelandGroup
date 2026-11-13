> ## HARD RULES: READ BEFORE TOUCHING ANY COUNTY PAGE
>
> Cal has said it twice: county pages are real local content, never name-swapped. The Roscommon draft still failed the swap test (about 90% of its text stayed true with "Leitrim" put in, and all 8 FAQs were national text with the county name dropped in), and it was graded B+ and shown as nearly ready. Cal's words: "never allow this to happen again". These rules are enforced by code, not by good intentions.
>
> 1. **NO NAME-SWAP CONTENT.** Every county-specific section must stop being true if another county's name is put in. Text that is true for every county is shared national content: write it once, label it national, and never dress it up with the county name.
> 2. **THE SWAP TEST IS A GATE, NOT A GUIDELINE.** It runs as a test (`src/data/counties/county-gate.test.ts`, rules in `src/data/counties/gate.ts`). A failing county cannot be indexable: the build throws if it is. No agent may report a county page as ready, graded or near-done while it fails.
> 3. **LOCAL CLAIMS NEED AN OFFICIAL, DATED SOURCE** (CSO, SEAI, PVGIS, county council, SEC, ESB Networks) or they are left out. No invented local colour, no unsourced housing or farm notes, no money figures typed into data files.
> 4. **PROOF IS NEVER TEMPLATED.** Proof items (real installs with written permission, our own local photos, real sponsorships, local press) are never templated, never reused across counties, never faked. Fewer than 2 means the page stays noindex.
> 5. **COUNTY FAQS COME FROM REAL LOCAL SEARCH DATA** (Search Console, People Also Ask, the county development plan), not national questions with the name swapped. National FAQs live in one shared national block: `src/data/national-faqs.ts`, shown under "National questions".
> 6. **ONLY PROVEN LEAD-GENERATION PRACTICE IS SHARED** across counties: CTA placement, the sticky call and savings bar, the estimator, click-to-call, and the trust strip with the real rating as plain text. Nothing else bleeds from one county to another.
> 7. **REVIEWERS RUN THE GATE AND QUOTE IT.** Before calling any county page ready, a reviewer (human or agent) runs `bun run test` (or `bun test src/data/counties`) and quotes the `COUNTY GATE <slug>` lines from its output. No quote, no "ready".
>
> The gate's minimums for `indexable: true`: 3 `localFacts` (each with `source`, https `sourceUrl`, `date`), 2 `proofItems` (each with written permission evidence), 2 `localFaqs` (each with a `searchSource`), every county string passing the swap test, nothing duplicated across counties, and no euro or money figure in the data file.

# County page playbook

County pages are **service pages of the main site**, not standalone sites. One template, one route, one data file per county:

| | |
|---|---|
| Data | `src/data/counties/<slug>.ts` (type in `types.ts`, registry in `index.ts`) |
| Template | `src/components/county/CountyPage.tsx` (+ `CountyEstimator`, `CountyActions`) |
| Route | `src/app/counties/[county]/page.tsx`, `dynamicParams = false` so an unknown county is a real 404 |

Adding Dublin or Galway means writing one data file and adding it to `COUNTIES`. Nothing else should need to change. If it does, the template is wrong; fix the template, not the copy.

Related: [docs/memory/13-the-county-network.md](memory/13-the-county-network.md) (the licensing model and why county pages must not compete with installer sites).

**Building a new county? Follow section 12, "Build SOP (step by step)", in order.** Section 13 is the SEO + AEO checklist and section 14 is the policy cross-check. The evidence behind them (Google Search Central first, then Whitespark, BrightLocal, Ahrefs, Semrush, Sterling Sky, Aleyda Solis, Lily Ray and Kevin Indig) is in `docs/research/county-page-research-2026-11.md`, sections 7 and 8. By Cal's ruling, no installer or home-services brand's pages are studied or copied.

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
| `townsIntro` | One sentence naming real places in the county | the installer; no invented facts |
| `localFacts` | `{ text, source, sourceUrl, date }`, 3 or more for indexable. Our own words, one official dated fact each, rendered as "the local picture" | CSO, SEAI, PVGIS, county council, SEC, ESB Networks |
| `proofItems` | `{ kind, text, town, date, permission: { grantedBy, evidence, date }, url? }`, 2 or more for indexable. Hidden when empty | our own job records, signed permission |
| `localFaqs` | `{ q, a, searchSource }`, 2 or more for indexable | Search Console queries, People Also Ask, the county development plan |

National questions are not a data field. They live once in `src/data/national-faqs.ts` and never carry a county name. The old `housingNote`, `farmNote` and `extraFaqs` fields are gone: the first was unsourced, the second was true in every county.

All money figures (install cost, grant, payback, savings) come from `src/lib/estimate.ts` with the county yield passed as `generationPerKwp`. **Never type a price or saving into a data file.** Grants come from `src/lib/solar-data.ts`.

## 2. Unique local substance (the doorway-page line)

Google's spam policy treats near-identical pages that only swap a place name as doorway pages. The template supplies structure and the shared facts (SEAI, ESB Networks, NC6). What makes each page earn its place is local substance, and every county needs real items from this list before `indexable` goes true:

- **Required:** its own PVGIS yield, cited with the fetch date (the template shows it in the hero, the estimator, the chart and the yield table).
- **Required:** real towns served, and the gate minimums in the HARD RULES at the top of this file.
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

## 12. Build SOP (step by step)

Written 13 Nov 2026 from Google Search Central and the leading SEO and AEO research (Whitespark 2026, BrightLocal 2026, Ahrefs, Semrush, Sterling Sky, Aleyda Solis, Lily Ray, Kevin Indig), checked line by line against Google's policies (research doc sections 7 and 8). Every step names who does it and what it hands to the next step. Skip a step and the page does not ship. Nothing here relaxes the HARD RULES; where a step and the HARD RULES disagree, the HARD RULES win.

### Step 0. Pick the county

- Sequencing from memory doc 13: launch three, measure, then roll out. At 30 county pages re-audit uniqueness across all of them; at 50, stop and justify.
- Before starting, check that the county can plausibly reach the gate: at least 2 real proof items must be obtainable (installs with permission, our photos, a real sponsorship, local press about us). If not, do not start the page. Three good pages beat thirty-two thin ones.
- Never start several counties at once from one prompt or one script. Google lists "Using generative AI tools or other similar tools to generate many pages without adding value for users" as scaled content abuse.

### Step 1. Research (one to two hours per county)

Output: a short research note in the PR description listing the questions and sources found.

1. **Local questions.** Search Console queries for the county once the site has impressions; People Also Ask for "solar panels <county>", "solar grant <county>", "planning permission solar <county>" run from an Irish incognito session; the county development plan (protected structures, Architectural Conservation Areas, any solar policy). These become `localFaqs`, each with its `searchSource`.
2. **Do not study rival pages.** Cal's ruling, 13 Nov 2026: no installer's or home-services brand's pages are studied, copied or used as a model. What a good page contains comes from Google Search Central and the SEO research in the research doc, section 7. The questions people ask (point 1) and the official data (step 2) are the inputs.
3. **AI answers.** Ask ChatGPT, Perplexity and Google (AI Mode) "is solar worth it in <county>" and "solar grant <county>". Record only the kinds of source they cite (official sites, directories, local press, our own pages), not rival pages. That tells you which off-site mentions matter (step 10.5).

### Step 2. Data gathering (official Irish sources only)

Output: `localFacts` entries, each `{ text, source, sourceUrl, date }`, plus the `pvgis` block. Three facts minimum for the gate; aim for four or five so one can drop out at review.

| Source | What to pull | Where |
|---|---|---|
| CSO | Census 2022 Profile 2: share of the county's homes with solar, share of new builds with solar (Table 2.7), dwelling type, heating fuel and oil share (Tables 2.1, 2.6) | cso.ie Census 2022 Profile 2; PxStat for the table |
| SEAI | County grant counts and average system size (only from SEAI or a Dáil answer, never a third-party blog); BER spread for the county; named Sustainable Energy Communities and their Energy Master Plans | seai.ie (BER Research Tool, SEC map), oireachtas.ie debates |
| PVGIS | Annual and monthly kWh/kWp for the county town, `peakpower=1&loss=14&angle=35&aspect=0`, store the exact API URL and fetch date | re.jrc.ec.europa.eu PVcalc v5.3 |
| County council | Climate Action Plan (adoption date, targets, Decarbonising Zone), development plan planning notes, implementation reports | the council's own site |
| SECs | What the county's Sustainable Energy Communities actually did (master plan date, projects) | SEAI SEC map and the SEC's own published plan |
| ESB Networks | NC6 / NC7 rules; any county-level figure only if ESB Networks publishes it | esbnetworks.ie |

Rules for every fact:

- Open the source and read the figure yourself. A search snippet or a third-party summary is not a source.
- `date` is the source's publication or data date, not today. `sourceUrl` is https and points at the page or PDF that holds the figure.
- Write the fact in our own words, one figure, one "what it means for a homeowner" sentence. Never paste or lightly reword the source's text (Google's spam policy lists "Republishing content from other sites without adding any original content or value, or even citing the original source" as scraping).
- No euro figures in the data file. Money comes from `src/lib/estimate.ts` and `src/lib/solar-data.ts`; the gate fails the build otherwise.
- If a figure cannot be sourced, leave it out. Do not soften it into an unsourced impression ("lots of farmhouses").

### Step 3. Proof collection, with permission

Output: `proofItems`, each `{ kind, text, town, date, permission: { grantedBy, evidence, date }, url? }`. Two minimum for the gate.

- **Installs.** The licensed installer or Cal asks the homeowner in writing (email is fine) what may be shown: town, system size, battery, month, a result, a photo of the roof or house. The reply is the evidence; `permission.evidence` names where it is filed (for example "email 14 Nov 2026, filed in AISolar job <id>"). Never a street address or a face without that permission.
- **Photos.** Our own, taken on that job. Never stock, never another county's job.
- **Sponsorships.** Real and current, stated with the year. If the club links to us, the link on their site should carry `rel="sponsored"`; we never pay for a followed link (Google link spam policy).
- **Local press.** Coverage of us. Our own two-sentence summary and a link; never copy the article.
- **Reviews.** Never gated, never paid for, never written for the customer. Show the real Google rating as plain text linking to the real profile; no `aggregateRating` or `Review` markup.
- Fewer than two items: the page stays `indexable: false`. Do not move on to "ready" talk.

### Step 4. Writing

Output: the finished data file.

1. Read [docs/voice-profile.md](voice-profile.md) first.
2. Write `townsIntro`, each fact's `text`, each proof `text` and each local FAQ answer. Every string must carry a local anchor besides the county name: a figure, a town served, a dated plan. The gate checks this.
3. Answer first. Each local FAQ answer opens with the direct answer in one sentence, then the figure and its source, in under 80 words. AI answers lift self-contained passages; Google says to write this way for people anyway.
4. National text (grant rules, NC6, planning exemptions) is never rewritten per county. It lives in `src/data/national-faqs.ts` and the template.
5. `towns`: only towns the installer really serves, about a dozen at most, shown in the labelled "Towns we serve" section. Never a footer block of place names, never town pages (Google's spam policy lists "Blocks of text that list cities and regions that a web page is trying to rank for" as keyword stuffing).
6. Run the stop-slop pass (section 9). Score 40/50 or higher and record the score in the commit message. No em dashes, no exclamation marks.
7. If AI helped draft, a human checks every line against its source before commit. AI never invents a local fact, a town detail or a proof item.

### Step 5. Schema

Output: nothing new in most cases; the template emits the graph from the data file (section 4).

- Check the rendered JSON-LD: `BreadcrumbList`, `WebPage` (`dateModified` = `updated`), `Service` with `areaServed` the county as `AdministrativeArea`, `provider` `#business`, `brand` `#organization`, `FAQPage` from the questions visible on the page.
- Never a new `LocalBusiness` per county, never a county address, never `aggregateRating`, `Review` or `HowTo`.
- Every marked-up fact must be visible on the page ("Your structured data must be a true representation of the page content").

### Step 6. Gate test (must pass and be quoted)

```bash
bun test src/data/counties
```

- Quote the `COUNTY GATE <slug>: READY (indexable=...)` line and the "unique county text" line in the PR and in any report. "NOT READY" means the page is not ready, whatever else looks good.
- Then set `indexable: true` locally and run `bun run build`. `assertCountyGate` throws if an indexable county fails, so a green build is the second proof.
- Fix failures in the data, never in `gate.ts`. Loosening the gate needs Cal's explicit yes in writing.

### Step 7. Review (a second person or a separate agent, never the writer)

The reviewer:

1. Runs the gate themselves and quotes it (HARD RULE 7).
2. Opens every `sourceUrl` and confirms the figure and date match the text.
3. Opens every proof item's permission evidence and confirms it covers what is shown.
4. Reads the page with another county's name in mind (the human swap test) and flags any line that would still be true.
5. Walks the policy cross-check (section 14) row by row and the SEO + AEO checklist (section 13).
6. Checks the truth rules: no SMS, WhatsApp automation, roof or satellite detection or AI phone answering claims; no "SEAI Registered Partner"; no rival named; no office hours.

### Step 8. Preview

- Push the branch (with Cal's yes); the Vercel preview is behind deployment protection and the page renders `noindex` while `indexable` is false in the deployed data.
- Run the section 10 verification loop on the preview: build and lint, SSR curl, JSON-LD validation, meta lengths, clean console, computed contrast, LCP, no theatre, field-notes traps, secrets scan.
- Check mobile (375 px), tablet (768 px) and desktop widths with screenshots. The sticky call and savings bar, the estimator and the two doors must work at each.

### Step 9. Cal's sign-off

Send Cal, in one message: the preview URL, the quoted gate lines, the reviewer's notes, the stop-slop score and the screenshots at three widths. Only Cal's written yes moves the page on. Merging to `main` is the go-live and is Cal's call.

### Step 10. Go-live checklist

Run section 7 in full, then:

1. `indexable: true` and `updated` set to today in the same commit that Cal approved.
2. `/counties` links the page; `llms.txt` lists it; sitemap shows it with the right `lastmod`.
3. After merge: inspect the URL in Search Console and request indexing; run `node scripts/indexnow-ping.mjs` (Bing, which feeds Copilot and ChatGPT search).
4. Day 1: PageSpeed Insights on the live URL. Week 1: confirm it is indexed. Month 1: re-run the step 1 AI-answer checks and log whether our page or business is cited.
5. Off-site, for AI answers (where the studies say local AI answers come from): keep the one real Google Business Profile accurate, Bing Places and Apple Business Connect for the real business, and pitch the county's data story to local press. No fake mentions, no paid followed links.
6. Refresh: when a source publishes new data (Census, SEAI yearly figures, a council implementation report), update the fact, its `date` and `updated`. Change `updated` only when content changed.

## 13. SEO + AEO checklist

Tick every line before step 9. Each line points at the policy row in section 14 that makes it safe.

**Page and content**
- [ ] One H1 "Solar panels in <County>"; title 50 to 60 characters with the county and "solar panels"; description 140 to 155 characters, not a name swap of another county's.
- [ ] First paragraph answers "is solar worth it here" with the county's yield and the engine's saving, under 60 words, server-rendered.
- [ ] H2s phrased as the questions people ask; each section answers in its first sentence.
- [ ] 3+ official, dated local facts in our own words, each with a visible source link (P2, P3).
- [ ] 2+ permissioned proof items; the real Google rating as plain text linking to the profile (P8, P9).
- [ ] 2+ local FAQs from real search data; national questions only in the national block (P1).
- [ ] Towns served: real, about a dozen at most, in the labelled section only (P6).
- [ ] Visible "Updated" date that matches `updated`, changed only on a real content change (P5).
- [ ] Every figure engine-computed or sourced and captioned; the estimate called a close estimate.
- [ ] No author or reviewer name unless a real, consenting person with a real credential signed it off (P17).

**Linking**
- [ ] Links up to `/counties`, `/`, the SEAI grant guide, the NC6 guide, the farm and business grant pages, two or three cost guides.
- [ ] `/counties` links down to the page. No town pages, no cross-links between near-identical county pages beyond the hub.
- [ ] Outbound links to the official sources (seai.ie, esbnetworks.ie, cso.ie, the council, PVGIS). No rival named.

**Schema**
- [ ] One `@graph`: BreadcrumbList, WebPage, Service (`areaServed` AdministrativeArea, `provider` `#business`), FAQPage from visible questions (P11, P12).
- [ ] No county LocalBusiness, address, `aggregateRating`, `Review` or `HowTo` (P10, P13, P14).
- [ ] JSON-LD validates; every marked-up value is visible on the page.

**Crawl and AI access**
- [ ] Page content is in the server HTML (curl shows the H1, yield, saving, facts and FAQ answers).
- [ ] robots.ts still allows Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Applebot (P19).
- [ ] Listed in `llms.txt` (harmless; Google says it does not use it, other assistants may) (P20).

**Gate and truth**
- [ ] `COUNTY GATE <slug>: READY` quoted from a run made today.
- [ ] Stop-slop 40/50+, recorded in the commit message.
- [ ] Truth pass: no em dashes, no exclamation marks, no banned claims, no office hours.

## 14. Policy cross-check

Every practice this playbook uses or rejects, against the Google policy text it touches. Quotes are from Google's own pages, read 13 Nov 2026 (Search Central pages carry no visible date in the text we fetched; the FAQ change dates are from Search Central's own change log). Full table, with the SEO authority behind each practice: research doc section 8.

| # | Practice | Policy it touches | Policy text (quoted) | Verdict |
|---|---|---|---|---|
| P1 | One page per county on one template, in the `/counties` hub | [Spam policies: doorway abuse](https://developers.google.com/search/docs/essentials/spam-policies) | "Having multiple domain names or pages targeted at specific regions or cities that funnel users to one page"; "Creating substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy" | Safe with conditions: the gate passes (local facts, proof, local FAQs, swap test), the page is useful on its own, it sits in a browseable hub |
| P2 | Official, dated local facts written in our own words with a source link | [Spam policies: scraping](https://developers.google.com/search/docs/essentials/spam-policies) | "Republishing content from other sites without adding any original content or value, or even citing the original source" | Safe with conditions: one figure, our words, our "so what", source linked and dated |
| P3 | AI help with drafting | [Spam policies: scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies); [Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | "Using generative AI tools or other similar tools to generate many pages without adding value for users"; "Are you using extensive automation to produce content on many topics?" | Safe with conditions: a human writes from sourced facts and checks every line; one county at a time |
| P4 | Generating many county pages at once from a template or a prompt | Same as P3 | "Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings and not helping users" | Unsafe. Rejected |
| P5 | Changing `updated` / "Updated" date | [Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | "Are you changing the date of pages to make them seem fresh when the content has not substantially changed?" | Safe only when a fact, figure or proof item changed |
| P6 | Listing towns served | [Spam policies: keyword stuffing](https://developers.google.com/search/docs/essentials/spam-policies) | "Blocks of text that list cities and regions that a web page is trying to rank for" | Safe with conditions: real towns only, about a dozen, in the labelled section; no footer place blocks, no town pages |
| P7 | Town-level pages or extra county domains | Doorway abuse; [expired domain abuse](https://developers.google.com/search/docs/essentials/spam-policies) | "Having multiple websites with slight variations to the URL and home page to maximize their reach"; "Expired domain abuse is where an expired domain name is purchased and repurposed primarily to manipulate search rankings" | Unsafe. Rejected (town pages belong to the licensed installer's own site) |
| P8 | Real installs, photos, sponsorships, press, with written permission | [Review snippet guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) | "Don't include fake or undisclosed incentivized reviews on your page or in your structured data markup" | Safe with conditions: genuine, permissioned, never incentivised without disclosure |
| P9 | Real Google rating shown as plain text linking to the profile | Review snippet guidelines | "Don't aggregate reviews or ratings from other websites" (applies to markup) | Safe as text with no markup |
| P10 | `aggregateRating` or `Review` markup on county pages | Review snippet guidelines | "If the entity that's being reviewed controls the reviews about itself, their pages that use LocalBusiness or any other type of Organization structured data are ineligible for star review feature" | Unsafe. Rejected (it buys no stars; Lily Ray lists AggregateRating misuse among sites that lost visibility in early 2026) |
| P11 | `FAQPage` markup from the questions visible on the page | [Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies); FAQ change log | "Don't mark up content that is not visible to readers of the page"; FAQ rich results: "This feature will no longer appear in Google Search starting May 7, 2026" | Safe with conditions: visible questions only; expect no SERP feature, kept for other answer engines |
| P12 | `Service` + `areaServed` referencing the one real LocalBusiness | Structured data policies | "Your structured data must be a true representation of the page content" | Safe |
| P13 | A new `LocalBusiness` per county with a county address | [LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business); GBP guidelines | `address`: "The physical location of the business"; "If your business rents a physical mailing address but doesn't operate out of that location, that location isn't eligible for a Business Profile" | Unsafe. Rejected |
| P14 | `HowTo` markup for the grant or NC6 steps | Search Central (HowTo rich results retired Sept 2023) | No rich result is shown for HowTo | Do not use: no benefit, extra surface for mismatch errors |
| P15 | A Google Business Profile per county, or a virtual office | [GBP guidelines](https://support.google.com/business/answer/3038177) | "There should only be one profile per business"; "P.O. boxes or mailboxes located at remote locations aren't acceptable"; "If you're a service-area business, you should hide your business address from customers" | Unsafe. Rejected. One real GBP, service area set, address hidden if no visitors |
| P16 | Sponsorship of a local club that links to us | [Spam policies: link spam](https://developers.google.com/search/docs/essentials/spam-policies) | "Exchanging money for links, or posts that contain links"; acceptable "as long as they are qualified with a rel=\"nofollow\" or rel=\"sponsored\" attribute" | Safe with conditions: real and current; ask the club to mark the link `rel="sponsored"`; never buy followed links |
| P17 | Named author or reviewer | Creating helpful content | "Something that helps people intuitively understand the E-E-A-T of content is when it's clear who created it" | Safe with conditions: a real, consenting person with a real credential, or no name at all |
| P18 | Partner installer content on our domain | [Spam policies: site reputation](https://developers.google.com/search/docs/essentials/spam-policies) | "third-party content is published on a host site mainly because of that host's already-established ranking signals" | Safe with conditions: our words about the partner, signed off; never their promo content to borrow our rank |
| P19 | Answer-first sections, question H2s, inline sources, server-rendered | [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) | "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary"; "a page must be indexed and eligible to be shown in Google Search with a snippet" | Safe: it is writing for people; Google treats it as normal SEO |
| P20 | AI-only content, chunked pages, `llms.txt` as a ranking lever | [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) | "There's no requirement to break your content into tiny pieces"; no need to "create new machine readable files, AI text files, markup, or Markdown" because "Google Search itself doesn't use them" | `llms.txt` safe and harmless (other assistants); separate AI-only content or chunked pages rejected |
| P21 | Allowing OAI-SearchBot and PerplexityBot | [OpenAI bots](https://developers.openai.com/api/docs/bots); [Perplexity bots](https://docs.perplexity.ai/guides/bots) | "OAI-SearchBot is used to surface websites in search results in ChatGPT's search features"; PerplexityBot is "designed to surface and link websites in search results on Perplexity" | Safe and required for those answer engines |
| P22 | Review gating or incentivised reviews | Review snippet guidelines; GBP policies | "Reviews written in exchange for a benefit" (listed as not allowed without clear disclosure) | Unsafe. Rejected |
| P23 | Tactics aimed only at AI answers (planted mentions, self-ranking "best" lists, prompt bait) | [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) (clarified 15 May 2026) | Spam includes "attempting to manipulate generative AI responses in Google Search" | Unsafe. Rejected |
