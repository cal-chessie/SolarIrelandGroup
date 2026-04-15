const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  SectionType, TableLayoutType, TableOfContents,
} = require("docx");
const fs = require("fs");

// ═══════════════════════════════════════════════════════════════
// PALETTE — DS-1 (Deep Sea) + custom overrides per task spec
// ═══════════════════════════════════════════════════════════════
const DS1 = {
  bg: "0B1C2C", primary: "FFFFFF", accent: "529286",
  cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
  table: { headerBg: "529286", headerText: "FFFFFF", accentLine: "529286", innerLine: "BECFCC", surface: "E8ECEB" },
};

// Body palette (light background)
const P = {
  primary: "0B1C2C",
  body: "000000",
  secondary: "506070",
  accent: "529286",
  surface: "E8ECEB",
};
const c = (hex) => hex.replace("#", "");

// ═══════════════════════════════════════════════════════════════
// BORDERS
// ═══════════════════════════════════════════════════════════════
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 10; // narrower for EN text
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    const cpl = charsPerLine(minPt);
    lines = splitTitleLines(title, cpl);
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([
    ...' ', '-', '/', '(', ')', ',', '.', ':', ';',
  ]);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

function calcCoverSpacing(params) {
  const {
    titleLineCount = 1, titlePt = 36, hasSubtitle = false,
    hasEnglishLabel = false, metaLineCount = 0,
    fixedHeight = 800, pageHeight = 16838,
    marginTop = 0, marginBottom = 0,
  } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight + metaHeight + fixedHeight + implicitParaHeight;
  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  return { topSpacing, midSpacing: 0, bottomSpacing };
}

// Cover recipe R1 (Pure Paragraph Left)
function buildCoverR1(config) {
  const palette = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length,
    fixedHeight: 400,
  });
  // Cap topSpacing to 4800 to stay under postcheck 5000 max (with safety margin)
  const topSp = Math.min(spacing.topSpacing, 4800);
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: palette.accent, space: 12 };
  const children = [];

  children.push(new Paragraph({ spacing: { before: topSp } }));

  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: palette.accent, space: 8 } },
      children: [new TextRun({
        text: config.englishLabel.split("").join("  "),
        size: 18, color: palette.accent,
        font: { ascii: "Times New Roman", eastAsia: "SimHei" }, characterSpacing: 40,
      })],
    }));
  }

  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({
        text: titleLines[i], size: titleSize, bold: true,
        color: palette.cover.titleColor,
        font: { ascii: "Times New Roman", eastAsia: "SimHei" },
      })],
    }));
  }

  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({
        text: config.subtitle, size: 24, color: palette.cover.subtitleColor,
        font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
      })],
    }));
  }

  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({
        text: line, size: 24, color: palette.cover.metaColor,
        font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
      })],
    }));
  }

  // Cap bottomSpacing to 4800 as well
  children.push(new Paragraph({ spacing: { before: Math.min(spacing.bottomSpacing, 4800) } }));

  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: palette.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: palette.cover.footerColor, font: { ascii: "Times New Roman" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: palette.cover.footerColor, font: { ascii: "Times New Roman" } }),
    ],
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: palette.bg }, borders: noBorders,
        children,
      })],
    })],
  })];
}

// ═══════════════════════════════════════════════════════════════
// BODY BUILDERS
// ═══════════════════════════════════════════════════════════════

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, color: c(P.primary), font: { ascii: "Times New Roman" } })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(P.primary), font: { ascii: "Times New Roman" } })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100, line: 312 },
    children: [new TextRun({ text, bold: true, size: 24, color: c(P.primary), font: { ascii: "Times New Roman" } })],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 60 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman" } })],
  });
}

function bodyBold(boldText, normalText) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 60 },
    children: [
      new TextRun({ text: boldText, bold: true, size: 24, color: c(P.body), font: { ascii: "Times New Roman" } }),
      new TextRun({ text: normalText, size: 24, color: c(P.body), font: { ascii: "Times New Roman" } }),
    ],
  });
}

// Table helper
function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const pctWidths = colWidths.map(w => (w / totalW) * 100);
  const borderStyle = {
    top: { style: BorderStyle.SINGLE, size: 2, color: c(P.accent) },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: c(P.accent) },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
    insideVertical: { style: BorderStyle.NONE },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: pctWidths[i], type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: c(DS1.table.headerBg) },
      borders: borderStyle,
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, size: 21, color: c(DS1.table.headerText), font: { ascii: "Times New Roman" } })],
      })],
    })),
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    cantSplit: true,
    children: row.map((cell, ci) => new TableCell({
      width: { size: pctWidths[ci], type: WidthType.PERCENTAGE },
      shading: ri % 2 === 0 ? { type: ShadingType.CLEAR, fill: c(DS1.table.surface) } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
      borders: borderStyle,
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: cell, size: 21, color: c(P.body), font: { ascii: "Times New Roman" } })],
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderStyle,
    rows: [headerRow, ...dataRows],
  });
}

function tableCaption(text) {
  return new Paragraph({
    spacing: { before: 60, after: 200, line: 312 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, italics: true, size: 21, color: c(P.secondary), font: { ascii: "Times New Roman" } })],
  });
}

function tableTitle(text) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 200, after: 80, line: 312 },
    children: [new TextRun({ text, bold: true, size: 22, color: c(P.primary), font: { ascii: "Times New Roman" } })],
  });
}

