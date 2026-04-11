const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, PageNumber,
  BorderStyle, WidthType, ShadingType, PageBreak,
  TableOfContents,
} = require("docx");

// ── Color Palette: GO-1 (Graphite Orange) — suitable for tech/solar proposals ──
const P = {
  bg: "1A2330",
  primary: "FFFFFF",
  accent: "D4875A",
  coverTitle: "FFFFFF",
  coverSubtitle: "B0B8C0",
  coverMeta: "90989F",
  coverFooter: "687078",
  body: "1A2B40",
  heading: "0A1628",
  secondary: "506878",
  tableBg: "D4875A",
  tableHeaderText: "FFFFFF",
  tableAccentLine: "D4875A",
  tableInnerLine: "DDD0C8",
  tableSurface: "F8F0EB",
};
const c = (hex) => hex.replace("#", "");

// ── Border helpers ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };

// ── Component builders ──
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 400 : 280, after: 140 },
    children: [new TextRun({ text, bold: true, color: c(P.heading), font: { ascii: "Calibri" }, size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 28 : 24 })],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: opts.noIndent ? undefined : { firstLine: 480 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 22, color: c(P.body), font: { ascii: "Calibri" } })],
  });
}

function bodyNoIndent(text) {
  return body(text, { noIndent: true });
}

function spacer(h = 120) {
  return new Paragraph({ spacing: { before: h, after: 0 }, children: [] });
}

function codeBlock(lines) {
  return lines.map((line, i) => new Paragraph({
    spacing: { line: 276, after: 0 },
    shading: { type: ShadingType.CLEAR, fill: "F5F3ED" },
    indent: { left: 360 },
    children: [new TextRun({ text: line, font: { ascii: "Consolas", eastAsia: "Microsoft YaHei" }, size: 18, color: c(P.body) })],
  }));
}

function bulletItem(text, level = 0) {
  return new Paragraph({
    spacing: { line: 312, after: 40 },
    indent: { left: 480 + level * 360 },
    children: [
      new TextRun({ text: level === 0 ? "\u2022 " : "\u25E6 ", size: 22, color: c(P.accent) }),
      new TextRun({ text, size: 22, color: c(P.body) }),
    ],
  });
}

function boldBody(label, value) {
  return new Paragraph({
    spacing: { line: 312, after: 40 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: label + " ", bold: true, size: 22, color: c(P.heading) }),
      new TextRun({ text: value, size: 22, color: c(P.body) }),
    ],
  });
}

// ── Table builder (horizontal-only with zebra) ──
function buildTable(headers, rows, colWidths) {
  const totalWidth = colWidths ? colWidths.reduce((a, b) => a + b, 0) : 100;
  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
      shading: { type: ShadingType.CLEAR, fill: c(P.tableBg) },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: c(P.tableHeaderText), font: { ascii: "Calibri" } })] })],
    })),
  });
  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) => new TableCell({
        width: colWidths ? { size: colWidths[ci], type: WidthType.PERCENTAGE } : undefined,
        shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? c(P.tableSurface) : "FFFFFF" },
        margins: { top: 50, bottom: 50, left: 120, right: 120 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "E0D8D0" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0D8D0" },
          left: NB, right: NB,
        },
        children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: String(cell), size: 19, color: c(P.body), font: { ascii: "Calibri" } })] })],
      })),
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: c(P.tableAccentLine) },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: c(P.tableAccentLine) },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D8D0C8" },
      insideVertical: NB,
    },
    rows: [headerRow, ...dataRows],
  });
}

// ── Cover Page (R1 recipe, dark bg) ──
function buildCover() {
  return [
    // Full-page wrapper table
    new Table({
      borders: allNoBorders,
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        height: { value: 16838, rule: "exact" },
        verticalAlign: "top",
        children: [new TableCell({
          borders: allNoBorders,
          shading: { type: ShadingType.CLEAR, fill: c(P.bg) },
          width: { size: 100, type: WidthType.PERCENTAGE },
          children: [
            spacer(3600),
            new Paragraph({
              spacing: { line: 600, after: 0 },
              children: [new TextRun({ text: "Solar Ireland", font: { ascii: "Calibri" }, size: 72, bold: true, color: c(P.coverTitle) })],
            }),
            spacer(200),
            new Paragraph({
              spacing: { line: 360, after: 0 },
              indent: { left: 0 },
              border: { top: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent), space: 12 } },
              children: [],
            }),
            spacer(200),
            new Paragraph({
              spacing: { after: 100 },
              children: [new TextRun({ text: "Supabase Database Schema", font: { ascii: "Calibri" }, size: 40, color: c(P.coverSubtitle) })],
            }),
            spacer(100),
            new Paragraph({
              spacing: { after: 60 },
              children: [new TextRun({ text: "Production Database Design & Implementation Guide", font: { ascii: "Calibri" }, size: 24, color: c(P.coverMeta) })],
            }),
            spacer(2200),
            new Paragraph({
              spacing: { after: 60 },
              children: [new TextRun({ text: "Version 1.0  |  April 2026", font: { ascii: "Calibri" }, size: 20, color: c(P.coverFooter) })],
            }),
            new Paragraph({
              spacing: { after: 60 },
              children: [new TextRun({ text: "Confidential  |  Solar Ireland Ltd.", font: { ascii: "Calibri" }, size: 20, color: c(P.coverFooter) })],
            }),
          ],
        })],
      })],
    }),
  ];
}

// ════════════════════════════════════════════════════════════════
// SECTION BUILDERS
// ════════════════════════════════════════════════════════════════

function section1_executiveSummary() {
  return [
    heading("1. Executive Summary"),
    body("This document defines the complete production database schema for the Solar Ireland website, built on Supabase (PostgreSQL). The schema covers all aspects of the business: customer enquiries, survey bookings, solar installations, SEAI grant tracking, content management, and GDPR-compliant consent handling."),
    heading("1.1 Purpose", HeadingLevel.HEADING_2),
    body("The Solar Ireland database serves as the single source of truth for all business operations. It replaces the current static data approach (hardcoded arrays in TypeScript files) with a dynamic, queryable, and real-time data layer that supports:"),
    bulletItem("Customer lead management across multiple acquisition channels (website, WhatsApp, phone, referrals)"),
    bulletItem("End-to-end installation tracking with milestone-based progress updates"),
    bulletItem("Customer portal access with reference-based authentication"),
    bulletItem("Content management for blog posts and case studies"),
    bulletItem("GDPR-compliant cookie consent and newsletter subscription tracking"),
    bulletItem("Document storage for BER certificates, warranties, and invoices"),
    bulletItem("SEAI grant application lifecycle management"),
    heading("1.2 Architecture Overview", HeadingLevel.HEADING_2),
    body("The architecture leverages Supabase, an open-source Firebase alternative built on PostgreSQL, providing:"),
    buildTable(
      ["Layer", "Technology", "Purpose"],
      [
        ["Database", "PostgreSQL 15+", "Relational data storage with full ACID compliance"],
        ["Authentication", "Supabase Auth", "User registration, login, and session management"],
        ["Realtime", "Supabase Realtime", "Live updates for portal milestones and notifications"],
        ["Storage", "Supabase Storage", "S3-compatible file storage for images and documents"],
        ["Edge Functions", "Deno / TypeScript", "Serverless functions for notifications, calculations"],
        ["Row Level Security", "PostgreSQL RLS", "Fine-grained access control per table and role"],
      ],
      [25, 30, 45]
    ),
    heading("1.3 Why Supabase", HeadingLevel.HEADING_2),
    body("Supabase was selected for several key reasons that align with Solar Ireland's requirements:"),
    bulletItem("PostgreSQL Foundation: Full access to advanced PostgreSQL features including enums, arrays, JSONB, triggers, and materialised views."),
    bulletItem("Built-in Authentication: Seamless integration with the existing customer portal, supporting email/password login and magic links."),
    bulletItem("Realtime Subscriptions: Portal users receive instant milestone updates without polling, improving the customer experience."),
    bulletItem("Storage with RLS: File uploads for installation photos and documents are protected by the same Row Level Security policies as the database."),
    bulletItem("Edge Functions: Server-side logic for calculations (savings estimator), notifications (email/SMS), and CRM integration runs close to the database with minimal latency."),
    bulletItem("GDPR Compliance: Built-in support for data retention policies, right-to-erasure, and audit logging."),
  ];
}

