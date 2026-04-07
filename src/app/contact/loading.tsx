export default function Loading() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -right-32 w-[400px] h-[400px] bg-amber-400/[0.04] rounded-full blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-12 h-3 bg-white/[0.04] rounded" />
              <div className="w-3 h-3 bg-white/[0.03] rounded" />
              <div className="w-16 h-3 bg-white/[0.04] rounded" />
            </div>
            <div className="h-10 sm:h-12 bg-white/[0.04] rounded w-2/3 mb-3" />
            <div className="h-4 bg-white/[0.03] rounded w-full mb-2" />
            <div className="h-4 bg-white/[0.03] rounded w-4/5 mb-8" />
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 h-40">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] mb-4" />
                <div className="h-5 bg-white/[0.04] rounded w-2/3 mb-2" />
                <div className="h-3 bg-white/[0.03] rounded w-full mb-1" />
                <div className="h-3 bg-white/[0.03] rounded w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
