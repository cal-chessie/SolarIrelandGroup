/* ═══════════════════════════════════════════════════════════════
   BLOG ARTICLE DATA — Solar Ireland
   Shared between /blog listing and /blog/[slug] individual pages.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Content Section Types ─── */
export type ContentSection =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'callout'; variant: 'tip' | 'warning' | 'info' | 'stat'; title: string; body: string }
  | { type: 'bulletList'; items: string[] }
  | { type: 'numberedList'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'divider' }
  | { type: 'cta'; text: string; href: string };

/* ─── Article Interface ─── */
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
  content: ContentSection[];
}

/* ═══════════════════════════════════════════════════════════════
   ALL 9 ARTICLES
   ═══════════════════════════════════════════════════════════════ */
export const articles: Article[] = [
  /* ─────────────────────────────────────────────
     1. SEAI Grant Guide (Featured)
     ───────────────────────────────────────────── */
  {
    slug: 'complete-guide-seai-solar-grant-2026',
    title: 'The Complete Guide to the SEAI Solar Grant in 2026',
    excerpt:
      'Everything you need to know about the €1,800 SEAI solar panel grant — eligibility, how to apply, timelines, and how to maximise your savings with the Clean Export Guarantee.',
    category: 'grants',
    date: '15 Apr 2026',
    readTime: '12 min read',
    featured: true,
    author: 'Cal O\'Reilly',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
    content: [
      { type: 'heading', level: 2, text: 'What Is the SEAI Solar Panel Grant?' },
      { type: 'paragraph', text: 'The Sustainable Energy Authority of Ireland (SEAI) offers a government-backed grant to help homeowners offset the cost of installing solar photovoltaic (PV) panels. In 2026, the grant remains one of the most generous incentives available to Irish households looking to reduce their electricity bills and carbon footprint. The current grant amount stands at €1,800 for a typical domestic solar PV installation, making solar power more accessible than ever before.' },
      { type: 'paragraph', text: 'The grant is part of Ireland\'s broader National Development Plan, which aims to have 70% of electricity generated from renewable sources by 2030. Solar PV is a cornerstone of this strategy, and the SEAI grant is designed to accelerate adoption across the country. Since the scheme launched, tens of thousands of Irish homeowners have successfully applied and received funding for their solar installations.' },
      { type: 'callout', variant: 'stat', title: 'Key Statistic', body: 'Over 65,000 Irish homes have received the SEAI solar grant since its inception, with uptake accelerating by 40% year-on-year since 2024.' },
      { type: 'heading', level: 2, text: 'Who Is Eligible for the Grant?' },
      { type: 'paragraph', text: 'The SEAI solar grant is available to a wide range of homeowners across Ireland. Understanding the eligibility criteria before you apply can save time and avoid disappointment. Here are the main requirements you need to meet:' },
      { type: 'bulletList', items: [
        'The property must be built before 2021 (new builds completed after this date are not eligible)',
        'You must be the owner of the property, or have permission from the owner to install solar panels',
        'The home must be your primary residence (not a holiday home or rental property)',
        'The property must be located in the Republic of Ireland',
        'Your chosen installer must be a registered SEAI contractor',
        'You must not have previously received a solar PV grant for the same property',
      ]},
      { type: 'paragraph', text: 'There is no means testing for this grant — it is available regardless of your income level. Whether you own a detached house in Dublin, a semi-detached home in Cork, or a bungalow in rural Donegal, you can apply provided you meet the criteria above.' },
      { type: 'heading', level: 2, text: 'How Much Is the Grant Worth?' },
      { type: 'paragraph', text: 'The standard SEAI solar PV grant in 2026 provides €1,800 towards the cost of your installation. This is a flat-rate grant for a typical domestic system. The grant can be combined with the battery storage grant of up to €600 if you choose to add a battery to your system, bringing the maximum total to €2,400.' },
      { type: 'table', headers: ['System Component', 'Grant Amount', 'Typical Cost', 'Grant Coverage'], rows: [
        ['Solar PV Panels (standard)', '€1,800', '€6,000 – €16,000', '11% – 30%'],
        ['Battery Storage (up to 6kWh)', '€600', '€4,000 – €8,000', '7.5% – 15%'],
        ['Solar PV + Battery Combined', 'Up to €2,400', '€10,000 – €24,000', '10% – 24%'],
      ]},
      { type: 'callout', variant: 'tip', title: 'Maximise Your Savings', body: 'The SEAI grant can be stacked with the Clean Export Guarantee (CEG), which pays you €0.21/kWh for excess solar energy exported to the grid. Between the grant, bill savings, and CEG earnings, a typical system can pay for itself in 5–7 years.' },
      { type: 'heading', level: 2, text: 'The BER Requirement' },
      { type: 'paragraph', text: 'One of the most common stumbling blocks in the application process is the Building Energy Rating (BER) requirement. Since 2023, all grant applicants must have a valid BER assessment either completed before the installation or booked to be carried out within a specified timeframe afterwards.' },
      { type: 'paragraph', text: 'A BER assessment typically costs between €200 and €350 and provides a rating from A (most efficient) to G (least efficient). The good news is that you do not need to achieve a particular BER rating to qualify for the solar grant — you simply need to have one carried out. In fact, installing solar panels will often improve your BER rating by 1–2 grades, which adds value to your property.' },
      { type: 'callout', variant: 'warning', title: 'Important BER Note', body: 'If you plan to get your BER done after installation, you must provide the SEAI with evidence that a BER assessor has been booked before your grant application can be fully processed. Many installers can arrange this for you as part of the package.' },
      { type: 'heading', level: 2, text: 'Step-by-Step Application Process' },
      { type: 'paragraph', text: 'Applying for the SEAI solar grant is straightforward, but following the correct sequence is important. Here is the process from start to finish:' },
      { type: 'numberedList', items: [
        'Get quotes from at least 3 SEAI-registered installers. Compare prices, panel brands, warranties, and inverter options.',
        'Choose your installer and agree on a date for the installation. Do not begin installation before getting grant pre-approval.',
        'Apply online through the SEAI portal (seai.ie). You will need your MPRN number (found on your electricity bill), property details, and your chosen installer\'s SEAI registration number.',
        'Receive your grant offer letter from the SEAI, typically within 4–6 weeks. Review and accept the terms.',
        'Proceed with the solar panel installation. Your installer must complete the work within 8 months of the grant offer date.',
        'After installation, submit your completion documents to the SEAI — this includes the installer\'s completion certificate, photos of the installation, and your BER assessment.',
        'Receive your grant payment via bank transfer, usually within 6–8 weeks of submitting completion documents.',
      ]},
      { type: 'heading', level: 2, text: 'Common Mistakes to Avoid' },
      { type: 'paragraph', text: 'Every year, a significant number of grant applications are delayed or rejected due to easily preventable errors. Here are the most common mistakes we see:' },
      { type: 'bulletList', items: [
        'Starting installation before receiving grant pre-approval — this can invalidate your entire claim',
        'Using an installer who is not SEAI-registered — always verify registration on the SEAI website',
        'Not having a BER assessment completed or booked within the required timeframe',
        'Submitting incomplete documentation — ensure all photos, certificates, and forms are included',
        'Missing the 8-month installation deadline after receiving the grant offer',
        'Applying for the wrong grant category — the solar PV grant is separate from the solar water heating grant',
      ]},
      { type: 'callout', variant: 'info', title: 'Time-Saving Tip', body: 'Many SEAI-registered installers will handle the entire grant application process on your behalf, including the BER booking. Ask about this when getting quotes — it can save you significant admin time and ensure nothing gets missed.' },
      { type: 'heading', level: 2, text: '2026 Timelines and Budget' },
      { type: 'paragraph', text: 'The SEAI solar grant scheme has an annual budget allocated by the government. In recent years, the budget has increased to meet growing demand, but it is still subject to annual review. The 2026 allocation is expected to be €85 million, which should comfortably cover all applications received during the year.' },
      { type: 'paragraph', text: 'However, it is worth applying early in the year rather than waiting. The application process takes approximately 4–6 weeks for pre-approval, plus 6–8 weeks for payment after completion. Starting your journey in spring means you can have your system installed and generating electricity by summer — when solar output in Ireland is at its peak.' },
      { type: 'table', headers: ['Timeline Stage', 'Typical Duration', 'What Happens'], rows: [
        ['Get Quotes', '2–4 weeks', 'Contact installers, compare quotes, choose installer'],
        ['Grant Application', '4–6 weeks', 'SEAI reviews and issues offer letter'],
        ['Installation', '1–2 days', 'Physical installation on your property'],
        ['BER Assessment', '1–2 weeks', 'Energy rating assessment (if not pre-done)'],
        ['Completion Submission', '1–2 weeks', 'Gather and submit all required documents'],
        ['Grant Payment', '6–8 weeks', 'SEAI processes and pays into your bank'],
      ]},
      { type: 'heading', level: 2, text: 'How to Maximise Your Total Savings' },
      { type: 'paragraph', text: 'The SEAI grant is just the beginning of your savings journey. Here is how to get the absolute maximum financial return from going solar:' },
      { type: 'numberedList', items: [
        'Combine the grant with the Clean Export Guarantee — earn €0.21/kWh for every unit of surplus energy you export to the grid. This alone can add €300–€500 per year to your income.',
        'Shift heavy electricity usage to daylight hours — run washing machines, dishwashers, and charge EVs while your panels are generating.',
        'Consider adding battery storage — while it adds upfront cost, a battery lets you use almost 100% of your generated electricity rather than exporting the excess.',
        'Ensure your system is sized correctly — an oversized system wastes money, while an undersized one leaves savings on the table.',
        'Maintain your panels — occasional cleaning (rain does most of the work in Ireland) and periodic inverter checks will keep output optimal for 25+ years.',
      ]},
      { type: 'paragraph', text: 'For a typical Irish household with a 6kWp solar PV system, the combination of bill savings (€800–€1,200/year), CEG earnings (€300–€500/year), and the €1,800 SEAI grant can deliver a full return on investment within 5 to 7 years. After that, every kilowatt-hour generated is essentially free electricity for the remaining 20+ year lifespan of your panels.' },
      { type: 'divider' },
      { type: 'cta', text: 'Check Your Solar Eligibility — Get a Free Quote', href: '/#calculator' },
    ],
  },

  /* ─────────────────────────────────────────────
     2. Solar Panel Costs
     ───────────────────────────────────────────── */
  {
    slug: 'how-much-do-solar-panels-cost-ireland-2026',
    title: 'How Much Do Solar Panels Cost in Ireland? (2026 Prices)',
    excerpt:
      'A transparent breakdown of solar panel costs in Ireland for 2026 — from 4kWp to 10kWp systems, including installation, grants, and what affects the final price.',
    category: 'savings',
    date: '12 Apr 2026',
    readTime: '8 min read',
    author: 'Cal O\'Reilly',
    iconBg: 'bg-emerald-400/10',
    iconColor: 'text-emerald-400',
    content: [
      { type: 'heading', level: 2, text: 'Average Solar Panel Costs in Ireland (2026)' },
      { type: 'paragraph', text: 'One of the first questions every Irish homeowner asks when considering solar is: "How much will it actually cost?" The answer depends on several factors, but we believe in complete transparency. Below is a comprehensive breakdown of current solar panel prices in Ireland for 2026, including installation, the SEAI grant, and the real factors that affect your final out-of-pocket cost.' },
      { type: 'paragraph', text: 'The Irish solar market has matured significantly over the past few years. Increased competition, improvements in panel efficiency, and streamlined installation processes have all contributed to a steady decline in prices. A standard residential solar PV system now costs roughly 20–30% less than it did just five years ago.' },
      { type: 'callout', variant: 'stat', title: 'Price Range Overview', body: 'The average cost of a solar panel system in Ireland in 2026 ranges from €6,000 for a small 4kWp system to €16,000 for a large 10kWp system with battery storage. After the €1,800 SEAI grant, your net cost drops to between €4,200 and €14,200.' },
      { type: 'heading', level: 2, text: 'Cost Breakdown by System Size' },
      { type: 'paragraph', text: 'Solar panel systems are measured in kilowatt-peak (kWp), which represents the maximum power output under ideal conditions. The right system size depends on your roof space, electricity consumption, and budget. Here is a detailed breakdown of costs for the three most popular system sizes in Ireland:' },
      { type: 'table', headers: ['System Size', 'Number of Panels', 'Gross Cost (Before Grant)', 'After €1,800 Grant', 'Typical Annual Savings'], rows: [
        ['4kWp', '10–12 panels', '€6,000 – €8,000', '€4,200 – €6,200', '€600 – €900'],
        ['6kWp', '14–16 panels', '€8,500 – €11,000', '€6,700 – €9,200', '€800 – €1,200'],
        ['10kWp', '22–26 panels', '€12,000 – €16,000', '€10,200 – €14,200', '€1,200 – €1,800'],
      ]},
      { type: 'paragraph', text: 'The 6kWp system is by far the most popular choice for Irish households, as it provides an excellent balance between upfront cost, roof space requirements, and annual savings. It is large enough to cover a significant portion of the average Irish household\'s annual electricity consumption (approximately 4,200 kWh) while remaining affordable.' },
      { type: 'heading', level: 2, text: 'What Affects the Price?' },
      { type: 'paragraph', text: 'No two solar installations are exactly alike. Several factors influence the final price you will pay, and understanding them helps you evaluate quotes fairly:' },
      { type: 'bulletList', items: [
        'Panel quality and brand — Tier-1 panels (LONGi, Jinko, Trina) cost more than lesser-known brands but offer higher efficiency, better warranties, and proven long-term performance',
        'Inverter type — String inverters are cheapest, microinverters cost more but offer panel-level optimisation (ideal for partially shaded roofs)',
        'Roof complexity — A simple pitched roof with clear access is cheapest to install. Multiple roof planes, flat roofs, or difficult access add €500–€2,000',
        'Scaffold requirements — Most installations require scaffolding, which typically costs €300–€600 extra for two-storey homes',
        'Electrical upgrades — Older homes may need a consumer unit (fuse board) upgrade or new cabling, adding €300–€1,000',
        'Battery storage — Adding a solar battery adds €4,000–€8,000 depending on capacity and brand',
        'Location — Installations in Dublin and other major cities tend to be slightly more expensive than rural areas due to higher labour costs',
      ]},
      { type: 'heading', level: 2, text: 'Hidden Costs to Watch For' },
      { type: 'paragraph', text: 'While reputable installers provide comprehensive quotes that include everything, it is worth being aware of potential additional costs that may not be immediately obvious:' },
      { type: 'callout', variant: 'warning', title: 'Watch Out For', body: 'Some very cheap quotes may exclude scaffolding, electrical upgrades, or BER assessment costs. Always ask for a fully itemised quote that breaks down every cost component so you can compare like-for-like between installers.' },
      { type: 'bulletList', items: [
        'BER Assessment: €200–€350 (required for the SEAI grant)',
        'ECS Registration: €250–€500 (required to connect your system to the grid)',
        'Smart meter upgrade: Usually free from ESB Networks, but may involve a wait time of 4–8 weeks',
        'Scaffolding: €300–€600 for typical two-storey homes',
        'Ground-mounted systems: €2,000–€5,000 more than roof-mounted equivalents',
        'Bird protection: €200–€400 if pigeons are known to nest under panels in your area',
      ]},
      { type: 'heading', level: 2, text: 'ROI Calculations: When Do Solar Panels Pay for Themselves?' },
      { type: 'paragraph', text: 'The return on investment (ROI) for solar panels in Ireland has improved dramatically. With current electricity prices averaging €0.35–€0.45/kWh (including standing charges and VAT), a well-sized system can deliver a payback period of just 5–7 years. Here is a detailed ROI calculation for the three most common system sizes:' },
      { type: 'table', headers: ['Metric', '4kWp System', '6kWp System', '10kWp System'], rows: [
        ['Net Cost (after grant)', '€5,100', '€7,950', '€12,200'],
        ['Annual Bill Savings', '€750', '€1,000', '€1,500'],
        ['CEG Export Earnings', '€150', '€250', '€400'],
        ['Total Annual Savings', '€900', '€1,250', '€1,900'],
        ['Payback Period', '~5.7 years', '~6.4 years', '~6.4 years'],
        ['25-Year Net Profit', '€17,400', '€23,300', '€35,300'],
      ]},
      { type: 'callout', variant: 'tip', title: 'ROI Boost', body: 'If electricity prices continue to rise (as forecast), your payback period could be even shorter. The above calculations assume constant prices — if electricity reaches €0.50/kWh, the 6kWp system pays for itself in under 5 years.' },
      { type: 'heading', level: 2, text: 'Is Now the Right Time to Buy?' },
      { type: 'paragraph', text: 'Solar panel prices in Ireland have stabilised after the supply chain disruptions of 2022–2023. While there are no dramatic price drops expected, the current market offers excellent value for money. The combination of the €1,800 SEAI grant, the Clean Export Guarantee, and rising electricity prices makes 2026 an ideal time to invest in solar.' },
      { type: 'paragraph', text: 'Waiting for prices to fall further is a risky strategy — every month you delay is a month of missed electricity savings. For homeowners with a suitable roof, the best time to install solar panels is now.' },
      { type: 'divider' },
      { type: 'cta', text: 'Get a Personalised Solar Quote for Your Home', href: '/#calculator' },
    ],
  },

  /* ─────────────────────────────────────────────
     3. Solar Panels in Winter
     ───────────────────────────────────────────── */
  {
    slug: 'solar-panels-in-winter-do-they-work',
    title: 'Solar Panels in Winter: Do They Actually Work?',
    excerpt:
      'A common myth in Ireland is that solar panels are useless in winter. The truth might surprise you — panels still generate 30-50% of their summer output during the darker months.',
    category: 'guides',
    date: '8 Apr 2026',
    readTime: '6 min read',
    author: 'Cal O\'Reilly',
    iconBg: 'bg-sky-400/10',
    iconColor: 'text-sky-400',
    content: [
      { type: 'heading', level: 2, text: 'The Myth vs The Reality' },
      { type: 'paragraph', text: 'If there is one question we hear more than any other at Solar Ireland, it is this: "But what about winter? Don\'t solar panels stop working when it\'s cloudy?" It is a perfectly reasonable concern — Ireland is not exactly known for its blue skies. But the reality is very different from the myth, and modern solar technology is far more effective in low-light conditions than most people realise.' },
      { type: 'paragraph', text: 'Solar panels do not need direct sunlight to generate electricity. They work on daylight, not sunshine. Even on a completely overcast Irish winter day, your panels will still produce a meaningful amount of power. Think of it this way: you can still get sunburned on a cloudy day — the UV radiation is still there, just diffused. Solar panels work on a similar principle.' },
      { type: 'callout', variant: 'stat', title: 'Winter Output in Ireland', body: 'A typical 6kWp solar PV system in Ireland generates approximately 30–50% of its summer output during the winter months (November through February). While this is less than summer, it still contributes meaningfully to your electricity needs.' },
      { type: 'heading', level: 2, text: 'How Much Do Solar Panels Generate in Winter?' },
      { type: 'paragraph', text: 'To give you a realistic picture, let us look at the actual monthly generation figures for a typical 6kWp system installed on a south-facing roof in Ireland:' },
      { type: 'table', headers: ['Month', 'Avg Daily Output (kWh)', 'Monthly Total (kWh)', '% of Peak Month'], rows: [
        ['January', '5–8 kWh', '150–250 kWh', '30%'],
        ['February', '7–10 kWh', '200–280 kWh', '35%'],
        ['March', '10–15 kWh', '310–460 kWh', '55%'],
        ['April', '14–19 kWh', '420–570 kWh', '70%'],
        ['May', '18–25 kWh', '560–780 kWh', '90%'],
        ['June', '20–28 kWh', '600–840 kWh', '100%'],
        ['July', '19–26 kWh', '590–810 kWh', '95%'],
        ['August', '16–23 kWh', '500–710 kWh', '85%'],
        ['September', '12–17 kWh', '360–510 kWh', '65%'],
        ['October', '8–13 kWh', '250–400 kWh', '45%'],
        ['November', '5–8 kWh', '150–240 kWh', '28%'],
        ['December', '4–7 kWh', '120–220 kWh', '25%'],
      ]},
      { type: 'paragraph', text: 'As you can see, winter generation is lower — but it is far from zero. A 6kWp system will still produce 150–250 kWh in December, which is enough to cover a significant portion of your baseline electricity needs like lighting, fridge, and electronics.' },
      { type: 'heading', level: 2, text: 'Why Winter Isn\'t as Bad as You Think' },
      { type: 'paragraph', text: 'There are several factors that work in your favour during the Irish winter:' },
      { type: 'bulletList', items: [
        'Cold temperatures improve panel efficiency — solar panels actually perform better in cold weather. For every degree above 25°C, panel efficiency drops by about 0.3–0.4%. A crisp winter day at 5°C is ideal for solar generation.',
        'Diffuse light is still useful — Irish winter skies are often uniformly overcast, which creates consistent diffuse light that modern panels are designed to capture effectively.',
        'Rain cleans your panels — Irish winter rain naturally washes away dust, pollen, and bird droppings that can reduce panel output by 5–15% during drier months.',
        'Shorter days, but still 7–8 hours of daylight — Even in late December, Ireland gets approximately 7.5 hours of daylight, providing a meaningful generation window.',
        'Winter electricity usage is higher — You use more electricity in winter (heating, lighting, longer indoor time), so the solar energy you do generate is immediately valuable and rarely wasted.',
      ]},
      { type: 'heading', level: 2, text: 'Net Metering: Winter\'s Secret Advantage' },
      { type: 'paragraph', text: 'The introduction of the Clean Export Guarantee (CEG) and smart meters in Ireland has fundamentally changed the winter equation. With net metering, you effectively use the national grid as a battery. Here is how it works:' },
      { type: 'paragraph', text: 'During summer, your panels generate more electricity than you use. The excess is exported to the grid, and you earn €0.21 per kWh through the CEG. In winter, when your panels generate less, you draw more from the grid. The system effectively balances out over the course of a year, and the CEG payments you earn in summer help offset your higher winter electricity bills.' },
      { type: 'callout', variant: 'tip', title: 'Smart Meter Advantage', body: 'Having a smart meter installed means you can access the best export tariffs and potentially sign up for time-of-use electricity plans. Some plans offer cheaper electricity at night, which can further reduce your costs if you have battery storage or an EV.' },
      { type: 'heading', level: 2, text: 'Tips to Maximise Winter Generation' },
      { type: 'paragraph', text: 'While you cannot control the weather, there are practical steps you can take to squeeze the maximum possible output from your panels during winter:' },
      { type: 'numberedList', items: [
        'Keep panels clean — While rain does most of the work, a gentle hose-down during extended dry spells (yes, even in winter) can maintain peak output.',
        'Avoid shading — Trim any overhanging tree branches. Winter sun is lower in the sky, so shadows cast by trees or buildings are longer and can have a greater impact.',
        'Monitor your system — Use your inverter\'s monitoring app to track daily generation. A sudden drop could indicate a fault or shading issue that needs attention.',
        'Time your usage — Shift as much electricity consumption as possible to daylight hours. Run your washing machine, dishwasher, and tumble dryer during the middle of the day when generation is highest.',
        'Consider a battery — If your budget allows, a solar battery lets you store winter generation for evening use, reducing your grid dependence when output is at its lowest.',
      ]},
      { type: 'paragraph', text: 'The bottom line? Solar panels absolutely work in Irish winters. They will not generate as much as in summer, but they will still produce meaningful amounts of free electricity and contribute to lower bills. The idea that solar is only viable in sunny countries is outdated — Ireland\'s solar resource is surprisingly good, and modern panel technology is designed specifically for cloudy climates like ours.' },
      { type: 'divider' },
      { type: 'cta', text: 'See How Much Winter Solar Could Save You', href: '/#calculator' },
    ],
  },

  /* ─────────────────────────────────────────────
     4. Clean Export Guarantee
     ───────────────────────────────────────────── */
  {
    slug: 'clean-export-guarantee-explained',
    title: 'Clean Export Guarantee Explained: Get Paid for Your Excess Solar',
    excerpt:
      'The Clean Export Guarantee (CEG) allows you to sell surplus solar electricity back to the grid. Here\'s how it works, what you\'ll earn, and which suppliers offer the best rates.',
    category: 'grants',
    date: '4 Apr 2026',
    readTime: '7 min read',
    author: 'Cal O\'Reilly',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
    content: [
      { type: 'heading', level: 2, text: 'What Is the Clean Export Guarantee?' },
      { type: 'paragraph', text: 'The Clean Export Guarantee (CEG) is a government-backed scheme that ensures homeowners with solar panels receive a fair payment for any surplus electricity they export to the national grid. Launched in 2022, it replaced the older feed-in tariff scheme and represents a significant improvement for Irish solar customers.' },
      { type: 'paragraph', text: 'Under the CEG, energy suppliers are required to offer a payment rate for every kilowatt-hour (kWh) of electricity you export. The scheme is designed to make solar panels financially viable for everyone — not just those who can use all of their generated electricity during the day. It effectively turns the national grid into your battery, giving you credit for the power you share with your neighbours.' },
      { type: 'callout', variant: 'stat', title: 'Current CEG Rate', body: 'The minimum CEG rate in 2026 is €0.21 per kWh, set by the Commission for Regulation of Utilities (CRU). Some suppliers offer higher rates as part of competitive tariffs, so it pays to shop around.' },
      { type: 'heading', level: 2, text: 'How the CEG Works in Practice' },
      { type: 'paragraph', text: 'The mechanics of the Clean Export Guarantee are straightforward, but understanding how the money flows is important for maximising your returns:' },
      { type: 'numberedList', items: [
        'Your solar panels generate electricity during daylight hours.',
        'Any electricity you use in your home is free — it never passes through your meter.',
        'Any surplus electricity that your home does not use is automatically exported to the national grid.',
        'Your smart meter measures exactly how much electricity you export.',
        'Your energy supplier calculates your CEG payment based on your exported kilowatt-hours and their tariff rate.',
        'The payment appears as a credit on your electricity bill or as a direct bank payment, depending on your supplier.',
      ]},
      { type: 'paragraph', text: 'The system is entirely automated — you do not need to do anything to export power. Whenever your panels are generating more than your home is consuming, the excess flows out to the grid automatically. Your smart meter tracks this in real time.' },
      { type: 'heading', level: 2, text: 'Smart Meter Requirement' },
      { type: 'paragraph', text: 'To benefit from the CEG, you need a smart meter installed at your property. Smart meters are digital devices that measure your electricity consumption and generation in real time, replacing the old spinning disc meters that could only measure net flow.' },
      { type: 'paragraph', text: 'The good news is that ESB Networks has been rolling out smart meters across Ireland since 2019, and most homes with solar panels will already have one. If you do not, you can request a free smart meter installation from ESB Networks. The installation typically takes 1–2 hours and involves replacing your existing meter. There is no charge for this service.' },
      { type: 'callout', variant: 'warning', title: 'Important', body: 'Without a smart meter, your installer can still connect your solar system, but you will not be able to receive CEG payments. Getting a smart meter should be one of your first steps when considering solar. It typically takes 4–8 weeks to get one installed.' },
      { type: 'heading', level: 2, text: 'Best Supplier Rates in 2026' },
      { type: 'paragraph', text: 'While the CRU sets a minimum CEG rate of €0.21/kWh, many energy suppliers compete by offering higher rates or additional perks. Here is a comparison of the leading supplier CEG offerings as of early 2026:' },
      { type: 'table', headers: ['Supplier', 'CEG Rate (€/kWh)', 'Contract Type', 'Additional Perks'], rows: [
        ['Electric Ireland', '€0.21', 'Variable', '€50 signup bonus for solar customers'],
        ['SSE Airtricity', '€0.22', '12-month fixed', 'Green energy certificate included'],
        ['Bord Gáis Energy', '€0.21', 'Variable', 'Dual fuel discount available'],
        ['Energia', '€0.24', '12-month fixed', 'Highest standalone rate; online-only tariff'],
        ['Pinergy', '€0.21', 'Variable', 'No standing charge increase'],
        ['Prepay Power', '€0.21', 'Pay-as-you-go', 'Smart PAYG compatible'],
      ]},
      { type: 'callout', variant: 'tip', title: 'Switch and Save', body: 'CEG rates are not fixed — suppliers adjust them periodically. Check comparison sites like bonkers.ie and Switcher.ie at least once a year to ensure you are on the best available rate. A rate increase from €0.21 to €0.24/kWh could add €60–€100 per year to your CEG earnings.' },
      { type: 'heading', level: 2, text: 'Realistic Earnings: What Can You Expect?' },
      { type: 'paragraph', text: 'CEG earnings depend on the size of your system, your daytime electricity consumption, and the orientation of your panels. A household that uses most of its solar generation during the day will export less (and earn less from CEG) but save more on bills. Conversely, a household that is out during the day will export more and earn more from CEG.' },
      { type: 'table', headers: ['System Size', 'Annual Export (kWh)', 'CEG Earnings at €0.21/kWh', 'CEG Earnings at €0.24/kWh'], rows: [
        ['4kWp', '800–1,200 kWh', '€168–€252', '€192–€288'],
        ['6kWp', '1,200–1,800 kWh', '€252–€378', '€288–€432'],
        ['10kWp', '1,800–2,500 kWh', '€378–€525', '€432–€600'],
      ]},
      { type: 'callout', variant: 'info', title: 'The Big Picture', body: 'CEG earnings alone (€300–€500/year for a typical 6kWp system) may not seem huge, but remember this is income on top of your bill savings (€800–€1,200/year). Together, they significantly accelerate your return on investment. The CEG essentially ensures that no solar energy goes to waste.' },
      { type: 'heading', level: 2, text: 'How to Register for the CEG' },
      { type: 'paragraph', text: 'Registering for the Clean Export Guarantee is a simple process. In most cases, your solar installer will handle the registration as part of your installation package. If not, here are the steps:' },
      { type: 'numberedList', items: [
        'Ensure you have a smart meter installed. Contact ESB Networks at 01 698 5005 if you are unsure.',
        'Once your solar system is installed and commissioned, your installer should register it with ESB Networks as a microgeneration unit (under 11kW).',
        'Contact your energy supplier and inform them you now have a solar PV system. They will update your account to reflect your new export capability.',
        'Ask your supplier to put you on their CEG tariff. They may require a copy of your ESB microgeneration certificate.',
        'Your first CEG payment will typically appear on your next billing cycle after registration.',
      ]},
      { type: 'paragraph', text: 'The entire registration process usually takes 2–4 weeks from the date of your solar installation. Most installers include CEG registration in their standard installation package, so you may not need to do anything yourself.' },
      { type: 'divider' },
      { type: 'cta', text: 'Get Solar Installed and Start Earning with CEG', href: '/#calculator' },
    ],
  },

  /* ─────────────────────────────────────────────
     5. East vs South vs West Roofs
     ───────────────────────────────────────────── */
  {
    slug: 'east-vs-south-vs-west-facing-roofs-solar',
    title: 'East vs South vs West-Facing Roofs: Which Is Best for Solar?',
    excerpt:
      'Does your roof face the right way for solar? We compare east, south and west-facing installations with real Irish data to show which orientation delivers the best returns.',
    category: 'guides',
    date: '28 Mar 2026',
    readTime: '9 min read',
    author: 'Cal O\'Reilly',
    iconBg: 'bg-violet-400/10',
    iconColor: 'text-violet-400',
    content: [
      { type: 'heading', level: 2, text: 'Does Roof Orientation Really Matter?' },
      { type: 'paragraph', text: 'One of the most common concerns homeowners have when considering solar is whether their roof faces the "right" direction. There is a persistent myth that only south-facing roofs are suitable for solar panels. The reality is far more nuanced — and far more encouraging. Modern solar panels are remarkably effective across a range of orientations, and a north-facing roof is actually the only orientation that is genuinely unsuitable in Ireland.' },
      { type: 'paragraph', text: 'In Ireland, we are fortunate to be at a latitude (approximately 53°N) where the sun travels a wide arc across the sky during summer. This means that east, south, and west-facing roofs all receive substantial sunlight. The differences in output are meaningful but not dramatic, and the financial case for solar remains strong regardless of your roof\'s orientation.' },
      { type: 'callout', variant: 'stat', title: 'Output by Orientation', body: 'A south-facing roof produces 100% of its rated capacity. East-facing roofs achieve 80–85%, west-facing roofs also achieve 80–85%, and north-facing roofs generate approximately 50–55% of rated capacity.' },
      { type: 'heading', level: 2, text: 'South-Facing Roofs: The Gold Standard' },
      { type: 'paragraph', text: 'A south-facing roof is undeniably the optimal orientation for solar panels in Ireland. Because Ireland is in the Northern Hemisphere, the sun arcs from east to west through the southern half of the sky. A south-facing roof therefore receives the most direct sunlight throughout the day, particularly during the peak generation hours of late morning to early afternoon.' },
      { type: 'bulletList', items: [
        'Annual output: 100% of rated system capacity',
        'Peak generation: 11am – 3pm (when the sun is highest in the sky)',
        'Best suited for: Households that are home during the day and can use electricity during peak generation hours',
        'Payback period: 5–6 years (fastest of all orientations)',
      ]},
      { type: 'heading', level: 2, text: 'East-Facing Roofs: The Morning Champions' },
      { type: 'paragraph', text: 'East-facing roofs receive their strongest sunlight in the morning, from sunrise through to late morning. While they produce 15–20% less electricity overall than a south-facing roof, they have a unique advantage: their generation profile aligns perfectly with morning household routines.' },
      { type: 'paragraph', text: 'Think about your morning routine: toast, kettle, shower, lights, phone charging, heating the house. An east-facing system peaks just when you are using the most electricity, meaning more of your solar generation is consumed directly rather than exported to the grid. Since using your own solar electricity is worth more than exporting it (you save €0.35–€0.45/kWh versus earning €0.21/kWh), this higher self-consumption rate partially offsets the lower total output.' },
      { type: 'bulletList', items: [
        'Annual output: 80–85% of rated capacity',
        'Peak generation: 8am – 12pm',
        'Best suited for: Households with high morning electricity consumption',
        'Payback period: 6–7 years',
      ]},
      { type: 'heading', level: 2, text: 'West-Facing Roofs: The Afternoon Powerhouse' },
      { type: 'paragraph', text: 'West-facing roofs mirror east-facing ones, with peak generation occurring from mid-afternoon through to early evening. This makes them an excellent choice for households where people are out during the day and return in the late afternoon and evening.' },
      { type: 'paragraph', text: 'In Ireland, many households follow a pattern where the house is largely empty during the day (people at work or school), and electricity usage peaks in the evening. A west-facing system generates maximum power exactly when you come home and start cooking, running appliances, and turning on lights. Like east-facing systems, this high self-consumption rate means the financial returns are better than the raw output figures suggest.' },
      { type: 'bulletList', items: [
        'Annual output: 80–85% of rated capacity',
        'Peak generation: 2pm – 6pm',
        'Best suited for: Households that are out during the day and home in the evening',
        'Payback period: 6–7 years',
      ]},
      { type: 'heading', level: 2, text: 'North-Facing Roofs: Worth It?' },
      { type: 'paragraph', text: 'North-facing roofs receive the least direct sunlight in Ireland. A north-facing solar array will typically generate only 50–55% of a south-facing equivalent. For most homeowners, this is not an attractive proposition — the longer payback period (9–11 years) means the financial returns are significantly diminished.' },
      { type: 'paragraph', text: 'However, there are exceptions. If you have a large roof area and can fit a bigger system on the north side for a low additional cost, or if your north roof is completely free from shading while your south roof is obstructed, a north-facing installation can still make financial sense. Some installers also offer mixed-orientation setups.' },
      { type: 'heading', level: 2, text: 'Split Arrays: The Best of Both Worlds' },
      { type: 'paragraph', text: 'If your home has roof planes facing different directions, you may be able to install a split array — panels on both an east and a west roof, for example. Split arrays have become increasingly popular in Ireland because they offer a broader generation profile throughout the day.' },
      { type: 'table', headers: ['Configuration', 'Annual Output', 'Generation Pattern', 'Best For'], rows: [
        ['South only', '100%', 'Midday peak', 'Daytime home workers'],
        ['East + West split', '85–90%', 'Broad morning–evening curve', 'Families out during the day'],
        ['East + South split', '90–95%', 'Morning–midday curve', 'Shift workers, high morning use'],
        ['South + West split', '90–95%', 'Midday–evening curve', 'Afternoon/evening households'],
      ]},
      { type: 'callout', variant: 'tip', title: 'Split Array Advantage', body: 'A split east/west array generates less total electricity than a south-facing equivalent, but it typically has a much higher self-consumption rate (up to 70–80% vs 40–50% for south-only). This means less electricity is exported at the lower CEG rate and more is consumed at the full electricity price — improving your overall financial return.' },
      { type: 'heading', level: 2, text: 'Other Factors That Matter More Than Orientation' },
      { type: 'paragraph', text: 'While roof orientation is important, several other factors have an equal or greater impact on your system\'s performance:' },
      { type: 'bulletList', items: [
        'Shading — Even a small amount of shading (chimney, tree, neighbouring building) can reduce output by 10–25%. Eliminating shading is more important than optimising orientation.',
        'Pitch angle — The ideal pitch for Ireland is approximately 35–40°. Most standard Irish roofs fall within 30–45°, which is excellent for solar.',
        'Roof condition — A roof that needs replacement within the next 5–10 years should be replaced before installing solar. Removing and reinstalling panels adds significant cost.',
        'System sizing — An oversized system on a west-facing roof may produce more usable energy than an undersized system on a south-facing roof.',
      ]},
      { type: 'paragraph', text: 'The key takeaway is simple: if your roof faces east, south, or west, solar panels are a worthwhile investment in Ireland. The differences between these orientations are relatively modest in the context of a 25-year panel lifespan, and the financial case remains strong across all three.' },
      { type: 'divider' },
      { type: 'cta', text: 'Get a Free Roof Assessment for Your Home', href: '/#calculator' },
    ],
  },

  /* ─────────────────────────────────────────────
     6. Battery Storage
     ───────────────────────────────────────────── */
  {
    slug: 'battery-storage-is-it-worth-the-extra-cost',
    title: 'Battery Storage: Is It Worth the Extra Cost?',
    excerpt:
      'Solar batteries cost €4,000-€8,000 — but can they pay for themselves? We break down the maths with real Irish energy prices and usage patterns to help you decide.',
    category: 'savings',
    date: '22 Mar 2026',
    readTime: '10 min read',
    author: 'Cal O\'Reilly',
    iconBg: 'bg-emerald-400/10',
    iconColor: 'text-emerald-400',
    content: [
      { type: 'heading', level: 2, text: 'The Battery Storage Question' },
      { type: 'paragraph', text: 'Adding battery storage to your solar panel system is the single biggest decision you will make after choosing to go solar. It is also the most expensive optional component, with prices ranging from €4,000 to €8,000 depending on capacity, brand, and installation complexity. So, is it worth the extra cost? The honest answer is: it depends on your circumstances.' },
      { type: 'paragraph', text: 'This guide will walk you through the financial maths, the practical benefits, and the specific scenarios where a battery delivers genuine value. We will not sugarcoat it — for some households, a battery is an excellent investment. For others, it is money better spent on a larger solar array or kept in the bank. Our goal is to help you figure out which camp you fall into.' },
      { type: 'callout', variant: 'stat', title: 'Battery Market in Ireland', body: 'Approximately 35% of new solar installations in Ireland now include battery storage, up from just 10% in 2022. The SEAI offers an additional €600 grant specifically for battery storage.' },
      { type: 'heading', level: 2, text: 'How Much Do Solar Batteries Cost?' },
      { type: 'paragraph', text: 'Solar battery prices have fallen significantly over the past five years, driven by advances in lithium iron phosphate (LFP) technology and increased global manufacturing capacity. Here is a breakdown of current battery costs in Ireland for 2026:' },
      { type: 'table', headers: ['Battery Capacity', 'Typical Cost', 'After €600 Grant', 'Best For'], rows: [
        ['3–5 kWh (small)', '€4,000 – €5,500', '€3,400 – €4,900', 'Small households, low evening usage'],
        ['5–7 kWh (medium)', '€5,000 – €7,000', '€4,400 – €6,400', 'Average 3-4 person household'],
        ['7–10 kWh (large)', '€6,500 – €8,000', '€5,900 – €7,400', 'Large homes, EV owners, high usage'],
        ['10–13.5 kWh (XL)', '€8,000 – €10,000', '€7,400 – €9,400', 'Off-grid capability, heat pumps'],
      ]},
      { type: 'paragraph', text: 'The most popular battery size for Irish households is 5–7 kWh, which provides enough storage to cover typical evening electricity consumption (6pm–11pm). The Tesla Powerwall 2 (13.5 kWh) is the most well-known option but is also the most expensive — for most Irish homes, a 5–7 kWh battery from a brand like Huawei, BYD, or Pylontech offers better value.' },
      { type: 'heading', level: 2, text: 'Payback Calculations: Does a Battery Pay for Itself?' },
      { type: 'paragraph', text: 'The payback period for a solar battery is longer than for panels alone. While solar panels typically pay for themselves in 5–7 years, a battery usually takes 8–12 years. However, this varies dramatically based on your electricity usage patterns. Let us look at the numbers:' },
      { type: 'paragraph', text: 'Without a battery, a typical 6kWp solar system generates approximately 5,000 kWh per year. If you use 50% directly and export 50%, your annual savings look like this: €875 in direct savings (2,500 kWh × €0.35/kWh) plus €263 in CEG earnings (2,500 kWh × €0.105 effective rate). Total: approximately €1,138 per year.' },
      { type: 'paragraph', text: 'With a 5 kWh battery, you can increase your self-consumption to approximately 75–80%. That means consuming 4,000 kWh directly and exporting only 1,000 kWh: €1,400 in direct savings (4,000 kWh × €0.35/kWh) plus €105 in CEG earnings (1,000 kWh × €0.105 effective rate). Total: approximately €1,505 per year.' },
      { type: 'table', headers: ['Scenario', 'Annual Savings', 'Battery Cost (Net)', 'Payback Period'], rows: [
        ['No battery', '€1,138', 'N/A', 'N/A'],
        ['5 kWh battery + solar', '€1,505', '€5,400', '~9.3 years'],
        ['7 kWh battery + solar', '€1,575', '€6,400', '~10.8 years'],
        ['10 kWh battery + solar', '€1,645', '€7,400', '~12.1 years'],
      ]},
      { type: 'callout', variant: 'info', title: 'Understanding the Numbers', body: 'A battery saves you money by reducing your grid imports during the evening and night. The value of each stored kWh is €0.35–€0.45 (the price you would otherwise pay for grid electricity), versus the €0.21 you earn from exporting it. Storing your own solar is worth nearly double what exporting it earns.' },
      { type: 'heading', level: 2, text: 'When a Battery Makes Sense' },
      { type: 'paragraph', text: 'There are several specific scenarios where adding a battery is a genuinely smart financial decision:' },
      { type: 'bulletList', items: [
        'You have an electric vehicle — An EV adds 3,000–5,000 kWh to your annual electricity consumption. A battery lets you charge your EV from stored solar power overnight, dramatically reducing your motoring costs.',
        'You are on a time-of-use tariff — If your electricity supplier charges more during peak hours (5pm–7pm) and less at night, a battery lets you avoid peak rates entirely by using stored solar during expensive periods.',
        'You have a heat pump — Heat pumps use significant electricity, particularly in winter. A battery can supplement your heat pump\'s power needs during peak pricing periods.',
        'You work from home — If you are home during the day, you may not export much excess solar. But if your solar output exceeds your daytime needs (large system), a battery captures the surplus for the evening.',
        'You want backup power — If power cuts are a concern in your area, most solar batteries can provide backup power during outages (though this usually requires an additional configuration and switchgear).',
      ]},
      { type: 'heading', level: 2, text: 'When a Battery Does NOT Make Sense' },
      { type: 'paragraph', text: 'Be honest with yourself — a battery is not right for everyone. Here are the scenarios where we would advise against adding one:' },
      { type: 'bulletList', items: [
        'Your budget is tight — If you are stretching your finances to afford solar panels, do not add a battery on top. Panels alone deliver an excellent return, and you can always add a battery later.',
        'You are home all day — If someone is home during daylight hours, you likely consume 60–70% of your solar generation directly. The marginal benefit of a battery is smaller when self-consumption is already high.',
        'You have a small system — A 4kWp system generates relatively little surplus. A battery may spend much of its time empty or only partially charged, reducing its value.',
        'Your roof faces east or west — Split orientation systems already have broad generation profiles, and the surplus available for storage is smaller than a south-facing system.',
      ]},
      { type: 'heading', level: 2, text: 'Battery Sizing Guide' },
      { type: 'paragraph', text: 'Choosing the right battery size is crucial. Too small, and it will not store enough to make a meaningful difference. Too large, and you will never fill it, wasting money on unused capacity. As a general rule, your battery capacity should be between 1 and 1.5 times your daily solar surplus.' },
      { type: 'table', headers: ['Household Size', 'Daily Usage (kWh)', 'Solar System', 'Recommended Battery'], rows: [
        ['1–2 people', '10–15 kWh', '4kWp', '3–5 kWh'],
        ['3–4 people', '15–25 kWh', '6kWp', '5–7 kWh'],
        ['5+ people', '25–35+ kWh', '8–10kWp', '7–10 kWh'],
        ['EV owner (any)', '+10–15 kWh', '6–10kWp', '10–13.5 kWh'],
      ]},
      { type: 'callout', variant: 'tip', title: 'Future-Proof Tip', body: 'Most lithium iron phosphate batteries can be expanded by adding additional modules later. You do not have to buy your full capacity upfront. Start with a smaller battery and add capacity as your needs grow (e.g., when you buy an EV).' },
      { type: 'paragraph', text: 'Ultimately, the decision to add battery storage comes down to your personal circumstances, budget, and electricity usage patterns. For many Irish households, especially those with EVs or on time-of-use tariffs, a battery is a worthwhile addition that accelerates long-term savings. For others, investing in more panels or simply saving the money is the smarter choice.' },
      { type: 'divider' },
      { type: 'cta', text: 'Get a Custom Battery + Solar Recommendation', href: '/#calculator' },
    ],
  },

  /* ─────────────────────────────────────────────
     7. Planning Permission
     ───────────────────────────────────────────── */
  {
    slug: 'planning-permission-solar-panels-ireland',
    title: 'Planning Permission for Solar Panels in Ireland — What You Need to Know',
    excerpt:
      'Good news — most domestic solar installations in Ireland don\'t need planning permission. Here are the exceptions, limits, and guidelines you should be aware of before installing.',
    category: 'guides',
    date: '18 Mar 2026',
    readTime: '5 min read',
    author: 'Cal O\'Reilly',
    iconBg: 'bg-rose-400/10',
    iconColor: 'text-rose-400',
    content: [
      { type: 'heading', level: 2, text: 'The Good News: Exempted Development' },
      { type: 'paragraph', text: 'If you are considering installing solar panels on your home in Ireland, here is the best news you will hear: the vast majority of domestic solar installations do not require planning permission. Under Irish planning law, solar panels on residential properties fall under "exempted development," which means you can proceed without applying to your local county council.' },
      { type: 'paragraph', text: 'This exemption was introduced to remove barriers to renewable energy adoption and has been instrumental in the rapid growth of residential solar across Ireland. However, the exemption is not unlimited — there are specific conditions you must adhere to. Exceeding these limits means you will need to go through the full planning permission process, which can add months and significant cost to your project.' },
      { type: 'callout', variant: 'tip', title: 'Quick Answer', body: 'If you are installing solar panels on a typical Irish home that is not a protected structure and is not in a conservation area, you almost certainly do not need planning permission. Your installer will confirm this during the initial survey.' },
      { type: 'heading', level: 2, text: 'Exempted Development Limits' },
      { type: 'paragraph', text: 'To qualify for exempted development status, your solar installation must comply with the following conditions set out under the Planning and Development Regulations:' },
      { type: 'bulletList', items: [
        'The total area of solar panels on the roof must not exceed 12 square metres (this is measured as the total footprint of all panels combined)',
        'No solar panel should extend more than 50 centimetres above the existing roof surface (measured from the highest point of the roof tiles/slates to the top of the panel)',
        'The solar panels must be installed on the roof — not on walls, fences, or freestanding structures (ground-mounted solar requires separate planning)',
        'The installation must be on a house or apartment building — not on a shed, garage, or outbuilding (with limited exceptions)',
        'Panels should not project beyond the external wall of the building at any point',
      ]},
      { type: 'callout', variant: 'info', title: '12 Square Metres Explained', body: 'Twelve square metres is approximately 8–10 standard solar panels (depending on panel size). This is enough for a 4–5kWp system, which is sufficient for most smaller Irish households. For larger systems (6kWp+), you may need to split panels across multiple roof planes or apply for planning permission if you want them all on one roof.' },
      { type: 'heading', level: 2, text: 'When You DO Need Planning Permission' },
      { type: 'paragraph', text: 'There are specific situations where planning permission is required for solar panels in Ireland. It is important to identify these before you commit to an installation:' },
      { type: 'bulletList', items: [
        'Protected structures — If your home is a protected structure or a proposed protected structure, you will need planning permission for any external alteration, including solar panels. This includes Georgian, Victorian, and Edwardian buildings in certain areas.',
        'Architectural conservation areas (ACAs) — If your property is located within a designated ACA, special rules apply. Some ACAs restrict solar panel installations that are visible from the street.',
        'Exceeding the 12m² limit — If you want a larger system that exceeds 12 square metres of roof-mounted panels, you will need planning permission.',
        'Flat roof installations — Panels on flat roofs that project above the parapet wall may require planning permission, depending on the height of the parapet.',
        'Listed buildings — Similar to protected structures, buildings on the National Inventory of Architectural Heritage require planning permission.',
        'Ground-mounted solar — Any freestanding solar panel array on the ground (even in your garden) requires planning permission, regardless of size.',
      ]},
      { type: 'callout', variant: 'warning', title: 'Do Not Risk It', body: 'Installing solar panels without planning permission when it is required is an unauthorised development. Your local council can issue an enforcement notice requiring you to remove the panels. Always check with your installer and, if in doubt, contact your local planning department before proceeding.' },
      { type: 'heading', level: 2, text: 'Protected Structures and Heritage Homes' },
      { type: 'paragraph', text: 'If you own a protected structure, you can still install solar panels — but you will need to go through the planning permission process. This involves submitting detailed plans showing how the panels will be installed and demonstrating that they will not materially alter the character of the building.' },
      { type: 'paragraph', text: 'Tips for protected structure owners include: choosing dark-framed panels that blend with dark roof tiles, positioning panels on rear roof slopes that are not visible from the street, considering in-roof systems where panels replace roof tiles rather than sitting on top of them, and working with an installer experienced in heritage projects.' },
      { type: 'heading', level: 2, text: 'BER Assessment Exemption' },
      { type: 'paragraph', text: 'While not directly related to planning permission, it is worth noting that having solar panels does not automatically trigger a BER assessment requirement. However, if you are applying for the SEAI grant, you will need a BER assessment as part of the grant conditions. This is separate from planning permission and is managed through the SEAI portal rather than your local council.' },
      { type: 'heading', level: 2, text: 'Summary: Do You Need Planning?' },
      { type: 'table', headers: ['Scenario', 'Planning Required?', 'Notes'], rows: [
        ['Standard house, <12m² of panels', 'No', 'Exempted development applies'],
        ['Standard house, >12m² of panels', 'Yes', 'Apply through local council'],
        ['Protected structure', 'Yes', 'Heritage impact assessment required'],
        ['In an ACA', 'Maybe', 'Check with local planning department'],
        ['Flat roof (below parapet)', 'No', 'Exempted if not visible above parapet'],
        ['Flat roof (above parapet)', 'Maybe', 'Depends on height and visibility'],
        ['Ground-mounted panels', 'Yes', 'Always requires planning permission'],
        ['Apartment block (own apartment only)', 'No', 'Exempted for individual units'],
      ]},
      { type: 'paragraph', text: 'The vast majority of Irish homeowners will never need to worry about planning permission for their solar installation. The exempted development rules are generous enough to accommodate most standard residential setups. If you have any doubts, your SEAI-registered installer will be able to advise you during the initial consultation and survey.' },
      { type: 'divider' },
      { type: 'cta', text: 'Book a Free Survey — We Will Check Planning for You', href: '/#calculator' },
    ],
  },

  /* ─────────────────────────────────────────────
     8. Panel Comparison: LONGi vs Jinko vs Trina
     ───────────────────────────────────────────── */
  {
    slug: 'longi-vs-jinko-vs-trina-best-solar-panels',
    title: 'LONGi vs Jinko vs Trina: Which Solar Panels Are Best for Irish Homes?',
    excerpt:
      'We compare the top three tier-1 solar panel brands used in Ireland — efficiency, warranties, real-world performance, and which one delivers the best value for your home.',
    category: 'technology',
    date: '12 Mar 2026',
    readTime: '8 min read',
    author: 'Cal O\'Reilly',
    iconBg: 'bg-sky-400/10',
    iconColor: 'text-sky-400',
    content: [
      { type: 'heading', level: 2, text: 'The Big Three: LONGi, Jinko, and Trina' },
      { type: 'paragraph', text: 'When it comes to choosing solar panels for your Irish home, three manufacturers dominate the market: LONGi, Jinko Solar, and Trina Solar. All three are Chinese Tier-1 manufacturers with global reputations for quality, reliability, and innovation. Between them, they account for an estimated 70–80% of all residential solar panels installed in Ireland.' },
      { type: 'paragraph', text: 'But which one is right for you? While all three produce excellent panels, there are meaningful differences in efficiency, degradation rates, warranty terms, real-world performance in Irish weather conditions, and price. This guide provides an honest, side-by-side comparison to help you make an informed decision.' },
      { type: 'callout', variant: 'info', title: 'What Is a Tier-1 Panel?', body: 'Tier-1 is a classification by Bloomberg New Energy Finance (BNEF) that indicates a manufacturer is vertically integrated, financially stable, and has a proven track record. It is the solar industry\'s gold standard for bankability and reliability.' },
      { type: 'heading', level: 2, text: 'LONGi Hi-MO 6: The Efficiency Leader' },
      { type: 'paragraph', text: 'LONGi is the world\'s largest manufacturer of monocrystalline silicon solar panels and is widely regarded as the industry leader in panel efficiency. Their Hi-MO 6 series, launched in 2023 and updated for 2026, represents the cutting edge of residential solar technology.' },
      { type: 'bulletList', items: [
        'Efficiency: 22.3–22.8% (highest of the three)',
        'Cell type: Monocrystalline PERC with HPDC technology',
        'Power output: 410–440W per panel (standard 60-cell format)',
        'Temperature coefficient: -0.29%/°C (excellent for Irish climate)',
        'Degradation: 0.55% per year in year 1, then 0.4% per year',
        'Warranty: 25-year product warranty, 30-year performance warranty (87.4% output at year 30)',
      ]},
      { type: 'paragraph', text: 'LONGi panels are particularly well-suited to Ireland because of their excellent low-light performance and temperature coefficient. Ireland\'s mild climate means panels rarely overheat, and LONGi\'s low temperature coefficient means they lose less efficiency in warm conditions. They also perform exceptionally well in diffuse light conditions (cloudy days), which accounts for much of Ireland\'s annual solar resource.' },
      { type: 'heading', level: 2, text: 'Jinko Tiger Neo: The Value Pick' },
      { type: 'paragraph', text: 'Jinko Solar is the world\'s largest shipper of solar modules and has a particularly strong presence in the Irish residential market. Their Tiger Neo series uses N-type TOPCon cell technology, which represents the next generation of solar cell architecture beyond PERC.' },
      { type: 'bulletList', items: [
        'Efficiency: 21.8–22.5%',
        'Cell type: N-type TOPCon (tunnel oxide passivated contact)',
        'Power output: 400–430W per panel',
        'Temperature coefficient: -0.30%/°C',
        'Degradation: 1% in year 1, then 0.4% per year (N-type advantage)',
        'Warranty: 25-year product warranty, 30-year performance warranty (87.4% output at year 30)',
      ]},
      { type: 'paragraph', text: 'The key advantage of Jinko\'s Tiger Neo is its N-type TOPCon technology. N-type cells are less prone to light-induced degradation (LID) than the P-type cells used in older panel designs. This means Jinko panels retain their output better over the first few years of operation. In practical terms, a Jinko Tiger Neo panel may produce 1–2% more electricity in year 5 compared to a similar P-type panel, as P-type panels degrade faster in their early years.' },
      { type: 'heading', level: 2, text: 'Trina Vertex S+: The All-Rounder' },
      { type: 'paragraph', text: 'Trina Solar is one of the industry\'s most established players, having been founded in 1997. Their Vertex S+ series for residential applications offers a well-balanced combination of performance, reliability, and value.' },
      { type: 'bulletList', items: [
        'Efficiency: 21.5–22.3%',
        'Cell type: Monocrystalline PERC with multi-busbar technology',
        'Power output: 390–425W per panel',
        'Temperature coefficient: -0.30%/°C',
        'Degradation: 1% in year 1, then 0.4% per year',
        'Warranty: 25-year product warranty, 25-year performance warranty (84.8% output at year 25)',
      ]},
      { type: 'paragraph', text: 'Trina\'s Vertex S+ is a solid, reliable workhorse. While it does not lead on any single metric, it offers consistently good performance across the board. Trina panels are also among the most widely available in Ireland, which can mean shorter lead times and competitive pricing from installers.' },
      { type: 'heading', level: 2, text: 'Head-to-Head Comparison' },
      { type: 'table', headers: ['Feature', 'LONGi Hi-MO 6', 'Jinko Tiger Neo', 'Trina Vertex S+'], rows: [
        ['Panel Efficiency', '22.3–22.8%', '21.8–22.5%', '21.5–22.3%'],
        ['Power Output', '410–440W', '400–430W', '390–425W'],
        ['Temp Coefficient', '-0.29%/°C', '-0.30%/°C', '-0.30%/°C'],
        ['Year 1 Degradation', '0.55%', '1.0%', '1.0%'],
        ['Annual Degradation', '0.40%', '0.40%', '0.40%'],
        ['Product Warranty', '25 years', '25 years', '25 years'],
        ['Performance Warranty', '30 years (87.4%)', '30 years (87.4%)', '25 years (84.8%)'],
        ['Typical Price (per panel)', '€180–€220', '€160–€200', '€150–€190'],
        ['Irish Suitability', '★★★★★', '★★★★☆', '★★★★☆'],
        ['Value for Money', '★★★★☆', '★★★★★', '★★★★★'],
      ]},
      { type: 'heading', level: 2, text: 'Performance in Irish Weather' },
      { type: 'paragraph', text: 'Ireland\'s climate presents specific challenges for solar panels: frequent cloud cover, relatively mild temperatures, high humidity, and occasional salt spray in coastal areas. All three brands handle these conditions well, but there are subtle differences worth noting.' },
      { type: 'paragraph', text: 'LONGi\'s slight edge in efficiency and temperature coefficient makes it marginally better in Irish conditions, particularly during the summer months when temperatures can occasionally rise above 25°C. However, the difference in real-world annual output between LONGi and Jinko panels of the same wattage is typically less than 2–3% — which translates to roughly 20–40 kWh per year on a standard 6kWp system. This is not a decisive difference for most homeowners.' },
      { type: 'paragraph', text: 'All three brands use anodised aluminium frames and tempered glass that meet the IEC 61215 standard for durability. They are all rated to withstand wind speeds of 2,400 Pa (approximately 150 km/h) and snow loads of 5,400 Pa — more than sufficient for Irish weather conditions.' },
      { type: 'heading', level: 2, text: 'Our Recommendation' },
      { type: 'paragraph', text: 'For most Irish homeowners, the choice between these three panels comes down to price and availability rather than performance. All three will serve you well for 25+ years. Here is our simple recommendation:' },
      { type: 'bulletList', items: [
        'If your roof space is limited — choose LONGi Hi-MO 6 for maximum output per square metre',
        'If you want the best value — choose Jinko Tiger Neo, which offers N-type technology at competitive prices',
        'If your installer strongly recommends Trina — go with it, the Vertex S+ is a proven performer and availability can matter',
        'Do not stress too much about the brand — panel quality matters, but installer quality matters more. A well-installed Trina system will outperform a poorly installed LONGi system every time',
      ]},
      { type: 'callout', variant: 'tip', title: 'The Real Secret', body: 'The most important factor in your solar system\'s long-term performance is not the panel brand — it is the quality of the installation. A skilled installer who takes care with wiring, inverter placement, shading analysis, and roof attachment will deliver better results than a premium panel installed poorly. Choose your installer as carefully as you choose your panels.' },
      { type: 'divider' },
      { type: 'cta', text: 'Get a Quote with Premium Panel Options', href: '/#calculator' },
    ],
  },

  /* ─────────────────────────────────────────────
     9. Solar Panels Dublin Guide
     ───────────────────────────────────────────── */
  {
    slug: 'solar-panels-dublin-ultimate-guide',
    title: 'Solar Panels in Dublin: The Ultimate 2026 Guide',
    excerpt:
      'Everything Dublin homeowners need to know about going solar — from grant eligibility and installation costs to the best panels for Dublin\'s weather and typical roof types.',
    category: 'county',
    date: '6 Mar 2026',
    readTime: '11 min read',
    author: 'Cal O\'Reilly',
    iconBg: 'bg-orange-400/10',
    iconColor: 'text-orange-400',
    content: [
      { type: 'heading', level: 2, text: 'Why Dublin Is Leading Ireland\'s Solar Revolution' },
      { type: 'paragraph', text: 'Dublin is at the forefront of Ireland\'s residential solar energy boom. With approximately 550,000 residential properties, the capital has the highest concentration of potential solar installations in the country. In 2025 alone, an estimated 12,000 Dublin homes installed solar panels — more than any other county — and this figure is expected to grow by 25% in 2026.' },
      { type: 'paragraph', text: 'Several factors make Dublin uniquely positioned for solar adoption: high electricity prices (among the highest in the country due to urban network charges), a large number of suitable roof types, excellent installer availability, and a dense population of environmentally conscious homeowners. Dublin City Council has also been proactive in streamlining the process for solar installations, and the county has some of the highest smart meter penetration rates in Ireland.' },
      { type: 'callout', variant: 'stat', title: 'Dublin Solar Stats', body: 'Over 35,000 Dublin homes now have solar panels installed. The average 6kWp system in Dublin generates approximately 5,000–5,500 kWh per year, saving homeowners €900–€1,200 annually on electricity bills.' },
      { type: 'heading', level: 2, text: 'Solar Panel Costs in Dublin (2026)' },
      { type: 'paragraph', text: 'Solar panel installation costs in Dublin are slightly higher than the national average, primarily due to higher labour costs, parking charges for installation crews, and the logistical challenges of working in a densely populated urban area. However, the increased competition among Dublin-based installers has kept prices competitive.' },
      { type: 'table', headers: ['System Size', 'Dublin Cost Range', 'National Average', 'After Grant'], rows: [
        ['4kWp (10–12 panels)', '€6,500 – €8,500', '€6,000 – €8,000', '€4,700 – €6,700'],
        ['6kWp (14–16 panels)', '€9,000 – €12,000', '€8,500 – €11,000', '€7,200 – €10,200'],
        ['10kWp (22–26 panels)', '€13,000 – €17,000', '€12,000 – €16,000', '€11,200 – €15,200'],
      ]},
      { type: 'paragraph', text: 'Dublin costs are typically 5–10% above the national average, but the higher electricity prices in Dublin mean the financial returns are actually slightly better. At an average urban electricity rate of €0.40/kWh (including standing charges and VAT), a 6kWp system in Dublin pays for itself in approximately 5.5–6.5 years — slightly faster than the national average of 6–7 years.' },
      { type: 'heading', level: 2, text: 'Dublin Roof Types and Solar Compatibility' },
      { type: 'paragraph', text: 'Dublin has a diverse range of housing stock, from Georgian townhouses to modern estates. Each roof type presents unique opportunities and challenges for solar installation:' },
      { type: 'heading', level: 3, text: 'Victorian and Edwardian Terraces (1890–1920)' },
      { type: 'paragraph', text: 'These are found throughout Dublin 4, Dublin 6, Rathmines, Ranelagh, and Drumcondra. They typically have steeply pitched slate roofs with multiple chimney stacks. Solar compatibility is generally good — the roof pitch (35–45°) is ideal, and many have south-facing rear roof slopes. The main challenges are narrow terraces where scaffolding access can be difficult, chimneys that cause shading, and fragile original slate roofs that may need reinforcement before panel installation.' },
      { type: 'heading', level: 3, text: '1930s–1950s Suburban Semis' },
      { type: 'paragraph', text: 'Common in areas like Templeogue, Donnybrook, Milltown, and Drumcondra. These homes typically have pitched tiled roofs with generous ridge-to-eave measurements. They are among the easiest roof types for solar installation — ample space, standard pitches, and minimal shading. Many have both front and rear roof slopes, allowing for split east/west arrays. This is the "sweet spot" roof type for solar in Dublin.' },
      { type: 'heading', level: 3, text: '1960s–1980s Bungalows' },
      { type: 'paragraph', text: 'Found in suburban areas like Tallaght, Clondalkin, Ballymun, and Blanchardstown. These single-storey homes often have shallow-pitched roofs (15–25°) with large unshaded areas. The shallow pitch is suboptimal for solar (ideal is 35–40°), but the large roof area compensates — you can often fit more panels than on a standard two-storey house. Scaffolding is cheaper (single storey), which reduces installation costs.' },
      { type: 'heading', level: 3, text: 'Modern Estates (2000–present)' },
      { type: 'paragraph', text: 'Found in areas like Swords, Lucan, Leopardstown, and Adamstown. Modern homes typically have concrete tile roofs with standard pitches (30–35°) and clean rooflines. They are excellent for solar — minimal shading, strong roof structures, and many are already pre-wired for solar conduit. Some newer developments in Dublin even include solar panels as standard.' },
      { type: 'callout', variant: 'tip', title: 'Dublin Roof Tip', body: 'If you live in a Dublin terrace, ask your installer about a split east/west array on your front and rear roof slopes. This maximises generation throughout the day without requiring scaffolding around the sides of the building (which can require neighbour permission).' },
      { type: 'heading', level: 2, text: 'Grant Uptake and Statistics in Dublin' },
      { type: 'paragraph', text: 'Dublin has consistently led the country in SEAI grant applications for solar panels. The county accounts for approximately 25% of all national solar grant applications, despite having only about 15% of the national housing stock. This reflects the higher energy costs in Dublin, greater environmental awareness, and easier access to SEAI-registered installers.' },
      { type: 'table', headers: ['Dublin Metric', 'Figure'], rows: [
        ['Total SEAI solar grants issued (to date)', '~35,000'],
        ['Average grant application processing time', '4–5 weeks'],
        ['Homes with solar panels', '~8% of residential properties'],
        ['Average system size installed', '5.8 kWp'],
        ['Most popular panel brand', 'Jinko Solar (Tiger Neo)'],
        ['Average installation time', '1–2 days'],
      ]},
      { type: 'heading', level: 2, text: 'Choosing an Installer in Dublin' },
      { type: 'paragraph', text: 'Dublin has the highest concentration of solar installers in Ireland, which is both a blessing and a challenge. More choice means better pricing, but it also means more research is needed to find a quality installer. Here are our tips for Dublin homeowners:' },
      { type: 'numberedList', items: [
        'Always use an SEAI-registered installer — verify registration on seai.ie before signing any contract',
        'Get at least 3 quotes — Dublin installer prices can vary by 20–30% for identical systems',
        'Check reviews on Google and Trustpilot — pay particular attention to reviews from Dublin homeowners, as installation quality can vary by area',
        'Ask about scaffolding costs — Dublin parking and access can add €200–€500 to scaffolding costs. Some quotes include this, others do not',
        'Check for Dublin-specific experience — installers who regularly work in Dublin\'s older housing stock will be better equipped to handle fragile slate roofs and tight terrace access',
        'Ask about the ECS registration process — your installer should handle ESB Networks registration and smart meter coordination',
        'Verify warranty coverage — ensure your installer provides a workmanship warranty of at least 5 years on top of the manufacturer\'s panel warranty',
      ]},
      { type: 'heading', level: 2, text: 'Dublin Council Areas and Considerations' },
      { type: 'paragraph', text: 'Dublin is divided into four local authority areas: Dublin City Council, South Dublin County Council, Fingal County Council, and Dún Laoghaire-Rathdown County Council. While the planning rules are consistent across all four (following national exempted development guidelines), there are some local nuances to be aware of:' },
      { type: 'bulletList', items: [
        'Dublin City Council — High density of protected structures and ACAs. If your home is in areas like Georgian Dublin (Mountjoy Square, Merrion Square), St. Stephen\'s Green, or the Liberties, check for heritage designations before proceeding.',
        'Dún Laoghaire-Rathdown — Several scenic conservation areas along the coast. Seafront properties in Dalkey, Killiney, and Sandycove may have additional restrictions on roof alterations visible from the sea.',
        'South Dublin County Council — Relatively few heritage restrictions. Suburban areas like Tallaght, Clondalkin, and Lucan are straightforward for solar installation.',
        'Fingal County Council — Mix of suburban and rural. Areas like Swords, Malahide, and Howth have good solar potential. Rural properties in north County Dublin may be able to accommodate larger systems.',
      ]},
      { type: 'heading', level: 2, text: 'Solar Generation in Dublin vs Rest of Ireland' },
      { type: 'paragraph', text: 'Dublin\'s solar resource is comparable to the rest of Ireland, with a slight advantage in coastal areas due to less cloud cover compared to inland counties. A typical 6kWp system in Dublin will generate approximately 5,000–5,500 kWh per year, depending on roof orientation, pitch, and shading. This is slightly above the national average, partly due to Dublin\'s coastal location benefiting from clearer coastal skies.' },
      { type: 'paragraph', text: 'The urban heat island effect also provides a marginal benefit. Dublin city centre is typically 1–2°C warmer than surrounding rural areas, which can slightly increase panel efficiency during cooler months (though excessive heat in summer is counterproductive, the Irish climate rarely gets warm enough for this to be a concern).' },
      { type: 'callout', variant: 'info', title: 'Dublin vs National Comparison', body: 'Dublin homes pay approximately 5–10% more for electricity than the national average (due to urban network charges), but also save 5–10% more with solar. The net financial advantage of going solar in Dublin is slightly better than in most other Irish counties.' },
      { type: 'heading', level: 2, text: 'Getting Started: Your Next Steps' },
      { type: 'paragraph', text: 'If you are a Dublin homeowner considering solar panels, here is a simple roadmap to get started:' },
      { type: 'numberedList', items: [
        'Check your eligibility — Use our free solar calculator to get an instant estimate of your potential savings and system size. You will need your ESB MPRN number and recent electricity bills.',
        'Get multiple quotes — Contact at least 3 SEAI-registered installers operating in your area. Compare not just prices, but panel brands, inverter options, warranties, and aftercare.',
        'Verify your roof — Your chosen installer will conduct a free survey (usually using satellite imagery and sometimes a physical site visit) to confirm your roof is suitable and identify any potential issues.',
        'Apply for the grant — Once you have chosen your installer, apply for the SEAI grant online. Your installer can usually assist with this process.',
        'Schedule installation — Most Dublin installations can be completed within 4–8 weeks of grant approval, subject to installer availability and weather conditions.',
        'Register for CEG — After installation, ensure your energy supplier is notified so you can start earning from your excess solar export.',
      ]},
      { type: 'paragraph', text: 'Dublin is an excellent place to go solar. The combination of high electricity prices, a competitive installer market, diverse and largely suitable roof types, and strong grant uptake means that Dublin homeowners are among the best-placed in Ireland to benefit from solar energy. With a payback period of just 5.5–6.5 years and 25+ years of free electricity ahead, there has never been a better time to make the switch.' },
      { type: 'divider' },
      { type: 'cta', text: 'Get a Free Dublin Solar Quote — See Your Savings', href: '/#calculator' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   HELPER: Get a single article by slug
   ═══════════════════════════════════════════════════════════════ */
export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/* ═══════════════════════════════════════════════════════════════
   HELPER: Get related articles (same category, different slug)
   ═══════════════════════════════════════════════════════════════ */
export function getRelatedArticles(currentSlug: string, limit: number = 3): Article[] {
  const current = getArticleBySlug(currentSlug);
  if (!current) return articles.slice(0, limit);

  const sameCategory = articles.filter(
    (a) => a.category === current.category && a.slug !== currentSlug
  );

  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  // Fill remaining slots with other articles
  const others = articles.filter(
    (a) => a.slug !== currentSlug && !sameCategory.includes(a)
  );
  return [...sameCategory, ...others].slice(0, limit);
}

/* ═══════════════════════════════════════════════════════════════
   HELPER: Get all slugs for sitemap generation
   ═══════════════════════════════════════════════════════════════ */
export function getAllArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}
