import { ArrowRight } from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { DOMESTIC_MIN_KWP, estimate } from '@/lib/estimate';

/**
 * The value (homepage, #why-solar). Redesign 15 Nov 2026 (branch
 * home-sections-world-class): three equal boxes became two chapters of one
 * data story, each a wide chart with its reading beside it.
 *
 *   1. What a unit costs you: the price history (CRU, SEAI), unchanged data.
 *   2. What a 4 kWp roof makes: the month-by-month output, now read from the
 *      one engine (src/lib/estimate.ts), with an average home's monthly use
 *      drawn across it. The months above the line are the export months, which
 *      is where the Clean Export Guarantee (our €0.18 estimate rate) comes in.
 *
 * Numbers (fault B, 15 Nov): this section used to carry its own per-kWp table
 * ("Dublin TMY"), summing to 3,816 kWh a year and 96 kWh in December, while
 * the engine and the winter post say 3,800 and 110. It now calls estimate()
 * at the 4 kWp floor, so it says exactly what the calculator and the post say.
 */

// Average residential rate per kWh, all-in (CRU, SEAI). Unchanged.
const PRICES = [
  { year: 2019, price: 0.24 },
  { year: 2020, price: 0.25 },
  { year: 2021, price: 0.28 },
  { year: 2022, price: 0.39 },
  { year: 2023, price: 0.36 },
  { year: 2024, price: 0.33 },
  { year: 2025, price: 0.31 },
];

// A typical Irish home's yearly use, the figure the approved winter post
// ("High bills this winter?", 15 Nov 2026) works from: about 4,200 kWh, or
// 350 kWh in an average month.
const HOME_USE_KWH_YEAR = 4200;

const eur = (n: number) => `€${n.toFixed(2)}`;
const kwh = (n: number) => n.toLocaleString('en-IE');

