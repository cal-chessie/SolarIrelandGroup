'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Sun,
  Zap,
  Euro,
  ArrowRight,
  MessageCircle,
  Filter,
  X,
  Map,
  Globe,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Phone,
  Building2,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/* ═══════════════════════════════════════════════════════
   COUNTY DATA — All 32 Counties of Ireland
   ═══════════════════════════════════════════════════════ */

type Province = 'Leinster' | 'Munster' | 'Connacht' | 'Ulster';

interface CountyData {
  name: string;
  provinces: Province[];
  domain: string;
  status: 'active' | 'coming-soon';
  costMin: number;
  costMax: number;
  generationKwh: number;
  population: string;
}

const counties: CountyData[] = [
  // ─── Leinster ───
  { name: 'Dublin', provinces: ['Leinster'], domain: 'solardublin.com', status: 'active', costMin: 4800, costMax: 7200, generationKwh: 3560, population: '1.45M' },
  { name: 'Wicklow', provinces: ['Leinster'], domain: 'solarwicklow.com', status: 'active', costMin: 4600, costMax: 7000, generationKwh: 3520, population: '155K' },
  { name: 'Wexford', provinces: ['Leinster'], domain: 'solarwexford.com', status: 'active', costMin: 4500, costMax: 6800, generationKwh: 3600, population: '156K' },
  { name: 'Carlow', provinces: ['Leinster'], domain: 'solarcarlow.com', status: 'coming-soon', costMin: 4400, costMax: 6700, generationKwh: 3540, population: '61K' },
  { name: 'Kildare', provinces: ['Leinster'], domain: 'solarkildare.com', status: 'active', costMin: 4600, costMax: 7100, generationKwh: 3550, population: '251K' },
  { name: 'Meath', provinces: ['Leinster'], domain: 'solarmeath.com', status: 'active', costMin: 4500, costMax: 6900, generationKwh: 3560, population: '234K' },
  { name: 'Louth', provinces: ['Leinster'], domain: 'solarlouth.com', status: 'coming-soon', costMin: 4500, costMax: 6800, generationKwh: 3530, population: '139K' },
  { name: 'Longford', provinces: ['Leinster'], domain: 'solarlongford.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3400, population: '46K' },
  { name: 'Westmeath', provinces: ['Leinster'], domain: 'solarwestmeath.com', status: 'coming-soon', costMin: 4400, costMax: 6700, generationKwh: 3430, population: '96K' },
  { name: 'Offaly', provinces: ['Leinster'], domain: 'solaroffaly.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3420, population: '83K' },
  { name: 'Laois', provinces: ['Leinster'], domain: 'solarlaois.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3430, population: '85K' },
  { name: 'Kilkenny', provinces: ['Leinster'], domain: 'solarkilkenny.com', status: 'active', costMin: 4400, costMax: 6700, generationKwh: 3500, population: '104K' },

  // ─── Munster ───
  { name: 'Cork', provinces: ['Munster'], domain: 'solarcork.com', status: 'active', costMin: 4600, costMax: 7000, generationKwh: 3580, population: '555K' },
  { name: 'Kerry', provinces: ['Munster'], domain: 'solarkerry.com', status: 'active', costMin: 4600, costMax: 7100, generationKwh: 3540, population: '156K' },
  { name: 'Limerick', provinces: ['Munster'], domain: 'solarlimerick.com', status: 'active', costMin: 4500, costMax: 6900, generationKwh: 3500, population: '205K' },
  { name: 'Clare', provinces: ['Munster'], domain: 'solarclare.com', status: 'coming-soon', costMin: 4400, costMax: 6700, generationKwh: 3470, population: '131K' },
  { name: 'Tipperary', provinces: ['Munster'], domain: 'solartipperary.com', status: 'active', costMin: 4400, costMax: 6700, generationKwh: 3480, population: '165K' },
  { name: 'Waterford', provinces: ['Munster'], domain: 'solarwaterford.com', status: 'active', costMin: 4500, costMax: 6800, generationKwh: 3550, population: '127K' },

  // ─── Connacht ───
  { name: 'Galway', provinces: ['Connacht'], domain: 'solargalway.com', status: 'active', costMin: 4500, costMax: 7000, generationKwh: 3450, population: '279K' },
  { name: 'Mayo', provinces: ['Connacht'], domain: 'solarmayo.com', status: 'active', costMin: 4400, costMax: 6800, generationKwh: 3400, population: '137K' },
  { name: 'Roscommon', provinces: ['Connacht'], domain: 'solarroscommon.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3380, population: '72K' },
  { name: 'Sligo', provinces: ['Connacht'], domain: 'solarsligo.com', status: 'coming-soon', costMin: 4400, costMax: 6700, generationKwh: 3390, population: '70K' },
  { name: 'Leitrim', provinces: ['Connacht'], domain: 'solarleitrim.com', status: 'coming-soon', costMin: 4300, costMax: 6500, generationKwh: 3350, population: '35K' },

  // ─── Ulster (Republic + NI) ───
  { name: 'Donegal', provinces: ['Ulster'], domain: 'solardonegal.com', status: 'active', costMin: 4400, costMax: 6800, generationKwh: 3410, population: '167K' },
  { name: 'Cavan', provinces: ['Leinster', 'Ulster'], domain: 'solarcavan.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3410, population: '81K' },
  { name: 'Monaghan', provinces: ['Leinster', 'Ulster'], domain: 'solarmonaghan.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3400, population: '68K' },
  { name: 'Antrim', provinces: ['Ulster'], domain: 'solarantrim.com', status: 'coming-soon', costMin: 4600, costMax: 7200, generationKwh: 3450, population: '649K' },
  { name: 'Armagh', provinces: ['Ulster'], domain: 'solararmagh.com', status: 'coming-soon', costMin: 4500, costMax: 7000, generationKwh: 3420, population: '206K' },
  { name: 'Down', provinces: ['Ulster'], domain: 'solardown.com', status: 'coming-soon', costMin: 4600, costMax: 7100, generationKwh: 3440, population: '552K' },
  { name: 'Fermanagh', provinces: ['Ulster'], domain: 'solarfermanagh.com', status: 'coming-soon', costMin: 4400, costMax: 6700, generationKwh: 3380, population: '62K' },
  { name: 'Londonderry', provinces: ['Ulster'], domain: 'solarderry.com', status: 'coming-soon', costMin: 4500, costMax: 6900, generationKwh: 3400, population: '252K' },
  { name: 'Tyrone', provinces: ['Ulster'], domain: 'solartyrone.com', status: 'coming-soon', costMin: 4400, costMax: 6800, generationKwh: 3390, population: '193K' },
];

/* ═══════════════════════════════════════════════════════
   PROVINCE GROUPINGS — Cavan/Monaghan shown in both
   ═══════════════════════════════════════════════════════ */

const provinceGroups: { province: Province; counties: string[] }[] = [
  {
    province: 'Leinster',
    counties: ['Dublin', 'Wicklow', 'Wexford', 'Carlow', 'Kildare', 'Meath', 'Louth', 'Monaghan', 'Cavan', 'Longford', 'Westmeath', 'Offaly', 'Laois', 'Kilkenny'],
  },
  {
    province: 'Munster',
    counties: ['Cork', 'Kerry', 'Limerick', 'Clare', 'Tipperary', 'Waterford'],
  },
  {
    province: 'Connacht',
    counties: ['Galway', 'Mayo', 'Roscommon', 'Sligo', 'Leitrim'],
  },
  {
    province: 'Ulster',
    counties: ['Antrim', 'Armagh', 'Down', 'Fermanagh', 'Londonderry', 'Tyrone', 'Cavan', 'Monaghan', 'Donegal'],
  },
];

const provinceColors: Record<Province, { bg: string; text: string; border: string; dot: string }> = {
  Leinster: { bg: 'bg-sky-400/10', text: 'text-sky-400', border: 'border-sky-400/20', dot: 'bg-sky-400' },
  Munster: { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/20', dot: 'bg-emerald-400' },
  Connacht: { bg: 'bg-violet-400/10', text: 'text-violet-400', border: 'border-violet-400/20', dot: 'bg-violet-400' },
  Ulster: { bg: 'bg-rose-400/10', text: 'text-rose-400', border: 'border-rose-400/20', dot: 'bg-rose-400' },
};

/* ═══════════════════════════════════════════════════════
   COUNTY CARD COMPONENT
   ═══════════════════════════════════════════════════════ */
function CountyCard({ county, index }: { county: CountyData; index: number }) {
  const primaryProvince = county.provinces[0];
  const colors = provinceColors[primaryProvince];
  const isActive = county.status === 'active';

  const whatsappUrl = buildWhatsAppUrl({
    customMessage: `Hi Solar Ireland! I'm interested in solar panels in ${county.name}. Can I get a free survey?`,
  });

  return (
    <div
      className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Province dot */}
      <div className={`absolute top-5 right-5 w-2.5 h-2.5 rounded-full ${colors.dot} opacity-60`} />

      {/* County name + status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
            {county.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            {/* Province badges */}
            {county.provinces.map((prov) => {
              const pColors = provinceColors[prov];
              return (
                <span
                  key={prov}
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${pColors.bg} ${pColors.text}`}
                >
                  {prov}
                </span>
              );
            })}
          </div>
        </div>
        {/* Status badge */}
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
            isActive
              ? 'bg-green-400/10 text-green-400 border border-green-400/15'
              : 'bg-amber-400/10 text-amber-400 border border-amber-400/15'
          }`}
        >
          {isActive ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {isActive ? 'Active' : 'Coming Soon'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2.5 rounded-lg bg-white/[0.03]">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Euro className="w-3 h-3 text-amber-400/60" />
          </div>
          <p className="text-xs font-semibold text-gray-300">
            €{county.costMin.toLocaleString()}–€{county.costMax.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-600 mt-0.5">System cost</p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-white/[0.03]">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-amber-400/60" />
          </div>
          <p className="text-xs font-semibold text-gray-300">{county.generationKwh.toLocaleString()}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">kWh/yr (4kWp)</p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-white/[0.03]">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sun className="w-3 h-3 text-amber-400/60" />
          </div>
          <p className="text-xs font-semibold text-gray-300">€{Math.round(county.generationKwh * 0.31).toLocaleString()}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Est. savings</p>
        </div>
      </div>

      {/* Domain link */}
      <div className="flex items-center gap-1.5 mb-4">
        <Globe className="w-3 h-3 text-gray-600" />
        <span className="text-xs text-gray-500">{county.domain}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/15 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Get Quote
        </a>
        <a
          href={`tel:+353873958424`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-400 text-xs font-medium hover:bg-white/[0.06] hover:text-white transition-colors active:scale-[0.98]"
        >
          <Phone className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROVINCE SECTION HEADER
   ═══════════════════════════════════════════════════════ */
function ProvinceHeader({
  province,
  count,
}: {
  province: Province;
  count: number;
}) {
  const colors = provinceColors[province];
  const provinceCounties = provinceGroups.find((g) => g.province === province)!.counties;

  return (
    <div className="flex items-center gap-4 mt-12 mb-6 first:mt-0">
      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
        <MapPin className={`w-5 h-5 ${colors.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{province}</h2>
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${colors.bg} ${colors.text}`}>
            {count} counties
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5 truncate">
          {provinceCounties.join(' · ')}
        </p>
      </div>
      <div className="hidden sm:block h-px flex-1 bg-white/[0.04]" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BOTTOM STATS
   ═══════════════════════════════════════════════════════ */
function BottomStats() {
  const stats = [
    {
      icon: MapPin,
      label: 'Covering 32 Counties',
      value: '32',
      desc: 'Republic + Northern Ireland',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      icon: Euro,
      label: 'SEAI Grant Available Nationwide',
      value: '€1,800',
      desc: 'For qualifying homes',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      icon: Building2,
      label: 'Free Surveys in All Areas',
      value: 'Free',
      desc: 'No-obligation roof assessment',
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
    },
  ];

  return (
    <div className="mt-16 sm:mt-20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   COUNTIES DIRECTORY PAGE
   ═══════════════════════════════════════════════════════ */
export default function CountiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProvince, setActiveProvince] = useState<Province | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'active' | 'coming-soon'>('all');
  const [showFilters, setShowFilters] = useState(false);

  /* ─── Filter logic ─── */
  const filteredCounties = useMemo(() => {
    return counties.filter((county) => {
      const matchesSearch =
        !searchQuery ||
        county.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProvince =
        activeProvince === 'all' || county.provinces.includes(activeProvince);
      const matchesStatus =
        activeStatus === 'all' || county.status === activeStatus;
      return matchesSearch && matchesProvince && matchesStatus;
    });
  }, [searchQuery, activeProvince, activeStatus]);

  const activeCount = counties.filter((c) => c.status === 'active').length;
  const comingSoonCount = counties.filter((c) => c.status === 'coming-soon').length;

  const clearFilters = () => {
    setSearchQuery('');
    setActiveProvince('all');
    setActiveStatus('all');
  };

  const hasActiveFilters = searchQuery || activeProvince !== 'all' || activeStatus !== 'all';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        {/* ─── Hero Section ─── */}
        <header className="relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-400/[0.03] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-20 right-0 w-[400px] h-[300px] bg-emerald-400/[0.02] rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-10 sm:pb-14 relative">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-400">
                County Directory
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Solar Panels in{' '}
              <span className="text-amber-400">Every County</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-3xl leading-relaxed mb-6">
              Solar Ireland is the parent brand for county-specific solar panel installation websites
              across all 32 counties of Ireland. Each county site provides local expertise, tailored
              pricing, and dedicated support for homeowners in that area. Whether you&apos;re in Dublin
              or Donegal, Cork to Cavan — we&apos;ve got you covered with SEAI-registered installations,
              honest advice, and genuine aftercare.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400/60" />
                <span className="text-gray-400"><span className="text-white font-semibold">32</span> Counties</span>
              </div>
              <div className="w-px h-4 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400/60" />
                <span className="text-gray-400"><span className="text-white font-semibold">{activeCount}</span> Active</span>
              </div>
              <div className="w-px h-4 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400/60" />
                <span className="text-gray-400"><span className="text-white font-semibold">{comingSoonCount}</span> Coming Soon</span>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Breadcrumb ─── */}
        <div className="border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-600">
              <a href="/" className="hover:text-gray-400 transition-colors">Home</a>
              <ChevronRight className="w-3 h-3 rotate-90" />
              <span className="text-gray-400">County Directory</span>
            </nav>
          </div>
        </div>

        {/* ─── Search & Filter Bar ─── */}
        <div className="sticky top-16 z-20 bg-[#0a0a0a]/95 border-b border-white/[0.04] backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4">
            {/* Search row */}
            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search counties..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/10 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.1] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.98] ${
                  showFilters
                    ? 'bg-amber-400/10 border-amber-400/20 text-amber-400'
                    : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
                    {(activeProvince !== 'all' ? 1 : 0) + (activeStatus !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Result count */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap">
                <span className="text-gray-400 font-semibold">{filteredCounties.length}</span>
                <span>result{filteredCounties.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
                {/* Province filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-600 uppercase tracking-wider mr-1">Province:</span>
                  {(['all', 'Leinster', 'Munster', 'Connacht', 'Ulster'] as const).map((prov) => {
                    const isActive = activeProvince === prov;
                    const colors = prov !== 'all' ? provinceColors[prov] : null;
                    return (
                      <button
                        key={prov}
                        onClick={() => setActiveProvince(prov)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
                          isActive
                            ? prov === 'all'
                              ? 'bg-white/10 border border-white/20 text-white'
                              : `${colors!.bg} ${colors!.text} border ${colors!.border}`
                            : 'bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        {prov === 'all' ? 'All Provinces' : prov}
                      </button>
                    );
                  })}
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
                  <span className="text-xs text-gray-600 uppercase tracking-wider mr-1">Status:</span>
                  {([
                    { key: 'all' as const, label: 'All' },
                    { key: 'active' as const, label: 'Active' },
                    { key: 'coming-soon' as const, label: 'Coming Soon' },
                  ]).map((opt) => {
                    const isActive = activeStatus === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setActiveStatus(opt.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
                          isActive
                            ? opt.key === 'active'
                              ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                              : opt.key === 'coming-soon'
                                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                : 'bg-white/10 border border-white/20 text-white'
                            : 'bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Clear */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Province Grouped Content ─── */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          {filteredCounties.length === 0 ? (
            /* ─── Empty state ─── */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No counties found</h3>
              <p className="text-sm text-gray-500 max-w-md mb-4">
                Try adjusting your search or filter criteria to find what you&apos;re looking for.
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium hover:bg-amber-400/20 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Group by province */}
              {provinceGroups.map((group) => {
                const groupCounties = group.counties
                  .map((name) => counties.find((c) => c.name === name)!)
                  .filter((c) => filteredCounties.some((fc) => fc.name === c.name));

                if (groupCounties.length === 0) return null;

                return (
                  <div key={group.province}>
                    <ProvinceHeader
                      province={group.province}
                      count={groupCounties.length}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {groupCounties.map((county, idx) => (
                        <CountyCard key={county.name} county={county} index={idx} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* ─── Bottom Stats ─── */}
              <BottomStats />

              {/* ─── Bottom CTA ─── */}
              <div className="mt-16 sm:mt-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400/10 via-amber-500/[0.05] to-transparent border border-amber-400/10 p-8 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-amber-400/[0.04] rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/10 flex items-center justify-center mx-auto mb-5">
                    <Sparkles className="w-7 h-7 text-amber-400" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Can&apos;t find your county?
                  </h2>
                  <p className="text-gray-400 text-base max-w-lg mx-auto mb-6 leading-relaxed">
                    We cover all 32 counties in Ireland. If you don&apos;t see your area listed yet,
                    we&apos;re likely launching there soon. Get in touch for a free, no-obligation
                    consultation.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={buildWhatsAppUrl({ source: 'counties-page' })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:bg-green-400 transition-all active:scale-[0.98]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp Us
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href="mailto:cal@solarireland.com"
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-white/15 bg-white/[0.03] text-gray-300 text-sm hover:bg-white/[0.06] hover:text-white transition-all active:scale-[0.98]"
                    >
                      <MapPin className="w-4 h-4" />
                      Email Us
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
