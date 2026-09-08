# 07 · Content, SEO and the truth pass

What may be claimed, what has already been removed for being untrue, and every number currently living in copy.

← [README](README.md) · related: [01 What this is](01-what-this-is.md) · [09 Open items](09-open-items.md)

---

## The truth rules

These are not style preferences. Each one exists because something false shipped.

| Claim | Status |
|---|---|
| AI bill analyser that reads the day/night split from a bill | **Claimable.** It is a live feature. |
| WhatsApp click-to-chat as a contact channel | **Claimable.** It is a real `wa.me` link to a person. |
| SEAI-registered, ESB Networks NC6, grant paperwork prepared and submitted | **Claimable.** |
| The AI chat assistant | **Claimable.** It is live and scoped. |
| SMS or missed-call text-back | **Not on this site.** There is no Twilio or messaging provider anywhere in the codebase, checked across all nine API routes. Cal has said SMS is coming; until it ships, never promise it. (It *is* real on Renewably. Do not carry that across.) |
| An AI agent answering WhatsApp | **No.** The `whatsapp-*` edge functions in `supabase/functions/` are dormant scaffolding that nothing calls. Their existence is not a capability. |
| AI answering live phone calls | **No.** |
| Roof detection or satellite yield | **No.** Satellite imagery is context only. |
| "MCS certified" | **Never.** MCS is a UK-only scheme. Wrong jurisdiction for an Irish site. |
| Any aggregate rating, review count or install count | **Not without permissioned data.** See the removals below. |
| Office hours | **Never suggest them.** The front desk is open 24/7. The contact page once published "Mon-Fri 8-6, Sunday closed", contradicting both the 24/7 claim and the Google Business Profile. |
| A competitor's name | **Never.** Official sources only: seai.ie, esbnetworks.ie, CRU. |

### The grant payment question, and a correction I have to own

On 7 Sep I "corrected" copy that said the grant drops into your account, on the belief that it is always paid to the installer. **That correction was wrong.** Checked against SEAI's own scheme guide:

> Grants are paid into your nominated bank account once we receive the forms and the post-works BER has been published. Allow 4 to 6 weeks.

and, separately:

> Registered Contractors can offer the Homeowner the cost of works net of the grant amount. To do this, they can ask you to nominate their preferred bank account on the Request for Payment form.

So **both mechanisms are real**. SEAI's default is payment to the homeowner, about 4 to 6 weeks after the post-works BER. Net-of-grant is an option a registered contractor may offer, by having the homeowner nominate the contractor's account.

The site consistently describes the net-of-grant version (`FinancingClient`, `HomeSchema`, `terms`, the portal), which matches it quoting after-grant prices. The blog describes SEAI's default, and in three places asserts the grant is "never deducted from the installer's invoice", which is flatly false.

**Neither is wrong about the mechanism it describes; each is wrong to present its one as the only one.** Which Solar Ireland actually operates is Cal's to confirm, and it is in [09](09-open-items.md).

