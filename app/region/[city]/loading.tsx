export default function RegionLoading() {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 sm:py-10">
        <section
          role="status"
          aria-live="polite"
          className="mx-auto max-w-7xl"
        >
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
  
          <div className="mt-5 overflow-hidden rounded-2xl bg-[#132238] p-5 sm:mt-6 sm:rounded-3xl sm:p-8 lg:p-10">
            <div className="h-4 w-36 animate-pulse rounded bg-white/20" />
            <div className="mt-4 h-10 w-64 max-w-full animate-pulse rounded-xl bg-white/20" />
            <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded bg-white/10" />
  
            <div className="mt-6 grid max-w-xl grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-white/10 sm:h-24 sm:rounded-2xl"
                />
              ))}
            </div>
          </div>
  
          <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-white shadow-sm sm:h-28 sm:rounded-2xl"
              />
            ))}
          </div>
  
          <div className="mt-8 space-y-4 sm:mt-10">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-2xl bg-white shadow-sm sm:h-52 sm:rounded-3xl"
              />
            ))}
          </div>
  
          <p className="sr-only">
            지역 분양정보를 불러오는 중입니다.
          </p>
        </section>
      </main>
    );
  }
  