'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MapPin,
  Zap,
  ArrowRight,
  MessageCircle,
  Check,
  Sun,
  Navigation,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ═══════════════════════════════════════════════════════════════
   IRELAND SVG MAP DATA
   ═══════════════════════════════════════════════════════════════
   ViewBox: 0 0 400 550
   Coordinate mapping:
     x = (10.5 - lon) / 5.0 * 400
     y = (55.5 - lat) / 4.2 * 550
   ═══════════════════════════════════════════════════════════════ */

/**
 * Full island of Ireland outline — Republic + Northern Ireland.
 * Traced clockwise from Malin Head.
 * Key features captured: Inishowen, NI coast, Dublin Bay, SE broad coast,
 * Cork Harbour, Mizen Head, Beara, Dingle, Galway Bay, Achill, Donegal.
 */
const IRELAND_OUTLINE = [
  'M 250,28',
  // Malin Head → Inishowen east coast
  'C 257,30 268,38 280,48',
  'C 290,56 300,60 310,54',
  // Lough Foyle → NI north coast
  'C 322,44 340,38 358,42',
  'C 372,46 384,56 390,72',
  // NI east coast → Belfast
  'C 394,86 392,104 386,118',
  'C 382,130 376,140 370,150',
  'C 364,160 360,172 354,182',
  // NI border area → Dundalk
  'C 348,192 340,202 332,212',
  // Republic east coast → Drogheda
  'C 334,224 336,238 340,252',
  'C 344,264 348,276 354,288',
  // Dublin Bay (slight indent)
  'C 356,296 354,304 356,312',
  // Bray → Wicklow
  'C 356,324 354,336 358,348',
  // Wicklow Head → Arklow
  'C 356,358 350,370 344,382',
  // Arklow → Wexford
  'C 338,394 332,406 326,416',
  'C 318,430 308,440 296,448',
  // Rosslare → Hook Head
  'C 286,452 276,452 270,448',
  // Hook Head → Waterford
  'C 264,444 260,438 262,430',
  'C 264,424 268,418 268,414',
  // Waterford → Youghal (south coast)
  'C 260,424 248,440 234,452',
  'C 218,462 204,472 190,480',
  'C 178,488 168,494 160,500',
  // Cork Harbour area → Kinsale
  'C 154,506 148,512 144,518',
  // Kinsale → Seven Heads → Courtmacsherry
  'C 138,524 128,528 116,530',
  'C 102,534 88,536 76,536',
  // Mizen Head (most SW point)
  'C 64,536 56,534 50,530',
  // Beara Peninsula
  'C 42,524 34,518 26,512',
  'C 18,506 12,500 6,494',
  // Kenmare River → Dingle Peninsula
  'C 2,486 0,478 2,470',
  'C 4,462 2,454 4,448',
  // Slea Head (most W point of Dingle)
  'C 0,442 0,436 4,430',
  // Dingle east side → Tralee Bay
  'C 10,422 18,414 28,406',
  'C 38,398 46,390 52,382',
  // Loop Head → West Clare
  'C 56,374 60,366 66,356',
  'C 72,346 78,338 84,328',
  // Galway Bay area
  'C 92,318 100,308 108,298',
  'C 114,290 118,282 120,276',
  // Connemara coast
  'C 114,268 106,260 96,254',
  // Killary Harbour → Achill Island
  'C 84,246 72,240 62,234',
  'C 52,226 44,218 38,208',
  'C 32,198 36,190 44,182',
  // Clew Bay → Mayo coast
  'C 52,176 62,168 74,162',
  'C 86,156 98,150 112,144',
  // Sligo coast → Donegal Bay
  'C 128,138 144,132 158,126',
  'C 168,120 178,112 184,104',
  // Donegal NW coast
  'C 190,94 188,82 184,72',
  'C 180,60 176,48 178,38',
  'C 180,28 192,22 210,20',
  // Back to Malin Head
  'C 224,18 240,20 250,28',
  'Z',
].join(' ');

/**
 * Northern Ireland path (internal region within the island).
 * Coast from Lough Foyle around NE coast to Newry,
 * then back along the border through Fermanagh/Cavan to Lough Foyle.
 */
