const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  SectionType, TableOfContents, TableLayoutType,
} = require("docx");

// ============================================================================
// PALETTE & CONSTANTS
// ============================================================================
const PAL = {
  bg: "162235", titleColor: "FFFFFF", subtitleColor: "B0B8C0",
  metaColor: "90989F", footerColor: "687078", accent: "37DCF2",
  table: { headerBg: "1B6B7A", headerText: "FFFFFF", accentLine: "1B6B7A", innerLine: "C8DDE2", surface: "EDF3F5" },
};
const COLORS = { primary: "162235", body: "000000", secondary: "5A6080", accent: "1B6B7A" };
const c = (hex) => hex.replace("#", "");
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
const FONT_BODY = "Times New Roman";
const FONT_HEADING = "Times New Roman";
const LINE = 312;

// ============================================================================
// COVER RECIPE R2 — Double-Rule Frame with DM-1 palette
// ============================================================================
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 12;
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
  const breakAfter = new Set([" ", "-", "_", "/", "(", ")"]);
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

function buildCoverR2(config) {
  const P = config.palette;
  const padL = 1400, padR = 1400;
  const { titlePt, titleLines } = calcTitleLayout(config.title, 11906 - padL - padR, 40, 24);
  const titleSize = titlePt * 2;
  const thickBorder = { style: BorderStyle.SINGLE, size: 18, color: P.accent, space: 20 };
  const children = [];

  // 1. Top rule
  children.push(new Paragraph({
    indent: { left: padL - 400, right: padR - 400 }, spacing: { before: 1200, after: 200 },
    border: { top: thickBorder }, children: [],
  }));

  // 2. Whitespace
  children.push(new Paragraph({ spacing: { before: 1800 } }));

  // 3. English label
  if (config.englishLabel) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 500 },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "),
        size: 18, color: P.accent, font: { ascii: FONT_HEADING }, characterSpacing: 40 })],
    }));
  }

  // 4. Main title (centered, dynamic)
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: i < titleLines.length - 1 ? 80 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true,
        color: P.titleColor, font: { ascii: FONT_HEADING } })],
    }));
  }

  // 5. Subtitle
  if (config.subtitle) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 400 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor,
        font: { ascii: FONT_HEADING } })],
    }));
  }

  // 6. Whitespace
  children.push(new Paragraph({ spacing: { before: 1200 } }));

  // 7. Meta lines
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100, line: Math.ceil(18 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: line, size: 36, color: P.metaColor,
        font: { ascii: FONT_HEADING } })],
    }));
  }

  // 8. Whitespace
  children.push(new Paragraph({ spacing: { before: 2000 } }));

  // 9. Footer + bottom rule
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    indent: { left: padL - 400, right: padR - 400 }, spacing: { before: 200 },
    border: { bottom: thickBorder },
    children: [new TextRun({ text: config.footerRight || "", size: 18, color: P.footerColor, font: { ascii: FONT_HEADING } })],
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders,
        children,
      })],
    })],
  })];
}

// ============================================================================
// HELPER BUILDERS
// ============================================================================
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200, line: LINE },
    children: [new TextRun({ text, bold: true, size: 32, color: c(COLORS.primary), font: { ascii: FONT_HEADING } })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160, line: LINE },
    children: [new TextRun({ text, bold: true, size: 28, color: c(COLORS.primary), font: { ascii: FONT_HEADING } })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: LINE },
    children: [new TextRun({ text, bold: true, size: 24, color: c(COLORS.primary), font: { ascii: FONT_HEADING } })],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { after: 120, line: LINE },
    children: [new TextRun({ text, size: 24, color: c(COLORS.body), font: { ascii: FONT_BODY } })],
  });
}

function bodyNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120, line: LINE },
    children: [new TextRun({ text, size: 24, color: c(COLORS.body), font: { ascii: FONT_BODY } })],
  });
}

function headerCell(text, widthPct) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: c(PAL.table.headerBg) },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: c(PAL.table.accentLine) },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: c(PAL.table.accentLine) },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20, color: c(PAL.table.headerText), font: { ascii: FONT_BODY } })],
    })],
  });
}

function dataCell(text, widthPct, isAlt = false) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: isAlt ? { type: ShadingType.CLEAR, fill: c(PAL.table.surface) } : undefined,
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: c(PAL.table.innerLine) },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    margins: { top: 40, bottom: 40, left: 120, right: 120 },
    children: [new Paragraph({
      spacing: { line: 260 },
      children: [new TextRun({ text, size: 19, color: c(COLORS.body), font: { ascii: FONT_BODY } })],
    })],
  });
}

function makeTable(headers, rows, widths) {
  const totalW = widths.reduce((a, b) => a + b, 0);
  const pcts = widths.map(w => Math.round((w / totalW) * 10000) / 100);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        tableHeader: true, cantSplit: true,
        children: headers.map((h, i) => headerCell(h, pcts[i])),
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          cantSplit: true,
          children: row.map((cell, ci) => dataCell(cell, pcts[ci], ri % 2 === 0)),
        })
      ),
    ],
  });
}

function tableTitle(text) {
  return new Paragraph({
    keepNext: true, spacing: { before: 300, after: 120, line: LINE },
    children: [new TextRun({ text, bold: true, size: 21, color: c(COLORS.secondary), font: { ascii: FONT_BODY } })],
  });
}

// ============================================================================
// FOOTER HELPERS
// ============================================================================
function romanFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(COLORS.secondary), font: { ascii: FONT_BODY } })],
    })],
  });
}

function arabicFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(COLORS.secondary), font: { ascii: FONT_BODY } })],
    })],
  });
}

// ============================================================================
// COVER CONFIG
// ============================================================================
const coverConfig = {
  title: "Solar Ireland",
  subtitle: "System Architecture Document",
  englishLabel: "TECHNICAL REFERENCE",
  metaLines: ["Version 1.0  |  April 2026  |  Technical Reference"],
  footerRight: "Confidential",
  palette: PAL,
};

