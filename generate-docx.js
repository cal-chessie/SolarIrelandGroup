const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableLayoutType, TableOfContents, SectionType, LevelFormat,
} = require("docx");

// ─── Graphite Orange Palette (GO-1) ───
const palette = {
  bg: "1A2330",
  primary: "FFFFFF",
  accent: "D4875A",
  table: { headerBg: "D4875A", headerText: "FFFFFF", accentLine: "D4875A", innerLine: "DDD0C8", surface: "F8F0EB" },
  cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
};
const c = (hex) => hex.replace("#", "");
const bodyColor = "2C3E50";
const bodySecondary = "5D6D7E";

// ─── Border constants ───
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ─── Page layout ───
const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

// ─── calcTitleLayout ───
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
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
  const breakAfter = new Set([" ", "-", "_", "/", "\u2014", "\u2013"]);
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

// ─── calcCoverSpacing ───
function calcCoverSpacing(params) {
  const {
    titleLineCount = 1, titlePt = 36, hasSubtitle = false,
    hasEnglishLabel = false, metaLineCount = 0,
    fixedHeight = 800, pageHeight = 16838, marginTop = 0, marginBottom = 0,
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
  const midSpacing = Math.max(safeRemaining - topSpacing - bottomSpacing, 0);
  return { topSpacing, midSpacing, bottomSpacing };
}

// ─── Build Cover (R1 - Pure Paragraph Left) ───
function buildCoverR1(config) {
  const P = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length, fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "),
        size: 18, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 40 })],
    }));
  }
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true,
        color: P.titleColor, font: { ascii: "Arial" } })],
    }));
  }
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor,
        font: { ascii: "Arial" } })],
    }));
  }
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: P.metaColor, font: { ascii: "Arial" } })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
    ],
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

// ─── Helper: Body paragraph ───
function bodyPara(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 160, line: 312 },
    indent: { firstLine: 480 },
    ...opts,
    children: [new TextRun({ text, size: 24, color: bodyColor, font: { ascii: "Times New Roman" } })],
  });
}

function bodyParaRuns(runs, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 160, line: 312 },
    indent: { firstLine: 480 },
    ...opts,
    children: runs,
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, color: "1A2330", font: { ascii: "Times New Roman" } })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 28, color: "2C3E50", font: { ascii: "Times New Roman" } })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, size: 24, color: "34495E", font: { ascii: "Times New Roman" } })],
  });
}

// ─── Helper: Code block ───
function codeBlock(text) {
  const lines = text.split("\n");
  const paras = [];
  for (const line of lines) {
    paras.push(new Paragraph({
      spacing: { after: 0, line: 276 },
      indent: { left: 400 },
      children: [new TextRun({ text: line || " ", size: 20, color: "2C3E50", font: { ascii: "Courier New" } })],
    }));
  }
  // Wrap in a table with shaded background
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: palette.table.innerLine },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: palette.table.innerLine },
      left: { style: BorderStyle.SINGLE, size: 1, color: palette.table.innerLine },
      right: { style: BorderStyle.SINGLE, size: 1, color: palette.table.innerLine },
      insideHorizontal: NB, insideVertical: NB,
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: "F5F0EB" },
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        children: paras,
      })],
    })],
  });
}

// ─── Helper: Bullet point ───
function bulletItem(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 80, line: 312 },
    indent: { left: 720 + level * 360 },
    children: [new TextRun({ text, size: 24, color: bodyColor, font: { ascii: "Times New Roman" } })],
  });
}

// ─── Helper: Table builder ───
function buildTable(headers, rows) {
  const colCount = headers.length;
  const colWidth = Math.floor(100 / colCount);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: palette.table.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: palette.table.accentLine },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: palette.table.innerLine },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map(h => new TableCell({
          width: { size: colWidth, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: palette.table.headerBg },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ spacing: { after: 0 }, children: [
            new TextRun({ text: h, bold: true, size: 21, color: palette.table.headerText, font: { ascii: "Times New Roman" } })
          ] })],
        })),
      }),
      ...rows.map((row, idx) => new TableRow({
        cantSplit: true,
        children: row.map(cell => new TableCell({
          width: { size: colWidth, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? "FFFFFF" : palette.table.surface },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ spacing: { after: 0 }, children: [
            new TextRun({ text: cell, size: 21, color: bodyColor, font: { ascii: "Times New Roman" } })
          ] })],
        })),
      })),
    ],
  });
}

