import Link from 'next/link';
import type { Metadata } from 'next';
import { Mail, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

// /portal and /portal/<anything> used to take any "reference" and open a made-up
// customer (a sample name, reference and timeline) on the live domain, so a real
// homeowner could see a stranger's project. That demo is parked in
// _TRASH/portal-demo. Each customer's real project page lives on the platform and
// is linked from the emails we send them, so this page says exactly that, until
// the email sign-in exists. Never serve demo data here again.

export const portalMetadata: Metadata = {
  title: 'Your Project Page',
  description: 'Your Solar Ireland Group project page link is in the emails we sent you.',
  robots: { index: false, follow: false },
  // No canonical: the layout's default points at the homepage, which on a
  // noindex page is a mixed signal (Google-safety check, 9 Nov). None at all is clean.
  alternates: { canonical: null },
};

export default function PortalNotice() {
  const { phone, phoneDisplay, email } = SOLAR_DATA.provider;
  const whatsappUrl = buildWhatsAppUrl({
    customMessage: "Hi Solar Ireland, I can't find the link to my project page. Could you send it again?",
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="pt-16">
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
            Your project page
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
            Your project page link is in your emails
          </h1>
          <p className="text-base text-gray-400 leading-relaxed mb-4">
            Every Solar Ireland customer has a private link to their own project page. It is in the
            emails we send you. Open the latest one from us and use the link there.
          </p>
          <p className="text-base text-gray-400 leading-relaxed mb-10">
            There is no reference number to type in here. Can&apos;t find the email? Get in touch and we
            will help.
          </p>

          <div className="grid gap-3 sm:grid-cols-3 mb-12">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white hover:border-amber-400/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-green-400 shrink-0" />
              WhatsApp us
            </a>
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white hover:border-amber-400/30 transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              {phoneDisplay}
            </a>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white hover:border-amber-400/30 transition-colors min-w-0"
            >
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">Email us</span>
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-sm font-semibold text-white mb-1">Not a customer yet?</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Start with your bill and see what solar would save you, or book a free 15-minute call.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/solar-calculator"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-sm font-bold text-black transition-colors"
              >
                Analyse my bill <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/book-survey"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:border-amber-400/40 transition-colors"
              >
                Book a free 15-minute call
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
