import { ArrowRight } from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { DOMESTIC_MIN_KWP, estimate } from '@/lib/estimate';

/**
 * The value (homepage, #why-solar). Restructure, 11 Nov 2026: cut hard to
 * one cell per idea. The stat tiles repeated other sections, and the benefit
 * cards carried unsourced claims ("Up to 70%", property value); both are
 * gone (DECISIONS.md R2). What stays is what backs up the visitor's own
 * number: prices (CRU, SEAI), the export payment, year-round output.
 *
 * 16 Nov 2026: the output chart had its own Dublin table (3,816 kWh a year,
 * 96 in December) while the engine and the winter post say 3,800 and 110.
 * It now reads estimate() at the 4 kWp domestic floor, so the home page, the
 * calculator and the posts give the same year, December and June.
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

// Monthly output comes from the one savings engine (src/lib/estimate.ts).
// The size is fixed at the domestic floor, so the usage passed in changes
// nothing here: generation depends on the size alone.
const output = estimate({ annualUsageKwh: 4200, systemSizeKwp: DOMESTIC_MIN_KWP });
const monthlyGen = output.monthlyGeneration.map((m) => m.generationKwh);

export default function WhySolar() {
  const maxPrice = Math.max(...priceData.map((d) => d.price));
  const maxGen = Math.max(...monthlyGen);
  const annual4kWp = output.annualGenerationKwh;
  const dec4kWp = monthlyGen[11];

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
              <small>kWh a year from a {DOMESTIC_MIN_KWP} kWp system</small>
            </span>
            <div
              className="h-months"
              role="img"
              aria-label={`Monthly output of a ${DOMESTIC_MIN_KWP} kWp system on a good south-facing roof, from ${dec4kWp} kWh in December to ${maxGen} kWh in June`}
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
              Panels run on daylight. A south-facing {DOMESTIC_MIN_KWP} kWp roof still makes about {dec4kWp} kWh in December.
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
