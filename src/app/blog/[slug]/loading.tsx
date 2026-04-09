export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar skeleton */}
      <div className="h-16 bg-white/[0.02] border-b border-white/[0.04]" />

      <main className="pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-3.5 w-12 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-3 rounded-sm bg-white/[0.03] animate-pulse" />
            <div className="h-3.5 w-12 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-3 rounded-sm bg-white/[0.03] animate-pulse" />
            <div className="h-3.5 w-48 rounded bg-white/[0.04] animate-pulse" />
          </div>

          {/* Category badge */}
          <div className="inline-flex px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
            <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse" />
          </div>

          {/* Title */}
          <div className="space-y-3 mb-6">
            <div className="h-10 sm:h-12 w-full rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-10 sm:h-12 w-4/5 rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-10 sm:h-12 w-3/5 rounded-xl bg-white/[0.04] animate-pulse" />
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-full bg-white/[0.04] animate-pulse" />
            <div>
              <div className="h-3.5 w-28 rounded bg-white/[0.04] animate-pulse mb-1" />
              <div className="h-3 w-24 rounded bg-white/[0.03] animate-pulse" />
            </div>
          </div>

          {/* Excerpt */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 mb-10">
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-white/[0.03] animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-white/[0.03] animate-pulse" />
            </div>
          </div>

          {/* Article content */}
          <div className="space-y-6">
            {/* Paragraph blocks */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-white/[0.03] animate-pulse" />
              </div>
            ))}

            {/* Subheading */}
            <div className="h-7 w-2/3 rounded-lg bg-white/[0.04] animate-pulse pt-2" />

            {/* More paragraphs */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-white/[0.03] animate-pulse" />
                <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
              </div>
            ))}

            {/* Callout box */}
            <div className="rounded-xl bg-amber-400/[0.03] border border-amber-400/10 p-5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-amber-400/20 animate-pulse mt-0.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-amber-400/[0.05] animate-pulse" />
                  <div className="h-4 w-full rounded bg-amber-400/[0.05] animate-pulse" />
                </div>
              </div>
            </div>

            {/* More paragraphs */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-white/[0.03] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
