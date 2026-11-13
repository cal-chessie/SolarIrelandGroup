'use client';

import IntakeLink from '@/components/intake/IntakeLink';
import { trackCountyConversion } from '@/lib/analytics';
import { SOLAR_DATA } from '@/lib/solar-data';

const primary =
  'inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300';
const quiet =
  'inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/5';

/** The three conversion doors on a county page, each tagged with the county. */
export default function CountyActions({ county, placement, phone = false }: { county: string; placement: string; phone?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      <IntakeLink
        opts={{ door: 'county', step: 'bill', county, src: `county-${county}` }}
        onOpen={() => trackCountyConversion('analyser_start', county, placement)}
        className={primary}
      >
        Check my savings
      </IntakeLink>
      <IntakeLink
        opts={{ door: 'county', step: 'time', county, src: `county-${county}` }}
        onOpen={() => trackCountyConversion('call_click', county, placement)}
        className={quiet}
      >
        Book a free 15-minute call
      </IntakeLink>
      {phone ? (
        <a
          href={`tel:${SOLAR_DATA.provider.phone.replace(/\s/g, '')}`}
          onClick={() => trackCountyConversion('phone_click', county, placement)}
          className={quiet}
        >
          Call {SOLAR_DATA.provider.phoneDisplay}
        </a>
      ) : null}
    </div>
  );
}
