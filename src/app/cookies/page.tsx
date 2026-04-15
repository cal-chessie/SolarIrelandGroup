'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import {
  Cookie,
  Mail,
  Phone,
  Clock,
  Shield,
  BarChart3,
  Megaphone,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Eye,
  Settings,
  RefreshCw,
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
  { id: 'what-are-cookies', label: 'What Are Cookies' },
  { id: 'how-we-use', label: 'How We Use Cookies' },
  { id: 'cookie-categories', label: 'Cookie Categories' },
  { id: 'third-party-cookies', label: 'Third-Party Cookies' },
  { id: 'managing-cookies', label: 'Managing Cookies' },
  { id: 'consent-banner', label: 'Cookie Consent Banner' },
  { id: 'updates', label: 'Updates to This Policy' },
  { id: 'contact', label: 'Contact' },
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


function CookiesFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs = [
    {
      q: 'Are cookies dangerous?',
      a: 'Most cookies are harmless and simply help websites function properly. Essential cookies are necessary for security and site operation. Analytics and marketing cookies can track your browsing across websites, which is why we give you a clear choice about which categories to accept. We do not use cookies for any purpose that could harm you or your device.',
    },
    {
      q: 'Do I have to accept cookies?',
      a: 'Essential cookies are strictly necessary for the website to function and cannot be disabled. However, analytics and marketing cookies are entirely optional. When you first visit our site, you can choose "Reject All" to only enable essential cookies, or customise your preferences through the cookie settings panel.',
    },
    {
      q: 'How do I clear cookies I have already accepted?',
      a: 'You can clear cookies through your browser settings at any time. In most browsers, go to Settings > Privacy and Security > Clear Browsing Data, then select "Cookies and other site data". You can also use the cookie settings button (the floating cookie icon at the bottom-right of our website) to update your preferences. Clearing cookies will reset your consent preferences, and you will be asked again on your next visit.',
    },
    {
      q: 'Does Solar Ireland use cookies for advertising?',
      a: 'We do not serve targeted advertisements based on your browsing data. We may use Facebook Pixel cookies (_fbp, _fbc) for ad campaign measurement only — to understand how visitors who click on our ads interact with our website. We do not build detailed profiles of your interests or share your data with advertisers for retargeting.',
    },
    {
      q: 'What happens if I disable analytics cookies?',
      a: 'Disabling analytics cookies means we will not collect anonymised data about how you use our website. The site will continue to function perfectly — you can still request quotes, use our calculators, and contact us. The only difference is that we will have less data to help us improve the website experience for all visitors.',
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

function CookiesContentIntro() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        Cookies are small text files that are stored on your device (computer, tablet, or mobile phone)
        when you visit a website. They are widely used to make websites work more efficiently, provide
        a better user experience, and give website owners information about how their site is being used.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        Cookies serve a variety of purposes. Some are essential for the website to function at all — for
        example, remembering your login status or maintaining your shopping cart. Others help us
        understand how visitors interact with our website so we can improve the experience. Still others
        are used by third-party services (like Google Analytics) to provide analytics and reporting
        features.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        Cookies can be &quot;persistent&quot; (stored on your device until they expire or you delete them) or
        &quot;session&quot; cookies (deleted automatically when you close your browser). They can also be
        &quot;first-party&quot; (set by us directly) or &quot;third-party&quot; (set by external services we use,
        such as Google Analytics).
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        This Cookie Policy explains how Solar Ireland uses cookies on our website{' '}
        <span className="text-amber-400 font-medium">solarireland.org</span>. It applies to all visitors
        and is intended to comply with the General Data Protection Regulation (GDPR), the ePrivacy
        Directive (as transposed into Irish law by the European Communities (Electronic Communications
        Networks and Services) (Privacy and Electronic Communications) Regulations 2011), and guidance
        from the Data Protection Commission (DPC).
      </p>
    </>
  );
}