const NI_PATH = [
  'M 280,48',
  'C 290,56 300,60 310,54',
  'C 322,44 340,38 358,42',
  'C 372,46 384,56 390,72',
  'C 394,86 392,104 386,118',
  'C 382,130 376,140 370,150',
  'C 364,160 360,172 354,182',
  'C 348,192 340,202 332,212',
  // Internal border heading NW through Fermanagh/Cavan
  'C 322,206 310,196 296,184',
  'C 282,172 268,162 256,152',
  'C 246,144 240,134 238,122',
  'C 236,108 240,92 246,78',
  'C 252,66 264,56 280,48',
  'Z',
].join(' ');

/**
 * NI/ROI border line (shown as dashed line).
 * From Newry in SE through the midlands to Lough Foyle in NW.
 */
const NI_BORDER_LINE = [
  'M 332,212',
  'C 322,206 310,196 296,184',
  'C 282,172 268,162 256,152',
  'C 246,144 240,134 238,122',
  'C 236,108 240,92 246,78',
].join(' ');

/**
 * Province zone ellipses (clipped to Ireland outline minus NI).
 * Positioning tuned so each zone roughly covers its province area.
 */
const PROVINCE_ZONES = [
  { id: 'connacht', cx: 78, cy: 215, rx: 82, ry: 112, color: '#4ade80' },
  { id: 'leinster', cx: 296, cy: 260, rx: 78, ry: 138, color: '#facc15' },
  { id: 'munster', cx: 168, cy: 440, rx: 118, ry: 82, color: '#38bdf8' },
  { id: 'ulster', cx: 198, cy: 100, rx: 68, ry: 68, color: '#c084fc' },
];

/* Province label positions */
const PROVINCE_LABELS = [
  { text: 'CONNACHT', x: 72, y: 195, color: 'rgba(74,222,128,0.2)' },
  { text: 'LEINSTER', x: 298, y: 245, color: 'rgba(250,204,21,0.2)' },
  { text: 'MUNSTER', x: 170, y: 425, color: 'rgba(56,189,248,0.2)' },
  { text: 'ULSTER', x: 196, y: 95, color: 'rgba(192,132,252,0.2)' },
];

/* ═══════════════════════════════════════════════════════════════
   INSTALLATION & SERVICE AREA LOCATIONS
   ═══════════════════════════════════════════════════════════════ */

interface MapLocation {
  name: string;
  x: number;
  y: number;
  province: string;
  isInstall?: boolean;
  detail?: string;
}

const MAP_LOCATIONS: MapLocation[] = [
  // ── Installation pins (amber, with pulse) ──
  { name: 'Dublin', x: 339, y: 286, province: 'leinster', isInstall: true, detail: '5.2 kWp · Mar 2025' },
  { name: 'Cork', x: 170, y: 485, province: 'munster', isInstall: true, detail: '6.1 kWp · Jan 2025' },
  { name: 'Galway', x: 108, y: 295, province: 'connacht', isInstall: true, detail: '5.4 kWp · Dec 2024' },
  { name: 'Kildare', x: 292, y: 288, province: 'leinster', isInstall: true, detail: '4.2 kWp · Nov 2024' },
  { name: 'Limerick', x: 150, y: 370, province: 'munster', isInstall: true, detail: '4.8 kWp · Feb 2025' },
  { name: 'Waterford', x: 264, y: 418, province: 'munster', isInstall: true, detail: '5.0 kWp · Jan 2025' },
  { name: 'Sligo', x: 162, y: 140, province: 'connacht', isInstall: true, detail: '3.8 kWp · Dec 2024' },
  { name: 'Navan', x: 306, y: 240, province: 'leinster', isInstall: true, detail: '6.4 kWp · Mar 2025' },
  { name: 'Killarney', x: 76, y: 452, province: 'munster', isInstall: true, detail: '4.5 kWp · Feb 2025' },
  { name: 'Westport', x: 64, y: 230, province: 'connacht', isInstall: true, detail: '5.1 kWp · Jan 2025' },
  { name: 'Wicklow', x: 346, y: 345, province: 'leinster', isInstall: true, detail: '7.2 kWp · Jan 2025' },
  { name: 'Donegal', x: 186, y: 108, province: 'ulster', isInstall: true, detail: '3.8 kWp · Dec 2024' },
  { name: 'Cavan', x: 286, y: 190, province: 'ulster', isInstall: true, detail: '4.0 kWp · Feb 2025' },
  { name: 'Clare', x: 110, y: 322, province: 'munster', isInstall: true, detail: '4.6 kWp · Mar 2025' },
  { name: 'Louth', x: 330, y: 206, province: 'leinster', isInstall: true, detail: '5.0 kWp · Jan 2025' },

  // ── Service area dots ──
  { name: 'Letterkenny', x: 210, y: 74, province: 'ulster' },
  { name: 'Ennis', x: 128, y: 348, province: 'munster' },
  { name: 'Kilkenny', x: 256, y: 372, province: 'leinster' },
  { name: 'Tralee', x: 56, y: 410, province: 'munster' },
  { name: 'Wexford', x: 320, y: 420, province: 'leinster' },
  { name: 'Dundalk', x: 326, y: 198, province: 'leinster' },
  { name: 'Tullamore', x: 240, y: 286, province: 'leinster' },
  { name: 'Mullingar', x: 252, y: 256, province: 'leinster' },
  { name: 'Clonmel', x: 196, y: 400, province: 'munster' },
  { name: 'Athlone', x: 200, y: 286, province: 'connacht' },
  { name: 'Castlebar', x: 96, y: 186, province: 'connacht' },
];

