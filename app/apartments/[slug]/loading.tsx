export default function ApartmentDetailLoading() {
    return (
      <main className="min-h-screen bg-[#F7F8FA]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="h-4 w-52 animate-pulse rounded-full bg-zinc-200" />
  
          <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
            <div className="aspect-[16/10] animate-pulse rounded-3xl bg-zinc-200" />
  
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="h-7 w-24 animate-pulse rounded-full bg-zinc-200" />
  
              <div className="mt-6 h-10 w-4/5 animate-pulse rounded-xl bg-zinc-200" />
  
              <div className="mt-4 h-5 w-3/5 animate-pulse rounded-lg bg-zinc-200" />
  
              <div className="mt-8 grid grid-cols-2 gap-3">
                {Array.from({
                  length: 4,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl bg-zinc-100"
                  />
                ))}
              </div>
            </div>
          </section>
  
          <section className="mt-7 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="h-7 w-40 animate-pulse rounded-lg bg-zinc-200" />
  
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl bg-zinc-100"
                />
              ))}
            </div>
          </section>
  
          <section className="mt-7 grid gap-5 lg:grid-cols-2">
            {Array.from({
              length: 2,
            }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-3xl border border-zinc-200 bg-white"
              />
            ))}
          </section>
        </div>
      </main>
    );
  }