// ═══════════════════════════════════════════════════════════════
// PAGE SIZE
// ═══════════════════════════════════════════════════════════════
const pgSize = { width: 11906, height: 16838, orientation: "PORTRAIT" };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

// ═══════════════════════════════════════════════════════════════
// FOOTER BUILDERS
// ═══════════════════════════════════════════════════════════════
function romanFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
    })],
  });
}

function arabicFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
    })],
  });
}

function bodyHeader() {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "Solar Ireland \u2014 Production Deployment Guide", size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
    })],
  });
}

// ═══════════════════════════════════════════════════════════════
// CONTENT SECTIONS
// ═══════════════════════════════════════════════════════════════

function section1_execSummary() {
  return [
    h1("1. Executive Summary"),
    body("Solar Ireland is a comprehensive solar energy company website built on a modern technology stack designed to deliver high performance, excellent search engine visibility, and seamless customer engagement. The platform serves as the primary digital presence for Solar Ireland, providing potential customers with detailed information about solar photovoltaic installations, battery storage solutions, and electric vehicle charging infrastructure across all 32 counties of Ireland."),
    body("This Production Deployment Guide provides a complete, step-by-step reference for deploying the Solar Ireland web application from development to a live production environment. It covers every component of the system, from the Next.js 16 frontend application to the Supabase backend infrastructure, Vercel hosting configuration, WhatsApp Business API integration, and all associated third-party services. The guide is intended for DevOps engineers, system administrators, and technical leads who are responsible for managing the production deployment of this platform."),
    body("The application is built on Next.js 16 using the App Router architecture, which provides server-side rendering, static site generation, and edge runtime capabilities out of the box. The backend is powered by Supabase, an open-source Firebase alternative that provides a PostgreSQL database with built-in row-level security, authentication with JWT tokens, and file storage. The WhatsApp AI chatbot leverages the Meta Business API to provide automated lead qualification and survey booking directly through the WhatsApp messaging platform. Transactional emails are handled by Postmark, ensuring reliable delivery of confirmation messages, notifications, and marketing communications."),
    body("Following this guide in its entirety will result in a fully functional production deployment that includes all 37 database tables with proper row-level security policies, 6 Supabase Edge Functions for serverless business logic, a customer portal with magic-link authentication, an admin dashboard with real-time analytics, automated workflows triggered by customer lifecycle events, and a WhatsApp AI bot capable of qualifying leads through natural conversation. Each section includes detailed instructions, environment variable references, configuration examples, and troubleshooting guidance to address common deployment challenges."),
  ];
}

function section2_architecture() {
  return [
    h1("2. Architecture Overview"),
    body("The Solar Ireland platform follows a modern, decoupled architecture that separates the frontend application from backend services, enabling independent scaling and deployment. The frontend is a single-page application rendered by Next.js 16 using the App Router paradigm, which organises the codebase around file-system-based routing with nested layouts, loading states, and error boundaries. This architecture delivers fast page loads through server-side rendering of initial HTML while maintaining the interactivity of a client-side application through React hydration."),
    body("At the data layer, Supabase provides a fully managed PostgreSQL database hosted on Amazon Web Services infrastructure. The database schema consists of 37 tables organised across 11 functional domains: lead capture, content management, service and pricing, customer portal, email delivery, analytics and GDPR compliance, WhatsApp AI bot, Google Business Profile integration, social media management, automation engine, and authentication. Every table is protected by row-level security policies that enforce strict access control based on the authenticated user's role, which can be either anonymous, customer, or administrator."),
    body("Server-side business logic is handled by Supabase Edge Functions, which are lightweight TypeScript functions running on the Deno runtime at the edge, geographically close to users for minimal latency. The platform deploys 6 core Edge Functions that manage form submissions, survey bookings, bill analysis, WhatsApp webhook processing, Google Business Profile review synchronisation, and the admin dashboard aggregation API. These functions communicate with the database using the Supabase client library and enforce the same row-level security policies that protect direct database access from the frontend."),
    body("The WhatsApp AI chatbot represents a key differentiator in the architecture. It receives incoming messages from the Meta Business API through a webhook endpoint, processes each message using either OpenAI GPT-4o-mini or a keyword-matching fallback, qualifies the lead through a multi-stage conversation flow, and automatically creates survey bookings when a lead reaches the qualified stage. The bot maintains conversation state in the database, allowing it to resume qualification across multiple sessions. Transactional emails are sent through the Postmark API, with delivery tracking, open rates, and bounce handling recorded in the email log table for GDPR audit compliance."),

    tableTitle("Table 1: Technology Stack Components"),
    makeTable(
      ["Component", "Technology", "Purpose"],
      [
        ["Frontend Framework", "Next.js 16 (App Router)", "SSR, SSG, and client-side rendering"],
        ["Language", "TypeScript 5.x", "Type-safe application code"],
        ["UI Components", "Radix UI + Tailwind CSS 4", "Accessible, customisable interface components"],
        ["Charts", "Recharts 3.x", "Data visualisation in admin dashboard"],
        ["Database", "Supabase (PostgreSQL)", "Relational data storage with 37 tables"],
        ["Authentication", "Supabase Auth (JWT + RLS)", "Role-based access control"],
        ["File Storage", "Supabase Storage", "7 buckets for images, documents, uploads"],
        ["Serverless Logic", "Supabase Edge Functions (Deno)", "6 core business logic functions"],
        ["Hosting", "Vercel", "Frontend deployment with edge network CDN"],
        ["Email Service", "Postmark", "Transactional email with delivery tracking"],
        ["Messaging", "WhatsApp Business API (Meta)", "AI-powered lead qualification chatbot"],
        ["AI Engine", "OpenAI GPT-4o-mini", "Natural language understanding for bot"],
        ["Package Manager", "Bun", "Fast dependency installation and scripts"],
      ],
      [25, 30, 45],
    ),
    tableCaption("Table 1: Core technology stack powering the Solar Ireland platform."),
  ];
}

