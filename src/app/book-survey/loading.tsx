export default function BookSurveyLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar skeleton */}
      <div className="h-16 bg-white/[0.02] border-b border-white/[0.04]" />

      <main className="pt-16">
        {/* Hero section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-amber-400/[0.04] rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-green-400/[0.03] rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-8">
              <div className="h-3.5 w-12 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-3 rounded-sm bg-white/[0.03] animate-pulse" />
              <div className="h-3.5 w-28 rounded bg-white/[0.04] animate-pulse" />
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Left side - hero text */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
                  <div className="w-3.5 h-3.5 rounded bg-white/[0.05] animate-pulse" />
                  <div className="h-3 w-32 rounded bg-white/[0.04] animate-pulse" />
                </div>

                <div className="h-12 sm:h-14 rounded-xl bg-white/[0.04] animate-pulse mb-3" />
                <div className="h-12 sm:h-14 w-4/5 rounded-xl bg-white/[0.04] animate-pulse mb-6" />

                <div className="space-y-2 mb-8">
                  <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-white/[0.03] animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-white/[0.03] animate-pulse" />
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="w-5 h-5 rounded bg-white/[0.04] animate-pulse" />
                      <div className="h-3 w-16 rounded bg-white/[0.03] animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - form skeleton */}
              <div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-8">
                    <div className="h-1.5 flex-1 rounded-full bg-amber-400/20 animate-pulse" />
                    <div className="h-1.5 w-8 rounded-full bg-white/[0.04] animate-pulse" />
                    <div className="h-1.5 w-8 rounded-full bg-white/[0.04] animate-pulse" />
                    <div className="h-1.5 w-8 rounded-full bg-white/[0.04] animate-pulse" />
                  </div>

                  {/* Step title */}
                  <div className="h-6 w-40 rounded-lg bg-white/[0.04] animate-pulse mb-2" />
                  <div className="h-4 w-56 rounded bg-white/[0.03] animate-pulse mb-6" />

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div>
                      <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse mb-2" />
                      <div className="h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                    </div>
                    <div>
                      <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse mb-2" />
                      <div className="h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                    </div>
                    <div>
                      <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mb-2" />
                      <div className="h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="h-12 rounded-xl bg-white/[0.04] animate-pulse mt-6" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-20 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-8 w-56 mx-auto rounded-lg bg-white/[0.04] animate-pulse mb-3" />
              <div className="h-4 w-72 mx-auto rounded bg-white/[0.03] animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="w-4 h-4 rounded bg-amber-400/20 animate-pulse" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 w-full rounded bg-white/[0.03] animate-pulse" />
                    <div className="h-3 w-4/5 rounded bg-white/[0.03] animate-pulse" />
                    <div className="h-3 w-3/5 rounded bg-white/[0.03] animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                    <div className="w-10 h-10 rounded-full bg-white/[0.04] animate-pulse" />
                    <div>
                      <div className="h-3.5 w-24 rounded bg-white/[0.04] animate-pulse mb-1" />
                      <div className="h-3 w-16 rounded bg-white/[0.03] animate-pulse" />
                    </div>
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
