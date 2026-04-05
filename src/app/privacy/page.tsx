'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Clock,
  Lock,
  Eye,
  Server,
  Cookie,
  UserCheck,
  Database,
  FileCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';

/* ═══════════════════════════════════════════════════════
   TABLE OF CONTENTS DATA
   ═══════════════════════════════════════════════════════ */
const sections = [
  { id: 'introduction', label: 'Introduction', icon: Shield },
  { id: 'information-we-collect', label: 'Information We Collect', icon: Database },
  { id: 'how-we-use', label: 'How We Use Your Information', icon: Eye },
  { id: 'legal-basis', label: 'Legal Basis for Processing', icon: FileCheck },
  { id: 'data-sharing', label: 'Data Sharing', icon: Server },
  { id: 'cookies', label: 'Cookies & Tracking', icon: Cookie },
  { id: 'your-rights', label: 'Your Rights', icon: UserCheck },
  { id: 'data-retention', label: 'Data Retention', icon: Clock },
  { id: 'security', label: 'Security Measures', icon: Lock },
  { id: 'third-party', label: 'Third-Party Services', icon: ExternalLink },
  { id: 'childrens-privacy', label: "Children's Privacy", icon: Shield },
  { id: 'changes', label: 'Changes to This Policy', icon: FileCheck },
  { id: 'contact', label: 'Contact Us', icon: Mail },
];

/* ═══════════════════════════════════════════════════════
   ACTIVE SECTION TRACKER
   ═══════════════════════════════════════════════════════ */
function useActiveSection() {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { threshold: 0.15, rootMargin: '-80px 0px -60% 0px' }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}

/* ═══════════════════════════════════════════════════════
   TABLE OF CONTENTS SIDEBAR
   ═══════════════════════════════════════════════════════ */
