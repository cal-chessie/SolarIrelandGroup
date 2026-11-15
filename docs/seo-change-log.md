# SEO change log

Every title, meta description and redirect change made for search, with the old value, so any one can be reverted if its click-through rate or position drops. Newest first. Search Console is the judge: re-pull the page's CTR and average position two to four weeks after a change and compare against the "before" figures recorded here.

---

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