// ─── Numbering configs ───
const numberingConfig = {
  config: [
    {
      reference: "bullet-main",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
  ],
};

// ═══════════════════════════════════════════════
// DOCUMENT CONTENT
// ═══════════════════════════════════════════════

// ─── Section 1: Prerequisites ───
const sec1 = [
  heading1("1. Prerequisites"),
  bodyPara("Before beginning the deployment of Solar Ireland, ensure that all members of the development and operations team have the following tools, accounts, and resources in place. This section outlines every prerequisite required to build, test, and deploy the application to a production environment. Missing any single item will block subsequent setup steps."),
  heading2("1.1 Runtime and Build Tools"),
  bodyPara("The Solar Ireland project is built on the Next.js 16 framework and requires a modern JavaScript runtime to function correctly. Node.js version 20 or later is the minimum supported runtime, as the application leverages ES module features and native fetch APIs that were stabilised in this release line. Bun version 1.3 or later serves as both the package manager and the preferred development server, offering significantly faster install times and hot module replacement compared to Node.js alone. Team members should verify their installations by running node -v and bun -v in a terminal and comparing the output against the minimum version requirements documented here."),
  bodyPara("Additionally, Git must be installed for version control operations. The project relies on conventional commit patterns and includes lint-staged and husky hooks that require Git 2.30 or later. Developers on Windows should ensure that line endings are configured to LF rather than CRLF to avoid cross-platform inconsistencies."),
  heading2("1.2 Third-Party Accounts"),
  bodyPara("Solar Ireland integrates with two external SaaS platforms: Supabase for database, authentication, and object storage; and Postmark for transactional email delivery. A Supabase account (free tier is sufficient for development) must be created at supabase.com. From the Supabase dashboard, the deployer will need to note the project URL and both the anon and service_role API keys. A Postmark account is required for all email functionality including contact form notifications, newsletter confirmations, and quote delivery emails. The Postmark server API token and a verified sender domain are mandatory before any email templates can be activated."),
  bodyPara("A registered domain name with access to DNS configuration is required for production deployment. The Caddy web server used in the reference deployment handles TLS certificate provisioning automatically via the ACME protocol (Let Encrypt), but the domain must already resolve to the production server IP address. An SSL certificate is not required to be manually obtained, as Caddy manages this entirely."),
  heading2("1.3 Summary Table"),
  buildTable(
    ["Requirement", "Minimum Version", "Purpose"],
    [
      ["Node.js", "20.x LTS", "JavaScript runtime for Next.js"],
      ["Bun", "1.3+", "Package manager and dev server"],
      ["Git", "2.30+", "Version control and hooks"],
      ["Supabase Account", "Free tier", "Database, auth, and storage"],
      ["Postmark Account", "Starter plan", "Transactional email delivery"],
      ["Domain + DNS Access", "Any registrar", "Production URL and TLS"],
    ]
  ),
];

// ─── Section 2: Environment Setup ───
const sec2 = [
  heading1("2. Environment Setup"),
  bodyPara("This section walks through the initial local environment configuration required to develop and run the Solar Ireland application. The process covers cloning the repository, installing dependencies, and configuring environment variables that connect the application to Supabase and Postmark."),
  heading2("2.1 Clone and Install"),
  bodyPara("Begin by cloning the project repository from the designated remote origin using SSH or HTTPS authentication. Once cloned, navigate into the project root directory and execute bun install to resolve and download all production and development dependencies defined in package.json. This command reads the lockfile for deterministic builds, ensuring that every team member installs identical package versions. The installation process typically completes within 30 to 60 seconds depending on network speed."),
  codeBlock("git clone git@github.com:solar-ireland/solar-ireland.git\ncd solar-ireland\nbun install"),
  heading2("2.2 Environment Variables"),
  bodyPara("The application relies on environment variables for all sensitive and environment-specific configuration. A template file named .env.example is provided in the project root. Copy this file to .env.local and fill in each placeholder with the actual values obtained from your Supabase and Postmark dashboards. The .env.local file is listed in .gitignore and will never be committed to version control. Below is the complete list of variables with placeholder values and descriptions of their purpose."),
  codeBlock("NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here\nSUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here\nPOSTMARK_API_KEY=your-postmark-server-token\nPOSTMARK_FROM_EMAIL=noreply@solarireland.ie\nNEXT_PUBLIC_SITE_URL=https://solarireland.ie"),
  heading2("2.3 Variable Reference"),
  buildTable(
    ["Variable Name", "Source", "Description"],
    [
      ["NEXT_PUBLIC_SUPABASE_URL", "Supabase Dashboard", "Project URL for client-side Supabase client"],
      ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase Dashboard", "Public anon key for RLS-governed access"],
      ["SUPABASE_SERVICE_ROLE_KEY", "Supabase Dashboard", "Admin key, server-side only, bypasses RLS"],
      ["POSTMARK_API_KEY", "Postmark Dashboard", "Server API token for email delivery"],
      ["POSTMARK_FROM_EMAIL", "DNS Config", "Verified sender email address"],
      ["NEXT_PUBLIC_SITE_URL", "Deployment", "Canonical production URL of the site"],
    ]
  ),
  bodyPara("Variables prefixed with NEXT_PUBLIC_ are intentionally exposed to the browser bundle and should never contain secrets. The SUPABASE_SERVICE_ROLE_KEY must never be prefixed this way, as it grants full database access and must remain restricted to API routes and server-side code only."),
];

// ─── Section 3: Supabase Setup ───
const sec3 = [
  heading1("3. Supabase Setup"),
  bodyPara("Supabase serves as the backend platform for Solar Ireland, providing a PostgreSQL database, Row Level Security (RLS) policies, built-in authentication, and object storage buckets. This section covers the initial Supabase project creation, schema deployment, storage bucket configuration, and the creation of the first administrative user."),
  heading2("3.1 Create Project"),
  bodyPara("Navigate to the Supabase dashboard and create a new project. Select a region geographically close to the target user base, which for Solar Ireland means the EU West (Ireland) region. Choose a meaningful project name and a strong database password. Once the project is provisioned (typically within two minutes), note the project URL, which follows the format https://xxxxx.supabase.co, and navigate to the API Settings page to obtain both the anon key and the service role key. Store these values in your .env.local file as described in Section 2."),
  heading2("3.2 Apply Database Schema"),
  bodyPara("Open the Supabase SQL Editor from the project dashboard. Copy the entire contents of the file supabase/schema.sql from the project repository and paste it into the SQL Editor. Execute the script. This operation creates all 25 tables, enforces RLS policies on every table, sets up triggers for automatic timestamp management, and seeds initial reference data. The schema covers six functional domains: Lead Capture (4 tables), CMS (6 tables), Service and Pricing (4 tables), Customer Portal (4 tables), Analytics and GDPR (5 tables), and Auth (1 table with associated triggers). The SQL script is idempotent, meaning it can be safely re-run if necessary without duplicating existing objects."),
  heading2("3.3 Storage Buckets"),
  bodyPara("Solar Ireland uses Supabase Storage for all file uploads. Navigate to the Storage section of the Supabase dashboard and create the following seven buckets. Each bucket should be configured as a public bucket unless otherwise noted, and appropriate file size limits should be set according to the expected use case. The blog-images and county-images buckets serve CMS media, installation-photos and team-photos support company branding, portal-documents and bill-uploads are tied to the customer portal, and admin-assets holds internal resources."),
  buildTable(
    ["Bucket Name", "Public", "Purpose", "Size Limit"],
    [
      ["blog-images", "Yes", "CMS blog post header and body images", "5 MB"],
      ["installation-photos", "Yes", "Completed solar installation gallery photos", "10 MB"],
      ["county-images", "Yes", "County-specific landing page hero images", "5 MB"],
      ["team-photos", "Yes", "Team member profile photographs", "2 MB"],
      ["portal-documents", "No", "Customer portal uploaded documents", "10 MB"],
      ["bill-uploads", "No", "Utility bill uploads for analysis", "5 MB"],
      ["admin-assets", "No", "Internal admin panel resources", "10 MB"],
    ]
  ),
  heading2("3.4 First Admin User"),
  bodyPara("The first administrative user must be created manually through the Supabase Authentication dashboard. Navigate to the Authentication tab, select Users, and click Add User. Choose the Create New User option and enter the admin email address and a temporary password. After creation, update the user record in the app_admins table (created by the schema script) to associate the Supabase auth user ID with an admin role. This user will have full access to the CMS, customer portal management, analytics dashboard, and all administrative features of the application."),
];

// ─── Section 4: Database Schema ───
const sec4 = [
  heading1("4. Database Schema"),
  bodyPara("The canonical database schema for Solar Ireland is defined exclusively in the file supabase/schema.sql. This file contains the complete and authoritative data model comprising 25 tables organised into six functional domains. All tables enforce Row Level Security (RLS) to ensure that client-side queries can only access data that the authenticated user is authorised to see. It is critical that deployers use this file as the single source of truth for the database structure."),
  heading2("4.1 Important: Schema Hierarchy"),
  bodyPara("The project root also contains a file named generate-schema.js, which represents an older and alternative database design. This file must NOT be used under any circumstances. It was created during an earlier prototyping phase and does not align with the current application architecture, RLS policy structure, or API contract. Any reference to generate-schema.js in documentation or scripts should be considered deprecated. Only supabase/schema.sql should be used for database provisioning, migrations, and schema reference."),
  heading2("4.2 Schema Overview by Domain"),
  buildTable(
    ["Domain", "Tables", "Description"],
    [
      ["Lead Capture", "4 tables", "Contact form submissions, newsletter sign-ups, survey bookings, and lead scoring"],
      ["CMS", "6 tables", "Blog posts, pages, media assets, SEO metadata, and content versioning"],
      ["Service & Pricing", "4 tables", "Service catalogue, pricing tiers, county coverage, and package configurations"],
      ["Customer Portal", "4 tables", "User accounts, installation records, document uploads, and billing history"],
      ["Analytics & GDPR", "5 tables", "Page views, conversion tracking, cookie consent, A/B testing, and audit logs"],
      ["Auth", "1 table + triggers", "Admin profiles, role assignments, and automatic user provisioning triggers"],
    ]
  ),
  bodyPara("Each table includes created_at and updated_at timestamp columns managed by database triggers, ensuring consistent auditing across the entire data model. Foreign key constraints enforce referential integrity, and cascading deletes are configured where appropriate to prevent orphaned records. The RLS policies follow a least-privilege model: anonymous users can only read public CMS content, authenticated portal users can access their own data, and admin users can manage all records."),
  heading2("4.3 Migration Strategy"),
  bodyPara("For future schema changes, Supabase provides a built-in migration tool accessible from the project dashboard. Developers should create migration files in the supabase/migrations directory and apply them through the Supabase CLI or dashboard. Direct modifications to the production database through the SQL Editor should be avoided in favour of tracked migration files, which provide a versioned history of all schema changes and can be applied deterministically across development, staging, and production environments."),
];

// ─── Section 5: Postmark Email Setup ───
const sec5 = [
  heading1("5. Postmark Email Setup"),
  bodyPara("Postmark is the transactional email service used by Solar Ireland for all outbound email communications. Unlike marketing email platforms, Postmark is purpose-built for delivering time-sensitive transactional messages such as form submission notifications, booking confirmations, and quote deliveries. This section describes how to configure Postmark and create the required email templates."),
  heading2("5.1 Account Configuration"),
  bodyPara("Create a Postmark account at postmarkapp.com. Once logged in, create a new server and note the Server API Token displayed on the server overview page. This token is the value that should be assigned to the POSTMARK_API_KEY environment variable. Next, configure a sender domain or sender signature. For production deployments, verifying a custom domain (e.g., solarireland.ie) is strongly recommended over using a shared Postmark address, as custom domains improve deliverability and allow the emails to appear as sent from your own brand. Postmark provides DNS records (SPF, DKIM, and DMARC) that must be added to the domain DNS configuration. The verification process typically completes within a few hours after the DNS records propagate."),
  heading2("5.2 Transactional Email Templates"),
  bodyPara("Solar Ireland requires five transactional email templates to be configured in the Postmark dashboard. Each template uses a consistent HTML layout that matches the Solar Ireland brand identity, including the company logo, accent colour, and footer with unsubscribe options where applicable. The templates are identified by an alias in the Postmark API and should be created with the following specifications:"),
  buildTable(
    ["Template Name", "Alias", "Trigger", "Key Content"],
    [
      ["Contact Form Notification", "contact-notification", "POST /api/contact", "Lead details (name, email, phone, message, service interest)"],
      ["Survey Booking Confirmation", "survey-booking", "Booking form submission", "Date, time, location, preparation instructions"],
      ["Quote Delivery", "quote-delivery", "Admin sends quote", "System size, price, savings estimate, PDF attachment"],
      ["Grant Update", "grant-update", "SEAI grant status change", "Current status, next steps, required documentation"],
      ["Newsletter Welcome", "newsletter-welcome", "POST /api/newsletter", "Confirmation of subscription, frequency expectations"],
    ]
  ),
  bodyPara("Each template should include handlebars-style placeholders (e.g., {{name}}, {{date}}, {{quote_total}}) that the API route populates when triggering the email. The Postmark API supports both HTML and plain-text versions of each template, and both should be provided for maximum email client compatibility. Template previews should be tested through the Postmark dashboard before going live."),
];

// ─── Section 6: Production Deployment ───
const sec6 = [
  heading1("6. Production Deployment"),
  bodyPara("This section covers the complete production deployment workflow for Solar Ireland, including the build process, server startup, reverse proxy configuration, process management, and TLS termination. The reference deployment targets a Linux server running Ubuntu 22.04 LTS or later, though the instructions apply to any modern Linux distribution."),
  heading2("6.1 Build and Start"),
  bodyPara("Before deploying to production, run the build command to compile the Next.js application into an optimised production bundle. This command performs Ahead-of-Time (AOT) compilation of all pages and API routes, tree-shakes unused code, and generates static assets. The output is written to the .next directory. After a successful build, start the production server using the start command, which binds to port 3000 by default. For production environments that require binding to all network interfaces, use the -H 0.0.0.0 flag as shown below."),
  codeBlock("bun run build\nbun run start -H 0.0.0.0 -p 3000"),
  bodyPara("The build process should be monitored for any warnings or errors. Common issues at this stage include missing environment variables (which cause build-time failures for public variables) and large bundle sizes that may indicate unintended imports. The production server should not be started directly from a terminal session; instead, use PM2 for process management as described in Section 6.3."),
  heading2("6.2 Caddy Reverse Proxy"),
  bodyPara("Caddy is the recommended reverse proxy for Solar Ireland because it provides automatic TLS certificate provisioning and renewal through the ACME protocol. The project includes a reference Caddyfile in the project root. The Caddyfile configures HTTP-to-HTTPS redirection, reverse proxies requests to the Next.js application running on port 3000, and handles WebSocket upgrade requests required for real-time features. Below is the reference configuration."),
  codeBlock("solarireland.ie {\n    reverse_proxy localhost:3000\n    encode gzip\n    header / Cache-Control \"public, max-age=31536000, immutable\"\n    header /api* Cache-Control \"no-store\"\n}"),
  bodyPara("The Caddyfile shown above is a simplified reference. The actual production Caddyfile in the project root includes additional directives for security headers, rate limiting, and logging. To deploy, copy the Caddyfile to /etc/caddy/Caddyfile on the server and reload the Caddy service with sudo systemctl reload caddy. Caddy will automatically obtain and renew TLS certificates from Let Encrypt."),
  heading2("6.3 PM2 Process Management"),
  bodyPara("The project includes an ecosystem.config.js file for PM2, which is the recommended process manager for Node.js applications in production. PM2 provides automatic restarts on crashes, log management, cluster mode for multi-core utilisation, and startup script generation. The ecosystem configuration file specifies the application entry point, environment variables, instance count, and log file paths."),
  codeBlock("module.exports = {\n  apps: [{\n    name: 'solar-ireland',\n    script: 'node_modules/.bin/next',\n    args: 'start -H 0.0.0.0',\n    cwd: '/opt/solar-ireland',\n    instances: 1,\n    exec_mode: 'fork',\n    env: { NODE_ENV: 'production', PORT: 3000 },\n  }],\n};"),
  bodyPara("Start the application with pm2 start ecosystem.config.js. To ensure the application survives server reboots, generate and install the PM2 startup script by running pm2 startup and following the displayed instructions. Monitor application health with pm2 monit and view logs with pm2 logs solar-ireland."),
  heading2("6.4 SSL/TLS"),
  bodyPara("As noted in Section 6.2, Caddy handles TLS certificate provisioning automatically. No manual certificate management is required. Caddy obtains certificates from Let Encrypt, stores them locally, and handles renewal before expiration. The certificates are stored in /var/lib/caddy/.acme-certs/ by default. To verify that TLS is functioning correctly, run curl -vI https://solarireland.ie and confirm that the server returns a 200 status with a valid certificate chain. If custom TLS certificates are required (for example, when using an internal certificate authority), Caddy supports custom certificate paths through its global options."),
];

// ─── Section 7: API Routes Reference ───
const sec7 = [
  heading1("7. API Routes Reference"),
  bodyPara("Solar Ireland exposes eight API routes that handle form submissions, email interactions, AI-powered chat, bill analysis, and A/B testing functionality. All routes are defined under the src/app/api/ directory and follow Next.js App Router conventions. Each route returns JSON responses and implements appropriate error handling with HTTP status codes."),
  heading2("7.1 Route Summary"),
  buildTable(
    ["Method", "Route", "Purpose", "Auth Required"],
    [
      ["POST", "/api/contact", "Contact form submissions", "No"],
      ["POST", "/api/newsletter", "Newsletter subscriptions", "No"],
      ["POST", "/api/chat", "AI chatbot endpoint", "No"],
      ["POST", "/api/analyse-bill", "Utility bill analysis", "No"],
      ["GET", "/api/ab/stats", "A/B testing statistics", "No"],
      ["PATCH", "/api/ab/stats", "Reset A/B statistics", "Admin"],
      ["POST", "/api/ab/assign", "Assign A/B test variant", "No"],
      ["POST", "/api/ab/convert", "Track A/B conversion event", "No"],
      ["GET", "/api/ab/experiments", "List A/B experiments", "No"],
    ]
  ),
  heading2("7.2 Contact Form (POST /api/contact)"),
  bodyPara("This endpoint receives contact form submissions including the lead name, email address, phone number, selected service of interest, and an optional message. The route validates all required fields, persists the submission to the database, and triggers a Postmark email notification to the sales team using the contact-notification template. Successful submissions return a 200 status with a confirmation message; invalid input returns a 400 status with field-level error details. Rate limiting is applied to prevent abuse."),
  heading2("7.3 Newsletter (POST /api/newsletter)"),
  bodyPara("The newsletter endpoint accepts an email address and optional first name. It validates the email format, checks for duplicate subscriptions, persists the new subscriber to the database, and sends a welcome confirmation email via the newsletter-welcome template. Duplicate email addresses receive a 409 Conflict response indicating that the address is already subscribed."),
  heading2("7.4 AI Chat (POST /api/chat)"),
  bodyPara("The chat endpoint provides an AI-powered conversational assistant for website visitors. It accepts a message string and an optional conversation history array. The route forwards the request to the configured LLM provider (via the z-ai-web-dev-sdk on the server side) and returns the generated response. This route does not persist conversation history to the database by default; all context is maintained client-side."),
  heading2("7.5 Bill Analysis (POST /api/analyse-bill)"),
  bodyPara("The bill analysis endpoint accepts uploaded utility bill data (either as a file upload or structured JSON) and returns an analysis including current usage patterns, estimated solar generation potential, projected savings, and recommended system size. The analysis is performed server-side using the z-ai-web-dev-sdk for AI inference and the results are returned as a structured JSON response. No data is persisted unless the user explicitly saves the analysis to their portal."),
  heading2("7.6 A/B Testing Endpoints"),
  bodyPara("The four A/B testing routes support experiment assignment, conversion tracking, statistics retrieval, and experiment listing. The assign endpoint receives an experiment key and returns the assigned variant for the current user (using a cookie or session identifier). The convert endpoint records a conversion event for a specific experiment and variant. The stats endpoint returns aggregate statistics for all active experiments including variant distribution, conversion counts, and conversion rates. The experiments endpoint returns the full list of configured experiments with their variants, weights, and current status."),
];

// ─── Section 8: Frontend Integration Points ───
const sec8 = [
  heading1("8. Frontend Integration Points"),
  bodyPara("This section identifies every file in the Solar Ireland codebase that currently uses hardcoded data, SQLite persistence, or demo content, and which needs to be migrated to use Supabase as the primary data source. Each entry below describes the current state of the file, the required migration scope, and the target Supabase integration pattern. This table serves as the definitive migration checklist for the development team."),
  heading2("8.1 Migration Matrix"),
  buildTable(
    ["File Path", "Current State", "Migration Required"],
    [
      ["src/app/api/contact/route.ts", "Persists to SQLite", "Migrate INSERT to Supabase leads table"],
      ["src/app/api/newsletter/route.ts", "Persists to SQLite", "Migrate INSERT to Supabase newsletter_subscribers table"],
      ["src/lib/db.ts", "Exports null placeholder", "Replace with Supabase client (createClient)"],
      ["src/lib/blog-data.ts", "Hardcoded blog posts array", "Replace with Supabase fetch from blog_posts table"],
      ["src/lib/solar-data.ts", "Hardcoded service data", "Replace with Supabase fetch from services and pricing tables"],
      ["src/app/portal/", "Demo/static data", "Replace with authenticated Supabase queries"],
    ]
  ),
  heading2("8.2 Migration Details"),
  bodyPara("The migration from SQLite and hardcoded data to Supabase is the single most significant change required for production readiness. Currently, the contact and newsletter API routes write to a local SQLite database through the Prisma ORM client exported from src/lib/db.ts. This file currently exports a null value because no database connection string is configured. To migrate, the db.ts file should be refactored to export a Supabase client instance created with createClient from @supabase/supabase-js, using the environment variables defined in Section 2."),
  bodyPara("The src/lib/blog-data.ts and src/lib/solar-data.ts files contain large arrays of hardcoded TypeScript objects that serve as the CMS content for blog posts, services, pricing tiers, and county coverage information. These should be replaced with asynchronous Supabase queries that fetch the equivalent data from the cms_posts, services, pricing_tiers, and county_coverage tables respectively. The fetching functions should implement caching with revalidation intervals to minimise unnecessary database round-trips. Consider using Next.js server-side data fetching patterns (fetch with revalidate) for statically rendered pages and dynamic Supabase queries for client-side interactive components."),
  bodyPara("The customer portal (src/app/portal/) currently uses static demo data to simulate a logged-in user experience. The migration requires implementing Supabase Auth for user authentication, replacing all demo data with real database queries scoped to the authenticated user, and implementing proper error handling and loading states. The portal pages should use the Supabase client-side auth helpers to obtain the current session and then query user-specific data (installations, documents, billing) from the customer_portal schema domain."),
  heading2("8.3 Testing the Migration"),
  bodyPara("After completing the migration, each integration point should be tested individually. Verify that the contact form submission creates a record in the Supabase leads table, that blog posts render correctly from the database, and that the portal displays the authenticated user data. Use the Supabase dashboard to inspect records and confirm that RLS policies are functioning as expected. Test with both authenticated and anonymous users to ensure that data isolation is enforced correctly."),
];

// ─── Section 9: Troubleshooting ───
const sec9 = [
  heading1("9. Troubleshooting"),
  bodyPara("This section documents the most commonly encountered issues during Solar Ireland development and deployment, along with their root causes and step-by-step resolutions. Each issue has been observed in real deployments and represents a known pitfall that can cost significant debugging time if not recognised early."),
  heading2("9.1 Port 3000 Binding Errors"),
  bodyPara("On production servers, the Next.js development server may fail to bind to port 3000 with an EADDRINUSE error. This occurs when another process (often a leftover PM2 instance or a previous Next.js build) is already using the port. The first diagnostic step is to identify the process using lsof -i :3000 or ss -tulpn | grep 3000, and then terminate it with kill -9 PID. Additionally, if the server uses IPv6 by default, the -H :: flag may be required instead of -H 0.0.0.0 to bind to the correct network interface. Always verify that the server is listening on the expected interface by checking the PM2 logs with pm2 logs solar-ireland."),
  heading2("9.2 Turbopack Cache Issues"),
  bodyPara("The Turbopack compiler used by Next.js in development mode maintains a persistent cache in the .next directory. Occasionally, this cache becomes corrupted or stale, causing inexplicable type errors, missing module warnings, or HMR failures that do not resolve on their own. The solution is to delete the .next directory entirely and restart the development server. This forces Turbopack to rebuild its cache from scratch, which resolves the issue in the vast majority of cases. If the problem persists after clearing the cache, also clear the node_modules/.cache directory."),
  codeBlock("rm -rf .next\nrm -rf node_modules/.cache\nbun run dev"),
  heading2("9.3 Framer Motion Stale Cache"),
  bodyPara("Framer Motion, used for animations throughout the Solar Ireland frontend, has its own internal cache that can become stale when component definitions change significantly. Symptoms include animations not triggering, elements appearing at incorrect positions, or the React hydration mismatch warning in the browser console. Clearing the .next directory resolves this issue. If animations still behave unexpectedly, verify that all motion components use unique key props and that animate props are not being conditionally applied in a way that confuses the animation state machine."),
  heading2("9.4 HMR with Lucide React Dynamic Imports"),
  bodyPara("When using dynamic imports from the lucide-react icon library with Next.js Hot Module Replacement (HMR), icons may temporarily fail to render after a code change, showing a blank space or a React error boundary fallback. This is a known issue with how bundlers handle tree-shaken icon imports during HMR. The workaround is to ensure that icon imports use the next/dynamic function with ssr: false for client-only icon components, or to import icons from a central icon wrapper file that re-exports them. In production builds, this issue does not manifest as all imports are resolved at build time."),
];

// ─── Section 10: Security Checklist ───
const sec10 = [
  heading1("10. Security Checklist"),
  bodyPara("Securing the Solar Ireland application in production requires attention to multiple layers of the technology stack, from environment variable management to database access policies. This section provides a comprehensive security checklist that must be reviewed and validated before the application is exposed to public traffic. Each item represents a critical security control that, if misconfigured, could lead to data exposure, service abuse, or compliance violations."),
  heading2("10.1 Environment Variable Protection"),
  bodyPara("Environment variables containing secrets (SUPABASE_SERVICE_ROLE_KEY, POSTMARK_API_KEY) must never be committed to version control. The .gitignore file must include entries for .env.local, .env.production.local, and any other environment files that may contain secrets. In production, environment variables should be injected through the server operating system or PM2 ecosystem file rather than through file-based configuration. Regularly audit the Git history for any accidental secret commits using tools such as git-secrets or truffleHog, and rotate any compromised credentials immediately."),
  heading2("10.2 Content Security Policy"),
  bodyPara("The next.config.ts file includes Content Security Policy (CSP) headers that restrict which external domains can load scripts, styles, images, and other resources in the browser. These headers must be reviewed and updated whenever a new third-party integration is added to the application. The default CSP configuration blocks inline scripts, restricts frame embedding, and limits image loading to approved domains. Misconfigured CSP headers can either block legitimate functionality (leading to broken features) or be too permissive (creating XSS vulnerability). Always test CSP changes with the browser developer tools Security tab to confirm that no violations are reported."),
  heading2("10.3 Row Level Security Policies"),
  bodyPara("Every table in the Supabase database must have Row Level Security (RLS) enabled and at least one policy defined. RLS is the primary mechanism for ensuring that client-side queries can only access data that the authenticated user is authorised to see. The supabase/schema.sql file includes RLS policies for all tables, but any post-deployment table modifications must include corresponding policy updates. The SUPABASE_SERVICE_ROLE_KEY must only be used in server-side API routes and must never be exposed to the browser. Regularly audit RLS policies using the Supabase dashboard to confirm that they match the intended access control matrix."),
  heading2("10.4 GDPR Cookie Consent Audit Trail"),
  bodyPara("Under the General Data Protection Regulation (GDPR), Solar Ireland must maintain an auditable record of user cookie consent. The Analytics and GDPR schema domain includes a cookie_consent table that records the user identifier (when available), the IP address, the consent decision (accept or reject), the specific cookie categories consented to, and the timestamp of the consent action. This audit trail must be retained for a minimum of 12 months and must be available for regulatory inspection upon request. The cookie consent banner implementation must accurately reflect the categories defined in the database and must not set non-essential cookies before explicit consent is obtained."),
  heading2("10.5 Security Review Summary"),
  buildTable(
    ["Control", "Status", "Owner", "Frequency"],
    [
      ["Environment variables not in Git", "Must verify", "DevOps", "Every deployment"],
      ["CSP headers configured correctly", "Must verify", "Frontend Lead", "Every release"],
      ["RLS policies on all tables", "Must verify", "Backend Lead", "Every schema change"],
      ["Service role key server-side only", "Must verify", "DevOps", "Every deployment"],
      ["Cookie consent audit trail active", "Must verify", "Compliance", "Monthly"],
      ["Dependency vulnerability scan", "Recommended", "DevOps", "Weekly"],
      ["Postmark API key rotation", "Recommended", "DevOps", "Quarterly"],
    ]
  ),
  bodyPara("This checklist should be reviewed collaboratively by the development, operations, and compliance teams before every production release. Any items that cannot be verified as compliant must be escalated and resolved before the deployment proceeds."),
];

// ─── Assemble document ───
const coverConfig = {
  title: "Solar Ireland \u2014 Deployment Guide",
  subtitle: "Production Deployment & Developer Setup Guide",
  englishLabel: "DEPLOYMENT GUIDE",
  metaLines: ["Version 1.0 | April 2026", "Confidential \u2014 Internal Use Only"],
  footerLeft: "Solar Ireland",
  footerRight: "solarireland.ie",
  palette: palette.cover,
};

const coverChildren = buildCoverR1(coverConfig);

// TOC section
const tocSection = {
  properties: {
    type: SectionType.NEXT_PAGE,
    page: {
      size: pgSize,
      margin: pgMargin,
      pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
    },
  },
  footers: {
    default: new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "PAGE ", size: 18, color: "808080", font: { ascii: "Times New Roman" } }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } }),
          ],
        }),
      ],
    }),
  },
  headers: {
    default: new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "Solar Ireland \u2014 Deployment Guide", size: 18, color: "808080", font: { ascii: "Times New Roman" } }),
          ],
        }),
      ],
    }),
  },
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 360 },
      children: [
        new TextRun({
          text: "Table of Contents",
          bold: true, size: 32,
          font: { ascii: "Times New Roman" },
          color: "1A2330",
        }),
      ],
    }),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ],
};

