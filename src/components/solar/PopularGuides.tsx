import { getArticleBySlug } from '@/lib/blog-data';

/**
 * "Popular guides" above the home footer: the six posts with the most Search
 * Console impressions (export of 9 Nov 2026, INTAKE/seo/gsc-2026-11-09.md),
 * as plain server-rendered links. Styling is the footer's own column heading
 * and link classes, byte for byte, so it reads as part of the footer family.
 */
const POPULAR = [
  'complete-guide-seai-solar-grant-2026',
  'solar-panels-in-winter-do-they-work',
  'nc6-form-solar-grid-connection-ireland',
  'east-vs-south-vs-west-facing-roofs-solar',
  'smart-meter-required-solar-panels-ireland',
  'longi-vs-jinko-vs-trina-best-solar-panels',
];

export default function PopularGuides() {
  const guides = POPULAR.map((slug) => getArticleBySlug(slug)).filter((a) => a !== undefined);
  if (guides.length === 0) return null;
  return (
    <section aria-labelledby="popular-guides" className="border-t border-white/[0.05]">
      <div className="max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <h2 id="popular-guides" className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-4">
          Popular guides
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
          {guides.map((a) => (
            <li key={a.slug}>
              <a
                href={`/blog/${a.slug}`}
                className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-yellow-400 transition-colors py-2"
              >
                <span className="w-0 group-hover:w-2 h-px bg-amber-400/50 transition-all duration-200" />
                {a.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
