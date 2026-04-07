export default function Loading() {
return (
<>
<section className="relative overflow-hidden">
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-400/[0.03] rounded-full blur-[120px] pointer-events-none" />

  <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-10 sm:pb-14 relative">
    <div className="inline-block w-32 h-6 bg-white/[0.04] rounded-full mb-4" />
    <div className="h-12 sm:h-14 bg-white/[0.04] rounded w-3/4 mb-4" />
    <div className="h-4 bg-white/[0.03] rounded w-full mb-2" />
    <div className="h-4 bg-white/[0.03] rounded w-2/3 mb-6" />
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className="w-20 h-3 bg-white/[0.04] rounded" />
      <div className="w-16 h-3 bg-white/[0.04] rounded" />
      <div className="w-20 h-3 bg-white/[0.04] rounded" />
    </div>
  </div>
</section>

<section className="border-y border-white/[0.04] bg-white/[0.01] py-12 sm:py-16">
  <div className="max-w-6xl mx-auto px-5 sm:px-8">
    <div className="text-center mb-8">
      <div className="h-7 bg-white/[0.04] rounded w-48 mx-auto mb-3" />
      <div className="h-4 bg-white/[0.03] rounded w-64 mx-auto" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-white/[0.05] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-amber-400/40" />
            <div className="h-5 bg-white/[0.04] rounded w-28" />
          </div>
          <div className="h-3 bg-white/[0.03] rounded w-full mb-1" />
          <div className="h-3 bg-white/[0.03] rounded w-3/4" />
        </div>
      ))}
    </div>
  </div>
</section>
</>
);
}
