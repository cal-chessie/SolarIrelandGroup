'use client';

/**
 * A calm, full-width band that carries the inline door lower down a page
 * (the home page's old analyser slot, /solar-calculator, the end of a blog
 * article). Heading and one line on the left, the door on the right from
 * 1024 px; stacked on phones.
 */
import './intake.css';
import IntakeDoor from './IntakeDoor';
import type { DoorSegment } from '@/lib/intake/open';

export default function IntakeDoorSection({
  id,
  door,
  heading = 'See what solar would save you',
  line = 'Type your bill and see your estimate on this page, then pick a time for a free site survey. No email needed to see it.',
  segment = 'home',
  as = 'h2',
}: {
  id?: string;
  door: string;
  heading?: string;
  line?: string;
  segment?: DoorSegment;
  as?: 'h1' | 'h2';
}) {
  const H = as;
  return (
    <section id={id} className="si-door-section" style={{ scrollMarginTop: 80 }}>
      <div className="si-door-section__inner">
        <div>
          <H>{heading}</H>
          <p>{line}</p>
        </div>
        <IntakeDoor door={door} segment={segment} />
      </div>
    </section>
  );
}
