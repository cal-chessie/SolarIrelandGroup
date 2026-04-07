---
Task ID: 1
Agent: Main
Task: Full deep audit + fix all issues on Solar Ireland website

Work Log:
- Killed orphaned processes on port 3000
- Fixed CRITICAL build error: both middleware.ts and proxy.ts existed (Next.js 16 conflict). Deleted middleware.ts
- Fixed manifest URL: layout.tsx referenced `/manifest.json` (404), changed to `/manifest.webmanifest`
- Fixed Footer social links: Facebook, Instagram, LinkedIn all pointed to `#`. Updated to real URLs. Removed nofollow rel since links are real now
- Fixed Footer schema: `og-image.jpg` doesn't exist in public. Changed to `hero-solar.webp`. Added `sameAs` social URLs to LocalBusiness schema
- Fixed Navbar copyright year: Hardcoded `© 2024` changed to dynamic `new Date().getFullYear()`
- Fixed Services page fake phone number: `01 234 5678` (placeholder). Replaced with `SOLAR_DATA.provider.phoneDisplay` (+353 87 395 8424). Also deleted unused `ServicesClient.tsx` dead code file
- Fixed Hero mascot hidden on mobile: `hidden sm:block` class was restored (edit lost in context compression). Removed `hidden sm:block`, added responsive sizing `w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44`
- Deleted dead code: `CustomerInstalls_backup.tsx`
- Verified WhySolar animated counters work correctly (€1,100/yr, €1,800, 6 years, 25+ yrs)
- Verified all images serve correctly
- Verified all pages render: /, /about, /services, /counties, /blog, /contact, /privacy
- Verified mobile viewport (375x812): mascot visible, StatsBar hidden, layout correct
- Verified desktop viewport (1920x1080): all sections render
- Full clean rebuild (rm -rf .next + npm run build) confirmed zero errors
- Stale process lesson: always `lsof -ti:3000 | xargs kill -9` before rebuilds

Stage Summary:
- 8 issues fixed across 6 files
- 2 files deleted (middleware.ts, ServicesClient.tsx, CustomerInstalls_backup.tsx)
- Build clean, all 7 pages rendering correctly
- Mobile and desktop verified via browser automation
- Zero remaining issues in final scan