function TableOfContents({ activeId }: { activeId: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile TOC toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden sticky top-20 z-20 w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-8 transition-colors hover:bg-white/[0.06]"
      >
        <span className="text-sm font-medium text-gray-300">Table of Contents</span>
        <ChevronRight
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${mobileOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {/* TOC Sidebar */}
      <nav
        className={`lg:sticky lg:top-20 transition-all duration-300 ${
          mobileOpen
            ? 'max-h-[500px] opacity-100 mb-8'
            : 'max-h-0 lg:max-h-none opacity-0 lg:opacity-100 overflow-hidden lg:overflow-visible mb-0'
        }`}
        aria-label="Table of Contents"
      >
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 lg:p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 mb-4">
            On This Page
          </h3>
          <ul className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeId === section.id;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => handleClick(section.id)}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-amber-400/10 text-amber-400 font-medium'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-amber-400" />
                    )}
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                    {section.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION HEADING COMPONENT
   ═══════════════════════════════════════════════════════ */
function SectionHeading({
  id,
  icon: Icon,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-white mb-5 scroll-mt-24"
    >
      <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-amber-400" />
      </div>
      {children}
    </h2>
  );
}

/* ═══════════════════════════════════════════════════════
   SUBSECTION COMPONENT
   ═══════════════════════════════════════════════════════ */
function Subsection({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base sm:text-lg font-semibold text-gray-200 mt-6 mb-2">
      {children}
    </h3>
  );
}

/* ═══════════════════════════════════════════════════════
   PRIVACY POLICY PAGE
   ═══════════════════════════════════════════════════════ */
export default function PrivacyPolicyPage() {
  const activeId = useActiveSection();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        {/* ─── Hero / Header ─── */}
        <header className="relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-400/[0.04] rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-10 sm:pb-14 relative">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-400">
                Legal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed">
              How Solar Ireland collects, uses, and protects your personal data
              in compliance with GDPR and Irish data protection law.
            </p>
            <div className="flex items-center gap-4 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: April 2026</span>
              </div>
              <span className="text-white/10">|</span>
              <span>Version 2.0</span>
            </div>
          </div>
        </header>

        {/* ─── Breadcrumb ─── */}
        <div className="border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-600">
              <a href="/" className="hover:text-gray-400 transition-colors">Home</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-400">Privacy Policy</span>
            </nav>
          </div>
        </div>

        {/* ─── Content Area ─── */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            {/* ─── Sidebar ─── */}
            <aside className="lg:w-64 shrink-0">
              <TableOfContents activeId={activeId} />
            </aside>

            {/* ─── Main Content ─── */}
            <div className="flex-1 min-w-0 max-w-none">
              <div className="rounded-2xl bg-white/[0.015] border border-white/[0.05] p-6 sm:p-8 lg:p-10">
                <div className="prose-custom text-gray-400 leading-relaxed space-y-1">

                  {/* ═══════════════════════════════════
                      1. INTRODUCTION
                      ═══════════════════════════════════ */}
                  <SectionHeading id="introduction" icon={Shield}>
                    1. Introduction
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Solar Ireland (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a SEAI-registered solar panel
                    installation company operating across all 32 counties of Ireland. We are committed
                    to protecting your privacy and ensuring that any personal data we collect is
                    processed lawfully, fairly, and transparently.
                  </p>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    This Privacy Policy explains what personal data we collect, why we collect it,
                    how we use it, and your rights in relation to your data. It applies to all
                    interactions you have with us, including our website{' '}
                    <span className="text-amber-400">solarireland.com</span>, our county-specific
                    websites, WhatsApp, email, phone, and in-person communications.
                  </p>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    By using our services or providing us with your personal data, you agree to the
                    collection and use of information in accordance with this policy. If you do not
                    agree with the terms of this policy, please do not provide us with your personal
                    information.
                  </p>

                  {/* ═══════════════════════════════════
                      2. INFORMATION WE COLLECT
                      ═══════════════════════════════════ */}
                  <SectionHeading id="information-we-collect" icon={Database}>
                    2. Information We Collect
                  </SectionHeading>

                  <Subsection>Personal Data</Subsection>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    We may collect the following personal information when you interact with us:
                  </p>
                  <ul className="space-y-2 mb-6 ml-1">
                    {[
                      'Full name and contact details (email address, phone number, postal address)',
                      'Property address and ESB Meter Point Reference Number (MPRN) for grant applications',
                      'BER rating and property construction details',
                      'Electricity usage data (uploaded bills, provider details, consumption figures)',
                      'Payment information and financial records',
                      'Survey and installation records (roof photos, system specifications)',
                      'Communication records (emails, WhatsApp messages, call notes)',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Subsection>Usage Data</Subsection>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    When you visit our website, we automatically collect certain information:
                  </p>
                  <ul className="space-y-2 mb-6 ml-1">
                    {[
                      'IP address and approximate geographic location',
                      'Browser type, version, and operating system',
                      'Pages visited, time spent, and navigation path',
                      'Referring website and search terms used',
                      'Device type and screen resolution',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Subsection>Communication Data</Subsection>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    When you communicate with us via WhatsApp, email, or phone, we record the content
                    of those communications for the purposes of providing our services, improving
                    customer experience, and maintaining records as required by law.
                  </p>

                  {/* ═══════════════════════════════════
                      3. HOW WE USE YOUR INFORMATION
                      ═══════════════════════════════════ */}
                  <SectionHeading id="how-we-use" icon={Eye}>
                    3. How We Use Your Information
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    We use your personal data for the following purposes:
                  </p>
                  <div className="grid gap-3 mb-6">
                    {[
                      {
                        title: 'Providing Quotes & Services',
                        desc: 'To prepare accurate solar installation quotes, conduct roof surveys, and manage your project from start to finish.',
                      },
                      {
                        title: 'SEAI Grant Applications',
                        desc: 'To process your SEAI grant application, including submitting your property details to SEAI and coordinating with ESB Networks.',
                      },
                      {
                        title: 'Installation & Commissioning',
                        desc: 'To schedule installations, coordinate with our RECI-certified electricians, and notify ESB Networks of grid connections.',
                      },
                      {
                        title: 'Marketing (Consent-Based)',
                        desc: 'With your explicit consent, we may send you information about new services, promotions, or solar energy news via email or WhatsApp. You can opt out at any time.',
                      },
                      {
                        title: 'Improving Our Services',
                        desc: 'To analyse website usage, improve our customer experience, and develop new products and services based on customer needs.',
                      },
                      {
                        title: 'Legal & Compliance',
                        desc: 'To comply with tax, financial, and regulatory obligations, resolve disputes, and enforce our contractual terms.',
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-200">{item.title}</p>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ═══════════════════════════════════
                      4. LEGAL BASIS FOR PROCESSING
                      ═══════════════════════════════════ */}
                  <SectionHeading id="legal-basis" icon={FileCheck}>
                    4. Legal Basis for Processing
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    We process your personal data in accordance with the General Data Protection
                    Regulation (GDPR) and the Data Protection Act 2018. Our legal basis for
                    processing depends on the specific purpose:
                  </p>
                  <div className="grid gap-3 mb-6">
                    {[
                      {
                        basis: 'Consent',
                        article: 'Art. 6(1)(a)',
                        desc: 'Where you have given us explicit consent to process your data, such as for marketing communications or using our AI Bill Analyser tool.',
                      },
                      {
                        basis: 'Contractual Necessity',
                        article: 'Art. 6(1)(b)',
                        desc: 'Where processing is necessary to perform a contract with you — for example, providing a solar installation or processing a grant application.',
                      },
                      {
                        basis: 'Legitimate Interest',
                        article: 'Art. 6(1)(f)',
                        desc: 'Where processing serves our legitimate business interests, such as improving our website, preventing fraud, or ensuring the security of our services. We always balance this against your rights.',
                      },
                      {
                        basis: 'Legal Obligation',
                        article: 'Art. 6(1)(c)',
                        desc: 'Where processing is necessary to comply with a legal obligation — for example, retaining financial records for tax purposes or sharing data with SEAI for grant processing.',
                      },
                    ].map((item) => (
                      <div
                        key={item.basis}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <div className="shrink-0 px-2 py-1 rounded-md bg-amber-400/10 text-[10px] font-mono font-semibold text-amber-400">
                          {item.article}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">{item.basis}</p>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ═══════════════════════════════════
                      5. DATA SHARING
                      ═══════════════════════════════════ */}
                  <SectionHeading id="data-sharing" icon={Server}>
                    5. Data Sharing
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    We may share your personal data with the following third parties when necessary
                    to provide our services:
                  </p>
                  <div className="grid gap-3 mb-6">
                    {[
                      {
                        name: 'SEAI (Sustainable Energy Authority of Ireland)',
                        purpose: 'Grant application processing, installer registration, and compliance reporting.',
                      },
                      {
                        name: 'ESB Networks',
                        purpose: 'Grid connection notifications, smart meter data, and Clean Export Guarantee registration.',
                      },
                      {
                        name: 'Insurance Providers',
                        purpose: 'Public liability and professional indemnity insurance claims if required.',
                      },
                      {
                        name: 'Subcontractors & Partners',
                        purpose: 'RECI-certified electricians, scaffolding companies, and BER assessors engaged to deliver your installation.',
                      },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <Server className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-200">{item.name}</p>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.purpose}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/10 mb-6">
                    <p className="text-sm text-green-400 font-medium mb-1">
                      We never sell your personal data
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Solar Ireland does not sell, rent, or trade your personal information to any
                      third party for marketing purposes. All data sharing is strictly limited to
                      what is necessary to provide our services and comply with legal obligations.
                    </p>
                  </div>

                  {/* ═══════════════════════════════════
                      6. COOKIES & TRACKING
                      ═══════════════════════════════════ */}
                  <SectionHeading id="cookies" icon={Cookie}>
                    6. Cookies & Tracking
                  </SectionHeading>

                  <Subsection>Essential Cookies</Subsection>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    These cookies are necessary for the website to function properly. They cannot be
                    disabled as the website would not work without them:
                  </p>
                  <ul className="space-y-2 mb-6 ml-1">
                    {[
                      { name: 'Cookie Consent', desc: 'Stores your cookie preference settings.' },
                      { name: 'Session', desc: 'Maintains your session while browsing the site.' },
                      { name: 'Security', desc: 'Helps prevent cross-site request forgery (CSRF).' },
                    ].map((item) => (
                      <li key={item.name} className="flex items-start gap-2.5 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40 mt-2 shrink-0" />
                        <span><span className="text-gray-300 font-medium">{item.name}</span> — {item.desc}</span>
                      </li>
                    ))}
                  </ul>

                  <Subsection>Analytics Cookies</Subsection>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    We use Google Analytics 4 (GA4) to understand how visitors use our website. These
                    cookies collect anonymised data about page views, user journey, and device
                    information. This helps us improve our website and services.
                  </p>

                  <Subsection>Cookie Consent Banner</Subsection>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    When you first visit our website, a cookie consent banner appears, allowing you
                    to accept or reject non-essential cookies. Essential cookies are always active
                    as they are necessary for the website to function. You can change your preferences
                    at any time by clicking the cookie settings link in the website footer.
                  </p>

                  <Subsection>How to Manage Cookies</Subsection>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    You can manage or delete cookies through your browser settings. Most browsers allow
                    you to block or delete cookies. Please note that blocking certain cookies may affect
                    the functionality of our website. For more information, visit{' '}
                    <span className="text-gray-300">www.aboutcookies.org</span> or consult your
                    browser&apos;s help documentation.
                  </p>

                  {/* ═══════════════════════════════════
                      7. YOUR RIGHTS
                      ═══════════════════════════════════ */}
                  <SectionHeading id="your-rights" icon={UserCheck}>
                    7. Your Rights
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    Under GDPR, you have the following rights regarding your personal data:
                  </p>
                  <div className="grid gap-3 mb-6">
                    {[
                      {
                        right: 'Right of Access',
                        desc: 'You can request a copy of all personal data we hold about you. We will provide this within 30 days.',
                      },
                      {
                        right: 'Right to Rectification',
                        desc: 'You can request corrections to any inaccurate or incomplete personal data we hold.',
                      },
                      {
                        right: 'Right to Erasure ("Right to be Forgotten")',
                        desc: 'You can request deletion of your personal data where we no longer have a legal basis to retain it.',
                      },
                      {
                        right: 'Right to Data Portability',
                        desc: 'You can request your data in a structured, commonly used, machine-readable format (e.g., CSV or JSON).',
                      },
                      {
                        right: 'Right to Object',
                        desc: 'You can object to processing based on legitimate interests or for direct marketing at any time.',
                      },
                      {
                        right: 'Right to Withdraw Consent',
                        desc: 'Where processing is based on consent, you can withdraw your consent at any time. This does not affect the lawfulness of processing before withdrawal.',
                      },
                      {
                        right: 'Right to Restrict Processing',
                        desc: 'You can request that we limit how we use your data while a dispute is being resolved.',
                      },
                      {
                        right: 'Right to Lodge a Complaint',
                        desc: 'You have the right to lodge a complaint with the Data Protection Commission (DPC) at dataprotection.ie if you believe your data has been mishandled.',
                      },
                    ].map((item) => (
                      <div
                        key={item.right}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <UserCheck className="w-4 h-4 text-amber-400/60 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-200">{item.right}</p>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/10 mb-6">
                    <p className="text-sm font-medium text-amber-400 mb-1">
                      Data Protection Officer
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      To exercise any of your rights, please contact our Data Protection Officer at{' '}
                      <a
                        href="mailto:cal@solarireland.com"
                        className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                      >
                        cal@solarireland.com
                      </a>
                      . We will respond to all legitimate requests within 30 days. We may ask for
                      identification to verify your identity before processing your request.
                    </p>
                  </div>

                  {/* ═══════════════════════════════════
                      8. DATA RETENTION
                      ═══════════════════════════════════ */}
                  <SectionHeading id="data-retention" icon={Clock}>
                    8. Data Retention
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    We retain your personal data only for as long as necessary to fulfil the purposes
                    for which it was collected:
                  </p>
                  <div className="grid gap-3 mb-6">
                    {[
                      {
                        category: 'Financial & Tax Records',
                        period: '7 years',
                        reason: 'Required by Irish tax law and Revenue Commissioners.',
                      },
                      {
                        category: 'Marketing Consents',
                        period: '3 years',
                        reason: 'Retained while you have an active subscription. Removed 3 years after last interaction.',
                      },
                      {
                        category: 'Project & Installation Records',
                        period: '10 years',
                        reason: 'Warranty, insurance claims, and regulatory compliance.',
                      },
                      {
                        category: 'Website Analytics Data',
                        period: '14 months',
                        reason: 'Google Analytics default retention period for anonymised data.',
                      },
                      {
                        category: 'Communication Records',
                        period: '3 years',
                        reason: 'Customer service quality and dispute resolution.',
                      },
                    ].map((item) => (
                      <div
                        key={item.category}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <div className="shrink-0 px-2.5 py-1 rounded-lg bg-white/[0.04] text-xs font-mono font-semibold text-gray-300 min-w-[90px] text-center">
                          {item.period}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">{item.category}</p>
                          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    When data is no longer required, it is securely deleted or anonymised. You may
                    request earlier deletion by contacting us, subject to legal and contractual
                    obligations.
                  </p>

                  {/* ═══════════════════════════════════
                      9. SECURITY MEASURES
                      ═══════════════════════════════════ */}
                  <SectionHeading id="security" icon={Lock}>
                    9. Security Measures
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    We take the security of your personal data seriously and implement appropriate
                    technical and organisational measures:
                  </p>
                  <ul className="space-y-2 mb-6 ml-1">
                    {[
                      'TLS/SSL encryption for all data transmitted through our website and APIs',
                      'Encrypted storage for sensitive data (payment details, ID documents)',
                      'Secure cloud hosting on servers located within the EU/EEA',
                      'Role-based access controls — only authorised personnel can access personal data',
                      'Regular security audits and vulnerability assessments',
                      'Staff training on data protection best practices',
                      'Incident response procedures for data breaches, including notification to the DPC within 72 hours where required',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400/40 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    While no system is completely secure, we continually review and enhance our
                    security measures to protect your data against unauthorised access, alteration,
                    disclosure, or destruction.
                  </p>

                  {/* ═══════════════════════════════════
                      10. THIRD-PARTY SERVICES
                      ═══════════════════════════════════ */}
                  <SectionHeading id="third-party" icon={ExternalLink}>
                    10. Third-Party Services
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-3">
                    Our website and services rely on the following third-party platforms:
                  </p>
                  <div className="grid gap-3 mb-6">
                    {[
                      {
                        name: 'Google Analytics 4',
                        purpose: 'Website usage analytics. Data is anonymised and processed in accordance with Google\'s privacy practices.',
                        link: 'policies.google.com/privacy',
                      },
                      {
                        name: 'WhatsApp Business',
                        purpose: 'Customer communication. Messages are processed by Meta in accordance with their data policy.',
                        link: 'whatsapp.com/legal/privacy-policy',
                      },
                      {
                        name: 'ESB Networks',
                        purpose: 'Grid connection notifications, ESB account integration, and smart meter services.',
                        link: 'esbnetworks.ie',
                      },
                      {
                        name: 'SEAI',
                        purpose: 'Grant applications, installer registration, and compliance reporting.',
                        link: 'seai.ie',
                      },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-200">{item.name}</p>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.purpose}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.link}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    We do not control the privacy practices of these third-party services. We
                    encourage you to review their privacy policies before interacting with them.
                    Each third party is independently responsible for their own compliance with
                    data protection laws.
                  </p>

                  {/* ═══════════════════════════════════
                      11. CHILDREN'S PRIVACY
                      ═══════════════════════════════════ */}
                  <SectionHeading id="childrens-privacy" icon={Shield}>
                    11. Children&apos;s Privacy
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Our website and services are not directed at individuals under the age of 18.
                    Solar Ireland provides residential solar panel installation services to
                    homeowners, who must be legally adults to enter into installation contracts.
                  </p>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    We do not knowingly collect personal data from children under 18. If we become
                    aware that we have inadvertently collected data from a person under 18, we will
                    take immediate steps to delete that information. If you believe a child has
                    provided us with personal data, please contact us at{' '}
                    <a
                      href="mailto:cal@solarireland.com"
                      className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                    >
                      cal@solarireland.com
                    </a>.
                  </p>

                  {/* ═══════════════════════════════════
                      12. CHANGES TO THIS POLICY
                      ═══════════════════════════════════ */}
                  <SectionHeading id="changes" icon={FileCheck}>
                    12. Changes to This Policy
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    We may update this Privacy Policy from time to time to reflect changes in our
                    practices, changes in applicable law, or for other operational reasons. The
                    &quot;Last updated&quot; date at the top of this page will always reflect the most
                    recent revision.
                  </p>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    When we make material changes, we will notify you by updating the date at the top
                    of this policy and, where appropriate, by posting a notice on our website or
                    sending you an email. We encourage you to review this page periodically to stay
                    informed about how we protect your information.
                  </p>

                  {/* ═══════════════════════════════════
                      13. CONTACT US
                      ═══════════════════════════════════ */}
                  <SectionHeading id="contact" icon={Mail}>
                    13. Contact Us
                  </SectionHeading>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    If you have any questions, concerns, or requests about this Privacy Policy or
                    how we handle your personal data, please do not hesitate to contact us:
                  </p>

                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider">Email</p>
                        <a
                          href="mailto:cal@solarireland.com"
                          className="text-sm text-gray-300 hover:text-amber-400 transition-colors font-medium"
                        >
                          cal@solarireland.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="w-9 h-9 rounded-lg bg-green-400/10 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider">Phone</p>
                        <a
                          href="tel:+353873958424"
                          className="text-sm text-gray-300 hover:text-green-400 transition-colors font-medium"
                        >
                          +353 87 395 8424
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="w-9 h-9 rounded-lg bg-sky-400/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-sky-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider">Address</p>
                        <p className="text-sm text-gray-300 font-medium">Dublin, Ireland</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-2">
                    For data protection matters, you can also contact the{' '}
                    <span className="text-gray-300 font-medium">Data Protection Commission (DPC)</span>:
                  </p>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="w-9 h-9 rounded-lg bg-violet-400/10 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 font-medium">Data Protection Commission</p>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                        21 Fitzwilliam Square South, Dublin 2, D02 RD28, Ireland
                      </p>
                      <a
                        href="https://www.dataprotection.ie"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-violet-400 hover:text-violet-300 transition-colors mt-1 inline-flex items-center gap-1"
                      >
                        www.dataprotection.ie
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
