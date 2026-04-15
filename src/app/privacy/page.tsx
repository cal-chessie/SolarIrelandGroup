'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import {
  Shield,
  Mail,
  Phone,
  Clock,
  Lock,
  Eye,
  Server,
  Cookie,
  UserCheck,
  Database,
  FileCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  BookOpen,
  Heart,
  Download,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';


interface Section {
  id: string;
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: ReactNode;
}

function PrivacyContent() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        Solar Ireland (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a SEAI-registered solar panel
        installation company operating across all 32 counties of Ireland. We are committed to protecting
        your privacy and ensuring that any personal data we collect is processed lawfully, fairly, and
        transparently in accordance with the General Data Protection Regulation (GDPR) and the Data
        Protection Act 2018.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        This Privacy Policy explains what personal data we collect, why we collect it, how we use it,
        how long we keep it, and your rights in relation to your data. It applies to all interactions you
        have with us, including our website{' '}
        <span className="text-amber-400 font-medium">solarireland.org</span>, our county-specific landing
        pages, WhatsApp Business, email, phone calls, in-person surveys, and any other communication channels
        through which you share information with us.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        By using our services or providing us with your personal data, you acknowledge that you have read
        and agree to the collection and use of information in accordance with this policy. If you do not
        agree with the terms of this privacy policy, please do not provide us with your personal information
        and discontinue use of our services.
      </p>

      <Subsection>Personal Data You Provide Directly</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        When you request a quote, book a survey, or engage our services, we may collect the following
        personal information to provide you with an accurate and efficient service:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'Full name, email address, phone number, and postal address',
          'Property address and ESB Meter Point Reference Number (MPRN) for SEAI grant applications',
          'BER rating, property type, roof orientation, and construction details from site surveys',
          'Electricity usage data including uploaded bills, energy provider details, and consumption figures',
          'Payment information including bank details for grant refunds and invoicing',
          'Survey photographs, roof measurements, and system design specifications',
          'Communication records including emails, WhatsApp messages, and phone call notes',
          'Smart meter data shared with your consent for system optimisation',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <Subsection>Data Collected Automatically</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        When you visit our website, certain technical information is collected automatically through
        cookies and similar technologies to help us improve your experience and maintain site security:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'IP address (anonymised after 24 hours) and approximate geographic location at country level',
          'Browser type, version, language preference, and operating system',
          'Pages visited, time spent on each page, and navigation path through the site',
          'Referring website address and search engine keywords used to find us',
          'Device type, screen resolution, and whether the visit is from a mobile or desktop device',
          'Click patterns and interactions with forms, calculators, and tools on our website',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <Subsection>Sensitive Data</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        We do not routinely collect special category data (such as health data, racial or ethnic origin,
        religious beliefs, or political opinions). In rare cases where such data may be relevant to your
        installation (for example, if you mention a disability requiring specific accessibility
        accommodations), we will only process it with your explicit written consent and under strict
        confidentiality protocols.
      </p>

      <p className="text-gray-400 leading-relaxed mb-3">
        We use your personal data for specific, legitimate purposes. Here is a detailed breakdown of
        how your information is used across our business operations:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          {
            title: 'Providing Quotes & Solar Installation Services',
            desc: 'We use your contact details, property information, and energy usage data to prepare accurate solar installation quotes, conduct site surveys, design your system, schedule installation dates, and manage your project from initial enquiry through to commissioning and handover.',
          },
          {
            title: 'SEAI Grant Applications & Compliance',
            desc: 'Your property details, MPRN, and BER rating are submitted to the Sustainable Energy Authority of Ireland (SEAI) to process your grant application. We coordinate with ESB Networks for grid connection notifications and ensure all work complies with NSAI standards.',
          },
          {
            title: 'Post-Installation Support & Warranty',
            desc: 'We retain your installation records, system specifications, and contact details to provide ongoing warranty support, handle maintenance enquiries, and process any guarantee claims that may arise during the warranty period.',
          },
          {
            title: 'Marketing Communications (Consent-Based Only)',
            desc: 'With your explicit consent only, we may send you information about new services, seasonal promotions, solar energy news, or policy updates affecting your solar investment via email or WhatsApp. You can withdraw consent at any time using the unsubscribe link in any communication or by contacting us directly.',
          },
          {
            title: 'Service Improvement & Analytics',
            desc: 'We analyse anonymised website usage data, customer feedback, and service delivery metrics to improve our website experience, streamline our operations, develop new products, and enhance overall customer satisfaction.',
          },
          {
            title: 'Legal, Regulatory & Financial Compliance',
            desc: 'We process your data as necessary to comply with Irish tax law, financial regulations, SEAI reporting requirements, insurance obligations, health and safety standards, and to resolve disputes or enforce contractual terms.',
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

      <p className="text-gray-400 leading-relaxed mb-3">
        Under GDPR, every processing activity must have a valid legal basis. We process your personal data
        under one or more of the following legal grounds, depending on the specific purpose:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          {
            basis: 'Consent',
            article: 'Art. 6(1)(a)',
            desc: 'When you explicitly opt in — for example, ticking a box to receive marketing emails, agreeing to optional cookie categories, or consenting to smart meter data sharing. You can withdraw consent at any time without affecting the lawfulness of processing carried out before withdrawal.',
          },
          {
            basis: 'Contractual Necessity',
            article: 'Art. 6(1)(b)',
            desc: 'When processing is necessary to deliver the service you have requested — such as installing solar panels on your property, submitting a grant application on your behalf, or communicating with you about your active project. Without this data, we cannot provide our services.',
          },
          {
            basis: 'Legitimate Interest',
            article: 'Art. 6(1)(f)',
            desc: 'When processing serves a genuine business interest that does not override your rights and freedoms — such as website analytics, fraud prevention, service quality monitoring, and direct marketing to existing customers where you have not opted out. We conduct and document Legitimate Interest Assessments for all such processing activities.',
          },
          {
            basis: 'Legal Obligation',
            article: 'Art. 6(1)(c)',
            desc: 'When processing is required by law — such as retaining financial records for 7 years under Irish tax law, reporting to SEAI for grant compliance, responding to valid legal requests from authorities, or maintaining insurance documentation as required by our professional indemnity policies.',
          },
        ].map((item) => (
          <div
            key={item.basis}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="shrink-0 px-2 py-1 rounded-md bg-amber-400/10 text-[10px] font-mono font-semibold text-amber-400 mt-0.5">
              {item.article}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">{item.basis}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-gray-400 leading-relaxed mb-3">
        We treat your data with the utmost confidentiality. We may share your personal data with the
        following categories of third parties only when necessary to deliver our services or comply with
        legal obligations. We do not sell, rent, or trade your personal data for marketing purposes.
      </p>
      <div className="grid gap-3 mb-6">
        {[
          {
            name: 'SEAI (Sustainable Energy Authority of Ireland)',
            purpose: 'Processing your SEAI grant application, verifying our installer registration, and submitting compliance reports as required by the grant scheme terms and conditions.',
          },
          {
            name: 'ESB Networks',
            purpose: 'Submitting NC6 grid connection notifications, registering for the Clean Export Guarantee (CEG) tariff, and coordinating smart meter installation or data sharing with your consent.',
          },
          {
            name: 'Insurance Providers',
            purpose: 'Supporting public liability and professional indemnity insurance claims, providing installation documentation for policy compliance, and maintaining records as required by our insurers.',
          },
          {
            name: 'Subcontractors & Specialist Partners',
            purpose: 'Engaging RECI-registered electricians, scaffolding contractors, roofing specialists, and BER assessors who are contractually bound to process your data only for the specific installation task and to delete it upon completion.',
          },
          {
            name: 'Financial Institutions',
            purpose: 'Processing payments, issuing invoices, managing grant refund disbursements, and maintaining financial records as required by Irish tax law and Revenue Commissioners.',
          },
          {
            name: 'Legal & Regulatory Bodies',
            purpose: 'Responding to lawful requests from the Data Protection Commission, Revenue Commissioners, SEAI compliance teams, or other regulatory authorities with proper jurisdiction.',
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

      <div className="p-5 rounded-xl bg-green-400/5 border border-green-400/15 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-green-400" />
          <p className="text-sm text-green-400 font-semibold">
            We never sell your personal data — period.
          </p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Solar Ireland does not sell, rent, trade, or otherwise monetise your personal information.
          All third-party data sharing is strictly limited to what is necessary to deliver our solar
          installation services, comply with legal obligations, and protect your warranty. Every
          subcontractor and partner is bound by written data processing agreements that enforce GDPR
          compliance.
        </p>
      </div>

      <Subsection>Essential Cookies</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        These cookies are strictly necessary for the website to function and cannot be disabled.
        They are set in response to your actions, such as setting your privacy preferences or
        maintaining your session:
      </p>
      <div className="grid gap-2 mb-6">
        {[
          { name: 'solar_cookie_consent', desc: 'Stores your cookie preference (accept/reject). Expires after 12 months.' },
          { name: '__Secure-next-auth.session-token', desc: 'Maintains your secure browsing session. Expires when you close your browser.' },
          { name: 'XSRF-TOKEN', desc: 'Prevents cross-site request forgery attacks. Expires after 24 hours.' },
          { name: 'next-build-id', desc: 'Ensures you receive the latest version of the website. Session-based.' },
        ].map((item) => (
          <div key={item.name} className="flex items-start gap-2.5 text-sm text-gray-400 p-3 rounded-lg bg-white/[0.015]">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            <div>
              <span className="text-gray-300 font-mono text-xs">{item.name}</span>
              <span className="text-gray-600 mx-2">—</span>
              <span>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <Subsection>Analytics Cookies (Optional)</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        With your consent, we use Google Analytics 4 (GA4) to understand how visitors interact with
        our website. These cookies collect anonymised data including page views, session duration,
        device information, and navigation paths. We have configured GA4 to anonymise IP addresses,
        disable data sharing with Google for advertising purposes, and set data retention to 14 months.
        This helps us improve content, identify usability issues, and make our website better for everyone.
      </p>

      <Subsection>How We Handle Cookie Consent</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        When you first visit our website, a clear and unobtrusive cookie consent banner appears at the
        bottom of your screen. You are presented with two straightforward options: &quot;Accept All&quot; to
        enable essential and analytics cookies, or &quot;Reject Non-Essential&quot; to enable only essential
        cookies. Your choice is saved in the <code className="text-xs bg-white/[0.05] px-1.5 py-0.5 rounded text-gray-300">solar_cookie_consent</code> cookie and
        respected across all pages. You can update your preferences at any time through the cookie
        settings link in our website footer.
      </p>

      <Subsection>Managing Cookies in Your Browser</Subsection>
      <p className="text-gray-400 leading-relaxed mb-6">
        In addition to our consent mechanism, you can manage or delete cookies directly through your
        browser settings. Most modern browsers allow you to view, block, or delete individual cookies
        or all cookies at once. Please note that blocking essential cookies may prevent the website from
        functioning correctly. For detailed instructions on managing cookies, visit{' '}
        <span className="text-gray-300">www.allaboutcookies.org</span> or consult your browser&apos;s
        help documentation. If you use multiple devices or browsers, you will need to set your
        preferences on each one.
      </p>

      <p className="text-gray-400 leading-relaxed mb-3">
        Under GDPR, you have powerful rights over your personal data. We are committed to making
        it easy for you to exercise these rights. Here is a complete list of your rights and how
        to use them:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          {
            right: 'Right of Access (Article 15)',
            desc: 'You can request a complete copy of all personal data we hold about you, including information about how it was collected, who it has been shared with, how long it will be retained, and the logic behind any automated decisions. We will provide this within 30 days in a commonly used electronic format.',
          },
          {
            right: 'Right to Rectification (Article 16)',
            desc: 'If any personal data we hold about you is inaccurate, incomplete, or outdated, you can request corrections free of charge. Simply contact us with the correct information and we will update your records within 21 days and confirm the changes in writing.',
          },
          {
            right: 'Right to Erasure — "Right to be Forgotten" (Article 17)',
            desc: 'You can request deletion of your personal data where we no longer have a legal basis to retain it, where you withdraw consent, or where the data is no longer necessary for the purpose for which it was collected. We will comply unless there is a legal obligation to retain the data.',
          },
          {
            right: 'Right to Data Portability (Article 20)',
            desc: 'You can request your personal data in a structured, commonly used, machine-readable format (such as CSV, JSON, or XML) so you can transfer it to another service provider. This right applies to data you provided directly to us.',
          },
          {
            right: 'Right to Object (Article 21)',
            desc: 'You can object to processing based on legitimate interests at any time. We will stop processing your data unless we can demonstrate compelling legitimate grounds that override your interests, rights, and freedoms, or for the establishment, exercise, or defence of legal claims.',
          },
          {
            right: 'Right to Withdraw Consent (Article 7(3))',
            desc: 'Where processing is based on your consent (such as marketing emails or optional data sharing), you can withdraw consent at any time. Withdrawal does not affect the lawfulness of processing carried out before the withdrawal. You can unsubscribe using the link in any email or by contacting us.',
          },
          {
            right: 'Right to Restrict Processing (Article 18)',
            desc: 'You can request that we limit how we use your data in specific circumstances — for example, while you are contesting the accuracy of your data, while we assess whether we have a legitimate ground to object to erasure, or if you need the data for legal proceedings.',
          },
          {
            right: 'Right to Lodge a Complaint (Article 77)',
            desc: 'You have the right to lodge a complaint with the Data Protection Commission (DPC), Ireland&apos;s supervisory authority, if you believe that the processing of your personal data infringes GDPR. Contact the DPC at dataprotection.ie or call +353 21 431 0700. This right does not affect your ability to contact us directly first.',
          },
          {
            right: 'Rights Related to Automated Decision-Making (Article 22)',
            desc: 'You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or similarly significant effects. We do not currently use fully automated decision-making processes that significantly affect you.',
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

      <div className="p-5 rounded-xl bg-amber-400/5 border border-amber-400/15 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-medium text-amber-400">
            How to Exercise Your Rights
          </p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          To exercise any of your rights, contact our Data Protection Officer at{' '}
          <a
            href="mailto:cal@solarireland.org"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
          >
            cal@solarireland.org
          </a>{' '}
          or write to us at Solar Ireland, [Business Address], Ireland. We will acknowledge your request
          within 5 working days and respond substantively within 30 days. If your request is complex or
          involves a large volume of data, we may extend this by up to 60 days, in which case we will
          notify you within the initial 30-day period. We may ask for identification to verify your
          identity before processing your request.
        </p>
      </div>

      <p className="text-gray-400 leading-relaxed mb-3">
        We follow a data minimisation approach and retain your personal data only for as long as necessary
        to fulfil the specific purposes for which it was collected. Once a retention period expires, data
        is securely deleted or irreversibly anonymised. Here are our standard retention periods:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          {
            category: 'Financial & Tax Records',
            period: '7 years',
            reason: 'Required by Irish tax law (Taxes Consolidation Act 1997) and Revenue Commissioners for audit purposes.',
          },
          {
            category: 'Installation & Warranty Records',
            period: '10 years',
            reason: 'Product warranty coverage, insurance claims, BER compliance, and SEAI installer audit requirements.',
          },
          {
            category: 'Marketing Consent Records',
            period: '3 years',
            reason: 'Retained while consent is active. Automatically removed 3 years after last confirmed opt-in or interaction.',
          },
          {
            category: 'Website Analytics Data',
            period: '14 months',
            reason: 'Google Analytics 4 default retention for anonymised, aggregated analytics data.',
          },
          {
            category: 'Communication Records',
            period: '3 years',
            reason: 'Customer service quality assurance, dispute resolution, and regulatory compliance.',
          },
          {
            category: 'CCTV / Security Footage',
            period: '30 days',
            reason: 'Physical security at our premises. Automatically overwritten unless retained for a specific incident investigation.',
          },
          {
            category: 'Job Applicant Records',
            period: '12 months',
            reason: 'Retained for 12 months after the recruitment process concludes, then securely deleted.',
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
        When the retention period expires, personal data is securely deleted using industry-standard
        methods or irreversibly anonymised so that it can no longer be attributed to an identifiable
        individual. You may request earlier deletion by contacting us, subject to any legal or contractual
        obligations that require us to retain the data for a minimum period.
      </p>

      <p className="text-gray-400 leading-relaxed mb-3">
        We implement a comprehensive, multi-layered security programme to protect your personal data
        against unauthorised access, alteration, disclosure, or destruction. Our security measures
        are regularly reviewed and updated in line with industry best practices and emerging threats:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { title: 'Encryption in Transit', desc: 'All data transmitted through our website is protected by TLS 1.3 encryption. Our API endpoints enforce HTTPS-only connections and HSTS (HTTP Strict Transport Security) with a one-year max-age.' },
          { title: 'Encryption at Rest', desc: 'Sensitive data including payment details, ID documents, and personal information is encrypted using AES-256 encryption when stored on our servers and cloud infrastructure.' },
          { title: 'EU/EEA Data Residency', desc: 'All personal data is stored and processed on servers physically located within the European Union or European Economic Area. We do not transfer personal data outside the EU/EEA.' },
          { title: 'Access Controls', desc: 'Role-based access controls ensure that only authorised personnel who need your data to perform their job can access it. All access is logged and auditable. Administrative access requires multi-factor authentication.' },
          { title: 'Vulnerability Management', desc: 'We conduct regular penetration testing, vulnerability scanning, and code reviews. Critical security patches are applied within 72 hours of release. We maintain a responsible disclosure programme.' },
          { title: 'Staff Training', desc: 'All employees and contractors complete mandatory GDPR and data protection training upon joining and annually thereafter. Staff with access to personal data receive additional security awareness training.' },
          { title: 'Incident Response', desc: 'We maintain a documented data breach response plan. In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the Data Protection Commission within 72 hours and inform you directly without undue delay.' },
          { title: 'Third-Party Security', desc: 'All subcontractors and service providers who process personal data on our behalf are contractually required to maintain equivalent security standards. We conduct due diligence assessments before engaging any new data processor.' },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Lock className="w-4 h-4 text-green-400/60 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-200">{item.title}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-gray-400 leading-relaxed mb-6">
        While no system can guarantee 100% security, we are committed to maintaining the highest
        reasonably practicable standards of data protection. If you become aware of any potential
        security vulnerability or have concerns about the safety of your data, please contact us
        immediately at{' '}
        <a
          href="mailto:cal@solarireland.org"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
        >
          cal@solarireland.org
        </a>.
      </p>

      <p className="text-gray-400 leading-relaxed mb-3">
        Our website and services integrate with the following third-party platforms. Each is
        independently responsible for their own GDPR compliance and data protection practices.
        We have assessed these services and are satisfied that they maintain appropriate standards:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          {
            name: 'Google Analytics 4',
            purpose: 'Website usage analytics. Data is anonymised, IP addresses are masked, and data sharing for advertising is disabled. Processed in accordance with Google\'s Data Processing Amendment.',
            link: 'policies.google.com/privacy',
          },
          {
            name: 'WhatsApp Business (Meta)',
            purpose: 'Customer communication channel. Messages, phone numbers, and media shared via WhatsApp are processed by Meta in accordance with their data policy and EU Standard Contractual Clauses.',
            link: 'whatsapp.com/legal/privacy-policy',
          },
          {
            name: 'ESB Networks',
            purpose: 'Grid connection (NC6) notifications, Clean Export Guarantee registration, and smart meter integration.',
            link: 'esbnetworks.ie',
          },
          {
            name: 'SEAI',
            purpose: 'Grant applications (Solar PV and Battery), BER assessments, and installer registration and compliance reporting.',
            link: 'seai.ie',
          },
          {
            name: 'Vercel (Hosting)',
            purpose: 'Website hosting and content delivery. Data is stored within EU regions. SOC 2 Type II compliant.',
            link: 'vercel.com/legal/privacy-policy',
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
              <p className="text-xs text-gray-600 mt-1.5">
                Privacy policy: <span className="text-gray-500">{item.link}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-gray-400 leading-relaxed mb-6">
        We do not control the privacy practices of these third-party services and encourage you
        to review their individual privacy policies. If you have concerns about any third-party
        processing, please contact us and we will investigate and take appropriate action.
      </p>

      <p className="text-gray-400 leading-relaxed mb-4">
        Our website and services are exclusively directed at adults aged 18 and over. Solar Ireland
        provides residential and commercial solar panel installation services that require entering into
        legally binding contracts, which can only be done by adults. We do not knowingly collect,
        process, or store personal data from individuals under the age of 18.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        If we become aware, whether through our own monitoring or through a report from a parent,
        guardian, or other source, that we have inadvertently collected personal data from a person
        under 18, we will take immediate steps to securely delete that information from all of our
        systems, including backups, within 14 days. We will also review how the data was collected
        and implement measures to prevent recurrence.
      </p>
      <p className="text-gray-400 leading-relaxed mb-6">
        If you are a parent or guardian and believe your child has provided us with personal data,
        please contact us immediately at{' '}
        <a
          href="mailto:cal@solarireland.org"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
        >
          cal@solarireland.org
        </a>{' '}
        and we will take prompt action to remove the information.
      </p>

      <p className="text-gray-400 leading-relaxed mb-4">
        We may update this Privacy Policy from time to time to reflect changes in our business
        practices, changes in applicable data protection legislation or guidance, the introduction
        of new services or technologies, or for other operational reasons. We are committed to
        keeping you informed about how your data is protected.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        When we make material changes to this policy, we will notify you by updating the &quot;Last
        updated&quot; date at the top of this page and, where appropriate, by displaying a prominent
        notice on our website homepage for a period of no less than 30 days. For significant changes
        that affect how we use your personal data, we may also send you an email notification or
        WhatsApp message if you have provided us with contact details.
      </p>
      <p className="text-gray-400 leading-relaxed mb-6">
        We encourage you to review this Privacy Policy periodically to stay informed about how we
        collect, use, and protect your personal data. Your continued use of our services after any
        changes to this policy constitutes your acceptance of the updated terms.
      </p>

      <p className="text-gray-400 leading-relaxed mb-4">
        If you have any questions, concerns, or requests about this Privacy Policy or how we handle
        your personal data, we would love to hear from you. Our team is always happy to help and
        will respond promptly to all enquiries.
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { icon: Mail, label: 'Email', value: 'cal@solarireland.org', href: 'mailto:cal@solarireland.org' },
          { icon: Phone, label: 'Phone', value: '[Phone Number]', href: 'tel:' },
          { icon: ExternalLink, label: 'Website', value: 'solarireland.org', href: 'https://solarireland.org' },
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
        For data protection-specific enquiries or to exercise your GDPR rights, please contact our
        Data Protection Officer directly. We aim to acknowledge all data protection enquiries within
        5 working days and provide a substantive response within 30 days.
      </p>
    </>
  );
}


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
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use', label: 'How We Use Information' },
  { id: 'legal-basis', label: 'Legal Basis' },
  { id: 'data-sharing', label: 'Data Sharing' },
  { id: 'cookies', label: 'Cookies & Tracking' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'security', label: 'Security' },
  { id: 'third-party', label: 'Third-Party Services' },
  { id: 'childrens-privacy', label: "Children's Privacy" },
  { id: 'changes', label: 'Changes to Policy' },
  { id: 'contact', label: 'Contact Us' },
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


function KeyTakeaways() {
  const items = [
    {
      icon: Shield,
      text: 'Your data is protected by GDPR-compliant processes and AES-256 encryption',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      icon: Heart,
      text: 'We never sell, rent, or trade your personal data to anyone — ever',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      icon: UserCheck,
      text: 'You have 9 enforceable rights including access, erasure, and portability',
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
    },
    {
      icon: Lock,
      text: 'All data is stored within the EU/EEA and accessed only by authorised personnel',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.text}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{item.text}</p>
          </div>
        );
      })}
    </div>
  );
}


function PrivacyFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs = [
    {
      q: 'How do I request a copy of my personal data?',
      a: 'Simply email cal@solarireland.org with "Subject Access Request" in the subject line. Include your name and the email address or phone number you used when contacting us. We will verify your identity and provide all your data within 30 days in a readable electronic format, free of charge.',
    },
    {
      q: 'Can I get my data deleted?',
      a: 'Yes, in most cases. Under GDPR Article 17, you can request erasure of your personal data where we no longer need it, you withdraw consent, or you object to processing. However, we may need to retain certain records for legal compliance (e.g., tax records for 7 years). Contact us and we will explain what can and cannot be deleted.',
    },
    {
      q: 'Do you share my data with other companies for marketing?',
      a: 'Absolutely not. We never sell, rent, or share your personal data with third parties for their own marketing purposes. We only share data with partners directly involved in your solar installation (SEAI, ESB Networks, subcontractors) as described in Section 5 of this policy.',
    },
    {
      q: 'How long do you keep my data after my solar installation?',
      a: 'Installation and warranty records are retained for 10 years to cover product warranties, insurance requirements, and SEAI compliance. Financial records are kept for 7 years as required by Irish tax law. Communication records are retained for 3 years. You can request earlier deletion for data not subject to legal retention requirements.',
    },
    {
      q: 'Is my data stored in Ireland?',
      a: 'All personal data is stored and processed on servers physically located within the European Union or European Economic Area. We do not transfer personal data outside the EU/EEA. Our hosting provider (Vercel) operates EU-region data centres and maintains SOC 2 Type II compliance.',
    },
    {
      q: 'How do I opt out of marketing emails?',
      a: 'Every marketing email we send includes a clear unsubscribe link at the bottom. Clicking it will remove you from our marketing list within 24 hours. You can also email us directly, use the cookie settings in our footer, or tell us on WhatsApp. Opting out of marketing does not affect your solar installation or warranty.',
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


export default function PrivacyPolicyPage() {
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
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: April 2026</span>
              </div>
              <span className="text-white/10 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Version 2.1</span>
              </div>
              <span className="text-white/10 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>~18 min read</span>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-600">
              <a href="/" className="hover:text-gray-400 transition-colors">Home</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-400">Privacy Policy</span>
            </nav>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14">
          <div className="mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500 mb-1">
              Key Takeaways
            </h2>
          </div>
          <KeyTakeaways />
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
                    <PrivacyContentIntro />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="information-we-collect"
                    number="02"
                    icon={Database}
                    title="Information We Collect"
                  >
                    <PrivacyContentSection2 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="how-we-use"
                    number="03"
                    icon={Eye}
                    title="How We Use Your Information"
                  >
                    <PrivacyContentSection3 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="legal-basis"
                    number="04"
                    icon={FileCheck}
                    title="Legal Basis for Processing"
                  >
                    <PrivacyContentSection4 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="data-sharing"
                    number="05"
                    icon={Server}
                    title="Data Sharing"
                  >
                    <PrivacyContentSection5 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="cookies"
                    number="06"
                    icon={Cookie}
                    title="Cookies & Tracking"
                  >
                    <PrivacyContentSection6 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="your-rights"
                    number="07"
                    icon={UserCheck}
                    title="Your Rights"
                  >
                    <PrivacyContentSection7 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="data-retention"
                    number="08"
                    icon={Clock}
                    title="Data Retention"
                  >
                    <PrivacyContentSection8 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="security"
                    number="09"
                    icon={Lock}
                    title="Security Measures"
                  >
                    <PrivacyContentSection9 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="third-party"
                    number="10"
                    icon={ExternalLink}
                    title="Third-Party Services"
                  >
                    <PrivacyContentSection10 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="childrens-privacy"
                    number="11"
                    icon={Shield}
                    title="Children's Privacy"
                  >
                    <PrivacyContentSection11 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="changes"
                    number="12"
                    icon={FileCheck}
                    title="Changes to This Policy"
                  >
                    <PrivacyContentSection12 />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="contact"
                    number="13"
                    icon={Mail}
                    title="Contact Us"
                  >
                    <PrivacyContentSection13 />
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
                      Quick answers to the most common questions about your privacy.
                    </p>
                    <PrivacyFAQ />
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


function PrivacyContentIntro() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        Solar Ireland (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a SEAI-registered solar panel
        installation company operating across all 32 counties of Ireland. We are committed to protecting
        your privacy and ensuring that any personal data we collect is processed lawfully, fairly, and
        transparently in accordance with the General Data Protection Regulation (GDPR) and the Data
        Protection Act 2018.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        This Privacy Policy explains what personal data we collect, why we collect it, how we use it,
        how long we keep it, and your rights in relation to your data. It applies to all interactions you
        have with us, including our website{' '}
        <span className="text-amber-400 font-medium">solarireland.org</span>, our county-specific landing
        pages, WhatsApp Business, email, phone calls, in-person surveys, and any other communication channels
        through which you share information with us.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        By using our services or providing us with your personal data, you acknowledge that you have read
        and agree to the collection and use of information in accordance with this policy. If you do not
        agree with the terms of this privacy policy, please do not provide us with your personal information
        and discontinue use of our services.
      </p>
    </>
  );
}

function PrivacyContentSection2() {
  return (
    <>
      <Subsection>Personal Data You Provide Directly</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        When you request a quote, book a survey, or engage our services, we may collect the following
        personal information to provide you with an accurate and efficient service:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'Full name, email address, phone number, and postal address',
          'Property address and ESB Meter Point Reference Number (MPRN) for SEAI grant applications',
          'BER rating, property type, roof orientation, and construction details from site surveys',
          'Electricity usage data including uploaded bills, energy provider details, and consumption figures',
          'Payment information including bank details for grant refunds and invoicing',
          'Survey photographs, roof measurements, and system design specifications',
          'Communication records including emails, WhatsApp messages, and phone call notes',
          'Smart meter data shared with your consent for system optimisation',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <Subsection>Data Collected Automatically</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        When you visit our website, certain technical information is collected automatically through
        cookies and similar technologies to help us improve your experience and maintain site security:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'IP address (anonymised after 24 hours) and approximate geographic location at country level',
          'Browser type, version, language preference, and operating system',
          'Pages visited, time spent on each page, and navigation path through the site',
          'Referring website address and search engine keywords used to find us',
          'Device type, screen resolution, and whether the visit is from a mobile or desktop device',
          'Click patterns and interactions with forms, calculators, and tools on our website',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <Subsection>Sensitive Data</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        We do not routinely collect special category data (such as health data, racial or ethnic origin,
        religious beliefs, or political opinions). In rare cases where such data may be relevant to your
        installation (for example, if you mention a disability requiring specific accessibility
        accommodations), we will only process it with your explicit written consent and under strict
        confidentiality protocols.
      </p>
    </>
  );
}

function PrivacyContentSection3() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-3">
        We use your personal data for specific, legitimate purposes. Here is a detailed breakdown of
        how your information is used across our business operations:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { title: 'Providing Quotes & Solar Installation Services', desc: 'We use your contact details, property information, and energy usage data to prepare accurate solar installation quotes, conduct site surveys, design your system, schedule installation dates, and manage your project from initial enquiry through to commissioning and handover.' },
          { title: 'SEAI Grant Applications & Compliance', desc: 'Your property details, MPRN, and BER rating are submitted to the Sustainable Energy Authority of Ireland (SEAI) to process your grant application. We coordinate with ESB Networks for grid connection notifications and ensure all work complies with NSAI standards.' },
          { title: 'Post-Installation Support & Warranty', desc: 'We retain your installation records, system specifications, and contact details to provide ongoing warranty support, handle maintenance enquiries, and process any guarantee claims that may arise during the warranty period.' },
          { title: 'Marketing Communications (Consent-Based Only)', desc: 'With your explicit consent only, we may send you information about new services, seasonal promotions, solar energy news, or policy updates affecting your solar investment via email or WhatsApp. You can withdraw consent at any time using the unsubscribe link in any communication or by contacting us directly.' },
          { title: 'Service Improvement & Analytics', desc: 'We analyse anonymised website usage data, customer feedback, and service delivery metrics to improve our website experience, streamline our operations, develop new products, and enhance overall customer satisfaction.' },
          { title: 'Legal, Regulatory & Financial Compliance', desc: 'We process your data as necessary to comply with Irish tax law, financial regulations, SEAI reporting requirements, insurance obligations, health and safety standards, and to resolve disputes or enforce contractual terms.' },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-200">{item.title}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PrivacyContentSection4() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-3">
        Under GDPR, every processing activity must have a valid legal basis. We process your personal data
        under one or more of the following legal grounds, depending on the specific purpose:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { basis: 'Consent', article: 'Art. 6(1)(a)', desc: 'When you explicitly opt in — for example, ticking a box to receive marketing emails, agreeing to optional cookie categories, or consenting to smart meter data sharing. You can withdraw consent at any time without affecting the lawfulness of processing carried out before withdrawal.' },
          { basis: 'Contractual Necessity', article: 'Art. 6(1)(b)', desc: 'When processing is necessary to deliver the service you have requested — such as installing solar panels on your property, submitting a grant application on your behalf, or communicating with you about your active project. Without this data, we cannot provide our services.' },
          { basis: 'Legitimate Interest', article: 'Art. 6(1)(f)', desc: 'When processing serves a genuine business interest that does not override your rights and freedoms — such as website analytics, fraud prevention, service quality monitoring, and direct marketing to existing customers where you have not opted out.' },
          { basis: 'Legal Obligation', article: 'Art. 6(1)(c)', desc: 'When processing is required by law — such as retaining financial records for 7 years under Irish tax law, reporting to SEAI for grant compliance, responding to valid legal requests from authorities, or maintaining insurance documentation as required by our professional indemnity policies.' },
        ].map((item) => (
          <div key={item.basis} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="shrink-0 px-2 py-1 rounded-md bg-amber-400/10 text-[10px] font-mono font-semibold text-amber-400 mt-0.5">
              {item.article}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">{item.basis}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PrivacyContentSection5() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-3">
        We treat your data with the utmost confidentiality. We may share your personal data with the
        following categories of third parties only when necessary to deliver our services or comply with
        legal obligations. We do not sell, rent, or trade your personal data for marketing purposes.
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { name: 'SEAI (Sustainable Energy Authority of Ireland)', purpose: 'Processing your SEAI grant application, verifying our installer registration, and submitting compliance reports as required by the grant scheme terms and conditions.' },
          { name: 'ESB Networks', purpose: 'Submitting NC6 grid connection notifications, registering for the Clean Export Guarantee (CEG) tariff, and coordinating smart meter installation or data sharing with your consent.' },
          { name: 'Insurance Providers', purpose: 'Supporting public liability and professional indemnity insurance claims, providing installation documentation for policy compliance, and maintaining records as required by our insurers.' },
          { name: 'Subcontractors & Specialist Partners', purpose: 'Engaging RECI-registered electricians, scaffolding contractors, roofing specialists, and BER assessors who are contractually bound to process your data only for the specific installation task and to delete it upon completion.' },
          { name: 'Financial Institutions', purpose: 'Processing payments, issuing invoices, managing grant refund disbursements, and maintaining financial records as required by Irish tax law and Revenue Commissioners.' },
          { name: 'Legal & Regulatory Bodies', purpose: 'Responding to lawful requests from the Data Protection Commission, Revenue Commissioners, SEAI compliance teams, or other regulatory authorities with proper jurisdiction.' },
        ].map((item) => (
          <div key={item.name} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Server className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-200">{item.name}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.purpose}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-5 rounded-xl bg-green-400/5 border border-green-400/15 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-green-400" />
          <p className="text-sm text-green-400 font-semibold">We never sell your personal data — period.</p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Solar Ireland does not sell, rent, trade, or otherwise monetise your personal information.
          All third-party data sharing is strictly limited to what is necessary to deliver our solar
          installation services, comply with legal obligations, and protect your warranty. Every
          subcontractor and partner is bound by written data processing agreements that enforce GDPR
          compliance.
        </p>
      </div>
    </>
  );
}

function PrivacyContentSection6() {
  return (
    <>
      <Subsection>Essential Cookies</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        These cookies are strictly necessary for the website to function and cannot be disabled.
        They are set in response to your actions:
      </p>
      <div className="grid gap-2 mb-6">
        {[
          { name: 'solar_cookie_consent', desc: 'Stores your cookie preference (accept/reject). Expires after 12 months.' },
          { name: '__Secure-next-auth.session-token', desc: 'Maintains your secure browsing session. Expires when you close your browser.' },
          { name: 'XSRF-TOKEN', desc: 'Prevents cross-site request forgery attacks. Expires after 24 hours.' },
          { name: 'next-build-id', desc: 'Ensures you receive the latest version of the website. Session-based.' },
        ].map((item) => (
          <div key={item.name} className="flex items-start gap-2.5 text-sm text-gray-400 p-3 rounded-lg bg-white/[0.015]">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            <div>
              <span className="text-gray-300 font-mono text-xs">{item.name}</span>
              <span className="text-gray-600 mx-2">—</span>
              <span>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
      <Subsection>Analytics Cookies (Optional)</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        With your consent, we use Google Analytics 4 (GA4) to understand how visitors interact with
        our website. These cookies collect anonymised data including page views, session duration,
        device information, and navigation paths. We have configured GA4 to anonymise IP addresses,
        disable data sharing with Google for advertising purposes, and set data retention to 14 months.
      </p>
      <Subsection>Managing Cookies in Your Browser</Subsection>
      <p className="text-gray-400 leading-relaxed mb-6">
        In addition to our consent mechanism, you can manage or delete cookies directly through your
        browser settings. Most modern browsers allow you to view, block, or delete individual cookies
        or all cookies at once. For detailed instructions, visit{' '}
        <span className="text-gray-300">www.allaboutcookies.org</span> or consult your browser&apos;s
        help documentation. If you use multiple devices or browsers, you will need to set your
        preferences on each one.
      </p>
    </>
  );
}

function PrivacyContentSection7() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-3">
        Under GDPR, you have powerful rights over your personal data. We are committed to making
        it easy for you to exercise these rights:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { right: 'Right of Access (Art. 15)', desc: 'Request a complete copy of all personal data we hold about you, including how it was collected, who it was shared with, and retention periods. Provided within 30 days.' },
          { right: 'Right to Rectification (Art. 16)', desc: 'Request corrections to any inaccurate, incomplete, or outdated personal data. We will update your records within 21 days and confirm in writing.' },
          { right: 'Right to Erasure (Art. 17)', desc: 'Request deletion of your personal data where we no longer have a legal basis to retain it. We will comply unless legally obligated to retain the data.' },
          { right: 'Right to Data Portability (Art. 20)', desc: 'Request your data in a structured, machine-readable format (CSV, JSON, or XML) so you can transfer it to another service provider.' },
          { right: 'Right to Object (Art. 21)', desc: 'Object to processing based on legitimate interests at any time. We will stop processing unless we have compelling grounds to continue.' },
          { right: 'Right to Withdraw Consent (Art. 7)', desc: 'Withdraw consent for marketing or optional data processing at any time. This does not affect the lawfulness of prior processing.' },
          { right: 'Right to Restrict Processing (Art. 18)', desc: 'Request that we limit how we use your data while a dispute is being resolved or accuracy is contested.' },
          { right: 'Right to Lodge a Complaint (Art. 77)', desc: 'Complain to the Data Protection Commission (DPC) at dataprotection.ie or +353 21 431 0700 if you believe your data has been mishandled.' },
          { right: 'Automated Decision-Making (Art. 22)', desc: 'You have the right not to be subject to decisions based solely on automated processing. We do not currently use such processes.' },
        ].map((item) => (
          <div key={item.right} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <UserCheck className="w-4 h-4 text-amber-400/60 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-200">{item.right}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-5 rounded-xl bg-amber-400/5 border border-amber-400/15 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-medium text-amber-400">How to Exercise Your Rights</p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Contact our Data Protection Officer at{' '}
          <a href="mailto:cal@solarireland.org" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
            cal@solarireland.org
          </a>. We acknowledge requests within 5 working days and respond substantively within 30 days.
          Complex requests may take up to 90 days with advance notice. We may ask for identification to
          verify your identity before processing your request.
        </p>
      </div>
    </>
  );
}

function PrivacyContentSection8() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-3">
        We follow a data minimisation approach and retain your personal data only for as long as necessary.
        Here are our standard retention periods:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { category: 'Financial & Tax Records', period: '7 years', reason: 'Required by Irish tax law (Taxes Consolidation Act 1997) and Revenue Commissioners.' },
          { category: 'Installation & Warranty Records', period: '10 years', reason: 'Product warranty coverage, insurance claims, BER compliance, and SEAI installer audit requirements.' },
          { category: 'Marketing Consent Records', period: '3 years', reason: 'Retained while consent is active. Removed 3 years after last confirmed opt-in.' },
          { category: 'Website Analytics Data', period: '14 months', reason: 'Google Analytics 4 default retention for anonymised, aggregated data.' },
          { category: 'Communication Records', period: '3 years', reason: 'Customer service quality assurance, dispute resolution, and regulatory compliance.' },
          { category: 'CCTV / Security Footage', period: '30 days', reason: 'Physical security. Automatically overwritten unless retained for incident investigation.' },
        ].map((item) => (
          <div key={item.category} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
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
        When the retention period expires, data is securely deleted using industry-standard methods or
        irreversibly anonymised. You may request earlier deletion subject to legal and contractual
        obligations.
      </p>
    </>
  );
}

function PrivacyContentSection9() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-3">
        We implement a multi-layered security programme to protect your personal data:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { title: 'Encryption in Transit', desc: 'TLS 1.3 encryption for all website and API traffic. HSTS with one-year max-age.' },
          { title: 'Encryption at Rest', desc: 'AES-256 encryption for sensitive data including payment details and ID documents.' },
          { title: 'EU/EEA Data Residency', desc: 'All data stored and processed within the EU/EEA. No transfers outside the EU.' },
          { title: 'Access Controls', desc: 'Role-based access with multi-factor authentication for administrative accounts. All access logged and auditable.' },
          { title: 'Vulnerability Management', desc: 'Regular penetration testing, vulnerability scanning, and code reviews. Critical patches applied within 72 hours.' },
          { title: 'Staff Training', desc: 'Mandatory GDPR training upon joining and annually thereafter for all employees and contractors.' },
          { title: 'Incident Response', desc: 'Documented breach response plan. DPC notified within 72 hours. Affected individuals informed without undue delay.' },
          { title: 'Third-Party Security', desc: 'All processors contractually required to maintain equivalent standards. Due diligence assessments before engagement.' },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Lock className="w-4 h-4 text-green-400/60 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-200">{item.title}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-gray-400 leading-relaxed mb-6">
        If you become aware of any potential security vulnerability, contact us immediately at{' '}
        <a href="mailto:cal@solarireland.org" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
          cal@solarireland.org
        </a>.
      </p>
    </>
  );
}

function PrivacyContentSection10() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-3">
        Our services integrate with these third-party platforms. Each is independently responsible
        for their own GDPR compliance:
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { name: 'Google Analytics 4', purpose: 'Website analytics. IP anonymised, data sharing for ads disabled, 14-month retention.', link: 'policies.google.com/privacy' },
          { name: 'WhatsApp Business (Meta)', purpose: 'Customer communication. Processed under EU Standard Contractual Clauses.', link: 'whatsapp.com/legal/privacy-policy' },
          { name: 'ESB Networks', purpose: 'Grid connection notifications, CEG registration, smart meter integration.', link: 'esbnetworks.ie' },
          { name: 'SEAI', purpose: 'Grant applications, BER assessments, installer compliance.', link: 'seai.ie' },
          { name: 'Vercel (Hosting)', purpose: 'Website hosting on EU-region servers. SOC 2 Type II compliant.', link: 'vercel.com/legal/privacy-policy' },
        ].map((item) => (
          <div key={item.name} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <ExternalLink className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-200">{item.name}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.purpose}</p>
              <p className="text-xs text-gray-600 mt-1.5">Privacy: <span className="text-gray-500">{item.link}</span></p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-gray-400 leading-relaxed mb-6">
        We do not control these third parties&apos; privacy practices and encourage you to review their
        individual privacy policies. Contact us if you have concerns about any third-party processing.
      </p>
    </>
  );
}

function PrivacyContentSection11() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        Our website and services are exclusively directed at adults aged 18 and over. We do not
        knowingly collect, process, or store personal data from individuals under the age of 18.
        If we become aware that we have inadvertently collected data from a child under 18, we
        will securely delete it from all systems including backups within 14 days.
      </p>
      <p className="text-gray-400 leading-relaxed mb-6">
        If you are a parent or guardian and believe your child has provided us with personal data,
        please contact us at{' '}
        <a href="mailto:cal@solarireland.org" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
          cal@solarireland.org
        </a>{' '}
        and we will take prompt action.
      </p>
    </>
  );
}

function PrivacyContentSection12() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        We may update this Privacy Policy to reflect changes in our business practices, data protection
        legislation, new services, or for operational reasons. We are committed to keeping you informed
        about how your data is protected.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        When we make material changes, we will update the &quot;Last updated&quot; date at the top of this page,
        display a prominent notice on our homepage for at least 30 days, and where appropriate, send
        you an email or WhatsApp notification. Your continued use of our services after changes constitutes
        acceptance of the updated terms. We encourage you to review this policy periodically.
      </p>
    </>
  );
}

function PrivacyContentSection13() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        If you have any questions, concerns, or requests about this Privacy Policy or how we handle
        your personal data, we would love to hear from you. Our team will respond promptly to all enquiries.
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { icon: Mail, label: 'Email', value: 'cal@solarireland.org', href: 'mailto:cal@solarireland.org' },
          { icon: Phone, label: 'Phone', value: '[Phone Number]', href: 'tel:' },
          { icon: ExternalLink, label: 'Website', value: 'solarireland.org', href: 'https://solarireland.org' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.label} href={item.href} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600">{item.label}</p>
                <p className="text-sm font-medium text-gray-300 group-hover:text-amber-400 transition-colors">{item.value}</p>
              </div>
            </a>
          );
        })}
      </div>
      <p className="text-gray-400 leading-relaxed mb-4">
        For data protection-specific enquiries or to exercise your GDPR rights, contact our Data
        Protection Officer directly. We acknowledge all data protection enquiries within 5 working
        days and provide a substantive response within 30 days.
      </p>
    </>
  );
}
