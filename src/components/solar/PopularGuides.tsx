import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getArticleBySlug } from '@/lib/blog-data';

/**
 * Popular guides (homepage, above the footer). Redesign 15 Nov 2026 (branch
 * home-sections-world-class): a column of grey links became a reading
 * surface. Each guide shows the question it answers and the first sentence of
 * its own answer, read straight from blog-data.ts so the two never drift.
 *
 * The seven slugs are unchanged: the posts with the most Search Console
 * impressions (export of 9 Nov 2026, INTAKE/seo/gsc-2026-11-09.md), plus the
 * "are solar panels worth it" post Google ranks for that query (15 Nov).
 *
 * Photos are real installs only, shown as decoration inside the link (empty
 * alt), because the question is the link's name. Where a post's own cover is a graphic card
 * rather than a photo, or it has no cover, the guide shows one of our install
 * photos from public/installs instead.
 */
const GUIDES: { slug: string; q: string; photo: string }[] = [
  {
    slug: 'complete-guide-seai-solar-grant-2026',
    q: 'How much is the SEAI solar grant?',
    photo: '/blog/family-home-solar-panels-full-roof.webp',
  },
  {
    slug: 'are-solar-panels-worth-it-ireland-2026',
    q: 'Are solar panels worth it in Ireland?',
    photo: '/installs/two-storey-home-black-solar-panels.webp',
  },
  {
    slug: 'solar-panels-in-winter-do-they-work',
    q: 'Do panels work in an Irish winter?',
    photo: '/blog/solar-panels-in-winter-do-they-work.webp',
  },
  {
    slug: 'east-vs-south-vs-west-facing-roofs-solar',
    q: 'Does my roof face the right way?',
    photo: '/installs/commercial-flat-roof-solar.webp',
  },
  {
    slug: 'nc6-form-solar-grid-connection-ireland',
    q: 'What is the NC6 form?',
    photo: '/installs/new-build-home-solar-scaffold.webp',
  },
  {
    slug: 'smart-meter-required-solar-panels-ireland',
    q: 'Do I need a smart meter?',
    photo: '/installs/solar-panels-slate-roof-home.webp',
  },
  {
    slug: 'longi-vs-jinko-vs-trina-best-solar-panels',
    q: 'Which panel brand should I choose?',
    photo: '/blog/in-roof-solar-panels-slate-roof.webp',
  },
];

/** The opening of a post's answer (or its excerpt when it has none): whole
 *  sentences until there is enough to read, so "Yes." never stands alone. */
function firstSentence(text: string): string {
  const parts = text.match(/[^.?!]+[.?!]+(?=\s|$)/g) ?? [text];
  let out = '';
  for (const s of parts) {
    out += s;
    if (out.trim().length >= 60) break;
  }
  return out.trim();
}

export default function PopularGuides() {
  const guides = GUIDES.map((g) => {
    const a = getArticleBySlug(g.slug);
    return a ? { ...g, a, gist: firstSentence(a.answer ?? a.excerpt) } : null;
  }).filter((g) => g !== null);
  if (guides.length === 0) return null;
  const [lead, ...rest] = guides;

  return (
    <section id="guides" className="h-sec h-sec--guides" aria-labelledby="popular-guides">
      <div className="h-wrap relative">
        <div className="h-guides__head">
          <div>
            <span className="h-kicker">
              <span className="h-ring" aria-hidden="true" />
              Popular guides
            </span>
            <h2 id="popular-guides" className="h-title h-title--sm">
              The questions people ask us most.
            </h2>
          </div>
          <a href="/blog" className="h-text-cta h-guides__all">
            All guides
            <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
          </a>
        </div>

        <div className="h-guides">
          <a href={`/blog/${lead.slug}`} className="h-guide-lead">
            <span className="h-guide-lead__frame">
              <Image src={lead.photo} alt="" fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
            </span>
            <span className="h-guide__meta">{lead.a.readTime}</span>
            <span className="h-guide-lead__q">{lead.q}</span>
            <span className="h-guide__gist">{lead.gist}</span>
            <span className="h-guide__title">{lead.a.title}</span>
          </a>

          <ul className="h-guide-list">
            {rest.map((g) => (
              <li key={g.slug}>
                <a href={`/blog/${g.slug}`} className="h-guide">
                  <span className="h-guide__thumb">
                    <Image src={g.photo} alt="" fill sizes="112px" className="object-cover" />
                  </span>
                  <span className="h-guide__body">
                    <span className="h-guide__q">{g.q}</span>
                    <span className="h-guide__gist">{g.gist}</span>
                    <span className="h-guide__meta">{g.a.readTime}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
