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
