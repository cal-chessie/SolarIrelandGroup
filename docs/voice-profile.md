# Solar Ireland Group voice profile

The brand voice for every page, county page, post and listing. Built 13 Nov 2026 with the brand-voice schema. When this file and a page disagree, the page is wrong.

```text
VOICE PROFILE
=============
Author: Solar Ireland Group (brand voice, not a personal fingerprint)
Goal: Irish homeowners, farmers and business owners trust the numbers enough to upload a bill and book the 15-minute call.
Confidence: High for web and listing copy (approved live sources below). Medium for social (four drafts only).

Source Set
- Cal's approved live copy: the home title and description (src/app/page.tsx), the three 13 Nov posts
  (high-winter-bills-is-solar-worth-it-ireland, seai-business-solar-grant-doubled-2027,
  farm-solar-2027-doubled-seai-grant-or-tams), the GBP and directory copy in
  INTAKE/images-incoming/gbp-ready/CITATIONS-AND-SOCIAL.md
- docs/site-canon.md (vocabulary and truth rules)
- The rest of the site copy, where it agrees with the two above

Rhythm
- Short declaratives, 8 to 20 words, with one longer sentence when a mechanism needs explaining.
- Answer first. "No, solar will not clear a December bill in December." Then the numbers, then the why.
- Two items beat three. Paragraphs of two to four sentences.

Compression
- Dense. Every sentence carries a number, a name or a step. No warm-up, no recap.

Capitalization
- Sentence case for headings and buttons. Proper nouns as the bodies write them: SEAI, ESB Networks, NC6, NC7, MPRN, BER, TAMS, Clean Export Guarantee, CRU.

Parentheticals
- Rare. Used for a source or a unit conversion, never for an aside or a joke.

Question Use
- Headings phrase the question people search ("How much sun does Roscommon get?"). Body copy answers; it does not ask rhetorical questions.

Claim Style
- Numbers and mechanisms over adjectives: "A 4 kWp system makes about 110 kWh in December and 517 kWh in June", never "huge savings".
- Every figure has a source (PVGIS, seai.ie, esbnetworks.ie, CRU, gov.ie) or comes from src/lib/estimate.ts. Prices and savings are never typed by hand.
- Say the honest limit out loud: "December is when panels make least", "TAMS ranks and selects". It earns the trust for the rest.
- Estimates are "close estimates", never proposals or guarantees.

Preferred Moves
- Lead with the reader's real situation (a winter bill, a farm shed, a bungalow roof), then the number.
- Name the step and who does it: "You apply on seai.ie", "We notify ESB Networks on the NC6 form".
- Show the date a fact was checked ("Last checked", "Updated").
- Irish vocabulary: SEAI grant, ESB Networks, NC6 / NC7, MPRN, site survey, BER, Safe Electric / RECI, Clean Export Guarantee, exempted development, townland.

Banned Moves
- The em-dash character, anywhere a person reads it. Exclamation marks.
- "Not X, it's Y" contrasts, throat-clearing ("Here's the thing"), pull-quote one-liners, adverbs doing emphasis.
- Fake proof: ratings, review counts, install counts, testimonials or photos without written permission. "#1", "leading", "trusted by".
- Naming any rival installer. "SEAI Registered Partner".
- Claims of SMS, WhatsApp automation, roof or satellite detection, or AI phone answering on this site.
- US and UK words: permit, utility, net metering, zip code, permitted development.
- Office hours. The front desk is open 24/7.

CTA Rules
- One journey: the Bill Analyser, then the free 15-minute call.
- Button labels, everywhere: "Check my savings" (opens the Bill Analyser) and "Book a free 15-minute call" (opens the intake at the time step). A phone link reads "Call +353 87 395 8424", the number always shown.
- Close a page with one invitation, not a stack of three.

Channel Notes
- Web: as above.
- Listings (GBP, Bing, Apple): the exact name "Solar Ireland Group", the 150-character description in CITATIONS-AND-SOCIAL.md, no keywords in the name.
- Social: one fact, one number, one link. Cal posts himself.
```

## Worked example: the Roscommon page (13 Nov 2026)

- H1: "Solar panels in Roscommon".
- Opening: "A south-facing roof in Roscommon makes about 929 kWh of electricity per kWp a year. On a €160 monthly bill that is about €1,017 a year back, and a payback of about 6.6 years after the €1,800 SEAI grant. Upload a bill to see your own figure. A free 15-minute call then turns it into a plan."
- Honest limit: "Roscommon gets about 5% less solar energy than Dublin on the same roof... a few months on the payback."
- Mechanism: "The roof and the house matter more. Roscommon has many bungalows and farmhouses with wide, unshaded roofs..."
- Steps with actors: "You apply online with your MPRN and name your installer." "We notify ESB Networks on the NC6 form."
