# Retired files

Not deleted, parked. Restore with `git mv` if a decision reverses.

## HomeEstimateIntake.tsx.retired (7 Sep 2026)

A bill-and-house-type lead form for the home page. It worked, but it was
removed from the page in commit 0ddf961 ("restore the AI bill analyser as the
homepage centrepiece") so the home page had one intake rather than two forms
competing on the same screen. Nothing has imported it since.

It stayed dangerous while it sat in src/: its own header comment called it "the
home page's single lead engine", which is why a later pass treated it as the
canonical consumer of lib/estimate.ts. It was the only importer of that engine,
so the engine looked live while three copies of the maths did the real work.

The home page's intake is BillAnalyser. The 5-step onboarding form replacing the
exit popup is the natural home for this idea if it comes back.

## ExitIntent.tsx.retired, BillAnalyser.tsx.retired, QuickSavingsCalculator.tsx.retired (4 Nov 2026)

Retired in the Apple pass on the intake (INTAKE/design/APPLE-DECISIONS.md,
"Doors"), after a grep showed nothing imports them and the build stayed green.

- ExitIntent: the old exit popup. It collected an email ("Get my free
  estimate") and then offered /book-survey and /solar-calculator, so it was a
  second intake on eight pages. PageIntake no longer mounts it; the
  trackExitIntent event helper went with it.
- BillAnalyser: the old long-form bill analyser. Not mounted anywhere since
  the intake replaced it on /solar-calculator; trackBillAnalyserUsage went
  with it, and so did trackCalculatorUsage (its only caller).
- QuickSavingsCalculator: an orphaned calculator with its own copy of the
  maths. Not mounted anywhere. One engine only (src/lib/estimate.ts, and the
  intake renders AISolar's quote).

Still in src on purpose: src/app/book-survey/BookSurveyClient.tsx. /book-survey
is now a 308 to the intake, but a returning homeowner's magic link (?lt=)
still renders that form, which threads the lead token into /api/lead. It can
retire once the magic link moves to the portal sign-in exchange.

## 4 Nov 2026: BillAnalyser restored
Cal: "leave the bill analyser on the front of the website alone". src/components/solar/BillAnalyser.tsx is back in src (from 061c190) and on the homepage again in place of IntakeDoorSection. The .retired copy here is now stale; keep it only as history.

## BillAnalyser.before-call-funnel.tsx.retired (4 Nov 2026)

Cal's Bill Analyser as it stood at 7f8626c, before the call funnel rebuild
(INTAKE/design/analyser-cro-spec.md, CALL-FUNNEL-PLAN.md). Retired because it
showed invented figures on a half read (160 / 4800), the supplier table's
rates as the customer's own, a two-month bill as "/mo", threw away the
day/night split, ran its own engine (a second number for the same bill), and
ended in "Send my full estimate" then "Pick my survey time". Replaced by
src/components/solar/BillAnalyser.tsx (read, reveal, one insight, one AISolar
saving, the free 15-minute call). Nothing imports this file.

## 5 Nov 2026: rollback to the live site
Cal: "wtf are you doing changing my whole fucking site". Every file outside the Bill Analyser and the manual intake (/estimate) was restored to the live site (dbbf329). Files the branch had added outside that set are parked here under rollback-2026-11-05/. Kept: BillAnalyser.tsx, components/intake, lib/intake, lib/analyser, app/estimate, api/intake, api/analyse-bill, lib/eircodeLookup.ts, their tests, plus two invisible helpers (lib/bottomLayer.ts intake flag, eslint.config.mjs warnings).

## 9 Nov 2026: /book-survey becomes the call ask
Cal's 12/10 brief: every road ends in the free 15-minute call. The old /book-survey survey form (date and time picker, property questions, /api/lead post) is parked as twelve-2026-11-09/BookSurveyClient.survey-form.tsx.retired. The URL stays (live estimate emails link to it with ?lt=); the page now renders the shared call ask. Nothing imports the parked file.
Also 9 Nov: the old savings slider (components/solar/QuickSavingsCalculator.tsx), the site engine's second number under the Bill Analyser on /solar-calculator, is parked as twelve-2026-11-09/QuickSavingsCalculator.slider.tsx.retired (Cal said yes). Nothing imports it.
Also 9 Nov: the old exit popup (an email box plus "Free 15-minute call", fired on tab return, any scroll-up and a 60-second idle timer, including over half-filled forms) is parked as twelve-2026-11-09/ExitIntent.email-popup.tsx.retired. Replaced by the exit quiz in components/solar/ExitIntent.tsx.

## portal-demo/ (1 Nov 2026)

`PortalLandingClient`, `PortalDashboardClient` and the two portal `loading.tsx`
skeletons. /portal took any typed "reference" and /portal/<anything> opened a
made-up customer (sample name, reference SI-2026-0042, an 11-step timeline, a
project manager) with HTTP 200 on the live domain, and /portal itself was
indexable. A real homeowner could see a stranger's project (audit 1 Nov, 6f).
Both routes now render `src/app/portal/PortalNotice.tsx`: noindex, "your project
page link is in your emails", until the email sign-in exists. Do not restore
these as they are: they never read the reference and never fetched anything.

## StatsBar.tsx.retired and homepage-restructure-2026-11-11/ (11 Nov 2026)

StatsBar was cut from the homepage in the restructure (INTAKE/design/homepage/
DECISIONS.md): four averages above the analyser competed with the visitor's own
figure, and it was already hidden on phones. Nothing else imported it.

`homepage-restructure-2026-11-11/` keeps the pre-restructure versions of the
homepage-only sections (Hero, HowItWorks, WhySolar, CustomerInstalls,
GrantInfo) as `.before.tsx.txt`, so any copy or claim Cal wants back (NSAI
Compliant, 1-Day Install, Premium Panels, "Up to 70%", "25+ year", "Battery
Options Available") can be restored from the exact original.
