'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';

/**
 * What happens next (homepage, 11 Nov 2026). HowItWorks and the old "How the
 * grant works" timeline said the same steps twice; this is the one merged
 * process. The site sells the 15-minute call, so the survey is a step here,
 * never the offer (DECISIONS.md R3). Steps are drawn as one connected line
 * with the logo's sun ring as each marker; the rings draw in on arrival.
 */
const SEAI_GRANT_PORTAL = 'https://mgen.seai.ie/';

const steps: { title: string; body: React.ReactNode; who: string }[] = [
  {
    title: 'Check your savings',
    body: 'Upload your bill above. You see your yearly saving, the right system and your payback before anyone rings you.',
    who: 'You, in about a minute',
  },
  {
    title: 'A 15-minute call, same day',
    body: 'We ring you the same day to go through your number, your roof and your grant.',
    who: 'Us, on the phone',
  },
  {
    title: 'Survey, then install',
    body: (
      <>
        After the call we survey your roof (free, on site or remote). You apply for your SEAI grant on{' '}
        <a href={SEAI_GRANT_PORTAL} target="_blank" rel="noopener noreferrer">
          SEAI&apos;s portal
        </a>{' '}
        before work starts, and we walk you through it. Our RECI-registered team installs and we notify ESB Networks.
      </>
    ),
    who: 'Us, with you',
  },
  {
    title: 'SEAI pays you',
    body: `We book your BER and send SEAI the paperwork. Once your BER is published, SEAI pays your grant of up to ${SOLAR_DATA.batteryGrant.withSolarMaxLabel}, normally 4 to 6 weeks later.`,
    who: 'Track it in real time',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="h-sec" aria-labelledby="how-title">
      <div className="h-wrap">
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
          <div data-reveal="" style={{ ['--d' as string]: 1 }}>
            <p className="h-lead">Four steps, and who does each one.</p>
          </div>
        </div>

        <ol className="h-steps">
          {steps.map((s, i) => (
            <li key={s.title} className="h-step" data-reveal="" style={{ ['--d' as string]: i }}>
              <span className="h-step__ring" aria-hidden="true">
                <svg viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="12" />
                </svg>
              </span>
              <span className="h-step__num">0{i + 1}</span>
              <h3 className="h-item">{s.title}</h3>
              <p className="h-body">{s.body}</p>
              <span className="h-step__who">{s.who}</span>
            </li>
          ))}
        </ol>

        <div className="h-steps__foot" data-reveal="">
          <a href="#calculator" className="h-text-cta">
            Check my savings
            <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
          </a>
          {/* The bee, peeking in at the end of the line. */}
          <Image
            src="/bumblebee-flip.webp"
            alt=""
            width={96}
            height={96}
            className="h-bee h-bee--bob w-14 h-14"
          />
        </div>
      </div>
    </section>
  );
}
