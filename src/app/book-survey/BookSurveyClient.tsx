'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from '@/lib/motion';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  ChevronRight,
  Check,
  Shield,
  Star,
  Zap,
  ArrowRight,
  Building2,
  AlertCircle,
  Loader2,
  PartyPopper,
  Sparkles,
  Quote,
  Timer,
  Award,
  ThumbsUp,
  ChevronDown,
  Sun,
  Battery,
  Car,
  HelpCircle,
  Heart,
  MessageSquare,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/* ─── Data ─── */

const propertyTypes = [
  { value: 'detached', label: 'Detached House', icon: '🏠' },
  { value: 'semi-detached', label: 'Semi-Detached', icon: '🏘️' },
  { value: 'terraced', label: 'Terraced', icon: '🧱' },
  { value: 'bungalow', label: 'Bungalow', icon: '🏡' },
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'cottage', label: 'Cottage', icon: '🪵' },
];

const roofTypes = [
  { value: 'pitched-tiled', label: 'Pitched – Tiled', desc: 'Most common in Ireland' },
  { value: 'pitched-slate', label: 'Pitched – Slate', desc: 'Common in older homes' },
  { value: 'pitched-metal', label: 'Pitched – Metal', desc: 'Standing seam or corrugated' },
  { value: 'flat', label: 'Flat Roof', desc: 'Requires specialised mounting' },
  { value: 'not-sure', label: 'Not Sure', desc: "We'll check for you" },
];

const timeSlots = [
  { label: 'Morning', time: '9am – 12pm', value: 'morning', icon: '🌅' },
  { label: 'Afternoon', time: '12pm – 3pm', value: 'afternoon', icon: '☀️' },
  { label: 'Late Afternoon', time: '3pm – 6pm', value: 'late-afternoon', icon: '🌇' },
];

function getAvailableDates(): { date: Date; label: string; dayName: string; month: string }[] {
  const dates: { date: Date; label: string; dayName: string; month: string }[] = [];
  const now = new Date();
  let added = 0;
  for (let i = 1; i <= 21 && added < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (d.getDay() === 0) continue;
    dates.push({
      date: d,
      label: d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' }),
      dayName: d.toLocaleDateString('en-IE', { weekday: 'short' }),
      month: d.toLocaleDateString('en-IE', { month: 'short' }),
    });
    added++;
  }
  return dates;
}

const availableDates = getAvailableDates();

const interests = [
  { label: 'Solar PV Panels', value: 'solar-pv', icon: Sun, desc: 'Generate your own electricity' },
  { label: 'Battery Storage', value: 'battery', icon: Battery, desc: 'Store excess energy for evening use' },
  { label: 'EV Charger', value: 'ev-charger', icon: Car, desc: 'Charge your electric vehicle for free' },
  { label: "Not Sure — Advise Me", value: 'advise', icon: HelpCircle, desc: "We'll recommend the best setup" },
];

const irishCounties = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal',
  'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath',
  'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
];

const stepLabels = ['Your Details', 'Your Property', 'Schedule', 'Confirm'];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  county: string;
  propertyType: string;
  roofType: string;
  householdSize: string;
  currentBill: string;
  preferredDate: string;
  preferredTime: string;
  interest: string[];
  notes: string;
}

const testimonials = [
  {
    name: 'Sarah O\'Brien',
    location: 'Dublin',
    rating: 5,
    text: 'The survey was incredibly thorough. The assessor explained everything clearly and I had my quote the next day. Absolutely no pressure. Ended up saving €1,400 a year on electricity bills!',
    system: 'Solar PV + Battery',
  },
  {
    name: 'Michael Murphy',
    location: 'Cork',
    rating: 5,
    text: 'Best decision we ever made. From booking to installation, everything was seamless. The survey gave us total confidence in what we were getting. Highly recommend.',
    system: 'Solar PV + EV Charger',
  },
  {
    name: 'Emma Kavanagh',
    location: 'Kildare',
    rating: 5,
    text: 'We were hesitant about solar, but the free survey completely changed our minds. The assessor showed us exactly how much we\'d save and helped us get the SEAI grant sorted.',
    system: 'Solar PV + Battery',
  },
];

