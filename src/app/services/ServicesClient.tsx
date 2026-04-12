'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from '@/lib/motion';
import Link from 'next/link';
import {
  Sun,
  Battery,
  Car,
  FileText,
  BarChart3,
  Home,
  Monitor,
  Wrench,
  ChevronRight,
  Check,
  Star,
  Phone,
  ArrowRight,
  Zap,
  Shield,
  Euro,
  Clock,
  ChevronDown,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import { SOLAR_DATA } from '@/lib/solar-data';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const mainServices = [
  {
    id: 'solar-pv',
    icon: Sun,
    title: 'Solar PV Installation',
    tagline: 'Residential Solar Panels',
    price: '€4,500 – €7,500',
    grant: 'Before €1,800 SEAI Grant',
    color: 'amber',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
    borderAccent: 'border-amber-400/20',
    description:
      'Transform your roof into a clean energy power station. Our residential solar PV systems generate free electricity from daylight — reducing your bills and your carbon footprint.',
    features: [
      { label: 'System Size', value: '4 – 10 kWp' },
      { label: 'Panel Brands', value: 'LONGi, Jinko, Trina (Tier-1)' },
      { label: 'Inverters', value: 'Hybrid & String Inverters' },
      { label: 'Panel Warranty', value: '25-Year Manufacturer' },
      { label: 'Installer Warranty', value: '10-Year Workmanship' },
      { label: 'Avg. Annual Saving', value: '€800 – €1,400' },
    ],
    highlights: [
      'MCS & SEAI certified installation',
      'Smart monitoring included',
      'Grid-tied with export capability',
      'Roof assessment included free',
    ],
  },
  {
    id: 'battery',
    icon: Battery,
    title: 'Battery Storage',
    tagline: 'Store Your Solar Energy',
    price: '€4,000 – €8,000',
    grant: 'Stackable with Solar PV Grant',
    color: 'emerald',
    iconBg: 'bg-emerald-400/10',
    iconColor: 'text-emerald-400',
    borderAccent: 'border-emerald-400/20',
    description:
      'Store excess solar energy generated during the day and use it in the evening. Battery storage dramatically increases your self-consumption and protects against power cuts.',
    features: [
      { label: 'Capacity', value: '5 – 13 kWh' },
      { label: 'Battery Type', value: 'Lithium-Ion (LFP)' },
      { label: 'Coupling', value: 'AC, DC & Hybrid' },
      { label: 'Self-Consumption', value: 'Up to 80%+' },
      { label: 'Cycle Life', value: '6,000+ Cycles' },
      { label: 'Backup Option', value: 'Blackout Protection' },
    ],
    highlights: [
      'Increase self-use from 40% to 80%+',
      'Charge from grid during off-peak hours',
      'Seamless backup power option',
      'Compatible with all major inverters',
    ],
  },
  {
    id: 'ev-charger',
    icon: Car,
    title: 'EV Charger Installation',
    tagline: 'Smart Home Charging',
    price: '€1,200 – €2,500',
    grant: '€600 SEAI EV Grant Available',
    color: 'sky',
    iconBg: 'bg-sky-400/10',
    iconColor: 'text-sky-400',
    borderAccent: 'border-sky-400/20',
    description:
      'Charge your electric vehicle at home using your own solar energy. Our smart chargers can divert excess solar directly to your car — meaning free driving powered by the sun.',
    features: [
      { label: 'Power', value: '7.4kW – 22kW' },
      { label: 'Brands', value: 'Zappi, Wallbox, myEnergi' },
      { label: 'SEAI Grant', value: '€600 Available' },
      { label: 'Solar Divert', value: 'Yes — charge from solar' },
      { label: 'Scheduling', value: 'Smart Time-of-Use' },
      { label: 'App Control', value: 'iOS & Android' },
    ],
    highlights: [
      'Charge from excess solar for free',
      'SEAI-registered installer',
      'Smart load balancing included',
      'Works with all EV brands',
    ],
  },
];

const additionalServices = [
  {
    icon: FileText,
    label: 'SEAI Grant Application',
    desc: 'We handle the full grant process — from eligibility check to payment, saving you time and hassle.',
  },
  {
    icon: BarChart3,
    label: 'BER Assessment',
    desc: 'Post-install Building Energy Rating to show the true energy performance of your upgraded home.',
  },
  {
    icon: Home,
    label: 'Free Home Survey',
    desc: 'No-obligation roof and energy assessment with a detailed proposal tailored to your home.',
  },
  {
    icon: Monitor,
    label: 'System Monitoring',
    desc: 'Real-time monitoring of your solar system — generation, consumption and savings at a glance.',
  },
  {
    icon: Wrench,
    label: 'Maintenance & Cleaning',
    desc: 'Annual servicing, panel cleaning and system health checks to keep your system performing at its best.',
  },
];

const packages = [
  {
    name: 'Essential',
    price: '€4,500',
    tag: 'Best Value',
    tier: 'entry',
    features: {
      'System Size': '4 kWp',
      'Number of Panels': '8–10 Panels',
      'Panel Brand': 'Tier-1 (Trina)',
      'Inverter': 'String Inverter',
      'Battery': '—',
      'Monitoring': 'Basic App',
      'SEAI Grant': '€1,800',
      'Annual Savings': '€600–€800',
      'Payback Period': '5–6 Years',
      'Warranty': '25-Year Panel',
    },
    highlighted: false,
  },
  {
    name: 'Popular',
    price: '€6,500',
    tag: 'Most Popular',
    tier: 'popular',
    features: {
      'System Size': '6 kWp',
      'Number of Panels': '12–14 Panels',
      'Panel Brand': 'Tier-1 (LONGi)',
      'Inverter': 'Hybrid Inverter',
      'Battery': '5 kWh Battery',
      'Monitoring': 'Smart App + Portal',
      'SEAI Grant': '€1,800',
      'Annual Savings': '€900–€1,200',
      'Payback Period': '4–5 Years',
      'Warranty': '25-Year Panel + 10-Year Install',
    },
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '€9,500',
    tag: 'Max Savings',
    tier: 'premium',
    features: {
      'System Size': '10 kWp',
      'Number of Panels': '20–24 Panels',
      'Panel Brand': 'Tier-1 (Jinko)',
      'Inverter': 'Hybrid Inverter',
      'Battery': '10 kWh Battery',
      'Monitoring': 'Full Smart Monitoring',
      'SEAI Grant': '€1,800 + €600 EV',
      'Annual Savings': '€1,400–€2,000',
      'Payback Period': '4–5 Years',
      'Warranty': '25-Year Panel + 10-Year Install',
    },
    highlighted: false,
  },
];

const featureLabels = Object.keys(packages[0].features);

function ServiceCard({
  service,
  index,
}: {
  service: (typeof mainServices)[0];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const Icon = service.icon;

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded]);

  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="glass-card rounded-2xl overflow-hidden group"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-14 h-14 rounded-2xl ${service.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-7 h-7 ${service.iconColor}`} />
          </div>
          {expanded && (
            <span className="px-3 py-1 rounded-full bg-white/[0.06] text-xs text-gray-400 font-medium whitespace-nowrap">
              {service.tagline}
            </span>
          )}
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {service.title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-5">
          {service.description}
        </p>

        <div className="flex flex-wrap items-end gap-3 mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">From</p>
            <p className="text-2xl font-bold text-white">{service.price}</p>
          </div>
          <div className="pb-0.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              service.color === 'amber' ? 'bg-amber-400/10 text-amber-400' :
              service.color === 'emerald' ? 'bg-emerald-400/10 text-emerald-400' :
              'bg-sky-400/10 text-sky-400'
            }`}>
              <Euro className="w-3 h-3" />
              {service.grant}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mb-6">
          {service.features.slice(0, 4).map((f) => (
            <div key={f.label} className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider whitespace-normal">{f.label}</span>
              <span className="text-sm text-gray-300 font-medium leading-snug">{f.value}</span>
            </div>
          ))}
        </div>

        {!expanded && service.features.length > 4 && (
          <p className="text-xs text-gray-600 mb-4">+ {service.features.length - 4} more specifications below</p>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] active:scale-[0.99] transition-all"
        >
          <span>{expanded ? 'Show Less' : 'View Full Details'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div
        className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          maxHeight: expanded ? `${contentHeight}px` : '0px',
          opacity: expanded ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="h-px bg-white/[0.06] mb-6" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {service.features.map((f) => (
              <div key={f.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-gray-600 uppercase tracking-wider block mb-1">{f.label}</span>
                <span className="text-sm text-gray-200 font-semibold leading-snug break-words">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 mb-6">
            {service.highlights.map((h) => (
              <div key={h} className="flex items-start gap-2.5">
                <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 ${
                  service.color === 'amber' ? 'bg-amber-400/10' :
                  service.color === 'emerald' ? 'bg-emerald-400/10' :
                  'bg-sky-400/10'
                }`}>
                  <Check className={`w-3 h-3 ${
                    service.color === 'amber' ? 'text-amber-400' :
                    service.color === 'emerald' ? 'text-emerald-400' :
                    'text-sky-400'
                  }`} />
                </div>
                <span className="text-sm text-gray-400 leading-relaxed">{h}</span>
              </div>
            ))}
          </div>

          <a
            href="https://wa.me/353873958424?text=Hi%2C%20I%27m%20interested%20in%20a%20free%20quote%20for%20solar%20panels."
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
              service.color === 'amber'
                ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/15'
                : service.color === 'emerald'
                ? 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-lg shadow-emerald-400/15'
                : 'bg-sky-400 hover:bg-sky-300 text-black shadow-lg shadow-sky-400/15'
            }`}
          >
            Get a Free Quote
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        {/* 
            HERO SECTION
             */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-amber-400/[0.04] rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-400/[0.03] rounded-full blur-[80px]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16">
            <motion.nav
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 text-sm text-gray-500 mb-8"
            >
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-300">Services</span>
            </motion.nav>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Full-Service Solar Installer
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Solar Panel Services{' '}
                <span className="text-gradient">Ireland</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mb-8">
                From residential solar PV and battery storage to EV charging — we deliver
                end-to-end clean energy solutions for homes across all 32 counties.
                Every installation backed by our 10-year workmanship warranty.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="https://wa.me/353873958424?text=Hi%2C%20I%27m%20interested%20in%20a%20free%20quote%20for%20solar%20panels."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-400/15"
                >
                  Get a Free Quote
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="tel:+353873958424"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/[0.12] bg-white/[0.03] text-white text-sm font-medium hover:bg-white/[0.06] hover:border-white/[0.2] transition-all"
                >
                  <Phone className="w-4 h-4" />
                  {SOLAR_DATA.provider.phoneDisplay}
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-white/[0.06]">
                {[
                  { icon: Shield, label: 'SEAI Registered', color: 'text-green-400' },
                  { icon: Star, label: '25-Year Warranty', color: 'text-amber-400' },
                  { icon: Clock, label: '1-Day Install', color: 'text-sky-400' },
                  { icon: Euro, label: '€1,800 Grant (ROI)', color: 'text-emerald-400' },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2">
                    <badge.icon className={`w-4 h-4 ${badge.color}`} />
                    <span className="text-sm text-gray-400">{badge.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 
            MAIN SERVICES GRID
             */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-12 text-center"
            >
              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
              >
                Our Core <span className="text-gradient">Services</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-gray-400 max-w-xl mx-auto"
              >
                Comprehensive solar energy solutions tailored to Irish homes.
                Every system designed for maximum performance and savings.
              </motion.p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {mainServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* 
            ADDITIONAL SERVICES
             */}
        <section className="py-16 sm:py-24 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-12"
            >
              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center"
              >
                Additional <span className="text-gradient">Services</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-gray-400 max-w-xl mx-auto text-center"
              >
                Everything you need for a complete solar journey — from initial survey to ongoing maintenance.
              </motion.p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              {additionalServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.label}
                    variants={fadeUp}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="glass-card rounded-xl p-5 group cursor-default"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">{service.label}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{service.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* 
            COMPARISON TABLE
             */}
        <section className="py-16 sm:py-24 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-12 text-center"
            >
              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
              >
                Compare <span className="text-gradient">Packages</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-gray-400 max-w-xl mx-auto"
              >
                Choose the right solar package for your home and budget.
                All packages include free survey, installation and grid connection.
              </motion.p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.name}
                  variants={fadeUp}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  className={`relative rounded-2xl overflow-hidden ${
                    pkg.highlighted
                      ? 'bg-gradient-to-b from-amber-400/[0.08] to-transparent border-2 border-amber-400/30'
                      : 'glass-card border border-white/[0.06]'
                  }`}
                >
                  {pkg.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  )}
                  {pkg.highlighted && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <div className="mb-6">
                      <p className={`text-xs uppercase tracking-wider font-semibold mb-2 ${
                        pkg.highlighted ? 'text-amber-400' : 'text-gray-500'
                      }`}>
                        {pkg.tag}
                      </p>
                      <h3 className="text-2xl font-bold text-white mb-1">{pkg.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">{pkg.price}</span>
                        <span className="text-sm text-gray-500">from</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      {featureLabels.map((label) => (
                        <div key={label} className="flex items-start justify-between gap-3 py-2 border-b border-white/[0.04] last:border-0">
                          <span className="text-xs text-gray-500 shrink-0">{label}</span>
                          <span className="text-sm text-gray-300 font-medium text-right">
                            {pkg.features[label as keyof typeof pkg.features]}
                          </span>
                        </div>
                      ))}
                    </div>

                    <a
                      href={`https://wa.me/353873958424?text=Hi%2C%20I%27m%20interested%20in%20the%20${pkg.name}%20solar%20package.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        pkg.highlighted
                          ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/15'
                          : 'bg-white/[0.05] hover:bg-white/[0.08] text-white border border-white/[0.08]'
                      }`}
                    >
                      Get a Quote
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 
            BOTTOM CTA
             */}
        <section className="py-16 sm:py-24 border-t border-white/[0.04]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400/15 via-amber-500/[0.08] to-amber-400/[0.04] border border-amber-400/10 p-8 sm:p-14 text-center">
              <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-amber-400/[0.06] rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-amber-400/[0.04] rounded-full blur-[60px] pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Switch to Solar?
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
                  Get a free, no-obligation home survey and personalised quote.
                  We cover all 32 counties and our installations typically take just one day.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="https://wa.me/353873958424?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20home%20survey."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-400/15"
                  >
                    <Zap className="w-4 h-4" />
                    Book Free Survey
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="tel:+353873958424"
                    className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full border border-white/[0.15] text-white text-sm font-medium hover:bg-white/[0.05] transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    Call +353 87 395 8424
                  </a>
                </div>
                <p className="text-xs text-gray-600 mt-6">
                  No pressure, no hard sell. Just honest advice about solar for your home.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
