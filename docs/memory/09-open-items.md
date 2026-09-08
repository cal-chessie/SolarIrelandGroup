# 09 · Open items

Everything known-and-not-done, as of 7 Sep 2026. Nothing here is a suggestion for its own sake: each item is either Cal's stated intent, a verified defect, or a decision only he can make.

← [README](README.md)

---

## Cal's next builds

**1. Book a survey as the on-site next step.** His words: *"you should be able to book a survey on the website before we lose the lead to an estimate and them leaving the site. if we send the estimate to quick we lose them to email."*

The gap is concrete. Three buttons still say they book a survey and link to WhatsApp instead:

- `src/components/solar/HowItWorks.tsx:47`: "Book Free Survey", step 2 of the process
- `src/components/solar/GrantInfo.tsx:272-283`: "Book Free Survey", on the **eligible** outcome, which is the highest-intent moment on the home page
- `src/app/services/ServicesClient.tsx:708`: "book a free home survey"

Beyond relabelling those, the design question is where booking sits relative to the estimate email, so the lead is not handed to their inbox before the site has asked for the appointment.

The counties page was the same problem and is **done**: all 32 county cards and the page CTA now lead into the bill analyser, carrying `?county=` so the lead is never location-less.

**2. The 5-step onboarding form** replacing the generic exit popup (`ExitIntent.tsx`). Cal is sending a reference. His framing: not a "don't leave" message, a real onboarding.

---

## Blocking, in AISolar

**One row in `installers`.** Cal's tenant, `availability_status='available'`. Without it `survey_scheduler` fails "No available installers" (10 of the last 11 runs) and **no lead is ever actually booked**, whatever the site does. One insert. It is Cal's write to make.

**Deploy `agent-drain`.** Commits `5938f3c` (daytime cap) and `4b44426` (scale pricing, adaptive email) are on `golden-client-lead-engine` and not deployed.

```bash
cd ~/Desktop/SONSSONS/repos/AISolar/aisolar
bunx supabase functions deploy agent-drain --project-ref ywizcsulurxoqjdgnkvc --use-api
```

---

## Verified defects on this site

Each was checked in the source, not just reported. Details and line quotes in [07](07-content-seo-and-truth.md) and [06](06-frontend-and-mobile.md).

| What | Where | Why it matters |
|---|---|---|
| **Two chevrons never rotate** | `WhySolar.tsx:482`, `FAQ.tsx:190` | `animate={{rotate}}` with no `initial`; the motion shim discards the value. Cosmetic but it reads as broken. |
| **25-year floor understated** | `FinancingClient.tsx` FAQ answer | "€20,000–€35,000" against a canonical range of €30,000 to €50,000. |
| **"Min. system 2 kWp"** | `GrantInfo.tsx:461` | Contradicts `DOMESTIC_MIN_KWP = 4` on the home page. |
| **Two saving ranges for one claim** | `WhySolar.tsx:62` vs `FAQ.tsx:58` | €800-€1,200 against €800-€1,400 for the same system. `SOLAR_DATA.savings.rangeLabel` now exists to settle it; both should read from it. |
| **Two battery prices in one prompt** | `api/chat/route.ts:51` vs `:94` | €3,500-€5,500 and €4,000-€5,000. |
| **`.env.example` drift** | root | Missing `OPENROUTER_API_KEY`, `GOOGLE_MAPS_API_KEY`, `BILL_VISION_MODEL`, `CHAT_MODEL`. Documents `ZAI_API_KEY`, which nothing reads. |
| **Dead data still holding false figures** | `CustomerInstalls.tsx:32-126` | `annualSaving` and `payback` are no longer rendered but the impossible values are still in the file. |
| **A savings calculation outside the engine** | `CountiesClient.tsx` county card | "Est. savings" is `generationKwh * 0.31`, a blended rate invented for that card rather than the engine. |
| **`bun run lint` does not exit 0** | repo-wide | 24 errors, all pre-existing: mostly `setState` in effects and ref access during render in `motion.tsx`, `CookieConsent`, `Navbar`, `GrantInfo`, `BookSurveyClient`. The build is green and the tests pass. Treat lint as "no NEW errors", not "clean". |

Two prices for "4 kWp" on the services page (`:49` panels-only range, `:161` Essential package) are both true but the page never explains the difference. That is a copy problem, not a data one.

---

## Fixed 7 Sep 2026, later the same session

Kept here briefly so nobody re-reports them, and because two were symptoms of patterns worth recognising.

