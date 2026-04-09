export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 animate-pulse"
        style={{
          background: 'linear-gradient(90deg, #facc15 0%, #f59e0b 50%, #fbbf24 100%)',
          boxShadow: '0 0 12px rgba(250, 204, 21, 0.4), 0 0 4px rgba(250, 204, 21, 0.3)',
        }}
      />

      <div className="h-16 bg-white/[0.02]" />

      <main className="pt-16">
        {/* 
            HERO SECTION
             */}
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-4 w-12 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-3 rounded-sm bg-white/[0.03] animate-pulse" />
              <div className="h-4 w-12 rounded bg-white/[0.04] animate-pulse" />
            </div>

            <div className="max-w-3xl mb-6">
              <div className="h-14 sm:h-16 w-full rounded-xl bg-white/[0.04] animate-pulse mb-3" />
              <div className="h-14 sm:h-16 w-2/3 rounded-xl bg-white/[0.04] animate-pulse" />
            </div>

            <div className="max-w-2xl mb-8 space-y-2">
              <div className="h-5 w-full rounded-lg bg-white/[0.03] animate-pulse" />
              <div className="h-5 w-5/6 rounded-lg bg-white/[0.03] animate-pulse" />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="h-12 w-48 rounded-full bg-white/[0.04] animate-pulse" />
              <div className="h-12 w-36 rounded-full bg-white/[0.03] animate-pulse" />
            </div>
          </div>

          <div className="h-[1px] mx-auto w-2/3 rounded-full bg-amber-400/20 animate-pulse" />
        </section>

        {/* 
            OUR STORY — 2-column skeleton
             */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="aspect-[4/3] rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse" />

              <div className="space-y-6">
                <div className="h-6 w-24 rounded-full bg-white/[0.04] animate-pulse" />
                <div className="h-8 w-4/5 rounded-xl bg-white/[0.04] animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                  <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                  <div className="h-4 w-4/5 rounded bg-white/[0.03] animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                  <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
                  <div className="h-4 w-3/5 rounded bg-white/[0.03] animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06] space-y-2">
                    <div className="h-4 w-20 rounded bg-white/[0.04] animate-pulse" />
                    <div className="h-3 w-full rounded bg-white/[0.03] animate-pulse" />
                  </div>
                  <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06] space-y-2">
                    <div className="h-4 w-20 rounded bg-white/[0.04] animate-pulse" />
                    <div className="h-3 w-full rounded bg-white/[0.03] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 
            WHY CHOOSE US — 3-column value props
             */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 space-y-3">
              <div className="h-6 w-28 rounded-full bg-white/[0.04] animate-pulse mx-auto" />
              <div className="h-9 w-72 rounded-xl bg-white/[0.04] animate-pulse mx-auto" />
              <div className="h-4 w-96 max-w-full rounded-lg bg-white/[0.03] animate-pulse mx-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 bg-white/[0.03] border border-white/[0.06] space-y-3"
                >
                  <div className="h-12 w-12 rounded-xl bg-white/[0.04] animate-pulse" />
                  <div className="h-5 w-28 rounded-lg bg-white/[0.04] animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-white/[0.03] animate-pulse" />
                    <div className="h-3 w-5/6 rounded bg-white/[0.03] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 
            TEAM SECTION — 4-column cards
             */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 space-y-3">
              <div className="h-6 w-24 rounded-full bg-white/[0.04] animate-pulse mx-auto" />
              <div className="h-9 w-80 rounded-xl bg-white/[0.04] animate-pulse mx-auto" />
              <div className="h-4 w-[28rem] max-w-full rounded-lg bg-white/[0.03] animate-pulse mx-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 bg-white/[0.03] border border-white/[0.06] text-center space-y-3"
                >
                  <div className="w-20 h-20 rounded-full bg-white/[0.04] animate-pulse mx-auto" />
                  <div className="h-4 w-32 rounded-lg bg-white/[0.04] animate-pulse mx-auto" />
                  <div className="h-3 w-28 rounded bg-white/[0.03] animate-pulse mx-auto" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3 w-full rounded bg-white/[0.02] animate-pulse" />
                    <div className="h-3 w-4/5 rounded bg-white/[0.02] animate-pulse mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 
            STATS SECTION skeleton
             */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl sm:rounded-3xl p-8 sm:p-12 bg-white/[0.03] border border-white/[0.06]">
              <div className="text-center mb-10 space-y-3">
                <div className="h-6 w-28 rounded-full bg-white/[0.04] animate-pulse mx-auto" />
                <div className="h-9 w-72 rounded-xl bg-white/[0.04] animate-pulse mx-auto" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center p-4 space-y-2">
                    <div className="h-12 w-12 rounded-xl bg-white/[0.04] animate-pulse mx-auto" />
                    <div className="h-8 w-16 rounded-lg bg-white/[0.04] animate-pulse mx-auto" />
                    <div className="h-3 w-28 rounded bg-white/[0.03] animate-pulse mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 
            CTA SECTION skeleton
             */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 bg-white/[0.03] border border-amber-400/10">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                <div className="flex-1 text-center lg:text-left space-y-3">
                  <div className="h-9 w-80 max-w-full rounded-xl bg-white/[0.04] animate-pulse mx-auto lg:mx-0" />
                  <div className="h-4 w-96 max-w-full rounded bg-white/[0.03] animate-pulse mx-auto lg:mx-0" />
                </div>
                <div className="flex gap-3 shrink-0">
                  <div className="h-12 w-44 rounded-full bg-white/[0.04] animate-pulse" />
                  <div className="h-12 w-28 rounded-full bg-white/[0.03] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="h-32 bg-white/[0.01]" />
    </div>
  );
}
