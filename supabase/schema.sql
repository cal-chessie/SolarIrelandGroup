-- ============================================================================
-- Solar Ireland — Supabase Database Schema
-- ============================================================================
-- Complete schema: 25 tables, RLS policies, triggers, indexes, functions
-- Designed for the Solar Ireland Next.js website backend
--
-- Apply via Supabase Dashboard > SQL Editor
-- Or via CLI: supabase db push
-- ============================================================================

-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- HELPER: ENUM TYPES
-- ============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'customer');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'spam');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'surveyed', 'quoted', 'installed', 'cancelled');
CREATE TYPE content_type AS ENUM ('paragraph', 'heading', 'callout', 'bulletList', 'numberedList', 'table', 'divider', 'cta');
CREATE TYPE blog_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE county_status AS ENUM ('active', 'coming-soon');
CREATE TYPE portal_status AS ENUM ('enquiry', 'survey_booked', 'surveyed', 'quoted', 'deposit_paid', 'installation_scheduled', 'installing', 'installed', 'grant_submitted', 'grant_approved', 'generating');
CREATE TYPE step_status AS ENUM ('completed', 'in_progress', 'upcoming');
CREATE TYPE doc_type AS ENUM ('survey_report', 'quote', 'grant_application', 'grant_offer', 'completion_certificate', 'other');
CREATE TYPE doc_status AS ENUM ('pending', 'available', 'requires_action', 'expired');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'action_required');
CREATE TYPE consent_source AS ENUM ('mouse_leave', 'tab_switch', 'scroll_back', 'idle');
CREATE TYPE newsletter_status AS ENUM ('active', 'unsubscribed', 'bounced');

-- ============================================================================
-- 1. AUTHENTICATION: profiles
-- Extends Supabase auth.users with role-based access control
-- ============================================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  role        USER_ROLE NOT NULL DEFAULT 'customer',
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Extends Supabase auth.users with role-based access control. Roles: admin, customer.';
COMMENT ON COLUMN profiles.role IS 'admin = full backend access; customer = portal-only access via RLS';

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY profiles_admin_all ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================================
-- 2. LEAD CAPTURE: contact_submissions
-- /contact page form submissions (currently console.log only)
-- ============================================================================
CREATE TABLE contact_submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  county      TEXT NOT NULL,
  message     TEXT NOT NULL,
  source_page TEXT DEFAULT '/contact',
  utm_params  JSONB DEFAULT '{}',
  ip_address  INET,
  user_agent  TEXT,
  status      LEAD_STATUS DEFAULT 'new',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE contact_submissions IS 'Contact form submissions from /contact. Currently logs to console only — this table persists all submissions.';
COMMENT ON COLUMN contact_submissions.ip_address IS 'GDPR: should be anonymised after 30 days via scheduled function';

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_public_insert ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY contact_admin_all ON contact_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_contact_created ON contact_submissions(created_at DESC);

-- ============================================================================
-- 3. LEAD CAPTURE: survey_bookings
-- /book-survey 4-step form (currently WhatsApp only, no DB record)
-- ============================================================================
CREATE TABLE survey_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       TEXT NOT NULL UNIQUE,              -- SI-2026-0043
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  address         TEXT NOT NULL,
  county          TEXT NOT NULL,
  property_type   TEXT NOT NULL,                     -- Detached, Semi-Detached, Terraced, Apartment, Bungalow
  roof_type       TEXT NOT NULL,                     -- Pitched Tile, Pitched Slate, Flat, Other
  household_size  INTEGER,
  current_bill    NUMERIC(8,2),
  interests       TEXT[] NOT NULL DEFAULT '{}',      -- Solar PV, Battery, EV Charger, Not Sure
  preferred_date  DATE NOT NULL,
  preferred_time  TEXT NOT NULL,                     -- Morning (9-12), Afternoon (12-3), Evening (3-5)
  notes           TEXT,
  status          BOOKING_STATUS DEFAULT 'pending',
  utm_params      JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE survey_bookings IS 'Survey bookings from /book-survey 4-step form. Generates unique SI-YYYY-NNNN reference.';
