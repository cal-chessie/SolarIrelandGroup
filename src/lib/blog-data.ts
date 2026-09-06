
export type ContentSection =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'callout'; variant: 'tip' | 'warning' | 'info' | 'stat'; title: string; body: string }
  | { type: 'bulletList'; items: string[] }
  | { type: 'numberedList'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'divider' }
  | { type: 'cta'; text: string; href: string };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
  author: string;
  iconBg: string;
  iconColor: string;
  image?: string;
  content: ContentSection[];
}

export const articles: Article[] = [
  {
    "slug": "are-solar-panels-worth-it-ireland-2026",
    "title": "Are Solar Panels Worth It in Ireland? 2026 Verdict",
    "excerpt": "For most Irish homes, yes: savings of 800-1,400 euro a year, payback in 5-7 years, and the 1,800 euro SEAI grant still in place. The honest 2026 verdict, worked out.",
    "category": "savings",
    "date": "5 Sep 2026",
    "readTime": "10 min read",
    "author": "Solar Ireland Team",
    "iconBg": "bg-emerald-400/10",
    "iconColor": "text-emerald-400",
    "content": [
      {
        "type": "paragraph",
        "text": "Yes. For most Irish homes, solar panels are worth it in 2026. A typical system saves **€800-1,400 a year** on electricity, pays for itself in 5-7 years, and the €1,800 SEAI grant plus 0% VAT are both still in place. The honest exceptions are a heavily shaded roof or a very small electricity bill."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Are solar panels worth it in Ireland in 2026? The short answer"
      },
      {
        "type": "paragraph",
        "text": "The question deserves a straight answer, so here it is. If your home uses somewhere near the average of **4,200 kWh a year** (the CRU standard figure), has a roof that gets reasonable light for most of the day, and you plan to stay put for at least five years, solar panels are one of the best-returning purchases you can make in Ireland right now. The combination that makes 2026 work is simple: the €1,800 SEAI grant was held at its current level rather than cut as originally planned, VAT on domestic solar is 0%, and every unit of electricity you avoid buying is worth 35-45c to you at current supplier rates."
      },
      {
        "type": "paragraph",
        "text": "We install across all 32 counties, and the pattern in our own job data is consistent: the households that do best are not the ones with the biggest roofs, they are the ones with the biggest daytime usage. That is why the real answer to \"is it worth it?\" always starts with your bill, not your roof. We will come back to that."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Ireland is voting with its roofs",
        "body": "More than **102,000 Irish homes** have been grant-aided for solar since 2018, with a record **34,088 installations in 2025** - about 16% up on 2024, according to the SEAI's end-of-year statement. This is no longer an early-adopter purchase."
      },
      {
        "type": "table",
        "headers": [
          "The 2026 numbers",
          "Figure"
        ],
        "rows": [
          [
            "SEAI solar grant",
            "€1,800 (held for 2026)"
          ],
          [
            "VAT on domestic solar",
            "0%"
          ],
          [
            "Typical net cost, 4kWp system",
            "€4,200-€6,200 after grant"
          ],
          [
            "Typical annual bill saving",
            "€800-1,400"
          ],
          [
            "Typical export income (4kWp)",
            "€200-400 a year"
          ],
          [
            "Typical payback",
            "5-7 years"
          ],
          [
            "Typical 25-year savings",
            "€30,000-€50,000"
          ]
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How much do solar panels cost after the €1,800 SEAI grant?"
      },
      {
        "type": "paragraph",
        "text": "A standard 4kWp system on an Irish home lands at roughly €4,200-€6,200 after the grant, with larger 6kWp systems typically €6,700-€9,200 net. The full price breakdown by system size is in our guide to [how much solar panels cost in Ireland](/blog/how-much-do-solar-panels-cost-ireland-2026), but the grant mechanics matter just as much as the sticker price. The grant is tiered at €700 per kWp for the first 2kWp and €200 per kWp up to 4kWp, which means any system of 4kWp or larger gets the full **€1,800**."
      },
      {
        "type": "paragraph",
        "text": "To qualify, your home must have been built and occupied before 2021, have a valid MPRN (the 11-digit meter point number on your bill), and have received no previous solar grant at that MPRN. Both owner-occupiers and private landlords are eligible - a point plenty of people get wrong. You apply online before any work starts, the grant offer normally issues immediately, and it stays valid for 8 months. The full walkthrough is in our [complete SEAI grant guide](/blog/complete-guide-seai-solar-grant-2026)."
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "How the grant is actually paid",
        "body": "SEAI pays the grant directly to **your bank account** by EFT, usually within about 4-6 weeks of your completion documents and post-works BER being published. It is not deducted from the installer's invoice, so budget for the gross price and treat the €1,800 as a rebate that follows."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How much will solar panels save on your electricity bill each year?"
      },
      {
        "type": "paragraph",
        "text": "A typical Irish home with a well-sized system saves **€800-1,400 a year**, made up of two streams: electricity you no longer buy, and export income for what you sell back. The first stream is worth far more per unit. Every kWh your panels generate that you use at home replaces grid electricity costing 35-45c per kWh at current rates, while a kWh exported earns you roughly 21c under a typical 2026 Clean Export Guarantee rate. That gap is the single most important number in solar economics: **using your own power beats selling it, roughly two to one**."
      },
      {
        "type": "paragraph",
        "text": "This is why two identical houses with identical panels can have very different savings. A household running the washing machine, dishwasher and immersion during daylight hours self-consumes far more of its generation than one that is empty until 6pm. It is also the honest case for storage: a battery shifts your surplus into the evening at grid-price value instead of export value. Whether that upgrade earns its keep depends on your usage pattern - we set out the sums in [our battery storage verdict](/blog/battery-storage-is-it-worth-the-extra-cost)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How long does payback take? A worked 3-bed semi example"
      },
      {
        "type": "paragraph",
        "text": "Here is a real-world-shaped example, the kind we price every week. A 3-bed semi-detached home using 4,200 kWh a year, with a bill showing a 60/40 day/night usage split, fits a 4.2kWp system at a net cost of **€5,000** after the grant."
      },
      {
        "type": "bulletList",
        "items": [
          "**Annual generation:** roughly 3,600 kWh from a well-sited 4.2kWp array, based on what we see across our own installs.",
          "**Self-consumed at home:** about half, 1,800 kWh, replacing grid electricity at €0.35/kWh = **€630 saved** on the bill.",
          "**Exported:** the other 1,800 kWh at a 2026 CEG rate of €0.21/kWh = **€378 earned**, tax-free under the €400 annual exemption.",
          "**Total first-year benefit:** about €1,008.",
          "**Payback:** €5,000 divided by €1,008 = **just over 5 years**."
        ]
      },
      {
        "type": "paragraph",
        "text": "Across the range of homes we fit, payback typically lands between **5 and 7 years**. Bigger daytime usage pushes you toward the fast end; a smaller bill or a compromised roof orientation pushes you toward the slow end. Orientation matters less than people fear - east-west arrays catch morning and evening usage well - but shading matters a great deal, which is exactly what a proper site survey checks before you commit."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What do you earn from the Clean Export Guarantee?"
      },
      {
        "type": "paragraph",
        "text": "Every unit you export is bought by your electricity supplier under the Clean Export Guarantee. Each supplier sets its own rate - in 2026 these sit roughly between 19c and 24c per kWh, typically around 21c - and the CRU oversees the scheme but does not set a minimum rate, so it pays to compare when your contract renews. You need a smart meter for metered export payments, and a typical 4kWp system earns **€200-400 a year**. The first €400 of annual export income is exempt from income tax, per citizensinformation.ie. How the payments, rates and metering fit together is covered in our [Clean Export Guarantee explainer](/blog/clean-export-guarantee-explained)."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "The €400 tax exemption is doing quiet work",
        "body": "Because the first €400 a year of export income is tax-exempt, a typical 4kWp home keeps every cent of its CEG earnings. That effectively makes your export income worth more than the same amount of taxed income - a detail the headline rate comparisons miss."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "When are solar panels NOT worth it? The honest cases"
      },
      {
        "type": "paragraph",
        "text": "We would rather lose a sale than fit a system that disappoints. There are genuine cases where we tell people to hold off:"
      },
      {
        "type": "bulletList",
        "items": [
          "**Heavy, unfixable shading.** A roof shadowed by tall trees or neighbouring buildings for most of the day cannot generate its way to a sensible payback. Optimisers help with partial shading; they cannot conjure light.",
          "**A very small bill.** If your home uses well under 2,000 kWh a year, your savings ceiling is low and payback stretches. Fix the usage question first.",
          "**A roof due for replacement.** Reroofing under panels means paying to remove and refit them. Do the roof first, then the panels.",
          "**Homes built from 2021 onwards.** These do not qualify for the SEAI grant, so the same system costs €1,800 more. Solar can still stack up on a high bill, but the payback is honestly longer.",
          "**Protected structures and ACAs.** Most rooftop solar on houses is exempted development with no rooftop area limit since S.I. 493/2022, but protected structures and architectural conservation areas still carry restrictions. Check before you plan."
        ]
      },
      {
        "type": "callout",
        "variant": "warning",
        "title": "Be wary of anyone who says it always works",
        "body": "Any installer quoting you a payback figure without seeing your bill is guessing. The day/night usage split on your bill changes the sums by hundreds of euro a year - it is the difference between a 5-year and an 8-year payback on the same roof."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What are solar panels worth over 25 years?"
      },
      {
        "type": "paragraph",
        "text": "Payback is only the halfway point of the story. Modern tier-one panels carry 25-30 year performance warranties from their manufacturers, and the system keeps producing long after it has paid for itself. Over a 25-year life, a typical Irish home saves **€30,000-€50,000** in avoided electricity costs and export income. Even the low end of that range is several multiples of what you paid, and unlike most home upgrades, this one produces a measurable cash return every single month, including through the darker half of the year - see [how panels perform in an Irish winter](/blog/solar-panels-in-winter-do-they-work) for the seasonal reality."
      },
      {
        "type": "paragraph",
        "text": "There is a wider tailwind too. Ireland's Climate Action Plan targets 80% renewable electricity by 2030, and homes that generate their own power are simply better positioned for whatever supplier prices do next. Nobody can honestly forecast electricity prices, so we do not - but every scenario where they rise makes your panels worth more, and the post-works BER that comes with a grant-aided install is a concrete, documented improvement to your home's energy rating."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How do you find your exact number?"
      },
      {
        "type": "paragraph",
        "text": "Everything above is a range because every home is different. Your exact number comes from two things: your electricity bill and your roof. Our AI bill analysis reads the day/night usage split directly from your bill and sizes a system around how your home actually uses power, then a site survey confirms the roof, shading and layout before anything is priced. From there, we handle the SEAI grant paperwork and the free ESB Networks NC6 microgeneration notification as part of the job. You can get your first estimate in minutes with the [free solar calculator](/solar-calculator)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Frequently asked questions"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "How long is the payback period for solar panels in Ireland?"
      },
      {
        "type": "paragraph",
        "text": "Typically **5-7 years** for a well-sized domestic system after the €1,800 SEAI grant. Homes with high daytime usage and a clear roof come in near 5 years; smaller bills or awkward roofs stretch toward 7. After payback, the system produces essentially free electricity for the rest of its 25-30 year working life."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Is the SEAI solar grant still available in 2026?"
      },
      {
        "type": "paragraph",
        "text": "Yes. The grant is **€1,800** and was held at that level for 2026, with the planned €300-a-year reductions paused. It applies to homes built and occupied before 2021 with a valid MPRN and no previous solar grant at that address, and both owner-occupiers and private landlords can claim it."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Do solar panels work in Irish winters?"
      },
      {
        "type": "paragraph",
        "text": "Yes, at reduced output. Panels generate from daylight, not heat, so they produce year-round, with winter months contributing a smaller share of the annual total. The economics above are annual figures that already include Irish winters - the summer surplus does the heavy lifting and the export income smooths the year out."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Do solar panels add value if I sell my home?"
      },
      {
        "type": "paragraph",
        "text": "A grant-aided installation comes with a post-works BER, and a better energy rating is a documented, portable improvement that buyers and their lenders increasingly ask about. We will not invent a euro figure for you - resale premiums depend on the market - but a home with lower running costs and its paperwork in order is an easier sale, and the savings you banked along the way are already yours."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Should I wait for solar panels to get cheaper?"
      },
      {
        "type": "paragraph",
        "text": "The waiting game has quietly turned against waiting. The grant was scheduled to fall by €300 a year and has been held at €1,800 for 2026 instead, but that pause is a policy decision, not a promise. Meanwhile every year you wait costs you a year of savings - €800-1,400 at typical rates - which is more than any plausible near-term hardware price drop would save you."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Get your exact payback number - upload your bill to the free solar calculator",
        "href": "/solar-calculator"
      }
    ],
    "image": "/install-2.webp"
  },
  {
    "slug": "solar-panel-installation-process-ireland",
    "title": "Solar Installation in Ireland: Step by Step (2026)",
    "excerpt": "The full journey from site survey to switch-on: SEAI grant, installation day, the free NC6 form, the post-works BER and when export payments start.",
    "category": "guides",
    "date": "5 Sep 2026",
    "readTime": "8 min read",
    "author": "Solar Ireland Team",
    "iconBg": "bg-sky-400/10",
    "iconColor": "text-sky-400",
    "content": [
      {
        "type": "paragraph",
        "text": "A typical Irish solar installation takes **1-2 days** on the roof, and about 4-8 weeks end to end: site survey, SEAI grant approval, installation, the free NC6 notification to ESB Networks, a post-works BER assessment, then Clean Export Guarantee payments. Here is exactly what happens at each step, from an installer who does this every week."
      },
      {
        "type": "paragraph",
        "text": "Solar Ireland is an SEAI-registered installer working across all 32 counties, and the questions we get asked most have nothing to do with panels. They are about process: who fills in what, when the money moves, and how long the whole thing takes. This guide walks the six steps in the order they actually happen."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How long does solar installation take in Ireland?"
      },
      {
        "type": "paragraph",
        "text": "The physical installation takes 1-2 days for a typical domestic system. The full journey, from first enquiry to grant money in your bank account, usually runs 4-8 weeks, and most of that is scheduling and paperwork rather than work on your roof. Demand matters too: SEAI grant-aided a record 34,088 home solar installations in 2025, about 16% up on 2024, so lead times stretch in the busiest months. If you are flexible on timing, [when you book makes a difference](/blog/best-time-of-year-to-get-solar-panels-ireland)."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "The short version",
        "body": "**1-2 days** on the roof. The grant offer normally issues immediately when you apply online. SEAI pays the grant into your nominated bank account about **4-6 weeks** after your completion documents are in and the post-works BER is published (seai.ie)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Step 1: What happens at the site survey?"
      },
      {
        "type": "paragraph",
        "text": "Everything starts with your electricity bill and your roof. Send us a recent bill and our analysis reads your day/night usage split, which tells us how much of your electricity solar can realistically replace. Then a surveyor comes to the house. This is a physical visit, not a desktop exercise: sizing a system without seeing the actual roof and fuse board is guesswork."
      },
      {
        "type": "bulletList",
        "items": [
          "Roof dimensions, pitch, orientation and the fixing type your tiles or slates need",
          "Attic and roof structure, to confirm it will carry the array",
          "Your fuse board, earthing and meter location, plus the MPRN (the 11-digit meter point number on your bill)",
          "Shading from chimneys, trees or neighbouring buildings across the day",
          "Cable routes, inverter location and space for a battery if you want one"
        ]
      },
      {
        "type": "paragraph",
        "text": "Planning permission is not a step for most homes. Since October 2022 (S.I. 493 of 2022), rooftop solar on houses is exempted development with no roof area limit, with exceptions near aerodromes and for protected structures. The detail is in our [planning rules guide](/blog/planning-permission-solar-panels-ireland)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Step 2: How do you apply for the SEAI grant?"
      },
      {
        "type": "paragraph",
        "text": "You apply online at seai.ie before any work starts, and the grant offer normally issues immediately. The Solar PV grant is worth up to **€1,800**. You need a valid MPRN, and the home must have been built and occupied before 2021 with no previous solar grant at that MPRN. Owner-occupiers and private landlords are both eligible. The offer is valid for 8 months, and you have 30 days to accept it. Eligibility, tiers and paperwork are covered in our [complete SEAI grant guide](/blog/complete-guide-seai-solar-grant-2026)."
      },
      {
        "type": "callout",
        "variant": "warning",
        "title": "Apply before works start",
        "body": "SEAI will not pay a grant for works that began before your grant offer. Apply first, get the offer, then let the installation be scheduled. Any installer who suggests starting on the roof while the application gets sorted later is putting your €1,800 at risk."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Step 3: What happens on installation day?"
      },
      {
        "type": "numberedList",
        "items": [
          "Scaffolding goes up, usually the day before or first thing that morning",
          "Roof anchors and mounting rails are fixed to the rafters, flashed and sealed",
          "Panels are lifted, clamped and wired into strings",
          "The inverter, and the battery if you chose one, is mounted in the attic, garage or hot press area",
          "A RECI (Safe Electric) registered electrician completes the AC wiring to the I.S. 10101 wiring standard, with a brief power-off to make the final connection at the fuse board",
          "The system is commissioned, tested and switched on, and we walk you through the monitoring app before we leave"
        ]
      },
      {
        "type": "paragraph",
        "text": "For most houses that is one full day; two where the roof is complex, the array is split across faces, or a battery is going in at the same time. You do not need to be home for the roof work, but plan to be there at the start for a walkthrough and at the end for the handover. Expect the power to be off for a short period while the electrician makes the final connection."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Step 4: Who submits the NC6 form to ESB Networks?"
      },
      {
        "type": "paragraph",
        "text": "Your installer does, and it is free. The NC6 is ESB Networks' microgeneration notification: it tells the network operator that a generator, your solar system, is now connected at your MPRN. Your installer completes and submits it as part of the job. There is no fee and nothing for you to fill in."
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "The NC6 costs nothing",
        "body": "ESB Networks does not charge for a domestic NC6 microgeneration notification, and submitting it is standard installer work. It matters for Step 6: your export payments depend on ESB Networks knowing there is a generator at your MPRN."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Step 5: What is the post-install BER assessment for?"
      },
      {
        "type": "paragraph",
        "text": "A post-works BER is a required step for the SEAI grant. Once your installation is finished, your installer uploads the completion documentation to SEAI, and you arrange a BER assessment of the house. The grant can only be processed after all documents are in and the new BER is published by the assessor. SEAI then pays the grant by electronic transfer into the bank account you nominated on your application, usually within about 4-6 weeks (seai.ie). The grant is not deducted from your installer's bill; it lands in your account."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Book the BER assessor early",
        "body": "The BER is the step homeowners most often leave late, and it holds the whole payment up. Book an assessor for the week after your installation date and ask them to publish the certificate as soon as it is done. That keeps the roughly 4-6 week payment clock as short as it can be."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Step 6: When do Clean Export Guarantee payments start?"
      },
      {
        "type": "paragraph",
        "text": "Once your system is live and the NC6 is in, electricity you export earns credit under the Clean Export Guarantee (CEG). Two things need to be true: you need a smart meter, and your supplier needs you registered on their export tariff. Each supplier sets its own rate; in 2026 rates run roughly €0.19-0.24 per kWh, typically around €0.21. The credit appears on your normal electricity bills, so exactly when it starts depends on your supplier's billing cycle. A typical 4kWp home earns €200-400 a year from export, and the first €400 a year of export income is tax-exempt (citizensinformation.ie). No smart meter yet? Here is [how the smart meter requirement works](/blog/smart-meter-required-solar-panels-ireland)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How long from quote to switch-on in total?"
      },
      {
        "type": "table",
        "headers": [
          "Stage",
          "Who does it",
          "Typical time"
        ],
        "rows": [
          [
            "Site survey",
            "You + our surveyor",
            "1-2 hours at the house"
          ],
          [
            "SEAI grant application",
            "You, online at seai.ie",
            "Offer normally issues immediately; valid 8 months"
          ],
          [
            "Scheduling and materials",
            "Installer",
            "Typically 2-4 weeks, longer at peak times"
          ],
          [
            "Installation",
            "Installer crew",
            "1-2 days"
          ],
          [
            "NC6 notification",
            "Installer, free",
            "Submitted as part of the job"
          ],
          [
            "Post-works BER",
            "Assessor you book",
            "Book for the week after install"
          ],
          [
            "Grant payment",
            "SEAI, by bank transfer",
            "About 4-6 weeks after documents + BER published"
          ],
          [
            "CEG export credit",
            "Your electricity supplier",
            "On your bills once registered"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Add it up and a smooth job runs about 4-8 weeks from survey to grant money landing. The part that matters most happens on day one of installation: from the moment the system is commissioned, every daytime kWh is cutting your bill, typically €800-1,400 a year for an average home. The rest of the timeline is paperwork moving around you, not you waiting to benefit."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Frequently asked questions"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Do I need scaffolding, and who arranges it?"
      },
      {
        "type": "paragraph",
        "text": "Yes, for almost every roof-mounted job. It is a safety requirement for working at height, and the installer arranges it and includes it in the quote. It usually goes up the day before installation and comes down within a few days after."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "What happens if it rains on installation day?"
      },
      {
        "type": "paragraph",
        "text": "We install through normal Irish weather; rain rarely stops a job. High winds are the real constraint, because lifting panels onto a roof in a storm is unsafe, so a status orange or red wind warning can push the roof work back a day or two. Indoor electrical and inverter work goes ahead regardless."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Do I need a smart meter before the panels go in?"
      },
      {
        "type": "paragraph",
        "text": "No. The system generates and cuts your bill from the day it is commissioned, meter or no meter. A smart meter is only needed for the Clean Export Guarantee payment, so the export side of your savings starts once it is fitted and your supplier registers you."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Do I have to be home on the day?"
      },
      {
        "type": "paragraph",
        "text": "Be there at the start for a quick walkthrough and at the end for commissioning and handover, when we set up your monitoring app and show you what normal generation looks like. In between, the crew works on the roof and at the fuse board and does not need you standing by."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Book your free site survey",
        "href": "/book-survey"
      }
    ],
    "image": "/install-1.webp"
  },
  {
    "slug": "how-to-read-electricity-bill-ireland-solar",
    "title": "How to Read Your Electricity Bill in Ireland (2026)",
    "excerpt": "MPRN, day and night rates, standing charges and kWh: how to read an Irish electricity bill in 2026, and what the day/night split tells you about solar.",
    "category": "savings",
    "date": "5 Sep 2026",
    "readTime": "10 min read",
    "author": "Solar Ireland Team",
    "iconBg": "bg-amber-400/10",
    "iconColor": "text-amber-400",
    "content": [
      {
        "type": "paragraph",
        "text": "Every Irish electricity bill comes down to four numbers: your **11-digit MPRN**, the kWh you used, the unit rates you pay depending on when you used them, and the fixed charges that arrive no matter what. Read those four and you can check any bill in under a minute - and see exactly what solar would replace."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What do the numbers on your electricity bill actually mean?"
      },
      {
        "type": "paragraph",
        "text": "Suppliers lay their bills out differently, but every one is built from the same parts. The front page shows the total and the payment date. The detail page - usually page two - is where the real information lives: your meter readings, the kWh used since the last bill, the unit rate applied to each block of usage, the standing charge, the PSO levy and VAT."
      },
      {
        "type": "table",
        "headers": [
          "Line on the bill",
          "What it is",
          "Why it matters"
        ],
        "rows": [
          [
            "MPRN",
            "The 11-digit Meter Point Reference Number identifying your connection to the network (esbnetworks.ie)",
            "Needed for the SEAI grant application and the ESB Networks NC6 microgeneration form"
          ],
          [
            "Meter reading",
            "The reading used to calculate usage, marked A (actual), E (estimated) or C (customer-submitted)",
            "Estimated reads distort your real usage pattern"
          ],
          [
            "kWh used",
            "Units of electricity consumed since the last bill",
            "This is the number solar offsets"
          ],
          [
            "Unit rate",
            "What you pay per kWh, often split into day, night and peak",
            "The day rate is what self-consumed solar replaces"
          ],
          [
            "Standing charge",
            "A fixed daily charge for your connection, billed regardless of usage",
            "Solar does not remove it"
          ],
          [
            "PSO levy",
            "The Public Service Obligation levy, set each year by the CRU",
            "Applies to every bill, solar or not"
          ],
          [
            "VAT",
            "Added at the reduced rate for domestic energy",
            "Charged on the whole bill"
          ]
        ]
      },
      {
        "type": "callout",
        "variant": "warning",
        "title": "Watch for the letter E",
        "body": "An estimated read (marked E on the bill) means the kWh figure is a guess based on your history, not a measurement. A run of estimated bills can hide months of real usage and skew any solar sizing built on them. Submit an actual read to your supplier - or better, use your smart meter data - before making decisions off the numbers."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What is your MPRN and where do you find it?"
      },
      {
        "type": "paragraph",
        "text": "The MPRN (Meter Point Reference Number) is the unique 11-digit number that identifies your property's connection to the electricity network (esbnetworks.ie). ESB Networks assigns it to the connection point, not to you or your supplier, so it never changes - not when you switch supplier, not when you move house, not even when the meter itself is replaced."
      },
      {
        "type": "paragraph",
        "text": "You will find it on the front page of any electricity bill, usually near your account number, and it begins with the number 10. If you cannot find a bill, ESB Networks can trace the MPRN from your address."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Have your MPRN ready before you apply",
        "body": "The SEAI solar grant application asks for a valid MPRN, and your installer needs it for the free ESB Networks NC6 microgeneration notification. Dig out one recent bill before your [site survey](/book-survey) and both jobs get done without a chase."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What are day, night and peak rates on an Irish bill?"
      },
      {
        "type": "paragraph",
        "text": "If you are on a standard 24-hour tariff, this section is short: every kWh costs the same around the clock. But on a day/night meter or a smart tariff, when you use electricity matters as much as how much you use."
      },
      {
        "type": "paragraph",
        "text": "On a traditional day/night meter, the night rate runs from 23:00 to 08:00 in winter, shifting to 00:00 to 09:00 during summer time (esbnetworks.ie). Smart tariffs typically add a peak window in the early evening, usually 17:00 to 19:00, when demand on the national grid is highest. Each supplier sets its own rates and exact windows, so check the tariff detail on your own bill rather than a neighbour's."
      },
      {
        "type": "table",
        "headers": [
          "Rate band",
          "Typical hours",
          "What it means for you"
        ],
        "rows": [
          [
            "Day",
            "08:00 to 23:00",
            "Where most household usage lands, at the standard rate"
          ],
          [
            "Night",
            "23:00 to 08:00",
            "Cheaper units - timers, EV charging and immersion heating belong here"
          ],
          [
            "Peak",
            "Usually 17:00 to 19:00 on smart tariffs",
            "The dearest units of the day - avoid heavy loads if you can"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "This split is not just a billing curiosity. It is the single most useful piece of information on your bill when it comes to solar, because it shows when your home actually consumes."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How many kWh does the average Irish home use per year?"
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "The benchmark number",
        "body": "The average Irish home uses roughly **4,200 kWh of electricity per year** - the standard consumption figure published by the CRU. Divide the kWh on your latest bill by the number of days it covers, multiply by 365, and you can see instantly whether you are a light, average or heavy user."
      },
      {
        "type": "paragraph",
        "text": "Usage varies enormously around that average. A small apartment on gas heating sits well below it, while a large house running a heat pump and an EV can use double the average or more. Neither is wrong; they just lead to very different solar systems."
      },
      {
        "type": "paragraph",
        "text": "Annualising matters because usage is seasonal. A November bill will always look worse than a May one, so never judge your consumption - or size a solar system - from a single billing period. Twelve months of bills, or a year of smart meter data, gives the true picture."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What are standing charges and why do they never go away?"
      },
      {
        "type": "paragraph",
        "text": "The standing charge is a fixed daily amount that covers the cost of your connection: the wires, the meter, network maintenance and supplier overheads. It is billed every day whether you use one unit or a thousand, and it varies by supplier and by whether your connection is classed as urban or rural."
      },
      {
        "type": "paragraph",
        "text": "This is worth understanding before you look at solar, because it sets an honest floor under your bill. Panels reduce the kWh you buy, and the [Clean Export Guarantee](/blog/clean-export-guarantee-explained) pays you for the surplus you export, but no solar system removes the standing charge. Anyone promising a zero bill is not reading the same bills we are. The realistic goal is to cut the usage side hard - typically EUR 800-1,400 a year for a well-sized system - while the fixed side stays."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How is a smart meter bill different?"
      },
      {
        "type": "paragraph",
        "text": "A smart meter records your electricity in 30-minute intervals and sends the readings to ESB Networks automatically (esbnetworks.ie). That kills the estimated read problem: bills reflect what you actually used, and you can request your own half-hourly usage data through the ESB Networks website to see your consumption pattern in detail."
      },
      {
        "type": "paragraph",
        "text": "For solar owners a smart meter is not optional extra credit - you need one to be paid for exported electricity under the Clean Export Guarantee. If you still have an older meter, read [whether you need a smart meter for solar panels](/blog/smart-meter-required-solar-panels-ireland) before you plan an installation."
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "30-minute data is gold",
        "body": "Half-hourly smart meter data shows exactly when your home uses electricity. Matched against solar generation hours, it tells an installer how much of a system's output you would actually consume - which is the number that decides your payback."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Why does your day/night split decide your solar system size?"
      },
      {
        "type": "paragraph",
        "text": "Solar panels generate during daylight. Electricity you consume as it is generated - self-consumption - replaces units you would otherwise buy at your full day rate. Electricity you export earns the Clean Export Guarantee instead: each supplier sets its own rate, with 2026 rates roughly between EUR 0.19 and EUR 0.24 per kWh and typically around EUR 0.21. Export income is worthwhile - the first EUR 400 a year of it is tax-exempt (citizensinformation.ie) - but a self-consumed unit is usually worth more than an exported one."
      },
      {
        "type": "paragraph",
        "text": "That is why two homes with identical roofs and identical annual kWh can need different systems. A household that runs washing, cooking and working-from-home loads through the day will self-consume a large share of a bigger array. A house that is empty from 08:00 to 18:00, with most usage in the evening and at night, self-consumes far less - and may be better served by a more modest array, load shifting with timers, or a battery that carries daytime generation into the evening."
      },
      {
        "type": "paragraph",
        "text": "The day/night split on your bill is the first honest signal of which household you are. It is the starting point for working out [how many solar panels you actually need](/blog/how-many-solar-panels-do-i-need-ireland) - roof space sets the ceiling, but your usage pattern sets the target. Get the match right and a typical system pays for itself in 5-7 years."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What does your bill tell a solar installer?"
      },
      {
        "type": "paragraph",
        "text": "When we assess a home, the electricity bill does most of the talking. It gives us the MPRN for the SEAI grant paperwork and the free NC6 microgeneration notification we submit to ESB Networks on your behalf. It gives us your annual kWh, your tariff type and - most importantly - your day/night usage split, which drives system sizing, battery advice and a savings estimate built on your numbers rather than a brochure's."
      },
      {
        "type": "paragraph",
        "text": "You do not have to decode any of it yourself. Our [solar calculator](/solar-calculator) uses AI bill analysis to read the day and night usage split straight from your electricity bill and turn it into a properly sized system with honest figures. From there, a site survey confirms the roof, the meter setup and the installation details."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Frequently asked questions"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "What does an estimated read on my electricity bill mean?"
      },
      {
        "type": "paragraph",
        "text": "An E beside the meter reading means your supplier estimated the usage from historical patterns instead of taking an actual reading. The bill trues up when a real read arrives, marked A (an actual read) or C (a reading you submitted yourself). Smart meters remove estimates entirely."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Will switching supplier change my MPRN or my meter?"
      },
      {
        "type": "paragraph",
        "text": "No. The MPRN belongs to the property's connection point and stays the same through every switch, and the meter is ESB Networks equipment, not the supplier's. Switching changes who bills you and at what rates - nothing physical changes at the house, and an existing solar connection carries over."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Do I need my MPRN for the SEAI solar grant?"
      },
      {
        "type": "paragraph",
        "text": "Yes. The application requires a valid MPRN, and the home must have been built and occupied before 2021 with no previous solar grant at that MPRN. The grant is worth up to EUR 1,800, and SEAI pays it directly to your bank account, usually about 4-6 weeks after the completion paperwork and post-works BER are in."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Does the time of year change what my bill tells me?"
      },
      {
        "type": "paragraph",
        "text": "Winter bills run high and summer bills run low, which is why a full year of usage always beats one billing period. The paperwork side is season-proof, though - if you are weighing up timing for the installation itself, see [the best time of year to get solar panels in Ireland](/blog/best-time-of-year-to-get-solar-panels-ireland)."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "What does the rest of the bill jargon mean?"
      },
      {
        "type": "bulletList",
        "items": [
          "**kWh (kilowatt-hour)**: one unit of electricity - a 1,000W appliance running for one hour",
          "**Tariff**: the pricing plan your supplier applies - 24-hour, day/night or smart",
          "**PSO levy**: the Public Service Obligation levy set each year by the CRU, applied to all electricity bills",
          "**Standing charge**: the fixed daily connection charge, independent of usage",
          "**Estimated read (E)**: a usage figure projected from history rather than measured",
          "**Clean Export Guarantee (CEG)**: the payment for surplus solar electricity exported to the grid, paid by your supplier"
        ]
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Upload a bill to the solar calculator and let the AI read your day/night split",
        "href": "/solar-calculator"
      }
    ],
    "image": "/blog/how-to-read-electricity-bill-ireland-solar.webp"
  },
  {
    "slug": "do-solar-panels-improve-ber-rating-ireland",
    "title": "Do Solar Panels Improve Your BER Rating in Ireland?",
    "excerpt": "Yes. Solar PV is counted in DEAP, the method behind every Irish BER, so it lifts your rating - and a post-works BER is already part of the grant.",
    "category": "grants",
    "date": "5 Sep 2026",
    "readTime": "9 min read",
    "author": "Solar Ireland Team",
    "iconBg": "bg-emerald-400/10",
    "iconColor": "text-emerald-400",
    "content": [
      {
        "type": "paragraph",
        "text": "**Yes - solar panels improve your BER rating.** Solar PV is counted in DEAP, the official methodology behind every Irish Building Energy Rating, so generating your own electricity lifts your score. How far it moves depends on your home, and a post-works BER is already a required step of the **€1,800** SEAI grant."
      },
      {
        "type": "paragraph",
        "text": "That makes solar unusual among home upgrades. It cuts your electricity bill and it improves the energy rating that buyers, renters and lenders actually look at. Below is exactly how the BER calculation treats solar, how far it can realistically move your rating, and why the number that truly transfers with the house is the long-run saving, not a single grade letter."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How does the BER calculation treat solar PV?"
      },
      {
        "type": "paragraph",
        "text": "Every Irish BER is produced using DEAP, the Dwelling Energy Assessment Procedure that SEAI-registered assessors use to calculate a home's energy performance and carbon emissions (seai.ie). DEAP looks at space heating, water heating, ventilation, lighting and, crucially for solar, the electricity you generate on site. When your roof produces power, DEAP counts that generation as displacing electricity you would otherwise draw from the grid. That lowers the home's calculated primary energy use and its carbon emissions, and a lower calculated demand means a better rating."
      },
      {
        "type": "paragraph",
        "text": "The key point is that solar is not a bolt-on the assessor waves through. It is a recognised renewable measure sitting inside the same methodology that produces the A-to-G letter on the certificate. That is exactly why the [SEAI solar grant](/blog/complete-guide-seai-solar-grant-2026) and the BER are tied together in the first place. The scheme wants documented proof that the work genuinely improved the home's energy performance, and the BER is that proof."
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "What a BER actually measures",
        "body": "DEAP scores a home on calculated energy use and carbon emissions across heating, hot water, ventilation and lighting, not on the appliances you plug in day to day. Solar PV improves the result because on-site generation reduces the grid electricity the calculation assumes your home needs."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How much can solar actually move your BER?"
      },
      {
        "type": "paragraph",
        "text": "Honestly, it depends on your home, and any installer who promises a specific jump from one grade to the next before surveying your roof is guessing. Solar reliably moves a rating in the right direction, but how far comes down to where you start and how much of your own generation you use. A larger array generates more, a home starting from a lower rating has more room to climb, and using your solar on site rather than exporting it strengthens the result."
      },
      {
        "type": "paragraph",
        "text": "It also matters what else is happening in the house. Solar stacks with other measures such as attic and wall insulation, a heat pump, LED lighting or a hot water diverter, so homeowners carrying out a wider energy upgrade tend to see the biggest overall change in their rating. On its own, solar is one strong, dependable pull in the right direction rather than a guaranteed leap of several grades."
      },
      {
        "type": "table",
        "headers": [
          "Factor",
          "Why it moves your rating"
        ],
        "rows": [
          [
            "System size (kWp)",
            "A larger array generates more, displacing more grid electricity in the calculation"
          ],
          [
            "Your starting BER",
            "A home lower on the scale has more room to climb than one already near the top"
          ],
          [
            "Self-consumption",
            "Using your own solar on site, helped by a battery or hot water diverter, strengthens the result"
          ],
          [
            "Existing heating",
            "Solar counts for more against high-carbon electric heating than against efficient gas"
          ],
          [
            "Other upgrades together",
            "Insulation, a heat pump or LED lighting stack with solar for a bigger overall jump"
          ]
        ]
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Bundle the work if a rating is the goal",
        "body": "The biggest rating gains come from pairing solar with measures that cut demand, like insulation and an efficient heat source. It is worth weighing the [full cost of a system](/blog/how-much-do-solar-panels-cost-ireland-2026) against both the rating gain and the yearly bill savings together, rather than judging solar in isolation."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Why does the SEAI grant include a post-install BER assessment?"
      },
      {
        "type": "paragraph",
        "text": "Because the grant is designed to reward real energy improvement, not simply the purchase of panels. A post-works BER assessment, carried out by a registered SEAI BER assessor and published on the National BER Register, is a required step before the €1,800 grant is paid out (seai.ie). It is the scheme's evidence that the installed system actually improved your home's energy performance, and it is the last box ticked before the money is released."
      },
      {
        "type": "paragraph",
        "text": "There is a real upside for you in that requirement. Because a fresh, up-to-date BER is built into the process, grant-aided solar leaves you holding a current energy certificate for the home, the same document you will need if you ever sell, rent or apply for a green mortgage. To qualify for the grant your home must have been built and occupied before 2021 and hold a valid MPRN, the 11-digit number on your electricity bill, with no previous solar grant claimed at that MPRN. Owner-occupiers and private landlords are both eligible. The full detail is in our [complete guide to the SEAI solar grant](/blog/complete-guide-seai-solar-grant-2026)."
      },
      {
        "type": "callout",
        "variant": "warning",
        "title": "Apply before any work starts",
        "body": "You must apply on seai.ie before installation begins, or you can lose the grant entirely. SEAI pays the €1,800 into your own bank account by bank transfer once your completion documents and post-works BER are published, usually within about 4 to 6 weeks. It is never deducted from the installer's invoice, so budget for the full cost up front and treat the grant as money back afterwards."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Can a better BER get you a green mortgage rate?"
      },
      {
        "type": "paragraph",
        "text": "A stronger BER is exactly what Irish lenders look for when they offer green mortgage rates, which reward energy-efficient homes with a discount on the interest rate. Because solar improves your rating, it can help move a home into the band where those rates apply. Lenders set their own thresholds and terms, so the rating you need and the size of the discount vary between banks. Always confirm the current criteria directly with your lender or a broker before you count on it."
      },
      {
        "type": "paragraph",
        "text": "The logic is simple. The same up-to-date BER that the solar grant already requires is the document a lender will ask to see. If a green mortgage is on your radar, going solar and holding a fresh certificate puts you in a stronger position, on top of the bill savings the system delivers every year. Weighing that alongside whether [solar is worth it for your home](/blog/are-solar-panels-worth-it-ireland-2026) is the sensible way to look at the decision."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Does a better BER make your home worth more when you sell or rent?"
      },
      {
        "type": "paragraph",
        "text": "A home's BER has to be displayed on every sale and rental advert in Ireland, so it is one of the first things a buyer or tenant sees. A better rating signals lower running costs, which is a genuine advantage in a market where energy bills are front of mind. We will not put a specific figure on how much value that adds, because it depends on the property, the location and the buyer, but a stronger BER and a home that generates its own electricity are both real selling points that set a listing apart."
      },
      {
        "type": "paragraph",
        "text": "The more concrete number is what the system saves. A typical Irish solar install returns roughly **€30,000 to €50,000** over its 25-year life through bill savings and export income, and that benefit does not reset when the house changes hands. It carries on for whoever owns the roof next. For landlords the case is much the same. A better rating and lower tenant bills both help a property let, and because private landlords are eligible for the same grant, the upfront cost is cut too. Our [landlord's guide to solar](/blog/solar-panels-rental-property-landlord-guide) covers the rental angle in full."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How do you check your home's current BER?"
      },
      {
        "type": "paragraph",
        "text": "You can look up any home's current BER for free on the National BER Register through seai.ie, using the MPRN or the address. It is worth doing before anything else, for two reasons. It tells you where you are starting from, and it shows whether your existing certificate is still current. If your last BER is old, or predates other upgrades you have already made, the figure on record may understate your home before solar is even considered."
      },
      {
        "type": "paragraph",
        "text": "From there, the honest way to estimate how far solar will take you is to look at your real roof and your real usage, not a rule of thumb. Our AI bill analysis reads the day and night usage split straight off your electricity bill, which tells us how much of your own generation you would realistically use. A [site survey](/book-survey) then checks your roof aspect, shading and structure in person, and you can try the [solar calculator](/solar-calculator) for a quick estimate of system size, grant and yearly saving."
      },
      {
        "type": "divider"
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Frequently asked questions"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "How much does a BER assessment cost?"
      },
      {
        "type": "paragraph",
        "text": "A domestic BER is a modest one-off cost paid to a registered assessor, and it varies by assessor and by the size of the property. The good news for solar is that a post-works BER is already a required part of the grant process, so if you are installing grant-aided solar you are getting a fresh, up-to-date certificate as part of the job rather than paying for a separate assessment down the line."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "How long is a BER certificate valid?"
      },
      {
        "type": "paragraph",
        "text": "A domestic BER is valid for up to 10 years, provided you do not make material changes to the home that would affect its energy performance (seai.ie). If you carry out further upgrades such as more insulation, a heat pump or an extension, it is worth getting a new assessment so the certificate reflects the improved home rather than the old one."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Do solar panels and a heat pump improve a BER together?"
      },
      {
        "type": "paragraph",
        "text": "Yes, and it is one of the strongest combinations. A heat pump is a large, efficient electric load, and solar generates electricity to help run it, so together they cut both your calculated energy demand and your carbon emissions, the two things DEAP measures. Our guide to [solar panels and heat pumps](/blog/solar-panels-and-heat-pumps-perfect-partnership) explains how to size and plan the two as a pair for the best result."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Will solar alone jump my home several grades?"
      },
      {
        "type": "paragraph",
        "text": "Not usually on its own, and be wary of anyone who promises it will before seeing your roof. Solar dependably improves a rating, but the largest jumps come from combining it with measures that cut demand, like insulation and an efficient heat source. Think of solar as a strong, reliable move in the right direction rather than a guaranteed leap of several grades in one go."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Book a free site survey and we will show you the rating gain and the savings for your own home",
        "href": "/book-survey"
      }
    ],
    "image": "/blog/do-solar-panels-improve-ber-rating-ireland.webp"
  },
  {
    "slug": "solar-panels-cork-complete-guide",
    "title": "Solar Panels in Cork: The Complete 2026 Guide",
    "excerpt": "Costs, the €1,800 SEAI grant, planning rules and what a site survey checks on Cork homes - from an SEAI-registered installer working across the county.",
    "category": "county",
    "date": "5 Sep 2026",
    "readTime": "9 min read",
    "author": "Solar Ireland Team",
    "iconBg": "bg-emerald-400/10",
    "iconColor": "text-emerald-400",
    "image": "/install-3.webp",
    "content": [
      {
        "type": "paragraph",
        "text": "Yes, solar panels are worth it for most Cork homes in 2026. A typical system costs **€6,000 to €9,000 before the €1,800 SEAI grant**, saves €800 to €1,400 a year, and pays for itself in 5 to 7 years. Domestic solar carries 0% VAT, and Cork's mix of coastal and rural roofs is well suited to it once a site survey confirms the details."
      },
      {
        "type": "paragraph",
        "text": "Solar Ireland is an SEAI-registered installer working right across Cork, city and county. This guide covers what solar actually costs here, the grant you can claim, the planning rules, and the handful of Cork-specific things a good site survey checks before quoting."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How much do solar panels cost in Cork in 2026?"
      },
      {
        "type": "paragraph",
        "text": "Cork prices are in line with the rest of Ireland - solar is a national market, not a regional one. A standard home system runs roughly €6,000 to €9,000 before the grant, depending on size, roof complexity and whether you add a battery. After the **€1,800 SEAI grant** and with 0% VAT, most homeowners are looking at €4,200 to €7,200 out of pocket for panels only."
      },
      {
        "type": "table",
        "headers": [
          "System size",
          "Suits",
          "Typical cost before grant",
          "After €1,800 grant"
        ],
        "rows": [
          [
            "4 kWp (~10 panels)",
            "3-bed semi",
            "€6,000 - €7,000",
            "€4,200 - €5,200"
          ],
          [
            "6 kWp (~14 panels)",
            "4-bed detached",
            "€7,500 - €9,000",
            "€5,700 - €7,200"
          ],
          [
            "6 kWp + battery",
            "high evening use",
            "€11,000 - €13,000",
            "€9,200 - €11,200"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Your exact figure depends on your electricity usage, not just your house size. The most accurate way to size a system is to read your actual bill - see our full [cost breakdown](/blog/how-much-do-solar-panels-cost-ireland-2026) or get a personalised estimate from the [solar calculator](/solar-calculator)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What SEAI grant can Cork homeowners get?"
      },
      {
        "type": "paragraph",
        "text": "The same national grant applies in Cork: up to **€1,800** for solar PV. To qualify, the home must have been built and occupied before 2021, have a valid MPRN, and not have had a previous solar grant at that address. Owner-occupiers and private landlords can both apply. You apply online before any work starts and the grant offer normally issues immediately. Full detail is in our [complete SEAI grant guide](/blog/complete-guide-seai-solar-grant-2026)."
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "The grant is paid to you, not the installer",
        "body": "SEAI pays the €1,800 into your nominated bank account by electronic transfer, usually within about 4 to 6 weeks of your completion documents and post-works BER being processed. It is not deducted from your installer's bill."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How many Cork homes already have solar?"
      },
      {
        "type": "paragraph",
        "text": "SEAI does not break every figure down to the town, but the national picture tells the story: more than 100,000 Irish homes have been grant-aided for solar since the scheme began in 2018, and 2025 set a record with over 34,000 installations in a single year (SEAI). Cork, as the largest county outside Dublin, is consistently one of the busiest markets in the country."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Solar in Cork City vs County Cork: what changes?"
      },
      {
        "type": "paragraph",
        "text": "The physics are identical; the roofs are not. In Cork City you are more likely to have a terraced or semi-detached home with a smaller, shared-boundary roof, and sometimes a protected structure or an Architectural Conservation Area to consider. In County Cork, detached and rural homes usually have more roof space and simpler planning, but longer cable runs and older wiring can show up. A site survey settles which applies to you."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Do coastal Cork homes need special mounting?"
      },
      {
        "type": "paragraph",
        "text": "Coastal exposure is the one genuinely Cork-specific factor. Homes near the water in places like Kinsale, Youghal or the west Cork coast get stronger, salt-laden wind, so the survey pays extra attention to a few things:"
      },
      {
        "type": "bulletList",
        "items": [
          "Wind loading - the mounting system and fixing density are specified for the exposure, not just a standard inland layout",
          "Corrosion resistance - marine-grade clamps and rails where salt exposure is high",
          "Roof condition - older coastal roofs weather faster, so the survey checks the tiles or slates will carry the array for its 25-year life",
          "Shelter and shading - coastal sites are often open and unshaded, which is good for yield"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Do you need planning permission for solar in Cork?"
      },
      {
        "type": "paragraph",
        "text": "For almost all Cork houses, no. Since October 2022 (S.I. 493 of 2022), rooftop solar on houses is exempted development with no roof area limit. The exceptions are homes in a Solar Safeguarding Zone near an aerodrome, protected structures, and buildings in an Architectural Conservation Area, which do need to check. Our [planning rules guide](/blog/planning-permission-solar-panels-ireland) has the detail."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How do you get started in Cork?"
      },
      {
        "type": "paragraph",
        "text": "Send us a recent electricity bill and we read your day/night usage split to size the system, then a surveyor visits to confirm the roof, wiring and orientation. We handle the SEAI grant paperwork and the free ESB Networks NC6 notification. [Book a free site survey](/book-survey) to get a firm, itemised quote."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Cork solar FAQ"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Will solar work on an older Cork terraced home?"
      },
      {
        "type": "paragraph",
        "text": "Usually yes. The main things the survey checks on older terraces are roof structure, available unshaded area, and whether the fuse board and wiring need any updating. South, east or west-facing roofs all work; only a solely north-facing roof is normally unsuitable, as covered in our [roof orientation guide](/blog/east-vs-south-vs-west-facing-roofs-solar)."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Does chimney shading matter?"
      },
      {
        "type": "paragraph",
        "text": "It can. A chimney or neighbouring building that shades part of the roof for a chunk of the day reduces output from the affected panels. The survey maps shading across the day and lays the array out to avoid it, and optimisers can be used where partial shade is unavoidable."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Do rural Cork homes get more from solar?"
      },
      {
        "type": "paragraph",
        "text": "Rural homes often have larger roofs and higher electricity use (wells, pumps, larger houses), which can mean a bigger system and more saving. Export income under the Clean Export Guarantee, typically €200 to €400 a year on a 4 kWp system, is the same wherever you are."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Book a Free Site Survey for Your Cork Home",
        "href": "/book-survey"
      }
    ]
  },
  {
    "slug": "nc6-form-solar-grid-connection-ireland",
    "title": "The NC6 Form Explained: Connecting Solar to the Grid",
    "excerpt": "What the ESB Networks NC6 microgeneration form is, who submits it, why it is free, and how it unlocks your Clean Export Guarantee payments.",
    "category": "guides",
    "date": "5 Sep 2026",
    "readTime": "8 min read",
    "author": "Solar Ireland Team",
    "iconBg": "bg-sky-400/10",
    "iconColor": "text-sky-400",
    "content": [
      {
        "type": "paragraph",
        "text": "The NC6 is **ESB Networks' microgeneration notification** - the free form that tells the grid operator you have a solar system connected at your home. **Your installer submits it, and it costs nothing.** It matters because it registers your system on the grid and is part of what lets you get paid for the electricity you export under the Clean Export Guarantee."
      },
      {
        "type": "paragraph",
        "text": "Solar Ireland files NC6s as a routine part of every domestic install, so here is exactly what the form is, who does what, and why it is one of the quieter but more important steps in going solar."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What is the NC6 form?"
      },
      {
        "type": "paragraph",
        "text": "The NC6 is the standard notification form used to tell ESB Networks that a small generator - your solar PV system - has been connected at your property. Under the Microgeneration Support Scheme, domestic systems up to a set size can connect on a notify-first basis: you tell ESB Networks the system is in, rather than applying for permission in advance. It is registered against your MPRN, the 11-digit meter point number on your electricity bill."
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "It is free",
        "body": "ESB Networks does not charge for a domestic NC6 microgeneration notification. If anyone tells you there is a grid-connection fee for a standard home solar system, ask them to point to it - for a normal domestic install, there isn't one."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Who submits the NC6 - you or your installer?"
      },
      {
        "type": "paragraph",
        "text": "Your installer does. Submitting the NC6 is standard installer work and should be included in the job with nothing for you to fill in. It is also a useful quality marker: an installer who handles the NC6, the SEAI grant paperwork and the smart meter coordination as a matter of course is one who does this properly. If a quote is silent on who files the NC6, ask."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How much does the NC6 cost?"
      },
      {
        "type": "paragraph",
        "text": "Nothing, for a domestic microgeneration connection. The value of solar is in the electricity you generate and the export you earn, not in connection fees - there are none to worry about for a standard home system."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What is the difference between the NC6 and NC7 forms?"
      },
      {
        "type": "paragraph",
        "text": "They are both ESB Networks connection forms, used at different scales. The NC6 is the notification route for small microgeneration - the domestic and small-business systems most homeowners install. Larger generators that exceed the microgeneration thresholds move onto a full connection application process rather than a simple notification. For a typical Irish home, the NC6 is the form that applies."
      },
      {
        "type": "table",
        "headers": [
          "",
          "NC6",
          "Larger connections"
        ],
        "rows": [
          [
            "Used for",
            "Domestic / small microgeneration",
            "Generators above microgen limits"
          ],
          [
            "Process",
            "Notify ESB Networks",
            "Full connection application"
          ],
          [
            "Who files it",
            "Your installer",
            "Applicant / developer"
          ],
          [
            "Cost (domestic)",
            "Free",
            "Application and connection charges apply"
          ]
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How long does ESB Networks take to process an NC6?"
      },
      {
        "type": "paragraph",
        "text": "Processing an NC6 notification typically takes a few weeks, though timelines vary with demand. The good news is that the NC6 does not hold up your installation - the panels are fitted and generating for your own use straight away. What the NC6 and your smart meter unlock is the export side: getting credited for surplus electricity you send back to the grid."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Do you need an NC6 to get paid for exported electricity?"
      },
      {
        "type": "paragraph",
        "text": "Yes. To earn Clean Export Guarantee (CEG) payments you need two things in place: a smart meter, so your export can be measured, and your system registered with ESB Networks via the NC6, so the grid knows there is a generator at your MPRN. With both sorted, your supplier pays you for exported units - typically €200 to €400 a year on a 4 kWp system, and the first €400 a year of that income is tax-exempt. More in our [Clean Export Guarantee guide](/blog/clean-export-guarantee-explained) and our [smart meter guide](/blog/smart-meter-required-solar-panels-ireland)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What is an MPRN and why does the NC6 need it?"
      },
      {
        "type": "paragraph",
        "text": "Your MPRN (Meter Point Reference Number) is the unique 11-digit number that identifies your electricity connection. It is printed on your bill. The NC6 uses it to register your solar system against the correct connection, which is why an accurate MPRN is one of the details the installer confirms at survey."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What happens if solar is installed without notifying ESB Networks?"
      },
      {
        "type": "paragraph",
        "text": "Skipping the NC6 is not something a proper installer does. Without it, your system is not registered on the grid, which means you cannot be set up correctly for export payments and you are outside the microgeneration process the scheme is built on. It is free and standard, so there is no good reason to leave it undone - make sure your installer commits to filing it."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "NC6 FAQ"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Is the NC6 the same as planning permission?"
      },
      {
        "type": "paragraph",
        "text": "No. They are completely separate. Planning permission is about whether you are allowed to fit the panels - and for almost all houses rooftop solar is exempted development, so no permission is needed. The NC6 is about connecting the finished system to the grid. Our [planning guide](/blog/planning-permission-solar-panels-ireland) covers the permission side."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Do I need a smart meter before the NC6?"
      },
      {
        "type": "paragraph",
        "text": "You need a smart meter to be paid for export, and ESB Networks is rolling them out nationally. Your installer coordinates the smart meter and the NC6 so the export side comes together after the system is live."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "What happens to the NC6 if I move house?"
      },
      {
        "type": "paragraph",
        "text": "The NC6 registers the system against the property's MPRN, so the registration stays with the home. The new owner takes on the system and would arrange their own export tariff with their supplier."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Book a Free Site Survey - We Handle the NC6",
        "href": "/book-survey"
      }
    ],
    "image": "/blog/nc6-form-solar-grid-connection-ireland.webp"
  },
  {
    "slug": "solar-panels-3-bed-semi-ireland-cost",
    "title": "Solar Panels for a 3-Bed Semi in Ireland: 2026 Costs",
    "excerpt": "How many panels a typical 3-bed semi needs, what a 10-panel system costs after the €1,800 grant, and a worked savings example from the bill.",
    "category": "savings",
    "date": "5 Sep 2026",
    "readTime": "8 min read",
    "author": "Solar Ireland Team",
    "iconBg": "bg-amber-400/10",
    "iconColor": "text-amber-400",
    "content": [
      {
        "type": "paragraph",
        "text": "A typical 3-bed semi in Ireland needs about **10 panels, roughly a 4 to 4.4 kWp system**. That costs around €6,000 to €7,000 before the grant, or **€4,200 to €5,200 after the €1,800 SEAI grant** with 0% VAT. It saves most semis €800 to €1,400 a year and pays for itself in about 5 to 7 years."
      },
      {
        "type": "paragraph",
        "text": "The 3-bed semi is the most common house type in Ireland, so it is worth walking through the numbers properly - how the grant is worked out, what you actually save, and whether the panels will fit."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How many solar panels does a 3-bed semi need?"
      },
      {
        "type": "paragraph",
        "text": "Around 10 panels for a typical household. Modern panels are about 440W each, so 10 panels is roughly 4.4 kWp - enough to cover a large share of daytime electricity for an average family. Bigger households, or homes with an EV or heat pump, often go to 12 to 16 panels. The right number depends on your usage, which is why we read your bill first. See our [full panel-count guide](/blog/how-many-solar-panels-do-i-need-ireland)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How much does a typical 10-panel system cost after the grant?"
      },
      {
        "type": "table",
        "headers": [
          "",
          "Before grant",
          "SEAI grant",
          "You pay"
        ],
        "rows": [
          [
            "10 panels (~4.4 kWp)",
            "€6,000 - €7,000",
            "- €1,800",
            "€4,200 - €5,200"
          ],
          [
            "+ 5 kWh battery",
            "+ €3,500 - €4,500",
            "no battery grant",
            "+ €3,500 - €4,500"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Domestic solar has 0% VAT, so the prices above are what you pay - there is no VAT to add. There is no separate SEAI battery grant, so a battery is an optional extra cost you weigh on its own merits, covered in our [battery guide](/blog/battery-storage-is-it-worth-the-extra-cost)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How is the €1,800 grant calculated?"
      },
      {
        "type": "paragraph",
        "text": "The SEAI solar grant is tiered by system size and caps at €1,800:"
      },
      {
        "type": "table",
        "headers": [
          "System size",
          "Grant rate",
          "Grant"
        ],
        "rows": [
          [
            "First 2 kWp",
            "€700 per kWp",
            "up to €1,400"
          ],
          [
            "Next 2 kWp (2-4 kWp)",
            "€200 per kWp",
            "up to €400"
          ],
          [
            "Total (at 4 kWp+)",
            "",
            "€1,800 max"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "A 4 kWp+ system - which a 10-panel install is - reaches the full €1,800. To qualify, the home must have been built and occupied before 2021, with a valid MPRN and no previous solar grant at that address."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How much will a 3-bed semi save per year?"
      },
      {
        "type": "paragraph",
        "text": "Most 3-bed semis save €800 to €1,400 a year, made up of two parts: the electricity you no longer buy because you are using your own solar, and the Clean Export Guarantee income for surplus you send back to the grid. Where you land in that range depends heavily on how much of your electricity you use during daylight."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Worked example: a typical 3-bed semi"
      },
      {
        "type": "paragraph",
        "text": "Take a semi with a €200-a-month electricity bill and a fairly typical day/night usage split. A 4.4 kWp system covers a large chunk of daytime use directly, and exports the surplus. In round figures:"
      },
      {
        "type": "bulletList",
        "items": [
          "System: ~4.4 kWp, 10 panels",
          "Cost after grant: ~€4,700",
          "Self-use saving: the electricity you stop buying during the day",
          "Export income: roughly €200 - €400 a year under the Clean Export Guarantee (first €400/yr tax-exempt)",
          "Combined annual benefit: around €900 - €1,300",
          "Payback: roughly 5 to 7 years"
        ]
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "The single biggest lever is daytime use",
        "body": "The more of your electricity you use while the sun is up - dishwasher, washing machine, immersion, EV charging on a timer - the more you save, because you avoid buying it at the full rate rather than exporting it at the lower rate. Your day/night split on your bill is what really decides your number."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What does the Clean Export Guarantee add on top?"
      },
      {
        "type": "paragraph",
        "text": "Whatever you generate and do not use is exported and paid for by your electricity supplier under the Clean Export Guarantee. Each supplier sets its own rate - in 2026 they run roughly €0.19 to €0.24 per kWh - and a typical semi earns €200 to €400 a year from export, with the first €400 tax-exempt. Detail in our [Clean Export Guarantee guide](/blog/clean-export-guarantee-explained)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Will 10 panels fit on a semi-detached roof?"
      },
      {
        "type": "paragraph",
        "text": "On most semis, comfortably. Ten 440W panels need roughly 18 to 20 square metres of roof, which a standard semi's main pitch usually provides. If your best roof face is small, panels can be split across two faces (for example a south-east and south-west pitch), which our [roof orientation guide](/blog/east-vs-south-vs-west-facing-roofs-solar) explains. A site survey confirms the exact fit."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Is a battery worth adding for a 3-bed semi?"
      },
      {
        "type": "paragraph",
        "text": "It depends on when you use electricity. A battery stores daytime solar for use in the evening, so it helps most if your household is out during the day and heavy on power in the evening, or if you are on a time-of-use tariff. Because there is no battery grant, it pays back more slowly than the panels themselves. Weigh it with our [battery guide](/blog/battery-storage-is-it-worth-the-extra-cost)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "3-bed semi solar FAQ"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "What about an east-west roof with no south face?"
      },
      {
        "type": "paragraph",
        "text": "An east-west split still delivers about 80 to 85% of a south-facing system's output, and it spreads generation across the morning and evening, which can actually match a family's usage better. It is rarely a reason not to go solar."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "We're a bigger family - do we need more than 10 panels?"
      },
      {
        "type": "paragraph",
        "text": "Possibly. Higher usage, an EV or a heat pump can justify 12 to 16 panels. The bill tells us - a larger annual usage means a larger system earns its keep. Try the [solar calculator](/solar-calculator) for a personalised size."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "How do I get my exact number?"
      },
      {
        "type": "paragraph",
        "text": "Send us a recent bill. Our analysis reads your actual usage and day/night split and returns a system size and saving tailored to your home, rather than the typical figures above."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Get Your Personalised 3-Bed Semi Estimate",
        "href": "/solar-calculator"
      }
    ],
    "image": "/install-5.webp"
  },
  {
    "slug": "solar-panels-ev-charger-ireland",
    "title": "Solar Panels and EV Charging in Ireland: 2026 Guide",
    "excerpt": "Can you charge an electric car from solar in Ireland? How many panels it takes, how surplus diverting works, and when to charge on the night rate instead.",
    "category": "technology",
    "date": "5 Sep 2026",
    "readTime": "9 min read",
    "author": "Solar Ireland Team",
    "iconBg": "bg-violet-400/10",
    "iconColor": "text-violet-400",
    "image": "/blog/solar-panels-ev-charger-ireland.webp",
    "content": [
      {
        "type": "paragraph",
        "text": "Yes, you can charge an EV from solar panels in Ireland, and EV homes get some of the best economics from solar. On a bright day a home system generates enough to add real range for free, and a **solar-aware charger diverts your surplus into the car** instead of exporting it at the lower rate. The catch is that Irish sun is seasonal, so most EV owners use a mix of solar by day and the cheap night rate."
      },
      {
        "type": "paragraph",
        "text": "EV households have the highest electricity bills and the strongest case for solar. Here is how the two work together, and how to decide between charging the car, exporting the surplus, or using the night rate."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How many solar panels does it take to charge an EV?"
      },
      {
        "type": "paragraph",
        "text": "As a rough guide, a 4 kWp system (about 10 panels) generates in the order of 3,500 to 4,000 kWh a year in Ireland. An average EV uses roughly 2,500 to 3,500 kWh a year to drive 12,000 to 15,000 km. So on paper a typical system generates enough over a year to cover a lot of EV driving - but not evenly, because generation is concentrated in summer. EV owners often add a few extra panels (12 to 16) so more of the car's charging can come from solar across more of the year."
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "Solar is seasonal, driving is not",
        "body": "Your panels make roughly three to four times as much in June as in December, but you drive all year. That is why solar covers a big share of summer charging and a smaller share in winter, and why the night rate still matters for EV owners."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What is a solar-aware charger and how does surplus diverting work?"
      },
      {
        "type": "paragraph",
        "text": "A solar-aware EV charger watches how much electricity your panels are exporting and diverts that surplus into the car instead of sending it to the grid. When a cloud passes and generation drops, it eases off; when the sun returns, it ramps back up. The result is that your car soaks up solar you would otherwise have exported at the lower Clean Export Guarantee rate. Most well-known home chargers offer a solar or eco mode that does exactly this."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Is it better to charge the car or export at the CEG rate?"
      },
      {
        "type": "paragraph",
        "text": "Charge the car, in almost every case. Exporting a unit earns you the Clean Export Guarantee rate - roughly €0.19 to €0.24 per kWh in 2026. Using that same unit to charge your car saves you buying it from the grid at the full day rate, which is much higher. So a kWh put into the car is worth noticeably more than a kWh exported. Diverting surplus to the EV is one of the best uses of your solar."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Should you charge on the night rate instead?"
      },
      {
        "type": "paragraph",
        "text": "Sometimes, yes - and this is where your day/night split matters. If you are out during the day and the car is only home at night, there may be little daytime solar to divert, so a cheap smart night rate can be the better option for the bulk of your charging. Many EV owners run a hybrid: solar-charge when the car is home on bright days, and top up on the night rate otherwise. Reading your usage pattern from your bill is how we work out which suits you."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How much bigger should your solar system be if you have an EV?"
      },
      {
        "type": "paragraph",
        "text": "An EV is one of the clearest reasons to size up. Where a typical home might fit 10 panels, an EV household often benefits from 12 to 16, because the extra daytime generation goes straight into cheap driving rather than being exported. The exact number comes back to your combined household and driving usage - see our [panel-count guide](/blog/how-many-solar-panels-do-i-need-ireland)."
      },
      {
        "type": "table",
        "headers": [
          "Household",
          "Typical system",
          "Why"
        ],
        "rows": [
          [
            "No EV",
            "~4 kWp (10 panels)",
            "Covers home daytime use"
          ],
          [
            "One EV",
            "~5-6 kWp (12-16 panels)",
            "Extra generation charges the car"
          ],
          [
            "EV + heat pump",
            "6 kWp+ and up",
            "High all-round usage rewards a larger system"
          ]
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Does owning an EV change the battery decision?"
      },
      {
        "type": "paragraph",
        "text": "It can tip it either way. In one sense the car is a giant battery you are already paying for, so a home battery is less essential if you can time charging to soak up surplus. In another, if the car is usually away during peak solar hours, a home battery stores that surplus for the evening instead. There is no battery grant, so weigh it on payback - our [battery guide](/blog/battery-storage-is-it-worth-the-extra-cost) walks through it."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "EV and solar FAQ"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Do I need a smart meter to combine solar and an EV?"
      },
      {
        "type": "paragraph",
        "text": "You need a smart meter to be paid for export under the Clean Export Guarantee and to access smart night-rate tariffs, both of which matter for an EV household. Your installer coordinates the smart meter and the ESB Networks [NC6 notification](/blog/nc6-form-solar-grid-connection-ireland)."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Can the same electrician fit the charger and the solar?"
      },
      {
        "type": "paragraph",
        "text": "Often yes - fitting solar and an EV charger together is efficient, since both involve work at the fuse board and both must be installed by a RECI (Safe Electric) registered electrician to the I.S. 10101 wiring standard. Ask at survey whether combining them suits your setup."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Will solar cover all my EV charging?"
      },
      {
        "type": "paragraph",
        "text": "In summer it can cover a large share; in winter far less, because generation drops. Treat solar as a major reduction in your charging cost across the year rather than a full replacement, topped up with a cheap night rate when needed."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Book a Free Site Survey for Solar and EV Charging",
        "href": "/book-survey"
      }
    ]
  },
  {
    "slug": "complete-guide-seai-solar-grant-2026",
    "title": "The Complete Guide to the SEAI Solar Grant in 2026",
    "excerpt": "Everything you need to know about the €1,800 SEAI solar panel grant - eligibility, how to apply, timelines, and how to maximise your savings with the Clean Export Guarantee.",
    "category": "grants",
    "date": "15 Apr 2026",
    "readTime": "12 min read",
    "featured": true,
    "author": "Cal O'Reilly",
    "iconBg": "bg-amber-400/10",
    "iconColor": "text-amber-400",
    "image": "/blog/complete-guide-seai-solar-grant-2026.webp",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "What Is the SEAI Solar Panel Grant?"
      },
      {
        "type": "paragraph",
        "text": "The SEAI solar panel grant in Ireland is **€1,800** in 2026. This government-backed payment from the Sustainable Energy Authority of Ireland covers a significant portion of a typical residential solar PV installation, reducing the out-of-pocket cost for homeowners. The grant is available to owner-occupiers of homes built before 2021 and is paid into your bank account by SEAI, usually within about 4-6 weeks of your post-works BER being published."
      },
      {
        "type": "paragraph",
        "text": "The grant is part of the Micro-generation Support Scheme under Ireland's Climate Action Plan, which aims to have 80% of electricity from renewable sources by 2030. Solar PV is a cornerstone of this strategy, and the SEAI grant is designed to accelerate adoption across the country. Since the scheme launched, tens of thousands of Irish homeowners have successfully applied and received funding for their solar installations."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Key Statistic",
        "body": "More than 100,000 Irish homes have been grant-aided for solar PV since the scheme launched in 2018, with a record 34,000+ installations in 2025 alone (SEAI)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Who Is Eligible for the Grant?"
      },
      {
        "type": "paragraph",
        "text": "The SEAI solar grant is available to a wide range of homeowners across Ireland. Understanding the eligibility criteria before you apply can save time and avoid disappointment. Here are the main requirements you need to meet:"
      },
      {
        "type": "bulletList",
        "items": [
          "The property must be built before 2021 (new builds completed after this date are not eligible)",
          "You must be the owner of the property, or have permission from the owner to install solar panels",
          "The home must have been built and occupied before 2021 - owner-occupiers and private landlords can both apply",
          "The property must be located in the Republic of Ireland",
          "Your chosen installer must be a registered SEAI contractor",
          "You must not have previously received a solar PV grant for the same property"
        ]
      },
      {
        "type": "paragraph",
        "text": "There is no means testing for this grant - it is available regardless of your income level. Whether you own a detached house in Dublin, a semi-detached home in Cork, or a bungalow in rural Donegal, you can apply provided you meet the criteria above."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How Much Is the Grant Worth?"
      },
      {
        "type": "paragraph",
        "text": "The standard SEAI solar PV grant in 2026 provides €1,800 towards the cost of your installation. This is a flat-rate grant for a typical domestic system. Unfortunately, the previous battery storage grant of €600 was discontinued - there is currently no standalone SEAI grant for battery storage, which makes choosing the right battery even more important."
      },
      {
        "type": "table",
        "headers": [
          "System Component",
          "Grant Amount",
          "Typical Cost",
          "Grant Coverage"
        ],
        "rows": [
          [
            "Solar PV Panels (standard)",
            "€1,800",
            "€6,000 – €16,000",
            "11% – 30%"
          ],
          [
            "Battery Storage (up to 6kWh)",
            "No grant",
            "€4,000 – €8,000",
            "N/A"
          ],
          [
            "Solar PV + Battery Combined",
            "Up to €1,800",
            "€10,000 – €24,000",
            "7.5% – 18%"
          ]
        ]
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Maximise Your Savings",
        "body": "The SEAI grant can be stacked with the Clean Export Guarantee (CEG), which pays you €0.21/kWh for excess solar energy exported to the grid. Between the grant, bill savings, and CEG earnings, a typical system can pay for itself in 5–7 years."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "The BER Requirement"
      },
      {
        "type": "paragraph",
        "text": "One of the most common stumbling blocks in the application process is the Building Energy Rating (BER) requirement. Since 2023, all grant applicants must have a valid BER assessment either completed before the installation or booked to be carried out within a specified timeframe afterwards."
      },
      {
        "type": "paragraph",
        "text": "A BER assessment typically costs between €200 and €350 and provides a rating from A (most efficient) to G (least efficient). The good news is that you do not need to achieve a particular BER rating to qualify for the solar grant - you simply need to have one carried out. In fact, installing solar panels will often improve your BER rating by 1–2 grades, which adds value to your property."
      },
      {
        "type": "callout",
        "variant": "warning",
        "title": "Important BER Note",
        "body": "If you plan to get your BER done after installation, you must provide the SEAI with evidence that a BER assessor has been booked before your grant application can be fully processed. Many installers can arrange this for you as part of the package."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Step-by-Step Application Process"
      },
      {
        "type": "paragraph",
        "text": "Applying for the SEAI solar grant is straightforward, but following the correct sequence is important. Here is the process from start to finish:"
      },
      {
        "type": "numberedList",
        "items": [
          "Get quotes from at least 3 SEAI-registered installers. Compare prices, panel brands, warranties, and inverter options.",
          "Choose your installer and agree on a date for the installation. Do not begin installation before getting grant pre-approval.",
          "Apply online through the SEAI portal (seai.ie). You will need your MPRN number (found on your electricity bill), property details, and your chosen installer's SEAI registration number.",
          "Apply online - your grant offer normally issues immediately and is valid for 8 months. Review and accept the terms.",
          "Proceed with the solar panel installation. Your installer must complete the work within 8 months of the grant offer date.",
          "After installation, submit your completion documents to the SEAI - this includes the installer's completion certificate, photos of the installation, and your BER assessment.",
          "Receive your grant payment into your bank account, usually within 4–6 weeks of your completion documents and post-works BER being processed."
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Common Mistakes to Avoid"
      },
      {
        "type": "paragraph",
        "text": "Every year, a significant number of grant applications are delayed or rejected due to easily preventable errors. Here are the most common mistakes we see:"
      },
      {
        "type": "bulletList",
        "items": [
          "Starting installation before receiving grant pre-approval - this can invalidate your entire claim",
          "Using an installer who is not SEAI-registered - always verify registration on the SEAI website",
          "Not having a BER assessment completed or booked within the required timeframe",
          "Submitting incomplete documentation - ensure all photos, certificates, and forms are included",
          "Missing the 8-month installation deadline after receiving the grant offer",
          "Applying for the wrong grant category - the solar PV grant is separate from the solar water heating grant"
        ]
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "Time-Saving Tip",
        "body": "Many SEAI-registered installers will handle the entire grant application process on your behalf, including the BER booking. Ask about this when getting quotes - it can save you significant admin time and ensure nothing gets missed."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "2026 Timelines and Budget"
      },
      {
        "type": "paragraph",
        "text": "The SEAI solar grant scheme has an annual budget allocated by the government. In recent years, the budget has increased to meet growing demand, but it is still subject to annual review, so it is worth applying earlier in the year rather than leaving it late."
      },
      {
        "type": "paragraph",
        "text": "However, it is worth applying early in the year rather than waiting. The application process takes approximately 4–6 weeks for pre-approval, plus 6–8 weeks for payment after completion. Starting your journey in spring means you can have your system installed and generating electricity by summer - when solar output in Ireland is at its peak."
      },
      {
        "type": "table",
        "headers": [
          "Timeline Stage",
          "Typical Duration",
          "What Happens"
        ],
        "rows": [
          [
            "Get Quotes",
            "2–4 weeks",
            "Contact installers, compare quotes, choose installer"
          ],
          [
            "Grant Application",
            "4–6 weeks",
            "SEAI reviews and issues offer letter"
          ],
          [
            "Installation",
            "1–2 days",
            "Physical installation on your property"
          ],
          [
            "BER Assessment",
            "1–2 weeks",
            "Energy rating assessment (if not pre-done)"
          ],
          [
            "Completion Submission",
            "1–2 weeks",
            "Gather and submit all required documents"
          ],
          [
            "Grant Payment",
            "6–8 weeks",
            "SEAI processes and pays into your bank"
          ]
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How to Maximise Your Total Savings"
      },
      {
        "type": "paragraph",
        "text": "The SEAI grant is just the beginning of your savings journey. Here is how to get the absolute maximum financial return from going solar:"
      },
      {
        "type": "numberedList",
        "items": [
          "Combine the grant with the Clean Export Guarantee - earn €0.21/kWh for every unit of surplus energy you export to the grid. This alone can add €300–€500 per year to your income.",
          "Shift heavy electricity usage to daylight hours - run washing machines, dishwashers, and charge EVs while your panels are generating.",
          "Consider adding battery storage - while it adds upfront cost, a battery lets you use almost 100% of your generated electricity rather than exporting the excess.",
          "Ensure your system is sized correctly - an oversized system wastes money, while an undersized one leaves savings on the table.",
          "Maintain your panels - occasional cleaning (rain does most of the work in Ireland) and periodic inverter checks will keep output optimal for 25+ years."
        ]
      },
      {
        "type": "paragraph",
        "text": "For a typical Irish household with a 6kWp solar PV system, the combination of bill savings (€800–€1,200/year), CEG earnings (€300–€500/year), and the €1,800 SEAI grant can deliver a full return on investment within 5 to 7 years. After that, every kilowatt-hour generated is essentially free electricity for the remaining 20+ year lifespan of your panels."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Check Your Solar Eligibility - Get a Free Quote",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "how-much-do-solar-panels-cost-ireland-2026",
    "title": "How Much Do Solar Panels Cost in Ireland? (2026 Prices)",
    "excerpt": "A transparent breakdown of solar panel costs in Ireland for 2026 - from 4kWp to 10kWp systems, including installation, grants, and what affects the final price.",
    "category": "savings",
    "date": "12 Apr 2026",
    "readTime": "8 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-emerald-400/10",
    "iconColor": "text-emerald-400",
    "image": "/blog/how-much-do-solar-panels-cost-ireland-2026.webp",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "Average Solar Panel Costs in Ireland (2026)"
      },
      {
        "type": "paragraph",
        "text": "Solar panels in Ireland cost between **€4,200 and €14,200 after the €1,800 SEAI grant** in 2026. A standard 4kWp system costs approximately €4,200–€6,200, a 6kWp system costs €6,700–€9,200, and a 10kWp system with battery costs €10,200–€14,200. Prices have fallen substantially over the past five years as the market has matured as the market has matured, making 2026 the most affordable time to go solar."
      },
      {
        "type": "paragraph",
        "text": "The Irish solar market has matured significantly over the past few years. Increased competition, improvements in panel efficiency, and streamlined installation processes have all contributed to a steady decline in prices. A standard residential solar PV system now costs roughly 20–30% less than it did just five years ago."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Price Range Overview",
        "body": "The average cost of a solar panel system in Ireland in 2026 ranges from €6,000 for a small 4kWp system to €16,000 for a large 10kWp system with battery storage. After the €1,800 SEAI grant, your net cost drops to between €4,200 and €14,200."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Cost Breakdown by System Size"
      },
      {
        "type": "paragraph",
        "text": "Solar panel systems are measured in kilowatt-peak (kWp), which represents the maximum power output under ideal conditions. The right system size depends on your roof space, electricity consumption, and budget. Here is a detailed breakdown of costs for the three most popular system sizes in Ireland:"
      },
      {
        "type": "table",
        "headers": [
          "System Size",
          "Number of Panels",
          "Gross Cost (Before Grant)",
          "After €1,800 Grant",
          "Typical Annual Savings"
        ],
        "rows": [
          [
            "4kWp",
            "10–12 panels",
            "€6,000 – €8,000",
            "€4,200 – €6,200",
            "€600 – €900"
          ],
          [
            "6kWp",
            "14–16 panels",
            "€8,500 – €11,000",
            "€6,700 – €9,200",
            "€800 – €1,200"
          ],
          [
            "10kWp",
            "22–26 panels",
            "€12,000 – €16,000",
            "€10,200 – €14,200",
            "€1,200 – €1,800"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "The 6kWp system is by far the most popular choice for Irish households, as it provides an excellent balance between upfront cost, roof space requirements, and annual savings. It is large enough to cover a significant portion of the average Irish household's annual electricity consumption (approximately 4,200 kWh) while remaining affordable."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What Affects the Price?"
      },
      {
        "type": "paragraph",
        "text": "No two solar installations are exactly alike. Several factors influence the final price you will pay, and understanding them helps you evaluate quotes fairly:"
      },
      {
        "type": "bulletList",
        "items": [
          "Panel quality and brand - Tier-1 panels (LONGi, Jinko, Trina) cost more than lesser-known brands but offer higher efficiency, better warranties, and proven long-term performance",
          "Inverter type - String inverters are cheapest, microinverters cost more but offer panel-level optimisation (ideal for partially shaded roofs)",
          "Roof complexity - A simple pitched roof with clear access is cheapest to install. Multiple roof planes, flat roofs, or difficult access add €500–€2,000",
          "Scaffold requirements - Most installations require scaffolding, which typically costs €300–€600 extra for two-storey homes",
          "Electrical upgrades - Older homes may need a consumer unit (fuse board) upgrade or new cabling, adding €300–€1,000",
          "Battery storage - Adding a solar battery adds €4,000–€8,000 depending on capacity and brand",
          "Location - Installations in Dublin and other major cities tend to be slightly more expensive than rural areas due to higher labour costs"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Hidden Costs to Watch For"
      },
      {
        "type": "paragraph",
        "text": "While reputable installers provide comprehensive quotes that include everything, it is worth being aware of potential additional costs that may not be immediately obvious:"
      },
      {
        "type": "callout",
        "variant": "warning",
        "title": "Watch Out For",
        "body": "Some very cheap quotes may exclude scaffolding, electrical upgrades, or BER assessment costs. Always ask for a fully itemised quote that breaks down every cost component so you can compare like-for-like between installers."
      },
      {
        "type": "bulletList",
        "items": [
          "BER Assessment: €200–€350 (required for the SEAI grant)",
          "ESB Networks NC6 connection notification: free for domestic micro-generation (your installer submits it for you)",
          "Smart meter upgrade: Usually free from ESB Networks, but may involve a wait time of 4–8 weeks",
          "Scaffolding: €300–€600 for typical two-storey homes",
          "Ground-mounted systems: €2,000–€5,000 more than roof-mounted equivalents",
          "Bird protection: €200–€400 if pigeons are known to nest under panels in your area"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "ROI Calculations: When Do Solar Panels Pay for Themselves?"
      },
      {
        "type": "paragraph",
        "text": "The return on investment (ROI) for solar panels in Ireland has improved dramatically. With current all-in domestic electricity prices of roughly €0.35/kWh (including standing charges and VAT), a well-sized system can deliver a payback period of just 5–7 years. Here is a detailed ROI calculation for the three most common system sizes:"
      },
      {
        "type": "table",
        "headers": [
          "Metric",
          "4kWp System",
          "6kWp System",
          "10kWp System"
        ],
        "rows": [
          [
            "Net Cost (after grant)",
            "€5,100",
            "€7,950",
            "€12,200"
          ],
          [
            "Annual Bill Savings",
            "€750",
            "€1,000",
            "€1,500"
          ],
          [
            "CEG Export Earnings",
            "€150",
            "€250",
            "€400"
          ],
          [
            "Total Annual Savings",
            "€900",
            "€1,250",
            "€1,900"
          ],
          [
            "Payback Period",
            "~5.7 years",
            "~6.4 years",
            "~6.4 years"
          ],
          [
            "25-Year Net Profit",
            "€17,400",
            "€23,300",
            "€35,300"
          ]
        ]
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "ROI Boost",
        "body": "If electricity prices continue to rise (as forecast), your payback period could be even shorter. The above calculations assume constant prices - if electricity reaches €0.50/kWh, the 6kWp system pays for itself in under 5 years."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Is Now the Right Time to Buy?"
      },
      {
        "type": "paragraph",
        "text": "Solar panel prices in Ireland have stabilised after the supply chain disruptions of 2022–2023. While there are no dramatic price drops expected, the current market offers excellent value for money. The combination of the €1,800 SEAI grant, the Clean Export Guarantee, and rising electricity prices makes 2026 an ideal time to invest in solar."
      },
      {
        "type": "paragraph",
        "text": "Waiting for prices to fall further is a risky strategy - every month you delay is a month of missed electricity savings. For homeowners with a suitable roof, the best time to install solar panels is now."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Get a Personalised Solar Quote for Your Home",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "solar-panels-in-winter-do-they-work",
    "title": "Solar Panels in Winter: Do They Actually Work?",
    "excerpt": "A common myth in Ireland is that solar panels are useless in winter. The truth might surprise you - panels still generate 25-35% of their peak-month output during the darker months.",
    "category": "guides",
    "date": "8 Apr 2026",
    "readTime": "6 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-sky-400/10",
    "iconColor": "text-sky-400",
    "image": "/blog/solar-panels-in-winter-do-they-work.webp",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "The Myth vs The Reality"
      },
      {
        "type": "paragraph",
        "text": "**Yes, solar panels absolutely work during Irish winters.** A typical 6kWp system generates approximately 30–50% of its summer output between November and February - producing 150–250 kWh in December alone. Solar panels work on daylight, not direct sunshine, so even on overcast winter days they generate meaningful electricity. Modern panels are specifically designed for low-light conditions like Ireland's climate."
      },
      {
        "type": "paragraph",
        "text": "Solar panels do not need direct sunlight to generate electricity. They work on daylight, not sunshine. Even on a completely overcast Irish winter day, your panels will still produce a meaningful amount of power. Think of it this way: you can still get sunburned on a cloudy day - the UV radiation is still there, just diffused. Solar panels work on a similar principle."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Winter Output in Ireland",
        "body": "A typical 6kWp solar PV system in Ireland generates approximately 30–50% of its summer output during the winter months (November through February). While this is less than summer, it still contributes meaningfully to your electricity needs."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How Much Do Solar Panels Generate in Winter?"
      },
      {
        "type": "paragraph",
        "text": "To give you a realistic picture, let us look at the actual monthly generation figures for a typical 6kWp system installed on a south-facing roof in Ireland:"
      },
      {
        "type": "table",
        "headers": [
          "Month",
          "Avg Daily Output (kWh)",
          "Monthly Total (kWh)",
          "% of Peak Month"
        ],
        "rows": [
          [
            "January",
            "5–8 kWh",
            "150–250 kWh",
            "30%"
          ],
          [
            "February",
            "7–10 kWh",
            "200–280 kWh",
            "35%"
          ],
          [
            "March",
            "10–15 kWh",
            "310–460 kWh",
            "55%"
          ],
          [
            "April",
            "14–19 kWh",
            "420–570 kWh",
            "70%"
          ],
          [
            "May",
            "18–25 kWh",
            "560–780 kWh",
            "90%"
          ],
          [
            "June",
            "20–28 kWh",
            "600–840 kWh",
            "100%"
          ],
          [
            "July",
            "19–26 kWh",
            "590–810 kWh",
            "95%"
          ],
          [
            "August",
            "16–23 kWh",
            "500–710 kWh",
            "85%"
          ],
          [
            "September",
            "12–17 kWh",
            "360–510 kWh",
            "65%"
          ],
          [
            "October",
            "8–13 kWh",
            "250–400 kWh",
            "45%"
          ],
          [
            "November",
            "5–8 kWh",
            "150–240 kWh",
            "28%"
          ],
          [
            "December",
            "4–7 kWh",
            "120–220 kWh",
            "25%"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "As you can see, winter generation is lower - but it is far from zero. A 6kWp system will still produce 150–250 kWh in December, which is enough to cover a significant portion of your baseline electricity needs like lighting, fridge, and electronics."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Why Winter Isn't as Bad as You Think"
      },
      {
        "type": "paragraph",
        "text": "There are several factors that work in your favour during the Irish winter:"
      },
      {
        "type": "bulletList",
        "items": [
          "Cold temperatures improve panel efficiency - solar panels actually perform better in cold weather. For every degree above 25°C, panel efficiency drops by about 0.3–0.4%. A crisp winter day at 5°C is ideal for solar generation.",
          "Diffuse light is still useful - Irish winter skies are often uniformly overcast, which creates consistent diffuse light that modern panels are designed to capture effectively.",
          "Rain cleans your panels - Irish winter rain naturally washes away dust, pollen, and bird droppings that can reduce panel output by 5–15% during drier months.",
          "Shorter days, but still 7–8 hours of daylight - Even in late December, Ireland gets approximately 7.5 hours of daylight, providing a meaningful generation window.",
          "Winter electricity usage is higher - You use more electricity in winter (heating, lighting, longer indoor time), so the solar energy you do generate is immediately valuable and rarely wasted."
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "The Clean Export Guarantee: Winter's Secret Advantage"
      },
      {
        "type": "paragraph",
        "text": "The introduction of the Clean Export Guarantee (CEG) and smart meters in Ireland has fundamentally changed the winter equation. Under the CEG you are paid for the electricity you export in summer, which helps offset the electricity you buy back in winter. Here is how it works:"
      },
      {
        "type": "paragraph",
        "text": "During summer, your panels generate more electricity than you use. The excess is exported to the grid, and you earn €0.21 per kWh through the CEG. In winter, when your panels generate less, you draw more from the grid. The system effectively balances out over the course of a year, and the CEG payments you earn in summer help offset your higher winter electricity bills."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Smart Meter Advantage",
        "body": "Having a smart meter installed means you can access the best export tariffs and potentially sign up for time-of-use electricity plans. Some plans offer cheaper electricity at night, which can further reduce your costs if you have battery storage or an EV."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Tips to Maximise Winter Generation"
      },
      {
        "type": "paragraph",
        "text": "While you cannot control the weather, there are practical steps you can take to squeeze the maximum possible output from your panels during winter:"
      },
      {
        "type": "numberedList",
        "items": [
          "Keep panels clean - While rain does most of the work, a gentle hose-down during extended dry spells (yes, even in winter) can maintain peak output.",
          "Avoid shading - Trim any overhanging tree branches. Winter sun is lower in the sky, so shadows cast by trees or buildings are longer and can have a greater impact.",
          "Monitor your system - Use your inverter's monitoring app to track daily generation. A sudden drop could indicate a fault or shading issue that needs attention.",
          "Time your usage - Shift as much electricity consumption as possible to daylight hours. Run your washing machine, dishwasher, and tumble dryer during the middle of the day when generation is highest.",
          "Consider a battery - If your budget allows, a solar battery lets you store winter generation for evening use, reducing your grid dependence when output is at its lowest."
        ]
      },
      {
        "type": "paragraph",
        "text": "The bottom line? Solar panels absolutely work in Irish winters. They will not generate as much as in summer, but they will still produce meaningful amounts of free electricity and contribute to lower bills. The idea that solar is only viable in sunny countries is outdated - Ireland's solar resource is surprisingly good, and modern panel technology is designed specifically for cloudy climates like ours."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "See How Much Winter Solar Could Save You",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "clean-export-guarantee-explained",
    "title": "Clean Export Guarantee Explained: Get Paid for Your Excess Solar",
    "image": "/blog/clean-export-guarantee-explained.webp",
    "excerpt": "The Clean Export Guarantee (CEG) allows you to sell surplus solar electricity back to the grid. Here's how it works, what you'll earn, and which suppliers offer the best rates.",
    "category": "grants",
    "date": "4 Apr 2026",
    "readTime": "7 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-amber-400/10",
    "iconColor": "text-amber-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "What Is the Clean Export Guarantee?"
      },
      {
        "type": "paragraph",
        "text": "The Clean Export Guarantee (CEG) pays Irish homeowners **€0.21 per kilowatt-hour** for surplus solar electricity exported to the grid. This government-backed scheme, launched in 2022, requires energy suppliers to pay you for every unit of excess solar power your panels generate. For a typical 6kWp system, CEG earnings add €250–€378 per year on top of your bill savings - and the payment appears automatically as a credit on your electricity bill via your smart meter."
      },
      {
        "type": "paragraph",
        "text": "Under the CEG, energy suppliers are required to offer a payment rate for every kilowatt-hour (kWh) of electricity you export. The scheme is designed to make solar panels financially viable for everyone - not just those who can use all of their generated electricity during the day. It effectively turns the national grid into your battery, giving you credit for the power you share with your neighbours."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Current CEG Rate",
        "body": "CEG rates are set by each supplier and typically sit around €0.21/kWh in 2026. The CRU oversees the scheme, so check your supplier's current export tariff and cru.ie for the rules. Some suppliers offer higher rates as part of competitive tariffs, so it pays to shop around."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How the CEG Works in Practice"
      },
      {
        "type": "paragraph",
        "text": "The mechanics of the Clean Export Guarantee are straightforward, but understanding how the money flows is important for maximising your returns:"
      },
      {
        "type": "numberedList",
        "items": [
          "Your solar panels generate electricity during daylight hours.",
          "Any electricity you use in your home is free - it never passes through your meter.",
          "Any surplus electricity that your home does not use is automatically exported to the national grid.",
          "Your smart meter measures exactly how much electricity you export.",
          "Your energy supplier calculates your CEG payment based on your exported kilowatt-hours and their tariff rate.",
          "The payment appears as a credit on your electricity bill or as a direct bank payment, depending on your supplier."
        ]
      },
      {
        "type": "paragraph",
        "text": "The system is entirely automated - you do not need to do anything to export power. Whenever your panels are generating more than your home is consuming, the excess flows out to the grid automatically. Your smart meter tracks this in real time."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Smart Meter Requirement"
      },
      {
        "type": "paragraph",
        "text": "To benefit from the CEG, you need a smart meter installed at your property. Smart meters are digital devices that measure your electricity consumption and generation in real time, replacing the old spinning disc meters that could only measure net flow."
      },
      {
        "type": "paragraph",
        "text": "The good news is that ESB Networks has been rolling out smart meters across Ireland since 2019, and most homes with solar panels will already have one. If you do not, you can request a free smart meter installation from ESB Networks. The installation typically takes 1–2 hours and involves replacing your existing meter. There is no charge for this service."
      },
      {
        "type": "callout",
        "variant": "warning",
        "title": "Important",
        "body": "Without a smart meter, your installer can still connect your solar system, but you will not be able to receive CEG payments. Getting a smart meter should be one of your first steps when considering solar. It typically takes 4–8 weeks to get one installed."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Best Supplier Rates in 2026"
      },
      {
        "type": "paragraph",
        "text": "While the CRU sets a minimum CEG rate of €0.21/kWh, many energy suppliers compete by offering higher rates or additional perks. Here is a comparison of the leading supplier CEG offerings as of early 2026:"
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Switch and Save",
        "body": "CEG rates are not fixed - suppliers adjust them periodically. Check comparison sites like bonkers.ie and Switcher.ie at least once a year to ensure you are on the best available rate. A rate increase from €0.21 to €0.24/kWh could add €60–€100 per year to your CEG earnings."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Realistic Earnings: What Can You Expect?"
      },
      {
        "type": "paragraph",
        "text": "CEG earnings depend on the size of your system, your daytime electricity consumption, and the orientation of your panels. A household that uses most of its solar generation during the day will export less (and earn less from CEG) but save more on bills. Conversely, a household that is out during the day will export more and earn more from CEG."
      },
      {
        "type": "table",
        "headers": [
          "System Size",
          "Annual Export (kWh)",
          "CEG Earnings at €0.21/kWh",
          "CEG Earnings at €0.24/kWh"
        ],
        "rows": [
          [
            "4kWp",
            "800–1,200 kWh",
            "€168–€252",
            "€192–€288"
          ],
          [
            "6kWp",
            "1,200–1,800 kWh",
            "€252–€378",
            "€288–€432"
          ],
          [
            "10kWp",
            "1,800–2,500 kWh",
            "€378–€525",
            "€432–€600"
          ]
        ]
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "The Big Picture",
        "body": "CEG earnings alone (€300–€500/year for a typical 6kWp system) may not seem huge, but remember this is income on top of your bill savings (€800–€1,200/year). Together, they significantly accelerate your return on investment. The CEG essentially ensures that no solar energy goes to waste."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How to Register for the CEG"
      },
      {
        "type": "paragraph",
        "text": "Registering for the Clean Export Guarantee is a simple process. In most cases, your solar installer will handle the registration as part of your installation package. If not, here are the steps:"
      },
      {
        "type": "numberedList",
        "items": [
          "Ensure you have a smart meter installed. Contact ESB Networks at 01 698 5005 if you are unsure.",
          "Once your solar system is installed and commissioned, your installer should register it with ESB Networks as a microgeneration unit (under 11kW).",
          "Contact your energy supplier and inform them you now have a solar PV system. They will update your account to reflect your new export capability.",
          "Ask your supplier to put you on their CEG tariff. They may require a copy of your ESB microgeneration certificate.",
          "Your first CEG payment will typically appear on your next billing cycle after registration."
        ]
      },
      {
        "type": "paragraph",
        "text": "The entire registration process usually takes 2–4 weeks from the date of your solar installation. Most installers include CEG registration in their standard installation package, so you may not need to do anything yourself."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Get Solar Installed and Start Earning with CEG",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "east-vs-south-vs-west-facing-roofs-solar",
    "title": "East vs South vs West-Facing Roofs: Which Is Best for Solar?",
    "image": "/install-6.webp",
    "excerpt": "Does your roof face the right way for solar? We compare east, south and west-facing installations with real Irish data to show which orientation delivers the best returns.",
    "category": "guides",
    "date": "28 Mar 2026",
    "readTime": "9 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-violet-400/10",
    "iconColor": "text-violet-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "Does Roof Orientation Really Matter?"
      },
      {
        "type": "paragraph",
        "text": "One of the most common concerns homeowners have when considering solar is whether their roof faces the \"right\" direction. There is a persistent myth that only south-facing roofs are suitable for solar panels. The reality is far more nuanced - and far more encouraging. Modern solar panels are remarkably effective across a range of orientations, and a north-facing roof is actually the only orientation that is genuinely unsuitable in Ireland."
      },
      {
        "type": "paragraph",
        "text": "In Ireland, we are fortunate to be at a latitude (approximately 53°N) where the sun travels a wide arc across the sky during summer. This means that east, south, and west-facing roofs all receive substantial sunlight. The differences in output are meaningful but not dramatic, and the financial case for solar remains strong regardless of your roof's orientation."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Output by Orientation",
        "body": "A south-facing roof produces 100% of its rated capacity. East-facing roofs achieve 80–85%, west-facing roofs also achieve 80–85%, and north-facing roofs generate approximately 50–55% of rated capacity."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "South-Facing Roofs: The Gold Standard"
      },
      {
        "type": "paragraph",
        "text": "A south-facing roof is undeniably the optimal orientation for solar panels in Ireland. Because Ireland is in the Northern Hemisphere, the sun arcs from east to west through the southern half of the sky. A south-facing roof therefore receives the most direct sunlight throughout the day, particularly during the peak generation hours of late morning to early afternoon."
      },
      {
        "type": "bulletList",
        "items": [
          "Annual output: 100% of rated system capacity",
          "Peak generation: 11am – 3pm (when the sun is highest in the sky)",
          "Best suited for: Households that are home during the day and can use electricity during peak generation hours",
          "Payback period: 5–6 years (fastest of all orientations)"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "East-Facing Roofs: The Morning Champions"
      },
      {
        "type": "paragraph",
        "text": "East-facing roofs receive their strongest sunlight in the morning, from sunrise through to late morning. While they produce 15–20% less electricity overall than a south-facing roof, they have a unique advantage: their generation profile aligns perfectly with morning household routines."
      },
      {
        "type": "paragraph",
        "text": "Think about your morning routine: toast, kettle, shower, lights, phone charging, heating the house. An east-facing system peaks just when you are using the most electricity, meaning more of your solar generation is consumed directly rather than exported to the grid. Since using your own solar electricity is worth more than exporting it (you save €0.35–€0.45/kWh versus earning €0.21/kWh), this higher self-consumption rate partially offsets the lower total output."
      },
      {
        "type": "bulletList",
        "items": [
          "Annual output: 80–85% of rated capacity",
          "Peak generation: 8am – 12pm",
          "Best suited for: Households with high morning electricity consumption",
          "Payback period: 6–7 years"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "West-Facing Roofs: The Afternoon Powerhouse"
      },
      {
        "type": "paragraph",
        "text": "West-facing roofs mirror east-facing ones, with peak generation occurring from mid-afternoon through to early evening. This makes them an excellent choice for households where people are out during the day and return in the late afternoon and evening."
      },
      {
        "type": "paragraph",
        "text": "In Ireland, many households follow a pattern where the house is largely empty during the day (people at work or school), and electricity usage peaks in the evening. A west-facing system generates maximum power exactly when you come home and start cooking, running appliances, and turning on lights. Like east-facing systems, this high self-consumption rate means the financial returns are better than the raw output figures suggest."
      },
      {
        "type": "bulletList",
        "items": [
          "Annual output: 80–85% of rated capacity",
          "Peak generation: 2pm – 6pm",
          "Best suited for: Households that are out during the day and home in the evening",
          "Payback period: 6–7 years"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "North-Facing Roofs: Worth It?"
      },
      {
        "type": "paragraph",
        "text": "North-facing roofs receive the least direct sunlight in Ireland. A north-facing solar array will typically generate only 50–55% of a south-facing equivalent. For most homeowners, this is not an attractive proposition - the longer payback period (9–11 years) means the financial returns are significantly diminished."
      },
      {
        "type": "paragraph",
        "text": "However, there are exceptions. If you have a large roof area and can fit a bigger system on the north side for a low additional cost, or if your north roof is completely free from shading while your south roof is obstructed, a north-facing installation can still make financial sense. Some installers also offer mixed-orientation setups."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Split Arrays: The Best of Both Worlds"
      },
      {
        "type": "paragraph",
        "text": "If your home has roof planes facing different directions, you may be able to install a split array - panels on both an east and a west roof, for example. Split arrays have become increasingly popular in Ireland because they offer a broader generation profile throughout the day."
      },
      {
        "type": "table",
        "headers": [
          "Configuration",
          "Annual Output",
          "Generation Pattern",
          "Best For"
        ],
        "rows": [
          [
            "South only",
            "100%",
            "Midday peak",
            "Daytime home workers"
          ],
          [
            "East + West split",
            "85–90%",
            "Broad morning–evening curve",
            "Families out during the day"
          ],
          [
            "East + South split",
            "90–95%",
            "Morning–midday curve",
            "Shift workers, high morning use"
          ],
          [
            "South + West split",
            "90–95%",
            "Midday–evening curve",
            "Afternoon/evening households"
          ]
        ]
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Split Array Advantage",
        "body": "A split east/west array generates less total electricity than a south-facing equivalent, but it typically has a much higher self-consumption rate (up to 70–80% vs 40–50% for south-only). This means less electricity is exported at the lower CEG rate and more is consumed at the full electricity price - improving your overall financial return."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Other Factors That Matter More Than Orientation"
      },
      {
        "type": "paragraph",
        "text": "While roof orientation is important, several other factors have an equal or greater impact on your system's performance:"
      },
      {
        "type": "bulletList",
        "items": [
          "Shading - Even a small amount of shading (chimney, tree, neighbouring building) can reduce output by 10–25%. Eliminating shading is more important than optimising orientation.",
          "Pitch angle - The ideal pitch for Ireland is approximately 35–40°. Most standard Irish roofs fall within 30–45°, which is excellent for solar.",
          "Roof condition - A roof that needs replacement within the next 5–10 years should be replaced before installing solar. Removing and reinstalling panels adds significant cost.",
          "System sizing - An oversized system on a west-facing roof may produce more usable energy than an undersized system on a south-facing roof."
        ]
      },
      {
        "type": "paragraph",
        "text": "The key takeaway is simple: if your roof faces east, south, or west, solar panels are a worthwhile investment in Ireland. The differences between these orientations are relatively modest in the context of a 25-year panel lifespan, and the financial case remains strong across all three."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Get a Free Roof Assessment for Your Home",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "battery-storage-is-it-worth-the-extra-cost",
    "title": "Battery Storage: Is It Worth the Extra Cost?",
    "image": "/blog/battery-storage-is-it-worth-the-extra-cost.webp",
    "excerpt": "Solar batteries cost €4,000-€8,000 - but can they pay for themselves? We break down the maths with real Irish energy prices and usage patterns to help you decide.",
    "category": "savings",
    "date": "22 Mar 2026",
    "readTime": "10 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-emerald-400/10",
    "iconColor": "text-emerald-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "The Battery Storage Question"
      },
      {
        "type": "paragraph",
        "text": "Adding battery storage to your solar panel system is the single biggest decision you will make after choosing to go solar. It is also the most expensive optional component, with prices ranging from €4,000 to €8,000 depending on capacity, brand, and installation complexity. So, is it worth the extra cost? The honest answer is: it depends on your circumstances."
      },
      {
        "type": "paragraph",
        "text": "This guide will walk you through the financial maths, the practical benefits, and the specific scenarios where a battery delivers genuine value. We will not sugarcoat it - for some households, a battery is an excellent investment. For others, it is money better spent on a larger solar array or kept in the bank. Our goal is to help you figure out which camp you fall into."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Battery Market in Ireland",
        "body": "A growing share of new Irish solar installations now include battery storage. Note: The previous €600 SEAI battery grant was discontinued - there is no standalone battery grant in 2026, making the ROI calculation more important than ever."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How Much Do Solar Batteries Cost?"
      },
      {
        "type": "paragraph",
        "text": "Solar battery prices have fallen significantly over the past five years, driven by advances in lithium iron phosphate (LFP) technology and increased global manufacturing capacity. Here is a breakdown of current battery costs in Ireland for 2026:"
      },
      {
        "type": "callout",
        "variant": "warning",
        "title": "Battery Grant Discontinued",
        "body": "The previous €600 SEAI battery storage grant has been discontinued. There is no standalone grant for batteries in 2026, which means the full cost of battery storage falls to you. Factor this into your payback calculations - most batteries now take 8–12 years to pay for themselves through savings alone."
      },
      {
        "type": "table",
        "headers": [
          "Battery Capacity",
          "Typical Cost",
          "Best For"
        ],
        "rows": [
          [
            "3–5 kWh (small)",
            "€4,000 – €5,500",
            "Small households, low evening usage"
          ],
          [
            "5–7 kWh (medium)",
            "€5,000 – €7,000",
            "Average 3-4 person household"
          ],
          [
            "7–10 kWh (large)",
            "€6,500 – €8,000",
            "Large homes, EV owners, high usage"
          ],
          [
            "10–13.5 kWh (XL)",
            "€8,000 – €10,000",
            "Off-grid capability, heat pumps"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "The most popular battery size for Irish households is 5–7 kWh, which provides enough storage to cover typical evening electricity consumption (6pm–11pm). The Tesla Powerwall 2 (13.5 kWh) is the most well-known option but is also the most expensive - for most Irish homes, a 5–7 kWh battery from a brand like Huawei, BYD, or Pylontech offers better value."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Payback Calculations: Does a Battery Pay for Itself?"
      },
      {
        "type": "paragraph",
        "text": "The payback period for a solar battery is longer than for panels alone. While solar panels typically pay for themselves in 5–7 years, a battery usually takes 8–12 years. However, this varies dramatically based on your electricity usage patterns. Let us look at the numbers:"
      },
      {
        "type": "paragraph",
        "text": "Without a battery, a typical 6kWp solar system generates approximately 5,000 kWh per year. If you use 50% directly and export 50%, your annual savings look like this: €875 in direct savings (2,500 kWh × €0.35/kWh) plus €263 in CEG earnings (2,500 kWh × €0.105 effective rate). Total: approximately €1,138 per year."
      },
      {
        "type": "paragraph",
        "text": "With a 5 kWh battery, you can increase your self-consumption to approximately 75–80%. That means consuming 4,000 kWh directly and exporting only 1,000 kWh: €1,400 in direct savings (4,000 kWh × €0.35/kWh) plus €105 in CEG earnings (1,000 kWh × €0.105 effective rate). Total: approximately €1,505 per year."
      },
      {
        "type": "table",
        "headers": [
          "Scenario",
          "Annual Savings",
          "Battery Cost (Net)",
          "Payback Period"
        ],
        "rows": [
          [
            "No battery",
            "€1,138",
            "N/A",
            "N/A"
          ],
          [
            "5 kWh battery + solar",
            "€1,505",
            "€5,400",
            "~9.3 years"
          ],
          [
            "7 kWh battery + solar",
            "€1,575",
            "€6,400",
            "~10.8 years"
          ],
          [
            "10 kWh battery + solar",
            "€1,645",
            "€7,400",
            "~12.1 years"
          ]
        ]
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "Understanding the Numbers",
        "body": "A battery saves you money by reducing your grid imports during the evening and night. The value of each stored kWh is €0.35–€0.45 (the price you would otherwise pay for grid electricity), versus the €0.21 you earn from exporting it. Storing your own solar is worth nearly double what exporting it earns."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "When a Battery Makes Sense"
      },
      {
        "type": "paragraph",
        "text": "There are several specific scenarios where adding a battery is a genuinely smart financial decision:"
      },
      {
        "type": "bulletList",
        "items": [
          "You have an electric vehicle - An EV adds 3,000–5,000 kWh to your annual electricity consumption. A battery lets you charge your EV from stored solar power overnight, dramatically reducing your motoring costs.",
          "You are on a time-of-use tariff - If your electricity supplier charges more during peak hours (5pm–7pm) and less at night, a battery lets you avoid peak rates entirely by using stored solar during expensive periods.",
          "You have a heat pump - Heat pumps use significant electricity, particularly in winter. A battery can supplement your heat pump's power needs during peak pricing periods.",
          "You work from home - If you are home during the day, you may not export much excess solar. But if your solar output exceeds your daytime needs (large system), a battery captures the surplus for the evening.",
          "You want backup power - If power cuts are a concern in your area, most solar batteries can provide backup power during outages (though this usually requires an additional configuration and switchgear)."
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "When a Battery Does NOT Make Sense"
      },
      {
        "type": "paragraph",
        "text": "Be honest with yourself - a battery is not right for everyone. Here are the scenarios where we would advise against adding one:"
      },
      {
        "type": "bulletList",
        "items": [
          "Your budget is tight - If you are stretching your finances to afford solar panels, do not add a battery on top. Panels alone deliver an excellent return, and you can always add a battery later.",
          "You are home all day - If someone is home during daylight hours, you likely consume 60–70% of your solar generation directly. The marginal benefit of a battery is smaller when self-consumption is already high.",
          "You have a small system - A 4kWp system generates relatively little surplus. A battery may spend much of its time empty or only partially charged, reducing its value.",
          "Your roof faces east or west - Split orientation systems already have broad generation profiles, and the surplus available for storage is smaller than a south-facing system."
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Battery Sizing Guide"
      },
      {
        "type": "paragraph",
        "text": "Choosing the right battery size is crucial. Too small, and it will not store enough to make a meaningful difference. Too large, and you will never fill it, wasting money on unused capacity. As a general rule, your battery capacity should be between 1 and 1.5 times your daily solar surplus."
      },
      {
        "type": "table",
        "headers": [
          "Household Size",
          "Daily Usage (kWh)",
          "Solar System",
          "Recommended Battery"
        ],
        "rows": [
          [
            "1–2 people",
            "10–15 kWh",
            "4kWp",
            "3–5 kWh"
          ],
          [
            "3–4 people",
            "15–25 kWh",
            "6kWp",
            "5–7 kWh"
          ],
          [
            "5+ people",
            "25–35+ kWh",
            "8–10kWp",
            "7–10 kWh"
          ],
          [
            "EV owner (any)",
            "+10–15 kWh",
            "6–10kWp",
            "10–13.5 kWh"
          ]
        ]
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Future-Proof Tip",
        "body": "Most lithium iron phosphate batteries can be expanded by adding additional modules later. You do not have to buy your full capacity upfront. Start with a smaller battery and add capacity as your needs grow (e.g., when you buy an EV)."
      },
      {
        "type": "paragraph",
        "text": "Ultimately, the decision to add battery storage comes down to your personal circumstances, budget, and electricity usage patterns. For many Irish households, especially those with EVs or on time-of-use tariffs, a battery is a worthwhile addition that accelerates long-term savings. For others, investing in more panels or simply saving the money is the smarter choice."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Get a Custom Battery + Solar Recommendation",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "planning-permission-solar-panels-ireland",
    "title": "Planning Permission for Solar Panels in Ireland - What You Need to Know",
    "image": "/blog/planning-permission-solar-panels-ireland.webp",
    "excerpt": "Good news - most domestic solar installations in Ireland don't need planning permission. Here are the exceptions, limits, and guidelines you should be aware of before installing.",
    "category": "guides",
    "date": "18 Mar 2026",
    "readTime": "5 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-rose-400/10",
    "iconColor": "text-rose-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "The Good News: Exempted Development"
      },
      {
        "type": "paragraph",
        "text": "If you are considering installing solar panels on your home in Ireland, here is the best news you will hear: the vast majority of domestic solar installations do not require planning permission. Under Irish planning law, solar panels on residential properties fall under \"exempted development,\" which means you can proceed without applying to your local county council."
      },
      {
        "type": "paragraph",
        "text": "This exemption was introduced to remove barriers to renewable energy adoption and has been instrumental in the rapid growth of residential solar across Ireland. However, the exemption is not unlimited - there are specific conditions you must adhere to. Exceeding these limits means you will need to go through the full planning permission process, which can add months and significant cost to your project."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Quick Answer",
        "body": "If you are installing solar panels on a typical Irish home that is not a protected structure and is not in a conservation area, you almost certainly do not need planning permission. Your installer will confirm this during the initial survey."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Exempted Development Limits"
      },
      {
        "type": "paragraph",
        "text": "To qualify for exempted development status, your solar installation must comply with the following conditions set out under the Planning and Development Regulations:"
      },
      {
        "type": "bulletList",
        "items": [
          "Since October 2022 there is no area limit for rooftop solar on houses, unless your home is in a Solar Safeguarding Zone near an aerodrome (300 square metre cap) or is a protected structure or in an Architectural Conservation Area (this is measured as the total footprint of all panels combined)",
          "No solar panel should extend more than 50 centimetres above the existing roof surface (measured from the highest point of the roof tiles/slates to the top of the panel)",
          "The solar panels must be installed on the roof - not on walls, fences, or freestanding structures (ground-mounted solar requires separate planning)",
          "The installation must be on a house or apartment building - not on a shed, garage, or outbuilding (with limited exceptions)",
          "Panels should not project beyond the external wall of the building at any point"
        ]
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "12 Square Metres Explained",
        "body": "Twelve square metres is approximately 8–10 standard solar panels (depending on panel size). This is enough for a 4–5kWp system, which is sufficient for most smaller Irish households. For larger systems (6kWp+), you may need to split panels across multiple roof planes or apply for planning permission if you want them all on one roof."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "When You DO Need Planning Permission"
      },
      {
        "type": "paragraph",
        "text": "There are specific situations where planning permission is required for solar panels in Ireland. It is important to identify these before you commit to an installation:"
      },
      {
        "type": "bulletList",
        "items": [
          "Protected structures - If your home is a protected structure or a proposed protected structure, you will need planning permission for any external alteration, including solar panels. This includes Georgian, Victorian, and Edwardian buildings in certain areas.",
          "Architectural conservation areas (ACAs) - If your property is located within a designated ACA, special rules apply. Some ACAs restrict solar panel installations that are visible from the street.",
          "Solar Safeguarding Zones - Homes near certain aerodromes fall in a Solar Safeguarding Zone, where a 300 square metre roof cap applies; almost everywhere else there is no area limit since October 2022.",
          "Flat roof installations - Panels on flat roofs that project above the parapet wall may require planning permission, depending on the height of the parapet.",
          "Listed buildings - Similar to protected structures, buildings on the National Inventory of Architectural Heritage require planning permission.",
          "Ground-mounted solar - Free-standing panels in your garden are exempt up to 25 square metres, subject to remaining garden-space conditions; larger ground arrays need planning permission."
        ]
      },
      {
        "type": "callout",
        "variant": "warning",
        "title": "Do Not Risk It",
        "body": "Installing solar panels without planning permission when it is required is an unauthorised development. Your local council can issue an enforcement notice requiring you to remove the panels. Always check with your installer and, if in doubt, contact your local planning department before proceeding."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Protected Structures and Heritage Homes"
      },
      {
        "type": "paragraph",
        "text": "If you own a protected structure, you can still install solar panels - but you will need to go through the planning permission process. This involves submitting detailed plans showing how the panels will be installed and demonstrating that they will not materially alter the character of the building."
      },
      {
        "type": "paragraph",
        "text": "Tips for protected structure owners include: choosing dark-framed panels that blend with dark roof tiles, positioning panels on rear roof slopes that are not visible from the street, considering in-roof systems where panels replace roof tiles rather than sitting on top of them, and working with an installer experienced in heritage projects."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "BER Assessment Exemption"
      },
      {
        "type": "paragraph",
        "text": "While not directly related to planning permission, it is worth noting that having solar panels does not automatically trigger a BER assessment requirement. However, if you are applying for the SEAI grant, you will need a BER assessment as part of the grant conditions. This is separate from planning permission and is managed through the SEAI portal rather than your local council."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Summary: Do You Need Planning?"
      },
      {
        "type": "table",
        "headers": [
          "Scenario",
          "Planning Required?",
          "Notes"
        ],
        "rows": [
          [
            "Standard house, any roof area",
            "No",
            "Exempted development - no area limit since Oct 2022"
          ],
          [
            "Protected structure",
            "Yes",
            "Heritage impact assessment required"
          ],
          [
            "In an ACA",
            "Maybe",
            "Check with local planning department"
          ],
          [
            "Flat roof (below parapet)",
            "No",
            "Exempted if not visible above parapet"
          ],
          [
            "Flat roof (above parapet)",
            "Maybe",
            "Depends on height and visibility"
          ],
          [
            "Ground-mounted panels",
            "Maybe",
            "Exempt up to 25m²; larger arrays need permission"
          ],
          [
            "Apartment block (own apartment only)",
            "No",
            "Exempted for individual units"
          ],
          [
            "Solar Safeguarding Zone (near an aerodrome)",
            "Maybe",
            "300m² roof cap applies in these zones"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "The vast majority of Irish homeowners will never need to worry about planning permission for their solar installation. The exempted development rules are generous enough to accommodate most standard residential setups. If you have any doubts, your SEAI-registered installer will be able to advise you during the initial consultation and survey."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Book a Free Survey - We Will Check Planning for You",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "longi-vs-jinko-vs-trina-best-solar-panels",
    "title": "LONGi vs Jinko vs Trina: Which Solar Panels Are Best for Irish Homes?",
    "image": "/blog/longi-vs-jinko-vs-trina-best-solar-panels.webp",
    "excerpt": "We compare the top three tier-1 solar panel brands used in Ireland - efficiency, warranties, real-world performance, and which one delivers the best value for your home.",
    "category": "technology",
    "date": "12 Mar 2026",
    "readTime": "8 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-sky-400/10",
    "iconColor": "text-sky-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "The Big Three: LONGi, Jinko, and Trina"
      },
      {
        "type": "paragraph",
        "text": "When it comes to choosing solar panels for your Irish home, three manufacturers dominate the market: LONGi, Jinko Solar, and Trina Solar. All three are Chinese Tier-1 manufacturers with global reputations for quality, reliability, and innovation. All three are Bloomberg NEF Tier-1 manufacturers commonly offered by Irish installers."
      },
      {
        "type": "paragraph",
        "text": "But which one is right for you? While all three produce excellent panels, there are meaningful differences in efficiency, degradation rates, warranty terms, real-world performance in Irish weather conditions, and price. This guide provides an honest, side-by-side comparison to help you make an informed decision."
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "What Is a Tier-1 Panel?",
        "body": "Tier-1 is a classification by Bloomberg New Energy Finance (BNEF) that indicates a manufacturer is vertically integrated, financially stable, and has a proven track record. It is the solar industry's gold standard for bankability and reliability."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "LONGi Hi-MO 6: The Efficiency Leader"
      },
      {
        "type": "paragraph",
        "text": "LONGi is the world's largest manufacturer of monocrystalline silicon solar panels and is widely regarded as the industry leader in panel efficiency. Their Hi-MO 6 series, launched in 2023 and updated for 2026, represents the cutting edge of residential solar technology."
      },
      {
        "type": "bulletList",
        "items": [
          "Efficiency: 22.3–22.8% (highest of the three)",
          "Cell type: Monocrystalline PERC with HPDC technology",
          "Power output: 410–440W per panel (standard 60-cell format)",
          "Temperature coefficient: -0.29%/°C (excellent for Irish climate)",
          "Degradation: 0.55% per year in year 1, then 0.4% per year",
          "Warranty: 25-year product warranty, 30-year performance warranty (87.4% output at year 30)"
        ]
      },
      {
        "type": "paragraph",
        "text": "LONGi panels are particularly well-suited to Ireland because of their excellent low-light performance and temperature coefficient. Ireland's mild climate means panels rarely overheat, and LONGi's low temperature coefficient means they lose less efficiency in warm conditions. They also perform exceptionally well in diffuse light conditions (cloudy days), which accounts for much of Ireland's annual solar resource."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Jinko Tiger Neo: The Value Pick"
      },
      {
        "type": "paragraph",
        "text": "Jinko Solar is the world's largest shipper of solar modules and has a particularly strong presence in the Irish residential market. Their Tiger Neo series uses N-type TOPCon cell technology, which represents the next generation of solar cell architecture beyond PERC."
      },
      {
        "type": "bulletList",
        "items": [
          "Efficiency: 21.8–22.5%",
          "Cell type: N-type TOPCon (tunnel oxide passivated contact)",
          "Power output: 400–430W per panel",
          "Temperature coefficient: -0.30%/°C",
          "Degradation: 1% in year 1, then 0.4% per year (N-type advantage)",
          "Warranty: 25-year product warranty, 30-year performance warranty (87.4% output at year 30)"
        ]
      },
      {
        "type": "paragraph",
        "text": "The key advantage of Jinko's Tiger Neo is its N-type TOPCon technology. N-type cells are less prone to light-induced degradation (LID) than the P-type cells used in older panel designs. This means Jinko panels retain their output better over the first few years of operation. In practical terms, a Jinko Tiger Neo panel may produce 1–2% more electricity in year 5 compared to a similar P-type panel, as P-type panels degrade faster in their early years."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Trina Vertex S+: The All-Rounder"
      },
      {
        "type": "paragraph",
        "text": "Trina Solar is one of the industry's most established players, having been founded in 1997. Their Vertex S+ series for residential applications offers a well-balanced combination of performance, reliability, and value."
      },
      {
        "type": "bulletList",
        "items": [
          "Efficiency: 21.5–22.3%",
          "Cell type: Monocrystalline PERC with multi-busbar technology",
          "Power output: 390–425W per panel",
          "Temperature coefficient: -0.30%/°C",
          "Degradation: 1% in year 1, then 0.4% per year",
          "Warranty: 25-year product warranty, 25-year performance warranty (84.8% output at year 25)"
        ]
      },
      {
        "type": "paragraph",
        "text": "Trina's Vertex S+ is a solid, reliable workhorse. While it does not lead on any single metric, it offers consistently good performance across the board. Trina panels are also among the most widely available in Ireland, which can mean shorter lead times and competitive pricing from installers."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Head-to-Head Comparison"
      },
      {
        "type": "table",
        "headers": [
          "Feature",
          "LONGi Hi-MO 6",
          "Jinko Tiger Neo",
          "Trina Vertex S+"
        ],
        "rows": [
          [
            "Panel Efficiency",
            "22.3–22.8%",
            "21.8–22.5%",
            "21.5–22.3%"
          ],
          [
            "Power Output",
            "410–440W",
            "400–430W",
            "390–425W"
          ],
          [
            "Temp Coefficient",
            "-0.29%/°C",
            "-0.30%/°C",
            "-0.30%/°C"
          ],
          [
            "Year 1 Degradation",
            "0.55%",
            "1.0%",
            "1.0%"
          ],
          [
            "Annual Degradation",
            "0.40%",
            "0.40%",
            "0.40%"
          ],
          [
            "Product Warranty",
            "25 years",
            "25 years",
            "25 years"
          ],
          [
            "Performance Warranty",
            "30 years (87.4%)",
            "30 years (87.4%)",
            "25 years (84.8%)"
          ],
          [
            "Typical Price (per panel)",
            "€180–€220",
            "€160–€200",
            "€150–€190"
          ],
          [
            "Irish Suitability",
            "★★★★★",
            "★★★★☆",
            "★★★★☆"
          ],
          [
            "Value for Money",
            "★★★★☆",
            "★★★★★",
            "★★★★★"
          ]
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Performance in Irish Weather"
      },
      {
        "type": "paragraph",
        "text": "Ireland's climate presents specific challenges for solar panels: frequent cloud cover, relatively mild temperatures, high humidity, and occasional salt spray in coastal areas. All three brands handle these conditions well, but there are subtle differences worth noting."
      },
      {
        "type": "paragraph",
        "text": "LONGi's slight edge in efficiency and temperature coefficient makes it marginally better in Irish conditions, particularly during the summer months when temperatures can occasionally rise above 25°C. However, the difference in real-world annual output between LONGi and Jinko panels of the same wattage is typically less than 2–3% - which translates to roughly 20–40 kWh per year on a standard 6kWp system. This is not a decisive difference for most homeowners."
      },
      {
        "type": "paragraph",
        "text": "All three brands use anodised aluminium frames and tempered glass that meet the IEC 61215 standard for durability. They are all rated to withstand wind speeds of 2,400 Pa (approximately 150 km/h) and snow loads of 5,400 Pa - more than sufficient for Irish weather conditions."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Our Recommendation"
      },
      {
        "type": "paragraph",
        "text": "For most Irish homeowners, the choice between these three panels comes down to price and availability rather than performance. All three will serve you well for 25+ years. Here is our simple recommendation:"
      },
      {
        "type": "bulletList",
        "items": [
          "If your roof space is limited - choose LONGi Hi-MO 6 for maximum output per square metre",
          "If you want the best value - choose Jinko Tiger Neo, which offers N-type technology at competitive prices",
          "If your installer strongly recommends Trina - go with it, the Vertex S+ is a proven performer and availability can matter",
          "Do not stress too much about the brand - panel quality matters, but installer quality matters more. A well-installed Trina system will outperform a poorly installed LONGi system every time"
        ]
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "The Real Secret",
        "body": "The most important factor in your solar system's long-term performance is not the panel brand - it is the quality of the installation. A skilled installer who takes care with wiring, inverter placement, shading analysis, and roof attachment will deliver better results than a premium panel installed poorly. Choose your installer as carefully as you choose your panels."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Get a Quote with Premium Panel Options",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "solar-panels-dublin-ultimate-guide",
    "title": "Solar Panels in Dublin: The Ultimate 2026 Guide",
    "image": "/install-4.webp",
    "excerpt": "Everything Dublin homeowners need to know about going solar - from grant eligibility and installation costs to the best panels for Dublin's weather and typical roof types.",
    "category": "county",
    "date": "6 Mar 2026",
    "readTime": "11 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-orange-400/10",
    "iconColor": "text-orange-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "Why Dublin Is Leading Ireland's Solar Revolution"
      },
      {
        "type": "paragraph",
        "text": "Dublin is at the forefront of Ireland's residential solar energy boom. With approximately 550,000 residential properties, the capital has the highest concentration of potential solar installations in the country. Nationally, a record 34,000+ homes were grant-aided for solar in 2025 (SEAI), and Dublin consistently accounts for the largest share of applications."
      },
      {
        "type": "paragraph",
        "text": "Several factors make Dublin uniquely positioned for solar adoption: high electricity prices (among the highest in the country due to urban network charges), a large number of suitable roof types, excellent installer availability, and a dense population of environmentally conscious homeowners. Dublin City Council has also been proactive in streamlining the process for solar installations, and the county has some of the highest smart meter penetration rates in Ireland."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Dublin Solar Stats",
        "body": "More than 100,000 Irish homes have been grant-aided for solar since 2018 (SEAI), with Dublin the largest single county market. The average 6kWp system in Dublin generates approximately 5,000–5,500 kWh per year, saving homeowners €900–€1,200 annually on electricity bills."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Solar Panel Costs in Dublin (2026)"
      },
      {
        "type": "paragraph",
        "text": "Solar panel installation costs in Dublin are slightly higher than the national average, primarily due to higher labour costs, parking charges for installation crews, and the logistical challenges of working in a densely populated urban area. However, the increased competition among Dublin-based installers has kept prices competitive."
      },
      {
        "type": "table",
        "headers": [
          "System Size",
          "Dublin Cost Range",
          "National Average",
          "After Grant"
        ],
        "rows": [
          [
            "4kWp (10–12 panels)",
            "€6,500 – €8,500",
            "€6,000 – €8,000",
            "€4,700 – €6,700"
          ],
          [
            "6kWp (14–16 panels)",
            "€9,000 – €12,000",
            "€8,500 – €11,000",
            "€7,200 – €10,200"
          ],
          [
            "10kWp (22–26 panels)",
            "€13,000 – €17,000",
            "€12,000 – €16,000",
            "€11,200 – €15,200"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "Dublin costs are typically 5–10% above the national average, but the higher electricity prices in Dublin mean the financial returns are actually slightly better. At an average urban electricity rate of €0.40/kWh (including standing charges and VAT), a 6kWp system in Dublin pays for itself in approximately 5.5–6.5 years - slightly faster than the national average of 6–7 years."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Dublin Roof Types and Solar Compatibility"
      },
      {
        "type": "paragraph",
        "text": "Dublin has a diverse range of housing stock, from Georgian townhouses to modern estates. Each roof type presents unique opportunities and challenges for solar installation:"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Victorian and Edwardian Terraces (1890–1920)"
      },
      {
        "type": "paragraph",
        "text": "These are found throughout Dublin 4, Dublin 6, Rathmines, Ranelagh, and Drumcondra. They typically have steeply pitched slate roofs with multiple chimney stacks. Solar compatibility is generally good - the roof pitch (35–45°) is ideal, and many have south-facing rear roof slopes. The main challenges are narrow terraces where scaffolding access can be difficult, chimneys that cause shading, and fragile original slate roofs that may need reinforcement before panel installation."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "1930s–1950s Suburban Semis"
      },
      {
        "type": "paragraph",
        "text": "Common in areas like Templeogue, Donnybrook, Milltown, and Drumcondra. These homes typically have pitched tiled roofs with generous ridge-to-eave measurements. They are among the easiest roof types for solar installation - ample space, standard pitches, and minimal shading. Many have both front and rear roof slopes, allowing for split east/west arrays. This is the \"sweet spot\" roof type for solar in Dublin."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "1960s–1980s Bungalows"
      },
      {
        "type": "paragraph",
        "text": "Found in suburban areas like Tallaght, Clondalkin, Ballymun, and Blanchardstown. These single-storey homes often have shallow-pitched roofs (15–25°) with large unshaded areas. The shallow pitch is suboptimal for solar (ideal is 35–40°), but the large roof area compensates - you can often fit more panels than on a standard two-storey house. Scaffolding is cheaper (single storey), which reduces installation costs."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Modern Estates (2000–present)"
      },
      {
        "type": "paragraph",
        "text": "Found in areas like Swords, Lucan, Leopardstown, and Adamstown. Modern homes typically have concrete tile roofs with standard pitches (30–35°) and clean rooflines. They are excellent for solar - minimal shading, strong roof structures, and many are already pre-wired for solar conduit. Some newer developments in Dublin even include solar panels as standard."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Dublin Roof Tip",
        "body": "If you live in a Dublin terrace, ask your installer about a split east/west array on your front and rear roof slopes. This maximises generation throughout the day without requiring scaffolding around the sides of the building (which can require neighbour permission)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Grant Uptake and Statistics in Dublin"
      },
      {
        "type": "paragraph",
        "text": "Dublin has consistently led the country in SEAI grant applications for solar panels. The county accounts for consistently the largest share of national solar grant applications (SEAI), in line with its large share of the national housing stock (CSO). This reflects the higher energy costs in Dublin, greater environmental awareness, and easier access to SEAI-registered installers."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Choosing an Installer in Dublin"
      },
      {
        "type": "paragraph",
        "text": "Dublin has the highest concentration of solar installers in Ireland, which is both a blessing and a challenge. More choice means better pricing, but it also means more research is needed to find a quality installer. Here are our tips for Dublin homeowners:"
      },
      {
        "type": "numberedList",
        "items": [
          "Always use an SEAI-registered installer - verify registration on seai.ie before signing any contract",
          "Get at least 3 quotes - Dublin installer prices can vary by 20–30% for identical systems",
          "Check reviews on Google and Trustpilot - pay particular attention to reviews from Dublin homeowners, as installation quality can vary by area",
          "Ask about scaffolding costs - Dublin parking and access can add €200–€500 to scaffolding costs. Some quotes include this, others do not",
          "Check for Dublin-specific experience - installers who regularly work in Dublin's older housing stock will be better equipped to handle fragile slate roofs and tight terrace access",
          "Ask about the ESB Networks NC6 microgeneration notification - your installer should handle ESB Networks registration and smart meter coordination",
          "Verify warranty coverage - ensure your installer provides a workmanship warranty of at least 5 years on top of the manufacturer's panel warranty"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Dublin Council Areas and Considerations"
      },
      {
        "type": "paragraph",
        "text": "Dublin is divided into four local authority areas: Dublin City Council, South Dublin County Council, Fingal County Council, and Dún Laoghaire-Rathdown County Council. While the planning rules are consistent across all four (following national exempted development guidelines), there are some local nuances to be aware of:"
      },
      {
        "type": "bulletList",
        "items": [
          "Dublin City Council - High density of protected structures and ACAs. If your home is in areas like Georgian Dublin (Mountjoy Square, Merrion Square), St. Stephen's Green, or the Liberties, check for heritage designations before proceeding.",
          "Dún Laoghaire-Rathdown - Several scenic conservation areas along the coast. Seafront properties in Dalkey, Killiney, and Sandycove may have additional restrictions on roof alterations visible from the sea.",
          "South Dublin County Council - Relatively few heritage restrictions. Suburban areas like Tallaght, Clondalkin, and Lucan are straightforward for solar installation.",
          "Fingal County Council - Mix of suburban and rural. Areas like Swords, Malahide, and Howth have good solar potential. Rural properties in north County Dublin may be able to accommodate larger systems."
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Solar Generation in Dublin vs Rest of Ireland"
      },
      {
        "type": "paragraph",
        "text": "Dublin's solar resource is comparable to the rest of Ireland, with a slight advantage in coastal areas due to less cloud cover compared to inland counties. A typical 6kWp system in Dublin will generate approximately 5,000–5,500 kWh per year, depending on roof orientation, pitch, and shading. This is slightly above the national average, partly due to Dublin's coastal location benefiting from clearer coastal skies."
      },
      {
        "type": "paragraph",
        "text": "The urban heat island effect also provides a marginal benefit. Dublin city centre is typically 1–2°C warmer than surrounding rural areas, which can slightly increase panel efficiency during cooler months (though excessive heat in summer is counterproductive, the Irish climate rarely gets warm enough for this to be a concern)."
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "Dublin vs National Comparison",
        "body": "electricity prices are set nationally by supplier, so Dublin's solar economics match the national picture, but also save 5–10% more with solar. The net financial advantage of going solar in Dublin is slightly better than in most other Irish counties."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Getting Started: Your Next Steps"
      },
      {
        "type": "paragraph",
        "text": "If you are a Dublin homeowner considering solar panels, here is a simple roadmap to get started:"
      },
      {
        "type": "numberedList",
        "items": [
          "Check your eligibility - Use our free solar calculator to get an instant estimate of your potential savings and system size. You will need your ESB MPRN number and recent electricity bills.",
          "Get multiple quotes - Contact at least 3 SEAI-registered installers operating in your area. Compare not just prices, but panel brands, inverter options, warranties, and aftercare.",
          "Verify your roof - Your chosen installer will conduct a free site survey to confirm your roof is suitable and identify any potential issues.",
          "Apply for the grant - Once you have chosen your installer, apply for the SEAI grant online. Your installer can usually assist with this process.",
          "Schedule installation - Most Dublin installations can be completed within 4–8 weeks of grant approval, subject to installer availability and weather conditions.",
          "Register for CEG - After installation, ensure your energy supplier is notified so you can start earning from your excess solar export."
        ]
      },
      {
        "type": "paragraph",
        "text": "Dublin is an excellent place to go solar. The combination of high electricity prices, a competitive installer market, diverse and largely suitable roof types, and strong grant uptake means that Dublin homeowners are among the best-placed in Ireland to benefit from solar energy. With a payback period of just 5.5–6.5 years and 25+ years of free electricity ahead, there has never been a better time to make the switch."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Get a Free Dublin Solar Quote - See Your Savings",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "seai-grant-stay-e1800-2026-what-it-means",
    "title": "SEAI Grant Stays at €1,800 for 2026 - What It Means for You",
    "image": "/blog/seai-grant-stay-e1800-2026-what-it-means.webp",
    "excerpt": "The government has confirmed the SEAI solar panel grant will remain at €1,800 for 2026. Here is what the announcement means for homeowners, the grant's history, and why now is still the time to apply.",
    "category": "news",
    "date": "28 Apr 2026",
    "readTime": "5 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-violet-400/10",
    "iconColor": "text-violet-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "The Announcement"
      },
      {
        "type": "paragraph",
        "text": "The Government confirmed the SEAI solar PV grant would remain at €1,800 for 2026, pausing the scheduled €300 annual reduction (seai.ie) for the entirety of 2026. This announcement came as a relief to thousands of homeowners who were planning solar installations, as the grant had been on a steady downward trajectory and was widely expected to drop to €1,500 this year."
      },
      {
        "type": "paragraph",
        "text": "The decision reflects the government's ongoing commitment to residential renewable energy and its recognition that solar adoption in Ireland is still accelerating. With more than 100,000 homes now grant-aided for solar and 2025 setting a record 34,000+ installations (SEAI), the grant is clearly doing its job - and the government has chosen to maintain the incentive rather than risk slowing momentum."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Best Value in the Scheme's History",
        "body": "The €1,800 grant represents the best value in the scheme's history when combined with falling panel prices. Solar system costs have dropped 20–30% since 2021, meaning the grant now covers a larger percentage of total installation costs than ever before."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What This Means for Homeowners"
      },
      {
        "type": "paragraph",
        "text": "The most immediate impact of this announcement is stability. Homeowners who were considering solar no longer need to rush their applications to beat a deadline. You can take the time to get multiple quotes, carefully evaluate installers, and plan your installation at a pace that suits you - without worrying that the grant will shrink while you are deciding."
      },
      {
        "type": "bulletList",
        "items": [
          "No rush to apply - the €1,800 rate is guaranteed for all of 2026, regardless of when you apply during the year",
          "Better planning - with grant certainty, you can take 4–6 weeks to compare installers and get BER assessments done properly",
          "Combined with falling costs - panel prices have dropped significantly, so your out-of-pocket cost is lower than ever",
          "Stack with CEG - the Clean Export Guarantee means you earn €0.21/kWh on top of bill savings, accelerating payback"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Grant History: How We Got Here"
      },
      {
        "type": "paragraph",
        "text": "Understanding the trajectory of the SEAI solar grant helps put the current €1,800 figure into context. When the scheme first launched, the grant was set at €2,400 - a very generous level designed to kickstart the residential solar market in Ireland. However, the grant was always intended to decrease over time as installation costs fell and the market matured."
      },
      {
        "type": "paragraph",
        "text": "The pattern is clear: the grant was originally designed to decrease by €300 per year until it reached a floor. However, two factors have intervened. First, the cost of solar installations has fallen faster than anticipated, making the grant represent a smaller percentage of total cost even at the same nominal value. Second, the government has recognised the importance of maintaining momentum towards its 2030 climate targets, which require significant growth in domestic solar generation."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Why Falling Panel Prices Make This Even Better"
      },
      {
        "type": "paragraph",
        "text": "While the headline grant figure of €1,800 is the same as it has been since 2022, the real-world value of that grant has actually increased. Solar panel prices in Ireland have fallen by approximately 20–30% since 2021, driven by manufacturing overcapacity in China, more efficient supply chains, and increased competition among Irish installers."
      },
      {
        "type": "paragraph",
        "text": "To put this in perspective: a 6kWp system that cost €14,000 in 2021 now costs approximately €9,500. The €1,800 grant represented 12.8% of the 2021 cost, but it represents nearly 19% of the 2026 cost. Combined with the fact that electricity prices have risen significantly over the same period, the financial case for solar in 2026 is stronger than at any point in the grant's history."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "What Could Happen in 2027?"
      },
      {
        "type": "paragraph",
        "text": "Looking ahead, the outlook for 2027 is less certain. The government has not made any commitments beyond 2026, and several factors could influence the grant level next year:"
      },
      {
        "type": "bulletList",
        "items": [
          "Budget pressures - government departments are under pressure to reduce spending across all areas",
          "Scheme maturity - with over 100,000 homes grant-aided, the argument for continued high grant levels weakens",
          "Political changes - a change of government or minister could lead to different priorities",
          "Energy price movements - if electricity prices fall significantly, the case for subsidising solar weakens"
        ]
      },
      {
        "type": "paragraph",
        "text": "That said, nobody predicted the grant would still be at €1,800 in 2026, so any predictions about 2027 should be taken with caution. The safest approach is to apply sooner rather than later. If you are considering solar, the current grant level is locked in for this year, and there is no guarantee it will remain at €1,800 beyond December 2026."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Our Advice",
        "body": "Don't wait for 2027. The €1,800 grant is confirmed for 2026, electricity prices are high, and panel costs are low. Every month you delay is a month of free electricity you are not generating. Start your solar journey today."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Claim Your €1,800 Grant - Get a Free Solar Quote",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "solar-panels-and-heat-pumps-perfect-partnership",
    "title": "Solar Panels and Heat Pumps: The Perfect Partnership",
    "image": "/blog/solar-panels-and-heat-pumps-perfect-partnership.webp",
    "excerpt": "Why combining solar PV with a heat pump is the most cost-effective heating solution for Irish homes - with up to €14,300 in combined SEAI grants available.",
    "category": "guides",
    "date": "20 Apr 2026",
    "readTime": "10 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-sky-400/10",
    "iconColor": "text-sky-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "Why Solar and Heat Pumps Work So Well Together"
      },
      {
        "type": "paragraph",
        "text": "If you are serious about reducing your home's energy bills and carbon footprint, combining solar PV panels with an air-source heat pump is the single most impactful upgrade you can make to an Irish home. The two technologies complement each other perfectly: solar panels generate free electricity during the day, and your heat pump uses that electricity to warm your home. The result? Dramatically lower heating costs, reduced dependence on fossil fuels, and a significantly improved BER rating."
      },
      {
        "type": "paragraph",
        "text": "The logic is simple. A heat pump replaces your oil boiler, gas boiler, or electric heating system and provides all of your space heating and hot water using electricity. The problem is that heat pumps use a significant amount of electricity - typically 3,000–5,000 kWh per year for an average Irish home. At current electricity prices of €0.35–€0.45/kWh, that translates to €1,050–€2,250 per year just for heating. This is where solar comes in: by generating free electricity during daylight hours, you can offset a substantial portion of your heat pump's running costs."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Key Statistic",
        "body": "A typical heat pump uses 4,000 kWh of electricity per year. If your solar system generates 3,500 kWh and covers even 50% of the heat pump's consumption, you could save approximately €840 per year on heating electricity alone."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How Heat Pumps Work"
      },
      {
        "type": "paragraph",
        "text": "An air-source heat pump works like a refrigerator in reverse. It extracts heat from the outside air - even in temperatures as low as -20°C - and transfers it into your home using a refrigeration cycle. For every 1 kWh of electricity it consumes, a heat pump typically produces 3–4 kWh of heat, giving it a Coefficient of Performance (COP) of 3–4. This makes it 300–400% efficient compared to direct electric heating, and significantly more efficient than oil or gas boilers."
      },
      {
        "type": "bulletList",
        "items": [
          "Air-source heat pumps are the most common type for Irish homes - they are cheaper to install than ground-source and do not require digging up your garden",
          "Typical installation cost: €12,000–€18,000 (including all pipework, radiators or underfloor heating modifications)",
          "Lifespan: 15–20 years for the heat pump unit, with periodic servicing required",
          "Suitable for most homes built after 1990 with reasonable insulation levels; older homes may need insulation upgrades first"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Right-Sizing Both Systems"
      },
      {
        "type": "paragraph",
        "text": "Getting the most out of a solar-plus-heat-pump system requires careful sizing of both components. The key principle is that your solar system should be sized to generate enough electricity during daylight hours to cover a meaningful portion of your heat pump's consumption, while also meeting your household's general electricity needs."
      },
      {
        "type": "paragraph",
        "text": "A typical Irish heat pump draws between 2kW and 4kW when running, depending on the outside temperature and your heating demand. During the heating season (October to March), the heat pump will run for many hours each day. In summer, it mainly provides hot water and runs far less frequently. Here is how the solar-heat pump interaction works across the seasons:"
      },
      {
        "type": "table",
        "headers": [
          "Season",
          "Heat Pump Demand",
          "Solar Generation (6kWp)",
          "Solar Coverage"
        ],
        "rows": [
          [
            "Summer (Jun–Aug)",
            "Low (hot water only)",
            "~1,400 kWh (2.5 months)",
            "80–100% covered"
          ],
          [
            "Spring/Autumn",
            "Moderate",
            "~1,100 kWh (3 months)",
            "40–60% covered"
          ],
          [
            "Winter (Dec–Feb)",
            "High",
            "~600 kWh (3 months)",
            "15–25% covered"
          ],
          [
            "Full Year Average",
            "~4,000 kWh total",
            "~3,500 kWh total",
            "~40–50% covered"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "As you can see, solar provides excellent coverage in summer when the heat pump barely runs, moderate coverage in spring and autumn, and limited coverage in winter when heating demand peaks. A battery storage system can help bridge the gap by storing excess summer generation for use in the evenings and winter months."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "SEAI Grants: Up to €14,300 Combined"
      },
      {
        "type": "paragraph",
        "text": "One of the most compelling reasons to install both systems together - or even in sequence - is the generous grant support available. The SEAI offers separate grants for heat pumps and solar PV, and they can be combined for up to €14,300 in government funding: up to €12,500 for an air-source heat pump (including the €4,000 renewable heat bonus paid after 12 months) plus €1,800 for solar PV."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Maximise Grant Value",
        "body": "Apply for both grants separately but plan your installations together. Many SEAI-registered installers offer combined solar-plus-heat-pump packages that streamline the process and ensure both systems are optimised to work together from day one."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Running Cost Comparison"
      },
      {
        "type": "paragraph",
        "text": "To truly appreciate the value of the solar-plus-heat-pump combination, it helps to compare running costs against other heating options. Here is a detailed comparison for a typical Irish home requiring 15,000 kWh of space heating and 3,000 kWh of hot water per year (18,000 kWh total heat demand):"
      },
      {
        "type": "table",
        "headers": [
          "Heating System",
          "Fuel Cost/kWh",
          "System Efficiency",
          "Annual Fuel Cost",
          "Annual Electricity Cost"
        ],
        "rows": [
          [
            "Oil Boiler",
            "€0.10/kWh",
            "85%",
            "€2,120",
            "N/A"
          ],
          [
            "Gas Boiler (mains)",
            "€0.08/kWh",
            "90%",
            "€1,600",
            "N/A"
          ],
          [
            "LPG Boiler",
            "€0.12/kWh",
            "85%",
            "€2,540",
            "N/A"
          ],
          [
            "Direct Electric",
            "€0.40/kWh",
            "100%",
            "N/A",
            "€7,200"
          ],
          [
            "Heat Pump (alone)",
            "€0.40/kWh",
            "350% (COP 3.5)",
            "N/A",
            "€2,060"
          ],
          [
            "Heat Pump + Solar",
            "€0.40/kWh",
            "350% (COP 3.5)",
            "N/A",
            "€1,220"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "The numbers speak for themselves. A heat pump alone cuts heating costs by approximately 50% compared to oil, and by 30% compared to mains gas. Adding solar PV to power the heat pump reduces costs by a further 40%, bringing the total annual heating electricity cost down to approximately €1,220. Compared to an oil boiler costing €2,120 per year, the solar-plus-heat-pump combination saves nearly €900 annually on heating alone - before counting general electricity savings from the solar panels."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "The Winter Challenge"
      },
      {
        "type": "paragraph",
        "text": "The biggest challenge for a solar-plus-heat-pump system is winter. From October through March, your heat pump is working hardest - but your solar panels are generating the least electricity. This creates a seasonal mismatch that can leave you drawing significantly more power from the grid during the months when heating costs are at their highest."
      },
      {
        "type": "paragraph",
        "text": "There are several strategies to manage this winter gap:"
      },
      {
        "type": "bulletList",
        "items": [
          "Battery storage - A 5–10kWh solar battery can store excess generation from autumn and spring for use during winter evenings. While it will not fully cover the winter heating demand, it can reduce grid dependence by 20–30%.",
          "Time-of-use tariffs - With a smart meter, you can sign up for tariffs that offer cheaper electricity at night. Charge your battery on cheap night-rate power and use it to run the heat pump during peak daytime hours.",
          "CEG credits - Excess solar exported in summer earns you €0.21/kWh, which helps offset your higher winter electricity bills.",
          "Insulation upgrades - Better insulation means your heat pump works less, reducing electricity demand in winter. Consider attic insulation, cavity wall insulation, and window upgrades."
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Install Both at Once or One at a Time?"
      },
      {
        "type": "paragraph",
        "text": "There is no single right answer - it depends on your budget, your current heating system, and your priorities. Here are the two main approaches:"
      },
      {
        "type": "numberedList",
        "items": [
          "Install both simultaneously - This is the most efficient approach. A combined installation means both systems are designed to work together from the start, your installer coordinates everything, and you get both grants in a single process. Total cost (after grants): €12,000–€20,000. Best if your current heating system is old and needs replacement anyway.",
          "Install solar first, add heat pump later - If your current boiler or heating system is still functional, you can install solar panels now and enjoy immediate electricity savings. The SEAI solar grant is guaranteed for 2026. Add the heat pump in a year or two when your current system fails or when you are ready for the investment. Total cost is spread over time, making it easier to manage."
        ]
      },
      {
        "type": "paragraph",
        "text": "Whichever approach you choose, the combination of solar PV and a heat pump delivers the lowest long-term energy costs of any heating solution available to Irish homeowners. With combined grants of up to €14,300, BER improvements of 2–3 ratings, and annual energy savings of €1,500–€2,000, it is an investment that pays for itself and then pays you back for decades."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Explore Solar + Heat Pump Packages - Get a Free Assessment",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "smart-meter-required-solar-panels-ireland",
    "title": "Is a Smart Meter Required for Solar Panels in Ireland?",
    "image": "/blog/smart-meter-required-solar-panels-ireland.webp",
    "excerpt": "A smart meter is essential if you want to earn money from your excess solar through the Clean Export Guarantee. Here is how to check if you have one and how to get one installed for free.",
    "category": "guides",
    "date": "14 Apr 2026",
    "readTime": "6 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-sky-400/10",
    "iconColor": "text-sky-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "The Short Answer: Yes, You Need a Smart Meter"
      },
      {
        "type": "paragraph",
        "text": "If you are planning to install solar panels and want to earn money from the electricity you export to the grid through the Clean Export Guarantee (CEG), you absolutely need a smart meter. Without one, your solar installer can still connect your system to the grid, but you will have no way to measure or get paid for the surplus electricity you send back. It is like having a shop but no till - you are giving away your product for free."
      },
      {
        "type": "paragraph",
        "text": "A smart meter is a digital electricity meter that replaces your old analogue or digital meter. It measures your electricity consumption and, crucially for solar customers, your electricity generation and export in real time. Unlike old meters, which could only measure the net flow of electricity, a smart meter tracks import and export separately, giving you and your energy supplier an accurate picture of your energy flows."
      },
      {
        "type": "callout",
        "variant": "warning",
        "title": "Apply Before Your Solar Installation",
        "body": "Without a smart meter, you cannot register for the Clean Export Guarantee. The installation process for a smart meter typically takes 4–8 weeks, so start this process well before your solar panel installation date. You do not want your panels sitting on your roof, generating free electricity for the grid, while you wait for a meter."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "ESB Networks Smart Meter Programme"
      },
      {
        "type": "paragraph",
        "text": "ESB Networks has been running the National Smart Metering Programme since 2019, with the goal of upgrading every home and small business in Ireland to a smart meter. The programme was originally targeted for completion by the end of 2024, and as of 2026, the vast majority of Irish homes have already been upgraded. However, there are still properties that have not yet received a smart meter, particularly in rural areas or newer housing developments."
      },
      {
        "type": "paragraph",
        "text": "The smart meter installation is completely free. ESB Networks covers all costs, including the meter itself and the installation labour. There is no standing charge increase or hidden fee - the smart meter simply replaces your existing meter and operates alongside your current electricity supply arrangement."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How to Check if You Already Have a Smart Meter"
      },
      {
        "type": "paragraph",
        "text": "Before requesting a smart meter, it is worth checking whether you already have one. Many homeowners do not realise they have been upgraded, as ESB Networks typically does the replacement without a prior appointment. Here are the ways to check:"
      },
      {
        "type": "numberedList",
        "items": [
          "Look at your meter - Smart meters have a digital display (sometimes with scrolling text) and typically display your consumption in kWh. They are usually white or grey rectangular boxes, larger than old analogue meters. If your meter has a spinning disc or small dials, it is not a smart meter.",
          "Check your electricity bill - Some suppliers include smart meter data on your bill, showing half-hourly or daily consumption patterns. If your bill includes this level of detail, you likely have a smart meter.",
          "Check online - Visit the ESB Networks website at esbnetworks.ie and use their \"Check My Meter\" tool. Enter your MPRN number (found on your electricity bill) to see your meter type.",
          "Call ESB Networks - Phone 01 698 5005 with your MPRN number and ask if your property has a smart meter installed."
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How to Request a Smart Meter"
      },
      {
        "type": "paragraph",
        "text": "If you have confirmed that you do not have a smart meter, requesting one is straightforward. The process is as follows:"
      },
      {
        "type": "numberedList",
        "items": [
          "Visit esbnetworks.ie/smartmeters and submit a smart meter request form, or call 01 698 5005.",
          "Provide your MPRN number and contact details. ESB Networks will schedule a survey of your meter location.",
          "An ESB Networks contractor will visit your property to assess the meter location and confirm installation requirements. This usually happens within 2–4 weeks of your request.",
          "The smart meter installation itself takes 1–2 hours. You may experience a brief power interruption (typically less than 30 minutes) during the swap.",
          "After installation, the meter is activated remotely. Your energy supplier is notified automatically.",
          "Within 1–2 billing cycles, your smart meter data will begin appearing on your electricity bill."
        ]
      },
      {
        "type": "paragraph",
        "text": "The total process from request to activation typically takes 4–8 weeks. We strongly recommend starting this process at least 2 months before your planned solar installation date to ensure everything is ready."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Half-Hourly Settlement"
      },
      {
        "type": "paragraph",
        "text": "One of the most important features of a smart meter for solar customers is half-hourly settlement. This means the meter records your electricity import and export every 30 minutes, 24 hours a day, 365 days a year. This granular data serves several critical functions:"
      },
      {
        "type": "bulletList",
        "items": [
          "CEG payments - Your energy supplier uses half-hourly data to calculate exactly how much electricity you exported, ensuring you are paid accurately for every unit",
          "Time-of-use tariffs - Smart meters enable tariffs that charge different rates at different times of day (cheaper at night, more expensive during peak evening hours)",
          "Demand response - Future energy schemes may reward you for shifting heavy electricity usage to times of high solar generation or low grid demand",
          "Monitoring - You can track your solar generation, self-consumption, and export patterns through your energy supplier's app or third-party monitoring platforms"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Time-of-Use Tariffs: A Hidden Benefit"
      },
      {
        "type": "paragraph",
        "text": "Smart meters unlock access to time-of-use (ToU) electricity tariffs, which charge different prices depending on the time of day. For solar panel owners, ToU tariffs offer a significant additional saving opportunity:"
      },
      {
        "type": "bulletList",
        "items": [
          "Day rate (8am–11pm): Standard electricity price, typically €0.35–€0.45/kWh - this is when your solar panels are generating and offsetting your usage",
          "Night rate (11pm–8am): Discounted price, typically €0.20–€0.25/kWh - perfect for charging EVs or solar batteries on cheap power",
          "Peak rate (5pm–7pm): Some tariffs charge a premium during the evening peak - with solar, you can avoid this by using stored battery power"
        ]
      },
      {
        "type": "paragraph",
        "text": "For households with an electric vehicle or a solar battery, a time-of-use tariff can save €300–€500 per year by shifting heavy charging to the cheap night-rate window. Without a smart meter, you cannot access these tariffs."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "The Full Process: Smart Meter to CEG Registration"
      },
      {
        "type": "paragraph",
        "text": "To help you visualise the complete journey from smart meter to earning CEG payments, here is the end-to-end process:"
      },
      {
        "type": "numberedList",
        "items": [
          "Request smart meter from ESB Networks (if you don't already have one)",
          "Smart meter installed and activated (4–8 weeks from request)",
          "Solar panels installed by SEAI-registered installer (1–2 days)",
          "Installer registers your system with ESB Networks as a microgeneration unit",
          "Contact your energy supplier to inform them of your solar installation",
          "Supplier switches your account to a CEG-inclusive tariff",
          "First CEG payment appears on your electricity bill (2–4 billing cycles after registration)"
        ]
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "Don't Worry - It Is Easier Than It Sounds",
        "body": "Most solar installers handle steps 4–6 on your behalf as part of their installation package. Your main responsibility is ensuring you have a smart meter before installation day. Everything else can typically be managed by your installer."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Check Your Smart Meter Status - Start Your Solar Journey",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "how-many-solar-panels-do-i-need-ireland",
    "title": "How Many Solar Panels Do I Need in Ireland?",
    "image": "/blog/how-many-solar-panels-do-i-need-ireland.webp",
    "excerpt": "A complete guide to sizing your solar system - from single-person apartments to large family homes. Includes a household size calculator, roof space guide, and budget-conscious strategies.",
    "category": "guides",
    "date": "2 Apr 2026",
    "readTime": "9 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-sky-400/10",
    "iconColor": "text-sky-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "The Most Important Number: Your Annual Electricity Usage"
      },
      {
        "type": "paragraph",
        "text": "Before we talk about panels, roof space, or budgets, there is one number that matters more than anything else: your annual electricity consumption in kilowatt-hours (kWh). This single figure, which you can find on your electricity bill (usually on the second page, labelled \"Annual Consumption\" or \"kWh Usage\"), determines the size of solar system you need and the savings you can expect."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Check Your Bill Now",
        "body": "Find your annual usage in kWh (usually on the second page of your electricity bill). This is the single most important number for sizing your solar system. A typical Irish household uses 4,200 kWh per year."
      },
      {
        "type": "paragraph",
        "text": "The typical Irish household consumes approximately 4,200 kWh of electricity per year. However, this average masks a wide range. A single person in a small apartment might use just 2,000 kWh, while a large family with electric heating, an EV, and all the usual appliances could easily exceed 7,000 kWh. Your system should be sized to match your actual consumption - not your neighbour's."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "System Sizing by Household Size"
      },
      {
        "type": "paragraph",
        "text": "While every home is different, household size is the strongest predictor of electricity consumption. Here is a detailed sizing guide based on the number of occupants and typical usage patterns in Ireland:"
      },
      {
        "type": "table",
        "headers": [
          "Household Size",
          "Annual Usage (kWh)",
          "Recommended System",
          "Number of Panels",
          "Est. Annual Generation"
        ],
        "rows": [
          [
            "1–2 people (low usage)",
            "2,500–3,500 kWh",
            "3–4 kWp",
            "8–10 panels",
            "2,700–3,600 kWh"
          ],
          [
            "1–2 people (medium usage)",
            "3,500–4,500 kWh",
            "4–5 kWp",
            "10–13 panels",
            "3,600–4,500 kWh"
          ],
          [
            "3–4 people",
            "4,000–5,000 kWh",
            "5–6 kWp",
            "13–16 panels",
            "4,500–5,400 kWh"
          ],
          [
            "5+ people",
            "5,000–6,500 kWh",
            "7–10 kWp",
            "18–26 panels",
            "6,300–9,000 kWh"
          ],
          [
            "EV + heat pump home",
            "7,000–10,000 kWh",
            "8–12 kWp",
            "20–32 panels",
            "7,200–10,800 kWh"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "These recommendations assume a south-facing roof at approximately 35° pitch, which is optimal for Irish conditions. If your roof faces east or west, you will need roughly 15–20% more panels to achieve the same annual generation. The recommended system sizes are designed to cover a significant portion of your annual usage while avoiding severe over-generation, which would mean exporting large amounts of electricity at the lower CEG rate rather than using it yourself."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Understanding kWp, Panels, and Generation"
      },
      {
        "type": "paragraph",
        "text": "Solar panel systems are measured in kilowatt-peak (kWp), which represents the maximum power output under standard test conditions. A modern residential solar panel typically has a capacity of 350–430 watts (0.35–0.43 kWp). To calculate the number of panels you need, divide your target system size by the individual panel wattage."
      },
      {
        "type": "bulletList",
        "items": [
          "A 400W panel is the most common choice for Irish residential installations in 2026",
          "A 4kWp system requires approximately 10 panels (10 × 400W = 4,000W = 4kWp)",
          "A 6kWp system requires approximately 15 panels (15 × 400W = 6,000W = 6kWp)",
          "Each panel measures approximately 1.7m tall by 1.0m wide, requiring about 1.7m² of roof space",
          "You should allow approximately 10cm gaps between panels for mounting rails and ventilation"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Roof Space Requirements"
      },
      {
        "type": "paragraph",
        "text": "Roof space is often the limiting factor for solar installations in Ireland, particularly on smaller homes or properties with dormer windows, chimneys, or rooflights. Here is a practical guide to the roof space you will need:"
      },
      {
        "type": "table",
        "headers": [
          "System Size",
          "Number of Panels",
          "Roof Space Needed (with gaps)",
          "Minimum Roof Dimensions"
        ],
        "rows": [
          [
            "3 kWp",
            "8 panels",
            "~15 m²",
            "4m × 4m clear area"
          ],
          [
            "4 kWp",
            "10 panels",
            "~19 m²",
            "5m × 4m clear area"
          ],
          [
            "6 kWp",
            "15 panels",
            "~28 m²",
            "7m × 4m clear area"
          ],
          [
            "8 kWp",
            "20 panels",
            "~38 m²",
            "10m × 4m clear area"
          ],
          [
            "10 kWp",
            "25 panels",
            "~47 m²",
            "12m × 4m clear area"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "These calculations include the 10cm gaps between panels and a small border around the array for mounting rails and edge clearance. If your roof has multiple planes (as most Irish homes do), you may be able to spread panels across two different roof faces - for example, some on the south-east and some on the south-west - which can work well and actually improve self-consumption by extending your generation window across more hours of the day."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "How Roof Orientation Affects Sizing"
      },
      {
        "type": "paragraph",
        "text": "The direction your roof faces has a significant impact on how much electricity your panels generate. A south-facing roof at 35° pitch is the gold standard in Ireland, but not every home has this luxury. Here is how different orientations affect your system sizing:"
      },
      {
        "type": "bulletList",
        "items": [
          "South-facing (180°) - Produces 100% of rated capacity. The optimal orientation in Ireland. You need fewer panels to hit your generation target.",
          "South-east or south-west (135° or 225°) - Produces 90–95% of rated capacity. Slightly fewer panels needed than east/west, and a broader generation window.",
          "East-facing (90°) - Produces 80–85% of rated capacity. Peaks in the morning. Good for morning usage patterns. Add 15–20% more panels to compensate.",
          "West-facing (270°) - Produces 80–85% of rated capacity. Peaks in the afternoon. Good for households that are out during the day. Add 15–20% more panels.",
          "North-facing (0°) - Produces 50–55% of rated capacity. Generally not recommended unless combined with a south-facing array. Requires nearly double the panels for the same output."
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Budget-Conscious Approach: Start Small, Expand Later"
      },
      {
        "type": "paragraph",
        "text": "If your budget does not stretch to your ideal system size right now, do not worry - solar systems are highly expandable. One of the most popular strategies among Irish homeowners is to start with a smaller system (typically 4kWp) and add more panels later as finances allow."
      },
      {
        "type": "paragraph",
        "text": "There are a few things to consider with this approach:"
      },
      {
        "type": "bulletList",
        "items": [
          "Inverter capacity - Your installer should fit an inverter that is oversized relative to your initial panel count, leaving room for expansion. For example, if you start with 10 panels (4kWp), a 6kW inverter would allow you to add up to 5 more panels later without replacing the inverter.",
          "Grant timing - The SEAI grant is per property, not per installation. If you claim the €1,800 grant for your initial system, you cannot claim it again when you expand. Factor the full grant into your initial installation.",
          "Roof planning - When designing your initial system, ask your installer to plan the mounting rails for the maximum potential array, even if only some positions are filled initially. This makes expansion much cheaper later.",
          "Cost of expansion - Adding panels to an existing system typically costs €300–€500 per panel (less than the initial installation cost because the inverter, scaffolding, and electrical infrastructure are already in place)."
        ]
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "Use Our Quick Savings Calculator",
        "body": "Want a personalised estimate based on your actual electricity usage and roof characteristics? Our Quick Savings Calculator on the homepage provides tailored system size recommendations, cost estimates, and projected savings - all in under 60 seconds."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Key Takeaways"
      },
      {
        "type": "numberedList",
        "items": [
          "Start with your annual electricity usage (find it on your electricity bill) - this is the most important factor",
          "A 3–4kWp system suits 1–2 person homes, a 5–6kWp system suits 3–4 person homes, and a 7–10kWp system suits larger families or homes with EVs and heat pumps",
          "Each panel requires approximately 1.7m² of roof space plus gaps - measure your available roof area before getting quotes",
          "South-facing roofs are optimal, but east and west-facing roofs are still highly viable (80–85% output)",
          "If budget is tight, start with 4kWp and expand later - just ensure your inverter and mounting rails are sized for future expansion",
          "Use our Quick Savings Calculator for a personalised system size recommendation"
        ]
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Calculate Your Ideal System Size - Free Solar Assessment",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "best-time-of-year-to-get-solar-panels-ireland",
    "title": "Best Time of Year to Get Solar Panels in Ireland",
    "image": "/blog/best-time-of-year-to-get-solar-panels-ireland.webp",
    "excerpt": "Is there an ideal season to install solar panels? We break down month-by-month generation data, seasonal advantages, and SEAI processing times to help you decide when to go solar.",
    "category": "savings",
    "date": "25 Mar 2026",
    "readTime": "7 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-emerald-400/10",
    "iconColor": "text-emerald-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "Spoiler: Any Time Is a Good Time"
      },
      {
        "type": "paragraph",
        "text": "Let us start with the most important point: there is no bad time to install solar panels in Ireland. Every month you have panels on your roof is a month of free electricity you are generating. The question is not whether to wait - it is whether there are strategic advantages to certain seasons that maximise your first-year returns. And the answer is yes, there are."
      },
      {
        "type": "paragraph",
        "text": "The main factor to consider is this: solar generation in Ireland varies enormously by season. A 4kWp south-facing system will generate roughly 380 kWh in June but only 70 kWh in December - a five-fold difference. If you install in spring, you immediately start capturing the highest-generation months and maximise your first-year savings. Install in December, and your first few months of generation will be relatively modest."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "Timing Matters",
        "body": "Installing in March versus December means an extra ~1,500 kWh in your first year - worth roughly €400 to €500 depending on how much you self-consume. That is the equivalent of 3–4 months of free electricity just from choosing the right installation month."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Month-by-Month Generation Data"
      },
      {
        "type": "paragraph",
        "text": "To understand the seasonal impact, here is the actual month-by-month generation data for a typical 4kWp south-facing solar PV system in Ireland. These figures are typical modelled yields for a south-facing 4kWp system in Ireland (roughly 850 kWh per kWp per year):"
      },
      {
        "type": "table",
        "headers": [
          "Month",
          "Expected Generation (kWh)",
          "% of Annual Total",
          "Daily Average (kWh)"
        ],
        "rows": [
          [
            "January",
            "80 kWh",
            "2.6%",
            "2.6"
          ],
          [
            "February",
            "120 kWh",
            "3.9%",
            "4.3"
          ],
          [
            "March",
            "200 kWh",
            "6.6%",
            "6.5"
          ],
          [
            "April",
            "300 kWh",
            "9.9%",
            "10.0"
          ],
          [
            "May",
            "370 kWh",
            "12.2%",
            "11.9"
          ],
          [
            "June",
            "380 kWh",
            "12.5%",
            "12.7"
          ],
          [
            "July",
            "380 kWh",
            "12.5%",
            "12.3"
          ],
          [
            "August",
            "350 kWh",
            "11.6%",
            "11.3"
          ],
          [
            "September",
            "260 kWh",
            "8.6%",
            "8.7"
          ],
          [
            "October",
            "170 kWh",
            "5.6%",
            "5.5"
          ],
          [
            "November",
            "100 kWh",
            "3.3%",
            "3.3"
          ],
          [
            "December",
            "70 kWh",
            "2.3%",
            "2.3"
          ],
          [
            "Annual Total",
            "2,780 kWh",
            "100%",
            "7.6"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "The data tells a clear story. From April through September, Ireland receives 80% of its annual solar irradiation in just six months. October through March accounts for the remaining 20%. This is the fundamental reason why spring installation is optimal - you capture the entire high-generation season from day one."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Season-by-Season Analysis"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Spring (March–May): The Best Season"
      },
      {
        "type": "paragraph",
        "text": "Spring is widely considered the best time to install solar panels in Ireland, and for good reason. Your SEAI grant offer normally issues immediately when you apply online; allow a few weeks for installer scheduling and ESB Networks processing, meaning if you apply in February or early March, your system will be installed and generating by April - just as the generation curve begins its steep upward climb. By installing in spring, you capture the entire April-to-September high-generation window in your first year."
      },
      {
        "type": "bulletList",
        "items": [
          "Days are getting longer - your generation increases every week",
          "Weather is typically mild - good conditions for installation (scaffolding, roof work)",
          "Installers are moderately busy - lead times of 2–4 weeks are common, not the 6–8 weeks of peak summer",
          "Maximum first-year generation - you capture nearly all of the high-output months"
        ]
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Summer (June–August): Immediate High Output"
      },
      {
        "type": "paragraph",
        "text": "Summer installation means your panels start generating at their maximum potential from day one. This is psychologically satisfying - you can see your inverter hitting its peak output within hours of being switched on. However, there are some trade-offs:"
      },
      {
        "type": "bulletList",
        "items": [
          "Installers are at their busiest - lead times can stretch to 6–8 weeks, and you may pay a slight premium",
          "You miss the March–May generation window - this costs you approximately 870 kWh of potential first-year generation",
          "Scaffold work in hot weather can be slower - roof surface temperatures can reach 50°C+ on sunny days",
          "Despite these drawbacks, summer generation is excellent and your system will be fully productive immediately"
        ]
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Autumn (September–November): Still Worthwhile"
      },
      {
        "type": "paragraph",
        "text": "Autumn is a pragmatic time to install solar panels. Generation is declining but still meaningful - September alone produces 260 kWh from a 4kWp system, more than December and January combined. Installer availability improves as the summer rush subsides, and you may be able to negotiate slightly better pricing."
      },
      {
        "type": "paragraph",
        "text": "The main disadvantage is that you miss the entire summer peak. However, the SEAI grant does not expire at the end of the year, and panels generate electricity in every month. An autumn installation means you start collecting savings immediately rather than waiting until the following spring."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Winter (December–February): Not Ideal, But Not Wrong"
      },
      {
        "type": "paragraph",
        "text": "Winter is the least popular time for solar installation, and the reasons are understandable: short days, poor weather, and low generation. However, it is not as bad as many people assume:"
      },
      {
        "type": "bulletList",
        "items": [
          "Installers are least busy - shortest lead times (1–2 weeks) and potential for discounted pricing",
          "Panels still generate - even in December, a 4kWp system produces approximately 70 kWh, enough to offset a portion of your higher winter electricity bills",
          "The SEAI grant process continues year-round - there is no seasonal suspension of grant applications",
          "Installation conditions - while weather can delay installation, most installers work year-round and monitor forecasts to schedule work on dry days"
        ]
      },
      {
        "type": "paragraph",
        "text": "If you install in January, by the time your system is fully operational (factoring in 4–6 weeks for grant approval and scheduling), it will be late February or early March - just as generation begins to climb. The \"lost\" generation from January and February is relatively small (approximately 200 kWh combined)."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "SEAI Processing Times"
      },
      {
        "type": "paragraph",
        "text": "The SEAI grant application process typically takes 4–6 weeks from submission to receiving your grant offer letter. After installation, you need a further 1–2 weeks to gather completion documents, and then 6–8 weeks for the grant payment to be processed. Here is the full timeline:"
      },
      {
        "type": "table",
        "headers": [
          "Step",
          "Duration",
          "Cumulative Time"
        ],
        "rows": [
          [
            "Get quotes and choose installer",
            "2–3 weeks",
            "2–3 weeks"
          ],
          [
            "Apply for SEAI grant",
            "4–6 weeks",
            "6–9 weeks"
          ],
          [
            "Schedule installation",
            "2–4 weeks",
            "8–13 weeks"
          ],
          [
            "Installation day",
            "1–2 days",
            "~13 weeks"
          ],
          [
            "Submit completion documents",
            "1–2 weeks",
            "~15 weeks"
          ],
          [
            "Receive grant payment",
            "6–8 weeks",
            "~21 weeks (5 months)"
          ]
        ]
      },
      {
        "type": "paragraph",
        "text": "This means that if you start the process in early February, you could have your panels installed and generating by late April, with the grant payment arriving by early July. The total end-to-end timeline is approximately 5 months, which is why starting early in the year is so advantageous."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "The Cost of Waiting"
      },
      {
        "type": "paragraph",
        "text": "Every month you delay installing solar panels is a month of free electricity you are not getting. With the average Irish household paying approximately €0.40/kWh for electricity, even a modest winter month of 100 kWh generation would save you €40. Over a full year of waiting, that is €1,400 in savings you have permanently lost - not borrowed, but lost forever."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Stop Waiting, Start Saving",
        "body": "The best time to install solar panels was last year. The second best time is today. Whatever month it is, starting the process now means your system will be generating sooner. Every day of delay is a day of missed savings."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Start Your Solar Journey Today - Get a Free Quote",
        "href": "/#calculator"
      }
    ]
  },
  {
    "slug": "solar-panels-rental-property-landlord-guide",
    "title": "Solar Panels for Rental Properties: A Landlord's Guide",
    "image": "/blog/solar-panels-rental-property-landlord-guide.webp",
    "excerpt": "Yes, private landlords can claim the €1,800 SEAI solar grant. What to know about solar on Irish rental properties - eligibility, BER benefits and getting started.",
    "category": "grants",
    "date": "15 Mar 2026",
    "readTime": "8 min read",
    "author": "Cal O'Reilly",
    "iconBg": "bg-amber-400/10",
    "iconColor": "text-amber-400",
    "content": [
      {
        "type": "heading",
        "level": 2,
        "text": "Can Landlords Get the SEAI Solar Grant?"
      },
      {
        "type": "paragraph",
        "text": "This is one of the most frequently asked questions we receive from property investors, and the answer depends on your specific situation. The SEAI solar PV grant is designed for homeowner-occupiers - people who live in the property as their principal private residence. This means:"
      },
      {
        "type": "bulletList",
        "items": [
          "Yes - if you live in the property as your main home and install solar panels on it, you are eligible for the full €1,800 grant, regardless of whether you rent out individual rooms under the Rent a Room scheme",
          "Yes - private landlords can claim the €1,800 SEAI solar grant on rental homes built and occupied before 2021 (seai.ie 'Supports for landlords')",
          "No - holiday homes and second homes are also not eligible, as the grant is restricted to your principal private residence"
        ]
      },
      {
        "type": "paragraph",
        "text": "The eligibility criteria are clear: the SEAI grant is open to owner-occupiers and private landlords. If you own multiple properties, you can claim the grant for the one you live in, but not for any rental properties. This is a source of frustration for many landlords who would like to improve the energy efficiency of their rental stock, but it is the current state of the scheme."
      },
      {
        "type": "callout",
        "variant": "info",
        "title": "Rent-a-Room Exemption",
        "body": "If you live in the property as your main home and rent out a room (or rooms) under the Rent a Room Scheme, you ARE eligible for the full €1,800 SEAI solar grant. The key test is whether the property is your principal private residence, not whether you have tenants."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Alternatives for Landlords"
      },
      {
        "type": "paragraph",
        "text": "While the domestic SEAI grant is not available for buy-to-let properties, there are alternative incentives and financial mechanisms that landlords can explore:"
      },
      {
        "type": "heading",
        "level": 3,
        "text": "the Accelerated Capital Allowance (ACA)"
      },
      {
        "type": "paragraph",
        "text": "For landlords who own commercial properties or mixed-use buildings, the Accelerated Capital Allowance (ACA) lets you write off the full cost of qualifying energy-efficient equipment - including solar panels - against your taxable profits in the year of purchase. This can significantly reduce the effective cost of installation. ECAs are administered by the Sustainable Energy Authority of Ireland (SEAI) on behalf of the Revenue Commissioners."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Non-Domestic Microgen Scheme"
      },
      {
        "type": "paragraph",
        "text": "The SEAI operates a separate Non-Domestic Microgen Scheme for small-scale renewable energy installations on commercial and non-domestic properties. While primarily aimed at businesses, this scheme can be relevant for landlords of small commercial premises, offices, or mixed-use properties. The scheme supports solar PV systems up to 1,000 kWp (seai.ie) and includes assistance with grid connection and registration."
      },
      {
        "type": "heading",
        "level": 3,
        "text": "Tax Relief on Home Energy Upgrades"
      },
      {
        "type": "paragraph",
        "text": "While not specific to solar, landlords can claim tax relief on certain home energy upgrade expenditures as revenue expenses against rental income. The rules around what qualifies as a repair (revenue expense, deductible) versus an improvement (capital expense, not deductible) are complex, so always consult a tax professional before claiming. However, some solar-related electrical work may qualify as allowable expenses."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Benefits of Solar for Tenants"
      },
      {
        "type": "paragraph",
        "text": "Even without grant eligibility, installing solar panels on a rental property can deliver significant benefits - both for the landlord and the tenant. While the landlord bears the upfront cost, the advantages can be substantial:"
      },
      {
        "type": "bulletList",
        "items": [
          "Lower electricity bills - tenants benefit directly from free solar electricity during the day, reducing their energy costs by €600–€1,200 per year depending on system size",
          "More attractive property - homes with solar panels are increasingly sought after by environmentally conscious tenants and those looking to reduce living costs",
          "Longer tenancies - tenants who benefit from lower energy bills are more likely to stay longer, reducing void periods and turnover costs for the landlord",
          "Future-proofing - as energy regulations tighten, properties with solar panels will be better positioned to meet minimum energy efficiency standards"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "BER Rating Improvements"
      },
      {
        "type": "paragraph",
        "text": "One of the most compelling reasons for landlords to install solar panels on rental properties is the impact on the Building Energy Rating (BER). A better BER rating makes the property more attractive to tenants, may be required by future regulations, and can justify higher rents."
      },
      {
        "type": "paragraph",
        "text": "Solar PV installations typically improve a property's BER rating by 1–2 grades. For example, a D1-rated property could move to a C2 or C3 rating with a well-sized solar PV system. The exact improvement depends on the existing energy performance of the property, the size of the solar installation, and whether other energy efficiency measures are also implemented."
      },
      {
        "type": "callout",
        "variant": "stat",
        "title": "BER and Tenant Demand",
        "body": "A better BER makes a rental more attractive to tenants and future-proofs it against tightening minimum-standard rules. Solar panels are one of the most cost-effective ways to achieve this improvement."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Rent Premium Potential"
      },
      {
        "type": "paragraph",
        "text": "Irish rental market data increasingly shows that energy-efficient properties with solar panels command a measurable rent premium. Tenants are willing to pay more for homes with lower energy bills, particularly in a market where electricity costs have risen significantly in recent years."
      },
      {
        "type": "paragraph",
        "text": "Based on current market data from Daft.ie and the Residential Tenancies Board:"
      },
      {
        "type": "bulletList",
        "items": [
          "Solar can make a rental more attractive to tenants and cut their running costs, depending on the location and system size",
          "Over a year, this represents €600–€1,200 in additional rental income",
          "Combined with the tenant's electricity savings of €600–€1,200 per year, the total value proposition of solar is €1,200–€2,400 per year",
          "For a 6kWp system costing approximately €9,500 (no grant), this means a payback period of 5–8 years purely from the rent premium - before counting any other benefits"
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Practical Considerations for Landlords"
      },
      {
        "type": "paragraph",
        "text": "If you are considering installing solar panels on a rental property, here are the practical factors to keep in mind:"
      },
      {
        "type": "numberedList",
        "items": [
          "Installation access - You will need to coordinate with your tenant for scaffolding erection, installation day access (typically 1–2 days), and any necessary power shutdowns. Most installations require the electricity to be off for 1–2 hours.",
          "Ownership and maintenance - The solar system is your property as the landlord, and you are responsible for its maintenance. Include clauses in the tenancy agreement regarding access for maintenance and any obligations on the tenant (e.g., not installing anything that shades the panels).",
          "Insurance - Inform your landlord insurance provider that you have installed solar panels. Most policies will cover solar PV systems, but you need to ensure the system's value is included in your buildings cover.",
          "Tenant electricity arrangements - If the property has a single electricity meter, the tenant benefits directly from the solar generation (lower bills). If the property has sub-metered units (e.g., a house split into flats), the arrangement needs to be clearly defined in the tenancy agreement.",
          "CEG payments - If the tenant has their own electricity account and smart meter, they will receive the CEG export payments. If the electricity is included in the rent, the landlord effectively benefits. Clarify this in your tenancy agreement."
        ]
      },
      {
        "type": "heading",
        "level": 2,
        "text": "2026 Developments: Grants for Rental Properties?"
      },
      {
        "type": "paragraph",
        "text": "There is growing political pressure to extend SEAI grant eligibility to rental properties. The government's Climate Action Plan recognises that the rental sector represents a significant proportion of Ireland's housing stock and that achieving national energy efficiency targets will require upgrades across all property types, not just owner-occupied homes."
      },
      {
        "type": "callout",
        "variant": "tip",
        "title": "Stay Informed",
        "body": "The policy landscape for rental property energy upgrades is evolving rapidly. We recommend checking the SEAI website regularly or subscribing to their newsletter for the latest grant announcements. If a rental property grant scheme is introduced, it is likely to be announced as part of a budget or climate action update."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "Is It Worth It Without the Grant?"
      },
      {
        "type": "paragraph",
        "text": "Even without the €1,800 SEAI grant, installing solar panels on a rental property can be a sound investment. A 6kWp system costs approximately €9,500 (without grant) and generates roughly €1,000–€1,400 per year in combined electricity savings and CEG payments. If the property commands a rent premium of €75/month (€900/year), the total annual benefit is approximately €1,900–€2,300, giving a payback period of 4–5 years. Over 25 years, the net profit could exceed €30,000."
      },
      {
        "type": "paragraph",
        "text": "For landlords looking to differentiate their properties in a competitive rental market, improve tenant retention, and future-proof their investments against tightening energy regulations, solar panels are a practical and financially attractive option - grant or no grant."
      },
      {
        "type": "divider"
      },
      {
        "type": "cta",
        "text": "Explore Solar Options for Your Property - Get Expert Advice",
        "href": "/#calculator"
      }
    ]
  }
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(currentSlug: string, limit: number = 3): Article[] {
  const current = getArticleBySlug(currentSlug);
  if (!current) return articles.slice(0, limit);

  const sameCategory = articles.filter(
    (a) => a.category === current.category && a.slug !== currentSlug
  );

  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const others = articles.filter(
    (a) => a.slug !== currentSlug && !sameCategory.includes(a)
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getAllArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}