function section3_prerequisites() {
  return [
    h1("3. Prerequisites"),
    body("Before beginning the production deployment, several accounts and tools must be provisioned and configured. Each prerequisite listed below is essential for the complete functioning of the platform. Skipping any component will result in partial functionality, such as forms that cannot submit data, emails that fail to send, or a WhatsApp bot that does not respond to customer messages. It is strongly recommended to set up all prerequisites before starting the deployment process to avoid interruption."),
    body("The development environment requires Node.js version 18 or later installed on the deployment machine. Although the project uses Bun as its primary package manager for local development, the Vercel build environment provides its own Node.js runtime and will use the project's lockfile to install dependencies. The deployment machine also needs Git for version control and the Supabase CLI for managing Edge Function deployments. Both tools should be installed and authenticated before proceeding with the deployment steps outlined in this guide."),
    body("A Supabase account is required for the database, authentication, storage, and serverless functions. The free tier of Supabase provides sufficient resources for initial deployment and low-traffic production use, including 500 MB of database storage, 1 GB of file storage, and 500,000 Edge Function invocations per month. For production workloads with higher traffic volumes, the Pro tier at 25 dollars per month provides 8 GB of database storage, 100 GB of file storage, and 2 million Edge Function invocations. The Supabase project should be created in the EU-West-1 (Ireland) region to minimise latency for Irish users and comply with GDPR data residency requirements."),
    body("A Vercel account is needed for hosting the Next.js application. Vercel provides automatic SSL certificates, a global content delivery network, preview deployments for every pull request, and built-in analytics. The hobby tier is free and supports unlimited personal projects with 100 GB of bandwidth per month, which is adequate for initial production use. For commercial applications with higher traffic requirements, the Pro tier at 20 dollars per month provides 1 TB of bandwidth, password-protected preview deployments, and advanced analytics. A GitHub account is also required since Vercel connects directly to the Git repository for automatic deployments on every push to the main branch."),
    body("The WhatsApp Business API requires a Meta Business Suite account. Setting up this account involves creating a Meta Business Manager, registering a WhatsApp Business profile, and obtaining a phone number through a verified Business Service Provider. The verification process typically takes two to five business days and requires documentation including business registration certificates and proof of address. Additionally, a Postmark account is required for transactional email delivery. Postmark offers a free tier with 100 emails per month, which is sufficient for testing, and the Standard plan at 15 dollars per month provides 10,000 emails with dedicated IP addresses and improved deliverability."),
  ];
}

function section4_databaseSetup() {
  return [
    h1("4. Supabase Database Setup"),
    body("The Supabase database is the foundation of the Solar Ireland platform, storing all application data across 37 tables. The setup process begins with creating a new Supabase project and then applying the complete schema through the SQL Editor. The schema file, located at supabase/schema.sql in the project repository, contains approximately 1,500 lines of SQL that defines all tables, enums, indexes, triggers, functions, row-level security policies, and seed data. This single file should be executed in its entirety against a fresh Supabase project to ensure all dependencies are satisfied in the correct order."),

    h2("4.1 Creating the Supabase Project"),
    body("Navigate to the Supabase Dashboard at supabase.com and sign in with your account. Click the New Project button and fill in the project details: set the project name to solar-ireland-production, select the EU-West-1 (Ireland) region for GDPR compliance and optimal latency, and choose a strong database password that will be used for direct PostgreSQL connections. Once the project is provisioned, which typically takes two to three minutes, note the project URL and the anon public key from the Settings tab, as these will be needed as environment variables in subsequent steps."),

    h2("4.2 Applying the Database Schema"),
    body("Open the SQL Editor in the Supabase Dashboard by navigating to the SQL Editor tab in the left sidebar. Click the New Query button, paste the entire contents of supabase/schema.sql into the editor, and click Run. The script will execute sequentially, creating 14 custom enum types, 37 tables with appropriate constraints and foreign keys, 8 database triggers for automatic timestamp updates and data seeding, and multiple database functions including the reference number generator. The script also inserts seed data into seven critical tables and creates all row-level security policies. The entire execution should complete in under thirty seconds. If any errors occur, they will be displayed in the results panel, and the most common cause is attempting to run the script on a non-empty database where tables already exist."),

    h2("4.3 Verifying Row-Level Security Policies"),
    body("After the schema is applied, verify that row-level security is correctly configured by checking the RLS status on key tables. Navigate to the Authentication tab and then to the Policies section for each table. The profiles table should have policies enabling users to select their own profile while administrators have full CRUD access. The contact_submissions table should allow anonymous inserts but restrict all reads and updates to administrators. The customers table should allow anonymous selects by reference number (for the portal lookup) while restricting all other access to authenticated customers and administrators. The whatsapp_conversations table should allow anonymous inserts and updates (for the webhook) while restricting reads to administrators."),

    h2("4.4 Configuring Authentication Providers"),
    body("The Solar Ireland platform uses email-based magic link authentication for the customer portal. Navigate to the Authentication tab in the Supabase Dashboard and click on Providers. Enable the Email provider and disable all other providers (Google, GitHub, Apple, etc.) unless they are specifically required. Under the Email provider settings, enable the Confirm email option and set the site URL to your production domain. Under the Email Templates section, customise the confirmation email template with the Solar Ireland branding. The magic link flow will automatically create a user record in the profiles table through a database trigger defined in the schema."),

    h2("4.5 Setting Up Storage Buckets"),
    body("The platform requires seven storage buckets for different file types. Navigate to the Storage tab in the Supabase Dashboard and create the following buckets: blog-images (public), installation-photos (public), county-images (public), team-photos (public), portal-documents (authenticated), bill-uploads (service role only), and admin-assets (admin only). For each bucket, configure the allowed file types (jpg, png, webp for images; pdf for documents) and set appropriate file size limits. The public buckets should have their public access toggle enabled, while the portal-documents bucket should be restricted to authenticated users only."),

    tableTitle("Table 2: Seeded Data Tables"),
    makeTable(
      ["Table", "Records", "Purpose"],
      [
        ["site_settings", "15", "Company info, grant amounts, savings rates, contact details"],
        ["service_packages", "3", "Essential, Popular, and Premium pricing tiers"],
        ["service_details", "8", "Descriptions for all service offerings"],
        ["installation_step_templates", "11", "Master template for customer portal timeline"],
        ["email_templates", "16", "Postmark templates for all transactional events"],
        ["whatsapp_quick_replies", "8", "Keyword-triggered responses for WhatsApp bot"],
        ["whatsapp_bot_config", "1", "Bot greeting, prompts, session limits"],
        ["automation_rules", "6", "When-trigger-do-action workflow definitions"],
      ],
      [30, 15, 55],
    ),
    tableCaption("Table 2: Database tables populated with seed data during schema deployment."),
  ];
}

