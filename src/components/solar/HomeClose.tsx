'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/**
 * The closing band (homepage, 11 Nov 2026): one more door back to the
 * analyser for whoever scrolled to the end, and the second of the two quiet
 * WhatsApp links the page carries (DECISIONS.md R4). Open type on the canvas,
 * a low brand glow, and the bee keeping an eye on it.
 */
export default function HomeClose() {
  return (
    <section id="get-started" className="h-sec" aria-labelledby="close-title">
      <div className="h-glow-clip" aria-hidden="true">
        <div className="h-glow" aria-hidden="true" style={{ width: 640, height: 420, left: '-8%', top: '10%' }} />
      </div>
      <div className="h-wrap relative">
        <div className="h-close">
          <div data-reveal="">
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
          </div>
          <div className="flex items-end justify-between gap-6" data-reveal="" style={{ ['--d' as string]: 1 }}>
            <div className="h-close__acts">
              <a href="#calculator" className="h-btn">
                Check my savings
                <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
              </a>
              <a href={buildWhatsAppUrl({ source: 'footer' })} target="_blank" rel="noopener noreferrer" className="h-quiet">
                or WhatsApp us
              </a>
            </div>
            <Image
              src="/bumblebee-md.webp"
              alt=""
              width={96}
              height={96}
              className="h-bee h-bee--bob w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
