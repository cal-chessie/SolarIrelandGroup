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

---

## Appendix: research and evidence (merged 14 Nov 2026)

This is the full research behind the HARD RULES, the Build SOP and the policy cross-check. It lives here so no session can miss it. Sources are SEO and marketing authorities and Google Search Central only; never study rival installers.

### County service pages: what wins, what is safe, and the Roscommon fix list

Research date: 13 Nov 2026. Scope: Solar Ireland Group county service pages (template `src/components/county/CountyPage.tsx`, data `src/data/counties/<slug>.ts`, branch `county-pages-preview`, playbook `docs/county-page-playbook.md`). Research only; no code changed.

Skills applied: seo-local, ai-seo, seo-geo, seo-page, seo-content, cro, copywriting.

Evidence rule used in this report: Google's own policy text is quoted as policy. Industry studies (Whitespark, BrightLocal, Invoca, Unbounce, Sterling Sky) are cited as what they are: expert surveys, consumer surveys or vendor data, not Google statements. Anything I could not verify against a primary source is marked **(verify)**.

---

### 0. The short answer for Cal

The draft is a good **template** and a weak **page**. Every number is honest and sourced, the schema is clean, and the two doors are right. But it fails its own swap test: put "Leitrim" in place of "Roscommon" and almost every line still reads true, because the only Roscommon-specific words are the PVGIS figures, twelve town names and three short notes. That is exactly what Google's doorway policy describes, and it is also why it reads flat to Cal: there is nothing about Roscommon a Roscommon person would recognise.

