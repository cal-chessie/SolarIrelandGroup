'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { SOLAR_DATA } from '@/lib/solar-data';
import {
  Search,
  MapPin,
  Sun,
  Zap,
  Euro,
  ArrowRight,
  MessageCircle,

  X,
  Map,
  Globe,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Phone,
  Building2,
  FileCheck,
  HeartHandshake,
  Home,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';


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
  tagline: string;
}

const counties: CountyData[] = [
  { name: 'Dublin', provinces: ['Leinster'], domain: 'solardublin.com', status: 'active', costMin: 4800, costMax: 7200, generationKwh: 3560, population: '1.45M', tagline: 'From Sandymount to Swords - terraces to estates, we know every roof' },
  { name: 'Wicklow', provinces: ['Leinster'], domain: 'solarwicklow.com', status: 'active', costMin: 4600, costMax: 7000, generationKwh: 3520, population: '155K', tagline: 'The Garden County - stunning scenery and serious solar potential' },
  { name: 'Wexford', provinces: ['Leinster'], domain: 'solarwexford.com', status: 'active', costMin: 4500, costMax: 6800, generationKwh: 3600, population: '156K', tagline: 'Sunny southeast at its finest - Hook Head leads the way' },
  { name: 'Carlow', provinces: ['Leinster'], domain: 'solarcarlow.com', status: 'coming-soon', costMin: 4400, costMax: 6700, generationKwh: 3540, population: '61K', tagline: 'The Dolmen County - solid ground for solar investment' },
  { name: 'Kildare', provinces: ['Leinster'], domain: 'solarkildare.com', status: 'active', costMin: 4600, costMax: 7100, generationKwh: 3550, population: '251K', tagline: 'Punchestown to Naas - commuter belt going green' },
  { name: 'Meath', provinces: ['Leinster'], domain: 'solarmeath.com', status: 'active', costMin: 4500, costMax: 6900, generationKwh: 3560, population: '234K', tagline: 'The Royal County - heritage homes meet modern energy' },
  { name: 'Louth', provinces: ['Leinster'], domain: 'solarlouth.com', status: 'coming-soon', costMin: 4500, costMax: 6800, generationKwh: 3530, population: '139K', tagline: 'The Wee County with big solar ambitions' },
  { name: 'Longford', provinces: ['Leinster'], domain: 'solarlongford.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3400, population: '46K', tagline: 'Heart of the Midlands - where community spirit shines' },
  { name: 'Westmeath', provinces: ['Leinster'], domain: 'solarwestmeath.com', status: 'coming-soon', costMin: 4400, costMax: 6700, generationKwh: 3430, population: '96K', tagline: 'Lakeside living with rooftop power to match' },
  { name: 'Offaly', provinces: ['Leinster'], domain: 'solaroffaly.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3420, population: '83K', tagline: 'From the Slieve Bloom to Shannonbridge - powering the Midlands' },
  { name: 'Laois', provinces: ['Leinster'], domain: 'solarlaois.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3430, population: '85K', tagline: 'Quiet county, bright future - solar energy for every home' },
  { name: 'Kilkenny', provinces: ['Leinster'], domain: 'solarkilkenny.com', status: 'active', costMin: 4400, costMax: 6700, generationKwh: 3500, population: '104K', tagline: 'The Marble City and beyond - medieval charm, modern energy' },

  { name: 'Cork', provinces: ['Munster'], domain: 'solarcork.com', status: 'active', costMin: 4600, costMax: 7000, generationKwh: 3580, population: '555K', tagline: 'The Rebel County runs on sunshine' },
  { name: 'Kerry', provinces: ['Munster'], domain: 'solarkerry.com', status: 'active', costMin: 4600, costMax: 7100, generationKwh: 3540, population: '156K', tagline: 'From the Kingdom - wild Atlantic coast, serious solar savings' },
  { name: 'Limerick', provinces: ['Munster'], domain: 'solarlimerick.com', status: 'active', costMin: 4500, costMax: 6900, generationKwh: 3500, population: '205K', tagline: 'Treaty City homes switching on to solar' },
  { name: 'Clare', provinces: ['Munster'], domain: 'solarclare.com', status: 'coming-soon', costMin: 4400, costMax: 6700, generationKwh: 3470, population: '131K', tagline: 'The Banner County - from the Burren to your rooftop' },
  { name: 'Tipperary', provinces: ['Munster'], domain: 'solartipperary.com', status: 'active', costMin: 4400, costMax: 6700, generationKwh: 3480, population: '165K', tagline: 'Premier County homes leading the solar charge' },
  { name: 'Waterford', provinces: ['Munster'], domain: 'solarwaterford.com', status: 'active', costMin: 4500, costMax: 6800, generationKwh: 3550, population: '127K', tagline: 'The Déise - crystal city with a green energy vision' },

  { name: 'Galway', provinces: ['Connacht'], domain: 'solargalway.com', status: 'active', costMin: 4500, costMax: 7000, generationKwh: 3450, population: '279K', tagline: 'City of the Tribes - urban and county, we cover it all' },
  { name: 'Mayo', provinces: ['Connacht'], domain: 'solarmayo.com', status: 'active', costMin: 4400, costMax: 6800, generationKwh: 3400, population: '137K', tagline: 'Wild Mayo - big skies, open roofs, endless potential' },
  { name: 'Roscommon', provinces: ['Connacht'], domain: 'solarroscommon.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3380, population: '72K', tagline: 'Heart of the west - where every watt counts' },
  { name: 'Sligo', provinces: ['Connacht'], domain: 'solarsligo.com', status: 'coming-soon', costMin: 4400, costMax: 6700, generationKwh: 3390, population: '70K', tagline: 'Yeats Country catching rays on every rooftop' },
  { name: 'Leitrim', provinces: ['Connacht'], domain: 'solarleitrim.com', status: 'coming-soon', costMin: 4300, costMax: 6500, generationKwh: 3350, population: '35K', tagline: 'The lovely county - small in size, big on green energy' },

  { name: 'Donegal', provinces: ['Ulster'], domain: 'solardonegal.com', status: 'active', costMin: 4400, costMax: 6800, generationKwh: 3410, population: '167K', tagline: 'From Malin Head to Donegal Town - the north-west shines bright' },
  { name: 'Cavan', provinces: ['Ulster'], domain: 'solarcavan.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3410, population: '81K', tagline: 'Lakeland County - drumlins and solar panels, a perfect match' },
  { name: 'Monaghan', provinces: ['Ulster'], domain: 'solarmonaghan.com', status: 'coming-soon', costMin: 4300, costMax: 6600, generationKwh: 3400, population: '68K', tagline: 'The Farney County - border spirit, boundless energy' },
  { name: 'Antrim', provinces: ['Ulster'], domain: 'solarantrim.com', status: 'coming-soon', costMin: 4600, costMax: 7200, generationKwh: 3450, population: '649K', tagline: 'Giant\'s Causeway coast and city rooftops - solar for all' },
  { name: 'Armagh', provinces: ['Ulster'], domain: 'solararmagh.com', status: 'coming-soon', costMin: 4500, costMax: 7000, generationKwh: 3420, population: '206K', tagline: 'The Orchard County - growing green energy from the ground up' },
  { name: 'Down', provinces: ['Ulster'], domain: 'solardown.com', status: 'coming-soon', costMin: 4600, costMax: 7100, generationKwh: 3440, population: '552K', tagline: 'The Mountains of Mourne meet clean energy on every roof' },
  { name: 'Fermanagh', provinces: ['Ulster'], domain: 'solarfermanagh.com', status: 'coming-soon', costMin: 4400, costMax: 6700, generationKwh: 3380, population: '62K', tagline: 'Lake country living - where nature and solar go hand in hand' },
  { name: 'Derry', provinces: ['Ulster'], domain: 'solarderry.com', status: 'coming-soon', costMin: 4500, costMax: 6900, generationKwh: 3400, population: '252K', tagline: 'The Maiden City - historic walls, forward-thinking energy' },
  { name: 'Tyrone', provinces: ['Ulster'], domain: 'solartyrone.com', status: 'coming-soon', costMin: 4400, costMax: 6800, generationKwh: 3390, population: '193K', tagline: 'From the Sperrins to Strabane - solar across the county' },
];


const provinceGroups: { province: Province; counties: string[] }[] = [
  {
    province: 'Leinster',
    counties: ['Dublin', 'Wicklow', 'Wexford', 'Carlow', 'Kildare', 'Meath', 'Louth', 'Longford', 'Westmeath', 'Offaly', 'Laois', 'Kilkenny'],
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
    counties: ['Antrim', 'Armagh', 'Down', 'Fermanagh', 'Derry', 'Tyrone', 'Cavan', 'Monaghan', 'Donegal'],
  },
];

const provinceColors: Record<Province, { bg: string; text: string; border: string; dot: string }> = {
  Leinster: { bg: 'bg-sky-400/10', text: 'text-sky-400', border: 'border-sky-400/20', dot: 'bg-sky-400' },
  Munster: { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/20', dot: 'bg-emerald-400' },
  Connacht: { bg: 'bg-violet-400/10', text: 'text-violet-400', border: 'border-violet-400/20', dot: 'bg-violet-400' },
  Ulster: { bg: 'bg-rose-400/10', text: 'text-rose-400', border: 'border-rose-400/20', dot: 'bg-rose-400' },
};

const provinceSeoSubtitles: Record<Province, string> = {
  Leinster: 'Solar panel installers serving Dublin, Wicklow, Kildare, Meath and 10 more counties',
  Munster: 'Solar PV installations across Cork, Kerry, Limerick, Waterford and more',
  Connacht: 'Solar energy solutions for Galway, Mayo, Roscommon, Sligo and Leitrim',
  Ulster: 'Solar panels in Donegal and across Northern Ireland',
};


const faqs = [
  {
    question: 'Do you install solar panels in every county in Ireland?',
    answer: 'Yes - Solar Ireland covers all 32 counties across the Republic of Ireland and Northern Ireland. We have active installation teams in many counties right now, with more areas being added every month. Even if your county shows "Coming Soon", you can still get in touch for a free consultation and we\'ll connect you with the nearest available team. From Dublin to Donegal, Cork to Cavan, we\'re making solar accessible for every Irish homeowner.',
  },
  {
    question: 'How much do solar panels cost in my county?',
    answer: 'Solar panel costs vary slightly by county depending on local demand, travel distances for installation teams, and the typical housing types in your area. Generally, a standard 4kWp residential solar PV system in Ireland costs between €4,300 and €7,200, including installation. After the €1,800 SEAI grant, your out-of-pocket cost could be as low as €2,500–€5,400. Every county page on our site shows specific pricing ranges for that area, so you can get a realistic estimate for your home.',
  },
  {
    question: 'Is the SEAI grant available in all 32 counties?',
    answer: 'The SEAI (Sustainable Energy Authority of Ireland) grant of up to €1,800 is available to homeowners in the Republic of Ireland - all 26 counties qualify. The grant applies to homes built before 2021 that have a BER rating of C3 or lower. For Northern Ireland (the 6 counties), the equivalent support comes through the Northern Ireland Housing Executive\'s Renewable Heat and Energy schemes. Our team is fully up to speed on the grant process for both jurisdictions and handles all the paperwork on your behalf.',
  },
  {
    question: 'How long does a solar panel installation take?',
    answer: 'A typical residential solar panel installation takes just one day to complete on-site. The scaffolding goes up in the morning, panels are mounted by midday, and the electrical wiring and inverter connection are finished by late afternoon. Before installation day, there\'s usually a 2–4 week lead time for a site survey, system design, SEAI grant application, and scheduling. After installation, it takes 4–8 weeks for the SEAI grant payment to arrive into your bank account. From first call to panels on your roof, you\'re typically looking at 4–6 weeks in total.',
  },
  {
    question: 'Do I need planning permission for solar panels?',
    answer: 'In the vast majority of cases, no - solar panels on domestic homes in Ireland are classed as "exempted development" under planning law, meaning you don\'t need planning permission. This applies to panels on the roof of your home or detached garage, provided they don\'t extend more than 50cm above the roof plane and don\'t cover more than 50% of the roof area. For listed buildings or homes in architectural conservation areas, restrictions may apply, and our survey team will advise you during the free site assessment. Northern Ireland has similar exemptions under its permitted development rights.',
  },
  {
    question: 'What if my county says "Coming Soon"?',
    answer: 'If your county is listed as "Coming Soon", it means we\'re actively setting up installation teams in your area and expect to be fully operational within the coming weeks. You can still reach out to us now - we\'ll add you to our waitlist, conduct a free remote roof assessment using satellite imagery, and have your SEAI grant paperwork ready to go so there\'s zero delay once our local team is active. Many of our "Coming Soon" counties already have surveyors in the area, so don\'t hesitate to get in touch.',
  },
  {
    question: 'Can I get a free solar survey in my area?',
    answer: 'Absolutely. Solar Ireland offers free, no-obligation roof surveys across all 32 counties. A local surveyor will visit your home (or conduct a detailed remote assessment) to evaluate your roof orientation, pitch, shading from nearby trees or buildings, and your current electricity usage. You\'ll receive a personalised proposal with an exact system size, generation estimate, cost breakdown, projected savings, and payback period. There\'s no pressure and no charge - just honest, transparent advice about whether solar makes sense for your home.',
  },
  {
    question: 'Do you serve Northern Ireland?',
    answer: 'Yes, we do. Solar Ireland covers all six counties of Northern Ireland: Antrim, Armagh, Down, Fermanagh, Derry, and Tyrone. While the SEAI grant doesn\'t apply north of the border, there are alternative support schemes through the Northern Ireland Housing Executive and energy suppliers. Our installation teams are familiar with the different regulations, grid connection processes, and certification requirements in Northern Ireland, so you\'ll get the same professional, hassle-free service as our customers in the Republic.',
  },
];


const whyLocalCards = [
  {
    icon: Home,
    title: 'Local Roof Knowledge',
    description: 'We know the common housing types in your county - the typical roof pitches, the prevailing shading patterns, the orientation that works best. We\'re not guessing.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/15',
  },
  {
    icon: Clock,
    title: 'Faster Response Times',
    description: 'Our local survey teams are already in your area. That means quicker site visits, faster installations, and someone nearby if you ever need us.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/15',
  },
  {
    icon: FileCheck,
    title: 'SEAI Grant Expertise',
    description: 'We handle all the SEAI paperwork for you - application, BER assessment, everything. No form-filling headaches, no chasing deadlines.',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/15',
  },
  {
    icon: HeartHandshake,
    title: 'Aftercare You Can Count On',
    description: 'Local support means a real person you can call - not a faceless call centre. If something needs attention, our team is just down the road.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/15',
  },
];

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
      <div className={`absolute top-5 right-5 w-2.5 h-2.5 rounded-full ${colors.dot} opacity-60`} />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
            {county.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
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

      <p className="text-xs text-gray-500 mb-4 leading-relaxed italic">
        {county.tagline}
      </p>

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

      <div className="flex items-center gap-1.5 mb-4">
        <Globe className="w-3 h-3 text-gray-600" />
        <span className="text-xs text-gray-500">{county.domain}</span>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('counties-page')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/15 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Get Quote
        </a>
        <a
          href={`tel:${SOLAR_DATA.provider.phone.replace(/\s/g, '')}`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-400 text-xs font-medium hover:bg-white/[0.06] hover:text-white transition-colors active:scale-[0.98]"
        >
          <Phone className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

function ProvinceHeader({
  province,
  count,
}: {
  province: Province;
  count: number;
}) {
  const colors = provinceColors[province];
  const seoSubtitle = provinceSeoSubtitles[province];

  return (
    <div className="mt-12 mb-6 first:mt-0">
      <div className="flex items-center gap-4">
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
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {seoSubtitle}
          </p>
        </div>
        <div className="hidden sm:block h-px flex-1 bg-white/[0.04]" />
      </div>
    </div>
  );
}

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left"
      >
        <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
          {question}
        </h3>
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-amber-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`motion-accordion ${isOpen ? 'open' : ''}`}
      >
        <div>
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
            <div className="h-px bg-white/[0.05] mb-4" />
            <p className="text-sm text-gray-400 leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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

function buildItemListJsonLd() {
  const base = 'https://solarirelandgroup.ie';
  const items = counties.map((county, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: `Solar Panels ${county.name}`,
    url: `${base}/${county.name.toLowerCase()}`,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Solar Panel Installation Counties in Ireland',
    description: 'Directory of all 32 counties in Ireland where Solar Ireland provides solar panel installation services',
    numberOfItems: 32,
    itemListElement: items,
  };
}

function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export default function CountiesClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProvince, setActiveProvince] = useState<Province | 'all'>('all');

  const filteredCounties = useMemo(() => {
    return counties.filter((county) => {
      const matchesSearch =
        !searchQuery ||
        county.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProvince =
        activeProvince === 'all' || county.provinces.includes(activeProvince);
      return matchesSearch && matchesProvince;
    });
  }, [searchQuery, activeProvince]);

  const activeCount = counties.filter((c) => c.status === 'active').length;
  const comingSoonCount = counties.filter((c) => c.status === 'coming-soon').length;

  const provinceTabs = useMemo(() => {
    const provinces: Province[] = ['Leinster', 'Munster', 'Connacht', 'Ulster'];
    return [
      { key: 'all' as const, label: 'All', count: counties.length },
      ...provinces.map(prov => ({
        key: prov,
        label: prov,
        count: counties.filter(c => c.provinces.includes(prov)).length,
      })),
    ];
  }, []);

  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.querySelector('[data-active="true"]');
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeProvince]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveProvince('all');
  };

  const hasActiveFilters = searchQuery || activeProvince !== 'all';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        <header className="relative overflow-hidden">
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
              Solar Panels for{' '}
              <span className="text-amber-400">Every Irish Home</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-3xl leading-relaxed mb-4">
              From the Hook Head to Malin Head, we&apos;ve panels on roofs in every corner of Ireland.
              Whether you&apos;re in a Dublin terrace, a Cork semi-d, or a Donegal cottage - we&apos;re here
              to help you harness the sun, cut your bills, and do your bit for the planet.
            </p>
            <p className="text-gray-500 text-sm sm:text-base max-w-3xl leading-relaxed mb-6">
              Our local installers know your area: the roof pitches, the shading patterns, the
              orientation that works best. We&apos;re not passing through - we live here. And with the
              €1,800 SEAI grant, there&apos;s never been a better time to go solar.
            </p>

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

        <section className="border-y border-white/[0.04] bg-white/[0.01]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Why Going <span className="text-amber-400">Local</span> Matters
              </h2>
              <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
                Solar isn&apos;t one-size-fits-all. Here&apos;s why having an installer who knows your county makes all the difference.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {whyLocalCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="glass-card rounded-2xl p-5 sm:p-6"
                  >
                    <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-600">
              <a href="/" className="hover:text-gray-400 transition-colors">Home</a>
              <ChevronRight className="w-3 h-3 rotate-90" />
              <span className="text-gray-400">County Directory</span>
            </nav>
          </div>
        </div>

        <div className="sticky top-16 z-20 bg-[#0a0a0a]/95 border-b border-white/[0.04] backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4">
            {/* Search bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search counties..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/10 transition-all"
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

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                <span className="text-gray-400 font-semibold">{filteredCounties.length}</span>
                <span>result{filteredCounties.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Province filter tabs */}
            <div
              ref={tabsRef}
              className="flex items-center gap-2 mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {provinceTabs.map((tab) => {
                const isActive = activeProvince === tab.key;
                return (
                  <button
                    key={tab.key}
                    data-active={isActive}
                    onClick={() => setActiveProvince(tab.key)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                      isActive
                        ? 'bg-amber-400/15 border border-amber-400/30 text-amber-400'
                        : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-gray-300 hover:bg-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-white/[0.06] text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="shrink-0 flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-amber-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          {filteredCounties.length === 0 ? (
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

              <BottomStats />

              <section className="mt-16 sm:mt-20">
                <div className="text-center mb-8 sm:mb-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
                    Everything you need to know about getting solar panels installed in your county.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {faqs.map((faq, index) => (
                    <FaqItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                      index={index}
                    />
                  ))}
                </div>
              </section>

              <div className="mt-16 sm:mt-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400/10 via-amber-500/[0.05] to-transparent border border-amber-400/10 p-8 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-amber-400/[0.04] rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/10 flex items-center justify-center mx-auto mb-5">
                    <Sparkles className="w-7 h-7 text-amber-400" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Ready to Go Solar?
                  </h2>
                  <p className="text-gray-400 text-base max-w-lg mx-auto mb-6 leading-relaxed">
                    Join thousands of Irish homeowners already saving with solar. Get a free,
                    no-obligation survey - we&apos;ll check your roof, estimate your savings, and
                    handle all the SEAI grant paperwork. No pressure, just honest advice.
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
                      href={`mailto:${SOLAR_DATA.provider.email}`}
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildItemListJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqJsonLd()),
        }}
      />
    </div>
  );
}
