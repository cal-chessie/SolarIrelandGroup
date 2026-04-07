<section className="relative overflow-hidden">
  {/* Background decoration */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-amber-400/[0.04] rounded-full blur-[100px]" />
  </div>

  <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16">
    {/* Breadcrumb skeleton */}
    <div className="flex items-center gap-2 text-sm mb-8">
      <div className="w-12 h-3 bg-white/[0.04] rounded" />
      <div className="w-3 h-3 bg-white/[0.03] rounded" />
      <div className="w-16 h-3 bg-white/[0.04] rounded" />
    </div>

    <div className="max-w-3xl">
      <div className="inline-block w-40 h-6 bg-white/[0.04] rounded-full mb-6" />
      <div className="h-10 sm:h-12 bg-white/[0.04] rounded w-3/4 mb-3" />
      <div className="h-4 bg-white/[0.03] rounded w-full mb-2" />
      <div className="h-4 bg-white/[0.03] rounded w-5/6 mb-8" />
      <div className="flex gap-4">
        <div className="w-36 h-12 bg-white/[0.04] rounded-xl" />
        <div className="w-40 h-12 bg-white/[0.04] rounded-xl" />
      </div>
    </div>
  </div>
</section>

<section className="py-16 sm:py-24">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="mb-12 text-center">
      <div className="h-8 bg-white/[0.04] rounded w-48 mx-auto mb-4" />
      <div className="h-4 bg-white/[0.03] rounded w-64 mx-auto" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-8">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] mb-5" />
          <div className="h-6 bg-white/[0.04] rounded w-2/3 mb-2" />
          <div className="h-4 bg-white/[0.03] rounded w-full mb-5" />
          <div className="h-3 bg-white/[0.03] rounded w-20 mb-1" />
          <div className="h-3 bg-white/[0.03] rounded w-16 mb-5" />
          <div className="h-8 bg-white/[0.04] rounded-xl" />
        </div>
      ))}
    </div>
  </div>
</section>
