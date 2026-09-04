'use client';

import { useState, useMemo, useId } from 'react';
import { Zap, TrendingUp, Clock, Mail, MessageCircle, Phone, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { estimateSavings, fmtEur, HOME_TYPES } from '@/lib/estimate';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { submitLead } from '@/lib/submitLead';

/**
 * HomeEstimateIntake — the home page's single lead engine.
 *
 * Shows an instant teaser (annual benefit, monthly saving, payback) as the
 * homeowner adjusts their bill, then captures first name + email to send the
 * full, branded, personalised estimate by email. The lead is posted to
 * /api/lead → AISolar, which generates and emails the estimate (Postmark).
 * WhatsApp / phone are secondary, for those who would rather talk now.
 */
export default function HomeEstimateIntake() {
  const [monthlyBill, setMonthlyBill] = useState(160);
  const [homeType, setHomeType] = useState('semi');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const billId = useId();

  const r = useMemo(() => estimateSavings(monthlyBill, homeType), [monthlyBill, homeType]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = firstName.trim().length > 0 && emailValid && status !== 'submitting';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('submitting');
    setErrorMsg('');
    const res = await submitLead({
      source: 'bill_analyser',
      name: firstName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      monthlyBill,
      homeType: HOME_TYPES.find((h) => h.id === homeType)?.label,
      estimatedAnnualSaving: r.totalAnnualBenefit,
      company: company || undefined,
    });
    if (res.ok) {
      setStatus('done');
    } else {
      setStatus('error');
      setErrorMsg(res.error || 'Something went wrong. Please try again.');
    }
  }

  const teaser = [
    { icon: TrendingUp, label: 'Annual benefit', value: `${fmtEur(r.totalAnnualBenefit)}/yr`, sub: `~${fmtEur(r.monthlySavings)}/month` },
    { icon: Zap, label: 'System size', value: `${r.systemSizeKwp} kWp`, sub: `${r.billReductionPct}% off your bill` },
    { icon: Clock, label: 'Payback', value: `${r.paybackYears} yrs`, sub: `${fmtEur(r.total25yrSavings)}+ over 25 years` },
  ];

  return (
    <section id="calculator" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/[0.06] border border-amber-400/[0.12] mb-5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-[0.15em]">Free Estimate</span>
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
            See what solar saves you.
          </h2>
          <p className="mt-4 text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Enter your monthly electricity bill for an instant estimate. Add your email and we&apos;ll send your full,
            personalised solar estimate, including your {SOLAR_DATA.grant.label} SEAI grant (ROI).
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 sm:p-8">
          {/* Inputs */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor={billId} className="block text-sm font-medium text-gray-300 mb-3">
                Your electricity bill: <span className="text-amber-400 font-semibold">€{monthlyBill}/month</span>
              </label>
              <input
                id={billId}
                type="range"
                min={60}
                max={500}
                step={10}
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                className="solar-range-input w-full"
                aria-valuetext={`€${monthlyBill} per month`}
              />
              <div className="flex justify-between text-[11px] text-gray-500 mt-1"><span>€60</span><span>€500</span></div>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-300 mb-3">Your home</span>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Home type">
                {HOME_TYPES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHomeType(h.id)}
                    aria-pressed={homeType === h.id}
                    className={`px-2 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                      homeType === h.id
                        ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                        : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/[0.12]'
                    }`}
                  >
                    {h.label.replace(' / Terrace', '').replace('-Detached', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instant teaser */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {teaser.map((t) => (
              <div key={t.label} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 text-center">
                <t.icon className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
                <p className="text-lg sm:text-2xl font-bold text-white leading-tight">{t.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{t.label}</p>
                <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 text-center mt-3">
            Instant estimate based on a typical Irish home. Your emailed estimate is tailored to your actual usage.
          </p>

          {/* Capture */}
          {status === 'done' ? (
            <div className="mt-6 rounded-xl bg-green-400/[0.06] border border-green-400/20 p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-white font-semibold">Your estimate is on its way.</p>
              <p className="text-sm text-gray-400 mt-1">
                We&apos;re preparing your personalised solar estimate and it will land in your inbox shortly. Check your spam folder just in case.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 border-t border-white/[0.06] pt-6">
              <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" /> Get your full personalised estimate by email
              </p>
              {/* Honeypot */}
              <input
                type="text"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor={nameId} className="sr-only">First name</label>
                  <input
                    id={nameId}
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-amber-400/40"
                  />
                </div>
                <div>
                  <label htmlFor={emailId} className="sr-only">Email address</label>
                  <input
                    id={emailId}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.ie"
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-amber-400/40"
                  />
                </div>
                <div>
                  <label htmlFor={phoneId} className="sr-only">Phone (optional)</label>
                  <input
                    id={phoneId}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    autoComplete="tel"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-amber-400/40"
                  />
                </div>
              </div>

              {status === 'error' && (
                <p className="mt-3 text-sm text-red-400">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 text-black font-bold text-sm hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending your estimate...</>
                ) : (
                  <>Email me my estimate <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <p className="text-[11px] text-gray-500 text-center mt-3">
                No spam. We use your details only to prepare your estimate and follow up about solar.
              </p>

              {/* Secondary: talk now */}
              <div className="flex items-center justify-center gap-4 mt-5 text-xs">
                <a
                  href={buildWhatsAppUrl({ source: 'home-estimate' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-green-400" /> WhatsApp us
                </a>
                <span className="text-white/10">|</span>
                <a
                  href={`tel:${SOLAR_DATA.provider.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> Call {SOLAR_DATA.provider.phoneDisplay}
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