- **Counties FAQ clipped its own answers.** The grid was `max-h-[600px] overflow-y-auto`, a 600px inner scroll box holding 761px of collapsed content. Opening the last answer on a phone put it beyond the clip, so it read as covered by the section below. Nested scrolling inside a page is the pattern; avoid it.
- **All 32 county cards led to WhatsApp.** Now `/solar-calculator?county=<name>`, and `BillAnalyser` reads that param into the lead for both the domestic and commercial paths.
- **The chat FAB was a bare illustration.** A floating bee with no ground did not read as a control on a phone. Now a 60px dark glass disc with a yellow rim and a presence dot.
- **Chat replies ran off the screen.** `max_tokens` was 500, roughly 375 words. Now 300, with a prompt that says lead with the answer and stop at three sentences. Bubbles widened to 88% on phones.
- **Every blog byline was invented.** Fifteen articles were bylined "Cal O'Reilly", a person who does not exist, and eight to "Solar Ireland Team". All 23 are now Cal Chesters. The Article schema also carried `sameAs: linkedin.com/in/cal-oreilly`, a fabricated profile: removed rather than replaced with a guess. Author `jobTitle` is now "Founder, Solar Ireland" and `url` points at `/about`.
- **The portal demo timeline was five months stale.** March and April 2026 shifted to a journey running 6 Aug to a 22 Sep install, so a demo lands on today.
- **"Join thousands of Irish homeowners"** removed from the counties CTA. Same class as the invented counts stripped on 3 Sep.

Then a second round, all seven items Cal listed:

- **`HomeSchema.tsx` was offering stale prices to Google.** 4 kWp at €6,500/€4,700 and PV+battery at €11,000/€9,200, months after the real figures became €8,200/€6,400 and €11,400/€9,600. `AggregateOffer.lowPrice` was still the retired "from €4,500". **Now computed from `installCostEur()` and `seaiGrant()`**, so the only way it can drift is for the engine to move.
- **The EV charger grant said €600 in three places** (`services/page.tsx:56`, `ServicesClient.tsx:106,116`) while line 220 of the same file said €300. All three corrected. The €600 figures that remain in `blog-data.ts` are about the **discontinued battery grant** and are correct.
- **The calculator's data-sources panel said 34c/kWh and €200.** Now reads `ENERGY.unitRateEur` and `ENERGY.standingChargeAnnualEur` directly, so it cannot describe rates the calculator on the same page is not using.
- **"100% satisfaction rate"** removed from `CustomerInstalls.tsx`. Replaced with the SEAI grant figure, which is a fact.
- **The test suite is green, 21/21.** The failing test asserted a literal `1400`. It now asserts the invariant instead: the advertised average must sit inside the site's own stated range. `SOLAR_DATA.savings` gained `rangeMin`, `rangeMax` and `rangeLabel` so the range is canonical rather than prose.
- **Three "Book Free Survey" buttons opened WhatsApp.** `HowItWorks.tsx` step 2 and `ServicesClient.tsx` now go to `/book-survey`; `HowItWorks` step 3 "Get a Quote" became "Price It On My Bill" into the analyser. `GrantInfo`'s eligible outcome, the highest-intent moment on the home page, now offers **both** real next steps: book a survey, or see it on your bill. WhatsApp remains everywhere it is honestly labelled as a chat.
- **The financing page carried its own everything.** `annualSaving = netCost * 0.18` was a fifth savings model, and worse, its whole `SYSTEM_PRESETS` table was stale: an apartment at 2.64 kWp (below the floor, which we do not sell) for €4,500, a semi for €6,000, the maximum system for €10,500. So it was quoting monthly repayments on money nobody would be lent. The table is now **derived from the engine**: sizes 4, 5, 6, 8 and 9.7 kWp, prices from `installCostEur()`, and the annual saving from `estimate()` run against the household each array would have been sized for. Paybacks now spread 6.6 to 4.4 years.

---

---

## The blog: closed, 8 Sep 2026

All three items the first sweep left are now fixed and pushed (`398bdf6`).

- **The battery article's economics** were built on 833 kWh/kWp and a
  "€0.105 effective" export rate with no basis anywhere on the site. Rebuilt on
  the engine: 5,700 kWh for 6 kWp, export at the €0.20 CRU floor, so the
  battery is worth about €318 a year and pays back in roughly 10 years on its
  own €3,200.
- **The CEG export table** had a 4 kWp system exporting 800 to 1,200 kWh, which
  implies 68 to 79% self-consumption. That is what a battery achieves, not
  panels alone, so it understated export income about threefold. Now the real
  panels-only band.
- **The 25-year "contradiction" was not one.** €16,100 was net profit at flat
  prices; the canonical €30,000 to €50,000 is gross benefit with 3% annual
  rises. Two different quantities. The table now shows both rows and says which
  assumption each uses, rather than picking one and hiding the other.

**The lesson worth keeping:** two figures that disagree are not automatically
one error. Check whether they are measuring the same thing before you
"reconcile" them, because forcing agreement between a net and a gross number
produces a third figure that is true of neither.

## The blog needed its own pass (done 8 Sep)

Three agents swept the repo on 7 Sep. The site came back clean apart from what is listed above, which is fixed. **The 23 blog articles did not.** This is a scoped job, not a quick fix, and the line numbers are in `src/lib/blog-data.ts`.

**The 4 kWp price is understated in eleven places.** Every article predates the price consolidation and quotes ranges like "€4,200 to €6,200 after the grant" where the real figure is a flat €6,400. Lines 79, 106, 138, 1044, 1359, 1390, 1466, 1967, 1977, 1998, 2091. The Cork article's 6 kWp row (line 1050) is out too: it says €5,700 to €7,200 after grant against a real €7,800.