function section2_coreTables() {
  const sections = [];

  // ── 2.1 profiles ──
  sections.push(heading("2. Core Tables"));
  sections.push(body("This section defines all production database tables, including column definitions, constraints, defaults, and descriptions. Each table is presented with its full CREATE TABLE statement, a column breakdown, and example data."));

  sections.push(heading("2.1 profiles", HeadingLevel.HEADING_2));
  sections.push(body("The profiles table extends Supabase's built-in auth.users table with application-specific fields. It is automatically created (and populated with id and email) via a database trigger when a new user signs up through Supabase Auth. This table stores property details, electricity provider information, and county location to support personalised quotes and calculator results."));
  sections.push(heading("2.1.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TYPE property_type AS ENUM (",
    "  'apartment', 'terraced', 'semi-detached',",
    "  'detached', 'bungalow', 'cottage', 'derelict'",
    ");",
    "",
    "CREATE TABLE public.profiles (",
    "  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,",
    "  full_name     TEXT,",
    "  email         TEXT,",
    "  phone         TEXT,",
    "  county        TEXT,",
    "  address       TEXT,",
    "  property_type property_type,",
    "  roof_type     TEXT,",
    "  roof_orientation TEXT,",
    "  electricity_provider TEXT,",
    "  current_annual_bill NUMERIC(10,2),",
    "  household_size INT,",
    "  interests     TEXT[],",
    "  created_at    TIMESTAMPTZ DEFAULT now(),",
    "  updated_at    TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;",
    "",
    "CREATE OR REPLACE FUNCTION public.handle_new_user()",
    "RETURNS TRIGGER AS $$",
    "BEGIN",
    "  INSERT INTO public.profiles (id, email, full_name)",
    "  VALUES (",
    "    NEW.id,",
    "    NEW.email,",
    "    COALESCE(NEW.raw_user_meta_data->>'full_name', '')",
    "  );",
    "  RETURN NEW;",
    "END;",
    "$$ LANGUAGE plpgsql SECURITY DEFINER;",
    "",
    "CREATE TRIGGER on_auth_user_created",
    "  AFTER INSERT ON auth.users",
    "  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();",
  ]));
  sections.push(heading("2.1.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK, FK to auth.users", "Supabase Auth user ID"],
      ["full_name", "TEXT", "Nullable", "Customer full name"],
      ["email", "TEXT", "Nullable", "Email address (synced from auth.users)"],
      ["phone", "TEXT", "Nullable", "Phone number (E.164 format)"],
      ["county", "TEXT", "Nullable", "Irish county (32 counties)"],
      ["address", "TEXT", "Nullable", "Property address"],
      ["property_type", "property_type", "Nullable", "Property classification"],
      ["roof_type", "TEXT", "Nullable", "Roof type (pitched-tiled, flat, etc.)"],
      ["roof_orientation", "TEXT", "Nullable", "Primary roof orientation"],
      ["electricity_provider", "TEXT", "Nullable", "Current electricity supplier"],
      ["current_annual_bill", "NUMERIC(10,2)", "Nullable", "Annual electricity bill in EUR"],
      ["household_size", "INT", "Nullable", "Number of occupants"],
      ["interests", "TEXT[]", "Nullable", "Solar PV, battery, EV charger"],
      ["created_at", "TIMESTAMPTZ", "DEFAULT now()", "Profile creation timestamp"],
      ["updated_at", "TIMESTAMPTZ", "DEFAULT now()", "Last update timestamp"],
    ],
    [20, 18, 22, 40]
  ));
  sections.push(heading("2.1.3 Example Row", HeadingLevel.HEADING_3));
  sections.push(boldBody("id:", "a1b2c3d4-e5f6-7890-abcd-ef1234567890"));
  sections.push(boldBody("full_name:", "John Murphy"));
  sections.push(boldBody("email:", "john@example.com"));
  sections.push(boldBody("county:", "Dublin"));
  sections.push(boldBody("property_type:", "semi-detached"));
  sections.push(boldBody("interests:", "{solar-pv, battery}"));

  // ── 2.2 leads ──
  sections.push(heading("2.2 leads", HeadingLevel.HEADING_2));
  sections.push(body("The leads table captures every customer enquiry received through the website, regardless of channel. This includes contact form submissions, WhatsApp messages, survey bookings, calculator results, phone enquiries, and referrals. Each lead is tracked through a defined sales pipeline from initial contact to won or lost status."));
  sections.push(heading("2.2.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TYPE lead_source AS ENUM (",
    "  'website_contact', 'whatsapp', 'survey_booking',",
    "  'portal', 'calculator', 'phone', 'referral'",
    ");",
    "",
    "CREATE TYPE lead_status AS ENUM (",
    "  'new', 'contacted', 'qualified', 'survey_booked',",
    "  'quote_sent', 'won', 'lost', 'archived'",
    ");",
    "",
    "CREATE TABLE public.leads (",
    "  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  source          lead_source NOT NULL,",
    "  status          lead_status DEFAULT 'new',",
    "  first_name      TEXT NOT NULL,",
    "  last_name       TEXT,",
    "  email           TEXT,",
    "  phone           TEXT,",
    "  county          TEXT,",
    "  address         TEXT,",
    "  message         TEXT,",
    "  property_type   TEXT,",
    "  roof_type       TEXT,",
    "  household_size  INT,",
    "  current_bill    NUMERIC(10,2),",
    "  preferred_date  DATE,",
    "  preferred_time  TEXT,",
    "  interests       TEXT[],",
    "  notes           TEXT,",
    "  utm_source      TEXT,",
    "  utm_medium      TEXT,",
    "  utm_campaign    TEXT,",
    "  assigned_to     UUID REFERENCES public.profiles(id),",
    "  profile_id      UUID REFERENCES public.profiles(id),",
    "  created_at      TIMESTAMPTZ DEFAULT now(),",
    "  updated_at      TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.2.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK, DEFAULT gen_random_uuid()", "Unique lead identifier"],
      ["source", "lead_source", "NOT NULL", "Acquisition channel"],
      ["status", "lead_status", "DEFAULT 'new'", "Sales pipeline stage"],
      ["first_name", "TEXT", "NOT NULL", "Contact first name"],
      ["last_name", "TEXT", "Nullable", "Contact last name"],
      ["email", "TEXT", "Nullable", "Contact email"],
      ["phone", "TEXT", "Nullable", "Contact phone"],
      ["county", "TEXT", "Nullable", "Customer county"],
      ["address", "TEXT", "Nullable", "Property address"],
      ["message", "TEXT", "Nullable", "Free-text enquiry message"],
      ["property_type", "TEXT", "Nullable", "Detached, semi-d, apartment, etc."],
      ["roof_type", "TEXT", "Nullable", "Pitched-tiled, flat, slate, etc."],
      ["household_size", "INT", "Nullable", "Number of household occupants"],
      ["current_bill", "NUMERIC(10,2)", "Nullable", "Monthly electricity bill (EUR)"],
      ["preferred_date", "DATE", "Nullable", "Preferred survey date"],
      ["preferred_time", "TEXT", "Nullable", "morning/afternoon/late-afternoon"],
      ["interests", "TEXT[]", "Nullable", "solar-pv, battery, ev-charger, advise"],
      ["notes", "TEXT", "Nullable", "Internal notes from sales team"],
      ["utm_source", "TEXT", "Nullable", "Marketing campaign source"],
      ["utm_medium", "TEXT", "Nullable", "Marketing campaign medium"],
      ["utm_campaign", "TEXT", "Nullable", "Marketing campaign name"],
      ["assigned_to", "UUID", "FK to profiles", "Staff member assigned"],
      ["profile_id", "UUID", "FK to profiles", "Linked customer profile"],
      ["created_at", "TIMESTAMPTZ", "DEFAULT now()", "Enquiry timestamp"],
      ["updated_at", "TIMESTAMPTZ", "DEFAULT now()", "Last status update"],
    ],
    [20, 16, 24, 40]
  ));

  // ── 2.3 surveys ──
  sections.push(heading("2.3 surveys", HeadingLevel.HEADING_2));
  sections.push(body("The surveys table tracks all booked and completed property assessments. When a customer books a survey through the Book a Survey page, a lead is created (or updated) and a survey record is generated. Surveyors record their findings including roof measurements, orientation, shading assessment, and recommendations. The survey data feeds directly into the quote generation process."));
  sections.push(heading("2.3.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TYPE survey_status AS ENUM (",
    "  'scheduled', 'completed', 'cancelled', 'rescheduled'",
    ");",
    "",
    "CREATE TABLE public.surveys (",
    "  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  lead_id         UUID REFERENCES public.leads(id),",
    "  surveyor_id     UUID REFERENCES public.profiles(id),",
    "  scheduled_date  DATE NOT NULL,",
    "  scheduled_time  TEXT NOT NULL,",
    "  address         TEXT,",
    "  county          TEXT,",
    "  roof_access     TEXT DEFAULT 'standard',",
    "  roof_type       TEXT,",
    "  roof_orientation TEXT,",
    "  roof_pitch      TEXT,",
    "  shading_notes   TEXT,",
    "  recommended_system_size NUMERIC(5,2),",
    "  recommended_panel_count INT,",
    "  estimated_annual_gen NUMERIC(10,2),",
    "  estimated_annual_saving NUMERIC(10,2),",
    "  notes           TEXT,",
    "  status          survey_status DEFAULT 'scheduled',",
    "  completed_at    TIMESTAMPTZ,",
    "  created_at      TIMESTAMPTZ DEFAULT now(),",
    "  updated_at      TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.3.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK", "Unique survey identifier"],
      ["lead_id", "UUID", "FK to leads", "Associated lead/enquiry"],
      ["surveyor_id", "UUID", "FK to profiles", "Assigned surveyor"],
      ["scheduled_date", "DATE", "NOT NULL", "Survey date"],
      ["scheduled_time", "TEXT", "NOT NULL", "morning/afternoon/late-afternoon"],
      ["address", "TEXT", "Nullable", "Property address"],
      ["county", "TEXT", "Nullable", "County location"],
      ["roof_access", "TEXT", "DEFAULT 'standard'", "standard/ladder/internal"],
      ["roof_type", "TEXT", "Nullable", "Tiled, slate, flat, stone"],
      ["roof_orientation", "TEXT", "Nullable", "South, SW, East, etc."],
      ["roof_pitch", "TEXT", "Nullable", "Pitch angle or description"],
      ["shading_notes", "TEXT", "Nullable", "Trees, buildings, chimneys"],
      ["recommended_system_size", "NUMERIC(5,2)", "Nullable", "kWp recommendation"],
      ["recommended_panel_count", "INT", "Nullable", "Number of panels"],
      ["estimated_annual_gen", "NUMERIC(10,2)", "Nullable", "kWh per year estimate"],
      ["estimated_annual_saving", "NUMERIC(10,2)", "Nullable", "EUR per year estimate"],
      ["notes", "TEXT", "Nullable", "Surveyor general notes"],
      ["status", "survey_status", "DEFAULT 'scheduled'", "Survey status"],
      ["completed_at", "TIMESTAMPTZ", "Nullable", "Completion timestamp"],
      ["created_at", "TIMESTAMPTZ", "DEFAULT now()", "Creation timestamp"],
      ["updated_at", "TIMESTAMPTZ", "DEFAULT now()", "Last update timestamp"],
    ],
    [24, 18, 22, 36]
  ));

  // ── 2.4 installations ──
  sections.push(heading("2.4 installations", HeadingLevel.HEADING_2));
  sections.push(body("The installations table replaces the static installs array currently hardcoded in the CustomerInstalls.tsx component. It stores comprehensive details about each solar installation including system specifications, performance data, financial metrics, and gallery images. This data powers the customer showcase section, provides real performance data for the calculator, and supports the customer portal."));
  sections.push(heading("2.4.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TYPE installation_status AS ENUM (",
    "  'surveyed', 'design_approved', 'scaffolding',",
    "  'panels_mounted', 'wired', 'commissioned', 'completed'",
    ");",
    "",
    "CREATE TABLE public.installations (",
    "  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  customer_id     UUID REFERENCES public.profiles(id),",
    "  lead_id         UUID REFERENCES public.leads(id),",
    "  survey_id       UUID REFERENCES public.surveys(id),",
    "  reference       TEXT UNIQUE NOT NULL,",
    "  location        TEXT,",
    "  county          TEXT,",
    "  roof_type       TEXT NOT NULL,",
    "  system_size     NUMERIC(5,2) NOT NULL,",
    "  panel_count     INT NOT NULL,",
    "  panel_wattage   INT DEFAULT 400,",
    "  inverter        TEXT,",
    "  battery         TEXT,",
    "  orientation     TEXT NOT NULL,",
    "  annual_gen      NUMERIC(10,2),",
    "  annual_saving   NUMERIC(10,2),",
    "  payback_years   NUMERIC(5,1),",
    "  installed_date  TEXT,",
    "  status          installation_status DEFAULT 'surveyed',",
    "  featured        BOOLEAN DEFAULT false,",
    "  gallery_images  TEXT[],",
    "  caption         TEXT,",
    "  badge           TEXT,",
    "  created_at      TIMESTAMPTZ DEFAULT now(),",
    "  updated_at      TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.4.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK", "Unique installation ID"],
      ["customer_id", "UUID", "FK to profiles", "Customer profile link"],
      ["lead_id", "UUID", "FK to leads", "Original lead"],
      ["survey_id", "UUID", "FK to surveys", "Associated survey"],
      ["reference", "TEXT", "UNIQUE, NOT NULL", "SI-2026-XXXX format"],
      ["location", "TEXT", "Nullable", "Display location (e.g. 'Dublin')"],
      ["county", "TEXT", "Nullable", "County name"],
      ["roof_type", "TEXT", "NOT NULL", "Residential, tiled, flat, slate, stone"],
      ["system_size", "NUMERIC(5,2)", "NOT NULL", "kWp system size"],
      ["panel_count", "INT", "NOT NULL", "Number of panels"],
      ["panel_wattage", "INT", "DEFAULT 400", "Individual panel wattage"],
      ["inverter", "TEXT", "Nullable", "Inverter type and model"],
      ["battery", "TEXT", "Nullable", "Battery details or 'No'"],
      ["orientation", "TEXT", "NOT NULL", "South, South-West, etc."],
      ["annual_gen", "NUMERIC(10,2)", "Nullable", "Annual kWh generation"],
      ["annual_saving", "NUMERIC(10,2)", "Nullable", "Annual EUR savings"],
      ["payback_years", "NUMERIC(5,1)", "Nullable", "Payback period in years"],
      ["installed_date", "TEXT", "Nullable", "Installation date display"],
      ["status", "installation_status", "DEFAULT 'surveyed'", "Installation stage"],
      ["featured", "BOOLEAN", "DEFAULT false", "Show on homepage"],
      ["gallery_images", "TEXT[]", "Nullable", "Paths to Supabase Storage"],
      ["caption", "TEXT", "Nullable", "Short description"],
      ["badge", "TEXT", "Nullable", "Top Saver, Best ROI, Most Popular"],
      ["created_at", "TIMESTAMPTZ", "DEFAULT now()", "Record creation"],
      ["updated_at", "TIMESTAMPTZ", "DEFAULT now()", "Last update"],
    ],
    [20, 18, 22, 40]
  ));
  sections.push(heading("2.4.3 Example Row (migrated from static data)", HeadingLevel.HEADING_3));
  sections.push(boldBody("reference:", "SI-2025-0003"));
  sections.push(boldBody("location:", "Meath, Leinster"));
  sections.push(boldBody("roof_type:", "Tiled roof"));
  sections.push(boldBody("system_size:", "4.80 kWp"));
  sections.push(boldBody("panel_count:", "13"));
  sections.push(boldBody("annual_gen:", "4200.00 kWh/yr"));
  sections.push(boldBody("annual_saving:", "1050.00"));
  sections.push(boldBody("payback_years:", "5.8"));

  // ── 2.5 installation_milestones ──
  sections.push(heading("2.5 installation_milestones", HeadingLevel.HEADING_2));
  sections.push(body("The installation_milestones table powers the customer portal's timeline feature. Each installation progresses through a series of milestones (enquiry received, survey booked, quote delivered, installation scheduled, etc.). The portal displays these as a visual timeline with completed, in-progress, and upcoming states."));
  sections.push(heading("2.5.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TYPE milestone_type AS ENUM (",
    "  'enquiry_received', 'survey_booked', 'survey_completed',",
    "  'quote_delivered', 'quote_accepted', 'grant_applied',",
    "  'installation_scheduled', 'installation_complete',",
    "  'grant_approved', 'ecs_registration', 'savings_active'",
    ");",
    "",
    "CREATE TABLE public.installation_milestones (",
    "  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  installation_id UUID REFERENCES public.installations(id) ON DELETE CASCADE,",
    "  milestone_type  milestone_type NOT NULL,",
    "  title           TEXT NOT NULL,",
    "  subtitle        TEXT,",
    "  description     TEXT,",
    "  details         TEXT[],",
    "  milestone_date  DATE,",
    "  completed       BOOLEAN DEFAULT false,",
    "  sort_order      INT DEFAULT 0,",
    "  created_at      TIMESTAMPTZ DEFAULT now(),",
    "  updated_at      TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "ALTER TABLE public.installation_milestones ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.5.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK", "Unique milestone ID"],
      ["installation_id", "UUID", "FK, ON DELETE CASCADE", "Parent installation"],
      ["milestone_type", "milestone_type", "NOT NULL", "Milestone classification"],
      ["title", "TEXT", "NOT NULL", "Display title"],
      ["subtitle", "TEXT", "Nullable", "Short subtitle"],
      ["description", "TEXT", "Nullable", "Full description for portal"],
      ["details", "TEXT[]", "Nullable", "Extra detail strings"],
      ["milestone_date", "DATE", "Nullable", "Date milestone occurred"],
      ["completed", "BOOLEAN", "DEFAULT false", "Completion flag"],
      ["sort_order", "INT", "DEFAULT 0", "Display ordering"],
      ["created_at", "TIMESTAMPTZ", "DEFAULT now()", "Record creation"],
      ["updated_at", "TIMESTAMPTZ", "DEFAULT now()", "Last update"],
    ],
    [20, 18, 24, 38]
  ));

  // ── 2.6 quotes ──
  sections.push(heading("2.6 quotes", HeadingLevel.HEADING_2));
  sections.push(body("The quotes table stores formal solar quotes and estimates provided to customers. Each quote includes a detailed cost breakdown (equipment, installation, grant deduction), system specifications, estimated savings, and payback calculations. Quotes are linked to both leads and customer profiles, and have a validity period for pricing."));
  sections.push(heading("2.6.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TYPE quote_status AS ENUM (",
    "  'draft', 'sent', 'viewed', 'accepted',",
    "  'rejected', 'expired', 'revised'",
    ");",
    "",
    "CREATE TABLE public.quotes (",
    "  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  lead_id           UUID REFERENCES public.leads(id),",
    "  customer_id       UUID REFERENCES public.profiles(id),",
    "  installation_id   UUID REFERENCES public.installations(id),",
    "  quote_number      TEXT UNIQUE NOT NULL,",
    "  system_size       NUMERIC(5,2),",
    "  panel_count       INT,",
    "  panel_brand       TEXT,",
    "  inverter          TEXT,",
    "  battery_option    TEXT,",
    "  equipment_cost    NUMERIC(10,2),",
    "  installation_cost NUMERIC(10,2),",
    "  total_cost        NUMERIC(10,2),",
    "  grant_deduction   NUMERIC(10,2) DEFAULT 1800.00,",
    "  net_cost          NUMERIC(10,2),",
    "  annual_savings    NUMERIC(10,2),",
    "  payback_years     NUMERIC(5,1),",
    "  valid_until       DATE,",
    "  notes             TEXT,",
    "  status            quote_status DEFAULT 'draft',",
    "  created_at        TIMESTAMPTZ DEFAULT now(),",
    "  updated_at        TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.6.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK", "Unique quote ID"],
      ["lead_id", "UUID", "FK to leads", "Associated lead"],
      ["customer_id", "UUID", "FK to profiles", "Customer profile"],
      ["installation_id", "UUID", "FK to installations", "Linked installation"],
      ["quote_number", "TEXT", "UNIQUE, NOT NULL", "SQ-2026-XXXX format"],
      ["system_size", "NUMERIC(5,2)", "Nullable", "kWp system size quoted"],
      ["panel_count", "INT", "Nullable", "Number of panels quoted"],
      ["panel_brand", "TEXT", "Nullable", "Panel manufacturer"],
      ["inverter", "TEXT", "Nullable", "Inverter model"],
      ["battery_option", "TEXT", "Nullable", "Battery size and brand"],
      ["equipment_cost", "NUMERIC(10,2)", "Nullable", "Cost of panels + inverter + battery"],
      ["installation_cost", "NUMERIC(10,2)", "Nullable", "Labour and scaffolding"],
      ["total_cost", "NUMERIC(10,2)", "Nullable", "Equipment + installation"],
      ["grant_deduction", "NUMERIC(10,2)", "DEFAULT 1800.00", "SEAI grant amount"],
      ["net_cost", "NUMERIC(10,2)", "Nullable", "Total minus grant"],
      ["annual_savings", "NUMERIC(10,2)", "Nullable", "Estimated annual savings"],
      ["payback_years", "NUMERIC(5,1)", "Nullable", "Estimated payback period"],
      ["valid_until", "DATE", "Nullable", "Quote expiry date"],
      ["notes", "TEXT", "Nullable", "Additional terms or notes"],
      ["status", "quote_status", "DEFAULT 'draft'", "Quote lifecycle status"],
      ["created_at", "TIMESTAMPTZ", "DEFAULT now()", "Quote creation"],
      ["updated_at", "TIMESTAMPTZ", "DEFAULT now()", "Last update"],
    ],
    [20, 18, 24, 38]
  ));

  // ── 2.7 grant_applications ──
  sections.push(heading("2.7 grant_applications", HeadingLevel.HEADING_2));
  sections.push(body("The grant_applications table tracks SEAI grant submissions throughout their lifecycle. Solar Ireland handles grant paperwork on behalf of customers, so this table records the full journey from submission through approval to payment. It links directly to installations and stores key dates and monetary amounts."));
  sections.push(heading("2.7.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TYPE grant_status AS ENUM (",
    "  'pending', 'submitted', 'approved',",
    "  'paid', 'rejected', 'appealed'",
    ");",
    "",
    "CREATE TABLE public.grant_applications (",
    "  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  installation_id       UUID REFERENCES public.installations(id),",
    "  seai_application_no   TEXT UNIQUE,",
    "  grant_amount          NUMERIC(10,2) DEFAULT 1800.00,",
    "  status                grant_status DEFAULT 'pending',",
    "  submitted_at          TIMESTAMPTZ,",
    "  approved_at           TIMESTAMPTZ,",
    "  payment_at            TIMESTAMPTZ,",
    "  rejection_reason      TEXT,",
    "  notes                 TEXT,",
    "  created_at            TIMESTAMPTZ DEFAULT now(),",
    "  updated_at            TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.7.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK", "Unique application ID"],
      ["installation_id", "UUID", "FK to installations", "Linked installation"],
      ["seai_application_no", "TEXT", "UNIQUE", "SEAI reference number"],
      ["grant_amount", "NUMERIC(10,2)", "DEFAULT 1800.00", "Grant value in EUR"],
      ["status", "grant_status", "DEFAULT 'pending'", "Application status"],
      ["submitted_at", "TIMESTAMPTZ", "Nullable", "SEAI submission date"],
      ["approved_at", "TIMESTAMPTZ", "Nullable", "SEAI approval date"],
      ["payment_at", "TIMESTAMPTZ", "Nullable", "Payment received date"],
      ["rejection_reason", "TEXT", "Nullable", "Reason if rejected"],
      ["notes", "TEXT", "Nullable", "Internal notes"],
      ["created_at", "TIMESTAMPTZ", "DEFAULT now()", "Record creation"],
      ["updated_at", "TIMESTAMPTZ", "DEFAULT now()", "Last update"],
    ],
    [22, 18, 22, 38]
  ));

  // ── 2.8 blog_posts ──
  sections.push(heading("2.8 blog_posts", HeadingLevel.HEADING_2));
  sections.push(body("The blog_posts table replaces the static blog-data.ts file currently containing hardcoded article content. It supports a full content management workflow with draft/published states, SEO metadata, reading time calculations, category-based organisation, and tagging. The content field uses JSONB to store structured content sections (paragraphs, headings, callouts, tables, etc.) matching the existing ContentSection type in the TypeScript codebase."));
  sections.push(heading("2.8.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TABLE public.blog_posts (",
    "  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  slug            TEXT UNIQUE NOT NULL,",
    "  title           TEXT NOT NULL,",
    "  excerpt         TEXT,",
    "  content         JSONB DEFAULT '[]'::jsonb,",
    "  category        TEXT DEFAULT 'guides',",
    "  author          TEXT DEFAULT 'Cal O''Reilly',",
    "  image           TEXT,",
    "  icon_bg         TEXT DEFAULT 'bg-amber-400/10',",
    "  icon_color      TEXT DEFAULT 'text-amber-400',",
    "  featured        BOOLEAN DEFAULT false,",
    "  published       BOOLEAN DEFAULT false,",
    "  published_at    TIMESTAMPTZ,",
    "  seo_title       TEXT,",
    "  seo_description TEXT,",
    "  reading_time    TEXT,",
    "  tags            TEXT[],",
    "  created_at      TIMESTAMPTZ DEFAULT now(),",
    "  updated_at      TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);",
    "CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);",
    "CREATE INDEX idx_blog_posts_published ON public.blog_posts(published) WHERE published = true;",
    "",
    "ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.8.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK", "Unique post identifier"],
      ["slug", "TEXT", "UNIQUE, NOT NULL", "URL-friendly slug"],
      ["title", "TEXT", "NOT NULL", "Article title"],
      ["excerpt", "TEXT", "Nullable", "Short summary for cards"],
      ["content", "JSONB", "DEFAULT '[]'", "Structured content sections"],
      ["category", "TEXT", "DEFAULT 'guides'", "grants, savings, guides"],
      ["author", "TEXT", "DEFAULT 'Cal O'Reilly'", "Author name"],
      ["image", "TEXT", "Nullable", "Hero image path"],
      ["icon_bg", "TEXT", "DEFAULT 'bg-amber-400/10'", "Icon background class"],
      ["icon_color", "TEXT", "DEFAULT 'text-amber-400'", "Icon color class"],
      ["featured", "BOOLEAN", "DEFAULT false", "Featured on homepage"],
      ["published", "BOOLEAN", "DEFAULT false", "Published flag"],
      ["published_at", "TIMESTAMPTZ", "Nullable", "Publication date"],
      ["seo_title", "TEXT", "Nullable", "Meta title for SEO"],
      ["seo_description", "TEXT", "Nullable", "Meta description for SEO"],
      ["reading_time", "TEXT", "Nullable", "e.g. '8 min read'"],
      ["tags", "TEXT[]", "Nullable", "Searchable tags"],
      ["created_at", "TIMESTAMPTZ", "DEFAULT now()", "Post creation"],
      ["updated_at", "TIMESTAMPTZ", "DEFAULT now()", "Last update"],
    ],
    [20, 14, 24, 42]
  ));

  // ── 2.9 reviews ──
  sections.push(heading("2.9 reviews", HeadingLevel.HEADING_2));
  sections.push(body("The reviews table stores customer testimonials and ratings. Reviews can come from multiple sources (Google, Facebook, Trustpilot, email). Featured reviews are displayed on the homepage and marketing materials. An approval workflow ensures only vetted reviews are publicly visible."));
  sections.push(heading("2.9.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TYPE review_source AS ENUM (",
    "  'google', 'facebook', 'email', 'trustpilot'",
    ");",
    "",
    "CREATE TABLE public.reviews (",
    "  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  customer_id     UUID REFERENCES public.profiles(id),",
    "  installation_id UUID REFERENCES public.installations(id),",
    "  rating          INT NOT NULL CHECK (rating >= 1 AND rating <= 5),",
    "  title           TEXT,",
    "  body            TEXT NOT NULL,",
    "  customer_name   TEXT,",
    "  location        TEXT,",
    "  system_type     TEXT,",
    "  source          review_source DEFAULT 'email',",
    "  featured        BOOLEAN DEFAULT false,",
    "  approved        BOOLEAN DEFAULT false,",
    "  created_at      TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "CREATE INDEX idx_reviews_featured ON public.reviews(featured) WHERE featured = true AND approved = true;",
    "CREATE INDEX idx_reviews_rating ON public.reviews(rating);",
    "",
    "ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.9.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK", "Unique review ID"],
      ["customer_id", "UUID", "FK to profiles", "Customer profile"],
      ["installation_id", "UUID", "FK to installations", "Linked installation"],
      ["rating", "INT", "NOT NULL, 1-5 CHECK", "Star rating"],
      ["title", "TEXT", "Nullable", "Review title"],
      ["body", "TEXT", "NOT NULL", "Review text"],
      ["customer_name", "TEXT", "Nullable", "Display name"],
      ["location", "TEXT", "Nullable", "County or town"],
      ["system_type", "TEXT", "Nullable", "Solar PV + Battery"],
      ["source", "review_source", "DEFAULT 'email'", "Review platform"],
      ["featured", "BOOLEAN", "DEFAULT false", "Show on homepage"],
      ["approved", "BOOLEAN", "DEFAULT false", "Moderation approved"],
      ["created_at", "TIMESTAMPTZ", "DEFAULT now()", "Review date"],
    ],
    [20, 18, 24, 38]
  ));

  // ── 2.10 cookie_consent ──
  sections.push(heading("2.10 cookie_consent", HeadingLevel.HEADING_2));
  sections.push(body("The cookie_consent table provides a server-side audit trail of GDPR cookie consent records. While the current CookieConsent.tsx component stores consent in localStorage, this table ensures a reliable server-side record that survives browser data clearing and provides compliance evidence. It mirrors the three consent categories: necessary (always on), analytics, and marketing."));
  sections.push(heading("2.10.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TABLE public.cookie_consent (",
    "  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  session_id          TEXT,",
    "  consent_necessary   BOOLEAN DEFAULT true,",
    "  consent_analytics   BOOLEAN DEFAULT false,",
    "  consent_marketing   BOOLEAN DEFAULT false,",
    "  ip_address_hashed   TEXT,",
    "  user_agent          TEXT,",
    "  consent_version     TEXT DEFAULT '1.0',",
    "  consented_at        TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "CREATE INDEX idx_cookie_consent_session ON public.cookie_consent(session_id);",
    "CREATE INDEX idx_cookie_consent_date ON public.cookie_consent(consented_at);",
    "",
    "ALTER TABLE public.cookie_consent ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.10.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK", "Unique consent record ID"],
      ["session_id", "TEXT", "Nullable", "Browser session identifier"],
      ["consent_necessary", "BOOLEAN", "DEFAULT true", "Always-on cookies"],
      ["consent_analytics", "BOOLEAN", "DEFAULT false", "Google Analytics etc."],
      ["consent_marketing", "BOOLEAN", "DEFAULT false", "Facebook Pixel, retargeting"],
      ["ip_address_hashed", "TEXT", "Nullable", "SHA-256 hashed IP"],
      ["user_agent", "TEXT", "Nullable", "Browser user agent"],
      ["consent_version", "TEXT", "DEFAULT '1.0'", "Policy version at consent time"],
      ["consented_at", "TIMESTAMPTZ", "DEFAULT now()", "Consent timestamp"],
    ],
    [22, 18, 22, 38]
  ));

  // ── 2.11 newsletter_subscribers ──
  sections.push(heading("2.11 newsletter_subscribers", HeadingLevel.HEADING_2));
  sections.push(body("The newsletter_subscribers table manages email subscriptions for marketing communications. It supports subscribe/unsubscribe workflows with active/inactive status tracking and source attribution. Duplicate emails are prevented by a unique constraint."));
  sections.push(heading("2.11.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TABLE public.newsletter_subscribers (",
    "  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  email           TEXT UNIQUE NOT NULL,",
    "  source          TEXT DEFAULT 'website',",
    "  active          BOOLEAN DEFAULT true,",
    "  subscribed_at   TIMESTAMPTZ DEFAULT now(),",
    "  unsubscribed_at TIMESTAMPTZ",
    ");",
    "",
    "ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.11.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK", "Unique subscriber ID"],
      ["email", "TEXT", "UNIQUE, NOT NULL", "Subscriber email"],
      ["source", "TEXT", "DEFAULT 'website'", "website, footer, popup"],
      ["active", "BOOLEAN", "DEFAULT true", "Subscription status"],
      ["subscribed_at", "TIMESTAMPTZ", "DEFAULT now()", "Subscription date"],
      ["unsubscribed_at", "TIMESTAMPTZ", "Nullable", "Unsubscribe date"],
    ],
    [22, 18, 24, 36]
  ));

  // ── 2.12 documents ──
  sections.push(heading("2.12 documents", HeadingLevel.HEADING_2));
  sections.push(body("The documents table stores references to files uploaded to Supabase Storage. It covers all document types associated with installations and customers: invoices, BER certificates, warranties, grant letters, design documents, and before/after photos. The portal's Documents tab displays these files to customers."));
  sections.push(heading("2.12.1 CREATE TABLE Statement", HeadingLevel.HEADING_3));
  sections.push(...codeBlock([
    "CREATE TYPE document_type AS ENUM (",
    "  'invoice', 'ber_certificate', 'warranty',",
    "  'grant_letter', 'design', 'photo_before',",
    "  'photo_after', 'completion_cert', 'quote_document',",
    "  'survey_report', 'other'",
    ");",
    "",
    "CREATE TABLE public.documents (",
    "  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  installation_id UUID REFERENCES public.installations(id) ON DELETE CASCADE,",
    "  customer_id     UUID REFERENCES public.profiles(id),",
    "  doc_type        document_type NOT NULL,",
    "  title           TEXT NOT NULL,",
    "  description     TEXT,",
    "  storage_path    TEXT NOT NULL,",
    "  file_size       TEXT,",
    "  mime_type       TEXT,",
    "  uploaded_at     TIMESTAMPTZ DEFAULT now()",
    ");",
    "",
    "CREATE INDEX idx_documents_installation ON public.documents(installation_id);",
    "CREATE INDEX idx_documents_type ON public.documents(doc_type);",
    "",
    "ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;",
  ]));
  sections.push(heading("2.12.2 Column Breakdown", HeadingLevel.HEADING_3));
  sections.push(buildTable(
    ["Column", "Type", "Constraints", "Description"],
    [
      ["id", "UUID", "PK", "Unique document ID"],
      ["installation_id", "UUID", "FK, ON DELETE CASCADE", "Linked installation"],
      ["customer_id", "UUID", "FK to profiles", "Linked customer"],
      ["doc_type", "document_type", "NOT NULL", "Document classification"],
      ["title", "TEXT", "NOT NULL", "Display title"],
      ["description", "TEXT", "Nullable", "Additional description"],
      ["storage_path", "TEXT", "NOT NULL", "Supabase Storage path"],
      ["file_size", "TEXT", "Nullable", "Human-readable size"],
      ["mime_type", "TEXT", "Nullable", "MIME type"],
      ["uploaded_at", "TIMESTAMPTZ", "DEFAULT now()", "Upload timestamp"],
    ],
    [20, 18, 24, 38]
  ));

  return sections;
}

