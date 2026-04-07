import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import cm, inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Fonts ──
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/calibri-regular.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('Calibri', normal='Calibri', bold='Calibri')

# ── Colors ──
DARK = colors.HexColor('#0a0a0a')
AMBER = colors.HexColor('#FACC15')
AMBER_DARK = colors.HexColor('#B45309')
HEADER_BG = colors.HexColor('#1F4E79')
RED = colors.HexColor('#DC2626')
ORANGE = colors.HexColor('#EA580C')
GREEN = colors.HexColor('#16A34A')
YELLOW = colors.HexColor('#CA8A04')
BLUE = colors.HexColor('#2563EB')
LIGHT_GRAY = colors.HexColor('#F5F5F5')
MID_GRAY = colors.HexColor('#9CA3AF')
WHITE = colors.white

# ── Output ──
OUTPUT = '/home/z/my-project/download/Solar_Ireland_Full_Audit_Report.pdf'
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    title='Solar Ireland Full Audit Report',
    author='Z.ai',
    creator='Z.ai',
    subject='Comprehensive website audit covering SEO, accessibility, performance, content, code quality, UX, design, and security.',
    leftMargin=2*cm, rightMargin=2*cm,
    topMargin=2.2*cm, bottomMargin=2.2*cm,
)

PAGE_W = A4[0] - 4*cm

# ── Styles ──
cover_title = ParagraphStyle('CoverTitle', fontName='Times New Roman', fontSize=36, leading=44, alignment=TA_CENTER, textColor=DARK, spaceAfter=12)
cover_sub = ParagraphStyle('CoverSub', fontName='Times New Roman', fontSize=18, leading=24, alignment=TA_CENTER, textColor=MID_GRAY, spaceAfter=8)
cover_info = ParagraphStyle('CoverInfo', fontName='Times New Roman', fontSize=13, leading=20, alignment=TA_CENTER, textColor=MID_GRAY)

h1 = ParagraphStyle('H1', fontName='Times New Roman', fontSize=20, leading=26, textColor=DARK, spaceBefore=18, spaceAfter=10)
h2 = ParagraphStyle('H2', fontName='Times New Roman', fontSize=15, leading=20, textColor=DARK, spaceBefore=14, spaceAfter=8)
h3 = ParagraphStyle('H3', fontName='Times New Roman', fontSize=12, leading=16, textColor=DARK, spaceBefore=10, spaceAfter=6)

body = ParagraphStyle('Body', fontName='Times New Roman', fontSize=10.5, leading=16, alignment=TA_JUSTIFY, textColor=colors.HexColor('#1F2937'), spaceAfter=6)
body_left = ParagraphStyle('BodyLeft', fontName='Times New Roman', fontSize=10.5, leading=16, alignment=TA_LEFT, textColor=colors.HexColor('#1F2937'), spaceAfter=6)
bullet = ParagraphStyle('Bullet', fontName='Times New Roman', fontSize=10.5, leading=16, alignment=TA_LEFT, textColor=colors.HexColor('#1F2937'), leftIndent=18, spaceAfter=4, bulletIndent=6)
caption = ParagraphStyle('Caption', fontName='Times New Roman', fontSize=9.5, leading=14, alignment=TA_CENTER, textColor=MID_GRAY, spaceBefore=4, spaceAfter=12)

th_style = ParagraphStyle('TH', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=WHITE)
td_style = ParagraphStyle('TD', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_LEFT, textColor=colors.HexColor('#1F2937'))
td_center = ParagraphStyle('TDC', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=colors.HexColor('#1F2937'))
td_bold = ParagraphStyle('TDB', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_LEFT, textColor=colors.HexColor('#1F2937'))

score_style = ParagraphStyle('Score', fontName='Times New Roman', fontSize=28, leading=34, alignment=TA_CENTER, textColor=DARK)

def rating_color(score):
    if score >= 8: return GREEN
    if score >= 6: return BLUE
    if score >= 4: return ORANGE
    return RED