export default function WhySolar() {
  // Prices
  const first = PRICES[0];
  const now = PRICES[PRICES.length - 1];
  const peak = PRICES.reduce((a, b) => (b.price > a.price ? b : a));
  const priceTop = 0.42;

  // Output: the engine at the domestic floor. Usage only sizes nothing here,
  // because the size is fixed; the monthly split is the engine's own.
  const kwp = DOMESTIC_MIN_KWP;
  const est = estimate({ annualUsageKwh: HOME_USE_KWH_YEAR, systemSizeKwp: kwp });
  const months = est.monthlyGeneration;
  const annual = est.annualGenerationKwh;
  const homeMonth = Math.round(HOME_USE_KWH_YEAR / 12);
  const peakMonth = months.reduce((a, b) => (b.generationKwh > a.generationKwh ? b : a));
  const dec = months[11];
  const genTop = Math.ceil((peakMonth.generationKwh * 1.08) / 50) * 50;
  const surplus = months.filter((m) => m.generationKwh > homeMonth);
  const surplusSpan =
    surplus.length > 1 ? `${monthLong(surplus[0].month)} to ${monthLong(surplus[surplus.length - 1].month)}` : '';
  const exportRate = SOLAR_DATA.export.estimateLabel.replace('/kWh', '');

  return (
    <section id="why-solar" className="h-sec h-sec--why" aria-labelledby="value-title">
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
          <div data-reveal="">
            <p className="h-lead">
              Panels make your own electricity by day, and your supplier pays you for what you don&apos;t use. Two
              charts tell the story.
            </p>
          </div>
        </div>

        {/* Chapter 1: what a unit costs you */}
        <div className="h-chapter" data-reveal="">
          <div className="h-chapter__read">
            <h3 className="h-chapter__k">What a unit costs you</h3>
            <p className="h-chapter__fig">
              <span className="h-fig">{eur(now.price)}</span>
              <small>a kWh in {now.year}, all-in</small>
            </p>
            <p className="h-body">
              In {first.year} it was {eur(first.price)}. It peaked at {eur(peak.price)} in {peak.year} and has not gone
              back. Every unit your panels make is one you don&apos;t buy at that price.
            </p>
            <p className="h-fine h-chapter__src">Average home rate per kWh, all-in. Source: CRU, SEAI.</p>
          </div>

          <figure className="h-chart h-chart--price">
            <div
              className="h-chart__plot"
              role="img"
              aria-label={`Average Irish home electricity price per kWh, all-in: ${PRICES.map((d) => `${d.year} ${Math.round(d.price * 100)} cent`).join(', ')}.`}
            >
              <span
                className="h-chart__ref"
                style={{ bottom: `${(first.price / priceTop) * 100}%` }}
                aria-hidden="true"
              />
              {PRICES.map((d) => (
                <div
                  key={d.year}
                  className="h-col"
                  data-now={d.year === now.year ? '' : undefined}
                  aria-hidden="true"
                >
                  <span className="h-col__v">{eur(d.price)}</span>
                  <i style={{ height: `${(d.price / priceTop) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="h-chart__axis h-chart__axis--7" aria-hidden="true">
              {PRICES.map((d) => (
                <span key={d.year}>{d.year}</span>
              ))}
            </div>
            <figcaption className="h-legend">
              <span>
                <i className="h-legend__line" aria-hidden="true" />
                The {first.year} price, for comparison
              </span>
            </figcaption>
          </figure>
        </div>

        {/* Chapter 2: what a 4 kWp roof makes, and what goes out */}
        <div className="h-chapter h-chapter--flip" data-reveal="">
          <div className="h-chapter__read">
            <h3 className="h-chapter__k">What a {kwp} kWp roof makes</h3>
            <p className="h-chapter__fig">
              <span className="h-fig">~{kwh(annual)}</span>
              <small>kWh a year on a good south-facing roof</small>
            </p>
            <p className="h-body">
              Panels run on daylight, so even December makes about {dec.generationKwh} kWh. June makes about{' '}
              {peakMonth.generationKwh}. These are the same figures our savings estimate uses.
            </p>
            {surplusSpan ? (
              <p className="h-body mt-4">
                From {surplusSpan} the roof makes more than an average home uses. Under the Clean Export Guarantee your
                supplier pays you for what goes out, as a credit on your bill through your smart meter. Each supplier
                sets its own rate and the CRU sets no minimum; our estimates use {exportRate} a kWh.
              </p>
            ) : null}
          </div>

          <figure className="h-chart h-chart--gen">
            <div className="h-chart__plot" role="img" aria-label={`Monthly output of a ${kwp} kWp system: ${months.map((m) => `${m.month} ${m.generationKwh} kWh`).join(', ')}. An average home uses about ${homeMonth} kWh a month.`}>
              <span className="h-chart__ref" style={{ bottom: `${(homeMonth / genTop) * 100}%` }} aria-hidden="true" />
              {months.map((m) => {
                const within = Math.min(m.generationKwh, homeMonth);
                const over = Math.max(0, m.generationKwh - homeMonth);
                const key = m === peakMonth || m === dec;
                return (
                  <div key={m.month} className="h-col h-col--gen" data-key={key ? '' : undefined} aria-hidden="true">
                    <span className="h-col__v">{m.generationKwh}</span>
                    <span className="h-col__stack" style={{ height: `${(m.generationKwh / genTop) * 100}%` }}>
                      {over > 0 ? <i className="h-col__over" style={{ flexGrow: over }} /> : null}
                      <i className="h-col__within" style={{ flexGrow: within }} />
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-chart__axis h-chart__axis--12" aria-hidden="true">
              {months.map((m) => (
                <span key={m.month}>
                  <span className="h-ax-long">{m.month}</span>
                  <span className="h-ax-short">{m.month[0]}</span>
                </span>
              ))}
            </div>
            <figcaption className="h-legend">
              <span>
                <i className="h-legend__line" aria-hidden="true" />
                An average home uses about {homeMonth} kWh a month
              </span>
              <span>
                <i className="h-legend__within" aria-hidden="true" />
                Up to what an average home uses that month
              </span>
              <span>
                <i className="h-legend__over" aria-hidden="true" />
                More than that: it goes to the grid and earns export credit
              </span>
            </figcaption>
          </figure>
        </div>

        <div className="h-why__foot" data-reveal="">
          <a href="#calculator" className="h-text-cta">
            Check my savings
            <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function monthLong(m: string): string {
  const full: Record<string, string> = {
    Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June',
    Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
  };
  return full[m] ?? m;
}