function section5_edgeFunctions() {
  return [
    h1("5. Edge Functions Deployment"),
    body("Supabase Edge Functions provide the server-side business logic layer for the Solar Ireland platform. These functions run on the Deno runtime at the edge, offering cold-start times under 50 milliseconds and geographical deployment that minimises latency for Irish users. The platform deploys six core Edge Functions that handle webhook processing, form submissions, AI-driven messaging, and administrative data aggregation. Each function is a standalone TypeScript module with its own dependencies and environment configuration."),

    tableTitle("Table 3: Edge Functions Inventory"),
    makeTable(
      ["Function", "Methods", "Trigger", "Purpose"],
      [
        ["whatsapp-webhook", "GET, POST", "Meta API", "Receives and verifies WhatsApp messages from Meta"],
        ["whatsapp-send-message", "POST", "Internal", "AI brain: processes messages, qualifies leads"],
        ["whatsapp-qualify-lead", "GET, PATCH, POST", "Admin", "Manages WhatsApp leads and manual bookings"],
        ["sync-gbp-reviews", "POST", "Cron (daily)", "Syncs Google Business Profile reviews to database"],
        ["admin-dashboard-api", "GET", "Admin", "Aggregates dashboard data from all tables"],
        ["run-automation", "POST", "Cron (5 min)", "Processes automation task queue"],
      ],
      [25, 15, 20, 40],
    ),
    tableCaption("Table 3: Complete inventory of Supabase Edge Functions."),

    h2("5.1 Installing the Supabase CLI"),
    body("The Supabase CLI is required to deploy Edge Functions from the command line. Install it using the appropriate package manager for your operating system. On macOS, run brew install supabase/tap/supabase. On Windows, use the installer available from the Supabase documentation. On Linux, use the shell installation script provided in the documentation. After installation, authenticate with your Supabase account by running supabase login and following the browser-based authentication flow. Link your local project to the remote Supabase project by running supabase link --project-ref your-project-ref, where the project reference can be found in the Supabase Dashboard URL."),

    h2("5.2 Deploying Functions"),
    body("Deploy all Edge Functions by navigating to the project root directory and running supabase functions deploy. This command will upload all function directories located in the supabase/functions folder, install their Deno dependencies, and make them available at the Supabase Edge Function URL. Each function can also be deployed individually by specifying its name, for example supabase functions deploy whatsapp-webhook. After deployment, verify that each function is accessible by checking the Functions tab in the Supabase Dashboard. Test the webhook endpoints using curl or a tool like Postman to confirm they respond correctly before configuring external services to send requests to them."),

    h2("5.3 Configuring Function Secrets"),
    body("Edge Functions that interact with external APIs require secret environment variables that must never be exposed to the client. Set these secrets using the Supabase CLI with the command supabase secrets set. The WhatsApp webhook requires WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID from the Meta Developer dashboard. The send-message function requires OPENAI_API_KEY for AI-powered lead qualification. The sync-gbp-reviews function requires GBP_ACCESS_TOKEN and GBP_ACCOUNT_ID from the Google Cloud Console. The run-automation function requires POSTMARK_SERVER_TOKEN for sending automated emails. Each secret should be set individually and verified by listing all secrets with supabase secrets list."),
  ];
}

