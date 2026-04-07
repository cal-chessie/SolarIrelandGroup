<section className="relative overflow-hidden">
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-400/[0.04] rounded-full blur-[100px] pointer-events-none" />

  <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-10 sm:pb-14 relative">
    <div className="inline-block w-20 h-6 bg-white/[0.04] rounded-full mb-4" />
    <div className="h-12 sm:h-14 bg-white/[0.04] rounded w-2/3 mb-4" />
    <div className="h-4 bg-white/[0.03] rounded w-full mb-2" />
    <div className="flex items-center gap-4 mt-6 text-sm">
      <div className="w-24 h-3 bg-white/[0.04] rounded" />
    <div className="w-16 h-3 bg-white/[0.04] rounded" />
    </div>
  </div>
</section>

<div className="border-b border-white/[0.04]">
  <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3">
    <div className="flex items-center gap-2 text-xs">
      <div className="w-8 h-3 bg-white/[0.04] rounded" />
      <div className="w-3 h-3 bg-white/[0.03] rounded" />
      <div className="w-24 h-3 bg-white/[0.04] rounded" />
    </div>
  </div>
</div>

<div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
  <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
    {/* Sidebar skeleton */}
    <aside className="lg:w-64 shrink-0">
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 lg:p-6 h-[300px]" />
    </aside>
    {/* Content skeleton */}
    <div className="flex-1 min-w-0 max-w-none">
      <div className="rounded-2xl bg-white/[0.015] border border-white/[0.05] p-6 sm:p-8 lg:p-10 space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <div className="h-5 bg-white/[0.04] rounded w-40 mb-3" />
            <div className="h-4 bg-white/[0.03] rounded w-full mb-1" />
            <div className="h-4 bg-white/[0.03] rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
