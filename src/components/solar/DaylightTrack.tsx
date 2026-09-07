'use client';

import { useEffect, useState } from 'react';

/**
 * A hairline arc of today's daylight over Ireland, with the sun where it
 * actually is right now.
 *
 * Real positions, not decoration: NOAA's solar equations for the equation of
 * time and declination, at Ireland's centre. In December the arc is visibly
 * short and in June it stretches; a visitor at 8am in winter sees the dot only
 * just up. That is the honest version of "your panels are working", and it
 * says something a stock photo cannot.
 *
 * It claims nothing about output. Daylight is a fact; what a given roof makes
 * from it is the survey's job.
 */

// Ireland, roughly centre (Athlone).
const LAT = 53.42;
const LON = -7.94;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Minutes from UTC midnight for sunrise and sunset on the given date. */
function sunTimesUtcMinutes(date: Date): { sunrise: number; sunset: number } | null {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);

  // Fractional year, radians.
  const g = ((2 * Math.PI) / 365) * (dayOfYear - 1 + 0.5);

  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));

  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);

  // 90.833 degrees accounts for refraction and the sun's disc.
  const cosHa =
    Math.cos(rad(90.833)) / (Math.cos(rad(LAT)) * Math.cos(decl)) -
    Math.tan(rad(LAT)) * Math.tan(decl);

  // Polar day or night: never happens at this latitude, but stay safe.
  if (cosHa > 1 || cosHa < -1) return null;

  const ha = deg(Math.acos(cosHa));
  return {
    sunrise: 720 - 4 * (LON + ha) - eqTime,
    sunset: 720 - 4 * (LON - ha) - eqTime,
  };
}

function formatIrish(date: Date): string {
  return new Intl.DateTimeFormat('en-IE', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Europe/Dublin',
  }).format(date);
}

export default function DaylightTrack({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  // Rendered on the client only: the sun's position is not a server fact, and
  // rendering it during SSR would guarantee a hydration mismatch.
  const [state, setState] = useState<{
    progress: number;
    daylight: boolean;
    label: string;
    detail: string;
  } | null>(null);

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const times = sunTimesUtcMinutes(now);
      if (!times) return;

      const midnightUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      const sunrise = new Date(midnightUtc + times.sunrise * 60000);
      const sunset = new Date(midnightUtc + times.sunset * 60000);

      const span = sunset.getTime() - sunrise.getTime();
      const raw = (now.getTime() - sunrise.getTime()) / span;
      const daylight = raw >= 0 && raw <= 1;
      const hours = Math.round((span / 3600000) * 10) / 10;

      setState({
        progress: Math.min(1, Math.max(0, raw)),
        daylight,
        label: daylight ? 'Daylight over Ireland' : 'Panels resting',
        detail: daylight
          ? `${hours} hours today · sets ${formatIrish(sunset)}`
          : `Back at ${formatIrish(sunrise)}`,
      });
    };

    compute();
    // A minute is plenty: the dot moves about a pixel.
    const timer = setInterval(compute, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!state) return null;

  // A shallow arc, drawn once and measured, so the dot sits exactly on it.
  const W = 148;
  const H = 34;
  const path = `M 5 ${H - 5} Q ${W / 2} -4 ${W - 5} ${H - 5}`;

  // Quadratic bezier at t, for the dot.
  const t = state.progress;
  const p0 = { x: 5, y: H - 5 };
  const p1 = { x: W / 2, y: -4 };
  const p2 = { x: W - 5, y: H - 5 };
  const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
  const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;

  return (
    <div
      className={`inline-flex items-center gap-3.5 rounded-full border border-white/[0.12] bg-black/45 pl-4 pr-5 py-2.5 backdrop-blur-md shadow-lg shadow-black/30 ${className}`}
      style={style}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="overflow-visible shrink-0">
        <defs>
          <filter id="daylight-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* The whole day, faint but present */}
        <path d={path} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round" />
        {/* How much of it has gone */}
        <path
          d={path}
          fill="none"
          stroke={state.daylight ? '#facc15' : 'rgba(255,255,255,0.3)'}
          strokeWidth="2"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - t}
          opacity={state.daylight ? 0.9 : 0.4}
        />
        {state.daylight ? (
          <g filter="url(#daylight-glow)">
            <circle cx={x} cy={y} r={7} fill="rgba(250,204,21,0.28)" className="daylight-pulse" />
            <circle cx={x} cy={y} r={4} fill="#fde68a" />
            <circle cx={x} cy={y} r={2.4} fill="#ffffff" />
          </g>
        ) : (
          <circle cx={x} cy={y} r={3} fill="rgba(255,255,255,0.55)" />
        )}
      </svg>
      <span className="text-left leading-tight whitespace-nowrap">
        <span className="block text-[13px] font-semibold text-white">{state.label}</span>
        <span className="block text-[12px] text-white/65">{state.detail}</span>
      </span>
    </div>
  );
}
