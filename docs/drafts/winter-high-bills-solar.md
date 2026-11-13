# DRAFT (not published, not committed): winter "High bills?" post

Status: draft for Cal. Not added to src/lib/blog-data.ts. Before it ships: confirm the STILL OPEN list at the bottom, run the truth pass, and grep every figure against the engine.

## Headline (locked)

High Bills This Winter? How Solar Works Across the Whole Year

## Home page seasonal strip (copy only)

High bills? Your summer roof pays for your winter. Upload a bill and see your own numbers.

## Article object (same shape as blog-data.ts)

Block types used: paragraph, heading, table, callout, numberedList, cta (all supported by `ContentBlock` in src/lib/blog-data.ts; there is no faq block, so the FAQ is heading and paragraph pairs).

```ts
{
  "slug": "high-winter-bills-is-solar-worth-it-ireland",
  "title": "High Bills This Winter? How Solar Works Across the Whole Year",
  "seoTitle": "High Winter Bills? Irish Solar Makes Nearly 5x More in June",
  "seoDescription": "A 4 kWp Irish system makes about 110 kWh in December and 517 kWh in June. How summer output and export credit carry winter bills, plus the €1,800 grant.",
  "answer": "No, solar will not clear a December bill in December. A 4 kWp Irish system makes about 110 kWh in December and 517 kWh in June. The saving is counted over the year: summer power you use at home, plus export credit under the Clean Export Guarantee, carries the winter months.",
  "excerpt": "Winter bills are when people think about solar, and December is when panels make least. How the summer pays for the winter, month by month, and why the panels going on Irish roofs now are bigger than they were.",
  "category": "savings",
  "date": "TBC",
  "readTime": "6 min read",
  "author": "Cal Chesters",
  "iconBg": "bg-emerald-400/10",
  "iconColor": "text-emerald-400",
  "image": "/blog/high-winter-bills-is-solar-worth-it-ireland.webp",
  "content": [
    {
      "type": "paragraph",
      "text": "No, solar will not clear a December bill in December. A 4 kWp Irish system makes about 110 kWh in December and about 517 kWh in June. The saving is counted over the year: the summer power you use at home, plus the export credit you earn under the Clean Export Guarantee, carries the winter months."
    },
    {
      "type": "paragraph",
      "text": "Last checked: 12 November 2026."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "What a typical Irish system makes, month by month"
    },
    {
      "type": "paragraph",
      "text": "Our estimates use 950 kWh a year for every kWp on a good roof. PVGIS, the European Commission's solar model, puts a south-facing roof at 30 degrees in Dublin at about 972 kWh per kWp after standard losses, and the national average at about 884. So 950 describes a good roof without assuming every roof is one. A 4 kWp system, the size the full €1,800 SEAI grant is built around, comes out at about 3,800 kWh a year, spread across the months like this."
    },
    {
      "type": "table",
      "headers": ["Month", "Approx. generation, 4 kWp"],
      "rows": [
        ["January", "125 kWh"],
        ["February", "182 kWh"],
        ["March", "315 kWh"],
        ["April", "422 kWh"],
        ["May", "505 kWh"],
        ["June", "517 kWh"],
        ["July", "494 kWh"],
        ["August", "426 kWh"],
        ["September", "334 kWh"],
        ["October", "228 kWh"],
        ["November", "141 kWh"],
        ["December", "110 kWh"]
      ]
    },
    {
      "type": "callout",
      "variant": "stat",
      "title": "The honest gap",
      "body": "June makes nearly five times what December makes. May to August together make about 1,940 kWh; November to February make about 560. Panels keep working all winter, but a December day gives them seven or eight hours of weak light."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Why winter makes less: mostly, it is the short days"
    },
    {
      "type": "numberedList",
      "items": [
        "Short days. In Dublin the sun is up for about 17 hours on the longest day in June and about 7.5 hours on the shortest day in December.",
        "A low sun. At midday in late June the sun stands about 60 degrees above the horizon in Dublin. In late December it reaches about 13 degrees, so the same light is spread thinner and passes through far more air.",
        "Cloud and long shadows. Winter skies are greyer, and with the sun that low, a chimney, a tree or the house next door shades the roof for longer each day."
      ]
    },
    {
      "type": "callout",
      "variant": "info",
      "title": "Cold is not the problem",
      "body": "Panels work better cold. LONGi's datasheet for its 440 W Hi-MO 6 panel gives a loss of 0.29% of output for every degree it heats up, so a bright, frosty morning is good solar weather. The short, low, grey days are what cost the winter months."
    },
    {
      "type": "paragraph",
      "text": "Cold, cloud and frost get their own post: [do solar panels work in winter](/blog/solar-panels-in-winter-do-they-work)."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "How the summer pays for the winter"
    },
    {
      "type": "numberedList",
      "items": [
        "Power you use yourself. Every unit the panels make while the kettle, washing machine or immersion is running is a unit you do not buy. Our estimates value it at 35c, the bottom of the current Irish market band, so we never overstate it.",
        "Power you export. What the house cannot use goes to the grid and is credited under the Clean Export Guarantee. Each supplier sets its own rate and the CRU sets no minimum above zero (CRU decision CRU202454), so our estimates use 18c a unit, not a promise of what your supplier pays. You need a smart meter to be paid for exports."
      ]
    },
    {
      "type": "paragraph",
      "text": "In summer a typical home makes more than it can use in daylight, so a big share goes out as export credit. In winter almost everything the panels make is used in the house, but there is far less of it. Over twelve months, April to September carries most of the annual saving. Your winter bill stays a winter bill; the roof covers it across the year."
    },
    {
      "type": "callout",
      "variant": "info",
      "title": "What solar never removes",
      "body": "The standing charge stays on every bill, solar or not. Without a battery, an Irish home typically uses 30% to 50% of its own solar output and exports the rest. SEAI pays a flat €600 towards a battery of 5 kWh or more, but our estimates stay panels only so the number you see never leans on one."
    },
    {
      "type": "paragraph",
      "text": "Export credit lands on your normal electricity bills, so it shows up on your supplier's billing cycle. That is why every figure we give is a yearly one. How export payments and the meter fit together is in our [smart meter guide for solar](/blog/smart-meter-required-solar-panels-ireland)."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Panels are getting bigger, and that helps a small roof"
    },
    {
      "type": "table",
      "headers": ["", "LONGi Hi-MO 4m (2021)", "LONGi Hi-MO 6 Explorer (today)"],
      "rows": [
        ["Power", "350 to 380 W", "440 W"],
        ["Efficiency", "19.2% to 20.9%", "23.0%"],
        ["Cell size", "166 mm", "182 mm"],
        ["Panels for 4 kWp", "Eleven at 370 W", "Nine at 440 W"]
      ]
    },
    {
      "type": "paragraph",
      "text": "The 2021 figures are from pv magazine's report of the Hi-MO 4m launch; the current ones are from LONGi's LR5-54HTH-440M datasheet. Some of the jump is a better cell. A lot of it is size: bigger wafers and a bigger panel. The ITRPV, the roadmap the panel makers publish each year, records the move to larger wafer formats, with commercial panels reaching 730 W on the largest. Cell efficiency still climbs, in fractions of a percent a year."
    },
    {
      "type": "paragraph",
      "text": "For a homeowner that means a roof too small for a sensible system a few years ago can often carry one today. LONGi's datasheet for the 440 W panel gives a 15-year product warranty and a 25-year power warranty of about 89% of rated output in year 25."
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Waiting for a better panel gains little",
      "body": "New panels move in small steps now. Waiting a year costs a year of the saving, and SEAI sets the grant each year."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "The SEAI grant is still €1,800"
    },
    {
      "type": "paragraph",
      "text": "The SEAI Solar Electricity Grant pays up to €1,800, reached in full at 4 kWp. The home needs an MPRN and must have been built and occupied before 2025, and SEAI's grant offer comes before any work starts. As part of the job we send ESB Networks the NC6 notification and SEAI the completion paperwork, and we book the post-works BER. The full walkthrough is in our [SEAI solar grant guide](/blog/complete-guide-seai-solar-grant-2026)."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Questions people ask"
    },
    {
      "type": "heading",
      "level": 3,
      "text": "Do solar panels work in an Irish winter?"
    },
    {
      "type": "paragraph",
      "text": "Yes, they run on daylight, not heat. A 4 kWp system makes about 110 kWh in December against about 517 kWh in June, because the days are short and the sun is low."
    },
    {
      "type": "heading",
      "level": 3,
      "text": "Will solar lower my winter electricity bill?"
    },
    {
      "type": "paragraph",
      "text": "A little, because almost everything made in winter is used in the house. The bigger effect is over the year: summer self-use and export credit carry most of the annual saving. The standing charge stays either way."
    },
    {
      "type": "heading",
      "level": 3,
      "text": "Does cold weather reduce solar output?"
    },
    {
      "type": "paragraph",
      "text": "No. Panels lose output as they heat up, about 0.29% per degree on LONGi's 440 W panel, so a cold, bright day suits them. Short days, low sun and cloud are what reduce winter output."
    },
    {
      "type": "heading",
      "level": 3,
      "text": "Do I need a smart meter to be paid for exports?"
    },
    {
      "type": "paragraph",
      "text": "Yes. Exports are credited under the Clean Export Guarantee at a rate your supplier sets, and you need a smart meter to be paid for them."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "See your own numbers"
    },
    {
      "type": "paragraph",
      "text": "The figures above describe a typical home. Your own saving depends most on when you use power, and your bill shows that. The [bill analyser](/solar-calculator) reads your day and night split and gives a close, conservative estimate for your house. Then book a 15-minute call to talk it through, with a site survey before anything is priced."
    },
    {
      "type": "cta",
      "text": "Upload my bill and see my numbers",
      "href": "/solar-calculator"
    }
  ]
}
```