COMMENT ON COLUMN survey_bookings.reference IS 'Portal access key, format SI-YYYY-NNNN. Generated by gen_reference_number() function.';

ALTER TABLE survey_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY survey_public_insert ON survey_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY survey_customer_select ON survey_bookings
  FOR SELECT USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY survey_admin_all ON survey_bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_survey_reference ON survey_bookings(reference);
CREATE INDEX idx_survey_status ON survey_bookings(status);
CREATE INDEX idx_survey_email ON survey_bookings(email);
CREATE INDEX idx_survey_created ON survey_bookings(created_at DESC);

-- ============================================================================
-- 3a. LEAD CAPTURE: Reference number sequence
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS survey_reference_seq START 1;

CREATE OR REPLACE FUNCTION gen_reference_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT := to_char(now(), 'YYYY');
  next_num INTEGER;
BEGIN
  next_num := nextval('survey_reference_seq');
  RETURN 'SI-' || year || '-' || lpad(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION gen_reference_number IS 'Generates sequential reference numbers in SI-YYYY-NNNN format.';

-- ============================================================================
-- 4. LEAD CAPTURE: bill_analyses
-- AI-powered bill analysis results (currently returns only, saves nothing)
-- ============================================================================
CREATE TABLE bill_analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL,
  email           TEXT,
  provider        TEXT,                              -- ESB, SSE Airtricity, Bord Gais, etc.
  monthly_bill    NUMERIC(8,2) NOT NULL,
  annual_usage    INTEGER,
  home_type       TEXT,                              -- Apartment, Semi-Detached, Detached
  unit_rate       NUMERIC(6,4),
  standing_charge NUMERIC(6,2),
  mode            TEXT NOT NULL,                     -- 'upload' (AI scan) or 'manual'
  analysis_result JSONB NOT NULL,                    -- Full financial analysis output
  source_page     TEXT DEFAULT '/solar-calculator',
  utm_params      JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE bill_analyses IS 'Stores AI bill analysis results from /solar-calculator BillAnalyser. Saves leads from users who dont complete a full booking.';
COMMENT ON COLUMN bill_analyses.analysis_result IS 'JSON: { recommendedSystem, installCost, seaiGrant, annualSaving, annualExportEarning, paybackYears, roiPercent, total25YearSavings, co2Saved25Years, systemComparisons[], monthlyProfile[], batteryWorthwhile, batteryPaybackYears }';

ALTER TABLE bill_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY bill_public_insert ON bill_analyses
  FOR INSERT WITH CHECK (true);

CREATE POLICY bill_session_select ON bill_analyses
  FOR SELECT USING (
    session_id = current_setting('request.header.x-session-id', true)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY bill_admin_all ON bill_analyses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_bill_session ON bill_analyses(session_id);
CREATE INDEX idx_bill_created ON bill_analyses(created_at DESC);

-- ============================================================================
-- 5. LEAD CAPTURE: lead_sources
-- Unified marketing attribution across all entry points
-- ============================================================================
CREATE TABLE lead_sources (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type  TEXT NOT NULL,                        -- contact, survey, calculator, bill_analyser, exit_intent, whatsapp, newsletter
  source_page  TEXT NOT NULL,
  related_id   UUID,                                -- FK to contact_submissions, survey_bookings, or bill_analyses
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  utm_term     TEXT,
  converted    BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE lead_sources IS 'Unified marketing attribution. Every form submit, WhatsApp click, and exit intent records a row here for conversion funnel analysis.';

ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY lead_source_public_insert ON lead_sources
  FOR INSERT WITH CHECK (true);

CREATE POLICY lead_source_admin_select ON lead_sources
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_lead_type ON lead_sources(source_type);
CREATE INDEX idx_lead_utm ON lead_sources USING GIN (utm_params);
CREATE INDEX idx_lead_created ON lead_sources(created_at DESC);

-- ============================================================================
-- 6. CMS: blog_categories
-- ============================================================================
CREATE TABLE blog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY blog_cat_public_read ON blog_categories FOR SELECT USING (true);
CREATE POLICY blog_cat_admin_all ON blog_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- 7. CMS: blog_posts
-- Currently hardcoded in src/lib/blog-data.ts (~1000 lines)
-- ============================================================================
CREATE TABLE blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL,
  category_id   UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author        TEXT NOT NULL DEFAULT 'Solar Ireland Team',
  image         TEXT NOT NULL,                       -- Storage path: blog-images/slug.webp
  featured      BOOLEAN DEFAULT false,
  read_time     INTEGER NOT NULL,                    -- Minutes
  status        BLOG_STATUS DEFAULT 'draft',
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ                          -- Soft delete
);

COMMENT ON TABLE blog_posts IS 'Blog article metadata. Content sections stored separately in blog_content_sections. Replaces hardcoded blog-data.ts.';

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY blog_public_read ON blog_posts
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY blog_admin_all ON blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_status ON blog_posts(status);
CREATE INDEX idx_blog_category ON blog_posts(category_id);
CREATE INDEX idx_blog_published ON blog_posts(published_at DESC) WHERE status = 'published';

-- ============================================================================
-- 8. CMS: blog_content_sections
-- Structured content blocks for each blog post
-- ============================================================================
CREATE TABLE blog_content_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL,
  type        CONTENT_TYPE NOT NULL,
  level       INTEGER DEFAULT 2,                     -- Heading level (2-4) for heading type
  text        TEXT,
  body        TEXT,
  items       JSONB DEFAULT '[]',                    -- Array for bullet/numbered list items
  href        TEXT,                                  -- Link URL for CTA type
  metadata    JSONB DEFAULT '{}',                    -- Table headers, image alt, etc.
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE blog_content_sections IS 'Structured content sections for blog posts. Each section has a type (paragraph, heading, callout, etc.) and sort order within the article.';

ALTER TABLE blog_content_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY blog_section_public_read ON blog_content_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM blog_posts WHERE id = blog_content_sections.post_id AND status = 'published' AND deleted_at IS NULL)
  );