Sources: [SEAI solar electricity grant](https://www.seai.ie/grants/home-energy-grants/individual-grants/solar-electricity-grant) and the [Solar PV Scheme Application Guide for Homeowners](https://www.seai.ie/sites/default/files/grants/home-energy-grants/individual-grants/solar-electricity-grant/Solar-PV-Scheme-Guide.pdf).

**The lesson:** I removed a true statement because it disagreed with my belief, and did not check the official source before calling it a truth fix. A truth pass that does not cite a source is just a second opinion.

**There is no BER minimum for the grant.** Seven places said BER C3 or better was required. No such rule exists. The real requirements are: built and occupied before 2021, an MPRN, and a post-works BER. The real disqualifier is prior solar funding at the MPRN.

**No em dashes** in anything a customer or Cal sees. Twelve were removed sitewide in `63e75a7`, and `scripts/integrate-blog.ts` validates against them before it will write a blog file. Regex and parsing usages are exempt.

---

## What has already been removed for being untrue

Recorded so nobody restores it thinking it was an accidental deletion.

| Commit | Removed |
|---|---|
| `38f2c04` (3 Sep) | Two `AggregateRating` JSON-LD blocks claiming 4.9 from 127 reviews. The 127 also contradicted a "200+" claimed elsewhere. Plus a "4.9 from 200+ Reviews, rated excellent on Google and Trustpilot" card and three star badges. |
| `dd217af` (3 Sep) | A fabricated `FAQPage` schema auto-generated from blog H2 headings, which were not questions, paired with truncated body text that did not match the visible answer. **Never generate FAQ schema from headings.** |
| `e5069b3` (3 Sep) | "200+ Successful Installs" and "€1.1M+ Customer Savings" (invented counts). "Trusted by 200+ Irish homeowners". "€38k+ 25yr Savings" badge. Two placeholder install entries ("Client Home 1/2"). A newsletter form with a "~500 subscribers" claim and no backend. |
| `015ce45` (3 Sep) | A "Founded 2023" stat contradicting the "founded 2019" story. "Over 200 installations" and "€1.1 million saved". An invented "2,847+ surveys completed". A false claim that the SEAI grant applies in Northern Ireland (26 RoI counties only). An invented "€85 million 2026 allocation" and a fabricated "ECS Registration €250-500" fee, when the real process is the free ESB Networks NC6 notification. |
| `1c30569` (7 Sep) | Three named five-star testimonials on the booking page, labelled "real reviews from real Irish homeowners", with a "€1,400 saving". Nothing substantiated them. Also the per-home savings and payback figures in the install gallery, which were impossible under real pricing (4.8 years on 7.2 kWp). |
| `97d1e96` (7 Sep) | An SMS confirmation promise in five places. "Booking Confirmed!" changed to "Survey Request Received", because the form creates a lead, it does not book a slot. "We handle the full grant process" became "we prepare and submit it; approval is SEAI's decision". A "no quibbles" guarantee contradicted by the site's own Terms. |
| `cd4c7f4` (7 Sep) | A "€10,000 to €15,000 property value uplift" attributed to SEAI/BER, which neither ever said. |

> ⚠️ **An unresolved conflict.** An earlier session recorded the three names removed in `1c30569` (Sarah O'Brien, Michael Murphy, Emma Kavanagh) as **real and owner-confirmed, never to be flagged**. I removed them on 7 Sep as invented. One of those readings is wrong. The site currently carries no testimonials at all. **Cal decides.** See [09 Open items](09-open-items.md).

---

## Live truth problems found 7 Sep 2026

Verified directly in the source, not just reported. All four are the same class of bug: a correction that landed in one place and missed its siblings.

### Stale prices in the JSON-LD Google reads

`src/components/HomeSchema.tsx` still offers, in structured data:

- **"Standard Solar PV (4 kWp)"** at `price: "6500"`, after grant `"4700"` (lines 102, 107)
- **"Solar PV + Battery Storage"** at `price: "11000"`, after grant `"9200"` (lines 118, 123)

The real figures are €8,200 / €6,400 and the battery packages start at €11,400. These predate the 7 Sep pricing work. This is worse than stale body copy: it is machine-readable, Google may surface it in rich results, and it undercuts the real price by about €1,700.

### The EV charger grant says €600 in three places

Commit `9d3b37e` corrected €600 to **€300**, the real SEAI/ZEVI figure. It landed at `ServicesClient.tsx:220` and missed:

- `src/app/services/page.tsx:56`: "SEAI €600 grant available"
- `src/app/services/ServicesClient.tsx:106`: `grant: '€600 SEAI EV Grant Available'`
- `src/app/services/ServicesClient.tsx:116`: `{ label: 'SEAI Grant', value: '€600 Available' }`

So the same page states €600 and €300.

### The calculator's own data-sources panel contradicts the engine

`src/app/solar-calculator/SolarCalculatorClient.tsx:141` tells the visitor: *"We use the current average Irish unit rate (34c/kWh including VAT) and €200/year standing charges."*

The engine uses **35c and €250**. Commit `97d1e96` realigned that panel and missed this step description, which sits on the same page as the calculator it describes.

### An unsubstantiated aggregate survived the sweeps

`src/components/solar/CustomerInstalls.tsx:453-454` renders **"100% / Satisfaction rate"**. It is exactly the class of claim removed in `38f2c04`, `e5069b3` and `015ce45`, and it is still live.

### One thing that is fine

The `annualSaving` and `payback` fields in the `CustomerInstalls` data (lines 32-126) still hold the old impossible figures, but **nothing renders them**. `1c30569` removed the display and left the data orphaned. Dead, not dangerous. Worth cleaning up so nobody re-renders them.

---

## Figures living in copy

Not exhaustive: this sweep covered the main marketing and legal surfaces, not the 23 blog articles. Treat it as the map, then grep before you change a number.

### Consistent with the engine

`€1,800` grant appears correctly in roughly 25 places. `€8,200` / `€6,400` for 4 kWp appears correctly in `services/layout.tsx:6,10,28`, `ServicesClient.tsx:49`, `CountiesClient.tsx:130`, `FAQ.tsx:50,66`, `FinancingClient.tsx:718`, `api/chat/route.ts:48`. `€12,400` for 10 kWp. Package prices at `ServicesClient.tsx:161-222`. Self-consumption `30-50%` without a battery, `70-85%` with. Export `€0.20/kWh`. `0%` VAT. The 25-year panel performance warranty and the 5-year workmanship warranty.

### Ranges that sit around the canon rather than on it

Not wrong, but worth knowing they exist. `paybackYears` is canonically **6**, yet copy says "5 to 7 years" at `FinancingClient.tsx:570,722`, `SolarCalculatorClient.tsx:80`, `FAQ.tsx:66`, `api/chat/route.ts:59`. `avgAnnual` is **€1,100**, yet the page metadata leads with "up to €1,400/year" (`layout.tsx:146,148,170,172`, `manifest.ts:9`, `HomeSchema.tsx:15,73`), which is the top of the €800-1,400 range and defensible as "up to".

### Worth a second look

| Where | Figure | Why |
|---|---|---|
| `FinancingClient.tsx:722` | "€20,000–€35,000 in net savings over 25 years" | The canonical 25-year range is €30,000 to €50,000. The low end here is €10k under the floor. |
| `FinancingClient.tsx:82` | `annualSaving = netCost * 0.18` | The financing tool derives its own annual saving as a flat 18% of net cost instead of asking the engine. A fifth calculation, hiding. |
| `GrantInfo.tsx:461` | "Min. system 2 kWp" | Contradicts `DOMESTIC_MIN_KWP = 4` and the "never quote below 4" rule, on the home page. |
| `WhySolar.tsx:62` | "€800–€1,200 per year" | `FAQ.tsx:58` says €800 to €1,400 for the same system. Two ranges for the same claim. |
| `api/chat/route.ts:51` vs `:94` | battery "€3,500–€5,500" vs "€4,000-€5,000" | Two battery prices in one system prompt. |
| `ServicesClient.tsx:49` vs `:161` | 4 kWp at "€8,200 – €12,400" vs Essential 4 kWp at "€11,400" | Both true (one is panels only, one is a battery package) but the page never says so. A visitor sees two prices for "4 kWp". |
| `ServicesClient.tsx:177,200,223` | package paybacks 8-9 / 7-8 / 6-7 years | Correct: battery tiers pay back slower. But the site's headline payback of 6 years only touches the top tier. Make sure the two are never read side by side without context. |
| `PortalDashboardClient.tsx:129,185` | demo customer with a 6 kWp system | Fine as an above-average example, but it is mock data on an unauthenticated page. See [08](08-server-admin-portal.md). |

---

## SEO and structured data

**Indexing.** Google Search Console is verified by HTML file (`public/google98c426c622510056.html`). The sitemap is submitted and read: **35 URLs**, being 12 static pages plus 23 blog articles. Home was already indexed but stale from a pre-cleanup crawl, which is why GSC flagged "review snippets: 2 invalid" long after the fake rating markup had been deleted. Blog articles showing "discovered, not yet crawled" is normal.

**The finding that mattered:** the problem is authority, not indexing.

**AI crawlers are deliberately welcomed.** `robots.ts` names GPTBot, ChatGPT-User, OAI-SearchBot, Google-Extended, anthropic-ai, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Applebot-Extended, Amazonbot, Meta-ExternalAgent and cohere-ai. CCBot and Bytespider are blocked. `public/llms.txt` and `public/pricing.md` both exist.

**Schema traps already hit, do not repeat:**

- Blog-index schema (`CollectionPage`, `Blog`, breadcrumb) was emitted from `blog/layout.tsx`, so **every article inherited it**. Schema belongs in `page.tsx`, never in a shared layout.
- Duplicate `@id` values collided across `/blog` and `/services`.
- `/solar-calculator` carried an invisible schema-only `FAQPage` alongside its visible FAQ. Schema that does not match visible content is a Google policy violation.
- No `AggregateRating` or `Review` schema exists anywhere now. Keep it that way until there is permissioned proof.

**`og:image`** pointed at `solarireland.org`, a different domain, and per-page OG images now live in `public/` (`og-about`, `og-blog`, `og-contact`, `og-counties`, `og-financing`, `og-services`). There is no generic fallback.

---

## The blog

23 articles in `src/lib/blog-data.ts`, rebuilt through `scripts/integrate-blog.ts`, which validates section shapes, category ids, unique slugs, internal link targets and the em-dash ban before writing.

Eight were added in the AEO wave (are-solar-worth-it, the NC6 form, the install process, how to read your bill, the 3-bed semi, EV charging, Cork, BER) and about **34 fabricated or outdated statistics** were corrected across the 15 that existed: a 65,000-homes fiction, the grant-paid-to-installer error, a landlords-are-ineligible claim, the pre-2022 12m² planning rule, a fake customer quote, and invented supplier, Dublin and heat-pump tables.

Images: 6 photo-natural articles use the 6 real install photographs; the other 17 use editorial data graphics generated by `scripts/gen-blog-images.py` in the site's dark and yellow system. Cal's brief was blunt: *"obviously AI and sloppy, same images multiple times."* These are explicit stand-ins until real photography lands, and the shot list is in [`docs/NEXT_SPRINT.md`](../NEXT_SPRINT.md).

> The blog bodies were not re-swept in this pass. If a figure changes, the articles are the most likely place for a stale one to survive.
