# Content standard: the national blog and every page that carries copy

Agreed by Cal on 15 Nov 2026, after a review of the whole blog (30 posts, average 4.9 out of 10). Read this before writing or changing any post. County pages follow this standard too, plus the HARD RULES in `docs/county-page-playbook.md` (branch `county-pages-preview`).

Cal's aim, in his words: "Clearly it's the same person writing it, the content sounds deeply human and native to Ireland, no bullshit education, and of course the best copywriting in the world to influence, persuade and convert into leads."

## 1. What the blog is for

One metric: **bill uploads per reader** (Bill Analyser starts from a post).

Better writing does not fix ranking on its own. Ranking comes mostly from authority: reviews and links from other sites. Rewrites improve the click rate, AI citations and how many readers upload a bill. Judge the writing on those, never on position alone.

## 2. Voice: Cal's, from Cal

Rules cannot produce a voice. Cal's own speech does.

- **Before each post, Cal records a 5 to 10 minute voice note** answering the post's question the way he would to a customer at the door. Include what only an installer knows: what goes wrong, what people ask on the call, what a real job looked like.
- The post is written from that note. The writer's job is to order it and check the facts, keeping his words.
- The approved example is the winter post: `/blog/high-winter-bills-is-solar-worth-it-ireland` (commit 0db959d and later). When in doubt, read it.
- Irish vocabulary: ESB Networks, NC6, SEAI, MPRN, site survey, BER, immersion, night rate. Never utility, permit or net metering.
- **Calibration:** Cal scores five posts blind, 1 to 10. Compare with `INTAKE/BLOG-QUALITY-AUDIT.md` and re-rank. The audit once gave 7.2 to a draft Cal rejected, so until calibrated its scores count only for facts (pasted sentences, codes, clashing numbers).

## 3. The question map (do this before rewriting anything)

Every post owns one question. No two posts own the same one.

- Build the map with the seo-cluster and seo-content-brief skills: question, owner post, the posts that link to it, the next question it links on to.
- **Where two posts answer the same question, merge the weaker into the stronger and redirect it (308).** Cal agreed to this on 15 Nov. Candidates to decide first: the two winter posts; worth-it and add-value; the "€1,800 grant stays" post and the grant guide; battery worth-it and the battery grant post.
- Internal links use the question as the link text, and every post links to the Bill Analyser.

## 4. Facts: one source, enforced by the build

- Every savings figure comes from `src/lib/estimate.ts`. Every grant figure comes from `src/lib/solar-data.ts`. Anything else needs a dated official source: seai.ie, esbnetworks.ie, cru.ie, gov.ie, PVGIS.
- **To build:** fact tokens that posts render from the engine, and a test that fails the build when a euro or kWh figure in a post disagrees with the engine. Until it exists, check every figure by hand against the engine before going live.
- Known clashes to remove: the yearly saving shown as €800 to €1,400, €920, €975 and €1,000; 4 kWp shown as 9 or 10 panels.
- Sources go in one line at the end of the post. No regulator or standards codes in sentences.
- Savings are always labelled as estimates, with the assumptions stated in plain words (Irish advertising rules).
- Grant wording matches SEAI's: up to €2,400, being €1,800 for panels (the full amount at 4 kWp) and €600 for a battery of 5 kWh or more.

## 5. What a post contains

1. **The answer box:** the direct answer in two or three sentences, with the key number. It is what AI answers and snippets quote.
2. **An opening that says something new.** Never a restatement of the answer box (a test enforces this).
3. **Meat:** at least one thing the reader cannot get elsewhere. A worked number from the engine, a month or county table, a real install with its real figures, or the exact step the homeowner takes.
4. **Each point once.**
5. **Real proof where we have it:** a real install photo and its real readings, with the owner's permission.
6. **A "your bill, your number" step inside the post** (to build; cro skill), so the reader acts where the question is answered. Until then, one clear call to action to the Bill Analyser.
7. **Questions under an H2 named exactly "Frequently asked questions",** each an H3 with a short answer. That exact heading switches on the FAQ markup for AI engines.
8. **Internal links** to the owner posts of the next questions.
9. **One source line at the end.**

## 6. Banned

- Em dashes, and spaced hyphens used as dashes. Exclamation marks.
- "Honest" as a tic, "here's" throat-clearing, "not X, it's Y" contrasts, pull-quote endings.
- The same sentence pasted into more than one post.
- Rival installer names. Claims of SMS, WhatsApp automation, roof detection or AI phone answering.
- Invented statistics, reviews, counts or testimonials. Fake urgency.
- Odd coinages nobody says (for example "two-monthly billing").

## 7. Change rules, by where the page ranks

| Page's average position | What is allowed |
|---|---|
| 1 to 7 | Small edits only, one kind of change at a time. Never a full rewrite. |
| 8 to 30 | A full rewrite to this standard. |
| Over 30, or not ranking | A full rewrite, or a merge into the owner post. |

- Never change a slug, except for a merge with a 308 redirect that Cal has approved.
- Titles and H1s change only when the data shows a click-rate problem. Log old and new in `docs/seo-change-log.md`.
- The "updated" date changes only when the content really changes.
- No bulk rewrites while a Google core update is rolling out.

Rewrite order agreed on 15 Nov (after the question map): the SEAI grant guide first, then the landlord post, then BER. The "do solar panels work in winter" post (position 5.8) gets small edits only.

## 8. The process for one post

1. Brief: the question, the searcher, the owner post, links in and out (seo-content-brief).
2. Cal's voice note.
3. Draft as plain text (copywriting).
4. Slop pass (stop-slop, copy-editing).
5. Fact check against the engine and official sources.
6. Cal reads and edits the plain text.
7. Into the site word for word. Gates: build, lint, tests, structured data parses, no banned strings.
8. Live on Cal's yes. Add the row to the growth ledger.

## 9. Measurement

- The ledger: `Obsidian Vault/RAW/2026-11-15 Growth ledger - what we changed and when (SIG, RI).md`. Every change gets a row with its date and commit.
- **One kind of change per page, then leave it alone for 4 weeks.** Stacked changes cannot be told apart.
- **Six posts stay untouched as a comparison group** until the first review. Pick them when the question map is done and list them in the ledger.
- Judge on 28-day impressions, position and click rate per page, and Bill Analyser starts per post. Traffic is too low for A/B tests.
- Money per page needs page-to-install tracking, which is not built yet (see the ledger).
- Each post carries a review date. Recheck it whenever SEAI changes a grant.

## 10. County pages

Same voice, same facts rule, same banned list. On top of that, the county HARD RULES apply: no name-swap content, sourced local facts, real proof, local questions, and the county gate test must pass before a page can be indexed. See `docs/county-page-playbook.md`.
