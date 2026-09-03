'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from '@/lib/motion';
import {
  ChevronDown,
  Search,
  Euro,
  Wrench,
  Zap,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: CategoryKey;
  keywords: string[];
}

type CategoryKey = 'all' | 'costs' | 'grants' | 'install' | 'technical';

interface Category {
  key: CategoryKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  borderHover: string;
}

const categories: Category[] = [
  { key: 'all', label: 'All', icon: HelpCircle, color: 'text-white', bg: 'bg-white/[0.06]', borderHover: 'hover:border-white/20' },
  { key: 'costs', label: 'Costs & Savings', icon: Euro, color: 'text-green-400', bg: 'bg-green-400/10', borderHover: 'hover:border-green-400/20' },
  { key: 'grants', label: 'Grants', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-400/10', borderHover: 'hover:border-amber-400/20' },
  { key: 'install', label: 'Installation', icon: Wrench, color: 'text-sky-400', bg: 'bg-sky-400/10', borderHover: 'hover:border-sky-400/20' },
  { key: 'technical', label: 'Technical', icon: Zap, color: 'text-violet-400', bg: 'bg-violet-400/10', borderHover: 'hover:border-violet-400/20' },
];

const faqs: FAQItem[] = [
  {
    id: 1,
    question: 'How much do solar panels cost in Ireland in 2026?',
    answer:
      `A typical residential solar PV system costs between €4,500 and €7,500 before the SEAI grant. After the ${SOLAR_DATA.grant.label} grant, you are looking at approximately €2,700 to €5,700 out of pocket. The exact cost depends on the system size, roof complexity, and whether you want battery storage. We provide itemised quotes so you can see exactly where your money goes - no hidden costs, no surprises. <a href="#calculator" class="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">Use our AI Bill Analyser for a personalised quote</a>`,
    category: 'costs',
    keywords: ['cost', 'price', 'expensive', 'cheap', 'budget', 'how much', 'money', 'afford'],
  },
  {
    id: 2,
    question: 'How much could I save with solar panels?',
    answer:
      `A typical 3-bed semi-detached home with a ${SOLAR_DATA.system.avgSizeKwp} kWp system can save between €800 and €1,400 per year on electricity bills, depending on your usage patterns and whether you have a battery. With electricity prices rising around 3% annually, your savings grow over time. Over 25 years, total savings typically range from €30,000 to €50,000. The best way to get an accurate figure is to use our AI Bill Analyser - it reads your actual bill and calculates your personalised savings. <a href="#calculator" class="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">Try it now</a>`,
    category: 'costs',
    keywords: ['save', 'savings', 'saving', 'return', 'roi', 'payback', 'worth it', 'investment'],
  },
  {
    id: 3,
    question: 'How long is the payback period?',
    answer:
      'Most homeowners see a full payback within 5 to 7 years after the SEAI grant. A 4 kWp system costing around €6,500 (after grant) with annual savings of €1,000 would pay for itself in roughly 6.5 years. After that, every kilowatt-hour generated is essentially free electricity for the remaining 18+ years of the panel warranty. With rising electricity prices, many customers are seeing even faster payback periods.',
    category: 'costs',
    keywords: ['payback', 'how long', 'break even', 'roi', 'return', 'years'],
  },
  {
    id: 4,
    question: 'What is the SEAI grant and am I eligible?',
    answer:
      `The SEAI offers a Solar PV grant of ${SOLAR_DATA.grant.label} towards the cost of installing solar panels on your home. This grant is available in the Republic of Ireland (26 counties) only - Northern Ireland has separate support schemes. To be eligible, you must be the owner-occupier of a home built before 2021, and the property must have a BER rating of C3 or lower (or be a pre-1978 home with no BER). The grant is paid directly to your installer after completion, so it comes off your final bill. We verify your eligibility during the free survey and handle the entire application on your behalf. <a href="#grant-info" class="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">Check if you qualify</a>`,
    category: 'grants',
    keywords: ['grant', 'seai', 'eligibility', 'eligible', 'government', 'apply', '1800', '€1,800'],
  },
  {
    id: 5,
    question: 'How does the SEAI grant application work?',
    answer:
      `It's straightforward - and we do all the paperwork for you. After your free survey, we submit the grant application to SEAI on your behalf. Once approved (usually within a few weeks), we proceed with the installation. After the system is commissioned and a post-install BER assessment is completed, SEAI pays the ${SOLAR_DATA.grant.label} grant directly to us, and it's deducted from your final invoice. You don't need to pay the grant amount upfront and wait for a refund.`,
    category: 'grants',
    keywords: ['grant', 'apply', 'application', 'process', 'paperwork', 'how does it work', 'seai'],
  },
  {
    id: 6,
    question: 'How long does installation take?',
    answer:
      'The physical installation is completed in a single day for a standard residential system. The scaffolding goes up first thing in the morning, our RECI-registered team mounts and wires the panels during the day, and the system is fully commissioned before we leave. We also handle the ESB Networks grid connection notification. The only additional time is for the SEAI grant approval and post-install BER assessment, but we manage all of that for you.',
    category: 'install',
    keywords: ['install', 'installation', 'how long', 'time', 'day', 'days', 'schedule', 'when'],
  },
  {
    id: 7,
    question: 'Do I need planning permission?',
    answer:
      'In the vast majority of cases, no. Solar panels are considered exempted development in Ireland under certain conditions: the panels must not extend more than 50cm from the roof surface, and the total area must not exceed 12 square metres or 50% of the roof area, whichever is less. Exceptions apply for protected structures and certain designated areas. We check all planning requirements during the free survey.',
    category: 'install',
    keywords: ['planning', 'permission', 'council', 'allowed', 'legal', 'regulations', 'planning permission'],
  },
  {
    id: 8,
    question: 'Will solar panels work on my roof?',
    answer:
      'Solar panels work on most Irish roof types - tiled, slate, and metal. South-facing roofs with a pitch of 30-40 degrees are optimal, but east/west-facing roofs still produce excellent results (typically 80-85% of a south-facing output). During the free survey, we assess your roof orientation, pitch, shading from trees or buildings, and structural suitability to give you an honest recommendation.',
    category: 'install',
    keywords: ['roof', 'work', 'suitable', 'type', 'slate', 'tile', 'flat', 'pitch', 'orientation'],
  },
  {
    id: 9,
    question: 'How much electricity will I generate?',
    answer:
      'In Ireland, a well-positioned system generates roughly 850 to 950 kWh per kilowatt-peak (kWp) per year. A typical 4 kWp system would produce around 3,400 to 3,800 kWh annually. Actual output depends on your roof orientation, pitch, and shading. Modern panels are remarkably efficient - even on overcast Irish days they generate meaningful power. A properly sized system can cover 60-70% of a typical household\'s annual electricity needs.',
    category: 'technical',
    keywords: ['generate', 'generation', 'output', 'kwh', 'power', 'electricity', 'produce', 'kwp'],
  },
  {
    id: 10,
    question: 'What about cloudy days and winter?',
    answer:
      'Solar panels still generate electricity on cloudy days - typically 10-25% of their rated output compared to a sunny day. While winter production is lower (roughly 30-40% of summer output), the system is sized to maximise annual generation. Any shortfall is automatically covered by the grid, and you only pay for what you use. Most homeowners find that their summer surplus offsets the winter deficit, and with a battery you can store excess summer generation for winter evenings.',
    category: 'technical',
    keywords: ['cloudy', 'winter', 'rain', 'weather', 'ireland', 'sun', 'dark', 'snow', 'season'],
  },
  {
    id: 11,
    question: 'Do you offer battery storage?',
    answer:
      'Yes. A battery stores excess electricity generated during the day for use in the evening or overnight, increasing your self-consumption to 85%+. A typical 5 kWh lithium-ion battery costs around €4,000-€5,000 installed. The payback on batteries is longer (8-12 years) compared to panels alone, but they\'re worth considering if you\'re out during the day, have an EV, or want to maximise your energy independence. We discuss battery options during the survey.',
    category: 'technical',
    keywords: ['battery', 'storage', 'tesla', 'powerwall', 'store', 'night', 'evening'],
  },
  {
    id: 12,
    question: 'What happens to electricity I don\'t use?',
    answer:
      `Any excess electricity your panels generate that you don't use is automatically exported to the grid. Under the ESB microgeneration support scheme, your electricity supplier pays you ${SOLAR_DATA.export.label} for exported energy. For a typical ${SOLAR_DATA.system.avgSizeKwp} kWp system, this can add €150-€300 per year to your savings. The export payment appears as a credit on your electricity bill - it's all handled automatically through your smart meter. <a href="#why-solar" class="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">Learn about the Clean Export Guarantee</a>`,
    category: 'technical',
    keywords: ['export', 'sell', 'excess', 'surplus', 'grid', 'microgeneration', 'credit', 'smart meter', 'esb'],
  },
];

function FAQItemCard({
  faq,
  isOpen,
  onToggle,
  index,
}: {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const catConfig = categories.find((c) => c.key === faq.category)!;

  const related = faqs
    .filter((f) => f.category === faq.category && f.id !== faq.id)
    .slice(0, 2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? 'bg-white/[0.04] border border-white/[0.1]'
          : 'bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 sm:py-5 text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`shrink-0 w-7 h-7 rounded-lg ${catConfig.bg} flex items-center justify-center mt-0.5 sm:mt-0`}>
            <catConfig.icon className={`w-3.5 h-3.5 ${catConfig.color}`} />
          </div>
          <span className={`speakable-question font-medium pr-2 text-sm sm:text-[15px] leading-snug transition-colors ${
            isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'
          }`}>
            {faq.question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center mt-0.5 sm:mt-0 group-hover:bg-white/[0.08] transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-colors ${isOpen ? 'text-amber-400' : 'text-gray-400'}`} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="overflow-hidden">
              <div className="px-5 sm:px-6 pb-4">
                <div className="pl-10">
                  <p className="speakable-answer text-gray-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }} />

                  {related.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/[0.05]">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Related questions</p>
                      <div className="flex flex-wrap gap-2">
                        {related.map((r) => (
                          <span
                            key={r.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] text-[11px] text-gray-400 hover:text-gray-300 transition-colors cursor-default"
                          >
                            <catConfig.icon className={`w-2.5 h-2.5 ${catConfig.color} opacity-60`} />
                            {r.question}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SearchInput({
  value,
  onChange,
  resultCount,
  totalCount,
}: {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
  totalCount: number;
}) {
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search questions" placeholder="Search questions..."
        className="w-full pl-11 pr-20 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/10 transition-all"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {hasValue && (
          <>
            <span className="text-[11px] text-gray-400 tabular-nums">
              {resultCount}/{totalCount}
            </span>
            <button
              onClick={() => onChange('')}
              className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.1] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CategoryTabs({
  active,
  onChange,
  counts,
}: {
  active: CategoryKey;
  onChange: (key: CategoryKey) => void;
  counts: Record<CategoryKey, number>;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      {categories.map((cat) => {
        const isActive = active === cat.key;
        const CatIcon = cat.icon;
        return (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className={`
              shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium
              transition-all duration-200 active:scale-95 border
              ${isActive
                ? `${cat.bg} ${cat.borderHover} border-white/[0.1] ${cat.color}`
                : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] hover:border-white/[0.06]'
              }
            `}
          >
            <CatIcon className="w-3 h-3" />
            {cat.label}
            {cat.key !== 'all' && (
              <span className={`text-[10px] ml-0.5 ${isActive ? cat.color : 'text-gray-500'}`}>
                {counts[cat.key]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = { all: faqs.length, costs: 0, grants: 0, install: 0, technical: 0 };
    faqs.forEach((f) => { counts[f.category]++; });
    return counts;
  }, []);

  const filteredFAQs = useMemo(() => {
    let result = faqs;

    if (activeCategory !== 'all') {
      result = result.filter((f) => f.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.keywords.some((k) => k.includes(q))
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  const toggle = useCallback(
    (index: number) => {
      setOpenIndex(openIndex === index ? null : index);
    },
    [openIndex]
  );

  const clearFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setOpenIndex(null);
  };

  return (
    <>
    <script
      type="application/ld+json"
      id="schema-faq"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": "https://solarirelandgroup.ie/#faq",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              // Strip the inline HTML so the schema answer is the plain
              // text the page actually shows (Google requires a match).
              text: f.answer.replace(/<[^>]+>/g, "").trim(),
            },
          })),
        }),
      }}
    />
    <script
      type="application/ld+json"
      id="schema-speakable"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://solarirelandgroup.ie",
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [".speakable-question", ".speakable-answer"],
            "xpath": [
              "//section[@id='faq']//button[contains(@class,'speakable-question')]",
              "//section[@id='faq']//p[contains(@class,'speakable-answer')]"
            ]
          },
          "url": "https://solarirelandgroup.ie/#faq"
        }),
      }}
    />
    <section id="faq" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 relative noise-bg overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-violet-500/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10" ref={sectionRef}>
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-400/[0.06] border border-violet-400/[0.1] mb-5">
            <HelpCircle className="w-3 h-3 text-violet-400" />
            <span className="text-[11px] sm:text-xs font-semibold text-violet-400 uppercase tracking-[0.15em]">
              FAQ
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl mx-auto leading-[1.1]">
            Common
            <br />
            <span className="text-gradient">questions.</span>
          </h2>
          <p className="mt-4 text-gray-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Got a question about solar? Search or browse by category. Can&apos;t find what you&apos;re looking for? Ask us directly.
          </p>
        </motion.div>

        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <SearchInput
            value={searchQuery}
            onChange={(v) => { setSearchQuery(v); setOpenIndex(null); }}
            resultCount={filteredFAQs.length}
            totalCount={faqs.length}
          />
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <CategoryTabs active={activeCategory} onChange={(k) => { setActiveCategory(k); setOpenIndex(null); }} counts={categoryCounts} />
        </motion.div>

        {(activeCategory !== 'all' || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between mb-4 px-1"
          >
            <p className="text-xs text-gray-400">
              Showing <span className="text-gray-400 font-medium">{filteredFAQs.length}</span> question{filteredFAQs.length !== 1 ? 's' : ''}
              {activeCategory !== 'all' && (
                <span> in <span className="text-gray-400">{categories.find(c => c.key === activeCategory)?.label}</span></span>
              )}
            </p>
            <button
              onClick={clearFilters}
              className="text-[11px] text-gray-400 hover:text-amber-400 transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        )}

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <FAQItemCard
                  key={faq.id}
                  faq={faq}
                  isOpen={openIndex === faq.id}
                  onToggle={() => toggle(faq.id)}
                  index={index}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-12"
              >
                <Search className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No questions match your search.</p>
                <button
                  onClick={clearFilters}
                  className="text-xs text-amber-400 hover:text-amber-300 mt-2 transition-colors"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-gray-400">
            Still have questions?{' '}
            <a
              href={buildWhatsAppUrl({ source: 'faq' })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              Ask us on WhatsApp →
            </a>
          </p>
        </motion.div>

      </div>
    </section>
    </>
  );
}