function section3_rls() {
  const items = [];
  items.push(heading("3. Row Level Security (RLS) Policies"));
  items.push(body("Row Level Security is enabled on every table in the Solar Ireland database. RLS policies ensure that users can only access data they are authorised to see, even if they share the same database connection pool. The following policies are applied per table:"));

  items.push(heading("3.1 profiles", HeadingLevel.HEADING_2));
  items.push(...codeBlock([
    "-- Users can read and update their own profile",
    "CREATE POLICY \"Users can view own profile\"",
    "  ON public.profiles FOR SELECT",
    "  USING (auth.uid() = id);",
    "",
    "CREATE POLICY \"Users can update own profile\"",
    "  ON public.profiles FOR UPDATE",
    "  USING (auth.uid() = id);",
    "",
    "-- Admin role has full access",
    "CREATE POLICY \"Admins have full access\"",
    "  ON public.profiles FOR ALL",
    "  USING (auth.jwt() ->> 'role' = 'admin');",
  ]));

  items.push(heading("3.2 leads", HeadingLevel.HEADING_2));
  items.push(...codeBlock([
    "-- Users can view leads linked to their profile",
    "CREATE POLICY \"Users view own leads\"",
    "  ON public.leads FOR SELECT",
    "  USING (auth.uid() = profile_id);",
    "",
    "-- Allow anon inserts (from contact forms)",
    "CREATE POLICY \"Allow anonymous inserts\"",
    "  ON public.leads FOR INSERT",
    "  WITH CHECK (true);",
    "",
    "-- Admin full access",
    "CREATE POLICY \"Admins full access leads\"",
    "  ON public.leads FOR ALL",
    "  USING (auth.jwt() ->> 'role' = 'admin');",
  ]));

  items.push(heading("3.3 installations", HeadingLevel.HEADING_2));
  items.push(...codeBlock([
    "-- Public read for completed, featured installations",
    "CREATE POLICY \"Public read completed installations\"",
    "  ON public.installations FOR SELECT",
    "  USING (status = 'completed');",
    "",
    "-- Users can view their own installations",
    "CREATE POLICY \"Users view own installations\"",
    "  ON public.installations FOR SELECT",
    "  USING (auth.uid() = customer_id);",
    "",
    "-- Admin full access",
    "CREATE POLICY \"Admins full access installations\"",
    "  ON public.installations FOR ALL",
    "  USING (auth.jwt() ->> 'role' = 'admin');",
  ]));

  items.push(heading("3.4 blog_posts", HeadingLevel.HEADING_2));
  items.push(...codeBlock([
    "-- Public read for published posts",
    "CREATE POLICY \"Public read published posts\"",
    "  ON public.blog_posts FOR SELECT",
    "  USING (published = true);",
    "",
    "-- Admin full access",
    "CREATE POLICY \"Admins full access blog_posts\"",
    "  ON public.blog_posts FOR ALL",
    "  USING (auth.jwt() ->> 'role' = 'admin');",
  ]));

  items.push(heading("3.5 reviews", HeadingLevel.HEADING_2));
  items.push(...codeBlock([
    "-- Public read for approved reviews",
    "CREATE POLICY \"Public read approved reviews\"",
    "  ON public.reviews FOR SELECT",
    "  USING (approved = true);",
    "",
    "-- Admin full access",
    "CREATE POLICY \"Admins full access reviews\"",
    "  ON public.reviews FOR ALL",
    "  USING (auth.jwt() ->> 'role' = 'admin');",
  ]));

  items.push(heading("3.6 Other Tables", HeadingLevel.HEADING_2));
  items.push(body("The remaining tables (surveys, quotes, grant_applications, installation_milestones, documents, cookie_consent, newsletter_subscribers) follow the same pattern: authenticated users can access their own data via customer_id or installation_id foreign keys, and the admin role has unrestricted access. Anonymous inserts are permitted for cookie_consent and newsletter_subscribers to support unauthenticated user interactions."));

  return items;
}

