# Solar Ireland · start here

**Read [`docs/memory/README.md`](docs/memory/README.md) before doing anything in this repo.** It is the project memory: eleven linked documents covering the business, the savings engine, the AISolar integration, the frontend traps, the truth rules, and what is currently open. It is written to be read in full and it is kept current.

## The absolute minimum, if you read nothing else

**AISolar is the product. Solar Ireland is the golden client.** Cal sells AISolar to installers; this site is his own live deployment, dogfooded so the frontend is right before another installer sees it. A fix that only works by special-casing Solar Ireland is not a fix.

**One savings engine: [`src/lib/estimate.ts`](src/lib/estimate.ts).** There used to be four and the same bill got different answers. Never fork it. Read [`docs/memory/03-savings-engine.md`](docs/memory/03-savings-engine.md) before changing any number, anywhere.

**Never fix one price alone.** A figure lives in the component, the page metadata, the JSON-LD, a FAQ answer and a county page. Change one, grep them all, then render the pages and look.

**The site gives a close estimate, never a proposal.** Conservative, panels only, 4 kWp floor. The battery is the consultant's to sell.

**`src/lib/motion.tsx` is a custom shim, not framer-motion.** It silently ignores object-style `animate` props. Use CSS keyframes for anything that moves.

## Standing rules

- **No em dashes** anywhere a human sees, including commit messages and replies to Cal.
- No slop. Plain words, active voice, Irish solar specifics.
- The front desk is open 24/7. **Never suggest office hours.**
- Never claim SMS, WhatsApp automation, roof detection or AI phone answering **on this site**.
- No testimonials, ratings or counts without real permissioned proof.
- Official sources only: seai.ie, esbnetworks.ie, CRU. **Never name a competitor.**
- Dead files go to `_TRASH` with a note. Never `rm`.
- No push without an explicit yes, then prove it with `git ls-remote`. Merging to `main` is the go-live and is Cal's call.
- Verify with tools, never memory. If you cannot run the check, say so.

## Commands

```bash
bun run dev      # port 3000
bun run build    # the gate: must pass
bun run lint     # must exit 0
bun run test     # currently 1 failing, see docs/memory/09-open-items.md
```

Use bun. `bun.lock` is authoritative; the README's `npm install` is stale. `bun run db:push` is a no-op stub.

After every rebuild in a preview, stop and restart the server. Stale builds have been screenshotted and reported as fixes more than once.

## Where things are

| | |
|---|---|
| Project memory | [`docs/memory/`](docs/memory/README.md) |
| What is open right now | [`docs/memory/09-open-items.md`](docs/memory/09-open-items.md) |
| Canonical numbers | [`src/lib/solar-data.ts`](src/lib/solar-data.ts), [`src/lib/estimate.ts`](src/lib/estimate.ts) |
| Vocabulary and truth canon | [`docs/site-canon.md`](docs/site-canon.md) |
| Why a decision was made | the git commit messages, which are long on purpose |
