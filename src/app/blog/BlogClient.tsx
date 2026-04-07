'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from '@/lib/motion';
import Link from 'next/link';
import {
  ChevronRight,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Tag,
  Search,
  Mail,
  Zap,
  Euro,
  Sun,
  Battery,
  Car,
  TrendingUp,
  Info,
  Lightbulb,
  Newspaper,
  MapPin,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import { articles, type Article } from '@/lib/blog-data';

/* ═══════════════════════════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Category article count helper ─── */
function getCategoryCount(catId: string): number {
  if (catId === 'all') return articles.length;
  return articles.filter((a) => a.category === catId).length;
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORY DATA
   ═══════════════════════════════════════════════════════════════ */
const categories = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'grants', label: 'Grants', icon: Euro },
  { id: 'guides', label: 'Guides', icon: Lightbulb },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'county', label: 'County Spotlight', icon: MapPin },
  { id: 'savings', label: 'Savings', icon: TrendingUp },
  { id: 'technology', label: 'Technology', icon: Zap },
];

/* ═══════════════════════════════════════════════════════════════
   CATEGORY ICON HELPER
   ═══════════════════════════════════════════════════════════════ */
function getCategoryIcon(categoryId: string) {
  const cat = categories.find((c) => c.id === categoryId);
  return cat?.icon || BookOpen;
}