function section4_storage() {
  const items = [];
  items.push(heading("4. Supabase Storage Buckets"));
  items.push(body("Supabase Storage provides S3-compatible object storage with built-in Row Level Security. The following buckets are configured for the Solar Ireland project:"));
  items.push(buildTable(
    ["Bucket", "Purpose", "Access Level", "File Types"],
    [
      ["installations/", "Customer installation gallery images", "Public read, authenticated upload", "JPG, PNG, WebP"],
      ["documents/", "BER certs, warranties, invoices, quotes", "Authenticated read/write", "PDF, DOCX, PNG"],
      ["blog-images/", "Blog article hero and content images", "Public read, admin upload", "JPG, PNG, WebP"],
      ["profile-photos/", "Team member and customer photos", "Authenticated read/write", "JPG, PNG"],
    ],
    [18, 32, 26, 24]
  ));
  items.push(heading("4.1 Storage Policies", HeadingLevel.HEADING_2));
  items.push(...codeBlock([
    "-- installations bucket",
    "CREATE POLICY \"Public can view installation images\"",
    "  ON storage.objects FOR SELECT",
    "  USING (bucket_id = 'installations');",
    "",
    "CREATE POLICY \"Authenticated users can upload\"",
    "  ON storage.objects FOR INSERT",
    "  WITH CHECK (bucket_id = 'installations' AND auth.role() = 'authenticated');",
    "",
    "-- documents bucket",
    "CREATE POLICY \"Authenticated users can view own docs\"",
    "  ON storage.objects FOR SELECT",
    "  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);",
    "",
    "-- blog-images bucket (admin only)",
    "CREATE POLICY \"Admin upload blog images\"",
    "  ON storage.objects FOR INSERT",
    "  WITH CHECK (bucket_id = 'blog-images' AND auth.jwt() ->> 'role' = 'admin');",
  ]));

  return items;
}

