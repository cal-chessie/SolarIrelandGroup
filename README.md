# Solar Ireland

SEAI-registered solar panel installation company serving all 32 counties across Ireland.

**Live:** [solarireland.org](https://solarireland.org)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS 4, custom CSS animations |
| Icons | Lucide React |
| AI | z-ai-web-dev-sdk (chat assistant, bill analyser) |
| Deployment | Node.js 20+ |

## Key Features

- AI-powered electricity bill analyser with instant savings estimate
- Interactive solar calculator with payback projections
- County-specific generation data and pricing for all 32 counties
- Blog with structured data (BlogPosting, FAQ, HowTo schemas)
- Exit-intent popup with WhatsApp CTA
- Customer portal with reference-based access
- SEAI grant guidance (Republic of Ireland)
- Full structured data (JSON-LD) across every page

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

The dev server runs on `http://localhost:3000`.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── layout.tsx          # Root layout (global metadata, nav, footer)
│   ├── HomeClient.tsx      # Homepage client components
│   ├── services/           # Solar PV, battery, EV charging
│   ├── blog/               # Blog listing + individual articles
│   ├── counties/           # County-specific pages (32 counties)
│   ├── solar-calculator/   # Interactive savings calculator
│   ├── book-survey/        # Survey booking form
│   ├── financing/          # Financing options
│   ├── about/              # Company info
│   ├── contact/            # Contact form + details
│   ├── portal/             # Customer portal (noindex)
│   ├── admin/              # Admin dashboard (noindex)
│   ├── api/chat/           # AI chat endpoint (z-ai-web-dev-sdk)
│   ├── api/newsletter/     # Newsletter signup
│   ├── sitemap.ts          # Dynamic XML sitemap
│   ├── robots.ts           # Dynamic robots.txt
│   └── manifest.ts         # PWA manifest
├── components/
│   └── solar/              # Application components
│       ├── BillAnalyser.tsx
│       ├── Hero.tsx
│       ├── WhySolar.tsx
│       ├── HowItWorks.tsx
│       ├── StatsBar.tsx
│       ├── QuickSavingsCalculator.tsx
│       ├── CustomerInstalls.tsx
│       ├── GrantInfo.tsx
│       ├── FAQ.tsx
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── WhatsAppChat.tsx
│       └── ExitIntent.tsx
├── lib/
│   ├── solar-data.ts       # Company info, pricing, savings figures
│   ├── blog-data.ts        # All blog articles (16 articles)
│   ├── whatsapp.ts         # WhatsApp URL builder (centralised)
│   ├── motion.tsx          # Custom scroll-triggered animation library
│   ├── useInView.ts        # Intersection Observer hook
│   └── utils.ts            # General utilities
└── middleware.ts            # www redirect, trailing slash removal
```

## Environment Variables

Create a `.env.local` file for local development:

```env
# AI SDK (required for chat feature)
ZAI_API_KEY=your_zai_api_key

# Optional
NEXT_PUBLIC_SITE_URL=https://solarireland.org
```

## SEO

- Dynamic sitemap covering all pages and blog articles
- Open Graph + Twitter Card images on every page
- JSON-LD structured data: Organization, WebPage, BlogPosting, FAQPage, BreadcrumbList, Service
- `robots.ts` with proper allow/disallow rules
- Canonical URLs and hreflang tags
- Semantic HTML with proper heading hierarchy

## Deployment

Designed for Vercel (recommended) or any Node.js hosting platform:

```bash
npm run build    # Generates .next/ output
npm start        # Serves on port 3000
```

For Vercel, just connect the GitHub repo — zero config needed.

## License

Private repository. All rights reserved.
