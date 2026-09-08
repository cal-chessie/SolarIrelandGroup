# 03 · The savings engine

**One file: [`src/lib/estimate.ts`](../../src/lib/estimate.ts). One set of constants: [`src/lib/solar-data.ts`](../../src/lib/solar-data.ts).**

If you are about to change a euro figure, a percentage, a kWp figure or a payback anywhere on this site or in the AISolar agent, read this whole page first.

← [README](README.md) · related: [05 Pricing](05-pricing-and-offers.md) · [04 AISolar integration](04-aisolar-integration.md)

---

## Why it is one file

Before 7 Sep 2026 there were **four** engines: this one, a copy inside `QuickSavingsCalculator`, a third with different constants in `/api/analyse-bill`, and a fourth inline in AISolar's `handleLeadIntake`. The same bill produced different answers on the site and in the emailed PDF. They are now consolidated.

**Nothing may fork it again.** The AISolar agent still mirrors the maths inline, because a Deno edge function cannot import from the Next app. That mirror is the one permitted copy and **the two must be changed together**. See [04 AISolar integration](04-aisolar-integration.md#the-mirrored-engine) for the parity table.

Two more forks were found and closed later the same day, which is the pattern worth recognising: a fork does not announce itself as an engine, it hides as one innocuous line.

- `FinancingClient.tsx` computed `annualSaving = netCost * 0.18`, a flat 18% of the price. Its `SYSTEM_PRESETS` table also carried its own stale prices and a 2.64 kWp option below the floor. Both now derive from `installCostEur()` and `estimate()`.
- `HomeSchema.tsx` typed its prices into JSON-LD, where they went stale invisibly for months. Now computed.

**The rule that follows:** if a file states a price, a saving or a payback, it must import it. A literal is a fork waiting to go stale. The one legitimate exception is `PRICING` itself, which is Cal's commercial decision, and the constants in this file, which carry their evidence.

### Places that correctly read from the engine

`QuickSavingsCalculator`, `/api/analyse-bill`, `SolarCalculatorClient` (including its data-sources panel), `ServicesClient`, `FinancingClient`, `HomeSchema`, `CustomerInstalls`, and the AISolar agent's inline mirror. If you add a surface that shows a number, add it to this list.

---

## The stance: a close, not a proposal

The site produces a **close estimate**. The consultant proposes. Everything follows from that:

- **Deliberately conservative.** Every figure should be one the survey can meet or beat. An estimate the consultant has to walk backwards from is worse than no estimate.
- **Deliberately panels only.** No battery in the cost, no battery in the savings. A battery lifts self-consumption from roughly 40% to roughly 75%, and that gap is the consultant's to size, price and sell on the day. Quoting it here spends their upside and commits us to a number nobody has surveyed.
- **4 kWp is the floor and the typical system.** Nothing smaller is sized, quoted or shown in a comparison.

Cal's words: leaving the battery out is *"honest and cheaper and ultimately a consultants job to up sell, which leaves room and no ambiguity"*.

---

## Evidenced constants

Checked 7 Sep 2026. Each has a source. Change one only with new evidence, and update this table when you do.

| Constant | Value | Where | Evidence |
|---|---|---|---|
| Yield | 950 kWh/kWp | `ENERGY.generationPerKwp` via `SOLAR_DATA.system` | PVGIS: south-facing 30° in Dublin ≈ 972 after standard 14% system losses; national average ≈ 884. 950 describes a good roof without pretending every roof is one. |
| Unit rate | €0.35 | `ENERGY.unitRateEur` | Electric Ireland standard 24hr rate from 1 Jul 2026 is 38.04c incl VAT; market sits 35-38c. We take the bottom of the band so we never overstate. |
| Standing charge | €250/yr | `ENERGY.standingChargeAnnualEur` | Electric Ireland €250.77 incl VAT. **Solar never removes it**, so it is stripped out before usage is derived from a bill. |
| Export | €0.20/kWh | `SOLAR_DATA.export.ratePerKwh` | CRU minimum Clean Export Guarantee obligation (CRU/24/019). Suppliers pay 18.5c to 24c; the regulated floor is the safe figure. |
| Self-consumption | 30% to 50% | `SELF_USE_MIN` / `SELF_USE_MAX` | An Irish home with **no battery** (35-45% typical). The old engines used 65-80%, which only a battery reaches. |
| Daytime share | 0.6 | `DEFAULT_DAY_SHARE` | Share of household electricity used while the sun is up. Overridden by a real bill's day/night split. |
| Panel degradation | 0.5%/yr | `ENERGY.panelDegradationPerYear` | |
| Energy price inflation | 3%/yr | `ENERGY.energyPriceInflationPerYear` | Applied to the unit rate in the 25-year model. Export income is held **flat**: the CEG rate is not guaranteed to rise. |
| Grid CO2 | 0.29 kg/kWh | `ENERGY.co2PerKwh` | EirGrid grid intensity. |
| Tree absorption | 22 kg/yr | `ENERGY.co2PerTreePerYear` | |
| SEAI grant | €1,800 cap | `SOLAR_DATA.grant.amount` | Tiered: €700/kWp for the first 2 kWp, then €200/kWp to 4 kWp. Full €1,800 at exactly 4 kWp. |
| EV charger grant | €300 | | SEAI/ZEVI. **Not €600.** |
| Panel size | 440 W | `PRICING.panelWatts` | Drives the panel count shown to customers. |

Also canonical, in `solar-data.ts` and used by the hero and StatsBar: `avgAnnual: 1100`, `paybackYears: 6`, `total25yr: 30000`, plus the range `rangeMin: 800` / `rangeMax: 1400` / `rangeLabel: '€800 to €1,400'` and `range25yrLabel: '€30,000 to €50,000'`.

**If the engine and these disagree, the hero contradicts the calculator on the same page.** `src/__tests__/unit.test.ts` guards the relationship: the advertised average must sit inside the site's own stated range. That test used to assert a literal `1400` and simply went red when the honest figure became 1100, which is the wrong shape for a test here. Assert relationships, not values.

---

## The three rules that are easy to get wrong

### 1. 4 kWp is the domestic floor

`DOMESTIC_MIN_KWP = 4`, enforced in `sizeSystemKwp()` by clamping to `Math.max(home.minKwp, DOMESTIC_MIN_KWP)`.

Cal's reasoning, verbatim: *"please dont assume there is room in the domestic market for any less that 4kw systems, that should be the average, anything less than that is honestly not a good investment. a home owner should be promoted to aim for max grant and max savings and 4kw is usually the sweet spot."*

Mechanically: below 4 kWp the fixed costs (scaffolding, design, commissioning, the ESB paperwork) barely move while generation and grant both fall away, and 4 kWp is exactly where the grant tops out. Comparison tables run **4, 5, 6, 7, 8** kWp (`systemOptions()` default).

Because every quoted system is at or above the floor, `seaiGrant()` always returns the full €1,800 in practice and the site can say €1,800 without a caveat. The tier maths below the floor is kept only so the function stays truthful if ever called with a smaller size.

### 2. Pricing scales with size

A flat per-kWp rate overpriced every large system badly enough to lose the lead. Cal: *"the bigger the system the better the price, if people seen those prices id never get a lead lol."*

```
installCost = €1,800 base
            + €1,600/kWp for the first 4 kWp
            + €700/kWp for everything above
            + battery (€1,500 + €340/kWh) when one is priced
```

Fitted to the two prices Cal confirmed: **4 kWp panels only = €8,200**, **8 kWp with a 10 kWh battery = €15,900**. Exposed as `installCostEur(kwp, batteryKwh)`. The rationale is physical: scaffolding, design, commissioning, ESB paperwork and the day's labour barely move between a 4 kWp and an 8 kWp roof, so almost all of the extra cost is panels and mounting.

`PRICING` is the one block in this file that is **a commercial decision, not evidence**. It is Cal's to set.

### 3. Self-consumption is capped on DAYTIME demand

This is the fix that made payback honest, and Cal found the bug himself: *"the payback is wrong it always avergaes out the same because the bill savings are against the bill size."*

He was right. The model capped self-consumption on **total** usage, so a €60/month house and a €90/month house came out with the same saving and the same payback. The model was effectively dividing the bill by itself.

```ts
const daytimeUsageKwh = input.dayUsageKwh && input.dayUsageKwh > 0
  ? input.dayUsageKwh                       // a real bill's day/night split
  : annualUsageKwh * DEFAULT_DAY_SHARE;     // 60% otherwise
const selfConsumedKwh = Math.round(Math.min(annualGenerationKwh * ratio, daytimeUsageKwh));
```

You cannot use solar you are not at home to use. A 4 kWp array on a house burning 1,300 kWh a year, mostly in the evening, cannot have that power used at midday just because the array is big enough to make it.

Payback now spreads properly: **7.3 years at €60/month, 6.2 at €160, 4.6 at €400.**

---

## Two more subtleties worth knowing

**Bill reduction is measured against what the bill actually falls to**, not against total benefit. On a low-usage home a 4 kWp array can earn more than the bill, which used to read as "100% off your bill". It never is: the standing charge stays and the surplus is export **income on top**, not a discount. `annualBillAfterSolarEur` floors at the standing charge, and anything above that is stated as earnings.

**The 25-year model** (`total25yrSavingsEur`) compounds the unit rate at 3% and degrades generation at 0.5%, year by year, with export income flat. It re-derives self-use each year against the same daytime cap.

---

## The public API

| Function | Use |
|---|---|
| `estimate({annualUsageKwh, homeId?, systemSizeKwp?, unitRateEur?, exportRateEur?, dayUsageKwh?})` | The engine. Returns the full `EstimateResult`. |
| `estimateFromMonthlyBill(monthlyBillEur, homeId?)` | For surfaces that only know a monthly bill. |
| `usageFromMonthlyBill(monthlyBillEur)` | Annual kWh from a bill, standing charge removed first. |
| `sizeSystemKwp(annualUsageKwh, homeId?)` | Sizes to about 85% of annual usage, clamped to the roof type and never below the floor. |
| `seaiGrant(kwp)` | The tiered grant. |
| `selfConsumptionRatio(gen, usage)` | Slides 50% down to 30% as the array outgrows the house. |
| `installCostEur(kwp, batteryKwh?)` | Scale-aware install price. |
| `systemOptions(usage, sizes?, opts?)` | The comparison table rows. |
| `recommendedSize(usage, homeId?)` | Alias of `sizeSystemKwp`. |
| `fmtEur(n)` | Formatting. Use it rather than inlining `€`. |

`HOME_TYPES`: apartment/terrace 4-6 kWp, semi-detached 4-8, detached 4-9.7. `MONTHLY_GENERATION_SHARE` carries the Irish seasonal shape (Jan 3.2% up to Jun 13.4%).

---

## The rule Cal made me learn

**Fix one price and you have broken the table.** I corrected a single tier and shipped a page offering 6 kWp with a battery at €6,500 next to 4 kWp at €8,200. Cal: *"since you missed that big one i have to ask you now to check the whole website."* Four more stale worked examples were hiding in prose, FAQ answers and county pages.

Any change to a number means grepping **every** figure on the site (services, counties, financing, FAQ, blog worked examples, page metadata) and rendering the pages to look at them. `bun run build` passing proves nothing about whether the table makes sense to a human. See [07 Content, SEO and truth](07-content-seo-and-truth.md) for the inventory of hard-coded figures in copy.
