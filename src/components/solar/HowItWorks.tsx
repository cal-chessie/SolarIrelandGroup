'use client';

import Image from 'next/image';
import { ArrowRight, ClipboardCheck, Euro, House, Phone, Sun } from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';

/**
 * What happens next (homepage, 11 Nov 2026). HowItWorks and the old "How the
 * grant works" timeline said the same steps twice; this is the one merged
 * process. The site sells the 15-minute call, so the survey is a step here,
 * never the offer (DECISIONS.md R3). Steps are drawn as one connected line
 * with a tinted icon tile on each step; the line fills yellow to green
 * as the steps arrive (11 Nov colour pass, Cal: not black and white).
 */
const SEAI_GRANT_PORTAL = 'https://mgen.seai.ie/';

/** Each step's tile: sun (the estimate), phone (the call), clipboard (survey
 *  and proposal), home with a euro (install, then the grant paid). */
const ICONS: React.ReactNode[] = [
  <Sun key="sun" size={22} strokeWidth={1.75} />,
  <Phone key="phone" size={20} strokeWidth={1.75} />,
  <ClipboardCheck key="clip" size={21} strokeWidth={1.75} />,
  <span key="home" className="h-step__home">
    <House size={22} strokeWidth={1.75} />
    <span className="h-step__euro">
      <Euro size={10} strokeWidth={2.5} />
    </span>
  </span>,
];

const steps: { title: string; body: React.ReactNode; who: string }[] = [
  {
    title: 'Instant AI estimate',
    body: 'Upload your bill, or type the amount. We read your unit rate, standing charge and day/night split. You see your yearly saving, the right system size, your grant and your payback in about a minute.',
    who: 'You, online',
  },
  {
    title: 'Check your savings and book a call',
    body: "You get your full estimate by email, and we ring you the same day to talk it through. If it's late, we ring first thing tomorrow. Your name, mobile and email are all we ask for.",
    who: 'Us, on the phone',
  },
  {
    title: '15-minute survey and final proposal',
    body: (
      <>
        On the call we cover what a bill can&apos;t show: your roof, your meter and when you use power. Then we send
        your final proposal with the fixed price, the system and the grant. Before work starts, you apply on{' '}
        <a href={SEAI_GRANT_PORTAL} target="_blank" rel="noopener noreferrer">
          SEAI&apos;s grant portal
        </a>{' '}
        and we walk you through it.
      </>
    ),
    who: 'Us, with you',
  },
  {
    title: 'Install, then SEAI grant payment',
    body: `Our RECI-registered team installs, and we notify ESB Networks and book your BER. Once it's published, SEAI pays your grant of up to ${SOLAR_DATA.batteryGrant.withSolarMaxLabel}, normally 4 to 6 weeks later. You can track every step in real time.`,
    who: 'Our team, then SEAI',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="h-sec" aria-labelledby="how-title">
      <div className="h-glow-clip" aria-hidden="true">
        <div className="h-glow" style={{ width: 760, height: 460, left: '-10%', top: '24%' }} />
      </div>
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
          <div data-reveal="" style={{ ['--d' as string]: 1 }}>
            <p className="h-lead">Four steps from your bill to SEAI paying your grant, and who does each one.</p>
          </div>
        </div>

        <ol className="h-steps">
          {/* The line fills yellow to green as the steps arrive. */}
          <span className="h-steps__fill" data-reveal="" aria-hidden="true" />
          {steps.map((s, i) => (
            <li key={s.title} className="h-step" data-reveal="" style={{ ['--d' as string]: i }}>
              <span className="h-step__tile" aria-hidden="true">
                {ICONS[i]}
              </span>
              <div className="h-step__card">
                <span className="h-step__num">0{i + 1}</span>
                <h3 className="h-item">{s.title}</h3>
                <p className="h-body">{s.body}</p>
                <span className="h-step__who">{s.who}</span>
              </div>
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
