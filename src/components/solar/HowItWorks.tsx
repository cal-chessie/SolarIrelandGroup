import { ArrowRight } from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';

/**
 * What happens next (homepage, #how-it-works). Redesign 15 Nov 2026 (branch
 * home-sections-world-class): four equal cards on a line became one route
 * map. Columns are the real moments (only durations the site can stand
 * behind: about a minute, the same-day 15-minute call, 4 to 6 weeks after the
 * BER); rows are who acts (you, us, SEAI). On a phone it reads top to bottom
 * as one rail. The facts are the previous copy, checked against the FAQ and
 * the services page: you apply on SEAI's portal before work starts and SEAI
 * decides; we notify ESB Networks (NC6), book the BER and send SEAI the
 * paperwork; SEAI pays normally 4 to 6 weeks after the BER is published.
 */
const SEAI_GRANT_PORTAL = 'https://mgen.seai.ie/';

type Who = 'you' | 'us' | 'seai';
const WHO_LABEL: Record<Who, string> = { you: 'You', us: 'Solar Ireland', seai: 'SEAI' };

const STAGES: { when: string; span: string; acts: { who: Who; text: React.ReactNode }[] }[] = [
  {
    when: 'Today',
    span: 'About a minute',
    acts: [
      {
        who: 'you',
        text: 'Upload your bill or type the amount. You see your yearly saving, the right system size, your grant and your payback.',
      },
      { who: 'us', text: 'We read your unit rate, standing charge and day/night split.' },
    ],
  },
  {
    when: 'Same day',
    span: 'Or next morning, if late',
    acts: [
      { who: 'you', text: 'Leave your name, mobile and email. That is all we ask.' },
      {
        who: 'us',
        text: "We email your full estimate, then a 15\u2011minute call to check what a bill can't show: your roof, your meter, when you use power. Then you get a fixed-price proposal.",
      },
    ],
  },
  {
    when: 'Before work starts',
    span: 'The grant application',
    acts: [
      {
        who: 'you',
        text: (
          <>
            Apply on{' '}
            <a href={SEAI_GRANT_PORTAL} target="_blank" rel="noopener noreferrer">
              SEAI&apos;s grant portal
            </a>
            , naming us. We walk you through it.
          </>
        ),
      },
      { who: 'seai', text: 'Decides on your grant.' },
    ],
  },
  {
    when: 'Install day',
    span: 'On your roof',
    acts: [
      {
        who: 'us',
        text: 'Our RECI-registered team fits the system. We notify ESB Networks with the NC6 form, book your BER and send SEAI the paperwork.',
      },
    ],
  },
  {
    when: '4 to 6 weeks',
    span: 'After your BER is published',
    acts: [
      {
        who: 'seai',
        text: `Pays the grant into your account: up to ${SOLAR_DATA.grant.label} for panels, ${SOLAR_DATA.batteryGrant.withSolarMaxLabel} with a battery of ${SOLAR_DATA.batteryGrant.minLabel}.`,
      },
    ],
  },
];

const LANES: Who[] = ['you', 'us', 'seai'];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="h-sec h-sec--how" aria-labelledby="how-title">
      <div className="h-wrap relative">
        <div className="h-head">
          <div data-reveal="">
            <span className="h-kicker">
              <span className="h-ring" aria-hidden="true" />
              What happens next
            </span>
            <h2 id="how-title" className="h-title">
              From your bill to panels on the roof.
            </h2>
          </div>
          <div data-reveal="">
            <p className="h-lead">
              Five moments from your bill to SEAI paying your grant, and who does what at each one. You can follow
              every step of your project on your phone.
            </p>
          </div>
        </div>

        <div className="h-route" data-reveal="">
          {/* Lane bands, desktop only: the row headers of the map. */}
          {LANES.map((w, i) => (
            <div key={w} className="h-route__lane" style={{ gridRow: i + 2 }} aria-hidden="true">
              <span>{WHO_LABEL[w]}</span>
            </div>
          ))}
          <ol className="h-route__stages">
            {STAGES.map((s, i) => (
              <li key={s.when} className="h-stage" data-last={i === STAGES.length - 1 ? '' : undefined}>
                <h3 className="h-stage__when">
                  <span className="h-stage__t">{s.when}</span>
                  <span className="h-stage__span">{s.span}</span>
                </h3>
                {s.acts.map((a) => (
                  <div key={a.who} className="h-act" data-who={a.who}>
                    <span className="h-act__who">{WHO_LABEL[a.who]}</span>
                    <p className="h-act__text">{a.text}</p>
                  </div>
                ))}
              </li>
            ))}
          </ol>
        </div>

        <div className="h-route__foot" data-reveal="">
          <a href="#calculator" className="h-text-cta">
            Check my savings
            <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
