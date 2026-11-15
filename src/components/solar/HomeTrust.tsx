import TrustPhoto from './TrustPhoto';

/**
 * The one consolidated trust block (homepage). Every fact is on the brief's
 * true list (Cal-confirmed, 15 Nov 2026).
 *
 * Premium pass (15 Nov 2026, Cal: "make this one scream premium ... a
 * better layout with a great image. It's important that mobile is rock
 * solid."). Same headline, same intro, same six credentials with short
 * labels. The six now sit on one plate with a real install photo: the
 * photo and the credentials are a single object, the photo bleeding into
 * the panel. No icon tiles, no glow blob.
 *
 * Content is visible at rest: nothing here starts at opacity 0. The plate
 * carries data-reveal only so HomeClient's observer marks it .is-in; the
 * photo then settles from a slight zoom (transform only, finite). home.css
 * keeps the plate itself at full opacity.
 *
 * The photo sits below the fold: lazy (no priority), next/image serves
 * AVIF/WebP, it mounts 600px before the viewport (see TrustPhoto), and its
 * box is sized by CSS (aspect-ratio on phones, the panel's height from
 * 768), so it never shifts the layout.
 */
const FACTS: { big: string; line: string }[] = [
  { big: 'SEAI', line: 'Registered installers' },
  { big: 'RECI', line: 'Registered electricians' },
  { big: '2019', line: 'Founded' },
  { big: '5 years', line: 'Workmanship warranty' },
  { big: '25 years', line: 'Panel warranty' },
  { big: 'BER', line: 'We book it for you' },
];

export default function HomeTrust() {
  return (
    <section id="trust" className="h-sec" aria-labelledby="trust-title">
      <div className="h-wrap">
        <div className="h-head">
          <div>
            <span className="h-kicker">
              <span className="h-ring" aria-hidden="true" />
              Why Solar Ireland
            </span>
            <h2 id="trust-title" className="h-title">
              Your grant depends on who fits your panels.
            </h2>
          </div>
          <div>
            <p className="h-lead">
              SEAI only pays the grant when a registered company does the work. We are SEAI and RECI registered,
              founded in 2019. We book your BER, send SEAI the paperwork, and you track every step of your project on
              your phone.
            </p>
          </div>
        </div>

        <div className="ht-plate" data-reveal="">
          <TrustPhoto />

          <ul className="ht-facts">
            {FACTS.map((f) => (
              <li key={f.line} className="ht-fact">
                <span className={`ht-fact__big ${/\d/.test(f.big) ? 'h-fig' : ''}`}>{f.big}</span>
                <span className="ht-fact__line">{f.line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
