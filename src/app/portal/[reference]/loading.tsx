export default function PortalDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar skeleton */}
      <div className="h-16 bg-white/[0.02] border-b border-white/[0.04]" />

      <main className="pt-16">
        {/* Top bar */}
        <section className="border-b border-white/[0.05] bg-white/[0.01]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 rounded bg-white/[0.04] animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-20 rounded bg-white/[0.03] animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-green-400/30 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Hero summary */}
        <section className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Customer info */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 w-32 rounded bg-white/[0.04] animate-pulse mb-1" />
                    <div className="h-3 w-20 rounded bg-white/[0.03] animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded bg-white/[0.04] animate-pulse mt-0.5 shrink-0" />
                      <div className="h-3.5 w-56 rounded bg-white/[0.03] animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress ring */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-white/[0.02] animate-pulse flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-10 w-12 rounded bg-white/[0.04] animate-pulse mx-auto mb-2" />
                    <div className="h-3 w-20 rounded bg-white/[0.03] animate-pulse mx-auto" />
                  </div>
                </div>
              </div>

              {/* Current status card */}
              <div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400/30 animate-pulse" />
                    <div className="h-3 w-24 rounded bg-white/[0.03] animate-pulse" />
                  </div>
                  <div className="h-6 w-40 rounded bg-white/[0.04] animate-pulse mb-2" />
                  <div className="h-4 w-32 rounded bg-white/[0.03] animate-pulse mb-3" />
                  <div className="border-t border-white/[0.06] pt-4 mt-4">
                    <div className="h-3 w-32 rounded bg-white/[0.03] animate-pulse mb-2" />
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-24 rounded bg-white/[0.04] animate-pulse" />
                      <div className="h-3 w-20 rounded bg-white/[0.03] animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 h-10 rounded-xl bg-white/[0.03] animate-pulse" />
                  <div className="flex-1 h-10 rounded-xl bg-white/[0.03] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 border-b border-white/[0.06]">
              {[140, 90, 70].map((w, i) => (
                <div key={i} className="py-4 px-5 border-b-2 border-transparent">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white/[0.04] animate-pulse" />
                    <div className="h-3.5 rounded bg-white/[0.04] animate-pulse" style={{ width: `${w}px` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline skeleton */}
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl mx-auto">
              {/* Timeline steps */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.06]" />

                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="relative pl-16 pb-10 last:pb-0">
                    {/* Node */}
                    <div className="absolute left-0 top-0">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] animate-pulse" />
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl bg-white/[0.02] p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-3 w-12 rounded bg-white/[0.04] animate-pulse" />
                          </div>
                          <div className="h-5 w-36 rounded bg-white/[0.04] animate-pulse mb-1" />
                          <div className="h-3.5 w-40 rounded bg-white/[0.03] animate-pulse" />
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-4">
                          <div className="h-3 w-16 rounded bg-white/[0.03] animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
