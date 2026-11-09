/** The call ask's skeleton: the intro lane and the card, nothing that moves. */
export default function BookSurveyLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="h-16 bg-white/[0.02] border-b border-white/[0.04]" />
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl xl:max-w-[74rem] 2xl:max-w-[78rem] mx-auto grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-16">
          <div>
            <div className="h-3 w-36 rounded bg-white/[0.05] animate-pulse" />
            <div className="mt-5 h-10 w-full max-w-md rounded bg-white/[0.05] animate-pulse" />
            <div className="mt-4 h-4 w-full max-w-lg rounded bg-white/[0.04] animate-pulse" />
            <div className="mt-2 h-4 w-2/3 max-w-sm rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <div className="h-6 w-48 rounded bg-white/[0.05] animate-pulse" />
            <div className="mt-6 h-12 w-full rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="mt-4 h-12 w-full rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="mt-4 h-12 w-full rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="mt-8 h-14 w-full rounded-full bg-amber-400/20 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
