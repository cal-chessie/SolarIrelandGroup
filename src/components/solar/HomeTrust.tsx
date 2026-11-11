'use client';

/**
 * The one consolidated trust block (homepage, 11 Nov 2026). Before, five
 * different trust rows said overlapping and partly unconfirmed things; this
 * is the single place, and every fact is on the brief's true list. Open
 * type in equal hairline cells, no chips, no icons in colours.
 */
const FACTS: { big: string; line: string; mono?: boolean }[] = [
  { big: 'SEAI', line: 'Registered installers' },
  { big: 'RECI', line: 'Registered electrical contractor' },
  { big: '2019', line: 'Founded', mono: true },
  { big: '5 years', line: 'Workmanship warranty' },
  { big: '25 years', line: 'Panel warranty' },
  { big: 'BER', line: 'We book it for you' },
];

export default function HomeTrust() {
  return (
    <section id="trust" className="h-sec" aria-labelledby="trust-title">
      <div className="h-wrap">
        <div className="h-head">
          <div data-reveal="">
            <span className="h-kicker">
              <span className="h-ring" aria-hidden="true" />
              Why Solar Ireland
            </span>
            <h2 id="trust-title" className="h-title">
              Your grant depends on who fits your panels.
            </h2>
          </div>
          <div data-reveal="" style={{ ['--d' as string]: 1 }}>
            <p className="h-lead">
              SEAI only pays the grant when a registered company does the work. We are SEAI and RECI registered,
              founded in 2019. We book your BER, send SEAI the paperwork, and you track every step of your project on
              your phone.
            </p>
          </div>
        </div>

        <ul className="h-cells">
          {FACTS.map((f, i) => (
            <li key={f.line} data-reveal="" style={{ ['--d' as string]: i }}>
              <span className={`h-cell__big ${/\d/.test(f.big) ? 'h-fig' : ''}`}>{f.big}</span>
              <span className="h-cell__line">{f.line}</span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