The fix is not "local news" in the newspaper sense. It is a small set of **county data slots** filled from official Irish sources (CSO, SEAI, the county council's own climate plan, Sustainable Energy Communities), plus **real proof** (installs, photos, sponsorships) only when it exists. Those slots are what make a page earn its place, keep it fresh honestly, and give people something worth reading.

---

### 1. What top-ranking local service pages do in 2025 to 2026

### 1.1 What the ranking studies say

**Whitespark Local Search Ranking Factors 2026** (expert survey, 47 experts, 187 factors, published Nov 2025; [whitespark.ca/local-search-ranking-factors](https://whitespark.ca/local-search-ranking-factors/)):

| Rank | Top local **organic** factors | Top **AI search** visibility factors |
|---|---|---|
| 1 | Dedicated page for each service | Presence on expert-curated "best of" lists |
| 2 | Geographic keyword relevance of content | Dedicated page for each service |
| 3 | Quality/authority of inbound links | Prominence on key industry-relevant domains |
| 4 | Keywords in GBP landing page title | Quality/authority of unstructured citations (newspaper articles, blogs, gov sites, associations) |
| 6 / 7 | Internal linking across the site | Quantity of unstructured citations (newspaper articles, blog posts) |
| 10 | Keywords in anchor text of inbound links | Scannable content structure (headings, bullets, images) |

Top **conversion** factors in the same report: high Google rating (4 to 5), positive sentiment in review text, proximity, mobile-friendly site, quantity of native Google reviews with text, open at time of search, recency of reviews, dedicated page for each service. "Photo and video quality (not stock)" ranks 11th.

What this means for us: a dedicated county page is the right shape. What moves it is (a) genuinely local content, (b) mentions of the business in local papers, council or community sites, and (c) reviews. The last two live off the page, so the page must give local press and community groups a reason to link and mention.

**Google's own local ranking statement** ([support.google.com/business/answer/7091](https://support.google.com/business/answer/7091)): "Local results are mainly based on relevance, distance, and popularity." Prominence is based on "how many websites link to your business and how many reviews you have." "There's no way to request or pay for a better local ranking on Google." For a service-area business with no premises in Roscommon, the map pack is mostly out of reach (distance); the county page competes in the **organic** results and in **AI answers**. That is where content quality decides.

**BrightLocal Local Consumer Review Survey 2026** (1,002 US adults, Feb 2026; [brightlocal.com/research/local-consumer-review-survey](https://www.brightlocal.com/research/local-consumer-review-survey/), summarised by [PinMeTo](https://www.pinmeto.com/news/brightlocal-local-consumer-review-survey-2026/)): AI use for local recommendations rose from 6% to 45%; 74% only care about reviews from the last three months; 47% will not use a business with fewer than 20 reviews **(verify the last two against the full report)**. US sample; direction holds for Ireland, exact figures may not.

**Sterling Sky on service area pages** ([sterlingsky.ca](https://www.sterlingsky.ca/how-to-create-unique-and-helpful-service-area-pages-for-local-businesses/)): recommends first-party data (typical job prices), case studies, service-specific reviews, staff with credentials, original job photos, local landmarks and events, and real community ties such as sponsorships. Warns that thin, repetitive area pages risk a penalty and that AI-generated hyper-local content performed poorly in their testing. Their client case studies (LawnSavers, A1 Garage Door) attribute lead growth to richer local landing page content.

### 1.2 The pattern, element by element

| Element | What winning pages do | Evidence |
|---|---|---|
| Proof | Real local jobs: photo, town, system size, result, with permission | Sterling Sky; Whitespark conversion factors (photos not stock, review text) |
| Local content | Facts only true of that place, sourced and dated | Whitespark #2 organic factor (geographic relevance); Google doorway policy (section 2) |
| Maps | Service-area businesses show an area, not a fake pin. Embedded Google Maps are not a ranking factor | seo-local skill notes; Google GBP rules on service areas |
| Reviews | Recent, many, with text, on Google; shown on the page as a link out, not as self-serving star markup | Whitespark conversion top 10; Google review snippet policy (section 2) |
| FAQs | Real questions with the answer visible; FAQ rich results are gone, so FAQs serve people and AI answers | Google retired FAQ rich results in May 2026 per [multiple reports](https://ppc.land/google-kills-faq-rich-results-what-seos-saw-coming-since-2019/) **(verify on Search Central)** |
| CTAs | Primary action above the fold, repeated after proof and at the end; phone tap on mobile | Section 5 |
| Speed | Mobile-friendly, fast first paint | Whitespark conversion #4; Core Web Vitals |
| Schema | Accurate Service + areaServed + breadcrumb; no invented ratings | Google structured data policies |
| AI answers | Answer-first paragraphs, figures with sources, visible updated date, server-rendered | Google AI features guide via ai-seo skill: "still SEO"; seo-geo: 44% of AI citations from the first 30% of a page (SE Ranking) |

---

### 2. Safe versus risky under Google's policies

Primary source: [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies) and [Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

### 2.1 The policy text that matters

- **Doorway abuse:** "Doorway abuse is when sites or pages are created to rank for specific, similar search queries." Listed example: "Having multiple domain names or pages targeted at specific regions or cities that funnel users to one page." Also: "Creating substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy."
- **Scaled content abuse:** "many pages are generated for the primary purpose of manipulating search rankings", including "Using generative AI tools or other similar tools to generate many pages without adding value for users."
- **Site reputation abuse:** "third-party content is published on a host site mainly because of that host's already-established ranking signals."
- **Helpful content warning signs** (Google: answering yes is "a warning sign"): "Are you producing lots of content on many different topics in hopes that some of it might perform well?"; "Are you using extensive automation to produce content on many topics?"; "Are you changing the date of pages to make them seem fresh when the content has not substantially changed?"; "Are you writing to a particular word count?"
- **Who / How / Why:** "Is it self-evident to your visitors who authored your content?", "avoid using deceptive authorship information", and "'Why' is perhaps the most important question."
- **Reviews markup** ([review snippet docs](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)): if a business controls the reviews about itself, its LocalBusiness or Organization pages "are ineligible for star review feature", even via a third-party widget. "Don't aggregate reviews or ratings from other websites." Marked-up reviews must be visible on the page.

### 2.2 Safe / risky table

| Item | Safe | Risky or banned | Why |
|---|---|---|---|
| County pages on one template | Yes, if each has real local substance and sits in a browseable hub (`/counties`) | 26 or 32 pages that differ by name and yield only | Doorway: "pages targeted at specific regions or cities" |
| Templated text | Shared sections (SEAI, NC6, planning) framed for the county, answering real questions | `${C.name}` dropped into otherwise identical paragraphs and FAQs | Doorway + scaled content; fails swap test |
| AI-written local copy | AI to draft from a sourced fact, human checks and edits | Generating "local colour" paragraphs per county | Scaled content abuse; Sterling Sky found AI hyper-local content weak |
| Local news / events | Dated, sourced items about energy in the county (council plan, SEC, grant data), written by us, linking to the source | Rewriting local press stories, generic county news, event listings with no energy link, auto-feeds | Off-topic churn is a "search engine first" sign; copying is copyright risk; thin |
| Freshness | Update `updated` only when a data slot changes | Bumping the date with no real change | Quoted Google warning sign |
| GAA / community sponsorship | A real, current, paid or in-kind sponsorship, stated plainly with year | "Proud supporters of" with no real deal; buying a club link as a "sponsorship" with a followed link | Truth rule; Google link spam policy treats links given in exchange for money or goods as link schemes unless qualified (`rel="sponsored"` on the club's side) |
| Hosting a partner's content | Our own words about a partner installer, signed off | Letting a third party publish its own promo content on our domain to borrow our rank | Site reputation abuse |
| Embedded Google Map | Optional. For a service-area business, a static, self-hosted map of the towns served is better | A Maps iframe pin implying a Roscommon office | Not a ranking factor; implies a false address; loads Google cookies before consent under Irish ePrivacy rules (S.I. 336/2011) **(DPC cookie guidance applies; verify specific embed treatment)** |
| Photos | Our own photos of real Roscommon jobs, with written homeowner consent | Stock images or other counties' jobs captioned as local | Deceptive; playbook already bans it |
| Review markup | None on county pages. Link to the real Google profile and show the real current rating as text | `aggregateRating` or `Review` on Service/LocalBusiness | Self-serving reviews ineligible; risk of manual action |
| FAQPage schema | Keep, built from visible questions only | FAQ markup for hidden or promotional Q&A | Structured data guidelines |
| Author / reviewer | A real, named, consenting person with a real credential | Invented "solar expert" byline | "avoid using deceptive authorship information" |

---

### 3. Local news, community awareness and engaging reading, done safely

### 3.1 The principle

Do not run a news feed. Build a **"Solar in Roscommon: the local picture"** section from a fixed set of **data slots**. Each slot is a short paragraph (2 to 4 sentences) with one figure, its official source, and a date. A slot that cannot be filled with a real, sourced fact is **left out**, not padded. Refresh slots when the source publishes, not on a calendar. This gives:

- local substance that passes the swap test,
- honest freshness (the date moves because a number moved),
- reading that a local person finds interesting ("only 9% of new Roscommon homes built since 2016 use solar"),
- passages AI answers can quote, with sources.

### 3.2 Slots and the Irish official sources for each

| Slot | What it says | Source (official) | Refresh |
|---|---|---|---|
| Sun and yield | Annual and monthly yield vs Dublin (already built) | PVGIS v5.3, re.jrc.ec.europa.eu | Yearly |
| Weather context (optional) | Sunshine hours at the nearest Met Éireann station | met.ie historical data (station list; pick the nearest station that records sunshine) **(verify which station)** | Yearly |
| Solar uptake in the county | Share of homes with solar panels, and share of new builds | CSO Census 2022 Profile 2, Table 2.7 "Occupied dwellings by type of renewable energy source, year built and administrative county" and Map 2.1 ([cso.ie](https://www.cso.ie/en/releasesandpublications/ep/p-cpp2/censusofpopulation2022profile2-housinginireland/occupieddwellings/)). Roscommon fact, verified: "In Roscommon (9%), Leitrim (11%) and Kerry (13%), new builds were much less likely to use solar energy." | At Census 2027 release |
| Housing stock | Dwelling type mix, heating fuel (oil share), age of homes | CSO Census 2022 Profile 2 tables 2.1 and 2.6 by county; CSO PxStat | At Census release |
| Grants in the county | Number of SEAI solar grants in the county last year, and average system size | SEAI scheme data; county breakdowns appear in Dáil answers (oireachtas.ie debates) and SEAI releases. Third-party analysis of SEAI 2025 data puts Roscommon's average installed system at 6.78 kWp, third largest in Ireland ([energyefficiency.ie](https://energyefficiency.ie/?p=22543)) **(verify against SEAI or a Dáil answer before use)** | Yearly (Jan to Feb, when SEAI publishes the prior year) |
| Home energy ratings | Share of the county's homes rated D or worse | SEAI BER Research Tool (county filter) **(verify current URL)** | Twice yearly |
| Council climate plan | What the county council has committed to | Roscommon County Council Climate Action Plan 2024 to 2029, adopted January 2024; Decarbonising Zone in Roscommon Town; implementation reports incl. "Implementation Report 2025" ([roscommoncoco.ie climate action](https://www.roscommoncoco.ie/en/services/climate-action/roscommon-climate-action-plan/decarbonisation-zone-roscommon-town.html)) | When a new implementation report appears |
| Community energy | Named Sustainable Energy Communities in the county and what they do | SEAI SEC map, filter by county ([seai.ie sec-map](https://seai.ie/community-energy/sustainable-energy-communities/sec-map)). Verified Roscommon example: Castlerea Town Team SEC, Energy Master Plan Oct 2022, supported by Roscommon County Council ([SEAI PDF](https://www.seai.ie/community-energy/sustainable-energy-communities/sec-map/uploads/reg_14_0_EMP157%20-%20Castlerea%20EMP%20Report%20V3.pdf)); council newsletter cites new Energy Master Plans incl. Ballaghaderreen **(verify current list)** | Twice yearly |
| Local grants beyond SEAI | Business and farm routes | Local Enterprise Office (LEO Roscommon) energy efficiency supports; Department of Agriculture TAMS 3 solar; Roscommon LEADER Partnership **(verify current scheme names and rates)** | On scheme change |
| Planning quirks | Protected structures, Architectural Conservation Areas, airport safeguarding where relevant | County Development Plan (roscommoncoco.ie); planning exemptions S.I. 493/2022 | On plan change |
| Grid notes | NC6 vs NC7 thresholds; any local grid constraint only if ESB Networks publishes it | esbnetworks.ie. ESB does not publish county NC6 counts that I could find; a Dáil question or a request to ESB Networks is the route | On change |
| Local press | Coverage **of us** or of the official data above | Roscommon Herald, Roscommon People, Shannonside FM. Link and summarise in our own words; never copy | When it happens |
| Installs | Town, system size, battery, month, one-line result, photo | Our own job records, written homeowner consent | As jobs complete |
| Sponsorships | Club or group, what we fund, since when | Our own signed agreement | As it happens |

### 3.3 Writing rules for these slots

- One fact per slot, figure first, source inline, date visible ("CSO Census 2022").
- Explain what it means for a homeowner in one sentence (the "so what"), never more.
- No adjectives about the county ("beautiful Roscommon"). No tourism copy. No GAA chat that is not a real sponsorship.
- No rewritten press stories. Our own two sentences and a link.
- Each slot is a typed, optional field in the data file with `value`, `source`, `sourceUrl`, `asOf`. The template renders only filled slots.

---

### 4. The clean split

### 4a. Universal template (best practice, identical structure on every county)

1. Breadcrumb, one H1 "Solar panels in <County>", answer-first hero (under 60 words) with yield, saving, payback, and the two doors plus phone.
2. Live estimator, server-rendered at the reference bill.
3. Yield chart and table vs Dublin, PVGIS cited with fetch date.
4. SEAI grant steps and ESB Networks NC6 steps (shared national facts, framed around the county).
5. Farms and businesses (TAMS, SEAI non-domestic).
6. **Local picture section** that renders only the filled county slots from 3.2.
7. **Proof section** that renders only real installs; hidden when empty.
8. Towns served (list, no town pages).
9. FAQ: a **small** shared core (grant, NC6, planning) plus county FAQs.
10. "How we worked out these figures" box: engine, PVGIS settings, bill used, who checked it (when a real person signs it).
11. Closing invitation with the same two doors.
12. Trust strip near CTAs: real Google rating and count as text linking to the real profile (no markup), SEAI/RECI or Safe Electric registration only if true and current.
13. Sticky mobile action bar (call, check my savings), consent-gated tracking, visible Updated date, schema graph (BreadcrumbList, WebPage, Service, FAQPage), internal links up to `/counties`, home and guides.

Proven lead-gen practices that are fine to repeat on every county: the two-door CTA pattern, the estimator, the phone tap, the trust strip, the methodology box, the FAQ format.

### 4b. County-unique slots (must differ on every county)

- PVGIS yield and monthly profile (have).
- Towns served, confirmed by the installer (have).
- Housing note and farm note, **rewritten from CSO figures**, not impressions.
- At least three filled "local picture" slots from 3.2 (uptake, housing stock, council plan or SEC are available for every county from official sources).
- Two or more county FAQs from real queries (Search Console, People Also Ask), e.g. a planning question tied to that county's development plan.
- Proof items: installs, photos, sponsorships, press, when real.
- Meta description wording beyond the name swap.

Gate before `indexable: true`: unique visible words over half the page (playbook rule), at least three local-picture slots, at least two county FAQs, and at least one proof item. A county that cannot meet it stays noindex.

### 4c. Never template

- Reviews, ratings, testimonials, install counts.
- Photos of jobs or people.
- Sponsorships, community ties, press mentions.
- "Local team", "local office", any address, any map pin.
- County statistics typed by hand without a source and date.
- Adjectives about the county or its people.
- Author or reviewer names.
- FAQ answers that only change the county name (keep these to the shared core and make sure county FAQs outnumber the name-swap ones over time).

---

### 5. Lead-generation patterns with evidence

| Pattern | Evidence | Apply |
|---|---|---|
| Phone tap on mobile, visible in hero and in a sticky bar | Invoca home services benchmarks: phone leads convert at about 46% (2025) vs typical web form/click rates of 2 to 5% cross-industry ([Invoca](https://www.invoca.com/blog/lead-conversion-rate-benchmarks)); vendor data, and not a like-for-like comparison. Older BrightLocal survey: 60% prefer to call a small business (2019, US) | Keep `phone` in hero (have). Add a sticky bottom bar on mobile: "Call" and "Check my savings" |
| Interactive estimator | seo-geo: interactive tools raise selection by AI; CRO: a tool turns intent into a personal number. Unbounce home improvement median conversion 2.6%, top performers 19.5% ([Unbounce](https://unbounce.com/industry/home-improvement/)) | Have. Put the "Check my savings with my bill" door right under the estimator result (have) |
| Primary CTA above the fold, repeated after proof and at the end | CRO skill; standard practice | Have hero, estimator, close. Add one after the local picture or proof section |
| Trust next to the CTA | Whitespark conversion #1, #2, #5, #7 are review signals | Show real Google rating + count as linked text beside the hero doors. No markup |
| Low-friction first step | Fewer fields convert better (CRO form guidance); bill upload does the work of a form | Keep the Bill Analyser as door one; never put a long form on the county page |
| Booking a call slot | Reduces the "will someone pester me" fear; the call door already opens the intake at the time step | Keep; say "15 minutes, no visit, no obligation" only if true |
| Local proof near the decision | Sterling Sky; Whitespark "photos not stock" | Proof cards beside the closing CTA once installs exist |
| Speed | Whitespark conversion #4 mobile-friendly; playbook gate 90+ mobile performance | Have (93) |
| AI-answer readiness | 45% use AI for local recommendations (BrightLocal 2026); Invoca reports ChatGPT-referred calls convert at about 41% (vendor) | Answer-first paragraphs, sourced figures, local slots that are quotable |

What not to do: popups on arrival, countdown or "only 3 slots left" urgency, fake chat, "X people in Roscommon got a quote today".

---

### 6. Prioritised fix list for the Roscommon draft

Current state (read from `county-pages-preview`): `roscommon.ts` has PVGIS data, 12 towns, `townsIntro`, `housingNote`, `farmNote`, no `extraFaqs`. Template has 8 FAQs, all built by dropping `${C.name}` into shared text. No proof, no local picture, no reviews, no photos.

**P0 (blocks indexable: true)**

1. **Fails the swap test.** Roughly 90% of visible words survive a name swap. Add the county-slot model (section 3.2) to `types.ts` and the template, and fill at least three Roscommon slots: CSO new-build solar 9% (verified), CSO housing stock and oil heating share (pull Table 2.6), Roscommon County Council Climate Action Plan 2024 to 2029 and the Roscommon Town Decarbonising Zone (verified), Castlerea SEC Energy Master Plan (verified).
2. **Unsourced housing claim.** `housingNote` says Roscommon "has many bungalows and farmhouses" and "a lot of homes where someone is in during the day". Plausible, but no source. Replace with CSO dwelling-type and household figures, or cut.
3. **The "worth about twice what export earns" line** in `housingNote` is a money claim typed into a data file, which the playbook forbids. Compute it from the engine (import rate vs CEG) or move it to the template where it is derived.
4. **FAQs are all name-swapped.** Cut the shared core to the questions that really are national (grant, NC6, planning) and phrase them without the county name. Add two or three Roscommon FAQs from Search Console or People Also Ask once the page has impressions; until then, from the council development plan (protected structures, Architectural Conservation Areas) and the farm angle.
5. **No proof yet.** Per the playbook, Roscommon needs two "strongly wanted" items before indexing. Ask the licensed installer for permissioned Roscommon installs (town, size, battery, month, photo) and confirm whether any sponsorship is real.

**P1 (before launch)**

6. **Trust strip beside the hero doors:** real Google rating and review count as text linking to the real profile. No `aggregateRating` markup.
7. **Sticky mobile action bar** (Call, Check my savings) with the existing consent-gated events and a new `placement` value.
8. **"How we worked out these figures" box** under the estimator: engine, PVGIS settings, reference bill, date. Add a named reviewer only when a real person signs off.
9. **Freshness discipline:** `updated` changes only when a slot or figure changes. Add `asOf` per slot so the page can say what changed.
10. **Towns section:** add one sourced line per area only if real (e.g. where the SEC or Decarbonising Zone is). Keep the no-town-pages rule.

**P2 (after launch)**

11. Local press and links: send the "only 9% of new Roscommon homes use solar" data point, with our yield figures, to Roscommon Herald, Roscommon People and Shannonside as a data story. This is how the page earns unstructured citations, Whitespark's #4 and #7 AI visibility factors.
12. Off-site: Bing Places and Apple Business Connect for the real business (already in playbook), and real community ties (SEC talks, a sponsored club) that produce honest mentions.
13. Re-check the SEAI 6.78 kWp county average and the yearly county grant count against SEAI or a Dáil answer, then add as a slot.
14. Static, self-hosted county map of towns served (SVG), no Google Maps iframe.
15. Minor a11y: the hero stats use `<dd>` before `<dt>` inside `<dl>`; swap the order or use a list.

---

### Sources

- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google, Creating helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google review snippet structured data: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- Google Business Profile, local ranking: https://support.google.com/business/answer/7091
- FAQ rich results retirement (secondary): https://ppc.land/google-kills-faq-rich-results-what-seos-saw-coming-since-2019/ ; https://www.techwyse.com/news/ai-search/google-faq-rich-results-deprecated-2026
- Whitespark 2026 Local Search Ranking Factors: https://whitespark.ca/local-search-ranking-factors/
- BrightLocal Local Consumer Review Survey 2026: https://www.brightlocal.com/research/local-consumer-review-survey/ ; summary https://www.pinmeto.com/news/brightlocal-local-consumer-review-survey-2026/
- Sterling Sky, service area pages: https://www.sterlingsky.ca/how-to-create-unique-and-helpful-service-area-pages-for-local-businesses/
- Invoca lead conversion benchmarks: https://www.invoca.com/blog/lead-conversion-rate-benchmarks
- Unbounce home improvement benchmarks: https://unbounce.com/industry/home-improvement/
- CSO Census 2022 Profile 2, occupied dwellings: https://www.cso.ie/en/releasesandpublications/ep/p-cpp2/censusofpopulation2022profile2-housinginireland/occupieddwellings/
- Roscommon County Council climate action and Decarbonising Zone: https://www.roscommoncoco.ie/en/services/climate-action/roscommon-climate-action-plan/decarbonisation-zone-roscommon-town.html ; implementation reports https://www.roscommoncoco.ie/coco/en/services/climate-action/implementation-reports/
- SEAI SEC map: https://seai.ie/community-energy/sustainable-energy-communities/sec-map
- Castlerea SEC Energy Master Plan: https://www.seai.ie/community-energy/sustainable-energy-communities/sec-map/uploads/reg_14_0_EMP157%20-%20Castlerea%20EMP%20Report%20V3.pdf
- SEAI 2025 solar data analysis (third party, verify): https://energyefficiency.ie/?p=22543 ; SEAI year-end statement https://www.seai.ie/news-and-events/news/end-of-year-statement

Limits: WebSearch here is US-indexed, so I could not pull a live Irish SERP for "solar panels Roscommon"; do that check in an incognito Irish session or via Search Console once the page has impressions. No competitor is named, by rule.

---


### 7. What the SEO and AEO authorities say about local service pages (added 13 Nov 2026)

Scope ruling from Cal, 13 Nov 2026: this research uses **only** search authorities (Google Search Central first, then Whitespark, BrightLocal, Moz, Ahrefs, Semrush, Search Engine Land and Search Engine Journal, Sterling Sky, Aleyda Solis, Lily Ray, Kevin Indig). No installer, trades or home-services brand's pages are studied or cited. Every source was opened on 13 Nov 2026; the date given is the source's own publication date. Skills applied: seo-local, ai-seo, seo-geo, seo-schema, seo-page, seo-content.

Evidence grading, as in section 0: Google is policy; surveys are expert opinion; studies are correlation from one tool's data, not Google statements.

### 7.1 Google Search Central (the primary authority)

| Point | Quote | Source | Date |
|---|---|---|---|
| AI answers use the same rules as Search | "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary"; the page must be "indexed and eligible to be shown in Google Search with a snippet"; "no special schema.org structured data that you need to add" | [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) | read 13 Nov 2026 |
| AEO and GEO are SEO | Optimising for generative AI search "is still SEO"; "There's no requirement to break your content into tiny pieces"; no need to "create new machine readable files, AI text files, markup, or Markdown" because "Google Search itself doesn't use them"; Business Profiles "can help your products and services to be visible in both AI responses and other Google Search results" | [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) | read 13 Nov 2026 |
| Spam rules now cover AI answers | Spam includes "attempting to manipulate generative AI responses in Google Search"; Google: "the Google Search spam policies also apply to generative AI responses in Google Search" | [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies); reported by [Search Engine Roundtable](https://www.seroundtable.com/google-spam-policies-apply-ai-responses-41331.html) | 15 May 2026 |
| Doorways | "Having multiple domain names or pages targeted at specific regions or cities that funnel users to one page"; "Creating substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy" | Spam policies | read 13 Nov 2026 |
| City lists | Keyword stuffing includes "Blocks of text that list cities and regions that a web page is trying to rank for" | Spam policies | read 13 Nov 2026 |
| FAQ rich results gone | "This feature will no longer appear in Google Search starting May 7, 2026"; documentation removed 15 June 2026 | Search Central change log | 8 May 2026 |
| Fake and incentivised reviews | "Don't include fake or undisclosed incentivized reviews on your page or in your structured data markup" | [Review snippet](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) | read 13 Nov 2026 |
| One Business Profile, no virtual offices | "There should only be one profile per business"; "P.O. boxes or mailboxes located at remote locations aren't acceptable"; "If you're a service-area business, you should hide your business address from customers" | [GBP guidelines](https://support.google.com/business/answer/3038177) | read 13 Nov 2026 |

The full policy table is section 8.

### 7.2 Local ranking and AI-visibility research

| Finding | Source | Date |
|---|---|---|
| Top local organic factors: dedicated page for each service; geographic keyword relevance of content; quality of inbound links; internal linking. Top AI visibility factors: presence on expert "best of" lists; dedicated page for each service; prominence on industry domains; quality of unstructured citations (newspapers, gov sites, associations); geographic relevance of content; scannable structure | [Whitespark Local Search Ranking Factors 2026](https://whitespark.ca/local-search-ranking-factors/) (47 experts, survey) | 6 Nov 2025 |
| A service area page should carry: area finder, booking button, a local value proposition, "How it works" covering process and licensing, a map of the service radius, reviews from that city, an image gallery of local work, community involvement, local media coverage; "Never offer any kind of incentives in exchange for reviews" | [Whitespark, Guide to the perfect service area landing page](https://whitespark.ca/guides/guide-to-the-perfect-service-area-landing-page/) (Miriam Ellis) | 18 Dec 2025 |
| Across AI Overviews, AI Mode and ChatGPT for local prompts: Google Business Profile 28.5% of citations; business websites 42% of citations and 93% of unique cited domains; ChatGPT leans more on Yelp and Bing; service-area businesses mentioned less than storefronts (29.4% vs 33.6%); repeat runs overlap only 20 to 33% | [BrightLocal, Local AI Visibility Study](https://www.brightlocal.com/research/local-ai-visibility-study/) (about 200,000 prompts, about 1,300 locations, US/UK/AU) | 16 Sep 2026 |
| Per platform: GBP about 67% of AI Overview and about 53% of AI Mode local citations; Yelp about 61% of ChatGPT local citations | [BrightLocal, AI directory sources](https://www.brightlocal.com/resources/ai-directory-sources/) (60,970 checks) | 26 Aug 2026 |
| 45% of consumers used AI tools for local recommendations (up from 6%); 74% look for reviews from the last three months; 47% will not use a business with fewer than 20 reviews | [BrightLocal Local Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/) (1,002 US adults) | 11 Feb 2026 |
| Only 37.9% of AI Overview citations rank in the top 10 for the query (down from about 76% in July 2025); Ahrefs puts the change down to query fan-out | [Ahrefs, AI Overview citations and the top 10](https://ahrefs.com/blog/ai-overview-citations-top-10/) (863K SERPs, about 4M cited URLs) | 2 Mar 2026 |
| AI Overviews mostly fire on informational queries (80% desktop); 35% are questions starting "how", "what", "is"; transactional under 3% | [Semrush AI Overviews study](https://www.semrush.com/blog/ai-overviews-study/) (200,000 keywords, US) | 22 Jul 2025 |
| Location pages: no "Mass-produced local pages that prioritize quantity over quality"; no pages for areas with no tangible presence; no name-swapped content; no generic place history; original photos; for no-storefront businesses show the service area, not a pin | [Ahrefs, Location pages](https://ahrefs.com/blog/location-pages) (Despina Gavoyannis) | 22 Dec 2023 |
| Service area page content: job photos, case studies, first-party data, service-specific reviews, staff bios with credentials, community ties such as sponsorships. Their test of ChatGPT writing hyper-local content "failed pretty epically" | [Sterling Sky, unique and helpful service area pages](https://www.sterlingsky.ca/how-to-create-unique-and-helpful-service-area-pages-for-local-businesses/) (Elizabeth Rule) | 9 Jan 2024 |
| Choose locations "based on real customer demand"; do not create pages for areas you do not serve; small towns often outperform big ones | [Sterling Sky, picking locations for service area pages](https://www.sterlingsky.ca/pick-locations-for-service-area-pages/) (Colan Nielsen) | 24 Jun 2024 |
| Similar service area pages can rank, but in a 2026 update Sterling Sky warns "you need to be super careful when doing this at scale, as Google can penalize scaled content" | [Sterling Sky, service area pages and duplicate content](https://www.sterlingsky.ca/service-area-pages-duplicate-content/) (Colan Nielsen; 2026 note in comments) | 20 Jan 2023, updated 2026 |
| AI search checklist: self-contained passages; direct answers first; citation-worthy (accurate, current, sourced, with author and organisation); topic depth for query fan-out; images and tables in clean HTML; authority through bylines, original research and reputable mentions; local signals; allow GPTBot and PerplexityBot, server-side render, no nosnippet | [Aleyda Solis, AI Search Content Optimization Checklist](https://www.aleydasolis.com/en/ai-search/ai-search-optimization-checklist) (her page blocked our fetcher; points taken from the [PPC Land report](https://ppc.land/seo-expert-releases-ai-search-content-optimization-checklist/)) | 16 Jun 2025 |
| Sites that lost visibility (and AI Overview presence) in early 2026 shared: self-promotional "best" content at scale, year-based refreshes with no real change, likely AI-generated content, "Highly similar, templated pages at scale", and "misuse of AggregateRating schema on ineligible pages". "what works today may quietly become a liability tomorrow" | [Lily Ray, Is Google finally cracking down on self-promotional listicles?](https://lilyraynyc.substack.com/p/is-google-finally-cracking-down-on) | 3 Feb 2026 |
| Self-promotional pages get cited in AI Overviews without the brand being recommended: in 100 B2B queries, 69% of the time Google cited a brand's own list but did not recommend the brand | [Lily Ray, Why calling yourself the best could be helping your competitors](https://lilyraynyc.substack.com/p/why-calling-yourself-the-best-could); covered by [Search Engine Land](https://searchengineland.com/google-ai-overviews-cite-self-serving-listicles-recommend-competitors-480573) | 2026 |
| AI Overview users skim: 86% skimmed, median scroll depth 30%; when a recognised authority or .gov result was present it was chosen first 58% of the time; 38% of sessions showed reassurance-seeking (opening a second source to check) | [Kevin Indig, UX study of Google's AI Overviews](https://www.searchenginejournal.com/ux-study-of-googles-ai-overviews/546580/) (Search Engine Journal, 69 to 70 users) | 13 May 2025 |
| OpenAI: "OAI-SearchBot is used to surface websites in search results in ChatGPT's search features" (recommended to allow); GPTBot is the training crawler. Perplexity: PerplexityBot is "designed to surface and link websites in search results on Perplexity" | [OpenAI bots](https://developers.openai.com/api/docs/bots); [Perplexity bots](https://docs.perplexity.ai/guides/bots) | read 13 Nov 2026 |

Not reachable: moz.com blocked our fetcher, so Miriam Ellis's Moz guide "Overcoming Your Fear of Local Landing Pages" is not quoted here; her December 2025 Whitespark guide above covers the same ground. Search Engine Land's local AI guide and Lily Ray's Search Engine Land interview returned 403.

### 7.3 What the authorities agree on, and what it means for a county page

1. **A dedicated page per service and area is the right shape, but only with real local substance.** Whitespark ranks it first for organic and second for AI visibility; Ahrefs, Sterling Sky and Google's doorway text all draw the same line at name-swapped or no-presence pages. Our gate enforces that line.
2. **Local substance means first-hand proof and sourced local data,** not landmarks or place history. Sterling Sky and Whitespark list job photos, case studies, reviews from that area, community ties and local press; Ahrefs warns against generic place history. Our `localFacts` (energy facts from CSO, SEAI, PVGIS, the council, SECs) and `proofItems` are the safe form of both.
3. **Answer first, cite sources, stay current.** Aleyda Solis's checklist, Kevin Indig's finding that users skim the top third and cross-check authorities, and Google's own advice point the same way: a direct answer near the top, a figure with its official source, a visible date. Google adds that this is normal SEO, not a special AI format, and that chunking pages for AI is not needed.
4. **Off-page signals decide much of AI visibility.** BrightLocal finds the business website is the biggest single citation source but GBP leads on Google's AI surfaces and Yelp/Bing on ChatGPT; Whitespark's top AI factors are lists, industry domains and press mentions. So the county page must be the best-sourced answer, and the one real GBP, Bing Places and real local press do the rest.
5. **Scale and automation are now the main risk.** Google's May 2026 clarification puts AI answers under the spam policies; Lily Ray's 2026 analysis ties visibility losses to templated pages at scale, fake freshness and AggregateRating misuse; Sterling Sky's own 2026 note warns about scaled service area pages. One county at a time, gated, is the defensible pace.
6. **As a service-area business we start behind.** BrightLocal finds storefronts are mentioned more in local AI answers. We cannot fix that with a fake address (GBP guidelines forbid it), so we compete on content quality, reviews on the one real profile, and mentions.

Correction to section 1.2: the FAQ rich result retirement is now confirmed on Google's own change log (above), so its **(verify)** mark can go. BrightLocal's 74% and 47% figures in section 1.1 are now verified against the full report.

---

### 8. Policy cross-check: each practice against Google's text (added 13 Nov 2026)

Primary sources, all read 13 Nov 2026: [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies), [Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business), [Review snippet](https://developers.google.com/search/docs/appearance/structured-data/review-snippet), [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Guidelines for representing your business on Google](https://support.google.com/business/answer/3038177). The fetched Google pages show no "last updated" text, so the read date is given; FAQ dates come from the Search Central change log. The "Recommended by" column names the section 7.2 authority that backs the practice.

| # | Practice | Recommended by | Policy text (quoted) | Verdict |
|---|---|---|---|---|
| P1 | One page per county, template plus local data, in the `/counties` hub | Whitespark 2026 (#1 organic factor), Ahrefs, Sterling Sky | Doorway: "Having multiple domain names or pages targeted at specific regions or cities that funnel users to one page"; "Creating substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy" | Safe with conditions: gate passes, hub exists |
| P2 | Official, dated local facts in our own words, source linked | Aleyda Solis (citation worthiness), Sterling Sky (first-party data) | Scraping: "Republishing content from other sites without adding any original content or value, or even citing the original source" | Safe with conditions |
| P3 | AI help with drafting, human-checked from sourced facts | (Sterling Sky warns AI hyper-local copy failed) | "Using generative AI tools or other similar tools to generate many pages without adding value for users"; "Is the use of automation, including AI-generation, self-evident to visitors through disclosures or in other ways?" | Safe with conditions |
| P4 | Generating many county pages at once | (Lily Ray 2026, Sterling Sky 2026 warn against it) | "Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings and not helping users" | Unsafe. Rejected |
| P5 | Changing the "Updated" date | Aleyda Solis (current), seo-geo freshness data | "Are you changing the date of pages to make them seem fresh when the content has not substantially changed?" | Safe only on a real content change |
| P6 | Listing towns served | Whitespark (service area finder) | "Blocks of text that list cities and regions that a web page is trying to rank for" | Safe with conditions: real towns, about a dozen, labelled section |
| P7 | Town pages or extra county domains | (Sterling Sky, Ahrefs: only real presence) | "Having multiple websites with slight variations to the URL and home page"; expired domain abuse: "purchased and repurposed primarily to manipulate search rankings" | Unsafe. Rejected |
| P8 | Permissioned real proof (installs, photos, sponsorships, press) | Sterling Sky, Whitespark guide | "Don't include fake or undisclosed incentivized reviews on your page or in your structured data markup" | Safe with conditions |
| P9 | Real Google rating as plain text linking to the profile | Whitespark (reviews in top conversion factors) | "Don't aggregate reviews or ratings from other websites" (markup) | Safe as text, no markup |
| P10 | `aggregateRating` / `Review` markup on county pages | (Lily Ray lists AggregateRating misuse among 2026 losers) | "If the entity that's being reviewed controls the reviews about itself, their pages that use LocalBusiness or any other type of Organization structured data are ineligible for star review feature" | Unsafe. Rejected |
| P11 | FAQPage from visible questions | Aleyda Solis (Q&A phrasing, structured data) | "Don't mark up content that is not visible to readers of the page"; FAQ rich results "no longer appear in Google Search starting May 7, 2026" | Safe with conditions; no SERP feature |
| P12 | Service + areaServed pointing at the one real business | seo-schema skill | "Your structured data must be a true representation of the page content" | Safe |
| P13 | A LocalBusiness or address per county | (Ahrefs: SABs show an area, not a pin) | LocalBusiness `address`: "The physical location of the business"; GBP: "If your business rents a physical mailing address but doesn't operate out of that location, that location isn't eligible" | Unsafe. Rejected |
| P14 | HowTo markup | (none) | HowTo rich results retired Sept 2023 | No value; not used |
| P15 | GBP per county or virtual office | (none) | "There should only be one profile per business"; "P.O. boxes or mailboxes located at remote locations aren't acceptable" | Unsafe. Rejected |
| P16 | Local sponsorship that links back | Sterling Sky, Whitespark (community involvement) | Link spam: "Exchanging money for links, or posts that contain links"; acceptable when "qualified with a rel=\"nofollow\" or rel=\"sponsored\"" | Safe with conditions |
| P17 | Named author or reviewer | Aleyda Solis, Sterling Sky (staff credentials) | "Something that helps people intuitively understand the E-E-A-T of content is when it's clear who created it" | Safe with conditions: real, consenting, credentialed |
| P18 | Partner installer content on our domain | (none) | Site reputation: "third-party content is published on a host site mainly because of that host's already-established ranking signals" | Safe with conditions: our words |
| P19 | Answer-first, question H2s, inline sources, server-rendered | Aleyda Solis, Kevin Indig (users skim the top), Semrush (question queries) | "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary" | Safe (normal SEO) |
| P20 | AI-only content, chunked pages, llms.txt as a Google lever | (myth per Google) | "There's no requirement to break your content into tiny pieces"; AI text files: "Google Search itself doesn't use them" | llms.txt harmless; AI-only or chunked content rejected |
| P21 | Allow OAI-SearchBot, PerplexityBot | Aleyda Solis | OpenAI: "we recommend allowing OAI-SearchBot in your site's robots.txt file" | Safe and required |
| P22 | Review gating or incentives | (Whitespark: "Never offer any kind of incentives") | "Reviews written in exchange for a benefit" without clear disclosure | Unsafe. Rejected |
| P23 | Tactics aimed only at AI answers (planted mentions, self-ranking "best" lists, prompt bait) | (Lily Ray 2026) | Spam includes "attempting to manipulate generative AI responses in Google Search" | Unsafe. Rejected |

### 8.1 What survived and what was rejected

**Top five practices that survived the cross-check:**
1. One gated county page per county inside the `/counties` hub, built from local data, never a name swap (P1).
2. Official, dated local facts in our own words with the source linked, from CSO, SEAI, PVGIS, the council and SECs (P2).
3. Real, permissioned local proof, with the real Google rating as plain text linking to the profile and no star markup (P8, P9).
4. Honest schema: Service with `areaServed` pointing at the one real business, FAQPage only from visible questions (P11, P12).
5. Answer-first, server-rendered, sourced writing with a visible updated date that moves only when content changes, and the answer-engine crawlers allowed (P5, P19, P21).

**Rejected as unsafe:** self-serving `aggregateRating`/`Review` markup; a LocalBusiness, address or GBP per county; town pages, extra county domains and long place-name blocks; bulk or AI-only generation of county pages; bumping dates without changes; paid followed links; review gating or undisclosed incentives; tactics aimed only at manipulating AI answers. HowTo and FAQ markup "for rich results" rejected as doing nothing in Google now.
