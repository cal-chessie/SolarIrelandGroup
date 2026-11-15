import Image from 'next/image';

/**
 * Trust (homepage, #trust). Redesign 15 Nov 2026 (branch
 * home-sections-world-class): the six icon tiles said what we hold but not
 * what any of it does for you. Now each credential is one row of a ledger,
 * pinned to the moment in your project where it matters, with what it means
 * for your grant or your safety. A real install photo anchors the left lane.
 *
 * Every credential here is Cal-confirmed (15 Nov 2026): SEAI registered, RECI
 * registered, Safe Electric Approved, Microgeneration Certified, the 25-year
 * panel warranty and the 5-year workmanship warranty. Process facts match the
 * FAQ and the services page: you apply on SEAI's portal before work starts,
 * we notify ESB Networks (NC6) before installation, and after it we book the
 * BER and send SEAI the paperwork.
 */
const LEDGER: { when: string; name: string; means: string }[] = [
  {
    when: 'Before work starts',
    name: 'SEAI registered installer',
    means: 'SEAI only pays the grant when a registered company does the work. You name us on your application.',
  },
  {
    when: 'Before work starts',
    name: 'Microgeneration certified',
    means: 'To ESB Networks, home solar is microgeneration. We send them the NC6 form before your system is fitted, as they require.',
  },
  {
    when: 'Install day',
    name: 'RECI registered',
    means: 'A registered electrical contractor wires your system and certifies the work when it is finished.',
  },
  {
    when: 'Install day',
    name: 'Safe Electric Approved',
    means: "Ireland's electrical safety scheme, regulated by the CRU. The contractor who signs off your wiring is one it registers and checks.",
  },
  {
    when: 'Years 1 to 5',
    name: '5-year workmanship warranty',
    means: 'If anything we fitted goes wrong, we come back and put it right.',
  },
  {
    when: 'Years 1 to 25',
    name: '25-year panel warranty',
    means: 'The panels on your roof are covered for 25 years.',
  },
];

export default function HomeTrust() {
  return (
    <section id="trust" className="h-sec h-sec--trust" aria-labelledby="trust-title">
      <div className="h-wrap relative">
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
          <div data-reveal="">
            <p className="h-lead">
              We have fitted solar since 2019. Each registration below does a job in your project, from the grant
              application to the panels&apos; 25th year.
            </p>
          </div>
        </div>

        <div className="h-trust">
          <figure className="h-trust__photo" data-reveal="">
            <div className="h-trust__frame">
              <Image
                src="/installs/red-brick-semi-solar-panels.webp"
                alt="Red-brick semi-detached house with black solar panels, a tree in front, fitted by Solar Ireland Group"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption>One of our installs: a red-brick semi, black panels.</figcaption>
          </figure>

          <ol className="h-ledger" aria-label="Our registrations and warranties, in the order they matter">
            {LEDGER.map((row) => (
              <li key={row.name} className="h-ledger__row" data-reveal="">
                <span className="h-ledger__when">{row.when}</span>
                <h3 className="h-ledger__name">{row.name}</h3>
                <p className="h-ledger__means">{row.means}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
