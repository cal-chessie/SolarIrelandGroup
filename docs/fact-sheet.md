# Fact sheet: the engine's figures for copy

Generated 16 Nov 2026 by running `src/lib/estimate.ts` and reading `src/lib/solar-data.ts` on branch `blog-numbers-one-source` (from main c0bd705). Every saving here is **our estimate**: panels only, no battery, conservative on purpose. If a post or page disagrees with this sheet, the engine is right and the copy is the defect. If the engine changes, rerun the calls below and update this sheet; `src/__tests__/blog-facts.test.ts` fails the test gate when a post's yearly saving, net cost, installed price, grant total or 4 kWp panel count stops agreeing with the engine.

## Assumptions (the inputs every figure below uses)

| Input | Value | Where it lives |
|---|---|---|
| Unit rate | 35c a kWh (bottom of the 35 to 38c market band) | `ENERGY.unitRateEur` |
| Standing charge | €250 a year, never removed by solar | `ENERGY.standingChargeAnnualEur` |
| Export rate | 18c a kWh, our estimate rate (each supplier sets its own; the CRU sets no minimum above zero) | `SOLAR_DATA.export.estimateRatePerKwh` |
| Yield | 950 kWh per kWp a year (good south-facing roof) | `SOLAR_DATA.system.generationPerKwp` |
| Panel size | 440 W | `PRICING.panelWatts` |
| Self-use, no battery | 30% to 50% of output, capped at daytime use (60% of usage unless a bill says otherwise) | `selfConsumptionRatio()` |
| 25-year model | unit rate +3% a year, output -0.5% a year, export income flat | `estimate().total25yrSavingsEur` |

## The two canonical systems

Typical home: 4,200 kWh a year (the CRU typical figure), which is a bill of about €143 a month.

| | 4 kWp | 6 kWp | Call |
|---|---|---|---|
| Panels (440 W) | **9** | **14** | `estimate({...}).panels` = round(kWp × 1000 / 440) |
| Installed price | **€8,200** | **€9,600** | `installCostEur(4)`, `installCostEur(6)` |
| SEAI panels grant | **€1,800** | **€1,800** | `seaiGrant(4)`, `seaiGrant(6)` |
| Net cost | **€6,400** | **€7,800** | `estimate().costAfterGrantEur` |
| Output a year | **3,800 kWh** | **5,700 kWh** | `estimate().annualGenerationKwh` |
| December / June output | **110 / 517 kWh** | **165 / 775 kWh** | `estimate().monthlyGeneration` |

### Yearly saving, by the home it sits on (`estimate({ annualUsageKwh, systemSizeKwp })`)

| System | Home | Used at home | Exported | Bill saving | Export income | **Yearly saving** | Payback | 25 years |
|---|---|---|---|---|---|---|---|---|
| 4 kWp | 4,200 kWh (typical) | 1,389 kWh (37%) | 2,411 kWh | €486 | €434 | **€920** | **7.0 yrs** | €26,799 |
| 4 kWp | 3,000 kWh | 1,140 (30%) | 2,660 | €399 | €479 | €878 | 7.3 | €24,881 |
| 4 kWp | 6,000 kWh | 1,619 (43%) | 2,181 | €567 | €393 | €960 | 6.7 | €28,562 |
| 6 kWp | 6,500 kWh (the home 6 kWp suits) | 2,119 (37%) | 3,581 | €742 | €645 | **€1,387** | **5.6 yrs** | €40,469 |
| 6 kWp | 4,200 kWh | 1,710 (30%) | 3,990 | €599 | €718 | €1,317 | 5.9 | €37,322 |
| 10 kWp | 11,000 kWh | 3,560 (37%) | 5,940 | €1,246 | €1,069 | €2,315 | 4.6 | €67,665 |

Bands across every home from 3,000 to 8,000 kWh a year (`estimate()` in a loop):

| System | Yearly saving | Export income | Payback |
|---|---|---|---|
| 4 kWp | €878 to €982 | €369 to €479 (copy says €410 to €480, the 3,000 to 5,000 kWh homes, `SOLAR_DATA.export.annualRange`) | 6.5 to 7.3 yrs |
| 6 kWp | €1,317 to €1,422 | €607 to €718 | 5.5 to 5.9 yrs |
| 10 kWp | €2,016 to €2,199 | €1,192 to €1,386 | 4.8 to 5.3 yrs |

Copy wording: "on our estimate, a 4 kWp system saves about €920 a year and a 6 kWp system about €1,390".

### Sized from a monthly bill (`estimateFromMonthlyBill(bill)`, semi-detached)

| Bill a month | Usage | Engine size | Panels | Yearly saving | Net cost | Payback |
|---|---|---|---|---|---|---|
| €100 | 2,714 kWh | 4 kWp | 9 | €878 | €6,400 | 7.3 yrs |
| €160 | 4,771 kWh | 4.5 kWp | 10 | €1,037 | €6,750 | 6.5 yrs |
| €200 | 6,143 kWh | 5.5 kWp | 13 | €1,276 | €7,450 | 5.8 yrs |
| €250 | 7,857 kWh | 7 kWp | 16 | €1,625 | €8,500 | 5.2 yrs |

## With a battery (priced, never in the site estimate)

`installCostEur(kwp, batteryKwh)` and `homeGrant(kwp, batteryKwh)`. The engine does not model battery savings; the battery is the consultant's to size and sell.

| System | Installed | SEAI grant | Net |
|---|---|---|---|
| 4 kWp + 5 kWh | €11,400 | €2,400 | €9,000 |
| 4 kWp + 10 kWh | €13,100 | €2,400 | €10,700 |
| 6 kWp + 5 kWh | €12,800 | €2,400 | €10,400 |
| 6 kWp + 10 kWh | €14,500 | €2,400 | €12,100 |
| 8 kWp + 10 kWh | €15,900 | €2,400 | €13,500 |

A 5 kWh battery adds €3,200 (`PRICING.batteryBaseEur + 5 × batteryPerKwhEur`), €2,600 after its €600 grant.

## Grants (`SOLAR_DATA`, `GRANT_SCHEDULES`, read on seai.ie 16 Oct 2026)

- Panels: up to €1,800, the full amount at 4 kWp or more (€700/kWp to 2 kWp, then €200/kWp to 4 kWp).
- Battery: a flat €600 for 5 kWh or more, nothing below. Up to €2,400 with the panels on one application.
- Higher welfare grant: up to €8,400 for panels, €600 for a battery, €9,000 in all.
- EV charger: €300.

## Monthly output of a 4 kWp system (`MONTHLY_GENERATION_SHARE` × 3,800 kWh)

Jan 125, Feb 182, Mar 315, Apr 422, May 505, Jun 517, Jul 494, Aug 426, Sep 334, Oct 228, Nov 141, Dec 110 kWh. April to September is 70% of the year.

## Still open for Cal (not changed on this branch)

- `SOLAR_DATA.savings.rangeLabel` "€800 to €1,400" and `label` "€1,100/yr" still drive the hero, StatsBar, FAQ, llms.txt, pricing.md, the manifest ("up to €1,400"), the services page and the chat prompt. €1,100 is close to the engine for a €160 bill (€1,037), and the range spans the 4 kWp floor to about a €200 bill, so they are defensible, but they are not the 4 kWp / 6 kWp figures the posts now quote.
- Posts that quote 35 to 45c a unit (heat pump post, smart meter post's peak rate) describe tariff bands other than our 35c estimate input; left as a different case.
