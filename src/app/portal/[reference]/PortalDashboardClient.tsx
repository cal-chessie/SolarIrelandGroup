'use client';

import { useState } from 'react';
import { motion } from '@/lib/motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Home,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Mail,
  Shield,
  Star,
  Sun,
  Zap,
  Euro,
  PartyPopper,
  CircleDot,
  ArrowRight,
  Bell,
  User,
  Wrench,
  Truck,
  Award,
  Power,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ─── TYPES ─── */

type StepStatus = 'completed' | 'in-progress' | 'upcoming';

interface InstallationStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  status: StepStatus;
  date?: string;
  icon: React.ComponentType<{ className?: string }>;
  details?: string[];
}

/* ─── DEMO DATA ─── */

// For the demo, show a customer at step 7 (Installation Scheduled) out of 11
const demoSteps: InstallationStep[] = [
  {
    id: 1,
    title: 'Enquiry Received',
    subtitle: 'Welcome aboard',
    description: 'We received your enquiry and our team has started reviewing your details.',
    status: 'completed',
    date: '15 Mar 2026',
    icon: Bell,
  },
  {
    id: 2,
    title: 'Survey Booked',
    subtitle: 'Free home assessment scheduled',
    description: 'Your free solar survey has been booked. Our assessor will visit your home to evaluate your roof, energy usage, and property.',
    status: 'completed',
    date: '17 Mar 2026',
    icon: Calendar,
  },
  {
    id: 3,
    title: 'Survey Completed',
    subtitle: 'Assessment done',
    description: 'Our SEAI-registered assessor visited your home, measured your roof space, checked orientation and shading, and reviewed your electrical setup.',
    status: 'completed',
    date: '22 Mar 2026',
    icon: Sun,
  },
  {
    id: 4,
    title: 'Quote Delivered',
    subtitle: 'Itemised proposal ready',
    description: 'Your honest, itemised quote has been prepared with system specification, estimated savings, SEAI grant details, and payback period.',
    status: 'completed',
    date: '24 Mar 2026',
    icon: FileText,
  },
  {
    id: 5,
    title: 'Quote Accepted',
    subtitle: "You've approved the installation",
    description: 'You reviewed and accepted our proposal. Your dedicated project manager has been assigned and will oversee your entire installation.',
    status: 'completed',
    date: '28 Mar 2026',
    icon: CheckCircle2,
  },
  {
    id: 6,
    title: 'SEAI Grant Applied',
    subtitle: 'Grant application submitted',
    description: "We've submitted your SEAI grant application on your behalf. The Sustainable Energy Authority of Ireland will review and approve your €1,800 grant.",
    status: 'completed',
    date: '1 Apr 2026',
    icon: Award,
  },
  {
    id: 7,
    title: 'Installation Scheduled',
    subtitle: 'Your installation date is confirmed',
    description: 'Your installation has been scheduled. Scaffolding will go up in the morning, panels mounted and wired by midday, and the system fully commissioned by evening.',
    status: 'in-progress',
    date: '18 Apr 2026',
    icon: Wrench,
    details: [
      'Arrival time: 8:00 AM',
      'Estimated completion: 4:00 PM',
      'System: 6kWp Solar PV (16 panels)',
      'Inverter: Huawei 6kW Hybrid',
      'Scaffolding: Pre-erected on 17 Apr',
    ],
  },
  {
    id: 8,
    title: 'Installation Complete',
    subtitle: 'Panels installed & commissioned',
    description: 'Your solar PV system has been professionally installed and fully commissioned. All panels are wired, the inverter is connected, and your system is generating clean electricity.',
    status: 'upcoming',
    icon: Zap,
  },
  {
    id: 9,
    title: 'SEAI Grant Approved',
    subtitle: '€1,800 grant confirmed',
    description: 'The SEAI has approved your grant. The €1,800 payment will be processed and deducted from your final invoice.',
    status: 'upcoming',
    icon: Euro,
  },
  {
    id: 10,
    title: 'ECS Registration',
    subtitle: 'Grid connection registered',
    description: 'Your system has been registered with ESB Networks for microgeneration. Your smart meter will track exports for Clean Export Guarantee payments.',
    status: 'upcoming',
    icon: Power,
  },
  {
    id: 11,
    title: 'Enjoy Your Savings',
    subtitle: "You're generating clean energy!",
    description: "Congratulations! Your solar system is live. You'll start seeing savings on your very next electricity bill. Welcome to clean, free energy for the next 25+ years.",
    status: 'upcoming',
    icon: TrendingUp,
  },
];

