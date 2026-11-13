# DRAFT: SEAI business solar grant doubled (not published, not in blog-data.ts)

Drafted 12 Nov 2026. Figures taken from the /commercial-solar-grant page helpers:
`ndmgTableEur(kwp, '2026-10-06')` and `SOLAR_DATA.ndmgDoubled` (maxLabel, costShareLabel, fromLabel, toLabel).
Hand-computed from the same band table: 20 kWp = €13,200; 50 kWp = €25,200; 200 kWp = €85,200; 1,000 kWp = €325,200.
Builder: when this goes into blog-data.ts, confirm these four against `ndmgTableEur()` output.

Block types used: paragraph, heading, table, callout, bulletList, cta (all supported by `ContentBlock` in src/lib/blog-data.ts; no faq block exists, so the FAQ is heading and paragraph pairs).

## Headline (locked)
SEAI Doubled the Business Solar Grant. Most Firms Will Apply Too Late.

## Meta
- slug: `seai-business-solar-grant-doubled-2027`
- seoTitle (53): `SEAI Business Solar Grant Doubled to 45%: 6 July 2027`
- seoDescription (148): `SEAI's doubled business solar grant pays an effective 45%, up to €325,200, on applications until 6 July 2027. The timeline that decides who gets it.`
- excerpt: `SEAI has doubled its business solar grant to an effective 45%, and it closes to new applications on 6 July 2027. The timeline worked backwards, and what the grant pays on a 20 kWp and a 50 kWp system.`
- answer: `Yes. For new applications from 6 October 2026 to 6 July 2027, SEAI's Non-Domestic Microgen Grant pays an effective 45% towards business solar, up to €325,200, roughly double the old rate. Existing applications are not increased. SEAI's letter of offer must arrive before any work or purchase starts.`
- category: `grants` · date: `12 Nov 2026` · readTime: `5 min read` · author: `Cal Chesters`
- iconBg: `bg-yellow-400/10` · iconColor: `text-yellow-400` · image: `/installs/commercial-flat-roof-solar.webp`

## Body (blog-data.ts block format)

