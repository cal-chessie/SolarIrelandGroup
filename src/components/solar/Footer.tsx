'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, useInView } from '@/lib/motion';
import { useRef } from 'react';
import {
  MessageCircle,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  ChevronUp,
  Sun,
  ShieldCheck,
  Shield,
  Zap,
  CheckCircle2,
  Star,
  Clock,
  ExternalLink,
} from 'lucide-react';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

const FOOTER_SOCIAL = [
  { icon: FacebookIcon, href: 'https://www.facebook.com/solarireland', label: 'Follow us on Facebook', hoverColor: 'hover:bg-[#1877F2]/10 hover:border-[#1877F2]/25 hover:text-[#1877F2]' },
  { icon: InstagramIcon, href: 'https://www.instagram.com/solarireland', label: 'Follow us on Instagram', hoverColor: 'hover:bg-[#E4405F]/10 hover:border-[#E4405F]/25 hover:text-[#E4405F]' },
  { icon: TikTokIcon, href: 'https://www.tiktok.com/@solarireland', label: 'Follow us on TikTok', hoverColor: 'hover:bg-white/10 hover:border-white/25 hover:text-white' },
  { icon: LinkedInIcon, href: 'https://www.linkedin.com/company/solarireland', label: 'Follow us on LinkedIn', hoverColor: 'hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/25 hover:text-[#0A66C2]' },
];


const quickLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Book a Survey', href: '/book-survey' },
  { label: 'Calculator', href: '/solar-calculator' },
  { label: 'Financing', href: '/financing' },
  { label: 'Counties', href: '/counties' },
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'How It Works', href: '/#how-it-works' },
];

const services = [
  { label: 'Solar PV Installation', desc: 'Residential & commercial panels' },
  { label: 'Battery Storage', desc: 'Store energy for evening use' },
  { label: 'Free Home Surveys', desc: 'No-obligation roof assessment' },
  { label: 'SEAI Grant Assistance', desc: 'We handle the full application' },
  { label: 'BER Assessment', desc: 'Post-install energy rating' },
];

const serviceAreas = [
  { province: 'Leinster', counties: 'Dublin, Kildare, Wicklow, Meath, Louth, Wexford' },
  { province: 'Munster', counties: 'Cork, Limerick, Clare, Tipperary, Kerry' },
  { province: 'Connacht', counties: 'Galway, Mayo, Roscommon, Sligo' },
];

const certifications = [
  { icon: ShieldCheck, label: 'SEAI Registered Installer', color: 'text-green-400' },
  { icon: CheckCircle2, label: 'RECI Certified Electrician', color: 'text-amber-400' },
  { icon: Zap, label: 'Safe Electric Approved', color: 'text-sky-400' },
  { icon: Star, label: 'NSAI Compliant (ET101)', color: 'text-violet-400' },
  { icon: Sun, label: 'Microgeneration Certified', color: 'text-orange-400' },
];