const demoDocuments = [
  { name: 'Survey Report', date: '24 Mar 2026', type: 'PDF', size: '2.4 MB' },
  { name: 'Itemised Quote', date: '24 Mar 2026', type: 'PDF', size: '1.8 MB' },
  { name: 'SEAI Grant Application', date: '1 Apr 2026', type: 'PDF', size: '340 KB' },
  { name: 'Grant Offer Letter', date: '—', type: 'PDF', size: '—' },
  { name: 'Completion Certificate', date: '—', type: 'PDF', size: '—' },
];

const demoNotifications = [
  { text: 'Your installation is confirmed for 18 Apr 2026. Scaffolding goes up on 17 Apr.', date: '8 Apr 2026', type: 'info' },
  { text: 'SEAI grant application submitted. Expected approval within 4-6 weeks.', date: '1 Apr 2026', type: 'success' },
  { text: 'Your quote has been delivered. Please review and let us know if you have questions.', date: '24 Mar 2026', type: 'info' },
];

const demoCustomer = {
  name: 'John Murphy',
  address: '42 Main Street, Rathmines, Dublin 6',
  system: '6kWp Solar PV — 16 Panels',
  inverter: 'Huawei 6kW Hybrid Inverter',
  reference: 'SI-2026-0042',
  projectManager: 'Sarah Kelly',
};

/* ─── COMPONENT ─── */

