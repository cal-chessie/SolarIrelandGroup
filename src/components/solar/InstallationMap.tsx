'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MapPin,
  Zap,
  ArrowRight,
  MessageCircle,
  MapPinned,
  Check,
  ChevronRight,
  Sun,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ═══════════════════════════════════════════════════════════════
   IRELAND SVG DATA — simplified ROI outline + city positions
   ViewBox: 0 0 280 380
   Mapping: x = (10.8 - lon) / 5.6 * 280
            y = (55.9 - lat) / 5.0 * 380
   ═══════════════════════════════════════════════════════════════ */

const IRELAND_PATH =
  'M 225,48 C 230,80 230,120 228,155 C 226,180 232,200 238,235 C 240,248 235,262 225,275 C 215,285 200,290 190,292 C 170,300 148,315 130,330 C 115,340 95,345 75,342 C 55,338 40,328 35,315 C 30,300 25,285 30,270 C 36,255 42,242 42,230 C 42,220 38,210 40,200 C 42,192 46,186 50,182 C 48,175 42,165 40,155 C 38,142 36,130 38,118 C 40,105 48,88 58,72 C 70,55 88,42 110,32 C 132,22 158,18 182,20 C 202,24 218,36 225,48 Z';

/* Province zone indicators — radial gradient circles clipped to Ireland */
const PROVINCE_ZONES = [
  { id: 'connacht', cx: 62, cy: 168, r: 80, color: '#4ade80', label: 'Connacht' },
  { id: 'leinster', cx: 198, cy: 165, r: 78, color: '#facc15', label: 'Leinster' },
  { id: 'munster', cx: 120, cy: 295, r: 68, color: '#38bdf8', label: 'Munster' },
];

/* City locations on the map */
const MAP_LOCATIONS = [
  // Leinster
  { name: 'Dublin', x: 227, y: 194, province: 'leinster' },
  { name: 'Kildare', x: 191, y: 195, province: 'leinster', isInstall: true, detail: '4.2 kWp · Nov 2024' },
  { name: 'Wexford', x: 218, y: 271, province: 'leinster' },
  { name: 'Kilkenny', x: 178, y: 247, province: 'leinster' },
  { name: 'Dundalk', x: 220, y: 144, province: 'leinster' },

  // Munster
  { name: 'Cork', x: 116, y: 304, province: 'munster' },
  { name: 'Limerick', x: 109, y: 246, province: 'munster' },
  { name: 'Waterford', x: 185, y: 277, province: 'munster' },
  { name: 'Tralee', x: 55, y: 276, province: 'munster' },

  // Connacht
  { name: 'Galway', x: 87, y: 200, province: 'connacht', isInstall: true, detail: '5.4 kWp · Jan 2025' },
  { name: 'Sligo', x: 110, y: 124, province: 'connacht' },
  { name: 'Westport', x: 76, y: 160, province: 'connacht' },
];

/* Province metadata */
const PROVINCE_META: Record<
  string,
  { name: string; color: string; colorClass: string; bgClass: string; counties: number; cities: string[] }
> = {
  connacht: {
    name: 'Connacht',
    color: '#4ade80',
    colorClass: 'text-green-400',
    bgClass: 'bg-green-400/10',
    counties: 5,
    cities: 'Galway, Mayo, Roscommon, Sligo, Leitrim',
  },
  leinster: {
    name: 'Leinster',
    color: '#facc15',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10',
    counties: 12,
    cities: 'Dublin, Kildare, Wicklow, Wexford, Meath',
  },
  munster: {
    name: 'Munster',
    color: '#38bdf8',
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-400/10',
    counties: 6,
    cities: 'Cork, Kerry, Limerick, Clare, Waterford',
  },
};

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

  return <span ref={ref}>{`0${suffix}`}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   SVG MAP — self-drawing outline + interactive dots
   ═══════════════════════════════════════════════════════════════ */