function section6_vercelDeployment() {
  return [
    h1("6. Vercel Deployment"),
    body("Vercel provides the hosting infrastructure for the Solar Ireland Next.js application, offering automatic SSL certificate provisioning, a global content delivery network with over 300 edge locations, and zero-configuration deployments that build directly from the GitHub repository. The deployment process connects the GitHub repository to Vercel, configures build settings, sets environment variables, and triggers the initial production build. Subsequent deployments happen automatically whenever changes are pushed to the main branch of the connected repository."),

    h2("6.1 Connecting the GitHub Repository"),
    body("Sign in to Vercel at vercel.com using your GitHub account. Click the Add New Project button and select the solar-ireland repository from the list of available repositories. If the repository is not visible, ensure that Vercel has been granted access to the appropriate GitHub organisation or personal account in the GitHub integration settings. Configure the project name as solar-ireland-production and leave the root directory as the default unless the Next.js application is located in a subdirectory. Vercel will automatically detect the Next.js framework and configure the build settings accordingly."),

    h2("6.2 Configuring Build Settings"),
    body("Vercel automatically detects Next.js projects and sets the build command to next build and the output directory to .next. Verify these settings in the Build and Development Settings section of the project configuration. The framework preset should be Next.js and the Node.js version should be set to 18.x or later. Since the project uses Bun as its package manager locally, ensure that the lockfile detection is set to auto, which will allow Vercel to use npm based on the package-lock.json file. The install command should be left blank to use the default npm install behaviour. If custom build settings are needed, they can be specified in a vercel.json file at the project root."),

    h2("6.3 Setting Environment Variables"),
    body("Navigate to the Environment Variables section in the Vercel project settings and add all required variables. Variables prefixed with NEXT_PUBLIC_ are exposed to the browser and should contain only non-sensitive configuration values such as the Supabase project URL and the anonymous key. Secret variables such as the Supabase service role key, Postmark server token, and WhatsApp access token must never be prefixed with NEXT_PUBLIC_ and will only be available in server-side code and API routes. Each variable should be added with its value, and the environment should be set to Production, Preview, and Development as appropriate."),

    tableTitle("Table 4: Vercel Build Configuration"),
    makeTable(
      ["Setting", "Value", "Notes"],
      [
        ["Framework Preset", "Next.js", "Auto-detected from repository"],
        ["Build Command", "next build", "Default Next.js build command"],
        ["Output Directory", ".next", "Default Next.js output directory"],
        ["Install Command", "npm install", "Uses package-lock.json"],
        ["Node.js Version", "18.x", "Minimum required version"],
        ["Root Directory", "./", "Project root contains next.config.ts"],
      ],
      [30, 35, 35],
    ),
    tableCaption("Table 4: Vercel build configuration for the Solar Ireland project."),

    h2("6.4 Triggering the Initial Deployment"),
    body("After configuring the build settings and environment variables, click the Deploy button to trigger the initial production build. Vercel will clone the repository, install dependencies, run the build command, and deploy the output to its global edge network. The build typically completes in two to four minutes depending on the repository size and dependency count. Monitor the build progress in the Vercel dashboard and review the build logs for any errors. Once the build succeeds, Vercel will provide a production URL in the format solar-ireland-production.vercel.app. Test this URL thoroughly before configuring the custom domain to ensure all pages render correctly, forms submit properly, and the WhatsApp chatbot responds as expected."),
  ];
}

function section7_envVariables() {
  return [
    h1("7. Environment Variables Reference"),
    body("The Solar Ireland platform relies on a comprehensive set of environment variables for configuration across the frontend, backend, and Edge Function layers. These variables control database connectivity, API authentication, third-party service integration, and feature flags. Proper configuration of these variables is critical for the platform to function correctly in production. Variables are grouped into three categories: Supabase configuration, external API credentials, and feature flags."),

    tableTitle("Table 5: Environment Variables Reference"),
    makeTable(
      ["Variable", "Required", "Description", "Example Value"],
      [
        ["NEXT_PUBLIC_SUPABASE_URL", "Yes", "Supabase project REST endpoint", "https://abc.supabase.co"],
        ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Yes", "Supabase anonymous public key", "eyJhbGciOi..."],
        ["SUPABASE_SERVICE_ROLE_KEY", "Yes", "Supabase admin key (server only)", "eyJhbGciOi..."],
        ["POSTMARK_SERVER_API_TOKEN", "Yes", "Postmark server API token", "abc123def456"],
        ["POSTMARK_FROM_EMAIL", "Yes", "Sender email address", "hello@solarireland.ie"],
        ["NEXT_PUBLIC_SITE_URL", "Yes", "Production site URL", "https://solarireland.org"],
        ["WHATSAPP_ACCESS_TOKEN", "Yes", "Meta WhatsApp access token", "EAAx..."],
        ["WHATSAPP_PHONE_NUMBER_ID", "Yes", "WhatsApp Business phone number ID", "123456789"],
        ["WHATSAPP_VERIFY_TOKEN", "Yes", "Webhook verification token", "solar_ireland_verify"],
        ["OPENAI_API_KEY", "No", "OpenAI API key for AI chatbot", "sk-..."],
        ["GBP_ACCESS_TOKEN", "No", "Google Business Profile token", "ya29..."],
        ["GBP_ACCOUNT_ID", "No", "Google Business Profile account ID", "accounts/123"],
        ["NEXT_PUBLIC_GA_ID", "No", "Google Analytics measurement ID", "G-XXXXXXXXXX"],
        ["NEXT_PUBLIC_ENABLE_BOT", "No", "Enable WhatsApp chatbot widget", "true"],
      ],
      [30, 10, 35, 25],
    ),
    tableCaption("Table 5: Complete environment variable reference with status and examples."),

    body("Variables prefixed with NEXT_PUBLIC_ are embedded into the client-side JavaScript bundle at build time and are visible in the browser's network tab. These should only contain non-sensitive values. The Supabase anonymous key is safe to expose because row-level security policies in the database prevent unauthorised access even if the key is known. The service role key, on the other hand, bypasses all row-level security policies and must never be exposed to the client. It should only be used in server-side API routes and Edge Functions where it is stored securely in the Vercel and Supabase secret management systems respectively."),
  ];
}

