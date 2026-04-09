export default function SolarCalculatorLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar skeleton */}
      <div className="h-16 bg-white/[0.02] border-b border-white/[0.04]" />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-amber-400/[0.04] rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-8 sm:pb-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-8">
              <div className="h-3.5 w-12 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-3 rounded-sm bg-white/[0.03] animate-pulse" />
              <div className="h-3.5 w-36 rounded bg-white/[0.04] animate-pulse" />
            </div>

            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
                <div className="w-3.5 h-3.5 rounded bg-white/[0.05] animate-pulse" />
                <div className="h-3 w-28 rounded bg-white/[0.04] animate-pulse" />
              </div>

              <div className="h-12 sm:h-14 w-4/5 mx-auto rounded-xl bg-white/[0.04] animate-pulse mb-3" />
              <div className="h-12 sm:h-14 w-3/5 mx-auto rounded-xl bg-white/[0.04] animate-pulse mb-6" />

              <div className="space-y-2 mb-8">
                <div className="h-4 w-full max-w-xl mx-auto rounded bg-white/[0.03] animate-pulse" />
                <div className="h-4 w-4/5 max-w-xl mx-auto rounded bg-white/[0.03] animate-pulse" />
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04]">
                    <div className="w-4 h-4 rounded bg-white/[0.05] animate-pulse" />
                    <div className="h-3 w-16 rounded bg-white/[0.03] animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Calculator skeleton */}
        <section className="pb-16 sm:pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              {/* Calculator header */}
              <div className="p-6 sm:p-8 border-b border-white/[0.04]">
                <div className="h-6 w-48 rounded-lg bg-white/[0.04] animate-pulse mb-2" />
                <div className="h-4 w-64 rounded bg-white/[0.03] animate-pulse" />
              </div>

              {/* Calculator body */}
              <div className="p-6 sm:p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Inputs */}
                  <div className="space-y-6">
                    <div>
                      <div className="h-4 w-36 rounded bg-white/[0.04] animate-pulse mb-3" />
                      <div className="h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                    </div>
                    <div>
                      <div className="h-4 w-28 rounded bg-white/[0.04] animate-pulse mb-3" />
                      <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-16 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="h-4 w-32 rounded bg-white/[0.04] animate-pulse mb-3" />
                      <div className="h-3 rounded-full bg-white/[0.03] animate-pulse" />
                    </div>
                    <div className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
                  </div>

                  {/* Results */}
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6">
                    <div className="h-5 w-32 rounded bg-white/[0.04] animate-pulse mb-6" />
                    <div className="text-center mb-6">
                      <div className="h-10 w-40 mx-auto rounded-lg bg-white/[0.04] animate-pulse mb-2" />
                      <div className="h-3 w-48 mx-auto rounded bg-white/[0.03] animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4">
                          <div className="h-3 w-20 rounded bg-white/[0.03] animate-pulse mb-2" />
                          <div className="h-6 w-24 rounded bg-white/[0.04] animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ skeleton */}
        <section className="py-16 sm:py-20 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-8 w-48 mx-auto rounded-lg bg-white/[0.04] animate-pulse mb-3" />
              <div className="h-4 w-64 mx-auto rounded bg-white/[0.03] animate-pulse" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-3/5 rounded bg-white/[0.04] animate-pulse" />
                    <div className="w-5 h-5 rounded bg-white/[0.04] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
