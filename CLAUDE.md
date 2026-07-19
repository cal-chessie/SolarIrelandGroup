# Solar Ireland — website (Next.js 16, App Router)

National brand site. Part of Cal's estate: two national brands → AISOLAR
(installer platform) → AIOS kernel (separate Supabase, the switchboard).
Estate map: `~/Desktop/SONSSONS/COMH/RENEWABLY/LAUNCH_MAP.md`
Kernel law: `~/Desktop/SONSSONS/COMH/RENEWABLY/KERNEL_INTELLIGENCE.md`

## House rules (non-negotiable)
- Read before write. Never `--force` push. Correction by adding, never erasing.
- Never commit `.env*` (was git-tracked once; untracked 2026-07-18 — keep it out).
- Don't change the visual design — Cal built it deliberately.

## State (2026-07-18 cleanup — uncommitted, see git status)
- Chat + bill-analyser run on OpenAI via fetch (`OPENAI_API_KEY`); z-ai SDK removed.
- Contact route: Postmark email (`POSTMARK_SERVER_TOKEN`) + forwards lead to
  AISOLAR via `src/lib/aisolar.ts` (`AISOLAR_INGEST_URL/KEY`) — fire-and-forget.
- robots.ts welcomes AI crawlers; `public/llms.txt` exists; sitemap complete.
- A/B testing sqlite falls back to /tmp on Vercel (ephemeral — known).
- Lockfiles deleted (were stale) — run `npm install` to regenerate.

## Known debt
- `typescript.ignoreBuildErrors: true` in next.config.ts — run `npx tsc --noEmit`,
  fix, then remove the flag.
- Hardcoded domain `solarireland.com` everywhere — CONFIRM Cal owns/deploys this
  exact domain before launch (brand dispute history; may be solarirelandgroup.ie).
- AggregateRating 4.9/127 in layout.tsx JSON-LD is unbacked — remove or back
  with real reviews before Google sees it.
- Deploy: Vercel. Env vars in `.env.example`. Steps in `DEPLOYMENT.md`.