function section8_domainDns() {
  return [
    h1("8. Domain and DNS Configuration"),
    body("Configuring a custom domain for the Solar Ireland production deployment provides a professional web address, improves search engine ranking, and establishes brand consistency across all customer touchpoints. The process involves configuring the domain in Vercel, setting up DNS records with the domain registrar, provisioning an SSL certificate, and updating authentication redirect URLs in the Supabase configuration. Each step must be completed in sequence to avoid service interruptions."),

    h2("8.1 Configuring the Custom Domain in Vercel"),
    body("Navigate to the Settings tab in the Vercel project dashboard and click on Domains. Enter the custom domain name, such as solarireland.org, and click Add. Vercel will validate the domain and provide the required DNS records. If the domain has not been previously configured with another provider, Vercel can automatically configure the DNS records through its integration with popular domain registrars. For manual configuration, Vercel provides an A record pointing to 76.76.21.21 and a CNAME record pointing to cname.vercel-dns.com. Both records should be added in the domain registrar's DNS management console."),

    h2("8.2 DNS Records and SSL Certificate"),
    body("After adding the DNS records, wait for DNS propagation, which typically takes between five minutes and 48 hours depending on the domain registrar and TTL settings. Vercel will automatically provision a free SSL certificate through Let's Encrypt once the DNS records are verified. The SSL certificate status can be monitored in the Vercel domain settings, and a padlock icon will appear in the browser address bar when the certificate is active. Vercel also automatically handles certificate renewal, so no manual intervention is required for ongoing SSL maintenance. Ensure that the domain registrar's DNSSEC settings are compatible with Vercel's configuration to prevent resolution failures."),

    h2("8.3 Updating Supabase Authentication Redirects"),
    body("After the custom domain is active, update the Supabase project's authentication settings to allow redirects to the new domain. Navigate to the Authentication tab in the Supabase Dashboard, click on URL Configuration, and add the production URL to the Site URL field. Also add the domain to the Redirect URLs list, including specific paths such as /portal/[reference]/callback for the magic-link authentication flow. Without these redirect configurations, the authentication flow will fail because Supabase rejects redirects to domains that are not explicitly whitelisted. Additionally, update the Content Security Policy frame-ancestors directive in next.config.ts to include the production domain alongside the development preview domains."),
  ];
}

function section9_whatsappConfig() {
  return [
    h1("9. WhatsApp Bot Configuration"),
    body("The WhatsApp AI chatbot is a central lead generation tool that engages potential customers through the WhatsApp messaging platform, qualifies them through a structured conversation flow, and automatically books free home surveys. The bot is built on the Meta WhatsApp Business API and processes incoming messages through a Supabase Edge Function webhook. Configuration requires setting up a Meta Developer account, creating a WhatsApp Business Profile, configuring the webhook endpoint, and verifying the quick replies and bot configuration stored in the database."),

    h2("9.1 Meta Developer Account Setup"),
    body("Create a Meta Developer account at developers.facebook.com and navigate to the My Apps section. Click Create App and select the Business type. Provide the app name as Solar Ireland WhatsApp Bot and associate it with your Meta Business Manager account. Once the app is created, add the WhatsApp Business API product from the product catalogue. This will generate a WhatsApp Business phone number and provide the access token and phone number ID needed for Edge Function configuration. The phone number verification process requires a valid phone number that can receive SMS or voice calls, and the number will be used as the sender for all WhatsApp messages sent by the bot."),

    h2("9.2 Webhook URL Configuration"),
    body("In the Meta Developer dashboard, navigate to the WhatsApp Business API configuration and locate the Webhook settings. Set the callback URL to your Supabase Edge Function endpoint in the format https://your-project.supabase.co/functions/v1/whatsapp-webhook. Set the verify token to the same value configured in the WHATSAPP_VERIFY_TOKEN environment variable. Subscribe to the messages event to receive incoming messages. When you click Verify and Save, Meta will send a GET request to the webhook URL with a challenge parameter, which the Edge Function will echo back to confirm the subscription. If verification fails, check that the Edge Function is deployed and accessible, and that the verify token matches exactly."),

    h2("9.3 Quick Replies and Bot Configuration"),
    body("The WhatsApp bot uses pre-configured quick replies stored in the whatsapp_quick_replies table to provide instant responses to common customer inquiries about pricing, SEAI grants, battery storage, EV charging, installation availability, the installation process, warranty coverage, and potential savings. These quick replies are loaded by the whatsapp-send-message Edge Function and used as context for the AI model. Verify that all 8 quick reply records exist in the database by querying the table through the Supabase Dashboard SQL Editor. The whatsapp_bot_config table contains a single configuration record that defines the bot's greeting message, qualification prompts, maximum session duration, and fallback behaviour when the AI model is unavailable."),
  ];
}