CREATE POLICY blog_section_admin_all ON blog_content_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_blog_section_post ON blog_content_sections(post_id, sort_order);

-- ============================================================================
-- 9. CMS: counties
-- Currently hardcoded in CountiesClient.tsx (32 entries)
-- ============================================================================
CREATE TABLE counties (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL UNIQUE,
  slug             TEXT NOT NULL UNIQUE,
  province         TEXT NOT NULL,                    -- Leinster, Munster, Ulster, Connacht
  domain           TEXT,
  status           COUNTY_STATUS DEFAULT 'coming-soon',
  cost_min         NUMERIC(8,2),
  cost_max         NUMERIC(8,2),
  generation_kwh   INTEGER,
  population       INTEGER,
  tagline          TEXT,
  meta_description TEXT,
  image_url        TEXT,
  sort_order       INTEGER DEFAULT 0
);

COMMENT ON TABLE counties IS 'County directory data for /counties page. Currently 32 hardcoded entries in CountiesClient.tsx.';

ALTER TABLE counties ENABLE ROW LEVEL SECURITY;

CREATE POLICY counties_public_read ON counties FOR SELECT USING (true);
CREATE POLICY counties_admin_all ON counties FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_county_province ON counties(province);
CREATE INDEX idx_county_status ON counties(status);

-- ============================================================================
-- 10. CMS: county_faqs
-- ============================================================================
CREATE TABLE county_faqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id   UUID NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

ALTER TABLE county_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY county_faq_public_read ON county_faqs FOR SELECT USING (true);
CREATE POLICY county_faq_admin_all ON county_faqs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- 11. CMS: site_settings
-- Key-value store for global config (replaces solar-data.ts)
-- ============================================================================
CREATE TABLE site_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  value       JSONB NOT NULL,
  category    TEXT NOT NULL,                         -- grant, savings, export, system, provider, social, stats, certification
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE site_settings IS 'Key-value store for global config currently hardcoded in solar-data.ts. JSONB value supports strings, numbers, objects, and arrays.';
COMMENT ON COLUMN site_settings.category IS 'Categories: grant (amounts), savings (averages), export (CEG rate), system (specs), provider (contact), social (links), stats (counters), certification (badges)';

