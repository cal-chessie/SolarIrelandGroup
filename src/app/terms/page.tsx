'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import {
  FileText,
  Mail,
  Phone,
  Clock,
  Shield,
  Wrench,
  Receipt,
  Award,
  Truck,
  CreditCard,
  Lock,
  UserCheck,
  AlertTriangle,
  XCircle,
  Scale,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Zap,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';


function Subsection({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-base sm:text-lg font-semibold text-gray-200 mt-6 mb-2">
      {children}
    </h3>
  );
}


function CollapsibleSection({
  id,
  number,
  icon: Icon,
  title,
  children,
  defaultOpen = false,
}: {
  id: string;
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      id={id}
      className="scroll-mt-24 border-b border-white/[0.04] last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 py-5 text-left group cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 group-hover:bg-amber-400/15 transition-colors">
          <Icon className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-mono text-gray-600 mr-2">{number}</span>
          <span className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400/90 transition-colors">
            {title}
          </span>
        </div>
        <div className="shrink-0 w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-400 ease-out ${
          isOpen ? 'max-h-[5000px] opacity-100 pb-8' : 'max-h-0 opacity-0'
        }`}
        style={{ transitionProperty: 'max-height, opacity', transitionDuration: isOpen ? '500ms' : '300ms' }}
      >
        <div className="pl-12 pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}


function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-amber-400/90 text-black flex items-center justify-center shadow-lg shadow-amber-400/20 hover:bg-amber-400 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer print:hidden"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}


const TOC_SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'services', label: 'Our Services' },
  { id: 'quotes', label: 'Quotes and Pricing' },
  { id: 'seai-grants', label: 'SEAI Grant Terms' },
  { id: 'installation', label: 'Installation Process' },
  { id: 'payment', label: 'Payment Terms' },
  { id: 'warranty', label: 'Warranty and Guarantees' },
  { id: 'responsibilities', label: 'Customer Responsibilities' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'cancellation', label: 'Cancellation and Refund' },
  { id: 'disputes', label: 'Dispute Resolution' },
  { id: 'changes', label: 'Changes to Terms' },
  { id: 'contact', label: 'Contact Information' },
];

function TableOfContents() {
  const [active, setActive] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [readSections, setReadSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(e.target.id);
            setReadSections((prev) => new Set(prev).add(e.target.id));
          }
        });
      },
      { threshold: 0.2, rootMargin: '-80px 0px -50% 0px' }
    );

    TOC_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileOpen(false);
    }
  };

  const progress = Math.round((readSections.size / TOC_SECTIONS.length) * 100);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden sticky top-20 z-20 w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-8 transition-colors hover:bg-white/[0.06] cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-gray-300">Table of Contents</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">{progress}% read</span>
          <ChevronRight
            className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${mobileOpen ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      <nav
        className={`lg:sticky lg:top-20 transition-all duration-300 print:hidden ${
          mobileOpen
            ? 'max-h-[600px] opacity-100 mb-8'
            : 'max-h-0 lg:max-h-none opacity-0 lg:opacity-100 overflow-hidden lg:overflow-visible mb-0'
        }`}
        aria-label="Table of Contents"
      >
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 lg:p-6">
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                Reading Progress
              </h3>
              <span className="text-xs font-mono text-amber-400">{progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="space-y-0.5">
            {TOC_SECTIONS.map((section) => {
              const isActive = active === section.id;
              const isRead = readSections.has(section.id);
              return (
                <li key={section.id}>
                  <button
                    onClick={() => handleClick(section.id)}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-amber-400/10 text-amber-400 font-medium'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-amber-400" />
                    )}
                    {isRead && !isActive ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0 text-green-400/60" />
                    ) : (
                      <div className={`w-3 h-3 rounded-full shrink-0 ${isActive ? 'bg-amber-400' : 'bg-white/[0.08]'}`} />
                    )}
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


function TermsFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs = [
    {
      q: 'Can I cancel my installation after paying the deposit?',
      a: 'You have a 14-day cooling-off period under the European Communities (Cancellation of Contracts Concluded Away from Business Premises) Regulations 2013, starting from the date you sign the contract. During this period, you can cancel for any reason and receive a full refund of your deposit. After the cooling-off period, cancellation fees may apply depending on the stage of your project.',
    },
    {
      q: 'What happens if my SEAI grant application is declined?',
      a: 'If your grant application is declined through no fault of Solar Ireland (e.g., you do not meet the eligibility criteria, your property fails BER requirements, or you previously received a grant for the same measure), you remain liable for the full contract price. We will assist you in understanding the reason for the decline and exploring alternative options.',
    },
    {
      q: 'How long does the installation process take?',
      a: 'Most residential solar PV installations are completed within 1 to 2 working days. Battery storage installations may take an additional day. The overall timeline from deposit to installation is typically 4 to 8 weeks, depending on SEAI grant processing, ESB network connection notification, scheduling, and weather conditions. We will keep you informed of expected dates throughout the process.',
    },
    {
      q: 'Do I need planning permission for solar panels?',
      a: 'In most cases, no. Solar PV panels installed on domestic dwellings are generally exempt from planning permission under the Planning and Development Regulations 2001-2022, provided they do not exceed certain size limits and are not installed on protected structures. We will advise you during the survey if there are any planning considerations specific to your property. You remain responsible for obtaining any required planning permission.',
    },
    {
      q: 'What does the workmanship warranty cover?',
      a: 'Our 5-year workmanship warranty covers defects in the installation of your solar PV system caused by poor workmanship or faulty materials supplied by us. This includes roof mounting defects, wiring faults, inverter installation issues, and commissioning errors. It does not cover damage caused by third parties, Acts of God, normal wear and tear, or failure to carry out recommended maintenance.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept bank transfer, debit card, and credit card payments. We also accept SEAI grant payments made directly to us where applicable. Payment milestones are outlined in your individual contract. All deposits and progress payments are protected under Irish consumer law.',
    },
  ];

  return (
    <div className="space-y-2">
      {faqs.map((faq) => {
        const isOpen = openId === faq.q;
        return (
          <div
            key={faq.q}
            className="rounded-xl border border-white/[0.04] overflow-hidden"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : faq.q)}
              className="w-full flex items-center justify-between gap-4 p-4 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-medium text-gray-300">{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


/* ─── Section Content Components ─── */

function TermsContentIntro() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        Solar Ireland (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a SEAI-registered solar panel
        installation company operating across all 32 counties of Ireland. These Terms and Conditions
        (&quot;Terms&quot;) govern your use of our website{' '}
        <span className="text-amber-400 font-medium">solarirelandgroup.ie</span> and the provision of all
        solar PV installation, battery storage, maintenance, and related services by Solar Ireland.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        By requesting a quote, booking a survey, engaging our services, or continuing to use our website,
        you confirm that you have read, understood, and agree to be bound by these Terms. If you do not
        agree with any part of these Terms, you must not use our services or website.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        These Terms constitute a legally binding contract between you (&quot;Customer&quot;) and Solar Ireland
        once you sign a proposal or contract for installation services. They are governed by and construed
        in accordance with the laws of Ireland and are subject to the exclusive jurisdiction of the Irish
        courts. Nothing in these Terms affects your statutory rights as a consumer under Irish and European
        Union law, including the Consumer Rights Act 2022, the Sale of Goods and Supply of Services Act 1980,
        and the European Communities (Cancellation of Contracts Concluded Away from Business Premises)
        Regulations 2013.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        We may update these Terms from time to time. The version of these Terms applicable to your
        installation will be the version in effect on the date you sign your contract with us. Any
        subsequent changes to these Terms will not retrospectively alter the terms of an already-signed
        installation contract unless we both agree to such changes in writing.
      </p>
    </>
  );
}


function TermsContentServices() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        Solar Ireland provides a comprehensive range of solar energy services for residential and
        commercial properties throughout Ireland. Our services are delivered by qualified professionals
        in compliance with all relevant Irish and EU standards, regulations, and best practices.
      </p>
      <div className="grid gap-3 mb-6">
        {[
          {
            title: 'Solar PV Panel Installation',
            desc: 'Design, supply, and professional installation of photovoltaic (PV) solar panel systems for residential and commercial properties. All installations are carried out by RECI-registered electricians and comply with I.S. EN 62446, I.S. 10101, and NSAI standards. Systems include panels, inverters, mounting systems, wiring, monitoring equipment, and all necessary safety devices.',
          },
          {
            title: 'Battery Energy Storage Systems',
            desc: 'Supply and installation of lithium-ion battery storage solutions (e.g., Tesla Powerwall, Enphase, Huawei, or equivalent) to store excess solar energy for use during periods of low generation or high demand. Battery systems are integrated with your solar PV system and configured for optimal charge/discharge cycles.',
          },
          {
            title: 'Solar Panel Maintenance and Servicing',
            desc: 'Periodic inspection, cleaning, testing, and servicing of existing solar PV installations to ensure optimal performance and safety. Maintenance services include panel cleaning, inverter health checks, electrical testing, mounting system inspection, performance monitoring, and the identification and repair of any faults or defects.',
          },
          {
            title: 'SEAI Grant Application Assistance',
            desc: 'Guidance and administrative support with applications for grants under the SEAI Solar PV Scheme and the SEAI Battery Storage Scheme. We assist with eligibility assessment, application preparation, BER assessment coordination, and documentation submission. Grant terms and conditions are set by SEAI and are subject to change.',
          },
          {
            title: 'Energy Bill Analysis and System Sizing',
            desc: 'Analysis of your electricity consumption patterns, meter data, and energy bills to determine the optimal solar PV system size and configuration for your property. This includes annual yield projections, payback calculations, and recommendations for battery storage where appropriate.',
          },
          {
            title: 'ESB Network Connection Support',
            desc: 'Submission of NC6 grid connection notifications to ESB Networks, registration for the Clean Export Guarantee (CEG) tariff, and coordination of smart meter installation where required. We manage the administrative process on your behalf to ensure your system is properly connected and registered.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] transition-colors"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-200">{item.title}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-gray-400 leading-relaxed mb-4">
        All services are subject to a formal site survey and individual contract. The specific scope of
        work, equipment specifications, timelines, and pricing for your installation will be set out in
        your personalised proposal and contract, which will incorporate these Terms by reference.
      </p>
    </>
  );
}


function TermsContentQuotes() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        We provide transparent and detailed quotes for all our services. Understanding the nature of our
        quotes is important before entering into a contract with us.
      </p>

      <Subsection>Estimates vs. Fixed-Price Quotes</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        An initial estimate provided via our website, WhatsApp, email, or over the phone is indicative
        only and is based on the information you have provided to us about your property and energy usage.
        Estimates are not binding and may change following a physical site survey. A formal, fixed-price
        quote will only be issued after our qualified surveyor has visited your property, assessed the
        roof structure, electrical system, and any other relevant factors.
      </p>

      <Subsection>Quote Validity Period</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        Formal quotes are valid for 30 calendar days from the date of issue, unless otherwise stated in
        writing. After this period, prices may be revised to reflect changes in equipment costs, SEAI
        grant amounts, regulatory requirements, or market conditions. We will always inform you of any
        price changes before proceeding.
      </p>

      <Subsection>Deposit Terms</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        A deposit is required to confirm your booking and secure your installation slot. The deposit
        amount and payment terms will be specified in your contract. Your deposit is held in accordance
        with the Consumer Rights Act 2022 and is fully refundable during the 14-day cooling-off period.
        The deposit may be used to cover cancellation fees if you cancel after the cooling-off period
        and work has commenced or materials have been ordered.
      </p>

      <div className="p-5 rounded-xl bg-amber-400/5 border border-amber-400/15 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Receipt className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-medium text-amber-400">
            What&apos;s Included in Your Quote
          </p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Every formal quote from Solar Ireland includes: all solar panels, inverter, mounting hardware,
          wiring, monitoring equipment, scaffolding, labour, ESB NC6 notification, SEAI grant application
          assistance, BER assessment (where applicable), system commissioning, and handover documentation.
          There are no hidden charges. Any additional work required due to unforeseen circumstances (e.g.,
          structural roof repairs, electrical rewiring) will be quoted separately and require your written
          approval before proceeding.
        </p>
      </div>
    </>
  );
}


function TermsContentSEAI() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        The Sustainable Energy Authority of Ireland (SEAI) offers grants to support the installation of
        solar PV systems and battery storage in Irish homes. We assist our customers with SEAI grant
        applications as part of our service. The following terms apply to grant-related matters:
      </p>

      <Subsection>Grant Conditions</Subsection>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'SEAI grants are administered by SEAI and are subject to their own terms and conditions, eligibility criteria, and availability, which may change at any time without notice from Solar Ireland.',
          'Grant amounts are not guaranteed until SEAI formally approves your application and issues a grant offer letter. We provide guidance based on current scheme rules but cannot guarantee approval.',
          'Eligibility for SEAI grants depends on factors including your property type, BER rating, MPRN, and whether you have previously received a grant for the same measure under the same or a previous scheme.',
          'Grant payments may be made directly to Solar Ireland on your behalf or to you directly, depending on the scheme rules and your preference. Payment timing is determined by SEAI.',
          'Solar Ireland is not a party to the grant agreement between you and SEAI. Any disputes regarding grant eligibility, amounts, or payment must be resolved directly with SEAI.',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <Subsection>Customer Responsibilities</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        You are responsible for providing accurate and complete information for your SEAI grant application,
        including your property&apos;s MPRN, BER rating details, and any other documentation required by SEAI.
        You must not make false or misleading statements in your application. If your circumstances change
        after submitting your application (e.g., you carry out other energy upgrades), you must inform
        SEAI directly.
      </p>

      <Subsection>Grant Declined or Withdrawn</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        If your SEAI grant application is declined, withdrawn, or the grant scheme is closed or suspended
        by SEAI, the following applies:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'If the decline is due to factors within your control (e.g., inaccurate information, ineligibility), you remain liable for the full contract price as quoted.',
          'If the decline is due to factors within our control (e.g., our error in the application, failure to submit required documentation), we will work with you to resolve the issue and, if necessary, adjust the contract price accordingly.',
          'If the decline is due to changes in SEAI scheme rules after you have signed the contract, we will discuss the impact with you and offer options including proceeding at the revised price, postponing the installation, or cancelling the contract with a full refund.',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <div className="p-5 rounded-xl bg-green-400/5 border border-green-400/15 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-green-400" />
          <p className="text-sm text-green-400 font-semibold">
            SEAI Grant Deduction
          </p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Where a SEAI grant is deducted from your contract price, the deduction is conditional upon SEAI
          approving and paying the grant. If the grant is not received for any reason, the deducted amount
          becomes payable by you as part of the final invoice. We will clearly indicate which elements of
          your quote are subject to grant deduction.
        </p>
      </div>
    </>
  );
}


function TermsContentInstallation() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        Our installation process is designed to be efficient, professional, and minimally disruptive to
        your daily life. The following terms outline what to expect and the responsibilities of both parties
        during the installation phase.
      </p>

      <Subsection>Timeline and Scheduling</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        Following acceptance of your quote and receipt of the deposit, we will schedule your installation
        at a mutually agreed date. We will provide you with an estimated installation date at the time of
        contract signing, but this date is indicative and may be adjusted due to factors including weather
        conditions, SEAI grant processing times, material supply chains, scaffolding availability, and
        the volume of ongoing installations. We will provide at least 5 working days&apos; notice of the
        confirmed installation date and will keep you informed of any changes.
      </p>

      <Subsection>Property Access</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        You agree to provide safe and unrestricted access to your property, roof space, loft area, consumer
        unit (fuse board), and any other areas required for the installation during the agreed working hours.
        This includes ensuring clear access routes for our team and scaffolding contractors, removing
        obstacles from the work area, and securing or removing any fragile items. If access is not
        available on the scheduled installation date, additional call-out charges may apply.
      </p>

      <Subsection>Scaffolding</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        Scaffolding is required for most rooftop installations and is included in your quoted price unless
        otherwise stated. Scaffolding will typically be erected 1 to 2 working days before the installation
        and removed within 5 working days after completion, weather permitting. You must ensure that the
        area where scaffolding is to be erected is clear and accessible. Scaffolding will be erected by our
        approved scaffolding sub-contractor, who is fully insured.
      </p>

      <Subsection>System Handover</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        Upon completion of the installation, we will:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'Conduct a full system commissioning test to ensure all components are operating correctly and safely.',
          'Provide you with a handover pack including system manuals, warranty certificates, electrical test certificates (IEC/EN 62446), and maintenance guidelines.',
          'Demonstrate how to use the inverter, monitoring system, and battery storage (if applicable).',
          'Submit the NC6 grid connection notification to ESB Networks on your behalf.',
          'Register your installation for the Clean Export Guarantee (CEG) tariff if you have a smart meter.',
          'Provide you with the documentation required for your SEAI grant payment claim.',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <p className="text-gray-400 leading-relaxed mb-4">
        Acceptance of the completed installation will be confirmed by your signature on the handover form.
        If you identify any issues during handover, these will be recorded and rectified within a reasonable
        timeframe. Once the handover form is signed, the installation is deemed accepted, subject to any
        recorded issues.
      </p>
    </>
  );
}


function TermsContentPayment() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        Payment terms for your installation are set out in your individual contract. The following
        outlines our standard payment structure, which may be varied by agreement in your specific contract.
      </p>

      <div className="grid gap-3 mb-6">
        {[
          {
            stage: 'Deposit',
            timing: 'Upon contract signing',
            desc: 'A deposit of the amount specified in your contract (typically 10-20% of the total) is payable upon signing the contract. This secures your installation slot and allows us to order materials. The deposit is fully refundable during the 14-day cooling-off period.',
          },
          {
            stage: 'Progress Payment',
            timing: 'On day of installation',
            desc: 'A progress payment is due on or before the day of installation, as specified in your contract. This covers the labour and materials required for the installation. In some cases, the deposit and progress payment may be combined into a single upfront payment.',
          },
          {
            stage: 'Final Payment',
            timing: 'Upon completion',
            desc: 'The balance of the contract price (after deposit, progress payment, and any SEAI grant deduction) is due upon satisfactory completion of the installation and system handover. Final payment is required within 14 days of the handover date unless otherwise agreed in writing.',
          },
          {
            stage: 'SEAI Grant Deduction',
            timing: 'Upon grant payment',
            desc: 'If your contract price includes a SEAI grant deduction, this amount will be deducted from your final payment once the grant has been approved and paid. If the grant has not been paid by the due date of your final invoice, the full contract price (without deduction) is payable, and a refund will be issued once the grant is received.',
          },
        ].map((item) => (
          <div
            key={item.stage}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-400/10 text-[10px] font-mono font-semibold text-amber-400 mt-0.5">
              {item.timing}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">{item.stage}</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Subsection>Late Payment</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        If payment is not received by the due date, we reserve the right to charge interest on the
        outstanding amount at the rate of 1.5% per month (or the maximum rate permitted under the
        Non-Payment of Debts (Interest) Act 1997, whichever is lower), calculated from the due date
        until the date of actual payment. We may also suspend any ongoing warranty or maintenance services
        until outstanding payments are received. We will provide written notice before charging interest
        or suspending services.
      </p>

      <Subsection>Payment Methods</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        We accept bank transfer, debit card, and credit card payments. Bank transfer is our preferred
        method. Payment details will be provided on your invoice. We do not accept cash payments in
        excess of the limits set out in the Proceeds of Crime (Money Laundering and Terrorist Financing)
        Act 2010, as amended.
      </p>
    </>
  );
}


function TermsContentWarranty() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        We are committed to the quality and longevity of our installations. All warranties are provided
        in addition to your statutory rights under the Sale of Goods and Supply of Services Act 1980 and
        the Consumer Rights Act 2022, and do not limit those rights in any way.
      </p>

      <Subsection>Manufacturer Warranties</Subsection>
      <div className="grid gap-3 mb-6">
        {[
          {
            item: 'Solar Panels',
            period: '25 Years',
            desc: 'Linear performance warranty guaranteeing a minimum of 80-85% of nominal power output after 25 years, depending on the panel manufacturer. Product warranty against manufacturing defects is typically 12-25 years.',
          },
          {
            item: 'Inverter',
            period: '10 Years',
            desc: 'Manufacturer warranty covering defects in materials and workmanship. Extended warranty options of up to 20-25 years may be available at additional cost depending on the inverter model.',
          },
          {
            item: 'Battery Storage',
            period: '10 Years',
            desc: 'End-of-warranty capacity guarantee (typically 70-80% of original capacity) and product warranty against manufacturing defects. Specific terms vary by manufacturer.',
          },
        ].map((item) => (
          <div
            key={item.item}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="shrink-0 px-2.5 py-1 rounded-lg bg-white/[0.04] text-xs font-mono font-semibold text-gray-300 min-w-[90px] text-center">
              {item.period}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">{item.item}</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Subsection>Workmanship Warranty</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        Solar Ireland provides a 5-year workmanship warranty on all installations. This covers defects
        in the installation of your solar PV system caused by poor workmanship, faulty materials supplied
        by us, or failure to comply with relevant standards (I.S. EN 62446, I.S. 10101, and NSAI standards).
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        Our workmanship warranty covers the following:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'Roof mounting system defects, including leaks caused by our installation',
          'Electrical wiring faults, including DC and AC cabling',
          'Inverter installation and commissioning errors',
          'Battery storage system installation defects',
          'Monitoring system setup and connectivity issues',
          'Faults in any workmanship that cause the system to underperform by more than 10% below the projected annual yield, excluding external factors such as shading, weather, or equipment degradation within manufacturer tolerances',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <Subsection>What Is Not Covered</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        The following are not covered by our workmanship warranty:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'Damage caused by third parties, including other contractors working on your property',
          'Damage caused by Acts of God (storm, flood, lightning, fire, subsidence) unless covered by manufacturer warranty',
          'Normal wear and tear, gradual degradation of solar panels and inverters within manufacturer tolerances',
          'Failure to carry out recommended maintenance, including regular panel cleaning',
          'Damage caused by animals, birds, or insects',
          'Faults arising from modifications or repairs carried out by persons not authorised by Solar Ireland',
          'Issues caused by your electricity supplier, ESB Networks, or grid faults',
          'Cosmetic imperfections that do not affect system performance or safety',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <div className="p-5 rounded-xl bg-green-400/5 border border-green-400/15 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-green-400" />
          <p className="text-sm text-green-400 font-semibold">
            Your Statutory Rights Are Not Affected
          </p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          These warranties are provided in addition to your rights under the Sale of Goods and Supply of
          Services Act 1980 and the Consumer Rights Act 2022. If the goods or services we provide are not
          of satisfactory quality, fit for purpose, or as described, you may be entitled to a repair,
          replacement, refund, or price reduction, regardless of the warranty terms stated here.
        </p>
      </div>
    </>
  );
}


function TermsContentResponsibilities() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        To ensure a smooth installation process and the ongoing safe and efficient operation of your solar
        PV system, you agree to the following responsibilities:
      </p>

      <Subsection>Property Access</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        You must provide safe, clear, and unrestricted access to your property, roof space, loft area,
        consumer unit (fuse board), meter cupboard, and any other areas required for the installation
        and any subsequent warranty or maintenance visits. If access is not available when required, we
        reserve the right to reschedule the work and charge additional call-out fees.
      </p>

      <Subsection>Accuracy of Information</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        You warrant that all information you provide to us is accurate, complete, and up to date. This
        includes your contact details, property ownership or tenancy status, roof construction details,
        electrical system specifications, BER rating, MPRN, and any other information relevant to the
        installation or grant application. If any information is found to be materially inaccurate,
        we reserve the right to revise the contract price or, in serious cases, terminate the contract.
      </p>

      <Subsection>Insurance Notification</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        You are responsible for notifying your buildings insurance provider of the solar PV installation
        on your property. Most insurers do not increase premiums for solar panel installations, but you
        must check your policy terms and inform your insurer as required. Solar Ireland maintains full
          public liability insurance and employer&apos;s liability insurance for the duration of all works
        carried out on your property.
      </p>

      <Subsection>Planning Permission</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        While solar PV installations on domestic dwellings are generally exempt from planning permission
        under the Planning and Development Regulations 2001-2022, certain exceptions apply (e.g., protected
        structures, Article 40 conservation areas, specific size limits). You are responsible for obtaining
        any required planning permission or other consents. We will advise you during the survey if we
        believe planning permission may be required, but this advice is not a substitute for professional
        planning advice or a formal determination from your local planning authority.
      </p>

      <Subsection>Ongoing Maintenance</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        To maintain the validity of your workmanship warranty and ensure optimal system performance, you
        should carry out or arrange periodic maintenance in accordance with the guidelines provided in
        your handover pack. This typically includes annual visual inspections, periodic panel cleaning
        (at least once per year), and monitoring system output for any significant deviations from expected
        performance.
      </p>
    </>
  );
}


function TermsContentLiability() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        The following provisions limit our liability in connection with our services. These limitations
        are subject to and do not affect your statutory rights as a consumer under Irish and EU law.
        Any clause that would exclude or limit liability for death or personal injury caused by our
        negligence is void and unenforceable.
      </p>

      <Subsection>Total Liability Cap</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        Subject to the exceptions below, our total aggregate liability to you in respect of any claim
        or series of related claims arising from or in connection with our services (whether in contract,
        tort, negligence, breach of statutory duty, or otherwise) shall not exceed the total contract
        price paid by you for the specific installation to which the claim relates. This cap applies to
        all losses, damages, costs, and expenses of any kind.
      </p>

      <Subsection>Exclusion of Consequential Loss</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
        consequential, special, or punitive damages, including but not limited to loss of profits, loss
        of revenue, loss of data, loss of business opportunity, loss of goodwill, or economic loss,
        arising from or in connection with our services. This exclusion applies regardless of whether we
        were advised of the possibility of such losses.
      </p>

      <Subsection>Force Majeure</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        We shall not be liable for any delay or failure to perform our obligations where such delay or
        failure is caused by circumstances beyond our reasonable control, including but not limited to:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'Extreme weather conditions (storms, flooding, snow, ice) that prevent safe working',
          'Pandemics, epidemics, or government-imposed restrictions on travel or work',
          'Supply chain disruptions, material shortages, or manufacturing delays beyond our control',
          'Government actions, regulatory changes, or changes to SEAI grant schemes',
          'Civil unrest, industrial action, or transport disruptions',
          'Power outages, telecommunications failures, or ESB grid issues',
          'Fire, explosion, or other emergencies at our premises or your property',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <p className="text-gray-400 leading-relaxed mb-4">
        If a force majeure event continues for more than 60 days, either party may terminate the contract
        by giving written notice. In such cases, we will refund any payments made for work not yet
        completed, less the reasonable costs of any materials already ordered or work already performed.
      </p>

      <div className="p-5 rounded-xl bg-amber-400/5 border border-amber-400/15 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-medium text-amber-400">
            Important: Your Statutory Rights
          </p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Nothing in these Terms excludes or limits our liability for death or personal injury caused by
          our negligence, for fraud or fraudulent misrepresentation, or for any other liability that
          cannot be excluded or limited by law. Your rights under the Consumer Rights Act 2022, the Sale
          of Goods and Supply of Services Act 1980, and the Building Control Acts remain fully enforceable.
        </p>
      </div>
    </>
  );
}


function TermsContentCancellation() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        We understand that circumstances may change and you may need to cancel your installation. The
        following cancellation terms apply, in addition to your statutory rights.
      </p>

      <Subsection>Cooling-Off Period (14 Days)</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        Under the European Communities (Cancellation of Contracts Concluded Away from Business Premises)
        Regulations 2013, you have a 14-day cooling-off period starting from the date you sign the
        installation contract. During this period, you may cancel the contract for any reason without
        giving a cause and without penalty. You will receive a full refund of any deposit or payment
        made within 14 days of us receiving your cancellation notice.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        To exercise your right to cancel, you must send written notice to{' '}
        <a
          href="mailto:sales@solarirelandgroup.ie"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
        >
          sales@solarirelandgroup.ie
        </a>{' '}
        or by registered post to Solar Ireland, [Business Address], Ireland. The notice must clearly
        state your intention to cancel and include your name, address, and contract reference number.
      </p>

      <Subsection>Cancellation After the Cooling-Off Period</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        If you wish to cancel after the 14-day cooling-off period, the following cancellation fees may
        apply depending on the stage of your project:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          {
            stage: 'Before materials ordered',
            fee: 'Full deposit refund minus €200 admin fee',
            desc: 'If we have not yet ordered materials or engaged subcontractors, your deposit will be refunded in full less a €200 administrative fee to cover survey and quotation costs.',
          },
          {
            stage: 'After materials ordered',
            fee: 'Deposit retained, plus cost of materials',
            desc: 'If materials have been ordered but not yet delivered to your property, your deposit may be retained and you may be liable for the cost of materials already ordered and any restocking charges from our suppliers.',
          },
          {
            stage: 'During or after installation',
            fee: 'Full contract price payable',
            desc: 'If cancellation occurs during or after the installation has commenced, you will be liable for the full contract price. Any work completed or materials delivered remain your property and must be paid for in full.',
          },
        ].map((item) => (
          <div
            key={item.stage}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
            <div>
              <p className="text-sm font-medium text-gray-200">{item.stage}</p>
              <p className="text-xs font-mono text-amber-400 mt-0.5">{item.fee}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Subsection>Cancellation by Solar Ireland</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        We reserve the right to cancel your installation contract in the following circumstances:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'You fail to make payment in accordance with the agreed payment schedule after receiving written notice and a reasonable period to remedy the default.',
          'Your property is found to be unsuitable for installation following the site survey (e.g., structural issues, electrical system incompatibility, or planning constraints that cannot be resolved).',
          'You fail to provide the necessary access, information, or documentation required to proceed with the installation.',
          'Continuation of the installation would breach any applicable law, regulation, or industry standard.',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <p className="text-gray-400 leading-relaxed mb-4">
        If we cancel the contract for any reason other than your breach, we will refund all payments
        made by you within 14 days of the cancellation date.
      </p>
    </>
  );
}


function TermsContentDisputes() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        We are committed to resolving any disputes with our customers fairly, promptly, and without
        unnecessary formality or expense. The following dispute resolution process applies to all
        disputes arising from or in connection with these Terms or our services.
      </p>

      <Subsection>Informal Resolution</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        If you have a complaint or dispute, please contact us in the first instance by email at{' '}
        <a
          href="mailto:sales@solarirelandgroup.ie"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
        >
          sales@solarirelandgroup.ie
        </a>{' '}
        or by phone at [Phone Number]. We aim to acknowledge all complaints within 2 working days and
        provide a substantive response within 10 working days. Many disputes can be resolved quickly
        through direct communication, and we will always try to find a fair solution.
      </p>

      <Subsection>Mediation</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        If informal resolution is unsuccessful, either party may propose mediation. Mediation is a
        voluntary, confidential process in which an independent mediator helps both parties reach a
        mutually acceptable resolution. We will cooperate fully with any reasonable request for mediation
        and share equally the cost of the mediator. The mediation process does not prevent either party
        from pursuing other legal remedies if mediation is unsuccessful.
      </p>

      <Subsection>Governing Law</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        These Terms and any disputes arising from them are governed by the laws of Ireland. Both parties
        irrevocably submit to the exclusive jurisdiction of the courts of Ireland. Any dispute must be
        brought before the Irish courts and may not be litigated in any other jurisdiction, except where
        mandatory consumer protection laws (such as the Consumer Rights Act 2022) provide otherwise.
      </p>

      <Subsection>Consumer Rights</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        Nothing in these Terms affects your right to refer a dispute to the Small Claims Procedure of the
        District Court for claims up to the relevant monetary limit (currently €2,000). You may also
        seek assistance from the Competition and Consumer Protection Commission (CCPC) at{' '}
        <span className="text-gray-300">ccpc.ie</span> or by calling +353 1 402 5500. For disputes
        relating to goods or services purchased online, you may use the European Online Dispute Resolution
        (ODR) platform at <span className="text-gray-300">ec.europa.eu/consumers/odr</span>.
      </p>
    </>
  );
}


function TermsContentChanges() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        Solar Ireland reserves the right to modify these Terms at any time. Changes may be made to
        reflect changes in our business practices, changes in applicable law or regulation, the
        introduction of new services, or for other operational reasons.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        When we make changes to these Terms, we will update the &quot;Last updated&quot; date at the top
        of this page. For material changes, we may also display a notice on our website for a period
        of no less than 30 days. We will not make retrospective changes to Terms that have already
        been incorporated into a signed installation contract.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        Your continued use of our website after changes are posted constitutes your acceptance of the
        revised Terms. However, for installation contracts, the version of these Terms in effect at the
        time of contract signing will govern that contract unless both parties agree in writing to the
        revised terms.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        We encourage you to review these Terms periodically and to contact us if you have any questions
        about changes. You can always access the latest version of these Terms at{' '}
        <span className="text-amber-400 font-medium">solarirelandgroup.ie/terms</span>.
      </p>
    </>
  );
}


function TermsContentContact() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        If you have any questions, concerns, or complaints about these Terms or our services, we would
        love to hear from you. Our team is always happy to help and will respond promptly to all enquiries.
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { icon: Mail, label: 'Email', value: 'sales@solarirelandgroup.ie', href: 'mailto:sales@solarirelandgroup.ie' },
          { icon: Phone, label: 'Phone', value: '[Phone Number]', href: 'tel:' },
          { icon: Zap, label: 'Website', value: 'solarirelandgroup.ie', href: 'https://solarirelandgroup.ie' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600">{item.label}</p>
                <p className="text-sm font-medium text-gray-300 group-hover:text-amber-400 transition-colors">
                  {item.value}
                </p>
              </div>
            </a>
          );
        })}
      </div>
      <p className="text-gray-400 leading-relaxed mb-4">
        For formal complaints or dispute resolution, please contact us in writing at Solar Ireland,
        [Business Address], Ireland. We aim to acknowledge all formal complaints within 2 working days
        and provide a substantive response within 10 working days. If your complaint is complex, we may
        take longer and will keep you informed of progress.
      </p>
    </>
  );
}


/* ─── Main Page Component ─── */

export default function TermsAndConditionsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16 print:pt-0">
        <header className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-400/[0.03] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-20 right-1/4 w-[300px] h-[200px] bg-blue-400/[0.02] rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-10 sm:pb-14 relative">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-400">
                Legal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Terms and Conditions
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed">
              The terms governing your solar PV installation, SEAI grants,
              warranties, and services provided by Solar Ireland.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: April 2026</span>
              </div>
              <span className="text-white/10 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Version 1.0</span>
              </div>
              <span className="text-white/10 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>~22 min read</span>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-600">
              <a href="/" className="hover:text-gray-400 transition-colors">Home</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-400">Terms and Conditions</span>
            </nav>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-10 sm:pb-14">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            <aside className="lg:w-64 shrink-0">
              <TableOfContents />
            </aside>

            <div className="flex-1 min-w-0">
              <div className="rounded-2xl bg-white/[0.015] border border-white/[0.05] p-6 sm:p-8 lg:p-10">
                <div className="space-y-0">
                  <CollapsibleSection
                    id="introduction"
                    number="01"
                    icon={Shield}
                    title="Introduction"
                    defaultOpen
                  >
                    <TermsContentIntro />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="services"
                    number="02"
                    icon={Wrench}
                    title="Our Services"
                  >
                    <TermsContentServices />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="quotes"
                    number="03"
                    icon={Receipt}
                    title="Quotes and Pricing"
                  >
                    <TermsContentQuotes />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="seai-grants"
                    number="04"
                    icon={Award}
                    title="SEAI Grant Terms"
                  >
                    <TermsContentSEAI />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="installation"
                    number="05"
                    icon={Truck}
                    title="Installation Process"
                  >
                    <TermsContentInstallation />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="payment"
                    number="06"
                    icon={CreditCard}
                    title="Payment Terms"
                  >
                    <TermsContentPayment />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="warranty"
                    number="07"
                    icon={Lock}
                    title="Warranty and Guarantees"
                  >
                    <TermsContentWarranty />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="responsibilities"
                    number="08"
                    icon={UserCheck}
                    title="Customer Responsibilities"
                  >
                    <TermsContentResponsibilities />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="liability"
                    number="09"
                    icon={AlertTriangle}
                    title="Limitation of Liability"
                  >
                    <TermsContentLiability />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="cancellation"
                    number="10"
                    icon={XCircle}
                    title="Cancellation and Refund"
                  >
                    <TermsContentCancellation />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="disputes"
                    number="11"
                    icon={Scale}
                    title="Dispute Resolution"
                  >
                    <TermsContentDisputes />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="changes"
                    number="12"
                    icon={RefreshCw}
                    title="Changes to Terms"
                  >
                    <TermsContentChanges />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="contact"
                    number="13"
                    icon={Mail}
                    title="Contact Information"
                  >
                    <TermsContentContact />
                  </CollapsibleSection>
                </div>
              </div>

              {mounted && (
                <div className="mt-10">
                  <div className="rounded-2xl bg-white/[0.015] border border-white/[0.05] p-6 sm:p-8 lg:p-10">
                    <div className="flex items-center gap-2 mb-6">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Frequently Asked Questions
                      </h2>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">
                      Quick answers to the most common questions about our terms.
                    </p>
                    <TermsFAQ />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppChat />
      <BackToTop />
    </div>
  );
}