function IrelandMap({
  onHover,
  isVisible,
}: {
  onHover: (loc: (typeof MAP_LOCATIONS)[0] | null) => void;
  isVisible: boolean;
}) {
  const outlineRef = useRef<SVGPathElement>(null);

  /* Self-drawing stroke animation */
  useEffect(() => {
    if (!isVisible) return;
    const path = outlineRef.current;
    if (!path) return;

    // Force a reflow so getTotalLength returns correct value
    void path.getBoundingClientRect();
    const length = path.getTotalLength();

    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    // Start animation after a brief delay
    const timer = setTimeout(() => {
      path.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(0.16, 1, 0.3, 1)';
      path.style.strokeDashoffset = '0';
    }, 200);

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <svg
      viewBox="0 0 280 380"
      className="w-full h-auto"
      style={{ maxHeight: '480px' }}
      role="img"
      aria-label="Map of Ireland showing Solar Ireland installation coverage across Connacht, Leinster, and Munster"
    >
      <defs>
        {/* Clip path for province zones */}
        <clipPath id="ireland-clip">
          <path d={IRELAND_PATH} />
        </clipPath>

        {/* Glow effect for install pins */}
        <radialGradient id="pin-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
        </radialGradient>

        {/* Pulse ring for install pins */}
        <radialGradient id="pulse-ring" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0" />
          <stop offset="70%" stopColor="#facc15" stopOpacity="0" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Province zone fills — clipped to Ireland outline */}
      <g clipPath="url(#ireland-clip)">
        {PROVINCE_ZONES.map((zone) => (
          <circle
            key={zone.id}
            cx={zone.cx}
            cy={zone.cy}
            r={zone.r}
            fill={zone.color}
            opacity={isVisible ? 0.04 : 0}
            style={{
              transition: 'opacity 1.2s ease-out 1.5s',
            }}
          />
        ))}
      </g>

      {/* Subtle grid lines */}
      <g opacity="0.03" stroke="#fff" strokeWidth="0.5">
        {[80, 160, 240, 320].map((y) => (
          <line key={`h-${y}`} x1="0" y1={y} x2="280" y2={y} />
        ))}
        {[56, 112, 168, 224].map((x) => (
          <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="380" />
        ))}
      </g>

      {/* Ireland outline — self-drawing stroke */}
      <path
        ref={outlineRef}
        d={IRELAND_PATH}
        fill="rgba(250, 204, 21, 0.02)"
        stroke="rgba(250, 204, 21, 0.2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Province labels — positioned at approximate centers */}
      {isVisible && (
        <g style={{ opacity: 0, transition: 'opacity 0.8s ease-out 2s' }}>
          {/* Connacht label */}
          <text
            x="60"
            y="130"
            fill="rgba(74, 222, 128, 0.25)"
            fontSize="11"
            fontWeight="700"
            letterSpacing="3"
            textAnchor="middle"
            fontFamily="var(--font-geist-sans, system-ui, sans-serif)"
          >
            CONNACHT
          </text>
          {/* Leinster label */}
          <text
            x="200"
            y="125"
            fill="rgba(250, 204, 21, 0.25)"
            fontSize="11"
            fontWeight="700"
            letterSpacing="3"
            textAnchor="middle"
            fontFamily="var(--font-geist-sans, system-ui, sans-serif)"
          >
            LEINSTER
          </text>
          {/* Munster label */}
          <text
            x="125"
            y="260"
            fill="rgba(56, 189, 248, 0.25)"
            fontSize="11"
            fontWeight="700"
            letterSpacing="3"
            textAnchor="middle"
            fontFamily="var(--font-geist-sans, system-ui, sans-serif)"
          >
            MUNSTER
          </text>
        </g>
      )}

      {/* City dots + Install pins */}
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
                  animationDelay: `${2 + i * 0.15}s`,
                }}
                onMouseEnter={() => onHover(loc)}
                onMouseLeave={() => onHover(null)}
              >
                {/* Pulse ring */}
                <circle cx={loc.x} cy={loc.y} r="18" fill="url(#pulse-ring)" className="install-map-pulse" />

                {/* Glow */}
                <circle cx={loc.x} cy={loc.y} r="14" fill="url(#pin-glow)" />

                {/* Outer ring */}
                <circle cx={loc.x} cy={loc.y} r="8" fill="rgba(250, 204, 21, 0.15)" stroke="#facc15" strokeWidth="1" />

                {/* Inner dot */}
                <circle cx={loc.x} cy={loc.y} r="4" fill="#facc15" />

                {/* Pin spike */}
                <path d={`M ${loc.x - 3} ${loc.y + 8} L ${loc.x} ${loc.y + 16} L ${loc.x + 3} ${loc.y + 8}`} fill="#facc15" opacity="0.6" />

                {/* Label */}
                <text
                  x={loc.x}
                  y={loc.y + 28}
                  fill="rgba(250, 204, 21, 0.8)"
                  fontSize="7.5"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="var(--font-geist-sans, system-ui, sans-serif)"
                >
                  {loc.name}
                </text>
              </g>
            );
          }

          return (
            <g
              key={loc.name}
              className="install-map-dot"
              style={{
                opacity: 0,
                animationDelay: `${2.5 + i * 0.1}s`,
              }}
              onMouseEnter={() => onHover(loc)}
              onMouseLeave={() => onHover(null)}
            >
              {/* Dot */}
              <circle cx={loc.x} cy={loc.y} r="3" fill={meta.color} opacity="0.5" />
              {/* Hover target (larger invisible area) */}
              <circle cx={loc.x} cy={loc.y} r="10" fill="transparent" />
            </g>
          );
        })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOVER TOOLTIP
   ═══════════════════════════════════════════════════════════════ */
