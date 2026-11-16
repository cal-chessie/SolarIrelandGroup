# SEO change log

Every title, meta description and redirect change made for search, with the old value, so any one can be reverted if its click-through rate or position drops. Newest first. Search Console is the judge: re-pull the page's CTR and average position two to four weeks after a change and compare against the "before" figures recorded here.

---

## 16 Nov 2026 · Blog figures to one source (branch blog-numbers-one-source)

No title, seoTitle, H1, slug or URL changed. The winter post (`high-winter-bills-is-solar-worth-it-ireland`) was not touched; its figures already match the engine. Every saving, price, panel count and monthly output in the posts was checked against `src/lib/estimate.ts`; the engine's figures are in `docs/fact-sheet.md`. Wrong figures were swapped for the engine's with the smallest wording change, and quoted savings now say "our estimate". 97 edits across 16 posts; the pasted battery-grant sentence was removed from 7 posts where it repeated a grant line already in the post or sat off topic (it stays once where batteries are relevant). Meta descriptions changed: the worth-it post only (old: "Savings of €800 to €1,400 a year, payback in 5 to 7 years, and SEAI grants of up to €2,400 still in place. When it pays, and the cases where it doesn't." new: "Our estimate: about €920 a year from a 4 kWp system, payback in 5 to 7 years, and SEAI grants of up to €2,400 still in place. When it pays, and the cases where it doesn't."). The 3-bed semi post's seoDescription changed its panel count only (10 panels, 4 to 4.4 kWp, to 9 panels, 4 kWp). `src/__tests__/blog-facts.test.ts` now guards these figures.

