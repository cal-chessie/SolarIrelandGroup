/**
 * Blog page skeleton loading state.
 * Matches the structure of blog/page.tsx:
 * - Navbar placeholder (for visual consistency with pt-16)
 * - Breadcrumb skeleton
 * - Large heading + subtext skeleton
 * - Featured article card skeleton (2-column grid)
 * - 3-column grid of 6 article card skeletons
 *
 * Uses Tailwind animate-pulse for shimmer. No animation library imports.
 */
export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top amber accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 animate-pulse"
        style={{
          background: 'linear-gradient(90deg, #facc15 0%, #f59e0b 50%, #fbbf24 100%)',
          boxShadow: '0 0 12px rgba(250, 204, 21, 0.4), 0 0 4px rgba(250, 204, 21, 0.3)',
        }}
      />

      {/* Navbar spacer */}
      <div className="h-16 bg-white/[0.02]" />

      <main className="pt-16">
        {/* ─── Breadcrumb skeleton ─── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-4">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-4 w-12 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-3 rounded-sm bg-white/[0.03] animate-pulse" />
            <div className="h-4 w-10 rounded bg-white/[0.04] animate-pulse" />
          </div>

          {/* ─── Hero heading skeleton ─── */}
          <div className="max-w-3xl mb-8">
            {/* Badge pill */}
            <div className="h-6 w-32 rounded-full bg-white/[0.04] animate-pulse mb-6" />
            {/* Title line 1 */}
            <div className="h-12 w-full rounded-xl bg-white/[0.04] animate-pulse mb-3" />
            {/* Title line 2 */}
            <div className="h-12 w-3/4 rounded-xl bg-white/[0.04] animate-pulse mb-6" />
            {/* Subtitle */}
            <div className="h-5 w-full rounded-lg bg-white/[0.03] animate-pulse mb-2" />
            <div className="h-5 w-2/3 rounded-lg bg-white/[0.03] animate-pulse" />
          </div>
        </div>

        {/* ─── Category pills skeleton ─── */}
        <div className="sticky top-16 z-20 bg-[#0a0a0a]/95 border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-full animate-pulse"
                  style={{ width: `${60 + (i % 3) * 16}px`, backgroundColor: 'rgba(255,255,255,0.04)' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Featured article skeleton ─── */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image placeholder */}
                <div className="h-64 sm:h-80 lg:h-auto bg-white/[0.04] animate-pulse" />
                {/* Content */}
                <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-20 rounded-full bg-white/[0.04] animate-pulse" />
                    <div className="h-4 w-16 rounded bg-white/[0.03] animate-pulse" />
                  </div>
                  <div className="h-7 w-full rounded-lg bg-white/[0.04] animate-pulse" />
                  <div className="h-7 w-4/5 rounded-lg bg-white/[0.04] animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                    <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                    <div className="h-4 w-3/4 rounded bg-white/[0.03] animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-3 w-24 rounded bg-white/[0.03] animate-pulse" />
                    <div className="h-4 w-24 rounded-lg bg-white/[0.04] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Article grid skeleton (3 cols × 6 cards) ─── */}
        <section className="pb-16 sm:pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06]"
                >
                  {/* Image area */}
                  <div className="h-48 bg-white/[0.04] animate-pulse" />
                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-full rounded-lg bg-white/[0.04] animate-pulse" />
                    <div className="h-5 w-3/4 rounded-lg bg-white/[0.04] animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-full rounded bg-white/[0.03] animate-pulse" />
                      <div className="h-3 w-5/6 rounded bg-white/[0.03] animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                      <div className="h-3 w-20 rounded bg-white/[0.03] animate-pulse" />
                      <div className="h-3 w-16 rounded bg-white/[0.03] animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer spacer */}
      <div className="h-32 bg-white/[0.01]" />
    </div>
  );
}
