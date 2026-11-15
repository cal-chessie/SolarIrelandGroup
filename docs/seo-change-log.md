# SEO change log

Every title, meta description and redirect change made for search, with the old value, so any one can be reverted if its click-through rate or position drops. Newest first. Search Console is the judge: re-pull the page's CTR and average position two to four weeks after a change and compare against the "before" figures recorded here.

---

## 15 Nov 2026 · Grant headline to up to €2,400, answer-box duplicates, winter post rewrite

No URL or slug changed. Cal's ruling: where the site states the home grant as a headline or total, it says "up to €2,400" (€1,800 for panels, plus €600 with a battery of 5 kWh or more). Where €1,800 is the panels-only figure inside a calculation (€8,200 minus €1,800 = €6,400), it stays and now says "panels grant".

### Titles

None. Cal's ranking-safety rule for this pass: no title, seoTitle, H1, slug or URL changes, so Google picks the edits up on its normal recrawl. The winter post keeps its title and seoTitle. (Cork and Dublin seoTitles were briefly changed to "€2,400 Grant" during the pass and reverted before commit.)

### Meta descriptions

Changed only where the meta stated the grant total wrongly (as €1,800 for the whole grant). Metas where €1,800 is the panels-only figure inside a sum (Cork, Dublin, 3-bed semi, cost post, /solar-calculator, /financing, /counties/roscommon) were left as they were.

| Page | Old | New |
|---|---|---|
| Worth-it post | Typical savings of €800 to €1,400 a year, payback in 5 to 7 years, and the €1,800 SEAI grant still in place. When it pays, and the cases where it doesn't. | Savings of €800 to €1,400 a year, payback in 5 to 7 years, and SEAI grants of up to €2,400 still in place. When it pays, and the cases where it doesn't. |
| Winter post | ...How summer output and export credit carry winter bills, plus the €1,800 grant. | ...How summer output and export credit carry winter bills, and the €2,400 grant. |
| /counties/roscommon og description | ...Real local installers, guidance on the €1,800 SEAI grant, honest quotes. | ...Real local installers, guidance on SEAI grants of up to €2,400, honest quotes. |

### Answer boxes

- Winter post (published 13 Nov, not yet ranking): old "No, solar will not clear a December bill in December. A 4 kWp Irish system makes about 110 kWh in December and 517 kWh in June. The saving is counted over the year: summer power you use at home, plus export credit under the Clean Export Guarantee, carries the winter months." New: "Solar makes least when bills are highest: a 4 kWp Irish system makes about 110 kWh in December and 517 kWh in June. It pays across the year instead. Summer power you use at home, plus export credit under the Clean Export Guarantee, carries the winter months, and SEAI grants of up to €2,400 cut the cost."
- Worth-it, Cork, 3-bed semi, cost and Dublin answers: meaning unchanged; "€1,800 SEAI grant" in the panels-only sum now reads "€1,800 (SEAI) panels grant", and the worth-it headline grant reads "SEAI grants of up to €2,400".

### Duplicated openings (answer box restated by the first paragraph)

The answer box renders under the H1; on 21 posts, the winter post included, the first body paragraph said the same thing again. Every answer box is unchanged in meaning. The first paragraph now opens with new information, or, where it was a pure restatement, it was removed (the same words still render in the answer box above it, so no information left the page). Stray "Last checked: 12 November 2026." lines were removed; the business post already had a dated source note, and the farm and winter posts gained one at the end. `src/__tests__/blog-openings.test.ts` now fails the build's test gate if an opening restates its answer or a lone "Last checked" line comes back.

## 15 Nov 2026 · Search Console pass (actions 1 to 9)

Source: `Obsidian Vault/RAW/2026-11-15 Search Console intelligence (solarirelandgroup).md`. Action 10 (Dublin guide and /financing) is held until the November 2026 core update settles. No URL or slug changed. No body content, heading or internal link was removed; sections were added.

### Titles

| Page | Before (CTR, position) | Old title | New title |
|---|---|---|---|
| /blog/nc6-form-solar-grid-connection-ireland | 0.9%, 7.3 | ESB NC6 Form: What It Is, Who Files It, Why It's Free | ESB NC6 Form: How to Fill It In, Step by Step (2026) |
| /blog/solar-panels-in-winter-do-they-work | 1.4%, 5.8 | Do Solar Panels Work in Winter? Yes, Even in December | Do Solar Panels Work in Winter? Irish Output Month by Month |
| /blog/smart-meter-required-solar-panels-ireland | 1.6%, 7.9 | Do You Need a Smart Meter for Solar Panels? Not to Generate | Do You Need a Smart Meter for Solar Panels in Ireland? |
| /solar-calculator | calculator queries at about 72 | Solar Panel Calculator Ireland: Savings From Your Bill | Solar Panel Cost Calculator Ireland: Savings From Your Bill |