export default function PortalDashboardClient() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'messages'>('timeline');
  const [expandedStep, setExpandedStep] = useState<number | null>(7);

  const completedSteps = demoSteps.filter(s => s.status === 'completed').length;
  const totalSteps = demoSteps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;

  const currentStep = demoSteps.find(s => s.status === 'in-progress');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        {/* ── TOP BAR ── */}
        <section className="border-b border-white/[0.05] bg-white/[0.01]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Portal
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500 tracking-wider">{demoCustomer.reference}</span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* ── HERO SUMMARY ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-amber-400/[0.03] rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-black font-bold text-xl">
                    {demoCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{demoCustomer.name}</h1>
                    <p className="text-sm text-gray-500">{demoCustomer.reference}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-400">{demoCustomer.address}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-400">{demoCustomer.system}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Project Manager: <span className="text-white font-medium">{demoCustomer.projectManager}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    {/* Progress circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="88"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercent / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#facc15" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{completedSteps}</span>
                    <span className="text-xs text-gray-500">of {totalSteps} steps</span>
                    <span className="text-[10px] text-amber-400 font-semibold mt-1">{Math.round(progressPercent)}% complete</span>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <div className="glass-card rounded-2xl p-5 border border-amber-400/15">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Current Status</span>
                  </div>
                  {currentStep && (
                    <>
                      <h2 className="text-lg font-bold text-white mb-1">{currentStep.title}</h2>
                      <p className="text-sm text-gray-400 mb-3">{currentStep.subtitle}</p>
                      {currentStep.date && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {currentStep.date}
                        </div>
                      )}
                    </>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-xs text-gray-600 mb-2">Estimated completion</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-sm text-white font-medium">18 Apr 2026</span>
                      </div>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-500">Single day install</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 flex gap-2">
                  <a
                    href={buildWhatsAppUrl({ source: 'portal', customMessage: `Hi Sarah, I'm checking my portal (ref: ${demoCustomer.reference}). I have a question about my installation.` })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-green-400/10 border border-green-400/15 text-green-400 text-xs font-medium hover:bg-green-400/20 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </a>
                  <a
                    href={`tel:${SOLAR_DATA.provider.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-400 text-xs font-medium hover:bg-white/[0.06] transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TABS ── */}
        <section className="border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto">
              {[
                { key: 'timeline' as const, label: 'Installation Timeline', icon: Clock },
                { key: 'documents' as const, label: 'Documents', icon: FileText },
                { key: 'messages' as const, label: 'Updates', icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.key
                      ? 'text-amber-400 border-amber-400'
                      : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── TAB CONTENT ── */}
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.06]" />

                  {demoSteps.map((step) => {
                    const isExpanded = expandedStep === step.id;
                    const Icon = step.icon;
                    const isLast = step.id === totalSteps;

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: step.id * 0.05 }}
                        className="relative pl-16 pb-10 last:pb-0"
                      >
                        {/* Step dot/node */}
                        <div className="absolute left-0 top-0">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                              step.status === 'completed'
                                ? 'bg-green-400 text-black'
                                : step.status === 'in-progress'
                                ? 'bg-amber-400 text-black ring-4 ring-amber-400/20'
                                : 'bg-white/[0.04] text-gray-600 border border-white/[0.06]'
                            }`}
                          >
                            {step.status === 'completed' ? (
                              <Check className="w-5 h-5" />
                            ) : step.status === 'in-progress' ? (
                              <Icon className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                        </div>

                        {/* Connector glow for current */}
                        {step.status === 'in-progress' && (
                          <div className="absolute left-[22px] top-12 bottom-0 w-[3px] bg-gradient-to-b from-amber-400/40 to-transparent" />
                        )}

                        {/* Card */}
                        <button
                          onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                          className={`w-full text-left rounded-2xl p-5 transition-all ${
                            step.status === 'in-progress'
                              ? 'glass-card border border-amber-400/15 cursor-pointer'
                              : step.status === 'completed'
                              ? 'bg-white/[0.01] cursor-pointer hover:bg-white/[0.02]'
                              : 'bg-white/[0.01] cursor-default'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-semibold uppercase tracking-wider ${
                                  step.status === 'completed' ? 'text-green-400' :
                                  step.status === 'in-progress' ? 'text-amber-400' : 'text-gray-600'
                                }`}>
                                  Step {step.id}
                                </span>
                                {step.status === 'in-progress' && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                    Current
                                  </span>
                                )}
                                {step.status === 'completed' && (
                                  <span className="px-2 py-0.5 rounded-full bg-green-400/10 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                                    Done
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-bold text-white">{step.title}</h3>
                              <p className="text-sm text-gray-500 mt-0.5">{step.subtitle}</p>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                              {step.date && step.status !== 'upcoming' && (
                                <span className="text-xs text-gray-500">{step.date}</span>
                              )}
                              {(step.details || step.status === 'in-progress') && (
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 pt-4 border-t border-white/[0.06]"
                            >
                              <p className="text-sm text-gray-400 leading-relaxed mb-4">{step.description}</p>

                              {step.details && (
                                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Installation Details</h4>
                                  <div className="space-y-2">
                                    {step.details.map((detail, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <CircleDot className="w-3 h-3 text-amber-400 shrink-0" />
                                        <span className="text-sm text-gray-300">{detail}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {step.status === 'in-progress' && (
                                <div className="mt-4 flex gap-2">
                                  <a
                                    href={buildWhatsAppUrl({ source: 'portal', customMessage: `Hi Sarah, I have a question about my installation on 18 Apr (ref: ${demoCustomer.reference}).` })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-400 hover:bg-green-300 text-black text-xs font-bold transition-all active:scale-[0.98]"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Contact Project Manager
                                  </a>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Final celebration */}
                {completedSteps < totalSteps && (
                  <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05]">
                      <PartyPopper className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-gray-500">
                        {totalSteps - completedSteps} steps remaining — almost there!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-bold text-white mb-1">Your Documents</h2>
                <p className="text-sm text-gray-500 mb-6">All paperwork for your solar installation in one place.</p>

                <div className="space-y-2">
                  {demoDocuments.map((doc, i) => {
                    const isAvailable = doc.date !== '—';
                    return (
                      <div
                        key={doc.name}
                        className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
                          isAvailable
                            ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                            : 'bg-white/[0.01] border-white/[0.03] opacity-40'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isAvailable ? 'bg-amber-400/10' : 'bg-white/[0.04]'
                        }`}>
                          <FileText className={`w-5 h-5 ${isAvailable ? 'text-amber-400' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                          <p className="text-xs text-gray-600">{doc.size} · {doc.date}</p>
                        </div>
                        {isAvailable ? (
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 hover:bg-white/[0.08] hover:text-white transition-all">
                            <Download className="w-3 h-3" />
                            PDF
                          </button>
                        ) : (
                          <span className="text-xs text-gray-600">Pending</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-300 font-medium">Secure Document Storage</p>
                      <p className="text-xs text-gray-500 mt-1">Your documents are private and accessible only with your reference number. Contact your project manager if you need any additional paperwork.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UPDATES TAB */}
            {activeTab === 'messages' && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-bold text-white mb-1">Project Updates</h2>
                <p className="text-sm text-gray-500 mb-6">Notifications and updates from your project manager.</p>

                <div className="space-y-3">
                  {demoNotifications.map((notif, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex gap-4 p-4 rounded-xl border ${
                        notif.type === 'success'
                          ? 'bg-green-400/[0.03] border-green-400/10'
                          : 'bg-white/[0.02] border-white/[0.05]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.type === 'success' ? 'bg-green-400/10' : 'bg-amber-400/10'
                      }`}>
                        {notif.type === 'success' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Bell className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 leading-relaxed">{notif.text}</p>
                        <p className="text-xs text-gray-600 mt-1">{notif.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500 mb-3">Have a question about your project?</p>
                  <a
                    href={buildWhatsAppUrl({ source: 'portal-updates', customMessage: `Hi Sarah, I have a question about my project (ref: ${demoCustomer.reference}).` })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-400 hover:bg-green-300 text-black text-sm font-bold transition-all active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Your Project Manager
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
