# DRAFT: Farm Solar in 2027: The Doubled SEAI Grant or TAMS?

Status: draft only. Not published, not committed, not added to src/lib/blog-data.ts.
Drafted 12 Nov 2026, rewritten the same day around the TAMS selection point; edit pass the same day.

Block types used: paragraph, heading, table, callout, bulletList, numberedList, cta (all supported by `ContentBlock` in src/lib/blog-data.ts; no faq block exists, so the FAQ is heading and paragraph pairs).

## Meta

- slug: `farm-solar-2027-doubled-seai-grant-or-tams`
- title: Farm Solar in 2027: The Doubled SEAI Grant or TAMS?
- seoTitle (56): `Farm Solar 2027: Doubled SEAI Grant (45%) or TAMS (60%)?`
- seoDescription (146): `TAMS pays 60% on farm solar, but in Tranche 10 about 1 in 10 solar applications was picked. SEAI's doubled grant pays up to 45% until 6 July 2027.`
- answer (55 words): `TAMS pays 60% on farm solar, but it ranks and selects: in Tranche 10 about one in ten solar applications was picked, per the Department of Agriculture. SEAI's doubled Non-Domestic Microgen Grant pays the lower of its kWp table or 45% of the invoice, up to €325,200, and describes no draw. It closes on 6 July 2027.`
- excerpt: `TAMS pays the higher rate on farm solar, but in Tranche 10 only about one in ten solar applications was selected. The doubled SEAI grant pays less and describes no draw, but it closes on 6 July 2027. The two side by side.`
- category: grants
- date: (set on publish)
- readTime: 6 min read
- author: Cal Chesters
- iconBg / iconColor: bg-emerald-400/10 / text-emerald-400
- image: /installs/two-storey-home-black-solar-panels.webp (black-panel cover until Cal sends a farm photo)

Grant figures come from `GRANT_SCHEDULES.ndmg[0]` / `SOLAR_DATA.ndmgDoubled` (src/lib/solar-data.ts) via `ndmgTableEur()` (src/lib/estimate.ts): 20 kWp = €13,200, 50 kWp = €25,200, max €325,200.

## Body (blog-data.ts block format)