/* Province metadata */
const PROVINCE_META: Record<string, {
  name: string;
  color: string;
  colorClass: string;
  bgClass: string;
  counties: number;
  cities: string;
  installCount: number;
}> = {
  connacht: {
    name: 'Connacht',
    color: '#4ade80',
    colorClass: 'text-green-400',
    bgClass: 'bg-green-400/10',
    counties: 5,
    cities: 'Galway, Mayo, Roscommon, Sligo, Leitrim',
    installCount: 3,
  },
  leinster: {
    name: 'Leinster',
    color: '#facc15',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10',
    counties: 12,
    cities: 'Dublin, Kildare, Meath, Wicklow, Wexford',
    installCount: 7,
  },
  munster: {
    name: 'Munster',
    color: '#38bdf8',
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-400/10',
    counties: 6,
    cities: 'Cork, Kerry, Limerick, Clare, Waterford',
    installCount: 4,
  },
  ulster: {
    name: 'Ulster (ROI)',
    color: '#c084fc',
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-400/10',
    counties: 3,
    cities: 'Donegal, Cavan, Monaghan',
    installCount: 2,
  },
};

const TOTAL_INSTALLS = MAP_LOCATIONS.filter((l) => l.isInstall).length;

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER — RAF-based, GPU-safe
   ═══════════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          obs.disconnect();
          const duration = 1800;
          const start = performance.now();
          const step = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(ease * value) + suffix;
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   SVG MAP COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function IrelandMap({
  onHover,
  isVisible,
  hoveredProvince,
  onProvinceHover,
}: {
  onHover: (loc: MapLocation | null) => void;
  isVisible: boolean;
  hoveredProvince: string | null;
  onProvinceHover: (prov: string | null) => void;
}) {
  const outlineRef = useRef<SVGPathElement>(null);

  /* Self-drawing stroke animation */
  useEffect(() => {
    if (!isVisible) return;
    const path = outlineRef.current;
    if (!path) return;

    void path.getBoundingClientRect();
    const length = path.getTotalLength();

    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const timer = setTimeout(() => {
      path.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(0.16, 1, 0.3, 1)';
      path.style.strokeDashoffset = '0';
    }, 300);

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <svg
      viewBox="0 0 400 550"
      className="w-full h-auto"
      style={{ maxHeight: '520px' }}
      role="img"
      aria-label="Map of Ireland showing Solar Ireland installation coverage"
    >
      <defs>
        {/* Clip for ROI (island minus NI) */}
        <clipPath id="ireland-roi-clip">
          <path d={IRELAND_OUTLINE} />
        </clipPath>

        {/* Glow for install pins */}
        <radialGradient id="pin-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
        </radialGradient>

        {/* Pulse gradient for install pins */}
        <radialGradient id="pulse-ring" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0" />
          <stop offset="60%" stopColor="#facc15" stopOpacity="0" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.2" />
        </radialGradient>

        {/* Subtle grid pattern */}
        <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.3" opacity="0.03" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect x="0" y="0" width="400" height="550" fill="url(#map-grid)" />

      {/* ─── Layer 1: Province zone fills (clipped to ROI) ─── */}
      <g clipPath="url(#ireland-roi-clip)">
        {PROVINCE_ZONES.map((zone) => (
          <ellipse
            key={zone.id}
            cx={zone.cx}
            cy={zone.cy}
            rx={zone.rx}
            ry={zone.ry}
            fill={zone.color}
            opacity={isVisible ? 0.05 : 0}
            className="transition-opacity duration-1000"
            style={{ transitionDelay: '1.8s' }}
            onMouseEnter={() => onProvinceHover(zone.id)}
            onMouseLeave={() => onProvinceHover(null)}
          />
        ))}
        {/* Highlighted province glow */}
        {hoveredProvince && (() => {
          const zone = PROVINCE_ZONES.find((z) => z.id === hoveredProvince);
          if (!zone) return null;
          return (
            <ellipse
              cx={zone.cx}
              cy={zone.cy}
              rx={zone.rx}
              ry={zone.ry}
              fill={zone.color}
              opacity={0.08}
              className="transition-opacity duration-300"
            />
          );
        })()}
      </g>

      {/* ─── Layer 2: Northern Ireland (greyed out) ─── */}
      <path
        d={NI_PATH}
        fill="rgba(255,255,255,0.02)"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="0.5"
        opacity={isVisible ? 1 : 0}
        style={{ transition: 'opacity 1s ease-out 1.5s' }}
      />

      {/* NI label */}
      {isVisible && (
        <text
          x="320"
          y="130"
          fill="rgba(255,255,255,0.08)"
          fontSize="9"
          fontWeight="700"
          letterSpacing="2"
          textAnchor="middle"
          fontFamily="var(--font-geist-sans, system-ui, sans-serif)"
          opacity="0"
          style={{ transition: 'opacity 0.8s ease-out 2.5s' }}
        >
          N.IRELAND
        </text>
      )}

      {/* ─── Layer 3: NI/ROI border (dashed) ─── */}
      <path
        d={NI_BORDER_LINE}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity={isVisible ? 1 : 0}
        style={{ transition: 'opacity 0.8s ease-out 2.2s' }}
      />

      {/* ─── Layer 4: Ireland outline (self-drawing) ─── */}
      <path
        ref={outlineRef}
        d={IRELAND_OUTLINE}
        fill="rgba(250,204,21,0.015)"
        stroke="rgba(250,204,21,0.25)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ─── Layer 5: Province labels ─── */}
      {isVisible && (
        <g>
          {PROVINCE_LABELS.map((label) => (
            <text
              key={label.text}
              x={label.x}
              y={label.y}
              fill={label.color}
              fontSize="10"
              fontWeight="700"
              letterSpacing="2.5"
              textAnchor="middle"
              fontFamily="var(--font-geist-sans, system-ui, sans-serif)"
              opacity="0"
              style={{ transition: 'opacity 0.8s ease-out 2.4s' }}
            >
              {label.text}
            </text>
          ))}
        </g>
      )}

      {/* ─── Layer 6: Installation pins + Service dots ─── */}
      {isVisible &&
        MAP_LOCATIONS.map((loc, i) => {
          const meta = PROVINCE_META[loc.province];

          if (loc.isInstall) {
            return (
              <g
                key={loc.name}
                className="install-map-pin"
                style={{
                  opacity: 0,
                  animationDelay: `${2 + i * 0.12}s`,
                }}
                onMouseEnter={() => onHover(loc)}
                onMouseLeave={() => onHover(null)}
              >
                {/* Pulse ring */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r="18"
                  fill="url(#pulse-ring)"
                  className="install-map-pulse"
                />
                {/* Glow */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r="14"
                  fill="url(#pin-glow)"
                />
                {/* Outer ring */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r="8"
                  fill="rgba(250,204,21,0.12)"
                  stroke="#facc15"
                  strokeWidth="1"
                />
                {/* Inner dot */}
                <circle cx={loc.x} cy={loc.y} r="3.5" fill="#facc15" />
                {/* Pin spike */}
                <path
                  d={`M ${loc.x - 3} ${loc.y + 8} L ${loc.x} ${loc.y + 15} L ${loc.x + 3} ${loc.y + 8}`}
                  fill="#facc15"
                  opacity="0.5"
                />
                {/* Label (visible for key cities) */}
                {['Dublin', 'Cork', 'Galway'].includes(loc.name) && (
                  <text
                    x={loc.x}
                    y={loc.y + 26}
                    fill="rgba(250,204,21,0.7)"
                    fontSize="7"
                    fontWeight="600"
                    textAnchor="middle"
                    fontFamily="var(--font-geist-sans, system-ui, sans-serif)"
                  >
                    {loc.name}
                  </text>
                )}
              </g>
            );
          }

          return (
            <g
              key={loc.name}
              className="install-map-dot"
              style={{
                opacity: 0,
                animationDelay: `${2.6 + i * 0.08}s`,
              }}
              onMouseEnter={() => onHover(loc)}
              onMouseLeave={() => onHover(null)}
            >
              {/* Dot */}
              <circle cx={loc.x} cy={loc.y} r="2.5" fill={meta.color} opacity="0.4" />
              {/* Larger invisible hover target */}
              <circle cx={loc.x} cy={loc.y} r="10" fill="transparent" />
            </g>
          );
        })}

      {/* ─── Compass indicator ─── */}
      <g opacity="0.3">
        <line x1="370" y1="20" x2="370" y2="40" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        <polygon points="370,16 367,22 373,22" fill="rgba(250,204,21,0.7)" />
        <text
          x="370"
          y="52"
          fill="rgba(255,255,255,0.5)"
          fontSize="6"
          fontWeight="600"
          textAnchor="middle"
          fontFamily="var(--font-geist-sans, system-ui, sans-serif)"
        >
          N
        </text>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOVER TOOLTIP
   ═══════════════════════════════════════════════════════════════ */
function Tooltip({ location }: { location: MapLocation }) {
  const meta = PROVINCE_META[location.province];

  const pctX = (location.x / 400) * 100;
  const pctY = (location.y / 550) * 100;

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        left: `${pctX}%`,
        top: `${pctY}%`,
        transform: 'translate(-50%, -100%) translateY(-18px)',
      }}
    >
      <div className="install-map-tooltip relative px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl shadow-black/40">
        {/* Arrow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-[#1a1a1a] border-r border-b border-white/10" />
        {/* Content */}
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: meta.color }}
          />
          <span className="text-xs font-bold text-white">{location.name}</span>
          <span className="text-[9px] text-gray-500">{meta.name}</span>
        </div>
        {location.isInstall && location.detail && (
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-[10px] text-amber-400 font-semibold">
              {location.detail}
            </span>
          </div>
        )}
        {!location.isInstall && (
          <span className="text-[10px] text-gray-500">Service area</span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROVINCE STAT CARD
   ═══════════════════════════════════════════════════════════════ */
function ProvinceCard({ provinceId }: { provinceId: string }) {
  const meta = PROVINCE_META[provinceId];
  const installs = MAP_LOCATIONS.filter(
    (l) => l.province === provinceId && l.isInstall
  );
  const recentInstall = installs[0];

  return (
    <div className="install-map-province-card rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 hover:bg-white/[0.03] transition-colors duration-300">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={`w-8 h-8 rounded-lg ${meta.bgClass} flex items-center justify-center`}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: meta.color, opacity: 0.8 }}
          />
        </div>
        <div>
          <h4 className={`text-sm font-bold ${meta.colorClass}`}>{meta.name}</h4>
          <p className="text-[10px] text-gray-500">
            <AnimatedNumber value={meta.counties} /> counties
          </p>
        </div>
      </div>

      {/* Recent install highlight */}
      {recentInstall && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-400/[0.06] border border-amber-400/10 mb-3">
          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="text-[10px] text-amber-400/80 leading-snug">
            <span className="font-semibold text-amber-400">{recentInstall.name}</span>
            {' — '}
            {recentInstall.detail}
          </span>
        </div>
      )}

      {/* Install count */}
      {installs.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <Sun className="w-3 h-3 text-amber-400/50" />
          <span className="text-[10px] text-gray-500">
            <span className="font-semibold text-gray-400">{installs.length}</span> installs shown
          </span>
        </div>
      )}

      {/* County list */}
      <p className="text-[10px] text-gray-600 leading-relaxed">
        {meta.cities}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function InstallationMap() {
  const [hoveredLocation, setHoveredLocation] = useState<MapLocation | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Trigger animations when section scrolls into view */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleHover = useCallback(
    (loc: MapLocation | null) => setHoveredLocation(loc),
    []
  );

  const handleProvinceHover = useCallback(
    (prov: string | null) => setHoveredProvince(prov),
    []
  );

  return (
    <section
      id="coverage"
      ref={containerRef}
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] relative overflow-hidden"
    >
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 amber-line" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[400px] bg-amber-500/[0.012] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-sky-500/[0.008] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ─── Section Header ─── */}
        <div
          className={`mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/[0.06] border border-amber-400/[0.1] mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-[0.15em]">
              Coverage
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl leading-[1.1] mb-4">
            Solar across{' '}
            <span className="text-gradient">Ireland.</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-lg leading-relaxed">
            We install residential solar PV systems across 26 counties in every province
            of Ireland. From Donegal to Cork — we&apos;ve got your roof covered.
          </p>
        </div>

        {/* ─── Main Content: Map + Stats ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Map — takes 3 columns on desktop */}
          <div
            className={`lg:col-span-3 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="relative rounded-2xl bg-white/[0.015] border border-white/[0.05] p-4 sm:p-6">
              {/* SVG Map */}
              <IrelandMap
                onHover={handleHover}
                isVisible={isVisible}
                hoveredProvince={hoveredProvince}
                onProvinceHover={handleProvinceHover}
              />

              {/* Tooltip overlay */}
              {hoveredLocation && <Tooltip location={hoveredLocation} />}

              {/* Legend — below map */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-white/[0.04]">
                {/* Install pin */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/30" />
                  <span className="text-[10px] text-gray-500">Recent installation</span>
                </div>
                {/* Service dot */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                  <span className="text-[10px] text-gray-500">Service area</span>
                </div>
                {/* NI */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-white/[0.03] border border-white/[0.06]" />
                  <span className="text-[10px] text-gray-500">Northern Ireland</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar — takes 2 columns on desktop */}
          <div
            className={`lg:col-span-2 space-y-4 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Hero stat */}
            <div className="rounded-2xl bg-gradient-to-b from-amber-400/[0.06] to-transparent border border-amber-400/10 p-5">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl sm:text-5xl font-bold text-white">
                  <AnimatedNumber value={SOLAR_DATA.coverage.totalCounties} />
                </span>
                <span className="text-lg text-gray-400 font-medium">counties</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Across 4 provinces — nationwide coverage
              </p>
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-3.5 h-3.5 text-amber-400/60" />
                <span className="text-[10px] text-gray-500">
                  <span className="font-semibold text-amber-400">
                    <AnimatedNumber value={TOTAL_INSTALLS} />
                  </span>
                  {' '}installations on the map
                </span>
              </div>
              {/* Province color chips */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(PROVINCE_META).map(([id, meta]) => (
                  <div key={id} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: meta.color, opacity: 0.7 }}
                    />
                    <span className="text-[10px] text-gray-500">{meta.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Province cards */}
            {Object.keys(PROVINCE_META).map((provId) => (
              <ProvinceCard key={provId} provinceId={provId} />
            ))}

            {/* Certifications */}
            <div className="rounded-xl bg-white/[0.015] border border-white/[0.04] p-4">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-3">
                Fully certified &amp; registered
              </p>
              <div className="flex flex-wrap gap-2">
                {SOLAR_DATA.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.04] text-[10px] text-gray-400"
                  >
                    <Check className="w-2.5 h-2.5 text-green-400/60" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── CTA Section ─── */}
        <div
          className={`mt-12 sm:mt-16 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400/10 to-amber-500/[0.04] border border-amber-400/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                Not sure if we cover your area?
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Send us your Eircode and we&apos;ll confirm coverage and give you a
                free satellite roof assessment — no strings attached.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={buildWhatsAppUrl({ source: 'coverage-map' })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                Check My Area
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Calculator</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
