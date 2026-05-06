<div align="center">

<img src="public/logo-lg.png" alt="Solar Ireland" width="180" height="180" />

# Solar Ireland

**SEAI-registered solar panel installers serving all 32 counties across Ireland.**

[![Live Site](https://img.shields.io/badge/live-solarireland.org-amber?style=for-the-badge&logo=googlechrome&logoColor=black)](https://solarireland.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)

</div>

---

## Features

- **AI Bill Analyser** — Upload your electricity bill and get an instant personalised savings report
- **Interactive Solar Calculator** — Payback projections with monthly generation modelling
- **32 County Pages** — County-specific solar irradiance data and pricing
- **Customer Portal** — Reference-based project tracking (noindex)
- **Admin Dashboard** — Lead management, survey tracking, WhatsApp integration (noindex)
- **Blog** — 16 SEO-optimised articles with structured data (BlogPosting, FAQ, HowTo schemas)
- **WhatsApp Integration** — Floating chat widget, exit-intent popup, context-aware messages
- **GDPR Cookie Consent** — Category-based consent with localStorage persistence
- **Scroll Animations** — Custom CSS animation library (zero JS runtime, IntersectionObserver-powered)
- **SEO** — Dynamic sitemap, Open Graph images, 6 JSON-LD schemas, robots.ts, canonical URLs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS 4, custom CSS animations |
| UI | shadcn/ui (button), Lucide icons |
| AI | z-ai-web-dev-sdk (chat, bill analyser) |
| Charts | Recharts (admin dashboard) |
| Images | Next.js Image + sharp |
| Database | Supabase (schema ready, 25 tables) |
| Deployment | Node.js 20+ |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
solarireland/
├── public/                     # Static assets (logos, images, OG graphics)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (metadata, JSON-LD, GA, fonts)
│   │   ├── page.tsx            # Homepage
│   │   ├── HomeClient.tsx      # Homepage client components
│   │   ├── globals.css         # Tailwind + custom animations
│   │   ├── manifest.ts         # PWA manifest
│   │   ├── sitemap.ts          # Dynamic XML sitemap
│   │   ├── robots.ts           # Robots.txt (blocks AI crawlers)
│   │   ├── about/              # About page
│   │   ├── admin/              # Admin dashboard (noindex)
│   │   ├── blog/               # Blog + [slug] articles
│   │   ├── book-survey/        # Survey booking form
│   │   ├── contact/            # Contact form + details
│   │   ├── cookies/            # Cookie policy
│   │   ├── counties/           # 32 county pages
│   │   ├── financing/          # Financing options
│   │   ├── portal/             # Customer portal (noindex)
│   │   ├── privacy/            # Privacy policy
│   │   ├── services/           # Solar PV, battery, EV charging
│   │   ├── solar-calculator/   # Interactive calculator
│   │   ├── terms/              # Terms of service
│   │   └── api/                # API routes
│   │       ├── admin-dashboard/ # Admin data API
│   │       ├── analyse-bill/   # AI bill analyser
│   │       ├── chat/           # AI chat endpoint
│   │       └── contact/        # Contact form submission
│   ├── components/
│   │   ├── solar/              # Application components (14)
│   │   │   ├── BillAnalyser.tsx
│   │   │   ├── BumblebeeMascot.tsx
│   │   │   ├── CustomerInstalls.tsx
│   │   │   ├── ExitIntent.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── GrantInfo.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── QuickSavingsCalculator.tsx
│   │   │   ├── ScrollProgress.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   └── WhatsAppChat.tsx
│   │   ├── ui/                 # shadcn/ui (button only)
│   │   └── CookieConsent.tsx   # GDPR cookie consent banner
│   ├── hooks/
│   │   └── use-mobile.ts       # Mobile viewport detection
│   ├── lib/
│   │   ├── solar-data.ts       # Company info, pricing, contacts (single source of truth)
│   │   ├── blog-data.ts        # All blog articles (16 articles, ~1000 lines)
│   │   ├── whatsapp.ts         # Centralised WhatsApp URL builder
│   │   ├── motion.tsx          # Custom animation library (framer-motion replacement)
│   │   ├── admin-types.ts      # Admin dashboard TypeScript interfaces
│   │   ├── admin-mock-data.ts  # Admin dashboard mock data
│   │   └── utils.ts            # cn() utility
│   └── middleware.ts           # www redirect + trailing slash removal
├── supabase/
│   ├── schema.sql              # Database schema (25 tables, RLS policies)
│   └── functions/              # Edge functions (6)
│       ├── admin-dashboard-api/
│       ├── run-automation/
│       ├── sync-gbp-reviews/
│       ├── whatsapp-qualify-lead/
│       ├── whatsapp-send-message/
│       └── whatsapp-webhook/
├── .editorconfig               # Editor formatting rules
├── .gitattributes              # Git line ending & diff settings
├── .nvmrc                      # Node.js 20
├── .env.example                # Environment variable template
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind theme
├── tsconfig.json               # TypeScript configuration
├── eslint.config.mjs           # ESLint (core-web-vitals + TypeScript)
└── package.json
```

## Architecture

**Single source of truth** — All company data (phone, email, WhatsApp, pricing, savings figures) lives in `src/lib/solar-data.ts`. Every component imports from this file — change once, update everywhere.

**Page pattern** — Each route follows the Next.js App Router pattern: `page.tsx` (server component) + `XxxClient.tsx` (client component). Some routes add `layout.tsx` for route-specific metadata.

**Zero-animation-runtime** — The custom `motion` library in `src/lib/motion.tsx` provides framer-motion-compatible APIs using pure CSS animations + IntersectionObserver. No JS animation runtime bundle.

**SEO-first** — Every page has Open Graph metadata, and the root layout injects 6 JSON-LD schemas (Organization, LocalBusiness, WebPage, Service, HowTo, FinancialProduct).

## Environment Variables

See [`.env.example`](.env.example) for the full list.

| Variable | Required | Description |
|----------|----------|-------------|
| `ZAI_API_KEY` | Yes (AI) | z-ai-web-dev-sdk for chat + bill analyser |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics 4 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | No | Google Search Console |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase admin key (server only) |

## Deployment

Designed for Vercel (recommended) or any Node.js hosting:

```bash
npm run build
npm start
```

For Vercel, connect the GitHub repo — zero config needed.

## License

Private repository. All rights reserved.
