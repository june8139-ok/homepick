export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1760px] px-4 py-5 sm:px-5 sm:py-8 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-36 rounded bg-zinc-200" />

            <div className="mt-3 h-9 w-64 max-w-full rounded bg-zinc-200 sm:h-10 sm:w-80" />

            <div className="mt-5 h-14 max-w-4xl rounded-2xl bg-zinc-100 sm:mt-6 sm:h-16" />

            <div className="mt-4 h-16 rounded-2xl bg-zinc-100 sm:mt-5 sm:h-20" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1760px] px-3 py-4 sm:px-5 sm:py-5 lg:px-8">
        {/* 모바일 로딩 화면 */}
        <div className="lg:hidden">
          <div className="h-[42vh] min-h-[320px] max-h-[460px] animate-pulse rounded-2xl bg-white shadow-sm" />

          <div className="mt-4 h-5 w-32 animate-pulse rounded bg-zinc-200" />

          <div className="mt-3 flex gap-3 overflow-hidden">
            <div className="h-40 w-[84vw] max-w-[360px] shrink-0 animate-pulse rounded-2xl bg-white shadow-sm" />

            <div className="h-40 w-[84vw] max-w-[360px] shrink-0 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        </div>

        {/* PC 로딩 화면 */}
        <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(410px,0.62fr)_minmax(700px,1.38fr)]">
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />

            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>

          <div className="min-h-[680px] animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
      </section>
    </main>
  );
}

