'use client';

import { motion } from '@/lib/motion';
import Link from 'next/link';
import {
  ChevronRight,
  Sun,
  ShieldCheck,
  MapPin,
  Euro,
  Clock,
  CheckCircle2,
  Star,
  Zap,
  ArrowRight,
  Award,
  Heart,
  Eye,
  Ban,
  MessageCircle,
  Phone,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';


const valueProps = [
  {
    icon: Ban,
    title: 'No Hard Sell',
    description: 'We give you honest advice and a fair quote. Take your time, ask questions, and decide when you\'re ready.',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
  {
    icon: ShieldCheck,
    title: 'SEAI Registered',
    description: 'Fully registered with the Sustainable Energy Authority of Ireland. Your grant is safe in our hands.',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    icon: MapPin,
    title: 'All 32 Counties',
    description: 'From Donegal to Cork, Dublin to Galway - we install quality solar systems right across Ireland.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: Euro,
    title: 'Honest Pricing',
    description: 'Itemised quotes with no hidden fees. The price we quote is the price you pay. Simple as that.',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    icon: Clock,
    title: '25-Year Warranty',
    description: 'Our panels come with a 25-year manufacturer warranty and a 10-year installation warranty for total peace of mind.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    icon: Zap,
    title: '1-Day Install',
    description: 'Most residential installations are completed in a single day. Scaffolding up, panels on, system live.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
];

const teamMembers = [
  { initials: 'CC', name: 'Cal Chesters', role: 'Founder & Lead Installer', bio: 'Over 10 years in the Irish solar industry. Started Solar Ireland to cut through the noise and give homeowners a better experience.' },
  { initials: 'SD', name: 'Sarah Doyle', role: 'Operations Manager', bio: 'Keeps everything running smoothly - from survey scheduling to SEAI grant applications and aftercare.' },
  { initials: 'JK', name: 'James Kelly', role: 'Senior Electrician (RECI)', bio: 'RECI-certified with extensive experience in solar PV wiring, battery integration, and grid connections.' },
  { initials: 'EO', name: 'Emma O\'Brien', role: 'Customer Care', bio: 'First point of contact for most customers. Emma makes sure every question is answered and every concern addressed.' },
];

const certifications = [
  { icon: ShieldCheck, label: 'SEAI Registered Installer', desc: 'Approved by the Sustainable Energy Authority of Ireland for solar PV installations.', color: 'text-green-400' },
  { icon: CheckCircle2, label: 'RECI Certified', desc: 'All electrical work carried out by Registered Electrical Contractors of Ireland.', color: 'text-amber-400' },
  { icon: Zap, label: 'Safe Electric Approved', desc: 'Compliant with the National Rules for Electrical Installation (NSAI ET101).', color: 'text-sky-400' },
  { icon: Star, label: 'NSAI Compliant', desc: 'All installations meet NSAI standards for quality and safety.', color: 'text-violet-400' },
  { icon: Sun, label: 'Microgeneration Certified', desc: 'Certified to install systems under the ESB Microgeneration Support Scheme.', color: 'text-orange-400' },
];

const stats = [
  { value: '200+', label: 'Successful Installs', icon: CheckCircle2 },
  { value: '32', label: 'Counties Served', icon: MapPin },
  { value: '\u20AC1.1M+', label: 'Customer Savings', icon: Euro },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-700" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-amber-400 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function SectionHeader({
  badge,
  title,
  description,
}: {
  badge?: string;
  title: string;
  description?: string;
}) {
  return (
    <motion.div
      className="text-center mb-12 sm:mb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      transition={{ duration: 0.6 }}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/15 text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        {/* 
            HERO SECTION
             */}
        <section className="relative overflow-hidden">
          <div className="absolute top-20 -left-32 w-[400px] h-[400px] bg-amber-400/[0.04] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-amber-400/[0.03] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="relative z-10"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
              </motion.div>

              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.6 }}
                className="mt-6 sm:mt-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight max-w-3xl"
              >
                Making Solar{' '}
                <span className="text-gradient">Accessible</span>{' '}
                to Every Irish Home
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.6 }}
                className="mt-5 sm:mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed"
              >
                We&apos;re Solar Ireland - a SEAI-registered team of solar installers
                on a mission to cut through the jargon, eliminate the hard sell,
                and help Irish homeowners save money with clean energy.
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm active:scale-95 transition-all shadow-lg shadow-amber-400/15 hover:shadow-amber-400/25"
                >
                  <Sparkles className="w-4 h-4" />
                  Get Your Free Estimate
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={buildWhatsAppUrl({ source: 'about-page' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 bg-white/[0.03] text-white text-sm hover:bg-white/[0.06] transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  Chat With Us
                </a>
              </motion.div>
            </motion.div>
          </div>

          <div className="amber-line" />
        </section>

        {/* 
            OUR STORY
             */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden glass-card p-0">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400/10 via-amber-500/[0.05] to-amber-400/[0.02] flex items-center justify-center relative">
                    <div className="absolute inset-0 honeycomb-bg" />
                    <div className="relative z-10 text-center p-8">
                      <div className="w-20 h-20 rounded-2xl bg-amber-400/10 flex items-center justify-center mx-auto mb-4">
                        <Sun className="w-10 h-10 text-amber-400" />
                      </div>
                      <p className="text-xl font-bold text-white">Founded 2023</p>
                      <p className="text-sm text-gray-500 mt-1">Dublin, Ireland</p>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -bottom-4 -right-4 sm:bottom-4 sm:right-4 glass-card rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-400/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Customer First</p>
                      <p className="text-[11px] text-gray-500">Always has been, always will be</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7 }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/15 text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-4">
                  Our Story
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-6">
                  Tired of the hard sell? So were we.
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-gray-400 leading-relaxed">
                  <p>
                    Solar Ireland was founded in 2019 by Cal Chesters after years
                    of working in the Irish solar industry and seeing the same problems
                    repeat: pushy sales tactics, confusing pricing, and homeowners left
                    in the dark about what they were actually getting.
                  </p>
                  <p>
                    We believed there had to be a better way. A way where homeowners
                    could get honest, jargon-free advice, transparent pricing, and a
                    quality installation - without the pressure.
                  </p>
                  <p>
                    Today, we&apos;re a growing team of certified installers serving
                    all 32 counties. We&apos;ve completed over 200 installations and
                    helped our customers save more than &euro;1.1 million on their
                    electricity bills. And we&apos;re just getting started.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Our Mission</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Make solar energy accessible and stress-free for every Irish homeowner.
                    </p>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Our Values</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Honesty, quality, transparency, and genuine care for our customers.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 
            WHY SOLAR IRELAND
             */}
        <section className="py-16 sm:py-24 relative">
          <div className="absolute inset-0 honeycomb-bg pointer-events-none" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <SectionHeader
              badge="Why Choose Us"
              title="The Solar Ireland Difference"
              description="We do things differently. Here's what sets us apart from every other solar installer in Ireland."
            />

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
            >
              {valueProps.map((prop) => {
                const Icon = prop.icon;
                return (
                  <motion.div
                    key={prop.title}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -4 }}
                    className="glass-card rounded-2xl p-6 group cursor-default"
                  >
                    <div className={`w-12 h-12 rounded-xl ${prop.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${prop.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{prop.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{prop.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* 
            TEAM SECTION
             */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="Our Team"
              title="The People Behind Solar Ireland"
              description="A small, dedicated team who genuinely care about helping Irish homeowners go solar."
            />

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
            >
              {teamMembers.map((member) => (
                <motion.div
                  key={member.name}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="glass-card rounded-2xl p-6 text-center group cursor-default"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-500/10 border-2 border-amber-400/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-lg font-bold text-amber-400">{member.initials}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{member.name}</h3>
                  <p className="text-xs text-amber-400 font-medium mt-1">{member.role}</p>
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 
            CERTIFICATIONS
             */}
        <section className="py-16 sm:py-24 relative">
          <div className="amber-line mb-16" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="Certifications"
              title="Fully Certified & Compliant"
              description="We don't cut corners. Every installation meets the highest Irish standards."
            />

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
            >
              {certifications.map((cert) => {
                const Icon = cert.icon;
                return (
                  <motion.div
                    key={cert.label}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -2 }}
                    className="glass-card rounded-2xl p-6 group cursor-default"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className={`w-5 h-5 ${cert.color}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">{cert.label}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{cert.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-2xl p-6 sm:col-span-2 lg:col-span-3"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-11 h-11 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Insurance & Guarantee</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Full public liability insurance and professional indemnity cover.
                      All installations are guaranteed for 10 years, with panel manufacturer warranties
                      lasting 25 years. If anything goes wrong, we&apos;ll fix it - no quibbles.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 
            STATS SECTION
             */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="rounded-2xl sm:rounded-3xl glass-card p-8 sm:p-12 relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-400/[0.04] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-amber-400/[0.03] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/15 text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-4">
                    By The Numbers
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                    Results That Speak for Themselves
                  </h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="text-center p-4"
                      >
                        <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center mx-auto mb-3">
                          <Icon className="w-6 h-6 text-amber-400" />
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                          {stat.value}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 
            CTA SECTION
             */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400/15 via-amber-500/[0.08] to-amber-400/[0.04] border border-amber-400/10 p-8 sm:p-12 lg:p-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-400/[0.06] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-amber-400/[0.04] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                    Ready to See What You Could Save?
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-gray-400 max-w-lg leading-relaxed mx-auto lg:mx-0">
                    Use our free AI-powered Bill Analyser to get a personalised savings
                    estimate based on your actual electricity usage. It takes less than
                    2 minutes.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <Link
                    href="/#calculator"
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm active:scale-95 transition-all shadow-lg shadow-amber-400/15 hover:shadow-amber-400/25 whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Your Free Estimate
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href={buildWhatsAppUrl({ source: 'about-cta' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-white/20 bg-black/40 text-white text-sm hover:bg-white/10 transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4" />
                    Call Us
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