const faqItems = [
  {
    q: 'Is the solar survey really free?',
    a: 'Yes, 100% free with absolutely no obligation. Our SEAI-registered assessor visits your home at a time that suits you, evaluates your roof space, shading, and energy usage, then provides a detailed, honest quote. You won\'t be pressured into anything — ever.',
  },
  {
    q: 'How long does the survey take?',
    a: 'Typically 30 to 45 minutes. Our assessor checks your roof orientation and pitch, measures available space, evaluates your electrical setup, and answers all your questions. They\'ll also explain the SEAI grant process and estimated payback period.',
  },
  {
    q: 'What areas do you cover?',
    a: 'We cover all 32 counties across the Republic of Ireland and Northern Ireland. With assessors based in Dublin, Cork, Galway, and Limerick, we can reach most locations within 2-3 working days.',
  },
  {
    q: 'What happens after I book?',
    a: 'You\'ll receive a confirmation by text and email within 2 hours. On the day of your survey, our assessor arrives at your chosen time, completes the assessment, and you\'ll receive your itemised quote with savings estimate within 48 hours.',
  },
  {
    q: 'Do I need to prepare anything for the survey?',
    a: 'Not at all! Just ensure our assessor can access your roof area (either from outside or in the attic if needed). It helps to have a recent electricity bill handy so we can calculate your potential savings accurately, but it\'s not required.',
  },
  {
    q: 'What if I\'m not sure what system I need?',
    a: 'That\'s perfectly fine — and very common! Select "Not Sure — Advise Me" in the form, and our assessor will evaluate your property and recommend the ideal setup. Many of our customers start this way and end up with a system perfectly matched to their home and budget.',
  },
];

/* ─── Main Component ─── */

