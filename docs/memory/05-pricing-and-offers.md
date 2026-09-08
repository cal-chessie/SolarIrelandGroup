# 05 · Pricing and offers

**Source of truth: [`src/app/services/ServicesClient.tsx`](../../src/app/services/ServicesClient.tsx), priced by `installCostEur()` in [`src/lib/estimate.ts`](../../src/lib/estimate.ts).**

← [README](README.md) · related: [03 Savings engine](03-savings-engine.md) · [10 History and lessons](10-history-and-lessons.md)

---

## The three packages

Agreed with Cal 7 Sep 2026, commit `9ed3791`.

| Tier | System | Panels | Battery | List | After grant | With marketing package |
|---|---|---|---|---|---|---|
| Essential | 4 kWp | 8-10 | 5 kWh | €11,400 | €9,600 | €8,600 |
| Popular | 6 kWp | 12-16 | 7.5 kWh | €13,650 | €11,850 | €10,850 |
| Premium | 8 kWp | 16-20 | 10 kWh | €15,900 | €14,100 | €13,100 |

Panel counts are the 440 W maths, not a marketing range.

**The Popular battery is 7.5 kWh, not 10.** It was 10 kWh and that made Popular and Premium carry the same storage, so the ladder had no reason to climb. Cal set it to 7.5 to separate them. Do not quietly round it back up.

Panels only, no battery, is **€8,200 list / €6,400 after grant** at 4 kWp. That is the anchor price the whole engine is fitted to, and it appears across services, counties, financing and the FAQ.

---

## The marketing package

**€1,000 off any tier** for taking part: a photograph of the install and an honest review. A customer can opt out of either part and still take the discount on the other.

It reads as a discount, and it is one, but its real job is different. After the invented testimonials and the impossible install-gallery figures came off the site (commits `38f2c04`, `e5069b3`, `015ce45`, `1c30569`), **there is no permissioned proof left on this site at all**. The marketing package is the mechanism that legitimately earns photos and reviews, with consent, from customers who opted in for a stated benefit. That is why it is worth more than the €1,000 it costs.

Cal's reaction when this landed: *"you got me on the edge of my seat hahaha tel me."* It solves the proof problem and the price-objection problem with one offer.

---

## Where the package buttons go

`/solar-calculator?pkg=<tier>`, labelled **"Price this on my bill"**. Not WhatsApp.

Cal's instruction: *"while your there fixing those prices make sure you collect the button to the bill analiser and not whatsapp. bring with it the trigger and send it to the brief."*

So the tier travels with the lead as `packageInterest` through `submitLead` → `/api/lead` → `meta.packageInterest` → the agent, where it grows a paragraph in the customer letter and shows up in Cal's owner brief. He can see which package pulled the lead. See [04 AISolar integration](04-aisolar-integration.md#what-the-site-sends).

---

## The rule: one price is never fixed alone

This cost real credibility and it is the single most repeated mistake in this repo's history.

**What happened.** I corrected one tier and shipped a table offering 6 kWp with a battery at €6,500, sitting next to 4 kWp panels-only at €8,200. More system, more battery, less money. Cal: *"since you missed that big one i have to ask you now to check the whole website."*

Four more stale worked examples were hiding where no one greps: the financing page, a mortgage worked example, the site FAQ, a county page. Commit `cd4c7f4` cleaned them up.

**The procedure.** Any price change means:

1. Grep every euro figure across `src/app/**` and `src/components/**`, not just the file you are editing. [07 Content, SEO and truth](07-content-seo-and-truth.md) carries the inventory.
2. Recompute every derived figure that hangs off it: payback, monthly repayment, after-grant, per-year saving.
3. Render the pages and look at them. `bun run build` passing proves nothing about whether the table makes sense to a human.
4. Check the metadata too. Page descriptions carry prices and they were wrong for a week.

---

## Decisions not to reverse

Pulled from commit messages. Each was a deliberate correction, several of them Cal's own.

| Decision | Where it was set |
|---|---|
| Popular carries 7.5 kWh, to separate it from Premium | `9ed3791` |
| Pricing scales with size, never a flat per-kWp rate | `f9fb99b` |
| 4 kWp panels only is €8,200 / €6,400 after grant | `1c30569` |
| EV charger grant is **€300**, not €600 | `9d3b37e` |
| Workmanship warranty is **5 years** per the binding Terms, not the 10 marketing had claimed. Lead with the 25-year panel performance warranty instead, which is the stronger true number | `9d3b37e` |
| Payback is tier-dependent, not one flat number. Battery tiers run longer (8-10 / 7-9 years) than panels only | `9d3b37e`, `1c30569` |
| No property-value-uplift claim. The "€10,000 to €15,000 uplift, per SEAI/BER" line was unsubstantiated and attributed to a source that never said it | `cd4c7f4` |
| The 10 kWp panels-only price is €12,400, not the €17,800 a flat rate produced | `f9fb99b` |

---

## Open question

Cal described the ladder ambiguously once and I have never had a straight answer: **should the Most Popular badge sit on a no-battery 4 kWp tier instead of the 6 kWp?** Ask him. Do not move it on your own reading of the sentence.
