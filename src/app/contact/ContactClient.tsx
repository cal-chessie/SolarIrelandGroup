'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import Link from 'next/link';
import {
  ChevronRight,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  MapPin,
  ArrowRight,
  Send,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Sparkles,
  User,
  Building2,
  FileText,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';


const counties = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal',
  'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath',
  'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
];

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Fastest way to reach us. Send a message and we\'ll reply within minutes during office hours.',
    action: 'Start Chat',
    href: buildWhatsAppUrl({ source: 'contact-page' }),
    external: true,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    borderHover: 'hover:border-green-400/20',
  },
  {
    icon: Phone,
    title: 'Phone',
    description: 'Speak directly with our team. Available Monday to Saturday for solar questions and bookings.',
    action: `Call ${SOLAR_DATA.provider.phoneDisplay}`,
    href: `tel:${SOLAR_DATA.provider.phone}`,
    external: false,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    borderHover: 'hover:border-sky-400/20',
  },
  {
    icon: Mail,
    title: 'Email',
    description: 'Send us a detailed message anytime. We typically respond within 24 hours.',
    action: SOLAR_DATA.provider.email,
    href: `mailto:${SOLAR_DATA.provider.email}`,
    external: false,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    borderHover: 'hover:border-amber-400/20',
  },
];

