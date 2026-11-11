'use client';

import { ArrowRight } from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';

/**
 * The value (homepage, #why-solar). Restructure, 11 Nov 2026: cut hard to
 * one cell per idea. The stat tiles repeated other sections, and the benefit
 * cards carried unsourced claims ("Up to 70%", property value); both are
 * gone (DECISIONS.md R2). What stays is what backs up the visitor's own
 * number: prices (CRU, SEAI), the export payment, year-round output.
 */

// Average residential rate per kWh, all-in (CRU, SEAI). Unchanged from the
// previous section.
const priceData = [
  { year: 2019, price: 0.24 },
  { year: 2020, price: 0.25 },
  { year: 2021, price: 0.28 },
  { year: 2022, price: 0.39 },
  { year: 2023, price: 0.36 },
  { year: 2024, price: 0.33 },
  { year: 2025, price: 0.31 },
];

// Average monthly output per kWp installed, Dublin TMY (SEAI). Unchanged.
const monthlyGen = [29, 48, 76, 103, 125, 131, 123, 113, 88, 60, 34, 24];

export default function WhySolar() {
  const maxPrice = Math.max(...priceData.map((d) => d.price));
  const maxGen = Math.max(...monthlyGen);
  const annual4kWp = monthlyGen.reduce((a, b) => a + b, 0) * 4;
  const dec4kWp = monthlyGen[11] * 4;

  return (
    <section id="why-solar" className="h-sec" aria-labelledby="value-title">
      <div className="h-glow-clip" aria-hidden="true">
        <div className="h-glow" style={{ width: 640, height: 400, left: '30%', top: '40%' }} />
      </div>
      <div className="h-wrap relative">
        <div className="h-head">
          <div data-reveal="">
            <span className="h-kicker">
              <span className="h-ring" aria-hidden="true" />
              Is solar worth it
            </span>
            <h2 id="value-title" className="h-title">
              Why panels pay on an Irish roof.
            </h2>
          </div>
          <div data-reveal="" style={{ ['--d' as string]: 1 }}>
            <p className="h-lead">
              Panels make your own electricity by day, and your supplier pays you for what you don&apos;t use.
            </p>
          </div>
        </div>

        <div className="h-three">
          <article data-reveal="">
            <h3 className="h-item">Prices went up and stayed up</h3>
            <p className="h-body mt-2">Average home rate per kWh, all-in. Source: CRU, SEAI.</p>
            <div className="h-bars" role="img" aria-label="Average Irish home electricity price per kWh: 24 cent in 2019, 39 cent in 2022, 31 cent in 2025">
              {priceData.map((d, i) => (
                <div key={d.year} data-now={d.year === 2025 ? '' : undefined}>
                  <span>{d.year}</span>
                  <i style={{ width: `${(d.price / maxPrice) * 100}%`, ['--i' as string]: i }} />
                  <span className="text-right">€{d.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p className="h-body mt-6">Every unit your panels make is one you don&apos;t buy at that price.</p>
          </article>

          <article data-reveal="" style={{ ['--d' as string]: 1 }}>
            <h3 className="h-item">Paid for what you don&apos;t use</h3>
            <span className="h-bigfig">
              {SOLAR_DATA.export.estimateLabel.replace('/kWh', '')}
              <small>per kWh exported, our estimate rate</small>
            </span>
            <p className="h-body mt-4">
              Under the Clean Export Guarantee your supplier pays you for the power you send to the grid. Each supplier
              sets its own rate, and the CRU sets no minimum. It arrives as a credit on your bill, through your smart
              meter.
            </p>
          </article>

          <article data-reveal="" style={{ ['--d' as string]: 2 }}>
            <h3 className="h-item">It works in Irish weather</h3>
            <span className="h-bigfig">
              ~{annual4kWp.toLocaleString('en-IE')}
              <small>kWh a year from 4 kWp in Dublin</small>
            </span>
            <div
              className="h-months"
              role="img"
              aria-label={`Monthly output of a 4 kWp system in Dublin, from ${dec4kWp} kWh in December to ${maxGen * 4} kWh in June`}
            >
              {monthlyGen.map((g, i) => (
                <i
                  key={i}
                  data-peak={g === maxGen ? '' : undefined}
                  style={{ height: `${(g / maxGen) * 100}%`, ['--i' as string]: i }}
                />
              ))}
            </div>
            <div className="h-months-axis" aria-hidden="true">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
            <p className="h-body mt-4">
              Panels run on daylight. A 4 kWp roof still makes about {dec4kWp} kWh in December. Dublin data, SEAI.
            </p>
          </article>
        </div>

        <div className="mt-12" data-reveal="">
          <a href="#calculator" className="h-text-cta">
            Check my savings
            <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
