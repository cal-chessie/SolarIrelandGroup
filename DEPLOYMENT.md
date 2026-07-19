# Deploying to Vercel

## 1. Regenerate the lockfile
Both old lockfiles (bun.lock, package-lock.json) were stale and referenced the removed `z-ai-web-dev-sdk`, so they've been deleted. On your machine:

```bash
npm install
npx tsc --noEmit   # see step 4
npm run build      # verify locally before pushing
git add -A && git commit -m "Deployment cleanup: OpenAI routes, Postmark leads, repo hygiene"
```

## 2. Environment variables (Vercel → Project Settings → Environment Variables)
See `.env.example`. Minimum for full functionality:

- `OPENAI_API_KEY` — chatbot + bill photo analysis (routes fail gracefully without it)
- `POSTMARK_SERVER_TOKEN`, `CONTACT_EMAIL_FROM` — without these, contact-form leads are only logged and effectively lost

## 3. Import the repo in Vercel
Framework preset: Next.js. No custom build settings needed. The Caddyfile, `.zscripts/`, `daemon-server.js`, `ecosystem.config.js`, `dev-keepalive.sh`, and `mini-services/` are all Z.ai-sandbox infrastructure and are ignored by Vercel — safe to delete from the repo when you get a chance.

## 4. Known debt (not blocking deploy)
- `next.config.ts` still has `typescript.ignoreBuildErrors: true`. Run `npx tsc --noEmit`, fix what surfaces, then remove the flag.
- A/B testing uses SQLite. On Vercel it writes to `/tmp`, which is ephemeral — variants still serve correctly (falls back to control on any failure), but stats won't accumulate reliably. Migrate to Vercel KV/Postgres or Supabase if you want real experiment data.
- `prisma/`, `supabase/`, `generate-schema.js`, `SUPABASE_GUIDE.md` are unused (`src/lib/db.ts` is a stub). Delete or actually wire them up.
- The chat "streaming" mode is fake (full response chunked after the fact). Works, but consider real streaming later.