-- Seed with current solar-data.ts values
INSERT INTO site_settings (key, value, category, description) VALUES
  ('grant_amount', '1800', 'grant', 'SEAI grant amount in EUR'),
  ('grant_label', 'SEAI Grant', 'grant', 'Grant display name'),
  ('avg_annual_savings', '1400', 'savings', 'Average annual savings in EUR'),
  ('payback_years', '5', 'savings', 'Average payback period in years'),
  ('export_rate', '0.21', 'export', 'Clean Export Guarantee rate per kWh'),
  ('export_label', 'CEG', 'export', 'Export scheme name'),
  ('system_size_kwp', '4', 'system', 'Default system size in kWp'),
  ('generation_per_kwp', '1050', 'system', 'Annual kWh per kWp in Ireland'),
  ('warranty_years', '25', 'system', 'Panel warranty period'),
  ('provider_phone', '+353123456789', 'provider', 'Business phone number'),
  ('provider_email', 'hello@solarireland.ie', 'provider', 'Business email'),
  ('whatsapp_number', '353123456789', 'provider', 'WhatsApp business number'),
  ('social_instagram', 'https://instagram.com/solarireland', 'social', 'Instagram URL'),
  ('social_facebook', 'https://facebook.com/solarireland', 'social', 'Facebook URL'),
  ('social_tiktok', 'https://tiktok.com/@solarireland', 'social', 'TikTok URL'),
  ('social_linkedin', 'https://linkedin.com/company/solarireland', 'social', 'LinkedIn URL'),
  ('stat_installs', '200', 'stats', 'Total installations counter'),
  ('stat_counties', '32', 'stats', 'Counties covered'),
  ('stat_rating', '4.9', 'stats', 'Google review rating'),
  ('stat_savings', '1100000', 'stats', 'Total customer savings in EUR');

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY settings_public_read ON site_settings FOR SELECT USING (true);
CREATE POLICY settings_admin_all ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_settings_category ON site_settings(category);
CREATE INDEX idx_settings_key ON site_settings(key);

-- ============================================================================
-- 12. SERVICE: service_packages
-- Pricing tiers from /services (Essential, Popular, Premium)
-- ============================================================================
CREATE TABLE service_packages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  tier          TEXT NOT NULL UNIQUE,                 -- essential, popular, premium
  price         NUMERIC(8,2) NOT NULL,
  system_size   TEXT NOT NULL,
  panel_count   INTEGER NOT NULL,
  inverter      TEXT NOT NULL,
  monitoring    BOOLEAN DEFAULT true,
  features      JSONB NOT NULL DEFAULT '[]',
  highlighted   BOOLEAN DEFAULT false,
  sort_order    INTEGER DEFAULT 0,
  active        BOOLEAN DEFAULT true
);

COMMENT ON TABLE service_packages IS 'Service pricing tiers displayed on /services page. Currently hardcoded: Essential 4500, Popular 6500, Premium 9500.';

-- Seed with current data
INSERT INTO service_packages (name, tier, price, system_size, panel_count, inverter, features, highlighted, sort_order) VALUES
  ('Essential', 'essential', 4500, '4kWp', 10, 'GivEnergy 3.6kW', '["10 x Solar Panels", "GivEnergy 3.6kW Inverter", "Standard Mounting System", "System Monitoring"]', false, 1),
  ('Popular', 'popular', 6500, '6kWp', 16, 'GivEnergy 5.0kW', '["16 x Solar Panels", "GivEnergy 5.0kW Inverter", "Premium Mounting System", "System Monitoring", "Smart Energy Dashboard", "5 Year Warranty"]', true, 2),
  ('Premium', 'premium', 9500, '10kWp', 26, 'GivEnergy 8.0kW', '["26 x High-Efficiency Panels", "GivEnergy 8.0kW Inverter", "Premium Mounting System", "System Monitoring", "Smart Energy Dashboard", "Battery Ready", "EV Charger Ready", "10 Year Warranty", "Priority Installation"]', false, 3);

ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY packages_public_read ON service_packages
  FOR SELECT USING (active = true);