// ============================================================================
// BODY CONTENT
// ============================================================================
function buildContent() {
  const sections = [];

  // ========================================================================
  // 1. EXECUTIVE SUMMARY
  // ========================================================================
  sections.push(heading1("1. Executive Summary"));
  sections.push(body("Solar Ireland is a full-stack web platform designed for a residential solar panel installation company that serves customers across all thirty-two counties of Ireland. The system has been architected to address every stage of the customer journey, from initial marketing engagement through lead capture, survey booking, installation tracking, and post-installation support. At its core, the platform combines a high-performance Next.js 16 frontend with a Supabase backend that provides PostgreSQL storage, row-level security, serverless edge functions, and managed authentication, all deployed on the Vercel edge network for global low-latency delivery."));
  sections.push(body("The application comprises five primary interfaces. The public-facing marketing website presents service information, county-specific landing pages, an AI-powered electricity bill analyser, and a comprehensive blog with structured content management. A customer portal allows homeowners to track their solar installation progress through an eleven-step timeline using a unique reference code, accessing documents and real-time project updates. An administrative dashboard provides the operations team with a seven-tab single-page application covering lead management, WhatsApp conversations, survey bookings, Google Business Profile reviews, automation rules, and social media scheduling."));
  sections.push(body("Beyond the core website, the system integrates a WhatsApp AI chatbot powered by large language model processing to qualify leads conversationally and automatically book surveys when a prospect meets qualification criteria. Transactional email delivery is handled through Postmark, while Google Business Profile reviews are synchronised daily through a dedicated edge function. An automation engine built on a when-trigger-do-action pattern processes rules on a five-minute cron cycle, handling tasks such as review request follow-ups, survey reminders, and blog promotion. The database layer contains thirty-seven tables organised across eleven domains, protected by comprehensive row-level security policies that enforce strict access boundaries between public visitors, authenticated customers, and administrative staff."));
  sections.push(body("This architecture document describes the complete system design, including the three-tier client-server-data model, the full database schema with all tables and security policies, the edge function ecosystem, the WhatsApp bot qualification flow, the customer portal and admin dashboard interfaces, and the security, performance, and scalability considerations that inform ongoing development decisions."));

  // ========================================================================
  // 2. SYSTEM OVERVIEW
  // ========================================================================
  sections.push(heading1("2. System Overview"));
  sections.push(body("The Solar Ireland platform follows a classical three-tier architecture that cleanly separates presentation, business logic, and data persistence. The client tier consists of a Next.js 16 application built on React 19 with Tailwind CSS 4, rendering both server-side and client-side components for optimal performance and interactivity. The server tier operates on the Vercel edge network, combining Next.js API routes for synchronous request handling with Supabase edge functions for asynchronous serverless operations that require direct database access with elevated privileges. The data tier relies on Supabase PostgreSQL, a managed database that also provides built-in authentication, file storage through seven configurable buckets, and real-time subscription capabilities."));

  sections.push(heading2("2.1 Architecture Diagram"));
  sections.push(body("At the highest level, the frontend application communicates with four backend subsystems. The Supabase PostgreSQL database holds thirty-seven tables and serves as the single source of truth for all application state. Supabase edge functions, twenty-six in total, handle serverless operations ranging from form submissions to WhatsApp message processing and automation task execution. Supabase Auth manages user identity through email-password credentials, magic links, and OAuth providers, issuing JSON Web Tokens that row-level security policies use to enforce access control at the database level. Supabase Storage provides seven buckets for images, documents, and file uploads, each configured with its own access policy. External integrations connect the platform to the WhatsApp Business API through Meta, the Postmark transactional email service, and the Google Business Profile API for review synchronisation and post publishing."));

  sections.push(heading2("2.2 Technology Stack"));
  sections.push(tableTitle("Table 1: Technology Stack Overview"));
  sections.push(makeTable(
    ["Layer", "Technology", "Version", "Purpose"],
    [
      ["Framework", "Next.js", "16.1", "React framework with App Router, SSR, Edge Runtime"],
      ["UI Library", "React", "19.0", "Component rendering with server/client components"],
      ["Styling", "Tailwind CSS", "4.x", "Utility-first CSS with dark theme support"],
      ["Component Library", "shadcn/ui", "46 components", "Accessible UI primitives built on Radix UI"],
      ["Animations", "Framer Motion", "via lib/motion.tsx", "Scroll-triggered animations and transitions"],
      ["Charts", "Recharts", "3.8", "Bar, Line, Pie charts for admin dashboard"],
      ["Icons", "Lucide React", "0.525", "Consistent icon set across all pages"],
      ["Database", "Supabase PostgreSQL", "Managed", "37 tables, RLS, triggers, functions"],
      ["Authentication", "Supabase Auth", "Built-in", "Email, magic links, OAuth, JWT"],
      ["Storage", "Supabase Storage", "7 buckets", "Images, documents, uploads"],
      ["Edge Functions", "Supabase Deno", "26 functions", "Serverless API logic"],
      ["Email", "Postmark", "API", "Transactional email with 16 templates"],
      ["Messaging", "WhatsApp Business API", "Meta Cloud API", "AI-powered lead qualification bot"],
      ["Deployment", "Vercel", "Edge Network", "Global CDN, edge rendering, serverless"],
      ["Language", "TypeScript", "5.x", "Full type safety across frontend and backend"],
    ],
    [20, 22, 14, 44],
  ));

  sections.push(body("The frontend is a single Next.js 16 application deployed to Vercel, leveraging the App Router for file-based routing and the React Server Components model for optimal rendering performance. Each page directory contains a server component page.tsx for metadata and initial data loading, a client component for interactive behaviour, a layout.tsx for shared chrome, and a loading.tsx for skeleton loading states. This convention ensures consistent code organisation across the sixteen distinct routes in the application."));

  sections.push(body("External services connect through environment variables managed in the Vercel dashboard. The WhatsApp Business API requires a phone number identifier, access token, and webhook verification token from Meta. Postmark integration uses a server token and sender domain. The Google Business Profile integration requires an OAuth access token with business manage scope. Critically, sensitive credentials such as the Supabase service role key, Postmark server token, and OpenAI API key are never exposed to the client bundle; they are used exclusively within edge functions and server-side API routes."));

  // ========================================================================
  // 3. FRONTEND ARCHITECTURE
  // ========================================================================
  sections.push(heading1("3. Frontend Architecture"));

  sections.push(heading2("3.1 Next.js 16 App Router"));
  sections.push(body("The application uses the Next.js 16 App Router exclusively, with file-based routing that maps directory structure to URL paths. Every route follows a consistent four-file pattern: a server component page.tsx that exports metadata and fetches data, a client component that handles interactivity, a layout.tsx that wraps the page with shared navigation and footer elements, and a loading.tsx that displays a skeleton spinner during navigation. The root layout.tsx configures comprehensive structured data through six JSON-LD schemas covering the organisation, local business, web page, service, how-to guide, and financial product, providing rich search engine optimisation for every page on the site."));

  sections.push(body("Server components handle all static rendering and data fetching, streaming server-side rendered HTML to the browser for immediate display. Client components, marked with the use client directive, handle interactive features such as form state, tab switching, accordion expansion, and scroll-based animations. The boundary between server and client is deliberate: the marketing homepage renders eleven content sections as server components, while the bill analyser, booking form, and admin dashboard operate entirely as client-side applications. This split minimises the JavaScript bundle sent to initial page loads while preserving full interactivity where required."));

  sections.push(heading2("3.2 Component Architecture"));
  sections.push(body("The component library is organised into two directories. The src/components/ui directory contains forty-six shadcn/ui components that serve as accessible, composable primitives built on Radix UI, including buttons, dialogs, tabs, accordions, carousels, tables, tooltips, and form controls. The src/components/solar directory contains twenty domain-specific components such as Navbar, Footer, Hero, WhySolar, FAQ, InstallationMap, BillAnalyser, QuickSavingsCalculator, WhatsAppChat, CookieConsent, ExitIntent, ScrollProgress, and PageLoader. Animation behaviour is centralised in a custom lib/motion.tsx wrapper that re-exports Framer Motion components with project-specific defaults, allowing all solar components to use a consistent animation API without direct Framer Motion imports scattered throughout the codebase."));

  sections.push(heading2("3.3 Pages and Routes"));
  sections.push(tableTitle("Table 2: Application Routes and Descriptions"));
  sections.push(makeTable(
    ["Route", "Page", "Type", "Description"],
    [
      ["/", "Homepage", "Marketing", "11-section landing page with hero, services, FAQ, testimonials, savings calculator"],
      ["/services", "Services", "Marketing", "3 primary services + 5 additional services with 3 pricing tiers"],
      ["/about", "About", "Marketing", "Company story, 4 team members, mission statement"],
      ["/blog", "Blog Index", "CMS", "Article listing with category filters and newsletter signup"],
      ["/blog/[slug]", "Blog Post", "CMS", "Individual article with structured content sections"],
      ["/contact", "Contact", "Lead Capture", "Contact form with county dropdown and message field"],
      ["/book-survey", "Book Survey", "Lead Capture", "4-step multi-page form: details, property, interests, scheduling"],
      ["/solar-calculator", "Solar Calculator", "Tool", "AI-powered bill analyser with manual and upload modes"],
      ["/counties", "Counties", "SEO", "32 county cards with province grouping and cost data"],
      ["/financing", "Financing", "Marketing", "3 financing options: Green Loan, Upfront, Mortgage Top-Up"],
      ["/portal", "Portal Landing", "Customer", "Reference code entry page for customer access"],
      ["/portal/[reference]", "Portal Dashboard", "Customer", "11-step timeline, documents, and notifications"],
      ["/admin", "Admin Dashboard", "Admin", "7-tab SPA: Overview, Leads, WhatsApp, Surveys, Reviews, Automation, Social"],
      ["/privacy", "Privacy Policy", "Legal", "GDPR compliance page"],
      ["/terms", "Terms of Service", "Legal", "Terms and conditions"],
      ["/cookies", "Cookie Policy", "Legal", "Cookie consent explanation"],
    ],
    [16, 18, 13, 53],
  ));

  sections.push(heading2("3.4 Styling and Design System"));
  sections.push(body("The visual design is built on Tailwind CSS 4 with a dark-first theme centred on a background colour of #0a0a0a. Key visual patterns include glass-card effects achieved through semi-transparent backgrounds with backdrop blur, gradient text using amber-to-transparent linear gradients for emphasis, and subtle border styling with low-opacity white borders to create depth without visual noise. The colour palette is anchored by amber (#FACC15) for primary calls-to-action and green (#22C55E) for success states, while the WhatsApp chat widget uses its brand green for instant recognition. Typography relies on the Geist font family for both sans and mono variants, loaded through the Next.js font optimisation system with display swap behaviour. All interactive elements feature smooth transitions with the Tailwind transition utilities, and scroll-triggered animations through the SectionReveal component ensure content appears progressively as users scroll down the page."));

  sections.push(heading2("3.5 State Management and API Routes"));
  sections.push(body("State management within the application relies entirely on React built-in hooks, specifically useState for local component state and useMemo for derived computations. No global state management library is used because the application does not require cross-component state sharing beyond what prop drilling and URL parameters provide. Each page manages its own state independently, with the admin dashboard being the most complex example, maintaining active tab state, mock data state, and sidebar visibility state within a single component tree."));
  sections.push(body("Four server-side API routes handle data processing that cannot occur on the client. The /api/contact route receives contact form submissions and is designed to insert records into the contact_submissions table. The /api/analyse-bill route performs financial calculations for the solar calculator, accepting electricity usage parameters and returning system recommendations with savings projections. The /api/chat route handles the website chat widget conversations. The /api/admin-dashboard route aggregates data from multiple database tables to populate the admin overview, leads, surveys, reviews, and automation tabs with real-time metrics and statistics."));

  sections.push(heading2("3.6 Performance Optimisations"));
  sections.push(body("Performance is addressed through several complementary strategies. Dynamic imports with ssr:false ensure that heavy components such as the bill analyser and carousel are loaded only when the user interacts with the relevant page section, reducing the initial JavaScript payload. Next.js Suspense boundaries wrap these dynamic imports with skeleton loading placeholders, providing immediate visual feedback while code loads in the background. The Next.js Image component optimises all photographic assets through automatic format conversion to WebP, responsive sizing based on viewport width, and lazy loading for below-the-fold images. The build system uses Sharp for image optimisation during the build step, producing multiple resolution variants from each source image."));

  // ========================================================================
  // 4. DATABASE ARCHITECTURE
  // ========================================================================
  sections.push(heading1("4. Database Architecture"));

  sections.push(heading2("4.1 Overview"));
  sections.push(body("The database layer is built on Supabase PostgreSQL and comprises thirty-seven tables, fourteen custom enum types, ten triggers, and four stored functions. Tables are organised into eleven logical domains that reflect the functional boundaries of the application: authentication and user profiles, lead capture, content management, site configuration, services and pricing, customer portal operations, email delivery, analytics and GDPR compliance, WhatsApp bot state, Google Business Profile integration, social media management, and automation rules. The schema is defined in a single SQL file that can be applied to a fresh Supabase project through the SQL Editor or via the Supabase CLI."));
  sections.push(body("Row-level security is enabled on every table, creating a strict access control matrix. Anonymous visitors can read published CMS content and insert lead capture records. Authenticated customers can access their own portal data, documents, and installation steps. Administrative users, identified by a role column on the profiles table, have full create, read, update, and delete access to all tables. This security model ensures that data isolation is enforced at the database level rather than relying solely on application logic, providing protection even if the API layer is bypassed."));

  sections.push(heading2("4.2 Table Groups"));
  sections.push(body("The Auth and Profiles domain contains a single table, profiles, which extends the Supabase auth.users table with an email address, full name, role enum (admin or customer), phone number, and avatar URL. A trigger function named handle_new_user automatically creates a profile record whenever a new user registers, extracting the full name from user metadata and defaulting the role to customer unless explicitly overridden."));

  sections.push(body("The Lead Capture domain consists of four tables. The contact_submissions table stores form submissions from the contact page, recording the visitor name, email, phone, county, message text, source page, UTM parameters as JSONB, IP address for GDPR compliance, and a lead status enum. The survey_bookings table captures the four-step booking form output, including a unique reference number in the SI-YYYY-NNNN format generated by a PostgreSQL sequence, the full property and roof type details, preferred survey date and time, and a booking status. The bill_analyses table stores AI-powered electricity bill analysis results, including the energy provider, monthly bill amount, annual usage estimate, and a comprehensive JSONB analysis_result containing system recommendations, savings projections, payback calculations, and carbon offset figures. The lead_sources table provides unified marketing attribution across all entry points, recording UTM parameters and conversion flags for every form submission, WhatsApp click, and exit intent interaction."));

  sections.push(body("The CMS domain contains six tables that replace hardcoded data currently stored in TypeScript files. The blog_categories table defines article categories with names, slugs, and sort order. The blog_posts table stores article metadata including slug, title, excerpt, featured flag, read time, publishing status, and soft-delete support through a deleted_at timestamp. The blog_content_sections table provides structured content blocks for each article, supporting eight content types including paragraph, heading, callout, bullet list, numbered list, table, divider, and call-to-action. The counties table holds all thirty-two Irish county entries with province, cost ranges, generation estimates, and taglines. The county_faqs table stores frequently asked questions per county. The site_settings table is a key-value store containing twenty configuration entries covering grant amounts, savings figures, export rates, provider contact details, social media links, and statistical counters."));

  sections.push(body("The Services domain contains six tables. The service_details table holds eight service definitions (three primary: Solar PV, Battery Storage, EV Charger; and five additional: SEAI Grant Application, BER Assessment, Free Home Survey, System Monitoring, Maintenance and Cleaning), each with features stored as a JSONB string array and highlights as a JSONB object array. The service_packages table defines three pricing tiers (Essential at four thousand five hundred euros, Popular at six thousand five hundred euros, Premium at nine thousand five hundred euros) with panel counts, inverter specifications, and feature lists. The financing_options, testimonials, and team_members tables store flexible content for their respective pages. The installation_step_templates table defines the master eleven-step installation timeline that seeds customer-specific progress records."));

  sections.push(body("The Customer Portal domain contains five tables. The customers table stores customer records with a unique reference number, personal details, system specifications, project manager assignment, and a portal status enum with eleven stages from enquiry to generating savings. The customer_installation_steps table creates per-customer progress records seeded from the master template, tracking each step's completion status, start and end timestamps, and project manager notes. The documents table holds uploaded files with document type enums, availability status, and storage bucket references. The notifications table delivers project updates to customers with type classification and read status tracking."));

  sections.push(body("The Email domain contains two tables. The email_templates table seeds sixteen transactional email event types covering the full customer lifecycle, from contact received through survey booked, quote accepted, grant approved, installation complete, portal welcome, and WhatsApp lead qualified. The email_log table provides a delivery audit trail recording every email sent through Postmark, tracking status progression from queued through sent, delivered, and bounced, with timestamps for opens and clicks."));

  sections.push(body("The Analytics domain contains five tables supporting GDPR compliance and marketing intelligence. The cookie_consent_records table logs consent interactions with detailed consent state stored as JSONB. The newsletter_subscriptions table manages blog newsletter subscriptions with bounce tracking. The exit_intent_conversions table records exit popup triggers and user responses. The whatsapp_lead_sources table tracks WhatsApp link clicks with full UTM attribution. The chat_conversations table stores website chat widget conversation history."));

  sections.push(body("The WhatsApp Bot domain contains three tables. The whatsapp_conversations table maintains full conversation state including phone number, display name, collected lead data as JSONB, the current qualification stage, a numeric qualification score, message count, and conversation status. The whatsapp_quick_replies table stores eight pre-configured canned responses covering pricing, grants, battery, electric vehicle, availability, process, warranty, and savings topics. The whatsapp_bot_config table stores greeting templates, session time limits, and qualification thresholds."));

  sections.push(body("The remaining domains include Reputation (gbp_reviews, gbp_posts, review_requests, gbp_insights), Social (social_accounts, social_posts), and Automation (automation_rules, automation_tasks). Each domain serves a specific integration need, with the automation engine processing six seeded rules on a five-minute cron cycle to handle tasks such as review request follow-ups, blog promotion, survey reminders, and WhatsApp lead notifications."));

  sections.push(heading2("4.3 Row-Level Security Policy Matrix"));
  sections.push(body("Every table in the database has row-level security enabled with policies that enforce the principle of least privilege. The policy matrix defines three access tiers. The anonymous tier applies to unauthenticated visitors, granting INSERT-only access to lead capture tables and SELECT access to published CMS content. The customer tier applies to authenticated users with the customer role, granting SELECT and UPDATE access to their own portal records, installation steps, documents, and notifications. The admin tier applies to authenticated users with the admin role, granting full CRUD operations on all tables. Policies use subqueries against the profiles table to verify the current user's role, and join through foreign key relationships for tables like customer_installation_steps and documents that are scoped to a parent customer record. The bill_analyses table uses session ID matching through request headers for anonymous access, while the customers table provides a separate anon-accessible SELECT policy for portal reference lookups."));

  sections.push(heading2("4.4 Complete Table Reference"));
  sections.push(tableTitle("Table 3: Complete Database Schema (37 Tables)"));
  sections.push(makeTable(
    ["Table", "Domain", "Purpose", "Key Columns"],
    [
      ["profiles", "Auth", "User roles and identity", "id, email, role, full_name"],
      ["contact_submissions", "Lead Capture", "Contact form submissions", "name, email, county, status, utm_params"],
      ["survey_bookings", "Lead Capture", "Survey booking records", "reference, email, county, preferred_date"],
      ["bill_analyses", "Lead Capture", "AI bill analysis results", "session_id, analysis_result (JSONB)"],
      ["lead_sources", "Lead Capture", "Marketing attribution", "utm_source, utm_campaign, converted"],
      ["blog_categories", "CMS", "Blog category taxonomy", "name, slug, sort_order"],
      ["blog_posts", "CMS", "Blog article metadata", "slug, status, published_at, deleted_at"],
      ["blog_content_sections", "CMS", "Structured article content", "post_id, type, text, items (JSONB)"],
      ["counties", "CMS", "32 county directory entries", "name, province, status, cost_min, cost_max"],
      ["county_faqs", "CMS", "Per-county FAQ entries", "county_id, question, answer"],
      ["site_settings", "Site Config", "20 key-value config pairs", "key, value (JSONB), category"],
      ["service_details", "Services", "8 service definitions", "slug, title, features (JSONB), is_primary"],
      ["service_packages", "Services", "3 pricing tiers", "tier, price, panel_count, inverter"],
      ["financing_options", "Services", "Financing option descriptions", "title, items (JSONB)"],
      ["testimonials", "Services", "Customer reviews", "name, rating, text, is_active"],
      ["team_members", "Services", "Team member profiles", "name, role, bio, initials"],
      ["installation_step_templates", "Portal", "11-step master timeline", "step_number, title, description"],
      ["customers", "Portal", "Customer records", "reference, email, status, project_manager"],
      ["customer_installation_steps", "Portal", "Per-customer progress", "customer_id, step_number, status"],
      ["documents", "Portal", "Customer documents", "customer_id, doc_type, status"],
      ["notifications", "Portal", "Project updates", "customer_id, type, is_read"],
      ["email_templates", "Email", "16 event email templates", "event, subject, body_html"],
      ["email_log", "Email", "Delivery audit trail", "template_id, status, opened_at"],
      ["cookie_consent_records", "Analytics", "GDPR consent records", "consent_state (JSONB), ip_address"],
      ["newsletter_subscriptions", "Analytics", "Newsletter subscriptions", "email, status"],
      ["exit_intent_conversions", "Analytics", "Exit popup tracking", "action, source_page"],
      ["whatsapp_lead_sources", "Analytics", "WhatsApp click attribution", "utm_params, source_page"],
      ["chat_conversations", "Analytics", "Website chat history", "session_id, messages (JSONB)"],
      ["whatsapp_conversations", "WhatsApp", "Bot conversation state", "phone, lead_stage, qualification_score"],
      ["whatsapp_quick_replies", "WhatsApp", "8 canned responses", "category, trigger_keywords"],
      ["whatsapp_bot_config", "WhatsApp", "Bot configuration", "greeting, session_timeout"],
      ["gbp_reviews", "Reputation", "Google Business reviews", "rating, text, source"],
      ["gbp_posts", "Reputation", "Scheduled GBP posts", "content, status, scheduled_at"],
      ["review_requests", "Reputation", "Review request tracking", "customer_id, status"],
      ["gbp_insights", "Reputation", "Weekly GBP metrics", "calls, clicks, directions"],
      ["social_accounts", "Social", "Connected platforms", "platform, access_token"],
      ["social_posts", "Social", "Cross-platform posts", "content, platforms (JSONB), status"],
      ["automation_rules", "Automation", "6 trigger-action rules", "trigger_type, action_type, is_enabled"],
      ["automation_tasks", "Automation", "Task execution queue", "rule_id, status, error_message"],
    ],
    [22, 14, 32, 32],
  ));

  // ========================================================================
  // 5. EDGE FUNCTIONS & SERVERLESS
  // ========================================================================
  sections.push(heading1("5. Edge Functions and Serverless Architecture"));

  sections.push(heading2("5.1 Overview"));
  sections.push(body("The serverless layer consists of twenty-six Supabase edge functions written in TypeScript and running on the Deno runtime within Supabase's infrastructure. These functions handle all server-side logic that requires direct database access with elevated privileges, typically using the service role key for administrative operations or the anon key with row-level security enforcing user-scoped access. Edge functions are invoked through HTTP requests from the Next.js frontend, cron triggers on scheduled intervals, or webhook callbacks from external services such as Meta, Postmark, and Google. Each function follows a standard pattern of request validation, authentication check, database operation, and structured JSON response."));
  sections.push(body("The functions are grouped by responsibility. Lead capture functions handle form submissions for contact, survey booking, and bill analysis. Portal functions manage reference validation, data retrieval, and notification updates. Content management functions support blog CRUD operations. Email functions send transactional messages through Postmark and receive delivery webhook events. WhatsApp functions power the AI chatbot through a three-function pipeline. Automation and scheduling functions process the rule engine and sync external data. The admin dashboard function provides a single aggregated data endpoint for the seven-tab dashboard interface."));

  sections.push(heading2("5.2 Key Edge Functions"));
  sections.push(tableTitle("Table 4: Edge Function Reference"));
  sections.push(makeTable(
    ["Function", "Trigger", "Purpose", "Key Operations"],
    [
      ["whatsapp-webhook", "GET/POST from Meta", "Receive and route WhatsApp messages", "Verify webhook token, parse incoming message, dispatch to send-message handler"],
      ["whatsapp-send-message", "POST internal", "AI brain for lead qualification", "Load conversation context, call LLM, extract lead data, advance stage, send reply"],
      ["whatsapp-qualify-lead", "GET/PATCH/POST admin", "Lead qualification management", "List conversations, update status, manually create bookings from collected data"],
      ["sync-gbp-reviews", "POST cron (daily)", "Sync Google Business reviews", "Pull reviews from GBP API, upsert gbp_reviews, update reviewer profiles"],
      ["admin-dashboard-api", "GET admin", "Aggregate dashboard data", "Query leads, surveys, reviews, tasks, and insights from multiple tables"],
      ["run-automation", "POST cron (5 min)", "Execute automation rules", "Evaluate enabled rules, create and process tasks, log results and errors"],
      ["send-postmark-email", "POST service", "Send transactional email", "Load template from DB, merge variables, call Postmark API, log to email_log"],
      ["postmark-webhook", "POST from Postmark", "Receive delivery events", "Update email_log status, record opened_at and clicked_at timestamps"],
      ["submit-contact", "POST public", "Insert contact submission", "Validate form data, insert record, trigger contact_received email"],
      ["book-survey", "POST public", "Create survey booking", "Validate 4-step form, generate reference number, insert, send confirmation emails"],
      ["analyse-bill", "POST public", "Run bill analysis", "Parse energy parameters, calculate savings, insert result, return financial projection"],
      ["validate-portal-reference", "POST public", "Validate portal access", "Look up reference code, create/auth user account, send portal welcome email"],
      ["get-portal-data", "GET authenticated", "Return customer portal data", "Query customer, steps, documents, notifications via RLS-scoped queries"],
    ],
    [22, 18, 28, 32],
  ));

  sections.push(heading2("5.3 WhatsApp Function Pipeline"));
  sections.push(body("The WhatsApp AI system operates through a three-function pipeline that processes every incoming message. When a user sends a message through the WhatsApp Business API, Meta delivers a webhook POST request to the whatsapp-webhook edge function. This function verifies the webhook token for GET requests during initial setup, then parses incoming messages to extract the sender phone number, message text, and conversation context. It then invokes the whatsapp-send-message function, which serves as the AI brain of the system."));
  sections.push(body("The whatsapp-send-message function loads the full conversation history from the database, retrieves the eight pre-configured quick replies for common questions, and loads the bot configuration including greeting templates and session timeouts. It then constructs a detailed prompt containing the conversation context, collected lead data, current qualification stage, and available quick reply responses, and submits this to a large language model. The LLM response is parsed to extract both the reply message and any lead data fields that were identified in the user's input. The function advances the conversation stage, updates the qualification score, sends the reply through the WhatsApp API, and persists all changes to the database. If the OpenAI API key is not configured, the function falls back to keyword matching against the quick reply templates, providing basic question answering without lead qualification capability."));

  // ========================================================================
  // 6. WHATSAPP AI BOT SYSTEM
  // ========================================================================
  sections.push(heading1("6. WhatsApp AI Bot System"));

  sections.push(heading2("6.1 Conversation Flow"));
  sections.push(body("The WhatsApp AI bot guides prospects through an eight-stage qualification flow designed to collect sufficient information for a survey booking while maintaining a natural conversational tone. The flow begins with the greeting stage, where the bot sends a personalised welcome message based on the configured greeting template. During the interest check stage, the bot determines which services the prospect is interested in, recording their preferences in the lead data JSONB field. The property type and roof type stages collect structural information about the prospect's home, which directly affects system sizing and pricing. The county stage identifies the prospect's location across Ireland's thirty-two counties. The contact details stage requests the prospect's email address and physical address, which are required for survey scheduling. The survey booking stage proposes available dates and times. When all required fields have been collected, the conversation advances to the qualified stage, where the system automatically creates a survey booking record with a unique reference number and triggers confirmation emails to both the prospect and the sales team."));
  sections.push(body("Each stage transition is managed by the AI model, which analyses the prospect's natural language responses to extract structured data fields. The qualification score is a numeric value from zero to one hundred that reflects the prospect's engagement level, property suitability, and geographic coverage. Scores above seventy trigger automatic survey booking creation, while scores between forty and seventy continue the qualification process with additional questions. Scores below forty indicate low intent, and the bot may suggest alternative resources or politely conclude the conversation. The bot also recognises two special terminal states: not_interested, where the prospect explicitly declines further communication, and callback_requested, where the prospect asks for a phone call from the sales team instead of continuing the automated flow."));

  sections.push(heading2("6.2 Quick Reply System"));
  sections.push(body("The bot maintains eight pre-configured quick reply templates stored in the whatsapp_quick_replies table, covering the most common questions that prospects ask during initial conversations. These include pricing inquiries about solar panel costs and package details, grant information about the SEAI eighteen hundred euro grant eligibility and application process, battery storage questions about capacity, compatibility, and return on investment, electric vehicle charging questions about charger types and solar integration, availability queries about installation scheduling and coverage areas, process explanations about the survey-to-installation timeline, warranty details about panel and workmanship guarantees, and savings projections about expected annual savings and payback periods. Each quick reply contains trigger keywords, a response template, and categorisation metadata that the AI model uses to select appropriate responses without requiring a full language model call for common questions."));

  sections.push(heading2("6.3 Fallback and Robustness"));
  sections.push(body("The bot implements a two-tier response strategy to maintain reliability across varying conditions. In the primary mode, an OpenAI API key is configured and the bot uses a large language model to process each message with full conversation context, enabling nuanced, context-aware responses that adapt to each prospect's specific situation and questions. In the fallback mode, triggered when no AI key is available or when the AI service is unavailable, the bot switches to keyword matching against the quick reply templates. This fallback can handle common informational queries about pricing, grants, and the installation process, but it cannot perform the progressive data extraction and stage advancement that the AI mode provides. The whatsapp_bot_config table stores configuration values including the greeting message template, session timeout duration, maximum message count before session expiry, and the minimum qualification score required for automatic booking, allowing the bot's behaviour to be tuned without code changes."));

  // ========================================================================
  // 7. CUSTOMER PORTAL SYSTEM
  // ========================================================================
  sections.push(heading1("7. Customer Portal System"));

  sections.push(heading2("7.1 Reference-Based Access"));
  sections.push(body("The customer portal uses a reference-based authentication model rather than traditional username and password login. When a customer's survey is booked, the system generates a unique reference number in the format SI-YYYY-NNNN (for example, SI-2026-0042) through an atomic PostgreSQL sequence function. This reference number serves as the customer's access key to the portal. The portal landing page at /portal presents a clean interface where the customer enters their reference code. The system validates the reference against the customers table through the validate-portal-reference edge function, which either creates a new Supabase authentication account or authenticates an existing one, then sends a magic link email to the customer's registered address. Clicking the magic link grants the customer a JSON Web Token that provides access to their portal dashboard through row-level security policies."));
  sections.push(body("This design decision prioritises simplicity for homeowners who may not be technically inclined. Rather than requiring them to create and remember credentials, the reference code is communicated during the booking confirmation process and can be easily retrieved from the confirmation email. The magic link provides a second factor of authentication, ensuring that even if a reference code is discovered by an unauthorised party, they cannot access the portal without access to the customer's email inbox."));

  sections.push(heading2("7.2 Installation Timeline"));
  sections.push(body("The portal dashboard presents an eleven-step installation timeline that tracks the customer's journey from initial enquiry through to generating savings. The steps are: Enquiry Received, Survey Booked, Survey Completed, Quote Prepared, Quote Accepted, SEAI Grant Applied, Grant Offer Received, Installation Scheduled, Installation Complete, Commissioning and Testing, and Generating Savings. Each step displays a title, subtitle, detailed description, date, and expandable content that includes installation specifics such as system size, inverter model, arrival times, and scaffolding details."));
  sections.push(body("The timeline uses a visual design with three status states. Completed steps display a green checkmark with a solid background. The current step, indicated by an in-progress status, shows a pulsing amber indicator with a glowing connector line that visually connects it to the next step. Future steps display a muted appearance with low-opacity borders. The progress is summarised in a circular progress indicator at the top of the dashboard that shows the number of completed steps, the total steps, and a percentage completion value. The demo data presents the customer John Murphy with reference SI-2026-0042 at step seven of eleven (Installation Scheduled), with a project manager named Sarah Kelly, illustrating a mid-project state."));

  sections.push(heading2("7.3 Portal Tabs and Features"));
  sections.push(body("The dashboard provides three navigation tabs. The Timeline tab displays the eleven-step installation progress with expandable details for each step. The Documents tab lists all project paperwork including the survey report, itemised quote, SEAI grant application, grant offer letter, and completion certificate, with availability status and download actions. The Updates tab presents a chronological feed of project notifications from the project manager, classified by type as informational, success, or action-required. Each tab is fully client-side rendered with Framer Motion animations for staggered entry effects. The portal also integrates a WhatsApp quick-action button that opens a pre-filled message to the project manager, allowing customers to ask questions about their installation directly from the dashboard."));

  // ========================================================================
  // 8. ADMIN DASHBOARD
  // ========================================================================
  sections.push(heading1("8. Admin Dashboard"));

  sections.push(heading2("8.1 Interface Overview"));
  sections.push(body("The admin dashboard is a seven-tab single-page application accessible at the /admin route. It presents a sidebar navigation with collapsible state, a top header bar showing the current date and a live status indicator, and a main content area that renders the selected tab's interface. The seven tabs are: Overview, which provides a high-level summary of all key metrics; Leads, which manages contact form submissions and survey bookings; WhatsApp, which displays active bot conversations and qualification scores; Surveys, which lists upcoming and completed survey appointments; Reviews, which shows Google Business Profile reviews and rating distribution; Automation, which monitors rule execution and task queues; and Social, which manages scheduled social media posts across platforms."));
  sections.push(body("Each tab displays a notification badge on the sidebar showing the count of actionable items: new leads today, active WhatsApp conversations, pending surveys, and pending automation tasks. The sidebar can be collapsed to show only icons, providing more screen real estate for data tables on smaller monitors. The dashboard uses mock data as its default data source, allowing the interface to be demonstrated and developed independently of the Supabase backend. When the backend is connected, the /api/admin-dashboard endpoint provides a single aggregated data response that populates all seven tabs simultaneously."));

  sections.push(heading2("8.2 Data Visualisations"));
  sections.push(body("The dashboard incorporates four Recharts visualisations. The lead funnel BarChart on the Overview tab displays four stages of the conversion pipeline: Contact Forms, Survey Booked, Qualified, and Converted, with each bar coloured distinctly in blue, indigo, emerald, and amber. The weekly trend LineChart shows dual lines tracking leads and surveys booked over seven days, with CartesianGrid lines and a legend for clarity. The rating distribution PieChart on the Reviews tab renders as a donut chart showing five-star, four-star, and three-star review proportions, with percentage labels rendered inside each segment for immediate readability. The qualification scores BarChart on the WhatsApp tab displays horizontal bars for each active conversation, colour-coded green for scores above seventy, amber for scores above forty, and gray for lower scores, sorted in descending order by qualification value."));

  sections.push(heading2("8.3 Data Tables and Interactions"));
  sections.push(body("Each tab presents data in structured tables with sortable headers and status badges. The Leads tab uses a sub-tab interface to switch between contact form submissions and survey booking records, with status badges colour-coded by lead stage. The WhatsApp tab shows conversation records with phone numbers, display names, lead stage, qualification score with a visual progress bar, message exchange count, and last activity timestamp. The Surveys tab consolidates upcoming and recent bookings with reference numbers, customer names, counties, preferred dates, and booking status. The Reviews tab lists review cards with star ratings, reviewer names, review text, and timestamps. The Automation tab presents task records with action type, execution status, scheduled time, and customer identification, alongside a rule list showing trigger types, run counts, and last execution timestamps."));

  // ========================================================================
  // 9. SECURITY ARCHITECTURE
  // ========================================================================
  sections.push(heading1("9. Security Architecture"));

  sections.push(heading2("9.1 Authentication and Authorisation"));
  sections.push(body("Authentication is managed through Supabase Auth, which provides email and password authentication, magic link passwordless login, and OAuth integration with third-party providers. When a user registers or is created through the portal reference flow, the handle_new_user trigger automatically creates a corresponding profile record with the appropriate role. Row-level security policies on every table use the auth.uid() function to determine the current user's identity and the profiles table to verify their role. This ensures that access control is enforced at the database level, providing a defence-in-depth approach where even if the application layer is compromised, the database itself prevents unauthorised data access."));
  sections.push(body("The security model implements three principal tiers. Anonymous visitors can read published content and submit lead capture forms, but cannot access any customer or administrative data. Authenticated customers can read and update their own portal records, installation steps, documents, and notifications, but cannot access other customers' data or any administrative tables. Administrative users with the admin role have full CRUD access to all thirty-seven tables, enabling complete backend management through the dashboard. The customer portal's reference-based access adds an additional layer: even after magic link authentication, the row-level security policies ensure that a customer can only query their own records by matching the profile_id foreign key to their authenticated user ID."));

  sections.push(heading2("9.2 Application-Level Security"));
  sections.push(body("Beyond database-level security, the application implements several application-layer protections. Content Security Policy headers are configured through Next.js to restrict resource loading, with a specific frame-ancestors directive to allow iframe embedding for preview purposes while preventing clickjacking attacks. Cross-site request forgery protection is provided through Next.js's built-in CSRF token mechanism, which is automatically included in all form submissions. All form inputs are sanitised on both client and server before processing, preventing injection attacks. Environment variables containing sensitive credentials are managed through the Vercel dashboard and are never included in client-side bundles, as evidenced by the NEXT_PUBLIC_ prefix convention that explicitly designates which variables are safe for browser exposure."));
  sections.push(body("The WhatsApp webhook endpoint implements Meta's verification protocol, requiring a matching verify token for initial subscription setup and HMAC signature validation for all incoming webhook payloads. This prevents unauthorised parties from injecting messages into the bot's conversation flow. The Postmark webhook similarly validates incoming delivery events against a configured secret. IP addresses collected through contact forms are annotated for anonymisation after thirty days, in compliance with GDPR data minimisation requirements. Bill upload files in the portal-documents bucket are configured for automatic deletion after processing, ensuring that customer energy bills are not retained beyond their functional purpose."));

  // ========================================================================
  // 10. PERFORMANCE & SCALABILITY
  // ========================================================================
  sections.push(heading1("10. Performance and Scalability"));

  sections.push(heading2("10.1 Content Delivery"));
  sections.push(body("The application is deployed on the Vercel edge network, which serves content from over three hundred points of presence globally. Static assets including images, fonts, and compiled JavaScript are distributed through Vercel's CDN with aggressive cache headers, ensuring that repeat visitors experience near-instant page loads. Next.js Image optimisation generates multiple resolution variants for each source image during the build process, and the runtime automatically serves the appropriate size based on the client's viewport width and device pixel ratio. All photographic assets are stored in WebP format with JPEG fallbacks, achieving typical file size reductions of thirty to fifty percent compared to uncompressed originals."));

  sections.push(heading2("10.2 Code Splitting and Lazy Loading"));
  sections.push(body("The frontend implements strategic code splitting through dynamic imports with the ssr:false option for components that are not required for initial page render. The bill analyser, carousel, and certain heavy UI components are loaded on demand when the user interacts with their respective sections. Each lazy-loaded component is wrapped in a React Suspense boundary that displays a skeleton loading placeholder during the download period, providing immediate visual feedback and preventing layout shifts. The Next.js bundler automatically splits the application code into optimally sized chunks based on route boundaries and dynamic import points, ensuring that each page loads only the JavaScript required for its initial render."));

  sections.push(heading2("10.3 Database Performance"));
  sections.push(body("Database performance is addressed through explicit indexing on frequently queried columns. The schema defines indexes on status fields, creation timestamps, email addresses, foreign keys, and JSONB-extracted fields where applicable. The survey_bookings table has four indexes covering reference, status, email, and creation date, supporting the admin dashboard's filtering and sorting operations. The lead_sources table has five indexes on source type, UTM parameters, related entity, and creation date, enabling efficient funnel analytics queries. Supabase provides connection pooling through PgBouncer, which manages database connections efficiently across the potentially high concurrency of edge function invocations. Edge functions themselves execute with low cold-start latency on the Deno runtime, providing sub-hundred-millisecond response times for simple database operations."));

  // ========================================================================
  // 11. FUTURE ROADMAP
  // ========================================================================
  sections.push(heading1("11. Future Roadmap"));

  sections.push(body("The development roadmap for the Solar Ireland platform extends across several strategic workstreams. The most impactful near-term addition is the integration of Supabase Realtime for live notification delivery to the customer portal, replacing the current polling-based approach. Realtime subscriptions would enable customers to see installation step completions, document uploads, and project manager messages instantaneously as they occur, dramatically improving the transparency and perceived responsiveness of the installation process. This feature requires minimal frontend changes since the portal already displays notifications; the primary work involves establishing WebSocket subscriptions and updating the notification display logic to handle incoming events."));

  sections.push(body("Payment integration through Stripe represents the second major roadmap item. Currently, deposit collection and final payment processing are handled entirely outside the digital platform. Integrating Stripe would enable customers to pay deposits and final balances directly through the portal, with automatic status updates to the booking and installation records. This integration would also support automated invoice generation, payment receipt delivery through Postmark, and reconciliation between payment records and customer accounts. The Stripe Payment Intents API is the recommended approach, providing a secure payment flow that supports card payments, bank transfers, and buy-now-pay-later options suitable for the Irish market."));

  sections.push(body("Additional planned features include an advanced analytics dashboard that extends beyond the current admin overview to provide cohort analysis, conversion funnel deep-dives, geographic heat maps of lead distribution, and revenue forecasting. A mobile application built with React Native would provide field installation teams with on-site access to customer records, installation specifications, and progress update capabilities. Multi-language support for Irish and other European languages would expand the addressable market beyond English-speaking customers. API rate limiting through Vercel middleware would protect against abuse of public endpoints. Finally, a comprehensive CI/CD pipeline would automate testing, database migrations, and deployment through GitHub Actions, ensuring that code changes are validated and deployed reliably with zero-downtime releases."));

  return sections;
}