function CookiesContentHowWeUse() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        We use cookies for three broad categories of purposes. Understanding these categories will help
        you make an informed decision about which cookies to accept.
      </p>
      <div className="grid gap-3 mb-6">
        {[
          {
            title: 'Essential Cookies',
            desc: 'These cookies are strictly necessary for the website to function properly. They enable core functionality such as page navigation, secure access to protected areas, cookie consent management, and protection against cross-site request forgery (CSRF) attacks. They cannot be disabled without fundamentally breaking the website experience.',
            icon: Shield,
          },
          {
            title: 'Analytics Cookies',
            desc: 'These cookies help us understand how visitors interact with our website — which pages are most popular, how long visitors spend on each page, and how they navigate through the site. We use this anonymised data to improve our content, fix usability issues, and make our website better for everyone. Analytics cookies are optional and require your consent.',
            icon: BarChart3,
          },
          {
            title: 'Marketing Cookies',
            desc: 'These cookies are used to measure the effectiveness of our advertising campaigns and to understand how visitors arrive at our website after clicking on an ad. We do not use marketing cookies to build detailed profiles of your interests, serve personalised advertisements, or retarget you across other websites. Marketing cookies are optional and require your consent.',
            icon: Megaphone,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">{item.title}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-gray-400 leading-relaxed mb-4">
        When you first visit our website, you will be presented with a cookie consent banner that
        allows you to accept all cookies, reject non-essential cookies, or customise your preferences
        for each category. Your choice will be remembered for future visits.
      </p>
    </>
  );
}


function CookiesContentCategories() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        The following table provides a complete list of all cookies used on the Solar Ireland website,
        organised by category. This table is updated whenever we add, remove, or modify cookies.
      </p>

      <Subsection>Essential Cookies</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        These cookies cannot be disabled. They are necessary for the website to function securely and correctly.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Cookie Name</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Purpose</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Duration</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {[
              { name: 'solar_cookie_consent', purpose: 'Stores your cookie consent preferences (which categories you have accepted or rejected)', duration: '12 months', type: 'Persistent' },
              { name: '__Secure-next-auth.session-token', purpose: 'Maintains your secure authenticated session on the website', duration: 'Session', type: 'HTTP Only' },
              { name: 'XSRF-TOKEN', purpose: 'Prevents cross-site request forgery (CSRF) attacks to protect your data', duration: '24 hours', type: 'HTTP Only' },
              { name: '__next-build-id', purpose: 'Ensures you receive the latest version of the website from our CDN', duration: 'Session', type: 'Persistent' },
            ].map((row) => (
              <tr key={row.name} className="hover:bg-white/[0.015] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-amber-400/80 whitespace-nowrap">{row.name}</td>
                <td className="py-3 px-3 text-gray-400">{row.purpose}</td>
                <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{row.duration}</td>
                <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{row.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Subsection>Analytics Cookies</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        These cookies are optional and are only set if you accept analytics cookies. They help us understand
        how visitors use our website.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Cookie Name</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Purpose</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Duration</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {[
              { name: '_ga', purpose: 'Distinguishes unique visitors to calculate visitor, session, and campaign data. IP addresses are anonymised.', duration: '2 years', type: 'Persistent' },
              { name: '_ga_<ID>', purpose: 'Maintains session state across page requests for a specific Google Analytics property', duration: '2 years', type: 'Persistent' },
              { name: '_gid', purpose: 'Distinguishes unique visitors within a 24-hour period for more granular analysis', duration: '24 hours', type: 'Persistent' },
            ].map((row) => (
              <tr key={row.name} className="hover:bg-white/[0.015] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-amber-400/80 whitespace-nowrap">{row.name}</td>
                <td className="py-3 px-3 text-gray-400">{row.purpose}</td>
                <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{row.duration}</td>
                <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{row.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Subsection>Marketing Cookies</Subsection>
      <p className="text-gray-400 leading-relaxed mb-3">
        These cookies are optional and are only set if you accept marketing cookies. They are used
        for ad campaign measurement only.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Cookie Name</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Purpose</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Duration</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {[
              { name: '_fbp', purpose: 'Stores browser information to measure and improve the effectiveness of Facebook/Meta advertising campaigns', duration: '3 months', type: 'Persistent' },
              { name: '_fbc', purpose: 'Stores referral information when a visitor arrives via a Facebook ad click, used for attribution', duration: '2 years', type: 'Persistent' },
            ].map((row) => (
              <tr key={row.name} className="hover:bg-white/[0.015] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-amber-400/80 whitespace-nowrap">{row.name}</td>
                <td className="py-3 px-3 text-gray-400">{row.purpose}</td>
                <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{row.duration}</td>
                <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{row.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 rounded-xl bg-amber-400/5 border border-amber-400/15 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-medium text-amber-400">
            Our Google Analytics Configuration
          </p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          We have configured Google Analytics 4 with the following privacy-protective settings: IP
          anonymisation is enabled, data sharing with Google for advertising purposes is disabled,
          Google Signals data collection is disabled, and data retention is set to 14 months. No
          personally identifiable information is collected through analytics cookies.
        </p>
      </div>
    </>
  );
}


function CookiesContentThirdParty() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        In addition to our own first-party cookies, some cookies on our website are set by third-party
        services that we use to provide analytics, security, and performance features. Each third-party
        service is independently responsible for their own cookie usage and data practices.
      </p>
      <div className="grid gap-3 mb-6">
        {[
          {
            name: 'Google Analytics 4',
            purpose: 'Website analytics service that helps us understand how visitors interact with solarireland.org. Collects anonymised data about page views, sessions, devices, and navigation. We have configured GA4 with IP anonymisation and disabled advertising data sharing.',
            link: 'policies.google.com/privacy',
            linkLabel: 'Google Privacy Policy',
          },
          {
            name: 'Meta / Facebook Pixel',
            purpose: 'Used for ad campaign measurement — to track how many visitors who click on our Facebook ads subsequently visit specific pages on our website. We do not use this data for retargeting or building user profiles.',
            link: 'facebook.com/privacy/policy/',
            linkLabel: 'Meta Privacy Policy',
          },
          {
            name: 'Vercel Analytics',
            purpose: 'Web performance and analytics service provided by our hosting platform (Vercel). Collects anonymised data about page load times, Core Web Vitals, and visitor counts. Data is processed within EU regions.',
            link: 'vercel.com/legal/privacy-policy',
            linkLabel: 'Vercel Privacy Policy',
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
      <p className="text-gray-400 leading-relaxed mb-4">
        We do not control the cookies set by these third-party services. However, we have carefully
        selected service providers that maintain appropriate data protection standards and are GDPR-
        compliant. We conduct periodic reviews of our third-party integrations to ensure continued
        compliance with data protection requirements and our own privacy standards.
      </p>
    </>
  );
}


function CookiesContentManaging() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        You have several options for managing cookies on our website and across all websites you visit.
      </p>

      <Subsection>Our Cookie Consent Mechanism</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        When you first visit our website, a cookie consent banner appears at the bottom of your screen.
        You are presented with three options:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          '"Accept All Cookies" — enables essential, analytics, and marketing cookies.',
          '"Reject Non-Essential" — enables only essential cookies. Analytics and marketing cookies will not be set.',
          '"Manage" — opens a detailed settings panel where you can individually toggle each cookie category on or off.',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <p className="text-gray-400 leading-relaxed mb-4">
        Your preferences are stored locally on your device and will be remembered for 12 months. After
        this period, you will be asked again on your next visit. You can update your preferences at any
        time by clicking the floating cookie settings button (the cookie icon at the bottom-right corner
        of the page) or by clearing your cookies and revisiting the website.
      </p>

      <Subsection>Withdrawing Consent</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        You can withdraw your consent for analytics and marketing cookies at any time without affecting
        your right to use the website. To withdraw consent:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'Click the floating cookie settings icon at the bottom-right of any page and update your preferences.',
          'Clear your browser cookies — this will reset your consent and the banner will appear again on your next visit.',
          'Disable specific cookies through your browser settings (see below).',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <Subsection>Browser Settings</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        Most modern browsers allow you to manage cookies through their settings. Here is how to access
        cookie settings in popular browsers:
      </p>
      <div className="grid gap-2 mb-6">
        {[
          { browser: 'Google Chrome', path: 'Settings > Privacy and Security > Cookies and other site data' },
          { browser: 'Mozilla Firefox', path: 'Settings > Privacy & Security > Cookies and Site Data' },
          { browser: 'Apple Safari', path: 'Preferences > Privacy > Manage Website Data' },
          { browser: 'Microsoft Edge', path: 'Settings > Cookies and site permissions > Manage and delete cookies' },
          { browser: 'Opera', path: 'Settings > Privacy & Security > Cookies' },
        ].map((item) => (
          <div key={item.browser} className="flex items-start gap-2.5 text-sm text-gray-400 p-3 rounded-lg bg-white/[0.015]">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            <div>
              <span className="text-gray-300 font-medium">{item.browser}</span>
              <span className="text-gray-600 mx-2">—</span>
              <span className="font-mono text-xs">{item.path}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-gray-400 leading-relaxed mb-4">
        Please note that blocking essential cookies may prevent the website from functioning correctly.
        If you use multiple devices or browsers, you will need to set your cookie preferences on each one.
        For more detailed information about cookies and how to manage them, visit{' '}
        <span className="text-gray-300">www.allaboutcookies.org</span> or{' '}
        <span className="text-gray-300">www.youronlinechoices.eu</span> (for EU-based choices).
      </p>
    </>
  );
}


function CookiesContentConsentBanner() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        Our cookie consent banner is designed to be clear, transparent, and compliant with GDPR and the
        ePrivacy Directive requirements for obtaining valid consent. Here is how it works:
      </p>

      <Subsection>How the Banner Works</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        When you visit our website for the first time (or after your previous consent has expired after
        12 months), a consent banner appears at the bottom of your screen. The banner clearly explains
        that we use cookies to enhance your experience, analyse site traffic, and personalise content.
        It distinguishes between necessary cookies (which are always active) and optional cookies
        (analytics and marketing).
      </p>

      <Subsection>What Each Option Means</Subsection>
      <div className="grid gap-3 mb-6">
        {[
          {
            option: '"Accept All Cookies"',
            desc: 'All three categories of cookies (essential, analytics, and marketing) will be enabled. Google Analytics and Meta Pixel cookies will be set on your device. Your consent is recorded with a timestamp.',
          },
          {
            option: '"Reject Non-Essential"',
            desc: 'Only essential cookies will be enabled. No analytics or marketing cookies will be set. Google Analytics and Meta Pixel will not be loaded on your device. You can still use the full website functionality.',
          },
          {
            option: '"Manage" / Custom Settings',
            desc: 'Opens a detailed panel where you can individually toggle each category. Necessary cookies are always on. You can enable analytics but not marketing, or both. Your selections are saved when you click "Save Preferences".',
          },
        ].map((item) => (
          <div
            key={item.option}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
            <div>
              <p className="text-sm font-medium text-gray-200">{item.option}</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Subsection>Consent Storage and Expiry</Subsection>
      <p className="text-gray-400 leading-relaxed mb-4">
        Your consent preferences are stored locally on your device using the{' '}
        <code className="text-xs bg-white/[0.05] px-1.5 py-0.5 rounded text-gray-300">solar_cookie_consent</code>{' '}
        cookie and in your browser&apos;s local storage. The consent record includes:
      </p>
      <ul className="space-y-2.5 mb-6 ml-1">
        {[
          'Whether you have accepted or rejected (or customised) cookie consent',
          'Which specific cookie categories you have enabled (necessary, analytics, marketing)',
          'The exact date and time (timestamp) when consent was given',
          'A consent expiry of 12 months from the date of acceptance',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <p className="text-gray-400 leading-relaxed mb-4">
        After 12 months, your consent will expire and the banner will appear again on your next visit,
        giving you a fresh opportunity to review and update your preferences. This periodic re-consent
        is in line with Data Protection Commission guidance on consent renewal.
      </p>

      <div className="p-5 rounded-xl bg-green-400/5 border border-green-400/15 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-green-400" />
          <p className="text-sm text-green-400 font-semibold">
            GDPR-Compliant Consent
          </p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Our consent mechanism meets all GDPR requirements for valid consent: it is freely given,
          specific, informed, and unambiguous. Consent is recorded with a timestamp, can be withdrawn
          at any time, and is as easy to withdraw as it is to give. We do not use cookie walls,
          pre-ticked boxes, or dark patterns to obtain consent.
        </p>
      </div>
    </>
  );
}


function CookiesContentUpdates() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        We may update this Cookie Policy from time to time to reflect changes in the cookies we use,
        changes in third-party services, changes in applicable law or regulatory guidance, or for other
        operational reasons.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        When we make material changes to this policy — such as adding new cookie categories, introducing
        new third-party services, or changing how cookies are used — we will update the &quot;Last
        updated&quot; date at the top of this page and, where appropriate, display a notice on our website.
        If the changes affect your existing consent, we will re-present the consent banner so you can
        review and update your preferences.
      </p>
      <p className="text-gray-400 leading-relaxed mb-4">
        We encourage you to review this Cookie Policy periodically. You can always access the latest
        version at{' '}
        <span className="text-amber-400 font-medium">solarireland.org/cookies</span>. If you have
        questions about our use of cookies that are not addressed in this policy, please contact us
        using the details below.
      </p>
    </>
  );
}


function CookiesContentContact() {
  return (
    <>
      <p className="text-gray-400 leading-relaxed mb-4">
        If you have any questions, concerns, or requests about our use of cookies or this Cookie Policy,
        please contact us. We are happy to help with any cookie-related enquiry.
      </p>
      <div className="grid gap-3 mb-6">
        {[
          { icon: Mail, label: 'Email', value: 'cal@solarireland.org', href: 'mailto:cal@solarireland.org' },
          { icon: Phone, label: 'Phone', value: '[Phone Number]', href: 'tel:' },
          { icon: Zap, label: 'Website', value: 'solarireland.org', href: 'https://solarireland.org' },
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
        You also have the right to lodge a complaint with the Data Protection Commission (DPC),
        Ireland&apos;s supervisory authority, if you believe that our use of cookies infringes your
        data protection rights. Contact the DPC at{' '}
        <span className="text-gray-300">dataprotection.ie</span> or call +353 21 431 0700.
      </p>
    </>
  );
}


/* ─── Main Page Component ─── */

export default function CookiePolicyPage() {
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
              <Cookie className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-400">
                Legal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Cookie Policy
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed">
              How Solar Ireland uses cookies on our website, your consent choices,
              and how to manage your preferences.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: April 2026</span>
              </div>
              <span className="text-white/10 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <Cookie className="w-3.5 h-3.5" />
                <span>Version 1.0</span>
              </div>
              <span className="text-white/10 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>~10 min read</span>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-600">
              <a href="/" className="hover:text-gray-400 transition-colors">Home</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-400">Cookie Policy</span>
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
                    id="what-are-cookies"
                    number="01"
                    icon={Cookie}
                    title="What Are Cookies"
                    defaultOpen
                  >
                    <CookiesContentIntro />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="how-we-use"
                    number="02"
                    icon={BarChart3}
                    title="How We Use Cookies"
                  >
                    <CookiesContentHowWeUse />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="cookie-categories"
                    number="03"
                    icon={Settings}
                    title="Cookie Categories"
                  >
                    <CookiesContentCategories />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="third-party-cookies"
                    number="04"
                    icon={ExternalLink}
                    title="Third-Party Cookies"
                  >
                    <CookiesContentThirdParty />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="managing-cookies"
                    number="05"
                    icon={HelpCircle}
                    title="Managing Cookies"
                  >
                    <CookiesContentManaging />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="consent-banner"
                    number="06"
                    icon={Shield}
                    title="Cookie Consent Banner"
                  >
                    <CookiesContentConsentBanner />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="updates"
                    number="07"
                    icon={RefreshCw}
                    title="Updates to This Policy"
                  >
                    <CookiesContentUpdates />
                  </CollapsibleSection>

                  <CollapsibleSection
                    id="contact"
                    number="08"
                    icon={Mail}
                    title="Contact"
                  >
                    <CookiesContentContact />
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
                      Quick answers to common questions about cookies on our website.
                    </p>
                    <CookiesFAQ />
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