**Yield is modelled at 850 to 860 kWh/kWp**, not the canonical 950. Line 143 implies 857; line 4361 states 850 outright and then its own monthly table (line 4446) sums to 695.

**One article breaks the 4 kWp floor throughout.** `how-many-solar-panels-do-i-need-ireland` recommends "3 to 4 kWp" for one and two person homes (lines 4139, 4306) and lists a 3 kWp system as a valid option (line 4215).

**Unsourced statistics.** "More than 102,000 Irish homes" and "a record 34,088 installations in 2025, about 16% up on 2024" (line 60), restated with different precision at 1087 and 1726. A €2,400 launch grant (3632) and a "widely expected" drop to €1,500 (3595). A 2021-versus-2026 cost comparison with exact percentages (3649). BER improving "1 to 2 grades" (1807, 4714), which contradicts the site's own more careful line elsewhere that any installer promising a specific jump is guessing.

**One article contradicts itself on landlord eligibility.** `solar-panels-rental-property-landlord-guide` says landlords can claim (4635), then that the grant is for owner-occupiers and not rentals (4629, 4641), then that it is not available for buy-to-let (4656). Five other articles say landlords are eligible.

The grant-payment issue found in the same sweep is **already fixed** and is written up in [07](07-content-seo-and-truth.md), because the error there was mine, not the blog's.

---

## Decisions only Cal can make

**Which grant mechanism does Solar Ireland actually operate?** SEAI allows both: the default is payment into the homeowner's account about 4 to 6 weeks after the post-works BER, and a registered contractor may instead offer the price net of the grant, with the homeowner nominating the contractor's account on the Request for Payment form.

The site used to state the net-of-grant version as fact in seven places, including the promise *"You never have to pay the full amount and wait for a refund."* Cal: **"our company cant afford that error."** All seven are now rewritten to describe SEAI's actual default and to say we will confirm at quote stage which applies. The financing calculator still models the after-grant figure, because that is the true net cost, but it now carries a visible note that if the grant comes to the customer the amount borrowed at the start is the full price, not the net one.

**Still open:** Cal decides which he actually offers, and the copy then states it once, plainly. Until he does, the site promises nothing it cannot keep. Full detail in [07](07-content-seo-and-truth.md).

**A Lane 2 branding leak in the platform.** Several `agent-drain` handlers sign customer emails "The AISOLAR team" inside an otherwise tenant-branded wrapper. A Solar Ireland customer should never see the word AISolar. See [11](11-aisolar-backend.md).

**The testimonial conflict.** An earlier memory recorded Sarah O'Brien, Michael Murphy and Emma Kavanagh as **real and owner-confirmed**. I removed them on 7 Sep (`1c30569`) as invented. The site now carries no testimonials at all. If they are real and permissioned, they go back today. This needs his answer, not my judgement.

**`/admin` and `/portal` are unauthenticated pages showing invented customers.** No real data can leak, but they present fake names and a fabricated 18% conversion rate as this business's numbers, to anyone with the URL. `robots.ts` disallows them, which stops well-behaved crawlers and nothing else. The decision is what those pages are for, not a patch. See [08](08-server-admin-portal.md).

> **Cal's call, 8 Sep 2026: noted, fix in a few sessions.** Deliberately deferred, not forgotten. Do not quietly wire either page to real data in the meantime, and do not spend a session on it unprompted. When it comes up, the question to answer first is what these pages are *for*: a sales demo, a real customer portal, or neither. The answer decides whether they get auth, get rebuilt on live data, or get retired to `_TRASH`. Until then the risk is reputational only, and it is a known, accepted one.

**Rate limiting needs infra.** The current per-IP limiter is a `Map` in process: it does not survive a cold start or span instances. Upstash or Vercel KV, Cal's pick, then wire it.

**CSP is report-only.** `src/middleware.ts:34`, `ENFORCE_IN_PRODUCTION = false`. Correct for now. Flipping it needs clean report logs first.

**Unverified identity in structured data.** LocalBusiness `address`, the `sameAs` social handles and the blog article author still look unverified. Cal supplies real ones or they come out.

**Are the CustomerInstalls county photographs real permissioned installs?** Still unanswered. Real photography is a live gap; the shot list is in [`docs/NEXT_SPRINT.md`](../NEXT_SPRINT.md), and the [marketing package](05-pricing-and-offers.md#the-marketing-package) is the mechanism meant to earn it.

**Should the Most Popular badge move to the no-battery 4 kWp tier?** His ladder description was ambiguous. Ask.

---

## Deferred, known, not urgent

- The hero CTA row is cramped at 1280px. Desktop only.
- Chat header and footer tap targets are small.
- The amber and yellow balance across the site. Cal: *"not the end of the world, keep a balance of both."*
- The `schema.sql` header says 25 tables; there are 24.
- `README.md` says `npm install`; `bun.lock` is the authoritative lockfile.
- `bun run db:push` is a no-op echo stub.
- Five dormant edge functions in `supabase/functions/` that nothing calls. Harmless, but see the truth rule in [07](07-content-seo-and-truth.md): their existence is not a WhatsApp capability.
- The 23 blog article bodies were not re-swept for stale figures in the 7 Sep pass.
