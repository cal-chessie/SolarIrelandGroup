# 01 · What this is, and how to behave here

Read this first. It is the frame everything else sits inside.

← [README](README.md)

---

## The business

**Solar Ireland Group**, solarirelandgroup.ie. An Irish solar installer covering all 32 counties, with the SEAI grant applying in the 26 Republic of Ireland counties. SEAI-registered, Safe Electric / RECI, ESB Networks NC6 for domestic and NC7 for commercial.

The site is not a brochure. It is a working front office: an AI bill analyser that reads a real electricity bill, an AI chat assistant, a booking flow, and a lead engine that carries every intake into a platform which builds an estimate and emails it.

---

## The frame that changes how you work

**AISolar is the product. Solar Ireland is the golden client.**

Cal sells AISolar to installers. Solar Ireland is his own live deployment, the one he dogfoods for weeks so the frontend is right before another installer ever sees it.

So every change here is two changes at once: what it does for this installer, and what it proves about the product. When a lead flow is clumsy here, that is the flow every future AISolar client would inherit. His own words on why it matters:

> *"imagine when a potential client sees this and experiences this from an installer offering them aisolar or a customer feeling the 24/7 help desk"*

Practical consequences:

- A fix that only works because you special-cased Solar Ireland is not a fix.
- Learnings belong in `aisolar/docs/CLIENT_ONBOARDING.md`, so the next onboarding is faster.
- The two repos are separate and stay separate. See [04](04-aisolar-integration.md).

---

## Who you are working for

Cal is a **non-developer founder**. Drive the tooling yourself and explain plainly. He reads output carefully and catches real errors in it: the payback bug, the incoherent price table and the invisible daylight track were all his catches, not mine.

He wants a senior team's standard every turn. Institutional-grade, no junk, bulletproof. And he wants to be told the truth about state, not a reassuring version of it.

---

## Standing rules

Break any of these and the work is worse than not doing it.

**No em dashes.** Not in copy, not in a commit message, not in a reply to Cal. Anywhere a human sees it. `scripts/integrate-blog.ts` enforces it for blog content.

**No slop.** Plain words, active voice, short declarative sentences, Irish solar specifics. No marketing filler. No "a real person will answer".

**The front desk is open 24/7.** Never suggest office hours. The contact page once published "Mon-Fri 8-6, Sunday closed", contradicting both the 24/7 claim and the Google Business Profile.

**Truth pass, always.** Never claim SMS, WhatsApp automation, roof detection or AI phone answering on this site. Never promise an email that has not been sent. Never fabricate a statistic, a review or a count. Full table in [07](07-content-seo-and-truth.md).

**No testimonials without real permissioned proof.** Three were removed for being invented. The [marketing package](05-pricing-and-offers.md#the-marketing-package) is the mechanism designed to earn real ones.

**Official sources only.** seai.ie, esbnetworks.ie, CRU. **Never name a competitor**, anywhere, for any reason.

**Dead files go to `_TRASH`**, with a note. Never `rm`.

**No push without an explicit yes**, then prove it with `git ls-remote`. Merging to `main` is the go-live and is Cal's call.

**Verify with tools, never memory.** If you cannot run the check, say so rather than asserting.

---

## The vocabulary

This site speaks Irish solar. American or generic terms mark it instantly as not from here.

| Use | Never |
|---|---|
| SEAI grant | rebate, incentive |
| ESB Networks | the utility |
| NC6 (domestic), NC7 (commercial) | permit, permitting |
| site survey | inspection, assessment visit |
| MPRN | meter number, account number |
| export tariff, Clean Export Guarantee | net metering |
| BER | energy rating certificate |
| Safe Electric, RECI, I.S. 10101 | MCS, NICEIC, DNO, Ofgem (all UK) |
| Eircode | zip code, postcode |

Slugs, component names and asset filenames are Cal's call. Display copy follows the canon.

---

## The stance on numbers

The site gives a **close estimate**, never a proposal. The consultant proposes.

That single sentence explains most of the engine's design: conservative constants, panels only, no battery in the savings, a 4 kWp floor, and every figure chosen so the survey can meet or beat it. Cal on why the battery is left out: *"honest and cheaper and ultimately a consultants job to up sell, which leaves room and no ambiguity."*

An estimate the consultant has to walk backwards from is worse than no estimate. See [03](03-savings-engine.md).

---

## Where the canon lives

| | |
|---|---|
| Numbers | [`src/lib/solar-data.ts`](../../src/lib/solar-data.ts) and [`src/lib/estimate.ts`](../../src/lib/estimate.ts) |
| Vocabulary and truth rules | [`docs/site-canon.md`](../site-canon.md), and [07](07-content-seo-and-truth.md) here |
| Reasoning behind a decision | the git commit messages, which are unusually long on purpose |
| Everything else | this folder |

When two of those disagree, the source code wins for what the site does, and Cal wins for what it should do.
