'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/**
 * The closing band (homepage, 11 Nov 2026): one more door back to the
 * analyser for whoever scrolled to the end, and the second of the two quiet
 * WhatsApp links the page carries (DECISIONS.md R4).
 *
 * Cal: the band's small bee sat right beside the floating chat bee. Now the
 * words and the CTA hold the left, and the right is a faint honeycomb with
 * the bee, big, lifting off it; a few cells glow in turn. The floating chat
 * bee stays on screen here: hiding it as the band scrolled in made the
 * smooth scroll glitch, which Cal judged far worse (11 Nov).
 */

/* A flat-top hex grid, drawn once at build time. R is the cell radius. */
const R = 26;
const H = Math.sqrt(3) * R;
const W_BOX = 560;
const H_BOX = 420;
function hex(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}
const CELLS: { key: string; points: string; cx: number; cy: number }[] = [];
for (let col = 0; col * 1.5 * R < W_BOX + R; col += 1) {
  for (let row = -1; row * H < H_BOX + H; row += 1) {
    const cx = col * 1.5 * R;
    const cy = row * H + (col % 2 ? H / 2 : 0);
    CELLS.push({ key: `${col}-${row}`, points: hex(cx, cy, R - 2), cx, cy });
  }
}
/* The cells under the bee that glow in sequence: the nearest few to the
   point it lifts off from. */
const HUB = { x: 330, y: 250 };
const GLOW = [...CELLS]
  .sort((a, b) => Math.hypot(a.cx - HUB.x, a.cy - HUB.y) - Math.hypot(b.cx - HUB.x, b.cy - HUB.y))
  .slice(0, 7)
  .map((c) => c.key);

function Honeycomb() {
  return (
    <svg className="h-comb" viewBox={`0 0 ${W_BOX} ${H_BOX}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {CELLS.map((c) => {
        const g = GLOW.indexOf(c.key);
        return (
          <polygon
            key={c.key}
            points={c.points}
            className={g >= 0 ? 'h-comb__cell h-comb__cell--glow' : 'h-comb__cell'}
            style={g >= 0 ? { ['--g' as string]: g } : undefined}
          />
        );
      })}
    </svg>
  );
}

export default function HomeClose() {
  return (
    <section id="get-started" className="h-sec" aria-labelledby="close-title">
      <div className="h-glow-clip" aria-hidden="true">
        <div className="h-glow" aria-hidden="true" style={{ width: 640, height: 420, left: '-8%', top: '10%' }} />
      </div>
      <div className="h-wrap relative">
        <div className="h-close">
          <div className="h-close__copy" data-reveal="">
            <span className="h-kicker">
              <span className="h-ring" aria-hidden="true" />
              Your number
            </span>
            <h2 id="close-title" className="h-title">
              Find out what your roof is worth.
            </h2>
            <p className="h-lead">
              It starts with a photo of your bill. You see your saving, your grant and your payback first, and we ring
              you the same day.
            </p>
            <div className="h-close__acts">
              <a href="#calculator" className="h-btn">
                Check my savings
                <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
              </a>
              <a href={buildWhatsAppUrl({ source: 'footer' })} target="_blank" rel="noopener noreferrer" className="h-quiet">
                or WhatsApp us
              </a>
            </div>
          </div>
          <div className="h-close__art" aria-hidden="true" data-reveal="" style={{ ['--d' as string]: 1 }}>
            <Honeycomb />
            <Image src="/bumblebee-hero.webp" alt="" width={220} height={220} className="h-bee h-close__bee" />
          </div>
        </div>
      </div>
    </section>
  );
}