function Tooltip({
  location,
}: {
  location: (typeof MAP_LOCATIONS)[0];
}) {
  const meta = PROVINCE_META[location.province];
  const svgContainer = useRef<HTMLDivElement>(null);

  // Convert SVG coords to percentage positions for absolute tooltip
  const pctX = (location.x / 280) * 100;
  const pctY = (location.y / 380) * 100;

  return (
    <div
      ref={svgContainer}
      className="absolute z-20 pointer-events-none"
      style={{
        left: `${pctX}%`,
        top: `${pctY}%`,
        transform: 'translate(-50%, -100%) translateY(-16px)',
      }}
    >
      <div className="install-map-tooltip relative px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl shadow-black/40">
        {/* Arrow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-[#1a1a1a] border-r border-b border-white/10"
        />
        {/* Content */}
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: meta.color }}
          />
          <span className="text-xs font-bold text-white">{location.name}</span>
          <span className="text-[9px] text-gray-500">{meta.name}</span>
        </div>
        {location.isInstall && location.detail && (
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
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
  const hasInstall = MAP_LOCATIONS.some(
    (l) => l.province === provinceId && l.isInstall
  );
  const installLoc = MAP_LOCATIONS.find(
    (l) => l.province === provinceId && l.isInstall
  );

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

      {/* Install highlight */}
      {hasInstall && installLoc && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-400/[0.06] border border-amber-400/10 mb-3">
          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="text-[10px] text-amber-400/80">
            <span className="font-semibold text-amber-400">{installLoc.name}</span> — {installLoc.detail}
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
  const [hoveredLocation, setHoveredLocation] = useState<
    (typeof MAP_LOCATIONS)[0] | null
  >(null);
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
    (loc: (typeof MAP_LOCATIONS)[0] | null) => setHoveredLocation(loc),
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
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[400px] bg-amber-500/[0.012] rounded-full blur-[120px] pointer-events-none" />

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
            We install residential solar PV systems across 23 counties in Connacht,
            Leinster, and Munster. From Donegal to Cork — we&apos;ve got you covered.
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
            <div className="relative rounded-2xl bg-white/[0.015] border border-white/[0.05] p-5 sm:p-6">
              {/* Compass indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] text-gray-600 font-mono">
                <Sun className="w-3 h-3 text-amber-400/40" />
                <span>S</span>
              </div>

              {/* SVG Map */}
              <IrelandMap onHover={handleHover} isVisible={isVisible} />

              {/* Tooltip overlay */}
              {hoveredLocation && <Tooltip location={hoveredLocation} />}

              {/* Legend — below map */}
              <div className="flex items-center gap-5 mt-5 pt-4 border-t border-white/[0.04]">
                {/* Install pin legend */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/30" />
                  <span className="text-[10px] text-gray-500">
                    Solar installation
                  </span>
                </div>
                {/* City dot legend */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                  <span className="text-[10px] text-gray-500">
                    Service area city
                  </span>
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
                  <AnimatedNumber value={23} />
                </span>
                <span className="text-lg text-gray-400 font-medium">counties</span>
              </div>
              <p className="text-xs text-gray-500">
                Across 3 provinces — {SOLAR_DATA.serviceAreas.join(', ')}
              </p>
              <div className="flex items-center gap-3 mt-4">
                {SOLAR_DATA.serviceAreas.map((prov) => {
                  const key = prov.toLowerCase() as string;
                  const meta = PROVINCE_META[key];
                  if (!meta) return null;
                  return (
                    <div key={prov} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-sm"
                        style={{ backgroundColor: meta.color, opacity: 0.7 }}
                      />
                      <span className="text-[10px] text-gray-500">{prov}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Province cards */}
            {['connacht', 'leinster', 'munster'].map((provId) => (
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