## Notes for Cal

- Monthly table: computed from `MONTHLY_GENERATION_SHARE` x 4 kWp x 950 kWh/kWp (estimate.ts). The engine's shares sum to 0.98, not 1.00, so the months add to about 3,725 kWh against the 3,800 annual figure. Kept as "Approx."; flagged, not changed.
- I did not open the winter post body itself (only linked it); check its figures do not contradict this table.
- 9 panels = 4,000 / 440 from `PRICING.panelWatts`. 11 panels = 4,000 / 370.
- Slug and date are placeholders; slug is Cal's call.
- 12 Nov edit pass: answer-first opening, Last checked line, panel comparison table, FAQ (h3 + paragraph, no faq block exists), inline attributions. The "some newer panels now carry 30 years" line was cut (unsourced in this file).

## Sources

- LONGi Hi-MO 4m LR4-60HPH, 2021: 350 to 380 W, 19.2% to 20.9%, M6 166 mm wafers. pv-magazine, 27 Apr 2021: https://www.pv-magazine.com/2021/04/27/longi-unveils-two-pv-modules-for-distributed-generation/ ; Hi-MO 4 launch on M6 166 mm: https://www.pv-tech.org/industry-updates/why-is-the-longi-hi-mo-4-module-favoured-by-the-pv-market
- LONGi Hi-MO 6 Explorer LR5-54HTH-440M: 440 W, 23.0%, 182 mm cells, -0.290%/K. Datasheet: https://www.sonnenladen.de/downloads/LNG-06-440-02/Hi-MO%206%20Explorer%20LR5-54HTH-440W%20-%20Datenblatt%20Englisch.pdf
- ITRPV 17th edition (2026): larger G12 wafers, module power classes up to 730 W in 2025. https://taiyangnews.info/technology/itrpv-sees-pv-shipments-stabilize-at-706-gw-in-2025
- PVGIS (972 Dublin, 884 national): no URL in this file. Add the PVGIS link before publish.
- CRU202454: no URL in this file. Add the CRU decision link before publish.
- Dublin daylight (about 17 h / 7.5 h) and midday sun height (about 60 / 13 degrees): standard solar geometry for latitude 53.35 N. Cross-check against Met Eireann or timeanddate before publish.
- "30% to 50% self-use without a battery", "35c bottom of the market band": no source in this file; engine assumptions. Confirm or attribute.

## STILL OPEN

1. Warranty: LR5-54HTH datasheet gives 15-year product and 25-year linear power (year 25 at least 88.9%). Read the PDF in full before publish.
2. Engine monthly profile sums to 98% (see notes).
3. Read the 2021 pv-magazine article and the datasheet PDF once in full before publish; figures came from search summaries.