const trustBadges = [
  { icon: ShieldCheck, label: 'SEAI Registered', color: 'text-green-400', bg: 'bg-green-400/10' },
  { icon: CheckCircle2, label: 'RECI Certified', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { icon: Clock, label: '1-Day Install', color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { icon: Shield, label: '25-Year Warranty', color: 'text-violet-400', bg: 'bg-violet-400/10' },
];


function PreFooterCTA() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400/15 via-amber-500/[0.08] to-amber-400/[0.04] border border-amber-400/10 p-8 sm:p-12"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7 }}
    >
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-400/[0.06] rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-amber-400/[0.04] rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
            Still have questions?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-lg leading-relaxed mx-auto lg:mx-0">
            We&apos;re real people, not a call centre. Drop us a WhatsApp or give us a
            ring — we&apos;re happy to talk through whether solar is right for your
            home. No pressure, no jargon.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <motion.a
            href={buildWhatsAppUrl({ source: 'footer' })}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-shadow whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Us
            <ArrowRight className="w-4 h-4" />
          </motion.a>
          <motion.a
            href={`tel:${SOLAR_DATA.provider.phone}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-white/20 bg-black/40 text-white text-sm hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

function CertBadge({ icon: Icon, label, color }: (typeof certifications)[0]) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04] cursor-default"
    >
      <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
      <span className="text-[10px] sm:text-xs text-gray-400 font-medium">{label}</span>
    </motion.div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  color: string;
}) {
  const isExternal = href.startsWith('http');

  return (
    <motion.a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      whileHover={{ y: -2, scale: 1.01 }}
      className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer"
    >
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors truncate text-ellipsis" dir="ltr">
          {value}
        </p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-400 transition-colors shrink-0" />
    </motion.a>
  );
}

function BackToTop() {
  return (
    <motion.button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
      className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all"
      aria-label="Back to top"
    >
      <ChevronUp className="w-4 h-4" />
    </motion.button>
  );
}

function TrustBadgesRow() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className="pb-10 sm:pb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center justify-center gap-3 cursor-default"
            >
              <div
                className={`w-10 h-10 rounded-xl ${badge.bg} flex items-center justify-center shrink-0`}
              >
                <badge.icon className={`w-5 h-5 ${badge.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">
                  {badge.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: '-50px' });

  return (
    <footer ref={footerRef} role="contentinfo" className="border-t border-white/[0.05] relative">
      <div className="amber-line" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-12 sm:pt-16 pb-10 sm:pb-14">
          <PreFooterCTA />
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 pb-12 sm:pb-16 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo-sm.webp"
                alt="Solar Ireland"
                className="h-9 w-auto"
                width={36}
                height={41}
              />
              <span className="font-bold text-lg text-white tracking-tight">
                Solar Ireland
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
              SEAI-registered solar panel installers covering all 32 counties.
              We provide honest advice, quality installations, and genuine
              aftercare — no pressure, no hard sell, no jargon.
            </p>

            <div className="flex items-center gap-2.5">
              {FOOTER_SOCIAL.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 ${social.hoverColor} transition-all duration-200`}
                  aria-label={social.label}
                >
                  <social.icon className="w-[18px] h-[18px]" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-400 transition-colors py-1"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-amber-400/50 transition-all duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-4">
              What We Do
            </h3>
            <ul className="space-y-2.5">
              {services.map((service) => (
                <li
                  key={service.label}
                  className="group cursor-default"
                >
                  <p className="text-sm text-gray-400 group-hover:text-white transition-colors font-medium">
                    {service.label}
                  </p>
                  <p className="text-[11px] text-gray-400 group-hover:text-gray-400 transition-colors mt-0.5">
                    {service.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-4">
              Get in Touch
            </h3>
            <div className="space-y-2.5">
              <ContactCard
                icon={MessageCircle}
                label="WhatsApp"
                value={SOLAR_DATA.provider.phoneDisplay}
                href={buildWhatsAppUrl({ source: 'footer' })}
                color="bg-green-400/10 text-green-400"
              />
              <ContactCard
                icon={Mail}
                label="Email"
                value={SOLAR_DATA.provider.email}
                href={`mailto:${SOLAR_DATA.provider.email}`}
                color="bg-amber-400/10 text-amber-400"
              />
              <ContactCard
                icon={Phone}
                label="Phone"
                value={SOLAR_DATA.provider.phoneDisplay}
                href={`tel:${SOLAR_DATA.provider.phone}`}
                color="bg-sky-400/10 text-sky-400"
              />
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Working Hours
                </p>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed">
                <span className="text-gray-300 font-medium">Mon–Fri:</span> 8am–6pm
                <span className="mx-1.5 text-white/[0.08]">|</span>
                <span className="text-gray-300 font-medium">Sat:</span> 9am–2pm
                <span className="mx-1.5 text-white/[0.08]">|</span>
                <span className="text-gray-300 font-medium">Sun:</span>{' '}
                <span className="text-gray-400">Closed</span>
              </p>
            </div>
          </div>
        </div>

        <motion.div
          className="pb-10 sm:pb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-4 h-4 text-amber-400/50" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              Service Areas
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {serviceAreas.map((area) => (
              <div
                key={area.province}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400/50 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{area.province}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    {area.counties}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="pb-10 sm:pb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="w-4 h-4 text-amber-400/50" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              Certifications &amp; Compliance
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {certifications.map((cert) => (
              <CertBadge key={cert.label} {...cert} />
            ))}
          </div>
        </motion.div>

        <TrustBadgesRow />

        <div className="border-t border-white/[0.04] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] sm:text-[11px] text-gray-400">
            <span>&copy; {new Date().getFullYear()} Solar Ireland. All rights reserved.</span>
            <span className="hidden sm:inline text-white/[0.06]">·</span>
            <span>Company Reg: TBC</span>
            <span className="hidden sm:inline text-white/[0.06]">·</span>
            <span>ROI Tax Reg: TBC</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/privacy"
              className="text-[10px] sm:text-[11px] text-gray-400 hover:text-gray-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-[10px] sm:text-[11px] text-gray-400 hover:text-gray-400 transition-colors"
            >
              Terms &amp; Conditions
            </a>
            <a
              href="/cookies"
              className="text-[10px] sm:text-[11px] text-gray-400 hover:text-gray-400 transition-colors"
            >
              Cookie Policy
            </a>
            <BackToTop />
          </div>
        </div>
      </div>

    </footer>
  );
}
