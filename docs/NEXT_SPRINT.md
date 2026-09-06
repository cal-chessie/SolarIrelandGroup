# Next Sprint — ordered to clear

6 Sep 2026. Ordered by leverage. CAL items are minutes; ME items queue behind their blockers.

## The order

1. **CAL · 2 min · THE HEARTBEAT**: Supabase dashboard → Integrations → Cron → new job, `* * * * *`, Edge Function `agent-drain`, POST. Until this exists nothing processes on its own.
2. **CAL · 2 min**: Postmark (server 20227465) → request approval out of practice mode. Until then only renewably.ie addresses receive.
3. **CAL · 1 line**: `bunx supabase functions deploy agent-drain ingest-lead --project-ref ywizcsulurxoqjdgnkvc --use-api` (rich solarbrief with estimate numbers).
4. **CAL · 5 min**: €5 credit on OpenRouter → flips vision + chat off free-tier congestion; optionally lets us regenerate any blog graphic as photography.
5. **CAL · when out and about**: real photos (shot list below) for blogs + landing page.
6. **ME (needs 1)**: follow-up sequence — estimate sent, no booking → nudge at day 2 and day 7, Cal-voice, no em dashes, tenant-branded.
7. **ME (needs CAL BotFather token)**: Telegram solarbrief to Cal's phone.
8. **ME (needs CAL Postmark domain verify)**: switch sender to survey.solar (`supabase secrets set POSTMARK_SENDER_EMAIL=hello@survey.solar`).
9. **ME**: /solar-calculator page — unify onto lib/estimate.ts, add capture (last un-wired surface).
10. **ME**: full-site em-dash sweep (emails + new work are clean; legacy copy is not) + brand-resolve the 4 dormant "AISOLAR team" signoffs.
11. **ME (needs CAL's real surveyor details)**: installer/surveyor roster row so survey_scheduler stops failing "No available installers".
12. **ME (needs 4)**: "Add your bill for a sharper estimate" page — magic link + vision extraction, updates the same lead.
13. **NEW SESSION**: AISolar frontend cleanup (Cal's declared thread; see memory handoff).

## Photo shot list (CAL — phone is fine, grey skies are GOOD, they read as real Ireland)

**Blog replacements** (17 designed graphics are live as stand-ins; every real photo you send replaces one):
- Finished roofs from the street: pebble-dash semi, terraced, bungalow, farmhouse — one each if possible
- Mid-install: scaffolding up, panels being carried/fitted, installer on roof (harness visible, permissioned)
- Details: inverter on the wall, battery unit, meter box, panel + clamp close-up, a bill with the unit rate visible (redact name/MPRN)
- A survey moment: surveyor + tablet at a door or attic hatch (permissioned)
- The van / any branding in the wild
- County flavour: any recognisable Cork or Dublin backdrop with a job in shot

**Landing page hero**: one wide, sharp, finished install — ideally golden hour, ≥2400px wide, shot level with the roof if you can get height. This replaces the current stock-look hero.

Drop them anywhere in the repo (or a folder on the Desktop) and say where — I'll crop, treat, dedupe and wire them.