```json
"content": [
  {
    "type": "paragraph",
    "text": "TAMS pays 60% on farm solar, but it ranks and selects: in Tranche 10 about one in ten solar applications was picked, according to the Department of Agriculture. SEAI's doubled Non-Domestic Microgen Grant pays the lower of its kWp table or 45% of the invoice, up to €325,200, and describes no draw. It closes to new applications on 6 July 2027."
  },
  {
    "type": "paragraph",
    "text": "Last checked: 12 November 2026."
  },
  {
    "type": "table",
    "headers": ["", "TAMS solar (SCIS)", "SEAI doubled grant (NDMG)"],
    "rows": [
      ["Rate", "60%", "Lower of the SEAI table or 45% of the invoice"],
      ["Who", "Farmers, through a TAMS 3 application", "Businesses, farms, public bodies and non-profits, once per MPRN"],
      ["Cap", "€90,000 investment ceiling", "Up to €325,200, systems up to 1,000 kWp"],
      ["Selection", "Ranked and selected: 10% of solar applications picked in Tranche 10", "No ranking or draw described on seai.ie"],
      ["The catch", "On-farm energy use only, from 7 March 2026", "New applications close 6 July 2027; letter of offer before any work"],
      ["Source", "gov.ie, Department of Agriculture, 3 March 2026", "seai.ie, Non-Domestic Microgen Grant"]
    ]
  },
  {
    "type": "callout",
    "variant": "warning",
    "title": "Both on one system?",
    "body": "We are not saying you can or cannot use TAMS and the SEAI grant on the same system. Confirm with your adviser and with SEAI before you apply for either."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "TAMS pays more, but solar became a draw"
  },
  {
    "type": "paragraph",
    "text": "The Solar Capital Investment Scheme under TAMS 3 pays 60%, on an investment ceiling of €90,000 separate from the other TAMS schemes. Demand was high enough that the Minister for Agriculture, Martin Heydon, limited it. He said over 20% of the TAMS budget had gone on the solar measure alone, and from the tranche that opened on 7 March 2026 solar grant aid is limited to on-farm energy use ([gov.ie, Department of Agriculture, 3 March 2026](https://www.gov.ie/en/department-of-agriculture-food-and-the-marine/press-releases/minister-heydon-confirms-application-of-ranking-and-selection-to-tams-3-tranche-10/))."
  },
  {
    "type": "paragraph",
    "text": "Tranche 10 closed on 5 December 2025 with 7,906 applications across TAMS and was run on ranking and selection. For solar, the Department put the selection rate at 10%. The Department has not said later tranches will run the same way, so check the current rules before counting on either outcome. The next TAMS tranche closes on 4 December 2026."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "The doubled SEAI grant: lower rate, no draw described"
  },
  {
    "type": "paragraph",
    "text": "SEAI's Non-Domestic Microgen Grant covers the agricultural sector. For new applications from 6 October 2026 to 6 July 2027 it runs at an effective 45%: SEAI pays the lower of its kWp table or 45% of your invoice, up to €325,200, on systems up to 1,000 kWp ([SEAI](https://www.seai.ie/grants/business-grants/commercial-solar-pv)). SEAI's page describes no ranking or selection. After 6 July 2027 the doubled rate is gone for new applications."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "What the doubled grant pays on a farm shed"
  },
  {
    "type": "table",
    "headers": ["System", "SEAI table value", "Invoice needed to receive it in full"],
    "rows": [
      ["20 kWp", "€13,200", "€29,334 or more"],
      ["50 kWp", "€25,200", "€56,000 or more"]
    ]
  },
  {
    "type": "paragraph",
    "text": "On a lower invoice SEAI pays 45% of the invoice instead. Illustrative grant figures only, not a quote or a saving. The full table, VAT and tax relief are in our [commercial solar grant guide](/commercial-solar-grant), and the rate change itself is covered in [SEAI doubled the business solar grant](/blog/seai-business-solar-grant-doubled-2027)."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Where farm power goes, and why daytime use matters"
  },
  {
    "type": "paragraph",
    "text": "On most farms the big loads are milking, milk cooling, water heating, lighting and ventilation. Panels make power in daylight, and every unit the farm uses while the sun is up is a unit you do not buy. Exports earn only what your supplier pays under the Clean Export Guarantee. Both grants now point the same way: size the system for what the farm uses. Your bill shows the day and night split, and the [farm bill analyser](/solar-calculator) works from your own figures."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Which roof"
  },
  {
    "type": "bulletList",
    "items": [
      "Condition: an old sheet roof near the end of its life is dealt with before panels go on, not after.",
      "Structure: the frame has to carry the panels and the wind loading. This is checked on site at the site survey.",
      "Older sheeting: if a roof may contain asbestos, say so early. It changes the plan.",
      "Distance to the meter: a shed far from the yard meter means a longer cable run."
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "text": "The timeline to 6 July 2027"
  },
  {
    "type": "numberedList",
    "items": [
      "Bill and on-site survey to size the system and check the roof.",
      "Apply to SEAI. Nothing is bought or started until the letter of offer arrives; then you have 8 months to finish.",
      "Your installer applies to ESB Networks before installing. Allow at least 4 weeks.",
      "Install, with the electrical work done by a Safe Electric registered electrician.",
      "Claim: SEAI pays usually 4 to 6 weeks after all documents are in. Grants over €10,000 in a year need tax clearance."
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Questions farmers ask"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "How much does TAMS pay for solar panels?"
  },
  {
    "type": "paragraph",
    "text": "The Solar Capital Investment Scheme under TAMS 3 pays 60%, on an investment ceiling of €90,000. From 7 March 2026 the aid is limited to on-farm energy use, per the Department of Agriculture."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Will my TAMS solar application be selected?"
  },
  {
    "type": "paragraph",
    "text": "Nobody can say in advance. In Tranche 10 the Department selected 10% of solar applications. It has not said later tranches will run the same way; the next closes on 4 December 2026."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Can a farm get the doubled SEAI grant?"
  },
  {
    "type": "paragraph",
    "text": "Yes. SEAI's Non-Domestic Microgen Grant covers the agricultural sector, once per MPRN. New applications made by 6 July 2027 get the effective 45% rate, up to €325,200."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Can I start work before the SEAI offer arrives?"
  },
  {
    "type": "paragraph",
    "text": "No. Nothing is bought or started until SEAI's letter of offer arrives. After that you have 8 months to finish the job."
  },
  {
    "type": "paragraph",
    "text": "How we handle farm and business installs is on [our business solar services](/services#business) page, and every grant band is in the [SEAI commercial solar grant table](/commercial-solar-grant). Start with your bill, then a 15-minute call, then the site survey."
  },
  {
    "type": "cta",
    "text": "See what solar does for your farm",
    "href": "/solar-calculator"
  }
]
```

## Sources

Fetched by me: none. All facts come from the coordinator's verified notes:
- gov.ie press release, 3 March 2026: https://www.gov.ie/en/department-of-agriculture-food-and-the-marine/press-releases/minister-heydon-confirms-application-of-ranking-and-selection-to-tams-3-tranche-10/
- SEAI NDMG: https://www.seai.ie/grants/business-grants/commercial-solar-pv
Repo: CLAUDE.md, docs/site-canon.md, src/app/commercial-solar-grant/page.tsx, src/lib/solar-data.ts, src/lib/blog-data.ts.

## Flags

1. The Minister's words are paraphrased with attribution, not quoted. Check against the press release if Cal wants it verbatim.
2. The "Who" row for TAMS is general; no sourced eligibility detail.
3. "Invoice needed" column = table value / 0.45 (20 kWp rounded up to €29,334). Verify against ndmgTableEur().
4. No SEAI registration claim for Solar Ireland. No claim on combining TAMS and SEAI. Asbestos line kept.
5. Farm loads list (milking, cooling, etc.) is general knowledge, not from a cited source.