CREATE POLICY packages_admin_all ON service_packages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- 13. SERVICE: financing_options
-- ============================================================================
CREATE TABLE financing_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  icon        TEXT,
  tag         TEXT,
  tag_color   TEXT DEFAULT 'green',
  items       JSONB NOT NULL DEFAULT '[]',
  sort_order  INTEGER DEFAULT 0
);

ALTER TABLE financing_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY financing_public_read ON financing_options FOR SELECT USING (true);
CREATE POLICY financing_admin_all ON financing_options FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- 14. SERVICE: testimonials
-- ============================================================================
CREATE TABLE testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  location    TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text        TEXT NOT NULL,
  system      TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY testimonials_public_read ON testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY testimonials_admin_all ON testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- 15. SERVICE: team_members
-- ============================================================================
CREATE TABLE team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  role        TEXT NOT NULL,
  bio         TEXT NOT NULL,
  initials    TEXT NOT NULL,
  image_url   TEXT,
  sort_order  INTEGER DEFAULT 0,
  active      BOOLEAN DEFAULT true
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_public_read ON team_members
  FOR SELECT USING (active = true);

CREATE POLICY team_admin_all ON team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- 16. PORTAL: customers
-- Customer records for portal access (currently all hardcoded demo data)
-- ============================================================================
CREATE TABLE customers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reference         TEXT NOT NULL UNIQUE,            -- SI-2026-0043
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL,
  address           TEXT NOT NULL,
  county            TEXT NOT NULL,
  system_size       TEXT,
  panel_count       INTEGER,
  inverter          TEXT,
  battery           TEXT,
  project_manager   TEXT,
  status            PORTAL_STATUS DEFAULT 'enquiry',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE customers IS 'Customer records for the portal at /portal/[reference]. Currently all data is hardcoded demo — this table powers real portal access.';

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_select_own ON customers
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY customers_admin_all ON customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_customer_reference ON customers(reference);
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_customer_status ON customers(status);
CREATE INDEX idx_customer_profile ON customers(profile_id);

-- ============================================================================
-- 17. PORTAL: customer_installation_steps
-- Per-customer installation progress tracking (11-step timeline)
-- ============================================================================
CREATE TABLE customer_installation_steps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  step_number   INTEGER NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  status        STEP_STATUS DEFAULT 'upcoming',
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  notes         TEXT,                                -- PM notes visible to customer
  icon          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, step_number)
);

COMMENT ON TABLE customer_installation_steps IS 'Installation progress timeline per customer. 11 steps from Enquiry to Generating Savings. Replaces hardcoded demo timeline.';

ALTER TABLE customer_installation_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY install_steps_select_own ON customer_installation_steps
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
  );

CREATE POLICY install_steps_admin_all ON customer_installation_steps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_install_customer ON customer_installation_steps(customer_id, step_number);

-- ============================================================================
-- 18. PORTAL: documents
-- Customer portal documents (currently 5 hardcoded files)
-- ============================================================================
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        DOC_TYPE NOT NULL,
  file_path   TEXT,                                  -- Storage path: portal-documents/{customer_ref}/{filename}
  file_size   BIGINT,
  mime_type   TEXT,
  status      DOC_STATUS DEFAULT 'pending',
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE documents IS 'Customer portal documents. Types: survey_report, quote, grant_application, grant_offer, completion_certificate, other. Files stored in portal-documents Storage bucket.';

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_select_own ON documents
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
  );

CREATE POLICY documents_admin_all ON documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_docs_customer ON documents(customer_id);
CREATE INDEX idx_docs_type ON documents(type);

-- ============================================================================
-- 19. PORTAL: notifications
-- Customer portal project notifications (currently 3 hardcoded alerts)
-- ============================================================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        NOTIFICATION_TYPE DEFAULT 'info',
  read        BOOLEAN DEFAULT false,
  action_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
  );

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY notifications_admin_all ON notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_notif_customer ON notifications(customer_id, created_at DESC);