### Meta descriptions

| Page | Old | New |
|---|---|---|
| NC6 post | The NC6 is ESB Networks' free microgeneration notification for home solar. Your installer files it, and it helps unlock Clean Export Guarantee payments. | The NC6 is ESB Networks' free microgeneration form for home solar. Where to get it, how to fill it in step by step, who submits it, and NC6 vs NC7. |
| Winter post | Yes. Panels run on daylight, not heat. A 6 kWp roof in Ireland still makes 120 to 220 kWh in December. Month-by-month figures for an Irish roof. | What an Irish solar roof makes in December against June, month by month, why cold weather helps the panels, and how summer export carries winter bills. |
| Smart meter post | Your panels work without one. A smart meter records the exact kWh you export so your supplier can pay you under the Clean Export Guarantee. How to get one. | What a smart meter does for a solar home in Ireland, whether smart meters are compulsory, which meter you need to be paid for export, and how to get one. |
| SEAI grant guide (0.8%, 8.3) | €1,800 for panels, €600 more for a 5 kWh+ battery. Who qualifies, how to apply before work starts, the post-works BER step and when SEAI pays you back. | SEAI solar grant 2026: €1,800 for panels and €600 for a battery. A tick-box eligibility checklist, the grant process in order, and how long payment takes. |
| Bill post (0.2%, 17.2) | Your day and night unit rates, the standing charge and when night rate starts, line by line on an Irish electricity bill, and what each means for solar. | What electricity costs per kWh in Ireland in 2026, the standing charge, day and night rates and where your MPRN is, and what each means for solar. |
| /solar-calculator (also og and twitter) | Upload an Irish electricity bill and see the system size, yearly savings and payback it points to, with the €1,800 SEAI grant built in. Free to use. | Upload an Irish electricity bill and see the system size, its cost after the €1,800 SEAI grant, your yearly savings and the payback. Free to use. |

### Redirects (308, `next.config.ts`)

Each source returned 404 on live (curl, 15 Nov 2026) before it was added. Each target returns 200. One hop, no chains.

| From | To |
|---|---|
| /blog/do-solar-rating-ireland | /blog/do-solar-panels-improve-ber-rating-ireland |
| /blog/do-solar-improve-ber-rating-ireland | /blog/do-solar-panels-improve-ber-rating-ireland |
| /blog/east-vs-south-vs-west | /blog/east-vs-south-vs-west-facing-roofs-solar |
| /blog/east-vs-south-facing-roofs-solar | /blog/east-vs-south-vs-west-facing-roofs-solar |
| /blog/east-vs-south-west-facing-roofs-solar | /blog/east-vs-south-vs-west-facing-roofs-solar |
| /blog/solar-panels-do-they-work | /blog/solar-panels-in-winter-do-they-work |
| /blog/solar-rental-property-landlord-guide | /blog/solar-panels-rental-property-landlord-guide |

Parameter variants: `/?…` and `/book-survey?…` already carry a clean self-referencing canonical on live. Nothing changed.

### Truth fixes inside existing NC6 copy

ESB Networks' own pages say the NC6 goes in **before** the system is connected ("inform and fit") and that ESB issues the Maximum Export Capacity within 20 working days. Three existing sentences said "after the install" or "notify-first: you tell ESB the system is in" or "a few weeks". They were corrected in place; the headings are unchanged.

### Not done, on purpose

- Action 2 asked to trim the worth-it framing out of the add-value post. Cal's zero-risk rule says no content deletion, so the add-value post only gained a link to the worth-it post. Revisit once the core update settles.
- Action 7 asked for an MPRN section on the bill post. The bill post already has one, and a dedicated MPRN post exists (`/blog/what-is-my-mprn-number-ireland`). A second full MPRN section would compete with it, so the bill post gained a paragraph on where the MPRN sits on the bill, linking to the MPRN post with "MPRN number in Ireland".
- seai.ie served a bot challenge to a plain fetch, so the grant figures were checked against `src/lib/solar-data.ts`, the existing SEAI-quoted copy and SEAI's own pages via search (built and occupied before 2025, 30 days to accept, 8 months to complete). Recheck on seai.ie in a browser before the next grant edit.
