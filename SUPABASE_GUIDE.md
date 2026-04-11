# Solar Ireland — Supabase Backend Guide

> Complete database schema, edge functions, and implementation guide for the Solar Ireland website.  
> **Formal spec:** [`Solar-Ireland-Supabase-Architecture.docx`](./download/Solar-Ireland-Supabase-Architecture.docx)  
> **SQL schema:** [`supabase/schema.sql`](./supabase/schema.sql)

---

## Quick Start

```bash
# 1. Apply the schema to your Supabase project
supabase db push

# Or paste supabase/schema.sql into the Supabase Dashboard > SQL Editor

# 2. Create your first admin user
# Go to Supabase Dashboard > Authentication > Users > Add User
# Then run this SQL to promote them:
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

# 3. Create Storage buckets
# Go to Supabase Dashboard > Storage and create:
#   - blog-images (public)
#   - installation-photos (public)
#   - county-images (public)
#   - team-photos (public)
#   - portal-documents (authenticated, per-customer policy)
#   - bill-uploads (service role only)
#   - admin-assets (admin only)
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Solar Ireland Website                     │
│                      (Next.js 16 Frontend)                   │
└──────────┬──────────┬──────────┬──────────┬─────────────────┘
           │          │          │          │
           ▼          ▼          ▼          ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Supabase │ │  Edge    │ │  Auth    │ │  Storage  │
    │   DB     │ │ Functions│ │ (JWT+RLS)│ │  Buckets  │
    │ (25 tbls)│ │  (14 fn) │ │          │ │  (7 bkts) │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**25 tables** organised into 6 domains:

| Domain | Tables | Purpose |
|--------|--------|---------|
| **Lead Capture** | `contact_submissions`, `survey_bookings`, `bill_analyses`, `lead_sources` | All incoming enquiries and marketing attribution |
| **CMS** | `blog_posts`, `blog_content_sections`, `blog_categories`, `counties`, `county_faqs`, `site_settings` | Website content management |
| **Service & Pricing** | `service_packages`, `financing_options`, `testimonials`, `team_members` | Service offerings and team |
| **Customer Portal** | `customers`, `customer_installation_steps`, `documents`, `notifications`, `profiles` | Portal dashboard backend |
| **Analytics & GDPR** | `cookie_consent_records`, `exit_intent_conversions`, `whatsapp_lead_sources`, `newsletter_subscriptions`, `chat_conversations` | Compliance and tracking |
| **Auth** | `profiles` (extends `auth.users`) | Role-based access control |

---

## Entity Relationship Diagram

```
auth.users 1────1 profiles
                      │
                      │ (admin role)
                      ▼
              ┌──── ALL TABLES (admin CRUD) ────┐
              │                                  │

═══ LEAD CAPTURE ═══

contact_submissions ──┐
survey_bookings ──────┤──▶ lead_sources (related_id)
bill_analyses ────────┘

═══ CMS ═══

blog_categories 1───N blog_posts 1───N blog_content_sections
counties 1───N county_faqs
site_settings (key-value)

═══ SERVICE ═══

service_packages (seeded: essential, popular, premium)
financing_options
testimonials
team_members

═══ CUSTOMER PORTAL ═══

profiles 1───0..1 customers
                        │
                        ├──1:N── customer_installation_steps
                        ├──1:N── documents
                        └──1:N── notifications

═══ ANALYTICS & GDPR ═══