| Post | Old | New |
|---|---|---|
| do-solar-panels-add-value-to-your-home-ireland | A battery of 5 kWh or more adds a flat €600 SEAI battery grant on the same application, so solar and battery together can reach €2,400. | (removed) |
| solar-panel-installation-process-ireland | A battery of 5 kWh or more adds a flat €600 SEAI battery grant on the same application, so solar and battery together can reach €2,400. | (removed) |
| how-to-read-electricity-bill-ireland-solar | A battery of 5 kWh or more adds a flat €600 SEAI battery grant on the same application, so solar and battery together can reach €2,400. | (removed) |
| solar-panels-cork-complete-guide | A battery of 5 kWh or more adds a flat €600 SEAI battery grant on the same application, so solar and battery together can reach €2,400. | (removed) |
| solar-panels-dublin-ultimate-guide | A battery of 5 kWh or more adds a flat €600 SEAI battery grant on the same application, so solar and battery together can reach €2,400. | (removed) |
| how-many-solar-panels-do-i-need-ireland | A battery of 5 kWh or more adds a flat €600 SEAI battery grant on the same application, so solar and battery together can reach €2,400. | (removed) |
| solar-panels-rental-property-landlord-guide | A battery of 5 kWh or more adds a flat €600 SEAI battery grant on the same application, so solar and battery together can reach €2,400. | (removed) |
| do-solar-panels-add-value-to-your-home-ireland | A typical Irish system saves **€800-1,400 a year** on electricity and pays for itself in 5-7 years | On our estimate a 4 kWp system saves **about €920 a year** and a 6 kWp system about €1,390, and pays for itself in 5-7 years |
| are-solar-panels-worth-it-ireland-2026 | "seoDescription": "Savings of €800 to €1,400 a year, payback in 5 to 7 years, | "seoDescription": "Our estimate: about €920 a year from a 4 kWp system, payback in 5 to 7 years, |
| are-solar-panels-worth-it-ireland-2026 | A typical system saves €800 to €1,400 a year and pays for itself in 5 to 7 years | On our estimate a 4 kWp system saves about €920 a year and a 6 kWp system about €1,390, and pays for itself in 5 to 7 years |
| are-solar-panels-worth-it-ireland-2026 | yes: savings of 800-1,400 euro a year, payback | yes: our estimate is about 920 euro a year from a 4 kWp system, payback |
| are-solar-panels-worth-it-ireland-2026 | is worth 35-45c to you | is worth 35-38c to you |
| are-solar-panels-worth-it-ireland-2026 | costing 35-45c per kWh | costing 35-38c per kWh |
| are-solar-panels-worth-it-ireland-2026 | "€800-1,400" | "About €920 (4 kWp) to €1,390 (6 kWp), our estimate" |
| are-solar-panels-worth-it-ireland-2026 | "€400-550 a year" | "€410 to €480 a year" |
| are-solar-panels-worth-it-ireland-2026 | saves **€800-1,400 a year**, made up | saves **about €920 a year with a 4 kWp system and about €1,390 with 6 kWp, on our estimate**, made up |
| are-solar-panels-worth-it-ireland-2026 | a year of savings - €800-1,400 at typical rates - which | a year of savings - about €920 on our estimate for a 4 kWp system - which |
| are-solar-panels-worth-it-ireland-2026 | a typical 4kWp home keeps every cent of its CEG earnings | a typical 4kWp home keeps almost all of its CEG earnings |
| solar-panel-installation-process-ireland | typically €800-1,400 a year for an average home | about €920 a year on our estimate for an average home with a 4 kWp system |
| solar-panels-3-bed-semi-ireland-cost | needs about 10 panels (4 to 4.4 kWp). | needs 9 panels (4 kWp). |
| solar-panels-3-bed-semi-ireland-cost | needs about 10 panels, a 4 to 4.4 kWp system. It costs €8,200 to €8,480 installed, or €6,400 to €6,680 after | needs 9 panels, a 4 kWp system. It costs €8,200 installed, or €6,400 after |
| solar-panels-3-bed-semi-ireland-cost | On 4,200 kWh a year it saves about €1,000 a year and pays back in about 7 years. | On 4,200 kWh a year our estimate is a saving of about €920 a year and payback in about 7 years. |
| solar-panels-3-bed-semi-ireland-cost | what a 10-panel system costs | what a 9-panel system costs |
| solar-panels-3-bed-semi-ireland-cost | Around 10 panels for a typical household. Modern panels are about 440W each, so 10 panels is roughly 4.4 kWp | Around 9 panels for a typical household. Modern panels are about 440W each, so 9 panels is roughly 4 kWp |
| solar-panels-3-bed-semi-ireland-cost | a typical 10-panel system cost | a typical 9-panel system cost |
| solar-panels-3-bed-semi-ireland-cost | "10 panels (~4.4 kWp)" | "9 panels (4 kWp)" |
| solar-panels-3-bed-semi-ireland-cost | "€8,480" | "€8,200" |
| solar-panels-3-bed-semi-ireland-cost | "€6,680" | "€6,400" |
| solar-panels-3-bed-semi-ireland-cost | Most 3-bed semis save €800 to €1,400 a year, made up of two parts | On our estimate a 3-bed semi with a 4 kWp system saves about €920 a year, made up of two parts |
| solar-panels-3-bed-semi-ireland-cost | Where you land in that range depends heavily | Where you land depends heavily |
| solar-panels-3-bed-semi-ireland-cost | A 4.4 kWp system covers | A 4 kWp system covers |
| solar-panels-3-bed-semi-ireland-cost | System: ~4.4 kWp, 10 panels, about 4,180 kWh a year | System: 4 kWp, 9 panels, about 3,800 kWh a year |
| solar-panels-3-bed-semi-ireland-cost | Cost after grant: €6,680 | Cost after grant: €6,400 |
| solar-panels-3-bed-semi-ireland-cost | about 1,440 kWh used at home, worth about €505 a year | about 1,390 kWh used at home, worth about €486 a year |
| solar-panels-3-bed-semi-ireland-cost | about 2,740 kWh at 18c, worth about €490 a year | about 2,410 kWh at 18c, worth about €434 a year |
| solar-panels-3-bed-semi-ireland-cost | Combined annual benefit: about €1,000 | Combined annual benefit: about €920 |
| solar-panels-3-bed-semi-ireland-cost | Payback: about 6.7 years | Payback: about 7 years |
| solar-panels-3-bed-semi-ireland-cost | Will 10 panels fit on | Will 9 panels fit on |
| solar-panels-3-bed-semi-ireland-cost | Ten 440W panels need roughly 18 to 20 square metres | Nine 440W panels need roughly 18 square metres |
| solar-panels-3-bed-semi-ireland-cost | do we need more than 10 panels? | do we need more than 9 panels? |
| solar-panels-ev-charger-ireland | a 4 kWp system (about 10 panels) | a 4 kWp system (9 panels) |
| solar-panels-ev-charger-ireland | might fit 10 panels | might fit 9 panels |
| solar-panels-ev-charger-ireland | ~4 kWp (10 panels) | ~4 kWp (9 panels) |
| complete-guide-seai-solar-grant-2026 | roughly €510–€720 per year on a 6 kWp system | roughly €610–€710 per year on a 6 kWp system, on our estimate |
| complete-guide-seai-solar-grant-2026 | bill savings (€750–€1,100/year) | bill savings (€630–€820/year on our estimate) |
| complete-guide-seai-solar-grant-2026 | (€510–€720/year) | (€610–€710/year) |
| how-much-do-solar-panels-cost-ireland-2026 | A 4 kWp solar system, about 10 panels, costs | A 4 kWp solar system, 9 panels, costs |
| how-much-do-solar-panels-cost-ireland-2026 | "Typical Annual Savings" | "Annual Savings (our estimate)" |
| how-much-do-solar-panels-cost-ireland-2026 | "9–10 panels" | "9 panels" |
| how-much-do-solar-panels-cost-ireland-2026 | "€800 – €1,100" | "about €920" |
| how-much-do-solar-panels-cost-ireland-2026 | "€1,000 – €1,300" | "about €1,390" |
| how-much-do-solar-panels-cost-ireland-2026 | "€1,200 – €1,800" | "about €2,315" |
| how-much-do-solar-panels-cost-ireland-2026 | sizes the system at 4 kWp, about 10 panels. | sizes the system at 4 kWp, 9 panels. |
| how-much-do-solar-panels-cost-ireland-2026 | a payback period of around 6 to 7 years. Here is a detailed ROI calculation for the three most common system sizes: | a payback period of around 5 to 7 years. Here is our estimate for the three most common system sizes, each on a home it suits (4,200, 6,500 and 11,000 kWh a year): |
| how-much-do-solar-panels-cost-ireland-2026 | "€500", "€755", "€1,255" | "€486", "€742", "€1,246" |
| how-much-do-solar-panels-cost-ireland-2026 | "€475", "€710", "€1,180" | "€434", "€645", "€1,069" |
| how-much-do-solar-panels-cost-ireland-2026 | "€975", "€1,465", "€2,435" | "€920", "€1,387", "€2,315" |
| how-much-do-solar-panels-cost-ireland-2026 | "~6.6 years", "~5.3 years", "~4.3 years" | "~7.0 years", "~5.6 years", "~4.6 years" |
| how-much-do-solar-panels-cost-ireland-2026 | "€18,000", "€28,800", "€50,300" | "€15,300", "€24,900", "€43,900" |
| how-much-do-solar-panels-cost-ireland-2026 | "€21,900", "€34,600", "€60,100" | "€20,400", "€32,700", "€57,100" |
| solar-panels-in-winter-do-they-work | still makes about 120 to 220 kWh in December | still makes about 165 kWh in December |
| solar-panels-in-winter-do-they-work | will still produce 120 to 220 kWh in December | will still produce about 165 kWh in December |
| clean-export-guarantee-explained | The figures below assume no battery: | The figures below are our estimate for a home each size suits (4 kWp on 3,000 to 5,000 kWh a year, 6 kWp on 5,000 to 8,000, 10 kWp on 8,000 to 11,000) and assume no battery: |
| clean-export-guarantee-explained | "2,850–4,000 kWh" | "3,370–3,910 kWh" |
| clean-export-guarantee-explained | "€513–€720" | "€610–€710" |
| clean-export-guarantee-explained | "4,750–6,650 kWh" | "5,940–6,620 kWh" |
| clean-export-guarantee-explained | "€855–€1,197" | "€1,070–€1,190" |
| clean-export-guarantee-explained | (€513–€720 a year for a typical 6kWp system without a battery) | (€610–€710 a year for a typical 6kWp system without a battery) |
| clean-export-guarantee-explained | your bill savings (€800–€1,200/year) | your bill savings (€630–€820/year on our estimate) |
| east-vs-south-vs-west-facing-roofs-solar | you save €0.35–€0.45/kWh versus | you save €0.35–€0.38/kWh versus |
| battery-storage-is-it-worth-the-extra-cost | so take a typical 38%: about 2,150 kWh used directly and 3,550 kWh exported. That is €753 off the bill (2,150 kWh at €0.35) plus €639 from the Clean Export Guarantee (3,550 kWh at €0.18 | so take a typical 37%: about 2,120 kWh used directly and 3,580 kWh exported. That is €742 off the bill (2,120 kWh at €0.35) plus €645 from the Clean Export Guarantee (3,580 kWh at €0.18 |
| battery-storage-is-it-worth-the-extra-cost | Total: about €1,392 a year. | Total: about €1,387 a year on our estimate. |
| battery-storage-is-it-worth-the-extra-cost | worth roughly €361 a year more | worth roughly €366 a year more |
| battery-storage-is-it-worth-the-extra-cost | each stored kWh is €0.35–€0.45 | each stored kWh is €0.35–€0.38 |
| solar-panels-dublin-ultimate-guide | and a typical system saves €800 to €1,400 a year. Most Dublin | and on our estimate it saves about €920 a year. Most Dublin |
| solar-panels-dublin-ultimate-guide | generates about 5,700 kWh a year, and a typical Irish system saves €800 to €1,400 a year. | generates about 5,700 kWh a year and, on our estimate, saves about €1,390 a year. |
| solar-panels-dublin-ultimate-guide | "4kWp (9–10 panels)" | "4kWp (9 panels)" |
| how-many-solar-panels-do-i-need-ireland | need 4 to 4.5 kWp, about 10 panels. Sizing | need 4 to 4.5 kWp, 9 to 10 panels. Sizing |
| how-many-solar-panels-do-i-need-ireland | Most Irish homes need about 10 panels, a 4 to 4.5 kWp system | Most Irish homes need 9 to 10 panels, a 4 to 4.5 kWp system |
| how-many-solar-panels-do-i-need-ireland | "4 kWp", "9–10 panels" | "4 kWp", "9 panels" |
| how-many-solar-panels-do-i-need-ireland | A 4kWp system needs 9 to 10 panels (10 × 440W = 4.4kWp) | A 4kWp system needs 9 panels (9 × 440W = 3.96kWp) |
| how-many-solar-panels-do-i-need-ireland | "10 panels", "~19 m²" | "9 panels", "~18 m²" |
| how-many-solar-panels-do-i-need-ireland | land on 4 to 4.5kWp, about 10 panels; | land on 4 to 4.5kWp, 9 to 10 panels; |
| best-time-of-year-to-get-solar-panels-ireland | roughly 520 kWh in June but only 95 kWh in December, more than a five-fold difference | roughly 517 kWh in June but only 110 kWh in December, nearly a five-fold difference |
| best-time-of-year-to-get-solar-panels-ireland | "110 kWh", "2.9%", "3.5" | "125 kWh", "3.3%", "4.0" |
| best-time-of-year-to-get-solar-panels-ireland | "165 kWh", "4.3%", "5.9" | "182 kWh", "4.8%", "6.5" |
| best-time-of-year-to-get-solar-panels-ireland | "275 kWh", "7.2%", "8.9" | "315 kWh", "8.3%", "10.2" |
| best-time-of-year-to-get-solar-panels-ireland | "410 kWh", "10.8%", "13.7" | "422 kWh", "11.1%", "14.1" |
| best-time-of-year-to-get-solar-panels-ireland | "520 kWh", "13.7%", "17.3" | "517 kWh", "13.6%", "17.2" |
| best-time-of-year-to-get-solar-panels-ireland | "515 kWh", "13.6%", "16.6" | "494 kWh", "13.0%", "15.9" |
| best-time-of-year-to-get-solar-panels-ireland | "480 kWh", "12.6%", "15.5" | "426 kWh", "11.2%", "13.7" |
| best-time-of-year-to-get-solar-panels-ireland | "355 kWh", "9.3%", "11.8" | "334 kWh", "8.8%", "11.1" |
| best-time-of-year-to-get-solar-panels-ireland | "235 kWh", "6.2%", "7.6" | "228 kWh", "6.0%", "7.4" |
| best-time-of-year-to-get-solar-panels-ireland | "135 kWh", "3.6%", "4.5" | "141 kWh", "3.7%", "4.7" |
| best-time-of-year-to-get-solar-panels-ireland | "95 kWh", "2.5%", "3.1" | "110 kWh", "2.9%", "3.5" |
| best-time-of-year-to-get-solar-panels-ireland | produces roughly three quarters of its annual output in just six months. October through March accounts for the remaining quarter. | produces roughly 70% of its annual output in just six months. October through March accounts for the remaining 30%. |
| best-time-of-year-to-get-solar-panels-ireland | approximately 1,190 kWh of potential | approximately 1,240 kWh of potential |
| best-time-of-year-to-get-solar-panels-ireland | September alone produces 355 kWh | September alone produces 334 kWh |
| best-time-of-year-to-get-solar-panels-ireland | produces approximately 95 kWh, enough | produces approximately 110 kWh, enough |
| best-time-of-year-to-get-solar-panels-ireland | a typical system's €800 to €1,400 of savings is permanently lost | a 4 kWp system's saving, about €920 on our estimate, is permanently lost |
| solar-panels-rental-property-landlord-guide | reducing their energy costs by €600–€1,200 per year depending on system size | reducing their energy costs by about €920 to €1,390 a year on our estimate, depending on system size |
| solar-panels-rental-property-landlord-guide | generates roughly €1,000–€1,400 a year in combined | generates roughly €1,320–€1,420 a year in combined ... payments, on our estimate. |
| are-solar-panels-worth-it-ireland-2026 | moves up toward the €1,400 end of the range and a shorter payback | moves up toward the 6 kWp figure, about €1,390 on our estimate, and a shorter payback |
| how-to-read-electricity-bill-ireland-solar | typically EUR 800-1,400 a year for a well-sized system | about EUR 920 a year on our estimate for a 4 kWp system |

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