def make_table(data, col_widths, has_header=True):
    t = Table(data, colWidths=col_widths)
    style_cmds = [
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    if has_header:
        style_cmds.append(('BACKGROUND', (0, 0), (-1, 0), HEADER_BG))
        style_cmds.append(('TEXTCOLOR', (0, 0), (-1, 0), WHITE))
        for i in range(1, len(data)):
            if i % 2 == 0:
                style_cmds.append(('BACKGROUND', (0, i), (-1, i), LIGHT_GRAY))
    t.setStyle(TableStyle(style_cmds))
    return t

story = []

# ═══════════════════════════════════════════════
# COVER PAGE
# ═══════════════════════════════════════════════
story.append(Spacer(1, 100))
story.append(Paragraph('<b>Solar Ireland</b>', cover_title))
story.append(Paragraph('<b>Full Website Audit Report</b>', ParagraphStyle('CT2', fontName='Times New Roman', fontSize=24, leading=30, alignment=TA_CENTER, textColor=AMBER_DARK, spaceAfter=24)))
story.append(Spacer(1, 30))

# Overall score
overall = 6.8
story.append(Paragraph('<b>Overall Score</b>', ParagraphStyle('OSLabel', fontName='Times New Roman', fontSize=14, leading=18, alignment=TA_CENTER, textColor=MID_GRAY)))
story.append(Paragraph(f'<b>{overall} / 10</b>', ParagraphStyle('OSVal', fontName='Times New Roman', fontSize=42, leading=50, alignment=TA_CENTER, textColor=rating_color(overall))))
story.append(Spacer(1, 8))
story.append(Paragraph('Good foundation with critical gaps in SEO metadata and placeholder data', ParagraphStyle('OSDesc', fontName='Times New Roman', fontSize=11, leading=16, alignment=TA_CENTER, textColor=MID_GRAY)))
story.append(Spacer(1, 60))

# Date + meta
story.append(Paragraph('April 2026', cover_info))
story.append(Paragraph('Prepared by Z.ai', cover_info))
story.append(Paragraph('solarireland.com', cover_info))
story.append(PageBreak())

# ═══════════════════════════════════════════════
# EXECUTIVE SUMMARY
# ═══════════════════════════════════════════════
story.append(Paragraph('<b>1. Executive Summary</b>', h1))
story.append(Paragraph(
    'This comprehensive audit evaluates the Solar Ireland website across eight key dimensions: '
    'Search Engine Optimisation (SEO), Accessibility (A11y), Performance, Content Quality, '
    'Code Quality, User Experience (UX), Visual Design, and Security. The audit was conducted '
    'by a thorough automated code review covering all 38 source files, 18 components, 2 API routes, '
    'and 16 public assets.', body))
story.append(Paragraph(
    'The website demonstrates several impressive architectural decisions, particularly the custom '
    'motion.tsx library (a 3KB framer-motion replacement), a comprehensive JSON-LD structured data '
    'strategy with seven schemas, and excellent GPU-composited animation discipline. The dark theme '
    'design system with amber accent is well-executed and consistent. However, there are critical '
    'gaps that directly impact organic search visibility, legal compliance, and user trust.', body))

story.append(Spacer(1, 12))

# Score summary table
score_data = [
    [Paragraph('<b>Category</b>', th_style), Paragraph('<b>Score</b>', th_style), Paragraph('<b>Rating</b>', th_style), Paragraph('<b>Key Issue</b>', th_style)],
    [Paragraph('SEO', td_style), Paragraph('4.5 / 10', td_center), Paragraph('Poor', ParagraphStyle('r', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=RED)), Paragraph('No page-level metadata on any page', td_style)],
    [Paragraph('Accessibility', td_style), Paragraph('5.5 / 10', td_center), Paragraph('Fair', ParagraphStyle('r2', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=ORANGE)), Paragraph('Missing ARIA labels, no skip-nav, form issues', td_style)],
    [Paragraph('Performance', td_style), Paragraph('8.0 / 10', td_center), Paragraph('Very Good', ParagraphStyle('r3', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=GREEN)), Paragraph('Custom motion lib, dynamic imports, WebP images', td_style)],
    [Paragraph('Content', td_style), Paragraph('7.5 / 10', td_center), Paragraph('Good', ParagraphStyle('r4', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=BLUE)), Paragraph('15 quality articles; placeholder data in footer', td_style)],
    [Paragraph('Code Quality', td_style), Paragraph('7.0 / 10', td_center), Paragraph('Good', ParagraphStyle('r5', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=BLUE)), Paragraph('Consistent patterns; ignoreBuildErrors enabled', td_style)],
    [Paragraph('User Experience', td_style), Paragraph('7.5 / 10', td_center), Paragraph('Good', ParagraphStyle('r6', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=BLUE)), Paragraph('Smooth interactions; fake contact form', td_style)],
    [Paragraph('Visual Design', td_style), Paragraph('8.5 / 10', td_center), Paragraph('Excellent', ParagraphStyle('r7', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=GREEN)), Paragraph('Polished dark theme; consistent design system', td_style)],
    [Paragraph('Security', td_style), Paragraph('7.0 / 10', td_center), Paragraph('Good', ParagraphStyle('r8', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=BLUE)), Paragraph('Good headers; dangerouslySetInnerHTML in FAQ', td_style)],
]
t = make_table(score_data, [2.8*cm, 2.2*cm, 2.5*cm, 9.5*cm])
story.append(t)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 1.</b> Audit Score Summary by Category', caption))

story.append(Spacer(1, 12))
story.append(Paragraph('<b>Key Findings at a Glance:</b>', h3))

findings_glance = [
    ('Critical', 'No page-level metadata exported on any page. Blog posts, services, about, contact, and counties all inherit the root layout title and description. Google sees identical metadata for every URL.'),
    ('Critical', 'No custom 404 page exists. Users hitting invalid URLs see the default Next.js 404.'),
    ('Critical', 'Services page displays a fake phone number (01 234 5678) while the tel: link uses the correct number.'),
    ('Critical', 'counties/[slug] pages do not exist, but the sitemap ItemList JSON-LD generates URLs like /dublin that will all 404.'),
    ('High', 'Contact form submission is simulated with setTimeout. Data is never sent anywhere.'),
    ('High', 'Typo in counties data: "solar mayo.com" (space in domain name).'),
    ('Medium', '8 instances of Tailwind blur-[Npx] utilities violate the stated "no CSS filter" policy.'),
    ('Medium', 'next.config.ts has ignoreBuildErrors: true and reactStrictMode: false.'),
    ('Medium', 'Fake live viewer count in exit intent popup is misleading to users.'),
    ('Low', 'Navbar copyright year hardcoded as 2024 instead of dynamic.'),
]
for severity, text in findings_glance:
    sev_color = RED if severity == 'Critical' else ORANGE if severity == 'High' else YELLOW if severity == 'Medium' else MID_GRAY
    story.append(Paragraph(
        f'<font color="{sev_color.hexval()}"><b>[{severity}]</b></font> {text}', bullet))

story.append(PageBreak())

# ═══════════════════════════════════════════════
# 2. SEO DEEP DIVE
# ═══════════════════════════════════════════════
story.append(Paragraph('<b>2. SEO Audit (Score: 4.5 / 10)</b>', h1))

story.append(Paragraph('<b>2.1 The Metadata Problem</b>', h2))
story.append(Paragraph(
    'Every page in the application uses the <b>\'use client\'</b> directive, which prevents the '
    'use of <b>export const metadata</b> or <b>export async function generateMetadata()</b>. '
    'This is the single most damaging finding in the entire audit. It means that every page on the '
    'site, including individual blog posts, shares the same root layout title ("Solar Ireland | '
    '#1 Rated Solar Panel Installers") and the same meta description. Google cannot differentiate '
    'between "/blog/seai-grant-guide" and "/blog/winter-solar" in search results, and the blog '
    'posts will compete with each other rather than ranking for their target keywords. The fix '
    'involves converting pages to server components and extracting interactive parts into separate '
    'client components, which is a standard Next.js App Router pattern.', body))

story.append(Paragraph('<b>2.2 Structured Data</b>', h2))
story.append(Paragraph(
    'The root layout includes an impressive <b>seven JSON-LD schemas</b>: Organization, LocalBusiness, '
    'WebPage with BreadcrumbList, FAQPage, Service, HowTo, and FinancialProduct. This is well above '
    'average for a small business site and provides strong rich result eligibility. The Footer also '
    'injects an additional LocalBusiness schema with opening hours and geo-coordinates. However, '
    'several schema fields contain placeholder values: the sameAs array is empty (no social profile '
    'URLs), the postalCode is empty in the footer schema, and the Facebook appId in Open Graph '
    'metadata is an empty string. These should be populated with real business data.', body))

story.append(Paragraph('<b>2.3 Technical SEO</b>', h2))
seo_tech = [
    [Paragraph('<b>Item</b>', th_style), Paragraph('<b>Status</b>', th_style), Paragraph('<b>Detail</b>', th_style)],
    [Paragraph('sitemap.xml', td_style), Paragraph('Good', ParagraphStyle('g1', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=GREEN)), Paragraph('Dynamic with all pages + blog slugs + hash fragments', td_style)],
    [Paragraph('robots.txt', td_style), Paragraph('Good', ParagraphStyle('g2', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=GREEN)), Paragraph('Blocks AI scrapers; references sitemap', td_style)],
    [Paragraph('manifest.webmanifest', td_style), Paragraph('Good', ParagraphStyle('g3', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=GREEN)), Paragraph('PWA-ready with icons and theme', td_style)],
    [Paragraph('Canonical URLs', td_style), Paragraph('Missing', ParagraphStyle('g4', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=RED)), Paragraph('No canonical tags on any page', td_style)],
    [Paragraph('Alt text on images', td_style), Paragraph('Partial', ParagraphStyle('g5', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=ORANGE)), Paragraph('Decorative images have alt=""; content images need review', td_style)],
    [Paragraph('Heading hierarchy', td_style), Paragraph('Good', ParagraphStyle('g6', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=GREEN)), Paragraph('One h1 per page; proper h2/h3 nesting throughout', td_style)],
    [Paragraph('Counties/[slug] pages', td_style), Paragraph('Missing', ParagraphStyle('g7', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=RED)), Paragraph('Sitemap ItemList references URLs that 404', td_style)],
    [Paragraph('Blog article metadata', td_style), Paragraph('Missing', ParagraphStyle('g8', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=RED)), Paragraph('All 15 blog posts share root layout title/description', td_style)],
]
story.append(Spacer(1, 10))
story.append(make_table(seo_tech, [3*cm, 2.2*cm, 11.8*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 2.</b> Technical SEO Checklist', caption))

# ═══════════════════════════════════════════════
# 3. ACCESSIBILITY
# ═══════════════════════════════════════════════
story.append(Paragraph('<b>3. Accessibility Audit (Score: 5.5 / 10)</b>', h1))
story.append(Paragraph(
    'The site demonstrates decent accessibility foundations, with proper semantic HTML elements '
    '(main, section, nav), keyboard-accessible FAQ accordions with aria-expanded attributes, '
    'and focus-visible styles. However, there are systematic gaps across multiple pages that would '
    'prevent WCAG AA compliance. The most impactful missing items are a skip-to-content link, '
    'proper ARIA labels on navigations, and consistent form labelling.', body))

story.append(Paragraph('<b>3.1 Issues by Severity</b>', h2))

a11y_data = [
    [Paragraph('<b>Severity</b>', th_style), Paragraph('<b>Issue</b>', th_style), Paragraph('<b>Location</b>', th_style)],
    [Paragraph('Critical', ParagraphStyle('a1', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=RED)), Paragraph('No skip-to-content link', td_style), Paragraph('layout.tsx', td_style)],
    [Paragraph('High', ParagraphStyle('a2', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=ORANGE)), Paragraph('Breadcrumb nav missing aria-label on 4 pages', td_style), Paragraph('blog, blog/[slug], services, counties', td_style)],
    [Paragraph('High', ParagraphStyle('a3', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=ORANGE)), Paragraph('Category filter buttons missing aria-pressed', td_style), Paragraph('blog/page.tsx', td_style)],
    [Paragraph('High', ParagraphStyle('a4', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=ORANGE)), Paragraph('Accordion buttons missing aria-expanded and aria-controls', td_style), Paragraph('counties FAQ, services expand', td_style)],
    [Paragraph('High', ParagraphStyle('a5', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=ORANGE)), Paragraph('Form inputs missing label elements', td_style), Paragraph('contact/page.tsx', td_style)],
    [Paragraph('Medium', ParagraphStyle('a6', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=YELLOW)), Paragraph('Gallery nav arrows and dots missing aria-label', td_style), Paragraph('CustomerInstalls.tsx', td_style)],
    [Paragraph('Medium', ParagraphStyle('a7', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=YELLOW)), Paragraph('Search input has only placeholder, no label', td_style), Paragraph('counties/page.tsx', td_style)],
    [Paragraph('Medium', ParagraphStyle('a8', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=YELLOW)), Paragraph('WhySolar BenefitCard not keyboard accessible', td_style), Paragraph('WhySolar.tsx:460', td_style)],
    [Paragraph('Low', ParagraphStyle('a9', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=MID_GRAY)), Paragraph('ScrollProgress bar not aria-hidden', td_style), Paragraph('ScrollProgress.tsx', td_style)],
    [Paragraph('Low', ParagraphStyle('a10', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=MID_GRAY)), Paragraph('WhatsApp textarea missing aria-label', td_style), Paragraph('WhatsAppChat.tsx', td_style)],
]
story.append(Spacer(1, 10))
story.append(make_table(a11y_data, [2*cm, 9*cm, 6*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 3.</b> Accessibility Issues by Severity', caption))

story.append(Paragraph(
    'On the positive side, the site uses proper lang="en-IE" on the HTML element, includes '
    'focus-visible styles with the amber ring, and the FAQ component correctly implements '
    'aria-expanded on toggle buttons. The About and Contact pages correctly use aria-label on '
    'breadcrumb navigation. Color contrast ratios in the dark theme are generally sufficient '
    'thanks to the oklch variable remap implemented for WCAG AA compliance.', body))

story.append(PageBreak())

# ═══════════════════════════════════════════════
# 4. PERFORMANCE
# ═══════════════════════════════════════════════
story.append(Paragraph('<b>4. Performance Audit (Score: 8.0 / 10)</b>', h1))
story.append(Paragraph(
    'Performance is one of the site\'s strongest areas. The custom motion.tsx library replaces '
    'framer-motion at 3KB versus 220KB, saving a massive amount of JavaScript from the initial '
    'bundle. The home page correctly lazy-loads all below-fold components via next/dynamic() with '
    'meaningful skeleton fallbacks. Image optimisation is configured for AVIF and WebP formats with '
    'Sharp, and all decorative images are available in WebP format in the public directory. The '
    'CSS strategy avoids CPU-intensive properties like backdrop-filter and box-shadow animations, '
    'sticking to GPU-composited transform and opacity only.', body))

story.append(Paragraph('<b>4.1 Performance Highlights</b>', h2))
perf_highlights = [
    'Custom motion.tsx library at ~3KB (vs 220KB for framer-motion), with IntersectionObserver-based scroll triggering and synchronous viewport checks for flash prevention.',
    'Dynamic imports for all 7 below-fold sections on the home page with proper skeleton fallbacks that maintain layout stability.',
    'AVIF + WebP image format configuration in next.config.ts with Sharp for server-side optimisation.',
    'CSS animations limited to transform and opacity only, ensuring compositor-only rendering on the GPU layer.',
    'Passive scroll event listeners on the Navbar and ScrollProgress components.',
    'requestIdleCallback for deferred hero animation start, prioritising meaningful content paint.',
    'Security headers (HSTS with preload, X-Content-Type-Options, Referrer-Policy) configured in next.config.ts.',
]
for item in perf_highlights:
    story.append(Paragraph(f'<bullet>&bull;</bullet> {item}', bullet))

story.append(Paragraph('<b>4.2 Performance Concerns</b>', h2))
perf_concerns = [
    ('Medium', 'globals.css is 936 lines. While well-organised, some animation classes (cookie consent, exit intent) may be unused if those components are missing or not rendered.'),
    ('Low', 'calculateSavings() in QuickSavingsCalculator.tsx is called on every render without useMemo. The function is synchronous and fast, but wrapping it would follow React best practices.'),
    ('Low', 'WhySolar.tsx hoveredMonth state causes the entire bar chart grid to re-render on mouse enter/leave events. CSS hover states would be more performant.'),
    ('Low', 'BillAnalyser.tsx at 893 lines is the largest single component. Splitting into sub-components would improve code splitting granularity.'),
]
for sev, text in perf_concerns:
    sev_color = ORANGE if sev == 'Medium' else MID_GRAY
    story.append(Paragraph(f'<font color="{sev_color.hexval()}"><b>[{sev}]</b></font> {text}', bullet))

# ═══════════════════════════════════════════════
# 5. CONTENT
# ═══════════════════════════════════════════════
story.append(Paragraph('<b>5. Content Audit (Score: 7.5 / 10)</b>', h1))
story.append(Paragraph(
    'The site\'s content is generally strong, particularly the blog section which features 15 '
    'articles with real Irish-specific data, named energy providers, and actionable advice. '
    'Article word counts range from 1,200 to 2,400 words, which is excellent for SEO depth. '
    'The solar data in solar-data.ts references accurate SEAI grant amounts, Clean Export Guarantee '
    'rates, and Irish electricity pricing. However, there are several content accuracy concerns '
    'and placeholder data issues that undermine credibility.', body))

story.append(Paragraph('<b>5.1 Content Quality Metrics</b>', h2))
content_metrics = [
    [Paragraph('<b>Metric</b>', th_style), Paragraph('<b>Value</b>', th_style), Paragraph('<b>Assessment</b>', th_style)],
    [Paragraph('Blog articles', td_style), Paragraph('15', td_center), Paragraph('Good volume for a local business', td_style)],
    [Paragraph('Avg article length', td_style), Paragraph('1,500-2,000 words', td_center), Paragraph('Excellent for SEO depth', td_style)],
    [Paragraph('Data accuracy', td_style), Paragraph('Mostly accurate', td_center), Paragraph('Generation rate conflict: 900 vs 1070 kWh/kWp', td_style)],
    [Paragraph('FAQ count', td_style), Paragraph('12 questions', td_center), Paragraph('Good coverage of common queries', td_style)],
    [Paragraph('Placeholder data', td_style), Paragraph('6 instances', td_center), Paragraph('Phone numbers, company reg, social URLs', td_style)],
    [Paragraph('Services pages', td_style), Paragraph('6 services', td_center), Paragraph('Good coverage with expand/collapse detail', td_style)],
    [Paragraph('County pages', td_style), Paragraph('26 counties', td_center), Paragraph('List page only; no individual county pages', td_style)],
]
story.append(Spacer(1, 10))
story.append(make_table(content_metrics, [3*cm, 3.5*cm, 10.5*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 4.</b> Content Quality Metrics', caption))

story.append(Paragraph('<b>5.2 Data Accuracy Issues</b>', h2))
story.append(Paragraph(
    'The most notable data conflict is between solar-data.ts which states 900 kWh/kWp/year and the '
    'calculator (QuickSavingsCalculator.tsx) which uses 1070 kWh/kWp/year based on SEAI TMY data for '
    'a south-facing Irish roof at 35 degrees tilt. The 1070 figure is more accurate for Ireland and '
    'should be the canonical value. Additionally, blog articles are dated "2026" which appears to be '
    'future-dated. While this may reflect planned publication dates, it could confuse users and '
    'search engines. The WhySolar price comparison data stops at 2025 with no 2026 projection, '
    'which will quickly become outdated.', body))

story.append(Paragraph('<b>5.3 Placeholder Data Inventory</b>', h2))
placeholder_data = [
    [Paragraph('<b>Location</b>', th_style), Paragraph('<b>Issue</b>', th_style), Paragraph('<b>Impact</b>', th_style)],
    [Paragraph('Footer.tsx:342', td_style), Paragraph('Social links href="#"', td_style), Paragraph('Broken links; no social profiles', td_style)],
    [Paragraph('Footer.tsx:513', td_style), Paragraph('Company Reg: 123456', td_style), Paragraph('Legal compliance risk', td_style)],
    [Paragraph('Footer.tsx:515', td_style), Paragraph('Tax Reg: 1234567TH', td_style), Paragraph('Legal compliance risk', td_style)],
    [Paragraph('Navbar.tsx:430', td_style), Paragraph('Copyright 2024', td_style), Paragraph('Outdated; appears unmanaged', td_style)],
    [Paragraph('ExitIntent.tsx:35-46', td_style), Paragraph('Fake live viewer count', td_style), Paragraph('Misleading to users', td_style)],
    [Paragraph('WhySolar.tsx:34-42', td_style), Paragraph('Price data stops at 2025', td_style), Paragraph('Outdated comparison', td_style)],
    [Paragraph('Blog page', td_style), Paragraph('"~500 subscribers"', td_style), Paragraph('Minor credibility issue', td_style)],
]
story.append(Spacer(1, 10))
story.append(make_table(placeholder_data, [3.5*cm, 4.5*cm, 9*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 5.</b> Placeholder Data Inventory', caption))

story.append(PageBreak())

# ═══════════════════════════════════════════════
# 6. CODE QUALITY
# ═══════════════════════════════════════════════
story.append(Paragraph('<b>6. Code Quality Audit (Score: 7.0 / 10)</b>', h1))
story.append(Paragraph(
    'The codebase demonstrates strong engineering fundamentals with consistent patterns, proper '
    'TypeScript usage, and a well-architected custom animation system. The project uses Next.js '
    '16 with React 19 and Tailwind v4, all on their latest versions. However, there are several '
    'configuration concerns and architectural decisions that could cause issues in production.', body))

story.append(Paragraph('<b>6.1 Critical Code Issues</b>', h2))
code_issues = [
    ('High', 'next.config.ts has ignoreBuildErrors: true (line 9). This suppresses TypeScript errors at build time, meaning real type bugs can reach production undetected. This should be set to false for any production deployment.'),
    ('High', 'reactStrictMode: false in next.config.ts (line 12). Disabling strict mode means you lose double-render warnings for side effects in development, which is a critical tool for catching bugs early.'),
    ('High', 'tailwind.config.ts uses v3 syntax (hsl var format) but the project runs Tailwind v4 with CSS-based @theme configuration in globals.css. This orphaned config file could cause confusion and should be removed.'),
    ('Medium', 'FAQ.tsx uses dangerouslySetInnerHTML for FAQ answers containing HTML links with inline onClick handlers. While the current data is hardcoded and safe, this pattern is fragile and would become an XSS vector if content came from a CMS.'),
    ('Medium', '8 instances of Tailwind blur-[Npx] utilities across Footer, WhySolar, FAQ, GrantInfo, CustomerInstalls, and ExitIntent components. These generate CSS filter: blur() which violates the project\'s own stated "no CSS filter" policy documented in globals.css.'),
    ('Low', 'globals.css has a duplicate [data-motion-hover-scale]:hover CSS rule at lines 876-877 and 879-881, where the second rule overrides the first with the same styles, making the first dead code.'),
    ('Low', 'package.json has a "db:push" script that is a no-op echo command, suggesting an abandoned database plan.'),
]
for sev, text in code_issues:
    sev_color = RED if sev == 'High' else YELLOW if sev == 'Medium' else MID_GRAY
    story.append(Paragraph(f'<font color="{sev_color.hexval()}"><b>[{sev}]</b></font> {text}', bullet))

story.append(Paragraph('<b>6.2 Architecture Strengths</b>', h2))
arch_strengths = [
    'Custom motion.tsx library is an excellent engineering decision: 3KB vs 220KB bundle savings, IntersectionObserver-based scroll triggering, variant propagation via React context, and comprehensive flash prevention.',
    'Centralised data: SOLAR_DATA in solar-data.ts provides a single source of truth for grant amounts, CEG rates, and service areas. The buildWhatsAppUrl utility ensures consistent WhatsApp deep linking across the site.',
    'Proper component separation: 18 components are well-organised in src/components/solar/ with clear single-responsibility boundaries. Dynamic imports on the home page keep the initial JS bundle lean.',
    'API routes are well-structured: analyse-bill uses real Irish energy provider rates with OCR vision capabilities, and the chat endpoint has a comprehensive system prompt with Irish-specific knowledge.',
    'Security-conscious configuration: AI scraper blocking in robots.txt, Permissions-Policy with FLoC opt-out, HSTS with preload, and Content-Security-Policy headers.',
]
for item in arch_strengths:
    story.append(Paragraph(f'<bullet>&bull;</bullet> {item}', bullet))

# ═══════════════════════════════════════════════
# 7. UX + DESIGN
# ═══════════════════════════════════════════════
story.append(Paragraph('<b>7. UX and Design Audit (Score: 8.0 / 10 combined)</b>', h1))

story.append(Paragraph('<b>7.1 User Experience (7.5 / 10)</b>', h2))
story.append(Paragraph(
    'The site delivers a polished user experience with smooth animations, consistent navigation, '
    'and clear calls-to-action. The dual-calculator approach (Quick Savings Calculator for instant '
    'results + AI Bill Analyser for detailed analysis) caters to different user comfort levels. '
    'The WhatsApp chat widget provides a persistent communication channel. Loading skeletons exist '
    'for the home, blog, and about pages, though services, contact, counties, and privacy pages '
    'still lack them.', body))

ux_issues = [
    ('Critical', 'Contact form submission is fake. The handleSubmit function uses setTimeout to simulate a 1.2-second delay, then shows a success message. No data is ever sent to an email service, CRM, or webhook. Users who fill out the form will expect to be contacted, creating a trust deficit.'),
    ('High', 'No custom 404 page. Users who follow an old link or mistype a URL see the default Next.js 404, which breaks the site\'s dark theme and provides no navigation path back.'),
    ('Medium', 'Exit intent idle timer at 25 seconds may interrupt users who pause to read content. Consider increasing to 45 seconds or requiring some scroll depth before triggering.'),
    ('Medium', 'Blog pagination uses smooth CSS transitions, but there is no URL-based pagination (no ?page=2 query param), meaning paginated blog content is not crawlable by search engines.'),
    ('Low', 'BillAnalyser fake scanning animation totals 2.6 seconds of artificial delay before the API call. While this creates anticipation, the total wait (API + fake delay) can exceed 5 seconds.'),
]
for sev, text in ux_issues:
    sev_color = RED if sev == 'Critical' else ORANGE if sev == 'High' else YELLOW if sev == 'Medium' else MID_GRAY
    story.append(Paragraph(f'<font color="{sev_color.hexval()}"><b>[{sev}]</b></font> {text}', bullet))

story.append(Paragraph('<b>7.2 Visual Design (8.5 / 10)</b>', h2))
story.append(Paragraph(
    'The visual design is one of the site\'s strongest attributes. The dark theme (#0a0a0a background) '
    'with amber (#FACC15) accent creates a premium, modern aesthetic that is distinctive in the '
    'Irish solar market. The glass-card component pattern (bg-white/[0.03] with subtle borders) '
    'provides consistent visual depth throughout. The typography hierarchy uses the Geist font '
    'family with proper responsive scaling across all breakpoints. The honeycomb background pattern, '
    'amber gradient text, and scroll progress bar are elegant touches that reinforce brand identity '
    'without overwhelming the content.', body))

design_strengths = [
    'Consistent dark theme with amber accent across all 38 source files. No colour drift or inconsistency.',
    'Glass-card component pattern used universally for visual depth without CPU-intensive backdrop-filter.',
    'GPU-composited animation discipline: transform and opacity only, with spring easing cubic-bezier(0.16, 1, 0.3, 1).',
    'Responsive design with proper breakpoints (sm, md, lg) throughout all components.',
    'Loading skeletons match their page layouts, preventing layout shift during navigation.',
    'Stat pills, trust bars, and CTA buttons follow consistent sizing and spacing conventions.',
]
for item in design_strengths:
    story.append(Paragraph(f'<bullet>&bull;</bullet> {item}', bullet))

story.append(PageBreak())

# ═══════════════════════════════════════════════
# 8. SECURITY
# ═══════════════════════════════════════════════
story.append(Paragraph('<b>8. Security Audit (Score: 7.0 / 10)</b>', h1))
story.append(Paragraph(
    'The site has a good security posture for a small business website, with comprehensive HTTP '
    'security headers, AI scraper blocking, and proper input validation on the bill analyser API. '
    'However, there are specific vulnerabilities that should be addressed.', body))

security_items = [
    ('High', 'FAQ.tsx line 217: dangerouslySetInnerHTML renders HTML strings containing anchor tags with inline onClick handlers. While current data is safe (hardcoded), this becomes an XSS vector if FAQ content is ever moved to a CMS or database.'),
    ('Medium', 'next.config.ts CSP frame-ancestors is set to "*" (line 47-48), allowing the site to be embedded in any iframe. This should be restricted to specific domains or "self" unless embedding is intentionally permitted.'),
    ('Medium', 'Contact form accepts any input without server-side validation or rate limiting. A real backend integration should include CAPTCHA or honeypot fields, input sanitisation, and rate limiting.'),
    ('Low', 'next.config.ts line 52 includes X-XSS-Protection: "1; mode=block" which is a deprecated header. Modern browsers use Content-Security-Policy instead, which is already configured.'),
    ('Positive', 'robots.txt blocks AI scrapers (GPTBot, ChatGPT-User, CCBot, Google-Extended, anthropic-ai) to protect content from unauthorised training data usage.'),
    ('Positive', 'Permissions-Policy includes interest-cohort=() to opt out of FLoC/Topics advertising tracking.'),
    ('Positive', 'API routes have proper error handling with try/catch and user-friendly error messages. The analyse-bill route validates file types and returns appropriate HTTP status codes.'),
]
for sev, text in security_items:
    if sev == 'Positive':
        story.append(Paragraph(f'<font color="{GREEN.hexval()}"><b>[+]</b></font> {text}', bullet))
    else:
        sev_color = RED if sev == 'High' else YELLOW if sev == 'Medium' else MID_GRAY
        story.append(Paragraph(f'<font color="{sev_color.hexval()}"><b>[{sev}]</b></font> {text}', bullet))

# ═══════════════════════════════════════════════
# 9. PRIORITY ACTION PLAN
# ═══════════════════════════════════════════════
story.append(Paragraph('<b>9. Priority Action Plan</b>', h1))
story.append(Paragraph(
    'The following actions are ordered by impact and urgency. Each item includes an estimated '
    'effort level and the expected improvement to the overall audit score.', body))

plan_data = [
    [Paragraph('<b>#</b>', th_style), Paragraph('<b>Action</b>', th_style), Paragraph('<b>Impact</b>', th_style), Paragraph('<b>Effort</b>', th_style)],
    [Paragraph('1', td_center), Paragraph('Convert pages to server components + add generateMetadata for blog posts', td_style), Paragraph('+1.5 SEO', td_center), Paragraph('Large', td_center)],
    [Paragraph('2', td_center), Paragraph('Create custom not-found.tsx (404 page)', td_style), Paragraph('+0.5 UX', td_center), Paragraph('Small', td_center)],
    [Paragraph('3', td_center), Paragraph('Fix fake phone number on services page', td_style), Paragraph('+0.3 Content', td_center), Paragraph('Tiny', td_center)],
    [Paragraph('4', td_center), Paragraph('Create counties/[slug] pages or fix sitemap URLs', td_style), Paragraph('+0.5 SEO', td_center), Paragraph('Medium', td_center)],
    [Paragraph('5', td_center), Paragraph('Wire contact form to real backend (email/webhook)', td_style), Paragraph('+0.5 UX', td_center), Paragraph('Medium', td_center)],
    [Paragraph('6', td_center), Paragraph('Fix Mayo domain typo ("solar mayo.com")', td_style), Paragraph('+0.1 Content', td_center), Paragraph('Tiny', td_center)],
    [Paragraph('7', td_center), Paragraph('Add skip-to-content link and aria-labels across all pages', td_style), Paragraph('+1.0 A11y', td_center), Paragraph('Medium', td_center)],
    [Paragraph('8', td_center), Paragraph('Set ignoreBuildErrors=false, reactStrictMode=true', td_style), Paragraph('+0.3 Code', td_center), Paragraph('Tiny', td_center)],
    [Paragraph('9', td_center), Paragraph('Replace blur-[Npx] utilities with box-shadow or remove', td_style), Paragraph('+0.2 Design', td_center), Paragraph('Small', td_center)],
    [Paragraph('10', td_center), Paragraph('Replace placeholder footer data (reg numbers, social URLs)', td_style), Paragraph('+0.3 Content', td_center), Paragraph('Small', td_center)],
    [Paragraph('11', td_center), Paragraph('Remove fake live viewer count from exit intent', td_style), Paragraph('+0.2 UX', td_center), Paragraph('Tiny', td_center)],
    [Paragraph('12', td_center), Paragraph('Delete orphaned tailwind.config.ts', td_style), Paragraph('+0.2 Code', td_center), Paragraph('Tiny', td_center)],
    [Paragraph('13', td_center), Paragraph('Add loading skeletons for services, contact, counties, privacy', td_style), Paragraph('+0.3 UX', td_center), Paragraph('Small', td_center)],
    [Paragraph('14', td_center), Paragraph('Add URL-based blog pagination (?page=2) for crawlability', td_style), Paragraph('+0.3 SEO', td_center), Paragraph('Medium', td_center)],
]
story.append(Spacer(1, 10))
story.append(make_table(plan_data, [1*cm, 9.5*cm, 2.5*cm, 4*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 6.</b> Prioritised Action Plan (14 items)', caption))

story.append(Spacer(1, 18))
story.append(Paragraph(
    'Completing all 14 actions would bring the projected overall score from <b>6.8 to approximately 8.5</b>, '
    'with the most significant gains coming from the SEO metadata fixes (+1.5) and accessibility '
    'improvements (+1.0). Items 1 through 6 are recommended as immediate priorities, while items 7 '
    'through 14 can be scheduled as part of ongoing maintenance.', body))

# ── Build ──
doc.build(story)
print(f"PDF generated: {OUTPUT}")