function section10_postDeployChecklist() {
  return [
    h1("10. Post-Deployment Checklist"),
    body("After completing all deployment steps, a comprehensive verification process is essential to ensure every component of the Solar Ireland platform functions correctly in the production environment. The following checklist covers all critical system components and should be completed systematically before declaring the deployment successful. Each item should be tested by performing the described action and verifying the expected result. Any failures should be investigated using the troubleshooting guidance provided in Section 12 of this document."),

    tableTitle("Table 6: Post-Deployment Verification Checklist"),
    makeTable(
      ["Component", "Test Action", "Expected Result"],
      [
        ["Database Connection", "Visit the homepage and check for console errors", "No Supabase connection errors"],
        ["Authentication", "Submit email via portal login form", "Magic link email received within 30s"],
        ["Contact Form", "Submit the contact form with test data", "Success confirmation displayed"],
        ["Survey Booking", "Complete 4-step booking form", "Reference number generated and email sent"],
        ["WhatsApp Bot", "Send a message to the WhatsApp number", "Greeting message received within 5s"],
        ["WhatsApp Qualification", "Answer bot questions through conversation", "Lead qualifies and survey is booked"],
        ["Email Delivery", "Trigger any email-sending action", "Email arrives in inbox (check spam folder)"],
        ["Admin Dashboard", "Log in as admin, visit /admin", "Dashboard loads with charts and data"],
        ["Customer Portal", "Enter a valid reference at /portal", "Portal dashboard displays timeline"],
        ["SSL Certificate", "Visit https://solarireland.org", "Valid certificate, padlock icon visible"],
        ["Sitemap", "Visit /sitemap.xml", "XML sitemap with all public pages"],
        ["Google Indexing", "Submit sitemap in Google Search Console", "No errors in coverage report"],
        ["Page Performance", "Run Lighthouse audit on homepage", "Performance score above 90"],
        ["Security Headers", "Check headers with securityheaders.com", "All headers present and configured"],
      ],
      [20, 35, 45],
    ),
    tableCaption("Table 6: Comprehensive post-deployment verification checklist."),
  ];
}

function section11_monitoring() {
  return [
    h1("11. Monitoring and Maintenance"),
    body("Ongoing monitoring is essential to maintain the reliability, performance, and security of the Solar Ireland production platform. A comprehensive monitoring strategy covers four key areas: infrastructure monitoring, application performance monitoring, uptime monitoring, and error tracking. Each area requires specific tools and configuration to provide visibility into system health and enable rapid response to issues. Establishing these monitoring systems during the initial deployment prevents blind spots that could lead to undetected outages or degraded performance."),

    body("Vercel provides built-in analytics that track page views, visitor demographics, and Core Web Vitals metrics including Largest Contentful Paint, First Input Delay, and Cumulative Layout Shift. These metrics are automatically collected from real user interactions and displayed in the Vercel Analytics dashboard. The Speed Insights feature provides real-time performance data that helps identify pages with rendering bottlenecks or excessive JavaScript bundle sizes. Additionally, Vercel Logs capture all server-side console output, request headers, and response codes, providing a detailed audit trail for debugging production issues."),

    body("The Supabase Dashboard provides real-time monitoring of database performance, connection counts, storage usage, and Edge Function invocation counts. Key metrics to monitor include database query latency (should remain under 100 milliseconds for typical operations), active connections (should stay well below the project's connection pool limit), storage consumption (should be monitored against the plan's storage quota), and Edge Function response times (should remain under 200 milliseconds for the 95th percentile). Supabase also provides database logs that record all SQL queries, which can be used to identify slow queries and optimise database performance."),

    body("Uptime monitoring should be configured using a free service such as UptimeRobot to send HTTP requests to the production URL every five minutes and alert the operations team via email or Slack if the site becomes unavailable or returns error status codes. For error tracking, Sentry can be integrated into the Next.js application to capture and aggregate JavaScript errors, API route failures, and server-side exceptions. Sentry provides detailed error reports with stack traces, breadcrumbs showing the sequence of events leading to the error, and user context including the browser, operating system, and device type. Database backups should be verified weekly by restoring the latest backup to a staging environment and confirming data integrity."),
  ];
}

