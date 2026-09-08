# 10 · History and lessons

Why this repo looks the way it does, and the mistakes that shaped it. Read this before deciding something here is arbitrary.

← [README](README.md)

---

## The arc

**July to early September 2026**: the site was built, then taken through a full A* pass with an audit swarm: accessibility, security, schema, an AEO wave, then two adversarial re-audit waves. Merged to `main` on 3 September, which is the go-live.

**3 September**: the truth pass. Four commits stripped invented ratings, invented counts, a fabricated FAQ schema and a false Northern Ireland grant claim. Detail in [07](07-content-seo-and-truth.md).

**6 September**: brand authority day. GSC verified, sitemap submitted and read, indexing requested on six priority URLs. The finding: the problem is authority, not indexing. Also the lead funnel to AISolar was wired and proven end to end. And the blog: 8 new articles, 34 fabricated statistics corrected across the existing 15, 23 unique images replacing the AI-looking duplicates.

**7 September**: the big one. Four savings engines consolidated into one. Every constant re-evidenced. The 4 kWp domestic floor set. Pricing rebuilt to scale with size. The packages rebuilt three times as Cal corrected the specs. The daytime-demand cap that made payback honest. Two silent breakages found in the AISolar chain, both invisible for weeks. The marketing package designed.

---

## The mistakes, and what each one taught

Written down because I made every one of them and Cal found most of them first.

### Fixing one price and leaving its siblings

I corrected a single tier and shipped a table offering 6 kWp with a battery at €6,500, next to 4 kWp panels-only at €8,200. More system, less money. Cal: *"since you missed that big one i have to ask you now to check the whole website."* Four more stale worked examples were hiding in the financing page, a mortgage example, the FAQ and a county page.

**The lesson:** a figure is never in one place. Change one, grep them all, then render and look. This exact failure repeated inside the same week: the EV grant correction landed in one spot and missed three, and the price correction never reached the JSON-LD. Both are still open in [09](09-open-items.md).

### Treating an empty result as a clean result

A workflow returned `{}` and I nearly reported it as all-clear. All six of its agents had died on a session limit. The real findings were sitting in `journal.jsonl`.

**The lesson:** absence of findings is not a finding. Verify the run happened before you trust what it says.

### Blaming the last thing in the chain

"Estimates never fire" was blamed on Postmark for an hour. Postmark was never the problem. The DB trigger had never matched the site's source values, so **no website lead had ever auto-enqueued**, and every past success had been a manual drain.

**The lesson:** when an automated thing "sometimes works", check whether the automated path has ever actually run before debugging the thing at the end of it.

### Reporting my own constraint violation as Cal's bug

I set `trigger_type: "manual_verify"` on an `agent_runs` insert, which violated a check constraint that only accepts `cron`, `manual` and `db_trigger`. Then I nearly reported the missing row as a pre-existing bug in his audit trail. (The failure column is `error_message`, not `error`, which cost more time on top.)

**The lesson:** when your own test leaves no trace, suspect your own test first.

### A temporal dead zone that crashed every production lead

`hasRealBillRead` was declared **after** the `pdfInput` block that read it. `succeeded: 0, failed: 1` on every single live lead until it was hoisted (`4728b35`).

**The lesson:** a Deno edge function will not warn you the way a bundler would. Read the order, not just the logic.

### Getting the two PDFs backwards

I sent the rich document to manual entry and the thin one to a real bill read. Cal: *"youve confused the 2 the full pdf comes from the bill insight and is more richer. the manual should be the 2 pages you previously had on one page."*