function section5_edgeFunctions() {
  const items = [];
  items.push(heading("5. Edge Functions"));
  items.push(body("Supabase Edge Functions are Deno-based serverless functions that run close to the database. They handle business logic that should not run on the client, including notifications, calculations, and external integrations."));

  items.push(heading("5.1 send-notification", HeadingLevel.HEADING_2));
  items.push(body("Triggers automated email and SMS notifications when installation milestones are reached. Uses the SendGrid API for emails and Twilio for SMS."));
  items.push(buildTable(
    ["Parameter", "Type", "Description"],
    [
      ["installation_id", "UUID", "Target installation"],
      ["milestone_type", "String", "Milestone that triggered notification"],
      ["customer_email", "String", "Recipient email address"],
      ["customer_phone", "String", "Recipient phone number (E.164)"],
      ["channel", "String", "email, sms, or both"],
    ],
    [24, 18, 58]
  ));

  items.push(heading("5.2 calculate-savings", HeadingLevel.HEADING_2));
  items.push(body("Server-side savings calculator that uses Met Eireann solar irradiance data, current electricity provider rates, and SEAI grant information to generate accurate savings estimates. This ensures calculator results cannot be tampered with on the client side."));
  items.push(buildTable(
    ["Parameter", "Type", "Description"],
    [
      ["monthly_bill", "Number", "Monthly electricity bill in EUR"],
      ["property_type", "String", "detached, semi-detached, apartment"],
      ["county", "String", "Irish county for irradiance lookup"],
      ["include_battery", "Boolean", "Whether to include battery savings"],
    ],
    [24, 18, 58]
  ));

  items.push(heading("5.3 sync-contacts", HeadingLevel.HEADING_2));
  items.push(body("Synchronises new leads to external CRM systems (HubSpot, Salesforce) and the internal team WhatsApp notification channel. Runs as a database trigger via Supabase webhooks whenever a new lead is inserted."));

  items.push(heading("5.4 generate-ber", HeadingLevel.HEADING_2));
  items.push(body("Generates preliminary BER (Building Energy Rating) assessment estimates based on property type, year built, and planned solar installation. This provides customers with an estimated post-solar BER rating during the survey phase."));

  return items;
}