// ============================================================================
// DOCUMENT ASSEMBLY
// ============================================================================
async function main() {
  const content = buildContent();

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: { ascii: FONT_BODY }, size: 24, color: c(COLORS.body) },
          paragraph: { spacing: { line: LINE } },
        },
        heading1: {
          run: { font: { ascii: FONT_HEADING }, size: 32, bold: true, color: c(COLORS.primary) },
          paragraph: { spacing: { before: 480, after: 200, line: LINE } },
        },
        heading2: {
          run: { font: { ascii: FONT_HEADING }, size: 28, bold: true, color: c(COLORS.primary) },
          paragraph: { spacing: { before: 360, after: 160, line: LINE } },
        },
        heading3: {
          run: { font: { ascii: FONT_HEADING }, size: 24, bold: true, color: c(COLORS.primary) },
          paragraph: { spacing: { before: 240, after: 120, line: LINE } },
        },
      },
    },
    sections: [
      // SECTION 1: Cover — no page number, no footer
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
          },
        },
        children: buildCoverR2(coverConfig),
      },
      // SECTION 2: TOC — Roman numerals
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        footers: { default: romanFooter() },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 360 },
            children: [new TextRun({
              text: "Table of Contents", bold: true, size: 32,
              color: c(COLORS.primary), font: { ascii: FONT_HEADING },
            })],
          }),
          new TableOfContents("Table of Contents", {
            hyperlink: true,
            headingStyleRange: "1-3",
          }),
          new Paragraph({ children: [new PageBreak()] }),
        ],
      },
      // SECTION 3: Body — Arabic numerals starting at 1
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: "Solar Ireland \u2014 System Architecture Document",
                size: 16, color: c(COLORS.secondary), font: { ascii: FONT_BODY }, italics: true,
              })],
            })],
          }),
        },
        footers: { default: arabicFooter() },
        children: content,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/download/Solar_Ireland_Architecture_Document.docx", buffer);
  console.log("Document generated successfully: Solar_Ireland_Architecture_Document.docx");
}

main().catch(err => { console.error("Generation failed:", err); process.exit(1); });