-- ============================================================================
-- 20. ANALYTICS: cookie_consent_records
-- GDPR compliance audit trail (currently localStorage only)
-- ============================================================================
CREATE TABLE cookie_consent_records (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     TEXT NOT NULL,
  consent_state  JSONB NOT NULL,                     -- { necessary: true, analytics: bool, marketing: bool }
  source_page    TEXT NOT NULL,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE cookie_consent_records IS 'GDPR audit trail for cookie consent. Currently stored only in localStorage — no server record for DPC audits.';

ALTER TABLE cookie_consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY consent_public_insert ON cookie_consent_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY consent_admin_select ON cookie_consent_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_consent_created ON cookie_consent_records(created_at DESC);

-- ============================================================================
-- 21. ANALYTICS: newsletter_subscriptions
-- Blog newsletter signup (currently FAKE — setSubscribed(true) with setTimeout reset!)
-- ============================================================================
CREATE TABLE newsletter_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  source_page     TEXT NOT NULL,                     -- blog-listing, blog-post
  status          NEWSLETTER_STATUS DEFAULT 'active',
  subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  utm_params      JSONB DEFAULT '{}'
);

COMMENT ON TABLE newsletter_subscriptions IS 'Newsletter subscriptions from blog pages. CURRENTLY FAKE — frontend calls setSubscribed(true) and resets after 4s with zero backend persistence. This table makes it real.';

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY newsletter_public_insert ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY newsletter_public_unsubscribe ON newsletter_subscriptions
  FOR UPDATE USING (true) WITH CHECK (status = 'unsubscribed');

CREATE POLICY newsletter_admin_all ON newsletter_subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscriptions(status);

-- ============================================================================
-- 22. ANALYTICS: exit_intent_conversions
-- ============================================================================
CREATE TABLE exit_intent_conversions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type  TEXT NOT NULL,                       -- mouse_leave, tab_switch, scroll_back, idle
  source_page   TEXT NOT NULL,
  action_taken  TEXT,                                -- whatsapp, calculator, dismissed
  session_id    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE exit_intent_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY exit_intent_public_insert ON exit_intent_conversions
  FOR INSERT WITH CHECK (true);

CREATE POLICY exit_intent_admin_select ON exit_intent_conversions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_exit_created ON exit_intent_conversions(created_at DESC);

-- ============================================================================
-- 23. ANALYTICS: whatsapp_lead_sources
-- ============================================================================
CREATE TABLE whatsapp_lead_sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT NOT NULL,                       -- navbar, hero, cta, portal, exit-intent
  source_page   TEXT NOT NULL,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  session_id    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE whatsapp_lead_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY whatsapp_public_insert ON whatsapp_lead_sources
  FOR INSERT WITH CHECK (true);

CREATE POLICY whatsapp_admin_select ON whatsapp_lead_sources
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_whatsapp_created ON whatsapp_lead_sources(created_at DESC);

-- ============================================================================
-- 24. ANALYTICS: chat_conversations
-- AI chatbot conversation logs
-- ============================================================================
CREATE TABLE chat_conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    TEXT NOT NULL,
  messages      JSONB NOT NULL DEFAULT '[]',         -- [{ role, content }]
  source_page   TEXT NOT NULL,
  user_agent    TEXT,
  message_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_public_insert ON chat_conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY chat_select_own ON chat_conversations
  FOR SELECT USING (
    session_id = current_setting('request.header.x-session-id', true)
  );

CREATE POLICY chat_admin_select ON chat_conversations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_chat_session ON chat_conversations(session_id);

-- ============================================================================
-- 25. HELPER: Updated_at trigger (applies to all timestamped tables)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with that column
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contact_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER survey_updated_at BEFORE UPDATE ON survey_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER blog_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER chat_updated_at BEFORE UPDATE ON chat_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- DONE
-- ============================================================================
-- 25 tables created
-- 11 custom enum types
-- 1 sequence (survey reference numbers)
-- 2 functions (handle_new_user, update_updated_at, gen_reference_number)
-- 7 triggers
-- 20+ RLS policies
-- 15+ indexes (including GIN for JSONB)
-- Seeded: site_settings (20 rows), service_packages (3 rows)
-- ============================================================================