**The lesson:** the richer input earns the richer document. Written into [04](04-aisolar-integration.md#two-paths-two-documents) so it cannot be re-derived wrongly.

### Shipping something invisible

The daylight track went out as a 14% white hairline with 11px grey text over a photographic hero. Cal: *"you have completely fucked the sun setting icon. you can barely see it."*

The PDF space guard silently dropped rows twice, off by 1pt then by 7pt. Only rendering to PNG and looking caught either.

**The lesson:** contrast and layout are not verifiable by reading code. Render it and look at it.

### Screenshotting stale builds

Repeatedly. Reported fixes that had not shipped.

**The lesson:** `preview_stop` then `preview_start` after every rebuild. Always.

### Nearly running a destructive migration command

I almost had Cal run `bunx supabase db push`, which would have applied migrations that were deliberately held back. Then, having caught that, I handed him raw multi-line SQL to paste, and he hit a dangling `function>` prompt in zsh.

**The lesson:** give him the SQL editor URL. Never a db push, never multi-line SQL into a shell.

### Cal finding a modelling error I had not

*"the payback is wrong it always avergaes out the same because the bill savings are against the bill size."*

He was right. The model capped self-consumption on total usage, so it was effectively dividing the bill by itself and every house got the same payback. The daytime cap fixed it. See [03](03-savings-engine.md).

**The lesson:** when a number looks suspiciously stable across different inputs, the model is probably feeding on itself.

---

## The habits that came out of it

**Re-audit after your own sweep.** Two adversarial waves after the build waves each caught real shipped bugs that grep had missed. Non-negotiable now.

**Verify with tools, never memory.** "Pushed" means `git ls-remote` shows the sha. "Live" means you hit the endpoint or read the file. If you cannot run the check, say so.

**Commit messages carry the reasoning.** This repo's messages are unusually long on purpose, and they are the record of *why*. `git log -S'<a figure>'` is genuinely the fastest way to find out whether a number was deliberate.

**Dead files go to `_TRASH`, never `rm`.** With a note saying what they were.

**Accept a reversal immediately.** When Cal changes a call, adopt it and update the notes to match. Do not re-litigate.

**Say it how it is.** Reproduce his points in his voice, sharp. Polished paraphrase reads as evasion to him.

---

## Decisions not to silently reverse

Each was a deliberate correction. Reversing one by accident undoes real work.

| Decision | Set in |
|---|---|
| One savings engine, `src/lib/estimate.ts`. The AISolar mirror is the only permitted copy | `0497d78` |
| `DOMESTIC_MIN_KWP = 4`. Never quote below it | `c740916` |
| Pricing scales with size; never a flat per-kWp rate | `f9fb99b` |
| Popular carries 7.5 kWh, to separate it from Premium | `9ed3791` |
| The grant is modelled as a flat €1,800, because nothing under 4 kWp is quoted | `97d1e96` |
| No BER minimum for grant eligibility. The real disqualifier is prior solar funding at the MPRN | `97d1e96` |
| "MCS certified" never appears. UK-only scheme | `97d1e96` |
| EV charger grant is €300 | `9d3b37e` |
| Workmanship warranty is 5 years per the binding Terms. Lead with the 25-year panel warranty | `9d3b37e` |
| Payback is tier-dependent, not one flat number | `9d3b37e`, `1c30569` |
| The chat assistant is solar-only, may not fabricate, and must refuse prompt extraction and role-play override | `a157621` |
| No em dashes in customer-visible strings | `bf9a173`, `63e75a7` |
| No aggregate ratings, review counts, install counts or savings totals without permissioned data | `38f2c04`, `e5069b3`, `015ce45` |
| The home page has one intake: `BillAnalyser` | `52189da` |
| FAQ schema is never generated from blog headings | `dd217af` |

---

## Bug classes worth recognising

Fixed once, likely to recur.

**Half-applied corrections.** A figure updated in the obvious place and missed in metadata, JSON-LD, a FAQ answer or a county page. The most frequent bug in this repo.

**The motion shim swallowing an animation.** Object-style `animate` renders nothing. See [06](06-frontend-and-mobile.md#the-motion-shim).

**Schema in a shared layout.** Blog-index schema in `blog/layout.tsx` leaked onto every article. Schema goes in `page.tsx`.

**Breakpoint dead zones.** The navbar hamburger was `lg:hidden` while its menu was `md:hidden`, so 768-1023px opened a blank locked screen. The desktop nav then broke at 1024-1099px because it needed 1100px. Test the bands, not just the presets.

**Mobile inputs under 16px.** iOS zooms on focus and does not zoom back.

**`type="number"` accepting `e`, `+` and `-`.** Parsed to NaN, and the field was silently dropped from the lead.

**tailwind-merge quirks.** `py-4` does not override the `Button` component's `h-9`. Buttons came out at 36px. `h-auto` fixes it.

**Success shown regardless of outcome.** The booking form opened a WhatsApp popup (blocked on iOS) and then rendered "Booking confirmed" whatever happened. Never claim an outcome the code did not observe.

**Unclipped decorative elements.** 500-700px glow orbs made the home page scroll sideways by 125px on a phone.
