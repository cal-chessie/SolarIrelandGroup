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
  Zap,
  CheckCircle2,
  Star,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  ExternalLink,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

const quickLinks = [
  { label: 'Services', href: '/services' },
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

/* ═══════════════════════════════════════════════════════
   PRE-FOOTER CTA BANNER
   ═══════════════════════════════════════════════════════ */
function PreFooterCTA() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400/15 via-amber-500/[0.08] to-amber-400/[0.04] border border-amber-400/10 p-8 sm:p-12"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7 }}
    >
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-400/[0.06] rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-amber-400/[0.04] rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Text */}
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

        {/* Buttons */}
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

/* ═══════════════════════════════════════════════════════
   CERTIFICATION BADGE
   ═══════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════
   CONTACT CARD
   ═══════════════════════════════════════════════════════ */
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
  const Tag = isExternal ? 'a' : 'a';

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
        <p className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors truncate">
          {value}
        </p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0" />
    </motion.a>
  );
}

/* ═══════════════════════════════════════════════════════
   BACK TO TOP BUTTON
   ═══════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════
   MAIN FOOTER
   ═══════════════════════════════════════════════════════ */
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: '-50px' });

  return (
    <footer ref={footerRef} className="border-t border-white/[0.05] relative">
      {/* Amber divider line */}
      <div className="amber-line" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Pre-footer CTA ─── */}
        <div className="pt-12 sm:pt-16 pb-10 sm:pb-14">
          <PreFooterCTA />
        </div>

        {/* ─── Main footer grid ─── */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 pb-12 sm:pb-16 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* ─── Company column ─── */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo-sm.webp"
                alt="Solar Ireland"
                className="h-9 w-auto"
                width={36}
                height={36}
              />
              <span className="font-bold text-lg text-white tracking-tight">
                Solar Ireland
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-6">
              SEAI-registered solar panel installers covering all 32 counties.
              We provide honest advice, quality installations, and genuine
              aftercare — no pressure, no hard sell, no jargon.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2.5">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* ─── Quick links ─── */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-gray-600 hover:text-amber-400 transition-colors py-1"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-amber-400/50 transition-all duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Services ─── */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 mb-4">
              What We Do
            </h4>
            <ul className="space-y-2.5">
              {services.map((service) => (
                <li
                  key={service.label}
                  className="group cursor-default"
                >
                  <p className="text-sm text-gray-400 group-hover:text-white transition-colors font-medium">
                    {service.label}
                  </p>
                  <p className="text-[11px] text-gray-700 group-hover:text-gray-500 transition-colors mt-0.5">
                    {service.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Contact ─── */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 mb-4">
              Get in Touch
            </h4>
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
                href="mailto:cal@solarireland.com"
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
          </div>
        </div>

        {/* ─── Service areas ─── */}
        <motion.div
          className="pb-10 sm:pb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-4 h-4 text-amber-400/50" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
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
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                    {area.counties}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Certifications bar ─── */}
        <motion.div
          className="pb-10 sm:pb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="w-4 h-4 text-amber-400/50" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
              Certifications & Compliance
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {certifications.map((cert) => (
              <CertBadge key={cert.label} {...cert} />
            ))}
          </div>
        </motion.div>

        {/* ─── Bottom legal strip ─── */}
        <div className="border-t border-white/[0.04] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] sm:text-[11px] text-gray-700">
            <span>&copy; {new Date().getFullYear()} Solar Ireland. All rights reserved.</span>
            <span className="hidden sm:inline text-white/[0.06]">·</span>
            <span>Company Reg: 123456</span>
            <span className="hidden sm:inline text-white/[0.06]">·</span>
            <span>ROI Tax Reg: 1234567TH</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="/privacy" className="text-[10px] sm:text-[11px] text-gray-700 hover:text-gray-400 transition-colors">
              Privacy Policy
            </a>
            <a href="/privacy" className="text-[10px] sm:text-[11px] text-gray-700 hover:text-gray-400 transition-colors">
              Terms of Service
            </a>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