```json
"content": [
  { "type": "paragraph", "text": "Yes, it doubled. For new applications from 6 October 2026 to 6 July 2027, SEAI's Non-Domestic Microgen Grant pays an effective 45% of the cost of a business solar PV system, up to €325,200, according to seai.ie. Before this it worked out at roughly half that. SEAI's letter of offer must arrive before any work starts." },
  { "type": "paragraph", "text": "Last checked: 12 November 2026." },
  { "type": "paragraph", "text": "SEAI lists the increase as an action of the National Energy Affordability Taskforce, and nothing on seai.ie says the window will be extended. Plan on 6 July 2027 being the last day." },
  { "type": "callout", "variant": "stat", "title": "The doubled grant in one line", "body": "45% of your invoiced cost, or the SEAI table value, whichever is lower. Up to €325,200. Systems up to 1,000 kWp. New applications from 6 October 2026 to 6 July 2027." },

  { "type": "heading", "level": 2, "text": "What changed, and what did not" },
  { "type": "table", "headers": ["", "From 6 October 2026 (SEAI)"], "rows": [
    ["Rate", "An effective 45%, roughly double the old rate"],
    ["Ceiling", "Up to €325,200, on a 1,000 kWp system"],
    ["Who can apply", "Businesses, farms, public bodies, schools, community centres and non-profits, as before"],
    ["Existing applications", "Not increased. The new rate is for new applications only"],
    ["The rules", "Letter of offer before any work or purchase; the job done by a registered SEAI Non-Domestic Microgen company"]
  ] },
  { "type": "paragraph", "text": "The full kWp table, eligibility, VAT and tax relief are on our [commercial solar grant guide](/commercial-solar-grant). This post is about the clock." },

  { "type": "heading", "level": 2, "text": "The deadline is for the application, not the install" },
  { "type": "paragraph", "text": "6 July 2027 is the last day to apply. An application needs a system designed for your roof and meter, sized from your real usage, and a quote to match. That takes a bill, a site survey and a design. Each step has a queue, and the queue lengthens as the deadline nears." },

  { "type": "heading", "level": 2, "text": "Work backwards from 6 July 2027" },
  { "type": "table", "headers": ["Step", "What happens", "Time it takes"], "rows": [
    ["1. Your bill", "We read your business bill, your MPRN and when you use power.", "Days"],
    ["2. Site survey", "Every business gets an on-site survey: roof, meter, board, cable runs.", "Book weeks ahead in spring"],
    ["3. Design and quote", "The system size and the price the application is built on.", "One to two weeks"],
    ["4. Apply to SEAI", "The application goes in by 6 July 2027.", "Deadline day at the latest"],
    ["5. Letter of offer", "SEAI issues the offer. Nothing is bought or started before it.", "Wait for it"],
    ["6. ESB Networks", "Your installer applies to ESB Networks before installing: NC6 or NC7 depending on size.", "At least 4 weeks, 20 working days"],
    ["7. Install", "A Safe Electric registered electrician wires and certifies it.", "Days to weeks, by size"],
    ["8. Paperwork and payment", "You pay the invoice, the Declaration of Works goes in, SEAI pays.", "4 to 6 weeks after all documents (SEAI)"]
  ] },
  { "type": "paragraph", "text": "SEAI's offer is valid for 8 months once issued, so the install is not the squeeze. Steps 1 to 4 are. A business that starts in June is fitting a bill review, a site survey, a design and a quote into a few weeks, alongside every other business that left it late." },
  { "type": "paragraph", "text": "Waiting has a second cost. Apply in January and you can be generating through spring and summer 2027. Apply in July and the 8-month offer runs into the dark months, so your first summer of output is 2028." },
  { "type": "callout", "variant": "warning", "title": "The rule that catches people", "body": "Do not buy panels, sign an order that starts work, or let anyone on the roof before SEAI's letter of offer arrives. SEAI does not pay for work started before the offer." },

  { "type": "heading", "level": 2, "text": "What 45% pays on two system sizes" },
  { "type": "paragraph", "text": "Both values come from SEAI's kWp table for the doubled window. SEAI pays the lower of the table value and 45% of your invoice, so your grant can be less." },
  { "type": "table", "headers": ["System", "SEAI table value (doubled window)", "Invoice needed to receive it in full"], "rows": [
    ["20 kWp", "€13,200", "€29,334 or more"],
    ["50 kWp", "€25,200", "€56,000 or more"]
  ] },
  { "type": "paragraph", "text": "Illustrative data, not a quote. Your system size comes from your bill and the site survey. Every band up to 1,000 kWp is in the [full SEAI grant table](/commercial-solar-grant#table)." },

  { "type": "heading", "level": 2, "text": "Farms: the same grant, the same clock" },
  { "type": "paragraph", "text": "Agriculture is in, on the same 45% and the same 6 July 2027 deadline: one grant per MPRN, for your own use on the farm. Spring is not a quiet time on a farm to book a site survey, so start in winter. How it compares with TAMS is in [farm solar in 2027: the doubled SEAI grant or TAMS](/blog/farm-solar-2027-doubled-seai-grant-or-tams)." },

  { "type": "heading", "level": 2, "text": "The small print" },
  { "type": "bulletList", "items": [
    "Tax clearance is needed if your SEAI grants pass €10,000 in a calendar year.",
    "The offer is valid for 8 months. Finish the works and send the Declaration of Works inside it.",
    "Batteries are not eligible costs under this grant. The claim covers the solar PV system.",
    "Payment lands 4 to 6 weeks after SEAI has every document."
  ] },

  { "type": "heading", "level": 2, "text": "Questions businesses ask" },
  { "type": "heading", "level": 3, "text": "What is the SEAI business solar grant in 2027?" },
  { "type": "paragraph", "text": "It is the Non-Domestic Microgen Grant. For new applications from 6 October 2026 to 6 July 2027 it pays the lower of SEAI's kWp table or 45% of the invoice, up to €325,200, on systems up to 1,000 kWp." },
  { "type": "heading", "level": 3, "text": "Does the doubled rate apply to my existing application?" },
  { "type": "paragraph", "text": "No. SEAI says existing applications are not increased. The 45% rate is for new applications only." },
  { "type": "heading", "level": 3, "text": "Can I start work before SEAI approves the grant?" },
  { "type": "paragraph", "text": "No. Work or purchases started before SEAI's letter of offer are not eligible. Once the offer arrives you have 8 months to finish and send the Declaration of Works." },
  { "type": "heading", "level": 3, "text": "Does the grant cover a battery?" },
  { "type": "paragraph", "text": "No. Batteries are not eligible costs under this grant. The claim covers the solar PV system." },
  { "type": "heading", "level": 3, "text": "How long does SEAI take to pay?" },
  { "type": "paragraph", "text": "SEAI pays 4 to 6 weeks after it has every document. Grants above €10,000 in a calendar year need tax clearance." },

  { "type": "heading", "level": 2, "text": "Start with your bill" },
  { "type": "paragraph", "text": "Upload a business bill to the [bill analyser](/solar-calculator) and see your figures first. Then a 15-minute call, then the site survey, then the design the application is built on. The earlier that starts, the more room there is before 6 July 2027. How we install for businesses is on our [commercial solar services](/services#business) page." },
  { "type": "cta", "text": "Analyse your business bill", "href": "/solar-calculator" },
  { "type": "cta", "text": "Read the commercial solar grant guide", "href": "/commercial-solar-grant" },
  { "type": "paragraph", "text": "Source: [SEAI, Non-Domestic Microgen Grant](https://www.seai.ie/grants/business-grants/commercial-solar-pv), read 12 November 2026." }
]
```

## Flags for Cal
- REGISTERED COMPANY: canon and the grant page say "Registered with SEAI for solar PV", not "registered SEAI Non-Domestic Microgen company". Post says a registered NDM company is required but never claims Solar Ireland is one. Confirm before adding that claim.
- "PREVIOUSLY ~23%": source is the Farmers Journal, not an official source. Post says "roughly half that" with no figure. Confirm SEAI states it before quoting 23%.
- No SEAI URL is in this file. Add https://www.seai.ie/grants/business-grants/commercial-solar-pv (used in the farm draft) as an inline link on publish.
- "National Energy Affordability Taskforce" attribution to SEAI: confirm the wording on seai.ie.
- Table values hand-computed from the bands; verify against ndmgTableEur() at insert. "Invoice needed" column = table value / 0.45 (20 kWp: €29,333.33, rounded up to €29,334).
- Timings for steps 1 to 3 and 7 are not SEAI figures; edit if you want them dropped.
- "/commercial-solar-grant" is linked twice in prose/CTA (guide link + CTA) plus once as #table.
