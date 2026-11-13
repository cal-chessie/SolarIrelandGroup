'use client';

import { useId, useMemo, useState } from 'react';
import IntakeLink from '@/components/intake/IntakeLink';
import { estimate, usageFromMonthlyBill, fmtEur, HOME_TYPES, MONTH_NAMES } from '@/lib/estimate';
import { trackCountyConversion, trackCalculatorUsage } from '@/lib/analytics';

/**
 * A live county estimate. The one engine (src/lib/estimate.ts) with the
 * county's own PVGIS yield passed in; nothing here does its own maths except
 * spreading the annual figure over PVGIS's own monthly shape for the chart.
 */
export default function CountyEstimator({
  county,
  countyName,
  place,
  kwhPerKwp,
  monthlyKwhPerKwp,
}: {
  county: string;
  countyName: string;
  place: string;
  kwhPerKwp: number;
  monthlyKwhPerKwp: readonly number[];
}) {
  const [bill, setBill] = useState(160);
  const [home, setHome] = useState<string>('semi');
  const [touched, setTouched] = useState(false);
  const billId = useId();
  const homeId = useId();

  const r = useMemo(
    () => estimate({ annualUsageKwh: usageFromMonthlyBill(bill), homeId: home, generationPerKwp: kwhPerKwp }),
    [bill, home, kwhPerKwp],
  );
  const months = monthlyKwhPerKwp.map((m) => Math.round(m * r.systemSizeKwp));
  const peak = Math.max(...months);

  const touch = () => {
    if (!touched) {
      setTouched(true);
      trackCalculatorUsage();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <label htmlFor={billId} className="block text-sm font-medium text-white/80">
          Your monthly electricity bill
        </label>
        <div className="mt-2 text-3xl font-bold tabular-nums text-white" aria-hidden="true">
          {fmtEur(bill)}
        </div>
        <input
          id={billId}
          type="range"
          min={80}
          max={350}
          step={10}
          value={bill}
          onChange={(e) => {
            setBill(Number(e.target.value));
            touch();
          }}
          aria-valuetext={`${fmtEur(bill)} a month`}
          className="mt-4 w-full accent-yellow-400"
        />
        <div className="mt-1 flex justify-between text-xs text-white/60">
          <span>€80</span>
          <span>€350</span>
        </div>

        <label htmlFor={homeId} className="mt-6 block text-sm font-medium text-white/80">
          Your home
        </label>
        <select
          id={homeId}
          value={home}
          onChange={(e) => {
            setHome(e.target.value);
            touch();
          }}
          className="mt-2 w-full rounded-xl border border-white/15 bg-[#141414] px-3 py-2.5 text-white"
        >
          {HOME_TYPES.map((h) => (
            <option key={h.id} value={h.id}>
              {h.label}
            </option>
          ))}
        </select>

        <p className="mt-6 text-xs leading-relaxed text-white/60">
          Panels only, no battery. Uses {kwhPerKwp} kWh per kWp a year, the PVGIS figure for a south-facing roof in{' '}
          {place}. Your bill shows your real day and
          night split, and the Bill Analyser reads it.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6" aria-live="polite">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['System', `${r.systemSizeKwp} kWp`],
            ['Saving a year', fmtEur(r.totalAnnualBenefitEur)],
            ['SEAI grant', fmtEur(r.grantEur)],
            ['Payback', `${r.paybackYears} years`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-white/60">{k}</dt>
              <dd className="mt-1 text-xl font-bold tabular-nums text-white">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-white/70">
          {fmtEur(r.installCostEur)} installed, {fmtEur(r.costAfterGrantEur)} after the grant. About{' '}
          {r.annualGenerationKwh.toLocaleString()} kWh a year in {countyName}.
        </p>

        <figure className="mt-6">
          <figcaption className="text-sm font-medium text-white/80">Monthly generation in {countyName}, kWh</figcaption>
          <div className="mt-3 flex h-36 items-end gap-1.5" role="img" aria-label={`Monthly generation: ${MONTH_NAMES.map((m, i) => `${m} ${months[i]} kWh`).join(', ')}`}>
            {months.map((kwh, i) => (
              <div key={MONTH_NAMES[i]} className="flex h-full flex-1 flex-col justify-end">
                <div
                  className="county-bar w-full rounded-t bg-yellow-400"
                  style={{ height: `${Math.max(4, (kwh / peak) * 100)}%`, animationDelay: `${i * 40}ms` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex gap-1.5 text-[10px] text-white/60" aria-hidden="true">
            {MONTH_NAMES.map((m) => (
              <span key={m} className="flex-1 text-center">
                {m[0]}
              </span>
            ))}
          </div>
        </figure>

        <div className="mt-6 flex flex-wrap gap-3">
          <IntakeLink
            opts={{ door: 'county', step: 'bill', bill, per: 'month', county, src: `county-${county}` }}
            onOpen={() => trackCountyConversion('analyser_start', county, 'estimator')}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300"
          >
            Check my savings with my bill
          </IntakeLink>
        </div>
      </div>
    </div>
  );
}