cookie_consent_records
newsletter_subscriptions
exit_intent_conversions
whatsapp_lead_sources
chat_conversations
```

---

## Table Reference

### Lead Capture

| Table | Source | What it fixes |
|-------|--------|---------------|
| `contact_submissions` | `/contact` form | Currently `console.log()` only — no persistence |
| `survey_bookings` | `/book-survey` 4-step form | Currently WhatsApp only — no DB record, no reference number |
| `bill_analyses` | `/solar-calculator` BillAnalyser | Currently returns results only — saves nothing |
| `lead_sources` | All entry points | No UTM tracking exists — no attribution data |

### CMS

| Table | Source | What it fixes |
|-------|--------|---------------|
| `blog_posts` | `src/lib/blog-data.ts` | ~1000 lines of hardcoded articles |
| `blog_content_sections` | Blog post content | Structured content blocks (paragraphs, callouts, lists, CTAs) |
| `blog_categories` | Blog filter | 6 hardcoded categories |
| `counties` | `CountiesClient.tsx` | 32 hardcoded county entries in component |
| `county_faqs` | `/counties` FAQ section | 8 hardcoded FAQs |
| `site_settings` | `src/lib/solar-data.ts` | Grant amounts, savings, rates, contact details, social links |

### Service & Pricing

| Table | Source | What it fixes |
|-------|--------|---------------|
| `service_packages` | `/services` comparison | Essential €4,500 / Popular €6,500 / Premium €9,500 hardcoded |
| `financing_options` | `/financing` page | Green Loan, Upfront, Mortgage Top-Up hardcoded |
| `testimonials` | Multiple pages | Customer reviews hardcoded |
| `team_members` | `/about` page | 4 team members hardcoded |

### Customer Portal

| Table | Source | What it fixes |
|-------|--------|---------------|
| `customers` | `/portal/[reference]` | ALL demo data — accepts any reference, no real lookup |
| `customer_installation_steps` | Portal timeline | 11 hardcoded steps with fake dates |
| `documents` | Portal documents tab | 5 hardcoded files (Survey Report, Quote, Grant App, etc.) |
| `notifications` | Portal updates tab | 3 hardcoded notifications |
| `profiles` | `auth.users` extension | No auth exists — portal is entirely open |

### Analytics & GDPR

| Table | Source | What it fixes |
|-------|--------|---------------|
| `cookie_consent_records` | `CookieConsent.tsx` | `localStorage` only — no audit trail for DPC |
| `newsletter_subscriptions` | Blog newsletter form | **Completely fake** — `setSubscribed(true)` resets after 4s |
| `exit_intent_conversions` | `ExitIntent.tsx` | `sessionStorage` only — no conversion tracking |
| `whatsapp_lead_sources` | All WhatsApp links | No click tracking — no attribution data |
| `chat_conversations` | `/api/chat` | No conversation history saved |

---

## Edge Functions (14)

| Function | Method | Auth | Purpose |
|----------|--------|------|---------|
| `submit-contact` | POST | No | Insert contact form → notify sales team |
| `book-survey` | POST | No | Validate 4-step form → generate reference → insert → email + WhatsApp |
| `analyse-bill` | POST | No | Run financial analysis → insert → return results |
| `subscribe-newsletter` | POST | No | Upsert newsletter subscription |
| `save-cookie-consent` | POST | No | Insert GDPR consent record |
| `track-exit-intent` | POST | No | Record exit intent trigger + action |
| `track-whatsapp-click` | POST | No | Record WhatsApp link click with attribution |
| `validate-portal-reference` | POST | No | Look up reference → create/auth auth link |
| `get-portal-data` | GET | Yes | Return customer's portal data (RLS isolated) |
| `update-notification-read` | PATCH | Yes | Mark notification as read |
| `save-chat-conversation` | POST | No | Append to chat log |
| `admin-blog-crud` | POST/PUT/DELETE | Admin | Manage blog posts and content sections |
| `admin-update-installation` | PATCH | Admin | Update step status, upload documents |
| `generate-reference` | POST | Service | Atomic SI-YYYY-NNNN generation |

---

## Storage Buckets (7)

| Bucket | Access | Contents |
|--------|--------|----------|
| `blog-images` | Public | Blog article covers + inline images (jpg, png, webp) |
| `installation-photos` | Public | Gallery photographs (jpg, webp) |
| `county-images` | Public | County page hero images (jpg, webp) |
| `team-photos` | Public | Team profile photos (jpg, webp) |
| `portal-documents` | Authenticated | Customer documents: PDFs, quotes, certificates |
| `bill-uploads` | Edge function only | Temporary electricity bill images (auto-deleted) |
| `admin-assets` | Admin only | Internal documents, templates |

---

## RLS Policy Matrix

| Table | Anon | Customer | Admin |
|-------|------|----------|-------|
| `profiles` | — | SELECT own | Full CRUD |
| `contact_submissions` | INSERT | — | Full CRUD |
| `survey_bookings` | INSERT | SELECT own | Full CRUD |
| `bill_analyses` | INSERT | SELECT own sessions | Full CRUD |
| `lead_sources` | INSERT | — | SELECT |
| `blog_posts` | SELECT published | SELECT published | Full CRUD |
| `blog_content_sections` | SELECT (via post) | SELECT (via post) | Full CRUD |
| `blog_categories` | SELECT | SELECT | Full CRUD |
| `counties` | SELECT | SELECT | Full CRUD |
| `site_settings` | SELECT | SELECT | Full CRUD |
| `service_packages` | SELECT active | SELECT active | Full CRUD |
| `testimonials` | SELECT active | SELECT active | Full CRUD |
| `team_members` | SELECT active | SELECT active | Full CRUD |
| `customers` | — | SELECT own | Full CRUD |
| `customer_installation_steps` | — | SELECT own | Full CRUD |
| `documents` | — | SELECT own | Full CRUD |
| `notifications` | — | SELECT/UPDATE own | Full CRUD |
| `cookie_consent_records` | INSERT | — | SELECT |
| `newsletter_subscriptions` | INSERT + unsubscribe | — | Full CRUD |
| `exit_intent_conversions` | INSERT | — | SELECT |
| `whatsapp_lead_sources` | INSERT | — | SELECT |
| `chat_conversations` | INSERT | SELECT own sessions | SELECT |

---

## Key Design Decisions

**Reference Numbers** — Format `SI-YYYY-NNNN` (e.g., `SI-2026-0043`). Generated by a PostgreSQL sequence (`survey_reference_seq`) via the `gen_reference_number()` function. Used as the portal access key.

**Soft Deletes** — `blog_posts.deleted_at` enables content recovery and audit trails. Other critical tables use status enums instead of hard deletes.

**JSONB Flexibility** — `analysis_result` (bill_analyses), `features` (service_packages), `consent_state` (cookie_consent), `utm_params` (all lead tables), `items` (blog_content_sections), `messages` (chat_conversations). All indexed with GIN where queried.

**Portal Auth Flow** — Reference lookup → Edge Function validates → creates/auths Supabase account → magic link to email → JWT-scoped RLS. Reference alone never grants DB access.

**GDPR Compliance** — Cookie consent records provide audit trail for DPC. IP addresses on contact forms are annotated for 30-day anonymisation. Newsletter has proper unsubscribe with timestamp. Bill uploads are deleted after processing.

---

## Implementation Phases

| Phase | Duration | Scope |
|-------|----------|-------|
| **1. Lead Capture** | 1–2 weeks | Wire up all forms to DB. Replace console.log and WhatsApp-only flows. Highest revenue impact. |
| **2. Content Migration** | 2–3 weeks | Move blog, counties, settings from TS files to DB. Migration script for existing data. |
| **3. Customer Portal** | 2–3 weeks | Replace demo data with real DB queries. Auth integration. Feature flag for gradual rollout. |
| **4. GDPR & Analytics** | 1–2 weeks | Wire up cookie consent, newsletter (make it real!), exit intent, WhatsApp attribution. |
| **5. Realtime & Polish** | 1–2 weeks | Realtime subscriptions for portal. Storage buckets. Image transforms. Admin dashboard foundation. |

---

## Frontend Integration Points

| Current File | What Changes | DB Table |
|-------------|-------------|----------|
| `src/app/api/contact/route.ts` | Replace `console.log` with Supabase INSERT | `contact_submissions` |
| `src/app/book-survey/BookSurveyClient.tsx` | Replace WhatsApp with Edge Function call | `survey_bookings` |
| `src/app/solar-calculator/SolarCalculatorClient.tsx` | Call `analyse-bill` Edge Function | `bill_analyses` |
| `src/components/solar/BillAnalyser.tsx` | Post results to Edge Function | `bill_analyses` |
| `src/components/CookieConsent.tsx` | POST consent to Edge Function | `cookie_consent_records` |
| `src/components/solar/ExitIntent.tsx` | POST trigger + action to Edge Function | `exit_intent_conversions` |
| `src/components/solar/WhatsAppChat.tsx` | POST click event to Edge Function | `whatsapp_lead_sources` |
| `src/app/blog/BlogClient.tsx` | Newsletter form → real POST | `newsletter_subscriptions` |
| `src/app/api/chat/route.ts` | Save conversations | `chat_conversations` |
| `src/lib/blog-data.ts` | DELETE — fetch from Supabase | `blog_posts` |
| `src/lib/solar-data.ts` | DELETE — fetch from Supabase | `site_settings` |
| `src/app/portal/PortalLandingClient.tsx` | Validate reference via Edge Function | `customers` |
| `src/app/portal/[reference]/PortalDashboardClient.tsx` | Fetch real data from Supabase | `customers`, `customer_installation_steps`, `documents`, `notifications` |
| `src/lib/db.ts` | Replace `null` stub with Supabase client | All |

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the client. Use it only in Edge Functions and server-side API routes.