const officeHours = [
  { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM', current: false },
  { day: 'Saturday', hours: '9:00 AM - 2:00 PM', current: false },
  { day: 'Sunday', hours: 'Closed', current: false },
];

const provinces = [
  {
    name: 'Leinster',
    counties: 'Dublin, Wicklow, Wexford, Carlow, Kildare, Meath, Louth, Longford, Westmeath, Offaly, Laois, Kilkenny',
  },
  {
    name: 'Munster',
    counties: 'Cork, Kerry, Limerick, Clare, Tipperary, Waterford',
  },
  {
    name: 'Connacht',
    counties: 'Galway, Mayo, Roscommon, Sligo, Leitrim',
  },
  {
    name: 'Ulster',
    counties: 'Donegal, Cavan, Monaghan, Antrim, Armagh, Derry, Down, Fermanagh, Tyrone',
  },
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

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    county: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Submission failed.' }));
        throw new Error(data.error || 'Submission failed');
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClasses =
    'w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/10 transition-all duration-200';

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
              Thanks {formData.name ? formData.name.split(' ')[0] : ''}! We&apos;ve received your message and
              we&apos;ll get back to you within 24 hours. In the meantime, feel free to
              reach us on WhatsApp for a faster response.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href={buildWhatsAppUrl({ source: 'contact-form-success' })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500 text-white text-sm font-medium shadow-lg shadow-green-500/15 hover:bg-green-400 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', county: '', message: '' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-gray-400 text-sm hover:bg-white/[0.06] transition-all"
              >
                Send Another
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Send Us a Message</h3>
              <p className="text-xs text-gray-500">
                Fill in the form below and we&apos;ll get back to you within 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10`}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10`}
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="08X XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10`}
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none z-10" />
                <select
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10 appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-[#1a1a1a] text-gray-400">
                    Select your county
                  </option>
                  {counties.map((county) => (
                    <option key={county} value={county} className="bg-[#1a1a1a] text-white">
                      {county}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-600 pointer-events-none" />
              <textarea
                name="message"
                placeholder="Tell us about your home, roof type, or any questions you have..."
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                className={`${inputClasses} pl-10 resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/50 text-black font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-amber-400/15 hover:shadow-amber-400/25"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-600 text-center">
              By submitting this form you agree to be contacted by Solar Ireland regarding
              your enquiry. We never share your data.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactClient() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        {/* 
            HERO SECTION
             */}
        <section className="relative overflow-hidden">
          <div className="absolute top-20 -right-32 w-[400px] h-[400px] bg-amber-400/[0.04] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-400/[0.03] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="relative z-10"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
              </motion.div>

              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.6 }}
                className="mt-6 sm:mt-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight max-w-3xl"
              >
                Get in{' '}
                <span className="text-gradient">Touch</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.6 }}
                className="mt-5 sm:mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed"
              >
                Have a question about solar panels? Want to book a free survey?
                Just want to chat? We&apos;re real people — reach out anytime
                and we&apos;ll get back to you fast.
              </motion.p>
            </motion.div>
          </div>

          <div className="amber-line" />
        </section>

        {/* 
            CONTACT METHODS GRID
             */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
            >
              {contactMethods.map((method) => {
                const Icon = method.icon;
                const Tag = method.external ? 'a' : 'a';
                return (
                  <motion.div
                    key={method.title}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                  >
                    <Tag
                      href={method.href}
                      target={method.external ? '_blank' : undefined}
                      rel={method.external ? 'noopener noreferrer' : undefined}
                      className={`block glass-card rounded-2xl p-6 h-full group cursor-pointer transition-all duration-300 ${method.borderHover}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl ${method.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-7 h-7 ${method.color}`} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{method.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4">
                        {method.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${method.color} group-hover:underline underline-offset-2`}>
                          {method.action}
                        </span>
                        <ArrowRight className={`w-4 h-4 ${method.color} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`} />
                        {method.external && (
                          <ExternalLink className={`w-3 h-3 ${method.color} opacity-50`} />
                        )}
                      </div>
                    </Tag>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* 
            CONTACT FORM + SIDEBAR
             */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6 }}
              >
                <ContactForm />
              </motion.div>

              <motion.div
                className="lg:col-span-2 space-y-5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center">
                      <Clock className="w-4.5 h-4.5 text-amber-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">Office Hours</h3>
                  </div>

                  <div className="space-y-3">
                    {officeHours.map((item) => (
                      <div
                        key={item.day}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                      >
                        <span className="text-sm text-gray-300">{item.day}</span>
                        <span className={`text-sm font-medium ${item.hours === 'Closed' ? 'text-gray-600' : 'text-white'}`}>
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-400/5 border border-green-400/10">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Typically replies within minutes</span>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-sky-400/10 flex items-center justify-center">
                      <Sparkles className="w-4.5 h-4.5 text-sky-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">What to Expect</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'No obligation or hard sell',
                      'Honest assessment of your home',
                      'Itemised quote within 48 hours',
                      'SEAI grant application handled for you',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={buildWhatsAppUrl({ source: 'contact-sidebar' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block glass-card rounded-2xl p-6 bg-green-500/[0.03] border-green-500/[0.08] hover:bg-green-500/[0.05] hover:border-green-500/15 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white">Prefer WhatsApp?</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Get instant answers. Tap to start a chat.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-green-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 
            SERVING ALL 32 COUNTIES
             */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="rounded-2xl sm:rounded-3xl glass-card p-8 sm:p-12 relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-amber-400/[0.03] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Serving All 32 Counties
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      No matter where you are in Ireland, we can help.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {provinces.map((province) => (
                    <div
                      key={province.name}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-white">{province.name}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {province.counties}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <motion.div
                  className="mt-8 text-center sm:text-left"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <p className="text-sm text-gray-500 mb-4">
                    Don&apos;t see your area? We cover every corner of Ireland.{' '}
                    <a
                      href={buildWhatsAppUrl({ source: 'contact-counties' })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline underline-offset-2"
                    >
                      Ask us about your county
                    </a>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 
            FAQ TEASER
             */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400/15 via-amber-500/[0.08] to-amber-400/[0.04] border border-amber-400/10 p-8 sm:p-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-400/[0.06] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-7 h-7 text-amber-400" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Have Questions?
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                    We&apos;ve answered the most common questions about solar panels in
                    Ireland — from costs and grants to installation timelines and
                    warranties.
                  </p>
                </div>
                <Link
                  href="/#faq"
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm active:scale-95 transition-all shadow-lg shadow-amber-400/15 hover:shadow-amber-400/25 whitespace-nowrap"
                >
                  View FAQ
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