function section6_indexes() {
  const items = [];
  items.push(heading("6. Indexes & Performance"));
  items.push(body("Strategic indexes are created to optimise the most common query patterns. Partial indexes are used where appropriate to minimise index size while maximising query performance."));

  items.push(heading("6.1 Primary Indexes", HeadingLevel.HEADING_2));
  items.push(buildTable(
    ["Table", "Index", "Type", "Purpose"],
    [
      ["leads", "idx_leads_status", "B-tree", "Filter leads by status in sales pipeline"],
      ["leads", "idx_leads_source", "B-tree", "Analytics by acquisition channel"],
      ["leads", "idx_leads_created", "B-tree DESC", "Chronological lead listing"],
      ["leads", "idx_leads_email", "B-tree UNIQUE", "Deduplicate enquiries"],
      ["installations", "idx_installations_reference", "B-tree UNIQUE", "Portal lookup by reference"],
      ["installations", "idx_installations_status", "B-tree", "Filter by installation stage"],
      ["installations", "idx_installations_featured", "Partial", "Homepage showcase query"],
      ["blog_posts", "idx_blog_posts_slug", "B-tree UNIQUE", "URL routing"],
      ["blog_posts", "idx_blog_posts_published", "Partial", "Public blog listing"],
      ["blog_posts", "idx_blog_posts_category", "B-tree", "Category filtering"],
      ["surveys", "idx_surveys_status", "B-tree", "Survey schedule management"],
      ["surveys", "idx_surveys_date", "B-tree", "Date-range queries"],
      ["quotes", "idx_quotes_lead", "B-tree", "Quote lookup by lead"],
      ["grant_applications", "idx_grant_installation", "B-tree", "Grant status by installation"],
      ["documents", "idx_documents_installation", "B-tree", "Portal document listing"],
      ["documents", "idx_documents_type", "B-tree", "Document type filtering"],
    ],
    [18, 30, 16, 36]
  ));

  items.push(heading("6.2 Partial Index Examples", HeadingLevel.HEADING_2));
  items.push(...codeBlock([
    "-- Only index completed installations (smaller, faster)",
    "CREATE INDEX idx_installations_completed",
    "  ON public.installations(created_at DESC)",
    "  WHERE status = 'completed';",
    "",
    "-- Only index published blog posts",
    "CREATE INDEX idx_blog_posts_published_date",
    "  ON public.blog_posts(published_at DESC)",
    "  WHERE published = true;",
    "",
    "-- Only index featured, approved reviews",
    "CREATE INDEX idx_reviews_homepage",
    "  ON public.reviews(created_at DESC)",
    "  WHERE featured = true AND approved = true;",
  ]));

  return items;
}