// Body section
const allBodyContent = [
  ...sec1, ...sec2, ...sec3, ...sec4, ...sec5, ...sec6, ...sec7, ...sec8, ...sec9, ...sec10,
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
  footers: {
    default: new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } }),
          ],
        }),
      ],
    }),
  },
  headers: {
    default: new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "Solar Ireland \u2014 Deployment Guide", size: 18, color: "808080", font: { ascii: "Times New Roman" } }),
          ],
        }),
      ],
    }),
  },
  children: allBodyContent,
};

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Times New Roman" },
          size: 24,
          color: bodyColor,
        },
        paragraph: {
          spacing: { line: 312 },
        },
      },
      heading1: {
        run: {
          font: { ascii: "Times New Roman" },
          size: 32,
          bold: true,
          color: "1A2330",
        },
        paragraph: {
          spacing: { before: 480, after: 200, line: 312 },
        },
      },
      heading2: {
        run: {
          font: { ascii: "Times New Roman" },
          size: 28,
          bold: true,
          color: "2C3E50",
        },
        paragraph: {
          spacing: { before: 360, after: 160, line: 312 },
        },
      },
      heading3: {
        run: {
          font: { ascii: "Times New Roman" },
          size: 24,
          bold: true,
          color: "34495E",
        },
        paragraph: {
          spacing: { before: 240, after: 120, line: 312 },
        },
      },
    },
  },
  numbering: numberingConfig,
  sections: [
    // Section 1: Cover
    {
      properties: {
        page: {
          size: pgSize,
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: coverChildren,
    },
    // Section 2: TOC
    tocSection,
    // Section 3: Body
    bodySection,
  ],
});

// ─── Write ───
const OUTPUT = "/home/z/my-project/download/Solar-Ireland-Deployment-Guide.docx";
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUTPUT, buf);
  console.log("Document written to", OUTPUT);
}).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
