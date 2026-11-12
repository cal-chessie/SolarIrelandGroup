import type { LucideIcon } from 'lucide-react';
import { CalendarDays, FileText, ShieldCheck, Sun, Wrench, Zap } from 'lucide-react';

/**
 * The one consolidated trust block (homepage, 11 Nov 2026). Before, five
 * different trust rows said overlapping and partly unconfirmed things; this
 * is the single place, and every fact is on the brief's true list. Open
 * type in equal hairline cells. Colour pass (11 Nov, Cal: "minimally pop
 * better"): a small amber icon, the label in a yellow gradient, a fine
 * yellow hairline on top, a soft glow and lift on hover.
 */
const FACTS: { big: string; line: string; icon: LucideIcon; mono?: boolean }[] = [
  { big: 'SEAI', line: 'Registered installers', icon: ShieldCheck },
  { big: 'RECI', line: 'Registered Electricians', icon: Zap },
  { big: '2019', line: 'Founded', mono: true, icon: CalendarDays },
  { big: '5 years', line: 'Workmanship warranty', icon: Wrench },
  { big: '25 years', line: 'Panel warranty', icon: Sun },
  { big: 'BER', line: 'We book it for you', icon: FileText },
];

export default function HomeTrust() {
  return (
    <section id="trust" className="h-sec" aria-labelledby="trust-title">
      <div className="h-glow-clip" aria-hidden="true">
        <div className="h-glow" style={{ width: 680, height: 380, right: '-10%', top: '8%' }} />
      </div>
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
              <div className="h-cell">
                <span className="h-cell__icon" aria-hidden="true">
                  <f.icon size={18} strokeWidth={1.75} />
                </span>
                <span className={`h-cell__big ${/\d/.test(f.big) ? 'h-fig' : ''}`}>{f.big}</span>
                <span className="h-cell__line">{f.line}</span>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
