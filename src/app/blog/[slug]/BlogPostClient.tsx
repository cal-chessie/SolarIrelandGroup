'use client';

import { useEffect, useState, useMemo, useCallback, type ReactNode } from 'react';
import { motion } from '@/lib/motion';
import Link from 'next/link';
import { ChevronDown, List } from 'lucide-react';
import {
  ChevronRight,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Tag,
  Mail,
  Sun,
  Info,
  LightbulbIcon,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import Navbar from '@/components/solar/Navbar';
import Footer from '@/components/solar/Footer';
import WhatsAppChat from '@/components/solar/WhatsAppChat';
import ScrollProgress from '@/components/solar/ScrollProgress';
import { getArticleBySlug, getRelatedArticles, type ContentSection } from '@/lib/blog-data';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const SPRING_EASE = [0.16, 1, 0.3, 1] as const;

const categoryConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  grants: { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20', label: 'Grants' },
  guides: { bg: 'bg-sky-400/10', text: 'text-sky-400', border: 'border-sky-400/20', label: 'Guides' },
  news: { bg: 'bg-violet-400/10', text: 'text-violet-400', border: 'border-violet-400/20', label: 'News' },
  county: { bg: 'bg-orange-400/10', text: 'text-orange-400', border: 'border-orange-400/20', label: 'County Spotlight' },
  savings: { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/20', label: 'Savings' },
  technology: { bg: 'bg-sky-400/10', text: 'text-sky-400', border: 'border-sky-400/20', label: 'Technology' },
};

function getCategoryConfig(cat: string) {
  return categoryConfig[cat] || { bg: 'bg-gray-400/10', text: 'text-gray-400', border: 'border-gray-400/20', label: cat };
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

function buildTOC(content: ContentSection[]): TOCItem[] {
  return content
    .filter((s): s is ContentSection & { type: 'heading' } => s.type === 'heading')
    .map((s, i) => ({
      id: `heading-${i}`,
      text: s.text,
      level: s.level,
    }));
}

const calloutStyles: Record<string, { bg: string; border: string; icon: React.ComponentType<{ className?: string }>; iconColor: string }> = {
  tip: { bg: 'bg-emerald-400/[0.06]', border: 'border-emerald-400/20', icon: LightbulbIcon, iconColor: 'text-emerald-400' },
  warning: { bg: 'bg-amber-400/[0.06]', border: 'border-amber-400/20', icon: AlertTriangle, iconColor: 'text-amber-400' },
  info: { bg: 'bg-sky-400/[0.06]', border: 'border-sky-400/20', icon: Info, iconColor: 'text-sky-400' },
  stat: { bg: 'bg-violet-400/[0.06]', border: 'border-violet-400/20', icon: BarChart3, iconColor: 'text-violet-400' },
};

/* ─── Mobile collapsible TOC ─── */
function MobileTOC({ items }: { items: TOCItem[] }) {
  const [open, setOpen] = useState(false);
  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="xl:hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
        aria-expanded={open}
      >
        <List className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="flex-1 text-left font-medium">On This Page</span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 overflow-hidden"
        >
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  className={`w-full text-left text-xs leading-relaxed transition-colors py-1.5 ${
                    item.level === 3 ? 'pl-4 text-gray-500' : 'pl-1 text-gray-400 hover:text-amber-400'
                  }`}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Minimal inline markdown for article content: **bold** and [text](href).
 * Content comes only from our own static blog-data.ts (never user input).
 * Links render as real crawlable <a> elements, so body copy can carry
 * internal links between articles and to /book-survey.
 */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
        >
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

function ContentRenderer({ content }: { content: ContentSection[] }) {
  let headingIdx = 0;

  return (
    <div className="space-y-6">
      {content.map((section, idx) => {
        switch (section.type) {
          case 'paragraph':
            return (
              <motion.p
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: SPRING_EASE as unknown as number[] }}
                className="text-gray-300 leading-[1.8] text-[15px] sm:text-base"
              >
                {renderInline(section.text)}
              </motion.p>
            );

          case 'heading': {
            const id = `heading-${headingIdx++}`;
            if (section.level === 2) {
              return (
                <motion.h2
                  key={idx}
                  id={id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, ease: SPRING_EASE as unknown as number[] }}
                  className="text-xl sm:text-2xl font-bold text-white mt-10 mb-4"
                >
                  <span className="text-gradient">{section.text}</span>
                </motion.h2>
              );
            }
            return (
              <motion.h3
                key={idx}
                id={id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: SPRING_EASE as unknown as number[] }}
                className="text-lg sm:text-xl font-semibold text-gray-200 mt-8 mb-3"
              >
                {section.text}
              </motion.h3>
            );
          }

          case 'callout': {
            const style = calloutStyles[section.variant] || calloutStyles.info;
            const Icon = style.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: SPRING_EASE as unknown as number[] }}
                className={`rounded-xl p-5 border ${style.bg} ${style.border}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} />
                  <div>
                    <p className={`text-sm font-bold mb-1 ${style.iconColor}`}>{section.title}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{renderInline(section.body)}</p>
                  </div>
                </div>
              </motion.div>
            );
          }

          case 'bulletList':
            return (
              <motion.ul
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: SPRING_EASE as unknown as number[] }}
                className="space-y-2.5 pl-1"
              >
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] sm:text-base text-gray-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-[10px]" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </motion.ul>
            );

          case 'numberedList':
            return (
              <motion.ol
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: SPRING_EASE as unknown as number[] }}
                className="space-y-2.5 pl-1"
              >
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] sm:text-base text-gray-300 leading-relaxed">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold shrink-0 mt-[2px]">
                      {i + 1}
                    </span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </motion.ol>
            );

          case 'table':
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: SPRING_EASE as unknown as number[] }}
                className="overflow-x-auto rounded-xl border border-white/[0.06]"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.04]">
                      {section.headers.map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-white/[0.06]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className={ri % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className={`px-4 py-3 text-gray-300 border-b border-white/[0.03] ${
                              ci === 0 ? 'font-medium text-white' : ''
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            );

          case 'divider':
            return (
              <div key={idx} className="py-4">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
              </div>
            );

          case 'cta':
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: SPRING_EASE as unknown as number[] }}
                className="pt-4"
              >
                <Link
                  href={section.href}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-400/15"
                >
                  {section.text}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

function StickyTOC({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { threshold: 0.15, rootMargin: '-80px 0px -60% 0px' }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="hidden xl:block sticky top-24">
      <nav className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-3">
          On This Page
        </p>
        <ul className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className={`w-full text-left text-xs leading-relaxed transition-colors py-1 ${
                  activeId === item.id
                    ? 'text-amber-400 font-medium'
                    : 'text-gray-500 hover:text-gray-300'
                } ${item.level === 3 ? 'pl-4' : 'pl-1'}`}
              >
                {activeId === item.id && (
                  <span className="inline-block w-1 h-1 rounded-full bg-amber-400 mr-2 align-middle" />
                )}
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function NewsletterSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7 }}
      className="py-16 sm:py-24 border-t border-white/[0.04]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
          <Mail className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Newsletter
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Stay Updated on Solar <span className="text-gradient">Savings</span>
        </h2>
        <p className="text-sm sm:text-base text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
          Solar tips, SEAI grant updates, and honest advice for Irish
          homeowners. Newsletter sign-up is coming soon.
        </p>
        <div className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <Mail className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-gray-300">
            Coming soon
          </span>
        </div>
        <p className="text-[10px] text-gray-700 mt-4">
          We respect your privacy - we will never share your details.
        </p>
      </div>
    </motion.section>
  );
}

function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const related = useMemo(() => getRelatedArticles(currentSlug, 3), [currentSlug]);

  if (related.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7 }}
      className="py-12 sm:py-16 border-t border-white/[0.04]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-8">
          Related <span className="text-gradient">Articles</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((article, idx) => {
            const catConfig = getCategoryConfig(article.category);
            return (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Link
                  href={`/blog/${article.slug}`}
                  className="group block glass-card rounded-2xl overflow-hidden h-full"
                >
                  <div className="relative h-40 bg-gradient-to-br from-white/[0.03] to-white/[0.01] flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-2xl ${article.iconBg} flex items-center justify-center`}>
                      <Sun className={`w-6 h-6 ${article.iconColor}`} />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/60 text-gray-300 border border-white/[0.08]`}>
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
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
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />
      <main className="pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Article Not Found
            </h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Sorry, we couldn&apos;t find the article you&apos;re looking for. It may have been
              moved or doesn&apos;t exist.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-400/15"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
}

export default function BlogPostClient({ slug }: { slug: string }) {
  const article = useMemo(() => getArticleBySlug(slug), [slug]);
  const tocItems = useMemo(() => (article ? buildTOC(article.content) : []), [article]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (!article) {
    return <NotFound />;
  }

  const catConfig = getCategoryConfig(article.category);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollProgress />
      <Navbar />

      <main className="pt-16">
        {/* 
            BREADCRUMB
             */}
        <div className="border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.nav
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 text-sm text-gray-500 py-4"
            >
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/blog" className="hover:text-amber-400 transition-colors">
                Blog
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-300 truncate max-w-[200px] sm:max-w-none">
                {article.title}
              </span>
            </motion.nav>
          </div>
        </div>

        {/* 
            ARTICLE HEADER
             */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-amber-400/[0.03] rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8 sm:pb-12">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
            >
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${catConfig.bg} ${catConfig.text} border ${catConfig.border} mb-5`}
              >
                <Tag className="w-3 h-3" />
                {catConfig.label}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-5 max-w-4xl"
            >
              {article.title}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-3xl mb-6"
            >
              {article.excerpt}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-400">
                    {article.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className="text-gray-300 font-medium text-sm">{article.author}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {article.date}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 
            ARTICLE BODY + SIDEBAR TOC
             */}
        <section className="pb-12 sm:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-10 lg:gap-16">
              <div className="flex-1 min-w-0 max-w-[72ch]">
                <MobileTOC items={tocItems} />
                <ContentRenderer content={article.content} />
              </div>

              <aside className="hidden xl:block w-64 shrink-0">
                <StickyTOC items={tocItems} />
              </aside>
            </div>
          </div>
        </section>

        {/* 
            RETURN TO BLOG LINK
             */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to all articles
          </Link>
        </motion.div>

        {/* 
            RELATED ARTICLES
             */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <RelatedArticles currentSlug={slug} />
        </div>

        {/* 
            NEWSLETTER
             */}
        <NewsletterSection />
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
}