function section7_seedData() {
  const items = [];
  items.push(heading("7. Seed Data"));
  items.push(body("Seed data is provided for development and staging environments. The seed script populates the database with realistic data migrated from the current static TypeScript files, ensuring feature parity during development."));

  items.push(heading("7.1 Installation Seed Data", HeadingLevel.HEADING_2));
  items.push(body("The following sample rows are migrated from the static installs array in CustomerInstalls.tsx:"));
  items.push(buildTable(
    ["Reference", "Location", "System", "Annual Gen", "Saving", "Payback"],
    [
      ["SI-2025-0001", "Client Home 1", "5.4 kWp (14 x 390W)", "4,850 kWh", "1,200", "5.5 yr"],
      ["SI-2025-0002", "Client Home 2", "4.2 kWp (12 x 350W)", "3,800 kWh", "950", "6.0 yr"],
      ["SI-2025-0003", "Meath, Leinster", "4.8 kWp (13 x 370W)", "4,200 kWh", "1,050", "5.8 yr"],
      ["SI-2025-0004", "Dublin, Leinster", "6.0 kWp (16 x 375W)", "5,200 kWh", "1,350", "5.2 yr"],
      ["SI-2024-0005", "Donegal, Ulster", "3.8 kWp (10 x 380W)", "3,400 kWh", "850", "6.5 yr"],
      ["SI-2025-0006", "Wicklow, Leinster", "7.2 kWp (18 x 400W)", "6,100 kWh", "1,500", "4.8 yr"],
    ],
    [14, 18, 24, 14, 10, 10]
  ));

  items.push(heading("7.2 Blog Post Seed Data", HeadingLevel.HEADING_2));
  items.push(body("Migrated from blog-data.ts:"));
  items.push(buildTable(
    ["Slug", "Title", "Category", "Date"],
    [
      ["complete-guide-seai-solar-grant-2026", "The Complete Guide to the SEAI Solar Grant in 2026", "grants", "15 Apr 2026"],
      ["how-much-do-solar-panels-cost-ireland-2026", "How Much Do Solar Panels Cost in Ireland? (2026)", "savings", "12 Apr 2026"],
      ["solar-panels-in-winter-do-they-work", "Solar Panels in Winter: Do They Actually Work?", "guides", "8 Apr 2026"],
      ["clean-export-guarantee-explained", "Clean Export Guarantee Explained", "grants", "4 Apr 2026"],
      ["east-vs-south-vs-west-facing-roofs-solar", "East vs South vs West-Facing Roofs", "guides", "28 Mar 2026"],
    ],
    [32, 30, 12, 12]
  ));

  items.push(heading("7.3 Solar Data Constants", HeadingLevel.HEADING_2));
  items.push(body("Key constants from solar-data.ts that inform database defaults and validation:"));
  items.push(buildTable(
    ["Constant", "Value", "Database Usage"],
    [
      ["SEAI Grant Amount", "1,800 EUR", "Default for grant_applications.grant_amount"],
      ["Average Annual Savings", "1,400 EUR", "Reference for quotes.annual_savings"],
      ["Payback Period", "5 years", "Reference for quotes.payback_years"],
      ["25-Year Savings", "48,000+ EUR", "Display metric only"],
      ["CEG Export Rate", "0.21 EUR/kWh", "Calculator constant"],
      ["Generation per kWp", "1,050 kWh/year", "Calculator constant"],
      ["Panel Warranty", "25 years", "Installation metadata"],
      ["Install Time", "1 day", "Installation scheduling"],
    ],
    [24, 20, 56]
  ));

  return items;
}