function section12_troubleshooting() {
  return [
    h1("12. Troubleshooting Common Issues"),
    body("Production deployments inevitably encounter issues that require systematic diagnosis and resolution. This section documents the most common issues encountered during the deployment and operation of the Solar Ireland platform, along with their root causes and step-by-step resolution procedures. Each issue has been encountered during testing and the solutions have been verified to work reliably. When troubleshooting, always start by checking the browser console for client-side errors and the Vercel deployment logs for server-side errors, as these provide the most direct indication of the failure point."),

    tableTitle("Table 7: Common Issues and Solutions"),
    makeTable(
      ["Issue", "Root Cause", "Resolution"],
      [
        [
          "Hydration mismatch errors in browser console",
          "Client-side component rendering differs from server-side HTML",
          "Add ssr: false to the component's next.config.ts dynamic import, or ensure the component does not use browser-only APIs during render",
        ],
        [
          "CSP iframe blocked errors",
          "Content Security Policy frame-ancestors does not include the embedding domain",
          "Add the domain to the frame-ancestors directive in next.config.ts headers configuration",
        ],
        [
          "Supabase connection refused",
          "Invalid project URL, wrong region, or Supabase project paused due to inactivity",
          "Verify NEXT_PUBLIC_SUPABASE_URL, check Supabase dashboard for project status, ensure project is not paused",
        ],
        [
          "WhatsApp webhook not receiving messages",
          "Webhook URL unreachable, verify token mismatch, or Meta app suspended",
          "Test webhook URL with curl, verify WHATSAPP_VERIFY_TOKEN matches in Meta settings, check Meta app status",
        ],
        [
          "Transaction emails not sending",
          "Invalid Postmark token, unverified sender domain, or recipient email in suppression list",
          "Verify POSTMARK_SERVER_API_TOKEN in Vercel secrets, confirm sender domain verified in Postmark, check suppression list",
        ],
        [
          "Vercel build fails with TypeScript errors",
          "Strict type checking fails on loosely-typed components",
          "The project sets ignoreBuildErrors: true in next.config.ts; if errors persist, check for syntax errors in new code",
        ],
        [
          "Customer portal shows 404 for reference",
          "Customer record not found or reference number format invalid",
          "Verify customer exists in the customers table with the exact reference number (format: SI-YYYY-NNNN)",
        ],
        [
          "Admin dashboard returns empty data",
          "User profile does not have admin role assigned",
          "Run UPDATE profiles SET role = 'admin' WHERE email = 'admin@solarireland.ie' in Supabase SQL Editor",
        ],
        [
          "WhatsApp bot responds with generic fallback",
          "OPENAI_API_KEY not set or expired, no quick reply match found",
          "Set OPENAI_API_KEY in Supabase secrets, verify key has billing enabled, check quick_replies table has active records",
        ],
        [
          "SSL certificate not provisioning",
          "DNS records not propagated or incorrect CNAME configuration",
          "Verify DNS records with dig or nslookup, wait for full propagation (up to 48h), ensure CNAME points to cname.vercel-dns.com",
        ],
      ],
      [20, 30, 50],
    ),
    tableCaption("Table 7: Troubleshooting reference for common production issues."),
  ];
}


// ═══════════════════════════════════════════════════════════════
// ASSEMBLE DOCUMENT
// ═══════════════════════════════════════════════════════════════

async function main() {
  const coverConfig = {
    title: "Solar Ireland",
    subtitle: "Production Deployment Guide",
    englishLabel: "DEPLOYMENT GUIDE",
    metaLines: [
      "Version 1.0  |  April 2026  |  Confidential",
    ],
    footerLeft: "Solar Ireland",
    footerRight: "Confidential",
    palette: DS1,
  };

  // ── Section 1: Cover (no page number, no footer) ──
  const coverSection = {
    properties: {
      page: {
        size: pgSize,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
      },
    },
    children: buildCoverR1(coverConfig),
  };

  // ── Section 2: TOC (Roman numerals) ──
  const tocSection = {
    properties: {
      type: SectionType.NEXT_PAGE,
      page: {
        size: pgSize,
        margin: pgMargin,
        pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
      },
    },
    footers: { default: romanFooter() },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 360, line: 312 },
        children: [new TextRun({
          text: "Table of Contents",
          bold: true, size: 32, color: c(P.primary),
          font: { ascii: "Times New Roman" },
        })],
      }),
      new TableOfContents("Table of Contents", {
        hyperlink: true,
        headingStyleRange: "1-3",
      }),
      new Paragraph({ spacing: { before: 120 }, children: [new PageBreak()] }),
    ],
  };

  // ── Section 3: Body (Arabic page numbers starting from 1) ──
  const bodyChildren = [
    ...section1_execSummary(),
    ...section2_architecture(),
    ...section3_prerequisites(),
    ...section4_databaseSetup(),
    ...section5_edgeFunctions(),
    ...section6_vercelDeployment(),
    ...section7_envVariables(),
    ...section8_domainDns(),
    ...section9_whatsappConfig(),
    ...section10_postDeployChecklist(),
    ...section11_monitoring(),
    ...section12_troubleshooting(),
  ];

  const bodySection = {
    properties: {
      type: SectionType.NEXT_PAGE,
      page: {
        size: pgSize,
        margin: pgMargin,
        pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
      },
    },
    headers: { default: bodyHeader() },
    footers: { default: arabicFooter() },
    children: bodyChildren,
  };

  // ── Build document ──
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            size: 24,
            color: c(P.body),
          },
          paragraph: {
            spacing: { line: 312 },
          },
        },
        heading1: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            size: 32,
            bold: true,
            color: c(P.primary),
          },
          paragraph: { spacing: { before: 360, after: 160, line: 312 } },
        },
        heading2: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            size: 28,
            bold: true,
            color: c(P.primary),
          },
          paragraph: { spacing: { before: 240, after: 120, line: 312 } },
        },
        heading3: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            size: 24,
            bold: true,
            color: c(P.primary),
          },
          paragraph: { spacing: { before: 200, after: 100, line: 312 } },
        },
      },
    },
    sections: [coverSection, tocSection, bodySection],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = "/home/z/my-project/download/Solar_Ireland_Deployment_Guide.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Document generated: " + outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
