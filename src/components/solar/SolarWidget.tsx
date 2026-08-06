'use client';

/**
 * SolarWidget — the AISolar bill-analysis widget, branded as Solar Ireland,
 * embedded via iframe. Replaces the old native QuickSavingsCalculator +
 * BillAnalyser (two competing paths → one bill-first tool). Leads route straight
 * into the Solar Ireland pipeline via the source key baked into the embed URL
 * (x-source-key → ingest-lead). Keeps id="calculator" so existing #calculator
 * CTAs still land here.
 */

const WIDGET_SRC =
  'https://www.aisolar.ie/embed?src=src_d283e972538a5db3becdfb310ba256b8d0f2';

export default function SolarWidget() {
  return (
    <section id="calculator" className="relative bg-[#0a0a0a] py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            See your solar savings in{' '}
            <span className="text-amber-400">60 seconds</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Pop in your electricity bill and our AI sizes your system, your €1,800
            SEAI grant, and the year you break even — free, no obligation.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
          <iframe
            src={WIDGET_SRC}
            title="Solar Ireland — free AI bill analysis"
            loading="lazy"
            className="block w-full"
            style={{ height: 860, border: 0 }}
          />
        </div>
      </div>
    </section>
  );
}