function section8_migration() {
  const items = [];
  items.push(heading("8. Migration Strategy"));
  items.push(body("Migrating from static data (TypeScript files) to Supabase requires a phased approach to ensure zero downtime and feature parity. The following strategy outlines the recommended migration path."));

  items.push(heading("8.1 Phase 1: Database Setup (Week 1-2)", HeadingLevel.HEADING_2));
  items.push(bulletItem("Deploy all migration files to Supabase (enums, tables, triggers, indexes)"));
  items.push(bulletItem("Configure storage buckets and policies"));
  items.push(bulletItem("Set up Supabase Auth with email/password provider"));
  items.push(bulletItem("Create admin user with elevated role"));
  items.push(bulletItem("Deploy Edge Functions (notification, calculator)"));
  items.push(bulletItem("Run seed scripts to populate development database"));

  items.push(heading("8.2 Phase 2: Blog Migration (Week 3)", HeadingLevel.HEADING_2));
  items.push(bulletItem("Migrate all blog posts from blog-data.ts to blog_posts table"));
  items.push(bulletItem("Upload blog images to Supabase Storage blog-images/ bucket"));
  items.push(bulletItem("Update blog pages to fetch from Supabase with static fallback"));
  items.push(bulletItem("Implement ISR (Incremental Static Regeneration) for blog pages"));

  items.push(heading("8.3 Phase 3: Lead Capture (Week 4)", HeadingLevel.HEADING_2));
  items.push(bulletItem("Connect contact form to leads table via API route"));
  items.push(bulletItem("Connect survey booking form to leads + surveys tables"));
  items.push(bulletItem("Add WhatsApp webhook handler for lead capture"));
  items.push(bulletItem("Implement calculator lead creation via Edge Function"));

  items.push(heading("8.4 Phase 4: Installation Showcase (Week 5)", HeadingLevel.HEADING_2));
  items.push(bulletItem("Migrate static installs array to installations table"));
  items.push(bulletItem("Upload gallery images to installations/ storage bucket"));
  items.push(bulletItem("Update CustomerInstalls.tsx to fetch from Supabase"));
  items.push(bulletItem("Implement admin panel for adding new installations"));

  items.push(heading("8.5 Phase 5: Portal & CRM (Week 6-8)", HeadingLevel.HEADING_2));
  items.push(bulletItem("Build customer portal with reference-based access"));
  items.push(bulletItem("Implement milestone tracking and real-time updates"));
  items.push(bulletItem("Connect quote generation to quotes table"));
  items.push(bulletItem("Implement SEAI grant tracking workflow"));
  items.push(bulletItem("Deploy document management with storage integration"));

  items.push(heading("8.6 Phase 6: GDPR & Compliance (Week 9)", HeadingLevel.HEADING_2));
  items.push(bulletItem("Implement server-side cookie consent recording"));
  items.push(bulletItem("Migrate newsletter subscriptions to database"));
  items.push(bulletItem("Implement right-to-erasure workflow (GDPR Article 17)"));
  items.push(bulletItem("Set up automated data retention policies"));

  return items;
}

function section9_erd() {
  const items = [];
  items.push(heading("9. Entity Relationship Diagram (ERD)"));
  items.push(body("The following text-based ERD shows all relationships between tables in the Solar Ireland database. Solid lines (---) represent foreign key relationships. Each table's primary key is marked with (PK)."));

  items.push(spacer(100));
  items.push(...codeBlock([
    "                    ┌─────────────┐",
    "                    │  auth.users │",
    "                    │   (id PK)   │",
    "                    └──────┬──────┘",
    "                           │ 1:1",
    "                    ┌──────┴──────┐",
    "                    │  profiles   │",
    "                    │   (id PK)   │",
    "                    └──┬───┬───┬──┘",
    "                       │   │   │",
    "            ┌──────────┘   │   └──────────┐",
    "            │              │              │",
    "     ┌──────┴──────┐ ┌────┴────┐  ┌──────┴──────┐",
    "     │    leads    │ │ surveys │  │ installations│",
    "     │  (id PK)    │ │(id PK)  │  │  (id PK)     │",
    "     └──────┬──────┘ └────┬────┘  └──┬───┬───┬───┘",
    "            │              │          │   │   │",
    "     ┌──────┴──────┐      │     ┌────┘   │   └────────┐",
    "     │   quotes     │      │     │        │            │",
    "     │  (id PK)    │──────┘     │   ┌────┴────┐  ┌────┴────┐",
    "     └─────────────┘            │   │milestones│  │ grant   │",
    "                               │   │  (id PK) │  │ _apps   │",
    "     ┌─────────────┐            │   └──────────┘  │(id PK)  │",
    "     │  blog_posts │            │                  └─────────┘",
    "     │  (id PK)    │            │",
    "     └─────────────┘       ┌────┴────┐",
    "                            │documents │",
    "     ┌─────────────┐        │ (id PK) │",
    "     │   reviews    │        └─────────┘",
    "     │  (id PK)    │",
    "     └─────────────┘",
    "",
    "     ┌──────────────┐  ┌────────────────────────┐",
    "     │cookie_consent │  │ newsletter_subscribers │",
    "     │  (id PK)     │  │      (id PK)           │",
    "     └──────────────┘  └────────────────────────┘",
  ]));

  items.push(heading("9.1 Relationship Summary", HeadingLevel.HEADING_2));
  items.push(buildTable(
    ["Relationship", "Type", "Description"],
    [
      ["auth.users -> profiles", "1:1", "Auth user has one profile"],
      ["profiles -> leads", "1:N", "Customer can have many enquiries"],
      ["profiles -> installations", "1:N", "Customer can have many installations"],
      ["leads -> surveys", "1:N", "Lead can result in multiple surveys"],
      ["leads -> quotes", "1:N", "Lead can receive multiple quotes"],
      ["surveys -> installations", "1:1", "Survey leads to one installation"],
      ["installations -> milestones", "1:N", "Installation has many milestones"],
      ["installations -> grant_applications", "1:1", "Installation has one grant application"],
      ["installations -> documents", "1:N", "Installation has many documents"],
      ["profiles -> reviews", "1:N", "Customer can write many reviews"],
    ],
    [32, 12, 56]
  ));

  return items;
}

// ════════════════════════════════════════════════════════════════
// DOCUMENT ASSEMBLY
// ════════════════════════════════════════════════════════════════

async function main() {
  const coverSection = {
    properties: {
      page: {
        size: { width: 11906, height: 16838, orientation: "portrait" },
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
      },
    },
    children: buildCover(),
  };

  // TOC section (Roman numerals)
  const tocSection = {
    properties: {
      page: {
        size: { width: 11906, height: 16838, orientation: "portrait" },
        margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
      },
      pageNumbers: { start: 1, formatType: "upperRoman" },
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary), font: { ascii: "Calibri" } }),
            ],
          }),
        ],
      }),
    },
    children: [
      new Paragraph({
        spacing: { before: 400, after: 300 },
        children: [new TextRun({ text: "Table of Contents", bold: true, size: 36, color: c(P.heading), font: { ascii: "Calibri" } })],
      }),
      new TableOfContents("Table of Contents", {
        hyperlink: true,
        headingStyleRange: "1-3",
      }),
      new Paragraph({ children: [new PageBreak()] }),
    ],
  };

  // Body section (Arabic, reset to 1)
  const bodyChildren = [
    ...section1_executiveSummary(),
    ...section2_coreTables(),
    ...section3_rls(),
    ...section4_storage(),
    ...section5_edgeFunctions(),
    ...section6_indexes(),
    ...section7_seedData(),
    ...section8_migration(),
    ...section9_erd(),
  ];

  const bodySection = {
    properties: {
      page: {
        size: { width: 11906, height: 16838, orientation: "portrait" },
        margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
      },
      pageNumbers: { start: 1, formatType: "decimal" },
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 80 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0D8D0", space: 8 } },
            children: [
              new TextRun({ text: "Solar Ireland \u2014 Supabase Database Schema", size: 16, color: c(P.secondary), font: { ascii: "Calibri" }, italics: true }),
              new TextRun({ text: "  |  v1.0", size: 16, color: c(P.secondary), font: { ascii: "Calibri" } }),
            ],
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: "E0D8D0", space: 8 } },
            children: [
              new TextRun({ text: "Confidential  |  Solar Ireland Ltd.  |  Page ", size: 16, color: c(P.secondary), font: { ascii: "Calibri" } }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: c(P.secondary), font: { ascii: "Calibri" } }),
            ],
          }),
        ],
      }),
    },
    children: bodyChildren,
  };

  const doc = new Document({
    creator: "Solar Ireland",
    title: "Solar Ireland \u2014 Supabase Database Schema",
    description: "Production Database Design & Implementation Guide",
    styles: {
      default: {
        document: {
          run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: c(P.body) },
          paragraph: { spacing: { line: 312 } },
        },
        heading1: {
          run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.heading) },
          paragraph: { spacing: { before: 400, after: 200 } },
        },
        heading2: {
          run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.heading) },
          paragraph: { spacing: { before: 300, after: 160 } },
        },
        heading3: {
          run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: c(P.heading) },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
      },
    },
    sections: [coverSection, tocSection, bodySection],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = "/home/z/my-project/download/Solar_Ireland_Supabase_Database_Schema.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Document generated: " + outPath);
}

main().catch((err) => { console.error(err); process.exit(1); });