function getCategoryColor(categoryId: string) {
  switch (categoryId) {
    case 'grants': return { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20' };
    case 'guides': return { bg: 'bg-sky-400/10', text: 'text-sky-400', border: 'border-sky-400/20' };
    case 'news': return { bg: 'bg-violet-400/10', text: 'text-violet-400', border: 'border-violet-400/20' };
    case 'county': return { bg: 'bg-orange-400/10', text: 'text-orange-400', border: 'border-orange-400/20' };
    case 'savings': return { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/20' };
    case 'technology': return { bg: 'bg-sky-400/10', text: 'text-sky-400', border: 'border-sky-400/20' };
    default: return { bg: 'bg-gray-400/10', text: 'text-gray-400', border: 'border-gray-400/20' };
  }
}

/* ═══════════════════════════════════════════════════════════════
   ARTICLES PER PAGE
   ═══════════════════════════════════════════════════════════════ */
const ARTICLES_PER_PAGE = 6;

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function BlogClient() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pillPulse, setPillPulse] = useState<string | null>(null);

  // Filter articles by category
  const filteredArticles = useMemo(() => {
    if (activeCategory === 'all') return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  // Separate featured from regular
  const featuredArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const regularArticles = filteredArticles.filter((a) => a.slug !== featuredArticle?.slug);

  // Pagination
  const totalPages = Math.ceil(regularArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = regularArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  const gridRef = useRef<HTMLDivElement>(null);
  const transitioningRef = useRef(false);

  // Scroll to grid when page changes (with fade transition)
  const handlePageChange = useCallback((page: number) => {
    if (transitioningRef.current || page === currentPage) return;
    transitioningRef.current = true;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setTimeout(() => {
        setIsTransitioning(false);
        transitioningRef.current = false;
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }, 200);
  }, [currentPage]);

  // Reset page on category change (with fade transition + pill pulse)
  const handleCategoryChange = useCallback((catId: string) => {
    if (transitioningRef.current || catId === activeCategory) return;
    transitioningRef.current = true;
    setIsTransitioning(true);
    setPillPulse(catId);
    setTimeout(() => {
      setActiveCategory(catId);
      setCurrentPage(1);
      setTimeout(() => {
        setIsTransitioning(false);
        transitioningRef.current = false;
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }, 200);
    // Clear pill pulse after animation completes
    setTimeout(() => setPillPulse(null), 500);
  }, [activeCategory]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        {/* ═══════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-amber-400/[0.04] rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-amber-400/[0.03] rounded-full blur-[80px]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16">
            {/* Breadcrumb */}
            <motion.nav
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 text-sm text-gray-500 mb-8"
            >
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-300">Blog</span>
            </motion.nav>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Solar Energy Blog
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Solar Tips, Guides{' '}
                <span className="text-gradient">&amp; News</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl">
                Honest, jargon-free advice about solar panels in Ireland. From grant guides
                to cost breakdowns — everything you need to make an informed decision about
                going solar.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CATEGORY FILTER PILLS
            ═══════════════════════════════════════ */}
        <section className="sticky top-16 z-20 bg-[#0a0a0a]/95 border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2 py-4 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const isPulsing = pillPulse === cat.id;
                const count = getCategoryCount(cat.id);
                return (
                  <motion.button
                    key={cat.id}
                    variants={fadeUp}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-transform duration-200 ${
                      isActive
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/15'
                        : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                    } ${isPulsing ? 'blog-pill-pulse' : ''}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                    {/* Article count badge */}
                    <span className={`ml-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                      isActive
                        ? 'bg-black/15 text-black'
                        : 'bg-white/[0.06] text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FEATURED ARTICLE
            ═══════════════════════════════════════ */}
        {featuredArticle && (
          <section className="py-12 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7 }}
              >
                <Link
                  href={`/blog/${featuredArticle.slug}`}
                  className="group block glass-card rounded-2xl overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Image placeholder */}
                    <div className="relative h-64 sm:h-80 lg:h-auto bg-gradient-to-br from-amber-400/[0.08] via-amber-500/[0.04] to-transparent overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Sun className="w-16 h-16 text-amber-400/30 mx-auto mb-3" />
                          <p className="text-xs text-amber-400/40 font-medium uppercase tracking-[0.05em]">Featured Article</p>
                        </div>
                      </div>
                      {/* Decorative grid pattern */}
                      <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                      }} />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/50 lg:block hidden" />
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] ${
                          getCategoryColor(featuredArticle.category).bg
                        } ${getCategoryColor(featuredArticle.category).text} border ${
                          getCategoryColor(featuredArticle.category).border
                        }`}>
                          {(() => { const CatIcon = getCategoryIcon(featuredArticle.category); return <CatIcon className="w-3 h-3" />; })()}
                          {featuredArticle.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          {featuredArticle.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors leading-tight">
                        {featuredArticle.title}
                      </h2>

                      <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-6 line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {featuredArticle.date}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 group-hover:gap-2.5 transition-all">
                          Read Article
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            ARTICLE GRID
            ═══════════════════════════════════════ */}
        <section ref={gridRef} className="pb-16 sm:pb-24 scroll-mt-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Transition wrapper — fades grid out/in during page/category changes */}
            <div
              className={`transition-all duration-200 ease-out ${
                isTransitioning
                  ? 'opacity-0 translate-y-2'
                  : 'opacity-100 translate-y-0'
              }`}
            >
            {paginatedArticles.length > 0 ? (
              <motion.div
                key={`${activeCategory}-${currentPage}`}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {paginatedArticles.map((article, index) => (
                  <motion.div
                    key={article.slug}
                    variants={fadeUp}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <Link
                      href={`/blog/${article.slug}`}
                      className="group block glass-card rounded-2xl overflow-hidden h-full"
                    >
                      {/* Image placeholder */}
                      <div className="relative h-48 bg-gradient-to-br from-white/[0.03] to-white/[0.01] overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {(() => {
                            const CatIcon = getCategoryIcon(article.category);
                            return (
                              <div className={`w-14 h-14 rounded-2xl ${article.iconBg} flex items-center justify-center`}>
                                <CatIcon className={`w-7 h-7 ${article.iconColor}`} />
                              </div>
                            );
                          })()}
                        </div>
                        {/* Category badge overlay */}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.05em] bg-black/60 text-gray-300 border border-white/[0.08]`}>
                            {(() => { const CatIcon = getCategoryIcon(article.category); return <CatIcon className="w-2.5 h-2.5" />; })()}
                            {article.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {article.date}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2 leading-tight">No articles found</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Try selecting a different category.
                </p>
              </motion.div>
            )}
            </div>

            {/* ═══════════════════════════════════════
                PAGINATION
                ═══════════════════════════════════════ */}
            {totalPages > 1 && (
              <div
                className={`transition-all duration-200 ease-out ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-center justify-center gap-2 sm:gap-3 mt-12"
                >
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isTransitioning}
                    className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs sm:text-sm text-gray-400 hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page number buttons — scrollable on mobile */}
                  <div
                    className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-[60vw] sm:max-w-none px-1"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={isTransitioning}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                          currentPage === page
                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/15'
                            : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isTransitioning}
                    className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs sm:text-sm text-gray-400 hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            NEWSLETTER SIGNUP
            ═══════════════════════════════════════ */}
        <section className="py-16 sm:py-24 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Newsletter
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                Stay Updated on Solar <span className="text-gradient">Savings</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                Get the latest solar tips, grant updates, and exclusive offers delivered
                to your inbox. No spam, unsubscribe anytime.
              </p>

              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">
                    You&apos;re subscribed! Check your inbox.
                  </span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                  <div className="relative flex-1 w-full">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/10 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-400/15 whitespace-nowrap"
                  >
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              <p className="text-[11px] sm:text-xs text-gray-700 mt-4 leading-snug">
                We respect your privacy. Unsubscribe anytime. ~500 subscribers.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
