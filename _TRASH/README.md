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

## portal-demo/ (1 Nov 2026)

`PortalLandingClient`, `PortalDashboardClient` and the two portal `loading.tsx`
skeletons. /portal took any typed "reference" and /portal/<anything> opened a
made-up customer (sample name, reference SI-2026-0042, an 11-step timeline, a
project manager) with HTTP 200 on the live domain, and /portal itself was
indexable. A real homeowner could see a stranger's project (audit 1 Nov, 6f).
Both routes now render `src/app/portal/PortalNotice.tsx`: noindex, "your project
page link is in your emails", until the email sign-in exists. Do not restore
these as they are: they never read the reference and never fetched anything.