export default function BookSurveyClient() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    county: '',
    propertyType: '',
    roofType: '',
    householdSize: '',
    currentBill: '',
    preferredDate: '',
    preferredTime: '',
    interest: [],
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(formRef, { once: true, margin: '-80px' });

  const update = useCallback((field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const toggleInterest = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      interest: prev.interest.includes(value)
        ? prev.interest.filter((i) => i !== value)
        : [...prev.interest, value],
    }));
  }, []);

  const validateStep = useCallback((s: number): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};

    if (s === 0) {
      if (!formData.firstName.trim()) e.firstName = 'Required';
      if (!formData.lastName.trim()) e.lastName = 'Required';
      if (!formData.email.trim()) e.email = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Please enter a valid email';
      if (!formData.phone.trim()) e.phone = 'Required';
      else if (!/^[\d\s+\-()]{7,15}$/.test(formData.phone.replace(/\s/g, ''))) e.phone = 'Please enter a valid phone number';
    }

    if (s === 1) {
      if (!formData.address.trim()) e.address = 'Required';
      if (!formData.county) e.county = 'Please select your county';
      if (!formData.propertyType) e.propertyType = 'Please select your property type';
      if (!formData.roofType) e.roofType = 'Please select your roof type';
    }

    if (s === 2) {
      if (!formData.preferredDate) e.preferredDate = 'Please select a date';
      if (!formData.preferredTime) e.preferredTime = 'Please select a time slot';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  const nextStep = useCallback(() => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  }, [step, validateStep]);

  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const dateObj = availableDates.find((d) => d.date.toISOString() === formData.preferredDate);
    const dateStr = dateObj ? `${dateObj.dayName} ${dateObj.label}` : formData.preferredDate;
    const timeStr = timeSlots.find((t) => t.value === formData.preferredTime)?.label || formData.preferredTime;
    const interestStr = formData.interest.length > 0
      ? formData.interest.map(v => interests.find(i => i.value === v)?.label || v).join(', ')
      : 'Not specified';
    const propType = propertyTypes.find(p => p.value === formData.propertyType)?.label || formData.propertyType;
    const roof = roofTypes.find(r => r.value === formData.roofType)?.label || formData.roofType;

    const message = encodeURIComponent(
      `📅 SOLAR SURVEY BOOKING\n\n` +
      `👤 Name: ${formData.firstName} ${formData.lastName}\n` +
      `📞 Phone: ${formData.phone}\n` +
      `📧 Email: ${formData.email}\n` +
      `🏠 Address: ${formData.address}\n` +
      `📍 County: ${formData.county}\n` +
      `🏗️ Property: ${propType}\n` +
      `🏠 Roof: ${roof}\n` +
      (formData.householdSize ? `👨‍👩‍👧‍👦 Household: ${formData.householdSize} people\n` : '') +
      (formData.currentBill ? `💳 Current Bill: €${formData.currentBill}/month\n` : '') +
      `📆 Preferred Date: ${dateStr}\n` +
      `🕐 Preferred Time: ${timeStr}\n` +
      `☀️ Interest: ${interestStr}\n` +
      (formData.notes ? `📝 Notes: ${formData.notes}\n` : '')
    );

    window.open(`https://wa.me/${SOLAR_DATA.provider.whatsapp}?text=${message}`, '_blank');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  }, [formData]);

  const totalSteps = stepLabels.length;
  const progressPercent = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        {/* ═══════ HERO SECTION ═══════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-amber-400/[0.05] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-green-400/[0.04] rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/[0.02] rounded-full blur-[80px]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 sm:pb-12">
            {/* Breadcrumb */}
            <motion.nav
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 text-sm text-gray-500 mb-8"
            >
              <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-300">Book a Survey</span>
            </motion.nav>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left — Copy */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                    Free — No Obligation
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-6">
                  Book Your Free{' '}
                  <span className="text-gradient">Solar Survey</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl mb-8">
                  Takes 60 seconds to book. Our SEAI-registered assessor visits your home, evaluates your roof, and delivers an honest quote with estimated savings within 48 hours.
                </p>

                {/* Key stats */}
                <div className="flex items-center gap-5 sm:gap-6">
                  {[
                    { value: '30-45', unit: 'min', label: 'Survey Duration' },
                    { value: '2,847', unit: '+', label: 'Surveys Completed' },
                    { value: '48', unit: 'hrs', label: 'Quote Turnaround' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {stat.value}<span className="text-amber-400">{stat.unit}</span>
                      </div>
                      <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium mt-1 leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right — Trust Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="hidden lg:block"
              >
                <div className="glass-card rounded-3xl p-8 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/[0.06] rounded-full blur-[60px]" />
                  
                  <div className="space-y-6 relative">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-green-400/10 flex items-center justify-center">
                        <Shield className="w-7 h-7 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">SEAI Registered Installer</h3>
                        <p className="text-sm text-gray-500">Fully accredited & insured</p>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.06]" />

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-400/10 flex items-center justify-center">
                        <Award className="w-7 h-7 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">€1,800 SEAI Grant (ROI)</h3>
                        <p className="text-sm text-gray-500">We handle all grant paperwork for you</p>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.06]" />

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-sky-400/10 flex items-center justify-center">
                        <Star className="w-7 h-7 text-sky-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">4.9★ from 200+ Reviews</h3>
                        <p className="text-sm text-gray-500">Rated excellent on Google & Trustpilot</p>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.06]" />

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-violet-400/10 flex items-center justify-center">
                        <MapPin className="w-7 h-7 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">All 32 Counties</h3>
                        <p className="text-sm text-gray-500">Nationwide coverage with local assessors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════ FORM SECTION ═══════ */}
        <section className="py-8 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" ref={formRef}>
            {!isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                {/* ── Progress bar ── */}
                <div className="mb-8 sm:mb-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Step {step + 1} of {totalSteps}</span>
                    <span className="text-sm text-gray-500">{stepLabels[step]}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      initial={false}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {stepLabels.map((label, i) => (
                      <button
                        key={label}
                        onClick={() => i < step && setStep(i)}
                        className={`flex items-center gap-1.5 transition-all ${
                          i < step ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                            i < step
                              ? 'bg-green-400 text-black'
                              : i === step
                              ? 'bg-amber-400 text-black ring-4 ring-amber-400/20'
                              : 'bg-white/[0.06] text-gray-600'
                          }`}
                        >
                          {i < step ? <Check className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-medium hidden sm:inline ${
                          i === step ? 'text-white' : i < step ? 'text-green-400' : 'text-gray-600'
                        }`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Step content ── */}
                <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {/* ══ STEP 0: Personal Details ══ */}
                    {step === 0 && (
                      <motion.div
                        key="step-0"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.35 }}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Your Details</h2>
                            <p className="text-sm text-gray-500">So we can confirm your appointment.</p>
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <InputField
                            label="First Name"
                            icon={User}
                            value={formData.firstName}
                            onChange={(v) => update('firstName', v)}
                            error={errors.firstName}
                            placeholder="e.g. John"
                          />
                          <InputField
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(v) => update('lastName', v)}
                            error={errors.lastName}
                            placeholder="e.g. Murphy"
                          />
                        </div>

                        <InputField
                          label="Email Address"
                          type="email"
                          icon={Mail}
                          value={formData.email}
                          onChange={(v) => update('email', v)}
                          error={errors.email}
                          placeholder="john@example.com"
                          className="mb-4"
                        />
                        <InputField
                          label="Phone Number"
                          icon={Phone}
                          value={formData.phone}
                          onChange={(v) => update('phone', v)}
                          error={errors.phone}
                          placeholder="087 123 4567"
                        />

                        <div className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-400/[0.04] border border-green-400/10">
                          <Shield className="w-4 h-4 text-green-400 shrink-0" />
                          <p className="text-xs text-gray-400">Your data is secure. We only use it to arrange your survey — never shared with third parties.</p>
                        </div>
                      </motion.div>
                    )}

                    {/* ══ STEP 1: Property Info ══ */}
                    {step === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.35 }}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Your Property</h2>
                            <p className="text-sm text-gray-500">Helps us prepare the right assessment for your home.</p>
                          </div>
                        </div>

                        <div className="mt-6 space-y-6">
                          {/* Address */}
                          <InputField
                            label="Address"
                            icon={Home}
                            value={formData.address}
                            onChange={(v) => update('address', v)}
                            error={errors.address}
                            placeholder="e.g. 42 Main Street, Rathmines"
                          />

                          {/* County */}
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                              <MapPin className="w-3.5 h-3.5 text-gray-500" />
                              County
                            </label>
                            <select
                              value={formData.county}
                              onChange={(e) => update('county', e.target.value)}
                              className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-white appearance-none focus:outline-none transition-all ${
                                errors.county ? 'border-red-400/50 focus:border-red-400' : 'border-white/[0.08] focus:border-green-400/40'
                              }`}
                            >
                              <option value="" className="bg-[#1a1a1a]">Select your county</option>
                              {irishCounties.map((c) => (
                                <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                              ))}
                            </select>
                            {errors.county && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.county}</p>}
                          </div>

                          {/* Property Type — visual cards */}
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              <Home className="w-3.5 h-3.5 text-gray-500" />
                              Property Type
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {propertyTypes.map((type) => (
                                <button
                                  key={type.value}
                                  onClick={() => update('propertyType', type.value)}
                                  className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-xs font-medium transition-all border ${
                                    formData.propertyType === type.value
                                      ? 'bg-green-400/10 border-green-400/30 text-green-400'
                                      : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04] hover:border-white/[0.1]'
                                  }`}
                                >
                                  <span className="text-base">{type.icon}</span>
                                  {type.label}
                                </button>
                              ))}
                            </div>
                            {errors.propertyType && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.propertyType}</p>}
                          </div>

                          {/* Roof Type */}
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              Roof Type
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {roofTypes.map((type) => (
                                <button
                                  key={type.value}
                                  onClick={() => update('roofType', type.value)}
                                  className={`text-left px-4 py-3 rounded-xl transition-all border ${
                                    formData.roofType === type.value
                                      ? 'bg-green-400/10 border-green-400/30'
                                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                                  }`}
                                >
                                  <span className={`text-sm font-medium block ${
                                    formData.roofType === type.value ? 'text-green-400' : 'text-gray-300'
                                  }`}>
                                    {formData.roofType === type.value && <Check className="w-3 h-3 inline mr-1.5" />}
                                    {type.label}
                                  </span>
                                  <span className="text-[11px] text-gray-600 mt-0.5 block">{type.desc}</span>
                                </button>
                              ))}
                            </div>
                            {errors.roofType && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.roofType}</p>}
                          </div>

                          {/* Household size & bill (optional helpers) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                Household Size <span className="text-gray-600 normal-case">(optional)</span>
                              </label>
                              <select
                                value={formData.householdSize}
                                onChange={(e) => update('householdSize', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white appearance-none focus:outline-none focus:border-green-400/40 transition-all"
                              >
                                <option value="" className="bg-[#1a1a1a]">Select</option>
                                {['1 person', '2 people', '3 people', '4 people', '5+ people'].map((v) => (
                                  <option key={v} value={v} className="bg-[#1a1a1a]">{v}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                Monthly Electricity Bill <span className="text-gray-600 normal-case">(optional)</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
                                <input
                                  type="number"
                                  value={formData.currentBill}
                                  onChange={(e) => update('currentBill', e.target.value)}
                                  placeholder="150"
                                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-400/40 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Interests */}
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              I&apos;m Interested In
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {interests.map((item) => {
                                const Icon = item.icon;
                                const isSelected = formData.interest.includes(item.value);
                                return (
                                  <button
                                    key={item.value}
                                    onClick={() => toggleInterest(item.value)}
                                    className={`flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                                      isSelected
                                        ? 'bg-amber-400/10 border-amber-400/30'
                                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                                    }`}
                                  >
                                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-gray-600'}`} />
                                    <div>
                                      <span className={`text-sm font-medium block ${isSelected ? 'text-amber-400' : 'text-gray-300'}`}>
                                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                                        {item.label}
                                      </span>
                                      <span className="text-[11px] text-gray-600 mt-0.5 block">{item.desc}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ══ STEP 2: Schedule ══ */}
                    {step === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.35 }}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-xl bg-sky-400/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-sky-400" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Choose a Date & Time</h2>
                            <p className="text-sm text-gray-500">Pick your preferred slot — we&apos;ll confirm within 2 hours.</p>
                          </div>
                        </div>

                        <div className="mt-6 space-y-6">
                          {/* Date picker */}
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              <Calendar className="w-3.5 h-3.5 text-gray-500" />
                              Preferred Date
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                              {availableDates.map((d) => {
                                const isSelected = formData.preferredDate === d.date.toISOString();
                                return (
                                  <button
                                    key={d.date.toISOString()}
                                    onClick={() => update('preferredDate', d.date.toISOString())}
                                    className={`flex flex-col items-center px-2 py-2.5 rounded-xl text-center transition-all border ${
                                      isSelected
                                        ? 'bg-sky-400/10 border-sky-400/30 shadow-lg shadow-sky-400/5'
                                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                                    }`}
                                  >
                                    <span className={`text-[10px] font-medium ${
                                      isSelected ? 'text-sky-400' : 'text-gray-500'
                                    }`}>
                                      {d.dayName}
                                    </span>
                                    <span className={`text-base font-bold ${
                                      isSelected ? 'text-white' : 'text-gray-300'
                                    }`}>
                                      {d.date.getDate()}
                                    </span>
                                    <span className={`text-[9px] ${
                                      isSelected ? 'text-sky-400/70' : 'text-gray-600'
                                    }`}>
                                      {d.month}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            {errors.preferredDate && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.preferredDate}</p>}
                          </div>

                          {/* Time slots */}
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              <Clock className="w-3.5 h-3.5 text-gray-500" />
                              Preferred Time
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {timeSlots.map((slot) => {
                                const isSelected = formData.preferredTime === slot.value;
                                return (
                                  <button
                                    key={slot.value}
                                    onClick={() => update('preferredTime', slot.value)}
                                    className={`flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all border ${
                                      isSelected
                                        ? 'bg-sky-400/10 border-sky-400/30'
                                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                                    }`}
                                  >
                                    <span className="text-xl">{slot.icon}</span>
                                    <div>
                                      <span className={`text-sm font-bold block ${
                                        isSelected ? 'text-sky-400' : 'text-gray-300'
                                      }`}>
                                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                                        {slot.label}
                                      </span>
                                      <span className="text-[11px] text-gray-500">{slot.time}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            {errors.preferredTime && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.preferredTime}</p>}
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                              Additional Notes <span className="text-gray-600 normal-case">(optional)</span>
                            </label>
                            <textarea
                              value={formData.notes}
                              onChange={(e) => update('notes', e.target.value)}
                              rows={3}
                              placeholder="Any specific questions, access issues, or things you'd like us to check..."
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-400/40 transition-all resize-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ══ STEP 3: Confirm ══ */}
                    {step === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.35 }}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Confirm Your Booking</h2>
                            <p className="text-sm text-gray-500">Review your details and hit confirm.</p>
                          </div>
                        </div>

                        <div className="mt-6 space-y-5">
                          {/* Personal info */}
                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h3>
                            <div className="space-y-3">
                              <ConfirmRow icon={User} label="Name" value={`${formData.firstName} ${formData.lastName}`} />
                              <ConfirmRow icon={Mail} label="Email" value={formData.email} />
                              <ConfirmRow icon={Phone} label="Phone" value={formData.phone} />
                            </div>
                          </div>

                          {/* Property info */}
                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Property Details</h3>
                            <div className="space-y-3">
                              <ConfirmRow icon={Home} label="Address" value={`${formData.address}, ${formData.county}`} />
                              <ConfirmRow icon={Building2} label="Property Type" value={propertyTypes.find(p => p.value === formData.propertyType)?.label || formData.propertyType} />
                              <ConfirmRow icon={Home} label="Roof Type" value={roofTypes.find(r => r.value === formData.roofType)?.label || formData.roofType} />
                              {formData.interest.length > 0 && (
                                <ConfirmRow icon={Zap} label="Interested In" value={formData.interest.map(v => interests.find(i => i.value === v)?.label || v).join(', ')} />
                              )}
                            </div>
                          </div>

                          {/* Appointment */}
                          <div className="p-4 rounded-xl bg-green-400/[0.04] border border-green-400/15">
                            <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">Your Appointment</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-green-400 shrink-0" />
                                <div>
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Date</span>
                                  <span className="text-sm text-white font-medium">
                                    {(() => {
                                      const d = availableDates.find((d) => d.date.toISOString() === formData.preferredDate);
                                      return d ? `${d.dayName}, ${d.label}` : 'Date selected';
                                    })()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-green-400 shrink-0" />
                                <div>
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Time</span>
                                  <span className="text-sm text-white font-medium">
                                    {timeSlots.find((t) => t.value === formData.preferredTime)?.label}
                                    {' — '}
                                    {timeSlots.find((t) => t.value === formData.preferredTime)?.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {formData.notes && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Additional Notes</span>
                              <p className="text-sm text-gray-400 mt-1">{formData.notes}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Navigation buttons ── */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
                    {step > 0 ? (
                      <button
                        onClick={prevStep}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] transition-all active:scale-[0.98]"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        Back
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < 3 ? (
                      <button
                        onClick={nextStep}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-amber-400/15"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-green-400 hover:bg-green-300 text-black font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-green-400/20 disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <CalendarCheckIcon />
                            Confirm Booking
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Trust signals strip ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  {[
                    { icon: Shield, label: 'SEAI Registered', color: 'text-green-400', bg: 'bg-green-400/[0.06]' },
                    { icon: Star, label: '4.9★ Rated', color: 'text-amber-400', bg: 'bg-amber-400/[0.06]' },
                    { icon: Zap, label: 'Free & No Obligation', color: 'text-sky-400', bg: 'bg-sky-400/[0.06]' },
                    { icon: MapPin, label: 'All 32 Counties', color: 'text-violet-400', bg: 'bg-violet-400/[0.06]' },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className={`w-7 h-7 rounded-lg ${t.bg} flex items-center justify-center`}>
                        <t.icon className={`w-3.5 h-3.5 ${t.color} shrink-0`} />
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">{t.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* ═══ SUCCESS STATE ═══ */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12 sm:py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-green-400/10 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-8"
                >
                  <Check className="w-10 h-10 text-green-400" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Booking Confirmed! 🎉
                  </h2>
                  <p className="text-gray-400 max-w-md mx-auto mb-4 leading-relaxed text-lg">
                    Your survey request has been sent to our team.
                  </p>
                  <p className="text-gray-500 max-w-md mx-auto mb-10">
                    We&apos;ll confirm your appointment by text and email within <span className="text-white font-semibold">2 hours</span>. Check your WhatsApp for a message from us.
                  </p>
                </motion.div>

                {/* What happens next */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="max-w-md mx-auto mb-10"
                >
                  <div className="glass-card rounded-2xl p-6 text-left">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Timer className="w-4 h-4 text-amber-400" />
                      What Happens Next
                    </h3>
                    <div className="space-y-4">
                      {[
                        { time: 'Within 2 hours', text: 'You\'ll receive a confirmation text and email with your appointment details.' },
                        { time: 'Survey Day', text: 'Our assessor visits your home for a thorough 30-45 minute roof and energy assessment.' },
                        { time: 'Within 48 hours', text: 'Receive your itemised quote with estimated savings, grant eligibility, and payback period.' },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-400/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-green-400">{i + 1}</span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-amber-400 block">{item.time}</span>
                            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-amber-400/[0.06] border border-amber-400/15 max-w-sm mx-auto">
                    <p className="text-sm text-gray-400 mb-2">While you wait, find out how much you could save:</p>
                    <Link
                      href="/solar-calculator"
                      className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Try Our Solar Savings Calculator
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={buildWhatsAppUrl({ source: 'booking-confirm' })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-400 hover:bg-green-300 text-black font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat on WhatsApp
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href="tel:+353873958424"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.06] transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      Call {SOLAR_DATA.provider.phoneDisplay}
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </section>

        {/* ═══════ WHAT TO EXPECT ═══════ */}
        <section className="py-16 sm:py-24 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Simple Process
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How Your Solar Journey <span className="text-gradient">Works</span>
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto text-lg">
                From booking to installation — four simple steps to start saving on your energy bills.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  step: '01',
                  title: 'Book Online',
                  desc: 'Fill in the form above — takes 60 seconds. Pick your preferred date and time slot.',
                  icon: Calendar,
                  color: 'amber',
                },
                {
                  step: '02',
                  title: 'Quick Confirmation',
                  desc: 'Our team confirms your appointment by text and email within 2 hours.',
                  icon: Phone,
                  color: 'sky',
                },
                {
                  step: '03',
                  title: 'Home Assessment',
                  desc: 'Our assessor visits for 30–45 minutes, evaluates your roof, and answers every question you have.',
                  icon: Home,
                  color: 'green',
                },
                {
                  step: '04',
                  title: 'Your Quote Arrives',
                  desc: 'Receive an honest, itemised quote with savings estimate, SEAI grant eligibility, and payback period.',
                  icon: ThumbsUp,
                  color: 'violet',
                },
              ].map((item, i) => {
                const colorMap: Record<string, { text: string; bg: string; ring: string }> = {
                  amber: { text: 'text-amber-400', bg: 'bg-amber-400/10', ring: 'ring-amber-400/20' },
                  sky: { text: 'text-sky-400', bg: 'bg-sky-400/10', ring: 'ring-sky-400/20' },
                  green: { text: 'text-green-400', bg: 'bg-green-400/10', ring: 'ring-green-400/20' },
                  violet: { text: 'text-violet-400', bg: 'bg-violet-400/10', ring: 'ring-violet-400/20' },
                };
                const c = colorMap[item.color];
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="glass-card rounded-2xl p-6 text-center relative group"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${c.bg} ring-4 ${c.ring} flex items-center justify-center mx-auto mb-5`}>
                      <item.icon className={`w-6 h-6 ${c.text}`} />
                    </div>
                    <span className={`text-[10px] font-bold ${c.text} uppercase tracking-widest`}>Step {item.step}</span>
                    <h3 className="text-base font-bold text-white mt-1 mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════ TESTIMONIALS ═══════ */}
        <section className="py-16 sm:py-24 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 mb-6">
                <Heart className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                  Customer Love
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Trusted by <span className="text-gradient">2,847+</span> Homeowners
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto text-lg">
                Real reviews from real Irish homeowners who went solar with us.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-6 flex flex-col"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-gray-700 mb-3 shrink-0" />
                  <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-4">{t.text}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.location}</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-400/10 text-green-400 font-semibold">
                      {t.system}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ FAQ ═══════ */}
        <section className="py-16 sm:py-24 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-400/10 border border-violet-400/20 mb-6">
                <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                  Common Questions
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
            </motion.div>

            <div className="space-y-3">
              {faqItems.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-start gap-3 ${
                        isOpen
                          ? 'bg-white/[0.04] border-white/[0.1]'
                          : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className={`text-sm font-semibold mt-0.5 transition-colors ${
                        isOpen ? 'text-amber-400' : 'text-white'
                      }`}>
                        {item.q}
                      </span>
                      <ChevronDown className={`w-4 h-4 shrink-0 mt-0.5 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-amber-400' : 'text-gray-500'
                      }`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 py-4 text-sm text-gray-400 leading-relaxed border-x border-b border-white/[0.05] rounded-b-xl">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="py-16 sm:py-24 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Start <span className="text-gradient">Saving?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                Book your free survey now and take the first step towards lower energy bills and a greener home.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => { setStep(0); setIsSubmitted(false); setFormData({ firstName: '', lastName: '', email: '', phone: '', address: '', county: '', propertyType: '', roofType: '', householdSize: '', currentBill: '', preferredDate: '', preferredTime: '', interest: [], notes: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-green-400 hover:bg-green-300 text-black font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-green-400/20"
                >
                  <Calendar className="w-4 h-4" />
                  Book Your Free Survey
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={buildWhatsAppUrl({ source: 'book-cta' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.06] transition-all"
                >
                  <Phone className="w-4 h-4 text-green-400" />
                  Prefer to Call?
                </a>
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

/* ─── Reusable Components ─── */

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  className = '',
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-white placeholder-gray-600 focus:outline-none transition-all ${
          error ? 'border-red-400/50 focus:border-red-400' : 'border-white/[0.08] focus:border-green-400/40'
        }`}
      />
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400 mt-1.5">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function ConfirmRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
      <div>
        <span className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</span>
        <p className="text-sm text-gray-300 font-medium">{value}</p>
      </div>
    </div>
  );
}

function CalendarCheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" />
    </svg>
  );
}
